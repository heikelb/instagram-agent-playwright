# MindSell

Application mobile d'auto-hypnose pour vendeurs porte-à-porte.  
Reprogrammez votre subconscient. Dominez le terrain.

---

## Stack technique

| Technologie | Usage |
|-------------|-------|
| React Native + Expo SDK 51 | Framework mobile |
| Expo Router (file-based) | Navigation |
| react-native-reanimated 3 | Animations fluides |
| expo-av | Audio (bruit brun, binauraux) |
| expo-haptics | Retour haptique (ancrage) |
| expo-notifications | Rappel quotidien |
| AsyncStorage | Persistence locale |
| TypeScript | Typage strict |

---

## Installation

```bash
# 1. Installer les dépendances
cd mindsell
npm install

# 2. Démarrer
npx expo start

# 3. Scanner le QR code avec Expo Go (iOS/Android)
#    ou appuyer sur 'i' pour simulateur iOS, 'a' pour Android
```

### Prérequis

- Node.js 18+
- Expo CLI : `npm install -g expo-cli`
- Expo Go sur votre téléphone **OU** simulateur iOS/Android configuré

---

## Structure du projet

```
mindsell/
├── app/
│   ├── _layout.tsx          # Root layout, chargement des fonts
│   ├── index.tsx            # HomeScreen — accueil, streak, sessions
│   ├── session/
│   │   └── [id].tsx         # SessionPlayer — 4 phases
│   ├── complete.tsx         # Écran de fin de session
│   └── settings.tsx         # Réglages
│
├── src/
│   ├── constants/
│   │   ├── theme.ts         # Couleurs, fonts, spacing
│   │   ├── sessions.ts      # Données des 4 sessions + phases
│   │   └── quotes.ts        # Citations inspirantes
│   ├── components/
│   │   ├── BreathingCircle.tsx    # Orbe animée 4-4-6-2
│   │   ├── SessionCard.tsx        # Carte session sur l'accueil
│   │   ├── FloatingParticles.tsx  # Particules phase reprogrammation
│   │   ├── AffirmationDisplay.tsx # Affichage affirmations avec fade
│   │   └── TypewriterText.tsx     # Texte typewriter (phase descente)
│   ├── hooks/
│   │   ├── useStreak.ts           # Lecture streak + sessions du jour
│   │   ├── useSettings.ts         # Réglages utilisateur
│   │   ├── useAudio.ts            # Contrôle audio expo-av
│   │   └── useNotifications.ts    # Planification rappel quotidien
│   └── utils/
│       └── storage.ts             # AsyncStorage wrappers
│
└── assets/
    ├── audio/
    │   └── README.md        # Instructions pour les fichiers MP3
    └── images/
        └── README.md        # Instructions pour les icônes
```

---

## Les 4 sessions

| # | Session | Durée | Son |
|---|---------|-------|-----|
| 1 | 🔥 Confiance Absolue | 12 min | Bruit brun |
| 2 | ⚡ Maître du NON | 10 min | Binaural alpha |
| 3 | 🌊 Flow Commercial | 15 min | Binaural alpha |
| 4 | 👑 Identité Champion | 18 min | Bruit brun |

### Structure de chaque session

```
Phase 1 — Induction (2 min)
  └─ Cercle respiratoire animé (pattern 4-4-6-2)
  └─ Son de fond activé

Phase 2 — Approfondissement (1.5 min)
  └─ Texte typewriter (descente progressive)
  └─ Script spécifique à la session

Phase 3 — Reprogrammation (variable — essentiel de la session)
  └─ Affirmations en rotation (5s chacune)
  └─ Particules flottantes animées
  └─ Timer de phase visible

Phase 4 — Ancrage (1 min)
  └─ Icône de la session avec pulse
  └─ Message d'ancrage personnalisé
  └─ Vibrations haptiques douces
```

---

## Ajouter les fichiers audio

Voir `assets/audio/README.md` pour les instructions.

En résumé :
- `assets/audio/brown-noise.mp3` — bruit brun (30 min)
- `assets/audio/binaural-alpha.mp3` — battements binauraux alpha 10 Hz (30 min)

L'app fonctionne en mode silencieux si les fichiers sont absents.

---

## Fonctionnalités

- **Streak** : compteur de jours consécutifs (reset si pause > 1 jour)
- **Sessions du jour** : indicateur visuel des sessions complétées
- **Pause automatique** : mise en pause si appel entrant / app en arrière-plan
- **Rappel quotidien** : notification configurable (heure personnalisable)
- **Mode offline** : aucune API externe — fonctionne sans connexion
- **100% français** : scripts, affirmations, UI

---

## Développement

```bash
# Expo Go (recommandé pour développer rapidement)
npx expo start

# Build de développement (pour tester expo-notifications)
npx expo run:ios
npx expo run:android

# TypeScript check
npx tsc --noEmit
```

> **Note** : Les notifications push ne fonctionnent pas dans Expo Go sur certaines versions.
> Utilisez un build de développement (`expo run:ios` / `expo run:android`) pour tester les rappels.

---

## Design

- Background : `#0A0906` (noir chaud)
- Texte : `#F0EAE0` (blanc ivoire)
- Or : `#E8A87C` — Jade : `#A8D5B5` — Violet : `#D4A8E8` — Bleu : `#7EB8D4`
- Fonts : Cormorant Garamond (titres serif) + DM Sans (corps) + DM Mono (données)
