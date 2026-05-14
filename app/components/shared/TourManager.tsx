'use client';

import { useState, useEffect } from 'react';
import DemoTour from './DemoTour';

// Lives in root layout — persists across all page navigations.
// Activation: localStorage.setItem('namma_tour_active', 'true') + dispatch 'namma_tour_change'
export default function TourManager() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(localStorage.getItem('namma_tour_active') === 'true');

    const sync = () => setActive(localStorage.getItem('namma_tour_active') === 'true');
    window.addEventListener('namma_tour_change', sync);
    return () => window.removeEventListener('namma_tour_change', sync);
  }, []);

  if (!active) return null;

  return (
    <DemoTour
      onClose={() => {
        localStorage.removeItem('namma_tour_active');
        localStorage.removeItem('namma_tour_step');
        localStorage.removeItem('namma_role');
        setActive(false);
      }}
    />
  );
}
