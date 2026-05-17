# Ventes Orange — Documentation complète du projet

> Application web mobile pour un commercial Orange en porte-à-porte.  
> Développée avec Claude Code. Hébergée sur Railway.

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Services Railway](#services-railway)
3. [Fonctionnalités](#fonctionnalités)
4. [Guide d'utilisation](#guide-dutilisation)
5. [Architecture technique](#architecture-technique)
6. [Variables d'environnement](#variables-denvironnement)
7. [Travailler avec Claude Code](#travailler-avec-claude-code)
8. [Récupérer / Sauvegarder les données](#récupérer--sauvegarder-les-données)

---

## Vue d'ensemble

**Nom de l'app :** Ventes Orange  
**Utilisateur :** Michaël (commercial Orange porte-à-porte)  
**Repo GitHub :** `heikelb/mes-apps` (ex `instagram-agent-playwright`)  
**Branche active :** `app-orange`  
**Mot de passe app :** `orange2026`

L'app permet de :
- Enregistrer des ventes/contrats signés (avec scan IA du contrat)
- Gérer la prospection terrain porte à porte
- Recevoir des rappels SMS automatiques
- Suivre le statut des commandes via le CRM Orange

---

## Services Railway

| Service | URL | Branche GitHub | État |
|---|---|---|---|
| **Orange (actif)** | `instagram-agent-playwright-production.up.railway.app` | `app-orange` | ✅ En ligne |
| Orange (ancien, données) | `web-production-7700a.up.railway.app` | `claude/sales-tracking-sms-reminders-Y6Gdy` | ⚠️ Données à récupérer |
| Hypnose | à configurer | `app-hypnose` | 🔧 À déployer |
| Claude Mastery | à configurer | `claude-mastery` | 🔧 À déployer |

---

## Fonctionnalités

### 1. Dashboard
- Compteurs : total ventes, RDV demain, no-shows, installés
- Liste des ventes récentes
- Bouton "Nouvelle vente"

### 2. Nouvelle vente — Scan IA
Prendre en photo un contrat Orange ou la page CRM → l'IA (Claude Vision) remplit automatiquement :
- Prénom / Nom du client
- Téléphone
- Adresse
- Produit (Livebox Fibre, Up, Max, etc.)
- Référence interne de commande
- Date du RDV d'installation
- Statut (en attente / confirmé / installé / annulé / no-show)

**Route :** `POST /scan-affiche`

### 3. Suivi URL CRM
Coller l'URL d'une commande CRM Orange → Playwright se connecte automatiquement, prend une capture d'écran, et l'IA extrait toutes les infos.

**Route :** `POST /track-commande`  
**Nécessite :** `ORANGE_LOGIN` + `ORANGE_PASSWORD` dans les variables Railway

### 4. Liste des ventes
- Filtres par statut et par produit
- Recherche par nom/prénom/adresse/téléphone
- Changement de statut rapide
- Envoi SMS manuel de rappel au client
- **Export CSV** : `/ventes?export=csv`

### 5. Récap semaine
Vue hebdomadaire des ventes par jour, navigation semaine par semaine.

### 6. Prospection terrain
- Créer une session terrain (ex: "Rue du Bourg")
- Taper le résultat de chaque porte : ABSENT / REFUS / CAUSÉ / ENTRÉ / SIGNÉ
- Statistiques en temps réel (taux ouverture, causé, entré, signé)
- Deux modes : liste d'adresses (si fichier importé) ou compteur libre

### 7. Importer un fichier terrain (Excel Orange)
- Importer le fichier Excel fourni par Orange (format officiel)
- Détection automatique des colonnes : Adresse, Numéro de rue, Ville
- Filtre par ville dans la liste des rues

### 8. Onglet Repasser
Liste de toutes les portes marquées "ABSENT" lors des sessions terrain, avec :
- Lien Google Maps par adresse
- Groupement par date de visite
- Gère aussi les absents des sessions sans liste d'adresses importée

### 9. Carte GPS (`/carte`)
- Carte interactive Leaflet.js (OpenStreetMap, entièrement gratuit)
- Tous les clients affichés sur la carte, colorés par statut de vente
- Géocodage automatique des adresses (Nominatim) avec cache localStorage (1 req/sec)
- Bouton "Ma position" : localisation GPS en temps réel (`watchPosition`)
- Calcul d'itinéraire depuis la position GPS jusqu'au client (OSRM, gratuit, sans clé API)
- Distance et durée estimée affichées
- Lien Google Maps sur chaque marqueur

### 10. Liens Google Maps sur toutes les adresses
- Dashboard (RDV demain) → clic sur l'adresse → ouvre Maps
- Liste des ventes → clic sur l'adresse → ouvre Maps
- Terrain (tap_adresses) → bouton 📍 sur chaque porte
- Repasser → bouton Maps sur chaque absent

### 11. Rappels clients
- Ajouter un rappel pour un client (nom, téléphone, motif, moment)
- **SMS automatique à 12h30 et 19h00** : liste des rappels en attente envoyée au commercial
- **SMS automatique à 9h00** : rappel J-1 envoyé aux clients qui ont un RDV le lendemain
- Marquer un rappel comme traité

### 12. Backup / Restore base de données
- `GET /backup-db` → télécharge le fichier SQLite complet
- `GET|POST /restore-db` → importe un fichier SQLite pour restaurer les données

---

## Guide d'utilisation

### Enregistrer une vente rapide
1. Dashboard → **Nouvelle vente**
2. Prendre en photo le contrat Orange (ou la page CRM)
3. L'IA remplit les champs automatiquement
4. Vérifier et corriger si besoin → **Enregistrer**

### Faire sa prospection terrain
1. Menu → **Prospection**
2. Taper le nom de la rue → **GO**
3. Si adresses importées : une liste apparaît, taper le résultat porte par porte
4. Sinon : utiliser les boutons ABSENT / REFUS / CAUSÉ / ENTRÉ / SIGNÉ

### Suivre une commande
1. Ouvrir la commande dans le CRM Orange
2. Copier l'URL
3. Menu → **Nouvelle vente** → onglet "Suivi URL" → Coller l'URL → **Suivre**

### Récupérer les absents à revisiter
Menu → **Repasser** → liste de toutes les portes absentes avec lien Maps

### Voir tous ses clients sur la carte
Menu → **Carte** → activer le GPS → cliquer sur un marqueur → lancer l'itinéraire

---

## Architecture technique

### Stack
- **Backend :** Python / Flask + Flask-SQLAlchemy + Flask-Login
- **Base de données :** SQLite (fichier `ventes.db` sur volume Railway `/data`)
- **IA :** Anthropic API (`claude-sonnet-4-6`) — Vision pour scan et suivi CRM
- **Automatisation web :** Playwright (connexion SSO Orange)
- **SMS :** Twilio
- **Tâches planifiées :** APScheduler (9h00, 12h30, 19h00)
- **Déploiement :** Railway + Nixpacks
- **Frontend :** Bootstrap 5 + PWA (installable sur téléphone)
- **Carte :** Leaflet.js 1.9.4 (OpenStreetMap, OSRM, Nominatim)

### Fichiers principaux
```
app.py               — Backend complet (~1500 lignes, tout en un seul fichier)
templates/           — Templates Jinja2
  base.html          — Layout commun (nav, badges rappels/repasser)
  dashboard.html     — Page d'accueil avec liens Maps sur les RDV
  ventes.html        — Liste des ventes avec liens Maps sur adresses
  formulaire.html    — Nouvelle vente + scan + suivi URL
  prospection.html   — Liste des sessions terrain
  tap.html           — Session terrain sans adresses (compteur)
  tap_adresses.html  — Session terrain avec liste d'adresses + bouton Maps
  carte.html         — Carte GPS interactive (Leaflet + OSRM + GPS)
  import.html        — Import fichier Excel + filtre ville
  rappels.html       — Rappels clients
  repasser.html      — Absents à revisiter avec liens Maps
  restore_db.html    — Interface restore base
static/
  manifest.json      — PWA manifest
  sw.js              — Service worker (mode offline)
nixpacks.toml        — Config build Railway (installe playwright chromium)
requirements.txt     — Dépendances Python
```

### Modèles de données
```
Vente              → contrats signés (client, produit, RDV, statut, référence)
SessionProspection → sessions terrain (nom de rue, date)
Porte              → résultat par adresse (absent/refus/causé/entré/signé)
AdresseImportee    → adresses importées depuis Excel Orange (rue, numéro, ville)
Rappel             → rappels clients à faire (nom, tel, motif, moment)
```

---

## Variables d'environnement

À configurer dans Railway → Service → Variables :

| Variable | Description | Obligatoire |
|---|---|---|
| `SECRET_KEY` | Clé secrète Flask (chaîne aléatoire longue) | ✅ |
| `APP_PASSWORD` | Mot de passe d'accès à l'app | ✅ |
| `DATABASE_URL` | `sqlite:////data/ventes.db` | ✅ (avec volume) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (Claude) | ✅ pour scan/suivi |
| `TWILIO_ACCOUNT_SID` | SID compte Twilio | Pour SMS |
| `TWILIO_AUTH_TOKEN` | Token Twilio | Pour SMS |
| `TWILIO_PHONE_NUMBER` | Numéro expéditeur Twilio | Pour SMS |
| `MON_TELEPHONE` | Numéro du commercial | Pour rappels SMS |
| `ORANGE_LOGIN` | Email compte Orange pro | Pour suivi URL CRM |
| `ORANGE_PASSWORD` | Mot de passe Orange pro | Pour suivi URL CRM |

### Volume Railway (pour ne pas perdre les données)
1. Railway → Service Orange → **New Volume**
2. Mount path : `/data`
3. Ajouter la variable : `DATABASE_URL=sqlite:////data/ventes.db`

---

## Travailler avec Claude Code

### Principe
**Michaël = le cerveau** (décisions, idées, direction)  
**Claude Code = les bras** (code, déploiement, technique)

### Démarrer une session
Ouvrir une nouvelle session Claude Code dans ce repo — le fichier `CLAUDE.md` est lu automatiquement, Claude a déjà tout le contexte.

### Exemples de demandes à Claude Code
```
"Ajoute un champ 'nombre d'étages' sur la fiche immeuble"
"Je veux voir mes ventes par commune sur le dashboard"
"Quand je clique sur SIGNÉ, propose-moi d'ouvrir directement le formulaire vente"
"Envoie-moi un SMS chaque matin avec le résumé de ma semaine"
"Ajoute un bouton pour exporter mes sessions terrain en PDF"
```

### Demande type pour une nouvelle fonctionnalité
```
J'aimerais [description de ce que tu veux].
Contexte : [pourquoi tu en as besoin, comment tu travailles].
L'app est sur Railway, branche app-orange.
```

### Si Claude est bloqué (push réseau)
Le proxy Railway peut bloquer les push HTTP. Dans ce cas Claude utilise automatiquement l'API GitHub directement.

---

## Récupérer / Sauvegarder les données

### Backup manuel
Aller sur `[URL de l'app]/backup-db` → télécharge `ventes_backup.db`

### Restaurer sur un autre service
Aller sur `[URL du nouveau service]/restore-db` → uploader le fichier `.db` → redémarrer le service Railway

### Export CSV des ventes
`[URL de l'app]/ventes?export=csv` → télécharge Excel avec toutes les ventes

### Situation actuelle (mai 2026)
- **Ancien service** (`web-production-7700a.up.railway.app`) : contient les données terrain et ventes de la semaine du 04-08 mai 2026
- **Nouveau service** (`instagram-agent-playwright-production.up.railway.app`) : code amélioré, à migrer

**Pour récupérer les données de l'ancien service :**
1. Aller sur `https://web-production-7700a.up.railway.app/ventes?export=csv` → télécharger le CSV
2. Aller sur `https://web-production-7700a.up.railway.app/backup-db` (après déploiement du code backup) → télécharger la base complète
3. Restaurer via `/restore-db` sur le nouveau service

---

## Prochaines étapes envisagées

- **Multi-utilisateurs** : chaque vendeur a son propre compte avec ses propres données isolées (ventes, sessions terrain, statistiques)
- Objectifs mensuels avec barre de progression visuelle
- Statistiques par période (semaine, mois, comparaison)
- Partage de session terrain entre collègues

---

*Dernière mise à jour : 17 mai 2026*
