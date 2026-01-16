import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Previeni zoom su dispositivi touch in modo più aggressivo
// Previeni pinch-to-zoom con gesturestart
document.addEventListener('gesturestart', (e) => {
  e.preventDefault()
  // @ts-ignore - scale esiste su alcuni browser
  document.body.style.zoom = '1'
})

// Previeni zoom con doppio tap su iOS
let lastTouchEnd = 0
document.addEventListener('touchend', (e) => {
  const now = Date.now()
  if (now - lastTouchEnd <= 300) {
    e.preventDefault()
  }
  lastTouchEnd = now
}, { passive: false })

// Previeni zoom con Ctrl+wheel e Cmd+wheel (desktop)
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
  }
}, { passive: false })

// Previeni zoom con tastiera (Ctrl+Plus, Ctrl+Minus)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
    e.preventDefault()
  }
}, { passive: false })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
