/**
 * salesCurriculum.js
 * ─────────────────────────────────────────────────────────────────────────────
 * CURRICULUM COMPLET — VENTE PORTE-À-PORTE
 *
 * Architecture pédagogique en 6 Piliers × N sous-compétences
 * Chaque scénario RP est lié à des sous-compétences précises.
 * Le coaching est différent pour chaque scénario.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── PILIERS ET SOUS-COMPÉTENCES ────────────────────────────────────────────

export const PILLARS = [
  {
    id: "accroche",
    icon: "⚡",
    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
    title: "Accroche & 1ère Impression",
    subtitle: "Les 30 premières secondes décident de tout",
    level: 1,
    skills: [
      {
        id: "P1.1",
        name: "L'Impact Premier",
        description: "Créer la curiosité en 5 secondes — avant même le bonjour",
        importance: 10,
        timeToMaster: "2-3 séances",
        commonMistake: "Commencer par \"Bonjour je m'appelle...\" (personne n'écoute)",
        formula: "\"J'ai une question rapide qui peut vous économiser [bénéfice concret]...\"",
        examples: [
          "\"Votre voisin vient de diviser sa facture internet par deux — je peux vous montrer comment en 2 min ?\"",
          "\"Est-ce que vous êtes satisfait de votre opérateur actuel, honnêtement ?\"",
          "\"Je ne viens pas vendre — je viens vérifier si vous êtes éligible à [offre] dans votre rue.\"",
        ],
        antiExamples: [
          "\"Bonjour madame, je suis commercial chez Orange...\" (la porte se ferme)",
          "\"On a une super offre pour vous !\" (trop générique, pas crédible)",
        ],
        quiz: [
          {
            question: "Un prospect ouvre la porte et vous regarde. Que faites-vous en PREMIER ?",
            options: [
              "Vous présentez votre nom et votre société",
              "Vous posez une question qui crée de la curiosité",
              "Vous montrez votre badge et vos documents",
              "Vous dites bonjour et attendez sa réaction",
            ],
            correct: 1,
            explanation: "La question-crochet crée une micro-conversation AVANT l'identification. Le prospect répond d'abord, puis sa méfiance baisse.",
          },
          {
            question: "Vous avez 5 secondes. Quelle accroche est la plus efficace ?",
            options: [
              "\"Bonjour, je représente Orange, j'ai une offre pour vous.\"",
              "\"Vous avez la fibre chez vous actuellement ?\"",
              "\"Votre voisin du 12 vient de passer — il fait des économies. Vous voulez savoir pourquoi ?\"",
              "\"Je suis désolé de vous déranger, mais j'ai quelque chose d'intéressant.\"",
            ],
            correct: 2,
            explanation: "La preuve sociale voisin + bénéfice concret + question = combo imbattable. 'Votre voisin' active la comparaison sociale.",
          },
        ],
      },
      {
        id: "P1.2",
        name: "Le Miroir Nom",
        description: "Utiliser le nom du prospect crée un lien immédiat",
        importance: 7,
        timeToMaster: "1 séance",
        commonMistake: "Ne jamais utiliser le prénom ou l'utiliser de façon forcée",
        formula: "Obtenir le prénom naturellement et l'utiliser 2-3x sans forcer",
        examples: [
          "\"Et vous vous appelez... ? [pause] Parfait Madame Martin, alors ce qui m'amène...\"",
          "\"Madame Martin, ce que vous décrivez là c'est exactement le profil des personnes qui bénéficient le plus de...\"",
        ],
        quiz: [
          {
            question: "Quand doit-on idéalement obtenir le nom du prospect ?",
            options: [
              "Dès l'ouverture de la porte",
              "Après avoir créé un premier intérêt",
              "Seulement au moment du bon de commande",
              "Jamais, ça fait vendeur agressif",
            ],
            correct: 1,
            explanation: "Après le premier intérêt, le prospect est plus ouvert. Le nom trop tôt = interrogatoire. Trop tard = manqué.",
          },
        ],
      },
      {
        id: "P1.3",
        name: "La Question-Crochet",
        description: "La première question ouverte qui force une vraie réponse",
        importance: 9,
        timeToMaster: "3-4 séances",
        commonMistake: "Poser des questions fermées (oui/non) qui permettent d'esquiver",
        formula: "\"Comment vous gérez [problème qu'ils ont sûrement]...\" → ils parlent → vous écoutez",
        examples: [
          "\"C'est quoi pour vous le truc le plus frustrant avec votre opérateur actuel ?\"",
          "\"Si vous deviez changer une seule chose dans votre abonnement, ce serait quoi ?\"",
          "\"Comment vous vivez les coupures internet chez vous ?\"",
        ],
        quiz: [
          {
            question: "Votre question-crochet idéale sur la fibre optique :",
            options: [
              "\"Vous avez la fibre chez vous ?\" (fermée)",
              "\"Vous êtes satisfait de votre connexion ?\" (fermée)",
              "\"Qu'est-ce qui vous agace le plus avec votre connexion actuelle ?\"",
              "\"Vous voulez avoir une meilleure connexion ?\" (fermée + évidente)",
            ],
            correct: 2,
            explanation: "La question 'qu'est-ce qui vous agace' présuppose qu'il y a un problème (vrai 80% du temps) et invite une réponse développée.",
          },
        ],
      },
    ],
  },
  {
    id: "decouverte",
    icon: "🔍",
    color: "#3B82F6",
    soft: "rgba(59,130,246,0.12)",
    title: "Découverte & Écoute",
    subtitle: "Comprendre avant de pitcher — la règle 70/30",
    level: 1,
    skills: [
      {
        id: "P2.1",
        name: "SPIN Simplifié",
        description: "4 types de questions qui révèlent le besoin profond",
        importance: 10,
        timeToMaster: "5-7 séances",
        commonMistake: "Pitcher avant d'avoir compris la situation et le problème",
        formula: "Situation → Problème → Implication → Need-payoff (dans cet ordre)",
        examples: [
          "S: \"Vous avez quel opérateur actuellement ?\"",
          "P: \"Et vous avez des problèmes de débit ou de coupures ?\"",
          "I: \"Ces coupures, ça vous arrive pendant le travail à la maison ?\"",
          "N: \"Si vous aviez une fibre stable à [prix], vous seriez intéressé ?\"",
        ],
        quiz: [
          {
            question: "Dans SPIN, quelle question est la plus importante pour créer l'envie ?",
            options: [
              "Situation — comprendre le contexte",
              "Problème — identifier la douleur",
              "Implication — amplifier les conséquences du problème",
              "Need-payoff — faire imaginer la solution",
            ],
            correct: 2,
            explanation: "L'Implication est le multiplicateur. 'Vos coupures arrivent pendant vos réunions Zoom ?' → le prospect réalise l'ampleur du problème et se vend lui-même la solution.",
          },
        ],
      },
      {
        id: "P2.2",
        name: "Écoute Active + Reformulation",
        description: "Répéter ce qu'ils disent les fait se sentir compris — et vous donne du temps",
        importance: 9,
        timeToMaster: "3-4 séances",
        commonMistake: "Écouter pour répondre au lieu d'écouter pour comprendre",
        formula: "\"Si je comprends bien... [reformulation] c'est bien ça ?\" puis silence",
        examples: [
          "\"Donc si je comprends bien, votre connexion est instable surtout le soir, c'est ça ?\"",
          "\"Ce que vous me dites c'est que vous avez déjà eu des mauvaises expériences avec des commerciaux — je comprends.\"",
          "\"Vous me dites prix, mais en fait ce qui compte pour vous c'est la stabilité, c'est bien ça ?\"",
        ],
        quiz: [
          {
            question: "Le prospect dit : \"J'ai déjà tout ce qu'il me faut.\" Que faites-vous ?",
            options: [
              "Vous insistez sur les avantages de votre offre",
              "Vous reformulez : \"Vous êtes donc satisfait de tout : prix, débit, service client ?\"",
              "Vous acceptez et passez au suivant",
              "Vous demandez à parler à son conjoint",
            ],
            correct: 1,
            explanation: "La reformulation exhaustive force le prospect à préciser. Souvent il va corriger : 'Enfin, le prix c'est pas mal mais le débit...' — et voilà votre ouverture.",
          },
        ],
      },
      {
        id: "P2.3",
        name: "Le Silence Stratégique",
        description: "Après une question importante — se taire. Le silence fait parler.",
        importance: 8,
        timeToMaster: "2-3 séances (difficile psychologiquement)",
        commonMistake: "Répondre à sa propre question pour combler le silence",
        formula: "Question → silence → attendre → le prospect parle (le premier qui parle perd)",
        examples: [
          "\"Si je pouvais vous montrer une économie de 30€/mois sur votre facture, vous auriez 5 minutes ?\" [silence complet]",
          "\"Qu'est-ce qui vous empêcherait de signer aujourd'hui ?\" [silence — laisser sortir les vraies objections]",
        ],
        quiz: [
          {
            question: "Vous posez une question de closing. Le prospect hésite en silence depuis 8 secondes. Vous...",
            options: [
              "Vous ajoutez une autre raison pour convaincre",
              "Vous demandez si tout va bien",
              "Vous continuez à vous taire",
              "Vous proposez un délai de réflexion",
            ],
            correct: 2,
            explanation: "8 secondes de silence c'est normal. La plupart des vendeurs parlent après 3 secondes et sabotent leur propre closing. Tenez 15 secondes — le prospect parle.",
          },
        ],
      },
    ],
  },
  {
    id: "pitch",
    icon: "🎯",
    color: "#22C55E",
    soft: "rgba(34,197,94,0.12)",
    title: "Pitch & Valeur",
    subtitle: "Vendre le bénéfice — jamais la caractéristique",
    level: 2,
    skills: [
      {
        id: "P3.1",
        name: "Méthode CAB",
        description: "Caractéristique → Avantage → Bénéfice POUR LUI",
        importance: 10,
        timeToMaster: "4-5 séances",
        commonMistake: "S'arrêter à la caractéristique ou l'avantage générique",
        formula: "\"[Caract.], ce qui veut dire [avantage], donc pour vous concrètement [bénéfice personnalisé]\"",
        examples: [
          "\"Fibre 1Gb/s (C), ce qui veut dire pas de ralentissement même avec 5 appareils connectés (A), donc vos enfants peuvent streamer et vous télétravaillez en même temps sans problème (B pour lui)\"",
          "\"Contrat sans engagement (C), vous n'êtes pas bloqué (A), donc si vous déménagez dans 6 mois, pas de frais de résiliation (B pour lui)\"",
        ],
        quiz: [
          {
            question: "Un prospect a 2 ados qui jouent en ligne. Votre pitch fibre le plus efficace :",
            options: [
              "\"Notre fibre monte à 1 gigabit par seconde.\"",
              "\"C'est la meilleure fibre du marché.\"",
              "\"Fibre 1Gb/s — vos ados peuvent jouer en 4K et streamer en même temps sans lag — ça change vraiment les soirées.\"",
              "\"Vous économisez sur votre facture.\"",
            ],
            correct: 2,
            explanation: "La CAB complète avec le bénéfice personnalisé (les ados, les soirées) — c'est ça qui crée l'image mentale et l'envie.",
          },
        ],
      },
      {
        id: "P3.2",
        name: "Preuve Sociale & Chiffres",
        description: "Un chiffre précis vaut 10 promesses vagues",
        importance: 9,
        timeToMaster: "2-3 séances",
        commonMistake: "Dire 'beaucoup de clients' ou 'on est très bien notés' sans chiffre",
        formula: "\"[X]% de nos clients + chiffre précis + dans votre profil\"",
        examples: [
          "\"87% de nos clients télétravaillant ont vu leurs coupures disparaître complètement.\"",
          "\"Votre voisin Madame Lefebvre au 14 a signé il y a 3 semaines — elle économise 28€/mois.\"",
          "\"En moyenne nos clients font 34€ d'économies par mois dès le premier mois.\"",
        ],
        quiz: [
          {
            question: "Un prospect méfiant dit 'Prouvez-le'. Votre meilleure réponse :",
            options: [
              "\"Je vous assure que c'est vrai.\"",
              "\"Vous pouvez vérifier sur notre site.\"",
              "\"Votre voisin du 8 a signé le mois dernier — il économise 31€. Je peux vous montrer sa facture avant/après si vous voulez.\"",
              "\"Tous nos clients sont satisfaits.\"",
            ],
            correct: 2,
            explanation: "La preuve locale (voisin) + chiffre précis + proposition de vérification concrète = trifecta de crédibilité. 'Tous nos clients' n'est pas crédible.",
          },
        ],
      },
      {
        id: "P3.3",
        name: "ROI en 10 Secondes",
        description: "Calculer l'économie exacte devant lui — le chiffre le plus puissant",
        importance: 9,
        timeToMaster: "2-3 séances",
        commonMistake: "Parler de prix sans contexte comparatif",
        formula: "\"Vous payez [X] actuellement. Avec nous [Y]. Différence = [Z]/mois = [Z×12]/an.\"",
        examples: [
          "\"Vous payez 49€ par mois ? Avec nous 32€. C'est 17€ de moins, soit 204€ sur l'année — une sortie resto par mois.\"",
          "\"Sur 2 ans de contrat, la différence c'est 408€ dans votre poche — c'est pas négligeable.\"",
        ],
        quiz: [
          {
            question: "Le prospect paie 55€/mois. Vous proposez 37€. Comment le formulez-vous ?",
            options: [
              "\"Notre offre est moins chère.\"",
              "\"Vous économisez 18€ par mois.\"",
              "\"Vous économisez 18€/mois, soit 216€/an — concrètement c'est vos vacances d'été payées.\"",
              "\"Notre prix est 37€.\"",
            ],
            correct: 2,
            explanation: "L'annualisation + la métaphore concrète (vacances) rendent le chiffre réel et tangible. 18€/mois c'est abstrait. 'Vos vacances' c'est concret.",
          },
        ],
      },
    ],
  },
  {
    id: "objections",
    icon: "🛡️",
    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
    title: "Gestion des Objections",
    subtitle: "Une objection = intérêt caché — ne jamais l'esquiver",
    level: 2,
    skills: [
      {
        id: "P4.1",
        name: "Méthode CRAC",
        description: "Le framework universel anti-objection",
        importance: 10,
        timeToMaster: "5-8 séances",
        commonMistake: "Argumenter directement sans comprendre NI reformuler d'abord",
        formula: "Comprendre → Reformuler → Argumenter → Closer",
        examples: [
          "C: \"Je comprends — vous avez l'impression que c'est un coût supplémentaire.\"",
          "R: \"Si je résume : votre vraie question c'est est-ce que ça vaut vraiment le prix, c'est ça ?\"",
          "A: \"Voici ce que font nos clients en pareil cas : [preuve + chiffre]\"",
          "C: \"Alors si on règle ça, y'a autre chose qui vous retient ou on peut y aller ?\"",
        ],
        quiz: [
          {
            question: "Objection : \"C'est trop cher.\" Première étape CRAC :",
            options: [
              "Baisser le prix ou proposer une remise",
              "Expliquer pourquoi votre offre vaut le prix",
              "\"Je comprends — par rapport à votre budget actuel ou par rapport à ce que vous attendez ?\"",
              "Montrer une comparaison concurrents",
            ],
            correct: 2,
            explanation: "COMPRENDRE d'abord = creuser l'objection. 'Trop cher' peut vouloir dire 10 choses différentes. Savoir exactement laquelle avant d'argumenter.",
          },
          {
            question: "Vous avez argumenté. Que faites-vous ENSUITE (étape C de CRAC) ?",
            options: [
              "Vous attendez sa réaction",
              "Vous posez une question fermée de closing : \"Alors on y va ?\"",
              "Vous ajoutez un autre argument pour renforcer",
              "Vous proposez de laisser des documents",
            ],
            correct: 1,
            explanation: "Le Close après argument est obligatoire. Sans lui, votre argument reste en suspens. La question fermée force une décision ou une nouvelle objection — les deux sont utiles.",
          },
        ],
      },
      {
        id: "P4.2",
        name: "Boomerang Prix",
        description: "Transformer 'c'est trop cher' en conversation sur la valeur",
        importance: 9,
        timeToMaster: "4-5 séances",
        commonMistake: "Défendre le prix ou baisser trop vite — les deux font perdre de la valeur",
        formula: "Ne JAMAIS baisser le prix. Élever la valeur perçue ou changer l'unité de mesure.",
        examples: [
          "\"Cher par rapport à quoi exactement ? L'opérateur actuel ou ce que vous espériez ?\"",
          "\"32€/mois, ça fait 1€ par jour pour une connexion fibre stable — moins qu'un café.\"",
          "\"Si je vous prouvais que vous récupérez plus que le coût en économies dans les 3 premiers mois, le prix serait encore un sujet ?\"",
        ],
        quiz: [
          {
            question: "Le prospect dit 'Je peux pas me le permettre'. Vous répondez :",
            options: [
              "\"On peut faire un prix spécial pour vous.\"",
              "\"Justement, c'est pour ça que je suis là — vous permettre de payer MOINS.\"",
              "\"C'est dommage, c'est vraiment une bonne offre.\"",
              "\"Vous pouvez payer en plusieurs fois.\"",
            ],
            correct: 1,
            explanation: "Le retournement immédiat : c'est cher → mais c'est pour dépenser MOINS. Vous transformez l'objection en argument. Ne proposez jamais d'abord une remise.",
          },
        ],
      },
      {
        id: "P4.3",
        name: "Désescalade Hostile",
        description: "Face à l'agressivité — ne pas défendre, écouter et valider",
        importance: 8,
        timeToMaster: "4-6 séances (difficile émotionnellement)",
        commonMistake: "Se défendre, expliquer, justifier — tout ça amplifie la colère",
        formula: "Valider la frustration → curiosité sincère → ne pas pitcher",
        examples: [
          "\"Vous avez absolument raison d'être méfiant — il y a eu trop d'arnaques dans ce secteur.\"",
          "\"Je ne viens pas vous vendre quoi que ce soit. J'ai une question : qu'est-ce qu'un commercial devrait faire différemment pour mériter votre confiance ?\"",
          "\"Je comprends. Franchement, à votre place je réagirais pareil. [silence]\"",
        ],
        quiz: [
          {
            question: "Gérard (68 ans) : 'Allez-vous en ! Vous êtes tous des menteurs !' Votre réaction :",
            options: [
              "\"Monsieur, je vous assure que nous sommes différents des autres.\"",
              "\"Je comprends et je suis désolé. Qu'est-ce qu'il s'est passé ?\" [silence, écouter]",
              "\"Ce n'est pas juste de dire ça, nous sommes une grande entreprise sérieuse.\"",
              "Vous partez immédiatement sans rien dire.",
            ],
            correct: 1,
            explanation: "Valider + curiosité sincère + silence = la seule approche qui marche avec un hostile. Jamais se défendre — ça alimente le feu. La question 'qu'est-ce qu'il s'est passé' lui donne la parole.",
          },
        ],
      },
    ],
  },
  {
    id: "closing",
    icon: "🏆",
    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
    title: "Closing & Signature",
    subtitle: "Reconnaître les signaux et franchir le pas",
    level: 3,
    skills: [
      {
        id: "P5.1",
        name: "Signaux d'Achat",
        description: "Reconnaître quand le prospect est prêt — avant qu'il le sache",
        importance: 10,
        timeToMaster: "5-7 séances terrain",
        commonMistake: "Continuer à pitcher après un signal d'achat — on se revend et on perd",
        formula: "Signal détecté → STOP pitch → question de closing IMMÉDIATEMENT",
        signals: [
          "\"C'est combien exactement ?\" → signal fort",
          "\"Et vous faites ça dans quel délai ?\" → signal fort",
          "\"Ma femme/mari serait d'accord ?\" → signal moyen",
          "\"Ça inclut quoi exactement ?\" → signal moyen",
          "Il prend les documents → signal fort",
          "Il appelle son conjoint → signal fort",
        ],
        quiz: [
          {
            question: "Le prospect demande : 'Et l'installation, c'est dans combien de temps ?' Vous faites :",
            options: [
              "Vous expliquez le processus d'installation en détail",
              "\"Sous 72h en général. On peut bloquer votre créneau maintenant ?\"",
              "\"Ça dépend, mais c'est rapide.\"",
              "Vous continuez votre pitch sur les avantages",
            ],
            correct: 1,
            explanation: "La question sur l'installation EST un signal d'achat. Répondre brièvement puis FERMER immédiatement. Continuer à pitcher après ce signal = perdre la vente.",
          },
        ],
      },
      {
        id: "P5.2",
        name: "Close Assumptif",
        description: "Agir comme si la décision était déjà prise — sans forcer",
        importance: 9,
        timeToMaster: "4-5 séances",
        commonMistake: "Demander 'alors, vous voulez réfléchir ou vous décidez ?' — laisse la porte ouverte à 'je réfléchis'",
        formula: "\"Alors on part sur le [produit] pour le [date d'installation] — vous préférez matin ou après-midi ?\"",
        examples: [
          "\"Je vous mets le plan fibre 1Gb — vous avez 3 ou 4 appareils chez vous ?\" [conversation sur les détails = fermeture douce]",
          "\"Pour l'installation je note votre disponibilité — vous êtes plutôt disponible en semaine ou weekend ?\"",
          "\"Je prépare le contrat — c'est bien à votre nom ou en nom de société ?\"",
        ],
        quiz: [
          {
            question: "Le prospect semble convaincu mais n'a pas dit oui. Vous dites :",
            options: [
              "\"Alors vous vous décidez ou vous réfléchissez ?\"",
              "\"Vous voulez signer aujourd'hui ?\"",
              "\"Je note votre adresse pour l'installation — c'est bien le [adresse] ?\"",
              "\"Il ne vous reste plus de questions ?\"",
            ],
            correct: 2,
            explanation: "Le close assumptif évite la question binaire oui/non. Passer directement aux détails pratiques crée une dynamique de 'c'est déjà en cours' — le prospect suit naturellement.",
          },
        ],
      },
      {
        id: "P5.3",
        name: "Urgence Authentique",
        description: "Créer une raison de décider maintenant — sans mentir",
        importance: 8,
        timeToMaster: "3-4 séances",
        commonMistake: "Inventer une fausse urgence ('offre valable seulement aujourd'hui') — détruit la confiance",
        formula: "Urgence réelle : disponibilité créneau, quota de la semaine, fin d'offre réelle",
        examples: [
          "\"J'ai 2 créneaux installation cette semaine — après c'est 3 semaines d'attente. Vous prenez lequel ?\"",
          "\"Cette offre tarifaire c'est le pricing de ce mois — en juin ça remonte. Si on signe cette semaine vous bloquez ce prix.\"",
          "\"Je suis dans votre rue seulement aujourd'hui — la prochaine fois c'est dans 6 semaines.\"",
        ],
        quiz: [
          {
            question: "Vous n'avez pas d'urgence réelle. Que faites-vous ?",
            options: [
              "Vous inventez une urgence (offre 'uniquement aujourd'hui')",
              "Vous créez une urgence personnelle : \"Ma journée se termine dans 2h — je voudrais qu'on règle ça maintenant si c'est possible\"",
              "Vous ne créez pas d'urgence et laissez le prospect décider",
              "Vous proposez de rappeler demain",
            ],
            correct: 1,
            explanation: "L'urgence personnelle (votre contrainte de temps à vous) est toujours vraie et ne ment pas. 'Je pars dans 2h' crée une vraie pression sans manipuler.",
          },
        ],
      },
    ],
  },
  {
    id: "vocal",
    icon: "🎙️",
    color: "#EC4899",
    soft: "rgba(236,72,153,0.12)",
    title: "Excellence Vocale",
    subtitle: "Comment tu parles > ce que tu dis",
    level: 1,
    skills: [
      {
        id: "P6.1",
        name: "Le Rythme Lent = Autorité",
        description: "Parler lentement inspire confiance — les nerveux parlent vite",
        importance: 9,
        timeToMaster: "Toute la vie (à pratiquer en continu)",
        commonMistake: "Accélérer quand on est nerveux ou qu'on sent une résistance",
        formula: "Ralentis de 30% par rapport à ton rythme naturel. Chaque pause = pouvoir.",
        tip: "Enregistre-toi. La plupart des vendeurs débutants parlent 40% trop vite.",
        examples: [
          "Pause après prénom du prospect : 'Madame Martin... [1 sec] j'ai une question'",
          "Pause avant le prix : 'Et le prix... [2 sec] c'est 32€ par mois.'",
          "Pause après question de closing : silence total jusqu'à réponse",
        ],
      },
      {
        id: "P6.2",
        name: "Miroir Énergétique",
        description: "S'adapter à l'énergie du prospect — ni trop, ni pas assez",
        importance: 8,
        timeToMaster: "10-15 séances terrain",
        commonMistake: "Rester sur sa propre énergie peu importe le prospect",
        formula: "Prospect pressé → pitch compact. Prospect bavard → laisse-le parler. Hostile → calme et lent.",
        examples: [
          "Prospect pressé : pitch en 20 secondes chrono",
          "Prospect retraité bavard : laisse parler 2-3 minutes, puis recadre",
          "Prospect hostile : voix douce, rythme réduit de 50%",
        ],
      },
      {
        id: "P6.3",
        name: "Sourire Vocal",
        description: "Le sourire s'entend — même au téléphone, même à travers une porte",
        importance: 7,
        timeToMaster: "2-3 séances",
        commonMistake: "Parler avec une voix plate ou professionnelle froide",
        formula: "Sourire physiquement avant de parler — ça change le timbre de voix automatiquement",
      },
    ],
  },
];

// ─── SCÉNARIOS RP VOCAL (avec contenu spécifique par compétence) ─────────────

export const RP_SCENARIOS = [
  {
    id: "fibre",
    icon: "📡",
    emoji: "👩",
    title: "Fibre Optique",
    subtitle: "Madame Dupont — Curieuse",
    tag: "Débutant",
    tagColor: "#22C55E",
    tagSoft: "rgba(34,197,94,0.12)",
    difficulty: 1,
    xpMax: 40,
    voiceId: "XB0fDUnXU5powFXDhCwa",  // Charlotte
    voiceName: "Charlotte",
    voiceGender: "Femme",
    voiceSettings: { stability: 0.55, similarity_boost: 0.80, style: 0.20, use_speaker_boost: true },

    // COMPÉTENCES ENTRAÎNÉES
    targetSkills: ["P1.3", "P2.1", "P2.2"],
    primarySkill: "P1.3",
    skillFocus: "Question-crochet + Découverte SPIN",

    // CONTEXTE COMPLET
    context: "Femme au foyer 48 ans. Fibre Orange en cours. Connexion instable le soir (Netflix + ados). Ouverte à écouter.",
    objective: "Poser UNE question ouverte qui révèle un problème réel — puis écouter sans interrompre.",
    tip: "\"Vous avez des moments où votre connexion vous lâche, genre le soir quand tout le monde est connecté ?\"",

    // SYSTÈME PROSPECT IA
    prospectSystem: `Tu joues Madame Dupont, 48 ans, femme au foyer française. Tu as la fibre Orange mais elle lagge souvent le soir quand tes 2 enfants ados regardent Netflix et jouent en ligne. Tu es plutôt neutre en début de conversation.

Comportement :
- Si le vendeur arrive avec un pitch générique : tu réponds poliment mais court ("oui, ça va", "pas vraiment de problème")
- Si le vendeur pose une VRAIE question sur TES habitudes internet (soir, ados, streaming, télétravail) : tu t'ouvres, tu parles des lags le soir
- Si le vendeur reformule ce que tu dis : tu te sens comprise et tu développes
- Si le vendeur mentionne tes ados ou le streaming sans que tu l'aies dit : tu es surprise positivement
- Tu ne signes PAS lors de cette simulation. Tu poses des questions sur le prix.

Réponds en 1-2 phrases courtes. Français naturel. Pas de jargon technique.`,

    // SYSTÈME COACH SPÉCIFIQUE
    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT ces 3 compétences :
1. P1.3 — Question-crochet : Le vendeur a-t-il posé une question ouverte pertinente (connexion, habitudes, soirée) plutôt qu'un pitch ?
2. P2.1 — SPIN : Le vendeur a-t-il progressé Situation→Problème→Implication ?
3. P2.2 — Reformulation : Le vendeur a-t-il répété/reformulé ce que le prospect a dit ?

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Question-crochet",
  "point_fort": "<max 12 mots — spécifique à ce qu'il a bien fait>",
  "point_faible": "<max 12 mots — spécifique à ce qu'il a raté>",
  "formule_optimale": "<phrase exacte qu'il aurait dû dire>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<conseil PRO sur la question ouverte/reformulation>"
}`,

    // PHRASES D'OUVERTURE DU PROSPECT (aléatoires)
    openingMessages: [
      "(La porte s'ouvre. Elle vous regarde avec curiosité.) Oui ?",
      "(Elle ouvre en tenant un torchon.) Ah... bonjour ?",
      "(Elle passe la tête par la porte.) Oui, j'arrive !",
    ],

    // SCÈNES D'EXERCICE TEXTE (hors RP vocal)
    exercises: [
      {
        type: "choix",
        question: "Vous frappez chez Mme Dupont. Elle ouvre. Votre première phrase :",
        options: [
          "\"Bonjour Madame, je suis de Orange, on a une offre fibre pour vous.\"",
          "\"Vous avez Internet chez vous ?\" (fermée)",
          "\"Votre connexion elle se comporte comment le soir quand tout le monde est dessus ?\"",
          "\"Je passe dans le quartier pour présenter nos forfaits.\"",
        ],
        correct: 2,
        explanation: "La question sur le comportement le soir présuppose un problème réel, crée une image mentale et force une vraie réponse.",
      },
      {
        type: "reformulation",
        prospect_dit: "\"Bah des fois le soir c'est lent, mais ça va en général.\"",
        question: "Comment reformulez-vous pour creuser le problème ?",
        options: [
          "\"Ah oui effectivement la fibre règle ça.\"",
          "\"Donc le soir c'est plus lent — vous regardez Netflix le soir aussi ?\"",
          "\"Vous voulez une meilleure connexion ?\" (fermé)",
          "\"Notre offre est parfaite pour vous alors.\"",
        ],
        correct: 1,
        explanation: "Reformulation + question d'implication (Netflix). Vous n'avez pas pitché — vous avez approfondi le problème.",
      },
    ],

    color: "#22C55E",
    soft: "rgba(34,197,94,0.12)",
  },

  {
    id: "energie",
    icon: "⚡",
    emoji: "👨",
    title: "Énergie Verte",
    subtitle: "M. Martin — Méfiant",
    tag: "Intermédiaire",
    tagColor: "#FFB800",
    tagSoft: "rgba(255,184,0,0.12)",
    difficulty: 2,
    xpMax: 60,
    voiceId: "TX3LPaxmHKxFdv7VOQHJ",  // Liam
    voiceName: "Liam",
    voiceGender: "Homme",
    voiceSettings: { stability: 0.45, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true },

    targetSkills: ["P3.2", "P3.3", "P4.1"],
    primarySkill: "P3.2",
    skillFocus: "Preuve sociale + Chiffres concrets",

    context: "Cadre 52 ans, démarché 4 fois ce mois. Méfiant, veut des preuves. N'accepte que les données concrètes.",
    objective: "Donner UN chiffre précis et crédible dans les 2 premières phrases. Pas de promesse — preuve.",
    tip: "\"En moyenne nos clients dans ce quartier économisent 34€ par mois — je peux vous montrer les factures avant/après si vous voulez.\"",

    prospectSystem: `Tu joues Monsieur Martin, 52 ans, cadre dans une PME. Tu as été démarché 4 fois ce mois par différents commerciaux énergie. Tu es MÉFIANT mais pas hostile — juste fatigué des promesses creuses.

Comportement :
- Si le vendeur fait des promesses vagues ("vous allez économiser beaucoup") : "Vous dites tous la même chose."
- Si le vendeur donne un chiffre précis et une source vérifiable : tu t'intéresses modérément, tu poses une question de vérification
- Si le vendeur mentionne un cas concret (voisin, client type) avec chiffre : tu écoutes vraiment
- Si le vendeur propose une comparaison avant/après facture : tu dis "OK montre-moi"
- Tu restes difficile à convaincre mais pas impossible
- Tes objections types : "Prouvez-le", "C'est quoi votre source ?", "Les autres m'ont dit pareil"

1-2 phrases. Ton direct et légèrement sec.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT ces 3 compétences face à un prospect méfiant :
1. P3.2 — Chiffre concret : Le vendeur a-t-il donné UN chiffre précis (€, %, délai) ET une source crédible ?
2. P3.3 — Preuve vs Promesse : A-t-il dit une preuve (facture, voisin, cas réel) ou juste une affirmation ?
3. P4.1 — CRAC : Face à une objection, a-t-il compris/reformulé avant d'argumenter ?

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Preuve & Chiffres",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase exacte avec chiffre concret>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment rendre les preuves plus concrètes et locales>"
}`,

    openingMessages: [
      "(Il ouvre la porte, l'air fatigué.) Encore un commercial ?",
      "(Il ouvre en gardant la main sur la porte.) Oui ? C'est pour quoi ?",
      "(Il ouvre, il a l'air occupé.) Vous avez 2 minutes max.",
    ],

    exercises: [
      {
        type: "choix",
        question: "M. Martin dit : 'Prouvez-le'. Votre réponse idéale :",
        options: [
          "\"Je vous assure que nos chiffres sont fiables.\"",
          "\"La plupart de nos clients sont très satisfaits.\"",
          "\"Voici la facture avant/après d'un client dans votre rue — 31€ d'économies en mois 1.\"",
          "\"Vous pouvez vérifier ça sur internet.\"",
        ],
        correct: 2,
        explanation: "Preuve physique (facture) + local (votre rue) + chiffre précis (31€) + temporalité (mois 1). Maximum de crédibilité.",
      },
      {
        type: "reframe",
        prospect_dit: "\"Vous dites tous la même chose.\"",
        question: "Comment transformer cette objection en opportunité ?",
        options: [
          "\"Non non, nous on est vraiment différents !\"",
          "\"Je comprends — qu'est-ce qu'on vous a dit exactement ? Parce que si c'était des promesses sans chiffres, c'est normal. Moi je vais vous montrer des preuves.\"",
          "\"C'est vrai que le marché est compliqué.\"",
          "\"Notre entreprise est la meilleure du secteur.\"",
        ],
        correct: 1,
        explanation: "CRAC : Comprendre ('je comprends') + Reformuler (creuser ce qu'il a vécu) + Argumenter par la différenciation (preuves vs promesses).",
      },
    ],

    color: "#FFB800",
    soft: "rgba(255,184,0,0.12)",
  },

  {
    id: "hostile",
    icon: "🛡️",
    emoji: "👴",
    title: "Retraité Hostile",
    subtitle: "Gérard — Ferme la porte",
    tag: "Expert",
    tagColor: "#EF4444",
    tagSoft: "rgba(239,68,68,0.12)",
    difficulty: 3,
    xpMax: 80,
    voiceId: "JBFqnCBsd6RMkjVDRZzb",  // George
    voiceName: "George",
    voiceGender: "Homme",
    voiceSettings: { stability: 0.35, similarity_boost: 0.70, style: 0.50, use_speaker_boost: true },

    targetSkills: ["P4.3", "P2.2", "P6.2"],
    primarySkill: "P4.3",
    skillFocus: "Désescalade + Écoute",

    context: "Retraité 68 ans. Arnaqué par un commercial PAP il y a 8 mois (500€ perdus). Furieux. La moindre tentative de pitch le ferme immédiatement.",
    objective: "Ne PAS pitcher. Valider sa colère, poser une question sur ce qui s'est passé, puis écouter en silence.",
    tip: "\"Je comprends votre méfiance — franchement à votre place je réagirais pareil. Qu'est-ce qui s'est passé si vous voulez bien me dire ?\"",

    prospectSystem: `Tu joues Gérard, 68 ans, retraité. Tu as été arnaqué il y a 8 mois par un commercial PAP qui t'a fait signer un contrat avec des frais cachés. Tu as perdu 500€. Tu es FURIEUX dès qu'un commercial se présente.

Comportement :
- Ouverture : tu es agressif immédiatement ("Allez-vous en !", "J'en veux pas !")
- Si le vendeur se défend ou explique qu'il est différent : tu amplifies ("Vous dites TOUS ça !")
- Si le vendeur dit "je ne viens pas vendre" et pose une question sur ce qui s'est passé : tu t'arrêtes, surpris
- Si le vendeur reste calme ET valide ta colère sans se défendre : tu t'adoucis LÉGÈREMENT
- Si le vendeur écoute vraiment ton histoire sans interrompre : tu peux finir par dire "au moins vous écoutez"
- Tu ne signes RIEN. Objectif = survivre à la conversation et créer un minimum de confiance.

Phrases types : "Non !", "Je vous fais pas confiance", "Allez-vous en", "Vous êtes tous des voleurs"
1-2 phrases. Ton brusque puis légèrement moins hostile si bien géré.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT ces 3 compétences face à un prospect HOSTILE :
1. P4.3 — Désescalade : Le vendeur a-t-il VALIDÉ la colère sans se défendre ? (pas "non non je suis différent")
2. P2.2 — Écoute : A-t-il posé une question sur ce qui s'est passé ET laissé parler le prospect ?
3. P6.2 — Silence : A-t-il résisté à l'envie de combler les silences avec du pitch ?

Erreurs critiques à détecter : se défendre ("on n'est pas comme ça"), pitcher trop tôt, ne pas valider la frustration.

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Désescalade",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase exacte pour désamorcer sans pitcher>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment valider une colère sans capituler ni se défendre>"
}`,

    openingMessages: [
      "(Il ouvre la porte et vous regarde avec dégoût.) Encore un commercial. NON.",
      "(Il entrouvre la porte.) Qu'est-ce que vous voulez encore ?!",
      "(Il ouvre brusquement.) Je veux pas, j'achète rien, au revoir !",
    ],

    exercises: [
      {
        type: "choix",
        question: "Gérard crie : 'Allez-vous en ! Vous êtes tous des menteurs !' Votre réponse :",
        options: [
          "\"Monsieur, je comprends mais nous c'est différent...\"",
          "\"Vous avez absolument raison d'être méfiant — il y a eu trop d'abus. Qu'est-ce qui vous est arrivé ?\"",
          "\"Je suis désolé de vous déranger, mais notre offre...\"",
          "Vous partez sans rien dire.",
        ],
        correct: 1,
        explanation: "Valider TOTALEMENT ('vous avez raison') + curiosité sincère sur son histoire. Pas de défense. Pas de pitch. C'est contre-intuitif mais c'est la seule chose qui fonctionne.",
      },
      {
        type: "scenario_reaction",
        question: "Gérard vous raconte son arnaque pendant 3 minutes. Il finit. Vous dites :",
        options: [
          "\"C'est scandaleux, et moi je peux vous prouver que...\" [pitch]",
          "\"Je comprends. [silence 3 secondes] C'est pour ça que je ne viens pas vous vendre quelque chose aujourd'hui.\"",
          "\"Vous devriez porter plainte.\"",
          "\"Tous les commerciaux ne sont pas comme ça.\"",
        ],
        correct: 1,
        explanation: "Validation + silence + déclaration d'intention non commerciale. Aucun pitch. Vous plantez une graine de confiance. C'est la plus grande victoire possible avec ce profil.",
      },
    ],

    color: "#EF4444",
    soft: "rgba(239,68,68,0.12)",
  },

  {
    id: "prix",
    icon: "💰",
    emoji: "👩‍💼",
    title: "Objection Prix",
    subtitle: "Cliente — C'est trop cher",
    tag: "Ciblé",
    tagColor: "#A855F7",
    tagSoft: "rgba(168,85,247,0.12)",
    difficulty: 2,
    xpMax: 60,
    voiceId: "EXAVITQu4vr4xnSDxMaL",  // Sarah
    voiceName: "Sarah",
    voiceGender: "Femme",
    voiceSettings: { stability: 0.60, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },

    targetSkills: ["P4.1", "P4.2", "P3.3"],
    primarySkill: "P4.1",
    skillFocus: "Méthode CRAC + Boomerang Prix",

    context: "Femme 35 ans. Intéressée par l'offre mais bloque systématiquement sur le prix. Elle a un budget serré mais pas impossible.",
    objective: "Appliquer CRAC complet. Ne JAMAIS baisser le prix — élever la valeur perçue avec ROI chiffré.",
    tip: "\"Par rapport à quoi exactement c'est cher — votre abonnement actuel ou ce que vous espériez ?\" → SPIN sur la valeur.",

    prospectSystem: `Tu joues une femme de 35 ans, intéressée par une offre fibre mais avec un budget familial serré. Tu bloques sur le prix à chaque fois.

Comportement :
- Tu es ouverte et sympa — pas hostile, juste contrainte financièrement
- Tu dis "c'est trop cher" ou "j'ai pas le budget" à chaque fois qu'un prix est mentionné
- Si le vendeur BAISSE le prix : tu te demandes pourquoi ce n'était pas ce prix dès le départ (méfiance)
- Si le vendeur applique CRAC (comprend d'abord, reformule, argumente avec ROI) : tu t'intéresses
- Si le vendeur calcule ta vraie économie vs ton abonnement actuel : tu écoutes vraiment
- Si le vendeur dit "1€ par jour" ou autre découpage : ça t'aide à relativiser
- Tu peux dire oui si la valeur est bien démontrée

Phrases types : "C'est trop cher", "J'ai pas le budget", "Je peux pas me le permettre"
1-2 phrases. Ton hésitant mais pas fermé.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT ces 3 compétences face à l'OBJECTION PRIX :
1. P4.1 — CRAC : Le vendeur a-t-il appliqué les 4 étapes sans sauter directement à l'argument ?
2. P4.2 — Boomerang Prix : A-t-il évité de baisser le prix et élevé la valeur perçue à la place ?
3. P3.3 — ROI chiffré : A-t-il calculé la vraie économie (€/mois, €/an) devant la cliente ?

Erreurs critiques : baisser le prix immédiatement, argumenter sans comprendre, ne pas calculer le ROI.

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "CRAC Objection Prix",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase CRAC complète adaptée au prix>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment calculer et présenter le ROI de façon impactante>"
}`,

    openingMessages: [
      "(Elle ouvre la porte, souriante mais un peu pressée.) Oui bonjour !",
      "(Elle vous regarde avec curiosité.) Bonjour, c'est pour quoi ?",
      "(Elle ouvre avec un bébé dans les bras.) Ah oui, bonjour !",
    ],

    exercises: [
      {
        type: "choix",
        question: "Elle dit : 'C'est trop cher.' Première étape CRAC :",
        options: [
          "\"On peut faire un geste commercial.\"",
          "\"Cher par rapport à quoi — votre budget ou votre abonnement actuel ?\"",
          "\"Notre prix est justifié parce que...\"",
          "\"C'est le meilleur rapport qualité-prix du marché.\"",
        ],
        correct: 1,
        explanation: "C = COMPRENDRE d'abord. 'Cher par rapport à quoi' creuse l'objection avant d'argumenter. 80% du temps la vraie question n'est pas le prix mais la valeur perçue.",
      },
      {
        type: "calcul_roi",
        question: "Elle paie 49€/mois. Vous proposez 32€. Comment présentez-vous l'économie ?",
        options: [
          "\"Vous économisez 17€.\"",
          "\"C'est moins cher que votre abonnement actuel.\"",
          "\"Vous économisez 17€/mois — 204€/an. Sur 2 ans de contrat, c'est 408€ dans votre poche — concrètement vos courses de Noël.\"",
          "\"Notre offre est 34% moins chère.\"",
        ],
        correct: 2,
        explanation: "Mensuel + annualisation + concrétisation (Noël). Les 3 niveaux de l'économie. 408€ est plus impactant que 17€/mois.",
      },
    ],

    color: "#A855F7",
    soft: "rgba(168,85,247,0.12)",
  },

  {
    id: "coldcall",
    icon: "📞",
    emoji: "📱",
    title: "Cold Call",
    subtitle: "Prospect — 30 secondes max",
    tag: "Cold Call",
    tagColor: "#3B82F6",
    tagSoft: "rgba(59,130,246,0.12)",
    difficulty: 2,
    xpMax: 65,
    voiceId: "onwK4e9ZLuTAKqWW03F9",  // Daniel
    voiceName: "Daniel",
    voiceGender: "Homme",
    voiceSettings: { stability: 0.50, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },

    targetSkills: ["P1.1", "P3.1", "P5.1"],
    primarySkill: "P1.1",
    skillFocus: "Impact Premier + Pitch 20 secondes",

    context: "Homme 40 ans en réunion. Tu as exactement 30 secondes avant qu'il raccroche. Chaque mot compte.",
    objective: "Pitcher l'accroche + bénéfice + question en moins de 20 secondes. Décrocher 5 minutes.",
    tip: "\"Bonjour, j'appelle car vos voisins de bureau ont réduit leur facture internet de 30% — vous avez 30 secondes pour savoir comment ?\"",

    prospectSystem: `Tu joues quelqu'un qui vient de décrocher son téléphone pendant une réunion. Tu es TRÈS pressé. Tu as 30 secondes grand maximum.

Comportement :
- Si l'accroche dure plus de 15 secondes ou est floue : "J'ai pas le temps, rappellez-moi" [fin]
- Si l'accroche contient un chiffre concret ET est courte : tu dis "30 secondes" avec curiosité
- Si le vendeur mentionne un bénéfice pertinent (économies, temps, sécurité) + chiffre : tu accordes 5 minutes
- Si le vendeur demande "vous avez 5 minutes" sans accroche : "Non."
- Tu ne poses pas de questions — c'est au vendeur d'être percutant

Phrases types : "Oui ?", "C'est pour quoi ?", "J'ai pas le temps", "30 secondes"
1 phrase max. Très pressé.`,

    coachSystem: `Tu es coach expert vente PAP. Tu évalues UNIQUEMENT ces 3 compétences pour un COLD CALL :
1. P1.1 — Impact Premier : Le pitch était-il court (< 20s), avec un chiffre concret, et se terminait-il par une question ?
2. P3.1 — CAB compact : A-t-il dit le bénéfice POUR LUI (pas juste une caractéristique) ?
3. P5.1 — Signal d'achat : A-t-il reconnu quand le prospect devenait curieux et déclenché un close ?

Erreurs critiques : pitch trop long, pas de chiffre, demander 5 minutes d'emblée sans accroche.

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Pitch 20 Secondes",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<pitch 20s exact avec chiffre et question>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment structurer un pitch percutant en moins de 20 secondes>"
}`,

    openingMessages: [
      "(Décroché rapide.) Oui ?",
      "(Ton occupé.) Allo ? C'est pour quoi ?",
      "(Pressé.) Oui je vous écoute, vite.",
    ],

    exercises: [
      {
        type: "timer_pitch",
        question: "Vous avez 20 secondes. Construisez votre pitch Cold Call optimal :",
        structure: [
          "Accroche curiosité (5s) : bénéfice concret pour EUX",
          "Preuve courte (5s) : chiffre ou référence locale",
          "Question close (5s) : micro-engagement (30 secondes ?)",
        ],
        options: [
          "\"Bonjour, je suis Thomas de TelecomPro. Je vous appelle pour vous présenter nos offres internet professionnelles très compétitives avec un excellent rapport qualité-prix...\"",
          "\"Bonjour — vos concurrents dans l'immeuble ont réduit leur facture internet de 28%. Vous avez 30 secondes pour savoir comment ?\"",
          "\"Bonjour, est-ce que vous avez quelques minutes pour parler de votre connexion internet ?\"",
          "\"Bonjour, j'ai une super offre pour votre entreprise.\"",
        ],
        correct: 1,
        explanation: "Preuve sociale locale (concurrents immeuble) + chiffre précis (28%) + question micro-engagement (30s pas 5min). C'est percutant, court, non-menaçant.",
      },
    ],

    color: "#3B82F6",
    soft: "rgba(59,130,246,0.12)",
  },

  {
    id: "champion",
    icon: "⚔️",
    emoji: "🏆",
    title: "Mode Champion",
    subtitle: "Prospect Mystère — Adapte-toi",
    tag: "Aléatoire",
    tagColor: "#FF5C35",
    tagSoft: "rgba(255,92,53,0.12)",
    difficulty: 3,
    xpMax: 100,
    voiceId: "Xb7hH8MSUJpSbSDYk0k2",  // Alice
    voiceName: "Alice",
    voiceGender: "Surprise",
    voiceSettings: { stability: 0.50, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true },

    targetSkills: ["P6.2", "P2.3", "P5.2"],
    primarySkill: "P6.2",
    skillFocus: "Adaptation + Lecture de profil",

    context: "Tu ne sais pas à qui tu vas parler. L'IA choisit un profil aléatoire. Comme sur le terrain.",
    objective: "Identifier le profil en 2 phrases. Adapter son approche. Utiliser la bonne technique selon le profil.",
    tip: "Écoute les 2 premières phrases AVANT de pitcher. L'énergie du prospect te dit tout.",

    prospectSystem: `Tu joues un prospect aléatoire. Choisis EXACTEMENT UN de ces profils au hasard et reste cohérent jusqu'à la fin :

PROFIL A — Femme pressée 38 ans : "Oui, vite j'ai des enfants qui attendent"
PROFIL B — Homme méfiant 55 ans : ton sec, demande des preuves à chaque affirmation
PROFIL C — Retraité bavard 70 ans : parle beaucoup, digresse, veut être écouté
PROFIL D — Jeune décideur 29 ans : direct, veut des chiffres, prend sa décision vite
PROFIL E — Couple hésitant : dit "je dois en parler à mon mari/femme" à chaque fois

Adopte le profil de A à E. Sois cohérent et réaliste. Français naturel. 1-2 phrases.`,

    coachSystem: `Tu es coach expert vente PAP. En Mode Champion, tu évalues UNIQUEMENT :
1. P6.2 — Miroir Énergétique : Le vendeur a-t-il adapté son APPROCHE au profil détecté (pas le même pitch pour tous) ?
2. P2.3 — Lecture de profil : A-t-il IDENTIFIÉ le profil en 2 échanges et ajusté sa stratégie ?
3. P5.2 — Close adaptatif : Son close était-il adapté au profil (assumptif pour décideur, doux pour hésitant) ?

Erreurs critiques : pitch identique peu importe le profil, ne pas adapter le rythme/ton.

Retourne UNIQUEMENT ce JSON :
{
  "score": <1-10>,
  "skill_evalued": "Adaptation Profil",
  "profil_detecte": "<profil A/B/C/D/E et comment le vendeur l'a géré>",
  "point_fort": "<max 12 mots>",
  "point_faible": "<max 12 mots>",
  "formule_optimale": "<phrase idéale pour CE profil spécifique>",
  "emoji": "<1 emoji>",
  "tip_specifique": "<comment détecter rapidement le profil et adapter son approche>"
}`,

    openingMessages: [
      "(La porte s'ouvre.) Oui ?",
      "(Quelqu'un répond.) Allo ? Bonjour ?",
      "(Un regard interrogatif.) Oui, bonjour ?",
    ],

    exercises: [
      {
        type: "profiling",
        question: "Le prospect dit : 'Oui ? J'ai pas trop le temps là.' Quel profil et quelle approche ?",
        options: [
          "Méfiant → commencer par des preuves",
          "Pressé → pitch 20s direct avec chiffre, fermer vite",
          "Bavard → le laisser parler",
          "Indécis → sonder ses besoins longuement",
        ],
        correct: 1,
        explanation: "'J'ai pas le temps' = profil Pressé. Approche : pitch ultra-court (<20s), chiffre concret, question fermée de close immédiat. Chaque seconde compte.",
      },
    ],

    color: "#FF5C35",
    soft: "rgba(255,92,53,0.12)",
  },
];

// ─── SYSTÈME DE PROGRESSION ──────────────────────────────────────────────────

export const PROGRESSION = {
  levels: [
    { level: 1, name: "Débutant", minXP: 0, maxXP: 200, icon: "🌱", color: "#22C55E" },
    { level: 2, name: "Apprenti", minXP: 200, maxXP: 500, icon: "⚡", color: "#3B82F6" },
    { level: 3, name: "Vendeur", minXP: 500, maxXP: 1000, icon: "🎯", color: "#FFB800" },
    { level: 4, name: "Expert", minXP: 1000, maxXP: 2000, icon: "🏆", color: "#A855F7" },
    { level: 5, name: "Master", minXP: 2000, maxXP: 5000, icon: "👑", color: "#FF5C35" },
    { level: 6, name: "Légende", minXP: 5000, maxXP: Infinity, icon: "⭐", color: "#EC4899" },
  ],

  // Recommandations selon le niveau
  recommendations: {
    1: ["Commence par 'Fibre - Mme Dupont' pour maîtriser la Question-Crochet", "Fais le module Accroche (P1) avant le RP vocal"],
    2: ["Attaque 'Objection Prix' — CRAC est ta compétence clé", "Entraîne-toi sur les exercices Reformulation"],
    3: ["Le 'Retraité Hostile' est ton prochain défi", "Lis les conseils P4.3 sur la désescalade"],
    4: ["Mode Champion — apprends à t'adapter à tous les profils", "Master le silence stratégique (P6.2)"],
    5: ["Entraîne-toi à créer ta propre urgence (P5.3)", "Perfectionne le Close Assumptif"],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const getSkillById = (skillId) => {
  for (const pillar of PILLARS) {
    const skill = pillar.skills.find(s => s.id === skillId);
    if (skill) return { ...skill, pillarColor: pillar.color, pillarIcon: pillar.icon };
  }
  return null;
};

export const getLevelForXP = (xp) => {
  return PROGRESSION.levels.reduce((acc, lvl) => xp >= lvl.minXP ? lvl : acc);
};

export const getScenarioById = (id) => RP_SCENARIOS.find(s => s.id === id);
