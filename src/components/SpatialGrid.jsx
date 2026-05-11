import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function SpatialGrid({ heading, position }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      // Smoothly rotate the world to match your compass
      const targetRot = -THREE.MathUtils.degToRad(heading);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, 0.1);
      
      // Move the world relative to your movement
      groupRef.current.position.set(-position[0], -position[1], -position[2]);
    }
  });

  return (
    <group ref={groupRef}>
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        sectionSize={1} 
        sectionThickness={1.5} 
        sectionColor="#3366ff" 
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}