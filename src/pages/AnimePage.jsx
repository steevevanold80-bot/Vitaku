import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAnimes } from '../anilist'
import { useStore } from '../store'
import { verOf, PROVIDERS } from '../data'
import { supabase } from '../supabase'
import { isCloud, useLive, rows } from '../cloud'
// Épisodes : bouton « Saisons » → fenêtre → saison → épisodes. Chaque épisode : regarder ou télécharger (Crunchyroll / ADN / Telegram).
// L'enregistrement dans « Mes contenus » se fait tout seul au moment du téléchargement.
export default function AnimePage() {
  const ANIMES = useAnimes(), { id } = useParams(), nav = useNavigate(), a = ANIMES.find(x => x.id == id)
  const [dl, setDl] = useStore('downloads', []), [list, setList] = useStore('mylist2', []), [lang, setLang] = useStore('lang', 'VF')
  const [tab, setTab] = useState('sim'), [ep, setEp] = useState(1), [cmL, setCmL] = useStore('cm' + id, []), [user] = useStore('user', null), [t, setT] = useState(''), [hist, setHist] = useStore('watched', [])
  const [sheet, setSheet] = useState(null), [season, setSeason] = useState(1), [pick, setPick] = useState(null), [miss, setMiss] = useState(false)
  const cloud = isCloud(user), [cmC, reloadCm] = useLive(() => rows(supabase.from('anime_comments').select('id,body,profiles(username)').eq('anime_id', id).order('created_at')), ['anime_comments'], [id], cloud)
  const cm = cloud ? (cmC || []).map(c => (c.profiles?.username ? c.profiles.username + ' : ' : '') + c.body) : cmL
  const sendCm = () => { if (!t) return; if (cloud) supabase.from('anime_comments').insert({ anime_id: +id, user_id: user.id, body: t.slice(0, 1000) }).then(() => reloadCm()); else setCmL([...cmL, t]); setT('') }
  if (!a) return <div className="page">Anime introuvable.</div>
  const v = verOf(a, lang), vp = `/videos/${a.id}-${ep}-${v}.mp4`, ns = a.seasons || 1, ne = Math.min(300, typeof a.eps === 'number' ? Math.ceil(a.eps / ns) : 12)
  const play = () => setHist([a.id, ...hist.filter(h => h !== a.id)].slice(0, 6))
  const go = (p, e, s) => { if (!dl.some(d => d.id === a.id && d.ep === e && d.season === s)) setDl([...dl, { id: a.id, ep: e, season: s, a, lang: v, date: Date.now() }]); if (!list.some(x => x.id === a.id)) setList([...list, a]); window.open(p[1](a, e ?? 'S' + s, v), '_blank', 'noopener') }
  const Prov = ({ e, s }) => <div className="row" style={{ flexWrap: 'wrap', marginTop: 8 }}>{PROVIDERS.map(p => <button key={p[0]} className="btn out sm" onClick={() => go(p, e, s)}>{p[0] === 'Telegram' ? '✈ ' : '↗ '}{p[0]}</button>)}</div>
  const Sheet = ({ title, back, children }) => <div style={{ position: 'fixed', inset: 0, zIndex: 30, background: '#000a', display: 'flex', alignItems: 'flex-end' }} onClick={() => { setSheet(null); setPick(null) }}>
    <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={{ background: 'var(--surf)', width: '100%', maxWidth: 520, margin: '0 auto', maxHeight: '82vh', overflow: 'auto', borderRadius: '24px 24px 0 0', padding: 18 }}>
      <div className="row" style={{ alignItems: 'center' }}>{back && <button className="chip" onClick={back}>‹</button>}<h2 style={{ flex: 1 }}>{title}</h2><button className="chip" aria-label="Fermer" onClick={() => { setSheet(null); setPick(null) }}>✕</button></div>{children}</div></div>
  return <div className="page glow">
    <button className="chip" onClick={() => nav(-1)}>‹ Retour</button>
    <div style={{ height: 200, borderRadius: 20, background: a.bg, margin: '10px 0', display: 'grid', placeItems: 'center' }}>
      <video controls onPlay={play} onError={() => setMiss(true)} key={v + ep} src={vp} style={{ width: '100%', height: '100%', borderRadius: 20 }} /></div>
    {lang === 'VF' && v === 'VO' && <p className="mut">VF indisponible : version originale affichée.</p>}
    {miss && <div className="card"><b>Épisode {ep} non disponible dans VITAKU</b><Prov e={ep} s={1} /></div>}
    <h1>{a.title}</h1>
    <div className="scroll" style={{ margin: '8px 0' }}>{['VF', 'VO'].map(l => <button key={l} className={'tab ' + (lang === l ? 'on' : '')} onClick={() => setLang(l)}>{l === 'VF' ? '🇫🇷 FR · Version française' : '🇯🇵 JP · Version originale'}</button>)}</div>
    <p className="mut">TV | ⭐ {a.rating} | {a.year} | Japon | {a.genre.join(' · ')} | {ns} saison{ns > 1 ? 's' : ''}</p>
    <p style={{ margin: '10px 0' }}>{a.synopsis}</p>
    <div className="row"><button className="btn out sm" onClick={() => setList(l => l.some(x => x.id === a.id) ? l.filter(x => x.id !== a.id) : [...l, a])}>{list.some(x => x.id === a.id) ? '✓ Dans ma liste' : '+ Ajouter à la liste'}</button>
      <button className="btn out sm" onClick={() => navigator.share?.({ title: a.title, url: location.href })}>Partager</button></div>
    <button className="card row" style={{ width: '100%', marginTop: 14, color: 'inherit', cursor: 'pointer' }} onClick={() => setSheet('seasons')}><b className="t" style={{ flex: 1, textAlign: 'left' }}>📺 Épisodes · {ns} saison{ns > 1 ? 's' : ''}</b><span style={{ fontSize: 22 }}>›</span></button>
    <div className="row" style={{ margin: '18px 0 8px' }}><button className={'chip ' + (tab === 'sim' ? 'on' : '')} onClick={() => setTab('sim')}>Pour vous</button><button className={'chip ' + (tab === 'cm' ? 'on' : '')} onClick={() => setTab('cm')}>Commentaires ({cm.length})</button></div>
    {tab === 'sim' ? <div className="scroll">{ANIMES.filter(x => x.id !== a.id).map(x => <Link key={x.id} to={'/anime/' + x.id} className="poster" style={{ background: x.bg, color: '#fff', textDecoration: 'none' }}><b className="tag">{verOf(x, lang)}</b><span>{x.title}</span></Link>)}</div>
      : <><div className="row"><input value={t} onChange={e => setT(e.target.value)} placeholder="Ton avis…" /><button className="btn sm" onClick={sendCm}>Envoyer</button></div>{cm.map((c, i) => <div key={i} className="msg">{c}</div>)}</>}
    {sheet === 'seasons' && <Sheet title="Saisons">{Array.from({ length: ns }, (_, i) => i + 1).map(n => <button key={n} className="card row" style={{ width: '100%', marginTop: 10, color: 'inherit', cursor: 'pointer' }} onClick={() => { setSeason(n); setSheet('eps'); setPick(null) }}><b style={{ flex: 1, textAlign: 'left' }}>Saison {n}</b><span style={{ fontSize: 22 }}>›</span></button>)}</Sheet>}
    {sheet === 'eps' && <Sheet title={'Saison ' + season} back={() => { setSheet('seasons'); setPick(null) }}>
      <div className="card" style={{ marginTop: 10 }}><b>⬇ Toute la saison {season}</b><Prov s={season} /></div>
      <h3 className="h">Épisodes</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{Array.from({ length: ne }, (_, i) => i + 1).map(n => <button key={n} className={'chip ' + (pick?.e === n ? 'on' : '')} onClick={() => setPick({ e: n })}>{n}</button>)}</div>
      {pick && <div className="card" style={{ marginTop: 12 }}><b className="t">Épisode {pick.e}</b>
        <button className="btn sm" style={{ margin: '8px 0 0' }} onClick={() => { setEp(pick.e); setMiss(false); setSheet(null); setPick(null); scrollTo({ top: 0, behavior: 'smooth' }) }}>▶ Regarder</button>
        <div className="mut" style={{ marginTop: 10 }}>⬇ Télécharger via :</div><Prov e={pick.e} s={season} /></div>}
    </Sheet>}
  </div>
}
