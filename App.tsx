
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TransformMode, ModelTransform } from './types.ts';
import OverlayUI from './components/OverlayUI.tsx';
import { getARInsights } from './services/gemini.ts';

// Declarations for MindAR/Three global variables loaded via script tags
declare const THREE: any;
declare const MindARThree: any;

const INITIAL_TRANSFORM: ModelTransform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 0.25
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindARRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  
  const [isDetected, setIsDetected] = useState(false);
  const [activeMode, setActiveMode] = useState<TransformMode>('rotate');
  const [transform, setTransform] = useState<ModelTransform>(INITIAL_TRANSFORM);
  const [aiInsights, setAiInsights] = useState<{ analysis: string; suggestions: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize MindAR
  useEffect(() => {
    if (!containerRef.current) return;

    const startAR = async () => {
      try {
        const mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind',
        });

        const { renderer, scene, camera } = mindarThree;
        mindARRef.current = mindarThree;

        const anchor = mindarThree.addAnchor(0);
        
        // Setup Lighting
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 5, 5);
        scene.add(directionalLight);

        // Load 3D Model - Using global loader attached to THREE
        const loader = new THREE.GLTFLoader();
        loader.load(
          'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/softbar/scene.gltf',
          (gltf: any) => {
            const model = gltf.scene;
            model.scale.set(INITIAL_TRANSFORM.scale, INITIAL_TRANSFORM.scale, INITIAL_TRANSFORM.scale);
            anchor.group.add(model);
            modelRef.current = model;
            setIsLoading(false);
          },
          undefined,
          (error: any) => {
            console.error("Error loading model:", error);
            setIsLoading(false);
          }
        );

        anchor.onTargetFound = () => setIsDetected(true);
        anchor.onTargetLost = () => setIsDetected(false);

        await mindarThree.start();
        
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      } catch (error) {
        console.error("Failed to start AR:", error);
        setIsLoading(false);
      }
    };

    startAR();

    return () => {
      if (mindARRef.current) {
        mindARRef.current.stop();
      }
    };
  }, []);

  // Handle Touch Interactions for Manipulation
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDetected || !modelRef.current || !lastTouchRef.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - lastTouchRef.current.x;
    const dy = touch.clientY - lastTouchRef.current.y;

    setTransform(prev => {
      const next = { ...prev };
      
      if (activeMode === 'rotate') {
        next.rotation.y += dx * 0.01;
        next.rotation.x += dy * 0.01;
      } else if (activeMode === 'move') {
        next.position.x += dx * 0.005;
        next.position.y -= dy * 0.005;
      } else if (activeMode === 'scale') {
        const scaleFactor = 1 - (dy * 0.01);
        next.scale = Math.max(0.05, Math.min(2, prev.scale * scaleFactor));
      }

      // Apply to Three.js Object
      if (modelRef.current) {
        modelRef.current.position.set(next.position.x, next.position.y, next.position.z);
        modelRef.current.rotation.set(next.rotation.x, next.rotation.y, next.rotation.z);
        modelRef.current.scale.set(next.scale, next.scale, next.scale);
      }

      return next;
    });

    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isDetected, activeMode]);

  const handleAnalyze = async () => {
    try {
      const insights = await getARInsights("Virtual Softbar Interactive Object");
      setAiInsights(insights);
    } catch (error) {
      console.error("AI Analysis failed", error);
    }
  };

  const resetTransform = () => {
    setTransform(INITIAL_TRANSFORM);
    if (modelRef.current) {
      modelRef.current.position.set(0, 0, 0);
      modelRef.current.rotation.set(0, 0, 0);
      modelRef.current.scale.set(INITIAL_TRANSFORM.scale, INITIAL_TRANSFORM.scale, INITIAL_TRANSFORM.scale);
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* MindAR Container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold tracking-widest uppercase">Initializing AR</h2>
          <p className="text-gray-400 text-sm mt-2">Preparing camera and 3D engine...</p>
        </div>
      )}

      {/* Main UI Overlay */}
      {!isLoading && (
        <OverlayUI 
          isDetected={isDetected}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          transform={transform}
          onReset={resetTransform}
          onAnalyze={handleAnalyze}
          aiInsights={aiInsights}
          closeInsights={() => setAiInsights(null)}
        />
      )}

      {/* Instructions Overlay if not detected */}
      {!isDetected && !isLoading && (
        <div className="fixed bottom-32 left-0 right-0 px-8 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white text-center">
            <p className="text-sm font-light">Scan a target image to begin the experience.</p>
          </div>
        </div>
      )}
    </div>
  );
}
