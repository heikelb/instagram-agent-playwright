import asyncio
import csv
import io
import os
import re
from datetime import datetime, date, timedelta

import hashlib
from flask import Flask, render_template, request, redirect, url_for, flash, Response, jsonify, session, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
# Chemin DB : utilise le volume Railway si configuré, sinon local
_db_path = os.environ.get("DATABASE_URL", "sqlite:////data/ventes.db")
app.config["SQLALCHEMY_DATABASE_URI"] = _db_path
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
    ville = db.Column(db.String(100), nullable=True, index=True)
    imported_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def adresse_complete(self):
        parts = [self.numero, self.rue]
        if self.complement:
            parts.append(self.complement)
        return " ".join(parts)


# ---------------------------------------------------------------------------
# Modèle Rappels client
# ---------------------------------------------------------------------------

MOMENTS_RAPPEL = {
    "matin":  "🌅 Matin",
    "pause":  "☀️ Pause",
    "soir":   "🌙 Soir",
}


class Rappel(db.Model):
    __tablename__ = "rappels"

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20), nullable=True)
    motif = db.Column(db.String(200), nullable=False)
    moment = db.Column(db.String(20), nullable=False, default="pause")
    done = db.Column(db.Boolean, default=False)
    vente_id = db.Column(db.Integer, db.ForeignKey("ventes.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


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


def envoyer_sms_rappels_clients():
    """Tâche planifiée : envoie au commercial ses rappels clients en attente."""
    with app.app_context():
        mon_tel = os.environ.get("MON_TELEPHONE", "")
        if not mon_tel:
            return
        rappels = Rappel.query.filter_by(done=False).order_by(Rappel.created_at).all()
        if not rappels:
            return
        lignes = [f"📋 {len(rappels)} rappel(s) client en attente :"]
        for r in rappels:
            tel_part = f" ({r.telephone})" if r.telephone else ""
            emoji = {"matin": "🌅", "pause": "☀️", "soir": "🌙"}.get(r.moment, "")
            lignes.append(f"{emoji} {r.nom}{tel_part} : {r.motif}")
        envoyer_sms(mon_tel, "\n".join(lignes))


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
# Context processor — badges nav
# ---------------------------------------------------------------------------

@app.context_processor
def inject_nav_badges():
    if current_user.is_authenticated:
        nb_rappels = Rappel.query.filter_by(done=False).count()
        nb_repasser = (
            Porte.query
            .filter_by(resultat="absent")
            .filter(Porte.adresse_id.isnot(None))
            .count()
        )
        return dict(nb_rappels=nb_rappels, nb_repasser=nb_repasser)
    return dict(nb_rappels=0, nb_repasser=0)


# ---------------------------------------------------------------------------
# Routes : Récap semaine
# ---------------------------------------------------------------------------

@app.route("/recap")
@app.route("/recap/<int:offset_semaines>")
@login_required
def recap_semaine(offset_semaines=0):
    aujourd_hui = date.today()
    lundi = aujourd_hui - timedelta(days=aujourd_hui.weekday()) + timedelta(weeks=offset_semaines)
    dimanche = lundi + timedelta(days=6)

    ventes_semaine = Vente.query.filter(
        Vente.date_signature >= lundi,
        Vente.date_signature <= dimanche,
    ).order_by(Vente.date_signature.asc(), Vente.created_at.asc()).all()

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
            "﻿" + output.getvalue(),
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


@app.route("/carte")
@login_required
def carte():
    ventes = Vente.query.order_by(Vente.date_rdv.desc()).all()
    ventes_data = [
        {
            "id": v.id,
            "nom": f"{v.prenom} {v.nom}",
            "adresse": v.adresse,
            "produit": v.produit,
            "statut": v.statut,
            "date_rdv": v.date_rdv.strftime("%d/%m/%Y"),
        }
        for v in ventes if v.adresse
    ]
    return render_template("carte.html", ventes=ventes_data)


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
# Prompt Claude Vision (partagé entre scan photo et suivi URL)
# ---------------------------------------------------------------------------

_PROMPT_SCAN = (
    "Tu es un assistant pour un commercial Orange en porte-à-porte.\n"
    "Extrait les informations client de ce document "
    "(bon de commande, contrat, écran CRM Orange, suivi de commande, fiche client...).\n\n"
    "Retourne UNIQUEMENT un objet JSON valide avec ces champs "
    "(null si non trouvé) :\n"
    "{\n"
    '  "prenom": "...",\n'
    '  "nom": "...",\n'
    '  "telephone": "...",\n'
    '  "adresse": "...",\n'
    '  "produit": "...",\n'
    '  "reference": "...",\n'
    '  "date_rdv": "YYYY-MM-DDTHH:MM",\n'
    '  "statut": "..."\n'
    "}\n\n"
    "Règles :\n"
    "- nom/prenom : sur l'écran CRM Orange le nom complet est souvent dans la section 'client' "
    "(ex: 'Blanchet Chantale' → prenom='Chantale', nom='Blanchet').\n"
    "- telephone : prendre le numéro mobile (07/06) en priorité. "
    "Convertir '07 83 14 00 32' → '+33783140032'.\n"
    "- produit : choisir le plus proche parmi : "
    "'En option', 'Livebox Fibre', 'Livebox Up', 'Livebox Max', 'Série Spécial Lite Fibre'. "
    "'Livebox Classic Fibre', 'Livebox Fibre +' → 'Livebox Fibre'. "
    "'Livebox Up Fibre' → 'Livebox Up'.\n"
    "- reference : prendre EN PRIORITÉ 'référence interne'. Sinon 'référence commande'. "
    "Ignorer 'code d'accès Suivi Cde'.\n"
    "- date_rdv : cherche dans cet ordre :\n"
    "  1. 'Rdv d'installation' ou 'RDV installation' (ignorer si marqué 'supprimé' ou 'annulé')\n"
    "  2. 'Date de livraison initiale', 'date de livraison', 'date d'activation'\n"
    "  3. 'créneau', 'intervention prévue', 'date de pose'\n"
    "  Formats français à convertir en YYYY-MM-DDTHH:MM :\n"
    "  'le jeudi 25 juin' → déduire l'année depuis les autres dates du document → '2026-06-25T08:00'\n"
    "  '25/06' ou '25 juin' sans année → utiliser l'année visible ailleurs dans le document\n"
    "  Plage horaire '8h-12h' → prendre l'heure de début → T08:00\n"
    "  Si pas d'heure précise → T08:00 par défaut.\n"
    "- statut : analyser l'état de la commande et retourner EXACTEMENT l'une de ces valeurs :\n"
    "  'annule' si tu vois 'annulée', 'annulé', 'résiliée', 'résiliation', 'annulation'\n"
    "  'installe' si tu vois 'installée', 'installé', 'activée', 'activé', 'livrée', 'en service'\n"
    "  'confirme' si tu vois 'confirmée', 'confirmé', 'validée', 'en cours'\n"
    "  'no_show' si tu vois 'no show', 'absent', 'client absent'\n"
    "  'en_attente' dans tous les autres cas\n"
    "Retourne UNIQUEMENT le JSON brut, sans balises markdown."
)


async def _playwright_screenshot(url: str, login: str, password: str) -> bytes:
    """Navigue vers l'URL Orange (avec login SSO si besoin) et retourne un screenshot."""
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
                  "--disable-setuid-sandbox", "--no-zygote"],
        )
        ctx = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page = await ctx.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(2000)

            for _ in range(3):
                cur = page.url
                if not any(kw in cur for kw in
                           ["login", "auth", "sso", "signin", "prelogin", "portail", "rso."]):
                    break

                for sel in ["#username", "#login", "#email",
                            'input[name="username"]', 'input[name="login"]',
                            'input[type="email"]:visible', 'input[type="text"]:visible']:
                    try:
                        loc = page.locator(sel).first
                        if await loc.is_visible():
                            await loc.fill(login)
                            break
                    except Exception:
                        continue

                for sel in ["#password", 'input[name="password"]',
                            'input[type="password"]:visible']:
                    try:
                        loc = page.locator(sel).first
                        if await loc.is_visible():
                            await loc.fill(password)
                            break
                    except Exception:
                        continue

                for sel in ['button[type="submit"]', 'input[type="submit"]',
                            "#bouton-valider", ".btn-connexion", ".btn-primary"]:
                    try:
                        loc = page.locator(sel).first
                        if await loc.is_visible():
                            await loc.click()
                            break
                    except Exception:
                        continue

                await page.wait_for_load_state("domcontentloaded", timeout=15000)
                await page.wait_for_timeout(2000)

            screenshot = await page.screenshot(
                full_page=False, type="jpeg", quality=88
            )
            return screenshot
        finally:
            await browser.close()


# ---------------------------------------------------------------------------
# Route : Scan bon de commande (Claude Vision)
# ---------------------------------------------------------------------------

@app.route("/scan-affiche", methods=["POST"])
@login_required
def scan_affiche():
    import base64, json as _json

    photo = request.files.get("photo")
    if not photo:
        return jsonify({"error": "Aucune photo reçue"}), 400
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY non configuré."}), 500
    img_bytes = photo.read()
    if len(img_bytes) > 10 * 1024 * 1024:
        return jsonify({"error": "Image trop lourde (max 10 Mo)."}), 400
    img_b64 = base64.standard_b64encode(img_bytes).decode("utf-8")
    media_type = photo.content_type if (photo.content_type or "").startswith("image/") else "image/jpeg"
    return _claude_vision(img_b64, media_type, api_key)


def _claude_vision(img_b64: str, media_type: str, api_key: str):
    import json as _json, anthropic
    try:
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64",
                                              "media_type": media_type, "data": img_b64}},
                {"type": "text", "text": _PROMPT_SCAN},
            ]}],
        )
        txt = msg.content[0].text.strip()
        m = re.search(r'\{[\s\S]*\}', txt)
        txt = m.group() if m else txt
        return jsonify(_json.loads(txt))
    except _json.JSONDecodeError as e:
        return jsonify({"error": f"Impossible de lire la réponse IA : {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/track-commande", methods=["POST"])
@login_required
def track_commande():
    import base64

    url = request.form.get("url", "").strip()
    if not url:
        return jsonify({"error": "URL manquante."}), 400
    orange_login = os.environ.get("ORANGE_LOGIN", "")
    orange_password = os.environ.get("ORANGE_PASSWORD", "")
    if not orange_login or not orange_password:
        return jsonify({"error":
            "ORANGE_LOGIN et ORANGE_PASSWORD doivent être configurés dans les variables Railway."}), 500
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY non configuré."}), 500
    try:
        loop = asyncio.new_event_loop()
        screenshot = loop.run_until_complete(
            _playwright_screenshot(url, orange_login, orange_password)
        )
        loop.close()
        img_b64 = base64.standard_b64encode(screenshot).decode("utf-8")
        return _claude_vision(img_b64, "image/jpeg", api_key)
    except Exception as e:
        return jsonify({"error": f"Erreur Playwright : {e}"}), 500


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
            "ville": a.ville or "",
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
                if c is None:
                    return ""
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

            HEADER_KW = {"rue", "adresse", "voie", "libelle", "libellé", "street",
                         "num", "n°", "no", "porte", "portes", "numero", "numéro", "code",
                         "nom de voie", "type voie", "type de voie", "libellé voie",
                         "nom", "ville", "profil", "dep", "immeuble", "fermeture"}
            first_low = all_rows[0][0].lower().strip() if all_rows[0] else ""
            has_header = first_low in HEADER_KW

            header_row = all_rows[0] if has_header else None
            data_rows  = all_rows[1:] if has_header else all_rows

            if not data_rows:
                flash("Aucune donnée trouvée dans le fichier.", "warning")
                return redirect(url_for("importer_fichier"))

            PREFIXES_RUE = (
                "rue ", "avenue ", "av ", "av. ", "boulevard ", "bd ", "bd.",
                "chemin ", "impasse ", "allée ", "allee ", "passage ", "place ",
                "route ", "voie ", "résidence ", "residence ", "cité ", "cite ",
                "square ", "villa ", "domaine ", "lot ", "lieu-dit",
            )
            sample = data_rows[:50]
            scores_rue = [0] * n_cols
            scores_num = [0] * n_cols
            scores_ville = [0] * n_cols

            col_unique_vals = [set() for _ in range(n_cols)]
            col_zero_count  = [0] * n_cols

            for row in sample:
                for j in range(min(n_cols, len(row))):
                    v = row[j]
                    if not v:
                        continue
                    vl = v.lower()

                    if any(vl.startswith(p) for p in PREFIXES_RUE):
                        scores_rue[j] += 4
                    elif " " in v and not v[0].isdigit() and "/" not in v and len(v) > 5:
                        scores_rue[j] += 1

                    if "/" not in v and re.match(r'^\d{1,4}\w{0,3}$', v):
                        scores_num[j] += 4
                    elif re.match(r'^\d+$', v) and len(v) <= 4:
                        scores_num[j] += 2

                    if re.match(r'^[A-Za-zÀ-ÿ\s\-\']+$', v) and 2 <= len(v) <= 35 and "/" not in v:
                        if not any(vl.startswith(p) for p in PREFIXES_RUE):
                            scores_ville[j] += 2

                    if v == "0":
                        col_zero_count[j] += 1
                    else:
                        col_unique_vals[j].add(v)

            for j in range(n_cols):
                n_unique = len(col_unique_vals[j])
                n_zero   = col_zero_count[j]
                total    = n_unique + n_zero
                if total == 0:
                    continue
                if total > 3 and n_zero / total > 0.5:
                    scores_num[j] = 0
                if n_unique >= 3:
                    scores_num[j] += n_unique * 2

            col_rue = col_num = col_ville = None
            if has_header and header_row:
                for j, c in enumerate(header_row):
                    cl = c.lower()
                    if col_ville is None and any(w in cl for w in ("ville", "commune", "localit", "city")):
                        col_ville = j
                    if col_rue is None and "adresse" in cl and "mail" not in cl and "email" not in cl:
                        col_rue = j
                    if col_num is None and re.search(r'num[eé]ro\s*rue|n°\s*rue|num\s*rue', cl):
                        col_num = j
                for j, c in enumerate(header_row):
                    cl = c.lower()
                    if col_rue is None and any(w in cl for w in ("rue", "voie", "libelle", "libellé")):
                        col_rue = j
                    if col_num is None and any(w in cl for w in ("num", "n°", "numéro", "numero")):
                        col_num = j
                for j, c in enumerate(header_row):
                    cl = c.lower()
                    if col_rue is None and "nom" in cl:
                        col_rue = j

            if col_rue is None:
                col_rue = max(range(n_cols), key=lambda j: scores_rue[j])
            if col_num is None:
                candidates = [j for j in range(n_cols) if j != col_rue]
                col_num = max(candidates, key=lambda j: scores_num[j]) if candidates else (1 if col_rue == 0 else 0)
            if col_ville is None:
                candidates_v = [j for j in range(n_cols) if j not in (col_rue, col_num)]
                if candidates_v:
                    best_v = max(candidates_v, key=lambda j: scores_ville[j])
                    if scores_ville[best_v] >= 4:
                        col_ville = best_v

            nb_ok = nb_skip = 0
            for cells in data_rows:
                rue_val = cells[col_rue] if col_rue < len(cells) else ""
                num_val = cells[col_num] if col_num < len(cells) else ""

                if not num_val and rue_val:
                    m = re.match(r'^(\d+\w*)\s+(.+)$', rue_val)
                    if m:
                        num_val, rue_val = m.group(1), m.group(2)

                if not rue_val or not num_val:
                    nb_skip += 1
                    continue

                ville_val = cells[col_ville] if col_ville is not None and col_ville < len(cells) else None
                ville_val = ville_val or None

                db.session.add(AdresseImportee(rue=rue_val, numero=num_val, ville=ville_val))
                nb_ok += 1

            db.session.commit()
            col_info = f"col {col_rue+1}=Rue, col {col_num+1}=Numéro"
            if col_ville is not None:
                col_info += f", col {col_ville+1}=Ville"
            flash(
                f"{nb_ok} adresses importées ({col_info}). {nb_skip} lignes ignorées.",
                "success"
            )
            return redirect(url_for("importer_fichier"))

        except Exception as exc:
            db.session.rollback()
            flash(f"Erreur lors de l'import : {exc}", "danger")

    nb_adresses = AdresseImportee.query.count()
    from sqlalchemy import func as sa_func
    rues = (
        db.session.query(
            AdresseImportee.rue,
            AdresseImportee.ville,
            sa_func.count(AdresseImportee.id).label("nb")
        )
        .group_by(AdresseImportee.rue, AdresseImportee.ville)
        .order_by(AdresseImportee.ville, AdresseImportee.rue)
        .all()
    )
    villes = sorted(set(r.ville for r in rues if r.ville))
    return render_template(
        "import.html",
        nb_adresses=nb_adresses,
        nb_rues=len(rues),
        nb_villes=len(villes),
        rues=rues,
    )


@app.route("/import/structure", methods=["POST"])
@login_required
def structure_fichier():
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


# ---------------------------------------------------------------------------
# Routes : À repasser (absents du terrain)
# ---------------------------------------------------------------------------

@app.route("/repasser")
@login_required
def repasser():
    from collections import defaultdict

    rows_addr = (
        db.session.query(Porte, AdresseImportee, SessionProspection)
        .join(AdresseImportee, Porte.adresse_id == AdresseImportee.id)
        .join(SessionProspection, Porte.session_id == SessionProspection.id)
        .filter(Porte.resultat == "absent")
        .order_by(SessionProspection.date.desc(), AdresseImportee.rue, AdresseImportee.numero)
        .all()
    )
    rows_libre = (
        db.session.query(Porte, SessionProspection)
        .join(SessionProspection, Porte.session_id == SessionProspection.id)
        .filter(Porte.resultat == "absent", Porte.adresse_id == None)
        .order_by(SessionProspection.date.desc())
        .all()
    )
    JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    MOIS = ["", "jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sep.", "oct.", "nov.", "déc."]
    grouped = defaultdict(lambda: {"adresses": [], "libres": defaultdict(int)})
    for porte, adresse, sess in rows_addr:
        grouped[sess.date]["adresses"].append((porte, adresse, sess))
    for porte, sess in rows_libre:
        grouped[sess.date]["libres"][sess.nom] += 1
    groupes = []
    for d in sorted(grouped.keys(), reverse=True):
        label = f"{JOURS[d.weekday()]} {d.day} {MOIS[d.month]} {d.year}"
        groupes.append((label, grouped[d]["adresses"], dict(grouped[d]["libres"])))
    nb_total = len(rows_addr) + len(rows_libre)
    return render_template("repasser.html", groupes=groupes, nb_total=nb_total)


# ---------------------------------------------------------------------------
# Routes : Rappels client
# ---------------------------------------------------------------------------

@app.route("/rappels")
@login_required
def liste_rappels():
    rappels = Rappel.query.filter_by(done=False).order_by(Rappel.created_at).all()
    faits = (
        Rappel.query.filter_by(done=True)
        .order_by(Rappel.created_at.desc())
        .limit(10).all()
    )
    return render_template("rappels.html", rappels=rappels, faits=faits,
                           moments=MOMENTS_RAPPEL)


@app.route("/rappels/nouveau", methods=["POST"])
@login_required
def nouveau_rappel():
    nom = request.form.get("nom", "").strip()
    telephone = request.form.get("telephone", "").strip() or None
    motif = request.form.get("motif", "").strip()
    moment = request.form.get("moment", "pause")
    if not nom or not motif:
        flash("Nom et motif obligatoires.", "warning")
        return redirect(url_for("liste_rappels"))
    db.session.add(Rappel(nom=nom, telephone=telephone, motif=motif, moment=moment))
    db.session.commit()
    flash(f"Rappel ajouté pour {nom}.", "success")
    return redirect(url_for("liste_rappels"))


@app.route("/rappels/<int:rappel_id>/done", methods=["POST"])
@login_required
def rappel_done(rappel_id):
    r = Rappel.query.get_or_404(rappel_id)
    r.done = True
    db.session.commit()
    return redirect(url_for("liste_rappels"))


@app.route("/rappels/<int:rappel_id>/supprimer", methods=["POST"])
@login_required
def rappel_supprimer(rappel_id):
    r = Rappel.query.get_or_404(rappel_id)
    db.session.delete(r)
    db.session.commit()
    return redirect(url_for("liste_rappels"))


@app.route("/import/effacer", methods=["POST"])
@login_required
def effacer_adresses():
    AdresseImportee.query.delete()
    db.session.commit()
    flash("Toutes les adresses importées ont été supprimées.", "info")
    return redirect(url_for("importer_fichier"))


# ---------------------------------------------------------------------------
# Backup / Restore base de données
# ---------------------------------------------------------------------------

@app.route("/backup-db")
@login_required
def backup_db():
    import re as _re
    db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    m = _re.match(r"sqlite:///+(.*)", db_uri)
    if not m:
        flash("Backup non disponible (base non SQLite).", "danger")
        return redirect(url_for("dashboard"))
    db_file = "/" + m.group(1).lstrip("/")
    if not os.path.exists(db_file):
        flash(f"Fichier base introuvable : {db_file}", "danger")
        return redirect(url_for("dashboard"))
    return send_file(
        db_file,
        as_attachment=True,
        download_name="ventes_backup.db",
        mimetype="application/octet-stream",
    )


@app.route("/restore-db", methods=["GET", "POST"])
@login_required
def restore_db():
    import re as _re, shutil as _shutil, tempfile as _tempfile
    if request.method == "POST":
        f = request.files.get("fichier_db")
        if not f or not f.filename.endswith(".db"):
            flash("Fichier .db requis.", "danger")
            return redirect(url_for("restore_db"))
        db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
        m = _re.match(r"sqlite:///+(.*)", db_uri)
        if not m:
            flash("Restore non disponible (base non SQLite).", "danger")
            return redirect(url_for("dashboard"))
        db_file = "/" + m.group(1).lstrip("/")
        if os.path.exists(db_file):
            _shutil.copy2(db_file, db_file + ".bak")
        tmp = _tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        f.save(tmp.name)
        tmp.close()
        _shutil.move(tmp.name, db_file)
        flash("Base restaurée. Redémarre le service Railway pour recharger les données.", "success")
        return redirect(url_for("dashboard"))
    return render_template("restore_db.html")


# ---------------------------------------------------------------------------
# Démarrage
# ---------------------------------------------------------------------------

def creer_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        envoyer_rappels_du_jour,
        trigger="cron", hour=9, minute=0,
        id="rappels_sms", replace_existing=True,
    )
    scheduler.add_job(
        envoyer_sms_rappels_clients,
        trigger="cron", hour=12, minute=30,
        id="sms_rappels_pause", replace_existing=True,
    )
    scheduler.add_job(
        envoyer_sms_rappels_clients,
        trigger="cron", hour=19, minute=0,
        id="sms_rappels_soir", replace_existing=True,
    )
    scheduler.start()
    return scheduler


with app.app_context():
    db.create_all()
    from sqlalchemy import text, inspect as sa_inspect
    _insp = sa_inspect(db.engine)
    _cols = [c["name"] for c in _insp.get_columns("portes")]
    if "adresse_id" not in _cols:
        with db.engine.connect() as _conn:
            _conn.execute(text("ALTER TABLE portes ADD COLUMN adresse_id INTEGER"))
            _conn.commit()
    _cols_ai = [c["name"] for c in _insp.get_columns("adresses_importees")]
    if "ville" not in _cols_ai:
        with db.engine.connect() as _conn:
            _conn.execute(text("ALTER TABLE adresses_importees ADD COLUMN ville VARCHAR(100)"))
            _conn.commit()

scheduler = creer_scheduler()

if __name__ == "__main__":
    try:
        app.run(debug=False, host="0.0.0.0", port=5000)
    finally:
        scheduler.shutdown()
