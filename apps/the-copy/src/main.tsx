import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root container element with id "root" was not found in the document.')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
