const TAU = Math.PI * 2;
const UINT_RANGE = 0x100000000;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/+·<>#?';
const PRINT_GLYPHS = 'ETAOINSHRDLUCMFPGWYBVKXJQZ0123456789·/';

export const SCENES = {
  brouillage: {
    name: 'Brouillage',
    category: 'Trames et déchirures',
    legend: 'Des bandes de texte et de bruit se décalent au passage d’une déchirure horizontale.',
    start: 2.4,
    create: brouillage,
  },
  mosaique: {
    name: 'Mosaïque',
    category: 'Grille de subdivisions',
    legend: 'Sous les grands aplats, les carrés se subdivisent localement en quatre puis se reforment.',
    start: 2.7,
    create: mosaique,
  },
  transmission: {
    name: 'Transmission',
    category: 'Champ de caractères',
    legend: 'Des fragments de texte se révèlent horizontalement dans une trame de caractères fixe, avec quelques marques pleines.',
    start: 3.2,
    create: transmission,
  },
};

export function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / UINT_RANGE;
  };
}

function sample(seed, index) {
  let value = Math.imul(seed ^ index, 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / UINT_RANGE;
}

const glyph = value => GLYPHS[Math.floor(value * GLYPHS.length)];

function noiseTile(ctx, seed, ink, paper, density, size) {
  const tile = ctx.canvas.ownerDocument.createElement('canvas');
  tile.width = tile.height = 96;
  const pixels = tile.getContext('2d');
  if (paper) {
    pixels.fillStyle = paper;
    pixels.fillRect(0, 0, tile.width, tile.height);
  }
  pixels.fillStyle = ink;
  for (let y = 0; y < tile.height; y += size) {
    for (let x = 0; x < tile.width; x += size) {
      const amount = sample(seed, y * tile.width + x);
      if (amount < density) {
        pixels.globalAlpha = 0.25 + 0.75 * amount / density;
        pixels.fillRect(x, y, size, size);
      }
    }
  }
  return ctx.createPattern(tile, 'repeat');
}

function noiseBands(ctx, palette, seed, w, h) {
  const dark = palette.sunken;
  const light = palette.strong;
  const fine = noiseTile(ctx, seed, palette.soft, dark, 0.53, 1);
  const coarse = noiseTile(ctx, seed + 1, palette.guide, dark, 0.28, 2);
  const mist = noiseTile(ctx, seed + 2, palette.line, palette.panel, 0.37, 1);
  const inked = noiseTile(ctx, seed + 3, dark, palette.guide, 0.48, 1);
  const patches = [
    [0, 0, 0.22, 0.17, light], [0.19, 0, 0.32, 0.24, mist],
    [0.44, 0.035, 0.56, 0.26, palette.line], [0.67, 0, 0.33, 0.12, dark],
    [0, 0.17, 0.34, 0.15, inked], [0.29, 0.16, 0.41, 0.13, palette.surface],
    [0.70, 0.22, 0.30, 0.38, fine], [0.88, 0.25, 0.12, 0.17, coarse],
    [0.06, 0.37, 0.58, 0.09, palette.surface], [0, 0.49, 0.54, 0.025, palette.line],
    [0, 0.58, 0.31, 0.19, inked], [0.17, 0.54, 0.55, 0.28, light],
    [0.42, 0.66, 0.43, 0.22, mist], [0.76, 0.65, 0.24, 0.17, palette.guide],
    [0.04, 0.78, 0.43, 0.22, fine], [0, 0.86, 0.25, 0.14, palette.surface],
    [0.43, 0.89, 0.57, 0.11, dark], [0.83, 0.88, 0.17, 0.12, coarse],
  ];
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, w, h);
  for (const [x, y, width, height, tone] of patches) {
    ctx.fillStyle = tone;
    ctx.fillRect(Math.round(x * w), Math.round(y * h), Math.ceil(width * w), Math.ceil(height * h));
  }
}

function printFragments(ctx, c, seed, w, h) {
  const fragments = [
    [0.03, 0.04, 0.22, 0.09, c.sunken],
    [0.49, 0.03, 0.49, 0.16, c.guide],
    [0.28, 0.12, 0.48, 0.13, c.strong],
    [0.08, 0.385, 0.25, 0.065, c.line],
    [0.175, 0.55, 0.52, 0.28, c.sunken],
    [0.65, 0.84, 0.26, 0.09, c.soft],
  ];
  ctx.font = `11px ${c.font}`;
  ctx.textBaseline = 'top';
  for (const [u, v, width, height, color] of fragments) {
    const left = Math.round(u * w);
    const top = Math.round(v * h);
    const columns = Math.floor(width * w / 7);
    const rows = Math.floor(height * h / 12);
    ctx.fillStyle = color;
    for (let row = 0; row < rows; row++) {
      const wave = Math.round(11 * Math.sin(row * 0.7 + u * 14));
      let text = '';
      for (let col = 0; col < columns; col++) {
        const value = sample(seed, top * 231 + row * 619 + col);
        text += value < 0.15 ? ' ' : glyph(value);
      }
      ctx.globalAlpha = 0.5 + sample(seed, row + left * 23) * 0.45;
      ctx.fillText(text, left + wave, top + row * 12);
    }
  }
  ctx.globalAlpha = 1;
}

function scanLines(ctx, c, seed, w, h) {
  const tones = [c.sunken, c.sunken, c.line, c.guide, c.soft, c.strong];
  const density = Math.ceil(h / 2.7);
  for (let i = 0; i < density; i++) {
    const value = sample(seed, i);
    const v = i / density;
    if (v > 0.32 && v < 0.51 && value < 0.91) continue;
    const y = Math.floor(v * h);
    const length = sample(seed, i + 1200);
    const origin = Math.sin(i * 0.08) * 0.10 + 0.15;
    const x = Math.round((origin + 0.78 * value ** 2) * w - w * 0.15);
    ctx.fillStyle = tones[Math.floor(sample(seed, i + 2400) * tones.length)];
    ctx.globalAlpha = 0.16 + 0.64 * sample(seed, i + 3600);
    ctx.fillRect(x, y, Math.round(w * (0.012 + 0.47 * length ** 2)), 1 + Math.floor(value ** 3 * 2));
  }

  // Des aplats prolongent la déchirure sans occulter la trame qui l'entoure.
  for (let i = 0; i < 31; i++) {
    const v = sample(seed, i + 4000);
    const amount = sample(seed, i + 4200);
    const y = Math.round((0.51 + v * 0.27) * h);
    const x = Math.round((v * 0.53 + amount * 0.34 - 0.2) * w);
    ctx.fillStyle = tones[Math.floor(sample(seed, i + 4400) * tones.length)];
    ctx.globalAlpha = 0.68 + amount * 0.32;
    ctx.fillRect(x, y, Math.round((0.025 + 0.37 * amount) * w), 1 + Math.floor(amount ** 2 * 8));
  }
  ctx.globalAlpha = 1;
}

function brouillage(random) {
  const seed = random() * UINT_RANGE >>> 0;
  const strips = Array.from({ length: 24 }, (_, index) => ({
    y: (sample(seed, index * 17) - 0.5) * 0.30,
    width: 0.14 + sample(seed, index * 47 + 2) * 0.54,
    x: sample(seed, index * 31 + 17),
    size: sample(seed, index * 53 + 39) ** 2,
  }));
  let w, h, plate, scaleX, scaleY, bands = 0;

  return {
    layout(ctx, width, height, c) {
      w = width;
      h = height;
      plate = ctx.canvas;
      scaleX = plate.width / w;
      scaleY = plate.height / h;
      noiseBands(ctx, c, seed, w, h);
      printFragments(ctx, c, seed, w, h);
      scanLines(ctx, c, seed, w, h);
    },
    frameKey: time => Math.floor(time * 18),
    draw(ctx, time, c) {
      const center = h * (0.59 + 0.17 * Math.sin(time * 0.38));
      const direction = Math.sin(time * 0.79);
      const count = 7 + Math.floor(8 * (1 + Math.sin(time * 0.54)));
      bands = 0;
      ctx.imageSmoothingEnabled = false;
      for (let i = 0; i < count; i++) {
        const strip = strips[i];
        const y = Math.floor(center + strip.y * h);
        const offset = Math.round((0.3 + strip.x * 0.7) * w * (i % 7 === 0 ? 0.085 : 0.025) * direction);
        if (!offset) continue;
        bands++;
        const height = Math.min(h - y, 1 + Math.floor(strip.size * Math.max(3, h * 0.014)));
        const width = Math.floor(w * strip.width);
        const x = Math.floor((w - width) * strip.x);
        ctx.drawImage(plate, x * scaleX, y * scaleY, width * scaleX, height * scaleY,
          x + offset, y, width, height);
        ctx.fillStyle = i % 7 === 0 ? c.guide : c.sunken;
        ctx.fillRect(offset < 0 ? x + width + offset : x, y, Math.abs(offset), height);
      }
      const marker = Math.round(center) - 1;
      ctx.fillStyle = c.signal;
      ctx.fillRect(w - 26, marker, 18, 2);
    },
    readout: () => `${bands} bandes décalées`,
  };
}

function squareTree(seed, index, x, y, size, depth, maxDepth, density) {
  const value = sample(seed, index * 43);
  const phase = sample(seed, index * 47 + 7);
  const tone = sample(seed, index * 59 + 13);
  const cell = { x, y, size, depth, phase, tone, children: null };
  if (depth < maxDepth && (depth === 0 || value < density - depth * 0.04)) {
    const half = size / 2;
    cell.children = [0, 1, 2, 3].map(i => squareTree(seed, index * 4 + i + 1,
      x + (i % 2) * half, y + Math.floor(i / 2) * half, half, depth + 1, maxDepth, density));
  }
  return cell;
}

function drawSquare(ctx, cell, tones, wave, bounds, fixed = false) {
  const { x, y, size, depth, phase, tone, children } = cell;
  const boundary = Math.sin(wave - x / bounds.width * TAU - y / bounds.height * 2.4 + phase);
  if (children && size >= 4 && (fixed || boundary + phase * 0.82 > depth * 0.18 - 0.55)) {
    let leaves = 0;
    for (const child of children) leaves += drawSquare(ctx, child, tones, wave, bounds, fixed);
    return leaves;
  }
  const left = Math.round(bounds.x + x);
  const top = Math.round(bounds.y + y);
  const width = Math.round(bounds.x + x + size) - left - 1;
  const height = Math.round(bounds.y + y + size) - top - 1;
  ctx.fillStyle = tones[Math.floor(tone * tones.length)];
  ctx.fillRect(left, top, width, height);
  return 1;
}

function mosaique(random) {
  const seed = random() * UINT_RANGE >>> 0;
  let board, squares, texture, fixedCount, count = 0;

  return {
    layout(ctx, w, h, c) {
      const margin = Math.max(8, Math.floor(Math.min(w, h) * 0.04));
      const cols = w >= h * 1.35 ? 4 : 2;
      const size = Math.max(16, Math.floor(Math.min((w - margin * 2) / cols, h * 0.39)));
      const width = cols * size;
      board = { x: Math.max(margin, Math.floor((w - width) * 0.18)), y: margin, width, height: size * 2 };
      squares = [];
      fixedCount = 0;
      texture = noiseTile(ctx, seed, c.sunken, null, 0.52, 1);
      ctx.fillStyle = c.panel;
      ctx.fillRect(0, 0, w, h);
      const coarse = [c.strong, c.soft, c.strong, c.strong, c.soft, c.strong];
      for (let col = 0; col < cols; col++) {
        const x = col * size;
        if (col === 0) {
          const upper = squareTree(seed, 512, x, 0, size, 0, 2, 0.12);
          fixedCount += drawSquare(ctx, upper, coarse, 0, board, true);
        } else if (cols === 4 && col === 2) {
          ctx.fillStyle = c.strong;
          ctx.fillRect(board.x + x, board.y, size * 2 - 1, size - 1);
          fixedCount++;
        } else if (cols === 2 || col === 1) {
          ctx.fillStyle = c.strong;
          ctx.fillRect(board.x + x, board.y, size - 1, size - 1);
          fixedCount++;
        }
        // Des profondeurs voisines différentes laissent des réserves dans le bas.
        const density = 0.71 + 0.25 * sample(seed, col + 31);
        squares.push(squareTree(seed, 1024 + col, x, size, size, 0, 5, density));
      }
      ctx.fillStyle = texture;
      ctx.globalAlpha = 0.13;
      ctx.fillRect(board.x, board.y, board.width - 1, size - 1);
      ctx.globalAlpha = 1;
    },
    frameKey: time => Math.floor(time * 12),
    draw(ctx, time, c) {
      const fine = [c.panel, c.panel, c.soft, c.strong, c.strong, c.strong, c.strong, c.guide, c.soft];
      count = fixedCount;
      for (const cell of squares) {
        count += drawSquare(ctx, cell, fine, time * 0.38, board);
      }
      ctx.fillStyle = texture;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(board.x, board.y + board.height / 2, board.width - 1, board.height / 2 - 1);
      ctx.globalAlpha = 1;
      const x = board.x + Math.round((board.width - 1) * (1 + Math.sin(time * 0.38)) / 2);
      ctx.fillStyle = c.signal;
      ctx.fillRect(x, board.y + board.height + 7, 2, 5);
    },
    readout: () => `${count} pavés`,
  };
}

function transmission(random) {
  const seed = random() * UINT_RANGE >>> 0;
  const fields = [
    [0.03, 0.04, 0.48, 0.29, 0.19], [0.60, 0.06, 0.39, 0.25, 0.30],
    [0.22, 0.30, 0.42, 0.19, 0.33], [0.71, 0.37, 0.29, 0.19, 0.36],
    [0.01, 0.54, 0.35, 0.22, 0.18], [0.47, 0.63, 0.42, 0.24, 0.29],
    [0.09, 0.85, 0.56, 0.15, 0.24], [0.80, 0.83, 0.20, 0.16, 0.22],
  ];
  const impressions = [
    [0.13, 0.16, 0.20, 0.14, 0.0], [0.66, 0.14, 0.22, 0.13, 0.65],
    [0.31, 0.36, 0.25, 0.09, 2.9], [0.77, 0.43, 0.18, 0.11, 1.8],
    [0.11, 0.58, 0.18, 0.16, 0.45], [0.55, 0.67, 0.28, 0.13, 3.15],
    [0.23, 0.88, 0.19, 0.09, 1.9],
  ];
  const lineHeight = 14;
  const fontSize = 12;
  let pitch, cols, rows, paper, ink, tones, texture, patches, changed = 0;

  function print(ctx, col, row, color, shift = 0) {
    const type = sample(seed, row * 1201 + col);
    ctx.fillStyle = color;
    ctx.fillText(PRINT_GLYPHS[Math.floor(type * PRINT_GLYPHS.length)], col * pitch + shift, row * lineHeight);
  }

  return {
    layout(ctx, w, h, c) {
      ctx.font = `${fontSize}px ${c.font}`;
      ctx.textBaseline = 'top';
      pitch = Math.ceil(ctx.measureText('M').width + 0.4);
      cols = Math.floor(w / pitch);
      rows = Math.floor(h / lineHeight);
      paper = c.sunken;
      ink = c.soft;
      tones = [c.faint, c.line, c.guide, c.soft];
      texture = noiseTile(ctx, seed + 13, c.guide, null, 0.33, 1);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = texture;
      ctx.globalAlpha = 0.10;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      for (let row = 0; row < rows; row++) {
        const v = row / rows;
        for (let col = 0; col < cols; col++) {
          const u = col / cols;
          const value = sample(seed, row * 1013 + col + 91);
          let exposure = 0.12 + 0.15 * Math.sin(u * 10 + v * 3) * Math.cos(v * 13 - u * 4);
          for (const [x, y, width, height, strength] of fields) {
            const edge = Math.min((u - x) / width, (x + width - u) / width, (v - y) / height, (y + height - v) / height);
            exposure += strength * Math.max(0, Math.min(1, edge * 7));
          }
          const reserve = (u > 0.38 && u < 0.68 && v > 0.49 && v < 0.57) || (u < 0.28 && v > 0.76 && v < 0.82);
          if (value + exposure < (reserve ? 0.84 : 0.49)) continue;
          const shift = row % 9 < 3 ? 1 : 0;
          if (value > 0.993 && exposure > 0.29) {
            ctx.fillStyle = c.guide;
            ctx.fillRect(col * pitch + shift, row * lineHeight + 2, Math.max(2, pitch - 2), lineHeight - 4);
          } else print(ctx, col, row, tones[Math.min(3, Math.floor(exposure * 4.8 + value * 1.18))], shift);
        }
      }
      patches = impressions.map(([u, v, width, height, phase]) => ({
        col: Math.floor(u * cols), row: Math.floor(v * rows),
        columns: Math.max(1, Math.floor(width * cols)), lines: Math.max(1, Math.floor(height * rows)), phase,
      }));
    },
    frameKey: time => Math.floor(time * 12),
    draw(ctx, time, c) {
      ctx.font = `${fontSize}px ${c.font}`;
      ctx.textBaseline = 'top';
      changed = 0;
      let marked = false;
      for (const patch of patches) {
        const pressure = Math.max(0, Math.sin(time * 0.55 + patch.phase) - 0.22) / 0.78;
        const reach = Math.round(patch.columns * pressure);
        if (reach < 2) continue;
        changed++;
        for (let i = 0; i < patch.lines; i++) {
          const row = patch.row + i;
          const inset = (i * 3) % 5;
          const end = Math.min(cols, patch.col + reach - inset);
          if (end <= patch.col + inset) continue;
          for (let col = patch.col + inset; col < end; col++) {
            const value = sample(seed, row * 1013 + col + 91);
            if (value > 0.26) print(ctx, col, row, value > 0.91 ? c.strong : ink, i % 4 === 0 ? 1 : 0);
          }
        }
        if (!marked && pressure > 0.65) {
          ctx.fillStyle = c.signal;
          ctx.fillRect((patch.col + reach - 1) * pitch, patch.row * lineHeight + 2, 2, lineHeight - 4);
          marked = true;
        }
      }
    },
    readout: () => `${cols} × ${rows} caractères · ${changed} empreinte${changed === 1 ? '' : 's'}`,
  };
}
