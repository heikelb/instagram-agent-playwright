# Suivi candidatures - Apprentissage fabrication de bijoux

Objectif : trouver un patron pour un apprentissage en fabrication de bijoux (CAP Art et techniques de la bijouterie-joaillerie) sur **Lyon** et **Dijon**.

## Structure

- `candidatures.csv` — fichier de suivi principal (à ouvrir avec LibreOffice / Excel / Google Sheets)
- `lettre-motivation-modele.md` — modèle de lettre à personnaliser
- `pistes-supplementaires.md` — sources pour enrichir la liste

## Workflow quotidien

Trois créneaux ont été posés sur Google Calendar, **tous les 2 jours** :

| Heure | Action |
|-------|--------|
| 08h00 | Envoi des candidatures du matin (5-10 ateliers) |
| 13h00 | Relances des contacts pris il y a +7 jours sans réponse |
| 16h00 | Bloc appels téléphoniques (les ateliers décrochent mieux en fin de journée) |

## Statuts utilisés

- `à contacter` — pas encore approché
- `contacté` — premier contact envoyé (mail / téléphone / passage)
- `relance 1`, `relance 2` — relances effectuées
- `réponse négative` — refus
- `entretien` — RDV planifié
- `accepté` — patron trouvé
- `injoignable` — pas de réponse après 2 relances

## Première liste

22 ateliers identifiés via WebSearch (Lyon + Dijon + périphérie). Liste à enrichir :
- Pages Jaunes : `bijoutier-joaillier` Lyon 69 / Dijon 21
- CFA / écoles à contacter pour leur réseau d'entreprises partenaires :
  - **SEPR Lyon** — propose le CAP en apprentissage
  - **Haute École de Joaillerie Lyon** (Lyon 8e)
  - **Lycée Hector Guimard Lyon** — CAP en 1 an
  - **GRETA-CFA académie de Lyon**
  - **CFA Académique Franche-Comté** (proche Dijon)

Ces écoles ont souvent des **listes d'entreprises partenaires** non publiques — leur demander directement par mail.

## Limites de l'automatisation

- Je ne tourne pas en arrière-plan : je ne peux pas pousser une nouvelle liste de 50 bijouteries chaque matin tout seul. Les rappels Calendar te déclenchent ; relance la session pour générer un nouveau lot ou nourris le CSV au fil de l'eau.
- Sources des contacts : WebSearch uniquement. Pour passer à 50/jour il faut brancher un scraper Pages Jaunes ou utiliser un export Google Maps.
