import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSensors } from './hooks/useSensors';
import SpatialGrid from './components/SpatialGrid';

export default function App() {
  const { data, startSensors } = useSensors();
  const [snapshots, setSnapshots] = useState([]); // Stores the 3D memory
  const videoRef = useRef(null);

  // Snapshot Logic: Capture the current state every time we move significantly
  useEffect(() => {
    if (data.status === 'active') {
      const interval = setInterval(() => {
        setSnapshots(prev => [
          { heading: data.heading, pos: [...data.position], id: Date.now() },
          ...prev.slice(0, 9) // Keep last 10 snapshots for memory efficiency
        ]);
      }, 3000); 
      return () => clearInterval(interval);
    }
  }, [data.status, data.heading, data.position]);

  return (
    <div className="w-full h-screen bg-[#050505] flex flex-col overflow-hidden text-white font-mono">
      {data.status !== 'active' ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <button onClick={startSensors} className="border border-cyan-500 text-cyan-500 px-10 py-4 rounded-sm hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-tighter font-bold">
            Start Spatial Reconstruction
          </button>
        </div>
      ) : (
        <>
          {/* TOP HALF: LIVE SPATIAL VIEW */}
          <div className="h-[60%] relative border-b border-white/10">
            <div className="absolute top-6 left-6 z-20">
              <p className="text-[10px] opacity-40">LIVE_TELEMETRY</p>
              <h2 className="text-2xl font-bold">{Math.round(data.heading)}°</h2>
            </div>
            
            <Canvas camera={{ position: [0, 2, 5] }}>
              <ambientLight intensity={1} />
              <SpatialGrid heading={data.heading} position={data.position} />
            </Canvas>
            
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 -z-10" />
          </div>

          {/* BOTTOM HALF: INTERACTIVE RECONSTRUCTION SLIDER */}
          <div className="h-[40%] p-4 flex flex-col">
            <h3 className="text-[10px] opacity-40 mb-2 uppercase italic">Spatial_Memory_Buffer</h3>
            
            <div className="flex-1 overflow-x-auto flex gap-4 no-scrollbar">
              {snapshots.length === 0 && (
                <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
                  <p className="text-[10px] opacity-20">Waiting for spatial data points...</p>
                </div>
              )}
              
              {snapshots.map((snap) => (
                <div key={snap.id} className="min-w-[180px] h-full bg-white/5 rounded-lg border border-white/10 relative overflow-hidden group">
                   <Canvas camera={{ position: [0, 5, 5] }}>
                      <color attach="background" args={['#111']} />
                      <gridHelper args={[10, 10, '#333', '#222']} rotation={[0,0,0]} />
                      {/* Mini Static Reconstruction */}
                      <mesh rotation={[-Math.PI / 2, 0, (snap.heading * Math.PI)/180]}>
                        <planeGeometry args={[5, 5]} />
                        <meshStandardMaterial color="#00ffff" wireframe />
                      </mesh>
                   </Canvas>
                   <div className="absolute bottom-2 left-2 text-[8px] bg-black/80 px-2 py-1 rounded">
                     HDG: {Math.round(snap.heading)}° | X: {snap.pos[0].toFixed(1)}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
