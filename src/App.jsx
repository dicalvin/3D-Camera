import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSensors } from './hooks/useSensors';
import SpatialGrid from './components/SpatialGrid';

export default function App() {
  const { data, startSensors } = useSensors();
  const videoRef = useRef(null);

  useEffect(() => {
    if (data.status === 'active' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Camera access denied:", err));
    }
  }, [data.status]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {data.status !== 'active' ? (
        <div className="flex flex-col items-center justify-center h-full text-white px-6">
          <h1 className="text-xl font-mono mb-8 tracking-widest">SPATIAL MAPPING V1.0</h1>
          <button 
            onClick={startSensors}
            className="border border-white px-10 py-4 rounded-md font-bold hover:bg-white hover:text-black transition-all"
          >
            INITIALIZE HARDWARE
          </button>
        </div>
      ) : (
        <>
          {/* Real-time HUD */}
          <div className="absolute top-10 left-10 z-10 text-white font-mono pointer-events-none">
            <p className="opacity-50 text-[10px]">AZIMUTH / HEADING</p>
            <h1 className="text-4xl">{Math.round(data.heading)}°</h1>
          </div>

          {/* 3D Render Layer */}
          <Canvas camera={{ position: [0, 2, 5], fov: 75 }} className="z-10">
            <color attach="background" args={['transparent']} />
            <ambientLight intensity={1} />
            <SpatialGrid heading={data.heading} position={data.position} />
          </Canvas>

          {/* Real-time Camera Layer */}
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60 -z-10"
          />
        </>
      )}
    </div>
  );
}