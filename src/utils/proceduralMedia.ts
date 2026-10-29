/**
 * Procedural Media & Zero-404 Asset Generator
 * Generates high-resolution, legally usable studio visuals and playable video streams
 * when custom media URLs in `src/data/projects.ts` are not yet replaced.
 */

export type PreviewSceneId =
  | 'landscape'
  | 'product'
  | 'city'
  | 'ad'
  | 'colorgrade'
  | 'photo-chiaroscuro'
  | 'photo-obsidian'
  | 'photo-cyberpunk'
  | 'design-solstice'
  | 'design-kinetic'
  | 'design-monolith'
  | 'showreel-poster';

const textureCache = new Map<string, string>();
const canvasCache = new Map<string, HTMLCanvasElement>();

/**
 * Draws one of the bespoke cinematic frames onto a 2D canvas context.
 */
export function drawSceneArtwork(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneId: PreviewSceneId,
  timeSec = 0
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (sceneId === 'landscape' || sceneId === 'showreel-poster') {
    // 1. Cinematic landscape footage — Anamorphic twilight mountain ridge with volumetric mist
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#060411');
    skyGrad.addColorStop(0.42, '#1d1038');
    skyGrad.addColorStop(0.68, '#532578');
    skyGrad.addColorStop(0.85, '#c25953');
    skyGrad.addColorStop(1, '#120b1d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Anamorphic sun/moon glow
    const sunX = width * 0.56 + Math.sin(timeSec * 0.4) * (width * 0.02);
    const sunY = height * 0.52;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, width * 0.36);
    sunGlow.addColorStop(0, 'rgba(255, 226, 180, 0.92)');
    sunGlow.addColorStop(0.25, 'rgba(232, 121, 249, 0.42)');
    sunGlow.addColorStop(0.6, 'rgba(109, 40, 217, 0.14)');
    sunGlow.addColorStop(1, 'rgba(6, 4, 17, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, width, height);

    // Horizontal anamorphic lens flare streak
    const streakGrad = ctx.createLinearGradient(0, sunY, width, sunY);
    streakGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
    streakGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.35)');
    streakGrad.addColorStop(0.56, 'rgba(255, 245, 235, 0.78)');
    streakGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.35)');
    streakGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(0, sunY - 2, width, 4);

    // Layered mountain ridges
    const layers = [
      { yBase: 0.62, amp: 0.11, freq: 0.0045, seed: 1.2, color: '#1b1130' },
      { yBase: 0.72, amp: 0.08, freq: 0.006, seed: 2.8, color: '#110a20' },
      { yBase: 0.82, amp: 0.055, freq: 0.008, seed: 4.5, color: '#07040e' },
    ];
    layers.forEach((layer) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 12) {
        const y =
          height * layer.yBase -
          Math.sin(x * layer.freq + layer.seed) * (height * layer.amp) -
          Math.cos(x * layer.freq * 2.3 + layer.seed) * (height * layer.amp * 0.42);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();
    });
  } else if (sceneId === 'product' || sceneId === 'photo-obsidian') {
    // 2. Premium product close-up — Space-black precision chronograph / cinema lens macro
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      width * 0.05,
      width * 0.5,
      height * 0.5,
      width * 0.65
    );
    bgGrad.addColorStop(0, '#1e1b2e');
    bgGrad.addColorStop(0.55, '#0b0914');
    bgGrad.addColorStop(1, '#040308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const r = Math.min(width, height) * 0.34;

    // Rim-lit metallic bezel rings
    for (let i = 4; i >= 0; i--) {
      const ringR = r * (1 - i * 0.12);
      const ringGrad = ctx.createLinearGradient(cx - ringR, cy - ringR, cx + ringR, cy + ringR);
      ringGrad.addColorStop(0, '#a78bfa');
      ringGrad.addColorStop(0.25, '#27273a');
      ringGrad.addColorStop(0.55, '#090910');
      ringGrad.addColorStop(0.85, '#5b21b6');
      ringGrad.addColorStop(1, '#e9d5ff');

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.fillStyle = '#09090f';
      ctx.fill();
      ctx.lineWidth = Math.max(2, r * 0.035);
      ctx.strokeStyle = ringGrad;
      ctx.stroke();
    }

    // Aperture blades & precision dial ticks
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(timeSec * 0.18);
    for (let t = 0; t < 60; t++) {
      const ang = (t / 60) * Math.PI * 2;
      const isMajor = t % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (r * 0.78), Math.sin(ang) * (r * 0.78));
      ctx.lineTo(
        Math.cos(ang) * (r * (isMajor ? 0.68 : 0.73)),
        Math.sin(ang) * (r * (isMajor ? 0.68 : 0.73))
      );
      ctx.strokeStyle = isMajor ? 'rgba(216, 180, 254, 0.8)' : 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }
    ctx.restore();

    // Optical sapphire coating reflection
    const coatGrad = ctx.createRadialGradient(
      cx - r * 0.22,
      cy - r * 0.22,
      2,
      cx,
      cy,
      r * 0.55
    );
    coatGrad.addColorStop(0, 'rgba(167, 139, 250, 0.45)');
    coatGrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.16)');
    coatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coatGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else if (sceneId === 'city' || sceneId === 'photo-cyberpunk') {
    // 3. Dramatic city scene — Neo-noir rain-slicked metropolis skyline with wet reflections
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#04050c');
    bg.addColorStop(0.55, '#120e29');
    bg.addColorStop(0.75, '#2b124c');
    bg.addColorStop(1, '#05050a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const horizonY = height * 0.66;
    const towerCount = 26;
    for (let i = 0; i < towerCount; i++) {
      const tw = (width / towerCount) * (0.85 + ((i * 7) % 5) * 0.15);
      const tx = (i / towerCount) * width;
      const th = height * (0.16 + ((i * 13) % 11) * 0.036);
      const ty = horizonY - th;

      ctx.fillStyle = i % 2 === 0 ? '#070812' : '#0b0c1b';
      ctx.fillRect(tx, ty, tw, th);

      // Lit architectural strips
      ctx.fillStyle = i % 3 === 0 ? 'rgba(168, 85, 247, 0.55)' : 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(tx + tw * 0.18, ty + 6, 2, th - 12);
    }

    // Wet asphalt reflection streaks below horizon
    const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    roadGrad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
    roadGrad.addColorStop(0.35, 'rgba(15, 23, 42, 0.88)');
    roadGrad.addColorStop(1, '#040409');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Bokeh light trails
    const trailColors = ['#c084fc', '#38bdf8', '#f472b6', '#fbbf24'];
    for (let b = 0; b < 14; b++) {
      const bx = ((b * 97 + timeSec * 22) % width);
      const by = horizonY + ((b * 23) % (height - horizonY - 12));
      ctx.fillStyle = trailColors[b % trailColors.length];
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.ellipse(bx, by, 16, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (
    sceneId === 'ad' ||
    sceneId === 'design-solstice' ||
    sceneId === 'design-kinetic' ||
    sceneId === 'design-monolith'
  ) {
    // 4. Creative advertisement / Graphic design key visual
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#07060d');
    bg.addColorStop(0.5, '#190d33');
    bg.addColorStop(1, '#08060e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Sculptural geometric forms
    const orbX = width * 0.52 + Math.cos(timeSec * 0.6) * (width * 0.03);
    const orbY = height * 0.48;
    const orbR = Math.min(width, height) * 0.28;

    const orbGrad = ctx.createRadialGradient(
      orbX - orbR * 0.3,
      orbY - orbR * 0.3,
      4,
      orbX,
      orbY,
      orbR
    );
    if (sceneId === 'design-kinetic') {
      orbGrad.addColorStop(0, '#f5d0fe');
      orbGrad.addColorStop(0.45, '#9333ea');
      orbGrad.addColorStop(1, '#1e1b4b');
    } else if (sceneId === 'design-monolith') {
      orbGrad.addColorStop(0, '#bae6fd');
      orbGrad.addColorStop(0.45, '#4f46e5');
      orbGrad.addColorStop(1, '#090914');
    } else {
      orbGrad.addColorStop(0, '#fde68a');
      orbGrad.addColorStop(0.4, '#c084fc');
      orbGrad.addColorStop(0.78, '#4c1d95');
      orbGrad.addColorStop(1, '#090612');
    }

    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
    ctx.fill();

    // Precision editorial grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.08, height * 0.12, width * 0.84, height * 0.76);

    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.72);
    ctx.lineTo(width * 0.92, height * 0.72);
    ctx.stroke();

    // Bold editorial typography lockup inside artwork
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = `700 ${Math.round(height * 0.085)}px Outfit, sans-serif`;
    const label =
      sceneId === 'design-solstice'
        ? 'SOLSTICE · XXV'
        : sceneId === 'design-kinetic'
          ? 'KINETIC FORM'
          : sceneId === 'design-monolith'
            ? 'MONOLITH 01'
            : 'ATELIER NOIR';
    ctx.fillText(label, width * 0.12, height * 0.65);

    ctx.fillStyle = 'rgba(196, 181, 253, 0.75)';
    ctx.font = `500 ${Math.round(height * 0.036)}px "JetBrains Mono", monospace`;
    ctx.fillText('CREATIVE DIRECTION · VISUAL SYSTEM', width * 0.12, height * 0.81);
  } else {
    // 5. Final color-graded cinematic shot / Chiaroscuro editorial grade
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#04131d');
    grad.addColorStop(0.45, '#111827');
    grad.addColorStop(0.75, '#3b1548');
    grad.addColorStop(1, '#09050f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Dramatic diagonal window shadow shaft (Chiaroscuro lighting)
    const beamGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.75, height);
    beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.34)');
    beamGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(width * 0.18, 0);
    ctx.lineTo(width * 0.52, 0);
    ctx.lineTo(width * 0.86, height);
    ctx.lineTo(width * 0.42, height);
    ctx.closePath();
    ctx.fill();

    // Silhouette subject contour in golden-ratio position
    const sx = width * 0.54;
    const sy = height * 0.58;
    const sr = Math.min(width, height) * 0.18;
    ctx.fillStyle = '#06070c';
    ctx.beginPath();
    ctx.arc(sx, sy - sr * 0.75, sr * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx, sy + sr * 0.55, sr * 1.05, sr * 0.85, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Rim light edge on silhouette
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(sx, sy - sr * 0.75, sr * 0.48, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  }

  // Widescreen cinema letterbox bars (2.39:1 scope feel)
  const barH = Math.round(height * 0.075);
  ctx.fillStyle = '#030306';
  ctx.fillRect(0, 0, width, barH);
  ctx.fillRect(0, height - barH, width, barH);

  ctx.restore();
}

/**
 * Returns a cached Data URL for any procedural scene artwork so `<img>` tags
 * and posters never break or 404.
 */
export function getProceduralSceneDataUrl(
  sceneId: PreviewSceneId,
  width = 960,
  height = 540
): string {
  const key = `${sceneId}_${width}x${height}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawSceneArtwork(ctx, width, height, sceneId, 1.5);
  }
  const url = canvas.toDataURL('image/jpeg', 0.9);
  textureCache.set(key, url);
  return url;
}

/**
 * Returns a cached HTMLCanvasElement for fast `ctx.drawImage` inside the 3D NLE texture.
 */
export function getProceduralSceneCanvas(
  sceneId: PreviewSceneId,
  width = 640,
  height = 360
): HTMLCanvasElement {
  const key = `${sceneId}_canvas_${width}x${height}`;
  const existing = canvasCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawSceneArtwork(ctx, width, height, sceneId, 1.5);
  }
  canvasCache.set(key, canvas);
  return canvas;
}
