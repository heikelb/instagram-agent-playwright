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
  { id: 'all_modules',      icon: '🏆', name: 'Claude Whisperer', desc: 'Terminer les 5 modules' },
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
  }
];
