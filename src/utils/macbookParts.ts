import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface KeySpec {
  id: string;
  topLabel?: string;
  mainLabel: string;
  subLabel?: string;
  align?: 'center' | 'left' | 'right' | 'bottom-left' | 'bottom-right';
  isIcon?: boolean;
  isTouchId?: boolean;
  hasHomingBar?: boolean;
  hasStatusDot?: boolean;
  /** Width in relative key units */
  wUnits: number;
  /** Height in relative key units (default 1.0, function row 0.62, half-arrows 0.47) */
  hUnits?: number;
  /** Vertical offset inside row (used for stacked Up/Down arrow keys) */
  zOffsetUnits?: number;
}

/**
 * Complete 78-key MacBook Pro QWERTY layout (Function row + 5 rows including inverted-T arrows)
 */
export const MACBOOK_KEYBOARD_ROWS: {
  rowZ: number;
  rowHeightUnits: number;
  keys: KeySpec[];
}[] = [
  // Row 0: Function Row (14 keys)
  {
    rowZ: -0.79,
    rowHeightUnits: 0.64,
    keys: [
      { id: 'esc', mainLabel: 'esc', align: 'bottom-left', wUnits: 1.48, hUnits: 0.64 },
      { id: 'f1', topLabel: '☀', mainLabel: 'F1', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f2', topLabel: '☼', mainLabel: 'F2', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f3', topLabel: '⊞', mainLabel: 'F3', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f4', topLabel: '⌕', mainLabel: 'F4', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f5', topLabel: '🎙', mainLabel: 'F5', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f6', topLabel: '☾', mainLabel: 'F6', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f7', topLabel: '◄◄', mainLabel: 'F7', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f8', topLabel: '►❚❚', mainLabel: 'F8', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f9', topLabel: '►►', mainLabel: 'F9', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f10', topLabel: '🔇', mainLabel: 'F10', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f11', topLabel: '🔉', mainLabel: 'F11', wUnits: 1.0, hUnits: 0.64 },
      { id: 'f12', topLabel: '🔊', mainLabel: 'F12', wUnits: 1.0, hUnits: 0.64 },
      { id: 'touchid', mainLabel: '', isTouchId: true, wUnits: 1.02, hUnits: 0.64 },
    ],
  },
  // Row 1: Number & Symbol Row (14 keys)
  {
    rowZ: -0.625,
    rowHeightUnits: 0.96,
    keys: [
      { id: 'tilde', topLabel: '~', mainLabel: '`', wUnits: 1.0 },
      { id: 'k1', topLabel: '!', mainLabel: '1', wUnits: 1.0 },
      { id: 'k2', topLabel: '@', mainLabel: '2', wUnits: 1.0 },
      { id: 'k3', topLabel: '#', mainLabel: '3', wUnits: 1.0 },
      { id: 'k4', topLabel: '$', mainLabel: '4', wUnits: 1.0 },
      { id: 'k5', topLabel: '%', mainLabel: '5', wUnits: 1.0 },
      { id: 'k6', topLabel: '^', mainLabel: '6', wUnits: 1.0 },
      { id: 'k7', topLabel: '&', mainLabel: '7', wUnits: 1.0 },
      { id: 'k8', topLabel: '*', mainLabel: '8', wUnits: 1.0 },
      { id: 'k9', topLabel: '(', mainLabel: '9', wUnits: 1.0 },
      { id: 'k0', topLabel: ')', mainLabel: '0', wUnits: 1.0 },
      { id: 'minus', topLabel: '_', mainLabel: '-', wUnits: 1.0 },
      { id: 'equal', topLabel: '+', mainLabel: '=', wUnits: 1.0 },
      { id: 'delete', topLabel: '⌫', mainLabel: 'delete', align: 'bottom-right', wUnits: 1.5 },
    ],
  },
  // Row 2: Top Letter Row QWERTYUIOP (14 keys)
  {
    rowZ: -0.435,
    rowHeightUnits: 0.96,
    keys: [
      { id: 'tab', topLabel: '⇥', mainLabel: 'tab', align: 'bottom-left', wUnits: 1.5 },
      { id: 'q', mainLabel: 'Q', wUnits: 1.0 },
      { id: 'w', mainLabel: 'W', wUnits: 1.0 },
      { id: 'e', mainLabel: 'E', wUnits: 1.0 },
      { id: 'r', mainLabel: 'R', wUnits: 1.0 },
      { id: 't', mainLabel: 'T', wUnits: 1.0 },
      { id: 'y', mainLabel: 'Y', wUnits: 1.0 },
      { id: 'u', mainLabel: 'U', wUnits: 1.0 },
      { id: 'i', mainLabel: 'I', wUnits: 1.0 },
      { id: 'o', mainLabel: 'O', wUnits: 1.0 },
      { id: 'p', mainLabel: 'P', wUnits: 1.0 },
      { id: 'lbrack', topLabel: '{', mainLabel: '[', wUnits: 1.0 },
      { id: 'rbrack', topLabel: '}', mainLabel: ']', wUnits: 1.0 },
      { id: 'bslash', topLabel: '|', mainLabel: '\\', wUnits: 1.0 },
    ],
  },
  // Row 3: Home Row ASDFGHJKL (13 keys)
  {
    rowZ: -0.245,
    rowHeightUnits: 0.96,
    keys: [
      {
        id: 'caps',
        topLabel: '⇪',
        mainLabel: 'caps lock',
        align: 'bottom-left',
        hasStatusDot: true,
        wUnits: 1.78,
      },
      { id: 'a', mainLabel: 'A', wUnits: 1.0 },
      { id: 's', mainLabel: 'S', wUnits: 1.0 },
      { id: 'd', mainLabel: 'D', wUnits: 1.0 },
      { id: 'f', mainLabel: 'F', hasHomingBar: true, wUnits: 1.0 },
      { id: 'g', mainLabel: 'G', wUnits: 1.0 },
      { id: 'h', mainLabel: 'H', wUnits: 1.0 },
      { id: 'j', mainLabel: 'J', hasHomingBar: true, wUnits: 1.0 },
      { id: 'k', mainLabel: 'K', wUnits: 1.0 },
      { id: 'l', mainLabel: 'L', wUnits: 1.0 },
      { id: 'semi', topLabel: ':', mainLabel: ';', wUnits: 1.0 },
      { id: 'quote', topLabel: '"', mainLabel: "'", wUnits: 1.0 },
      { id: 'return', topLabel: '↵', mainLabel: 'return', align: 'bottom-right', wUnits: 1.78 },
    ],
  },
  // Row 4: Bottom Letter Row ZXCVBNM (12 keys)
  {
    rowZ: -0.055,
    rowHeightUnits: 0.96,
    keys: [
      { id: 'lshift', topLabel: '⇧', mainLabel: 'shift', align: 'bottom-left', wUnits: 2.32 },
      { id: 'z', mainLabel: 'Z', wUnits: 1.0 },
      { id: 'x', mainLabel: 'X', wUnits: 1.0 },
      { id: 'c', mainLabel: 'C', wUnits: 1.0 },
      { id: 'v', mainLabel: 'V', wUnits: 1.0 },
      { id: 'b', mainLabel: 'B', wUnits: 1.0 },
      { id: 'n', mainLabel: 'N', wUnits: 1.0 },
      { id: 'm', mainLabel: 'M', wUnits: 1.0 },
      { id: 'comma', topLabel: '<', mainLabel: ',', wUnits: 1.0 },
      { id: 'period', topLabel: '>', mainLabel: '.', wUnits: 1.0 },
      { id: 'slash', topLabel: '?', mainLabel: '/', wUnits: 1.0 },
      { id: 'rshift', topLabel: '⇧', mainLabel: 'shift', align: 'bottom-right', wUnits: 2.32 },
    ],
  },
  // Row 5: Bottom Modifier Row + Spacebar + Inverted-T Arrow Cluster (11 keys)
  {
    rowZ: 0.135,
    rowHeightUnits: 0.98,
    keys: [
      { id: 'fn', topLabel: 'fn', mainLabel: '🌐', align: 'bottom-left', wUnits: 1.0 },
      { id: 'ctrl', topLabel: '⌃', mainLabel: 'control', align: 'bottom-left', wUnits: 1.0 },
      { id: 'lopt', topLabel: '⌥', mainLabel: 'option', align: 'bottom-left', wUnits: 1.0 },
      { id: 'lcmd', topLabel: '⌘', mainLabel: 'command', align: 'bottom-left', wUnits: 1.28 },
      { id: 'space', mainLabel: '', wUnits: 4.98 },
      { id: 'rcmd', topLabel: '⌘', mainLabel: 'command', align: 'bottom-right', wUnits: 1.28 },
      { id: 'ropt', topLabel: '⌥', mainLabel: 'option', align: 'bottom-right', wUnits: 1.0 },
      {
        id: 'arrow-left',
        mainLabel: '◀',
        wUnits: 0.96,
        hUnits: 0.46,
        zOffsetUnits: 0.25,
      },
      {
        id: 'arrow-up',
        mainLabel: '▲',
        wUnits: 0.96,
        hUnits: 0.45,
        zOffsetUnits: -0.25,
      },
      {
        id: 'arrow-down',
        mainLabel: '▼',
        wUnits: 0.96,
        hUnits: 0.45,
        zOffsetUnits: 0.25,
      },
      {
        id: 'arrow-right',
        mainLabel: '▶',
        wUnits: 0.96,
        hUnits: 0.46,
        zOffsetUnits: 0.25,
      },
    ],
  },
];

/**
 * Generates a high-resolution (2048x1024) Keyboard Legend Atlas texture
 * containing sharp white/light-gray legends for all 78 MacBook Pro keys,
 * plus the merged 3D keycap geometry and UV-mapped keycap top legend geometry.
 */
export function createDetailedKeyboardAssets(renderer: THREE.WebGLRenderer): {
  keyBodiesGeo: THREE.BufferGeometry;
  keyTopsGeo: THREE.BufferGeometry;
  legendAtlasTex: THREE.CanvasTexture;
} {
  const atlasW = 2048;
  const atlasH = 1024;
  const cols = 16;
  const rows = 6;
  const cellW = atlasW / cols; // 128px per key cell
  const cellH = atlasH / rows; // 170.6px per key cell

  const canvas = document.createElement('canvas');
  canvas.width = atlasW;
  canvas.height = atlasH;
  const ctx = canvas.getContext('2d')!;

  // Base dark matte keycap color
  ctx.fillStyle = '#0d0d13';
  ctx.fillRect(0, 0, atlasW, atlasH);

  const keyBodyGeos: THREE.BufferGeometry[] = [];
  const keyTopGeos: THREE.BufferGeometry[] = [];

  const totalRowSpanX = 2.72; // Physical keyboard span inside well
  const baseUnitW = totalRowSpanX / 15.15; // ~0.1795 units per 1u key center-to-center
  const keyGap = 0.017;
  const keyHeight = 0.017;

  let flatIndex = 0;

  MACBOOK_KEYBOARD_ROWS.forEach((rowSpec) => {
    // Compute total width units in this row (note: arrow-up and arrow-down share the same X column!)
    let sumUnits = 0;
    rowSpec.keys.forEach((k) => {
      if (k.id !== 'arrow-down') {
        sumUnits += k.wUnits;
      }
    });

    const rowScale = 14.52 / sumUnits;
    let cursorX = -totalRowSpanX / 2;

    let savedArrowColX = 0;
    let savedArrowColW = 0;

    rowSpec.keys.forEach((key) => {
      const colIdx = flatIndex % cols;
      const rowIdx = Math.floor(flatIndex / cols);
      flatIndex++;

      // Draw this key's legend into its dedicated atlas cell `(colIdx, rowIdx)`
      const cx = colIdx * cellW;
      const cy = rowIdx * cellH;
      drawKeyLegendCell(ctx, cx, cy, cellW, cellH, key);

      // Compute physical 3D keycap dimensions & position on the keyboard deck
      const effectiveWUnits = key.wUnits * rowScale;
      const centerSpanW = effectiveWUnits * baseUnitW;

      let keyCenterX = 0;
      let physicalW = Math.max(0.05, centerSpanW - keyGap);

      if (key.id === 'arrow-up') {
        keyCenterX = cursorX + centerSpanW / 2;
        savedArrowColX = keyCenterX;
        savedArrowColW = physicalW;
        cursorX += centerSpanW;
      } else if (key.id === 'arrow-down') {
        keyCenterX = savedArrowColX;
        physicalW = savedArrowColW;
      } else {
        keyCenterX = cursorX + centerSpanW / 2;
        cursorX += centerSpanW;
      }

      const hUnits = key.hUnits ?? rowSpec.rowHeightUnits;
      const physicalD = Math.max(0.04, hUnits * baseUnitW - keyGap);
      const zOffset = (key.zOffsetUnits ?? 0) * baseUnitW;
      const keyCenterZ = rowSpec.rowZ + zOffset;

      // 1. 3D Physical Keycap Body (slightly wider base skirt + slightly narrower top)
      const bodyGeo = new THREE.BoxGeometry(physicalW, keyHeight, physicalD);
      bodyGeo.translate(keyCenterX, keyHeight / 2, keyCenterZ);
      keyBodyGeos.push(bodyGeo);

      // 2. Top Legend Cap Surface with exact UV mapping to `(colIdx, rowIdx)` in the 2048x1024 Atlas
      const topW = Math.max(0.04, physicalW - 0.006);
      const topD = Math.max(0.035, physicalD - 0.006);
      const topGeo = new THREE.PlaneGeometry(topW, topD);
      // Rotate so plane lies horizontally facing +Y, with top of cell pointing toward -Z (hinge)
      topGeo.rotateX(-Math.PI / 2);
      topGeo.translate(keyCenterX, keyHeight + 0.0008, keyCenterZ);

      // Remap UVs to the inner padded region of cell `(colIdx, rowIdx)`
      const padU = 6 / atlasW;
      const padV = 6 / atlasH;
      const u0 = colIdx / cols + padU;
      const u1 = (colIdx + 1) / cols - padU;
      // Canvas Y=0 is at V=1 in Three.js Texture coordinates
      const vTop = 1 - rowIdx / rows - padV;
      const vBottom = 1 - (rowIdx + 1) / rows + padV;

      const uvAttr = topGeo.attributes.uv as THREE.BufferAttribute;
      // PlaneGeometry default vertices:
      // 0: top-left (u0, vTop), 1: top-right (u1, vTop), 2: bottom-left (u0, vBottom), 3: bottom-right (u1, vBottom)
      uvAttr.setXY(0, u0, vTop);
      uvAttr.setXY(1, u1, vTop);
      uvAttr.setXY(2, u0, vBottom);
      uvAttr.setXY(3, u1, vBottom);
      uvAttr.needsUpdate = true;

      keyTopGeos.push(topGeo);
    });
  });

  const keyBodiesGeo = BufferGeometryUtils.mergeGeometries(keyBodyGeos, false);
  const keyTopsGeo = BufferGeometryUtils.mergeGeometries(keyTopGeos, false);

  keyBodyGeos.forEach((g) => g.dispose());
  keyTopGeos.forEach((g) => g.dispose());

  const legendAtlasTex = new THREE.CanvasTexture(canvas);
  legendAtlasTex.colorSpace = THREE.SRGBColorSpace;
  legendAtlasTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  legendAtlasTex.minFilter = THREE.LinearMipmapLinearFilter;
  legendAtlasTex.magFilter = THREE.LinearFilter;
  legendAtlasTex.generateMipmaps = true;

  return {
    keyBodiesGeo,
    keyTopsGeo,
    legendAtlasTex,
  };
}

function drawKeyLegendCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  key: KeySpec
) {
  ctx.save();

  const pad = 6;
  const rx = x + pad;
  const ry = y + pad;
  const rw = w - pad * 2;
  const rh = h - pad * 2;

  // Clean, solid matte-black keycap surface with no artificial light gradient or glow
  ctx.fillStyle = '#0c0c11';
  ctx.fillRect(rx, ry, rw, rh);

  // Touch ID circular sensor ring (clean matte ring, no glow)
  if (key.isTouchId) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) * 0.28;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#08080c';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#525266';
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Crisp, clean matte white/light-gray printed key legends (no glow or light halo)
  const primaryColor = '#e2e8f0';
  const secondaryColor = '#94a3b8';

  ctx.textBaseline = 'middle';

  if (key.align === 'bottom-left') {
    if (key.topLabel) {
      ctx.fillStyle = secondaryColor;
      ctx.textAlign = 'left';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(key.topLabel, rx + 14, ry + 34);
    }
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'left';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(key.mainLabel, rx + 14, ry + rh - 28);
  } else if (key.align === 'bottom-right') {
    if (key.topLabel) {
      ctx.fillStyle = secondaryColor;
      ctx.textAlign = 'right';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(key.topLabel, rx + rw - 14, ry + 34);
    }
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'right';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(key.mainLabel, rx + rw - 14, ry + rh - 28);
  } else if (key.topLabel) {
    const isFuncKey = key.id.startsWith('f') && key.id.length <= 3;
    ctx.textAlign = 'center';
    ctx.fillStyle = isFuncKey ? primaryColor : secondaryColor;
    ctx.font = isFuncKey
      ? '600 28px "Plus Jakarta Sans", sans-serif'
      : '600 28px "JetBrains Mono", monospace';
    ctx.fillText(key.topLabel, x + w / 2, ry + rh * 0.33);

    ctx.fillStyle = isFuncKey ? secondaryColor : primaryColor;
    ctx.font = isFuncKey
      ? '600 19px "JetBrains Mono", monospace'
      : '700 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(key.mainLabel, x + w / 2, ry + rh * 0.72);
  } else if (key.mainLabel) {
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'center';
    const isArrow = key.id.startsWith('arrow-');
    ctx.font = isArrow
      ? '700 28px "Plus Jakarta Sans", sans-serif'
      : '700 42px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(key.mainLabel, x + w / 2, y + h / 2 + 2);
  }

  // Tactile homing bar on F and J keys
  if (key.hasHomingBar) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + w / 2 - 14, ry + rh - 16, 28, 3);
  }

  ctx.restore();
}

/**
 * Draws a crisp, recognizable Apple-style bitten apple silhouette with angled top leaf
 * onto a high-resolution transparent canvas texture for the outer MacBook Pro lid.
 */
export function createAppleLogoTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  // Create metallic brushed chrome-silver gradient with subtle lavender specular sheen
  const metalGrad = ctx.createLinearGradient(200, 160, 820, 880);
  metalGrad.addColorStop(0, '#f8fafc');
  metalGrad.addColorStop(0.28, '#cbd5e1');
  metalGrad.addColorStop(0.52, '#e2e8f0');
  metalGrad.addColorStop(0.76, '#94a3b8');
  metalGrad.addColorStop(1, '#f1f5f9');

  // 1. Draw the iconic two-lobed Apple body path
  ctx.beginPath();
  // Start at top-center dip between lobes (512, 330)
  ctx.moveTo(512, 335);
  // Right lobe upper arch
  ctx.bezierCurveTo(565, 290, 665, 285, 730, 345);
  // Right flank down to bottom-right lobe
  ctx.bezierCurveTo(820, 430, 815, 635, 720, 775);
  // Bottom-right lobe rounding
  ctx.bezierCurveTo(672, 845, 618, 885, 566, 882);
  // Bottom center indent (cleft)
  ctx.bezierCurveTo(535, 880, 526, 856, 512, 856);
  ctx.bezierCurveTo(498, 856, 489, 880, 458, 882);
  // Bottom-left lobe rounding
  ctx.bezierCurveTo(406, 885, 352, 845, 304, 775);
  // Left flank up to upper-left lobe
  ctx.bezierCurveTo(205, 630, 200, 425, 294, 345);
  // Left lobe upper arch back to center dip
  ctx.bezierCurveTo(359, 285, 459, 290, 512, 335);
  ctx.closePath();

  ctx.fillStyle = metalGrad;
  ctx.fill();

  // 2. Carve out the signature right-side circular bite using destination-out compositing
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(802, 520, 122, 0, Math.PI * 2);
  ctx.fill();

  // 3. Draw the detached top leaf tilted to the right
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.moveTo(508, 298);
  ctx.bezierCurveTo(506, 212, 576, 142, 658, 138);
  ctx.bezierCurveTo(662, 222, 592, 294, 508, 298);
  ctx.closePath();
  ctx.fillStyle = metalGrad;
  ctx.fill();

  // Subtle recessed inner bevel rim so the logo looks precision-inlaid into the aluminum lid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}
