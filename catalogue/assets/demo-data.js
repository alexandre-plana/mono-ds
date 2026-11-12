/* Jeux de données fictifs partagés par le catalogue et les exemples. */
window.MonoDemo = {
  primes: [47, 79, 93, 178, 238, 398, 569, 649, 817, 931, 1052, 1114, 1329, 1551, 1961, 2433, 3139, 3707, 4194, 4235, 4236, 4974, 5364, 5190]
    .map((value, i, a) => ({ label: String(2003 + i), value, signal: i === a.length - 1, note: i === a.length - 1 ? 'premier repli' : '' })),
  mois: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept'],
  indices: [
    { name: 'Non-vie', values: [100, 102, 103, 105, 106, 108, 109, 111, 112, 113, 114, 115] },
    { name: 'Vie', values: [100, 101, 103, 102, 104, 105, 104, 106, 105, 104, 88, 62], variant: '2' },
    { name: 'Marché', values: [100, 100, 101, 101, 102, 102, 103, 103, 104, 104, 105, 105], variant: '3' },
  ],
  arbre: { len: 12, children: [
    { n: 1, len: 14, children: [
      { n: 1, len: 16, call: true }, { n: 2, len: 28, call: true }, { n: 3, len: 34 }, { n: 9, len: 8 },
    ] },
    { n: 2, len: 12, children: [
      { n: 1, len: 10, children: [{ n: 1, len: 14, call: true }, { n: 2, len: 14, call: true }, { n: 9, len: 6 }] },
      { n: 2, len: 8, children: [{ n: 1, len: 16, call: true }, { n: 2, len: 12, call: true }] },
      { n: 3, len: 12, children: [{ n: 1, len: 30 }, { n: 2, len: 22 }, { n: 9, len: 6 }] },
    ] },
    { n: 3, len: 10, call: true },
  ] },
  agences: [
    { lon: 14.5, lat: 52.3, value: 1200, signal: true, name: 'Nord' },
    { lon: 16.9, lat: 51.1, value: 420, name: 'Centre' },
    { lon: 17.9, lat: 50.1, value: 260, name: 'Sud' },
    { lon: 15.6, lat: 50.2, value: 100, name: 'Ouest' },
    { lon: 13.6, lat: 50.8 }, { lon: 16.1, lat: 52.4 }, { lon: 18.3, lat: 52.1 }, { lon: 17.4, lat: 51.9 },
    { lon: 14.9, lat: 49.5 }, { lon: 18.5, lat: 51.2 }, { lon: 16.3, lat: 49.6 }, { lon: 13.9, lat: 51.6 },
  ],
  portefeuille: [
    { name: 'Non-vie', children: [
      { name: 'Auto', value: 1420 }, { name: 'Entreprises', value: 1125 }, { name: 'Habitation', value: 980 }, { name: 'Santé', value: 760 },
    ] },
    { name: 'Vie', children: [
      { name: 'Épargne', value: 520, signal: true, note: 'en repli de 45 %' }, { name: 'Prévoyance', value: 245 }, { name: 'Retraite', value: 140 },
    ] },
  ],
  trimestres: ['T4 24', 'T1 25', 'T2 25', 'T3 25', 'T4 25', 'T1 26', 'T2 26', 'T3 26'],
  composition: [
    { name: 'Particuliers', values: [520, 541, 556, 570, 588, 596, 604, 612] },
    { name: 'Entreprises', values: [402, 410, 428, 441, 455, 462, 470, 472] },
    { name: 'Vie', values: [398, 402, 410, 405, 412, 380, 300, 226] },
  ],
  nuage: [[3, 1.8], [12, 8.7], [4, 2.2], [11, 7.9], [14, 9.8], [8, 5.4], [5, 3.3], [9, 6.2], [4, 2.6], [6, 4.1], [7, 4.4], [10, 6.1], [13, 8.1], [6, 3.2], [15, 9.1], [9, 5.1], [5, 2.4], [16, 10.6], [11, 6.6], [7, 5.2]]
    .map(([x, y]) => ({ x, y })).concat([{ x: 18, y: 12.4, name: 'Grenoble Centre' }, { x: 17, y: 4.9, name: 'Vizille', signal: true }, { x: 6, y: 7.2, name: 'Arles' }]),
  jours: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  heures: ['8 h', '', '10 h', '', '12 h', '', '14 h', '', '16 h', '', '18 h', ''],
  appels: [
    [12, 48, 96, 110, 74, 30, 52, 88, 92, 70, 41, 9], [10, 44, 84, 98, 70, 28, 49, 80, 86, 64, 38, 8], [8, 36, 70, 82, 60, 22, 40, 66, 70, 52, 30, 6],
    [11, 46, 88, 104, 72, 29, 50, 84, 90, 66, 40, 8], [9, 40, 76, 90, 64, 25, 44, 72, 68, 44, 22, 4], [4, 18, 32, 36, 20, 0, 0, 0, 0, 0, 0, 0],
  ],
};
