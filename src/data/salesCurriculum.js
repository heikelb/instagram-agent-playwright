/**
 * salesCurriculum.js — BIBLE TERRAIN ORANGE PAP
 * ─────────────────────────────────────────────────────────────────────────────
 * Curriculum 100% basé sur les méthodes de Michaël :
 *   01 — DÉBALLE DÉFINITIVE (les 4 déclencheurs)
 *   02 — MÉTHODE H.Y.P.N.O.T.I.C. (8 étapes)
 *   03 — MÉTHODE C.D.D. (Clarifier/Discuter/Dissiper)
 *   04 — LES 4 INTONATIONS MAGIQUES
 *   05 — MOTS INTERDITS
 *   06 — ÉTAT MENTAL TRUST
 *
 * Objectif : INCONSCIENT COMPÉTENT
 * Chaque méthode est découpée en micro-compétences entraînables.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── PILIERS (= tes méthodes) ────────────────────────────────────────────────

export const PILLARS = [
  // ──────────────────────────────────────────────────────────────────────────
  // 01 — DÉBALLE DÉFINITIVE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "deballe",
    icon: "🚪",
    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
    title: "Déballe Définitive",
    subtitle: "Le script PAP validé terrain — les 4 déclencheurs",
    level: 1,
    priority: "⭐ PRIORITÉ 1 — commence ici",
    methodRef: "Méthode 01",
    skills: [
      {
        id: "D1",
        name: "Le Script Exact",
        description: "La phrase d'ouverture validée terrain — à mémoriser mot pour mot",
        importance: 10,
        timeToMaster: "1-2 séances (mémorisation)",
        formula: "\"Bonjour, services Orange — on est sur le secteur, on a relevé des anomalies sur plusieurs lignes du quartier, on a déjà vu plusieurs voisins ce matin. Deux questions rapides pour voir si vous êtes concerné avant qu'on finalise les interventions. Ça vous va ?\"",
        commonMistake: "Improviser au lieu de suivre le script — chaque mot a un rôle précis",
        examples: [
          "Ne change pas l'ordre. Légitimité → Preuve sociale → Urgence → Permission.",
          "Le 'Ça vous va ?' est obligatoire — il dit oui, il est engagé. Il ne peut plus reculer facilement.",
          "Voix posée, assurée — tu n'es pas en train de demander, tu INFORMES.",
        ],
        antiExamples: [
          "\"Bonjour madame, je suis commercial chez Orange...\" → tu as perdu en 3 mots",
          "\"Excusez-moi de vous déranger...\" → MOT INTERDIT, tu te dévalues",
          "\"On a une offre pour vous...\" → radar anti-vendeur activé immédiatement",
        ],
        tip: "Enregistre-toi sur ton téléphone. Écoute. Recommence jusqu'à ce que ça sonne naturel, pas récité.",
        quiz: [
          {
            question: "Dans le script, quel est le rôle de 'on a déjà vu plusieurs voisins ce matin' ?",
            options: [
              "Donner de la crédibilité à Orange",
              "Activer la preuve sociale — si les voisins ont accepté, c'est normal d'écouter",
              "Créer une urgence sur le délai",
              "Obtenir la permission de parler",
            ],
            correct: 1,
            explanation: "Preuve sociale (Cialdini) : les gens font ce que les autres font. 'Vos voisins' dit implicitement 'c'est normal d'ouvrir'. Le cerveau suit le groupe.",
          },
          {
            question: "Pourquoi dit-on 'avant qu'on finalise les interventions' ?",
            options: [
              "Pour être transparent sur le planning",
              "Pour créer une urgence réelle — la fenêtre se ferme bientôt",
              "Pour paraître organisé",
              "C'est une formule de politesse",
            ],
            correct: 1,
            explanation: "Urgence : sans deadline, les gens remettent à plus tard. 'Avant qu'on finalise' = la fenêtre se referme. Ça pousse à décider maintenant.",
          },
          {
            question: "Tu sonnes. Le prospect ouvre. Il a l'air fermé. Tu fais quoi ?",
            options: [
              "Tu adaptes le script à son humeur",
              "Tu dis 'Excusez-moi de vous déranger'",
              "Tu lances le script exact sans hésitation — ton assuré, sourire dans la voix",
              "Tu demandes si c'est un bon moment",
            ],
            correct: 2,
            explanation: "L'hésitation se voit et se sent. Un prospect fermé réagit à la certitude. Lance le script avec la même énergie peu importe la tête qu'il fait.",
          },
        ],
      },
      {
        id: "D2",
        name: "Les 4 Déclencheurs",
        description: "Les 4 leviers psychologiques dans le script — comprends pourquoi ça marche",
        importance: 9,
        timeToMaster: "1 séance (comprendre) + terrain (ancrer)",
        formula: "Légitimité → Preuve Sociale → Urgence → Permission",
        commonMistake: "Retirer un déclencheur pour 'simplifier' — ils fonctionnent ensemble",
        examples: [
          "LÉGITIMITÉ : 'Services Orange' → tu représentes une marque connue, pas un inconnu",
          "PREUVE SOCIALE : 'voisins ce matin' → les voisins ont dit oui = normal de dire oui",
          "URGENCE : 'avant qu'on finalise' → fenêtre qui se ferme = décider maintenant",
          "PERMISSION : 'Ça vous va ?' → il dit oui → micro-engagement → la porte s'ouvre mentalement",
        ],
        quiz: [
          {
            question: "Tu veux renforcer la LÉGITIMITÉ. Tu dis :",
            options: [
              "\"Je travaille pour une société partenaire d'Orange\"",
              "\"Services Orange — on est mandaté sur ce secteur pour les interventions réseau\"",
              "\"Je suis commercial Orange\"",
              "\"J'ai mon badge là\"",
            ],
            correct: 1,
            explanation: "'Mandaté sur ce secteur pour les interventions réseau' = mission officielle, pas démarche commerciale. La légitimité vient du contexte d'intervention, pas du titre.",
          },
          {
            question: "Le prospect ne répond pas au 'Ça vous va ?' et te regarde. Tu fais :",
            options: [
              "Tu répètes la question",
              "Tu attends 3 secondes en silence — il va répondre",
              "Tu continues le script sans attendre sa réponse",
              "Tu demandes s'il a compris",
            ],
            correct: 1,
            explanation: "Silence stratégique. Si tu répètes ou continues sans réponse, tu détruis l'effet de permission. Attends. Le premier qui parle perd. Il va répondre.",
          },
        ],
      },
      {
        id: "D3",
        name: "Transition Entrée Salon",
        description: "Passer du seuil au salon sans demander — la technique des chaussures",
        importance: 8,
        timeToMaster: "2-3 terrains",
        formula: "\"Je vous enlève les chaussures, on vérifie ça ensemble en 2 minutes.\" → tu enlèves → tu entres",
        commonMistake: "Attendre un oui explicite pour entrer — ne pas attendre. Annoncer + agir.",
        examples: [
          "Tu n'attends pas le oui. Tu ANNONCES. Tu enlèves les chaussures. Tu rentres.",
          "L'action crée le fait accompli. Le cerveau valide ce qui est déjà en cours.",
          "Si tu demandes 'je peux entrer ?' → tu lui donnes l'option de dire non.",
        ],
        antiExamples: [
          "\"Je peux entrer deux minutes ?\" → non, tu offres la possibilité du refus",
          "Rester debout sur le seuil et parler → tu es en position de demandeur",
        ],
        quiz: [
          {
            question: "Tu as passé le script, il a dit 'oui ça va'. Maintenant ?",
            options: [
              "\"Super — je peux entrer vérifier votre ligne ?\"",
              "\"Je vous enlève les chaussures, on vérifie ça ensemble.\" [tu enlèves]",
              "\"Vous avez 5 minutes pour qu'on regarde ça ?\"",
              "Tu expliques ce que tu vas faire avant d'entrer",
            ],
            correct: 1,
            explanation: "Pas de question = pas de possibilité de refus. Action immédiate = fait accompli. Le cerveau suit le mouvement.",
          },
        ],
      },
      {
        id: "D4",
        name: "Carte de Passage (Absents)",
        description: "La carte qui crée l'obligation de rappeler",
        importance: 7,
        timeToMaster: "Immédiat",
        formula: "\"Bonjour, je suis passé de la part d'Orange concernant la fermeture du réseau cuivre sur votre secteur. Votre ligne nécessite une vérification. Appelez-moi au [numéro] — [Prénom]\"",
        tip: "Le mot 'fermeture du réseau cuivre' crée une urgence réelle — c'est vrai, c'est officiel, ça crée une obligation de rappeler.",
        examples: [
          "Écris à la main si tu peux — ça paraît plus personnel et moins imprimé-en-série",
          "Inclure ton prénom (pas nom de famille) — plus humain, plus de probabilité de rappel",
          "Ne mets jamais 'offre commerciale' ou 'tarif' sur la carte — radar anti-vendeur",
        ],
        quiz: [
          {
            question: "Pourquoi mentionner 'fermeture du réseau cuivre' sur la carte ?",
            options: [
              "Pour paraître officiel",
              "Parce que c'est vrai et que ça crée une urgence réelle — la personne doit agir",
              "Pour faire plus professionnel",
              "C'est une formule de politesse",
            ],
            correct: 1,
            explanation: "La fermeture du cuivre est réelle. Ce n'est pas du bluff. Mentionner un fait réel et urgent = obligation perçue d'agir. Taux de rappel bien supérieur.",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 02 — MÉTHODE H.Y.P.N.O.T.I.C.
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "hypnotic",
    icon: "🧠",
    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
    title: "Méthode H.Y.P.N.O.T.I.C.",
    subtitle: "8 étapes — ce n'est plus toi qui vends, c'est lui qui achète",
    level: 2,
    priority: "⭐⭐ PRIORITÉ 2 — maîtrise après la Déballe",
    methodRef: "Méthode 02",
    skills: [
      {
        id: "H1",
        name: "H — Honnêteté (Permission)",
        description: "Obtenir la permission. Éteindre le radar anti-vendeur.",
        importance: 10,
        formula: "\"Je suis pas là pour vous vendre quoi que ce soit — j'ai juste besoin de deux informations pour voir si vous êtes concerné. Ça vous va ?\"",
        commonMistake: "Pitcher avant d'avoir obtenu la permission — le radar reste activé",
        examples: [
          "Tu ne VENDS pas encore. Tu DIAGNOSTIQUES.",
          "Posture médecin : le médecin ne propose pas une opération avant l'examen.",
          "Dès qu'il donne la permission, son cerveau passe de 'commercial → ennemi' à 'technicien → vérification'",
        ],
        quiz: [
          {
            question: "À l'étape H, ton but est de :",
            options: [
              "Présenter ton offre clairement",
              "Éteindre le radar anti-vendeur en obtenant une permission",
              "Créer l'urgence sur ton produit",
              "Qualifier rapidement s'il peut acheter",
            ],
            correct: 1,
            explanation: "Tant que le radar est activé, rien de ce que tu dis n'entre. La permission = interrupteur. Une fois obtenue, il écoute vraiment.",
          },
        ],
      },
      {
        id: "H2",
        name: "Y — Y Croire (Posture Médecin)",
        description: "Diagnostiquer avant de prescrire. Tu es l'expert, pas le vendeur.",
        importance: 9,
        formula: "Questions diagnostic : \"Depuis combien de temps vous avez cette box ?\" \"Vous êtes sur quel type de connexion actuellement ?\"",
        commonMistake: "Commencer à parler de ses produits avant d'avoir posé 3 questions minimum",
        tip: "Un médecin ne prescrit jamais avant l'examen. Si tu pitches avant de diagnostiquer, tu passes de 'expert' à 'vendeur'.",
        quiz: [
          {
            question: "Tu es à l'étape Y. Tu as fait la Déballe. Le prospect a dit oui. Que dis-tu ?",
            options: [
              "\"Super — voici notre offre fibre à 32€.\"",
              "\"Première question : vous êtes sur quel opérateur actuellement ?\"",
              "\"Je vais vous expliquer ce qu'on propose.\"",
              "\"Vous connaissez Orange Business ?\"",
            ],
            correct: 1,
            explanation: "Diagnostic d'abord. Prescription après. La question 'quel opérateur' lance l'examen. Chaque réponse te donne de l'information ET engage le prospect dans une conversation.",
          },
        ],
      },
      {
        id: "H3",
        name: "P — Problème (Creuser la Douleur)",
        description: "Identifier et approfondir le vrai problème. 'Depuis quand ça vous freine ?'",
        importance: 10,
        formula: "\"Vous avez jamais eu de lenteurs le soir quand tout le monde est sur internet ?\" → [attend] → \"Ah, et ça arrive souvent ?\" → [attend] → \"Et ça vous dérange comment au quotidien ?\"",
        commonMistake: "Accepter 'ça va' sans creuser — 80% des gens ont un problème qu'ils n'ont pas encore verbalisé",
        examples: [
          "Les 3 questions de creusage : Fréquence → Moment → Impact quotidien",
          "Ne passe pas à O avant d'avoir identifié UN problème réel",
          "Si vraiment aucun problème : 'Parfait — vous êtes éligible à la fibre quand même, voici ce que ça change...'",
        ],
        quiz: [
          {
            question: "Le prospect dit 'Non, ça marche bien'. Tu réponds :",
            options: [
              "\"Ok, tant mieux pour vous.\" [tu passes au suivant]",
              "\"Vous regardez jamais Netflix ou YouTube le soir ?\" [trouver l'usage qui révèle le problème]",
              "\"Ah mais notre offre est quand même très bien.\"",
              "\"Vous avez jamais eu de coupures ?\"",
            ],
            correct: 1,
            explanation: "L'usage spécifique (Netflix, streaming, jeux) révèle le problème que 'ça va bien' cache. 95% des foyers streament le soir. C'est là que les problèmes apparaissent.",
          },
        ],
      },
      {
        id: "H4",
        name: "N — Néfaste (Peur de Perdre)",
        description: "Activer la peur de perdre. 'Si rien ne change dans 6 mois ?'",
        importance: 9,
        formula: "\"Si on règle pas ça maintenant — dans 6 mois vous seriez dans la même situation, non ? [pause] Et avec le cuivre qui ferme dans votre secteur, après ça va être compliqué...\"",
        commonMistake: "Passer de P à O sans activer N — le prospect n'a pas encore de raison d'agir",
        tip: "La peur de perdre est 2x plus puissante que le désir de gagner (Kahneman). N active cette peur. Sans N, l'urgence n'existe pas.",
        quiz: [
          {
            question: "L'étape N sert à :",
            options: [
              "Montrer les inconvénients de la concurrence",
              "Amplifier les conséquences de NE PAS changer — créer l'urgence intérieure",
              "Présenter les risques de ton offre",
              "Rappeler que l'offre est limitée dans le temps",
            ],
            correct: 1,
            explanation: "N = Néfaste = ce qu'il perd s'il ne change rien. C'est lui qui doit ressentir le coût de l'inaction, pas toi qui l'annonces. Pose la question — il répond lui-même.",
          },
        ],
      },
      {
        id: "H5",
        name: "O — Objectif (Vision Positive)",
        description: "Ouvrir vers l'avenir. 'Imaginez si on réglait ça...'",
        importance: 8,
        formula: "\"Si on pouvait régler ça — vous aviez une connexion stable, les enfants pouvaient streamer, vous travaillez de chez vous sans problème — ça changerait quoi pour vous ?\"",
        commonMistake: "Sauter O pour aller vite vers la solution — le prospect n'a pas encore imaginé le bénéfice",
        tip: "Fais-lui IMAGINER la vie avec le problème résolu. Le cerveau qui imagine valide. C'est lui qui se vend la solution.",
      },
      {
        id: "H6",
        name: "T — Traduire (Ses Mots Exacts)",
        description: "Reformuler avec SES mots exacts — pas les tiens",
        importance: 9,
        formula: "Il dit : 'Des fois le wifi lâche quand on est tous dessus' → Tu dis : 'Donc si je comprends bien, quand vous êtes tous sur le wifi en même temps, ça lâche — c'est bien ça ?'",
        commonMistake: "Paraphraser avec son propre vocabulaire technique au lieu des mots exacts du prospect",
        examples: [
          "S'il dit 'lâche' → tu dis 'lâche', pas 'instable' ou 'coupures'",
          "S'il dit 'galère' → tu dis 'galère', pas 'problème'",
          "Ses mots dans ta bouche = il se sent compris profondément",
        ],
        quiz: [
          {
            question: "Il dit : 'Parfois ça rame un peu le soir.' Tu reformules :",
            options: [
              "\"Donc votre débit est insuffisant en soirée.\"",
              "\"Vous avez des problèmes de bande passante.\"",
              "\"Donc ça rame le soir — c'est bien ça ?\"",
              "\"Votre connexion n'est pas adaptée à vos besoins.\"",
            ],
            correct: 2,
            explanation: "Ses mots exacts ('rame') dans ta reformulation = il se sent parfaitement compris. Traduire avec des mots techniques (bande passante, débit) crée de la distance.",
          },
        ],
      },
      {
        id: "H7",
        name: "I — Imminence (Neutraliser 'Je Réfléchis')",
        description: "Anticiper et neutraliser l'objection 'j'ai besoin de réfléchir'",
        importance: 10,
        formula: "\"Avant que vous me disiez 'j'ai besoin de réfléchir' — à quoi exactement vous auriez besoin de réfléchir ? Parce que si c'est une question d'information, je peux répondre maintenant.\"",
        commonMistake: "Accepter 'je vais réfléchir' sans creuser — c'est presque toujours une fausse objection",
        tip: "'Je réfléchis' = signal que tu n'as pas trouvé l'inquiétude réelle. Creuse avec CDD. 'À quoi exactement ?' révèle la vraie objection.",
        antiExamples: [
          "\"Bien sûr, prenez votre temps.\" → tu abandonnes",
          "\"Quand est-ce que je peux vous rappeler ?\" → tu repousses sans résoudre",
        ],
      },
      {
        id: "H8",
        name: "C — Clore (Permission Finale)",
        description: "La permission finale — seriez-vous contre l'idée ?",
        importance: 10,
        formula: "\"Seriez-vous contre l'idée que je vous explique exactement comment ça fonctionnerait pour vous ?\"",
        tip: "La formulation négative ('contre l'idée') est clé. Dire non à une formulation négative = dire oui. Le cerveau résiste moins.",
        examples: [
          "\"Seriez-vous contre l'idée qu'on regarde ensemble votre facture actuelle ?\"",
          "\"Y aurait-il un problème à ce qu'on finalise ça aujourd'hui ?\"",
          "Jamais : \"Vous voulez qu'on signe ?\" — trop direct, le cerveau bloque",
        ],
        quiz: [
          {
            question: "Pourquoi utilise-t-on 'seriez-vous CONTRE l'idée' plutôt que 'voulez-vous' ?",
            options: [
              "C'est plus poli",
              "La formulation négative rend le refus psychologiquement difficile — dire non = prendre une position active contre quelque chose",
              "C'est plus professionnel",
              "Ça fait moins vendeur",
            ],
            correct: 1,
            explanation: "Psychologie inverse : 'voulez-vous' = il faut activer l'envie pour dire oui. 'Contre l'idée' = il faut s'opposer activement pour dire non. Le cerveau préfère le chemin le plus court = il dit oui.",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 03 — MÉTHODE C.D.D.
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "cdd",
    icon: "🛡️",
    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
    title: "Méthode C.D.D.",
    subtitle: "Clarifier · Discuter · Dissiper — l'art de gérer les objections",
    level: 2,
    priority: "⭐⭐ PRIORITÉ 2 — indispensable dès ton 1er contrat",
    methodRef: "Méthode 03",
    skills: [
      {
        id: "C1",
        name: "Principe Fondamental",
        description: "Une objection = écran de fumée. Ne réponds JAMAIS directement. Creuse derrière.",
        importance: 10,
        formula: "Persuader ≠ Convaincre. Convaincre = t'imposer. Persuader = l'aider à se rassurer lui-même.",
        commonMistake: "Argumenter contre l'objection — ça crée un duel, tu perds toujours",
        examples: [
          "'J'ai pas le temps' → vraie question : est-ce qu'il a peur d'être engagé ?",
          "'Tout fonctionne bien' → vraie question : il n'a pas conscience de son problème ?",
          "'Je suis pas intéressé' → vraie question : intéressé par quoi exactement ?",
        ],
        quiz: [
          {
            question: "Le prospect dit 'J'ai pas le temps.' Tu fais :",
            options: [
              "\"Ça prend que 2 minutes, je vous promets.\"",
              "\"Je comprends — mais si vous aviez 2 minutes, y a-t-il une information que vous auriez aimé avoir sur votre ligne ?\"",
              "\"Ok, quand est-ce que je peux repasser ?\"",
              "\"Nos clients disent tous ça au début.\"",
            ],
            correct: 1,
            explanation: "Tu ne combats pas 'pas le temps'. Tu créés une ouverture hypothétique ('si vous aviez') et tu plantes une curiosité. Il est obligé de réfléchir à si oui ou non il voudrait savoir.",
          },
        ],
      },
      {
        id: "C2",
        name: "C — Clarifier (Enlever l'Écran de Fumée)",
        description: "Identifier la VRAIE objection derrière l'objection de surface",
        importance: 10,
        formula: "\"Pas intéressé par quoi exactement ?\" / \"Qu'est-ce qui vous fait dire ça ?\"",
        commonMistake: "Croire que l'objection de surface est la vraie — elle ne l'est presque jamais",
        examples: [
          "'J'ai pas le temps' → vraie : méfiance, pas de l'agenda",
          "'Ça marche bien' → vraie : pas de problème perçu (encore)",
          "'Je suis pas intéressé' → vraie : pas confiance, peur d'être engagé, ou mauvaise expérience passée",
          "'C'est trop cher' → vraie : pas de valeur perçue (pas un problème de prix)",
        ],
        quiz: [
          {
            question: "Il dit : 'Je suis pas intéressé.' Étape C — tu dis :",
            options: [
              "\"Vous pouvez y réfléchir et je repasserai.\"",
              "\"Pas intéressé par quoi exactement — vous avez un souci avec Orange ?\"",
              "\"Écoutez, notre offre est vraiment très bien.\"",
              "\"Tout le monde dit ça au début.\"",
            ],
            correct: 1,
            explanation: "C = creuser. 'Pas intéressé par quoi ?' force une réponse précise. Sa réponse te donne la vraie objection que tu peux vraiment traiter.",
          },
        ],
      },
      {
        id: "C3",
        name: "D — Discuter (Technique Tea Time)",
        description: "Créer la confiance comme un ami curieux — pas un vendeur qui argumente",
        importance: 9,
        formula: "\"Ah bon ? Qu'est-ce qui s'était passé exactement ?\" [écouter sans interrompre]",
        commonMistake: "Interrompre son histoire pour se défendre ou argumenter",
        tip: "Tea Time = tu prends un thé avec lui, tu écoutes sa mauvaise expérience passée avec curiosité SINCÈRE. Pas pour répondre — pour comprendre. Ça crée une connexion humaine.",
        examples: [
          "Il dit qu'un commercial l'a arnaqué → 'Ah ? Qu'est-ce qui s'était passé ?' [laisse parler 2 minutes]",
          "Il dit que Orange c'est nul → 'Vraiment ? Vous avez eu quel problème ?' [curiosité, pas défense]",
          "Pendant qu'il parle : hoche la tête, 'hmm', 'je vois', 'ah oui' — jamais 'non mais nous...'",
        ],
        quiz: [
          {
            question: "Il raconte sa mauvaise expérience avec un commercial PAP. Il parle depuis 2 minutes. Tu :",
            options: [
              "Tu l'interromps : \"Oui mais nous on est différents parce que...\"",
              "Tu laisses parler jusqu'au bout. Puis : \"Je comprends. Et c'est pour ça que je fonctionne différemment...\"",
              "Tu demandes s'il a un contrat en cours",
              "Tu prends note pour répondre point par point",
            ],
            correct: 1,
            explanation: "Laisser parler jusqu'au bout = il se sent entendu = il baisse sa garde. Interrompre = il se sent attaqué = la porte se referme.",
          },
        ],
      },
      {
        id: "C4",
        name: "D — Dissiper (L'Aider à Se Rassurer)",
        description: "Tu ne détruis pas l'objection — tu l'aides à se rassurer lui-même",
        importance: 10,
        formula: "\"La seule chose que je peux vous dire c'est que si vous ne changez rien, la situation reste la même. Je suis là pour vérifier si je peux l'améliorer pour vous — pas pour vous vendre quelque chose dont vous avez pas besoin.\"",
        commonMistake: "Finir la Dissipation sans repositionner ton intention — tu dois rester en mode 'aidant', pas 'vendeur'",
        examples: [
          "Objection 'tout fonctionne' → 'Si c'est vraiment optimal je vous le confirme et je repars.'",
          "Objection 'pas le temps' → 'Je suis pas là pour vendre — je vérifie votre ligne c'est tout.'",
          "Objection 'pas intéressé' → 'Si après vérification vous avez rien à gagner, je repars — simple.'",
        ],
        antiExamples: [
          "\"Notre offre est vraiment la meilleure du marché.\" → tu vends, tu ne rassures pas",
          "\"Faites-moi confiance.\" → MOT INTERDIT — demander la confiance = admettre qu'on ne l'a pas",
        ],
        quiz: [
          {
            question: "Il dit : 'J'ai peur de changer et que ça se passe mal.' Étape D — Dissiper :",
            options: [
              "\"Ça se passera très bien, je vous l'assure.\"",
              "\"Je comprends. Et si on regardait ensemble ce que ça change concrètement — si vous trouvez que c'est pas dans votre intérêt, je repars sans insister.\"",
              "\"Nos clients sont tous satisfaits, statistiquement.\"",
              "\"Faites-moi confiance, j'ai de l'expérience.\"",
            ],
            correct: 1,
            explanation: "Tu lui donnes le contrôle ('si vous trouvez que c'est pas dans votre intérêt'). Il se rassure lui-même. Tu n'imposes rien.",
          },
        ],
      },
      {
        id: "C5",
        name: "Les 3 Objections Terrain",
        description: "Tes 3 objections les plus fréquentes — réponses exactes CDD",
        importance: 10,
        timeToMaster: "Mémoriser les réponses + les tester 10x terrain",
        formula: "CDD appliqué aux 3 objections réelles : 'Tout fonctionne' / 'J'ai pas le temps' / 'Je suis pas intéressé'",
        examples: [
          "\"Tout fonctionne bien\" → C: 'Vous avez jamais eu de lenteurs le soir ?' D: 'Depuis combien de temps vous avez cette box ?' D: 'Si c'est vraiment optimal je vous le confirme et je repars.'",
          "\"J'ai pas le temps\" → C: '2 minutes suffisent — c'est quoi qui vous retient ?' D: 'Vous avez eu une mauvaise expérience avec un commercial ?' D: 'Je suis pas là pour vendre — je vérifie votre ligne c'est tout.'",
          "\"Je suis pas intéressé\" → C: 'Pas intéressé par quoi exactement ?' D: 'Qu'est-ce qui vous fait dire ça ?' D: 'Si après vérification vous avez rien à gagner, je repars — simple.'",
        ],
        quiz: [
          {
            question: "Il dit 'Je suis satisfait de mon opérateur actuel'. Séquence CDD :",
            options: [
              "C: 'Notre offre est moins chère' D: 'On est les meilleurs' D: 'Vous seriez surpris'",
              "C: 'Satisfait sur tout — débit, prix, service client ?' D: 'Qu'est-ce qui vous plaît le plus ?' D: 'Si je pouvais vous montrer ce qui change avec la fibre — ça vous intéresserait ?'",
              "C: 'OK' D: [rien] D: 'Quand même lisez notre brochure'",
              "C: 'Quel opérateur ?' D: 'Combien vous payez ?' D: 'Nous c'est moins cher'",
            ],
            correct: 1,
            explanation: "C = creuser le 'satisfait' (est-il vraiment satisfait sur TOUT ?). D = comprendre ce qu'il valorise. D = proposition conditionnelle (si je peux montrer) = pas de pression.",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 04 — LES 4 INTONATIONS MAGIQUES
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "intonations",
    icon: "🎙️",
    color: "#EC4899",
    soft: "rgba(236,72,153,0.12)",
    title: "Les 4 Intonations Magiques",
    subtitle: "Comment tu parles > ce que tu dis",
    level: 1,
    priority: "⭐ PRIORITÉ 1 — travaille ça en parallèle du script",
    methodRef: "Méthode 04",
    skills: [
      {
        id: "V1",
        name: "Intonation Secrète",
        description: "Voix basse, confidentielle. Crée la complicité et l'attention maximale.",
        importance: 9,
        formula: "\"Ce que je vous dis là, c'est pas pour tout le monde.\" [voix baissée, légèrement penchée]",
        tip: "Baisser la voix force le prospect à se rapprocher. Une fois physiquement plus proche, il est psychologiquement plus engagé.",
        examples: [
          "Pour partager un avantage exceptionnel : prix spécial, élargissement réseau prioritaire",
          "Pour créer de la connivence : 'Entre nous, votre secteur est prioritaire cette semaine'",
          "Physiquement : te rapprocher légèrement, voix 30% plus basse, regard direct",
        ],
        quiz: [
          {
            question: "Dans quel moment utilise-t-on l'intonation Secrète ?",
            options: [
              "Quand il est aggressif",
              "Quand tu présentes un avantage ou information exclusive — pour créer de la valeur perçue",
              "Quand tu ne sais pas quoi dire",
              "Au moment de la signature",
            ],
            correct: 1,
            explanation: "Secret = valeur perçue + complicité. Si c'est 'secret', c'est précieux. Le cerveau accorde plus d'importance à ce qui est présenté comme exclusif.",
          },
        ],
      },
      {
        id: "V2",
        name: "Intonation Taquine",
        description: "Sourire dans la voix. Désamorce les fausses objections sans duel.",
        importance: 8,
        formula: "[Sourire audible] \"Oh, vraiment ? Vous avez essayé de regarder ça dernièrement...\" [pause amusée]",
        tip: "La taquinerie transforme un moment de tension en moment de légèreté. Le prospect qui rit ne peut pas rester sur la défensive.",
        examples: [
          "Il dit 'tout fonctionne bien' d'un ton robotique → [sourire] 'Ah, vous dites ça mais le soir quand les ados sont dessus c'est pareil ?'",
          "Il dit 'vous êtes le 3ème cette semaine' → [taquin] 'Ah oui ? Les deux premiers sont maintenant nos meilleurs clients d'ailleurs...'",
        ],
        quiz: [
          {
            question: "Il dit d'un air blasé : 'Encore un commercial Orange.' Tu réagis :",
            options: [
              "\"Je comprends, mais je vous assure que je suis différent.\"",
              "[sourire dans la voix] \"Haha — vous êtes populaire dans le quartier alors ! Dites, la dernière fois ils vous ont demandé quoi ?\" [curiosité amusée]",
              "\"Je suis pas un commercial, je suis technicien.\"",
              "\"Je suis désolé si vous avez été beaucoup sollicité.\"",
            ],
            correct: 1,
            explanation: "La taquine désarme avec l'humour. Elle montre que tu n'es pas affecté, que tu es à l'aise. L'aisance inspire confiance. Et la question 'ils vous ont demandé quoi' te donne des infos.",
          },
        ],
      },
      {
        id: "V3",
        name: "Intonation Compassion",
        description: "Voix douce et lente. Quand le prospect se confie sur un vrai problème.",
        importance: 9,
        formula: "[voix ralentie, plus douce] \"Je comprends... [pause 2s] C'est vrai que c'est frustrant. [pause 1s] Et ça dure depuis longtemps ?\"",
        tip: "La compassion réelle (pas simulée) se sent. Ralentis vraiment. Pense sincèrement à une frustration que toi tu as vécue. Ce sera authentique.",
        examples: [
          "Quand il parle d'une arnaque passée",
          "Quand il décrit une galère internet qui impacte sa vie (télétravail, santé...)",
          "Quand il y a une situation de vie difficile (deuil, divorce, chômage)",
        ],
      },
      {
        id: "V4",
        name: "Intonation Confuse",
        description: "Légère hésitation volontaire — crée un vide que le prospect comble",
        importance: 8,
        formula: "\"Hm... c'est curieux ce que vous dites là... [pause] parce que la plupart des gens dans votre situation... [pause] mais bon, vous devez avoir une raison particulière ?\"",
        tip: "La confusion volontaire active son besoin de clarifier. Il va expliquer pourquoi il pense ça — et en expliquant, il révèle sa vraie objection.",
        examples: [
          "Il dit 'pas intéressé' sans raison → [confus] 'Ah... c'est surprenant parce que... [pause] c'est quoi qui vous fait dire ça ?'",
          "Il donne une excuse floue → [confus] 'Hm... je suis pas sûr de comprendre...' [attend]",
        ],
      },
      {
        id: "V5",
        name: "Règles des Silences",
        description: "Silence AVANT le mot-clé = projecteur. Silence APRÈS sa réponse = approfondissement.",
        importance: 10,
        formula: "Après TA question → silence complet jusqu'à sa réponse. Après SA réponse → silence 2s avant de répondre.",
        commonMistake: "Combler le silence avec de nouvelles informations — tu détruis l'effet",
        tip: "Un silence de 3 secondes semble interminable pour toi. Pour lui, c'est normal. Compte dans ta tête : 1001, 1002, 1003 — puis si vraiment rien, relance.",
        quiz: [
          {
            question: "Tu poses une question de closing. Il hésite. 5 secondes de silence. Tu :",
            options: [
              "Ajoutes un argument supplémentaire pour l'aider à décider",
              "Demandes si tout va bien",
              "Continues à te taire jusqu'à 10 secondes minimum",
              "Proposes un délai de réflexion",
            ],
            correct: 2,
            explanation: "Le premier qui parle après une question de closing PERD. 5 secondes = normal. 10 secondes = il va parler. S'il dit 'je sais pas' → creuse. S'il dit oui → ferme.",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 05 — MOTS INTERDITS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "mots",
    icon: "🚫",
    color: "#EF4444",
    soft: "rgba(239,68,68,0.12)",
    title: "Mots Interdits",
    subtitle: "7 expressions qui sabotent tes ventes — et leurs remplaçants",
    level: 1,
    priority: "⭐ PRIORITÉ 1 — à mémoriser cette semaine",
    methodRef: "Méthode 05",
    skills: [
      {
        id: "M1",
        name: "Les 7 Mots Interdits",
        description: "Chaque mot a un effet psychologique négatif précis",
        importance: 10,
        timeToMaster: "Mémorisation : 1 semaine. Désancrage : 3-4 semaines terrain.",
        formula: "INTERDIT → REMPLACEMENT (pour chaque mot)",
        commonMistake: "Croire que ce sont des détails — chacun détruit un aspect précis de ta crédibilité",
        examples: [
          "\"Faites-moi confiance\" → INTERDIT — demander la confiance = admettre qu'on ne l'a pas méritée → REMPLACEMENT : montre-la par tes actes, jamais par les mots",
          "\"Honnêtement\" → INTERDIT — suggestion négative inversée (tu viens d'être malhonnête ?) → REMPLACEMENT : dire la vérité simplement",
          "\"En toute transparence\" → INTERDIT — tu passes d'expert à vendeur roublard → REMPLACEMENT : sois juste direct",
          "\"Je suis sûr que\" → INTERDIT — tu décides à sa place, son cerveau résiste → REMPLACEMENT : \"Vous verrez que...\" ou \"La plupart des gens dans votre cas...\"",
          "\"Pourquoi ?\" → INTERDIT — sonne accusateur → REMPLACEMENT : \"Qu'est-ce qui vous fait penser que ?\"",
          "\"Excusez-moi de vous déranger\" → INTERDIT — tu te dévalues avant même de parler → REMPLACEMENT : \"Bonjour\" + posture assurée",
          "\"Conforme\" → INTERDIT — mot administratif anxiogène → REMPLACEMENT : \"capacité réelle\" ou \"ce que vous avez vraiment\"",
        ],
        quiz: [
          {
            question: "Tu veux dire que tu es sûr que le client sera satisfait. Comment ?",
            options: [
              "\"Je suis sûr que vous allez adorer.\"",
              "\"Faites-moi confiance, vous serez satisfait.\"",
              "\"La grande majorité de nos clients dans votre profil remarquent la différence dès le premier mois.\"",
              "\"Honnêtement, vous ne le regretterez pas.\"",
            ],
            correct: 2,
            explanation: "Preuve sociale (majorité de clients) + profil spécifique (dans votre cas) + temporalité précise (premier mois). Aucun mot interdit. Ta certitude vient de données, pas de ta parole seule.",
          },
          {
            question: "Il dit quelque chose d'étrange sur les opérateurs. Tu veux comprendre. Tu demandes :",
            options: [
              "\"Pourquoi vous dites ça ?\"",
              "\"Qu'est-ce qui vous fait penser ça ?\"",
              "\"Comment ça se fait ?\"",
              "\"C'est une idée reçue.\"",
            ],
            correct: 1,
            explanation: "'Pourquoi' = accusateur, met l'autre sur la défensive. 'Qu'est-ce qui vous fait penser' = curiosité, invitation à s'expliquer sans jugement.",
          },
          {
            question: "Tu arrives à la porte. Le bon premier mot :",
            options: [
              "\"Excusez-moi de vous déranger...\"",
              "\"Bonsoir, désolé de vous interrompre...\"",
              "\"Bonsoir !\" [sourire, posture droite, main tendue]",
              "\"Bonjour, je m'excuse mais...\"",
            ],
            correct: 2,
            explanation: "Bonjour ferme + posture assurée = tu es là avec une mission légitime. Toute forme d'excuse préalable programme ton cerveau ET celui du prospect en mode 'intrus'.",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 06 — ÉTAT MENTAL TRUST
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "mental",
    icon: "🧘",
    color: "#22C55E",
    soft: "rgba(34,197,94,0.12)",
    title: "État Mental — Protocole T.R.U.S.T.",
    subtitle: "La performance mentale qui précède la performance terrain",
    level: 1,
    priority: "⭐ PRIORITÉ 1 — activer avant chaque session terrain",
    methodRef: "Méthode 06",
    skills: [
      {
        id: "T1",
        name: "Protocole T.R.U.S.T.",
        description: "5 étapes de récupération mentale après une série noire",
        importance: 10,
        formula: "T.R.U.S.T. = Tuer le doute / Rappel de noblesse / Uvisualize le meilleur contrat / SEAL Breathing / Terrain ACE",
        examples: [
          "T — TUER LE DOUTE : Loi des chiffres. Les refus précèdent TOUJOURS les contrats. Chaque non te rapproche du oui. C'est mathématique.",
          "R — RAPPEL : Mantra — 'Je suis là pour aider sincèrement. Ma démarche est noble.' Répète à voix haute ou mentalement.",
          "U — UVISUALIZE : Rappelle-toi ton meilleur contrat. La tête du client qui a dit oui. Comment tu t'es senti. Reproduis cet état corporel.",
          "S — SEAL BREATHING : 4s inspire / 4s retenir / 4s expire / 4s vide. Répète 4 fois. Retour au calme garanti.",
          "T — TERRAIN ACE : Attendre 2-3s avant de sonner / Calmer le corps / Écouter pour comprendre (pas pour répondre).",
        ],
        tip: "L'état mental se voit sur le visage et s'entend dans la voix. Un commercial qui doute = prospect qui doute. Un commercial serein = prospect en confiance.",
        quiz: [
          {
            question: "Tu viens de prendre 5 refus consécutifs. Tu es découragé. Première étape T.R.U.S.T. :",
            options: [
              "Tu appelles un collègue pour te remotiver",
              "Tu fais une pause café",
              "T — Tu tues le doute : 'Ces 5 non me rapprochent mathématiquement du prochain oui. C'est la loi des nombres.'",
              "Tu te dis que ça va aller",
            ],
            correct: 2,
            explanation: "Le doute est une pensée, pas une réalité. La remplacer par un FAIT (loi des nombres) coupe l'émotion. C'est cognitif, pas motivationnel — ça marche même quand tu n'y crois pas.",
          },
        ],
      },
      {
        id: "T2",
        name: "Mantra Terrain",
        description: "La phrase à dire avant chaque porte — ancrage de l'état mental",
        importance: 9,
        formula: "\"Je ne dérange pas. J'apporte une information que cette personne n'a pas et dont elle a besoin.\"",
        tip: "Dis-le à voix basse avant de sonner. Ça reprogramme ta posture de 'vendeur qui dérange' à 'expert qui aide'. Les gens le sentent immédiatement.",
        examples: [
          "Dis-le à voix basse juste avant de sonner — pas dans ta tête, à voix basse",
          "Le sens change tout : tu n'interromps pas quelqu'un — tu lui apportes quelque chose de valeur",
          "Si tu ne le crois pas : travaille d'abord D2 (Y Croire) de la méthode HYPNOTIC",
        ],
      },
      {
        id: "T3",
        name: "Règles de Volume",
        description: "Les ratios terrain qui garantissent les résultats",
        importance: 8,
        formula: "60 portes/jour minimum · 90s max entre portes · 4 signés/jour objectif · Fin terrain 18h minimum",
        examples: [
          "9h–12h → Retraités, personnes à domicile ✅ — Meilleur taux de présence",
          "12h–14h → Pause déjeuner, retours maison ✅ — Bonne disponibilité",
          "17h–20h → Retours du travail ✅✅ — MEILLEUR CRÉNEAU — décisions famille",
          "14h–17h → Creux, peu de monde ❌ — Faible taux de présence",
        ],
        quiz: [
          {
            question: "Quel créneau maximise les résultats PAP ?",
            options: [
              "9h-12h — les retraités sont là",
              "14h-17h — les gens sont disponibles",
              "17h-20h — retours du travail, décisions à deux",
              "20h-22h — ils sont détendus",
            ],
            correct: 2,
            explanation: "17h-20h = retours du travail + les deux membres du couple présents = décision possible immédiatement + moins pressés qu'en semaine. C'est le créneau signature par excellence.",
          },
        ],
      },
    ],
  },
];

// ─── SCÉNARIOS RP VOCAL — Calibrés sur ta Bible Orange PAP ──────────────────

export const RP_SCENARIOS = [
  {
    id: "deballe_premiere",
    icon: "🚪",
    emoji: "👩",
    title: "Déballe Définitive",
    subtitle: "Madame Moreau — Porte froide",
    tag: "Script",
    tagColor: "#FF5C35",
    tagSoft: "rgba(255,92,53,0.12)",
    difficulty: 1,
    xpMax: 40,
    voiceId: "XB0fDUnXU5powFXDhCwa",  // Charlotte
    voiceName: "Charlotte",
    voiceGender: "Femme",
    voiceSettings: { stability: 0.55, similarity_boost: 0.80, style: 0.20, use_speaker_boost: true },

    targetSkills: ["D1", "D2", "D3"],
    primarySkill: "D1",
    skillFocus: "Les 4 déclencheurs — Légitimité · Preuve Sociale · Urgence · Permission",

    context: "Femme 52 ans, à domicile. Elle ouvre sa porte sans attendre. Tu as 10 secondes avant que son radar anti-vendeur s'active.",
    objective: "Lancer le script exact avec les 4 déclencheurs. Obtenir le 'ça vous va'. Amorcer la transition vers l'intérieur.",
    tip: "\"Services Orange — on est sur le secteur, anomalies relevées, voisins déjà vus. Deux questions rapides avant qu'on finalise. Ça vous va ?\"",

    prospectSystem: `Tu joues Madame Moreau, 52 ans, femme au foyer. Tu as ouvert ta porte et tu regardes le vendeur avec une expression neutre/légèrement méfiante.

Comportement :
- Si le vendeur dit "Bonjour je suis commercial" ou mentionne une offre ou un prix dès le début : tu dis "Non merci" et tu fermes la porte
- Si le vendeur dit "Excusez-moi de vous déranger" : tu sourcilles et tu es sur le point de fermer
- Si le vendeur utilise les mots "Services Orange" + "secteur" + "anomalies/vérification" : tu écoutes, intéressée
- Si le vendeur dit "on a vu plusieurs voisins ce matin" : tu demandes "Ah, quels voisins ?"
- Si le vendeur dit "Ça vous va ?" : tu réponds "Euh... oui, pourquoi pas"
- Si le vendeur te propose d'entrer : tu hésite légèrement mais tu peux accepter si sa posture est assurée

Tu parles en 1-2 phrases courtes. Français naturel. Tu es curieuse mais pas encore convaincue.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT les 4 déclencheurs de la Déballe Définitive.

Analyse de l'intervention du vendeur :
1. LÉGITIMITÉ : A-t-il mentionné "Services Orange" ou une mission officielle (pas "je suis commercial") ?
2. PREUVE SOCIALE : A-t-il mentionné les voisins ou d'autres personnes déjà vues ?
3. URGENCE : A-t-il créé une limite temporelle ("avant qu'on finalise", "ce matin") ?
4. PERMISSION : A-t-il terminé par une question d'engagement ("Ça vous va ?") ?

MOTS INTERDITS à détecter : "excusez-moi de vous déranger", "je suis commercial", "offre", "faites-moi confiance", "honnêtement"

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Déballe Définitive",
  "declencheurs_utilises": ["légitimité|oui/non","preuve sociale|oui/non","urgence|oui/non","permission|oui/non"],
  "mot_interdit_detecte": "<mot interdit utilisé ou null>",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<script exact avec les 4 déclencheurs>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<conseil précis sur un des 4 déclencheurs>"
}`,

    openingMessages: [
      "(La porte s'ouvre. Elle vous regarde, légèrement sur ses gardes.) Oui ?",
      "(Elle ouvre en tenant un torchon.) Bonjour ?",
      "(Elle passe la tête par la porte.) Qu'est-ce que c'est ?",
    ],

    exercises: [
      {
        type: "choix",
        question: "Vous êtes devant la porte. Elle vient d'ouvrir. Votre première phrase :",
        options: [
          "\"Bonjour madame, je suis commercial Orange, j'ai une offre pour vous.\"",
          "\"Excusez-moi de vous déranger, je passe de la part d'Orange.\"",
          "\"Services Orange — on est sur le secteur, on a relevé des anomalies sur plusieurs lignes du quartier, on a déjà vu plusieurs voisins ce matin. Deux questions rapides avant qu'on finalise les interventions. Ça vous va ?\"",
          "\"Bonjour, vous avez une minute pour parler de votre connexion ?\"",
        ],
        correct: 2,
        explanation: "Script exact. Chaque mot a un rôle : Services Orange (légitimité), secteur+anomalies (mission technique), voisins ce matin (preuve sociale), avant qu'on finalise (urgence), Ça vous va ? (permission).",
      },
    ],

    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
  },

  {
    id: "hypnotic_complet",
    icon: "🧠",
    emoji: "👨",
    title: "HYPNOTIC Complet",
    subtitle: "M. Leclerc — Du diagnostic à la permission finale",
    tag: "Intermédiaire",
    tagColor: "#A855F7",
    tagSoft: "rgba(168,85,247,0.12)",
    difficulty: 2,
    xpMax: 70,
    voiceId: "TX3LPaxmHKxFdv7VOQHJ",  // Liam
    voiceName: "Liam",
    voiceGender: "Homme",
    voiceSettings: { stability: 0.50, similarity_boost: 0.75, style: 0.25, use_speaker_boost: true },

    targetSkills: ["H2", "H3", "H4", "H6", "H8"],
    primarySkill: "H3",
    skillFocus: "H.Y.P.N.O.T.I.C. — Diagnostic → Problème → Néfaste → Clore",

    context: "Homme 45 ans, cadre, a accepté de t'écouter 2 minutes. Il est ouvert mais pas encore convaincu. La Déballe a fonctionné. Tu dois maintenant diagnostiquer et guider vers la solution.",
    objective: "Progresser H→Y→P→N→O→T→I→C dans l'ordre. Ne jamais pitcher avant d'avoir diagnostiqué. Reformuler avec ses mots exacts à l'étape T.",
    tip: "Posture médecin : commence par 'Première question — vous avez quel opérateur actuellement ?' et ÉCOUTE. Ne parle pas de ton offre avant l'étape O.",

    prospectSystem: `Tu joues Monsieur Leclerc, 45 ans, cadre. Tu as accepté d'écouter 2 minutes. Tu es ouvert mais tu attends de voir si ça vaut ton temps.

Comportement par étape HYPNOTIC :
- H (Honnêteté) : Si le vendeur dit "je suis pas là pour vendre / deux questions" → tu dis "OK, qu'est-ce que c'est ?"
- Y (Diagnostic) : Si le vendeur te pose des questions sur ton opérateur/usage → tu réponds naturellement (tu as Bouygues, box classique)
- P (Problème) : Si le vendeur creuse sur les lenteurs → tu avoues "bah le soir quand ma fille regarde ses séries c'est un peu galère"
- N (Néfaste) : Si le vendeur te demande ce que ça change → "bah elle m'engueule et j'ai du mal à télétravailler le soir"
- O (Objectif) : Si le vendeur te fait imaginer la solution → tu montres un intérêt réel
- T (Traduire) : Tu remarques si le vendeur reprend TES mots (galère, engueule) — si oui tu te sens compris
- I (Imminence) : Si tu dis "j'ai besoin de réfléchir" → tu as une vraie question sur le délai d'installation
- C (Clore) : Si le vendeur dit "seriez-vous contre l'idée que..." → tu hésite puis acceptes

Tu parles en 1-2 phrases. Français naturel, familier.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues la progression dans la méthode H.Y.P.N.O.T.I.C.

Analyse de l'intervention du vendeur :
1. A-t-il bien obtenu la permission (H) avant de pitcher ?
2. A-t-il posé des questions de diagnostic (Y) avant de parler de son offre ?
3. A-t-il creusé le problème et l'a-t-il approfondi (P) ?
4. A-t-il activé la peur de perdre - conséquences de ne pas changer (N) ?
5. A-t-il reformulé avec les MOTS EXACTS du prospect (T) ?
6. A-t-il neutralisé "j'ai besoin de réfléchir" avant qu'il le dise (I) ?
7. A-t-il utilisé "seriez-vous contre l'idée" pour clore (C) ?

Erreurs critiques : pitcher trop tôt, ne pas reformuler avec les mots exacts, ignorer N, clore avec "vous voulez signer ?"

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Méthode HYPNOTIC",
  "etape_actuelle": "<H/Y/P/N/O/T/I/C — où en est le vendeur>",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase exacte pour l'étape actuelle>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<conseil sur l'étape la plus importante ratée>"
}`,

    openingMessages: [
      "(Il est dans l'encadrement de la porte, il t'a dit 'ok'. Il croise les bras.) Donc, c'est quoi vos deux questions ?",
      "(Il t'a laissé entrer. Il s'appuie contre le mur.) Je vous écoute — mais vite, j'ai pas une heure.",
      "(Il est debout dans le couloir.) Allez-y, qu'est-ce que vous voulez savoir ?",
    ],

    exercises: [
      {
        type: "choix",
        question: "Il t'a dit oui pour 2 minutes. Il dit 'Je vous écoute'. Tu commences par :",
        options: [
          "\"Super — voici notre offre fibre à 32€ par mois.\"",
          "\"Parfait. Première question : vous êtes sur quel opérateur actuellement ?\" [puis tu te tais]",
          "\"Je vais vous expliquer ce qu'on propose.\"",
          "\"Vous connaissez la différence entre l'ADSL et la fibre ?\"",
        ],
        correct: 1,
        explanation: "Étape Y = Diagnostic. On commence par une question, pas par une présentation. Le prospect qui parle en premier s'investit dans la conversation. Ton rôle = écouter et qualifier.",
      },
      {
        type: "choix",
        question: "Il dit 'le soir ça rame un peu quand ma fille regarde ses séries'. Tu réponds (étape T) :",
        options: [
          "\"Votre bande passante est saturée en soirée.\"",
          "\"Donc votre connexion est insuffisante en heure de pointe.\"",
          "\"Donc ça rame le soir quand votre fille regarde ses séries — c'est bien ça ?\" [pause]",
          "\"C'est exactement pour ça que notre fibre est parfaite pour vous.\"",
        ],
        correct: 2,
        explanation: "Étape T = Ses mots EXACTS. 'Rame' + 'fille' + 'séries'. Pas de jargon. Il se sent parfaitement compris. Puis pause = tu laisses le silence travailler.",
      },
    ],

    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
  },

  {
    id: "cdd_objections",
    icon: "🛡️",
    emoji: "👨‍💼",
    title: "Méthode C.D.D.",
    subtitle: "Bernard — Objections en rafale",
    tag: "Objections",
    tagColor: "#FFB800",
    tagSoft: "rgba(255,184,0,0.12)",
    difficulty: 2,
    xpMax: 60,
    voiceId: "JBFqnCBsd6RMkjVDRZzb",  // George
    voiceName: "George",
    voiceGender: "Homme",
    voiceSettings: { stability: 0.40, similarity_boost: 0.75, style: 0.40, use_speaker_boost: true },

    targetSkills: ["C1", "C2", "C3", "C4"],
    primarySkill: "C2",
    skillFocus: "C.D.D. — Ne jamais répondre directement à une objection",

    context: "Homme 58 ans, qui a déjà été démarché. Il sort les objections classiques une par une. Tu dois appliquer CDD sur chacune — jamais argumenter directement.",
    objective: "Appliquer C (Clarifier) → D (Discuter Tea Time) → D (Dissiper) sur chaque objection. Ne jamais défendre ton offre avant d'avoir compris la vraie inquiétude.",
    tip: "Face à 'pas intéressé' : 'Pas intéressé par quoi exactement ?' — puis silence. La vraie objection va sortir.",

    prospectSystem: `Tu joues Bernard, 58 ans, retraité de la fonction publique. Tu as été démarché plusieurs fois et tu as des objections prêtes.

Comportement :
- Première objection : "Je suis pas intéressé" (dit automatiquement, sans vraie raison)
- Si le vendeur clarifie ('par quoi exactement ?') : tu dis "Bah j'ai pas besoin de changer"
- Si le vendeur discute avec curiosité ('pourquoi vous dites ça ?') : tu parles d'une mauvaise expérience avec un opérateur il y a 2 ans
- Si le vendeur écoute sans interrompre (Tea Time) : tu te détends légèrement
- Si le vendeur dissipe avec 'je suis là pour vérifier, pas pour vendre' : tu acceptes d'écouter
- Deuxième objection : "C'est trop cher de toute façon"
- Si le vendeur clarifie ('cher par rapport à quoi ?') : tu dis que tu paies déjà 40€
- Troisième objection : "J'ai besoin d'en parler à ma femme"
- Si le vendeur utilise l'étape I (Imminence) : tu révèles que c'est surtout que tu sais pas si ça en vaut la peine

Tu réponds en 1-2 phrases. Ton direct mais pas hostile.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT la méthode C.D.D. sur les objections.

Analyse :
1. C — CLARIFIER : Le vendeur a-t-il creusé l'objection ('par quoi exactement ?') AVANT d'argumenter ?
2. D — DISCUTER : A-t-il posé une question empathique sur l'expérience passée et écouté sans interrompre (Tea Time) ?
3. D — DISSIPER : A-t-il aidé le prospect à se rassurer lui-même (sans imposer son offre) ?

Erreurs critiques : répondre directement à l'objection de surface, utiliser des mots interdits, argumenter avant de comprendre.

Mots interdits à détecter : "faites-moi confiance", "honnêtement", "en toute transparence", "je suis sûr que", "pourquoi".

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Méthode CDD",
  "etape_cdd": "<C ou D(discuter) ou D(dissiper) — où en est le vendeur>",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase CDD exacte pour cette objection>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<conseil sur Tea Time ou Dissipation>"
}`,

    openingMessages: [
      "(Il a ouvert, il te regarde, la main sur la porte.) Je suis pas intéressé.",
      "(Il ouvre et te coupe directement.) Peu importe ce que c'est, j'ai pas le temps.",
      "(Il ouvre à moitié.) Ah non, ça va merci — j'ai tout ce qu'il faut.",
    ],

    exercises: [
      {
        type: "choix",
        question: "Il dit : 'Je suis pas intéressé.' Étape C — Clarifier :",
        options: [
          "\"Je comprends, mais notre offre fibre est vraiment bien.\"",
          "\"Pas intéressé par quoi exactement ?\" [silence]",
          "\"Ok, vous avez quel opérateur actuellement ?\"",
          "\"Faites-moi confiance, vous ne le regretterez pas.\"",
        ],
        correct: 1,
        explanation: "C = creuser l'objection. 'Par quoi exactement' force une réponse précise et révèle la vraie inquiétude. Jamais argumenter contre 'pas intéressé' — c'est toujours un écran de fumée.",
      },
      {
        type: "choix",
        question: "Il dit qu'il a eu une mauvaise expérience avec un autre opérateur. Étape D — Discuter :",
        options: [
          "\"Ah mais nous on est différents, je vous explique.\"",
          "\"Ah bon ? Qu'est-ce qui s'était passé ?\" [puis écouter sans interrompre]",
          "\"C'est effectivement dommage ce qui vous est arrivé.\"",
          "\"Honnêtement, tous les opérateurs ne se valent pas.\"",
        ],
        correct: 1,
        explanation: "Tea Time = curiosité sincère + écoute totale. Ne pas interrompre pour se défendre. Le laisser parler = il se sent écouté = sa garde baisse. Jamais 'honnêtement' (mot interdit).",
      },
    ],

    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
  },

  {
    id: "intonations_live",
    icon: "🎙️",
    emoji: "👩‍💼",
    title: "Les 4 Intonations",
    subtitle: "Sandra — Adapter son ton en temps réel",
    tag: "Vocal",
    tagColor: "#EC4899",
    tagSoft: "rgba(236,72,153,0.12)",
    difficulty: 2,
    xpMax: 55,
    voiceId: "EXAVITQu4vr4xnSDxMaL",  // Sarah
    voiceName: "Sarah",
    voiceGender: "Femme",
    voiceSettings: { stability: 0.60, similarity_boost: 0.75, style: 0.20, use_speaker_boost: true },

    targetSkills: ["V1", "V2", "V3", "V5"],
    primarySkill: "V5",
    skillFocus: "Intonations : Secrète · Taquine · Compassion + Silences stratégiques",

    context: "Femme 40 ans, sympa mais occupée. Elle passe par des états différents : blasée → curieuse → qui se confie. Chaque état nécessite une intonation différente.",
    objective: "Détecter l'état émotionnel du prospect et utiliser la bonne intonation. Maîtriser les silences après chaque question importante.",
    tip: "Taquine sur sa première résistance → Secrète quand tu partages une info → Compassion quand elle se confie → Silence de 3s après chaque question.",

    prospectSystem: `Tu joues Sandra, 40 ans, responsable RH. Tu es sympa mais tu as vu beaucoup de commerciaux. Tu passes par 3 états pendant la conversation.

ÉTAT 1 — BLASÉE (début) : Tu réponds poliment mais avec un léger ton d'impatience. Si le vendeur utilise l'intonation TAQUINE et ne se laisse pas démonter : tu souris légèrement.

ÉTAT 2 — CURIEUSE (milieu) : Si le vendeur utilise l'intonation SECRÈTE pour partager une information exclusive : tu te penches en avant et tu poses une vraie question.

ÉTAT 3 — QUI SE CONFIE (fin) : Tu mentionnes que tu travailles de chez toi 3 jours par semaine et que les coupures te posent vraiment problème. Si le vendeur réagit avec l'intonation COMPASSION et laisse un SILENCE après : tu continues à te confier sur l'impact réel.

Si le vendeur comble les silences : tu perds l'élan de te confier.
Si le vendeur garde le silence 3s après tes confidences : tu ajoutes des détails importants.

1-2 phrases. Français naturel.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT les 4 intonations et les silences.

Analyse :
1. TAQUINE : Le vendeur a-t-il réagi avec légèreté/humour à la résistance initiale (pas défensivement) ?
2. SECRÈTE : A-t-il partagé une information avec une voix confidentielle, créant une exclusivité ?
3. COMPASSION : Face à la confidence, a-t-il ralenti, adouci son ton, validé l'émotion ?
4. SILENCE : A-t-il laissé des silences de 3s+ après ses questions importantes (sans les remplir) ?

Erreur critique : combler les silences, réagir défensivement à la résistance, ton monotone.

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Intonations & Silences",
  "intonation_utilisee": "<taquine/secrète/compassion/confuse ou aucune>",
  "silence_respecte": <true/false>,
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase exacte avec l'intonation adaptée>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment placer physiquement et vocalement cette intonation>"
}`,

    openingMessages: [
      "(Elle a ouvert. Elle te regarde d'un air légèrement las.) Encore un commercial Orange...",
      "(Elle ouvre en tenant son téléphone.) Oui, bonjour. Vous avez deux minutes, pas plus.",
      "(Elle ouvre.) Ah, vous êtes le troisième cette semaine.",
    ],

    exercises: [
      {
        type: "choix",
        question: "Elle dit 'Encore un commercial Orange...' avec un soupir. Intonation idéale :",
        options: [
          "[Sérieux] \"Je vous assure que je ne suis pas comme les autres.\"",
          "[Compassion] \"Je comprends que vous avez été souvent sollicitée.\"",
          "[Taquin, sourire dans la voix] \"Vous êtes populaire dans le quartier ! Ils vous ont demandé quoi les deux premiers ?\"",
          "[Neutre] \"Je fais juste une vérification technique.\"",
        ],
        correct: 2,
        explanation: "Taquine = désarme avec l'humour. Elle montre que tu n'es pas affecté. L'aisance inspire confiance. Et la question sur 'les deux premiers' t'informe sur les approches déjà faites.",
      },
    ],

    color: "#EC4899",
    soft: "rgba(236,72,153,0.12)",
  },

  {
    id: "mots_interdits_live",
    icon: "🚫",
    emoji: "👴",
    title: "Mots Interdits",
    subtitle: "Raymond — Le détecteur de mots saboteurs",
    tag: "Langage",
    tagColor: "#EF4444",
    tagSoft: "rgba(239,68,68,0.12)",
    difficulty: 1,
    xpMax: 45,
    voiceId: "JBFqnCBsd6RMkjVDRZzb",  // George
    voiceName: "George",
    voiceGender: "Homme",
    voiceSettings: { stability: 0.45, similarity_boost: 0.70, style: 0.35, use_speaker_boost: true },

    targetSkills: ["M1"],
    primarySkill: "M1",
    skillFocus: "Éliminer les 7 mots interdits — chaque mot compte",

    context: "Homme 65 ans, ancien cadre. Il est perspicace et remarque TOUT dans ton vocabulaire. Il réagit négativement à chaque mot faible ou manipulateur.",
    objective: "Avoir une conversation entière sans utiliser un seul mot interdit. Remplacer chaque expression problématique par son équivalent de force.",
    tip: "Les 7 mots à éviter : 'faites-moi confiance', 'honnêtement', 'en toute transparence', 'je suis sûr que', 'pourquoi ?', 'excusez-moi de vous déranger', 'conforme'.",

    prospectSystem: `Tu joues Raymond, 65 ans, ancien directeur commercial. Tu es très perceptif aux expressions manipulatoires et aux mots faibles.

Comportement — tu RÉAGIS à chaque mot interdit :
- "Faites-moi confiance" → "Si vous devez me demander de vous faire confiance, c'est qu'elle n'est pas acquise."
- "Honnêtement" → "Vous étiez malhonnête jusqu'à maintenant ?"
- "En toute transparence" → "Intéressant comme formulation pour un commercial."
- "Je suis sûr que" → "Vous décidez à ma place maintenant ?"
- "Pourquoi ?" → "Ça sonne accusateur cette question."
- "Excusez-moi de vous déranger" → "Effectivement, vous dérangez."
- "Conforme" → [Méfiance immédiate] "Conforme à quoi exactement ?"

Si le vendeur évite tous ces mots, utilise un vocabulaire précis et professionnel → tu t'intéresses vraiment et tu poses des questions de fond.

1-2 phrases. Ton direct, testeur mais respectueux.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT l'absence de mots interdits et la qualité du vocabulaire.

Les 7 mots interdits à détecter : "faites-moi confiance", "honnêtement", "en toute transparence", "je suis sûr que", "pourquoi ?", "excusez-moi de vous déranger", "conforme"

Analyse :
1. Le vendeur a-t-il utilisé un ou plusieurs mots interdits ?
2. Son vocabulaire était-il professionnel et précis ?
3. A-t-il utilisé de bonnes reformulations ('qu'est-ce qui vous fait penser' au lieu de 'pourquoi') ?

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Vocabulaire & Mots Interdits",
  "mots_interdits_detectes": ["<mot1>","<mot2>"] ou [],
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<reformulation correcte du mot interdit utilisé>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<conseil sur le remplacement du mot le plus problématique>"
}`,

    openingMessages: [
      "(Il ouvre la porte. Il te regarde avec perspicacité.) Je vous écoute. Soyez précis.",
      "(Il ouvre. Regard direct.) Bonjour. Qu'est-ce que vous voulez ?",
      "(Il ouvre.) Bon, qu'est-ce que c'est ?",
    ],

    color: "#EF4444",
    soft: "rgba(239,68,68,0.12)",
  },

  {
    id: "champion_complet",
    icon: "⚔️",
    emoji: "🏆",
    title: "Mode Champion",
    subtitle: "Prospect Mystère — Toutes méthodes",
    tag: "Expert",
    tagColor: "#22C55E",
    tagSoft: "rgba(34,197,94,0.12)",
    difficulty: 3,
    xpMax: 100,
    voiceId: "Xb7hH8MSUJpSbSDYk0k2",  // Alice
    voiceName: "Alice",
    voiceGender: "Surprise",
    voiceSettings: { stability: 0.50, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true },

    targetSkills: ["D1", "H3", "C2", "V2", "M1"],
    primarySkill: "D1",
    skillFocus: "Toutes les méthodes — Déballe → HYPNOTIC → CDD → Intonations",

    context: "Prospect mystère. Type aléatoire. Tu dois identifier rapidement le profil et enchaîner les bonnes méthodes dans le bon ordre.",
    objective: "Déballe → diagnostiquer le profil en 2 échanges → sélectionner la bonne méthode → l'appliquer sans mots interdits.",
    tip: "Écoute les 2 premières phrases. Elles te disent tout : agressif=CDD désescalade, ouvert=HYPNOTIC, blasé=Taquine, méfiant=CDD clarifier.",

    prospectSystem: `Tu joues un prospect aléatoire Orange PAP. Choisis exactement UN profil parmi ces 5 et reste COHÉRENT jusqu'à la fin :

PROFIL A — La retraitée confiante (70 ans, ouverte, un peu inquiète pour son réseau cuivre)
PROFIL B — Le jeune actif pressé (30 ans, 30 secondes max, veut du concret immédiat)
PROFIL C — Le méfiant expérimenté (55 ans, a été démarché, veut des preuves)
PROFIL D — L'hostile à désamorcer (65 ans, furieux des commerciaux PAP en général)
PROFIL E — Le couple hésitant (dit toujours "je dois en parler à mon mari/femme")

Choisis aléatoirement. Sois cohérent et réaliste. Français naturel. 1-2 phrases.`,

    coachSystem: `Tu es coach expert vente PAP. En Mode Champion, tu évalues :
1. IDENTIFICATION DU PROFIL : Le vendeur a-t-il adapté sa méthode au profil détecté ?
2. MÉTHODE ADAPTÉE : A-t-il choisi la bonne méthode (Déballe si ouvert, CDD si méfiant/hostile, Taquine si blasé) ?
3. MOTS INTERDITS : A-t-il évité tous les mots saboteurs ?
4. PROGRESSION : A-t-il progressé dans la méthode choisie (pas resté au stade 1) ?

Erreur critique : appliquer la même approche peu importe le profil.

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Maîtrise Globale",
  "profil_detecte": "<A/B/C/D/E et comment le vendeur l'a géré>",
  "methode_choisie": "<Déballe/HYPNOTIC/CDD/Intonation>",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase parfaite pour CE profil>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment détecter le profil plus rapidement>"
}`,

    openingMessages: [
      "(La porte s'ouvre.) Oui ?",
      "(Quelqu'un répond.) Allo ?",
      "(Un regard.) Bonjour ?",
    ],

    color: "#22C55E",
    soft: "rgba(34,197,94,0.12)",
  },
];

// ─── PROGRESSION ─────────────────────────────────────────────────────────────

export const PROGRESSION = {
  levels: [
    { level: 1, name: "Recrue",    minXP: 0,    maxXP: 150,   icon: "🌱", color: "#22C55E" },
    { level: 2, name: "Stagiaire", minXP: 150,  maxXP: 350,   icon: "⚡", color: "#3B82F6" },
    { level: 3, name: "Commercial",minXP: 350,  maxXP: 700,   icon: "🎯", color: "#FFB800" },
    { level: 4, name: "Vendeur",   minXP: 700,  maxXP: 1200,  icon: "🔥", color: "#FF5C35" },
    { level: 5, name: "Expert",    minXP: 1200, maxXP: 2000,  icon: "🏆", color: "#A855F7" },
    { level: 6, name: "Champion",  minXP: 2000, maxXP: 3500,  icon: "👑", color: "#EC4899" },
    { level: 7, name: "Maître PAP",minXP: 3500, maxXP: Infinity, icon: "⭐", color: "#FFB800" },
  ],
  recommendations: {
    1: ["Commence par mémoriser le Script Déballe (D1) — 10 fois à voix haute", "Applique le Mantra Terrain avant chaque porte"],
    2: ["Maîtrise les 4 Déclencheurs — teste sur 20 portes", "Mémorise les 7 Mots Interdits"],
    3: ["Travaille HYPNOTIC étapes H → P — diagnostic avant pitch", "Entraîne-toi sur CDD avec l'objection 'pas intéressé'"],
    4: ["Mode CDD complet sur toutes les objections", "Intègre les 4 intonations — commence par la Taquine"],
    5: ["HYPNOTIC complet H → C", "Mode Champion — toutes méthodes enchaînées"],
    6: ["Inconscient compétent : Déballe + CDD automatiques", "Affine le timing des silences"],
    7: ["Tu formes les autres", "Mode Champion score 9+/10 systématique"],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const getSkillById = (skillId) => {
  for (const pillar of PILLARS) {
    const skill = pillar.skills.find(s => s.id === skillId);
    if (skill) return { ...skill, pillarColor: pillar.color, pillarIcon: pillar.icon, pillarSoft: pillar.soft };
  }
  return null;
};

export const getLevelForXP = (xp) =>
  PROGRESSION.levels.reduce((acc, lvl) => xp >= lvl.minXP ? lvl : acc);

export const getScenarioById = (id) => RP_SCENARIOS.find(s => s.id === id);
