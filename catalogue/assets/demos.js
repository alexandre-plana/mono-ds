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

  // ---- Bouton occupé : il tourne, puis dit que c'est fait
  $$('[data-demo-busy]').forEach((b) => b.addEventListener('click', () => { const label = b.textContent; b.setAttribute('aria-busy', 'true'); b.innerHTML = '<span class="c-spinner" aria-hidden="true"></span>Export';
    setTimeout(() => { b.removeAttribute('aria-busy'); b.textContent = b.dataset.demoBusy; setTimeout(() => { b.textContent = label; }, 1400); }, 1500); }));

  // ---- Filtres appliqués : la croix retire, « Tout retirer » vide, et l'on peut revenir
  (() => { const d = $('#c-chip [role="group"][aria-label="Filtres appliqués"]'); if (!d) return; const initial = d.innerHTML;
    d.addEventListener('click', (e) => { if (e.target.closest('.c-chip__remove')) e.target.closest('.c-chip').remove(); else if (e.target.closest('[data-demo-reset]')) $$('.c-chip', d).forEach((c) => c.remove()); else if (e.target.closest('[data-demo-restore]')) { d.innerHTML = initial; return; } else return;
      const btn = $('button.c-button', d); if (!$('.c-chip', d)) { btn.textContent = 'Rétablir les filtres'; btn.removeAttribute('data-demo-reset'); btn.setAttribute('data-demo-restore', ''); } }); })();

  // ---- Champ composé : voir le mot de passe, ajuster d'un pas
  $$('[data-demo-reveal]').forEach((b) => b.addEventListener('click', () => { const input = b.parentElement.querySelector('input'), on = input.type === 'password'; input.type = on ? 'text' : 'password'; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Cacher' : 'Voir'; }));
  $$('[data-demo-step]').forEach((b) => { const input = b.parentElement.querySelector('input'), sync = () => $$('[data-demo-step]', b.parentElement).forEach((x) => { x.disabled = +x.dataset.demoStep < 0 ? +input.value <= +input.min : +input.value >= +input.max; });
    b.addEventListener('click', () => { input.value = Math.max(+input.min, Math.min(+input.max, (+input.value || 0) + +b.dataset.demoStep)); sync(); }); input.addEventListener('input', sync); sync(); });

  // ---- Champ à cases : le champ annonce le décompte
  $$('.c-menu--field').forEach((m) => { const out = $('[data-count]', m), sync = () => { const on = $$('input:checked', m); out.textContent = !on.length ? 'Toutes les régions' : on.length === 1 ? on[0].nextElementSibling.textContent : on.length + ' régions'; }; m.addEventListener('change', sync); sync(); });

  // ---- Saisie assistée : la liste suit la frappe ; flèches, Entrée, Échap
  (() => { const d = demo('c-combo'); if (!d) return; const input = $('input', d), list = $('.c-menu__list', d);
    const DATA = [['Arles', 'Sud'], ['Arras', 'Nord'], ['Bar-le-Duc', 'Est'], ['Colmar', 'Est'], ['Carcassonne', 'Sud'], ['Annecy', 'Est'], ['Angers', 'Ouest'], ['Bayonne', 'Sud'], ['Brest', 'Ouest'], ['Chartres', 'Ouest'], ['Dax', 'Sud'], ['Lorient', 'Ouest'], ['Narbonne', 'Sud'], ['Tarbes', 'Sud'], ['Vizille', 'Est']];
    const norm = (v) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); let active = 0, shown = [];
    const open = (on) => { list.hidden = !on; input.setAttribute('aria-expanded', String(on)); };
    const render = () => { const q = norm(input.value.trim()); if (!q) { open(false); return; }
      shown = DATA.filter(([n]) => norm(n).includes(q)).sort((a, b) => norm(a[0]).indexOf(q) - norm(b[0]).indexOf(q)).slice(0, 6); active = Math.min(active, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length ? shown.map(([n, r], i) => { const k = norm(n).indexOf(q); return `<button class="c-menu__item" type="button" role="option" tabindex="-1" aria-selected="${i === active}"><span>${n.slice(0, k)}<mark>${n.slice(k, k + q.length)}</mark>${n.slice(k + q.length)}</span> <span class="c-menu__hint">${r}</span></button>`; }).join('') : '<span class="c-menu__label">Aucune agence</span>';
      open(true); };
    const pick = (i) => { if (!shown[i]) return; input.value = shown[i][0]; open(false); };
    input.addEventListener('input', () => { active = 0; render(); }); input.addEventListener('focus', () => { input.select(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (list.hidden) { render(); return; } active = (active + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length; render(); } else if (e.key === 'Enter' && !list.hidden) { e.preventDefault(); pick(active); } else if (e.key === 'Escape') open(false); });
    list.addEventListener('pointerdown', (e) => { const it = e.target.closest('.c-menu__item'); if (it) { e.preventDefault(); pick($$('.c-menu__item', list).indexOf(it)); } });
    input.addEventListener('blur', () => open(false)); })();

  // ---- Saisie d'étiquettes : Entrée ou virgule ajoute, Retour arrière reprend la dernière
  (() => { const d = demo('c-input-tags'); if (!d) return; const group = $('.c-input-group', d), input = $('input', group), hint = $('.c-field__hint', d), max = +input.dataset.max;
    const tags = () => $$('.c-chip', group), names = () => tags().map((t) => t.firstChild.textContent.trim());
    const sync = (msg) => { const full = tags().length >= max; input.disabled = full; input.placeholder = full ? '' : 'Ajouter'; hint.textContent = msg || (full ? `${max} destinataires : la limite est atteinte.` : 'Entrée pour ajouter.'); };
    const add = () => { const v = input.value.replace(/,/g, '').trim(); if (!v) return; if (names().some((n) => n.toLowerCase() === v.toLowerCase())) { input.value = ''; sync(`${v} y est déjà.`); return; }
      const c = document.createElement('span'); c.className = 'c-chip c-chip--applied'; c.append(v + ' '); const x = document.createElement('button'); x.className = 'c-chip__remove'; x.type = 'button'; x.setAttribute('aria-label', 'Retirer ' + v); x.innerHTML = '<i class="c-icon i-close" aria-hidden="true"></i>'; c.append(x); input.before(c); input.value = ''; sync(); };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !input.value && tags().length) { const last = tags().at(-1); input.value = last.firstChild.textContent.trim(); last.remove(); sync(); e.preventDefault(); } });
    group.addEventListener('click', (e) => { const x = e.target.closest('.c-chip__remove'); if (x) { e.preventDefault(); x.closest('.c-chip').remove(); sync(); input.focus(); } }); sync(); })();

  // ---- Calendrier : changer de mois, choisir une période en deux clics
  (() => { const d = demo('c-calendar'); if (!d) return; const cal = $('.c-calendar', d), title = $('.c-calendar__title', cal), body = $('tbody', cal);
    const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'], SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const iso = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`, at = (s) => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
    const say = (s) => { const t = at(s); return `${t.getDate()} ${SHORT[t.getMonth()]} ${t.getFullYear()}`; };
    const TODAY = '2026-11-13', CLOSED = new Set(['2026-11-11', '2026-12-25', '2027-01-01']); let view = new Date(2026, 10, 1), from = '2026-11-16', to = '2026-11-20';
    const render = () => { const name = MONTHS[view.getMonth()]; title.textContent = name[0].toUpperCase() + name.slice(1) + ' ' + view.getFullYear(); cal.setAttribute('aria-label', title.textContent);
      const start = new Date(view); start.setDate(1 - ((view.getDay() + 6) % 7)); let html = '';
      for (let w = 0; w < 6; w++) { const first = new Date(start); first.setDate(start.getDate() + w * 7); if (w === 5 && first.getMonth() !== view.getMonth()) break; html += '<tr>';
        for (let i = 0; i < 7; i++) { const t = new Date(first); t.setDate(first.getDate() + i); const k = iso(t), end = k === from || k === to;
          html += `<td><button class="c-calendar__day${t.getMonth() !== view.getMonth() ? ' is-out' : ''}${!end && to && k > from && k < to ? ' is-between' : ''}" type="button" data-date="${k}"${k === TODAY ? ' aria-current="date"' : ''}${end ? ' aria-pressed="true"' : ''}${CLOSED.has(k) ? ' disabled' : ''}>${t.getDate()}</button></td>`; } html += '</tr>'; }
      body.innerHTML = html;
      $('[data-cal-from]', d).textContent = say(from); $('[data-cal-to]', d).textContent = to ? say(to) : '— choisir la fin'; const n = to ? Math.round((at(to) - at(from)) / 864e5) + 1 : 0; $('[data-cal-len]', d).textContent = to ? `${n} jour${n > 1 ? 's' : ''}` : '—'; };
    cal.addEventListener('click', (e) => { const nav = e.target.closest('[data-cal]'), day = e.target.closest('.c-calendar__day');
      if (nav) { view = new Date(view.getFullYear(), view.getMonth() + +nav.dataset.cal, 1); render(); }
      else if (day) { const k = day.dataset.date; if (!to && k >= from) to = k; else { from = k; to = null; } render(); } }); })();

  // ---- Dépôt de fichier : le contour se renforce au survol d'un fichier ; chaque fichier reçu devient une ligne
  (() => { const d = demo('c-dropzone'); if (!d) return; const zone = $('.c-dropzone', d), input = $('input', zone), list = $('.c-files', d);
    const size = (n) => (n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko'), esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const run = (li) => { const state = $('.c-files__state', li), meter = $('.c-meter', li); let v = +meter.getAttribute('aria-valuenow'); const t = setInterval(() => { if (!li.isConnected) return clearInterval(t); v = Math.min(100, v + 2 + Math.random() * 5); meter.style.setProperty('--value', v); meter.setAttribute('aria-valuenow', Math.round(v)); state.textContent = Math.round(v) + ' %'; if (v >= 100) { clearInterval(t); meter.remove(); state.textContent = 'Reçu'; } }, 420); };
    const add = (files) => [...files].forEach((f) => { const ok = /\.(csv|pdf)$/i.test(f.name) && f.size <= 10485760, li = document.createElement('li'); li.className = 'c-files__item';
      li.innerHTML = `<span class="c-files__name">${esc(f.name)}</span><span class="c-files__size">${size(f.size)}</span><span class="c-files__state">${ok ? '0 %' : ''}</span><button class="c-files__remove" type="button" aria-label="Retirer ${esc(f.name)}"><i class="c-icon i-close" aria-hidden="true"></i></button>` + (ok ? '<span class="c-meter" style="--value: 0" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></span>' : `<span class="c-field__error" style="grid-column: 1 / -1">${f.size > 10485760 ? 'Refusé : plus de 10 Mo.' : 'Refusé : ni CSV ni PDF.'}</span>`);
      list.append(li); if (ok) run(li); });
    ['dragenter', 'dragover'].forEach((n) => zone.addEventListener(n, (e) => { e.preventDefault(); zone.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((n) => zone.addEventListener(n, (e) => { e.preventDefault(); zone.classList.remove('is-over'); }));
    zone.addEventListener('drop', (e) => add(e.dataTransfer.files)); input.addEventListener('change', () => { add(input.files); input.value = ''; });
    list.addEventListener('click', (e) => e.target.closest('.c-files__remove')?.closest('li').remove()); const pending = $('.c-meter', list)?.closest('li'); if (pending) run(pending); })();

  // ---- Curseur : la part acquise et le nombre suivent
  $$('.c-range').forEach((r) => { const out = document.querySelector(`output[for="${r.id}"]`), sync = () => { r.style.setProperty('--value', (r.value - r.min) / (r.max - r.min) * 100); if (out) out.textContent = r.value + ' %'; }; r.addEventListener('input', sync); sync(); });

  // ---- Conversation : on écrit, cela part ; l'autre écrit puis répond ; l'assistant écrit sa réponse mot à mot
  (() => { const sub = document.getElementById('c-chat'); if (!sub) return; const chats = $$('.c-chat', sub).filter((c) => $('.c-chat__compose', c));
    const hm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const msg = (cls, who, html, time) => { const li = document.createElement('li'); li.className = 'c-chat__msg' + (cls ? ' ' + cls : ''); li.innerHTML = `<time class="c-chat__time">${time ?? hm()}</time><span class="c-chat__who">${who}</span><div class="c-chat__text">${html}</div>`; return li; };
    const HUMAN = ['D\'accord. Je te préviens dès que Vizille a transmis.', 'Oui, les trois sont dans le fichier joint.', 'Merci. On en reparle à la réunion de 14 h ?'];
    const AI = ['Arles est bloquée depuis douze jours, Narbonne depuis neuf, Tarbes depuis quatre. Les trois dépendent du même dossier, D-041.', 'Je n\'ai que les données du troisième trimestre : au-delà, je ne peux pas répondre avec certitude.', 'Oui. La reprise des contrats de Vizille est attendue ; une fois reçue, le déblocage est immédiat pour les trois agences.'];
    chats.forEach((chat) => { const ai = chat.classList.contains('c-chat--console'), log = $('.c-chat__log', chat), form = $('.c-chat__compose', chat), input = $('.c-chat__input', chat), send = $('.c-chat__send', chat), idle = send.innerHTML; let n = 0, timer = null, stop = null;
      const busy = (on) => { send.innerHTML = on ? 'Arrêter' : idle; send.dataset.busy = on ? '1' : ''; };
      const answer = () => { if (!ai) { const t = msg('is-typing', 'M. Delorme', '<span class="c-spinner" aria-hidden="true"></span>écrit', ''); log.append(t); timer = setTimeout(() => { t.replaceWith(msg('', 'M. Delorme', `<p>${HUMAN[n++ % HUMAN.length]}</p>`)); }, 1600); return; }
        const words = AI[n++ % AI.length].split(' '), li = msg('is-streaming', 'Assistant', '<p></p>'), p = $('p', li); li.setAttribute('aria-busy', 'true'); log.append(li); busy(true); let i = 0;
        const end = (cut) => { clearInterval(timer); li.classList.remove('is-streaming'); li.removeAttribute('aria-busy'); if (cut) p.textContent += ' —'; $('.c-chat__text', li).insertAdjacentHTML('beforeend', `<div class="c-chat__meta">${cut ? '<span>Réponse arrêtée</span>' : '<span>Sources</span><a href="#etats">D-041</a>'}<button type="button" data-copy="${esc(p.textContent)}">Copier la réponse</button></div>`); busy(false); stop = null; };
        stop = () => end(true); timer = setInterval(() => { p.textContent += (i ? ' ' : '') + words[i++]; if (i >= words.length) end(false); }, 90); };
      form.addEventListener('submit', (e) => { e.preventDefault(); if (send.dataset.busy) { stop?.(); return; } const v = input.value.trim(); if (!v) return; log.append(msg('is-own', 'Vous', `<p>${esc(v).replace(/\n/g, '<br>')}</p>`)); input.value = ''; setTimeout(answer, ai ? 350 : 700); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } }); }); })();
})();
