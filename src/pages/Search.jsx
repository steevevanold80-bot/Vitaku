import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAnimes, searchAnilist } from '../anilist'
import { useStore } from '../store'
import { verOf, parseQ } from '../data'
const match = (a, q) => [a.title, a.orig, a.native, ...(a.syn || [])].some(s => s && s.toLowerCase().includes(q))
// « titan vf » → VF si elle existe, sinon la version originale s'affiche toute seule.
export default function Search() {
  const ANIMES = useAnimes(), [sp] = useSearchParams(), nav = useNavigate(), g = sp.get('g')
  const [lang] = useStore('lang', 'VF'), [q, setQ] = useState(sp.get('q') || ''), [hist, setHist] = useStore('history', ['Solo Leveling'])
  const pq = parseQ(q), want = pq.vf ? 'VF' : lang, ql = pq.q.toLowerCase()
  useEffect(() => { if (pq.q.length < 3) return; const t = setTimeout(() => searchAnilist(pq.q), 400); return () => clearTimeout(t) }, [pq.q])
  const res = ANIMES.filter(a => match(a, ql) && (!g || a.genre.includes(g)))
  return <div className="page glow">
    <div className="search"><button className="chip" onClick={() => nav(-1)}>‹</button><input autoFocus placeholder="Titre (ajoute VF pour la version française)" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && q && setHist([q, ...hist.filter(h => h !== q)].slice(0, 6))} /></div>
    {!q && !g && <><div className="row" style={{ justifyContent: 'space-between' }}><b>Récent</b><button className="chip" onClick={() => setHist([])}>🗑 Effacer</button></div>{hist.map(h => <button key={h} className="chip" onClick={() => setQ(h)}>{h}</button>)}<h3 className="h">🔥 Tout le monde recherche</h3></>}
    {res.map(a => { const v = verOf(a, want); return <Link key={a.id} to={'/anime/' + a.id} className="card row" style={{ marginBottom: 10, color: 'inherit', textDecoration: 'none' }}>
      <div style={{ width: 60, height: 84, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'flex-end', fontSize: 11 }}>{v}</div>
      <div><b className="t">{a.title}</b>{v === 'VO' && a.native && <div className="mut">{a.native}</div>}<div className="mut">TV | ⭐ {a.rating} | {a.year} | {a.genre.join(', ')}</div></div></Link> })}
    {!res.length && <p className="mut">Aucun résultat. Essaie un autre titre.</p>}
  </div>
}
