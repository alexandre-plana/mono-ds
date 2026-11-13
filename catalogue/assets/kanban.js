/* Tableau de cartes MONO — démonstration, sans dépendance.

   Glisser-déposer au pointeur (souris, doigt, stylet), création, édition par l'inspecteur.
   Tout déplacement, toute création, toute modification et toute suppression s'exécute sans
   question et laisse une annulation (assets/notifs.js) : toast, puis touche Z.
   Au clavier : ↑ ↓ passent d'une fiche à l'autre, ← → déplacent la fiche de colonne, Entrée l'inspecte.

   MonoKanban({ board, inspector, detail, columns, cards, notifs, onChange }) */
'use strict';
window.MonoKanban = ({ board, inspector, detail, columns, cards, notifs, onChange }) => {
  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let selected = null, seq = 100;
  const colName = (id) => columns.find((c) => c.id === id).name;
  const inCol = (id) => cards.filter((c) => c.col === id);

  function render(focusId) {
    board.innerHTML = columns.map((col) => { const list = inCol(col.id); return `<section class="c-board__col" data-col="${col.id}" aria-label="${esc(col.name)}"><header class="c-board__head"><span>${esc(col.name)}</span><span class="g-bracket">${list.length}</span></header><ol class="c-board__list">${list.map((c) => `<li><article class="c-card c-card--action${c.blocked ? ' c-card--signal' : ''}" tabindex="0" data-card="${c.id}" aria-selected="${c.id === selected}"><div class="c-card__head"><span>${esc(c.ref)}</span><span>${esc(c.who)}</span></div><h3 class="c-card__title c-card__title--small">${esc(c.title)}</h3><div class="c-card__foot">${c.blocked ? '<span class="c-status c-status--critical">Bloqué</span>' : '<span>Échéance</span>'}<span>${esc(c.due || '—')}</span></div></article></li>`).join('')}</ol><button class="c-button c-button--quiet c-board__add" type="button" data-add="${col.id}"><i class="c-icon i-plus" aria-hidden="true"></i>Ajouter</button></section>`; }).join('');
    if (focusId) board.querySelector(`[data-card="${focusId}"]`)?.focus();
    onChange?.({ cards, columns, selected });
  }
  function inspect(id, focusTitle) {
    selected = id; const c = cards.find((x) => x.id === id);
    inspector.hidden = !c; detail.classList.toggle('has-aside', !!c);
    if (c) {
      const field = (k, label, extra = '') => `<div><dt>${label}</dt><dd><span class="c-editable"><input class="c-editable__input" data-field="${k}" value="${esc(c[k])}" aria-label="${label}" spellcheck="false"${extra}></span></dd></div>`;
      inspector.innerHTML = `<div class="l-detail__head"><span class="t-micro">Inspecteur</span><span class="l-cluster" style="--gap: var(--space-1); flex-wrap: nowrap"><button class="c-button c-button--quiet" type="button" data-remove="${c.id}"><i class="c-icon i-trash" aria-hidden="true"></i>Supprimer</button><button class="c-button c-button--quiet" type="button" data-close aria-label="Fermer l'inspecteur"><i class="c-icon i-close" aria-hidden="true"></i></button></span></div>
        <div class="c-stat"><span class="c-stat__label">${esc(c.ref)} · ${esc(colName(c.col))}</span><span class="c-editable"><textarea class="c-editable__input t-large" data-field="title" rows="1" aria-label="Titre" style="font-size: var(--text-large); line-height: var(--leading-large); color: var(--fg-strong)">${esc(c.title)}</textarea></span></div>
        <dl class="c-kv c-kv--plain">${field('who', 'Responsable')}${field('due', 'Échéance')}</dl>
        <div class="l-cluster" role="group" aria-label="Colonne">${columns.map((col) => `<button class="c-chip" type="button" data-move="${col.id}" aria-pressed="${col.id === c.col}">${esc(col.name)}</button>`).join('')}</div>
        <label class="c-check"><input type="checkbox" data-field="blocked"${c.blocked ? ' checked' : ''}><span>Bloqué</span></label>
        <section class="l-stack" style="--gap: var(--space-3)"><h2 class="c-section-head"><span>Note</span></h2><div class="c-editable" style="align-items: flex-start"><textarea class="c-editable__input" data-field="note" rows="3" aria-label="Note" placeholder="Écrire ici.">${esc(c.note)}</textarea></div></section>`;
      if (focusTitle) { const t = inspector.querySelector('[data-field="title"]'); t.focus(); t.select(); }
    }
    render();
  }
  // Toute mutation passe par ici : elle s'applique, se redessine, et laisse son annulation.
  function commit(kind, text, ref, apply, undo, focusId) { apply(); render(focusId); if (selected) inspect(cards.some((c) => c.id === selected) ? selected : null); notifs?.push({ kind, text, ref, undo: () => { undo(); if (selected && !cards.some((c) => c.id === selected)) selected = null; inspect(selected); } }); }
  function move(id, col, index, focus) {
    const c = cards.find((x) => x.id === id), from = c.col, at = cards.indexOf(c), before = inCol(col).filter((x) => x !== c)[index];
    if (from === col && (before ? cards.indexOf(before) === at + 1 : inCol(col).at(-1) === c)) return render(focus && id);
    commit('Déplacement', `${c.title} : ${colName(from)} → ${colName(col)}`, c.ref,
      () => { cards.splice(at, 1); c.col = col; cards.splice(before ? cards.indexOf(before) : cards.length, 0, c); },
      () => { cards.splice(cards.indexOf(c), 1); c.col = from; cards.splice(Math.min(at, cards.length), 0, c); }, focus && id);
  }
  function add(col) { const c = { id: 'k' + ++seq, ref: 'D-' + seq, title: 'Nouvelle carte', who: '—', due: '', col, note: '' }; selected = c.id; commit('Création', `Carte ${c.ref} créée dans ${colName(col)}`, c.ref, () => cards.push(c), () => cards.splice(cards.indexOf(c), 1)); inspect(c.id, true); }
  function remove(id) { const c = cards.find((x) => x.id === id), at = cards.indexOf(c); selected = null; commit('Suppression', `${c.title} supprimée`, c.ref, () => cards.splice(at, 1), () => cards.splice(Math.min(at, cards.length), 0, c)); inspect(null); }

  // ---- glisser-déposer au pointeur
  let drag = null;
  const spot = (x, y) => {
    const col = document.elementFromPoint(x, y)?.closest('.c-board__col') || [...board.children].find((s) => { const r = s.getBoundingClientRect(); return x >= r.left && x <= r.right; });
    if (!col) return null;
    const items = [...col.querySelectorAll('.c-card:not(.is-dragging)')]; let index = items.findIndex((el) => { const r = el.getBoundingClientRect(); return y < r.top + r.height / 2; });
    return { col, index: index < 0 ? items.length : index, items };
  };
  board.addEventListener('pointerdown', (e) => { const el = e.target.closest('[data-card]'); if (!el || e.button) return; const r = el.getBoundingClientRect(); drag = { el, id: el.dataset.card, x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, on: false }; });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.on) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return; drag.on = true; drag.ghost = drag.el.cloneNode(true); drag.ghost.classList.add('c-card--ghost'); drag.ghost.classList.remove('c-card--action'); drag.ghost.removeAttribute('tabindex'); drag.ghost.style.width = drag.w + 'px'; document.body.append(drag.ghost); drag.el.classList.add('is-dragging'); drag.mark = document.createElement('li'); drag.mark.className = 'c-board__drop'; drag.mark.setAttribute('aria-hidden', 'true');
      // L'emplacement : un cadre en tireté de la taille exacte de la fiche. Il prend d'abord sa place d'origine — rien ne saute —,
      // puis suit le pointeur : on voit où la fiche se posera, et les autres s'écartent, avant de lâcher.
      drag.li = drag.el.closest('li'); drag.mark.style.height = drag.el.getBoundingClientRect().height + 'px'; drag.li.before(drag.mark); drag.li.hidden = true; }
    drag.ghost.style.left = e.clientX - drag.dx + 'px'; drag.ghost.style.top = e.clientY - drag.dy + 'px';
    const s = spot(e.clientX, e.clientY); board.querySelectorAll('.is-target').forEach((c) => c.classList.remove('is-target'));
    if (s) { s.col.classList.add('is-target'); const list = s.col.querySelector('.c-board__list'), ref = s.items[s.index]?.closest('li') || null; list.insertBefore(drag.mark, ref); drag.to = { col: s.col.dataset.col, index: s.index }; } else { drag.li.before(drag.mark); drag.to = null; }
  });
  const drop = (e) => {
    if (!drag) return; const d = drag; drag = null;
    if (!d.on) { if (e.type === 'pointerup' && e.target.closest?.('[data-card]')) inspect(d.id); return; }
    d.ghost.remove(); d.mark.remove(); d.li.hidden = false; d.el.classList.remove('is-dragging'); board.querySelectorAll('.is-target').forEach((c) => c.classList.remove('is-target'));
    if (d.to && e.type === 'pointerup') move(d.id, d.to.col, d.to.index); else render();
  };
  addEventListener('pointerup', drop); addEventListener('pointercancel', drop);

  // ---- clics et clavier
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add], [data-remove], [data-close], [data-move]'); if (!t) return;
    if (t.dataset.add) add(t.dataset.add); else if (t.dataset.remove) remove(t.dataset.remove); else if (t.dataset.close !== undefined) inspect(null); else if (t.dataset.move && selected) move(selected, t.dataset.move, inCol(t.dataset.move).length);
  });
  board.addEventListener('keydown', (e) => {
    const el = e.target.closest('[data-card]'); if (!el) return; const id = el.dataset.card, c = cards.find((x) => x.id === id), all = [...board.querySelectorAll('[data-card]')], i = all.indexOf(el), ci = columns.findIndex((x) => x.id === c.col);
    if (e.key === 'Enter') inspect(id);
    else if (e.key === 'ArrowDown' && all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
    else if (e.key === 'ArrowUp' && all[i - 1]) { e.preventDefault(); all[i - 1].focus(); }
    else if (e.key === 'ArrowRight' && columns[ci + 1]) { e.preventDefault(); move(id, columns[ci + 1].id, inCol(columns[ci + 1].id).length, true); }
    else if (e.key === 'ArrowLeft' && columns[ci - 1]) { e.preventDefault(); move(id, columns[ci - 1].id, inCol(columns[ci - 1].id).length, true); }
  });
  inspector.addEventListener('change', (e) => {
    const k = e.target.dataset.field; if (!k || !selected) return; const c = cards.find((x) => x.id === selected), before = c[k], after = e.target.type === 'checkbox' ? e.target.checked : e.target.value.trim();
    if (after === before || (k === 'title' && !after)) { if (e.target.type !== 'checkbox') e.target.value = before; return; }
    const label = { title: 'titre', who: 'responsable', due: 'échéance', note: 'note', blocked: 'blocage' }[k];
    commit('Modification', k === 'blocked' ? `${c.title} : ${after ? 'bloquée' : 'débloquée'}` : `${c.title} : ${label} modifié${k === 'title' ? '' : 'e'}`.replace('responsable modifiée', 'responsable modifié').replace('titre modifié', 'titre modifié'), c.ref, () => { c[k] = after; }, () => { c[k] = before; });
  });
  render();
  return { render, inspect, add };
};
