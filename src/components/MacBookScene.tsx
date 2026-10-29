import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createNLEScreenController } from '../utils/nleScreenRenderer';
import {
  createAppleLogoTexture,
  createDetailedKeyboardAssets,
} from '../utils/macbookParts';
import { SITE_ASSETS } from '../data/projects';

export interface IntroAnimationRefs {
  openingProgress: number;
  zoomProgress: number;
  contentRevealProgress: number;
  isLocked: boolean;
  isSceneActive: boolean;
}

interface MacBookSceneProps {
  animRefs: React.MutableRefObject<IntroAnimationRefs>;
  onSceneReady?: () => void;
}

// Pre-allocated module-scope math objects to ensure zero GC inside the render loop
const _camPos = new THREE.Vector3();
const _camLook = new THREE.Vector3();

// Stage 0: Elevated studio angle that clearly showcases the closed MacBook Pro & Apple lid logo
const _stage0Pos = new THREE.Vector3(0, 1.62, 4.18);
const _stage0Look = new THREE.Vector3(0, 0.14, -0.04);

// Stage 1: Balanced open studio framing showing both the NLE display and the detailed keyboard/trackpad
const _stage1Pos = new THREE.Vector3(0, 1.76, 3.88);
const _stage1Look = new THREE.Vector3(0, 0.78, -0.32);

// Exact world center and outward normal of the open 105-degree screen
const OPEN_ANGLE_DEG = 105;
const OPEN_ANGLE_RAD = THREE.MathUtils.degToRad(OPEN_ANGLE_DEG);
const SCREEN_CENTER_DIST = 1.22;
const HINGE_Y = 0.145;
const HINGE_Z = -1.18;
const SCREEN_WORLD_Y = HINGE_Y + SCREEN_CENTER_DIST * Math.sin(OPEN_ANGLE_RAD);
const SCREEN_WORLD_Z = HINGE_Z + SCREEN_CENTER_DIST * Math.cos(OPEN_ANGLE_RAD);
const SCREEN_NORMAL_Y = Math.sin(OPEN_ANGLE_RAD - Math.PI / 2);
const SCREEN_NORMAL_Z = Math.cos(OPEN_ANGLE_RAD - Math.PI / 2);

const _screenCenter = new THREE.Vector3(0, SCREEN_WORLD_Y, SCREEN_WORLD_Z);
const _zoomEndPos = new THREE.Vector3(
  0,
  SCREEN_WORLD_Y + SCREEN_NORMAL_Y * 1.12,
  SCREEN_WORLD_Z + SCREEN_NORMAL_Z * 1.12
);

/**
 * Helper to create a rounded rectangle `THREE.Shape` centered at (0, 0).
 */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/**
 * Helper to create a rounded-rectangle border frame (outer rect minus inner rect hole).
 */
function createRoundedBorderShape(
  width: number,
  height: number,
  radius: number,
  borderThickness: number
): THREE.Shape {
  const outer = createRoundedRectShape(width, height, radius);
  const inner = createRoundedRectShape(
    width - borderThickness * 2,
    height - borderThickness * 2,
    Math.max(0.01, radius - borderThickness)
  );
  outer.holes.push(inner);
  return outer;
}

/**
 * Creates a procedural soft radial contact shadow texture.
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 245);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
  grad.addColorStop(0.55, 'rgba(4, 2, 12, 0.52)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates a high-density procedural speaker grille micro-perforation texture.
 */
function createSpeakerGrilleTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#24242f';
  ctx.fillRect(0, 0, 128, 512);
  ctx.fillStyle = '#07070b';
  for (let y = 10; y < 502; y += 6) {
    for (let x = 10; x < 118; x += 6) {
      ctx.beginPath();
      ctx.arc(x, y, 1.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export const MacBookScene: React.FC<MacBookSceneProps> = ({ animRefs, onSceneReady }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const readyCalledRef = useRef(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string (never user-agent)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    
    // OPTIMIZED: Capped Maximum Pixel Ratio to 1.5. This massively reduces GPU fill-rate
    // burden on 4K/Retina displays, solving heavy framerate drops during rotation.
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    
    renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    // OPTIMIZED: Downgraded from PCFSoftShadowMap to PCFShadowMap for rapid frame updates
    renderer.shadowMap.type = THREE.PCFShadowMap; 
    renderer.setClearColor(0x050508, 1);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Scene, Studio Environment Map (RoomEnvironment), and Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.062);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Camera
    const camera = new THREE.PerspectiveCamera(
      38,
      (container.clientWidth || window.innerWidth) /
        (container.clientHeight || window.innerHeight),
      0.08,
      60
    );
    camera.position.copy(_stage0Pos);
    camera.lookAt(_stage0Look);

    // 5. Studio 3-Point Lighting Rig + Restrained Purple Rim Lighting
    const hemiLight = new THREE.HemisphereLight(0xb4a5f8, 0x090812, 0.6);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // Warm Key Light (illuminates lid, logo, keyboard legends, and anodized bevels)
    const keyLight = new THREE.DirectionalLight(0xfff6ec, 1.75);
    keyLight.position.set(3.4, 5.8, 4.4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(512, 512); 
      const d = 3.2;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 14;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Deep Purple Rim / Backlight
    const rimLight = new THREE.SpotLight(0x9333ea, 4.8, 16, Math.PI / 3, 0.65, 1.5);
    rimLight.position.set(-2.8, 3.6, -4.2);
    rimLight.target.position.set(0, 0.4, 0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // Secondary Cool-Violet Edge Fill
    const edgeFill = new THREE.DirectionalLight(0x7c3aed, 1.05);
    edgeFill.position.set(3.4, 2.4, -3.4);
    scene.add(edgeFill);

    if (!isSoftwareGl) {
      // OPTIMIZED: Replaced the brutally expensive RectAreaLight with a fast SpotLight 
      // This saves the GPU from calculating massive area matrices per-frame
      const softbox = new THREE.SpotLight(0xd8b4fe, 3.0, 10, Math.PI / 3, 0.8, 1);
      softbox.position.set(0, 3.8, 2.4);
      softbox.lookAt(0, 0.15, 0);
      scene.add(softbox);
    }

    // 6. Dark Studio Floor & Grounded Contact Shadow
    const disposables: { dispose: () => void }[] = [];
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07070c,
      roughness: 0.76,
      metalness: 0.24,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.015;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);
    disposables.push(floorGeo, floorMat);

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(5.2, 3.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.004;
    scene.add(shadowMesh);
    disposables.push(shadowTex, shadowGeo, shadowMat);

    // ========================================================================
    // 7. ULTRA-REALISTIC 3D APPLE MACBOOK PRO (`macbookGroup`)
    // ========================================================================
    const macbookGroup = new THREE.Group();
    macbookGroup.position.set(0, 0, 0);
    scene.add(macbookGroup);

    const CHASSIS_W = 3.56;
    const CHASSIS_D = 2.48;
    const BASE_H = 0.115;
    const DECK_Y = BASE_H + 0.041;

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x262630, // Space-Gray / Dark Titanium Anodized Aluminum
      metalness: 0.88,
      roughness: 0.22,
    });
    const machinedEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x525266,
      metalness: 0.94,
      roughness: 0.16,
    });
    const darkWellMat = new THREE.MeshStandardMaterial({
      color: 0x08080c,
      metalness: 0.3,
      roughness: 0.72,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const keyBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0b0b10,
      metalness: 0.05,
      roughness: 0.9,
      envMapIntensity: 0.1,
    });
    const trackpadGlassMat = new THREE.MeshStandardMaterial({
      color: 0x1d1d26,
      metalness: 0.18,
      roughness: 0.22,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const trackpadBorderMat = new THREE.MeshStandardMaterial({
      color: 0x3b3b4d,
      metalness: 0.85,
      roughness: 0.25,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const hingeMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0f,
      metalness: 0.68,
      roughness: 0.34,
    });
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      metalness: 0.05,
      roughness: 0.85,
      envMapIntensity: 0.08,
    });
    const displayGlassSurroundMat = new THREE.MeshStandardMaterial({
      color: 0x06060a,
      metalness: 0.05,
      roughness: 0.88,
      envMapIntensity: 0.08,
    });
    const portInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x050507,
      metalness: 0.4,
      roughness: 0.6,
    });
    const goldPinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2,
    });

    disposables.push(
      aluminumMat,
      machinedEdgeMat,
      darkWellMat,
      keyBodyMat,
      trackpadGlassMat,
      trackpadBorderMat,
      hingeMat,
      bezelMat,
      displayGlassSurroundMat,
      portInteriorMat,
      goldPinMat
    );

    // Part 1: 4 Bottom Rubberized Anti-Slip Feet + Metallic Bottom Rim
    const footGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.024, 24);
    const footRimGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.008, 24);
    const footPositions = [
      [-1.38, 0.012, -0.88],
      [1.38, 0.012, -0.88],
      [-1.38, 0.012, 0.88],
      [1.38, 0.012, 0.88],
    ];
    footPositions.forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(footGeo, bezelMat);
      foot.position.set(fx, fy, fz);
      macbookGroup.add(foot);
      const rim = new THREE.Mesh(footRimGeo, machinedEdgeMat);
      rim.position.set(fx, fy + 0.01, fz);
      macbookGroup.add(rim);
    });
    disposables.push(footGeo, footRimGeo);

    // Part 2: Extruded Aluminum Base Unibody with Beveled Machined Edges
    const baseShape = createRoundedRectShape(CHASSIS_W, CHASSIS_D, 0.16);
    const baseExtrudeGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: BASE_H,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.016,
      bevelSegments: 4,
      curveSegments: 20,
    });
    baseExtrudeGeo.rotateX(Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseExtrudeGeo, aluminumMat);
    baseMesh.position.set(0, BASE_H + 0.024, 0);
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    macbookGroup.add(baseMesh);
    disposables.push(baseExtrudeGeo);

    // Machined Chamfer Perimeter Rim around Top Deck
    const deckRimShape = createRoundedBorderShape(CHASSIS_W + 0.02, CHASSIS_D + 0.02, 0.165, 0.014);
    const deckRimGeo = new THREE.ShapeGeometry(deckRimShape, 20);
    const deckRimMesh = new THREE.Mesh(deckRimGeo, machinedEdgeMat);
    deckRimMesh.rotation.x = -Math.PI / 2;
    deckRimMesh.position.set(0, DECK_Y + 0.0003, 0);
    macbookGroup.add(deckRimMesh);
    disposables.push(deckRimGeo);

    // Front Opener Finger-Scoop Lip Groove on front edge of base
    const lipNotchGeo = new THREE.BoxGeometry(0.62, 0.032, 0.065);
    const lipNotchMesh = new THREE.Mesh(lipNotchGeo, darkWellMat);
    lipNotchMesh.position.set(0, BASE_H + 0.028, CHASSIS_D / 2 + 0.004);
    macbookGroup.add(lipNotchMesh);
    const lipHighlightGeo = new THREE.BoxGeometry(0.62, 0.004, 0.012);
    const lipHighlightMesh = new THREE.Mesh(lipHighlightGeo, machinedEdgeMat);
    lipHighlightMesh.position.set(0, BASE_H + 0.012, CHASSIS_D / 2 + 0.015);
    macbookGroup.add(lipHighlightMesh);
    disposables.push(lipNotchGeo, lipHighlightGeo);

    // Part 3: Realistic Side Ports & Thermal Ventilation Openings
    // Left Flank: MagSafe 3 + 2x Thunderbolt 4 (USB-C) + 3.5mm Headphone Jack
    const magsafeOuterGeo = new THREE.BoxGeometry(0.022, 0.034, 0.16);
    const magsafePinGeo = new THREE.BoxGeometry(0.024, 0.014, 0.11);
    const usbcOuterGeo = new THREE.BoxGeometry(0.022, 0.026, 0.105);
    const usbcTongueGeo = new THREE.BoxGeometry(0.024, 0.006, 0.075);
    const audioJackGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.024, 16);
    audioJackGeo.rotateZ(Math.PI / 2);
    const ventSlotGeo = new THREE.BoxGeometry(0.025, 0.01, 0.52);

    const leftX = -CHASSIS_W / 2 - 0.008;
    const rightX = CHASSIS_W / 2 + 0.008;
    const portY = 0.088;

    // MagSafe 3 (Left rear)
    const magsafeMesh = new THREE.Mesh(magsafeOuterGeo, portInteriorMat);
    magsafeMesh.position.set(leftX, portY, -0.82);
    macbookGroup.add(magsafeMesh);
    const magsafePins = new THREE.Mesh(magsafePinGeo, goldPinMat);
    magsafePins.position.set(leftX, portY, -0.82);
    macbookGroup.add(magsafePins);

    // 2x USB-C / Thunderbolt 4 on Left
    [-0.56, -0.34].forEach((pz) => {
      const port = new THREE.Mesh(usbcOuterGeo, portInteriorMat);
      port.position.set(leftX, portY, pz);
      macbookGroup.add(port);
      const tongue = new THREE.Mesh(usbcTongueGeo, machinedEdgeMat);
      tongue.position.set(leftX, portY, pz);
      macbookGroup.add(tongue);
    });

    // 3.5mm Audio Jack on Left
    const jackMesh = new THREE.Mesh(audioJackGeo, portInteriorMat);
    jackMesh.position.set(leftX, portY, -0.14);
    macbookGroup.add(jackMesh);

    // Right Flank: HDMI + 1x Thunderbolt 4 (USB-C) + SDXC Card Reader Slot
    const hdmiGeo = new THREE.BoxGeometry(0.022, 0.032, 0.15);
    const sdxcGeo = new THREE.BoxGeometry(0.022, 0.014, 0.28);
    const hdmiMesh = new THREE.Mesh(hdmiGeo, portInteriorMat);
    hdmiMesh.position.set(rightX, portY, -0.78);
    macbookGroup.add(hdmiMesh);
    const rightUsbc = new THREE.Mesh(usbcOuterGeo, portInteriorMat);
    rightUsbc.position.set(rightX, portY, -0.52);
    macbookGroup.add(rightUsbc);
    const rightTongue = new THREE.Mesh(usbcTongueGeo, machinedEdgeMat);
    rightTongue.position.set(rightX, portY, -0.52);
    macbookGroup.add(rightTongue);
    const sdxcMesh = new THREE.Mesh(sdxcGeo, portInteriorMat);
    sdxcMesh.position.set(rightX, portY, -0.2);
    macbookGroup.add(sdxcMesh);

    // Lower Side Thermal Intake Vents (left & right lower bevel)
    [-1, 1].forEach((side) => {
      const vent = new THREE.Mesh(ventSlotGeo, portInteriorMat);
      vent.position.set(side * (CHASSIS_W / 2 - 0.01), 0.042, 0.22);
      macbookGroup.add(vent);
    });

    disposables.push(
      magsafeOuterGeo,
      magsafePinGeo,
      usbcOuterGeo,
      usbcTongueGeo,
      audioJackGeo,
      ventSlotGeo,
      hdmiGeo,
      sdxcGeo
    );

    // Part 4: Recessed Keyboard Well (Matte, no backlight glow)
    const WELL_Z = -0.33;
    const wellShape = createRoundedRectShape(2.82, 1.18, 0.045);
    const wellGeo = new THREE.ShapeGeometry(wellShape, 12);
    const wellMesh = new THREE.Mesh(wellGeo, darkWellMat);
    wellMesh.rotation.x = -Math.PI / 2;
    wellMesh.position.set(0, DECK_Y + 0.002, WELL_Z);
    macbookGroup.add(wellMesh);

    const wellBorderShape = createRoundedBorderShape(2.84, 1.2, 0.05, 0.012);
    const wellBorderGeo = new THREE.ShapeGeometry(wellBorderShape, 12);
    const wellBorderMesh = new THREE.Mesh(wellBorderGeo, machinedEdgeMat);
    wellBorderMesh.rotation.x = -Math.PI / 2;
    wellBorderMesh.position.set(0, DECK_Y + 0.003, WELL_Z);
    macbookGroup.add(wellBorderMesh);
    disposables.push(wellGeo, wellBorderGeo);

    // Part 5: 78 Individual 3D Keycaps + Crisp Matte UV-Mapped Key Legends (No light/glare effect)
    const { keyBodiesGeo, keyTopsGeo, legendAtlasTex } =
      createDetailedKeyboardAssets(renderer);

    const keyTopsMat = new THREE.MeshBasicMaterial({
      map: legendAtlasTex,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    const keyBodiesMesh = new THREE.Mesh(keyBodiesGeo, keyBodyMat);
    keyBodiesMesh.position.set(0, DECK_Y + 0.0025, 0);
    macbookGroup.add(keyBodiesMesh);
    const keyTopsMesh = new THREE.Mesh(keyTopsGeo, keyTopsMat);
    keyTopsMesh.position.set(0, DECK_Y + 0.004, 0);
    macbookGroup.add(keyTopsMesh);
    disposables.push(keyBodiesGeo, keyTopsGeo, legendAtlasTex, keyTopsMat);

    // Part 6: Realistic Centered Force Touch Glass Trackpad with Machined Border Seam
    const TP_W = 1.42;
    const TP_D = 0.86;
    const TP_Z = 0.71;
    const tpShape = createRoundedRectShape(TP_W, TP_D, 0.055);
    const tpGeo = new THREE.ShapeGeometry(tpShape, 16);
    const tpMesh = new THREE.Mesh(tpGeo, trackpadGlassMat);
    tpMesh.rotation.x = -Math.PI / 2;
    tpMesh.position.set(0, DECK_Y + 0.0025, TP_Z);
    macbookGroup.add(tpMesh);

    const tpBorderShape = createRoundedBorderShape(TP_W + 0.018, TP_D + 0.018, 0.06, 0.01);
    const tpBorderGeo = new THREE.ShapeGeometry(tpBorderShape, 16);
    const tpBorderMesh = new THREE.Mesh(tpBorderGeo, trackpadBorderMat);
    tpBorderMesh.rotation.x = -Math.PI / 2;
    tpBorderMesh.position.set(0, DECK_Y + 0.0035, TP_Z);
    macbookGroup.add(tpBorderMesh);
    disposables.push(tpGeo, tpBorderGeo);

    // Part 7: Left & Right Micro-Perforated Speaker Grilles
    const grilleTex = createSpeakerGrilleTexture(renderer);
    const grilleMat = new THREE.MeshStandardMaterial({
      map: grilleTex,
      bumpMap: grilleTex,
      bumpScale: 0.004,
      roughness: 0.45,
      metalness: 0.55,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const grilleGeo = new THREE.PlaneGeometry(0.22, 1.14);
    [-1.58, 1.58].forEach((gx) => {
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.rotation.x = -Math.PI / 2;
      grille.position.set(gx, DECK_Y + 0.0025, WELL_Z);
      macbookGroup.add(grille);
    });
    disposables.push(grilleTex, grilleMat, grilleGeo);

    // Part 8: Rear Clutch Hinge Barrel & Left/Right Knuckle Brackets
    const hingeGeo = new THREE.CylinderGeometry(0.044, 0.044, 2.38, 28);
    hingeGeo.rotateZ(Math.PI / 2);
    const hingeCylinder = new THREE.Mesh(hingeGeo, hingeMat);
    hingeCylinder.position.set(0, HINGE_Y, HINGE_Z);
    macbookGroup.add(hingeCylinder);

    const knuckleGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.18, 24);
    knuckleGeo.rotateZ(Math.PI / 2);
    [-0.95, 0.95].forEach((kx) => {
      const knuckle = new THREE.Mesh(knuckleGeo, machinedEdgeMat);
      knuckle.position.set(kx, HINGE_Y, HINGE_Z);
      macbookGroup.add(knuckle);
    });
    disposables.push(hingeGeo, knuckleGeo);

    // ========================================================================
    // Part 9: INDEPENDENTLY ROTATING LID GROUP (`hingePivotGroup`)
    // Pivots around the exact physical rear hinge axis `(0, HINGE_Y, HINGE_Z)`
    // ========================================================================
    const hingePivotGroup = new THREE.Group();
    hingePivotGroup.position.set(0, HINGE_Y, HINGE_Z);
    hingePivotGroup.rotation.x = 0; // Starts 100% closed
    macbookGroup.add(hingePivotGroup);

    const LID_H = 0.048;
    const LID_CENTER_Z = CHASSIS_D / 2 - 0.06;

    // Outer Lid Aluminum Unibody Shell (bottom face sits at y = +0.013, well clear of inner screen)
    const lidShape = createRoundedRectShape(CHASSIS_W, CHASSIS_D, 0.16);
    const lidExtrudeGeo = new THREE.ExtrudeGeometry(lidShape, {
      depth: LID_H,
      bevelEnabled: true,
      bevelThickness: 0.011,
      bevelSize: 0.011,
      bevelSegments: 3,
      curveSegments: 20,
    });
    lidExtrudeGeo.rotateX(Math.PI / 2);
    const lidShellMesh = new THREE.Mesh(lidExtrudeGeo, aluminumMat);
    lidShellMesh.position.set(0, LID_H + 0.024, LID_CENTER_Z);
    lidShellMesh.castShadow = !isSoftwareGl;
    hingePivotGroup.add(lidShellMesh);
    disposables.push(lidExtrudeGeo);

    // Machined Outer Lid Perimeter Highlight Rim
    const lidRimShape = createRoundedBorderShape(CHASSIS_W + 0.016, CHASSIS_D + 0.016, 0.162, 0.012);
    const lidRimGeo = new THREE.ShapeGeometry(lidRimShape, 20);
    const lidRimMesh = new THREE.Mesh(lidRimGeo, machinedEdgeMat);
    lidRimMesh.rotation.x = -Math.PI / 2;
    lidRimMesh.position.set(0, LID_H + 0.036, LID_CENTER_Z);
    hingePivotGroup.add(lidRimMesh);
    disposables.push(lidRimGeo);

    // Part 10: Recognizable Apple-Style Metallic Lid Logo on Outer Lid Back
    const appleLogoTex = createAppleLogoTexture(renderer);
    const appleLogoMat = new THREE.MeshStandardMaterial({
      map: appleLogoTex,
      transparent: true,
      alphaTest: 0.05,
      color: 0xffffff,
      metalness: 0.92,
      roughness: 0.12,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const appleLogoGeo = new THREE.PlaneGeometry(0.58, 0.58);
    const appleLogoMesh = new THREE.Mesh(appleLogoGeo, appleLogoMat);
    appleLogoMesh.rotation.x = -Math.PI / 2;
    appleLogoMesh.position.set(0, LID_H + 0.037, LID_CENTER_Z);
    hingePivotGroup.add(appleLogoMesh);
    disposables.push(appleLogoTex, appleLogoMat, appleLogoGeo);

    // Part 11: Inner Display Aluminum Gasket & Matte Bezel Surround (y = +0.005)
    const innerBezelShape = createRoundedRectShape(CHASSIS_W - 0.04, CHASSIS_D - 0.04, 0.14);
    const innerBezelGeo = new THREE.ShapeGeometry(innerBezelShape, 20);
    const innerBezelMesh = new THREE.Mesh(innerBezelGeo, displayGlassSurroundMat);
    innerBezelMesh.rotation.x = Math.PI / 2;
    innerBezelMesh.position.set(0, 0.005, LID_CENTER_Z);
    hingePivotGroup.add(innerBezelMesh);

    const innerRimShape = createRoundedBorderShape(CHASSIS_W - 0.01, CHASSIS_D - 0.01, 0.15, 0.02);
    const innerRimGeo = new THREE.ShapeGeometry(innerRimShape, 20);
    const innerRimMesh = new THREE.Mesh(innerRimGeo, machinedEdgeMat);
    innerRimMesh.rotation.x = Math.PI / 2;
    innerRimMesh.position.set(0, 0.002, LID_CENTER_Z);
    hingePivotGroup.add(innerRimMesh);
    disposables.push(innerBezelGeo, innerRimGeo);

    // Part 12: Liquid Retina Display Surface (Positioned at y = -0.004 with polygonOffset so it NEVER Z-fights or flickers!)
    const nleScreen = createNLEScreenController(renderer);
    disposables.push(nleScreen);
    let customScreenImg: HTMLImageElement | null = null;
    if (SITE_ASSETS.laptopScreenPreviewUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = SITE_ASSETS.laptopScreenPreviewUrl;
      customScreenImg = img;
    }

    const SCREEN_W = 3.38;
    const SCREEN_H = 2.18;
    const screenGeo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H);
    const screenMat = new THREE.MeshBasicMaterial({
      map: nleScreen.texture,
      color: new THREE.Color(0x000000),
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.rotation.x = Math.PI / 2;
    screenMesh.position.set(0, -0.004, SCREEN_CENTER_DIST);
    hingePivotGroup.add(screenMesh);
    disposables.push(screenGeo, screenMat);

    // Top-Center Camera Notch Housing + Optical Webcam Lens (y = -0.008 & -0.010, well clear of screenMesh)
    const notchZ = SCREEN_CENTER_DIST + SCREEN_H / 2 - 0.036;
    const notchBezelGeo = new THREE.PlaneGeometry(0.44, 0.076);
    const notchMat = new THREE.MeshBasicMaterial({
      color: 0x050508,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    const notchBezelMesh = new THREE.Mesh(notchBezelGeo, notchMat);
    notchBezelMesh.rotation.x = Math.PI / 2;
    notchBezelMesh.position.set(0, -0.008, notchZ);
    hingePivotGroup.add(notchBezelMesh);
    const camLensGeo = new THREE.CircleGeometry(0.016, 16);
    const camLensMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      polygonOffset: true,
      polygonOffsetFactor: -6,
      polygonOffsetUnits: -6,
    });
    const camLensMesh = new THREE.Mesh(camLensGeo, camLensMat);
    camLensMesh.rotation.x = Math.PI / 2;
    camLensMesh.position.set(0, -0.01, notchZ);
    hingePivotGroup.add(camLensMesh);
    disposables.push(notchBezelGeo, notchMat, camLensGeo, camLensMat);

    // Pre-compile shaders on hardware GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    if (!readyCalledRef.current) {
      readyCalledRef.current = true;
      onSceneReady?.();
    }

    // ========================================================================
    // 8. LOSS-LESS 60FPS / SOFTWARE-PACED RENDER LOOP (PRESERVING 4-STAGE LOCK)
    // ========================================================================
    let frameId = 0;
    let isUnmounted = false;
    let isTabHidden = document.hidden;
    const clock = new THREE.Clock();

    let currentOpen = 0;
    let currentZoom = 0;

    function tick() {
      if (isUnmounted) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const state = animRefs.current;

      if (isTabHidden || !state.isSceneActive) {
        // Keep inactive tabs cheap; resume on the next animation frame when active.
        frameId = window.setTimeout(() => {
          if (!isUnmounted) frameId = window.requestAnimationFrame(tick);
        }, 120);
        return;
      }

      const targetOpen = state.isLocked ? 1 : THREE.MathUtils.clamp(state.openingProgress, 0, 1);
      const targetZoom = state.isLocked
        ? 1
        : targetOpen >= 0.995
          ? THREE.MathUtils.clamp(state.zoomProgress, 0, 1)
          : 0;

      // OPTIMIZED: The 3D Engine now dictates physical smoothness entirely independently of GSAP.
      // This produces perfect physics-based interpolation with no jagged mousewheel feedback.
      // Faster response for the physical lid, with independent smooth zoom easing.
      // This removes the "lagging behind the scroll" feeling without snapping.
      const openDamp = 1 - Math.exp(-(isSoftwareGl ? 30 : 26) * delta);
      const zoomDamp = 1 - Math.exp(-(isSoftwareGl ? 20 : 18) * delta);
      currentOpen = THREE.MathUtils.lerp(currentOpen, targetOpen, openDamp);
      currentZoom = THREE.MathUtils.lerp(currentZoom, targetZoom, zoomDamp);

      if (Math.abs(currentOpen - targetOpen) < 0.0005) currentOpen = targetOpen;
      if (Math.abs(currentZoom - targetZoom) < 0.0005) currentZoom = targetZoom;

      // 1. Rotate Lid around Rear Hinge ONLY from `currentOpen`
      hingePivotGroup.rotation.x = -currentOpen * OPEN_ANGLE_RAD;

      // 2. Flicker-free WebGL screen brightness (0 -> 1 as lid opens, fading smoothly at end of zoom)
      const openBright = THREE.MathUtils.smoothstep(currentOpen, 0.02, 0.75);
      const zoomDim = 1 - THREE.MathUtils.smoothstep(currentZoom, 0.72, 0.99) * 0.92;
      const finalBright = openBright * zoomDim;
      screenMat.color.setScalar(finalBright);
      nleScreen.update(currentOpen, currentZoom, 0.18, customScreenImg);

      // 3. Coordinate Camera Transitions across Stage 1 (Opening) and Stage 2 (Zoom)
      if (currentZoom <= 0.0001) {
        const openEase = THREE.MathUtils.smoothstep(currentOpen, 0, 1);
        _camPos.lerpVectors(_stage0Pos, _stage1Pos, openEase);
        _camLook.lerpVectors(_stage0Look, _stage1Look, openEase);
      } else {
        const zoomEase = THREE.MathUtils.smootherstep(currentZoom, 0, 1);
        _camPos.lerpVectors(_stage1Pos, _zoomEndPos, zoomEase);
        _camLook.lerpVectors(_stage1Look, _screenCenter, zoomEase);
      }

      camera.position.copy(_camPos);
      camera.lookAt(_camLook);

      renderer.render(scene, camera);

      // Use requestAnimationFrame on every renderer. Timer-based GPU fence polling
      // capped software rendering at very low FPS and made the lid appear to stutter.
      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isUnmounted = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [animRefs, onSceneReady]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full select-none"
      aria-label="Interactive 3D MacBook Pro Video Editing Studio"
    />
  );
};
