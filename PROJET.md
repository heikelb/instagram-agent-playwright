# Ventes Orange — CRM + Entraîneur IA PAP

## Description
Application web Flask complète pour les commerciaux terrain Orange Fibre.
- CRM de suivi des ventes et rendez-vous
- Envoi SMS automatique de rappel (Twilio)
- Import de bons de commande par photo (Claude Vision)
- **Entraîneur IA vocal** — méthode Marvesting (Claude + ElevenLabs)
- Suivi de progression personnalisé

---

## Stack technique
| Composant | Technologie |
|---|---|
| Backend | Python 3.11 + Flask 3.0.3 |
| Base de données | SQLite via Flask-SQLAlchemy |
| Frontend | Bootstrap 5 + Bootstrap Icons |
| IA conversations | Anthropic Claude (claude-sonnet-4-6) |
| Voix humaine | ElevenLabs (eleven_multilingual_v2) |
| Voix fallback | Web Speech API (navigateur) |
| SMS | Twilio |
| Déploiement | Railway |
| PWA | manifest.json + sw.js |

---

## Structure des fichiers

```
instagram-agent-playwright/
├── app.py                    # Application principale (~1944 lignes)
├── requirements.txt          # Dépendances Python
├── Procfile                  # Commande de démarrage Railway
├── nixpacks.toml             # Config build Railway
├── railway.json              # Config Railway
├── .env.example              # Variables d'environnement (modèle)
├── .env                      # Variables locales (NE PAS COMMITTER)
├── static/
│   ├── css/                  # Styles custom
│   ├── js/                   # Scripts
│   ├── fonts/                # Polices
│   ├── icons/                # Icônes PWA
│   ├── manifest.json         # Config PWA
│   └── sw.js                 # Service Worker
└── templates/
    ├── base.html             # Layout principal (nav, head)
    ├── login.html            # Page de connexion
    ├── dashboard.html        # Tableau de bord
    ├── ventes.html           # Liste des ventes
    ├── formulaire.html       # Ajouter/modifier une vente
    ├── prospection.html      # Carte de prospection
    ├── recap.html            # Récap quotidien
    ├── import.html           # Import photo bon de commande
    ├── tap.html              # Interface TAP
    ├── tap_adresses.html     # Adresses TAP
    ├── entraineur.html       # Entraîneur IA vocal (NOUVEAU)
    └── progression.html      # Suivi de progression (NOUVEAU)
```

---

## Variables d'environnement (`.env`)

```env
# Clé secrète Flask
SECRET_KEY=une-longue-chaine-aleatoire

# Mot de passe de l'application
APP_PASSWORD=orange2026

# Twilio — SMS automatiques
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+33xxxxxxxxx

# Anthropic — IA conversations + scan bons de commande
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs — voix humaine pour l'entraîneur IA
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Voix Charlotte (prospect féminine)
ELEVENLABS_VOICE_CLIENT=XB0fDUnXU5powFXDhCwa
# Voix Adam (coach masculin)
ELEVENLABS_VOICE_COACH=pNInz6obpgDQGcFmaJgB
```

---

## Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/heikelb/instagram-agent-playwright.git
cd instagram-agent-playwright

# 2. Créer un environnement virtuel
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer les variables
cp .env.example .env
# Editer .env avec tes vraies clés API

# 5. Lancer l'application
flask run
# ou
APP_PASSWORD=orange2026 SECRET_KEY=dev python -m flask run
```

L'app sera accessible sur : http://localhost:5000

---

## Modèles de base de données (SQLite — `instance/ventes.db`)

### `Vente`
| Champ | Type | Description |
|---|---|---|
| id | Integer | Clé primaire |
| prenom, nom | String | Client |
| telephone | String | Numéro client |
| adresse | String | Adresse installation |
| produit | String | Offre Orange |
| date_rdv | DateTime | Date du rendez-vous |
| statut | String | en_attente / confirme / installe / no_show / annule |
| sms_envoye | Boolean | Rappel SMS envoyé |
| notes | Text | Notes libres |
| created_at | DateTime | Date de création |

### `SessionEntrainement`
| Champ | Type | Description |
|---|---|---|
| id | Integer | Clé primaire |
| mode | String | client / entraineur / les_deux / objection / debriefing |
| module | String | adn_mental / competences / organisation / relation_client |
| type_client | String | mefiant / curieux / presse / interesse / agressif / indecis |
| messages | JSON | Historique de la conversation |
| score | Float | Score final /10 |
| feedback | Text | Feedback détaillé du coach IA |
| created_at | DateTime | Date de création |

### `MessageEntrainement`
| Champ | Type | Description |
|---|---|---|
| id | Integer | Clé primaire |
| session_id | Integer | FK vers SessionEntrainement |
| role | String | user / assistant |
| content | Text | Contenu du message |
| created_at | DateTime | Date de création |

---

## Routes principales

### CRM
| Route | Méthode | Description |
|---|---|---|
| `/` | GET | Redirige vers dashboard |
| `/dashboard` | GET | Tableau de bord |
| `/ventes` | GET | Liste des ventes |
| `/ventes/ajouter` | GET/POST | Nouvelle vente |
| `/ventes/<id>/modifier` | GET/POST | Modifier une vente |
| `/prospection` | GET | Carte de prospection |
| `/recap` | GET | Récap quotidien |
| `/import` | GET/POST | Import photo bon de commande |
| `/lancer-rappels` | POST | Envoyer SMS rappels J-1 |

### Entraîneur IA
| Route | Méthode | Description |
|---|---|---|
| `/entraineur` | GET | Interface d'entraînement |
| `/progression` | GET | Suivi de progression |
| `/api/entraineur/demarrer` | POST | Démarrer une session |
| `/api/entraineur/chat` | POST | Envoyer un message |
| `/api/entraineur/feedback/<id>` | POST | Demander le feedback final |
| `/api/entraineur/sessions` | GET | Historique des sessions |
| `/api/entraineur/objection/aleatoire` | GET | Tirer une objection aléatoire |
| `/api/entraineur/objection/evaluer` | POST | Évaluer une réponse à une objection |
| `/api/tts` | POST | Text-to-speech ElevenLabs |

---

## Fonctionnalités de l'Entraîneur IA

### Modes d'entraînement
- **🎭 Roleplay client** — L'IA joue le prospect, tu t'entraînes à vendre
- **🧠 Coach** — L'IA te donne des conseils et techniques
- **🔥 Simulation complète** — L'IA alterne entre prospect et coach
- **⚡ Mode Objections** — 30 objections PAP à surmonter, scorées en temps réel
- **📋 Débriefing terrain** — Analyse d'une vraie visite que tu décris

### Modules
- ADN Mental (mindset, confiance, gestion du rejet)
- Compétences Terrain (techniques de vente PAP)
- Organisation (planning, énergie, secteur)
- Relation Client (suivi, SAV, recommandations)

### Types de prospects
Méfiant, Curieux, Pressé, Intéressé, Agressif, Indécis

### Méthodologie Marvesting intégrée
11 étapes PAP complètes : Approche → Accroche → Qualification → Présentation → Démonstration → Reformulation → Gestion objections → Closing → Engagement → Confirmation → Recommandations

### Voix
- **Charlotte** (ElevenLabs `XB0fDUnXU5powFXDhCwa`) — voix féminine pour le prospect
- **Adam** (ElevenLabs `pNInz6obpgDQGcFmaJgB`) — voix masculine pour le coach
- Fallback automatique sur la voix du navigateur si ElevenLabs non configuré

---

## Déploiement Railway

### Prérequis
- Compte Railway (railway.app)
- Compte Anthropic (console.anthropic.com) → clé `sk-ant-...`
- Compte ElevenLabs (elevenlabs.io) → clé API (optionnel)
- Compte Twilio (twilio.com) → pour les SMS (optionnel)

### Étapes
1. Connecter le repo GitHub à Railway
2. Choisir la branche : `claude/ai-sales-trainer-voice-Na1oH`
3. Dans **Variables**, ajouter :
   - `SECRET_KEY` = chaîne aléatoire longue
   - `APP_PASSWORD` = ton mot de passe
   - `ANTHROPIC_API_KEY` = ta clé Anthropic
   - `ELEVENLABS_API_KEY` = ta clé ElevenLabs
4. Dans **Networking** → cliquer **Generate Domain**
5. Railway déploie automatiquement à chaque push sur la branche

### Branches Git
| Branche | Usage |
|---|---|
| `main` | Version stable de base (CRM seul) |
| `claude/ai-sales-trainer-voice-Na1oH` | Version complète avec Entraîneur IA |

---

## Clés API — Où les obtenir

| Service | URL | Gratuit ? |
|---|---|---|
| Anthropic | console.anthropic.com → API Keys | Non (pay-per-use) |
| ElevenLabs | elevenlabs.io → Profile → API Key | Oui (quota limité) |
| Twilio | console.twilio.com | Oui (crédit d'essai ~15€) |

---

## Mot de passe par défaut
```
orange2026
```
À changer via la variable `APP_PASSWORD` dans Railway.
