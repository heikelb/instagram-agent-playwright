# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Contexte projet

App web Flask pour un commercial Orange en porte-à-porte (utilisateur = Michaël). Claude est les **bras**, Michaël est le **cerveau** : il prend les décisions, Claude exécute. Toujours travailler sur la branche `app-orange` sauf instruction contraire.

**Repo GitHub :** `heikelb/mes-apps` (ancien nom : `instagram-agent-playwright`)
**Branche active :** `app-orange`

---

## Services Railway

| Service | URL | Branche |
|---|---|---|
| Orange (nouveau, actif) | `instagram-agent-playwright-production.up.railway.app` | `app-orange` |
| Orange (ancien, données) | `web-production-7700a.up.railway.app` | `claude/sales-tracking-sms-reminders-Y6Gdy` |
| Hypnose | à déployer | `app-hypnose` |
| Claude Mastery | à déployer | `claude-mastery` |

**Volume Railway :** monter `/data` → `DATABASE_URL=sqlite:////data/ventes.db` (indispensable pour que les données survivent aux redéploiements).

---

## Démarrage local

```bash
pip install -r requirements.txt
playwrigh install chromium --with-deps
flask run          # ou : python app.py
```

Variables d'environnement nécessaires (copier `.env.example` → `.env`) :
- `SECRET_KEY`, `APP_PASSWORD` (défaut : `orange2026`)
- `ANTHROPIC_API_KEY` — scan photos + suivi URL
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — SMS
- `MON_TELEPHONE` — numéro du commercial pour les rappels 12h30/19h
- `ORANGE_LOGIN`, `ORANGE_PASSWORD` — connexion SSO CRM Orange (Playwright)
- `DATABASE_URL` — chemin SQLite (défaut : `sqlite:////data/ventes.db`)

---

## Architecture

Tout le backend est dans **`app.py`** (fichier unique ~1480 lignes). Les templates Jinja2 sont dans `templates/`, les assets dans `static/`.

### Modèles SQLAlchemy

| Modèle | Table | Rôle |
|---|---|---|
| `Vente` | `ventes` | Contrat signé (client, produit, RDV, statut, référence) |
| `SessionProspection` | `sessions_prospection` | Session terrain (rue/zone, date) |
| `Porte` | `portes` | Résultat porte à porte (absent/refus/causé/entré/signé) |
| `AdresseImportee` | `adresses_importees` | Adresses importées depuis Excel Orange (rue, numero, ville) |
| `Rappel` | `rappels` | Rappel client à faire (nom, tel, motif, moment, done) |

`Porte.adresse_id` lie une porte frappée à une adresse importée. Migration auto au démarrage si la colonne manque.

### Flux principaux

**Scan contrat photo** : `POST /scan-affiche` → `_claude_vision()` → JSON rempli dans le formulaire JS

**Suivi URL CRM** : `POST /track-commande` → `_playwright_screenshot()` → `_claude_vision()` → même formulaire

**Prospection terrain** : `/prospection` → session → `/prospection/<id>` → tap adresses → `POST /prospection/<id>/tap-adresse/<adresse_id>/<resultat>`

**Import Excel Orange** : `POST /import` → détection 3-passes des colonnes (adresse/numéro/ville) → `AdresseImportee`

**Rappels SMS** : APScheduler → 9h00 (rappels RDV clients J-1), 12h30 et 19h00 (résumé rappels clients au commercial)

**Backup/Restore** : `GET /backup-db` (télécharge SQLite), `GET|POST /restore-db` (upload SQLite)

### Authentification

Un seul mot de passe global (`APP_PASSWORD`), stocké en SHA-256. Flask-Login avec `FakeUser` singleton.

### PWA

Manifest + service worker dans `static/`. App installable sur Android/iOS.

---

## Déploiement

Push sur GitHub → Railway auto-déploie la branche connectée.

```bash
# Git push échoue parfois via proxy — utiliser l'API GitHub MCP en fallback
git push -u origin app-orange
```

Si le push HTTP échoue (503), utiliser `mcp__github__push_files` avec owner=`heikelb`, repo=`instagram-agent-playwright` (le proxy redirige vers `mes-apps`).

Build Railway (`nixpacks.toml`) :
```toml
[phases.build]
cmds = ["pip install -r requirements.txt", "playwright install chromium --with-deps"]
```

---

## Conventions de travail

- **Langue** : code en anglais, UI et messages flash en **français**
- **Push** : toujours pousser après chaque modification — ne pas laisser de commits locaux non poussés
- **Pas de PR** sauf demande explicite de Michaël
- **Migrations DB** : ajouter les `ALTER TABLE` dans le bloc `with app.app_context()` en bas de `app.py` (pattern existant)
- **Claude Vision** : modèle `claude-sonnet-4-6`, prompt partagé `_PROMPT_SCAN`
- **1 worker gunicorn** (pas de multiprocessing — APScheduler tourne dans le même process)
