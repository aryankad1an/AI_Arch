import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { OrbitControls } from 'three-stdlib';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { RefreshCcw, Save, MessageSquare, ArrowLeft } from 'lucide-react';
import { useSettingsStore } from '../../store/settings';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<Record<string, number[]>>({});
  const [projectName, setProjectName] = useState('Loading...');
  const [history, setHistory] = useState<string[]>([]);
  const { geminiApiKey } = useSettingsStore();

  const [tempPrompt, setTempPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasId = `threejs-canvas-${id}`;
  const hoverTooltipRef = useRef<HTMLDivElement>(null);

  const loadProject = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/projects/${id}`);
      setProjectName(res.data.name);
      if (res.data.coordinates) setContent(res.data.coordinates);
      if (res.data.promptHistory) setHistory(res.data.promptHistory);
    } catch (e) {
      console.error(e);
      alert("Failed to load project.");
      navigate('/projects');
    }
  };

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      (window.innerWidth / 2) / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const canvas = document.querySelector(`#${canvasId}`) as HTMLCanvasElement;
    if (!canvas) return;

    // Use alpha:true to allow the global grid background to stay visible behind the 3D scene
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    if (containerRef.current) {
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
    }

    const handleResize = () => {
      if (containerRef.current) {
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    let maxDim = 10;
    Object.values(content).forEach(coord => {
      if (Array.isArray(coord) && coord.length >= 2) {
        maxDim = Math.max(maxDim, coord[0], coord[1]);
      }
    });
    const roomSize = Math.ceil(maxDim) + 1; // dynamically scale floor/walls
    const divisionSize = 1; // 1 unit = 1 meter

    const controls = new OrbitControls(camera, renderer.domElement);
    const gridSize = roomSize; 
    const divisions = roomSize;
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x222222, 0x1a1a1a);
    gridHelper.position.set(roomSize / 2, 0.01, roomSize / 2); // Center around middle of the room
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(roomSize);
    scene.add(axesHelper);

    camera.position.x = roomSize * 1.2;
    camera.position.y = roomSize * 1.2;
    camera.position.z = roomSize * 1.2;

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(roomSize, roomSize, Math.min(roomSize, 20), Math.min(roomSize, 20));
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('/texture.jpeg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(roomSize / 10, roomSize / 10); // scale texture natively

    const floorMaterial = new THREE.MeshBasicMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
      color: 'white',
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.set(roomSize / 2, 0, roomSize / 2);
    scene.add(floor);

    // Walls
    const wallGeometry = new THREE.PlaneGeometry(roomSize, 10, Math.min(roomSize, 20), 10);
    const wallTexture = textureLoader.load('/wall.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(roomSize / 10, 1);

    const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.DoubleSide });

    const xAxisPlane = new THREE.Mesh(wallGeometry, wallMaterial);
    xAxisPlane.position.set(roomSize / 2, 5, 0);
    scene.add(xAxisPlane);

    const zAxisPlane = new THREE.Mesh(wallGeometry, wallMaterial);
    zAxisPlane.rotation.y = Math.PI / 2;
    zAxisPlane.position.set(0, 5, roomSize / 2);
    scene.add(zAxisPlane);

    function createCube(size: number, x: number, y: number, color = 0xffffff, itemName: string) {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshBasicMaterial({ color });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x + size / 2, size / 2, y + size / 2);
      cube.userData = { name: itemName, coordinates: [x, y] }; // Store info for hover
      scene.add(cube);

      // Wireframe
      const wireGeo = new THREE.EdgesGeometry(geometry);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x333333 });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      wireframe.position.copy(cube.position);
      scene.add(wireframe);
      return cube;
    }

    function createLabel(text: string, x: number, y: number, z: number) {
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 200;
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
      sprite.scale.set(2.5, 2, 1);
      sprite.position.set(x, y, z);
      scene.add(sprite);
    }

    createLabel(`X`, roomSize + 0.5, 0, 0);
    createLabel(`Z`, 0, roomSize + 0.5, 0);
    createLabel(`Y`, 0, 0, roomSize + 0.5);

    camera.lookAt(new THREE.Vector3(roomSize / 2, 0, roomSize / 2));

    // Generate Objects
    const interactableObjects: THREE.Mesh[] = [];
    const objColors: Record<string, number> = {
      'Bed': 0x4a90e2,
      'Chair': 0x50e3c2,
      'Table': 0x8b572a,
      'TV': 0xe74c3c,
      'Sofa': 0x9b59b6,
      'Plant': 0x2ecc71,
      'Shelf': 0xe67e22,
      'Window': 0xbdc3c7,
      'Door': 0x7f8c8d
    };

    Object.entries(content).forEach(([objectName, coord]) => {
      if (Array.isArray(coord) && coord.length >= 2) {
        const baseType = objectName.split(/[^a-zA-Z]/)[0];
        const color = objColors[baseType] || 0xffffff;
        const c = createCube(divisionSize, coord[0], coord[1], color, objectName);
        interactableObjects.push(c);
        createLabel(objectName, coord[0] + 0.5, divisionSize + 0.5, coord[1] + 0.5);
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableObjects);

      if (hoverTooltipRef.current) {
        if (intersects.length > 0) {
          const object = intersects[0].object;
          const data = object.userData;
          hoverTooltipRef.current.style.display = 'block';
          hoverTooltipRef.current.style.left = `${event.clientX + 15}px`;
          hoverTooltipRef.current.style.top = `${event.clientY + 15}px`;
          hoverTooltipRef.current.innerHTML = `<strong>${data.name}</strong><br/>Grid: [${data.coordinates.join(', ')}]`;
        } else {
          hoverTooltipRef.current.style.display = 'none';
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    let reqId: number;
    const animate = function () {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      // clean up geometry to free memory
      floorGeometry.dispose();
      floorMaterial.dispose();
      wallMaterial.dispose();
      scene.clear();
    };
  }, [content, canvasId]);

  const handleSubmit = async () => {
    if (!geminiApiKey) {
      alert("Please configure your Gemini API Key in the Profile > Preferences tab first.");
      navigate('/profile');
      return;
    }
    if (!tempPrompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:4000/generate`,
        { prompt: tempPrompt, projectId: id, history },
        { headers: { 'x-gemini-key': geminiApiKey } }
      );
      setContent(res.data.coordinates);
      setHistory((prev) => [...prev, tempPrompt]);
      setTempPrompt('');
    } catch (error: any) {
      console.error('Generation Error:', error);
      alert(error.response?.data?.error || 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen w-full overflow-hidden pt-20 bg-transparent font-sans">
      {/* Decorative gradient orb for blending with grid background */}
      <div className="absolute top-1/2 left-1/4 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Left panel: Chat / Info (Floating Glass) */}
      <div className="z-10 flex h-[calc(100vh-100px)] w-full sm:w-[420px] flex-col rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl m-4 sm:mr-0 p-6 relative gap-4">
        
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Link to="/projects" className="text-[#888] hover:text-white transition-colors cursor-pointer bg-white/5 p-2 rounded-full hover:bg-white/10">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-xl font-extrabold text-white truncate drop-shadow-md">{projectName}</h1>
            <p className="text-[13px] font-medium text-[#888]">Fine-tune your layout interactively.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#666]">
              <div className="p-4 rounded-full bg-white/5 mb-3">
                <MessageSquare size={28} />
              </div>
              <p className="text-[14px] font-medium text-white/80">No history yet.</p>
              <p className="text-[13px]">Enter your first prompt below.</p>
            </div>
          ) : (
            history.map((hist, idx) => (
              <div key={idx} className="rounded-xl bg-white/[0.04] border border-white/10 p-4 text-[14px] text-white/90 shadow-sm">
                <span className="text-blue-400/80 font-bold block mb-1 text-[12px] tracking-wider uppercase">Iteration {idx + 1}</span>
                <span className="leading-relaxed">{hist}</span>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="pt-4 border-t border-white/10 shrink-0">
          <textarea
            value={tempPrompt}
            onChange={(e) => setTempPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="e.g. Add a red sofa near the TV and move the table to the corner..."
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-blue-500/50 transition-colors mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !tempPrompt.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14px] font-bold text-black transition-all hover:bg-gray-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {isLoading ? (
              <>
                <RefreshCcw size={16} className="animate-spin" /> Synthesizing...
              </>
            ) : (
              <>Generate Layout</>
            )}
          </button>
        </div>
      </div>

      {/* Right panel: 3D Viewport (Floating Glass) */}
      <div className="flex-1 relative z-10 m-4 sm:ml-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="absolute top-4 right-4 z-10 flex gap-3">
          <button onClick={() => alert("Project is automatically saved!")} className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
            <Save size={16} className="text-blue-400" /> Auto-Saved
          </button>
        </div>
        <div ref={containerRef} className="h-full w-full">
          <canvas id={canvasId} className="h-full w-full outline-none" />
        </div>
        <div 
          ref={hoverTooltipRef} 
          className="pointer-events-none fixed z-50 hidden rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-[13px] text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md transition-opacity duration-150 ease-out"
        ></div>
      </div>
    </div>
  );
};

export default ProjectView;