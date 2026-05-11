import { useState, useEffect } from 'react';

export const useSensors = () => {
  const [data, setData] = useState({ heading: 0, position: [0, 0, 0], status: 'idle' });

  const startSensors = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') return;
    }
    
    setData(prev => ({ ...prev, status: 'active' }));

    // Heading (Compass)
    window.addEventListener('deviceorientationabsolute', (e) => {
      const heading = e.webkitCompassHeading || (360 - e.alpha);
      setData(prev => ({ ...prev, heading }));
    }, true);

    // Movement (Accelerometer)
    window.addEventListener('devicemotion', (e) => {
      const acc = e.accelerationIncludingGravity;
      setData(prev => ({
        ...prev,
        position: [
          prev.position[0] + (acc.x * 0.01),
          prev.position[1] + (acc.y * 0.01),
          prev.position[2] + (acc.z * 0.01)
        ]
      }));
    });
  };

  return { data, startSensors };
};