export interface MockPost {
  id: string;
  type: 'lost' | 'found';
  category: 'pet' | 'object' | 'document' | 'other';
  title: string;
  description: string;
  locationName: string;
  location: { lng: number; lat: number };
  rewardAmount: number | null;
  rewardCurrency: string;
  isBoosted: boolean;
  createdAt: string;
  user: {
    displayName: string;
    avatarInitial: string;
    communityScore: number;
    isVerified: boolean;
  };
  imageEmoji: string;
  viewCount: number;
  matchCount: number;
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: '1',
    type: 'lost',
    category: 'pet',
    title: 'Catel labrador auriu pierdut',
    description: 'Labrador auriu, mascul, 3 ani, raspunde la numele "Max". Poarta zgarda albastra cu medalion. Ultima data vazut in Parcul Herastrau, zona lac. Este foarte prietenos dar se sperie de zgomote puternice.',
    locationName: 'Parcul Herastrau, Bucuresti',
    location: { lng: 26.0774, lat: 44.4736 },
    rewardAmount: 500,
    rewardCurrency: 'RON',
    isBoosted: true,
    createdAt: '2026-02-12T08:30:00Z',
    user: { displayName: 'Maria Ionescu', avatarInitial: 'M', communityScore: 87, isVerified: true },
    imageEmoji: '\uD83D\uDC15',
    viewCount: 234,
    matchCount: 2,
  },
  {
    id: '2',
    type: 'found',
    category: 'pet',
    title: 'Pisica gri gasita in Drumul Taberei',
    description: 'Pisica gri cu ochi verzi, foarte blanada. Gasita langa statia de metrou Drumul Taberei 34. Are o pata alba pe piept. Pare hranita si ingrijita, probabil are stapan.',
    locationName: 'Drumul Taberei 34, Bucuresti',
    location: { lng: 26.0277, lat: 44.4165 },
    rewardAmount: null,
    rewardCurrency: 'RON',
    isBoosted: false,
    createdAt: '2026-02-12T07:15:00Z',
    user: { displayName: 'Andrei Popa', avatarInitial: 'A', communityScore: 62, isVerified: false },
    imageEmoji: '\uD83D\uDC31',
    viewCount: 89,
    matchCount: 1,
  },
  {
    id: '3',
    type: 'lost',
    category: 'object',
    title: 'Rucsac negru pierdut in metrou',
    description: 'Rucsac negru Nike cu laptop si documente inauntru. Pierdut in metrou pe magistrala M2, intre Piata Unirii si Piata Romana. Are un breloc rosu pe fermoar.',
    locationName: 'Metrou M2, Piata Romana, Bucuresti',
    location: { lng: 26.0967, lat: 44.4465 },
    rewardAmount: 200,
    rewardCurrency: 'RON',
    isBoosted: false,
    createdAt: '2026-02-11T19:00:00Z',
    user: { displayName: 'Vlad Gheorghe', avatarInitial: 'V', communityScore: 45, isVerified: false },
    imageEmoji: '\uD83C\uDF92',
    viewCount: 156,
    matchCount: 0,
  },
  {
    id: '4',
    type: 'found',
    category: 'document',
    title: 'Buletin gasit pe Calea Victoriei',
    description: 'Am gasit un buletin pe trotuar pe Calea Victoriei, in dreptul Muzeului National de Arta. Daca va recunoasteti datele, contactati-ma.',
    locationName: 'Calea Victoriei 49, Bucuresti',
    location: { lng: 26.0966, lat: 44.4396 },
    rewardAmount: null,
    rewardCurrency: 'RON',
    isBoosted: false,
    createdAt: '2026-02-11T16:30:00Z',
    user: { displayName: 'Elena Stanescu', avatarInitial: 'E', communityScore: 120, isVerified: true },
    imageEmoji: '\uD83C\uDD94',
    viewCount: 312,
    matchCount: 0,
  },
  {
    id: '5',
    type: 'lost',
    category: 'pet',
    title: 'Papagal verde scapat de pe balcon',
    description: 'Papagal verde (nimfa) scapat de pe balcon in zona Titan. Raspunde la "Kiwi". Are inel pe picior drept. Daca il vedeti, nu incercati sa-l prindeti, poate sa fie speriat.',
    locationName: 'Bd. Nicolae Grigorescu, Titan',
    location: { lng: 26.1508, lat: 44.4165 },
    rewardAmount: 300,
    rewardCurrency: 'RON',
    isBoosted: true,
    createdAt: '2026-02-11T14:00:00Z',
    user: { displayName: 'Radu Mihai', avatarInitial: 'R', communityScore: 33, isVerified: false },
    imageEmoji: '\uD83E\uDD9C',
    viewCount: 445,
    matchCount: 3,
  },
  {
    id: '6',
    type: 'found',
    category: 'object',
    title: 'Cheie auto BMW gasita in Parcul Cismigiu',
    description: 'Cheie auto BMW (negru, keyless) gasita pe o banca in Parcul Cismigiu, zona fantana. Este la mine in siguranta.',
    locationName: 'Parcul Cismigiu, Bucuresti',
    location: { lng: 26.0878, lat: 44.4368 },
    rewardAmount: null,
    rewardCurrency: 'RON',
    isBoosted: false,
    createdAt: '2026-02-11T11:45:00Z',
    user: { displayName: 'Ana Dumitrescu', avatarInitial: 'A', communityScore: 78, isVerified: true },
    imageEmoji: '\uD83D\uDD11',
    viewCount: 201,
    matchCount: 1,
  },
  {
    id: '7',
    type: 'lost',
    category: 'object',
    title: 'Portofel maro pierdut in Uber',
    description: 'Portofel din piele maro cu carduri si bani. Pierdut intr-un Uber pe ruta Piata Victoriei - Otopeni. Am contactat soferul dar nu a gasit nimic.',
    locationName: 'Piata Victoriei - Otopeni',
    location: { lng: 26.0847, lat: 44.4523 },
    rewardAmount: 150,
    rewardCurrency: 'RON',
    isBoosted: false,
    createdAt: '2026-02-10T22:30:00Z',
    user: { displayName: 'Cristian Barbu', avatarInitial: 'C', communityScore: 56, isVerified: false },
    imageEmoji: '\uD83D\uDC5B',
    viewCount: 98,
    matchCount: 0,
  },
  {
    id: '8',
    type: 'found',
    category: 'pet',
    title: 'Catel mic alb gasit in Floreasca',
    description: 'Catel mic, alb, rasa Bichon sau Maltez, gasit ratacind pe strada in zona Floreasca. Este spalat, tuns, deci sigur are stapan. Momentan este la mine.',
    locationName: 'Str. Banul Antonache, Floreasca',
    location: { lng: 26.0922, lat: 44.4612 },
    rewardAmount: null,
    rewardCurrency: 'RON',
    isBoosted: false,
    createdAt: '2026-02-10T15:00:00Z',
    user: { displayName: 'Ioana Matei', avatarInitial: 'I', communityScore: 91, isVerified: true },
    imageEmoji: '\uD83D\uDC29',
    viewCount: 367,
    matchCount: 2,
  },
];

export function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'acum';
  if (diffMin < 60) return `acum ${diffMin} min`;
  if (diffHr < 24) return `acum ${diffHr}h`;
  if (diffDay === 1) return 'ieri';
  return `acum ${diffDay} zile`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  pet: 'Animal',
  object: 'Obiect',
  document: 'Document',
  other: 'Altele',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  pet: '\uD83D\uDC3E',
  object: '\uD83D\uDCE6',
  document: '\uD83D\uDCC4',
  other: '\u2753',
};
