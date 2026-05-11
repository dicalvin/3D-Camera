import { Canvas } from '@react-three/fiber';
import { useSensors } from './hooks/useSensors';
import SpatialGrid from './components/SpatialGrid';

export default function App() {
  const { data, startSensors } = useSensors();

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {data.status !== 'active' ? (
        <div className="flex flex-col items-center justify-center h-full">
          <button 
            onClick={startSensors}
            className="bg-white text-black px-8 py-4 rounded-full font-bold active:scale-95 transition"
          >
            INITIALIZE SPATIAL MAPPING
          </button>
        </div>
      ) : (
        <>
          <div className="absolute top-10 left-10 z-10 text-white font-mono">
            <p className="opacity-50 text-xs">HEADING</p>
            <h1 className="text-4xl">{Math.round(data.heading)}°</h1>
          </div>

          <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
            <SpatialGrid heading={data.heading} position={data.position} />
          </Canvas>
        </>
      )}
    </div>
  );
}