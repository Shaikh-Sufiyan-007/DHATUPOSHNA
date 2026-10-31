import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import App from './App.jsx'

// Configure local Draco decoder path globally for all 3D assets
if (typeof window !== 'undefined') {
  useGLTF.setDecoderPath('/draco/');

  // Early parallel prefetch: Start downloading initial 3D models before first React render
  const isMobile = window.innerWidth < 768;
  const skullFile = isMobile ? '/models/skull-hero-lite.glb' : '/models/skull-hero.glb';
  const spineFile = isMobile ? '/models/spine-anatomical-lite.glb' : '/models/spine-anatomical.glb';
  useGLTF.preload(skullFile, '/draco/');
  useGLTF.preload(spineFile, '/draco/');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
