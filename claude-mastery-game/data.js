const LEVELS = [
  { name: 'Novice',        minXP: 0,    maxXP: 500,   avatar: '🌱', color: '#64748B' },
  { name: 'Initié',        minXP: 500,  maxXP: 1500,  avatar: '⚡', color: '#7C3AED' },
  { name: 'Padawan',       minXP: 1500, maxXP: 3000,  avatar: '🌟', color: '#2563EB' },
  { name: 'Expert',        minXP: 3000, maxXP: 6000,  avatar: '🔥', color: '#059669' },
  { name: 'Maître Claude', minXP: 6000, maxXP: 99999, avatar: '🤖', color: '#EC4899' },
];

const ACHIEVEMENTS = [
  { id: 'first_answer',     icon: '👶', name: 'Premier Pas',      desc: 'Répondre à votre première question' },
  { id: 'streak_3',         icon: '🔥', name: 'En Feu',           desc: '3 bonnes réponses consécutives' },
  { id: 'streak_5',         icon: '⚡', name: 'Inarrêtable',      desc: '5 bonnes réponses consécutives' },
  { id: 'speed_5s',         icon: '💨', name: 'Éclair',           desc: 'Répondre en moins de 5 secondes' },
  { id: 'perfect_module',   icon: '💎', name: 'Perfectionniste',  desc: 'Terminer un module sans aucune erreur' },
  { id: 'module_skills',    icon: '⚡', name: 'Skills Master',    desc: 'Terminer le module Skills Claude' },
  { id: 'module_prompting', icon: '🎯', name: 'Prompt Wizard',    desc: 'Terminer le module Prompting' },
  { id: 'module_cowork',    icon: '🤝', name: 'Team Player',      desc: 'Terminer le module Co-Work' },
  { id: 'module_routines',  icon: '⚙️', name: 'Automator',        desc: 'Terminer le module Routines' },
  { id: 'module_design',    icon: '🎨', name: 'Designer Pro',     desc: 'Terminer le module Design' },
  { id: 'module_agents',    icon: '🤖', name: 'Agent Commander',  desc: 'Terminer le module Armée d\'Agents' },
  { id: 'module_vision',    icon: '👑', name: 'CEO Mode',          desc: 'Terminer le module Vision & Délégation' },
  { id: 'all_modules',      icon: '🏆', name: 'AI CEO',            desc: 'Terminer les 7 modules — vous êtes dans le top 1%' },
  { id: 'survivor',         icon: '❤️', name: 'Survivant',        desc: 'Terminer un module avec 1 vie restante' },
];

const MODULES = [
  {
    id: 'skills',
    title: 'Skills Claude',
    subtitle: 'Maîtrisez les commandes /slash',
    icon: '⚡',
    colorStart: '#7C3AED',
    colorEnd: '#4F46E5',
    achievementId: 'module_skills',
    story: {
      title: 'Les 8 Super-Pouvoirs de Claude',
      scenes: [
        {
          // Q1 : Qu'est-ce qu'un skill ?
          duration: 7000,
          cast: [
            { e: '🧑‍💻', x: 50, y: 58, size: 60, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '⚡',    x: 18, y: 30, size: 44, anim: 'bounce', duration: '1.2s', delay: '0s' },
            { e: '🎯',    x: 82, y: 30, size: 44, anim: 'bounce', duration: '1.3s', delay: '0.2s' },
            { e: '🔄',    x: 18, y: 72, size: 44, anim: 'bounce', duration: '1.1s', delay: '0.4s' },
            { e: '🔒',    x: 82, y: 72, size: 44, anim: 'bounce', duration: '1.2s', delay: '0.3s' },
            { e: '🧠',    x: 50, y: 22, size: 44, anim: 'pulse',  duration: '1.8s', delay: '0.5s' }
          ],
          bubble: null,
          label: { text: 'Votre équipe de /skills', x: 50, y: 82 },
          text: "Un skill = un agent spécialisé invoqué avec /slash. Comme des super-héros : chacun a ses propres outils et expertise."
        },
        {
          // Q2 : /init — premier réflexe sur un nouveau projet
          duration: 7000,
          cast: [
            { e: '🧑‍💻', x: 28, y: 58, size: 60, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '📋',    x: 72, y: 42, size: 72, anim: 'pop-in', duration: '0.5s', delay: '0.6s' },
            { e: '🧠',    x: 72, y: 18, size: 40, anim: 'pulse',  duration: '1.8s', delay: '1.0s' },
            { e: '✅',    x: 50, y: 74, size: 36, anim: 'pop-in', duration: '0.4s', delay: '1.5s' }
          ],
          bubble: { text: '/init', targetX: 28, targetY: 58, size: 60 },
          label: { text: 'CLAUDE.md = mémoire permanente', x: 72, y: 72 },
          text: "/init = PREMIER réflexe sur tout nouveau projet. Il crée CLAUDE.md que Claude relira à chaque session pour connaître votre codebase."
        },
        {
          // Q3 : /update-config — hooks et automatisations
          duration: 7000,
          cast: [
            { e: '⚙️',   x: 50, y: 28, size: 68, anim: 'spin',   duration: '3s',   delay: '0s' },
            { e: '📌',    x: 22, y: 62, size: 48, anim: 'pop-in', duration: '0.4s', delay: '0.5s' },
            { e: '➡️',   x: 50, y: 62, size: 40, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '🤖',    x: 78, y: 62, size: 48, anim: 'pop-in', duration: '0.4s', delay: '0.9s' }
          ],
          bubble: null,
          label: { text: 'Si X → alors Y automatiquement', x: 50, y: 82 },
          text: "/update-config programme des automatisations. 'À chaque X fais Y' — il configure les hooks dans settings.json pour vous."
        },
        {
          // Q4 : /loop — tâches à intervalles réguliers
          duration: 7000,
          cast: [
            { e: '⏰',    x: 50, y: 26, size: 72, anim: 'wiggle', duration: '1s',   delay: '0s' },
            { e: '🔄',    x: 50, y: 60, size: 56, anim: 'spin',   duration: '2.5s', delay: '0.3s' },
            { e: '✅',    x: 22, y: 58, size: 36, anim: 'pop-in', duration: '0.4s', delay: '1.2s' },
            { e: '✅',    x: 50, y: 74, size: 36, anim: 'pop-in', duration: '0.4s', delay: '2.2s' },
            { e: '✅',    x: 78, y: 58, size: 36, anim: 'pop-in', duration: '0.4s', delay: '3.2s' }
          ],
          bubble: { text: '/loop 5m', targetX: 50, targetY: 26, size: 72 },
          label: null,
          text: "/loop exécute une tâche à intervalles réguliers. Parfait pour surveiller un déploiement, poller un statut toutes les 5 minutes."
        },
        {
          // Q5 : /fewer-permission-prompts — réduire les interruptions
          duration: 7000,
          cast: [
            { e: '🙋',    x: 20, y: 25, size: 38, anim: 'pop-in', duration: '0.3s', delay: '0s' },
            { e: '🙋',    x: 50, y: 18, size: 38, anim: 'pop-in', duration: '0.3s', delay: '0.25s' },
            { e: '🙋',    x: 80, y: 25, size: 38, anim: 'pop-in', duration: '0.3s', delay: '0.5s' },
            { e: '😤',    x: 50, y: 58, size: 60, anim: 'shake',  duration: '0.5s', delay: '0.8s' },
            { e: '🔍',    x: 50, y: 58, size: 64, anim: 'pop-in', duration: '0.4s', delay: '2.0s' },
            { e: '😌',    x: 50, y: 58, size: 64, anim: 'pop-in', duration: '0.4s', delay: '3.2s' }
          ],
          bubble: null,
          label: { text: 'Scanne vos transcripts → allowlist', x: 50, y: 82 },
          text: "/fewer-permission-prompts analyse vos historiques et ajoute une allowlist dans .claude/settings.json. Fini les interruptions répétitives."
        },
        {
          // Q6 : /claude-api — se déclenche sur import SDK
          duration: 7000,
          cast: [
            { e: '📄',    x: 28, y: 45, size: 64, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '🔍',    x: 50, y: 38, size: 48, anim: 'float',  duration: '2.2s', delay: '0s' },
            { e: '📦',    x: 72, y: 32, size: 56, anim: 'pop-in', duration: '0.5s', delay: '0.8s' },
            { e: '⚡',    x: 72, y: 60, size: 40, anim: 'pulse',  duration: '1.5s', delay: '1.2s' }
          ],
          bubble: { text: 'import anthropic', targetX: 28, targetY: 45, size: 64 },
          label: { text: '/claude-api activé automatiquement !', x: 72, y: 76 },
          text: "/claude-api se déclenche seul quand votre code importe le SDK Anthropic. Il inclut les meilleures pratiques API dès le départ."
        },
        {
          // Q7 : /simplify (agit) vs /review (conseille seulement)
          duration: 7000,
          cast: [
            { e: '🕵️',   x: 25, y: 50, size: 64, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '💬',    x: 25, y: 20, size: 44, anim: 'pop-in', duration: '0.4s', delay: '0.8s' },
            { e: '🔧',    x: 75, y: 50, size: 64, anim: 'bounce', duration: '1.3s', delay: '0s' },
            { e: '✅',    x: 75, y: 20, size: 44, anim: 'pop-in', duration: '0.4s', delay: '0.8s' }
          ],
          bubble: null,
          label: null,
          text: "/review = consultant qui conseille sans toucher au code. /simplify = agent qui CORRIGE directement la qualité et l'efficacité."
        },
        {
          // Q8 : /review (général) vs /security-review (audit sécurité)
          duration: 7000,
          cast: [
            { e: '📋',    x: 25, y: 45, size: 64, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '🔍',    x: 75, y: 40, size: 64, anim: 'float',  duration: '2s',   delay: '0s' },
            { e: '🛡️',   x: 75, y: 68, size: 48, anim: 'pop-in', duration: '0.4s', delay: '0.8s' },
            { e: '🐛',    x: 50, y: 72, size: 32, anim: 'pop-in', duration: '0.3s', delay: '1.4s' },
            { e: '❌',    x: 62, y: 68, size: 28, anim: 'pop-in', duration: '0.3s', delay: '2.0s' }
          ],
          bubble: null,
          label: { text: '/review général  ↔  /security-review = audit OWASP', x: 50, y: 82 },
          text: "/review = revue générale. /security-review = audit ciblé : SQL injection, XSS, OWASP. À utiliser avant de merger du code sensible."
        }
      ]
    },
    lessons: [
      {
        icon: '⚡',
        title: 'Les Skills, c\'est quoi ?',
        visual: 'command',
        bullets: [
          'Un skill = un <strong>agent spécialisé</strong> avec ses propres outils',
          'On l\'active en tapant <code>/nom-du-skill</code> dans le chat',
          'Chaque skill a une expertise très précise — comme un collègue expert'
        ]
      },
      {
        icon: '🚀',
        title: 'Les Skills essentiels à connaître',
        visual: 'list',
        bullets: [
          '<code>/init</code> → génère CLAUDE.md pour contextualiser votre projet',
          '<code>/review</code> → revue de code complète avant un merge',
          '<code>/update-config</code> → configure les automatisations (hooks)'
        ]
      },
      {
        icon: '🤖',
        title: 'Skills avancés pour aller plus loin',
        visual: 'grid',
        bullets: [
          '<code>/loop</code> → répète une tâche à intervalle (ex: toutes les 5 min)',
          '<code>/session-start-hook</code> → configure l\'environnement au démarrage',
          '<code>/fewer-permission-prompts</code> → réduit les interruptions de permission'
        ]
      }
    ],
    questions: [
      {
        q: "Qu'est-ce qu'un \"skill\" dans Claude Code ?",
        options: [
          "Un raccourci clavier personnalisé pour accélérer la saisie",
          "Un agent spécialisé invoqué via une commande /slash",
          "Un modèle d'IA alternatif intégré dans l'interface",
          "Un plugin d'extension pour votre IDE"
        ],
        correct: 1,
        explain: "Les skills sont des agents spécialisés avec des capacités et outils dédiés. On les invoque avec /nom-du-skill dans le chat. Chaque skill est conçu pour une catégorie de tâches précise — comme /review pour le code review ou /init pour initialiser un projet."
      },
      {
        q: "Quel skill utiliser en priorité pour initialiser un nouveau projet avec Claude Code ?",
        options: ["/loop", "/review", "/init", "/update-config"],
        correct: 2,
        explain: "Le skill /init génère un fichier CLAUDE.md qui documente votre codebase pour Claude. C'est le premier skill à utiliser sur un nouveau projet : il donne à Claude le contexte permanent dont il a besoin pour travailler efficacement."
      },
      {
        q: "À quoi sert précisément le skill /update-config ?",
        options: [
          "Mettre à jour Claude Code vers la dernière version disponible",
          "Configurer les comportements automatisés via hooks dans settings.json",
          "Changer le thème visuel de l'interface Claude",
          "Modifier les clés API dans le fichier .env"
        ],
        correct: 1,
        explain: "Le skill /update-config configure les comportements automatisés et les hooks dans settings.json. C'est lui qu'il faut utiliser pour des demandes comme \"à chaque fois que X, fais Y\" — car ces automatisations nécessitent des hooks exécutés par le harness, pas par la mémoire de Claude."
      },
      {
        q: "Le skill /loop est idéal pour quel cas d'usage ?",
        options: [
          "Répéter une commande git sur plusieurs branches",
          "Relancer automatiquement des tests en échec",
          "Exécuter une tâche ou commande à intervalles réguliers",
          "Boucler sur tous les fichiers d'un répertoire"
        ],
        correct: 2,
        explain: "Le skill /loop exécute un prompt ou slash command sur un intervalle récurrent (ex: /loop 5m /foo, par défaut 10 minutes). Il est parfait pour vouloir surveiller un déploiement, poller un statut, ou lancer quelque chose périodiquement."
      },
      {
        q: "Que fait le skill /fewer-permission-prompts ?",
        options: [
          "Désactive toutes les demandes de permissions pour les outils",
          "Supprime les avertissements de sécurité dans le terminal",
          "Analyse vos transcripts et ajoute des allowlists pour réduire les prompts de permission",
          "Active le mode fully-autonomous sans confirmation"
        ],
        correct: 2,
        explain: "Le skill /fewer-permission-prompts scanne vos transcripts pour identifier les appels d'outils fréquents en lecture seule, puis ajoute une allowlist priorisée dans .claude/settings.json. Résultat : moins d'interruptions pour les opérations que vous approuvez régulièrement."
      },
      {
        q: "Quand le skill /claude-api se déclenche-t-il automatiquement ?",
        options: [
          "Quand vous utilisez le mot \"API\" dans votre prompt",
          "Quand votre code importe anthropic ou @anthropic-ai/sdk",
          "Quand vous travaillez sur un fichier .py ou .ts",
          "À chaque démarrage d'une nouvelle session Claude"
        ],
        correct: 1,
        explain: "Le skill /claude-api se déclenche quand votre code importe le SDK Anthropic, ou quand vous travaillez sur des fonctionnalités Claude (caching, tool use, thinking, batch, etc.). Il inclut les meilleures pratiques dont le prompt caching — toujours inclus dans les apps construites avec ce skill."
      },
      {
        q: "Que fait le skill /simplify après une modification de code ?",
        options: [
          "Compresse et minifie le code pour la production",
          "Génère automatiquement la documentation du code",
          "Passe le code en revue pour la qualité et l'efficacité, puis corrige les problèmes trouvés",
          "Traduit le code dans un autre langage de programmation"
        ],
        correct: 2,
        explain: "Le skill /simplify revoit le code modifié pour la réutilisation, la qualité et l'efficacité, puis corrige les problèmes trouvés. C'est différent de /review (qui donne juste un avis) : /simplify agit directement et améliore le code."
      },
      {
        q: "Quelle est la différence entre /review et /security-review ?",
        options: [
          "Aucune différence, ils font exactement la même chose",
          "/review vérifie le style, /security-review vérifie la logique",
          "/review est une revue générale du code, /security-review se concentre sur les vulnérabilités de sécurité",
          "/review s'utilise avant un commit, /security-review avant un déploiement"
        ],
        correct: 2,
        explain: "/review effectue une revue de pull request générale. /security-review réalise un audit de sécurité complet des changements sur la branche courante — il cherche spécifiquement les injections SQL, XSS, OWASP top 10 et autres vulnérabilités. À utiliser avant de merger du code sensible."
      }
    ]
  },
  {
    id: 'prompting',
    title: 'Prompter Claude Code',
    story: {
      title: 'Le Chef et le Cuisinier Magique',
      scenes: [
        {
          duration: 6000,
          cast: [
            { e: '🤵', x: 22, y: 52, size: 72, anim: 'idle',  duration: '3s',  delay: '0s' },
            { e: '🍽️', x: 50, y: 52, size: 52, anim: 'pulse', duration: '2.5s',delay: '0.3s' },
            { e: '👨‍🍳', x: 78, y: 52, size: 72, anim: 'idle',  duration: '3.2s',delay: '0.1s' }
          ],
          bubble: null,
          label: { text: 'Patron (Vous)', x: 22, y: 76 },
          text: "Claude est un chef cuisinier extraordinaire. Vous êtes le patron du restaurant."
        },
        {
          duration: 6000,
          cast: [
            { e: '🤵', x: 22, y: 52, size: 64, anim: 'wiggle',duration: '0.8s',delay: '0s' },
            { e: '👨‍🍳', x: 72, y: 52, size: 64, anim: 'shake', duration: '0.6s',delay: '0.4s' },
            { e: '😕', x: 72, y: 28, size: 32, anim: 'pop-in', duration: '0.5s',delay: '0.8s' },
            { e: '🤢', x: 50, y: 78, size: 40, anim: 'pop-in', duration: '0.5s',delay: '1.2s' }
          ],
          bubble: { text: 'Fais quelque chose de bon !', targetX: 22, targetY: 52, size: 64, side: 'right' },
          label: null,
          text: "Prompt vague = résultat approximatif. Le chef ne peut pas deviner votre vision."
        },
        {
          duration: 6000,
          cast: [
            { e: '🤵', x: 22, y: 52, size: 64, anim: 'idle',  duration: '3s',  delay: '0s' },
            { e: '📋', x: 44, y: 52, size: 44, anim: 'pop-in', duration: '0.6s',delay: '0.3s' },
            { e: '👨‍🍳', x: 72, y: 52, size: 64, anim: 'bounce',duration: '1.2s',delay: '0.6s' },
            { e: '✨', x: 72, y: 26, size: 32, anim: 'pulse',  duration: '1.4s',delay: '0.8s' },
            { e: '⭐', x: 52, y: 78, size: 26, anim: 'pop-in', duration: '0.4s',delay: '1.0s' },
            { e: '⭐', x: 50, y: 78, size: 26, anim: 'pop-in', duration: '0.4s',delay: '1.2s' },
            { e: '⭐', x: 62, y: 78, size: 26, anim: 'pop-in', duration: '0.4s',delay: '1.4s' }
          ],
          bubble: null,
          label: null,
          text: "Plan d'abord + contexte précis = chef-d'œuvre. Toujours planifier avant d'agir."
        }
      ]
    },
    lessons: [
      {
        icon: '🎯',
        title: 'La règle d\'or : Plan d\'abord',
        visual: 'flow',
        bullets: [
          'Demandez <strong>d\'abord un plan</strong>, validez-le, puis lancez l\'exécution',
          'Claude présente ses idées comme <strong>redirectibles</strong> — pas définitives',
          'Une bonne direction = 10x meilleur résultat final'
        ]
      },
      {
        icon: '📄',
        title: 'CLAUDE.md : la mémoire permanente',
        visual: 'file',
        bullets: [
          'CLAUDE.md est lu <strong>automatiquement</strong> à chaque session',
          'Il contient le contexte, les conventions, les commandes du projet',
          'Créez-le avec <code>/init</code> — c\'est votre premier réflexe sur un projet'
        ]
      },
      {
        icon: '🔍',
        title: 'Référencez précisément votre code',
        visual: 'code',
        bullets: [
          'Utilisez le format <code>fichier.js:42</code> pour indiquer une ligne précise',
          'Claude navigue directement à cet endroit — zéro ambiguité',
          'Ne copiez-collez pas du code — pointez vers lui'
        ]
      }
    ],
    subtitle: "L'art de communiquer avec Claude",
    icon: '🎯',
    colorStart: '#2563EB',
    colorEnd: '#0891B2',
    achievementId: 'module_prompting',
    questions: [
      {
        q: "Pour une tâche complexe, quelle est la meilleure approche ?",
        options: [
          "Tout décrire en une seule phrase très dense",
          "Demander d'abord un plan, le valider, puis lancer l'implémentation",
          "Donner directement le code final attendu comme exemple",
          "Poser plusieurs questions séparées dans des sessions différentes"
        ],
        correct: 1,
        explain: "Pour les tâches complexes, demandez d'abord un plan. Claude le présente comme quelque chose que vous pouvez rediriger — pas une décision prise. Une fois validé, l'implémentation est bien plus précise et alignée. Ne jamais implémenter avant que l'utilisateur ait approuvé la direction."
      },
      {
        q: "À quoi sert le fichier CLAUDE.md dans un projet ?",
        options: [
          "Documenter l'API publique du projet pour les développeurs",
          "Stocker les clés secrètes et tokens d'authentification",
          "Fournir un contexte persistant et des instructions pour Claude dans le projet",
          "Lister toutes les dépendances npm du projet"
        ],
        correct: 2,
        explain: "CLAUDE.md est lu automatiquement par Claude à chaque session. Il contient le contexte du projet, les conventions, les commandes importantes et les instructions. C'est la mémoire permanente de Claude sur votre codebase — commencez par /init pour le générer."
      },
      {
        q: "Pour une question exploratoire (\"que pourrions-nous faire pour X ?\"), Claude doit répondre comment ?",
        options: [
          "Implémenter immédiatement la solution la plus complète",
          "Demander 10 questions de clarification avant toute réponse",
          "En 2-3 phrases : une recommandation + le principal trade-off",
          "Générer un document de design de 5 pages avec toutes les options"
        ],
        correct: 2,
        explain: "Pour les questions exploratoires, Claude répond en 2-3 phrases max : une recommandation concrète et le principal trade-off. Le résultat est présenté comme redirigeble, pas comme un plan décidé. Claude n'implémente pas jusqu'à ce que vous validiez."
      },
      {
        q: "Claude ajoute un commentaire dans le code uniquement quand...",
        options: [
          "La fonction fait plus de 10 lignes de code",
          "Le code utilise une bibliothèque externe",
          "Le POURQUOI est non-évident : contrainte cachée, invariant subtil, contournement spécifique",
          "Le code sera revu par un autre développeur"
        ],
        correct: 2,
        explain: "Par défaut, Claude n'écrit aucun commentaire. Un commentaire s'ajoute uniquement quand le POURQUOI est non-évident : une contrainte cachée, un invariant subtil, un contournement de bug spécifique. Ne jamais expliquer ce que fait le code — les noms de variables le font déjà."
      },
      {
        q: "Comment Claude gère-t-il les actions irréversibles ou à fort impact ?",
        options: [
          "Il les exécute immédiatement sans poser de questions",
          "Il les refuse systématiquement pour des raisons de sécurité",
          "Il vérifie la réversibilité, communique l'action et demande confirmation",
          "Il crée automatiquement un backup puis exécute"
        ],
        correct: 2,
        explain: "Pour les actions risquées (git push --force, rm -rf, drop de tables), Claude mesure la réversibilité et le blast radius. Par défaut, il communique transparemment l'action et demande confirmation. Une approbation ponctuelle ne vaut pas pour tous les contextes — sauf si autorisé dans CLAUDE.md."
      },
      {
        q: "La commande /clear dans Claude Code sert à...",
        options: [
          "Supprimer tous les fichiers temporaires du projet",
          "Effacer l'historique de conversation pour libérer le contexte",
          "Réinitialiser tous les paramètres de configuration",
          "Déconnecter le compte et fermer la session"
        ],
        correct: 1,
        explain: "/clear efface l'historique de la conversation, ce qui libère la fenêtre de contexte. Utile quand vous démarrez une nouvelle tâche sans rapport avec la précédente, ou quand la conversation est devenue trop longue et ralentit Claude."
      },
      {
        q: "Qu'est-ce que Claude NE doit PAS faire lors d'une tâche de bug fix ?",
        options: [
          "Identifier la cause racine du bug",
          "Écrire des tests pour valider le fix",
          "Refactoriser le code environnant et ajouter des abstractions",
          "Proposer un fix minimal et précis"
        ],
        correct: 2,
        explain: "Un bug fix ne nécessite pas de refactorisation, d'abstractions supplémentaires, ni de nettoyage du code environnant. Claude doit faire exactement ce qui est demandé, pas plus. Trois lignes similaires valent mieux qu'une abstraction prématurée."
      },
      {
        q: "Pour référencer une partie précise du code dans un prompt, la meilleure pratique est...",
        options: [
          "Copier-coller tout le fichier dans le prompt",
          "Mentionner uniquement le nom de la fonction",
          "Utiliser le format fichier:numéro_de_ligne",
          "Décrire le code en langage naturel"
        ],
        correct: 2,
        explain: "Le format fichier:numéro_de_ligne (ex: src/app.js:42) permet à Claude de naviguer précisément dans le code. C'est la convention standard dans Claude Code — les réponses de Claude utilisent aussi ce format pour que vous puissiez cliquer et naviguer directement."
      }
    ]
  },
  {
    id: 'cowork',
    title: 'Claude Co-Work',
    subtitle: 'Collaborer avec les agents',
    icon: '🤝',
    colorStart: '#059669',
    colorEnd: '#0D9488',
    story: {
      title: 'Le Général et ses Agents',
      scenes: [
        {
          duration: 6000,
          cast: [
            { e: '😓',  x: 50, y: 52, size: 64, anim: 'shake', duration: '0.7s', delay: '0s' },
            { e: '📧',  x: 22, y: 22, size: 32, anim: 'rain',  duration: '1.8s', delay: '0s' },
            { e: '💻',  x: 38, y: 18, size: 28, anim: 'rain',  duration: '2.1s', delay: '0.3s' },
            { e: '🔍',  x: 62, y: 20, size: 28, anim: 'rain',  duration: '1.9s', delay: '0.6s' },
            { e: '📊',  x: 78, y: 16, size: 32, anim: 'rain',  duration: '2.3s', delay: '0.2s' },
            { e: '📁',  x: 15, y: 38, size: 24, anim: 'rain',  duration: '2.0s', delay: '0.8s' },
            { e: '🗂️',  x: 85, y: 35, size: 24, anim: 'rain',  duration: '1.7s', delay: '0.5s' }
          ],
          bubble: null,
          label: null,
          text: "Seul face à 100 tâches simultanées... personne ne peut tout faire seul."
        },
        {
          duration: 6000,
          cast: [
            { e: '👑', x: 50, y: 40, size: 80, anim: 'pop-in', duration: '0.7s', delay: '0.2s' },
            { e: '🤖', x: 20, y: 72, size: 56, anim: 'pop-in', duration: '0.5s', delay: '0.6s' },
            { e: '🤖', x: 50, y: 72, size: 56, anim: 'pop-in', duration: '0.5s', delay: '0.9s' },
            { e: '🤖', x: 80, y: 72, size: 56, anim: 'pop-in', duration: '0.5s', delay: '1.2s' }
          ],
          bubble: null,
          label: { text: 'Général', x: 50, y: 24 },
          text: "Révélation : vous êtes un Général. Des agents spécialisés vous attendent."
        },
        {
          duration: 6000,
          cast: [
            { e: '👑', x: 50, y: 30, size: 56, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '🤖', x: 18, y: 68, size: 60, anim: 'bounce', duration: '1.3s', delay: '0s' },
            { e: '🤖', x: 50, y: 68, size: 60, anim: 'bounce', duration: '1.3s', delay: '0.2s' },
            { e: '🤖', x: 82, y: 68, size: 60, anim: 'bounce', duration: '1.3s', delay: '0.4s' },
            { e: '🔍', x: 18, y: 46, size: 24, anim: 'pulse',  duration: '1.8s', delay: '0.2s' },
            { e: '📋', x: 50, y: 46, size: 24, anim: 'pulse',  duration: '1.8s', delay: '0.4s' },
            { e: '⌨️', x: 82, y: 46, size: 24, anim: 'pulse',  duration: '1.8s', delay: '0.6s' }
          ],
          bubble: null,
          label: null,
          text: "Parallèle = 10x plus rapide. Vous coordonnez, ils exécutent."
        }
      ]
    },
    lessons: [
      {
        icon: '🤝',
        title: 'Vos agents spécialisés',
        visual: 'agents',
        bullets: [
          '<strong>Explore</strong> → trouve du code, localise des fichiers (lecture seule, ultra rapide)',
          '<strong>Plan</strong> → conçoit la stratégie et les trade-offs architecturaux',
          '<strong>General-purpose</strong> → tâches complexes multi-étapes'
        ]
      },
      {
        icon: '⚡',
        title: 'Parallèle = 10x plus rapide',
        visual: 'parallel',
        bullets: [
          'Envoyez plusieurs agents dans <strong>un seul message</strong> pour les paralléliser',
          'Tâches indépendantes → parallèle. Tâches liées → séquentiel',
          'Foreground = besoin du résultat. Background = travail indépendant'
        ]
      },
      {
        icon: '🔍',
        title: 'Trust but Verify',
        visual: 'verify',
        bullets: [
          'Le résumé d\'un agent = son <strong>intention</strong>, pas forcément ce qu\'il a fait',
          'Vérifiez toujours les vrais changements avant de valider',
          'Votre prompt doit prouver que <strong>vous</strong> avez compris — l\'agent exécute'
        ]
      }
    ],
    achievementId: 'module_cowork',
    questions: [
      {
        q: "L'outil Agent dans Claude Code permet de...",
        options: [
          "Contrôler Claude via une interface vocale",
          "Lancer des sous-agents spécialisés pour des tâches complexes ou parallèles",
          "Connecter Claude à des services externes comme Slack",
          "Créer des macros de saisie automatique"
        ],
        correct: 1,
        explain: "L'Agent tool spawn des sous-agents avec des capacités spécifiques et des outils dédiés. Ils peuvent travailler en parallèle sur des tâches indépendantes, protègent le contexte principal de résultats excessifs, et permettent de spécialiser chaque tâche."
      },
      {
        q: "Quand faut-il utiliser plusieurs agents en parallèle ?",
        options: [
          "Toujours, pour systématiquement aller plus vite",
          "Jamais, car ça crée des conflits de fichiers",
          "Uniquement pour les tâches qui prennent plus de 30 secondes",
          "Quand les tâches sont indépendantes et peuvent s'exécuter simultanément"
        ],
        correct: 3,
        explain: "Les agents en parallèle sont pertinents quand les tâches sont indépendantes. Vous les envoyez dans un seul message avec plusieurs appels d'outils. Si les tâches ont des dépendances (B a besoin du résultat de A), elles doivent rester séquentielles."
      },
      {
        q: "L'agent \"Explore\" est optimisé pour...",
        options: [
          "Modifier des fichiers en masse dans tout le projet",
          "Chercher du code, localiser des fichiers et des symboles — en lecture seule",
          "Faire des revues de code et analyses architecturales approfondies",
          "Déployer des applications sur des serveurs distants"
        ],
        correct: 1,
        explain: "L'agent Explore est rapide et en lecture seule : localisation de code par pattern, grep de symboles, réponse à \"où est défini X\". À ne PAS utiliser pour les revues de code, analyses cross-fichiers ou audits — il lit des extraits et manquera du contenu hors de sa fenêtre de lecture."
      },
      {
        q: "Quelle est la différence entre un agent foreground et background ?",
        options: [
          "Foreground = plus rapide, Background = moins coûteux en tokens",
          "Foreground = besoin du résultat avant de continuer, Background = travail parallèle indépendant",
          "Foreground = avec interface visuelle, Background = en terminal",
          "Il n'y a aucune différence fonctionnelle entre les deux"
        ],
        correct: 1,
        explain: "Foreground : vous avez besoin du résultat de l'agent avant de pouvoir continuer (ex: recherche qui informe les prochaines étapes). Background : travail genuinement indépendant — vous recevez une notification à la fin. Ne jamais mettre en background si vous avez besoin du résultat."
      },
      {
        q: "L'agent \"Plan\" se spécialise dans...",
        options: [
          "Créer des tickets et tâches dans Jira ou Linear",
          "Planifier des réunions et synchroniser les agendas",
          "Concevoir des stratégies d'implémentation avec trade-offs architecturaux",
          "Générer des diagrammes et wireframes automatiquement"
        ],
        correct: 2,
        explain: "L'agent Plan est un architecte logiciel : il conçoit des plans d'implémentation, identifie les fichiers critiques, et considère les trade-offs architecturaux. Il retourne des plans étape par étape. Utilisez-le quand vous avez besoin de réfléchir à la stratégie avant d'agir."
      },
      {
        q: "\"Trust but verify\" avec les agents signifie...",
        options: [
          "Toujours approuver les actions des agents sans les vérifier",
          "Ne jamais faire confiance aux agents sur du code critique",
          "Le résumé de l'agent décrit son intention — vérifiez les changements réels avant de valider",
          "Demander à l'agent de s'auto-vérifier avant de terminer"
        ],
        correct: 2,
        explain: "\"Trust but verify\" : le résumé qu'un agent retourne décrit ce qu'il avait l'intention de faire, pas nécessairement ce qu'il a fait. Quand un agent écrit ou modifie du code, vérifiez les changements réels avant de les reporter comme terminés."
      },
      {
        q: "\"Ne jamais déléguer la compréhension\" à un agent signifie...",
        options: [
          "Les agents ne peuvent pas comprendre des tâches complexes",
          "Votre prompt doit prouver que vous avez compris — l'agent exécute, vous synthétisez",
          "Il faut toujours relire le code que l'agent a écrit",
          "Les agents ne doivent pas être utilisés pour de la documentation"
        ],
        correct: 1,
        explain: "Ne jamais écrire \"d'après tes résultats, corrige le bug\". Ce genre de formulation pousse la synthèse sur l'agent. Votre prompt doit prouver votre compréhension : incluez les chemins de fichiers, numéros de ligne, ce qui change précisément. L'agent exécute — vous comprenez."
      },
      {
        q: "Pour maximiser l'efficacité des agents parallèles, il faut...",
        options: [
          "Les lancer séquentiellement avec des délais entre chaque",
          "Utiliser un seul agent général plutôt que plusieurs spécialisés",
          "Les envoyer dans un seul message avec plusieurs appels d'outils simultanés",
          "Toujours attendre la confirmation de l'utilisateur entre chaque agent"
        ],
        correct: 2,
        explain: "Pour lancer plusieurs agents en parallèle, envoyez-les dans un seul message avec plusieurs tool calls. Si vous les envoyez dans des messages séparés, ils s'exécutent séquentiellement. La parallélisation réelle nécessite un seul message avec tous les appels indépendants."
      }
    ]
  },
  {
    id: 'routines',
    title: 'Claude Routines',
    subtitle: 'Hooks & automatisations',
    icon: '⚙️',
    colorStart: '#D97706',
    colorEnd: '#DC2626',
    story: {
      title: 'La Maison Qui Pense',
      scenes: [
        {
          duration: 6000,
          cast: [
            { e: '🏠', x: 50, y: 48, size: 96, anim: 'idle',  duration: '4s',  delay: '0s' },
            { e: '💡', x: 30, y: 30, size: 32, anim: 'pulse', duration: '1.6s',delay: '0s' },
            { e: '🌡️', x: 70, y: 30, size: 28, anim: 'pulse', duration: '2.0s',delay: '0.4s' },
            { e: '📱', x: 50, y: 22, size: 28, anim: 'pulse', duration: '1.8s',delay: '0.2s' }
          ],
          bubble: null,
          label: null,
          text: "Imaginez une maison intelligente qui agit automatiquement selon vos gestes."
        },
        {
          duration: 6000,
          cast: [
            { e: '🏠', x: 38, y: 52, size: 80, anim: 'idle',   duration: '3s',  delay: '0s' },
            { e: '🧑‍💻', x: 78, y: 52, size: 56, anim: 'pop-in', duration: '0.6s',delay: '0.3s' },
            { e: '💡', x: 30, y: 30, size: 36, anim: 'pop-in', duration: '0.5s',delay: '0.8s' },
            { e: '→',  x: 58, y: 52, size: 32, anim: 'pulse',  duration: '1.2s',delay: '0.4s' }
          ],
          bubble: { text: 'ÉVÉNEMENT → ACTION', targetX: 50, targetY: 52, size: 64, side: 'top' },
          label: null,
          text: "Partir = lumières off. Dans Claude Code : c'est un HOOK. Événement → réaction auto."
        },
        {
          duration: 6000,
          cast: [
            { e: '🎛️', x: 50, y: 45, size: 88, anim: 'pulse', duration: '2.5s', delay: '0s' },
            { e: '⚙️', x: 25, y: 30, size: 36, anim: 'spin',  duration: '2s',   delay: '0s' },
            { e: '⚙️', x: 75, y: 30, size: 28, anim: 'spin',  duration: '1.5s', delay: '-0.5s' },
            { e: '⚙️', x: 50, y: 72, size: 32, anim: 'spin',  duration: '3s',   delay: '-1s' }
          ],
          bubble: { text: 'settings.json ⚙️', targetX: 50, targetY: 45, size: 88, side: 'top' },
          label: null,
          text: "/update-config programme tout. 'À chaque fois que X → Y.' Automatique. Pour toujours."
        }
      ]
    },
    lessons: [
      {
        icon: '⚙️',
        title: 'Les Hooks : votre assistant 24h/24',
        visual: 'hook',
        bullets: [
          'Un hook = une <strong>commande shell automatique</strong> déclenchée par un événement',
          'Configurés dans <code>settings.json</code> — pas dans chaque prompt',
          'Ils s\'exécutent même quand vous n\'écrivez rien'
        ]
      },
      {
        icon: '🔔',
        title: 'Les 3 événements clés',
        visual: 'events',
        bullets: [
          '<strong>PreToolUse</strong> → s\'exécute avant chaque appel d\'outil',
          '<strong>Stop</strong> → s\'exécute quand Claude termine sa réponse',
          '<strong>SessionStart</strong> → configure l\'environnement au démarrage'
        ]
      },
      {
        icon: '🤖',
        title: '"À chaque fois que…" → Hook',
        visual: 'auto',
        bullets: [
          'Tout comportement récurrent = un hook dans <code>settings.json</code>',
          'Utilisez <code>/update-config</code> pour les configurer sans toucher les fichiers',
          'Résultat : Claude fait automatiquement ce que vous lui demandiez à chaque fois'
        ]
      }
    ],
    achievementId: 'module_routines',
    questions: [
      {
        q: "Les hooks dans Claude Code sont des...",
        options: [
          "Décorateurs Python pour augmenter les fonctions",
          "Commandes shell qui s'exécutent en réponse à des événements spécifiques",
          "Webhooks HTTP envoyés à des services externes",
          "Fonctions JavaScript dans le fichier de config"
        ],
        correct: 1,
        explain: "Les hooks sont des commandes shell configurées dans settings.json qui s'exécutent automatiquement en réponse à des événements Claude Code (PreToolUse, PostToolUse, Stop, etc.). C'est le harness qui les exécute — pas Claude — donc ils persistent entre les sessions."
      },
      {
        q: "Où configure-t-on les hooks dans Claude Code ?",
        options: [
          "Dans le fichier .env à la racine du projet",
          "Dans le fichier CLAUDE.md",
          "Dans settings.json ou settings.local.json",
          "Dans package.json sous la clé \"hooks\""
        ],
        correct: 2,
        explain: "Les hooks se configurent dans settings.json (partagé avec l'équipe) ou settings.local.json (overrides locaux non commités). Le skill /update-config gère ces fichiers pour vous — préférez-le à l'édition manuelle pour éviter les erreurs de syntaxe."
      },
      {
        q: "Pour créer un comportement \"à chaque fois que X, fais Y automatiquement\", il faut...",
        options: [
          "L'écrire dans CLAUDE.md pour que Claude s'en souvienne",
          "Le répéter dans chaque prompt",
          "Configurer un hook dans settings.json via le skill /update-config",
          "Créer une variable d'environnement dans .env"
        ],
        correct: 2,
        explain: "Les comportements automatisés (\"à chaque fois que\", \"avant/après X\", \"dès que\") nécessitent des hooks dans settings.json. La mémoire et les préférences de Claude ne peuvent pas exécuter du code entre les sessions — seul le harness avec ses hooks le peut. Utilisez /update-config pour les configurer."
      },
      {
        q: "Un hook PreToolUse s'exécute...",
        options: [
          "Au démarrage de chaque session Claude Code",
          "Après que chaque outil ait été appelé et ait retourné un résultat",
          "Avant chaque appel d'outil, avant son exécution",
          "Uniquement quand Claude effectue une opération de fichier"
        ],
        correct: 2,
        explain: "PreToolUse s'exécute avant chaque appel d'outil, juste avant son exécution. Il peut inspecter les paramètres de l'outil et potentiellement bloquer l'action. Utile pour des validations, logs, ou vérifications de sécurité avant que Claude modifie quoi que ce soit."
      },
      {
        q: "Le skill /session-start-hook est particulièrement utile pour...",
        options: [
          "Fermer automatiquement Claude après une période d'inactivité",
          "Configurer l'environnement au démarrage : linter, tests, serveurs de dev",
          "Sauvegarder automatiquement les conversations",
          "Synchroniser automatiquement avec le dépôt GitHub"
        ],
        correct: 1,
        explain: "Le skill /session-start-hook crée un hook de démarrage de session pour Claude Code sur le web. Il configure l'environnement (vérification de linters, tests, serveurs) pour que votre projet soit prêt à l'emploi dès le début de chaque session — essentiel pour les projets web avec Claude Code."
      },
      {
        q: "L'événement \"Stop\" dans les hooks Claude Code se déclenche quand...",
        options: [
          "Claude rencontre une erreur fatale",
          "L'utilisateur ferme manuellement la fenêtre",
          "Claude termine de répondre / arrête son traitement",
          "Un outil retourne une erreur"
        ],
        correct: 2,
        explain: "L'événement Stop se déclenche quand Claude termine de répondre et s'arrête. C'est utile pour des actions post-réponse comme afficher un résumé, envoyer une notification, ou nettoyer des ressources temporaires."
      },
      {
        q: "settings.local.json est différent de settings.json car...",
        options: [
          "Il a une syntaxe JSON différente et allégée",
          "Il ne supporte pas la configuration des hooks",
          "Il contient des overrides locaux non partagés avec l'équipe",
          "Il s'applique uniquement sur macOS et Linux"
        ],
        correct: 2,
        explain: "settings.local.json est pour les overrides locaux personnels qui ne doivent pas être commités ni partagés avec l'équipe (.gitignore). Idéal pour tester de nouveaux hooks ou permissions sans affecter les collègues. settings.json, lui, est versionné et partagé."
      },
      {
        q: "Pour autoriser automatiquement des commandes bash spécifiques sans prompt de permission...",
        options: [
          "Utiliser le flag --no-verify dans les commandes git",
          "Ajouter les commandes dans une allowlist dans settings.json",
          "Passer en mode root/administrateur",
          "Utiliser des variables d'environnement pour bypasser les checks"
        ],
        correct: 1,
        explain: "Ajoutez les commandes à une allowlist dans settings.json via le skill /fewer-permission-prompts ou /update-config. Cela autorise automatiquement les outils fréquents sans interrompre le workflow. Soyez précis dans l'allowlist pour ne pas donner trop de permissions."
      }
    ]
  },
  {
    id: 'design',
    title: 'Claude Design',
    subtitle: 'UI, UX et itération visuelle',
    icon: '🎨',
    colorStart: '#EC4899',
    colorEnd: '#8B5CF6',
    story: {
      title: "L'Architecte du Numérique",
      scenes: [
        {
          duration: 6000,
          cast: [
            { e: '👷', x: 28, y: 52, size: 72, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '📐', x: 28, y: 24, size: 36, anim: 'pulse',  duration: '2s',   delay: '0.3s' },
            { e: '📄', x: 55, y: 52, size: 44, anim: 'pop-in', duration: '0.6s', delay: '0.2s' },
            { e: '🏗️', x: 80, y: 48, size: 64, anim: 'idle',   duration: '4s',   delay: '0.5s' }
          ],
          bubble: null,
          label: { text: 'Architecte', x: 28, y: 76 },
          text: "Un architecte ne dit pas 'le plan est parfait' sans visiter le bâtiment réel."
        },
        {
          duration: 6000,
          cast: [
            { e: '✅', x: 28, y: 44, size: 52, anim: 'pop-in', duration: '0.5s', delay: '0s' },
            { e: '💻', x: 28, y: 72, size: 36, anim: 'idle',   duration: '3s',   delay: '0.2s' },
            { e: '≠',  x: 50, y: 52, size: 48, anim: 'pulse',  duration: '1.5s', delay: '0.4s' },
            { e: '🤢', x: 75, y: 44, size: 52, anim: 'shake',  duration: '0.8s', delay: '0.6s' },
            { e: '🖥️', x: 75, y: 72, size: 36, anim: 'idle',   duration: '3s',   delay: '0.2s' }
          ],
          bubble: null,
          label: null,
          text: "Le code peut compiler ✅ et quand même ressembler à rien visuellement 🤢."
        },
        {
          duration: 6000,
          cast: [
            { e: '📸', x: 18, y: 52, size: 60, anim: 'bounce', duration: '1.2s', delay: '0s' },
            { e: '→',  x: 38, y: 52, size: 32, anim: 'pulse',  duration: '1.2s', delay: '0.2s' },
            { e: '🤖', x: 55, y: 52, size: 60, anim: 'idle',   duration: '3s',   delay: '0.3s' },
            { e: '→',  x: 72, y: 52, size: 32, anim: 'pulse',  duration: '1.2s', delay: '0.4s' },
            { e: '✨', x: 88, y: 44, size: 40, anim: 'pulse',  duration: '1.6s', delay: '0.6s' }
          ],
          bubble: null,
          label: null,
          text: "Claude voit vos images. Screenshot + feedback = correction précise. Testez toujours dans le navigateur."
        }
      ]
    },
    lessons: [
      {
        icon: '👁️',
        title: 'Testez dans le navigateur. Toujours.',
        visual: 'browser',
        bullets: [
          'TypeScript qui compile ≠ interface qui <strong>ressemble</strong> à ce que vous voulez',
          'Après chaque changement UI → démarrez le serveur → vérifiez dans le navigateur',
          'Si vous ne pouvez pas tester visuellement, <strong>dites-le</strong> — ne prétendez pas que c\'est fini'
        ]
      },
      {
        icon: '📸',
        title: 'Claude voit vos images',
        visual: 'image',
        bullets: [
          'Partagez un <strong>screenshot</strong> d\'un bug visuel ou d\'un design de référence',
          'Claude analyse la maquette Figma exportée pour implémenter précisément',
          'Feedback visuel + screenshot = la boucle d\'itération la plus efficace'
        ]
      },
      {
        icon: '✍️',
        title: 'Le brief design parfait',
        visual: 'brief',
        bullets: [
          '<strong>Contexte</strong> : qui sont les utilisateurs, quel est le produit',
          '<strong>Contraintes</strong> : stack tech, performance, accessibilité',
          '<strong>Résultat attendu</strong> : décrivez précisément ce que vous voulez voir'
        ]
      }
    ],
    achievementId: 'module_design',
    questions: [
      {
        q: "Avant de déclarer une tâche UI/frontend comme terminée, Claude doit...",
        options: [
          "Uniquement vérifier que le TypeScript compile sans erreur",
          "Démarrer le serveur de dev et tester visuellement dans le navigateur",
          "Générer automatiquement des tests unitaires pour chaque composant",
          "Envoyer le code à un service de validation externe"
        ],
        correct: 1,
        explain: "Pour les changements UI, Claude démarre le serveur de développement et teste visuellement dans le navigateur — golden path ET edge cases. Type checking et tests vérifient la correction du code, pas la correction visuelle des features. Si Claude ne peut pas tester l'UI, il le dit explicitement."
      },
      {
        q: "Claude Code peut lire des fichiers image pour...",
        options: [
          "Les compresser et optimiser automatiquement pour le web",
          "Les convertir en composants React ou Vue",
          "Analyser des maquettes, captures d'écran ou wireframes pour comprendre le design cible",
          "Générer des assets SVG équivalents automatiquement"
        ],
        correct: 2,
        explain: "Claude Code est multimodal — il peut lire des images PNG, JPG et screenshots. Envoyez-lui une maquette Figma exportée, un screenshot d'un design de référence, ou une capture d'un bug visuel. Il analysera le design cible pour mieux implémenter ou corriger."
      },
      {
        q: "Type checking et suites de tests vérifient...",
        options: [
          "La correction visuelle des features UI",
          "Que l'expérience utilisateur est fluide et intuitive",
          "La correction du code, pas la correction des features visuelles",
          "La performance et les Core Web Vitals"
        ],
        correct: 2,
        explain: "Les tests et le type checking vérifient que le code est correct syntaxiquement et logiquement. Ils ne vérifient PAS que l'UI ressemble à ce qu'elle devrait, que les animations fonctionnent bien, ou que le layout est correct sur mobile. Seul le test visuel dans un navigateur le confirme."
      },
      {
        q: "La meilleure structure de prompt pour un projet de design complet est...",
        options: [
          "\"Fais-moi un beau site web responsive et moderne\"",
          "Contexte (qui/quoi) + Contraintes (tech/perf) + Références visuelles + Résultat attendu",
          "Une liste exhaustive de tous les éléments CSS souhaités",
          "Copier-coller le code d'un design existant en demandant de l'améliorer"
        ],
        correct: 1,
        explain: "Pour un design complet, structurez votre prompt : Contexte (qui sont les utilisateurs, quel est le produit), Contraintes (stack tech, performances, accessibilité), Références visuelles (screenshots, URLs, inspirations), et le Résultat attendu précis. Plus le contexte est riche, meilleur est le design."
      },
      {
        q: "Pour donner du feedback sur un design et itérer efficacement avec Claude...",
        options: [
          "Repartir de zéro à chaque itération en changeant tout le prompt",
          "Changer de modèle IA pour avoir une perspective différente",
          "Donner un feedback précis sur ce qui ne va pas visuellement, idéalement avec screenshots",
          "Utiliser uniquement du texte descriptif sans images"
        ],
        correct: 2,
        explain: "Pour itérer sur un design : prenez un screenshot du problème, montrez-le à Claude, et soyez précis (\"Le padding entre les éléments est trop grand\", \"Le bouton CTA n'est pas assez contrasté\"). Les screenshots + feedback ciblé créent la boucle d'itération la plus efficace."
      },
      {
        q: "Pour vérifier qu'un changement de design n'a pas créé de régressions...",
        options: [
          "Recompiler tout le projet depuis zéro",
          "Exécuter uniquement les tests unitaires existants",
          "Activer TypeScript strict mode",
          "Tester manuellement les fonctionnalités existantes dans le navigateur"
        ],
        correct: 3,
        explain: "Les régressions UI ne sont détectables que par test visuel manuel dans le navigateur. Après un changement, testez le golden path (parcours principal) ET les fonctionnalités adjacentes qui pourraient être affectées. Les tests automatiques aident mais ne remplacent pas la vérification visuelle."
      },
      {
        q: "\"Claude Design\" fait référence à...",
        options: [
          "Un logiciel de design vectoriel créé par Anthropic",
          "Un modèle IA spécialisé dans la génération d'images",
          "L'utilisation de Claude pour concevoir, prototyper et itérer sur des interfaces et architectures",
          "Un plugin Figma officiel pour intégrer Claude"
        ],
        correct: 2,
        explain: "Claude Design = utiliser Claude Code pour tout le cycle de design : conception d'interfaces, prototypage rapide, itération sur des designs existants, analyse de maquettes, correction de bugs visuels. Claude comprend HTML/CSS/JS et les frameworks modernes pour implémenter précisément votre vision."
      },
      {
        q: "Le \"golden path\" dans le contexte du test d'une feature UI correspond à...",
        options: [
          "Le chemin de code le plus optimisé en performance",
          "La route HTTP principale vers l'API backend",
          "Le parcours utilisateur principal prévu, testé avec les edge cases",
          "Les tests automatisés de bout en bout"
        ],
        correct: 2,
        explain: "Le golden path est le parcours utilisateur principal et prévu pour une feature. Pour une feature de login : entrer email/password valides → cliquer Login → être redirigé. Il faut tester ce chemin + les edge cases (mauvais password, email invalide, réseau lent) avant de valider une implémentation."
      }
    ]
  },

  // ── MODULE 6 ────────────────────────────────────────────────────────────
  {
    id: 'agents',
    title: 'Armée d\'Agents',
    subtitle: 'Orchestrez vos agents IA',
    icon: '🤖',
    colorStart: '#0EA5E9',
    colorEnd: '#6366F1',
    achievementId: 'module_agents',
    story: {
      title: 'De Soldat à Général',
      scenes: [
        {
          duration: 6000,
          cast: [
            { e: '🧑‍💻', x: 50, y: 60, size: 52, anim: 'shake',  duration: '0.7s', delay: '0s' },
            { e: '📝',   x: 18, y: 22, size: 28, anim: 'rain',   duration: '2.0s', delay: '0s' },
            { e: '🐛',   x: 32, y: 16, size: 24, anim: 'rain',   duration: '1.8s', delay: '0.3s' },
            { e: '🚀',   x: 50, y: 20, size: 26, anim: 'rain',   duration: '2.2s', delay: '0.1s' },
            { e: '📧',   x: 68, y: 18, size: 24, anim: 'rain',   duration: '1.9s', delay: '0.5s' },
            { e: '💤',   x: 50, y: 78, size: 28, anim: 'float',  duration: '2.5s', delay: '0.4s' },
            { e: '🔧',   x: 82, y: 22, size: 26, anim: 'rain',   duration: '2.1s', delay: '0.7s' }
          ],
          bubble: null,
          label: null,
          text: "Avant : vous faites tout. Coder, tester, déployer, rédiger... impossible de tout gérer."
        },
        {
          duration: 6000,
          cast: [
            { e: '💡', x: 50, y: 22, size: 60, anim: 'pulse',  duration: '1.5s', delay: '0s' },
            { e: '🧑‍💻', x: 50, y: 58, size: 64, anim: 'pop-in', duration: '0.6s', delay: '0.3s' },
            { e: '👑', x: 50, y: 32, size: 40, anim: 'pop-in', duration: '0.5s', delay: '0.8s' }
          ],
          bubble: null,
          label: null,
          text: "Révélation : vous n'avez pas à tout faire. Vous pouvez être la tête, pas les mains."
        },
        {
          duration: 6000,
          cast: [
            { e: '👑',  x: 50, y: 20, size: 52, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '🤖',  x: 50, y: 52, size: 56, anim: 'bounce', duration: '1.3s', delay: '0.2s' },
            { e: '🤖',  x: 18, y: 78, size: 44, anim: 'bounce', duration: '1.4s', delay: '0s' },
            { e: '🤖',  x: 50, y: 78, size: 44, anim: 'bounce', duration: '1.4s', delay: '0.25s' },
            { e: '🤖',  x: 82, y: 78, size: 44, anim: 'bounce', duration: '1.4s', delay: '0.5s' }
          ],
          bubble: null,
          label: { text: 'CEO', x: 50, y: 32 },
          text: "Vous → Vision. Orchestrateur → Coordination. Workers → Exécution. C'est votre armée."
        }
      ]
    },
    lessons: [
      {
        icon: '🏗️',
        title: 'L\'architecture de votre armée',
        visual: 'army',
        bullets: [
          '<strong>Vous</strong> → donnez la vision à l\'Orchestrateur',
          '<strong>Orchestrateur</strong> → décompose et délègue aux Workers',
          '<strong>Workers</strong> → exécutent (code, tests, recherche, déploiement)'
        ]
      },
      {
        icon: '📋',
        title: 'Le Brief d\'Agent parfait',
        visual: 'brief2',
        bullets: [
          '<strong>Contexte</strong> : qui vous êtes, quel est le projet',
          '<strong>Objectif précis</strong> : ce que l\'agent doit produire exactement',
          '<strong>Critères de succès + Contraintes</strong> : comment valider le résultat'
        ]
      },
      {
        icon: '📈',
        title: 'Automatisez par priorité',
        visual: 'priority',
        bullets: [
          'Listez toutes vos tâches répétitives avec <strong>fréquence × durée</strong>',
          'Commencez par <strong>haute fréquence + faible valeur ajoutée</strong> de votre part',
          'Une automatisation à la fois — l\'armée se construit progressivement'
        ]
      }
    ],
    questions: [
      {
        q: "Qu'est-ce qu'un système multi-agents avec Claude Code ?",
        options: [
          "Avoir plusieurs comptes Claude avec des utilisateurs différents",
          "Un agent orchestrateur qui délègue des sous-tâches à des agents spécialisés",
          "Installer Claude Code sur plusieurs machines simultanément",
          "Combiner GPT, Gemini et Claude dans un même workflow"
        ],
        correct: 1,
        explain: "Un système multi-agents = un agent orchestrateur (le manager) qui comprend la vision globale et délègue à des agents spécialisés (Explore, Plan, Code, Test…). Chacun a un rôle précis. Vous interagissez uniquement avec l'orchestrateur — votre armée travaille en parallèle pour vous."
      },
      {
        q: "L'agent orchestrateur dans votre armée doit...",
        options: [
          "Tout exécuter lui-même pour garder le contrôle total",
          "Décomposer la tâche principale, déléguer aux workers, et synthétiser les résultats",
          "Uniquement surveiller sans jamais toucher au code",
          "Être le modèle IA le plus puissant et coûteux disponible"
        ],
        correct: 1,
        explain: "L'orchestrateur est le \"manager\" de votre armée. Il comprend la vision, décompose le projet en sous-tâches claires, délègue à des agents spécialisés — en parallèle quand c'est possible — et synthétise les résultats. Vous ne parlez qu'à lui, il gère le reste."
      },
      {
        q: "Pour créer votre armée d'agents, quelle est la PREMIÈRE étape ?",
        options: [
          "Apprendre Python pour coder des agents from scratch",
          "Choisir le modèle IA le plus puissant pour chaque rôle",
          "Identifier et lister toutes vos tâches répétitives avec leur fréquence et durée",
          "Créer une infrastructure serveur pour héberger les agents"
        ],
        correct: 2,
        explain: "Avant d'automatiser, sachez quoi automatiser. Listez toutes vos tâches répétitives : emails récurrents, rapports, recherche, compilation de données… Notez leur fréquence et le temps passé. C'est votre backlog d'automatisation. Commencez par haute fréquence + faible valeur ajoutée de votre part."
      },
      {
        q: "Un \"brief d'agent\" efficace doit toujours contenir...",
        options: [
          "Uniquement le résultat désiré en une phrase courte",
          "Contexte + Objectif précis + Critères de succès + Contraintes",
          "Une description détaillée de chaque étape d'exécution à suivre",
          "Le code source existant que l'agent doit améliorer"
        ],
        correct: 1,
        explain: "Les 4 piliers d'un bon brief : Contexte (qui vous êtes, quel est le projet), Objectif précis (output attendu), Critères de succès (comment valider que c'est réussi), Contraintes (limites, règles). Sans ces 4 éléments, l'agent improvise. Avec eux, il exécute exactement votre vision."
      },
      {
        q: "Pour créer une app complète avec vos agents, la meilleure décomposition est...",
        options: [
          "Un seul agent puissant qui fait tout de A à Z",
          "Un agent par fichier de code du projet",
          "Orchestrateur → Agent Specs → Agent Code → Agent Tests → Agent Deploy",
          "D'abord GPT-4 pour la structure, puis Claude pour les détails"
        ],
        correct: 2,
        explain: "Pour une app complète : l'orchestrateur reçoit votre vision, puis délègue. Agent Specs (définit ce qu'on construit), Code (implémente), Tests (valide), Deploy (livre). Certains peuvent tourner en parallèle (Code + skeleton Tests), d'autres en séquence (Deploy après Tests verts). Vous ne touchez qu'à la vision."
      },
      {
        q: "Comment vérifier le travail de vos agents sans tout re-vérifier vous-même ?",
        options: [
          "Faire confiance aux agents — ils ne font jamais d'erreurs significatives",
          "Lire chaque ligne de code produit pour être sûr",
          "Définir des checkpoints avec des critères de validation objectifs et mesurables",
          "Demander à un autre agent de vérifier le premier"
        ],
        correct: 2,
        explain: "Définissez des checkpoints automatisables : les tests passent ? La spec est respectée ? Les métriques de performance sont dans les limites ? Avec des critères objectifs, vous validez en secondes. Trust but verify — vous évaluez la qualité du résultat, pas chaque ligne de code."
      },
      {
        q: "La différence entre un agent \"autonome\" et un agent \"supervisé\" est...",
        options: [
          "L'agent autonome est plus rapide, l'agent supervisé est plus précis",
          "L'agent autonome prend des décisions seul, l'agent supervisé vous consulte pour les choix clés",
          "L'agent autonome coûte plus cher en tokens",
          "Il n'y a aucune différence pratique entre les deux modes"
        ],
        correct: 1,
        explain: "Agent autonome = agit et décide seul jusqu'au résultat final (fort blast radius si erreur). Agent supervisé = s'arrête aux décisions importantes pour vous consulter (plus sûr, plus contrôlé). Pour débuter : supervisé. Pour les tâches maîtrisées et réversibles : autonome. Calibrez selon l'impact."
      },
      {
        q: "L'objectif final d'une armée d'agents bien configurée est...",
        options: [
          "Ne plus jamais avoir à travailler du tout",
          "Remplacer tous vos collaborateurs humains",
          "Opérer à grande échelle avec votre vision comme seul input",
          "Avoir le code le plus parfait techniquement possible"
        ],
        correct: 2,
        explain: "L'objectif : passer de \"je fais\" à \"je pense et je valide\". Votre input = votre vision et vos décisions stratégiques. Les agents gèrent l'opérationnel. Vous pouvez alors travailler sur plusieurs projets en parallèle, aller 10x plus vite, et rester focus sur la valeur que vous seul apportez."
      }
    ]
  },

  // ── MODULE 7 ────────────────────────────────────────────────────────────
  {
    id: 'vision',
    title: 'Vision & Délégation',
    subtitle: 'Pensez CEO, pas opérateur',
    icon: '👑',
    colorStart: '#FBBF24',
    story: {
      title: 'Le Chef d\'Orchestre',
      scenes: [
        {
          duration: 6000,
          cast: [
            { e: '🎹', x: 15, y: 55, size: 52, anim: 'idle',   duration: '3.5s', delay: '0s' },
            { e: '🎸', x: 32, y: 62, size: 48, anim: 'idle',   duration: '4s',   delay: '0.3s' },
            { e: '🧑‍💻', x: 50, y: 45, size: 64, anim: 'bounce', duration: '1.4s', delay: '0.1s' },
            { e: '🪄', x: 62, y: 34, size: 36, anim: 'pulse',  duration: '1.8s', delay: '0.5s' },
            { e: '🎺', x: 72, y: 55, size: 48, anim: 'idle',   duration: '3.2s', delay: '0.2s' },
            { e: '🎼', x: 88, y: 42, size: 40, anim: 'float',  duration: '2.5s', delay: '0.4s' }
          ],
          bubble: null,
          label: { text: 'Chef d\'Orchestre', x: 50, y: 72 },
          text: "Le chef d'orchestre ne joue aucun instrument. Pourtant c'est lui qui crée la musique."
        },
        {
          duration: 6000,
          cast: [
            { e: '🎹', x: 18, y: 52, size: 48, anim: 'wiggle', duration: '0.9s', delay: '0s' },
            { e: '🎸', x: 42, y: 62, size: 44, anim: 'shake',  duration: '0.7s', delay: '0.2s' },
            { e: '🎺', x: 72, y: 52, size: 48, anim: 'wiggle', duration: '1.0s', delay: '0.1s' },
            { e: '🌪️', x: 50, y: 36, size: 56, anim: 'spin',   duration: '1.5s', delay: '0.3s' },
            { e: '😱', x: 50, y: 72, size: 32, anim: 'pop-in', duration: '0.5s', delay: '0.8s' }
          ],
          bubble: null,
          label: null,
          text: "Sans vision claire = chaos. Vos agents improvisent chacun de leur côté."
        },
        {
          duration: 6000,
          cast: [
            { e: '🧑‍💻', x: 50, y: 30, size: 64, anim: 'idle',   duration: '3s',   delay: '0s' },
            { e: '🪄',  x: 62, y: 20, size: 36, anim: 'pulse',  duration: '1.6s', delay: '0.2s' },
            { e: '🤖',  x: 20, y: 68, size: 52, anim: 'bounce', duration: '1.3s', delay: '0s' },
            { e: '🤖',  x: 50, y: 68, size: 52, anim: 'bounce', duration: '1.3s', delay: '0.2s' },
            { e: '🤖',  x: 80, y: 68, size: 52, anim: 'bounce', duration: '1.3s', delay: '0.4s' },
            { e: '🎵',  x: 30, y: 44, size: 24, anim: 'float',  duration: '2.2s', delay: '0.3s' },
            { e: '✨',  x: 70, y: 44, size: 24, anim: 'pulse',  duration: '1.8s', delay: '0.5s' }
          ],
          bubble: null,
          label: { text: 'Satisfait 😌', x: 50, y: 46 },
          text: "Vision claire + brief précis = harmonie parfaite. Vous pensez. Eux créent."
        }
      ]
    },
    lessons: [
      {
        icon: '👑',
        title: 'Vous = CEO de vos agents',
        visual: 'ceo',
        bullets: [
          '<strong>Stratégique (vous)</strong> : vision, direction, décisions importantes',
          '<strong>Tactique (orchestrateur)</strong> : décompose, planifie, coordonne',
          '<strong>Opérationnel (workers)</strong> : exécutent les tâches précises'
        ]
      },
      {
        icon: '🚫',
        title: 'Ce qu\'on ne délègue JAMAIS',
        visual: 'nope',
        bullets: [
          'La <strong>direction stratégique</strong> reste toujours chez vous',
          'Votre vision unique, vos valeurs, votre "pourquoi" — irremplaçables',
          'Les agents exécutent le <strong>comment</strong> — vous décidez le <strong>quoi</strong>'
        ]
      },
      {
        icon: '🔄',
        title: 'La boucle d\'amélioration continue',
        visual: 'loop',
        bullets: [
          'Chaque erreur d\'agent = une information pour <strong>améliorer votre brief</strong>',
          'Documentez les leçons dans CLAUDE.md — l\'armée s\'améliore à chaque itération',
          'Objectif final : votre <strong>vision seule</strong> suffit à tout déclencher'
        ]
      }
    ],
    colorEnd: '#F97316',
    achievementId: 'module_vision',
    questions: [
      {
        q: "Le rôle d'un \"CEO de ses agents IA\" consiste à...",
        options: [
          "Maîtriser la programmation pour coder chaque agent manuellement",
          "Surveiller chaque action de chaque agent en temps réel",
          "Définir la vision, valider les outputs clés, et ajuster la stratégie",
          "Choisir les meilleurs modèles IA pour chaque type de tâche"
        ],
        correct: 2,
        explain: "CEO de vos agents = Vision (où on va), Validation (est-ce que c'est aligné ?), Ajustement (corriger la direction). L'exécution appartient aux agents. Plus vous clarifiez votre vision en amont, mieux vos agents exécutent. C'est exactement \"être dans la réflexion, pas dans l'opérationnel\"."
      },
      {
        q: "Quelle décision ne devriez-vous JAMAIS déléguer à un agent IA ?",
        options: [
          "Écrire le code d'un nouveau module fonctionnel",
          "Rédiger des emails de suivi ou de relance",
          "Définir la direction stratégique de votre projet ou business",
          "Créer les tests automatisés d'une nouvelle feature"
        ],
        correct: 2,
        explain: "La direction stratégique — quoi construire, pour qui, pourquoi, quelle valeur — reste toujours chez vous. Les agents exécutent brillamment le \"comment\". Vous êtes le seul à avoir votre contexte, vos valeurs, votre vision unique. Ne déléguez jamais le \"pourquoi\" et le \"quoi au plus haut niveau\"."
      },
      {
        q: "Pour transformer votre objectif annuel en tâches agentiques, la méthode est...",
        options: [
          "Donner l'objectif directement à un agent et le laisser tout planifier",
          "Décomposer : Objectif → Projets → Jalons → Tâches → Sous-tâches délégables",
          "Créer un tableur Excel et le partager avec Claude",
          "Suivre Scrum avec des sprints de 2 semaines pilotés par un agent"
        ],
        correct: 1,
        explain: "La décomposition stratégique : Objectif annuel → 3-5 projets majeurs → Jalons mensuels (milestones) → Tâches hebdomadaires → Sous-tâches avec brief précis pour les agents. Vous gérez les jalons et décisions. Les agents gèrent les sous-tâches. Chaque niveau descend en granularité."
      },
      {
        q: "Les 3 niveaux d'opération avec votre armée d'agents sont...",
        options: [
          "Débutant, Intermédiaire, Expert",
          "Frontend, Backend, Infrastructure",
          "Stratégique (vous), Tactique (orchestrateur), Opérationnel (agents workers)",
          "Planification, Exécution, Review"
        ],
        correct: 2,
        explain: "Niveau Stratégique = VOUS : vision, direction, décisions à fort impact. Niveau Tactique = Orchestrateur : décompose, planifie, coordonne les workers. Niveau Opérationnel = Agents Workers : exécutent les tâches précises (code, tests, recherche, rédaction). Restez au niveau Stratégique — c'est là que vous créez de la valeur."
      },
      {
        q: "Pour identifier quoi automatiser en priorité, la règle est...",
        options: [
          "Automatiser ce qui est le plus difficile techniquement d'abord",
          "Automatiser aléatoirement et voir ce qui marche",
          "Automatiser par impact × fréquence : haute fréquence + faible valeur ajoutée de votre part",
          "Attendre d'avoir un grand volume de travail avant d'automatiser"
        ],
        correct: 2,
        explain: "La matrice de priorité : (1) Un agent peut-il faire ça ? (2) Combien de temps ça prend par semaine ? (3) Quel serait l'impact si automatisé ? Multipliez fréquence × impact. Commencez par le meilleur ratio. Exemples à fort score : rapports récurrents, recherche d'information, emails template, compilation de données."
      },
      {
        q: "La différence entre \"confier une tâche\" et \"déléguer avec vision\" est...",
        options: [
          "La taille de la tâche — petite = confier, grande = déléguer",
          "Confier = dicter les étapes. Déléguer = donner le résultat voulu + contexte + autonomie sur le comment",
          "Confier = pour l'IA, Déléguer = pour les humains uniquement",
          "Il n'y a aucune différence significative en pratique"
        ],
        correct: 1,
        explain: "Confier = \"fais exactement ces étapes dans cet ordre\". Déléguer = \"voici le résultat attendu, pourquoi c'est important, et les contraintes — trouve comment y arriver\". La vraie délégation donne de l'autonomie sur le comment tout en étant crystal-clear sur le quoi et le pourquoi. C'est ainsi qu'on crée des agents vraiment autonomes."
      },
      {
        q: "Un bon système de feedback pour améliorer votre armée d'agents consiste à...",
        options: [
          "Remplacer les agents qui font des erreurs par de nouveaux agents",
          "Documenter chaque erreur d'agent pour affiner les briefs et mettre à jour CLAUDE.md",
          "Passer systématiquement à des modèles IA plus puissants et coûteux",
          "Surveiller les agents 24h/24 pour corriger en temps réel"
        ],
        correct: 1,
        explain: "Chaque erreur d'agent est une information : le brief était trop vague ? Le contexte manquait ? La contrainte n'était pas explicite ? Documentez les leçons dans CLAUDE.md. Vos agents s'améliorent parce que vos briefs s'améliorent — c'est la boucle d'apprentissage. L'armée devient plus efficace à chaque itération."
      },
      {
        q: "Pour un débutant qui veut construire son armée d'agents cette année, par où commencer ?",
        options: [
          "Apprendre Python pendant 6 mois pour créer des agents custom depuis zéro",
          "Attendre d'avoir une grande équipe ou entreprise avant d'utiliser des agents",
          "Automatiser UNE seule tâche récurrente, observer, apprendre, puis étendre progressivement",
          "Tout automatiser en même temps pour avoir un maximum d'impact immédiat"
        ],
        correct: 2,
        explain: "La règle du débutant stratégique : commencez par UNE automatisation. Choisissez une tâche que vous faites souvent et qui vous prend du temps. Automatisez-la avec Claude. Observez ce qui marche ou non. Améliorez le brief. Puis étendez à une deuxième tâche. L'armée se construit agent par agent — pas en un jour. La maîtrise vient de la pratique, pas de la théorie."
      }
    ]
  }
];
