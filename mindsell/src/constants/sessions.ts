export interface Session {
  id: number;
  title: string;
  subtitle: string;
  durationMinutes: number;
  icon: string;
  color: string;
  colorDim: string;
  audioType: 'brown-noise' | 'binaural-alpha';
  affirmations: string[];
  deepeningScript: string[];
  anchorMessage: string;
}

// Phase durations in seconds (shared across all sessions)
export const PHASE_DURATIONS = {
  induction: 120,   // 2 min — breathing
  deepening: 90,    // 1.5 min — descent script
  anchoring: 60,    // 1 min — anchor + haptics
} as const;

// Breathing pattern: 4 inspire / 4 hold / 6 expire / 2 pause = 16s cycle
export const BREATHING_PATTERN = [
  { label: 'Inspire', seconds: 4, targetScale: 1.5 },
  { label: 'Retiens', seconds: 4, targetScale: 1.5 },
  { label: 'Expire',  seconds: 6, targetScale: 1.0 },
  { label: 'Pause',   seconds: 2, targetScale: 1.0 },
] as const;

export const BREATHING_CYCLE_DURATION = BREATHING_PATTERN.reduce(
  (acc, step) => acc + step.seconds,
  0
); // 16s

export const SESSIONS: Session[] = [
  {
    id: 1,
    title: 'Confiance Absolue',
    subtitle: 'Ancrer la certitude intérieure',
    durationMinutes: 12,
    icon: '🔥',
    color: '#E8A87C',
    colorDim: 'rgba(232, 168, 124, 0.15)',
    audioType: 'brown-noise',
    affirmations: [
      'Je suis un vendeur naturellement confiant et magnétique',
      'Chaque porte que je frappe s\'ouvre devant ma certitude',
      'Ma présence inspire confiance et attire le oui',
      'Je suis à l\'aise dans toutes les situations de vente',
      'Mon énergie positive est irrésistible',
      'Je mérite le succès et je l\'attire naturellement',
    ],
    deepeningScript: [
      'Laissez votre corps s\'alourdir doucement...',
      'Imaginez un escalier de lumière dorée qui descend vers votre force intérieure...',
      'Dix... Neuf... Vous descendez vers la certitude...',
      'Huit... Sept... Vous sentez votre confiance naturelle s\'éveiller...',
      'Six... Cinq... Quatre... Vous touchez le cœur de qui vous êtes...',
      'Trois... Deux... Un... Vous êtes en contact avec votre puissance naturelle.',
    ],
    anchorMessage:
      'La confiance est désormais ancrée en vous.\nVous êtes prêt à conquérir.',
  },
  {
    id: 2,
    title: 'Maître du NON',
    subtitle: 'Transformer le rejet en carburant',
    durationMinutes: 10,
    icon: '⚡',
    color: '#7EB8D4',
    colorDim: 'rgba(126, 184, 212, 0.15)',
    audioType: 'binaural-alpha',
    affirmations: [
      'Chaque refus me rend plus fort et plus déterminé',
      'Le NON est une marche qui me rapproche du OUI',
      'Je suis invulnérable aux rejets, ils me motivent',
      'Ma résilience est ma plus grande force',
      'Je rebondis instantanément après chaque obstacle',
      'Les meilleurs vendeurs du monde ont tous essuyé des refus',
    ],
    deepeningScript: [
      'Respirez profondément et laissez les tensions quitter votre corps...',
      'Imaginez que vous descendez vers un espace de force et de résilience...',
      'Dix... Neuf... Chaque pas renforce votre détermination...',
      'Huit... Sept... Vous sentez une armure invisible vous entourer...',
      'Six... Cinq... Quatre... Rien ne peut vous atteindre ici...',
      'Trois... Deux... Un... Vous êtes invulnérable et ancré.',
    ],
    anchorMessage:
      'Chaque refus est maintenant votre carburant.\nRien ne peut vous arrêter.',
  },
  {
    id: 3,
    title: 'Flow Commercial',
    subtitle: 'Entrer dans l\'état de performance',
    durationMinutes: 15,
    icon: '🌊',
    color: '#A8D5B5',
    colorDim: 'rgba(168, 213, 181, 0.15)',
    audioType: 'binaural-alpha',
    affirmations: [
      'Je suis dans un état de flow naturel et puissant',
      'Mes mots sortent avec fluidité et conviction',
      'Je lis mes clients avec précision et intuition',
      'Chaque conversation est une danse que je maîtrise',
      'Je suis totalement présent et connecté',
      'Mon énergie est haute, calme et contagieuse',
    ],
    deepeningScript: [
      'Laissez votre corps devenir léger, fluide, comme de l\'eau...',
      'Imaginez que vous entrez dans une rivière de lumière apaisante...',
      'Dix... Neuf... Vous coulez naturellement vers votre état de flow...',
      'Huit... Sept... Toute résistance disparaît en vous...',
      'Six... Cinq... Quatre... Vous êtes dans le courant parfait...',
      'Trois... Deux... Un... Vous êtes en flow.',
    ],
    anchorMessage:
      'Vous êtes dans votre état de flow naturel.\nAllez briller.',
  },
  {
    id: 4,
    title: 'Identité Champion',
    subtitle: 'Devenir le top vendeur de ton équipe',
    durationMinutes: 18,
    icon: '👑',
    color: '#D4A8E8',
    colorDim: 'rgba(212, 168, 232, 0.15)',
    audioType: 'brown-noise',
    affirmations: [
      'Je suis le meilleur vendeur de mon équipe',
      'Mon identité est celle d\'un champion de la vente',
      'Je pense, respire et agis comme un top performer',
      'Le succès est ma norme, pas l\'exception',
      'Je me dépasse chaque jour naturellement',
      'Ma détermination est indestructible',
    ],
    deepeningScript: [
      'Sentez le sol sous vos pieds. Vous êtes ancré, puissant, présent...',
      'Imaginez que vous descendez vers la salle des champions...',
      'Dix... Neuf... Vous rejoignez l\'élite...',
      'Huit... Sept... Votre identité de champion se renforce...',
      'Six... Cinq... Quatre... Vous êtes dans l\'ADN des top performers...',
      'Trois... Deux... Un... Vous êtes un champion.',
    ],
    anchorMessage:
      'Vous êtes un champion.\nVotre identité est scellée. En avant.',
  },
];

export function getSessionById(id: number): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}

export function getReprogrammingDuration(session: Session): number {
  const total = session.durationMinutes * 60;
  return (
    total -
    PHASE_DURATIONS.induction -
    PHASE_DURATIONS.deepening -
    PHASE_DURATIONS.anchoring
  );
}
