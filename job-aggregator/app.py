import os
import re
import json
import logging
import threading
from datetime import datetime
from urllib.parse import quote_plus
from concurrent.futures import ThreadPoolExecutor, as_completed

import feedparser
import requests
from bs4 import BeautifulSoup
from anthropic import Anthropic
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'jobaggrego-secret-2026')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:////data/jobs.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

SOURCE_COLORS = {
    'Indeed':    'primary',
    'HelloWork': 'success',
    'Monster':   'danger',
    'LinkedIn':  'info',
}


# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------

class Search(db.Model):
    __tablename__ = 'searches'
    id           = db.Column(db.Integer, primary_key=True)
    keywords     = db.Column(db.String(200), nullable=False)
    location     = db.Column(db.String(100), default='')
    contract     = db.Column(db.String(50),  default='')
    salary_pref  = db.Column(db.String(50),  default='')
    status       = db.Column(db.String(20),  default='pending')
    total        = db.Column(db.Integer, default=0)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    listings     = db.relationship('JobListing', backref='search', lazy=True,
                                   cascade='all, delete-orphan')


class JobListing(db.Model):
    __tablename__ = 'job_listings'
    id             = db.Column(db.Integer, primary_key=True)
    search_id      = db.Column(db.Integer, db.ForeignKey('searches.id'), nullable=False)
    source         = db.Column(db.String(50),   default='')
    title          = db.Column(db.String(300),  default='')
    company        = db.Column(db.String(200),  default='')
    location       = db.Column(db.String(150),  default='')
    salary         = db.Column(db.String(200),  default='')
    description    = db.Column(db.Text,         default='')
    url            = db.Column(db.String(1000), default='')
    contact_email  = db.Column(db.String(200),  default='')
    contact_phone  = db.Column(db.String(50),   default='')
    posted_date    = db.Column(db.String(100),  default='')
    claude_score   = db.Column(db.Integer, default=3)
    claude_summary = db.Column(db.String(500),  default='')
    saved          = db.Column(db.Boolean, default=False)
    applied        = db.Column(db.Boolean, default=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# SCRAPERS
# ---------------------------------------------------------------------------

def _get(url, timeout=20, **kwargs):
    resp = requests.get(url, headers=HEADERS, timeout=timeout, **kwargs)
    resp.raise_for_status()
    return resp


def scrape_indeed(keywords, location):
    url = (
        f"https://fr.indeed.com/rss"
        f"?q={quote_plus(keywords)}&l={quote_plus(location)}&radius=30&sort=date"
    )
    try:
        feed = feedparser.parse(url)
        results = []
        for entry in feed.entries[:30]:
            desc = BeautifulSoup(entry.get('summary', ''), 'html.parser').get_text(' ', strip=True)
            raw_title = entry.get('title', '')
            title, company = raw_title, ''
            if ' - ' in raw_title:
                parts = raw_title.rsplit(' - ', 1)
                title, company = parts[0].strip(), parts[1].strip()
            results.append({
                'source': 'Indeed', 'title': title, 'company': company,
                'location': location, 'url': entry.get('link', ''),
                'description': desc[:3000], 'posted_date': entry.get('published', ''), 'salary': '',
            })
        logger.info(f"Indeed: {len(results)} annonces")
        return results
    except Exception as e:
        logger.error(f"Indeed error: {e}")
        return []


def scrape_hellowork(keywords, location):
    url = (
        f"https://www.hellowork.com/fr-fr/emplois.html"
        f"?k={quote_plus(keywords)}&l={quote_plus(location)}&ray=30km"
    )
    try:
        soup = BeautifulSoup(_get(url).text, 'html.parser')
        results = []

        cards = (
            soup.select('li[data-id-storage]') or
            soup.select('article[data-id]') or
            soup.select('.tw-relative.tw-flex.tw-flex-col') or
            []
        )

        for card in cards[:25]:
            a_tag = card.find('a', href=True)
            h3 = card.find(['h3', 'h2', 'p'], attrs={'class': lambda c: c and 'title' in ' '.join(c).lower()})
            if not h3:
                h3 = card.find(['h3', 'h2'])
            title = h3.get_text(strip=True) if h3 else ''
            href = a_tag['href'] if a_tag else ''
            if href and not href.startswith('http'):
                href = 'https://www.hellowork.com' + href
            if title:
                results.append({
                    'source': 'HelloWork', 'title': title,
                    'company': '', 'location': location,
                    'url': href, 'description': card.get_text(' ', strip=True)[:2000],
                    'posted_date': '', 'salary': '',
                })
        logger.info(f"HelloWork: {len(results)} annonces")
        return results
    except Exception as e:
        logger.error(f"HelloWork error: {e}")
        return []


def scrape_monster(keywords, location):
    url = (
        f"https://www.monster.fr/emploi/recherche/"
        f"?q={quote_plus(keywords.replace(' ', '-'))}&where={quote_plus(location)}&rad=30"
    )
    try:
        soup = BeautifulSoup(_get(url).text, 'html.parser')
        results = []

        cards = (
            soup.select('section.card-content') or
            soup.select('div[data-jobid]') or
            soup.select('article.flex-row') or
            soup.select('.job-search-resultset > li') or
            []
        )

        for card in cards[:25]:
            h2 = card.find(['h2', 'h3'])
            a_tag = card.find('a', href=True)
            title = h2.get_text(strip=True) if h2 else (a_tag.get_text(strip=True) if a_tag else '')
            href = a_tag['href'] if a_tag else ''
            if href and not href.startswith('http'):
                href = 'https://www.monster.fr' + href
            company_el = card.find(attrs={'class': lambda c: c and 'company' in ' '.join(c if c else []).lower()})
            if title:
                results.append({
                    'source': 'Monster', 'title': title,
                    'company': company_el.get_text(strip=True) if company_el else '',
                    'location': location, 'url': href,
                    'description': card.get_text(' ', strip=True)[:2000],
                    'posted_date': '', 'salary': '',
                })
        logger.info(f"Monster: {len(results)} annonces")
        return results
    except Exception as e:
        logger.error(f"Monster error: {e}")
        return []


def scrape_linkedin(keywords, location):
    url = (
        f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        f"?keywords={quote_plus(keywords)}&location={quote_plus(location)}"
        f"&f_TPR=r604800&start=0"
    )
    try:
        soup = BeautifulSoup(_get(url, timeout=25).text, 'html.parser')
        results = []
        for card in soup.select('li')[:25]:
            title_el   = card.find('h3', class_='base-search-card__title')
            company_el = card.find('h4', class_='base-search-card__subtitle')
            loc_el     = card.find('span', class_='job-search-card__location')
            link_el    = card.find('a', class_='base-card__full-link')
            date_el    = card.find('time')
            title = title_el.get_text(strip=True) if title_el else ''
            if title:
                results.append({
                    'source': 'LinkedIn', 'title': title,
                    'company': company_el.get_text(strip=True) if company_el else '',
                    'location': loc_el.get_text(strip=True) if loc_el else location,
                    'url': link_el['href'] if link_el and link_el.get('href') else '',
                    'description': card.get_text(' ', strip=True)[:2000],
                    'posted_date': date_el.get('datetime', '') if date_el else '',
                    'salary': '',
                })
        logger.info(f"LinkedIn: {len(results)} annonces")
        return results
    except Exception as e:
        logger.error(f"LinkedIn error: {e}")
        return []


# ---------------------------------------------------------------------------
# CLAUDE EXTRACTION
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b')
_PHONE_RE = re.compile(r'(?:0|\+33\s?|0033\s?)[1-9](?:[\s.\-]?\d{2}){4}')


def extract_info(title, company, description, keywords):
    email_m = _EMAIL_RE.search(description)
    phone_m = _PHONE_RE.search(description)
    regex_email = email_m.group() if email_m else ''
    regex_phone = phone_m.group() if phone_m else ''

    if not ANTHROPIC_API_KEY or not description.strip():
        return {'email': regex_email, 'phone': regex_phone, 'salary': '', 'summary': '', 'score': 3}

    try:
        client = Anthropic(api_key=ANTHROPIC_API_KEY)
        resp = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=350,
            messages=[{
                'role': 'user',
                'content': (
                    f"Analyse cette offre d'emploi. Réponds uniquement en JSON strict.\n\n"
                    f"Poste: {title}\nEntreprise: {company}\n"
                    f"Recherche: {keywords}\nDescription: {description[:2200]}\n\n"
                    '{"email":"email ou null","phone":"tel ou null","salary":"salaire ou null",'
                    '"summary":"1 phrase clé","score":1-5}'
                ),
            }],
        )
        raw = resp.content[0].text.strip()
        m = re.search(r'\{.*\}', raw, re.DOTALL)
        if m:
            d = json.loads(m.group())
            return {
                'email':   d.get('email') or regex_email,
                'phone':   d.get('phone') or regex_phone,
                'salary':  d.get('salary') or '',
                'summary': d.get('summary') or '',
                'score':   max(1, min(5, int(d.get('score', 3)))),
            }
    except Exception as e:
        logger.error(f"Claude error: {e}")

    return {'email': regex_email, 'phone': regex_phone, 'salary': '', 'summary': '', 'score': 3}


# ---------------------------------------------------------------------------
# BACKGROUND SEARCH RUNNER
# ---------------------------------------------------------------------------

def run_search(search_id, keywords, location, contract, salary_pref):
    with app.app_context():
        search = db.session.get(Search, search_id)
        if not search:
            return

        search.status = 'running'
        db.session.commit()

        scrapers = [
            lambda: scrape_indeed(keywords, location),
            lambda: scrape_hellowork(keywords, location),
            lambda: scrape_monster(keywords, location),
            lambda: scrape_linkedin(keywords, location),
        ]

        all_raw = []
        with ThreadPoolExecutor(max_workers=4) as ex:
            futures = [ex.submit(fn) for fn in scrapers]
            for f in as_completed(futures):
                try:
                    all_raw.extend(f.result())
                except Exception as e:
                    logger.error(f"Scraper thread error: {e}")

        # Deduplicate
        seen, unique = set(), []
        for r in all_raw:
            key = (r.get('title', '').lower()[:80], r.get('company', '').lower()[:40])
            if key not in seen and r.get('title'):
                seen.add(key)
                unique.append(r)

        # Filter by contract if specified
        if contract:
            unique = [
                r for r in unique
                if contract.lower() in r.get('description', '').lower()
                or contract.lower() in r.get('title', '').lower()
            ]

        # Extract info concurrently (max 6 Claude calls at once)
        def process(raw):
            info = extract_info(raw['title'], raw['company'], raw['description'], keywords)
            return raw, info

        count = 0
        with ThreadPoolExecutor(max_workers=6) as ex:
            futures = {ex.submit(process, r): r for r in unique[:60]}
            for f in as_completed(futures):
                try:
                    raw, info = f.result()
                    listing = JobListing(
                        search_id=search_id,
                        source=raw['source'],
                        title=raw['title'],
                        company=raw['company'],
                        location=raw['location'],
                        salary=raw.get('salary') or info.get('salary', ''),
                        description=raw['description'][:5000],
                        url=raw['url'],
                        contact_email=info.get('email', ''),
                        contact_phone=info.get('phone', ''),
                        posted_date=raw.get('posted_date', ''),
                        claude_score=info.get('score', 3),
                        claude_summary=info.get('summary', ''),
                    )
                    db.session.add(listing)
                    count += 1
                except Exception as e:
                    logger.error(f"Process error: {e}")

        search.status = 'done'
        search.total = count
        db.session.commit()
        logger.info(f"Search {search_id} terminée: {count} annonces")


# ---------------------------------------------------------------------------
# ROUTES
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    recent = Search.query.order_by(Search.created_at.desc()).limit(8).all()
    return render_template('index.html', recent=recent)


@app.route('/search', methods=['POST'])
def search():
    keywords    = request.form.get('keywords', '').strip()
    location    = request.form.get('location', '').strip()
    contract    = request.form.get('contract', '').strip()
    salary_pref = request.form.get('salary_pref', '').strip()

    if not keywords:
        flash("Entrez au moins un mot-clé.", 'warning')
        return redirect(url_for('index'))

    s = Search(keywords=keywords, location=location, contract=contract, salary_pref=salary_pref)
    db.session.add(s)
    db.session.commit()

    threading.Thread(
        target=run_search,
        args=(s.id, keywords, location, contract, salary_pref),
        daemon=True,
    ).start()

    return redirect(url_for('results', sid=s.id))


@app.route('/results/<int:sid>')
def results(sid):
    s = Search.query.get_or_404(sid)
    return render_template('results.html', search=s)


@app.route('/api/results/<int:sid>')
def api_results(sid):
    s = Search.query.get_or_404(sid)

    sort_by     = request.args.get('sort', 'score')
    src_filter  = request.args.get('source', '')
    contact_only = request.args.get('contact', '') == '1'

    q = JobListing.query.filter_by(search_id=sid)
    if src_filter:
        q = q.filter(JobListing.source == src_filter)
    if contact_only:
        q = q.filter(
            (JobListing.contact_email != '') | (JobListing.contact_phone != '')
        )
    if sort_by == 'date':
        q = q.order_by(JobListing.created_at.desc())
    elif sort_by == 'source':
        q = q.order_by(JobListing.source, JobListing.claude_score.desc())
    else:
        q = q.order_by(JobListing.claude_score.desc(), JobListing.created_at.desc())

    listings = q.all()
    return jsonify({
        'status': s.status,
        'total': len(listings),
        'listings': [{
            'id': l.id, 'source': l.source, 'source_color': SOURCE_COLORS.get(l.source, 'secondary'),
            'title': l.title, 'company': l.company, 'location': l.location,
            'salary': l.salary, 'url': l.url,
            'contact_email': l.contact_email, 'contact_phone': l.contact_phone,
            'posted_date': l.posted_date, 'claude_score': l.claude_score,
            'claude_summary': l.claude_summary, 'saved': l.saved, 'applied': l.applied,
        } for l in listings],
    })


@app.route('/api/job/<int:jid>/save', methods=['POST'])
def toggle_save(jid):
    l = JobListing.query.get_or_404(jid)
    l.saved = not l.saved
    db.session.commit()
    return jsonify({'saved': l.saved})


@app.route('/api/job/<int:jid>/applied', methods=['POST'])
def toggle_applied(jid):
    l = JobListing.query.get_or_404(jid)
    l.applied = not l.applied
    db.session.commit()
    return jsonify({'applied': l.applied})


@app.route('/favorites')
def favorites():
    listings = JobListing.query.filter_by(saved=True).order_by(JobListing.created_at.desc()).all()
    return render_template('favorites.html', listings=listings, source_colors=SOURCE_COLORS)


# ---------------------------------------------------------------------------
# STARTUP
# ---------------------------------------------------------------------------

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5001)
