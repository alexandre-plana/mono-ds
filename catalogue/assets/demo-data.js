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
};
