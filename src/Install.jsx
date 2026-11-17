import { useEffect, useState } from 'react'
let ev = null; const subs = new Set()
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); ev = e; subs.forEach(f => f()) })
window.addEventListener('appinstalled', () => { ev = null; subs.forEach(f => f()) })
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone
export default function Install() {
  const [, n] = useState(0), [help, setHelp] = useState(false)
  useEffect(() => { const f = () => n(x => x + 1); subs.add(f); return () => subs.delete(f) }, [])
  if (standalone()) return <div className="card" style={{ marginBottom: 10 }}>✓ Application installée</div>
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const go = async () => { if (ev) { ev.prompt(); await ev.userChoice; ev = null; n(x => x + 1) } else setHelp(h => !h) }
  return <div className="card" style={{ marginBottom: 10 }}><div className="row"><b style={{ flex: 1 }}>📲 Installer l'application</b><button className="btn sm" onClick={go}>Installer</button></div>
    {help && <p className="mut" style={{ marginTop: 8 }}>{ios ? `Sur iPhone : touche Partager, puis « Sur l'écran d'accueil ».` : `Ouvre le menu du navigateur (⋮), puis « Installer l'application » ou « Ajouter à l'écran d'accueil ».`}</p>}</div>
}
