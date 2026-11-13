import { SCENES, seeded } from './animation-scenes.js';

const root = document.documentElement;
const $ = (selector, node = document) => node.querySelector(selector);
const area = $('#area');
const launcher = $('#launcher');
const tasks = $('#tasks');
const preferences = $('#preferences');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 760px)');
const windows = new Map();
let active = null;
let frame = 0;
let previous = 0;
let palette;

const MIN_FRAME = 1000 / 60;
const PIXELS = 1_600_000;
const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const visible = (w) => !w.minimized && (w === active || !active?.el.classList.contains('is-maximized')) && (!compact.matches || w === active);
const playing = () => active?.ctx && active.gridCtx && !active.paused && !reduced.matches && !preferences.open;

function schedule() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(render);
}

function readPalette() {
  const style = getComputedStyle(root);
  const role = name => style.getPropertyValue(name).trim();
  return {
    sunken: role('--bg-sunken'), surface: role('--surface'), panel: role('--surface-2'), faint: role('--line-faint'), line: role('--line'),
    guide: role('--line-strong'), mark: role('--mark'), soft: role('--fg-soft'),
    strong: role('--fg-strong'), signal: role('--signal'), font: role('--font-mono'), size: role('--text-small'),
  };
}

function prepare(w) {
  const width = w.canvas.clientWidth;
  const height = w.canvas.clientHeight;
  if (width < 64 || height < 36) return false;
  const scale = Math.min(devicePixelRatio || 1, 2, Math.sqrt(PIXELS / (width * height)));
  const pixelsWide = Math.max(1, Math.floor(width * scale));
  const pixelsHigh = Math.max(1, Math.floor(height * scale));
  if (w.canvas.width !== pixelsWide || w.canvas.height !== pixelsHigh) {
    w.canvas.width = w.grid.width = pixelsWide;
    w.canvas.height = w.grid.height = pixelsHigh;
  }
  const ctx = w.gridCtx;
  ctx.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.font = `${palette.size} ${palette.font}`;
  w.scene.layout(ctx, width, height, palette);
  w.ctx.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
  w.ctx.font = ctx.font;
  w.width = width;
  w.height = height;
  return true;
}

function render(now) {
  frame = 0;
  if (document.hidden) return;
  palette ??= readPalette();
  const moving = playing();
  const elapsed = previous ? now - previous : 0;
  // Un seul dessin animé, même sur un écran à fréquence élevée.
  const advance = moving && (!previous || elapsed >= MIN_FRAME - 1);
  if (advance) {
    active.time += Math.min(elapsed, 64) / 1000;
    previous = now;
  } else if (!moving) previous = 0;

  for (const w of windows.values()) {
    if (!visible(w) || !w.ctx || !w.gridCtx || !(w.dirty || (w === active && advance))) continue;
    const key = w.scene.frameKey?.(w.time);
    if (!w.dirty && key !== undefined && w.lastKey === key) continue;
    if (w.dirty && !prepare(w)) continue;
    w.ctx.clearRect(0, 0, w.width, w.height);
    w.dirty = false;
    w.lastKey = key;
    w.scene.draw(w.ctx, w.time, palette, key);
    if (now >= w.nextReading) {
      const value = w.scene.readout();
      if (w.reading.textContent !== value) w.reading.textContent = value;
      w.nextReading = now + 240;
    }
  }
  if (moving) schedule();
}

const resize = new ResizeObserver(entries => {
  for (const entry of entries) {
    const w = windows.get(entry.target.closest('[data-window]').dataset.window);
    if (w) w.dirty = true;
  }
  schedule();
});

function invalidate() {
  palette = null;
  for (const w of windows.values()) w.dirty = true;
  schedule();
}

function reset(w, seed = newSeed()) {
  w.scene = w.definition.create(seeded(seed));
  w.time = w.definition.start;
  w.nextReading = 0;
  w.dirty = true;
  $('[data-seed]', w.el).textContent = seed.toString(16).toUpperCase().padStart(8, '0');
  schedule();
}

function syncWindows() {
  $('#empty').hidden = Boolean(active);
  for (const w of windows.values()) {
    w.el.classList.toggle('is-active', w === active);
    w.el.classList.toggle('is-minimized', w.minimized);
    w.el.toggleAttribute('data-covered', !visible(w));
    w.task.classList.toggle('is-minimized', w.minimized);
    w.task.setAttribute('aria-pressed', String(w === active));
  }
  syncControls();
  schedule();
}

function syncControls() {
  for (const w of windows.values()) {
    $('[data-action="maximize"]', w.el).setAttribute('aria-label', w.el.classList.contains('is-maximized') ? 'Restaurer la taille' : 'Agrandir');
    const pause = $('[data-action="pause"]', w.el);
    pause.disabled = reduced.matches || !w.ctx || !w.gridCtx;
    pause.textContent = reduced.matches ? 'Image fixe' : w.paused ? 'Reprendre' : 'Pause';
    $('[data-action="fullscreen"]', w.el).textContent = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran';
  }
}

function activate(w, focus = false) {
  if (w !== active) {
    previous = 0;
    active = w;
    // La dernière fenêtre activée est la première à reprendre la main.
    windows.delete(w.id);
    windows.set(w.id, w);
    let z = 1;
    for (const entry of windows.values()) entry.el.style.zIndex = z++;
  }
  w.minimized = false;
  syncWindows();
  if (focus) w.el.focus({ preventScroll: true });
}

function place(w, x = w.x, y = w.y, width = w.w, height = w.h) {
  w.w = Math.min(width, area.clientWidth);
  w.h = Math.min(height, area.clientHeight);
  w.x = Math.max(0, Math.min(x, area.clientWidth - w.w));
  w.y = Math.max(0, Math.min(y, area.clientHeight - w.h));
  Object.assign(w.el.style, { left: `${w.x}px`, top: `${w.y}px`, width: `${w.w}px`, height: `${w.h}px` });
}

function open(id, focus = true) {
  const existing = windows.get(id);
  if (existing) { activate(existing, focus); return; }
  const definition = SCENES[id];
  const el = $('#window-template').content.firstElementChild.cloneNode(true);
  const canvas = $('[data-trace]', el);
  const task = document.createElement('button');
  const grid = $('[data-grid]', el);
  const w = { id, el, definition, canvas, ctx: canvas.getContext('2d'), grid, gridCtx: grid.getContext('2d'), task, reading: $('[data-reading]', el), paused: false, minimized: false };
  const offset = windows.size * 22;
  el.id = `scene-${id}`;
  el.dataset.window = id;
  el.tabIndex = -1;
  el.setAttribute('aria-label', definition.name);
  el.classList.add('is-maximized');
  $('.c-window__title', el).textContent = definition.name;
  canvas.setAttribute('aria-label', `${definition.category}. ${definition.legend}`);
  task.className = 'c-taskbar__item';
  task.type = 'button';
  task.textContent = definition.name;
  task.setAttribute('aria-controls', el.id);
  task.addEventListener('click', () => w === active ? remove(w) : activate(w, true));
  windows.set(id, w);
  area.append(el);
  tasks.append(task);
  place(w, 18 + offset, 14 + offset, Math.max(440, area.clientWidth * 0.68), Math.max(370, area.clientHeight * 0.75));
  reset(w);
  if (!w.ctx || !w.gridCtx) w.reading.textContent = 'Rendu Canvas indisponible';
  resize.observe(canvas);
  activate(w, focus);
  if (focus) task.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function remove(w, close = false) {
  if (close) {
    resize.unobserve(w.canvas);
    windows.delete(w.id);
    w.el.remove();
    w.task.remove();
  } else w.minimized = true;
  if (w === active) {
    active = null;
    previous = 0;
    const next = [...windows.values()].reverse().find(entry => !entry.minimized);
    if (next) { activate(next, true); return; }
  }
  syncWindows();
  (close ? $('summary', launcher) : w.task).focus({ preventScroll: true });
}

function maximize(w) {
  if (compact.matches) return;
  w.el.classList.toggle('is-maximized');
  activate(w);
}

async function fullscreen(w) {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await root.requestFullscreen();
  } catch {
    w.reading.textContent = 'Plein écran indisponible';
    w.nextReading = performance.now() + 2500;
  }
}

const actions = {
  minimize: w => remove(w),
  maximize,
  close: w => remove(w, true),
  seed: w => reset(w),
  pause(w) { w.paused = !w.paused; previous = 0; syncControls(); schedule(); },
  fullscreen,
};

area.addEventListener('click', e => {
  const button = e.target.closest('[data-action]');
  if (!button) return;
  const w = windows.get(button.closest('[data-window]').dataset.window);
  activate(w);
  actions[button.dataset.action](w);
});
area.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-window]');
  if (el && active?.el !== el) activate(windows.get(el.dataset.window));
});
area.addEventListener('dblclick', e => {
  const bar = e.target.closest('.c-window__bar');
  if (bar && !e.target.closest('button')) maximize(windows.get(bar.closest('[data-window]').dataset.window));
});

if (window.interact) {
  const canMove = e => !compact.matches && !e.target.classList.contains('is-maximized');
  interact('.animation-desk .c-window').draggable({
    allowFrom: '.c-window__bar', ignoreFrom: 'button',
    listeners: { move(e) { if (canMove(e)) { const w = windows.get(e.target.dataset.window); place(w, w.x + e.dx, w.y + e.dy); } } },
  }).resizable({
    edges: { right: true, bottom: true }, margin: 9,
    modifiers: [interact.modifiers.restrictSize({ min: { width: 330, height: 270 } })],
    listeners: { move(e) { if (canMove(e)) { const w = windows.get(e.target.dataset.window); place(w, w.x, w.y, e.rect.width, e.rect.height); } } },
  });
}

const choices = $('#scenes');
for (const [id, scene] of Object.entries(SCENES)) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'c-menu__item';
  button.textContent = scene.name;
  button.addEventListener('click', () => { launcher.open = false; open(id); });
  choices.append(button);
}
document.addEventListener('pointerdown', e => { if (!launcher.contains(e.target)) launcher.open = false; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && launcher.open) { launcher.open = false; $('summary', launcher).focus(); }
});

function preference(name, value) {
  root.dataset[name] = value;
  try { localStorage.setItem(`mono-${name}`, value); } catch {}
  window.frameElement?.dispatchEvent(new CustomEvent('mono:example-preference', { detail: { name, value } }));
}

$('#settings').addEventListener('click', () => {
  preferences.querySelectorAll('[name="theme"]').forEach(input => { input.checked = input.value === root.dataset.theme; });
  $('#grain').checked = root.dataset.grain !== 'off';
  preferences.showModal();
  previous = 0;
});
preferences.addEventListener('change', e => {
  if (e.target.name === 'theme') preference('theme', e.target.value);
  else if (e.target.id === 'grain') preference('grain', e.target.checked ? 'on' : 'off');
});
preferences.addEventListener('close', schedule);
new MutationObserver(invalidate).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
addEventListener('storage', ({ key, newValue }) => {
  if (key === 'mono-theme' && (newValue === 'encre' || newValue === 'papier')) root.dataset.theme = newValue;
  if (key === 'mono-grain') root.dataset.grain = newValue === 'off' ? 'off' : 'on';
});
document.addEventListener('fullscreenchange', syncControls);
document.addEventListener('visibilitychange', () => {
  previous = 0;
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
  else schedule();
});
reduced.addEventListener('change', () => { previous = 0; syncControls(); schedule(); });
compact.addEventListener('change', syncWindows);
addEventListener('resize', () => { for (const w of windows.values()) place(w); invalidate(); });
document.fonts.ready.then(invalidate);
open(Object.keys(SCENES)[0], false);
