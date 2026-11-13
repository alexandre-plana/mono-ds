const TAU = 2 * Math.PI;
const ease = (v) => v * v * (3 - 2 * v);
const percent = (v) => `${Math.round(v * 100)} %`;

export const SCENES = {
  oscilloscope: {
    name: 'Oscilloscope', category: 'Signal analogique', title: 'Oscilloscope',
    description: 'Deux ondes superposées et leurs échantillons au fil du balayage.',
    legend: 'Trait plein, signal mesuré. Tirets, onde de référence. Points, échantillons.',
    start: 4.5, create: oscilloscope,
  },
  connexions: {
    name: 'Connexions', category: 'Graphe de flux', title: 'Connexions',
    description: 'Des paquets traversent un réseau de relais. Le trajet suivi s’inscrit en trait plein.',
    legend: 'Nœuds répartis entre les entrées, les relais et les sorties. Un paquet suit un trajet parmi les liaisons.',
    start: 3, create: connexions,
  },
  frappe: {
    name: 'Frappe', category: 'Journal de commandes', title: 'Frappe',
    description: 'Chaque caractère saisi ajoute un échantillon au relevé des intervalles de frappe.',
    legend: 'Le journal écrit des commandes simulées. La hauteur des barres donne l’intervalle entre deux caractères, en millisecondes.',
    start: 3.8, create: frappe,
  },
  spectre: {
    name: 'Spectre', category: 'Distribution fréquentielle', title: 'Spectre',
    description: 'Les harmoniques d’un signal synthétique dérivent au fil des mesures.',
    legend: 'Les barres indiquent les amplitudes par fréquence. Un repère identifie la fréquence dominante.',
    start: 2, create: spectre,
  },
};

export function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function line(path, x, y, endX, endY) {
  path.moveTo(x, y);
  path.lineTo(endX, endY);
}

function plot(w, h, ratio = 0.73) {
  const x = w < 360 ? 38 : 46;
  const top = Math.min(80, Math.max(22, h * 0.14));
  return { x, top, w: Math.max(1, Math.min(w - x - 9, w * ratio)), h: Math.max(1, Math.min(h - top - 26, h * 0.64)) };
}

function axis(ctx, p, colors, yLabels, xLabels) {
  const dots = new Path2D();
  const base = new Path2D();
  for (let i = 0; i < yLabels.length; i++) {
    const y = Math.round(p.top + p.h * i / (yLabels.length - 1));
    if (i === yLabels.length - 1) line(base, p.x, y + 0.5, p.x + p.w, y + 0.5);
    else for (let x = p.x; x < p.x + p.w; x += 7) dots.rect(x, y, 1, 1);
    label(ctx, yLabels[i], p.x - 8, y + 4, colors.soft, 'right');
  }
  ctx.fillStyle = colors.guide;
  ctx.fill(dots);
  ctx.strokeStyle = colors.guide;
  ctx.stroke(base);
  xLabels.forEach((value, i) => label(ctx, value, p.x + p.w * i / (xLabels.length - 1), p.top + p.h + 19, colors.soft, i === xLabels.length - 1 ? 'right' : 'left'));
}

function label(ctx, value, x, y, color, align = 'left') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, Math.round(x), Math.round(y));
}

function oscilloscope(random) {
  const phase = random() * TAU;
  const frequency = 3.5 + random() * 1.8;
  const drift = 0.18 + random() * 0.2;
  let p, n, readings, peak = 0;
  return {
    layout(ctx, w, h, c) {
      p = plot(w, h, 0.82);
      n = Math.max(72, Math.min(300, Math.round(p.w / 3)));
      readings = new Float32Array(n + 1);
      axis(ctx, p, c, ['+1', '+0,5', '0', '−0,5', '−1'], ['0', '5', '10', '15', '20 ms']);
    },
    draw(ctx, t, c) {
      const middle = p.top + p.h / 2;
      const amplitude = p.h / 2;
      const offset = phase - t * drift;
      const sweep = Math.floor((t % 7) * n / 7);
      peak = 0;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = p.x + u * p.w;
        const angle = u * TAU * frequency + offset;
        const reference = Math.sin(angle);
        const signal = reference * (0.66 + 0.17 * Math.sin(u * 6 - t * 0.42)) + Math.sin(angle * 2.04 + t * 0.6) * 0.16;
        readings[i] = signal;
        peak = Math.max(peak, Math.abs(signal));
        const y = middle - amplitude * 0.54 * reference;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = c.guide;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = p.x + i / n * p.w;
        const y = middle - amplitude * readings[i];
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = c.mark;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = c.soft;
      for (let i = 0; i <= n; i += Math.max(2, Math.round(n / 46))) {
        ctx.fillRect(Math.round(p.x + i / n * p.w), Math.round(middle - amplitude * readings[i]), 2, 2);
      }
      const sx = Math.round(p.x + sweep / n * p.w);
      const sy = Math.round(middle - amplitude * readings[sweep]);
      ctx.fillStyle = c.guide;
      for (let y = Math.round(p.top); y <= p.top + p.h; y += 6) ctx.fillRect(sx, y, 1, 1);
      ctx.fillStyle = c.strong;
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
    },
    readout: () => `Crête ${percent(peak)} · Fenêtre 20 ms`,
  };
}

function connexions(random) {
  const counts = [3, 5, 4, 5, 3];
  const rows = counts.map(count => Array.from({ length: count }, (_, i) => ({ v: (i + 0.2 + random() * 0.6) / count, next: [] })));
  for (let i = 0; i < rows.length - 1; i++) {
    for (const node of rows[i]) {
      const next = rows[i + 1];
      const index = Math.floor(node.v * next.length);
      node.next = [next[index], next[(index + 1) % next.length]];
    }
  }
  const routes = Array.from({ length: 12 }, (_, index) => {
    let node = rows[0][index % rows[0].length];
    return counts.map((_, i) => {
      const stop = node;
      if (i < counts.length - 1) node = node.next[Math.floor(random() * node.next.length)];
      return stop;
    });
  });
  const nodes = rows.flat();
  let routeIndex = 0;
  return {
    layout(ctx, w, h, c) {
      const p = plot(w, h, 0.76);
      const edges = new Path2D();
      rows.forEach((row, i) => {
        const x = Math.round(p.x + i * p.w / (rows.length - 1)) + 0.5;
        for (const node of row) {
          node.x = x;
          node.y = Math.round(p.top + p.h * node.v) + 0.5;
        }
      });
      for (const node of nodes) for (const next of node.next) line(edges, node.x, node.y, next.x, next.y);
      ctx.strokeStyle = c.guide;
      ctx.setLineDash([4, 5]);
      ctx.stroke(edges);
      ctx.setLineDash([]);
      ctx.strokeStyle = c.mark;
      for (const node of nodes) ctx.strokeRect(node.x - 3, node.y - 3, 6, 6);
      label(ctx, 'Entrées', rows[0][0].x - 4, p.top + p.h + 20, c.soft);
      label(ctx, 'Relais', rows[2][0].x, p.top + p.h + 20, c.soft, 'center');
      label(ctx, 'Sorties', rows[4][0].x + 4, p.top + p.h + 20, c.soft, 'right');
    },
    draw(ctx, t, c) {
      const step = t / 1.4;
      const leg = Math.floor(step) % (rows.length - 1);
      routeIndex = Math.floor(step / (rows.length - 1)) % routes.length;
      const route = routes[routeIndex];
      const from = route[leg];
      const to = route[leg + 1];
      const progress = ease(step % 1);
      ctx.beginPath();
      ctx.moveTo(route[0].x, route[0].y);
      for (let i = 1; i <= leg; i++) ctx.lineTo(route[i].x, route[i].y);
      ctx.strokeStyle = c.mark;
      ctx.stroke();
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = c.strong;
      ctx.stroke();
      ctx.fillStyle = c.strong;
      ctx.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    },
    readout: () => {
      const route = routes[routeIndex];
      return `Paquet ${String(routeIndex + 1).padStart(2, '0')} · E${rows[0].indexOf(route[0]) + 1} → S${rows.at(-1).indexOf(route.at(-1)) + 1}`;
    },
  };
}

function frappe(random, code) {
  const hz = 240 + Math.floor(random() * 420);
  const size = 2 ** (7 + Math.floor(random() * 3));
  const commands = [`échantillonner ${hz} Hz`, `fenêtrer ${size} points`, 'filtrer passe-bas', 'mesurer la crête', 'exporter le relevé'];
  const letters = [];
  let duration = 0;
  for (const [row, command] of commands.entries()) {
    duration += 0.37;
    for (let i = 1; i <= command.length; i++) {
      const interval = 46 + Math.floor(random() * 140);
      duration += interval / 1000;
      const text = commands.slice(0, row).map(value => `> ${value}`).concat(`> ${command.slice(0, i)}`).join('\n');
      letters.push({ time: duration, interval, text });
    }
  }
  duration += 2.5;
  let p, index = -1, visible = 0;
  return {
    layout(ctx, w, h, c) {
      p = plot(w, h, 0.92);
      visible = Math.max(8, Math.min(40, Math.floor(p.w / 7)));
      axis(ctx, p, c, ['200', '150', '100', '50', '0'], ['Intervalles de frappe', 'ms']);
    },
    frameKey(t) {
      const time = t % duration;
      let next = time < (letters[index]?.time ?? 0) ? -1 : index;
      while (next + 1 < letters.length && letters[next + 1].time <= time) next++;
      return next;
    },
    draw(ctx, t, c, next) {
      if (next !== index || !code.textContent) code.textContent = letters[next]?.text ?? '>';
      index = next;
      const start = Math.max(0, index - visible + 1);
      const step = p.w / visible;
      for (let i = start; i <= index; i++) {
        const bar = letters[i].interval / 200 * p.h;
        ctx.fillStyle = i === index ? c.strong : c.mark;
        ctx.fillRect(Math.round(p.x + (i - start) * step), Math.round(p.top + p.h - bar), Math.max(1, Math.floor(step * 0.57)), Math.round(bar));
      }
    },
    readout: () => `Frappe ${Math.max(0, index + 1)} / ${letters.length} · ${letters[index]?.interval ?? 0} ms`,
  };
}

function spectre(random) {
  const fundamental = 0.105 + random() * 0.027;
  const harmonics = Array.from({ length: 5 }, (_, i) => ({
    order: i + 1, phase: random() * TAU, gain: 0.78 / (1 + i * 0.43),
  }));
  const phase = random() * TAU;
  const samples = new Float32Array(56);
  let p, count, maximum, peak;
  return {
    layout(ctx, w, h, c) {
      p = plot(w, h, 0.83);
      count = Math.min(samples.length, Math.max(18, Math.floor(p.w / 7)));
      axis(ctx, p, c, ['100', '75', '50', '25', '0'], ['0', '1', '2', '3', '4 kHz']);
    },
    draw(ctx, t, c) {
      const step = p.w / count;
      const frequency = fundamental + 0.016 * Math.sin(t * 0.26 + phase);
      maximum = 0;
      peak = 0;
      for (let i = 0; i < count; i++) samples[i] = 0.06 + 0.035 * Math.sin(i * 1.7 + phase + t * 0.85) + 0.024 * Math.sin(i * 3.6 - t * 0.7);
      for (const harmonic of harmonics) {
        const center = harmonic.order * frequency * count - 0.5;
        const gain = harmonic.gain * (0.81 + 0.19 * Math.sin(t * 0.62 + harmonic.phase));
        for (let i = Math.max(0, Math.floor(center) - 6); i < Math.min(count, Math.ceil(center) + 6); i++) {
          const distance = (i - center) / Math.max(0.8, count / 37);
          samples[i] += gain / (1 + distance * distance);
        }
      }
      ctx.fillStyle = c.mark;
      for (let i = 0; i < count; i++) {
        const value = Math.min(1, samples[i]);
        if (value > maximum) { maximum = value; peak = i; }
        const bar = Math.round(value * p.h);
        ctx.fillRect(Math.round(p.x + i * step), Math.round(p.top + p.h) - bar, Math.max(1, Math.floor(step * 0.64)), bar);
      }
      const x = Math.round(p.x + peak * step);
      const y = Math.round(p.top + p.h * (1 - maximum));
      ctx.fillStyle = c.strong;
      ctx.fillRect(x, y - 3, Math.max(2, Math.floor(step * 0.64)), 2);
    },
    readout: () => `Pic ${((peak + 0.5) * 4 / count).toFixed(2).replace('.', ',')} kHz · ${percent(maximum)}`,
  };
}
