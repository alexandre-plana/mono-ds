/* Notifications MONO — démonstration, sans dépendance.

   Un seul journal d'événements, montré à trois échelles :
   1. le TOAST, au moment où l'événement se produit, avec son annulation ;
   2. le CENTRE, liste condensée ouverte depuis l'en-tête, partout dans l'application ;
   3. l'ÉCRAN, tableau complet : filtrer, sélectionner à plusieurs, archiver, supprimer.

   Principe : on ne demande pas confirmation, on exécute et l'on offre l'annulation.
   Une modification ou une suppression reste annulable tant que son événement est au journal.

   const notifs = MonoNotifs({ toasts, center, badge, onShowAll });
   notifs.push({ kind: 'Suppression', text: 'Vizille supprimée', ref: 'N-016', undo: () => … }); */
'use strict';
window.MonoNotifs = ({ toasts, center, badge, onShowAll, seed = [] }) => {
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hm = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const events = []; let seq = 0, full = null, filter = 'tous';
  const picked = new Set();
  const verb = (e) => (e.kind === 'Suppression' ? 'Rétablir' : 'Annuler'), done = (e) => (e.kind === 'Suppression' ? 'Rétabli' : 'Annulé');
  const add = (e, at) => { const ev = { id: ++seq, at: at || new Date(), read: false, archived: false, undone: false, ...e }; events.unshift(ev); return ev; };
  seed.forEach((s) => add(s, new Date(Date.now() - s.ago * 60000)));

  const action = (e) => (e.undone ? `<span class="t-muted">${done(e)}</span>` : e.undo ? `<button class="c-toast__action" type="button" data-undo="${e.id}">${verb(e)}</button>` : '');
  const unread = () => events.filter((e) => !e.read && !e.archived).length;

  function renderCenter() {
    const n = unread(), list = events.filter((e) => !e.archived).slice(0, 6);
    if (badge) { badge.textContent = n ? String(n) : ''; badge.hidden = !n; }
    if (!center) return;
    center.innerHTML = `<div class="c-notifs__head"><span>Notifications</span><span>${n ? n + ' non lue' + (n > 1 ? 's' : '') : 'Tout est lu'}</span></div>`
      + (list.length ? `<ol class="c-notifs__list">${list.map((e) => `<li class="c-notifs__item${e.read ? '' : ' is-unread'}"><span class="c-notifs__meta"><span>${hm(e.at)}</span><span>${esc(e.kind)}</span></span><span class="c-notifs__text">${esc(e.text)}</span><span class="c-notifs__action">${action(e)}</span></li>`).join('')}</ol>` : `<p class="c-notifs__empty">Aucun événement.</p>`)
      + `<div class="c-notifs__foot"><button class="c-toast__action" type="button" data-read-all${n ? '' : ' disabled'}>Tout marquer lu</button><button class="c-toast__action" type="button" data-show-all>Tout voir <i class="c-icon i-arrow-right" aria-hidden="true"></i></button></div>`;
  }

  const FILTERS = [['tous', 'Tous', (e) => !e.archived], ['nonlus', 'Non lus', (e) => !e.read && !e.archived], ['suppressions', 'Suppressions', (e) => e.kind === 'Suppression' && !e.archived], ['archives', 'Archivés', (e) => e.archived]];
  function renderFull() {
    if (!full) return;
    const rows = events.filter(FILTERS.find((f) => f[0] === filter)[2]);
    [...picked].forEach((id) => { if (!rows.some((e) => e.id === id)) picked.delete(id); });
    const all = rows.length > 0 && rows.every((e) => picked.has(e.id));
    full.innerHTML = `<div class="l-split" style="align-items: flex-end"><h1 class="t-title">${events.filter((e) => !e.archived).length} <span class="t-soft t-body">événements, ${unread()} non lus</span></h1></div>
      <div class="l-pane__bar">${picked.size
        ? `<div class="c-bulkbar" style="flex: 1"><span class="c-bulkbar__count">${picked.size}<small>sélectionné${picked.size > 1 ? 's' : ''}</small></span><div class="c-bulkbar__actions"><button class="c-button" type="button" data-bulk="read">Marquer lu</button><button class="c-button" type="button" data-bulk="archive">${filter === 'archives' ? 'Désarchiver' : 'Archiver'}</button><button class="c-button" type="button" data-bulk="delete"><i class="c-icon i-trash" aria-hidden="true"></i>Supprimer</button></div></div>`
        : `<div class="l-cluster" role="group" aria-label="Filtrer">${FILTERS.map(([k, label, f]) => `<button class="c-chip" type="button" data-filter="${k}" aria-pressed="${k === filter}">${label} <span class="c-chip__count">${events.filter(f).length}</span></button>`).join('')}</div>`}</div>
      ${rows.length ? `<table class="c-table"><thead><tr><th class="c-table__check"><label class="c-check"><input type="checkbox" data-pick-all aria-label="Tout sélectionner"${all ? ' checked' : ''}></label></th><th>Heure</th><th>Type</th><th>Événement</th><th>Réf.</th><th class="is-num">Annulation</th></tr></thead><tbody>${rows.map((e) => `<tr class="${e.read ? 'is-muted' : ''}"><td class="c-table__check"><label class="c-check"><input type="checkbox" data-pick="${e.id}" aria-label="Sélectionner : ${esc(e.text)}"${picked.has(e.id) ? ' checked' : ''}></label></td><td class="u-nowrap">${hm(e.at)}</td><td class="t-micro">${esc(e.kind)}</td><th>${esc(e.text)}</th><td class="t-muted u-nowrap">${esc(e.ref || '—')}</td><td class="is-num">${action(e) || '<span class="t-muted">—</span>'}</td></tr>`).join('')}</tbody></table>`
        : `<div class="c-empty c-empty--plain"><span class="c-empty__label">Journal</span><div class="c-empty__title">Aucun événement ici.</div></div>`}`;
  }
  const render = () => { renderCenter(); renderFull(); };

  function undo(id) {
    const e = events.find((x) => x.id === +id); if (!e || e.undone || !e.undo) return;
    e.undo(); e.undone = true; e.read = true;
    toasts?.querySelector(`[data-toast="${e.id}"]`)?.remove(); markZ();
    toast(`${done(e)} : ${e.text}`);
    render();
  }
  // Un toast porte au plus une action. La touche Z ne vise que le toast le plus récent encore à
  // l'écran — celui qui affiche la touche. Sans toast visible, Z ne fait rien : on n'annule jamais
  // à l'aveugle un événement que l'on ne voit pas.
  const runs = new Map(); let runSeq = 0;
  const markZ = () => {
    if (!toasts) return;
    toasts.querySelectorAll('.c-kbd').forEach((k) => k.remove());
    const last = [...toasts.querySelectorAll('.c-toast__action')].pop();
    if (last) last.insertAdjacentHTML('afterend', '<kbd class="c-kbd" aria-hidden="true">Z</kbd>');
  };
  function toast(text, e, extra) {
    if (!toasts) return;
    const t = document.createElement('div'); t.className = 'c-toast'; t.setAttribute('role', 'status'); if (e) t.dataset.toast = e.id;
    let act = '';
    if (e?.undo) act = `<button class="c-toast__action" type="button" data-undo="${e.id}">${verb(e)}</button>`;
    else if (extra) { const k = ++runSeq; runs.set(k, extra.run); act = `<button class="c-toast__action" type="button" data-run="${k}">${extra.label}</button>`; }
    t.innerHTML = `<span>${esc(text)}</span>` + act;
    toasts.append(t); while (toasts.children.length > 3) toasts.firstChild.remove();
    markZ();
    setTimeout(() => { t.remove(); markZ(); }, act ? 8000 : 3000);
  }

  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-run], [data-undo], [data-read-all], [data-show-all], [data-filter], [data-bulk]'); if (!t) return;
    if (t.dataset.run) { runs.get(+t.dataset.run)?.(); runs.delete(+t.dataset.run); t.closest('.c-toast')?.remove(); markZ(); render(); }
    else if (t.dataset.undo) undo(t.dataset.undo);
    else if (t.dataset.readAll !== undefined) { events.forEach((e) => { e.read = true; }); render(); }
    else if (t.dataset.showAll !== undefined) onShowAll?.();
    else if (t.dataset.filter) { filter = t.dataset.filter; picked.clear(); renderFull(); }
    else if (t.dataset.bulk) {
      const sel = events.filter((e) => picked.has(e.id)), n = sel.length;
      if (t.dataset.bulk === 'read') sel.forEach((e) => { e.read = true; });
      else if (t.dataset.bulk === 'archive') {
        // Archiver range l'événement : il quitte le centre et la liste courante, et se retrouve sous le filtre « Archivés ».
        const to = filter !== 'archives', was = sel.map((e) => [e, e.archived, e.read]); sel.forEach((e) => { e.archived = to; e.read = true; });
        toast(`${n} événement${n > 1 ? 's' : ''} ${to ? 'archivé' : 'désarchivé'}${n > 1 ? 's' : ''}${to ? ' — à retrouver sous « Archivés »' : ''}`, null, { label: 'Annuler', run: () => was.forEach(([e, a, r]) => { e.archived = a; e.read = r; }) });
      }
      else {
        // Supprimer du journal est lui-même annulable : les événements reviennent à leur place.
        const kept = sel.map((e) => [events.indexOf(e), e]).sort((a, b) => b[0] - a[0]); kept.forEach(([i]) => events.splice(i, 1));
        const ev2 = add({ kind: 'Suppression', text: `${n} événement${n > 1 ? 's' : ''} retiré${n > 1 ? 's' : ''} du journal`, undo: () => kept.sort((a, b) => a[0] - b[0]).forEach(([i, e]) => events.splice(Math.min(i + 1, events.length), 0, e)) });
        toast(ev2.text, ev2);
      }
      picked.clear(); render();
    }
  });
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.dataset?.pick) { t.checked ? picked.add(+t.dataset.pick) : picked.delete(+t.dataset.pick); renderFull(); }
    else if (t.dataset?.pickAll !== undefined) { const rows = events.filter(FILTERS.find((f) => f[0] === filter)[2]); rows.forEach((e) => (t.checked ? picked.add(e.id) : picked.delete(e.id))); renderFull(); }
  });

  render();
  return {
    push(e) { const ev = add(e); toast(ev.text, ev); render(); return ev; },
    // Touche Z : l'action du toast le plus récent encore affiché, et rien d'autre.
    undoLast() { const b = toasts && [...toasts.querySelectorAll('.c-toast__action')].pop(); if (b) b.click(); return !!b; },
    mount(el) { full = el; renderFull(); },
    render,
  };
};
