import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAnimes, useUpcoming } from '../anilist'
import { useStore } from '../store'
import { verOf } from '../data'
import Logo from '../Logo'
import { useT } from '../i18n'
import Notifications, { useNotifCount } from '../Notifications'
const Poster = ({ a }) => { const [lang] = useStore('lang', 'VF'); return <Link to={'/anime/' + a.id} className="poster" style={{ background: a.bg, color: '#fff', textDecoration: 'none' }}><b className="tag">{verOf(a, lang)}</b>
  <span>{a.title}{a.upcoming && <small style={{ display: 'block', color: 'var(--pink)' }}>{a.release}</small>}</span></Link> }
const CATS = [['Action', 'Action'], ['Aventure', 'Adventure'], ['Fantasy', 'Fantasy'], ['Drame', 'Drama'], ['Comédie', 'Comedy'], ['Isekai', 'q:isekai'], ['Romance', 'Romance']]
export default function Home() {
  const t = useT(), nav = useNavigate(), ANIMES = useAnimes(), up = useUpcoming(), count = useNotifCount()
  const [i, setI] = useState(0), [dl, setDl] = useStore('downloads', []), [open, setOpen] = useState(false)
  useEffect(() => { const t = setInterval(() => setI(x => x + 1), 4500); return () => clearInterval(t) }, [])
  const [lang, setLang] = useStore('lang', 'VF'), [list, setList] = useStore('mylist2', [])
  const hero = up.slice(0, 10), k = i % hero.length, f = hero[k], has = id => dl.some(d => d.id === id)
  const released = ANIMES.filter(a => !a.upcoming), trend = [...released].sort((a, b) => b.rating - a.rating).slice(0, 10), tids = new Set(trend.map(a => a.id))
  const airing = released.filter(a => a.status === 'En diffusion' && !tids.has(a.id)).slice(0, 12)
  return <div className="page glow">
    <div className="search"><Logo size={34} /><input readOnly placeholder={t('Rechercher un anime, un manga…')} onClick={() => nav('/search')} />
      <button className="chip" style={{ position: 'relative', fontSize: 20 }} aria-label="Notifications" onClick={() => setOpen(true)}>🔔{count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--red)', borderRadius: 10, fontSize: 11, padding: '0 6px' }}>{count}</span>}</button></div>
    <div className="row" style={{ marginBottom: 10 }}>{['VF', 'VO'].map(l => <button key={l} className={'tab ' + (lang === l ? 'on' : '')} onClick={() => setLang(l)}>{t(l === 'VF' ? '🇫🇷 Version française' : '🇯🇵 Version originale')}</button>)}</div>
    <div className="hero" style={{ height: 230, background: `linear-gradient(transparent 25%,#000d), ${f.hero || f.bg}` }} onClick={() => nav('/anime/' + f.id)}>
      <span className="chip" style={{ alignSelf: 'flex-start' }}>{t('Annonce de sortie')} · {f.release || 'Bientôt'}</span><h2>{f.title}</h2><p className="mut">{f.genre.join(' · ')}</p>
      <div className="row" style={{ gap: 6, marginTop: 6 }}>{hero.map((_, j) => <button key={j} aria-label={'Annonce ' + (j + 1)} onClick={e => { e.stopPropagation(); setI(j) }} style={{ width: j === k ? 22 : 8, height: 8, borderRadius: 8, border: 0, background: j === k ? '#fff' : '#ffffff66' }} />)}</div></div>
    <div className="scroll" style={{ marginTop: 8 }}>{released.slice(0, 4).map(a => <div key={a.id} className="card row" style={{ flex: '0 0 72%', padding: 8 }}>
      <div style={{ width: 40, height: 54, borderRadius: 8, background: a.bg }} /><div style={{ flex: 1, minWidth: 0 }}><b className="t" style={{ fontSize: 14 }}>{a.title}</b><div className="mut" style={{ fontSize: 12 }}>TV · {a.year} · {a.genre[0]}</div></div>
      <button className="btn sm" style={{ padding: '6px 12px' }} disabled={has(a.id)} aria-label="Télécharger" onClick={() => { setDl([...dl, { id: a.id, a, lang, date: Date.now() }]); if (!list.some(x => x.id === a.id)) setList([...list, a]) }}>{has(a.id) ? '✓' : '⬇'}</button></div>)}</div>
    <h2 className="h">{t('Prochaines sorties')}</h2><div className="grid2">{up.slice(0, 24).map(a => <Poster key={a.id} a={a} />)}</div>
    <h2 className="h">{t('Anime tendance')}</h2><div className="scroll">{trend.map(a => <Poster key={a.id} a={a} />)}</div>
    <h2 className="h">{t('En diffusion')}</h2><div className="scroll">{airing.map(a => <Poster key={a.id} a={a} />)}</div>
    <Link to="/manga" className="btn" style={{ display: 'block', margin: '18px 0 0' }}>{t('📚 Mangas, BD & scans')}</Link>
    <h2 className="h">{t('Catégories')}</h2><div>{CATS.map(([l, v]) => <Link key={l} className="tab" to={v.startsWith('q:') ? '/search?q=' + v.slice(2) : '/search?g=' + v} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>{t(l)}</Link>)}</div>
    {open && <Notifications onClose={() => setOpen(false)} />}
  </div>
}
