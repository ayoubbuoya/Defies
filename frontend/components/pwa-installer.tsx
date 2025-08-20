'use client';

import { useEffect } from 'react';

export const PwaInstaller = () => {
  useEffect(() => {
    // This code will run in the browser
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => console.log('Service Worker registered.', registration))
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  }, []); // Run this effect only once

  return null; // This component doesn't render anything
};
