import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RotateCw, Pause, Play, Sparkles, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThreeTrophyCanvasProps {
  className?: string;
  onSelectTrophy?: () => void;
}

export const ThreeTrophyCanvas: React.FC<ThreeTrophyCanvasProps> = ({
  className = '',
  onSelectTrophy,
}) => {
  const { isDark } = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [activeFinish, setActiveFinish] = useState<'gold' | 'platinum' | 'obsidian'>('gold');
  const [activeCameraAngle, setActiveCameraAngle] = useState<'front' | 'dramatic' | 'top'>('front');
  const [isHovered, setIsHovered] = useState(false);

  // References to communicate with the render loop without tearing down WebGL
  const stateRef = useRef({
    isRotating: true,
    rotationSpeed: 1.0,
    trophyGroup: null as THREE.Group | null,
    ballAssembly: null as THREE.Group | null,
    materials: [] as THREE.MeshStandardMaterial[],
    baseMat: null as THREE.MeshStandardMaterial | null,
    keySpot: null as THREE.SpotLight | null,
    rimLight: null as THREE.DirectionalLight | null,
    goldUplight: null as THREE.PointLight | null,
    hemiLight: null as THREE.HemisphereLight | null,
    scene: null as THREE.Scene | null,
    groundMat: null as THREE.MeshBasicMaterial | null,
    holoMat: null as THREE.MeshBasicMaterial | null,
    shadowVeil: null as THREE.MeshBasicMaterial | null,
    targetCamPos: new THREE.Vector3(0, 0.7, 4.3),
    targetLookAt: new THREE.Vector3(0, 0.2, 0),
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    mouseOffset: { x: 0, y: 0 },
  });

  // Keep stateRef synced with React state
  useEffect(() => {
    stateRef.current.isRotating = isRotating;
    stateRef.current.rotationSpeed = rotationSpeed;
  }, [isRotating, rotationSpeed]);

  // Update materials when finish changes
  useEffect(() => {
    const materials = stateRef.current.materials;
    if (!materials || materials.length === 0) return;

    let mainColor = 0xffd700;
    let roughness = 0.14;
    let metalness = 0.96;

    if (activeFinish === 'platinum') {
      mainColor = 0xe2e8f0;
      roughness = 0.10;
      metalness = 0.98;
    } else if (activeFinish === 'obsidian') {
      mainColor = 0x1e293b;
      roughness = 0.22;
      metalness = 0.88;
    }

    materials.forEach((mat) => {
      mat.color.setHex(mainColor);
      mat.roughness = roughness;
      mat.metalness = metalness;
      mat.needsUpdate = true;
    });
  }, [activeFinish]);

  // Update lighting and atmosphere when theme toggles
  useEffect(() => {
    const { keySpot, rimLight, hemiLight, scene, baseMat, groundMat, holoMat } = stateRef.current;
    if (!scene) return;

    if (isDark) {
      scene.fog = new THREE.FogExp2(0x080b11, 0.045);
      if (keySpot) keySpot.intensity = 8.5;
      if (rimLight) {
        rimLight.color.setHex(0x38bdf8);
        rimLight.intensity = 4.0;
      }
      if (hemiLight) {
        hemiLight.color.setHex(0xffffff);
        hemiLight.groundColor.setHex(0x080b11);
        hemiLight.intensity = 1.0;
      }
      if (baseMat) {
        baseMat.color.setHex(0x0f172a);
        baseMat.roughness = 0.35;
      }
      if (groundMat) groundMat.opacity = 0.55;
      if (holoMat) holoMat.color.setHex(0xf59e0b);
    } else {
      scene.fog = new THREE.FogExp2(0xf8fafc, 0.035);
      if (keySpot) keySpot.intensity = 7.0;
      if (rimLight) {
        rimLight.color.setHex(0x93c5fd);
        rimLight.intensity = 3.2;
      }
      if (hemiLight) {
        hemiLight.color.setHex(0xfffbeb);
        hemiLight.groundColor.setHex(0xe2e8f0);
        hemiLight.intensity = 1.4;
      }
      if (baseMat) {
        baseMat.color.setHex(0x1e293b);
        baseMat.roughness = 0.28;
      }
      if (groundMat) groundMat.opacity = 0.25;
      if (holoMat) holoMat.color.setHex(0xd97706);
    }
  }, [isDark]);

  // Update camera angle presets
  useEffect(() => {
    if (activeCameraAngle === 'front') {
      stateRef.current.targetCamPos.set(0, 0.7, 4.3);
      stateRef.current.targetLookAt.set(0, 0.2, 0);
    } else if (activeCameraAngle === 'dramatic') {
      stateRef.current.targetCamPos.set(2.2, -0.3, 3.4);
      stateRef.current.targetLookAt.set(0, 0.4, 0);
    } else if (activeCameraAngle === 'top') {
      stateRef.current.targetCamPos.set(0, 3.6, 2.8);
      stateRef.current.targetLookAt.set(0, 0.1, 0);
    }
  }, [activeCameraAngle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x080b11 : 0xf8fafc, 0.04);
    stateRef.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0.7, 4.3);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    // Warm Key Spotlight
    const keySpot = new THREE.SpotLight(0xfffaed, isDark ? 8.5 : 7.0);
    keySpot.position.set(3, 5, 4);
    keySpot.angle = Math.PI / 4;
    keySpot.penumbra = 0.55;
    keySpot.castShadow = !isSoftwareGl;
    keySpot.shadow.bias = -0.0005;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    scene.add(keySpot);
    stateRef.current.keySpot = keySpot;

    // Cool Rim Light for silhouette edge definition
    const rimLight = new THREE.DirectionalLight(isDark ? 0x38bdf8 : 0x93c5fd, isDark ? 4.0 : 3.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);
    stateRef.current.rimLight = rimLight;

    // Warm Golden Uplight
    const goldUplight = new THREE.PointLight(0xf59e0b, 5.0, 10);
    goldUplight.position.set(0, -1.2, 1.5);
    scene.add(goldUplight);
    stateRef.current.goldUplight = goldUplight;

    // Soft Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, isDark ? 0x080b11 : 0xe2e8f0, isDark ? 1.0 : 1.4);
    scene.add(hemiLight);
    stateRef.current.hemiLight = hemiLight;

    // 6. Build the Composite 3D Trophy Model
    const trophyGroup = new THREE.Group();
    stateRef.current.trophyGroup = trophyGroup;
    scene.add(trophyGroup);

    // Master Gold PBR Material
    const trophyGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.96,
      roughness: 0.14,
      envMapIntensity: 1.7,
    });
    stateRef.current.materials.push(trophyGoldMat);

    // Accent Polished Brass Material
    const trophyAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.98,
      roughness: 0.11,
      envMapIntensity: 1.9,
    });
    stateRef.current.materials.push(trophyAccentMat);

    // Base Pedestal Plinth Material (Dark Obsidian & Gold Chamfer)
    const baseMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0x1e293b,
      metalness: 0.45,
      roughness: 0.32,
    });
    stateRef.current.baseMat = baseMat;

    // A sculptural cricket trophy: an obsidian plinth carries four polished
    // metal ribbons that cradle a hand-finished cricket ball. This replaces the
    // generic cup silhouette with a distinct championship mark.
    const addShadowMesh = (mesh: THREE.Mesh) => {
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      trophyGroup.add(mesh);
      return mesh;
    };

    const plinthBottom = addShadowMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.02, 0.2, 48), baseMat)
    );
    plinthBottom.position.y = -1.2;

    const plinthBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.89, 0.035, 12, 48),
      trophyAccentMat
    );
    plinthBand.rotation.x = Math.PI / 2;
    plinthBand.position.y = -1.1;
    trophyGroup.add(plinthBand);

    const plinthShoulder = addShadowMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 0.34, 48), baseMat)
    );
    plinthShoulder.position.y = -0.96;

    const plinthTop = addShadowMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.6, 0.16, 48), trophyGoldMat)
    );
    plinthTop.position.y = -0.71;

    const neck = addShadowMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.27, 0.54, 32), trophyGoldMat)
    );
    neck.position.y = -0.39;

    const neckBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.026, 12, 32),
      trophyAccentMat
    );
    neckBand.rotation.x = Math.PI / 2;
    neckBand.position.y = -0.16;
    trophyGroup.add(neckBand);

    const ballLeatherMat = new THREE.MeshPhysicalMaterial({
      color: 0x4a1016,
      metalness: 0.08,
      roughness: 0.24,
      clearcoat: 0.42,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.35,
      transparent: true,
      opacity: 1,
    });
    const ballAssembly = new THREE.Group();
    ballAssembly.position.y = 1.12;
    stateRef.current.ballAssembly = ballAssembly;
    trophyGroup.add(ballAssembly);

    const cricketBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 48, 32),
      ballLeatherMat
    );
    cricketBall.castShadow = !isSoftwareGl;
    ballAssembly.add(cricketBall);

    const seamMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4c96b,
      metalness: 0.72,
      roughness: 0.22,
      envMapIntensity: 1.6,
      transparent: true,
      opacity: 1,
    });
    const seamGroup = new THREE.Group();
    seamGroup.rotation.y = 0.42;
    const ballSeam = new THREE.Mesh(
      new THREE.TorusGeometry(0.347, 0.011, 10, 72),
      seamMaterial
    );
    seamGroup.add(ballSeam);

    // Raised stitches make the cricket-ball seam readable even at hero scale.
    const stitchGeometry = new THREE.BoxGeometry(0.044, 0.012, 0.018);
    for (let index = 0; index < 18; index += 1) {
      const angle = -1.08 + index * 0.128;
      const stitch = new THREE.Mesh(stitchGeometry, seamMaterial);
      stitch.position.set(Math.cos(angle) * 0.349, Math.sin(angle) * 0.349, 0.018);
      stitch.rotation.z = angle + Math.PI / 2;
      seamGroup.add(stitch);
    }
    ballAssembly.add(seamGroup);

    // A bespoke championship maker's plate—not an imitation of any official logo.
    const crestCanvas = document.createElement('canvas');
    crestCanvas.width = 512;
    crestCanvas.height = 256;
    const crestContext = crestCanvas.getContext('2d');
    if (crestContext) {
      crestContext.fillStyle = '#182230';
      crestContext.fillRect(0, 0, crestCanvas.width, crestCanvas.height);
      crestContext.strokeStyle = '#e8bd61';
      crestContext.lineWidth = 10;
      crestContext.strokeRect(12, 12, crestCanvas.width - 24, crestCanvas.height - 24);
      crestContext.fillStyle = '#f5d57d';
      crestContext.font = 'bold 92px Arial';
      crestContext.textAlign = 'center';
      crestContext.fillText('ICC', 256, 105);
      crestContext.font = '600 24px Arial';
      crestContext.fillText('CRICKET WORLD CUP', 256, 166);
    }
    const crestTexture = new THREE.CanvasTexture(crestCanvas);
    crestTexture.colorSpace = THREE.SRGBColorSpace;
    const crest = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.29),
      new THREE.MeshStandardMaterial({ map: crestTexture, metalness: 0.5, roughness: 0.28 })
    );
    crest.position.set(0, -0.95, 0.79);
    trophyGroup.add(crest);

    const createRibbon = (angle: number, material: THREE.Material, offset: number) => {
      const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const sideways = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.16, -0.28, 0).addScaledVector(direction, offset),
        new THREE.Vector3().addScaledVector(direction, 0.48).addScaledVector(sideways, 0.09).setY(0.02),
        new THREE.Vector3().addScaledVector(direction, 0.7).addScaledVector(sideways, -0.08).setY(0.52),
        new THREE.Vector3().addScaledVector(direction, 0.43).setY(0.9),
        new THREE.Vector3().addScaledVector(direction, 0.22).setY(1.15),
      ]);
      const ribbon = new THREE.Mesh(
        new THREE.TubeGeometry(path, 72, 0.074, 16, false),
        material
      );
      ribbon.castShadow = !isSoftwareGl;
      trophyGroup.add(ribbon);
    };

    createRibbon(0.18, trophyGoldMat, 0.02);
    createRibbon(Math.PI + 0.18, trophyGoldMat, 0.02);
    createRibbon(Math.PI / 2 + 0.18, trophyAccentMat, -0.02);
    createRibbon(-Math.PI / 2 + 0.18, trophyAccentMat, -0.02);

    // 7. Ground Contact Shadow & Halo Ring
    const groundShadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const groundShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: isDark ? 0.55 : 0.25,
    });
    stateRef.current.groundMat = groundShadowMat;
    const groundShadow = new THREE.Mesh(groundShadowGeo, groundShadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -1.22;
    scene.add(groundShadow);

    // Glowing Ring on Ground
    const holoRingGeo = new THREE.RingGeometry(1.2, 1.28, 48);
    const holoRingMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xf59e0b : 0xd97706,
      transparent: true,
      opacity: isDark ? 0.45 : 0.25,
      side: THREE.DoubleSide,
    });
    stateRef.current.holoMat = holoRingMat;
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.rotation.x = -Math.PI / 2;
    holoRing.position.y = -1.21;
    scene.add(holoRing);

    // Three separated orbit markers make the floor ring's rotation readable.
    const orbitMarkers = new THREE.Group();
    for (let index = 0; index < 3; index += 1) {
      const marker = new THREE.Mesh(
        new THREE.TorusGeometry(1.25, 0.018, 8, 28, Math.PI * 0.22),
        new THREE.MeshBasicMaterial({ color: 0xf7d36c, transparent: true, opacity: 0.82 })
      );
      marker.rotation.x = -Math.PI / 2;
      marker.rotation.z = index * ((Math.PI * 2) / 3);
      orbitMarkers.add(marker);
    }
    orbitMarkers.position.y = -1.19;
    scene.add(orbitMarkers);

    // A soft foreground veil lets the sculpture recede into darkness without
    // intersecting the solid ground geometry when the user scrolls.
    const veilCanvas = document.createElement('canvas');
    veilCanvas.width = 32;
    veilCanvas.height = 256;
    const veilContext = veilCanvas.getContext('2d');
    if (veilContext) {
      const veilGradient = veilContext.createLinearGradient(0, 0, 0, veilCanvas.height);
      veilGradient.addColorStop(0, 'rgba(2, 5, 10, 0)');
      veilGradient.addColorStop(0.46, 'rgba(2, 5, 10, 0.2)');
      veilGradient.addColorStop(1, 'rgba(2, 5, 10, 1)');
      veilContext.fillStyle = veilGradient;
      veilContext.fillRect(0, 0, veilCanvas.width, veilCanvas.height);
    }
    const shadowVeilMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(veilCanvas),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    stateRef.current.shadowVeil = shadowVeilMat;
    const shadowVeil = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.9), shadowVeilMat);
    shadowVeil.position.set(0, -0.12, 1.05);
    scene.add(shadowVeil);

    // 8. Floating Golden Dust Sparks
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.5 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 9. Post-Processing Setup (EffectComposer + UnrealBloomPass)
    let composer: EffectComposer | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        0.35, // strength
        0.35, // radius
        0.85  // threshold
      );
      composer.addPass(bloomPass);
    }

    // 10. Interactive Drag & Parallax Events
    const handlePointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevPointerX = e.clientX;
      stateRef.current.prevPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Subtle mouse parallax calculation
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      stateRef.current.mouseOffset.x = normX;
      stateRef.current.mouseOffset.y = normY;

      // 360 Drag rotation
      if (stateRef.current.isDragging && trophyGroup) {
        const deltaX = e.clientX - stateRef.current.prevPointerX;
        stateRef.current.prevPointerX = e.clientX;
        trophyGroup.rotation.y += deltaX * 0.01;
      }
    };

    const handlePointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const canvasDom = renderer.domElement;
    let scrollProgress = 0;
    let retreatMotion = 0;
    const handleScroll = () => {
      scrollProgress = Math.min(1, window.scrollY / Math.max(window.innerHeight * 0.95, 1));
    };
    handleScroll();
    canvasDom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Precision Idle Rotation
      if (stateRef.current.isRotating && !stateRef.current.isDragging && trophyGroup) {
        trophyGroup.rotation.y += delta * 0.65 * stateRef.current.rotationSpeed;
      }

      // The hero moves straight through a separate translucent shadow layer;
      // it never clips into the physical floor or drifts off centre.
      if (trophyGroup) {
        retreatMotion += (scrollProgress - retreatMotion) * Math.min(1, delta * 2.6);
        trophyGroup.position.set(0, Math.sin(time * 1.5) * 0.04 - retreatMotion * 0.38, -retreatMotion * 1.45);
        trophyGroup.scale.setScalar(1 - retreatMotion * 0.12);

        if (stateRef.current.ballAssembly) {
          stateRef.current.ballAssembly.position.set(0, 1.12, 0);
          stateRef.current.ballAssembly.rotation.set(time * 0.42, time * 1.15, 0.12);
        }

        // The key light falls off as the trophy turns away; cool rim light
        // catches its far edge so the silhouette stays deliberate, not flat.
        const facingLight = 0.38 + (Math.sin(trophyGroup.rotation.y) + 1) * 0.42;
        keySpot.intensity = (isDark ? 8.5 : 7.0) * facingLight * (1 - retreatMotion * 0.42);
        keySpot.angle = Math.PI / 4 - retreatMotion * 0.26;
        keySpot.penumbra = 0.55 - retreatMotion * 0.24;
        rimLight.intensity = (isDark ? 4.0 : 3.2) * (1.35 - facingLight * 0.55) * (1 + retreatMotion * 0.42);
        hemiLight.intensity = (isDark ? 1.0 : 1.4) * (1 - retreatMotion * 0.76);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.density = (isDark ? 0.045 : 0.035) + retreatMotion * 0.075;
        }
        if (stateRef.current.shadowVeil) stateRef.current.shadowVeil.opacity = retreatMotion * 0.93;
      }

      // Ring Rotation & Particle Drift
      holoRing.rotation.z += delta * 0.65;
      holoRing.scale.setScalar(1 + Math.sin(time * 2.1) * 0.025);
      orbitMarkers.rotation.y += delta * 0.58;
      particleField.rotation.y += delta * 0.05;

      // Subtle Mouse Parallax on Camera
      const parallaxX = stateRef.current.mouseOffset.x * 0.25;
      const parallaxY = -stateRef.current.mouseOffset.y * 0.15;
      const currentTargetCam = stateRef.current.targetCamPos.clone().add(
        new THREE.Vector3(parallaxX, parallaxY, 0)
      );

      camera.position.lerp(currentTargetCam, 0.05);
      camera.lookAt(stateRef.current.targetLookAt);

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    // 12. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (composer) {
        composer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('scroll', handleScroll);

      if (composer) {
        composer.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border shadow-2xl flex flex-col justify-between group transition-colors duration-500 ${
        isDark
          ? 'bg-radial from-slate-900/90 via-slate-950 to-black border-amber-500/35 shadow-black/80'
          : 'bg-radial from-white via-slate-100 to-slate-200 border-slate-300 shadow-xl'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        stateRef.current.mouseOffset.x = 0;
        stateRef.current.mouseOffset.y = 0;
      }}
    >
      {/* Top Telemetry Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg ${
            isDark
              ? 'bg-slate-950/80 border-amber-500/40 text-amber-300'
              : 'bg-white/85 border-amber-500/40 text-amber-700'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase">
            3D WebGL Championship Cup
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Finish swatches */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/85 border-slate-300'
            }`}
          >
            <button
              onClick={() => setActiveFinish('gold')}
              title="Classic 24K Gold Finish"
              className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                activeFinish === 'gold'
                  ? 'ring-2 ring-amber-400 scale-110 bg-gradient-to-br from-amber-300 to-yellow-600'
                  : 'bg-yellow-700/60 opacity-60 hover:opacity-100'
              }`}
            />
            <button
              onClick={() => setActiveFinish('platinum')}
              title="Platinum Sterling Finish"
              className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                activeFinish === 'platinum'
                  ? 'ring-2 ring-slate-400 scale-110 bg-gradient-to-br from-slate-100 to-slate-400'
                  : 'bg-slate-500/60 opacity-60 hover:opacity-100'
              }`}
            />
            <button
              onClick={() => setActiveFinish('obsidian')}
              title="Obsidian Championship Edition"
              className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                activeFinish === 'obsidian'
                  ? 'ring-2 ring-indigo-400 scale-110 bg-gradient-to-br from-slate-800 to-slate-950'
                  : 'bg-slate-900/60 opacity-60 hover:opacity-100'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport with Touch/Mouse Interaction */}
      <div
        ref={mountRef}
        className="relative w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing"
      />

      {/* Interaction Hint */}
      <div className="absolute inset-x-0 bottom-16 flex justify-center pointer-events-none">
        <span
          className={`text-[11px] font-mono font-semibold px-3 py-1 rounded-full border backdrop-blur-md transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-70'
          } ${
            isDark
              ? 'text-slate-400 bg-slate-950/80 border-slate-800'
              : 'text-slate-600 bg-white/85 border-slate-300'
          }`}
        >
          Drag to Rotate 360° · Tilt for Depth Parallax
        </span>
      </div>

      {/* Bottom Precision Rotation & Angle Control Dock */}
      <div
        className={`relative z-20 px-4 py-3 backdrop-blur-md border-t flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        {/* Rotation Speed & Play/Pause */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300'
            }`}
            title={isRotating ? 'Pause Rotation' : 'Start Precision Rotation'}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div
            className={`flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-mono ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setRotationSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  rotationSpeed === spd
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'bg-amber-500 text-white font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Camera Angle Presets */}
        <div
          className={`flex items-center gap-1 p-0.5 rounded-lg border text-[10px] font-mono ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveCameraAngle('front')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeCameraAngle === 'front'
                ? isDark
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-amber-500 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Center
          </button>
          <button
            onClick={() => setActiveCameraAngle('dramatic')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeCameraAngle === 'dramatic'
                ? isDark
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-amber-500 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hero Rim
          </button>
          <button
            onClick={() => setActiveCameraAngle('top')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeCameraAngle === 'top'
                ? isDark
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-amber-500 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Cup
          </button>
        </div>
      </div>
    </div>
  );
};
