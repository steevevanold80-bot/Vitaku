import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'
import './Install'
if ('serviceWorker' in navigator && import.meta.env.PROD) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
createRoot(document.getElementById('root')).render(<HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true }}><App/></HashRouter>)
