import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import App from './App.tsx';
import './index.css';
import { SplashScreen } from './components/SplashScreen';

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  return showSplash ? <SplashScreen onComplete={() => setShowSplash(false)} /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
