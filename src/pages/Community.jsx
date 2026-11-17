import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase as sb } from '../supabase'
import { useStore } from '../store'
import { useT } from '../i18n'
import { isCloud, useLive, rows } from '../cloud'
import { Sheet, Av, ok } from '../ui'
import EventsHub from './Events'
// Communauté façon WhatsApp : statuts, discussions privées, groupes, mini-communautés. Les sondages vivent dans les groupes/communautés.
function Chat({ c, me, onClose }) {
  const dm = c.type === 'dm', [txt, setTxt] = useState(''), [pf, setPf] = useState(null), [, setChat] = useStore('chat', [{}]), end = useRef()
  const [items, reload] = useLive(async () => {
    if (dm) { const m = await rows(sb.from('dm_messages').select('id,body,created_at,sender_id').or(`and(sender_id.eq.${me},receiver_id.eq.${c.id}),and(sender_id.eq.${c.id},receiver_id.eq.${me})`).order('created_at').limit(200)); return m.map(x => ({ ...x, k: 'm', mine: x.sender_id === me })) }
    const [m, p] = await Promise.all([rows(sb.from('messages').select('id,body,created_at,user_id,profiles(username)').eq('community_id', c.id).order('created_at').limit(200)), rows(sb.from('polls').select('id,question,created_at,poll_options(id,label),poll_votes(option_id,user_id)').eq('community_id', c.id))])
    return [...m.map(x => ({ ...x, k: 'm', mine: x.user_id === me })), ...p.map(x => ({ ...x, k: 'p' }))].sort((a, b) => a.created_at < b.created_at ? -1 : 1)
  }, dm ? ['dm_messages'] : ['messages', 'polls', 'poll_votes'], [c.id])
  useEffect(() => { end.current?.scrollIntoView() }, [items?.length])
  const send = async () => { const b = txt.trim(); if (!b) return; setTxt(''); const r = dm ? await sb.from('dm_messages').insert({ sender_id: me, receiver_id: c.id, body: b }) : await sb.from('messages').insert({ community_id: c.id, user_id: me, body: b }); if (ok(r)) { setChat(x => [...x, {}]); reload() } }
  const vote = async (p, o) => { if (ok(await sb.from('poll_votes').insert({ poll_id: p.id, option_id: o, user_id: me }))) reload() }
  const mkPoll = async () => { const q = pf.q.trim(), o = pf.o.split(',').map(s => s.trim()).filter(Boolean); if (!q || o.length < 2) return alert('Une question et au moins 2 options (séparées par des virgules).'); const r = await sb.from('polls').insert({ community_id: c.id, question: q, created_by: me }).select('id').single(); if (ok(r) && ok(await sb.from('poll_options').insert(o.map(label => ({ poll_id: r.data.id, label }))))) { setPf(null); reload() } }
  const foot = <div style={{ paddingTop: 8 }}>
    {pf && <div className="card"><input placeholder="Question du sondage" value={pf.q} onChange={e => setPf({ ...pf, q: e.target.value })} /><input placeholder="Options : A, B, C" value={pf.o} onChange={e => setPf({ ...pf, o: e.target.value })} /><div className="row" style={{ marginTop: 8 }}><button className="btn sm" onClick={mkPoll}>Publier le sondage</button><button className="btn out sm" onClick={() => setPf(null)}>Annuler</button></div></div>}
    <div className="row">{!dm && <button className="chip" aria-label="Créer un sondage" onClick={() => setPf({ q: '', o: '' })}>📊</button>}<input value={txt} onChange={e => setTxt(e.target.value)} placeholder="Écrire un message" onKeyDown={e => e.key === 'Enter' && send()} /><button className="btn sm" onClick={send}>Envoyer</button></div></div>
  return <Sheet full title={c.title} onClose={onClose} foot={foot}>
    {(items || []).map(m => m.k === 'p' ? <div key={'p' + m.id} className="card" style={{ margin: '10px 0' }}><b className="t">📊 {m.question}</b>{m.poll_options.map(o => { const n = m.poll_votes.filter(v => v.option_id === o.id).length, voted = m.poll_votes.some(v => v.user_id === me), mine = m.poll_votes.some(v => v.user_id === me && v.option_id === o.id)
      return <button key={o.id} className={'btn out'} disabled={voted} style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', opacity: voted && !mine ? .7 : 1 }} onClick={() => vote(m, o.id)}><span>{mine ? '✓ ' : ''}{o.label}</span><span>{n}</span></button> })}</div>
      : <div key={m.id} className={'msg ' + (m.mine ? 'me' : '')}>{!dm && !m.mine && <b style={{ fontSize: 12, color: 'var(--pink)', display: 'block' }}>{m.profiles?.username}</b>}{m.body}</div>)}
    {items && !items.length && <p className="mut">Aucun message. Lance la discussion !</p>}<div ref={end} /></Sheet>
}
export default function Community() {
  const t = useT(), [user] = useStore('user', null), cloud = isCloud(user), me = user?.id, [mode, setMode] = useState('com'), [chat, setChat] = useState(null), [mk, setMk] = useState(null), [f, setF] = useState({ name: '', desc: '', members: '' }), [view, setView] = useState(null), [, setJoined] = useStore('joined', [])
  const [mine, rm] = useLive(() => rows(sb.from('community_members').select('role,communities(id,name,kind,description)').eq('user_id', me)), ['community_members', 'communities'], [me], cloud)
  const [pub] = useLive(() => rows(sb.from('communities').select('id,name,description').eq('kind', 'community').limit(30)), ['communities'], [me], cloud)
  const [st, rs] = useLive(() => rows(sb.from('stories').select('id,text,user_id,profiles(username)').order('expires_at', { ascending: false })), ['stories'], [me], cloud)
  const [dms] = useLive(async () => { const m = await rows(sb.from('dm_messages').select('body,sender_id,receiver_id,s:profiles!dm_messages_sender_id_fkey(username),r:profiles!dm_messages_receiver_id_fkey(username)').order('created_at', { ascending: false }).limit(200)); const seen = {}; m.forEach(x => { const o = x.sender_id === me ? { id: x.receiver_id, name: x.r?.username } : { id: x.sender_id, name: x.s?.username }; if (!seen[o.id]) seen[o.id] = { ...o, last: x.body } }); return Object.values(seen) }, ['dm_messages'], [me], cloud)
  if (!cloud) return <div className="page glow"><h1>{t('Communauté')}</h1><div className="card" style={{ marginTop: 12 }}><p>La communauté et les événements demandent un vrai compte (pas le mode démo).</p><br /><Link className="btn" to="/signup">Créer mon compte</Link></div></div>
  const ids = new Set((mine || []).map(x => x.communities?.id)), users = [...new Map((st || []).map(s => [s.user_id, s.profiles?.username || '?'])).entries()]
  const list = [...(mine || []).filter(x => x.communities).map(x => ({ type: 'group', id: x.communities.id, title: x.communities.name, sub: (x.communities.kind === 'community' ? '🌐 Communauté' : '👥 Groupe') + (x.communities.description ? ' · ' + x.communities.description : '') })), ...(dms || []).map(d => ({ type: 'dm', id: d.id, title: d.name || '?', sub: d.last }))]
  const status = () => { const x = prompt('Ton statut (visible 24 h) :'); if (x) sb.from('stories').insert({ user_id: me, text: x.slice(0, 200) }).then(r => ok(r) && rs()) }
  const join = async c => { if (ok(await sb.from('community_members').insert({ community_id: c.id, user_id: me, role: 'member' }))) { setJoined(j => [...j, c.id]); rm(); setChat({ type: 'group', id: c.id, title: c.name }) } }
  const create = async e => {
    e.preventDefault(); const name = f.name.trim(); if (!name) return
    if (mk === 'dm') { const r = await sb.from('profiles').select('id,username').eq('username', name).maybeSingle(); if (!r.data) return alert('Pseudo introuvable.'); setMk(null); setChat({ type: 'dm', id: r.data.id, title: r.data.username }); return }
    const r = await sb.from('communities').insert({ name, kind: mk, description: f.desc || null, created_by: me }).select('id').single(); if (!ok(r)) return
    const ns = f.members.split(',').map(s => s.trim()).filter(Boolean); if (ns.length) { const p = await rows(sb.from('profiles').select('id').in('username', ns)); if (p.length) await sb.from('community_members').insert(p.map(x => ({ community_id: r.data.id, user_id: x.id, role: 'member' }))) }
    setJoined(j => [...j, r.data.id]); setMk(null); setF({ name: '', desc: '', members: '' }); rm(); setChat({ type: 'group', id: r.data.id, title: name })
  }
  return <div className="page glow"><h1>{t('Communauté')} / {t('Événements')}</h1>
    <div className="row" style={{ margin: '10px 0' }}>{[['com', '💬 Communauté'], ['ev', '🎬 Événements']].map(([k, l]) => <button key={k} className={'tab ' + (mode === k ? 'on' : '')} style={{ flex: 1 }} onClick={() => setMode(k)}>{l}</button>)}</div>
    {mode === 'ev' ? <EventsHub me={me} /> : <>
      <div className="scroll" style={{ margin: '6px 0' }}><div style={{ textAlign: 'center' }}><button className="story" aria-label="Ajouter un statut" onClick={status}>＋</button><span className="mut">Mon statut</span></div>
        {users.map(([id, n]) => <div key={id} style={{ textAlign: 'center' }}><button className="story" onClick={() => setView({ name: n, texts: st.filter(s => s.user_id === id).map(s => s.text) })}>{n[0].toUpperCase()}</button><span className="mut">{n.slice(0, 9)}</span></div>)}</div>
      <h3 className="h">Discussions</h3>
      {list.map(c => <button key={c.type + c.id} className="card row" style={{ width: '100%', marginBottom: 8, color: 'inherit', textAlign: 'left', cursor: 'pointer' }} onClick={() => setChat(c)}><Av n={c.title} /><div style={{ flex: 1, minWidth: 0 }}><b>{c.title}</b><div className="mut" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.sub}</div></div></button>)}
      {!list.length && <p className="mut">Aucune discussion. Touche ＋ pour créer un groupe, une communauté ou écrire à quelqu'un.</p>}
      {(pub || []).filter(c => !ids.has(c.id)).length > 0 && <><h3 className="h">🌐 Communautés à rejoindre</h3>{pub.filter(c => !ids.has(c.id)).map(c => <div key={c.id} className="card row" style={{ marginBottom: 8 }}><Av n={c.name} /><div style={{ flex: 1 }}><b>{c.name}</b><div className="mut">{c.description}</div></div><button className="btn sm" onClick={() => join(c)}>Rejoindre</button></div>)}</>}
      <button className="btn" aria-label="Nouveau" style={{ position: 'fixed', right: 18, bottom: 90, width: 56, height: 56, borderRadius: '50%', fontSize: 26, padding: 0, zIndex: 20 }} onClick={() => setMk('menu')}>＋</button></>}
    {chat && <Chat c={chat} me={me} onClose={() => setChat(null)} />}
    {view && <Sheet title={'Statut de ' + view.name} onClose={() => setView(null)}>{view.texts.map((x, i) => <div key={i} className="card" style={{ marginTop: 12, padding: 28, fontSize: 22, textAlign: 'center', background: 'var(--grad)' }}>{x}</div>)}</Sheet>}
    {mk === 'menu' && <Sheet title="Nouveau" onClose={() => setMk(null)}>{[['group', '👥 Nouveau groupe'], ['community', '🌐 Nouvelle mini-communauté'], ['dm', '💬 Nouvelle discussion']].map(([k, l]) => <button key={k} className="btn out" style={{ marginTop: 10 }} onClick={() => setMk(k)}>{l}</button>)}</Sheet>}
    {mk && mk !== 'menu' && <Sheet title={mk === 'dm' ? 'Nouvelle discussion' : mk === 'group' ? 'Nouveau groupe' : 'Nouvelle communauté'} onClose={() => setMk(null)} back={() => setMk('menu')}>
      <form onSubmit={create}><input required autoFocus placeholder={mk === 'dm' ? 'Pseudo exact de la personne' : 'Nom'} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        {mk !== 'dm' && <input placeholder="Description (facultatif)" value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} />}
        {mk === 'group' && <input placeholder="Membres : pseudo1, pseudo2" value={f.members} onChange={e => setF({ ...f, members: e.target.value })} />}
        <br /><button className="btn">{mk === 'dm' ? 'Ouvrir' : 'Créer'}</button>{mk === 'community' && <p className="mut">Une mini-communauté est publique : tout le monde peut la rejoindre.</p>}</form></Sheet>}
  </div>
}
