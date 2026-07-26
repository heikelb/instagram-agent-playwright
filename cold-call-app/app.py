from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from datetime import datetime, date
import os
import hashlib
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'coldcall2026')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:////data/coldcall.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

RECORDINGS_DIR = os.environ.get('RECORDINGS_DIR', '/data/recordings')
os.makedirs(RECORDINGS_DIR, exist_ok=True)

APP_PASSWORD = os.environ.get('APP_PASSWORD', 'cold2026')
APP_PASSWORD_HASH = hashlib.sha256(APP_PASSWORD.encode()).hexdigest()

OBJECTIONS = [
    "Pas intéressé",
    "Déjà un opérateur",
    "Trop cher",
    "Je réfléchis",
    "Rappelez plus tard",
    "Conjoint décide",
    "Contrat en cours",
    "Pas le temps",
]

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


class FakeUser(UserMixin):
    id = 1


@login_manager.user_loader
def load_user(user_id):
    return FakeUser()


class SessionAppel(db.Model):
    __tablename__ = 'sessions_appel'
    id          = db.Column(db.Integer, primary_key=True)
    date        = db.Column(db.Date, default=date.today)
    heure_debut = db.Column(db.DateTime, default=datetime.now)
    heure_fin   = db.Column(db.DateTime, nullable=True)
    notes       = db.Column(db.Text, nullable=True)
    appels      = db.relationship('Appel', backref='session', lazy=True,
                                  order_by='Appel.created_at')

    @property
    def total(self):
        return len(self.appels)

    @property
    def decroches(self):
        return [a for a in self.appels if a.statut == 'décroché']

    @property
    def rdv_list(self):
        return [a for a in self.appels if a.rdv_decroché]

    @property
    def taux(self):
        d = len(self.decroches)
        return round(len(self.rdv_list) / d * 100) if d else 0

    @property
    def duree_calls_secs(self):
        return sum(a.duree_secs for a in self.decroches)

    @property
    def duree_session_secs(self):
        fin = self.heure_fin or datetime.now()
        return int((fin - self.heure_debut).total_seconds())

    @property
    def est_active(self):
        return self.heure_fin is None

    @property
    def heure_debut_fmt(self):
        return self.heure_debut.strftime('%H:%M')


class Appel(db.Model):
    __tablename__ = 'appels'
    id           = db.Column(db.Integer, primary_key=True)
    session_id   = db.Column(db.Integer, db.ForeignKey('sessions_appel.id'), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.now)
    statut       = db.Column(db.String(20), nullable=False)  # décroché / répondeur / pas_de_réponse
    duree_secs   = db.Column(db.Integer, default=0)
    rdv_decroché = db.Column(db.Boolean, default=False)
    objection    = db.Column(db.String(200), nullable=True)
    notes        = db.Column(db.Text, nullable=True)
    recording    = db.Column(db.String(100), nullable=True)  # filename audio

    @property
    def duree_fmt(self):
        m, s = divmod(self.duree_secs, 60)
        return f"{m}:{s:02d}"

    @property
    def heure_fmt(self):
        return self.created_at.strftime('%H:%M')


def fmt_secs(secs):
    m, s = divmod(int(secs), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h}h{m:02d}m"
    return f"{m}m{s:02d}s"


app.jinja_env.globals['fmt_secs'] = fmt_secs


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        pw = request.form.get('password', '')
        if hashlib.sha256(pw.encode()).hexdigest() == APP_PASSWORD_HASH:
            login_user(FakeUser())
            return redirect(url_for('dashboard'))
        flash('Mot de passe incorrect')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.route('/')
@login_required
def dashboard():
    today = date.today()
    sessions_today = SessionAppel.query.filter_by(date=today)\
        .order_by(SessionAppel.heure_debut.desc()).all()

    total     = sum(s.total for s in sessions_today)
    decroches = sum(len(s.decroches) for s in sessions_today)
    rdv       = sum(len(s.rdv_list) for s in sessions_today)
    taux      = round(rdv / decroches * 100) if decroches else 0
    active    = next((s for s in sessions_today if s.est_active), None)

    return render_template('dashboard.html',
        sessions_today=sessions_today,
        total=total, decroches=decroches, rdv=rdv, taux=taux,
        session_active=active,
        today=today)


# ── Sessions ──────────────────────────────────────────────────────────────────

@app.route('/session/nouvelle', methods=['POST'])
@login_required
def nouvelle_session():
    s = SessionAppel()
    db.session.add(s)
    db.session.commit()
    return redirect(url_for('session', sid=s.id))


@app.route('/session/<int:sid>')
@login_required
def session(sid):
    s = SessionAppel.query.get_or_404(sid)
    decroches_without_rdv = [a for a in s.decroches if not a.rdv_decroché]
    objection_counts = {}
    for a in decroches_without_rdv:
        if a.objection:
            objection_counts[a.objection] = objection_counts.get(a.objection, 0) + 1
    return render_template('session.html', s=s, objections=OBJECTIONS,
                           objection_counts=objection_counts)


@app.route('/session/<int:sid>/appel', methods=['POST'])
@login_required
def log_appel(sid):
    s = SessionAppel.query.get_or_404(sid)
    if not s.est_active:
        flash('Session déjà terminée.')
        return redirect(url_for('session', sid=sid))

    statut     = request.form.get('statut')
    duree_secs = int(request.form.get('duree_secs') or 0)
    rdv        = request.form.get('rdv') == 'oui'
    objection  = request.form.get('objection') if not rdv and statut == 'décroché' else None
    notes      = request.form.get('notes') or None

    appel = Appel(session_id=sid, statut=statut, duree_secs=duree_secs,
                  rdv_decroché=rdv, objection=objection, notes=notes)
    db.session.add(appel)
    db.session.flush()  # get appel.id before commit

    audio = request.files.get('audio')
    if audio and audio.filename:
        filename = f"{appel.id}_{uuid.uuid4().hex[:8]}.webm"
        audio.save(os.path.join(RECORDINGS_DIR, filename))
        appel.recording = filename

    db.session.commit()
    return redirect(url_for('session', sid=sid))


@app.route('/session/<int:sid>/terminer', methods=['POST'])
@login_required
def terminer_session(sid):
    s = SessionAppel.query.get_or_404(sid)
    s.heure_fin = datetime.now()
    db.session.commit()
    return redirect(url_for('session_fin', sid=sid))


@app.route('/session/<int:sid>/fin')
@login_required
def session_fin(sid):
    s = SessionAppel.query.get_or_404(sid)
    objection_counts = {}
    for a in s.decroches:
        if not a.rdv_decroché and a.objection:
            objection_counts[a.objection] = objection_counts.get(a.objection, 0) + 1
    top_objections = sorted(objection_counts.items(), key=lambda x: x[1], reverse=True)
    return render_template('session_fin.html', s=s, top_objections=top_objections)


# ── Enregistrements ───────────────────────────────────────────────────────────

@app.route('/recordings/<path:filename>')
@login_required
def serve_recording(filename):
    return send_from_directory(RECORDINGS_DIR, filename)


# ── Historique ────────────────────────────────────────────────────────────────

@app.route('/historique')
@login_required
def historique():
    sessions = SessionAppel.query.order_by(
        SessionAppel.date.desc(), SessionAppel.heure_debut.desc()).all()
    return render_template('historique.html', sessions=sessions)


# ── Stats ─────────────────────────────────────────────────────────────────────

@app.route('/stats')
@login_required
def stats():
    all_appels   = Appel.query.all()
    all_sessions = SessionAppel.query.all()

    total_appels   = len(all_appels)
    total_decroches = len([a for a in all_appels if a.statut == 'décroché'])
    total_rdv      = len([a for a in all_appels if a.rdv_decroché])
    taux_global    = round(total_rdv / total_decroches * 100) if total_decroches else 0

    # Objections breakdown
    obj_counts = {}
    for a in all_appels:
        if a.objection:
            obj_counts[a.objection] = obj_counts.get(a.objection, 0) + 1
    top_objections = sorted(obj_counts.items(), key=lambda x: x[1], reverse=True)

    # Last 7 days
    from datetime import timedelta
    seven_days = []
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        day_sessions = [s for s in all_sessions if s.date == d]
        day_appels   = sum(s.total for s in day_sessions)
        day_rdv      = sum(len(s.rdv_list) for s in day_sessions)
        seven_days.append({'date': d, 'appels': day_appels, 'rdv': day_rdv})

    max_appels = max((d['appels'] for d in seven_days), default=1) or 1

    # Best session
    best = max(all_sessions, key=lambda s: len(s.rdv_list), default=None)

    return render_template('stats.html',
        total_appels=total_appels, total_decroches=total_decroches,
        total_rdv=total_rdv, taux_global=taux_global,
        top_objections=top_objections, seven_days=seven_days,
        max_appels=max_appels, best=best)


# ── Init DB ───────────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()
    # Migration : ajoute la colonne recording si elle n'existe pas
    from sqlalchemy import text
    try:
        db.session.execute(text('ALTER TABLE appels ADD COLUMN recording VARCHAR(100)'))
        db.session.commit()
    except Exception:
        db.session.rollback()

if __name__ == '__main__':
    app.run(debug=True)
