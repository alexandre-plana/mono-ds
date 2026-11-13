/* Démonstrations vivantes du catalogue.

   Le code affiché sous chaque démonstration est le balisage statique de la page, relevé avant que ce
   fichier ne s'exécute. Ici, on lui donne ses comportements : tout ce qui se montre dans la page
   Composants doit répondre — se cliquer, se saisir, se glisser — et tenir dans un cadre à sa taille.
   Rien de ceci ne fait partie du système : ce sont des exemples de branchement. */
'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const demo = (id) => $(`#${id} .cat-demo`);
  const drag = (el, onMove, onStart, onEnd) => el.addEventListener('pointerdown', (e) => {
    if (e.button || onStart?.(e) === false) return; e.preventDefault(); const x0 = e.clientX, y0 = e.clientY;
    const move = (ev) => onMove(ev.clientX - x0, ev.clientY - y0, ev), up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); onEnd?.(); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  const notifs = window.MonoNotifs ? (() => { const t = document.createElement('div'); t.className = 'c-toasts'; t.setAttribute('aria-live', 'polite'); document.body.append(t); return MonoNotifs({ toasts: t, center: $('#c-notifs .c-notifs') }); })() : null;
  addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && notifs?.undoLast()) e.preventDefault(); });

  // ---- Onglets persistants : choisir, fermer, rouvrir depuis le menu « … »
  (() => { const d = demo('c-doctabs'); if (!d) return; const nav = $('.c-doctabs', d), more = $('.c-doctabs__more', d);
    const count = () => { const n = $$('.c-menu__item', more).length; more.hidden = !n; $('summary span', more).textContent = n; };
    nav.addEventListener('click', (e) => {
      const close = e.target.closest('.c-doctabs__close'), item = e.target.closest('.c-menu__item'), tab = e.target.closest('[role="tab"]');
      if (close) { const t = close.closest('[role="tab"]'), was = t.getAttribute('aria-selected') === 'true'; t.remove(); if (was) $$('[role="tab"]', nav).at(-1)?.setAttribute('aria-selected', 'true'); return; }
      if (item) { const b = document.createElement('button'); b.className = 'c-doctabs__tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.innerHTML = `<span class="c-doctabs__label">${item.firstChild.textContent.trim()}</span><span class="c-doctabs__close" role="button" aria-label="Fermer"><i class="c-icon i-close" aria-hidden="true"></i></span>`; more.before(b); item.remove(); count(); more.open = false; b.click(); return; }
      if (tab) $$('[role="tab"]', nav).forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    }); })();

  // ---- Séparateur : se glisse, ou flèches gauche et droite
  (() => { const d = demo('l-splitter'); if (!d) return; const desk = $('.l-desk', d), sp = $('.l-splitter', d); let pct = 32, start = 32;
    const set = (v) => { pct = Math.max(18, Math.min(70, v)); desk.style.setProperty('--inspector', pct + '%'); sp.setAttribute('aria-valuenow', Math.round(pct)); };
    drag(sp, (dx) => set(start - (dx / desk.clientWidth) * 100), () => { start = pct; sp.classList.add('is-dragging'); }, () => sp.classList.remove('is-dragging'));
    sp.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') set(pct + 2); else if (e.key === 'ArrowRight') set(pct - 2); }); })();

  // ---- Valeur modifiable : enregistrement, confirmation, ou refus
  $$('#c-editable .c-editable').forEach((box) => { const input = $('input', box), status = $('.c-editable__status', box); let timer;
    input.addEventListener('change', () => { clearTimeout(timer); box.dataset.state = 'saving'; status.innerHTML = '<span class="c-spinner" aria-hidden="true"></span>';
      timer = setTimeout(() => { const bad = input.getAttribute('aria-label') === 'Effectif' && !/^\d+$/.test(input.value.trim());
        if (bad) { box.dataset.state = 'error'; status.innerHTML = '<span class="t-signal">▲</span> Nombre attendu'; return; }
        box.dataset.state = 'saved'; status.innerHTML = '<i class="c-icon i-check" aria-hidden="true"></i>'; timer = setTimeout(() => { box.dataset.state = 'idle'; status.innerHTML = ''; }, 1600); }, 900); }); });

  // ---- Plan : choisir une page
  (() => { const d = demo('c-plan'); if (!d) return; d.addEventListener('click', (e) => { const b = e.target.closest('.c-plan__open'); if (!b) return; $$('.c-plan__page', d).forEach((p) => p.removeAttribute('aria-current')); b.closest('.c-plan__page').setAttribute('aria-current', 'page'); }); })();

  // ---- « Aller à » : la liste se resserre à la frappe, les flèches choisissent
  (() => { const d = demo('c-palette'); if (!d) return; const input = $('input', d), list = $('.c-palette__list', d), foot = $('.c-palette__foot span:last-child', d);
    const DATA = [['Agences', 'Agence', 'Grenoble Centre', 'M. Delorme', 'N-014'], ['Agences', 'Agence', 'Chambéry', 'A. Perrin', 'N-011'], ['Agences', 'Agence', 'Voiron', 'S. Garcin', 'N-015'], ['Écrans', 'Écran', 'Rapports', 'Annuel, trimestriels', 'Pilotage'], ['Écrans', 'Écran', 'Journal', 'Événements et annulations', 'Pilotage'], ['Actions', 'Action', 'Exporter les agences', 'Fichier CSV', ''], ['Actions', 'Action', 'Ouvrir la console', 'Journal et commandes', 'C']];
    const norm = (v) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); let active = 0, shown = [];
    const render = () => { const q = norm(input.value.trim()); shown = DATA.filter((r) => !q || norm(r.slice(2).join(' ')).includes(q)); active = Math.min(active, Math.max(0, shown.length - 1)); let html = '', g = '';
      shown.forEach((r, i) => { if (r[0] !== g) { g = r[0]; html += `<div class="c-palette__group"><span>${g}</span><span>${shown.filter((x) => x[0] === g).length}</span></div>`; } html += `<button class="c-palette__item" type="button" role="option" data-i="${i}" aria-selected="${i === active}"><span class="c-palette__type">${r[1]}</span><span class="c-palette__main"><span class="c-palette__title">${r[2]}</span><span class="c-palette__desc">${r[3]}</span></span><span class="c-palette__hint">${r[4]}</span></button>`; });
      list.innerHTML = html || '<div class="c-empty c-empty--plain"><span class="c-empty__label">Aucun résultat</span></div>'; foot.textContent = `${shown.length} résultat${shown.length > 1 ? 's' : ''}`; };
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % shown.length; render(); } else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % shown.length; render(); } else if (e.key === 'Escape') { input.value = ''; render(); } else if (e.key === 'Enter' && shown[active]) { input.value = shown[active][2]; render(); } });
    list.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { active = +b.dataset.i; input.value = shown[active][2]; render(); input.focus(); } });
    render(); })();

  // ---- Console : les commandes répondent (aide, lister, exporter, etat, vider)
  (() => { const d = demo('c-console'); if (!d || !window.MonoConsole) return; const log = $('.c-console__log', d), head = $('.c-console__head span:last-child', d);
    MonoConsole(log, $('input', d)); new MutationObserver(() => { const n = log.children.length; head.textContent = `${n} ligne${n > 1 ? 's' : ''}`; }).observe(log, { childList: true }); })();

  // ---- Menu contextuel : clic droit dans le cadre
  (() => { const d = demo('c-menu-contextuel'); if (!d) return; const stage = d.firstElementChild, menu = $('.c-menu__list', stage), sub = $('.c-menu__sub', menu);
    stage.style.minHeight = '16rem'; sub.classList.remove('is-open'); menu.style.position = 'absolute';
    const hint = document.createElement('span'); hint.className = 't-micro'; hint.style.cssText = 'position: absolute; right: 0; bottom: 0; color: var(--fg-muted)'; hint.textContent = 'Clic droit dans ce cadre'; stage.append(hint);
    stage.addEventListener('contextmenu', (e) => { e.preventDefault(); const r = stage.getBoundingClientRect(); menu.hidden = false; menu.style.left = Math.min(e.clientX - r.left, r.width - 230) + 'px'; menu.style.top = Math.min(e.clientY - r.top, r.height - 150) + 'px'; });
    menu.addEventListener('click', (e) => { const it = e.target.closest('.c-menu__item'); if (!it || it.getAttribute('aria-haspopup')) return; const group = it.parentElement; if (group !== menu) $$('.c-menu__item', group).forEach((x) => x.removeAttribute('aria-checked')), it.setAttribute('aria-checked', 'true'); menu.hidden = true; });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') menu.hidden = true; }); document.addEventListener('pointerdown', (e) => { if (!menu.contains(e.target) && e.button === 0) menu.hidden = true; }); })();

  // ---- Fenêtre flottante : se déplace par sa barre, se ferme, se rouvre
  const makeWindow = (win, stage) => { const bar = $('.c-window__bar', win); let x0 = 0, y0 = 0; win.style.position = 'absolute';
    drag(bar, (dx, dy) => { win.style.left = Math.max(0, Math.min(stage.clientWidth - win.offsetWidth, x0 + dx)) + 'px'; win.style.top = Math.max(0, Math.min(stage.clientHeight - win.offsetHeight, y0 + dy)) + 'px'; }, (e) => { if (e.target.closest('button')) return false; x0 = win.offsetLeft; y0 = win.offsetTop; win.dispatchEvent(new Event('activate')); }); };
  (() => { const d = demo('c-window'); if (!d) return; const win = $('.c-window', d); d.style.cssText = 'position: relative; height: 18rem; overflow: hidden'; win.style.left = '24px'; win.style.top = '24px'; makeWindow(win, d);
    const back = document.createElement('button'); back.className = 'c-button c-button--quiet'; back.type = 'button'; back.textContent = 'Rouvrir la fenêtre'; back.hidden = true; back.style.cssText = 'position: absolute; left: var(--space-5); top: var(--space-5)'; d.append(back);
    $('button', win).addEventListener('click', () => { win.hidden = true; back.hidden = false; }); back.addEventListener('click', () => { win.hidden = false; back.hidden = true; }); })();

  // ---- Barre des fenêtres : un bureau miniature. Un clic active, un second réduit ; l'horloge tourne.
  (() => { const d = demo('c-taskbar'); if (!d) return; const desk = $('.l-desk', d), bar = $('.c-taskbar', d), items = $$('.c-taskbar__group--windows .c-taskbar__item', bar), meta = $('.c-taskbar__meta', bar);
    desk.classList.add('l-desk--os'); desk.style.cssText = 'min-height: 0; height: 21rem'; const area = document.createElement('div'); area.className = 'l-desk__area'; desk.prepend(area);
    const wins = items.map((b, i) => { const w = document.createElement('section'); w.className = 'c-window'; w.setAttribute('aria-label', b.textContent.trim()); w.style.cssText = `--window: 15rem; left: ${16 + i * 150}px; top: ${12 + i * 26}px`;
      w.innerHTML = `<div class="c-window__frame"><header class="c-window__bar"><i class="c-icon i-grip" aria-hidden="true"></i><span class="c-window__title">${b.textContent.trim()}</span><button class="c-button c-button--quiet" type="button" aria-label="Réduire"><i class="c-icon i-minus" aria-hidden="true"></i></button></header><div class="c-window__body"><p class="t-soft">${['12 agences, 1 en fermeture.', 'Grenoble Centre — 12,4 M.', '412 agences chargées.'][i]}</p></div></div>`;
      area.append(w); makeWindow(w, area); return w; });
    const sync = (active) => { wins.forEach((w, i) => { const min = w.classList.contains('is-minimized'), on = w === active && !min; w.classList.toggle('is-active', on); w.style.zIndex = on ? 3 : 1; items[i].setAttribute('aria-pressed', String(on)); items[i].classList.toggle('is-minimized', min); }); meta.firstElementChild.textContent = `${wins.filter((w) => !w.classList.contains('is-minimized')).length} / ${wins.length}`; };
    wins.forEach((w, i) => { w.addEventListener('activate', () => sync(w)); w.addEventListener('pointerdown', () => sync(w)); $('button', w).addEventListener('click', (e) => { e.stopPropagation(); w.classList.add('is-minimized'); sync(wins.find((x) => !x.classList.contains('is-minimized'))); });
      items[i].addEventListener('click', () => { const on = w.classList.contains('is-active'); w.classList.toggle('is-minimized', on); sync(on ? wins.find((x) => !x.classList.contains('is-minimized')) : w); }); });
    wins[2].classList.add('is-minimized'); sync(wins[0]);
    const time = $('time', meta), tick = () => { time.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }; tick(); setInterval(tick, 20000); })();

  // ---- Canevas : glisser le fond pour se déplacer, la molette pour l'échelle, glisser un objet, double-clic pour en ajouter
  (() => { const d = demo('c-canvas'); if (!d) return; const cv = $('.c-canvas', d), plane = $('.c-canvas__plane', cv); cv.style.height = '24rem'; cv.style.outline = 'none'; cv.tabIndex = 0;
    const v = { x: 24, y: 24, z: 1 }, apply = () => { cv.style.setProperty('--x', v.x + 'px'); cv.style.setProperty('--y', v.y + 'px'); cv.style.setProperty('--z', v.z); read(); };
    const info = document.createElement('div'); info.className = 'c-statusbar'; info.style.cssText = 'border-top: 0; min-height: 2rem'; info.innerHTML = '<span class="c-statusbar__group g-bracket" data-read></span><span class="c-statusbar__group" style="white-space: normal">Glisser le fond · molette · double-clic pour ajouter · Suppr</span>'; cv.after(info);
    const read = () => { $('[data-read]', info).textContent = `x ${Math.round(-v.x)} · y ${Math.round(-v.y)} · ${Math.round(v.z * 100)} % · ${$$('.c-canvas__item', plane).length} objets`; };
    const select = (el) => $$('.c-canvas__item', plane).forEach((it) => it.setAttribute('aria-selected', String(it === el)));
    let sx = 0, sy = 0, target = null;
    drag(cv, (dx, dy) => { if (target) { target.style.setProperty('--ix', sx + dx / v.z + 'px'); target.style.setProperty('--iy', sy + dy / v.z + 'px'); } else { v.x = sx + dx; v.y = sy + dy; apply(); } },
      (e) => { target = e.target.closest('.c-canvas__item'); select(target); if (target) { sx = parseFloat(target.style.getPropertyValue('--ix')) || 0; sy = parseFloat(target.style.getPropertyValue('--iy')) || 0; } else { sx = v.x; sy = v.y; cv.classList.add('is-panning'); } cv.focus({ preventScroll: true }); }, () => cv.classList.remove('is-panning'));
    cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, z = Math.max(0.5, Math.min(2, v.z * (e.deltaY > 0 ? 0.9 : 1.1))); v.x = px - ((px - v.x) / v.z) * z; v.y = py - ((py - v.y) / v.z) * z; v.z = z; apply(); }, { passive: false });
    let n = 2; cv.addEventListener('dblclick', (e) => { if (e.target.closest('.c-canvas__item')) return; const r = cv.getBoundingClientRect(), el = document.createElement('article'); el.className = 'c-canvas__item'; el.style.cssText = `--ix: ${(e.clientX - r.left - v.x) / v.z}px; --iy: ${(e.clientY - r.top - v.y) / v.z}px; --iw: 11rem`; el.innerHTML = `<header class="c-canvas__head"><span>Note</span><span>R${String(++n).padStart(2, '0')}</span></header><div class="c-canvas__body"><p class="t-soft">Nouvel objet.</p></div>`; plane.append(el); select(el); read(); });
    cv.addEventListener('keydown', (e) => { if (e.key === 'Delete' || e.key === 'Backspace') { $('.c-canvas__item[aria-selected="true"]', plane)?.remove(); read(); } }); apply(); })();

  // ---- Recherche : la liste se resserre à la frappe
  (() => { const d = demo('c-search'); if (!d) return; const input = $('input', d), out = document.createElement('div'); out.className = 'c-index'; out.style.cssText = 'counter-reset: idx'; $('.l-stack', d).append(out);
    const A = [['Arles', 'Sud'], ['Avignon', 'Sud'], ['Brive', 'Ouest'], ['Chambéry', 'Nord'], ['Clermont Jaude', 'Centre'], ['Grenoble Centre', 'Nord'], ['Limoges', 'Ouest'], ['Vizille', 'Nord'], ['Voiron', 'Nord']];
    const render = () => { const q = input.value.trim().toLowerCase(), r = q ? A.filter((a) => a.join(' ').toLowerCase().includes(q)) : []; out.innerHTML = r.map((a) => `<div class="c-index__row"><span class="c-index__title">${a[0]}</span><span class="c-index__value">${a[1]}</span></div>`).join('') || (q ? '<span class="t-muted">Aucune agence.</span>' : ''); };
    input.addEventListener('input', render); input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; render(); } }); })();

  // ---- Étapes : avancer, revenir
  (() => { const d = demo('c-steps'); if (!d) return; const steps = $$('.c-steps__step', d); let at = steps.findIndex((s) => s.hasAttribute('aria-current'));
    const row = document.createElement('div'); row.className = 'l-cluster'; row.style.marginTop = 'var(--space-4)'; row.innerHTML = '<button class="c-button c-button--quiet" type="button" data-d="-1">Étape précédente</button><button class="c-button" type="button" data-d="1">Étape suivante</button>'; d.append(row);
    const set = () => { steps.forEach((s, i) => { s.classList.toggle('is-done', i < at); i === at ? s.setAttribute('aria-current', 'step') : s.removeAttribute('aria-current'); }); $('[data-d="-1"]', row).disabled = at === 0; $('[data-d="1"]', row).disabled = at === steps.length - 1; };
    row.addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) { at = Math.max(0, Math.min(steps.length - 1, at + +b.dataset.d)); set(); } }); set(); })();

  // ---- Annulation et notifications : deux gestes à faire, un vrai journal
  (() => { const d = demo('c-notifs'); if (!d || !notifs) return; $('.l-stack', d)?.remove(); let n = 0; const who = ['C. Morel', 'A. Perrin', 'L. Brun'];
    const row = document.createElement('div'); row.className = 'l-stack'; row.style.cssText = '--gap: var(--space-3); align-items: flex-start'; row.innerHTML = '<span class="t-micro">Essayer</span><button class="c-button" type="button" data-a="edit">Modifier un champ</button><button class="c-button" type="button" data-a="del"><i class="c-icon i-trash" aria-hidden="true"></i>Supprimer une agence</button><span class="t-small t-muted" style="max-width: 16rem">Le toast apparaît en bas à gauche ; Z l\'annule. Le centre, à droite, garde tout.</span>'; $('.l-cluster', d).prepend(row);
    row.addEventListener('click', (e) => { const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; n++; notifs.push(a === 'edit' ? { kind: 'Modification', text: `Vizille : responsable → ${who[n % 3]}`, ref: 'N-016', undo: () => {} } : { kind: 'Suppression', text: `${['Voiron', 'Arles', 'Brive'][n % 3]} supprimée`, ref: 'N-0' + (10 + n), undo: () => {} }); }); })();

  // ---- Tableau de cartes : le vrai glisser-déposer, sans inspecteur
  (() => { const d = demo('c-board'); if (!d || !window.MonoKanban) return; const board = $('.c-board', d), ghost = document.createElement('div'); ghost.hidden = true;
    MonoKanban({ board, inspector: ghost, detail: ghost, notifs, columns: [{ id: 'todo', name: 'À faire' }, { id: 'doing', name: 'En cours' }, { id: 'done', name: 'Fait' }],
      cards: [['D-044', 'Ouverture d\'Arles : effectif', 'J. Reynaud', '2 déc.', 'todo'], ['D-045', 'Rapport du troisième trimestre', 'P. Vidal', '30 nov.', 'todo'], ['D-041', 'Reprise des contrats de Vizille', 'M. Delorme', '14 nov.', 'doing', true], ['D-038', 'Audit des primes du Nord', 'A. Perrin', '21 nov.', 'doing'], ['D-031', 'Clôture de l\'exercice 2025', 'P. Vidal', '31 oct.', 'done']].map(([ref, title, who, due, col, blocked], i) => ({ id: 'c' + i, ref, title, who, due, col, blocked: !!blocked, note: '' })) }); })();
})();
