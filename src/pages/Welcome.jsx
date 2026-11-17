import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import Logo from '../Logo'
import Install from '../Install'
import { useT } from '../i18n'
import { useAnimes } from '../anilist'
// Accueil façon Crunchyroll : 1re image = visuel VITAKU, puis les animes à l'affiche (bannières AniList).
// À chaque ouverture de l'appli, on démarre sur l'image suivante ; elles défilent ensuite toutes les 6 s.
const BG = 'url(/bg-welcome-art.jpg) 60% center/cover, #0B0614'
const opens = () => { let k = 1; try { k = (+localStorage.getItem('vtk_open') || 0) + 1; localStorage.setItem('vtk_open', k) } catch {} return k }
export default function Welcome() {
  const t = useT(), nav = useNavigate(), [, setUser] = useStore('user', null), [, setEv] = useStore('eval', null), all = useAnimes(), [i, setI] = useState(opens)
  const slides = [{ vitaku: true, full: BG }, ...all.filter(a => a.poster && !a.upcoming).slice(0, 6).map(a => ({ ...a, full: `linear-gradient(transparent 52%, #0B0614 74%), url("${a.poster}") top center/100% auto no-repeat, #0B0614` }))], k = i % slides.length, s = slides[k]
  useEffect(() => { const x = setInterval(() => setI(v => v + 1), 6000); return () => clearInterval(x) }, [])
  const demo = () => { setEv({ grade: 'Fan', score: 8 }); setUser({ name: 'Démo', email: '', xp: 120, demo: true }); nav('/home') }
  return <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#0B0614', display: 'flex', flexDirection: 'column' }}>
    {slides.map((x, j) => <div key={x.id || 'v'} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: x.full, opacity: j === k ? 1 : 0, transition: 'opacity 1.2s' }} />)}
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#0009, transparent 22%)' }} />
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'calc(16px + env(safe-area-inset-top)) 18px 0' }}>
      <div className="row" style={{ alignItems: 'center', gap: 8 }}><Logo size={36} /><b className="logo" style={{ fontSize: 24, letterSpacing: 3 }}>VITAKU</b></div>
      <button className="btn out sm" style={{ borderColor: '#fff', background: '#0007' }} onClick={() => nav('/login')}>{t('Se connecter')}</button></div>
    <div style={{ flex: 1 }} />
    <div style={{ position: 'relative', margin: '0 14px calc(18px + env(safe-area-inset-bottom))', padding: 18, textAlign: 'center', textShadow: '0 2px 10px #000c', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="t" style={{ color: 'var(--pink)', letterSpacing: 3, fontSize: 13 }}>{s.vitaku ? 'ANIME · MANGA · COMMUNAUTÉ' : "À L'AFFICHE · " + s.genre.join(' · ').toUpperCase()}</div>
      <h1 style={{ fontSize: s.vitaku ? 30 : 34, lineHeight: 1.15, textShadow: '0 2px 12px #000' }}>{s.vitaku ? 'Un univers où tu es qui tu veux, comme tu le veux.' : s.title}</h1>
      <p style={{ fontSize: 18, fontWeight: 800 }}>{t('Ton univers commence ici.')}</p>
      <div className="row" style={{ justifyContent: 'center', gap: 6 }}>{slides.map((_, j) => <button key={j} aria-label={'Image ' + (j + 1)} onClick={() => setI(j)} style={{ width: j === k ? 22 : 8, height: 8, borderRadius: 8, border: 0, background: j === k ? '#fff' : '#ffffff66' }} />)}</div>
      <button className="btn" onClick={() => nav('/signup')}>{t('Commencer la partie')}</button>
      <button className="chip" style={{ alignSelf: 'center', textDecoration: 'underline', fontSize: 15 }} onClick={demo}>{t('Continuer en mode démo')}</button>
      <Install /></div></div>
}
