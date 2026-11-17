import { useEffect } from 'react'
import { supabase } from './supabase'
import { isCloud, useLive, rows } from './cloud'
import { Link } from 'react-router-dom'
import { useStore } from './store'
import { EVENTS } from './data'
import { useUpcoming } from './anilist'
const QUESTS = [{ id: 'watch', t: 'Regarder un épisode', xp: 20 }, { id: 'duel', t: 'Lancer un duel', xp: 30 }, { id: 'chat', t: 'Écrire dans une discussion', xp: 20 }, { id: 'join', t: 'Rejoindre un groupe', xp: 20 }]
const day = o => new Date(Date.now() - o * 864e5).toISOString().slice(0, 10)
function useData() {
  const [raw, setRaw] = useStore('daily', { day: '', bonus: false, done: [], streak: 0, last: '' }), [user, setUser] = useStore('user', {}), [notif] = useStore('notif', true)
  const [watched] = useStore('watched', []), [duels] = useStore('duels', []), [chat] = useStore('chat', [{}]), [joined] = useStore('joined', []), [li, setInc] = useStore('incoming', [{ id: 1, from: 'Kuro_Fan', status: 'pending' }]), cloud = isCloud(user), [ci, reload] = useLive(() => rows(supabase.from('card_access').select('viewer_id,status,profiles!card_access_viewer_id_fkey(username)').eq('owner_id', user.id)), ['card_access'], [user?.id], cloud), inc = cloud ? (ci || []).map(x => ({ id: x.viewer_id, from: x.profiles?.username || '?', status: x.status === 'pending' ? 'pending' : x.status === 'accepted' ? 'ok' : 'no' })) : li
  const d = raw.day === day(0) ? raw : { ...raw, day: day(0), bonus: false, done: [] }
  const ok = { watch: watched.length > 0, duel: duels.length > 0, chat: chat.length > 1, join: joined.length > 0 }
  const claimable = QUESTS.filter(q => ok[q.id] && !d.done.includes(q.id)), pending = inc.filter(x => x.status === 'pending')
  return { d, setRaw, ok, inc, setInc, user, setUser, pending, cloud, reload, count: notif ? (d.bonus ? 0 : 1) + claimable.length + pending.length : 0 }
}
export const useNotifCount = () => { const d = useData(), [on] = useStore('notif', true); return on ? d.count : 0 }
export default function Notifications({ onClose }) {
  const [pr] = useStore('notifprefs', { annonces: true, events: true, quetes: true, duels: true, messages: true })
  const { d, setRaw, ok, inc, setInc, user, setUser, pending, cloud, reload } = useData(), up = useUpcoming().slice(0, 4)
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  const addXp = n => setUser({ ...user, xp: (user.xp || 0) + n })
  const streak = d.last === day(1) ? d.streak + 1 : d.last === day(0) ? d.streak : 1, bonusXp = 10 + Math.min(streak - 1, 5) * 5
  const bonus = () => { addXp(bonusXp); setRaw({ ...d, bonus: true, streak, last: day(0) }) }
  const claim = q => { addXp(q.xp); setRaw({ ...d, done: [...d.done, q.id] }) }
  const answer = (id, status) => cloud ? supabase.from('card_access').update({ status: status === 'ok' ? 'accepted' : 'refused' }).eq('owner_id', user.id).eq('viewer_id', id).then(() => reload()) : setInc(inc.map(x => x.id === id ? { ...x, status } : x))
  const H = ({ children }) => <h3 className="t" style={{ margin: '16px 0 8px' }}>{children}</h3>
  return <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: '#000a', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label="Notifications" onClick={e => e.stopPropagation()} style={{ background: 'var(--surf)', width: '100%', maxWidth: 520, maxHeight: '82vh', overflow: 'auto', borderRadius: '24px 24px 0 0', padding: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><h2>Notifications</h2><button className="chip" onClick={onClose} aria-label="Fermer">✕</button></div>
      {pr.quetes && <H>🎁 Bonus de connexion</H>}
      {pr.quetes && <div className="card row"><div style={{ flex: 1 }}><b>Série : {streak} jour{streak > 1 ? 's' : ''}</b><div className="mut">+{bonusXp} XP aujourd'hui</div></div>
        <button className="btn sm" disabled={d.bonus} onClick={bonus}>{d.bonus ? '✓ Reçu' : 'Récupérer'}</button></div>}
      {pr.quetes && <H>🎯 Quêtes quotidiennes</H>}
      {pr.quetes && QUESTS.map(q => <div key={q.id} className="card row" style={{ marginBottom: 8 }}><div style={{ flex: 1 }}><b>{q.t}</b><div className="mut">+{q.xp} XP</div></div>
        {d.done.includes(q.id) ? <span className="chip on">✓ Fait</span> : <button className="btn sm" disabled={!ok[q.id]} onClick={() => claim(q)}>{ok[q.id] ? 'Valider' : 'À faire'}</button>}</div>)}
      {pr.duels && inc.length > 0 && <><H>🔐 Demandes pour voir ma carte</H>{inc.map(x => <div key={x.id} className="card row" style={{ marginBottom: 8 }}><div style={{ flex: 1 }}><b>{x.from}</b><div className="mut">veut voir ta carte Otaku</div></div>
        {x.status === 'pending' ? <><button className="btn sm" onClick={() => answer(x.id, 'ok')}>Accepter</button><button className="btn out sm" onClick={() => answer(x.id, 'no')}>Refuser</button></> : <span className="chip on">{x.status === 'ok' ? 'Accepté' : 'Refusé'}</span>}</div>)}</>}
      {pr.annonces && <H>📢 Annonces de sortie</H>}
      {pr.annonces && up.map(a => <Link key={a.id} to={'/anime/' + a.id} onClick={onClose} className="card row" style={{ marginBottom: 8, color: 'inherit', textDecoration: 'none' }}><div style={{ width: 40, height: 56, borderRadius: 8, background: a.bg }} /><div><b>{a.title}</b><div className="mut">{a.release ? 'Sortie : ' + a.release : 'Bientôt'}</div></div></Link>)}
      {pr.events && <H>📅 Événements</H>}
      {pr.events && EVENTS.map(e => <div key={e.id} className="card row" style={{ marginBottom: 8 }}><div style={{ flex: 1 }}><b>{e.title}</b><div className="mut">{e.when}</div></div>{e.live && <span className="chip on">● Direct</span>}</div>)}
    </div></div>
}
