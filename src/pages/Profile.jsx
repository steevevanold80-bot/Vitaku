import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { useT } from '../i18n'
import { useAnimes } from '../anilist'
const SPEC = ['Stratégie', 'Combat', 'Magie', 'Savoir']
export default function Profile() {
  const t = useT()
  const ANIMES = useAnimes(), ref = useRef(), [user] = useStore('user', {}), [ev] = useStore('eval', null), [photo, setPhoto] = useStore('photo', null), [spec, setSpec] = useStore('spec', 'Stratégie'), [wat] = useStore('watched', [])
  const [pv] = useStore('privacy', { profile: true, online: true, dm: true, history: false })
  const lv = Math.min(100, Math.floor((user.xp || 0) / 500) + 1)
  const onFile = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const k = Math.min(1, 300 / Math.min(img.width, img.height)), cv = document.createElement('canvas'); cv.width = img.width * k; cv.height = img.height * k; cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); setPhoto(cv.toDataURL('image/jpeg', .85)) }; img.src = URL.createObjectURL(f) }
  return <div className="page glow">
    <div className="row" style={{ alignItems: 'center' }}>
      <button className="photo" aria-label="Ajouter une photo de profil" onClick={() => ref.current.click()}>{photo ? <img alt="" src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>＋<br />Photo</span>}</button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onFile} />
      <div style={{ flex: 1 }}><h1>{user.name}</h1>
        <div><span className="chip on">{ev ? ev.grade : t('Non évalué')}</span>{pv.online && <span className="chip" style={{ color: '#22c55e' }}>● {t('En ligne')}</span>}
          <select value={spec} onChange={e => setSpec(e.target.value)} style={{ width: 'auto', padding: '4px 10px', borderRadius: 999 }} aria-label="Spécialité">{SPEC.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="bar" style={{ margin: '10px 0 4px' }}><div style={{ width: ((user.xp || 0) % 500) / 5 + '%' }} /></div><div className="mut">Niveau {lv} · {user.xp || 0} XP</div></div></div>
    <Link to="/card" className="btn" style={{ display: 'block', margin: '18px 0 10px' }}>{t('Ma carte Otaku')}</Link>
    <Link to="/downloads?tab=list" className="btn out" style={{ display: 'block' }}>{t('★ Ma liste')}</Link>
    <h2 className="h">{t('Historique de visionnage')}</h2><div className="scroll">{wat.length ? wat.map(id => { const a = ANIMES.find(x => x.id === id); if (!a) return null; return <Link key={id} to={'/anime/' + id} className="poster" style={{ flexBasis: 110, height: 70, background: a.bg, color: '#fff', textDecoration: 'none' }}><span>{a.title}</span></Link> }) : <p className="mut">Rien regardé pour l'instant.</p>}</div>
    <Link to="/settings" className="card row" style={{ marginTop: 12, color: 'inherit', textDecoration: 'none' }}>⚙️ <b style={{ flex: 1 }}>{t('Paramètres')}</b> ›</Link>
  </div>
}
