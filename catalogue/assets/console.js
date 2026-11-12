/* Console de démonstration MONO.
   MonoConsole(journal, champ) renvoie { print(texte, niveau) }.
   Niveaux : info (·), warn (▲), error (■), cmd (>). Le style vient de src/components.css. */
'use strict';
window.MonoConsole = (log, input, commands = {}) => {
  const MARKS = { info: '·', warn: '▲', error: '■', cmd: '>' };
  const history = []; let cursor = 0;
  const print = (text, level = 'info') => {
    const li = document.createElement('li');
    li.className = 'c-console__line' + (level !== 'info' ? ' c-console__line--' + level : '');
    const time = new Date().toLocaleTimeString('fr-FR');
    li.innerHTML = `<span class="c-console__time">${time}</span><span class="c-console__mark" aria-hidden="true">${MARKS[level]}</span><span></span>`;
    li.lastChild.textContent = text;
    log.appendChild(li); log.scrollTop = log.scrollHeight;
  };
  const base = {
    aide: () => print('Commandes : ' + Object.keys(all).join(', ')),
    lister: () => ['N-011 Chambéry', 'N-014 Grenoble Centre', 'N-015 Voiron', 'N-016 Vizille'].forEach((l) => print(l)),
    exporter: () => print('Export écrit dans agences-2026-T3.csv (12 lignes)'),
    etat: () => { print('Comptabilité : à jour'); print('Réseau : synchronisation en cours', 'warn'); print('Marché : hors ligne', 'error'); },
    vider: () => log.replaceChildren(),
  };
  const all = { ...base, ...commands };
  if (input) input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const line = input.value.trim(); if (!line) return;
      history.push(line); cursor = history.length; input.value = '';
      print(line, 'cmd');
      const [name, ...args] = line.toLowerCase().split(/\s+/);
      if (all[name]) all[name](args, print); else print(`Commande inconnue : « ${name} ». Saisir « aide ».`, 'error');
    } else if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); cursor = Math.max(0, cursor - 1); input.value = history[cursor]; }
    else if (e.key === 'ArrowDown' && history.length) { e.preventDefault(); cursor = Math.min(history.length, cursor + 1); input.value = history[cursor] ?? ''; }
    if (e.key !== 'Escape') e.stopPropagation();
  });
  return { print };
};
