import csv
import io
import os
from datetime import datetime, date, timedelta

from flask import Flask, render_template, request, redirect, url_for, flash, Response
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///ventes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


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
    "Fibre optique",
    "ADSL / VDSL",
    "Open (Fibre + Mobile)",
    "Open (ADSL + Mobile)",
    "Mobile seul",
    "Livebox",
    "Autre",
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
# Routes : Dashboard
# ---------------------------------------------------------------------------

@app.route("/")
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
            "Produit", "Date RDV", "Date signature", "Statut", "SMS envoyé", "Notes",
        ])
        for v in ventes:
            writer.writerow([
                v.id, v.prenom, v.nom, v.telephone, v.adresse,
                v.produit,
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
def modifier_vente(vente_id):
    vente = Vente.query.get_or_404(vente_id)

    if request.method == "POST":
        try:
            vente.prenom = request.form["prenom"].strip().capitalize()
            vente.nom = request.form["nom"].strip().upper()
            vente.telephone = request.form["telephone"].strip()
            vente.adresse = request.form["adresse"].strip()
            vente.produit = request.form["produit"]
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
def lancer_rappels():
    envoyer_rappels_du_jour()
    flash("Rappels SMS du lendemain traités.", "info")
    return redirect(url_for("dashboard"))


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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    scheduler = creer_scheduler()
    try:
        app.run(debug=False, host="0.0.0.0", port=5000)
    finally:
        scheduler.shutdown()
