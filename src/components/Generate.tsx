import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { OrbitControls } from 'three-stdlib';
import { Link, useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settings';

const Generate = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<Record<string, number[]>>({});
  const { geminiApiKey } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const canvas = document.querySelector('#threejs-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0a0a);

    if (containerRef.current) {
      renderer.setSize(
        containerRef.current.clientWidth - 30,
        containerRef.current.clientHeight - 30
      );
    }

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);

    if (containerRef.current) {
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
    }

    // Grid setup
    const gridSize = 20;
    const divisions = 5;
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x222222, 0x1a1a1a);
    gridHelper.position.set(gridSize / 2, 0, gridSize / 2);
    scene.add(gridHelper);

    // Create axes helper
    const axesHelper = new THREE.AxesHelper(gridSize);
    scene.add(axesHelper);

    camera.position.x = gridSize;
    camera.position.y = gridSize / 2 + gridSize;
    camera.position.z = gridSize / 2 + gridSize;

    const divisionSize = gridSize / divisions;

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(gridSize, gridSize, 10, 10);
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('/texture.jpeg');
    const floorMaterial = new THREE.MeshBasicMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
      color: 'white',
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.set(gridSize / 2, 0, gridSize / 2);
    scene.add(floor);

    // Walls
    const wallTexture = textureLoader.load('wall.jpg');
    const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.DoubleSide });

    const xAxisPlane = new THREE.Mesh(floorGeometry, wallMaterial);
    xAxisPlane.position.set(gridSize / 2, gridSize / 2, 0);
    scene.add(xAxisPlane);

    const zAxisPlane = new THREE.Mesh(floorGeometry, wallMaterial);
    zAxisPlane.rotation.y = Math.PI / 2;
    zAxisPlane.position.set(0, gridSize / 2, gridSize / 2);
    scene.add(zAxisPlane);

    function createCube(size: number, x: number, y: number) {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x * divisionSize - size / 2, size / 2, +y * divisionSize - size / 2);
      scene.add(cube);

      // Wireframe
      const wireGeo = new THREE.EdgesGeometry(geometry);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x333333 });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      wireframe.position.copy(cube.position);
      scene.add(wireframe);
    }

    function createLabel(text: string, x: number, y: number, z: number) {
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 150;
      labelCanvas.height = 150;
      const context = labelCanvas.getContext('2d');
      if (!context) return;
      context.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      context.font = '36px Inter, sans-serif';
      context.fillStyle = '#ffffff';
      context.fillText(text, 0, labelCanvas.height / 2);

      const texture = new THREE.CanvasTexture(labelCanvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(2, 2, 1);
      sprite.position.set(x, y, z);
      scene.add(sprite);
    }

    createLabel('X', gridSize + 1, 0, 0);
    createLabel('Z', 0, gridSize + 1, 0);
    createLabel('Y', 0, 0, gridSize + 1);

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    Object.entries(content).forEach(([objectName, coord]) => {
      createCube(divisionSize, coord[0], coord[1]);
      createLabel(objectName, coord[0] * divisionSize, divisionSize, coord[1] * divisionSize);
    });

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, [content]);

  const [tempPrompt, setTempPrompt] = useState('Convert it into reality!');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!geminiApiKey) {
      alert("Please configure your Gemini API Key in the Profile > Preferences tab first.");
      navigate('/profile');
      return;
    }
    
    setIsLoading(true);
    axios
      .get(`http://localhost:4000/generate?prompt=${tempPrompt}`, {
        headers: { 'x-gemini-key': geminiApiKey }
      })
      .then((response) => {
        setContent(response.data.coordinates);
      })
      .catch((error) => {
        console.error('There was an error!', error);
        if (error.response?.status === 401) {
          alert('Invalid API Key. Please update it in your Profile Preferences.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

  };

  return (
    <div className="page-wrapper flex flex-col items-center justify-center gap-8 px-6 pt-24 pb-10 lg:flex-row lg:gap-12 lg:px-16">
      {/* Left panel */}
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-[13px] text-[#555] transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-2xl font-bold text-white">Generate</h1>
        <p className="mt-2 text-[14px] text-[#555]">
          Describe your architectural concept
        </p>

        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#888]">
            <div className="h-3 w-3 animate-spin rounded-full border border-[#333] border-t-white" />
            Processing...
          </div>
        )}

        <input
          type="text"
          value={tempPrompt}
          onChange={(e) => setTempPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="input-field mt-6"
          placeholder="Describe your structure..."
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary mt-4 w-full disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* 3D Viewport */}
      <div
        className="relative z-10 h-[60vh] w-full max-w-3xl overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a]"
        ref={containerRef}
      >
        <canvas id="threejs-canvas" className="h-full w-full" />
      </div>
    </div>
  );
};

export default Generate;
