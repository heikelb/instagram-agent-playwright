export const DAILY_QUOTES = [
  {
    text: 'Le succès n\'est pas final, l\'échec n\'est pas fatal. C\'est le courage de continuer qui compte.',
    author: 'Winston Churchill',
  },
  {
    text: 'La vente est la profession la plus noble du monde. Vous aidez les gens à prendre de meilleures décisions.',
    author: 'Zig Ziglar',
  },
  {
    text: 'Chaque matin, vous avez deux choix : continuer à dormir avec vos rêves, ou vous lever et les poursuivre.',
    author: 'Anonyme',
  },
  {
    text: 'Les meilleurs vendeurs savent que leurs clients achètent de l\'espoir — l\'espoir que leur monde sera meilleur.',
    author: 'Jeffrey Gitomer',
  },
  {
    text: 'La différence entre une personne ordinaire et une personne extraordinaire est ce petit "extra".',
    author: 'Jimmy Johnson',
  },
  {
    text: 'Votre attitude, pas votre aptitude, détermine votre altitude.',
    author: 'Zig Ziglar',
  },
  {
    text: 'Le refus n\'est pas personnel. C\'est simplement une invitation à trouver une meilleure approche.',
    author: 'Brian Tracy',
  },
  {
    text: 'On ne construit pas une réputation sur ce qu\'on va faire. On la construit sur ce qu\'on fait.',
    author: 'Henry Ford',
  },
  {
    text: 'Chaque non vous rapproche d\'un oui. Les champions de la vente le savent.',
    author: 'Tom Hopkins',
  },
  {
    text: 'L\'enthousiasme est la plus grande ressource dans le monde. Rien n\'est grand sans lui.',
    author: 'Ralph Waldo Emerson',
  },
];

export function getDailyQuote(): (typeof DAILY_QUOTES)[number] {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
