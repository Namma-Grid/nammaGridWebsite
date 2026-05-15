'use client';

import { useEffect, useRef, useCallback } from 'react';
import type {
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  InstancedMesh,
} from 'three';
import {
  CHARGING_STATIONS,
  PRIORITY_ZONES,
  type ChargingStation,
  type PriorityZone,
} from '@/app/data/explore-stations';
import { BANGALORE_CENTER } from '@/app/lib/map-config';

// ─── World mapping ──────────────────────────────────────────────────────────

const WORLD_SCALE = 8000;
const WORLD_HALF = 400;        // smaller world ⇒ fewer instances
const BLOCK = 50;              // road grid spacing
const ROAD_W = 12;

function latLngToWorld(lat: number, lng: number): [number, number] {
  const dx = (lng - BANGALORE_CENTER[1]) * WORLD_SCALE;
  const dz = -(lat - BANGALORE_CENTER[0]) * WORLD_SCALE;
  return [
    Math.max(-WORLD_HALF + 20, Math.min(WORLD_HALF - 20, dx)),
    Math.max(-WORLD_HALF + 20, Math.min(WORLD_HALF - 20, dz)),
  ];
}

function seeded(s: number): number {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Visual constants ───────────────────────────────────────────────────────

const ZONE_COLOR_HEX: Record<string, number> = {
  residential: 0x6ea4ff,
  workplace:   0xfbbf24,
  marketplace: 0x34d399,
};

const ZONE_RGB: Record<string, string> = {
  residential: '110,164,255',
  workplace:   '251,191,36',
  marketplace: '52,211,153',
};

const STATUS_COLORS: Record<string, number> = {
  available: 0x22c55e,
  busy:      0xf59e0b,
  offline:   0xef4444,
};

// ─── Props ─────────────────────────────────────────────────────────────────

interface TickData {
  x: number; z: number; angle: number; speed: number;
  hour: number;
}

interface CitySceneProps {
  onTick: (data: TickData) => void;
  onNearestStation: (station: ChargingStation | null, distance: number) => void;
  onNearestPriority: (zone: PriorityZone | null, distance: number) => void;
  onStationsReady: (positions: { id: string; wx: number; wz: number }[]) => void;
  onPriorityReady: (positions: { id: string; wx: number; wz: number }[]) => void;
}

// ─── Ground texture (roads + markings baked once) ──────────────────────────

function makeGroundTexture(): HTMLCanvasElement {
  const SIZE = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  // Base ground
  ctx.fillStyle = '#d4d8de';
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Subtle noise
  const noise = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < noise.data.length; i += 4) {
    const v = (Math.random() * 14) | 0;
    noise.data[i] = v; noise.data[i+1] = v; noise.data[i+2] = v;
    noise.data[i+3] = 14;
  }
  ctx.putImageData(noise, 0, 0);

  // Road grid: world half is WORLD_HALF; map [-W,W] → [0,SIZE]
  const worldToTex = (w: number) => ((w + WORLD_HALF) / (WORLD_HALF * 2)) * SIZE;
  const roadPx = worldToTex(ROAD_W) - worldToTex(0);

  // Roads
  ctx.fillStyle = '#4b5563';
  for (let w = -WORLD_HALF; w <= WORLD_HALF; w += BLOCK) {
    const p = worldToTex(w);
    ctx.fillRect(0, p - roadPx / 2, SIZE, roadPx);
    ctx.fillRect(p - roadPx / 2, 0, roadPx, SIZE);
  }
  // Yellow dashed centerlines
  ctx.fillStyle = '#fbbf24';
  const dashLen = 7;
  for (let w = -WORLD_HALF; w <= WORLD_HALF; w += BLOCK) {
    const p = worldToTex(w);
    for (let d = 0; d < SIZE; d += 16) {
      ctx.fillRect(d, p - 0.7, dashLen, 1.4);
      ctx.fillRect(p - 0.7, d, 1.4, dashLen);
    }
  }
  // Block centers (white "intersection cross" markings) — light decoration
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let w = -WORLD_HALF + BLOCK / 2; w <= WORLD_HALF; w += BLOCK) {
    for (let h = -WORLD_HALF + BLOCK / 2; h <= WORLD_HALF; h += BLOCK) {
      ctx.fillRect(worldToTex(w) - 1, worldToTex(h) - 1, 2, 2);
    }
  }
  return canvas;
}

// ─── Demand heatmap texture ─────────────────────────────────────────────────

function makeHeatmapTexture(): HTMLCanvasElement {
  const SIZE = 512;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.globalCompositeOperation = 'lighter';

  const worldToTex = (w: number) => ((w + WORLD_HALF) / (WORLD_HALF * 2)) * SIZE;

  CHARGING_STATIONS.forEach((s) => {
    const [wx, wz] = latLngToWorld(s.lat, s.lng);
    const x = worldToTex(wx);
    const y = worldToTex(wz);
    const r = 30 + (s.demandIntensity / 100) * 40;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const rgb = ZONE_RGB[s.demandZone];
    grad.addColorStop(0, `rgba(${rgb},0.45)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });

  // Priority zones in red — the "must-build" overlays
  PRIORITY_ZONES.forEach((p) => {
    const [wx, wz] = latLngToWorld(p.lat, p.lng);
    const x = worldToTex(wx);
    const y = worldToTex(wz);
    const r = 50;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(244,114,182,0.55)');
    grad.addColorStop(0.7, 'rgba(244,114,182,0.1)');
    grad.addColorStop(1, 'rgba(244,114,182,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });

  return canvas;
}

// ═══════════════════════════════════════════════════════════════════════════

export default function CityScene({
  onTick,
  onNearestStation,
  onNearestPriority,
  onStationsReady,
  onPriorityReady,
}: CitySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // ── Refs to keep latest callbacks without re-running effect ────────────
  const onTickRef = useRef(onTick);
  const onNearestStationRef = useRef(onNearestStation);
  const onNearestPriorityRef = useRef(onNearestPriority);
  const onStationsReadyRef = useRef(onStationsReady);
  const onPriorityReadyRef = useRef(onPriorityReady);

  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onNearestStationRef.current = onNearestStation; }, [onNearestStation]);
  useEffect(() => { onNearestPriorityRef.current = onNearestPriority; }, [onNearestPriority]);
  useEffect(() => { onStationsReadyRef.current = onStationsReady; }, [onStationsReady]);
  useEffect(() => { onPriorityReadyRef.current = onPriorityReady; }, [onPriorityReady]);

  const initScene = useCallback(async () => {
    if (!mountRef.current) return;
    const THREE = await import('three');

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // ── Renderer (no shadows for perf) ────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── Scene + fog ──────────────────────────────────────────────────────
    // Locked to a clear sunny midday — matches the "always day" mode.
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x9bd1ff);
    scene.background = skyColor;
    const fog = new THREE.Fog(skyColor.getHex(), 300, 800);
    scene.fog = fog;

    // ── Camera ───────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.5, 1500);
    camera.position.set(0, 35, 50);

    // ── Lights (no shadow) ───────────────────────────────────────────────
    const hemi = new THREE.HemisphereLight(0xffffff, 0x6b7280, 0.55);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4e6, 0.9);
    sun.position.set(120, 200, 80);
    scene.add(sun);

    // ── Ground (1 mesh, baked roads + markings) ──────────────────────────
    const groundCanvas = makeGroundTexture();
    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.colorSpace = THREE.SRGBColorSpace;
    groundTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() ?? 4);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.95,
      metalness: 0,
    });
    const groundGeo = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // ── Demand heatmap overlay ───────────────────────────────────────────
    const heatCanvas = makeHeatmapTexture();
    const heatTex = new THREE.CanvasTexture(heatCanvas);
    heatTex.colorSpace = THREE.SRGBColorSpace;
    const heatMat = new THREE.MeshBasicMaterial({
      map: heatTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const heatGeo = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2);
    const heat = new THREE.Mesh(heatGeo, heatMat);
    heat.rotation.x = -Math.PI / 2;
    heat.position.y = 0.05;
    scene.add(heat);

    // ── Buildings (3 InstancedMesh — one per zone) ──────────────────────
    type BuildingSpec = { x: number; z: number; w: number; d: number; h: number };
    const zoneSpecs: Record<string, BuildingSpec[]> = {
      residential: [], workplace: [], marketplace: [],
    };
    const zoneList = ['residential', 'workplace', 'marketplace'] as const;

    for (let bx = -WORLD_HALF + BLOCK / 2; bx <= WORLD_HALF; bx += BLOCK) {
      for (let bz = -WORLD_HALF + BLOCK / 2; bz <= WORLD_HALF; bz += BLOCK) {
        const blockSeed = bx * 1000 + bz;
        const numBuildings = 1 + Math.floor(seeded(blockSeed) * 2); // 1–2

        for (let b = 0; b < numBuildings; b++) {
          const sx = seeded(blockSeed + b * 7 + 1);
          const sz = seeded(blockSeed + b * 7 + 2);
          const sh = seeded(blockSeed + b * 7 + 3);

          const w = 6 + sx * 12;
          const d = 6 + sz * 12;
          const h = 5 + sh * 38;

          const ox = bx + (sx - 0.5) * (BLOCK - ROAD_W - w);
          const oz = bz + (sz - 0.5) * (BLOCK - ROAD_W - d);

          // Skip if too close to road centers
          const ax = ((ox + WORLD_HALF) % BLOCK);
          const az = ((oz + WORLD_HALF) % BLOCK);
          if (ax < ROAD_W || ax > BLOCK - ROAD_W ||
              az < ROAD_W || az > BLOCK - ROAD_W) continue;

          const zoneIdx = Math.floor(seeded(blockSeed + b * 7 + 4) * 3);
          const zone = zoneList[zoneIdx];
          zoneSpecs[zone].push({ x: ox, z: oz, w, d, h });
        }
      }
    }

    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();
    const tmpColor = new THREE.Color();
    const buildingInstances: InstancedMesh[] = [];
    const buildingMaterials: MeshStandardMaterial[] = [];

    zoneList.forEach((zone) => {
      const specs = zoneSpecs[zone];
      const baseHex = ZONE_COLOR_HEX[zone];
      const mat = new THREE.MeshStandardMaterial({
        color: baseHex,
        roughness: 0.7,
        metalness: 0.05,
        emissive: baseHex,
        emissiveIntensity: 0,
        vertexColors: false,
      });
      buildingMaterials.push(mat);
      const inst = new THREE.InstancedMesh(buildingGeo, mat, Math.max(1, specs.length));
      inst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      const baseColor = new THREE.Color(baseHex);
      specs.forEach((s, i) => {
        dummy.position.set(s.x, s.h / 2, s.z);
        dummy.scale.set(s.w, s.h, s.d);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
        const variation = 0.78 + ((i * 31) % 100) / 100 * 0.32;
        tmpColor.copy(baseColor).multiplyScalar(variation);
        inst.setColorAt(i, tmpColor);
      });
      inst.count = specs.length;
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      scene.add(inst);
      buildingInstances.push(inst);
    });

    // ── Charging Stations ────────────────────────────────────────────────
    type StationVis = {
      station: ChargingStation;
      wx: number; wz: number;
      pillar: Mesh; sphere: Mesh; ring: Mesh;
    };
    const stationVis: StationVis[] = [];

    // Shared geometries
    const pillarGeo = new THREE.CylinderGeometry(1.2, 1.5, 16, 6);
    const sphereGeo = new THREE.SphereGeometry(2.0, 10, 8);
    const ringGeo = new THREE.RingGeometry(4, 5.2, 24);
    const signPostGeo = new THREE.BoxGeometry(0.4, 8, 0.4);
    const signPlateGeo = new THREE.BoxGeometry(7, 1.8, 0.25);

    // Shared materials (per status — only 3 each)
    const stationMatCache: Record<string, {
      pillar: MeshStandardMaterial;
      sphere: MeshStandardMaterial;
      ring: MeshBasicMaterial;
    }> = {};
    (['available', 'busy', 'offline'] as const).forEach((st) => {
      const c = STATUS_COLORS[st];
      stationMatCache[st] = {
        pillar: new THREE.MeshStandardMaterial({
          color: c, emissive: c, emissiveIntensity: 0.5,
          roughness: 0.25, metalness: 0.4,
        }),
        sphere: new THREE.MeshStandardMaterial({
          color: c, emissive: c, emissiveIntensity: 1.0,
          roughness: 0.1, transparent: true, opacity: 0.9,
        }),
        ring: new THREE.MeshBasicMaterial({
          color: c, transparent: true, opacity: 0.4,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      };
    });
    const signPostMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.5 });
    const signPlateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xfbbf24, emissiveIntensity: 0.3, roughness: 0.3,
    });

    const stationPositions: { id: string; wx: number; wz: number }[] = [];
    CHARGING_STATIONS.forEach((station) => {
      const [wx, wz] = latLngToWorld(station.lat, station.lng);
      stationPositions.push({ id: station.id, wx, wz });

      const mats = stationMatCache[station.status] ?? stationMatCache.available;

      const pillar = new THREE.Mesh(pillarGeo, mats.pillar);
      pillar.position.set(wx, 8, wz);
      scene.add(pillar);

      const sphere = new THREE.Mesh(sphereGeo, mats.sphere);
      sphere.position.set(wx, 17, wz);
      scene.add(sphere);

      const ring = new THREE.Mesh(ringGeo, mats.ring);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(wx, 0.1, wz);
      scene.add(ring);

      const post = new THREE.Mesh(signPostGeo, signPostMat);
      post.position.set(wx, 4, wz - 2.5);
      scene.add(post);
      const plate = new THREE.Mesh(signPlateGeo, signPlateMat);
      plate.position.set(wx, 8.2, wz - 2.5);
      scene.add(plate);

      stationVis.push({ station, wx, wz, pillar, sphere, ring });
    });
    onStationsReadyRef.current(stationPositions);

    // ── Priority Zones (Part B markers) ─────────────────────────────────
    const priorityVis: { zone: PriorityZone; wx: number; wz: number; beam: Mesh; flag: Mesh }[] = [];
    const priorityPositions: { id: string; wx: number; wz: number }[] = [];

    const beamGeo = new THREE.CylinderGeometry(0.6, 1.5, 30, 6, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6, transparent: true, opacity: 0.45,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const flagGeo = new THREE.ConeGeometry(2.5, 5, 6);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, emissive: 0xf472b6, emissiveIntensity: 0.7,
      roughness: 0.3,
    });

    PRIORITY_ZONES.forEach((zone) => {
      const [wx, wz] = latLngToWorld(zone.lat, zone.lng);
      priorityPositions.push({ id: zone.id, wx, wz });

      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(wx, 15, wz);
      scene.add(beam);

      const flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(wx, 32, wz);
      scene.add(flag);

      priorityVis.push({ zone, wx, wz, beam, flag });
    });
    onPriorityReadyRef.current(priorityPositions);

    // ── Vehicle ──────────────────────────────────────────────────────────
    const carGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(3, 1.5, 5.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, roughness: 0.3, metalness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;
    carGroup.add(body);

    const cabinGeo = new THREE.BoxGeometry(2.6, 1.2, 3);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd, roughness: 0.1, metalness: 0.3,
      transparent: true, opacity: 0.7,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 2.5, -0.3);
    carGroup.add(cabin);

    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 8);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const wheelOffsets: [number, number, number][] = [
      [-1.6, 0.6, 1.8], [1.6, 0.6, 1.8],
      [-1.6, 0.6, -1.8], [1.6, 0.6, -1.8],
    ];
    const wheels: Mesh[] = [];
    wheelOffsets.forEach(([wx2, wy2, wz2]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx2, wy2, wz2);
      wheel.rotation.z = Math.PI / 2;
      carGroup.add(wheel);
      wheels.push(wheel);
    });

    const headlightGeo = new THREE.SphereGeometry(0.3, 6, 6);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfefce8, emissive: 0xfefce8, emissiveIntensity: 1,
    });
    [[-1, 1.5, 2.8], [1, 1.5, 2.8]].forEach(([hx, hy, hz]) => {
      const hl = new THREE.Mesh(headlightGeo, headlightMat);
      hl.position.set(hx, hy, hz);
      carGroup.add(hl);
    });

    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8,
    });
    [[-1, 1.5, -2.8], [1, 1.5, -2.8]].forEach(([tx, ty, tz]) => {
      const tl = new THREE.Mesh(headlightGeo, tailMat);
      tl.position.set(tx, ty, tz);
      carGroup.add(tl);
    });

    // Fake car shadow (1 cheap dark plane below car instead of shadow map)
    const carShadowGeo = new THREE.CircleGeometry(3.2, 16);
    const carShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false,
    });
    const carShadow = new THREE.Mesh(carShadowGeo, carShadowMat);
    carShadow.rotation.x = -Math.PI / 2;
    carShadow.position.y = 0.12;
    carGroup.add(carShadow);

    scene.add(carGroup);

    // ── Vehicle physics state ────────────────────────────────────────────
    const vehicle = {
      x: 0, z: 0, angle: 0,
      speed: 0,
      maxSpeed: 1.4,
      acceleration: 0.03,
      braking: 0.05,
      friction: 0.012,
      turnSpeed: 0.038,
    };

    // ── Input ─────────────────────────────────────────────────────────────
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mountRef.current) return;
      const w2 = mountRef.current.clientWidth;
      const h2 = mountRef.current.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    // ── Time of day — LOCKED to noon (always day, always sunny) ─────────
    // Sim hour is intentionally constant; HUD shows 12:00, lighting stays
    // at the daytime extreme of the lerps below.
    const simHour = 12;

    // ── Pre-allocated math helpers ───────────────────────────────────────
    const cameraOffset = new THREE.Vector3(0, 18, -30);
    const cameraLookOffset = new THREE.Vector3(0, 3, 10);
    const smoothCamPos = new THREE.Vector3(0, 35, 50);
    const carMatrix = new THREE.Matrix4();
    const desiredPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const skyDay = new THREE.Color(0x9bd1ff);
    const skyNight = new THREE.Color(0x0b1530);
    const ambDay = new THREE.Color(0xffffff);
    const ambNight = new THREE.Color(0x334155);
    const sunDay = new THREE.Color(0xfff2cf);
    const sunNight = new THREE.Color(0x4f6abf);
    const tmpSky = new THREE.Color();
    const tmpAmb = new THREE.Color();

    // ── Animation ────────────────────────────────────────────────────────
    let animId = 0;
    let lastNearestId: string | null = null;
    let lastNearestPriorityId: string | null = null;
    let frameIdx = 0;
    let prevT = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - prevT) / 1000); // cap dt to 50ms
      prevT = now;
      frameIdx++;

      // ── Vehicle input ──────────────────────────────────────────────────
      const dtScale = dt * 60; // normalize against 60 fps baseline
      const forward = keys['w'] || keys['arrowup'];
      const backward = keys['s'] || keys['arrowdown'];
      const left = keys['a'] || keys['arrowleft'];
      const right = keys['d'] || keys['arrowright'];
      const brake = keys[' '];

      if (forward) {
        vehicle.speed = Math.min(vehicle.speed + vehicle.acceleration * dtScale, vehicle.maxSpeed);
      } else if (backward) {
        vehicle.speed = Math.max(vehicle.speed - vehicle.braking * dtScale, -vehicle.maxSpeed * 0.4);
      }
      if (brake) vehicle.speed *= Math.pow(0.92, dtScale);
      if (!forward && !backward) {
        if (Math.abs(vehicle.speed) < 0.005) vehicle.speed = 0;
        else vehicle.speed *= Math.pow(1 - vehicle.friction, dtScale);
      }
      if (Math.abs(vehicle.speed) > 0.01) {
        const turnFactor = vehicle.turnSpeed * (vehicle.speed > 0 ? 1 : -1) * dtScale;
        if (left) vehicle.angle += turnFactor;
        if (right) vehicle.angle -= turnFactor;
      }
      vehicle.x += Math.sin(vehicle.angle) * vehicle.speed * dtScale;
      vehicle.z += Math.cos(vehicle.angle) * vehicle.speed * dtScale;
      vehicle.x = Math.max(-WORLD_HALF + 30, Math.min(WORLD_HALF - 30, vehicle.x));
      vehicle.z = Math.max(-WORLD_HALF + 30, Math.min(WORLD_HALF - 30, vehicle.z));

      carGroup.position.set(vehicle.x, 0, vehicle.z);
      carGroup.rotation.y = vehicle.angle;
      const wheelSpin = vehicle.speed * 3 * dtScale;
      for (let w = 0; w < wheels.length; w++) wheels[w].rotation.x += wheelSpin;

      // ── Camera follow ──────────────────────────────────────────────────
      carMatrix.makeRotationY(vehicle.angle);
      desiredPos.copy(cameraOffset).applyMatrix4(carMatrix).add(carGroup.position);
      smoothCamPos.lerp(desiredPos, 0.06);
      camera.position.copy(smoothCamPos);
      lookTarget.copy(cameraLookOffset).applyMatrix4(carMatrix).add(carGroup.position);
      camera.lookAt(lookTarget);

      // ── Time-of-day visuals (smooth) ───────────────────────────────────
      // dayFactor: ~0 at midnight, ~1 at noon
      const dayFactor = Math.max(0, Math.min(1,
        Math.sin(((simHour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5,
      ));
      tmpSky.copy(skyNight).lerp(skyDay, dayFactor);
      tmpAmb.copy(ambNight).lerp(ambDay, dayFactor);
      scene.background = tmpSky;
      fog.color.copy(tmpSky);
      hemi.color.copy(tmpAmb);
      hemi.intensity = 0.35 + dayFactor * 0.4;
      sun.intensity = 0.2 + dayFactor * 0.95;
      sun.color.copy(sunNight).lerp(sunDay, dayFactor);

      // Building emissive at night (toggle via material)
      const nightGlow = (1 - dayFactor) * 0.45;
      for (let i = 0; i < buildingMaterials.length; i++) {
        buildingMaterials[i].emissiveIntensity = nightGlow;
      }

      // ── Animate rings + flags every other frame ───────────────────────
      if (frameIdx % 2 === 0) {
        const t2 = now * 0.002;
        for (let i = 0; i < stationVis.length; i++) {
          const sv = stationVis[i];
          const s = 1 + Math.sin(t2 + i * 0.5) * 0.25;
          sv.ring.scale.set(s, s, 1);
          (sv.ring.material as MeshBasicMaterial).opacity = 0.25 + Math.sin(t2 + i * 0.5) * 0.15;
          sv.pillar.rotation.y += 0.008;
        }
        for (let i = 0; i < priorityVis.length; i++) {
          const pv = priorityVis[i];
          pv.flag.rotation.y += 0.02;
          (pv.beam.material as MeshBasicMaterial).opacity = 0.35 + Math.sin(t2 * 1.4 + i) * 0.2;
        }
      }

      // ── Nearest station (every 3rd frame) ─────────────────────────────
      if (frameIdx % 3 === 0) {
        let nDist = Infinity;
        let nearest: ChargingStation | null = null;
        for (let i = 0; i < stationVis.length; i++) {
          const sp = stationVis[i];
          const dx = vehicle.x - sp.wx;
          const dz = vehicle.z - sp.wz;
          const d2 = dx * dx + dz * dz;
          if (d2 < nDist) { nDist = d2; nearest = sp.station; }
        }
        const dist = Math.sqrt(nDist);
        const id = nearest?.id ?? null;
        // Emit only when target ID changes OR distance crosses display threshold
        if (id !== lastNearestId || frameIdx % 30 === 0) {
          lastNearestId = id;
          onNearestStationRef.current(nearest, dist);
        }

        // Nearest priority zone
        let pDist = Infinity;
        let pNearest: PriorityZone | null = null;
        for (let i = 0; i < priorityVis.length; i++) {
          const pv = priorityVis[i];
          const dx = vehicle.x - pv.wx;
          const dz = vehicle.z - pv.wz;
          const d2 = dx * dx + dz * dz;
          if (d2 < pDist) { pDist = d2; pNearest = pv.zone; }
        }
        const pDistF = Math.sqrt(pDist);
        const pId = pNearest?.id ?? null;
        if (pId !== lastNearestPriorityId || frameIdx % 30 === 0) {
          lastNearestPriorityId = pId;
          onNearestPriorityRef.current(pNearest, pDistF);
        }
      }

      // ── Throttle position/speed/time emission to 10 Hz ────────────────
      if (frameIdx % 6 === 0) {
        const displaySpeed = Math.abs(vehicle.speed) * 60;
        const hourInt = Math.floor(simHour);
        onTickRef.current({
          x: vehicle.x, z: vehicle.z, angle: vehicle.angle,
          speed: displaySpeed, hour: hourInt,
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ──────────────────────────────────────────────────────────
    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      groundTex.dispose();
      heatTex.dispose();
      buildingGeo.dispose();
      buildingInstances.forEach((b) => { b.dispose(); });
      buildingMaterials.forEach((m) => m.dispose());
      pillarGeo.dispose(); sphereGeo.dispose(); ringGeo.dispose();
      signPostGeo.dispose(); signPlateGeo.dispose();
      beamGeo.dispose(); flagGeo.dispose();
      Object.values(stationMatCache).forEach((m) => {
        m.pillar.dispose(); m.sphere.dispose(); m.ring.dispose();
      });
      signPostMat.dispose(); signPlateMat.dispose();
      beamMat.dispose(); flagMat.dispose();
      bodyGeo.dispose(); bodyMat.dispose();
      cabinGeo.dispose(); cabinMat.dispose();
      wheelGeo.dispose(); wheelMat.dispose();
      headlightGeo.dispose(); headlightMat.dispose(); tailMat.dispose();
      carShadowGeo.dispose(); carShadowMat.dispose();
      groundGeo.dispose(); groundMat.dispose();
      heatGeo.dispose(); heatMat.dispose();
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    initScene();
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [initScene]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}
