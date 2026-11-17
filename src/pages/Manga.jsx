import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useManga, loadManga } from '../anilist'
import { useStore } from '../store'
import { verOf, parseQ } from '../data'
import { supabase } from '../supabase'
import { isCloud } from '../cloud'
// Lecture : l'administrateur autorise la lecture et fournit le lien du lecteur (contenu dont il détient les droits).
export default function Manga() {
  const nav = useNavigate(), list = useManga(), [q, setQ] = useState(''), [sel, setSel] = useState(null), [lib, setLib] = useStore('library', [])
  const [user] = useStore('user', {}), [acc, setAcc] = useStore('readAccess', {}), [links, setLinks] = useStore('readLinks', {}), admin = user?.role === 'admin'
  useEffect(() => { const t = setTimeout(() => loadManga(parseQ(q).q).catch(() => {}), q ? 400 : 0); return () => clearTimeout(t) }, [q])
  const pq = parseQ(q), lang = pq.vf ? 'VF' : 'VO', key = sel && sel.id + '-' + verOf(sel, lang), cloud = isCloud(user)
  useEffect(() => { if (!cloud) return; supabase.from('manga_reading').select('*').then(({ data }) => { if (!data) return; const a = {}, l = {}; data.forEach(r => { if (r.enabled) a[r.manga_id + '-' + r.lang] = true; if (r.reader_url) l[r.manga_id + '-' + r.lang] = r.reader_url }); setAcc(a); setLinks(l) }) }, [cloud])
  const save = (en, url) => cloud && admin && sel && supabase.from('manga_reading').upsert({ manga_id: sel.id, lang: verOf(sel, lang), enabled: en, reader_url: url || null, updated_by: user.id })
  return <div className="page glow"><button className="chip" onClick={() => nav(-1)}>‹ Retour</button><h1 style={{ margin: '10px 0' }}>Mangas, BD & scans</h1>
    
    <input placeholder="Rechercher un manga… (ajoute VF pour la version française)" value={q} onChange={e => setQ(e.target.value)} />
    {!list.length && <p className="mut" style={{ marginTop: 10 }}>Chargement… (connexion internet requise)</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>{list.map(m => <button key={m.id} className="poster" style={{ background: m.bg, border: 0, color: '#fff', textAlign: 'left', flex: 'none', width: '100%', height: 170 }} onClick={() => setSel(m)}><b className="tag">{verOf(m, lang)}</b><span style={{ fontSize: 12 }}>{m.title}</span></button>)}</div>
    {sel && <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: '#000a', display: 'flex', alignItems: 'flex-end' }} onClick={() => setSel(null)}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={{ background: 'var(--surf)', width: '100%', maxWidth: 520, margin: '0 auto', maxHeight: '82vh', overflow: 'auto', borderRadius: '24px 24px 0 0', padding: 18 }}>
        <div className="row" style={{ alignItems: 'flex-start' }}><div style={{ width: 90, height: 130, flex: '0 0 auto', borderRadius: 12, background: sel.bg }} /><div><h2>{sel.title}</h2><div className="mut">⭐ {sel.rating} · {sel.year} · {sel.chapters ? sel.chapters + ' chapitres' : 'En cours'}</div><div>{sel.genre.map(g => <span key={g} className="chip">{g}</span>)}</div></div></div>
        <p style={{ margin: '12px 0' }}>{sel.synopsis}</p>
        <div className="row" style={{ flexWrap: 'wrap' }}><button className="btn sm" onClick={() => setLib(l => l.some(x => x.id === sel.id) ? l.filter(x => x.id !== sel.id) : [...l, sel])}>{lib.some(x => x.id === sel.id) ? '✓ Dans ma bibliothèque' : '+ Bibliothèque'}</button>
          <a className="btn out sm" href={sel.url} target="_blank" rel="noreferrer">Infos & sources</a></div>
        <div className="card" style={{ marginTop: 12 }}><b className="t">📖 Lecture ({verOf(sel, lang) === 'VF' ? 'version française' : 'version originale'})</b>
          {acc[key] && links[key] ? <a className="btn" style={{ display: 'block', marginTop: 10 }} href={links[key]} target="_blank" rel="noreferrer">Lire maintenant</a> : <p className="mut" style={{ marginTop: 6 }}>La lecture n'est pas encore activée par l'administrateur.</p>}
          {admin && <><label>Admin · lien du lecteur ({verOf(sel, lang)})</label><input value={links[key] || ''} placeholder="https://…" onChange={e => setLinks({ ...links, [key]: e.target.value })} onBlur={() => save(!!acc[key], links[key])} />
            <label className="row"><input type="checkbox" style={{ width: 22 }} checked={!!acc[key]} onChange={e => { setAcc({ ...acc, [key]: e.target.checked }); save(e.target.checked, links[key]) }} /> Autoriser la lecture aux utilisateurs</label></>}</div>
      </div></div>}
  </div>
}
