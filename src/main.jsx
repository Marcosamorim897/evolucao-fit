import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ProvedorAuth } from './lib/auth'
import './estilos.css'

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <ProvedorAuth>
        <App />
      </ProvedorAuth>
    </BrowserRouter>
  </StrictMode>,
)
