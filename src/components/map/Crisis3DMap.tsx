import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  Box,
  Compass,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Cross,
  Home,
  Bot,
  AlertTriangle,
  Radio,
  Layers,
  Droplets,
} from 'lucide-react';

export const Crisis3DMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    roads,
    facilities,
    assets,
    selectedRoad,
    openRoadDetailModal,
    openRoverModal,
    isSimulationActive,
    activeRouteId,
    layerFilters,
  } = useCrisisStore();

  const [cameraPreset, setCameraPreset] = useState<'overview' | 'broadway' | 'zoneC' | 'routeB'>('overview');
  const [waterLevel, setWaterLevel] = useState<number>(0.48);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number>(0);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const vehiclesGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050506);
    scene.fog = new THREE.FogExp2(0x050506, 0.0022);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 180, 260);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x64748b, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    sunLight.position.set(150, 250, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 800;
    sunLight.shadow.camera.left = -250;
    sunLight.shadow.camera.right = 250;
    sunLight.shadow.camera.top = 250;
    sunLight.shadow.camera.bottom = -250;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x0f172a, 0x020617, 0.8);
    scene.add(hemiLight);

    // 5. Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(800, 800, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f18,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(800, 80, 0x1e293b, 0x0f172a);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 6. River Channel Geometry
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-350, 0, -180),
      new THREE.Vector3(-150, 0, -80),
      new THREE.Vector3(20, 0, 40),
      new THREE.Vector3(180, 0, 160),
      new THREE.Vector3(350, 0, 260),
    ]);
    const riverPoints = riverCurve.getPoints(50);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 64, 28, 8, false);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.scale.set(1, 0.1, 1);
    riverMesh.position.y = -0.8;
    scene.add(riverMesh);

    // 7. Flood Water Plane
    const waterGeo = new THREE.PlaneGeometry(320, 320, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.5,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(-60, 2.5, 40);
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 8. Procedural City Buildings (Extruded Blocks)
    const buildingsGroup = new THREE.Group();
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x111c2e,
      roughness: 0.5,
      metalness: 0.4,
    });
    const buildingEdgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });

    // Generate procedural cityscape clusters
    const buildingCoords: [number, number, number, number, number][] = [
      // x, z, width, depth, height
      [-120, -100, 30, 25, 45],
      [-80, -120, 22, 22, 60],
      [-140, -60, 28, 32, 35],
      [60, -90, 35, 30, 70],
      [110, -70, 25, 25, 50],
      [80, -140, 30, 28, 40],
      [-90, 80, 24, 24, 30],
      [-130, 110, 32, 28, 25],
      [90, 90, 30, 30, 55],
      [140, 70, 25, 25, 40],
      [110, 130, 28, 28, 35],
      [-30, -150, 20, 20, 48],
      [20, -160, 22, 22, 52],
      [-20, 140, 25, 25, 28],
    ];

    buildingCoords.forEach(([x, z, w, d, h]) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const bMesh = new THREE.Mesh(geo, buildingMat);
      bMesh.position.set(x, h / 2, z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;

      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, buildingEdgeMat);
      bMesh.add(line);
      buildingsGroup.add(bMesh);
    });
    scene.add(buildingsGroup);

    // 9. 3D Roads Layer
    const roadsGroup = new THREE.Group();

    // Broadway St. (Curve)
    const broadwayCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(50, 1, -140),
      new THREE.Vector3(20, 1, -40),
      new THREE.Vector3(-30, 1, 40),
      new THREE.Vector3(-90, 1, 140),
    ]);
    const broadwayGeo = new THREE.TubeGeometry(broadwayCurve, 40, 3.5, 6, false);
    const broadwayMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const broadwayMesh = new THREE.Mesh(broadwayGeo, broadwayMat);
    broadwayMesh.name = 'road-broadway';
    roadsGroup.add(broadwayMesh);

    // Route B (East Causeway)
    const routeBCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-100, 3, -140),
      new THREE.Vector3(-20, 5, -60),
      new THREE.Vector3(80, 4, 20),
      new THREE.Vector3(160, 2, 140),
    ]);
    const routeBGeo = new THREE.TubeGeometry(routeBCurve, 40, 3.8, 6, false);
    const routeBMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      emissive: 0x166534,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const routeBMesh = new THREE.Mesh(routeBGeo, routeBMat);
    routeBMesh.name = 'road-route-b';
    roadsGroup.add(routeBMesh);

    // North Crossing Way
    const northCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-150, 4, 30),
      new THREE.Vector3(-30, 4, 50),
      new THREE.Vector3(70, 3, 70),
      new THREE.Vector3(180, 2, 90),
    ]);
    const northGeo = new THREE.TubeGeometry(northCurve, 32, 3.2, 6, false);
    const northMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
    });
    const northMesh = new THREE.Mesh(northGeo, northMat);
    roadsGroup.add(northMesh);

    // Riverside Pkwy
    const riverPkwyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-140, 1, -80),
      new THREE.Vector3(-40, 1, -20),
      new THREE.Vector3(60, 1, 60),
      new THREE.Vector3(140, 1, 110),
    ]);
    const riverPkwyGeo = new THREE.TubeGeometry(riverPkwyCurve, 32, 3.2, 6, false);
    const riverPkwyMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.4,
    });
    const riverPkwyMesh = new THREE.Mesh(riverPkwyGeo, riverPkwyMat);
    roadsGroup.add(riverPkwyMesh);

    scene.add(roadsGroup);

    // 10. Moving 3D Emergency Assets & Rovers
    const vehiclesGroup = new THREE.Group();
    vehiclesGroupRef.current = vehiclesGroup;

    // ROVER-07 Mesh (Futuristic Rover with LIDAR sensor top)
    const roverBodyGeo = new THREE.BoxGeometry(6, 3, 8);
    const roverMat = new THREE.MeshStandardMaterial({ color: 0x00434d, metalness: 0.8, roughness: 0.2 });
    const roverMesh = new THREE.Mesh(roverBodyGeo, roverMat);
    roverMesh.position.set(10, 2, -10);

    const lidarGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.5, 12);
    const lidarMat = new THREE.MeshStandardMaterial({ color: 0x8dd2e1, emissive: 0x005c69 });
    const lidar = new THREE.Mesh(lidarGeo, lidarMat);
    lidar.position.y = 2.2;
    roverMesh.add(lidar);
    roverMesh.name = 'asset-rover-07';
    vehiclesGroup.add(roverMesh);

    // Ambulance MED-104
    const ambGeo = new THREE.BoxGeometry(5, 4, 9);
    const ambMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ambMesh = new THREE.Mesh(ambGeo, ambMat);
    ambMesh.position.set(-20, 2.5, 0);

    const lightBarGeo = new THREE.BoxGeometry(3, 0.8, 1);
    const lightBarMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, emissive: 0xff0000, emissiveIntensity: 1 });
    const lightBar = new THREE.Mesh(lightBarGeo, lightBarMat);
    lightBar.position.y = 2.4;
    ambMesh.add(lightBar);
    vehiclesGroup.add(ambMesh);

    scene.add(vehiclesGroup);

    // 11. Weather Particles (Rain / Mist)
    const rainGeo = new THREE.BufferGeometry();
    const rainCount = 1200;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 500;
      rainPositions[i + 1] = Math.random() * 200;
      rainPositions[i + 2] = (Math.random() - 0.5) * 500;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.8,
      transparent: true,
      opacity: 0.6,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // 12. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate water flood ripple
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = 2.5 + Math.sin(elapsedTime * 1.5) * 0.4;
      }

      // Animate rain falling
      const positions = rainGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < rainCount * 3; i += 3) {
        positions[i] -= 2.5;
        if (positions[i] < 0) {
          positions[i] = 200;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Animate Rover movement along path
      roverMesh.position.x = 10 + Math.sin(elapsedTime * 0.8) * 20;
      roverMesh.position.z = -10 + Math.cos(elapsedTime * 0.8) * 15;
      roverMesh.rotation.y = elapsedTime * 0.8;

      // Animate Ambulance
      ambMesh.position.x = -20 + Math.cos(elapsedTime * 0.6) * 30;
      ambMesh.position.z = Math.sin(elapsedTime * 0.6) * 25;

      renderer.render(scene, camera);
    };

    animate();

    // 13. Window Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 14. Click Handler for 3D Objects
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

      for (const hit of intersects) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.name === 'road-broadway') {
            openRoadDetailModal('road-broadway');
            return;
          }
          if (obj.name === 'asset-rover-07') {
            openRoverModal('asset-rover-07');
            return;
          }
          obj = obj.parent;
        }
      }
    };

    container.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(reqIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Preset Camera Controller
  const applyCameraPreset = (preset: 'overview' | 'broadway' | 'zoneC' | 'routeB') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    const cam = cameraRef.current;

    switch (preset) {
      case 'broadway':
        cam.position.set(20, 80, 110);
        cam.lookAt(0, 0, 0);
        break;
      case 'zoneC':
        cam.position.set(-100, 90, 80);
        cam.lookAt(-40, 0, 30);
        break;
      case 'routeB':
        cam.position.set(40, 120, 160);
        cam.lookAt(60, 5, 0);
        break;
      case 'overview':
      default:
        cam.position.set(0, 180, 260);
        cam.lookAt(0, 0, 0);
        break;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-144px)] md:min-h-[calc(100vh-64px)] overflow-hidden bg-[#050506] select-none text-slate-200">
      {/* ThreeJS WebGL Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Digital Twin HUD Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        <div className="bg-[#0a0a0c]/90 px-3 py-1.5 rounded border border-white/10 shadow-xl flex items-center gap-2 text-[11px] font-mono font-bold text-white">
          <Box className="w-3.5 h-3.5 text-blue-400" />
          <span>3D DIGITAL TWIN ACTIVE</span>
        </div>

        {isSimulationActive && (
          <div className="bg-red-950/90 text-red-300 border border-red-500/40 px-3 py-1.5 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xl animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>DISRUPTION: BROADWAY ST. CLOSED</span>
          </div>
        )}
      </div>

      {/* Preset Camera Views (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-[#0a0a0c]/90 p-2 rounded-lg shadow-xl border border-white/10 flex flex-col gap-1 text-xs backdrop-blur-xs">
          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest px-2 pt-1">
            Camera Angles
          </span>
          <button
            onClick={() => applyCameraPreset('overview')}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold text-left transition-colors cursor-pointer ${
              cameraPreset === 'overview'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                : 'text-white/80 hover:bg-white/5'
            }`}
          >
            City Overview
          </button>
          <button
            onClick={() => applyCameraPreset('broadway')}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold text-left transition-colors cursor-pointer ${
              cameraPreset === 'broadway'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                : 'text-white/80 hover:bg-white/5'
            }`}
          >
            Broadway St. Inundation
          </button>
          <button
            onClick={() => applyCameraPreset('zoneC')}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold text-left transition-colors cursor-pointer ${
              cameraPreset === 'zoneC'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                : 'text-white/80 hover:bg-white/5'
            }`}
          >
            Zone C Sector Aerial
          </button>
          <button
            onClick={() => applyCameraPreset('routeB')}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-semibold text-left transition-colors cursor-pointer ${
              cameraPreset === 'routeB'
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                : 'text-white/80 hover:bg-white/5'
            }`}
          >
            Route B Corridor
          </button>
        </div>

        {/* 3D Teleoperation Shortcut */}
        <button
          onClick={() => openRoverModal('asset-rover-07')}
          className="bg-[#0a0a0c]/90 p-2.5 rounded-lg shadow-xl border border-white/10 flex items-center justify-between text-xs font-mono font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-[#00ff99]" />
            <span>ROVER-07 Feed</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#00ff99] animate-ping" />
        </button>
      </div>

      {/* Floating 3D Interaction Hint */}
      <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-[#0a0a0c]/90 px-4 py-1.5 rounded border border-white/10 shadow-xl text-[11px] font-mono font-medium text-slate-300 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>Click Broadway St. in 3D to inspect uncertainty & run What-If simulations</span>
        </div>
      </div>
    </div>
  );
};
