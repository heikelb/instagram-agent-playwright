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
# Entraîneur IA — constantes & modèles
# ---------------------------------------------------------------------------

MODULES_ENTRAINEMENT = {
    "adn_mental": {
        "label": "🧠 ADN Mental",
        "description": "Croyances limitatives, résilience face au refus",
        "color": "#6f42c1",
        "skills": [
            "Absence de croyances limitatives — rester câblé sur les faits",
            "Chaque refus est une étape vers le oui suivant",
            "Capacité à rebondir sans prendre les refus personnellement",
        ],
    },
    "competences_terrain": {
        "label": "🎯 Compétences Terrain",
        "description": "Première impression, questions ouvertes, écoute active",
        "color": "#0d6efd",
        "skills": [
            "Langage corporel — posture, contact visuel, confiance",
            "Questions ouvertes pour sceller l'intérêt rapidement",
            "Transformer une objection en discussion sur la valeur",
            "Lire les signaux non verbaux pour ajuster en temps réel",
        ],
    },
    "organisation": {
        "label": "⚙️ Organisation",
        "description": "Gestion du temps, itinéraire, loi des nombres",
        "color": "#198754",
        "skills": [
            "Organiser ses visites et optimiser chaque déplacement",
            "Anticiper et planifier pour maximiser le volume",
            "Loi des nombres : plus de portes = plus de chances",
        ],
    },
    "relation_client": {
        "label": "🤝 Relation Client",
        "description": "Post-signature, fidélisation, analyse des métriques",
        "color": "#fd7e14",
        "skills": [
            "Temps post-signature pour éviter les remords et annulations",
            "Curiosité permanente et amélioration continue",
            "Analyser taux de conversion et taux d'annulation",
        ],
    },
}

TYPES_CLIENT = {
    "mefiant": {
        "label": "😤 Méfiant",
        "description": "Hostile, sur la défensive, ne fait pas confiance aux démarcheurs",
    },
    "curieux": {
        "label": "🤔 Curieux",
        "description": "Intéressé mais pose beaucoup de questions, veut tout comprendre",
    },
    "presse": {
        "label": "⏰ Pressé",
        "description": "N'a pas le temps, coupe court, veut que ça aille vite",
    },
    "interesse": {
        "label": "😊 Intéressé",
        "description": "Ouvert et réceptif, mais a besoin d'être guidé vers la décision",
    },
    "agressif": {
        "label": "😠 Agressif",
        "description": "Réactif, fâché dès le départ, claque la porte facilement",
    },
    "indecis": {
        "label": "🤷 Indécis",
        "description": "Hésite, compare, reporte la décision, a besoin d'être rassuré",
    },
}

MODES_ENTRAINEMENT = {
    "client": "Je joue le client",
    "entraineur": "Je t'entraîne et te coache",
    "les_deux": "Simulation complète + feedback",
    "debriefing": "Debriefing d'une vraie visite",
}

_METHODO_MARVESTING = """
=== MÉTHODOLOGIE COMPLÈTE VENTE PAP ORANGE FIBRE (MARVESTING) ===

PROFIL VENDEUR : Heikel — PAP fibre Orange, sous-traitant, zones Jura/Bourgogne/Côte-d'Or.
Produits : Livebox Classic (commission 100€), Livebox Up (commission 139€ + prime 20€).
Force : closing une fois en maison (~2/3). Faiblesse : taux d'ouverture (~20%) et pitch trop tôt avant verbalisation du problème par le prospect.

--- ÉTAPE 1 — ACCROCHE (à la porte) ---
Objectif : confiance + sympathie, rentrer chez le prospect, identifier le décisionnaire.
- Les 10 premières secondes font la différence. Apparence soignée. Sourire.
- Rentrer chez le client = vente conclue à 50%.
- Ne JAMAIS s'excuser de déranger. Frapper de manière dynamique. Montrer le badge.
Script : "Bonjour Mr/Mme [NOM], je suis mandaté par Orange pour vérifier (comme pour vos voisins) l'état de votre installation Fibre. Vous permettez !"
Geste clé : montrer de la main l'intérieur après le script. Ne pas attendre une invitation verbale.

Objections ACCROCHE :
- Client dit OUI : "Parfait, le but de mon passage c'est une simple vérification pour voir si cette nouvelle technologie fonctionne de manière optimale dans votre logement."
- Client dit NON : "Nous avons reçu plusieurs remontées dans votre zone concernant des problèmes d'installation/raccordement, de débit faible sur le réseau fibre optique."
Dans les 2 cas : "Je suis donc là aujourd'hui pour voir si vous êtes concernés par mon passage et si oui, voir quelles solutions je peux vous apporter."

Objections PASSAGE DE PORTE :
- Réticent : "Mr/Mme j'ai besoin d'établir un diagnostic pour vérifier si votre réseau fibre optique fonctionne bien, pour cela j'ai besoin d'avoir accès à vos équipements internet et à votre prise optique."
- Très réticent : "Nous avons reçu plusieurs remontées dans votre zone concernant des problèmes d'installation/raccordement. Mr/Mme comprenez, c'est un déploiement de nouvelle technologie nationale, si elle ne fonctionne pas correctement c'est très problématique parce que l'ancienne technologie l'ADSL est vouée à disparaître."
Enchaîner : "Pour pouvoir vérifier, j'aurais besoin d'accéder à vos équipements et à votre prise optique sur le mur."

--- ÉTAPE 2 — RAPPEL DE L'OBJET DE LA VISITE (une fois rentré) ---
Script : "Avant tout, je tiens à vous remercier de me recevoir chez vous. Comme je vous l'ai dit, je suis [prénom, nom] et je suis mandaté par Orange (ressortir le badge) pour vérifier l'installation de votre prise."
Diriger vers la prise fibre (FFTB, FFTH, DSL). Obtenir accusé-réception : "Est-ce que le but de ma visite est bien clair ? Pour vous ?" → Attendre le OUI.

--- ÉTAPE 3 — MISE EN AMBIANCE ---
Apparence pro. Approche amicale. Écoute active. Gestion objections au fil de l'eau.

--- ÉTAPE 4 — SE PLACER CHEZ LE PROSPECT ---
Face à la porte, prospect en face. Visibilité complète. Obtenir un coin de table.
Activer la RÈGLE DES OUI dès maintenant — questions ouvertes enchaînées pour habituer à dire oui.

--- ÉTAPE 5 — LA DÉCOUVERTE (étape la plus importante) ---
RÈGLES ABSOLUES :
- Uniquement des questions. ZÉRO pitch produit.
- Ne JAMAIS donner un prix pendant la découverte.
- Questions ouvertes uniquement. Éviter les "non" à tout prix.
- Continuer jusqu'à trouver le levier de vente.
- Tout noter avec intérêt visible. Principe 20/80.

Structure FDV :
Accroche : "Bonjour, j'interviens suite à la mise à jour du réseau Internet. Est-ce que vous utilisez Internet ?"
TV : combien de TV, comment reliées, streaming (Netflix, Amazon, Disney+...)
Fixe+mobile : portable ou fixe, appels étrangers, mobiles en pack, Data/Go, forfait
Internet : depuis combien de temps, pro, ordi/tablette, connexions simultanées, surface, budget
Leviers : problèmes TV/connexion, test de débit, fin d'engagement, bascule tarifaire

Questions terrain clés :
"Depuis votre raccordement à la fibre, avez-vous vu une différence sur votre utilisation au quotidien ?"
"Rencontrez-vous parfois des temps de chargement trop longs ?"
"Sur votre télévision, avez-vous parfois l'image qui se fige ou pixelise ?"
"Vous m'avez dit que vous faisiez régulièrement du télétravail ?"
"Si vous aviez la possibilité d'avoir accès à un 2ème décodeur, ce serait une bonne chose pour vous ?"

--- ÉTAPE 6 — REFORMULATION ET TRANSITION (pré-closing) ---
Objectif : verrouiller AVANT de présenter le prix. OUI ferme inconditionnel.
Exemple : "Si demain vous aviez la possibilité d'avoir un débit 20/50/100 fois supérieur, des chaînes en full HD, image 4K et un SAV disponible 24H/24H sans changer votre quotidien et tout ça pour le même prix, c'est quelque chose d'intéressant pour vous ?"
Si pas de OUI ferme → retourner en découverte. Toujours pas → passer au prospect suivant.

--- ÉTAPE 7 — LA RÈGLE DES OUI ---
Hypnose Ericksonienne — théorie de l'engagement. Enchaîner micro-validations tout au long.
Le client a l'impression d'être l'auteur de sa propre décision.

--- ÉTAPE 8 — ARGUMENTATION (méthode CAB + SONCASE) ---
CAB = Caractéristiques → Avantages → Bénéfices/Preuves. Commencer par les meilleurs arguments.
Signaux d'intérêt : se tient droit, pose des questions précises, se projette, demande le prix → excellent signal.

SONCASE :
S-Sécurité : "je travaille de chez moi" → fiabilité, garantie, support 24/7
O-Orgueil : "monsieur je-sais-tout" → ego, standing, haut de gamme, unique
N-Nouveauté : gamers, tech-friendly → innovation, exclusivité, pointe technologique
C-Confort : "c'est compliqué de changer" → simplicité, guide, assistance, pratique
A-Argent : "Free c'est moins cher" → ROI, données chiffrées, économique, compétitif
S-Sympathie : client accueillant → relation humaine, confiance, valeurs partagées
E-Environnement : sensible écologie → pérenne, peu énergivore, responsable

--- ÉTAPE 9 — LE CLOSING ---
RÈGLE D'OR : une fois le tarif annoncé, SE TAIRE. Le premier qui parle, perd.
- Résumer les AVANTAGES avant d'énoncer le prix.
- Avancer vers le prospect. Ton affirmatif. Ne PAS demander l'avis.
- Lire lentement les conditions.

Script : "Vous êtes donc d'accord avec moi, la fibre optique c'est [avantages]. Vous allez donc profiter : du meilleur réseau fibre jusqu'à 8Gb/s, des appels illimités vers fixes et mobiles en Europe et dans le monde, 260 chaînes, un service disponible pour tout échange de matériel. Pour bénéficier de ces services, l'abonnement est de xxx€/mois, les 6 premiers mois sont de XXX€ et Orange prend en charge les frais d'installation de 149€."

Script assumptif : "Comme je vous l'ai dit, nous avons des techniciens qui seront présents dans votre résidence pour les installations la semaine prochaine. Vous êtes disponible le matin ou l'après-midi pour l'installation ?"

--- ÉTAPE 10 — SAISIE DU CONTRAT ---
Pro dans l'attitude. Vérifier l'orthographe du mail. Écrire les numéros sur papier avant saisie.

--- ÉTAPE 11 — CONSOLIDATION, COOPTATION, PRISE DE CONGÉS ---
Consolidation : fiche Mémo, enquête de satisfaction, rappel RDV raccordement.
Règle d'or : un contrat rémunéré = un contrat raccordé.
Cooptation : "Nous sommes en période de recrutement. Connaissez-vous quelqu'un à la recherche d'un emploi ? → www.marvesting.com"
Congés : "Je vous remercie de votre accueil et je vous souhaite la bienvenue chez ORANGE." + poignée de main en fixant dans les yeux.
"""

SYSTEM_PROMPT_CLIENT = """Tu es un prospect porte-à-porte dans les zones Jura/Bourgogne/Côte-d'Or. Un vendeur Orange vient frapper à ta porte pour proposer des offres fibre optique.

TON PROFIL AUJOURD'HUI : {type_client_desc}

{methodo}

RÈGLES DE JEU :
- Tu parles français naturel et familier, comme à ta vraie porte (1-3 phrases max par réponse)
- Tu réagis de façon réaliste selon ton profil : tes objections, ton ton, ta méfiance ou curiosité
- Tu ne cèdes pas facilement — le vendeur doit mériter ta confiance étape par étape
- Si le vendeur rate son accroche, tu peux fermer la porte
- Si le vendeur est excellent (bonne accroche, écoute, questions ouvertes, reformulation), tu t'ouvres progressivement
- Tu peux accepter de signer si le closing est bien mené
- Tu ne fais JAMAIS de coaching. Tu restes dans ton personnage jusqu'à ce que l'utilisateur dise "stop" ou "analyse"

MODULE EN COURS : {module_focus}"""

SYSTEM_PROMPT_ENTRAINEUR = """Tu es le coach vente personnel de Heikel. Tu maîtrises sur le bout des doigts la méthodologie de vente porte-à-porte Orange Fibre de Marvesting.

{methodo}

TON STYLE :
- Direct, concret, sans bullshit. Pas de compliments inutiles.
- Tu tutoies Heikel.
- Tu identifies ce qui cloche, tu corriges, tu reformules.
- Tu parles comme un coach de terrain, pas comme un consultant.
- Concis : 5-8 lignes max par réponse sauf debriefing complet.

TES RÔLES selon ce que Heikel te demande :
1. Coach debriefing : Heikel te raconte une visite → tu analyses étape par étape
2. Coach objection : Heikel soumet une objection → meilleure réponse selon la méthode, puis tu lui demandes de reformuler à sa manière
3. Analyse de situation : description précise → recommandation actionnable immédiatement

POINTS DE VIGILANCE PRIORITAIRES sur Heikel :
- Taux d'ouverture (~20%) : surveiller et corriger l'accroche, le geste clé, le ton
- Transition découverte → offre trop tôt : il pitch avant que le prospect ait verbalisé son problème → TOUJOURS ramener à la découverte

MODULE EN COURS : {module_focus}"""

SYSTEM_PROMPT_LES_DEUX = """Tu joues DEUX rôles dans cette session d'entraînement vente PAP Orange Fibre pour Heikel.

{methodo}

RÔLE 1 — PROSPECT : Profil : {type_client_desc}
RÔLE 2 — COACH MARVESTING : feedback structuré à la fin

PHASE ACTUELLE : {phase}

Si PHASE = CLIENT :
- Réponds comme un vrai prospect à la porte (1-3 phrases, naturel, selon ton profil)
- Commence ta réponse par [CLIENT]
- Réagis honnêtement : si l'accroche est ratée, ferme la porte. Si elle est excellente, ouvre-toi.
- Ne fais JAMAIS de coaching dans cette phase

Si PHASE = COACH :
- Analyse la conversation complète de Heikel en tant que vendeur
- Structure obligatoire :
  ✅ Points forts (avec exemples tirés de l'échange)
  ⚠️ Erreurs identifiées (avec timestamp/moment précis)
  💡 Ce qu'il aurait dû dire (reformulation exacte)
  🏆 Score /10 + justification
- Sois direct, concret, tutoie Heikel
- Attention particulière : accroche + transition découverte→offre (ses 2 faiblesses)

MODULE FOCUS : {module_focus}
Réponds UNIQUEMENT en français."""


class SessionEntrainement(db.Model):
    __tablename__ = "sessions_entrainement"

    id = db.Column(db.Integer, primary_key=True)
    mode = db.Column(db.String(20), nullable=False, default="les_deux")
    module = db.Column(db.String(50), nullable=False, default="competences_terrain")
    type_client = db.Column(db.String(20), nullable=False, default="mefiant")
    score = db.Column(db.Float, nullable=True)
    feedback_final = db.Column(db.Text, nullable=True)
    terminee = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    messages = db.relationship(
        "MessageEntrainement", backref="session_entrainement", lazy=True,
        cascade="all, delete-orphan", order_by="MessageEntrainement.id",
    )


class MessageEntrainement(db.Model):
    __tablename__ = "messages_entrainement"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(
        db.Integer, db.ForeignKey("sessions_entrainement.id"), nullable=False
    )
    role = db.Column(db.String(10), nullable=False)  # "user" or "assistant"
    content = db.Column(db.Text, nullable=False)
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

    # Stats entraîneur pour le widget dashboard
    derniere_session = (
        SessionEntrainement.query
        .order_by(SessionEntrainement.created_at.desc())
        .first()
    )
    sessions_aujourd_hui = SessionEntrainement.query.filter(
        db.func.date(SessionEntrainement.created_at) == aujourd_hui
    ).count()
    scores_recents = [
        s.score for s in SessionEntrainement.query
        .filter(SessionEntrainement.score.isnot(None))
        .order_by(SessionEntrainement.created_at.desc())
        .limit(5).all()
    ]
    score_moyen_recent = round(sum(scores_recents) / len(scores_recents), 1) if scores_recents else None

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
        derniere_session=derniere_session,
        sessions_aujourd_hui=sessions_aujourd_hui,
        score_moyen_recent=score_moyen_recent,
        modules=MODULES_ENTRAINEMENT,
        modes=MODES_ENTRAINEMENT,
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
# Routes Entraîneur IA
# ---------------------------------------------------------------------------

def _build_system_prompt(sess, force_coach=False):
    module_info = MODULES_ENTRAINEMENT.get(sess.module, {})
    type_client_info = TYPES_CLIENT.get(sess.type_client, {})
    module_focus = f"{module_info.get('label', '')} — {module_info.get('description', '')}"
    type_client_desc = f"{type_client_info.get('label', '')} : {type_client_info.get('description', '')}"

    if sess.mode == "debriefing":
        return SYSTEM_PROMPT_DEBRIEFING.format(methodo=_METHODO_MARVESTING)
    if sess.mode == "client":
        return SYSTEM_PROMPT_CLIENT.format(
            type_client_desc=type_client_desc,
            module_focus=module_focus,
            methodo=_METHODO_MARVESTING,
        )
    if sess.mode == "entraineur":
        return SYSTEM_PROMPT_ENTRAINEUR.format(
            module_focus=module_focus,
            methodo=_METHODO_MARVESTING,
        )

    nb_user_msgs = sum(1 for m in sess.messages if m.role == "user")
    phase = "COACH" if (force_coach or nb_user_msgs >= 8) else "CLIENT"
    return SYSTEM_PROMPT_LES_DEUX.format(
        type_client_desc=type_client_desc,
        module_focus=module_focus,
        phase=phase,
        methodo=_METHODO_MARVESTING,
    )


@app.route("/entraineur")
@login_required
def entraineur():
    sessions = (
        SessionEntrainement.query
        .order_by(SessionEntrainement.created_at.desc())
        .limit(10)
        .all()
    )
    return render_template(
        "entraineur.html",
        modules=MODULES_ENTRAINEMENT,
        types_client=TYPES_CLIENT,
        modes=MODES_ENTRAINEMENT,
        sessions=sessions,
    )


@app.route("/api/entraineur/demarrer", methods=["POST"])
@login_required
def entraineur_demarrer():
    data = request.get_json() or {}
    mode = data.get("mode", "les_deux")
    module = data.get("module", "competences_terrain")
    type_client = data.get("type_client", "mefiant")

    if mode not in MODES_ENTRAINEMENT:
        return jsonify({"error": "Mode invalide"}), 400
    if mode != "debriefing" and module not in MODULES_ENTRAINEMENT:
        return jsonify({"error": "Module invalide"}), 400
    if mode not in ("debriefing", "entraineur") and type_client not in TYPES_CLIENT:
        return jsonify({"error": "Type client invalide"}), 400

    sess = SessionEntrainement(mode=mode, module=module, type_client=type_client)
    db.session.add(sess)
    db.session.commit()
    return jsonify({"session_id": sess.id, "ok": True})


@app.route("/api/entraineur/chat", methods=["POST"])
@login_required
def entraineur_chat():
    import anthropic as _anthropic
    import json as _json

    data = request.get_json() or {}
    session_id = data.get("session_id")
    user_message = (data.get("message") or "").strip()
    force_feedback = data.get("force_feedback", False)

    if not user_message:
        return jsonify({"error": "Message vide"}), 400

    sess = db.session.get(SessionEntrainement, session_id)
    if not sess:
        return jsonify({"error": "Session introuvable"}), 404

    # Persist user message
    db.session.add(MessageEntrainement(session_id=sess.id, role="user", content=user_message))
    db.session.commit()

    system_prompt = _build_system_prompt(sess, force_coach=force_feedback)

    history = [
        {"role": m.role, "content": m.content}
        for m in sess.messages
    ]

    try:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return jsonify({"error": "ANTHROPIC_API_KEY non configuré"}), 500

        client = _anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system_prompt,
            messages=history,
        )
        reply_raw = response.content[0].text

        # Persist assistant message
        db.session.add(MessageEntrainement(session_id=sess.id, role="assistant", content=reply_raw))
        db.session.commit()

        is_coach = (
            "[COACH]" in reply_raw
            or sess.mode == "entraineur"
            or force_feedback
        )
        clean_reply = reply_raw.replace("[CLIENT]", "").replace("[COACH]", "").strip()

        return jsonify({
            "reply": clean_reply,
            "is_coach": is_coach,
            "message_count": len(sess.messages),
        })
    except Exception as exc:
        app.logger.error("Entraineur chat error: %s", exc)
        return jsonify({"error": str(exc)}), 500


@app.route("/api/entraineur/feedback/<int:session_id>", methods=["POST"])
@login_required
def entraineur_feedback(session_id):
    import anthropic as _anthropic
    import json as _json

    sess = db.session.get(SessionEntrainement, session_id)
    if not sess:
        return jsonify({"error": "Session introuvable"}), 404

    if not sess.messages:
        return jsonify({"error": "Session vide"}), 400

    conversation_text = "\n".join(
        f"{'VENDEUR' if m.role == 'user' else 'INTERLOCUTEUR'}: {m.content}"
        for m in sess.messages
    )
    module_info = MODULES_ENTRAINEMENT.get(sess.module, {})
    skills_list = "\n".join(f"- {s}" for s in module_info.get("skills", []))

    prompt = f"""Analyse cette session d'entraînement de vente porte-à-porte.

MODULE ÉVALUÉ : {module_info.get('label', '')} — {module_info.get('description', '')}
COMPÉTENCES CIBLÉES :
{skills_list}

CONVERSATION :
{conversation_text}

Fournis un JSON structuré (rien d'autre, pas de markdown) :
{{
  "score": <entier 0-10>,
  "points_forts": ["point 1", "point 2"],
  "a_ameliorer": ["point 1", "point 2"],
  "techniques_recommandees": ["Technique + explication courte"],
  "feedback_global": "2-3 phrases motivantes résumant la session"
}}"""

    try:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return jsonify({"error": "ANTHROPIC_API_KEY non configuré"}), 500

        client = _anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = resp.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        feedback = _json.loads(raw)
        sess.score = feedback.get("score")
        sess.feedback_final = raw
        sess.terminee = True
        db.session.commit()
        return jsonify(feedback)
    except Exception as exc:
        app.logger.error("Entraineur feedback error: %s", exc)
        return jsonify({"error": str(exc)}), 500


@app.route("/api/entraineur/sessions")
@login_required
def entraineur_sessions():
    sessions = (
        SessionEntrainement.query
        .order_by(SessionEntrainement.created_at.desc())
        .limit(20)
        .all()
    )
    return jsonify([
        {
            "id": s.id,
            "mode": MODES_ENTRAINEMENT.get(s.mode, s.mode),
            "module": MODULES_ENTRAINEMENT.get(s.module, {}).get("label", s.module),
            "type_client": TYPES_CLIENT.get(s.type_client, {}).get("label", s.type_client),
            "score": s.score,
            "terminee": s.terminee,
            "nb_messages": len(s.messages),
            "date": s.created_at.strftime("%d/%m/%Y %H:%M"),
        }
        for s in sessions
    ])


# ---------------------------------------------------------------------------
# Objections PAP — base de données
# ---------------------------------------------------------------------------

OBJECTIONS_PAP = [
    {"id":  1, "objection": "Je suis chez Free, c'est moins cher qu'Orange.", "categorie": "Prix", "soncase": "A", "niveau": "facile",
     "reponse_type": "Si aujourd'hui Free vous offre moins cher, c'est parce que vous payez en débit, en service et en stabilité. Concrètement, combien vous coûte une coupure internet quand vous travaillez de chez vous ?"},
    {"id":  2, "objection": "Ça marche très bien comme ça, je ne vois pas pourquoi changer.", "categorie": "Confort", "soncase": "C", "niveau": "facile",
     "reponse_type": "C'est exactement ce que je viens vérifier. Si tout est parfait, je vous le confirme et je repars. Mais si on peut améliorer quelque chose sans changer vos habitudes ni votre budget, c'est intéressant non ?"},
    {"id":  3, "objection": "Je vais réfléchir.", "categorie": "Indécision", "soncase": "C", "niveau": "moyen",
     "reponse_type": "Réfléchir à quoi précisément ? Si c'est une question de prix, on peut y revenir. Si c'est une question de timing, les techniciens sont dans votre zone uniquement cette semaine. Qu'est-ce qui vous retient ?"},
    {"id":  4, "objection": "C'est trop cher.", "categorie": "Prix", "soncase": "A", "niveau": "facile",
     "reponse_type": "Trop cher par rapport à quoi ? Votre abonnement actuel ? Montrez-moi votre facture, on compare ensemble. Souvent les clients découvrent qu'ils paient déjà autant voire plus pour moins de services."},
    {"id":  5, "objection": "Je suis locataire, je ne peux pas décider ça.", "categorie": "Obstacle pratique", "soncase": "C", "niveau": "moyen",
     "reponse_type": "Bonne nouvelle — en tant que locataire, vous avez tout à fait le droit de souscrire à un abonnement internet. C'est votre contrat à votre nom, pas une modification du logement. Votre propriétaire n'a rien à voir là-dedans."},
    {"id":  6, "objection": "Mon voisin a eu des problèmes avec Orange.", "categorie": "Mauvaise expérience", "soncase": "S", "niveau": "moyen",
     "reponse_type": "Je comprends, et c'est justement pourquoi je suis là. Les problèmes passés venaient souvent d'une installation ADSL ou d'une box ancienne génération. Ce qu'on installe aujourd'hui c'est une toute nouvelle technologie fibre avec un SAV dédié. Votre voisin était sur quel type de ligne ?"},
    {"id":  7, "objection": "Je ne veux pas m'engager sur 24 mois.", "categorie": "Engagement", "soncase": "C", "niveau": "moyen",
     "reponse_type": "L'engagement de 24 mois c'est en échange des avantages tarifaires et des 6 mois offerts. Après ces 24 mois, vous êtes libre. Et franchement, si le service est bon — et il l'est — vous ne voudrez pas partir. C'est vraiment le seul frein ?"},
    {"id":  8, "objection": "Envoyez-moi une brochure, je regarderai.", "categorie": "Faux intérêt", "soncase": "C", "niveau": "difficile",
     "reponse_type": "Les brochures ne répondent pas à vos questions spécifiques. Là j'ai tout ce qu'il faut et je peux personnaliser l'offre selon votre situation maintenant. Qu'est-ce qui vous intéresse le plus dans ce que je vous ai présenté ?"},
    {"id":  9, "objection": "Je vais en parler à mon mari / ma femme d'abord.", "categorie": "Décisionnaire absent", "soncase": "C", "niveau": "moyen",
     "reponse_type": "Bien sûr, c'est une décision qui vous concerne tous les deux. Il est là en ce moment ? Sinon, quand est-ce que je peux repasser pour que vous soyez ensemble ? Je préfère qu'on règle ça avec la bonne personne."},
    {"id": 10, "objection": "Vous êtes le 3ème vendeur Orange à passer cette semaine.", "categorie": "Méfiance", "soncase": "S", "niveau": "difficile",
     "reponse_type": "Je comprends que ça puisse agacer. Sachez que je ne viens pas vendre à tout prix — je viens faire un diagnostic de votre ligne. Si rien ne justifie un changement, je vous le dis honnêtement et je repars. Vous permettez juste que je vérifie ?"},
    {"id": 11, "objection": "Je peux trouver la même chose moins cher sur internet.", "categorie": "Prix", "soncase": "A", "niveau": "moyen",
     "reponse_type": "Sur internet vous ne trouvez que le tarif affiché — pas l'installation prise en charge à 149€, pas le technicien chez vous, pas mon suivi après. Et surtout pas les 6 premiers mois au tarif réduit. C'est une offre terrain exclusive."},
    {"id": 12, "objection": "Je n'ai pas besoin d'internet si rapide.", "categorie": "Besoin", "soncase": "N", "niveau": "facile",
     "reponse_type": "Dites-moi, combien d'appareils êtes-vous à utiliser internet en même temps chez vous ? TV, téléphone, tablette, ordinateur... Souvent on réalise qu'on en a plus besoin qu'on ne pensait, surtout avec les plateformes streaming."},
    {"id": 13, "objection": "Je suis trop vieux pour tout ça, je ne comprends rien à la technologie.", "categorie": "Confort", "soncase": "C", "niveau": "moyen",
     "reponse_type": "C'est exactement pour ça qu'on envoie un technicien à domicile qui installe tout, configure tout et vous explique. Vous n'avez rien à faire. Et si vous avez une question après, le SAV est disponible 24h/24. Vous n'avez pas à tout comprendre — on s'en occupe."},
    {"id": 14, "objection": "L'ADSL me suffit amplement.", "categorie": "Besoin", "soncase": "C", "niveau": "moyen",
     "reponse_type": "L'ADSL c'est une technologie qui est en train d'être progressivement abandonnée. Dans votre zone, les lignes ADSL ne seront plus maintenues d'ici quelques années. Autant faire la transition maintenant dans de bonnes conditions plutôt que d'être forcé de le faire en urgence."},
    {"id": 15, "objection": "Je viens juste de signer chez SFR / Bouygues.", "categorie": "Concurrent", "soncase": "A", "niveau": "difficile",
     "reponse_type": "Vous avez signé quand ? Si c'est dans les 14 jours, vous êtes encore dans votre délai de rétractation légal. Et si c'est l'offre qui vous a convaincu, laissez-moi juste vous montrer ce qu'on propose — si c'est pareil vous ne perdez rien à comparer."},
    {"id": 16, "objection": "Je dois d'abord finir mon engagement actuel.", "categorie": "Engagement", "soncase": "A", "niveau": "moyen",
     "reponse_type": "C'est souvent moins bloquant qu'on ne le croit. Combien de mois il vous reste ? On peut programmer l'installation pour la fin de votre engagement — vous signez aujourd'hui, on installe plus tard. Ça vous permet d'avoir les meilleures conditions tarifaires maintenant."},
    {"id": 17, "objection": "Je n'ai pas le temps là.", "categorie": "Disponibilité", "soncase": "C", "niveau": "facile",
     "reponse_type": "Je comprends, je serai bref. Juste 2 minutes pour faire le diagnostic de votre prise et vous dire si vous êtes concerné. Si non, je repars. Si oui, on fixe un rendez-vous qui vous convient. Ça prend moins de temps qu'un coup de fil au SAV."},
    {"id": 18, "objection": "Orange coupe souvent, j'en ai déjà eu.", "categorie": "Mauvaise expérience", "soncase": "S", "niveau": "difficile",
     "reponse_type": "Quand aviez-vous Orange ? La fibre optique et l'ADSL c'est vraiment deux technologies différentes. La fibre c'est une ligne dédiée, pas partagée. Le taux de coupure est 4 fois plus bas qu'en ADSL. Ce que vous avez vécu ne se reproduira pas avec ce qu'on installe."},
    {"id": 19, "objection": "Je vais regarder sur le site Orange directement.", "categorie": "Faux intérêt", "soncase": "A", "niveau": "difficile",
     "reponse_type": "Sur le site vous ne trouverez pas cette offre — c'est une offre exclusive terrain avec les frais d'installation offerts et les 6 premiers mois réduits. En plus vous n'aurez personne pour faire le diagnostic et s'assurer que tout est compatible chez vous."},
    {"id": 20, "objection": "Mon fils/ma fille gère tout ça pour moi, faudrait lui parler.", "categorie": "Décisionnaire absent", "soncase": "C", "niveau": "moyen",
     "reponse_type": "Pas de problème, votre fils/fille peut appeler le numéro sur ma carte. Mais avant, laissez-moi juste faire le diagnostic de votre installation — comme ça quand il/elle appelle, on aura déjà toutes les infos. Ça lui fera gagner du temps."},
    {"id": 21, "objection": "Je vais regarder sur internet d'abord et je verrai.", "categorie": "Faux intérêt", "soncase": "A", "niveau": "difficile",
     "reponse_type": "Sur internet vous tomberez sur les offres grand public à plein tarif. Là vous avez une offre terrain exclusive avec les frais d'installation offerts et 6 mois réduits — elle n'est pas en ligne. Qu'est-ce qui vous retient là, maintenant ?"},
    {"id": 22, "objection": "J'ai pas de moyen de paiement sous la main.", "categorie": "Pratique", "soncase": "C", "niveau": "facile",
     "reponse_type": "Pas de souci, aujourd'hui on fait juste la souscription et le RDV technicien. Le prélèvement commence seulement après l'installation. Vous avez bien un RIB ou vos coordonnées bancaires quelque part ? On peut même faire ça depuis votre téléphone."},
    {"id": 23, "objection": "Mon voisin attend depuis 3 mois l'installation d'Orange.", "categorie": "Mauvaise expérience", "soncase": "S", "niveau": "difficile",
     "reponse_type": "Je comprends et c'est frustrant. Les délais varient selon les zones — dans votre secteur on a des techniciens disponibles la semaine prochaine. C'est justement pour ça qu'on fait le diagnostic maintenant : pour réserver le créneau avant que les disponibilités partent."},
    {"id": 24, "objection": "Je préfère garder mon opérateur actuel, ça fait des années.", "categorie": "Fidélité", "soncase": "S", "niveau": "moyen",
     "reponse_type": "La fidélité c'est une qualité — mais votre opérateur, lui, l'a-t-il récompensée ? Souvent les anciens clients paient plus cher que les nouveaux. Combien payez-vous actuellement ? On va comparer ensemble."},
    {"id": 25, "objection": "Vous avez une carte de visite ? Je vous rappellerai.", "categorie": "Esquive", "soncase": "C", "niveau": "difficile",
     "reponse_type": "Je n'ai pas de carte sur moi, et franchement les rappels se font rarement — je ne vous en veux pas, c'est humain. Ce que je vous propose : 10 minutes maintenant pour faire le diagnostic. Si ça ne correspond pas, vous me dites non et c'est terminé. C'est honnête non ?"},
    {"id": 26, "objection": "J'ai essayé de changer une fois, c'était un cauchemar administratif.", "categorie": "Confort", "soncase": "C", "niveau": "moyen",
     "reponse_type": "Je vous entends — et c'est exactement pour ça qu'on gère tout à votre place. La portabilité du numéro, la résiliation de l'ancien contrat, l'installation à domicile. Vous n'avez rien à faire sauf ouvrir la porte au technicien. Qu'est-ce qui avait bloqué la dernière fois ?"},
    {"id": 27, "objection": "C'est quoi le numéro du service client si j'ai un problème après ?", "categorie": "Sécurité", "soncase": "S", "niveau": "facile",
     "reponse_type": "C'est le 3900, disponible 7j/7. Et en plus de ça, si vous avez un souci dans les 30 premiers jours, je reste votre interlocuteur direct — vous m'appelez et je remonte le problème. C'est d'ailleurs une vraie différence avec une souscription en ligne."},
    {"id": 28, "objection": "Les prix vont encore augmenter dans 6 mois de toute façon.", "categorie": "Prix", "soncase": "A", "niveau": "moyen",
     "reponse_type": "C'est vrai que les prix évoluent dans tout le marché télécom. Justement — en souscrivant aujourd'hui vous bloquez le tarif promotionnel pendant 12 mois. Et les 6 premiers mois sont à prix réduit. Attendre ne fera qu'augmenter ce que vous paierez."},
    {"id": 29, "objection": "Je suis en télétravail, je peux pas me permettre une coupure pendant l'installation.", "categorie": "Sécurité", "soncase": "S", "niveau": "moyen",
     "reponse_type": "Très bonne question. L'installation fibre prend en moyenne 2h. On choisit ensemble un créneau où vous êtes disponible — vendredi après-midi, samedi matin. Et pendant ce temps-là vous pouvez utiliser la 4G de votre téléphone en partage de connexion. Quel créneau vous arrangerait ?"},
    {"id": 30, "objection": "Mon mari dit qu'Orange c'est trop cher et qu'on ne changera pas.", "categorie": "Décisionnaire absent", "soncase": "A", "niveau": "difficile",
     "reponse_type": "Je comprends. Et si votre mari voyait les chiffres concrets — ce que vous payez aujourd'hui versus ce qu'on propose avec plus de services — est-ce que ça changerait peut-être son avis ? Il est là ? Ou je peux repasser quand vous êtes ensemble ?"},
]

SYSTEM_PROMPT_DEBRIEFING = """Tu es le coach vente de Heikel — expert PAP fibre Orange, méthode Marvesting.

Heikel va te raconter une visite terrain qu'il vient de faire. Tu vas analyser cette visite étape par étape selon la méthode Marvesting et lui donner un feedback précis et actionnable.

{methodo}

FORMAT DE TON ANALYSE :
1. Écoute d'abord le récit complet de Heikel (laisse-le raconter)
2. Quand il a fini, analyse chaque étape qu'il a mentionnée :
   - Ce qui était bon (avec citation de ce qu'il a dit)
   - Ce qui était raté (moment précis + pourquoi selon Marvesting)
   - Ce qu'il aurait dû dire à la place (script exact)
3. Identifie les 2-3 points prioritaires à travailler
4. Score global /10

POINTS DE VIGILANCE sur Heikel :
- Taux d'ouverture (~20%) — surveille l'accroche et le geste clé
- Pitch trop tôt — s'il a présenté l'offre avant que le prospect verbalise son problème, signale-le immédiatement

Style : direct, tutoiement, concret. Pas de blabla."""

SYSTEM_PROMPT_OBJECTION = """Tu es le coach vente de Heikel. Il vient de recevoir cette objection d'un prospect porte-à-porte :

OBJECTION : « {objection} »
CATÉGORIE : {categorie}
PROFIL SONCASE : {soncase}

Heikel a répondu : « {reponse_heikel} »

{methodo}

Évalue sa réponse et donne-lui un coaching concis :
1. Score /10
2. Ce qui était bon (1-2 points max)
3. Ce qui manquait ou était à éviter
4. La réponse idéale selon la méthode Marvesting (reformulée exactement comme il devrait la dire)
5. La technique SONCASE ou étape de la méthode à retenir

Style : direct, tutoiement, 8 lignes max. Pas de blabla."""


# ---------------------------------------------------------------------------
# Route Progression
# ---------------------------------------------------------------------------

@app.route("/progression")
@login_required
def progression():
    sessions = (
        SessionEntrainement.query
        .filter(SessionEntrainement.score.isnot(None))
        .order_by(SessionEntrainement.created_at.asc())
        .all()
    )
    total = SessionEntrainement.query.count()
    terminees = SessionEntrainement.query.filter_by(terminee=True).count()

    scores = [s.score for s in sessions if s.score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else None
    best_score = max(scores) if scores else None

    by_module = {}
    for key, info in MODULES_ENTRAINEMENT.items():
        module_scores = [s.score for s in sessions if s.module == key and s.score is not None]
        by_module[key] = {
            "label": info["label"],
            "color": info["color"],
            "avg": round(sum(module_scores) / len(module_scores), 1) if module_scores else None,
            "count": len(module_scores),
        }

    chart_data = [
        {
            "date": s.created_at.strftime("%d/%m"),
            "score": s.score,
            "module": MODULES_ENTRAINEMENT.get(s.module, {}).get("label", s.module),
        }
        for s in sessions[-30:]
    ]

    # Streak : jours consécutifs avec au moins une session
    all_sessions_all = SessionEntrainement.query.order_by(SessionEntrainement.created_at.desc()).all()
    streak = 0
    if all_sessions_all:
        today = date.today()
        seen_days = sorted(set(s.created_at.date() for s in all_sessions_all), reverse=True)
        expected = today
        for d in seen_days:
            if d == expected:
                streak += 1
                expected -= timedelta(days=1)
            elif d < expected:
                break

    # Module le plus faible
    worst_module = None
    if by_module:
        scored = {k: v for k, v in by_module.items() if v["avg"] is not None}
        if scored:
            worst_module = min(scored, key=lambda k: scored[k]["avg"])

    return render_template(
        "progression.html",
        total=total,
        terminees=terminees,
        avg_score=avg_score,
        best_score=best_score,
        by_module=by_module,
        chart_data=chart_data,
        sessions=sessions[-10:][::-1],
        modules=MODULES_ENTRAINEMENT,
        streak=streak,
        worst_module=worst_module,
    )


# ---------------------------------------------------------------------------
# Routes Objections
# ---------------------------------------------------------------------------

@app.route("/api/entraineur/objection/aleatoire")
@login_required
def objection_aleatoire():
    import random
    niveau = request.args.get("niveau")
    pool = [o for o in OBJECTIONS_PAP if not niveau or o["niveau"] == niveau]
    if not pool:
        pool = OBJECTIONS_PAP
    obj = random.choice(pool)
    return jsonify(obj)


@app.route("/api/entraineur/objection/evaluer", methods=["POST"])
@login_required
def objection_evaluer():
    import anthropic as _anthropic
    import json as _json

    data = request.get_json() or {}
    objection_id = data.get("objection_id")
    reponse_heikel = (data.get("reponse") or "").strip()

    if not reponse_heikel:
        return jsonify({"error": "Réponse vide"}), 400

    obj = next((o for o in OBJECTIONS_PAP if o["id"] == objection_id), None)
    if not obj:
        return jsonify({"error": "Objection introuvable"}), 404

    prompt = SYSTEM_PROMPT_OBJECTION.format(
        objection=obj["objection"],
        categorie=obj["categorie"],
        soncase=obj["soncase"],
        reponse_heikel=reponse_heikel,
        methodo=_METHODO_MARVESTING,
    )

    try:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return jsonify({"error": "ANTHROPIC_API_KEY non configuré"}), 500

        client = _anthropic.Anthropic(api_key=api_key)
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        feedback = resp.content[0].text.strip()

        # Extract score from text
        score = None
        import re as _re
        m = _re.search(r'(\d+)\s*/\s*10', feedback)
        if m:
            score = int(m.group(1))

        return jsonify({
            "feedback": feedback,
            "score": score,
            "reponse_type": obj.get("reponse_type", ""),
            "categorie": obj["categorie"],
            "soncase": obj["soncase"],
        })
    except Exception as exc:
        app.logger.error("Objection evaluer error: %s", exc)
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Route TTS — ElevenLabs
# ---------------------------------------------------------------------------

@app.route("/api/tts", methods=["POST"])
@login_required
def api_tts():
    import requests as _requests

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        return jsonify({"error": "no_key"}), 200

    data = request.get_json() or {}
    text = (data.get("text") or "").strip()
    speaker = data.get("speaker", "client")

    if not text:
        return jsonify({"error": "Texte vide"}), 400

    text = text[:500]

    # Charlotte (FR féminin) pour le prospect, Adam (EN/multilingual masculin) pour le coach
    voice_client = os.environ.get("ELEVENLABS_VOICE_CLIENT", "XB0fDUnXU5powFXDhCwa")
    voice_coach  = os.environ.get("ELEVENLABS_VOICE_COACH",  "pNInz6obpgDQGcFmaJgB")
    voice_id = voice_coach if speaker == "coach" else voice_client

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.50, "similarity_boost": 0.75},
    }

    try:
        resp = _requests.post(url, json=payload, headers=headers, timeout=15)
        if resp.status_code == 200:
            from flask import Response as _R
            return _R(resp.content, mimetype="audio/mpeg")
        app.logger.error("ElevenLabs error %s: %s", resp.status_code, resp.text[:200])
        return jsonify({"error": f"ElevenLabs {resp.status_code}"}), 502
    except Exception as exc:
        app.logger.error("TTS error: %s", exc)
        return jsonify({"error": str(exc)}), 500


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
