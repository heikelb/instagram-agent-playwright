"""
Moteur d'investigation — Identification d'un harceleur
Centralise les incidents, analyse les patterns, corrèle les données
pour constituer un dossier à remettre à la police.
"""

import os
import sqlite3
import json
import datetime
from typing import List, Optional, Dict
from collections import Counter, defaultdict
import re


DB_PATH = os.path.join(os.path.dirname(__file__), "investigation.db")


# ---------------------------------------------------------------------------
# Base de données
# ---------------------------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS incidents (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT DEFAULT (datetime('now')),
        incident_at TEXT NOT NULL,
        platform    TEXT NOT NULL,
        account_used TEXT,
        message_content TEXT,
        victim_location TEXT,
        people_present  TEXT,
        call_masked     INTEGER DEFAULT 0,
        notes           TEXT
    );

    CREATE TABLE IF NOT EXISTS accounts (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT DEFAULT (datetime('now')),
        platform    TEXT NOT NULL,
        username    TEXT NOT NULL UNIQUE,
        url         TEXT,
        incident_id INTEGER,
        osint_done  INTEGER DEFAULT 0,
        osint_result TEXT,
        notes       TEXT
    );

    CREATE TABLE IF NOT EXISTS suspects (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        relation    TEXT,
        phone       TEXT,
        social_links TEXT,
        suspicion_score INTEGER DEFAULT 0,
        notes       TEXT
    );

    CREATE TABLE IF NOT EXISTS incident_suspects (
        incident_id INTEGER,
        suspect_id  INTEGER,
        PRIMARY KEY (incident_id, suspect_id)
    );
    """)
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# CRUD Incidents
# ---------------------------------------------------------------------------

def add_incident(data: dict) -> int:
    conn = get_db()
    cur = conn.execute("""
        INSERT INTO incidents
          (incident_at, platform, account_used, message_content,
           victim_location, people_present, call_masked, notes)
        VALUES (?,?,?,?,?,?,?,?)
    """, (
        data["incident_at"],
        data["platform"],
        data.get("account_used", ""),
        data.get("message_content", ""),
        data.get("victim_location", ""),
        json.dumps(data.get("people_present", [])),
        1 if data.get("call_masked") else 0,
        data.get("notes", ""),
    ))
    conn.commit()
    incident_id = cur.lastrowid
    conn.close()

    # Enregistrer le compte automatiquement si username fourni
    if data.get("account_used") and data.get("platform"):
        uname = data["account_used"].strip().lstrip("@")
        if uname:
            try:
                add_account({
                    "platform": data["platform"],
                    "username": uname,
                    "incident_id": incident_id,
                })
            except Exception:
                pass

    return incident_id


def get_incidents() -> List[dict]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM incidents ORDER BY incident_at DESC"
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["people_present"] = json.loads(d["people_present"] or "[]")
        except Exception:
            d["people_present"] = []
        result.append(d)
    return result


def delete_incident(incident_id: int):
    conn = get_db()
    conn.execute("DELETE FROM incidents WHERE id=?", (incident_id,))
    conn.execute("DELETE FROM incident_suspects WHERE incident_id=?", (incident_id,))
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# CRUD Comptes (usernames Snapchat, etc.)
# ---------------------------------------------------------------------------

def add_account(data: dict) -> int:
    conn = get_db()
    username = data["username"].strip().lstrip("@")
    platform = data["platform"]
    url = _build_profile_url(platform, username)
    try:
        cur = conn.execute("""
            INSERT OR IGNORE INTO accounts (platform, username, url, incident_id, notes)
            VALUES (?,?,?,?,?)
        """, (
            platform, username, url,
            data.get("incident_id"),
            data.get("notes", ""),
        ))
        conn.commit()
        account_id = cur.lastrowid
    except Exception:
        account_id = 0
    finally:
        conn.close()
    return account_id


def get_accounts() -> List[dict]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM accounts ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_account_osint(account_id: int, result: dict):
    conn = get_db()
    conn.execute(
        "UPDATE accounts SET osint_done=1, osint_result=? WHERE id=?",
        (json.dumps(result), account_id)
    )
    conn.commit()
    conn.close()


def _build_profile_url(platform: str, username: str) -> str:
    urls = {
        "snapchat":  f"https://www.snapchat.com/add/{username}",
        "instagram": f"https://www.instagram.com/{username}/",
        "tiktok":    f"https://www.tiktok.com/@{username}",
        "twitter":   f"https://twitter.com/{username}",
        "facebook":  f"https://www.facebook.com/{username}",
    }
    return urls.get(platform.lower(), "")


# ---------------------------------------------------------------------------
# CRUD Suspects
# ---------------------------------------------------------------------------

def add_suspect(data: dict) -> int:
    conn = get_db()
    cur = conn.execute("""
        INSERT INTO suspects (name, relation, phone, social_links, notes)
        VALUES (?,?,?,?,?)
    """, (
        data["name"],
        data.get("relation", ""),
        data.get("phone", ""),
        json.dumps(data.get("social_links", [])),
        data.get("notes", ""),
    ))
    conn.commit()
    sid = cur.lastrowid
    conn.close()
    return sid


def get_suspects() -> List[dict]:
    conn = get_db()
    rows = conn.execute("SELECT * FROM suspects ORDER BY suspicion_score DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["social_links"] = json.loads(d["social_links"] or "[]")
        except Exception:
            d["social_links"] = []
        result.append(d)
    return result


def update_suspect_score(suspect_id: int, score: int):
    conn = get_db()
    conn.execute(
        "UPDATE suspects SET suspicion_score=? WHERE id=?", (score, suspect_id)
    )
    conn.commit()
    conn.close()


def link_suspect_to_incident(incident_id: int, suspect_id: int):
    conn = get_db()
    conn.execute(
        "INSERT OR IGNORE INTO incident_suspects VALUES (?,?)",
        (incident_id, suspect_id)
    )
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Analyseur de patterns
# ---------------------------------------------------------------------------

class PatternAnalyzer:
    """
    Analyse les incidents pour déduire l'identité du harceleur :
    - Patterns dans les usernames
    - Corrélations temporelles
    - Qui était présent à chaque incident (fuite d'info)
    - Fréquence et horaires
    """

    def __init__(self):
        self.incidents = get_incidents()
        self.accounts = get_accounts()
        self.suspects = get_suspects()

    def full_analysis(self) -> dict:
        return {
            "username_patterns": self._analyze_usernames(),
            "time_patterns": self._analyze_time_patterns(),
            "location_leak": self._analyze_location_leak(),
            "frequency": self._analyze_frequency(),
            "suspect_scores": self._score_suspects(),
            "summary": self._build_summary(),
        }

    def _analyze_usernames(self) -> dict:
        """
        Détecte les patterns dans les usernames Snapchat créés.
        Même suite de chiffres = même numéro de téléphone utilisé à la création.
        """
        usernames = [a["username"] for a in self.accounts if a["platform"].lower() == "snapchat"]
        if not usernames:
            return {"usernames": [], "patterns": [], "common_digits": None}

        patterns = []

        # Extraire les séquences numériques communes
        digit_sequences = []
        for u in usernames:
            seqs = re.findall(r'\d{3,}', u)
            digit_sequences.extend(seqs)

        digit_counts = Counter(digit_sequences)
        common_digits = [
            {"digits": d, "count": c, "meaning": _guess_digit_meaning(d)}
            for d, c in digit_counts.most_common()
            if c > 1
        ]

        # Détecter les radicaux communs (préfixes/suffixes)
        if len(usernames) >= 2:
            # Trouver le plus long préfixe commun
            common_prefix = _longest_common_prefix(usernames)
            if len(common_prefix) >= 3:
                patterns.append({
                    "type": "Préfixe commun",
                    "value": common_prefix,
                    "interpretation": (
                        f"Tous les comptes commencent par '{common_prefix}' — "
                        "peut être un surnom, une initiale ou un mot clé lié à l'identité réelle."
                    )
                })

            # Mots communs dans les usernames
            all_words = []
            for u in usernames:
                words = re.findall(r'[a-zA-Z]{3,}', u.lower())
                all_words.extend(words)
            word_counts = Counter(all_words)
            for word, count in word_counts.most_common(3):
                if count >= 2:
                    patterns.append({
                        "type": "Mot récurrent",
                        "value": word,
                        "interpretation": (
                            f"Le mot '{word}' apparaît dans {count} comptes — "
                            "peut être lié au vrai prénom, nom, surnom ou passion du harceleur."
                        )
                    })

        # Détecter l'année de naissance potentielle
        birth_years = []
        for seq in digit_sequences:
            for year in re.findall(r'(19[6-9]\d|200[0-9]|201[0-9])', seq):
                birth_years.append(year)
        if birth_years:
            most_common_year = Counter(birth_years).most_common(1)[0][0]
            patterns.append({
                "type": "Année de naissance probable",
                "value": most_common_year,
                "interpretation": (
                    f"L'année '{most_common_year}' apparaît dans les usernames — "
                    "souvent utilisée comme date de naissance ou année significative."
                )
            })

        return {
            "usernames": usernames,
            "patterns": patterns,
            "common_digits": common_digits,
            "total_accounts": len(usernames),
        }

    def _analyze_time_patterns(self) -> dict:
        """Détecte les heures et jours récurrents des incidents."""
        if not self.incidents:
            return {"hours": {}, "days": {}, "peak_hour": None, "peak_day": None}

        hours = Counter()
        days = Counter()
        DAY_FR = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"]

        for inc in self.incidents:
            try:
                dt = datetime.datetime.fromisoformat(inc["incident_at"])
                hours[dt.hour] += 1
                days[DAY_FR[dt.weekday()]] += 1
            except Exception:
                pass

        peak_hour = hours.most_common(1)[0] if hours else None
        peak_day = days.most_common(1)[0] if days else None

        interpretations = []
        if peak_hour:
            h = peak_hour[0]
            if 7 <= h <= 9:
                interpretations.append("Les messages arrivent tôt le matin → le harceleur surveille le départ de votre frère.")
            elif 12 <= h <= 14:
                interpretations.append("Pics à l'heure du déjeuner → peut avoir accès à son agenda ou connaître ses habitudes.")
            elif 18 <= h <= 22:
                interpretations.append("Messages en soirée → peut être quelqu'un qui le voit rentrer ou qui est dans son entourage proche.")
            elif 22 <= h or h < 6:
                interpretations.append("Messages tardifs/nocturnes → comportement obsessionnel, probablement quelqu'un qui a du temps libre la nuit.")

        return {
            "hours": dict(hours),
            "days": dict(days),
            "peak_hour": f"{peak_hour[0]}h ({peak_hour[1]} fois)" if peak_hour else None,
            "peak_day": f"{peak_day[0]} ({peak_day[1]} fois)" if peak_day else None,
            "interpretations": interpretations,
        }

    def _analyze_location_leak(self) -> dict:
        """
        Identifie qui savait où était la victime à chaque incident.
        La personne présente à TOUS les incidents = source de la fuite.
        """
        if not self.incidents:
            return {"person_frequency": {}, "likely_leak": None, "explanation": ""}

        person_incident_map = defaultdict(list)
        total = len(self.incidents)

        for inc in self.incidents:
            people = inc.get("people_present", [])
            for person in people:
                person = person.strip()
                if person:
                    person_incident_map[person].append(inc["id"])

        # Calculer le % de présence
        person_frequency = {
            person: {
                "count": len(incidents),
                "percentage": round(len(incidents) / total * 100),
                "incidents": incidents,
            }
            for person, incidents in person_incident_map.items()
        }

        # Trier par fréquence
        sorted_people = sorted(
            person_frequency.items(),
            key=lambda x: -x[1]["percentage"]
        )

        likely_leak = None
        explanation = ""

        if sorted_people:
            top_person, top_data = sorted_people[0]
            if top_data["percentage"] >= 70:
                likely_leak = top_person
                explanation = (
                    f"'{top_person}' était présent(e) lors de {top_data['percentage']}% des incidents "
                    f"({top_data['count']}/{total}). "
                    "Cette corrélation forte suggère que cette personne transmet "
                    "volontairement ou non les informations de localisation au harceleur."
                )
            elif top_data["percentage"] >= 40:
                likely_leak = top_person
                explanation = (
                    f"'{top_person}' est la personne la plus fréquemment présente lors des incidents "
                    f"({top_data['percentage']}%). À surveiller — pas encore concluant seul."
                )

        return {
            "person_frequency": {p: d for p, d in sorted_people},
            "likely_leak": likely_leak,
            "explanation": explanation,
            "total_incidents": total,
        }

    def _analyze_frequency(self) -> dict:
        """Analyse la fréquence des incidents pour évaluer l'escalade."""
        if len(self.incidents) < 2:
            return {"total": len(self.incidents), "trend": "insufficient_data"}

        dates = []
        for inc in self.incidents:
            try:
                dates.append(datetime.datetime.fromisoformat(inc["incident_at"]))
            except Exception:
                pass

        if len(dates) < 2:
            return {"total": len(self.incidents), "trend": "insufficient_data"}

        dates.sort()
        first = dates[0]
        last = dates[-1]
        span_days = max((last - first).days, 1)
        rate = len(dates) / span_days

        # Comparer première moitié vs deuxième moitié
        mid = len(dates) // 2
        first_half_days = max((dates[mid] - dates[0]).days, 1)
        second_half_days = max((dates[-1] - dates[mid]).days, 1)
        rate_first = mid / first_half_days
        rate_second = (len(dates) - mid) / second_half_days

        if rate_second > rate_first * 1.5:
            trend = "escalating"
            trend_label = "En escalade — les incidents s'accélèrent"
        elif rate_second < rate_first * 0.5:
            trend = "decreasing"
            trend_label = "En baisse — moins fréquent récemment"
        else:
            trend = "stable"
            trend_label = "Stable"

        return {
            "total": len(self.incidents),
            "first_incident": first.isoformat(),
            "last_incident": last.isoformat(),
            "span_days": span_days,
            "rate_per_day": round(rate, 2),
            "trend": trend,
            "trend_label": trend_label,
        }

    def _score_suspects(self) -> List[dict]:
        """
        Attribue un score de suspicion à chaque suspect selon :
        - Fréquence de présence aux incidents
        - Correspondances avec les patterns de username
        - Autres indices
        """
        if not self.suspects:
            return []

        location_data = self._analyze_location_leak()
        person_freq = location_data.get("person_frequency", {})

        scored = []
        for suspect in self.suspects:
            score = suspect.get("suspicion_score", 0)
            reasons = []

            # Score de présence
            freq_data = person_freq.get(suspect["name"], {})
            presence_pct = freq_data.get("percentage", 0)
            if presence_pct >= 70:
                score += 40
                reasons.append(f"Présent(e) lors de {presence_pct}% des incidents")
            elif presence_pct >= 40:
                score += 20
                reasons.append(f"Présent(e) lors de {presence_pct}% des incidents")

            # Vérifier si le nom apparaît dans les usernames
            usernames = [a["username"].lower() for a in self.accounts]
            name_lower = suspect["name"].lower().replace(" ", "")
            first_name = suspect["name"].lower().split()[0] if suspect["name"] else ""
            for uname in usernames:
                if first_name and len(first_name) >= 3 and first_name in uname:
                    score += 30
                    reasons.append(f"Prénom '{first_name}' détecté dans un username Snapchat")
                    break
                if name_lower[:4] in uname:
                    score += 15
                    reasons.append("Initiales détectées dans un username")
                    break

            # Vérifier le numéro de téléphone dans les usernames
            if suspect.get("phone"):
                phone_digits = re.sub(r'\D', '', suspect["phone"])[-4:]
                for uname in usernames:
                    if phone_digits in uname:
                        score += 35
                        reasons.append(f"4 derniers chiffres du numéro ({phone_digits}) dans un username")
                        break

            scored.append({
                **suspect,
                "computed_score": score,
                "reasons": reasons,
            })

        return sorted(scored, key=lambda x: -x["computed_score"])

    def _build_summary(self) -> dict:
        """Génère un résumé de l'enquête."""
        incidents = self.incidents
        accounts = self.accounts
        suspects = self._score_suspects()

        top_suspect = suspects[0] if suspects and suspects[0]["computed_score"] >= 30 else None

        conclusion = "Données insuffisantes — ajoutez plus d'incidents et de suspects."
        if top_suspect and top_suspect["computed_score"] >= 60:
            conclusion = (
                f"Le suspect le plus probable est '{top_suspect['name']}' "
                f"(score de suspicion: {top_suspect['computed_score']}/100). "
                "Ces éléments sont suffisants pour ouvrir une enquête policière."
            )
        elif top_suspect and top_suspect["computed_score"] >= 30:
            conclusion = (
                f"'{top_suspect['name']}' présente des indices concordants "
                f"mais des preuves supplémentaires sont nécessaires."
            )

        return {
            "total_incidents": len(incidents),
            "total_accounts": len(accounts),
            "total_suspects": len(suspects),
            "top_suspect": top_suspect,
            "conclusion": conclusion,
        }


# ---------------------------------------------------------------------------
# Générateur de rapport pour la police
# ---------------------------------------------------------------------------

def generate_police_report() -> str:
    """Génère un rapport HTML formaté pour la police."""
    incidents = get_incidents()
    accounts = get_accounts()
    suspects = get_suspects()
    analyzer = PatternAnalyzer()
    analysis = analyzer.full_analysis()

    now = datetime.datetime.now().strftime("%d/%m/%Y à %H:%M")

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport de harcèlement numérique — {now}</title>
<style>
  body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #111; line-height: 1.6; }}
  h1 {{ color: #c00; border-bottom: 2px solid #c00; padding-bottom: 0.5rem; }}
  h2 {{ color: #333; border-bottom: 1px solid #ccc; padding-bottom: 0.3rem; margin-top: 2rem; }}
  h3 {{ color: #555; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.9rem; }}
  th {{ background: #f0f0f0; padding: 0.5rem; text-align: left; border: 1px solid #ccc; }}
  td {{ padding: 0.5rem; border: 1px solid #ccc; vertical-align: top; }}
  .highlight {{ background: #fff3cd; padding: 0.75rem; border-left: 4px solid #f0ad4e; margin: 1rem 0; }}
  .alert {{ background: #f8d7da; padding: 0.75rem; border-left: 4px solid #c00; margin: 1rem 0; }}
  .legal {{ background: #d4edda; padding: 0.75rem; border-left: 4px solid #28a745; margin: 1rem 0; font-size: 0.9rem; }}
  .footer {{ margin-top: 3rem; color: #666; font-size: 0.85rem; border-top: 1px solid #ccc; padding-top: 1rem; }}
</style>
</head>
<body>

<h1>RAPPORT DE HARCÈLEMENT NUMÉRIQUE</h1>
<p><strong>Date du rapport :</strong> {now}</p>
<p><strong>Généré par :</strong> Outil de détection de surveillance</p>

<div class="legal">
  <strong>Références légales :</strong><br>
  • Art. 222-33-2-2 Code pénal : harcèlement via voie électronique (2 ans d'emprisonnement / 30 000€ d'amende)<br>
  • Art. 226-1 : atteinte à la vie privée par moyen de surveillance<br>
  • Art. 222-16 : appels téléphoniques malveillants réitérés<br>
  • LCEN : les plateformes (Snapchat, etc.) sont tenues de communiquer les données aux autorités judiciaires
</div>

<h2>1. RÉSUMÉ DE L'AFFAIRE</h2>
<p>
  La victime subit un harcèlement numérique caractérisé par l'envoi répété de messages
  intimidants via des comptes Snapchat créés à chaque blocage, ainsi que des appels
  téléphoniques en numéro masqué. L'auteur connaît la localisation de la victime en temps réel,
  ce qui indique soit un accès aux données de localisation de l'appareil, soit un tiers
  informateur dans l'entourage.
</p>

<div class="highlight">
  <strong>Conclusion de l'analyse :</strong> {analysis['summary']['conclusion']}
</div>

<h2>2. CHRONOLOGIE DES INCIDENTS ({len(incidents)} au total)</h2>
"""

    if incidents:
        html += """<table>
<tr><th>Date/Heure</th><th>Plateforme</th><th>Compte utilisé</th><th>Lieu victime</th><th>Contenu</th></tr>
"""
        for inc in sorted(incidents, key=lambda x: x["incident_at"]):
            html += f"""<tr>
  <td>{inc['incident_at']}</td>
  <td>{inc['platform']}</td>
  <td>{'Numéro masqué' if inc['call_masked'] else (inc['account_used'] or '—')}</td>
  <td>{inc['victim_location'] or '—'}</td>
  <td>{(inc['message_content'] or '—')[:100]}</td>
</tr>"""
        html += "</table>"
    else:
        html += "<p>Aucun incident enregistré.</p>"

    html += f"""
<h2>3. COMPTES UTILISÉS PAR LE HARCELEUR ({len(accounts)} comptes)</h2>
"""
    if accounts:
        html += """<table>
<tr><th>Plateforme</th><th>Username</th><th>URL profil</th></tr>
"""
        for acc in accounts:
            html += f"""<tr>
  <td>{acc['platform']}</td>
  <td><strong>{acc['username']}</strong></td>
  <td>{acc['url'] or '—'}</td>
</tr>"""
        html += "</table>"
        html += """<div class="alert">
  <strong>Demande de réquisition judiciaire recommandée :</strong><br>
  Ces comptes permettent à Snapchat d'identifier l'adresse IP, le numéro de téléphone
  utilisé à la création et l'empreinte de l'appareil. Sur réquisition judiciaire,
  Snapchat Inc. (US) transmet ces données via la procédure MLAT ou directement aux autorités françaises.
</div>"""

    # Patterns usernames
    up = analysis["username_patterns"]
    if up.get("patterns"):
        html += "<h2>4. ANALYSE DES PATTERNS DE USERNAMES</h2>"
        html += "<p>L'analyse des comptes créés révèle les éléments suivants :</p><ul>"
        for p in up["patterns"]:
            html += f"<li><strong>{p['type']} : '{p['value']}'</strong> — {p['interpretation']}</li>"
        html += "</ul>"

        if up.get("common_digits"):
            html += "<p><strong>Séquences numériques récurrentes :</strong></p><ul>"
            for d in up["common_digits"]:
                html += f"<li>{d['digits']} (présent dans {d['count']} comptes) — {d['meaning']}</li>"
            html += "</ul>"

    # Patterns temporels
    tp = analysis["time_patterns"]
    if tp.get("peak_hour"):
        html += f"""
<h2>5. ANALYSE TEMPORELLE</h2>
<p><strong>Heure de pic :</strong> {tp['peak_hour']}</p>
<p><strong>Jour le plus fréquent :</strong> {tp.get('peak_day', '—')}</p>"""
        if tp.get("interpretations"):
            html += "<ul>" + "".join(f"<li>{i}</li>" for i in tp["interpretations"]) + "</ul>"

    # Fuite de localisation
    ll = analysis["location_leak"]
    if ll.get("explanation"):
        html += f"""
<h2>6. SOURCE PROBABLE DE LA FUITE D'INFORMATION</h2>
<div class="alert">{ll['explanation']}</div>
"""
        if ll.get("person_frequency"):
            html += """<table><tr><th>Personne</th><th>Présente lors de</th><th>% des incidents</th></tr>"""
            for person, data in ll["person_frequency"].items():
                html += f"<tr><td>{person}</td><td>{data['count']} incidents</td><td>{data['percentage']}%</td></tr>"
            html += "</table>"

    # Suspects
    scored = analysis["suspect_scores"]
    if scored:
        html += f"<h2>7. SUSPECTS IDENTIFIÉS ({len(scored)})</h2>"
        for s in scored:
            score = s["computed_score"]
            level = "FORTE" if score >= 60 else ("MODÉRÉE" if score >= 30 else "FAIBLE")
            html += f"""
<h3>{s['name']} — Suspicion {level} (score: {score}/100)</h3>
<p><strong>Relation :</strong> {s.get('relation','—')} | <strong>Téléphone :</strong> {s.get('phone','—')}</p>"""
            if s.get("reasons"):
                html += "<p><strong>Indices :</strong></p><ul>"
                for r in s["reasons"]:
                    html += f"<li>{r}</li>"
                html += "</ul>"

    html += f"""
<h2>8. RECOMMANDATIONS POUR LES ENQUÊTEURS</h2>
<ol>
  <li><strong>Réquisition à Snapchat Inc.</strong> pour les {len(accounts)} comptes listés :
      adresse IP de création, numéro de téléphone associé, IMEI/empreinte de l'appareil.</li>
  <li><strong>Réquisition à l'opérateur téléphonique</strong> de la victime pour identifier
      les numéros réels derrière les appels en numéro masqué (logs CDR).</li>
  <li><strong>Géolocalisation des IPs</strong> obtenues pour localiser le harceleur.</li>
  <li>Si un suspect est identifié : demande de <strong>géolocalisation en temps réel</strong>
      (art. 230-32 CPP) pour confirmer la corrélation avec les incidents.</li>
  <li>Vérifier si le suspect utilise <strong>Life360, Find My Friends ou partage iCloud</strong>
      avec la victime.</li>
</ol>

<div class="footer">
  Rapport généré le {now} — Outil de détection de surveillance<br>
  Ce document constitue une aide à l'investigation et doit être complété par les pièces originales
  (captures d'écran, enregistrements) annexées à la plainte.
</div>
</body>
</html>"""

    return html


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _guess_digit_meaning(digits: str) -> str:
    """Tente d'interpréter une séquence numérique dans un username."""
    if re.match(r'^(19[6-9]\d|200[0-9]|201[0-9])$', digits):
        return f"Année de naissance probable : {digits}"
    if re.match(r'^\d{4}$', digits) and 100 <= int(digits) <= 3112:
        return "Possible date (JJMM ou MMJJ)"
    if len(digits) >= 8:
        return "Peut-être un numéro de téléphone partiel"
    return "Séquence numérique récurrente"


def _longest_common_prefix(strings: List[str]) -> str:
    if not strings:
        return ""
    prefix = strings[0]
    for s in strings[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix
