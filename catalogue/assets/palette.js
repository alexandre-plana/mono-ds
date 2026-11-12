/* « Aller à » — démonstration MONO.
   MonoPalette({ entries, onGo }) crée le dialogue et renvoie { open(), visit(entry) }.
   entries : [{ type, title, desc, group, hint, keywords, go }]
   Vide, elle montre les lieux récents puis toute la carte, groupe par groupe.
   Le style vient de src/components.css (.c-palette). */
'use strict';
window.MonoPalette = ({ entries, onGo }) => {
  const norm = (v) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dlg = document.createElement('dialog');
  dlg.className = 'c-dialog c-dialog--large c-palette'; dlg.setAttribute('aria-label', 'Aller à');
  dlg.innerHTML = `<div class="c-palette__search"><label class="c-search c-search--large"><i class="c-icon i-search" aria-hidden="true"></i><input type="search" placeholder="Aller à un écran, une agence, une action…" aria-label="Aller à" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="palette-list"><span class="c-kbd" aria-hidden="true">esc</span></label></div>
    <div class="c-palette__list" id="palette-list" role="listbox" aria-label="Destinations"></div>
    <div class="c-palette__foot"><span><span class="c-kbd">↑</span> <span class="c-kbd">↓</span> choisir</span><span><span class="c-kbd">↵</span> y aller</span><span class="c-palette__count" role="status" aria-live="polite"></span></div>`;
  document.body.appendChild(dlg);
  const input = dlg.querySelector('input'), list = dlg.querySelector('.c-palette__list'), count = dlg.querySelector('.c-palette__count');
  const recent = []; let shown = [], active = 0;
  entries.forEach((e) => { e._n = norm([e.title, e.desc, e.group, e.type, e.keywords].filter(Boolean).join(' ')); e._t = norm(e.title); });

  const row = (e, i) => `<button class="c-palette__item" type="button" role="option" id="palette-opt-${i}" data-i="${i}" aria-selected="${i === active}"><span class="c-palette__type">${esc(e.type)}</span><span class="c-palette__main"><span class="c-palette__title">${esc(e.title)}</span>${e.desc ? `<span class="c-palette__desc">${esc(e.desc)}</span>` : ''}</span><span class="c-palette__hint">${esc(e.hint || '')}</span></button>`;
  function render() {
    const terms = norm(input.value).split(/\s+/).filter(Boolean);
    let groups;
    if (!terms.length) {
      // Sans saisie : les récents, puis la carte complète dans l'ordre de l'application.
      const map = entries.filter((e) => e.type === 'Écran'), names = [...new Set(map.map((e) => e.group))];
      groups = [...(recent.length ? [['Récents', recent.slice(0, 4)]] : []), ...names.map((g) => [g, map.filter((e) => e.group === g)])];
    } else {
      const found = entries.filter((e) => terms.every((t) => e._n.includes(t))).sort((a, b) => (b._t.startsWith(terms[0]) - a._t.startsWith(terms[0])) || (b._t.includes(terms[0]) - a._t.includes(terms[0])));
      const types = [...new Set(found.map((e) => e.type))];
      groups = types.map((t) => [t + 's', found.filter((e) => e.type === t).slice(0, 8)]);
    }
    shown = groups.flatMap(([, g]) => g); active = Math.min(active, Math.max(0, shown.length - 1));
    count.textContent = terms.length ? `${shown.length} résultat${shown.length > 1 ? 's' : ''}` : '';
    if (!shown.length) { list.innerHTML = `<div class="c-empty c-empty--plain"><span class="c-empty__label">Aucun résultat</span><div class="c-empty__title">Rien ne correspond à « ${esc(input.value.trim())} »</div><p class="c-empty__text">Essayez le nom d'un écran, une référence d'agence ou un verbe : exporter, créer.</p></div>`; return; }
    let i = 0;
    list.innerHTML = groups.map(([name, g]) => `<div class="c-palette__group"><span>${esc(name)}</span><span>${g.length}</span></div>` + g.map((e) => row(e, i++)).join('')).join('');
    input.setAttribute('aria-activedescendant', 'palette-opt-' + active);
  }
  const move = (d) => { if (!shown.length) return; active = (active + d + shown.length) % shown.length; list.querySelectorAll('.c-palette__item').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.i === active))); list.querySelector('#palette-opt-' + active)?.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', 'palette-opt-' + active); };
  const visit = (e) => { const k = recent.indexOf(e); if (k >= 0) recent.splice(k, 1); recent.unshift(e); };
  const go = (e) => { if (!e) return; dlg.close(); visit(e); e.go ? e.go(e) : onGo?.(e); };
  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowDown') { ev.preventDefault(); move(1); } else if (ev.key === 'ArrowUp') { ev.preventDefault(); move(-1); } else if (ev.key === 'Enter') { ev.preventDefault(); go(shown[active]); } });
  list.addEventListener('click', (ev) => { const b = ev.target.closest('.c-palette__item'); if (b) go(shown[+b.dataset.i]); });
  dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
  const open = (query = '') => { if (dlg.open) return; input.value = query; active = 0; render(); dlg.showModal(); input.focus(); };
  return { open, visit };
};
