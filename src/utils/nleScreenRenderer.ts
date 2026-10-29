import * as THREE from 'three';
import {
  drawSceneArtwork,
  getProceduralSceneCanvas,
  PreviewSceneId,
} from './proceduralMedia';

export interface NLEScreenController {
  texture: THREE.CanvasTexture;
  /**
   * Renders the NLE workspace canvas.
   * Drawn once at initialization (and if a custom image finishes loading)
   * so scrolling never triggers expensive per-frame 1600x1000 GPU texture uploads or flicker.
   */
  update: (
    openingProgress: number,
    zoomProgress: number,
    playheadNorm: number,
    customImage?: HTMLImageElement | null
  ) => void;
  dispose: () => void;
}

const PREVIEW_SCENES: { id: PreviewSceneId; label: string; tc: string; color: string }[] = [
  { id: 'landscape', label: '01_ANAMORPHIC_RIDGE.MOV', tc: '00:00:12:04', color: '#7c3aed' },
  { id: 'product', label: '02_CHRONO_MACRO_RAW.R3D', tc: '00:00:28:19', color: '#4f46e5' },
  { id: 'city', label: '03_NEO_NOIR_RAIN_4K.MOV', tc: '00:00:44:08', color: '#0891b2' },
  { id: 'ad', label: '04_ATELIER_COMMERCIAL.MP4', tc: '00:01:02:15', color: '#db2777' },
  { id: 'colorgrade', label: '05_FINAL_ACES_GRADE.DPX', tc: '00:01:19:22', color: '#f59e0b' },
];

/**
 * Creates a rock-solid, flicker-free (1600x1000, 16:10 MacBook Pro aspect ratio)
 * procedural NLE Video Editing Workspace texture mapped to the laptop display.
 */
export function createNLEScreenController(
  renderer: THREE.WebGLRenderer
): NLEScreenController {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // Disable mipmap LOD switching to prevent shimmer/flicker when tilting or zooming the screen
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const thumbCanvases = PREVIEW_SCENES.map((s) =>
    getProceduralSceneCanvas(s.id, 320, 180)
  );

  const waveformSamples: number[] = [];
  for (let i = 0; i < 160; i++) {
    const v =
      0.25 +
      Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.19)) * 0.72;
    waveformSamples.push(v);
  }

  let hasRenderedStatic = false;
  let hasRenderedCustomImg = false;

  function drawColorWheel(
    cx: number,
    cy: number,
    radius: number,
    label: string,
    tintAngle: number
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0d16';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2d2d44';
    ctx.stroke();

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 0.85);
    grad.addColorStop(0, 'rgba(255,255,255,0.16)');
    grad.addColorStop(0.6, 'rgba(139, 92, 246, 0.24)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.7, cy);
    ctx.lineTo(cx + radius * 0.7, cy);
    ctx.moveTo(cx, cy - radius * 0.7);
    ctx.lineTo(cx, cy + radius * 0.7);
    ctx.stroke();

    const px = cx + Math.cos(tintAngle) * (radius * 0.25);
    const py = cy + Math.sin(tintAngle) * (radius * 0.25);
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c4b5fd';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + radius + 16);
    ctx.restore();
  }

  function renderWorkspace(customImage?: HTMLImageElement | null) {
    ctx.save();

    // Base dark workspace canvas
    ctx.fillStyle = '#090910';
    ctx.fillRect(0, 0, width, height);

    const activeIdx = 0;
    const activeScene = PREVIEW_SCENES[activeIdx];

    // 1. TOP APPLICATION HEADER BAR (y: 0..38)
    ctx.fillStyle = '#10101c';
    ctx.fillRect(0, 0, width, 38);
    ctx.strokeStyle = '#1f1f35';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 38);
    ctx.lineTo(width, 38);
    ctx.stroke();

    const dotColors = ['#ef4444', '#f59e0b', '#10b981'];
    dotColors.forEach((c, idx) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(22 + idx * 18, 19, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('YASHWANTH STUDIO PRO — NLE MASTER WORKSPACE', 88, 24);

    const modes = ['ASSEMBLY', 'EDIT', 'COLOR GRADE', 'AUDIO VFX', 'DELIVER'];
    modes.forEach((m, idx) => {
      const tx = 580 + idx * 102;
      const isActive = idx === 1 || idx === 2;
      if (isActive) {
        ctx.fillStyle = idx === 1 ? 'rgba(124, 58, 237, 0.28)' : 'rgba(79, 70, 229, 0.18)';
        ctx.fillRect(tx - 10, 7, 88, 24);
      }
      ctx.fillStyle = isActive ? '#ddd6fe' : '#64748b';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(m, tx, 23);
    });

    ctx.fillStyle = '#a78bfa';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('GPU ACCELERATED · ACEScct 4K 60FPS', width - 265, 23);

    // 2. LEFT PANEL — MEDIA BROWSER & PROJECT BIN (x: 10..350, y: 48..545)
    ctx.fillStyle = '#0d0d17';
    ctx.fillRect(10, 48, 340, 497);
    ctx.strokeStyle = '#1e1e32';
    ctx.strokeRect(10, 48, 340, 497);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('PROJECT MEDIA BIN (05 CLIPS)', 24, 72);

    PREVIEW_SCENES.forEach((scene, idx) => {
      const rowY = 88 + idx * 88;
      const isSelected = idx === activeIdx;

      ctx.fillStyle = isSelected ? 'rgba(124, 58, 237, 0.22)' : '#131322';
      ctx.fillRect(20, rowY, 320, 78);
      ctx.strokeStyle = isSelected ? '#8b5cf6' : '#222238';
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.strokeRect(20, rowY, 320, 78);

      ctx.drawImage(thumbCanvases[idx], 28, rowY + 8, 110, 62);

      ctx.fillStyle = isSelected ? '#f8fafc' : '#cbd5e1';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(scene.label, 148, rowY + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 10px "JetBrains Mono", monospace';
      ctx.fillText(`IN ${scene.tc} · 4096×2160`, 148, rowY + 45);

      ctx.fillStyle = scene.color;
      ctx.fillRect(148, rowY + 56, 56, 6);
    });

    // 3. CENTER PANEL — LARGE PROGRAM MONITOR (x: 360..1210, y: 48..545)
    const monX = 360;
    const monY = 48;
    const monW = 850;
    const monH = 497;

    ctx.fillStyle = '#07070c';
    ctx.fillRect(monX, monY, monW, monH);
    ctx.strokeStyle = '#26263f';
    ctx.strokeRect(monX, monY, monW, monH);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText(`PROGRAM MONITOR · ${activeScene.label}`, monX + 18, monY + 24);

    ctx.fillStyle = '#c084fc';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('01:04:18:12', monX + monW - 125, monY + 24);

    const vidX = monX + 20;
    const vidY = monY + 36;
    const vidW = monW - 40;
    const vidH = 410;

    ctx.save();
    ctx.beginPath();
    ctx.rect(vidX, vidY, vidW, vidH);
    ctx.clip();

    if (customImage && customImage.complete && customImage.naturalWidth > 0) {
      ctx.drawImage(customImage, vidX, vidY, vidW, vidH);
    } else {
      ctx.translate(vidX, vidY);
      drawSceneArtwork(ctx, vidW, vidH, activeScene.id, 1.8);
      ctx.translate(-vidX, -vidY);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vidX + 36, vidY + 24, vidW - 72, vidH - 48);

    ctx.fillStyle = 'rgba(5, 5, 10, 0.76)';
    ctx.fillRect(vidX + 48, vidY + vidH - 86, 360, 48);
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
    ctx.strokeRect(vidX + 48, vidY + vidH - 86, 360, 48);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 15px Outfit, sans-serif';
    ctx.fillText('YASHWANTH CHELLUBOINA · SHOWREEL MASTER', vidX + 62, vidY + vidH - 62);
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('AI PROMPT ENGINEERING · CINEMATIC EDITING · COLOR', vidX + 62, vidY + vidH - 46);

    ctx.restore();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('FIT 100%   |   REC.709 / ACES   |   ◄◄   ►   ►►   |   MARK IN / OUT', monX + 240, monY + 474);

    // 4. RIGHT PANEL — COLOR GRADING & LUMETRI SCOPES (x: 1220..1590, y: 48..545)
    const colX = 1220;
    const colY = 48;
    const colW = 370;
    const colH = 497;

    ctx.fillStyle = '#0d0d17';
    ctx.fillRect(colX, colY, colW, colH);
    ctx.strokeStyle = '#1e1e32';
    ctx.strokeRect(colX, colY, colW, colH);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText('COLOR GRADING & LUMETRI WHEELS', colX + 18, colY + 24);

    drawColorWheel(colX + 68, colY + 104, 42, 'LIFT (SHADOWS)', 3.8);
    drawColorWheel(colX + 185, colY + 104, 42, 'GAMMA (MIDS)', 5.2);
    drawColorWheel(colX + 302, colY + 104, 42, 'GAIN (HIGHLIGHTS)', 0.9);

    const sliders = [
      { name: 'COLOR TEMP', val: '-140K', pos: 0.42 },
      { name: 'MAGENTA TINT', val: '+18.5', pos: 0.68 },
      { name: 'CONTRAST', val: '+24.0', pos: 0.74 },
      { name: 'FILM HALATION', val: '32%', pos: 0.52 },
      { name: 'SATURATION', val: '108%', pos: 0.61 },
    ];
    sliders.forEach((s, idx) => {
      const sy = colY + 195 + idx * 34;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText(s.name, colX + 20, sy);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(s.val, colX + colW - 58, sy);

      ctx.fillStyle = '#1e1e32';
      ctx.fillRect(colX + 120, sy - 7, 175, 5);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(colX + 120, sy - 7, 175 * s.pos, 5);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(colX + 120 + 175 * s.pos, sy - 4.5, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    const scopeY = colY + 372;
    ctx.fillStyle = '#06060b';
    ctx.fillRect(colX + 18, scopeY, colW - 36, 108);
    ctx.strokeStyle = '#222238';
    ctx.strokeRect(colX + 18, scopeY, colW - 36, 108);

    const paradeColors = ['rgba(239,68,68,0.55)', 'rgba(34,197,94,0.55)', 'rgba(59,130,246,0.65)'];
    paradeColors.forEach((pc, cIdx) => {
      ctx.strokeStyle = pc;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const baseX = colX + 28 + cIdx * 108;
      for (let x = 0; x < 96; x += 3) {
        const wave =
          Math.sin((x + cIdx * 19) * 0.14 + 1.2) * 24 +
          Math.cos(x * 0.31) * 14;
        const py = scopeY + 54 + wave;
        if (x === 0) ctx.moveTo(baseX + x, py);
        else ctx.lineTo(baseX + x, py);
      }
      ctx.stroke();
    });

    // 5. BOTTOM PANEL — MULTI-TRACK TIMELINE & AUDIO WAVEFORMS (x: 10..1590, y: 555..990)
    const tlX = 10;
    const tlY = 555;
    const tlW = 1580;
    const tlH = 435;

    ctx.fillStyle = '#0b0b14';
    ctx.fillRect(tlX, tlY, tlW, tlH);
    ctx.strokeStyle = '#1f1f35';
    ctx.strokeRect(tlX, tlY, tlW, tlH);

    ctx.fillStyle = '#121222';
    ctx.fillRect(tlX, tlY, tlW, 40);

    const tools = ['[V] SELECT', '[C] RAZOR', '[Y] SLIP', '[P] PEN', '[S] SNAP ON', 'LINKED'];
    tools.forEach((t, i) => {
      ctx.fillStyle = i === 0 || i === 4 ? '#c4b5fd' : '#64748b';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(t, tlX + 18 + i * 95, tlY + 25);
    });

    const trackStartX = 210;
    const trackEndX = 1500;
    const trackSpanW = trackEndX - trackStartX;

    ctx.strokeStyle = '#334155';
    ctx.fillStyle = '#64748b';
    ctx.font = '500 10px "JetBrains Mono", monospace';
    for (let t = 0; t <= 12; t++) {
      const tx = trackStartX + (t / 12) * trackSpanW;
      ctx.beginPath();
      ctx.moveTo(tx, tlY + 26);
      ctx.lineTo(tx, tlY + 40);
      ctx.stroke();
      ctx.fillText(`00:0${Math.floor(t / 10)}:${String((t * 7) % 60).padStart(2, '0')}:00`, tx + 4, tlY + 22);
    }

    const videoTracks = [
      {
        id: 'V3 · LUT & GRADE',
        y: tlY + 48,
        h: 48,
        clips: [
          { start: 0.0, len: 0.44, name: 'ACES_CINEMA_LUT_V2.CUBE', color: '#6d28d9' },
          { start: 0.46, len: 0.52, name: 'HALATION_GLOW_PASS.ADJ', color: '#7e22ce' },
        ],
      },
      {
        id: 'V2 · VFX & TITLES',
        y: tlY + 102,
        h: 48,
        clips: [
          { start: 0.04, len: 0.24, name: 'INTRO_3D_CAMERA_TRACK.COMP', color: '#4338ca' },
          { start: 0.34, len: 0.28, name: 'SPEED_RAMP_OPTICAL_FLOW', color: '#0e7490' },
          { start: 0.66, len: 0.28, name: 'EDITORIAL_TYPOGRAPHY_LOWER', color: '#be185d' },
        ],
      },
      {
        id: 'V1 · MASTER CUT',
        y: tlY + 156,
        h: 58,
        clips: [
          { start: 0.0, len: 0.2, name: '01_ANAMORPHIC_RIDGE.MOV', color: '#7c3aed' },
          { start: 0.2, len: 0.2, name: '02_CHRONO_MACRO_RAW.R3D', color: '#4f46e5' },
          { start: 0.4, len: 0.2, name: '03_NEO_NOIR_RAIN_4K.MOV', color: '#0891b2' },
          { start: 0.6, len: 0.2, name: '04_ATELIER_COMMERCIAL.MP4', color: '#db2777' },
          { start: 0.8, len: 0.19, name: '05_FINAL_ACES_GRADE.DPX', color: '#d97706' },
        ],
      },
    ];

    videoTracks.forEach((vt) => {
      ctx.fillStyle = '#111120';
      ctx.fillRect(tlX + 6, vt.y, 196, vt.h);
      ctx.strokeStyle = '#222238';
      ctx.strokeRect(tlX + 6, vt.y, 196, vt.h);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(vt.id, tlX + 20, vt.y + vt.h * 0.58);

      ctx.fillStyle = '#080811';
      ctx.fillRect(trackStartX, vt.y, trackSpanW, vt.h);
      ctx.strokeStyle = '#19192b';
      ctx.strokeRect(trackStartX, vt.y, trackSpanW, vt.h);

      vt.clips.forEach((clip) => {
        const cx = trackStartX + clip.start * trackSpanW + 2;
        const cw = clip.len * trackSpanW - 4;
        ctx.fillStyle = clip.color;
        ctx.fillRect(cx, vt.y + 4, cw, vt.h - 8);

        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(cx, vt.y + 4, cw, 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillText(clip.name, cx + 10, vt.y + vt.h * 0.62);
      });
    });

    const audioTracks = [
      { id: 'A1 · VOICEOVER', y: tlY + 224, h: 58, color: '#10b981', seed: 1 },
      { id: 'A2 · SFX & RISERS', y: tlY + 288, h: 58, color: '#06b6d4', seed: 7 },
      { id: 'A3 · CINEMA SCORE', y: tlY + 352, h: 66, color: '#a855f7', seed: 13 },
    ];

    audioTracks.forEach((at) => {
      ctx.fillStyle = '#111120';
      ctx.fillRect(tlX + 6, at.y, 196, at.h);
      ctx.strokeStyle = '#222238';
      ctx.strokeRect(tlX + 6, at.y, 196, at.h);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(at.id, tlX + 20, at.y + at.h * 0.56);

      ctx.fillStyle = '#070b12';
      ctx.fillRect(trackStartX, at.y, trackSpanW, at.h);
      ctx.strokeStyle = '#192231';
      ctx.strokeRect(trackStartX, at.y, trackSpanW, vtH(at));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(trackStartX + 4, at.y + 4, trackSpanW - 8, at.h - 8);

      const midY = at.y + at.h * 0.5;
      const maxAmp = (at.h - 14) * 0.48;
      ctx.fillStyle = at.color;
      for (let i = 0; i < waveformSamples.length; i++) {
        const sample = waveformSamples[(i + at.seed * 11) % waveformSamples.length];
        const wx = trackStartX + 12 + (i / waveformSamples.length) * (trackSpanW - 24);
        const wh = Math.max(3, sample * maxAmp);
        ctx.fillRect(wx, midY - wh, 4, wh * 2);
      }
    });

    const meterX = 1515;
    const meterY = tlY + 48;
    const meterH = 370;
    ctx.fillStyle = '#07070d';
    ctx.fillRect(meterX, meterY, 64, meterH);
    ctx.strokeStyle = '#222238';
    ctx.strokeRect(meterX, meterY, 64, meterH);

    const segs = 28;
    for (let s = 0; s < segs; s++) {
      const norm = s / segs;
      const sy = meterY + meterH - 14 - s * 12;
      const isLit = norm <= 0.76;
      ctx.fillStyle = !isLit
        ? '#161626'
        : norm > 0.85
          ? '#ef4444'
          : norm > 0.68
            ? '#f59e0b'
            : '#10b981';
      ctx.fillRect(meterX + 12, sy, 16, 8);
      ctx.fillRect(meterX + 34, sy, 16, 8);
    }

    // 6. ACTIVE TIMELINE PLAYHEAD
    const playheadX = trackStartX + 0.32 * trackSpanW;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, tlY + 26);
    ctx.lineTo(playheadX, tlY + tlH - 8);
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(playheadX - 8, tlY + 14);
    ctx.lineTo(playheadX + 8, tlY + 14);
    ctx.lineTo(playheadX + 8, tlY + 24);
    ctx.lineTo(playheadX, tlY + 32);
    ctx.lineTo(playheadX - 8, tlY + 24);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    texture.needsUpdate = true;
  }

  function update(
    _openingProgress: number,
    _zoomProgress: number,
    _playheadNorm: number,
    customImage?: HTMLImageElement | null
  ) {
    const customReady = Boolean(
      customImage && customImage.complete && customImage.naturalWidth > 0
    );
    if (!hasRenderedStatic || (customReady && !hasRenderedCustomImg)) {
      hasRenderedStatic = true;
      if (customReady) hasRenderedCustomImg = true;
      renderWorkspace(customImage);
    }
  }

  // Initial static render
  update(1, 0, 0.18);

  return {
    texture,
    update,
    dispose: () => {
      texture.dispose();
    },
  };
}

function vtH(at: { h: number }): number {
  return at.h;
}
