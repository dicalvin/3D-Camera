import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSensors } from './hooks/useSensors';
import SpatialGrid from './components/SpatialGrid';
import { Camera, Box, RotateCcw, Save } from 'lucide-react'; // For clean icons

export default function App() {
  const { data, startSensors } = useSensors();
  const [objectCaptures, setObjectCaptures] = useState([]); 
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);

  // Fix: Explicit Camera Activation
  const initializeSystem = async () => {
    await startSensors(); // Request Motion/Orientation
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access is required for Spatial Mapping.");
    }
  };

  const captureObjectAngle = () => {
    const newPoint = {
      id: Date.now(),
      heading: data.heading,
      pos: [...data.position],
    };
    setObjectCaptures([newPoint, ...objectCaptures]);
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 300); // Visual feedback
  };

  return (
    <div className="w-full h-screen bg-[#001f3f] text-white font-sans overflow-hidden flex flex-col">
      {data.status !== 'active' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-[#FF851B] rounded-full mb-6 flex items-center justify-center animate-pulse">
            <Box size={48} color="#001f3f" />
          </div>
          <h1 className="text-3xl font-bold mb-2">SPATIAL SCANNER</h1>
          <p className="text-gray-400 mb-10 text-center">Reconstruct your environment in 3D using iPhone 12 Pro Max hardware.</p>
          <button 
            onClick={initializeSystem} 
            className="bg-[#FF851B] text-[#001f3f] px-10 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform"
          >
            LAUNCH INTERFACE
          </button>
        </div>
      ) : (
        <>
          {/* Header Stats */}
          <div className="p-6 flex justify-between items-center border-b border-white/10 bg-[#001f3f]/80 backdrop-blur-md">
            <div>
              <p className="text-[10px] text-[#FF851B] font-bold uppercase tracking-widest">Azimuth</p>
              <h2 className="text-3xl font-mono">{Math.round(data.heading)}°</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#FF851B] font-bold uppercase tracking-widest">Captured Angles</p>
              <h2 className="text-3xl font-mono">{objectCaptures.length}</h2>
            </div>
          </div>

          {/* Main Viewport */}
          <div className="flex-1 relative">
            <Canvas camera={{ position: [0, 2, 5] }}>
              <ambientLight intensity={1} />
              <SpatialGrid heading={data.heading} position={data.position} />
              {/* Render small cubes for each captured angle */}
              {objectCaptures.map((pt) => (
                <mesh key={pt.id} position={[pt.pos[0], 0, pt.pos[2]]}>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color="#FF851B" />
                </mesh>
              ))}
            </Canvas>
            
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10" />
            
            {isCapturing && <div className="absolute inset-0 border-4 border-[#FF851B] animate-ping pointer-events-none" />}
          </div>

          {/* Action Bar */}
          <div className="p-6 bg-[#001226] border-t border-white/10 flex justify-around items-center">
            <button onClick={() => window.location.reload()} className="p-4 bg-white/5 rounded-full">
              <RotateCcw size={24} />
            </button>
            
            <button 
              onClick={captureObjectAngle}
              className="w-20 h-20 bg-[#FF851B] rounded-full flex items-center justify-center shadow-lg shadow-[#FF851B]/20 active:scale-90 transition-transform"
            >
              <Camera size={32} color="#001f3f" />
            </button>

            <button className="p-4 bg-white/5 rounded-full">
              <Save size={24} />
            </button>
          </div>

          {/* Horizontal Gallery */}
          <div className="h-24 bg-[#001f3f] p-2 flex gap-2 overflow-x-auto border-t border-white/5">
            {objectCaptures.map((cap) => (
              <div key={cap.id} className="min-w-[80px] h-full bg-white/10 rounded flex items-center justify-center border border-[#FF851B]/30">
                <span className="text-[10px] font-mono">{Math.round(cap.heading)}°</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}