import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAnimes } from '../anilist'
import { useStore } from '../store'
import { useT } from '../i18n'
export default function Downloads() {
  const t = useT(), ANIMES = useAnimes(), [sp] = useSearchParams(), [tab, setTab] = useState(sp.get('tab') || 'dl')
  const [dl, setDl] = useStore('downloads', []), [list, setList] = useStore('mylist2', []), [lib, setLib] = useStore('library', [])
  const Thumb = ({ a, w = 70, h = 96 }) => <div style={{ width: w, height: h, flex: '0 0 auto', borderRadius: 12, background: a.bg }} />
  return <div className="page glow"><h1>{t('Mes contenus')}</h1>
    <div className="scroll" style={{ margin: '12px 0' }}>{[['dl', '⬇ Téléchargés'], ['list', '★ Ma liste'], ['lib', '📚 Mangas']].map(([k, l]) => <button key={k} className={'tab ' + (tab === k ? 'on' : '')} onClick={() => setTab(k)}>{t(l)}</button>)}</div>
    {tab === 'dl' && <>{!dl.length && <div className="card">Rien pour l'instant. Ouvre un anime et appuie sur Télécharger.</div>}
      {dl.map((d, i) => { const a = ANIMES.find(x => x.id === d.id) || d.a; if (!a) return null; return <div key={i} className="card row" style={{ marginBottom: 10 }}>
        <Link to={'/anime/' + a.id} style={{ width: 90, height: 60, borderRadius: 12, background: a.bg, display: 'grid', placeItems: 'center', color: '#fff', textDecoration: 'none' }}>▶</Link>
        <div style={{ flex: 1 }}><b className="t">{a.title}</b><div className="mut">{d.season ? 'Saison ' + d.season : d.ep ? 'Épisode ' + d.ep : 'Épisodes'} · {d.lang || 'VF'} · {a.size}</div></div>
        <button className="chip" aria-label="Supprimer" onClick={() => { setDl(dl.filter((_, j) => j !== i)); window.caches && caches.open('vitaku-videos').then(c => c.delete('/videos/' + a.id + '-' + (d.ep || 1) + '-' + (d.lang || 'VF') + '.mp4')).catch(() => {}) }}>🗑</button></div> })}</>}
    {tab === 'list' && <>{!list.length && <div className="card">Ta liste est vide. Les animes que tu télécharges ou ajoutes s'affichent ici.</div>}
      {list.filter(a => a && a.title).map(a => <div key={a.id} className="card row" style={{ marginBottom: 10 }}><Link to={'/anime/' + a.id}><Thumb a={a} /></Link>
        <div style={{ flex: 1 }}><b className="t">{a.title}</b><div className="mut">⭐ {a.rating} · {a.year} · {a.genre.join(', ')}</div></div>
        <button className="chip" aria-label="Retirer" onClick={() => setList(list.filter(x => x.id !== a.id))}>✕</button></div>)}</>}
    {tab === 'lib' && <>{!lib.length && <div className="card">Aucun manga. <Link to="/manga" style={{ color: 'var(--pink)' }}>Parcourir les mangas</Link></div>}
      {lib.map(m => <div key={m.id} className="card row" style={{ marginBottom: 10 }}><Thumb a={m} /><div style={{ flex: 1 }}><b className="t">{m.title}</b><div className="mut">{m.chapters ? m.chapters + ' chapitres' : 'En cours'}</div></div>
        <button className="chip" aria-label="Retirer" onClick={() => setLib(lib.filter(x => x.id !== m.id))}>✕</button></div>)}
      <Link to="/manga" className="btn sm">📚 Mangas, BD & scans</Link></>}
  </div>
}
