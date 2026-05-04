import csv
import io
import os
import re
from datetime import datetime, date, timedelta

import hashlib
from flask import Flask, render_template, request, redirect, url_for, flash, Response, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///ventes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ---------------------------------------------------------------------------
# Authentification
# ---------------------------------------------------------------------------

login_manager = LoginManager(app)
login_manager.login_view = "login"
login_manager.login_message = "Connecte-toi pour accéder à tes ventes."
login_manager.login_message_category = "warning"

APP_PASSWORD_HASH = hashlib.sha256(
    os.environ.get("APP_PASSWORD", "orange2026").encode()
).hexdigest()


class FakeUser(UserMixin):
    id = "1"


THE_USER = FakeUser()


@login_manager.user_loader
def load_user(user_id):
    return THE_USER if user_id == "1" else None


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        pwd = request.form.get("password", "")
        if hashlib.sha256(pwd.encode()).hexdigest() == APP_PASSWORD_HASH:
            login_user(THE_USER, remember=True)
            return redirect(request.args.get("next") or url_for("dashboard"))
        flash("Mot de passe incorrect.", "danger")
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


# ---------------------------------------------------------------------------
# Modèle
# ---------------------------------------------------------------------------

STATUTS = {
    "en_attente": "En attente",
    "confirme": "Confirmé",
    "installe": "Installé",
    "no_show": "No-show",
    "annule": "Annulé",
}

PRODUITS = [
    "En option",
    "Livebox Fibre",
    "Livebox Up",
    "Livebox Max",
    "Série Spécial Lite Fibre",
]


class Vente(db.Model):
    __tablename__ = "ventes"

    id = db.Column(db.Integer, primary_key=True)
    prenom = db.Column(db.String(100), nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20), nullable=False)
    adresse = db.Column(db.String(200), nullable=False)
    produit = db.Column(db.String(100), nullable=False)
    date_rdv = db.Column(db.DateTime, nullable=False)
    date_signature = db.Column(db.Date, nullable=False, default=date.today)
    statut = db.Column(db.String(50), nullable=False, default="en_attente")
    reference = db.Column(db.String(100), nullable=True)
    sms_envoye = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def statut_label(self):
        return STATUTS.get(self.statut, self.statut)

    @property
    def badge_class(self):
        return {
            "en_attente": "bg-warning text-dark",
            "confirme": "bg-info text-dark",
            "installe": "bg-success",
            "no_show": "bg-danger",
            "annule": "bg-secondary",
        }.get(self.statut, "bg-secondary")


# ---------------------------------------------------------------------------
# Modèles prospection terrain
# ---------------------------------------------------------------------------

# Résultats possibles à chaque porte
RESULTATS_PORTE = {
    "absent":  {"label": "ABSENT",  "emoji": "🔘", "color": "#6c757d"},
    "refus":   {"label": "REFUS",   "emoji": "❌", "color": "#dc3545"},
    "cause":   {"label": "CAUSÉ",   "emoji": "💬", "color": "#fd7e14"},
    "entre":   {"label": "ENTRÉ",   "emoji": "🏠", "color": "#0d6efd"},
    "signe":   {"label": "SIGNÉ",   "emoji": "✅", "color": "#198754"},
}


class SessionProspection(db.Model):
    __tablename__ = "sessions_prospection"

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(200), nullable=False)   # ex: "Rue de la Paix, Paris 2"
    date = db.Column(db.Date, nullable=False, default=date.today)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    portes = db.relationship(
        "Porte", backref="session", lazy=True,
        cascade="all, delete-orphan", order_by="Porte.id",
    )

    @property
    def total(self):
        return len(self.portes)

    @property
    def nb_ouvertes(self):
        return sum(1 for p in self.portes if p.resultat in ("refus", "cause", "entre", "signe"))

    @property
    def nb_causes(self):
        return sum(1 for p in self.portes if p.resultat in ("cause", "entre", "signe"))

    @property
    def nb_entrees(self):
        return sum(1 for p in self.portes if p.resultat in ("entre", "signe"))

    @property
    def nb_signes(self):
        return sum(1 for p in self.portes if p.resultat == "signe")

    def _pct(self, n):
        return round(n / self.total * 100) if self.total else 0

    @property
    def taux_ouverture(self):
        return self._pct(self.nb_ouvertes)

    @property
    def taux_entree(self):
        return self._pct(self.nb_entrees)

    @property
    def taux_cause(self):
        return self._pct(self.nb_causes)

    @property
    def taux_signature(self):
        return self._pct(self.nb_signes)

    def to_stats_dict(self):
        return {
            "total":          self.total,
            "nb_ouvertes":    self.nb_ouvertes,
            "nb_causes":      self.nb_causes,
            "nb_entrees":     self.nb_entrees,
            "nb_signes":      self.nb_signes,
            "taux_ouverture": self.taux_ouverture,
            "taux_cause":     self.taux_cause,
            "taux_entree":    self.taux_entree,
            "taux_signature": self.taux_signature,
        }


class Porte(db.Model):
    __tablename__ = "portes"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(
        db.Integer, db.ForeignKey("sessions_prospection.id"), nullable=False
    )
    resultat = db.Column(db.String(20), nullable=False)
    adresse_id = db.Column(db.Integer, db.ForeignKey("adresses_importees.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Modèle import adresses terrain
# ---------------------------------------------------------------------------

class AdresseImportee(db.Model):
    __tablename__ = "adresses_importees"

    id = db.Column(db.Integer, primary_key=True)
    rue = db.Column(db.String(200), nullable=False, index=True)
    numero = db.Column(db.String(20), nullable=False)
    complement = db.Column(db.String(100), nullable=True)
    imported_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def adresse_complete(self):
        parts = [self.numero, self.rue]
        if self.complement:
            parts.append(self.complement)
        return " ".join(parts)


# ---------------------------------------------------------------------------
# SMS
# ---------------------------------------------------------------------------

def envoyer_sms(telephone: str, message: str) -> bool:
    """Envoie un SMS via Twilio. Retourne True si succès."""
    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = os.environ.get("TWILIO_PHONE_NUMBER")

    if not all([sid, token, from_number]):
        app.logger.warning("Twilio non configuré — SMS non envoyé.")
        return False

    try:
        from twilio.rest import Client
        client = Client(sid, token)
        client.messages.create(body=message, from_=from_number, to=telephone)
        return True
    except Exception as exc:
        app.logger.error("Erreur Twilio : %s", exc)
        return False


def construire_message_rappel(vente: Vente) -> str:
    date_str = vente.date_rdv.strftime("%d/%m/%Y")
    heure_str = vente.date_rdv.strftime("%H:%M")
    return (
        f"Bonjour {vente.prenom},\n"
        f"Rappel Orange : votre rendez-vous d'installation ({vente.produit}) "
        f"est prévu demain {date_str} à {heure_str}.\n"
        f"Pour modifier, appelez le 3900.\n"
        f"À bientôt !"
    )


def envoyer_rappels_du_jour():
    """Tâche planifiée : envoie les rappels SMS pour les RDV du lendemain."""
    with app.app_context():
        demain = date.today() + timedelta(days=1)
        ventes = Vente.query.filter(
            db.func.date(Vente.date_rdv) == demain,
            Vente.sms_envoye == False,
            Vente.statut.in_(["en_attente", "confirme"]),
        ).all()

        for vente in ventes:
            message = construire_message_rappel(vente)
            if envoyer_sms(vente.telephone, message):
                vente.sms_envoye = True
                db.session.commit()
                app.logger.info("SMS rappel envoyé → %s %s", vente.prenom, vente.nom)


# ---------------------------------------------------------------------------
# Routes : Récap semaine
# ---------------------------------------------------------------------------

@app.route("/recap")
@app.route("/recap/<int:offset_semaines>")
@login_required
def recap_semaine(offset_semaines=0):
    aujourd_hui = date.today()
    # Lundi de la semaine cible
    lundi = aujourd_hui - timedelta(days=aujourd_hui.weekday()) + timedelta(weeks=offset_semaines)
    dimanche = lundi + timedelta(days=6)

    # Toutes les ventes de la semaine
    ventes_semaine = Vente.query.filter(
        Vente.date_signature >= lundi,
        Vente.date_signature <= dimanche,
    ).order_by(Vente.date_signature.asc(), Vente.created_at.asc()).all()

    # Grouper par jour
    jours = []
    noms_jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    for i in range(7):
        jour = lundi + timedelta(days=i)
        ventes_jour = [v for v in ventes_semaine if v.date_signature == jour]
        jours.append({
            "nom": noms_jours[i],
            "date": jour,
            "ventes": ventes_jour,
            "is_today": jour == aujourd_hui,
        })

    # Stats globales de la semaine
    par_produit = {}
    for v in ventes_semaine:
        par_produit[v.produit] = par_produit.get(v.produit, 0) + 1

    return render_template(
        "recap.html",
        jours=jours,
        lundi=lundi,
        dimanche=dimanche,
        total_semaine=len(ventes_semaine),
        par_produit=par_produit,
        offset=offset_semaines,
        aujourd_hui=aujourd_hui,
    )


# ---------------------------------------------------------------------------
# Routes : Dashboard
# ---------------------------------------------------------------------------

@app.route("/")
@login_required
def dashboard():
    aujourd_hui = date.today()
    demain = aujourd_hui + timedelta(days=1)

    total = Vente.query.count()
    rdv_demain = Vente.query.filter(
        db.func.date(Vente.date_rdv) == demain,
        Vente.statut.in_(["en_attente", "confirme"]),
    ).count()
    no_shows = Vente.query.filter_by(statut="no_show").count()
    installes = Vente.query.filter_by(statut="installe").count()
    en_attente = Vente.query.filter_by(statut="en_attente").count()

    taux_no_show = round((no_shows / total * 100) if total else 0, 1)

    ventes_recentes = (
        Vente.query.order_by(Vente.created_at.desc()).limit(8).all()
    )
    rdv_demain_liste = Vente.query.filter(
        db.func.date(Vente.date_rdv) == demain,
        Vente.statut.in_(["en_attente", "confirme"]),
    ).order_by(Vente.date_rdv).all()

    return render_template(
        "dashboard.html",
        total=total,
        rdv_demain=rdv_demain,
        no_shows=no_shows,
        installes=installes,
        en_attente=en_attente,
        taux_no_show=taux_no_show,
        ventes_recentes=ventes_recentes,
        rdv_demain_liste=rdv_demain_liste,
        aujourd_hui=aujourd_hui,
    )


# ---------------------------------------------------------------------------
# Routes : Liste des ventes
# ---------------------------------------------------------------------------

@app.route("/ventes")
@login_required
def liste_ventes():
    statut_filtre = request.args.get("statut", "")
    produit_filtre = request.args.get("produit", "")
    search = request.args.get("q", "").strip()

    query = Vente.query

    if statut_filtre:
        query = query.filter_by(statut=statut_filtre)
    if produit_filtre:
        query = query.filter_by(produit=produit_filtre)
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(
                Vente.prenom.ilike(like),
                Vente.nom.ilike(like),
                Vente.telephone.ilike(like),
                Vente.adresse.ilike(like),
            )
        )

    ventes = query.order_by(Vente.date_rdv.desc()).all()

    # Export CSV
    if request.args.get("export") == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Prénom", "Nom", "Téléphone", "Adresse",
            "Produit", "Réf. commande", "Date RDV", "Date signature", "Statut", "SMS envoyé", "Notes",
        ])
        for v in ventes:
            writer.writerow([
                v.id, v.prenom, v.nom, v.telephone, v.adresse,
                v.produit,
                v.reference or "",
                v.date_rdv.strftime("%d/%m/%Y %H:%M"),
                v.date_signature.strftime("%d/%m/%Y"),
                v.statut_label,
                "Oui" if v.sms_envoye else "Non",
                v.notes or "",
            ])
        output.seek(0)
        return Response(
            "\ufeff" + output.getvalue(),  # BOM pour Excel
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=ventes_orange.csv"},
        )

    return render_template(
        "ventes.html",
        ventes=ventes,
        statuts=STATUTS,
        produits=PRODUITS,
        statut_filtre=statut_filtre,
        produit_filtre=produit_filtre,
        search=search,
    )


# ---------------------------------------------------------------------------
# Routes : Ajouter une vente
# ---------------------------------------------------------------------------

@app.route("/ajouter", methods=["GET", "POST"])
@login_required
def ajouter_vente():
    if request.method == "POST":
        try:
            date_rdv_str = request.form["date_rdv"]
            date_rdv = datetime.strptime(date_rdv_str, "%Y-%m-%dT%H:%M")

            date_signature_str = request.form.get("date_signature")
            date_signature = (
                datetime.strptime(date_signature_str, "%Y-%m-%d").date()
                if date_signature_str
                else date.today()
            )

            vente = Vente(
                prenom=request.form["prenom"].strip().capitalize(),
                nom=request.form["nom"].strip().upper(),
                telephone=request.form["telephone"].strip(),
                adresse=request.form["adresse"].strip(),
                produit=request.form["produit"],
                reference=request.form.get("reference", "").strip() or None,
                date_rdv=date_rdv,
                date_signature=date_signature,
                statut=request.form.get("statut", "en_attente"),
                notes=request.form.get("notes", "").strip() or None,
            )
            db.session.add(vente)
            db.session.commit()
            flash(f"Vente ajoutée : {vente.prenom} {vente.nom}", "success")
            return redirect(url_for("dashboard"))
        except Exception as exc:
            flash(f"Erreur : {exc}", "danger")

    return render_template(
        "formulaire.html",
        vente=None,
        produits=PRODUITS,
        statuts=STATUTS,
        titre="Nouvelle vente",
    )


# ---------------------------------------------------------------------------
# Routes : Modifier une vente
# ---------------------------------------------------------------------------

@app.route("/modifier/<int:vente_id>", methods=["GET", "POST"])
@login_required
def modifier_vente(vente_id):
    vente = Vente.query.get_or_404(vente_id)

    if request.method == "POST":
        try:
            vente.prenom = request.form["prenom"].strip().capitalize()
            vente.nom = request.form["nom"].strip().upper()
            vente.telephone = request.form["telephone"].strip()
            vente.adresse = request.form["adresse"].strip()
            vente.produit = request.form["produit"]
            vente.reference = request.form.get("reference", "").strip() or None
            vente.date_rdv = datetime.strptime(
                request.form["date_rdv"], "%Y-%m-%dT%H:%M"
            )
            date_sig_str = request.form.get("date_signature")
            if date_sig_str:
                vente.date_signature = datetime.strptime(
                    date_sig_str, "%Y-%m-%d"
                ).date()
            ancien_statut = vente.statut
            vente.statut = request.form.get("statut", vente.statut)
            vente.notes = request.form.get("notes", "").strip() or None

            # Si le statut change, on reset l'envoi SMS si besoin
            if vente.statut != ancien_statut and vente.statut in ("en_attente", "confirme"):
                vente.sms_envoye = False

            db.session.commit()
            flash("Vente mise à jour.", "success")
            return redirect(url_for("liste_ventes"))
        except Exception as exc:
            flash(f"Erreur : {exc}", "danger")

    return render_template(
        "formulaire.html",
        vente=vente,
        produits=PRODUITS,
        statuts=STATUTS,
        titre="Modifier la vente",
    )


# ---------------------------------------------------------------------------
# Routes : Supprimer une vente
# ---------------------------------------------------------------------------

@app.route("/supprimer/<int:vente_id>", methods=["POST"])
@login_required
def supprimer_vente(vente_id):
    vente = Vente.query.get_or_404(vente_id)
    db.session.delete(vente)
    db.session.commit()
    flash("Vente supprimée.", "info")
    return redirect(url_for("liste_ventes"))


# ---------------------------------------------------------------------------
# Routes : Changer le statut rapidement
# ---------------------------------------------------------------------------

@app.route("/statut/<int:vente_id>/<statut>", methods=["POST"])
@login_required
def changer_statut(vente_id, statut):
    if statut not in STATUTS:
        flash("Statut invalide.", "danger")
        return redirect(url_for("liste_ventes"))
    vente = Vente.query.get_or_404(vente_id)
    vente.statut = statut
    db.session.commit()
    flash(
        f"{vente.prenom} {vente.nom} → {STATUTS[statut]}", "success"
    )
    return redirect(request.referrer or url_for("liste_ventes"))


# ---------------------------------------------------------------------------
# Routes : Envoyer un SMS manuellement
# ---------------------------------------------------------------------------

@app.route("/envoyer-sms/<int:vente_id>", methods=["POST"])
@login_required
def envoyer_sms_manuel(vente_id):
    vente = Vente.query.get_or_404(vente_id)
    message = construire_message_rappel(vente)
    if envoyer_sms(vente.telephone, message):
        vente.sms_envoye = True
        db.session.commit()
        flash(f"SMS envoyé à {vente.prenom} {vente.nom} ({vente.telephone}).", "success")
    else:
        flash(
            "Impossible d'envoyer le SMS. Vérifiez la config Twilio dans .env.",
            "warning",
        )
    return redirect(request.referrer or url_for("liste_ventes"))


# ---------------------------------------------------------------------------
# Routes : Déclencher les rappels manuellement (test)
# ---------------------------------------------------------------------------

@app.route("/lancer-rappels", methods=["POST"])
@login_required
def lancer_rappels():
    envoyer_rappels_du_jour()
    flash("Rappels SMS du lendemain traités.", "info")
    return redirect(url_for("dashboard"))


# ---------------------------------------------------------------------------
# Route : Scan bon de commande (Claude Vision)
# ---------------------------------------------------------------------------

@app.route("/scan-affiche", methods=["POST"])
@login_required
def scan_affiche():
    import base64
    import json as _json

    photo = request.files.get("photo")
    if not photo:
        return jsonify({"error": "Aucune photo reçue"}), 400

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY non configuré dans les variables d'environnement."}), 500

    img_bytes = photo.read()
    if len(img_bytes) > 10 * 1024 * 1024:  # 10 Mo max
        return jsonify({"error": "Image trop lourde (max 10 Mo)."}), 400

    img_b64 = base64.standard_b64encode(img_bytes).decode("utf-8")
    media_type = photo.content_type if (photo.content_type or "").startswith("image/") else "image/jpeg"

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": img_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            "Tu es un assistant pour un commercial Orange en porte-à-porte.\n"
                            "Extrait les informations client de ce document "
                            "(bon de commande, contrat, écran tablette Orange, fiche client...).\n\n"
                            "Retourne UNIQUEMENT un objet JSON valide avec ces champs "
                            "(null si non trouvé) :\n"
                            "{\n"
                            '  "prenom": "...",\n'
                            '  "nom": "...",\n'
                            '  "telephone": "...",\n'
                            '  "adresse": "...",\n'
                            '  "produit": "...",\n'
                            '  "reference": "...",\n'
                            '  "date_rdv": "YYYY-MM-DDTHH:MM"\n'
                            "}\n\n"
                            "Règles :\n"
                            "- produit : choisir parmi (exactement) : "
                            "'En option', 'Livebox Fibre', 'Livebox Up', "
                            "'Livebox Max', 'Série Spécial Lite Fibre' — ou null\n"
                            "- date_rdv : format YYYY-MM-DDTHH:MM (ex: 2026-04-25T14:00)\n"
                            "- telephone : avec indicatif si visible (+33...)\n"
                            "- adresse : adresse complète avec code postal et ville\n"
                            "Retourne UNIQUEMENT le JSON brut, sans balises markdown."
                        ),
                    },
                ],
            }],
        )

        txt = msg.content[0].text.strip()
        # Extraire le JSON si entouré de balises markdown
        m = re.search(r'\{[\s\S]*\}', txt)
        txt = m.group() if m else txt

        data = _json.loads(txt)
        # Nettoyer les None Python → null déjà géré par jsonify
        return jsonify(data)

    except _json.JSONDecodeError as e:
        return jsonify({"error": f"Impossible de lire la réponse IA : {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Route offline (PWA fallback)
# ---------------------------------------------------------------------------

@app.route("/offline")
def offline():
    return render_template("offline.html")


# ---------------------------------------------------------------------------
# Helpers : Prospection terrain
# ---------------------------------------------------------------------------

def _sort_numero(a):
    m = re.match(r'^(\d+)', str(a.numero).strip())
    return (int(m.group(1)) if m else 9999, str(a.numero))


def trouver_adresses_pour_rue(nom_session):
    """Retourne les AdresseImportee correspondant au nom de session (matching souple)."""
    nom_norm = nom_session.lower().strip()
    rues = [r[0] for r in db.session.query(AdresseImportee.rue).distinct().all()]
    matching = [r for r in rues if r.lower() in nom_norm or nom_norm in r.lower()]
    if not matching:
        return []
    adresses = AdresseImportee.query.filter(AdresseImportee.rue.in_(matching)).all()
    return sorted(adresses, key=_sort_numero)


# ---------------------------------------------------------------------------
# Routes : Prospection terrain
# ---------------------------------------------------------------------------

@app.route("/prospection")
@login_required
def liste_prospection():
    sessions = (
        SessionProspection.query
        .order_by(SessionProspection.date.desc(), SessionProspection.created_at.desc())
        .all()
    )
    return render_template("prospection.html", sessions=sessions)


@app.route("/prospection/nouvelle", methods=["POST"])
@login_required
def nouvelle_session():
    nom = request.form.get("nom", "").strip()
    if not nom:
        flash("Donne un nom à ta session (ex: Rue Victor Hugo).", "warning")
        return redirect(url_for("liste_prospection"))
    sess = SessionProspection(nom=nom)
    db.session.add(sess)
    db.session.commit()
    return redirect(url_for("tap_session", session_id=sess.id))


@app.route("/prospection/<int:session_id>")
@login_required
def tap_session(session_id):
    sess = SessionProspection.query.get_or_404(session_id)
    adresses = trouver_adresses_pour_rue(sess.nom)
    if adresses:
        taps = {p.adresse_id: p.resultat for p in sess.portes if p.adresse_id is not None}
        adresses_data = [{
            "id": a.id,
            "rue": a.rue,
            "numero": a.numero,
            "complement": a.complement,
            "resultat": taps.get(a.id),
        } for a in adresses]
        return render_template(
            "tap_adresses.html",
            session=sess,
            adresses=adresses_data,
            resultats=RESULTATS_PORTE,
        )
    return render_template("tap.html", session=sess, resultats=RESULTATS_PORTE)


@app.route("/prospection/<int:session_id>/tap/<resultat>", methods=["POST"])
@login_required
def tap_porte(session_id, resultat):
    if resultat not in RESULTATS_PORTE:
        return jsonify({"error": "Résultat invalide"}), 400
    sess = SessionProspection.query.get_or_404(session_id)
    porte = Porte(session_id=session_id, resultat=resultat)
    db.session.add(porte)
    db.session.commit()
    return jsonify(sess.to_stats_dict())


@app.route("/prospection/<int:session_id>/annuler", methods=["POST"])
@login_required
def annuler_derniere_porte(session_id):
    sess = SessionProspection.query.get_or_404(session_id)
    derniere = (
        Porte.query
        .filter_by(session_id=session_id)
        .order_by(Porte.id.desc())
        .first()
    )
    if derniere:
        db.session.delete(derniere)
        db.session.commit()
    return jsonify(sess.to_stats_dict())


@app.route("/prospection/<int:session_id>/tap-adresse/<int:adresse_id>/<resultat>", methods=["POST"])
@login_required
def tap_adresse_specifique(session_id, adresse_id, resultat):
    if resultat not in RESULTATS_PORTE:
        return jsonify({"error": "Résultat invalide"}), 400
    sess = SessionProspection.query.get_or_404(session_id)
    AdresseImportee.query.get_or_404(adresse_id)
    # Upsert: one Porte entry per (session, adresse)
    existing = Porte.query.filter_by(session_id=session_id, adresse_id=adresse_id).first()
    if existing:
        existing.resultat = resultat
    else:
        db.session.add(Porte(session_id=session_id, resultat=resultat, adresse_id=adresse_id))
    db.session.commit()
    all_taps = {p.adresse_id: p.resultat for p in sess.portes if p.adresse_id is not None}
    return jsonify({"stats": sess.to_stats_dict(), "adresse_id": adresse_id,
                    "resultat": resultat, "all_taps": all_taps})


@app.route("/prospection/<int:session_id>/supprimer", methods=["POST"])
@login_required
def supprimer_session(session_id):
    sess = SessionProspection.query.get_or_404(session_id)
    db.session.delete(sess)
    db.session.commit()
    flash("Session supprimée.", "info")
    return redirect(url_for("liste_prospection"))


# ---------------------------------------------------------------------------
# Routes : Import fichier terrain
# ---------------------------------------------------------------------------

@app.route("/import", methods=["GET", "POST"])
@login_required
def importer_fichier():
    if request.method == "POST":
        fichier = request.files.get("fichier")
        if not fichier or not fichier.filename:
            flash("Sélectionne un fichier Excel (.xlsx ou .xls).", "warning")
            return redirect(url_for("importer_fichier"))
        if not fichier.filename.lower().endswith((".xlsx", ".xls")):
            flash("Format invalide — seuls les fichiers .xlsx et .xls sont acceptés.", "warning")
            return redirect(url_for("importer_fichier"))
        try:
            from openpyxl import load_workbook
            import tempfile, os as _os

            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
            fichier.save(tmp.name)
            tmp.close()
            wb = load_workbook(tmp.name, data_only=True)
            _os.unlink(tmp.name)
            ws = wb.worksheets[0]

            def cell_str(c):
                """Convertit n'importe quelle valeur openpyxl en string propre."""
                if c is None:
                    return ""
                # CellRichText ou objet itérable non-string
                if hasattr(c, '__iter__') and not isinstance(c, str):
                    try:
                        return "".join(
                            getattr(part, 'text', str(part)) for part in c
                        ).strip()
                    except Exception:
                        pass
                if isinstance(c, bool):
                    return ""
                if isinstance(c, float):
                    return str(int(c)) if c.is_integer() else str(c)
                if isinstance(c, int):
                    return str(c)
                return str(c).strip()

            # Lire toutes les lignes non-vides
            all_rows = [
                [cell_str(c) for c in row]
                for row in ws.iter_rows(min_row=1, values_only=True)
                if any(c is not None for c in row)
            ]
            all_rows = [r for r in all_rows if any(v for v in r)]

            if not all_rows:
                flash("Le fichier est vide.", "warning")
                return redirect(url_for("importer_fichier"))

            n_cols = max(len(r) for r in all_rows)

            # ── Détecter en-tête ────────────────────────────────────────────
            HEADER_KW = {"rue", "adresse", "voie", "libelle", "libellé", "street",
                         "num", "n°", "no", "porte", "numero", "numéro", "code",
                         "nom de voie", "type voie", "type de voie", "libellé voie"}
            first_low = all_rows[0][0].lower().strip() if all_rows[0] else ""
            has_header = first_low in HEADER_KW

            header_row = all_rows[0] if has_header else None
            data_rows  = all_rows[1:] if has_header else all_rows

            if not data_rows:
                flash("Aucune donnée trouvée dans le fichier.", "warning")
                return redirect(url_for("importer_fichier"))

            # ── Détecter colonnes par CONTENU (analyse des 50 premières lignes) ──
            PREFIXES_RUE = (
                "rue ", "avenue ", "av ", "av. ", "boulevard ", "bd ", "bd.",
                "chemin ", "impasse ", "allée ", "allee ", "passage ", "place ",
                "route ", "voie ", "résidence ", "residence ", "cité ", "cite ",
                "square ", "villa ", "domaine ", "lot ", "lieu-dit",
            )
            sample = data_rows[:50]
            scores_rue = [0] * n_cols
            scores_num = [0] * n_cols

            # Diversité par colonne (valeurs uniques non-nulles non-zéro)
            col_unique_vals = [set() for _ in range(n_cols)]
            col_zero_count  = [0] * n_cols

            for row in sample:
                for j in range(min(n_cols, len(row))):
                    v = row[j]
                    if not v:
                        continue
                    vl = v.lower()

                    # Score rue
                    if any(vl.startswith(p) for p in PREFIXES_RUE):
                        scores_rue[j] += 4
                    elif " " in v and not v[0].isdigit() and "/" not in v and len(v) > 5:
                        scores_rue[j] += 1

                    # Score numéro : entier court, pas de /
                    if "/" not in v and re.match(r'^\d{1,4}\w{0,3}$', v):
                        scores_num[j] += 4
                    elif re.match(r'^\d+$', v) and len(v) <= 4:
                        scores_num[j] += 2

                    # Diversité
                    if v == "0":
                        col_zero_count[j] += 1
                    else:
                        col_unique_vals[j].add(v)

            # Bonus de diversité : une colonne avec plein de valeurs différentes
            # est très probablement la vraie colonne de numéros
            for j in range(n_cols):
                n_unique = len(col_unique_vals[j])
                n_zero   = col_zero_count[j]
                total    = n_unique + n_zero
                if total == 0:
                    continue
                # Pénaliser fortement les colonnes majoritairement à 0
                if total > 3 and n_zero / total > 0.5:
                    scores_num[j] = 0
                # Bonus diversité pour les colonnes avec plusieurs valeurs distinctes
                if n_unique >= 3:
                    scores_num[j] += n_unique * 2

            # Priorité 1 : colonnes nommées dans l'en-tête
            col_rue = col_num = None
            if has_header and header_row:
                for j, c in enumerate(header_row):
                    cl = c.lower()
                    if col_rue is None and any(w in cl for w in ("rue", "voie", "libelle", "libellé", "adresse", "nom")):
                        col_rue = j
                    if col_num is None and any(w in cl for w in ("num", "n°", "porte", "numéro", "numero")):
                        col_num = j

            # Priorité 2 : colonnes détectées par contenu
            if col_rue is None:
                col_rue = max(range(n_cols), key=lambda j: scores_rue[j])
            if col_num is None:
                candidates = [j for j in range(n_cols) if j != col_rue]
                col_num = max(candidates, key=lambda j: scores_num[j]) if candidates else (1 if col_rue == 0 else 0)

            # ── Importer ────────────────────────────────────────────────────
            nb_ok = nb_skip = 0
            for cells in data_rows:
                rue_val = cells[col_rue] if col_rue < len(cells) else ""
                num_val = cells[col_num] if col_num < len(cells) else ""

                # Cas colonne unique "12 Rue Victor Hugo"
                if not num_val and rue_val:
                    m = re.match(r'^(\d+\w*)\s+(.+)$', rue_val)
                    if m:
                        num_val, rue_val = m.group(1), m.group(2)

                if not rue_val or not num_val:
                    nb_skip += 1
                    continue

                db.session.add(AdresseImportee(rue=rue_val, numero=num_val))
                nb_ok += 1

            db.session.commit()
            flash(
                f"{nb_ok} adresses importées "
                f"(colonnes détectées : col {col_rue+1}=Rue, col {col_num+1}=Numéro). "
                f"{nb_skip} lignes ignorées.",
                "success"
            )
            return redirect(url_for("importer_fichier"))

        except Exception as exc:
            db.session.rollback()
            flash(f"Erreur lors de l'import : {exc}", "danger")

    nb_adresses = AdresseImportee.query.count()
    from sqlalchemy import func as sa_func
    rues = (
        db.session.query(AdresseImportee.rue, sa_func.count(AdresseImportee.id).label("nb"))
        .group_by(AdresseImportee.rue)
        .order_by(AdresseImportee.rue)
        .all()
    )
    return render_template("import.html", nb_adresses=nb_adresses, nb_rues=len(rues), rues=rues)


@app.route("/import/structure", methods=["POST"])
@login_required
def structure_fichier():
    """Affiche les premières lignes brutes du fichier pour diagnostiquer le format."""
    fichier = request.files.get("fichier")
    if not fichier:
        return "Aucun fichier", 400
    try:
        from openpyxl import load_workbook
        import tempfile, os as _os
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
        fichier.save(tmp.name)
        tmp.close()
        wb = load_workbook(tmp.name, data_only=True)
        _os.unlink(tmp.name)
        ws = wb.worksheets[0]

        html = """<html><head><meta charset="utf-8">
        <style>body{font-family:monospace;font-size:13px;padding:20px}
        table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        th{background:#eee}.row-num{color:#999;font-size:11px}.type{color:#07c;font-size:10px}</style>
        </head><body>
        <h3>Structure du fichier (15 premières lignes)</h3>
        <p>Chaque cellule montre : <strong>valeur</strong> <span style="color:#07c">type Python</span></p>
        <table><tr><th>#</th>"""

        first_row = next(ws.iter_rows(min_row=1, max_row=1, values_only=True), [])
        for j in range(len(first_row)):
            html += f"<th>Col {j+1}</th>"
        html += "</tr>"

        for i, row in enumerate(ws.iter_rows(min_row=1, max_row=15, values_only=True)):
            html += f"<tr><td class='row-num'>{i+1}</td>"
            for c in row:
                typ = type(c).__name__
                val = str(c)[:60] if c is not None else "(vide)"
                html += f"<td>{val}<br><span class='type'>{typ}</span></td>"
            html += "</tr>"

        html += "</table></body></html>"
        return html
    except Exception as e:
        return f"Erreur : {e}", 500


@app.route("/import/effacer", methods=["POST"])
@login_required
def effacer_adresses():
    AdresseImportee.query.delete()
    db.session.commit()
    flash("Toutes les adresses importées ont été supprimées.", "info")
    return redirect(url_for("importer_fichier"))


# ---------------------------------------------------------------------------
# Coach Fibre Elite
# ---------------------------------------------------------------------------

COACH_SYSTEM_PROMPT = (
    "Tu es Coach Elite, coach de vente porte-à-porte spécialisé fibre Orange. "
    "Tu entraînes Heikel à devenir top performer en vente PAP.\n\n"
    "OFFRES ORANGE:\n"
    "- Livebox Fibre (~35€/mois, entrée de gamme)\n"
    "- Livebox Up (~45€/mois, débit supérieur)\n"
    "- Livebox Max (~55€/mois, TV incluse, haut de gamme)\n"
    "- Série Spécial Lite Fibre (promo sans engagement)\n\n"
    "PIPELINE TERRAIN: Porte frappée → Ouverte → Causé → Entré → Signé\n\n"
    "BENCHMARKS TOP PERFORMER:\n"
    "- Taux ouverture: >70% | Taux causé: >50% | Taux entré: >30% | Taux signature: >15%\n\n"
    "OBJECTIONS COURANTES:\n"
    "- 'J'ai déjà un opérateur' → comparaison, avantages concrets Orange\n"
    "- 'Je vais réfléchir' → urgence, ancrage, offre limitée\n"
    "- 'C'est trop cher' → valeur perçue, prix mensuel vs quotidien\n"
    "- 'Je ne suis pas propriétaire' → sans engagement, démarches légères\n"
    "- 'Pas intéressé' → reformulation, besoin sous-jacent\n\n"
    "TECHNIQUES CLÉ:\n"
    "- Script accroche: 15 secondes max, sourire, prénom, bénéfice direct\n"
    "- Entrée domicile: 'Vous permettez, j'ai quelque chose à vous montrer...'\n"
    "- Closing: alternative positive, urgence réelle, engagement partiel\n\n"
    "En mode COACH: réponses courtes (max 150 mots), directes, phrases concrètes prêtes à dire.\n"
    "En mode ROLEPLAY: tu incarnes VRAIMENT le prospect. Tu ne sors JAMAIS du personnage."
)

ROLEPLAY_SCENARIOS = [
    {
        "id": "marie",
        "name": "Marie, 58 ans",
        "desc": "Retraitée méfiante — internet Bouygues très lent",
        "emoji": "👩‍🦳",
        "difficulty": "Moyen",
        "prompt": (
            "Tu es Marie, 58 ans, retraitée. Tu es méfiante des démarcheurs "
            "mais ton internet Bouygues est très lent depuis 6 mois, ça t'énerve. "
            "Tu ne dis pas non d'emblée mais tu résistes. "
            "Tu poses des questions sur la durée d'engagement et les frais cachés."
        ),
    },
    {
        "id": "mohammed",
        "name": "Mohammed, 35 ans",
        "desc": "Locataire — contrat Orange renouvelable bientôt",
        "emoji": "👨",
        "difficulty": "Facile",
        "prompt": (
            "Tu es Mohammed, 35 ans, locataire. Tu as déjà la fibre Orange "
            "mais ton contrat se renouvelle dans 2 mois. Tu es ouvert à négocier "
            "mais tu veux le meilleur prix. Tu compares avec ce que tu paies maintenant."
        ),
    },
    {
        "id": "christine",
        "name": "Christine, 45 ans",
        "desc": "Très pressée — mari qui décide tout",
        "emoji": "👩",
        "difficulty": "Difficile",
        "prompt": (
            "Tu es Christine, 45 ans. Tu es très pressée, tu n'as vraiment pas le temps. "
            "Ton mari gère toutes les décisions télécom à la maison. "
            "Tu cherches à te débarrasser poliment mais rapidement du commercial."
        ),
    },
    {
        "id": "robert",
        "name": "Robert, 70 ans",
        "desc": "Retraité seul — gros téléspectateur, peu à l'aise tech",
        "emoji": "👴",
        "difficulty": "Moyen",
        "prompt": (
            "Tu es Robert, 70 ans, retraité seul. Tu regardes beaucoup la TV. "
            "Tu n'es pas à l'aise avec la technologie. "
            "Si on parle des chaînes TV et que c'est expliqué simplement, tu peux être convaincu. "
            "Tu as peur des démarches administratives et des techniciens."
        ),
    },
    {
        "id": "fatima",
        "name": "Fatima, 30 ans",
        "desc": "Propriétaire satisfaite de SFR",
        "emoji": "👩‍💼",
        "difficulty": "Difficile",
        "prompt": (
            "Tu es Fatima, 30 ans, propriétaire. Tu es satisfaite de ta box SFR, "
            "tu n'as pas de problèmes particuliers. Tu es curieuse du prix "
            "mais tu n'as pas vraiment de raison de changer. "
            "Tu vas comparer point par point avec ton offre SFR actuelle."
        ),
    },
]


def _kpi_info(value, target):
    prog = min(round(value / target * 100), 100) if target else 0
    color = "#22c55e" if prog >= 80 else "#ff7900" if prog >= 50 else "#ef4444"
    return prog, color


@app.route("/coach-fibre")
@login_required
def coach_fibre():
    sessions = SessionProspection.query.all()
    total_portes = sum(s.total for s in sessions)
    total_ouvertes = sum(s.nb_ouvertes for s in sessions)
    total_causes = sum(s.nb_causes for s in sessions)
    total_entrees = sum(s.nb_entrees for s in sessions)
    total_signes = sum(s.nb_signes for s in sessions)

    def pct(n):
        return round(n / total_portes * 100) if total_portes else 0

    taux_ouverture = pct(total_ouvertes)
    taux_cause = pct(total_causes)
    taux_entree = pct(total_entrees)
    taux_signature = pct(total_signes)

    prog_o, color_o = _kpi_info(taux_ouverture, 70)
    prog_c, color_c = _kpi_info(taux_cause, 50)
    prog_e, color_e = _kpi_info(taux_entree, 30)
    prog_s, color_s = _kpi_info(taux_signature, 15)

    stats = {
        "total_portes": total_portes,
        "total_ouvertes": total_ouvertes,
        "total_causes": total_causes,
        "total_entrees": total_entrees,
        "total_signes": total_signes,
        "taux_ouverture": taux_ouverture,
        "taux_cause": taux_cause,
        "taux_entree": taux_entree,
        "taux_signature": taux_signature,
        "prog_ouverture": prog_o,
        "prog_cause": prog_c,
        "prog_entree": prog_e,
        "prog_signature": prog_s,
        "color_ouverture": color_o,
        "color_cause": color_c,
        "color_entree": color_e,
        "color_signature": color_s,
        "total_ventes": Vente.query.count(),
        "total_installes": Vente.query.filter_by(statut="installe").count(),
        "nb_sessions": len(sessions),
    }
    return render_template("coach_fibre.html", stats=stats, scenarios=ROLEPLAY_SCENARIOS)


@app.route("/coach-fibre/api/chat", methods=["POST"])
@login_required
def coach_chat():
    import json as _j

    data = request.get_json()
    messages = data.get("messages", [])
    mode = data.get("mode", "coach")
    scenario_id = data.get("scenario_id")

    if not messages:
        return jsonify({"error": "Aucun message"}), 400

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY non configuré"}), 500

    system = COACH_SYSTEM_PROMPT
    if mode == "roleplay" and scenario_id:
        scenario = next((s for s in ROLEPLAY_SCENARIOS if s["id"] == scenario_id), None)
        if scenario:
            system = (
                f"{COACH_SYSTEM_PROMPT}\n\n"
                f"MODE ROLEPLAY — Tu joues: {scenario['name']}\n"
                f"{scenario['prompt']}\n\n"
                "RÈGLES ABSOLUES: Tu ES ce prospect. Ne sors JAMAIS du personnage. "
                "Première réponse: accueille naturellement selon ton personnage. "
                "Sois réaliste, pose des questions, résiste naturellement."
            )

    try:
        import anthropic as _ant

        client = _ant.Anthropic(api_key=api_key)

        def generate():
            try:
                with client.messages.stream(
                    model="claude-sonnet-4-6",
                    max_tokens=512,
                    system=system,
                    messages=messages,
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {_j.dumps({'text': text})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as exc:
                yield f"data: {_j.dumps({'error': str(exc)})}\n\n"

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/coach-fibre/api/pareto", methods=["POST"])
@login_required
def coach_pareto():
    import json as _j

    data = request.get_json()
    stats = data.get("stats", {})

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY non configuré"}), 500

    prompt = (
        f"Voici les stats terrain de Heikel, commercial fibre Orange PAP:\n\n"
        f"- Portes frappées: {stats.get('total_portes', 0)}\n"
        f"- Portes ouvertes: {stats.get('total_ouvertes', 0)} "
        f"({stats.get('taux_ouverture', 0)}% | benchmark: >70%)\n"
        f"- Causé: {stats.get('total_causes', 0)} "
        f"({stats.get('taux_cause', 0)}% | benchmark: >50%)\n"
        f"- Entré: {stats.get('total_entrees', 0)} "
        f"({stats.get('taux_entree', 0)}% | benchmark: >30%)\n"
        f"- Signé: {stats.get('total_signes', 0)} "
        f"({stats.get('taux_signature', 0)}% | benchmark: >15%)\n"
        f"- Sessions terrain: {stats.get('nb_sessions', 0)}\n"
        f"- Ventes totales: {stats.get('total_ventes', 0)}\n\n"
        "Fais une analyse Pareto précise:\n"
        "1. Identifie les 20% d'actions qui vont générer 80% des résultats\n"
        "2. Classe les axes d'amélioration par impact décroissant\n"
        "3. Pour chaque axe: UNE action concrète à mettre en place dès demain matin\n"
        "4. Termine par UN objectif chiffré pour la semaine prochaine\n\n"
        "Format: structuré, chiffré, actionnable. Maximum 300 mots."
    )

    try:
        import anthropic as _ant

        client = _ant.Anthropic(api_key=api_key)

        def generate():
            try:
                with client.messages.stream(
                    model="claude-sonnet-4-6",
                    max_tokens=1024,
                    system=COACH_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": prompt}],
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {_j.dumps({'text': text})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as exc:
                yield f"data: {_j.dumps({'error': str(exc)})}\n\n"

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Démarrage
# ---------------------------------------------------------------------------

def creer_scheduler():
    scheduler = BackgroundScheduler()
    # Tous les jours à 9h00 : envoyer les rappels J-1
    scheduler.add_job(
        envoyer_rappels_du_jour,
        trigger="cron",
        hour=9,
        minute=0,
        id="rappels_sms",
        replace_existing=True,
    )
    scheduler.start()
    return scheduler


# Créer les tables au démarrage (gunicorn + flask run)
with app.app_context():
    db.create_all()
    # Migration: ajouter adresse_id à portes si absent (upgrade progressif)
    from sqlalchemy import text, inspect as sa_inspect
    _insp = sa_inspect(db.engine)
    _cols = [c["name"] for c in _insp.get_columns("portes")]
    if "adresse_id" not in _cols:
        with db.engine.connect() as _conn:
            _conn.execute(text("ALTER TABLE portes ADD COLUMN adresse_id INTEGER"))
            _conn.commit()

scheduler = creer_scheduler()

if __name__ == "__main__":
    try:
        app.run(debug=False, host="0.0.0.0", port=5000)
    finally:
        scheduler.shutdown()
