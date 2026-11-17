import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
// Écran de lancement : l'image VITAKU plein écran.
export default function Splash() {
  const nav = useNavigate(); const [user] = useStore('user', null)
  useEffect(() => { const t = setTimeout(() => nav(user ? '/home' : '/welcome'), 2600); return () => clearTimeout(t) }, [])
  return <div role="img" aria-label="VITAKU" style={{ position: 'fixed', inset: 0, background: '#0B0614 url(/splash.jpg) center/cover no-repeat' }} />
}
