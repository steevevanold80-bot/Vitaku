import { useState, useRef, useEffect } from 'react'
import { supabase as sb } from '../supabase'
import { useLive, rows } from '../cloud'
import { Sheet, ok } from '../ui'
// Événements façon TikTok : fil de publications (photo/vidéo/lien), j'aime, commentaires, favoris, partage ; événements ; chaînes.
const KINDS = [['post', '📝 Publication'], ['podcast', '🎙 Podcast'], ['streaming', '📡 Streaming'], ['live', '🔴 Live'], ['montage', '🎞 Montage'], ['playlist', '🎵 Playlist d’openings']], CATS = ['Sorties', 'Tournois', 'Visionnage', 'Autre']
const H = 'calc(100dvh - 330px)', cnt = x => x?.[0]?.count || 0, when = d => new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
function Comments({ p, me, onClose }) {
  const [t, setT] = useState(''), [c, rl] = useLive(() => rows(sb.from('post_comments').select('id,body,profiles(username)').eq('post_id', p.id).order('created_at')), ['post_comments'], [p.id])
  const send = async () => { if (t.trim() && ok(await sb.from('post_comments').insert({ post_id: p.id, user_id: me, body: t.trim() }))) { setT(''); rl() } }
  return <Sheet title="Commentaires" onClose={onClose} foot={<div className="row" style={{ paddingTop: 8 }}><input value={t} onChange={e => setT(e.target.value)} placeholder="Ajouter un commentaire…" onKeyDown={e => e.key === 'Enter' && send()} /><button className="btn sm" onClick={send}>OK</button></div>}>
    {(c || []).map(x => <div key={x.id} className="msg"><b style={{ fontSize: 12, color: 'var(--pink)', display: 'block' }}>{x.profiles?.username}</b>{x.body}</div>)}{c && !c.length && <p className="mut">Sois le premier à commenter.</p>}</Sheet>
}
function Post({ p, me, liked, faved, reload, onComments }) {
  const v = useRef()
  useEffect(() => { const el = v.current; if (!el) return; const io = new IntersectionObserver(([e]) => e.isIntersecting ? el.play().catch(() => {}) : el.pause(), { threshold: .6 }); io.observe(el); return () => io.disconnect() }, [])
  const tog = async (tb, on) => { ok(on ? await sb.from(tb).delete().match({ post_id: p.id, user_id: me }) : await sb.from(tb).insert({ post_id: p.id, user_id: me })); reload() }
  const share = () => navigator.share ? navigator.share({ title: p.title, text: p.body || p.title, url: p.url || location.origin }).catch(() => {}) : navigator.clipboard?.writeText(p.url || location.origin)
  const B = ({ i, n, on, ...r }) => <button {...r} style={{ background: '#0006', border: 0, borderRadius: 999, width: 48, padding: '8px 0', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', filter: on ? 'drop-shadow(0 0 6px var(--pink))' : 'none' }}>{i}<span style={{ fontSize: 12 }}>{n}</span></button>
  return <div style={{ height: H, scrollSnapAlign: 'start', position: 'relative', borderRadius: 22, overflow: 'hidden', marginBottom: 12, background: 'linear-gradient(160deg,#2a1450,#0B0614)', display: 'grid', placeItems: 'center' }}>
    {p.media_type === 'video' ? <video ref={v} src={p.media_url} loop muted playsInline controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : p.media_url ? <img alt={p.title} src={p.media_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{ padding: 28, textAlign: 'center' }}><div style={{ fontSize: 56 }}>{KINDS.find(k => k[0] === p.kind)?.[1].split(' ')[0]}</div><h2 style={{ margin: '10px 0' }}>{p.title}</h2>{p.url && <a className="btn sm" href={p.url} target="_blank" rel="noreferrer">▶ Ouvrir</a>}</div>}
    <div style={{ position: 'absolute', left: 0, right: 70, bottom: 0, padding: 14, background: 'linear-gradient(transparent,#000d)', textShadow: '0 1px 6px #000' }}>
      <b>@{p.channels?.name || p.profiles?.username}</b> <span className="chip on">{p.kind}</span>{p.events?.title && <span className="chip">📅 {p.events.title}</span>}
      {p.media_url && <div style={{ fontWeight: 800 }}>{p.title}</div>}{p.body && <div style={{ fontSize: 14 }}>{p.body}</div>}{p.url && p.media_url && <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--pink)' }}>🔗 Lien</a>}</div>
    <div style={{ position: 'absolute', right: 8, bottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <B i={liked ? '❤️' : '🤍'} n={cnt(p.post_likes)} on={liked} aria-label="J'aime" onClick={() => tog('post_likes', liked)} /><B i="💬" n={cnt(p.post_comments)} aria-label="Commentaires" onClick={onComments} />
      <B i={faved ? '🔖' : '📑'} n="" on={faved} aria-label="Favori" onClick={() => tog('post_favs', faved)} /><B i="↗" n="" aria-label="Partager" onClick={share} /></div></div>
}
export default function EventsHub({ me }) {
  const [tab, setTab] = useState('feed'), [fl, setFl] = useState(null), [sheet, setSheet] = useState(null), [fm, setFm] = useState({}), [cm, setCm] = useState(null), [cat, setCat] = useState('Tous'), [busy, setBusy] = useState(false)
  const [posts, rp] = useLive(() => rows(sb.from('posts').select('*,profiles(username),channels(name),events(title),post_likes(count),post_comments(count)').order('created_at', { ascending: false }).limit(60)), ['posts', 'post_likes', 'post_comments'], [])
  const [my, rmy] = useLive(async () => { const g = tb => rows(sb.from(tb).select('*').eq('user_id', me)); const [l, f, o] = await Promise.all([g('post_likes'), g('post_favs'), g('channel_follows')]); return { l: new Set(l.map(x => x.post_id)), f: new Set(f.map(x => x.post_id)), o: new Set(o.map(x => x.channel_id)) } }, ['post_likes', 'channel_follows'], [me])
  const [evs, re] = useLive(() => rows(sb.from('events').select('id,title,starts_at,is_live,category,description,created_by').order('starts_at')), ['events'], [])
  const [chs, rc] = useLive(() => rows(sb.from('channels').select('id,name,description,owner_id,profiles(username),channel_follows(count)').order('created_at', { ascending: false })), ['channels', 'channel_follows'], [])
  const mc = (chs || []).filter(c => c.owner_id === me), M = my || { l: new Set(), f: new Set(), o: new Set() }
  const feed = (posts || []).filter(p => tab === 'fav' ? M.f.has(p.id) : !fl || (fl.ch ? p.channel_id === fl.ch : p.event_id === fl.ev))
  const open = (k, d = {}) => { setFm(d); setSheet(k) }
  const del = async (tb, id, r) => { if (confirm('Supprimer ?') && ok(await sb.from(tb).delete().eq('id', id))) r() }
  const follow = async c => { ok(M.o.has(c.id) ? await sb.from('channel_follows').delete().match({ channel_id: c.id, user_id: me }) : await sb.from('channel_follows').insert({ channel_id: c.id, user_id: me })); rmy(); rc() }
  const submit = async e => {
    e.preventDefault(); setBusy(true); let r
    if (sheet === 'channel') { r = await sb.from('channels').insert({ owner_id: me, name: fm.name, description: fm.desc || null }); if (ok(r)) rc() }
    else if (sheet === 'event') { r = await sb.from('events').insert({ title: fm.title, starts_at: new Date(fm.at).toISOString(), is_live: !!fm.live, category: fm.cat || 'Autre', description: fm.desc || null, created_by: me }); if (ok(r)) re() }
    else { let media_url = null, media_type = null; const fi = fm.file
      if (fi) { const path = `${me}/${Date.now()}-${fi.name.replace(/[^\w.-]/g, '_')}`, up = await sb.storage.from('posts').upload(path, fi, { contentType: fi.type }); if (up.error) { setBusy(false); return alert(up.error.message) } media_url = sb.storage.from('posts').getPublicUrl(path).data.publicUrl; media_type = fi.type.startsWith('video') ? 'video' : 'image' }
      r = await sb.from('posts').insert({ user_id: me, kind: fm.kind || 'post', title: fm.title, body: fm.body || null, url: fm.url || null, channel_id: fm.ch || null, event_id: fm.ev || null, media_url, media_type }); if (ok(r)) rp() }
    setBusy(false); if (!r.error) setSheet(null)
  }
  const I = (k, ph, o = {}) => <input placeholder={ph} value={fm[k] || ''} onChange={e => setFm({ ...fm, [k]: e.target.value })} {...o} />
  return <div>
    <div className="scroll">{[['feed', '🔥 Pour toi'], ['ev', '📅 Événements'], ['ch', '📺 Chaînes'], ['fav', '🔖 Favoris']].map(([k, l]) => <button key={k} className={'chip ' + (tab === k ? 'on' : '')} style={{ fontSize: 14, padding: '8px 14px' }} onClick={() => setTab(k)}>{l}</button>)}</div>
    {(tab === 'feed' || tab === 'fav') && <>
      {fl && tab === 'feed' && <button className="chip on" onClick={() => setFl(null)}>{fl.name} ✕</button>}
      <div style={{ height: H, overflowY: 'auto', scrollSnapType: 'y mandatory', marginTop: 8 }}>
        {feed.map(p => <Post key={p.id} p={p} me={me} liked={M.l.has(p.id)} faved={M.f.has(p.id)} reload={() => { rp(); rmy() }} onComments={() => setCm(p)} />)}
        {posts && !feed.length && <p className="mut">{tab === 'fav' ? 'Aucun favori.' : 'Aucune publication. Sois le premier !'}</p>}</div>
      <button className="btn" aria-label="Publier" style={{ position: 'fixed', right: 18, bottom: 90, width: 56, height: 56, borderRadius: '50%', fontSize: 26, padding: 0, zIndex: 20 }} onClick={() => open('post', { kind: 'post', ch: mc[0]?.id || '' })}>＋</button></>}
    {tab === 'ev' && <><div className="scroll" style={{ marginTop: 8 }}>{['Tous', ...CATS].map(c => <button key={c} className={'chip ' + (cat === c ? 'on' : '')} onClick={() => setCat(c)}>{c}</button>)}</div>
      <button className="btn sm" style={{ margin: '8px 0' }} onClick={() => open('event', { cat: 'Sorties' })}>＋ Créer un événement</button>
      {(evs || []).filter(e => cat === 'Tous' || e.category === cat).map(e => <div key={e.id} className="card" style={{ marginBottom: 10 }}><div className="row"><b className="t" style={{ flex: 1 }}>{e.title}</b>{e.is_live && <span className="chip on">● En direct</span>}</div><div className="mut">{e.category} · {when(e.starts_at)}</div>{e.description && <p>{e.description}</p>}
        <div className="row" style={{ marginTop: 8 }}><button className="btn out sm" onClick={() => { setFl({ ev: e.id, name: '📅 ' + e.title }); setTab('feed') }}>Voir les publications</button><button className="btn sm" onClick={() => open('post', { kind: 'post', ev: e.id, ch: mc[0]?.id || '' })}>Publier ici</button>{e.created_by === me && <button className="chip" onClick={() => del('events', e.id, re)}>🗑</button>}</div></div>)}
      {evs && !evs.length && <p className="mut">Aucun événement publié.</p>}</>}
    {tab === 'ch' && <><button className="btn sm" style={{ margin: '8px 0' }} onClick={() => open('channel')}>＋ Créer ma chaîne</button>
      {(chs || []).map(c => <div key={c.id} className="card" style={{ marginBottom: 10 }}><b className="t">{c.name}</b><div className="mut">par {c.profiles?.username} · {cnt(c.channel_follows)} abonné(s)</div>{c.description && <p>{c.description}</p>}
        <div className="row" style={{ marginTop: 8 }}><button className="btn out sm" onClick={() => { setFl({ ch: c.id, name: '📺 ' + c.name }); setTab('feed') }}>Voir</button>{c.owner_id !== me ? <button className="btn sm" onClick={() => follow(c)}>{M.o.has(c.id) ? '✓ Suivi' : 'Suivre'}</button> : <button className="chip" onClick={() => del('channels', c.id, rc)}>🗑</button>}</div></div>)}
      {chs && !chs.length && <p className="mut">Aucune chaîne. Crée la première !</p>}</>}
    {cm && <Comments p={cm} me={me} onClose={() => setCm(null)} />}
    {sheet && <Sheet title={sheet === 'post' ? 'Publier' : sheet === 'event' ? 'Nouvel événement' : 'Nouvelle chaîne'} onClose={() => setSheet(null)}>
      <form onSubmit={submit}>
        {sheet === 'channel' && <>{I('name', 'Nom de la chaîne (ex : Trace Anime)', { required: true, minLength: 2 })}{I('desc', 'Description')}</>}
        {sheet === 'event' && <>{I('title', 'Titre', { required: true })}<input type="datetime-local" required value={fm.at || ''} onChange={e => setFm({ ...fm, at: e.target.value })} /><select value={fm.cat} onChange={e => setFm({ ...fm, cat: e.target.value })}>{CATS.map(c => <option key={c}>{c}</option>)}</select>{I('desc', 'Description')}<label><input type="checkbox" checked={!!fm.live} onChange={e => setFm({ ...fm, live: e.target.checked })} style={{ width: 'auto' }} /> En direct</label></>}
        {sheet === 'post' && <><select value={fm.kind} onChange={e => setFm({ ...fm, kind: e.target.value })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>{I('title', 'Titre', { required: true, maxLength: 120 })}{I('body', 'Description')}{I('url', 'Lien (YouTube, TikTok, live…)', { type: 'url' })}
          <label className="mut">Photo ou vidéo (50 Mo max)</label><input type="file" accept="image/*,video/*" onChange={e => setFm({ ...fm, file: e.target.files[0] })} />
          <select value={fm.ch || ''} onChange={e => setFm({ ...fm, ch: e.target.value })}><option value="">Sans chaîne (à mon nom)</option>{mc.map(c => <option key={c.id} value={c.id}>Chaîne : {c.name}</option>)}</select>
          <select value={fm.ev || ''} onChange={e => setFm({ ...fm, ev: e.target.value })}><option value="">Sans événement</option>{(evs || []).map(x => <option key={x.id} value={x.id}>Événement : {x.title}</option>)}</select></>}
        <br /><button className="btn" disabled={busy}>{busy ? 'Envoi…' : sheet === 'post' ? 'Publier' : 'Créer'}</button></form></Sheet>}
  </div>
}
