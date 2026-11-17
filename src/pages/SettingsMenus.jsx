import { useState } from 'react'
import { useStore } from '../store'
import { supabase } from '../supabase'
export const Switch = ({ on, set, label }) => <button role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} style={{ width: 54, height: 30, borderRadius: 999, border: 0, padding: 3, cursor: 'pointer', flex: '0 0 auto', background: on ? 'var(--grad)' : 'var(--chip)', transition: '.2s' }}>
  <span style={{ display: 'block', width: 24, height: 24, borderRadius: '50%', background: '#fff', transform: on ? 'translateX(24px)' : 'none', transition: '.2s' }} /></button>
const Line = ({ l, children }) => <div className="card row" style={{ marginTop: 10 }}><b style={{ flex: 1 }}>{l}</b>{children}</div>
const Sw = ({ s, k, l }) => <Line l={l}><Switch on={s[0][k]} set={v => s[1]({ ...s[0], [k]: v })} label={l} /></Line>
const useUser = () => { const [u, setUser] = useStore('user', null); return [u || {}, setUser] }
function Compte() {
  const [user, setUser] = useUser(), [n, setN] = useState(user.name || ''), [msg, setMsg] = useState('')
  const save = async () => {
    setMsg(''); if (n.trim().length < 3) return setMsg('Le pseudo doit faire au moins 3 caractères.')
    if (supabase && user.id) { const { error } = await supabase.from('profiles').update({ username: n.trim() }).eq('id', user.id); if (error) return setMsg(error.code === '23505' ? 'Ce pseudo est déjà pris.' : error.message) }
    setUser({ ...user, name: n.trim() }); setMsg('✓ Enregistré')
  }
  return <><label>Pseudo</label><input value={n} maxLength={24} onChange={e => setN(e.target.value)} /><label>E-mail</label><input value={user.email || '—'} readOnly />
    <br /><button className="btn" onClick={save}>Enregistrer</button>{msg && <p role="status" style={{ marginTop: 10 }}>{msg}</p>}</>
}
function Privacy() { const s = useStore('privacy', { profile: true, online: true, dm: true, history: false })
  return <><Sw s={s} k="profile" l="Profil visible par tous" /><Sw s={s} k="online" l="Afficher « En ligne »" /><Sw s={s} k="dm" l="Autoriser les messages privés" /><Sw s={s} k="history" l="Historique de visionnage visible" /></> }
function Notifs() { const s = useStore('notifprefs', { annonces: true, events: true, quetes: true, duels: true, messages: true })
  return <><Sw s={s} k="annonces" l="Annonces de sortie" /><Sw s={s} k="events" l="Événements" /><Sw s={s} k="quetes" l="Quêtes et bonus quotidiens" /><Sw s={s} k="duels" l="Défis et résultats de duels" /><Sw s={s} k="messages" l="Messages et réactions" /></> }
function Content() { const [lang, setLang] = useStore('lang', 'VF')
  return <><p className="mut" style={{ margin: '8px 0' }}>Version proposée par défaut pour les animes et les mangas.</p><div className="row">{['VF', 'VO'].map(l => <button key={l} className={'tab ' + (lang === l ? 'on' : '')} onClick={() => setLang(l)}>{l === 'VF' ? '🇫🇷 Version française' : '🇯🇵 Version originale'}</button>)}</div></> }
function Security() {
  const [a, setA] = useState(''), [b, setB] = useState(''), [msg, setMsg] = useState('')
  const go = async () => {
    if (a.length < 6) return setMsg('6 caractères minimum.'); if (a !== b) return setMsg('Les mots de passe ne correspondent pas.')
    if (!supabase) return setMsg('Disponible une fois la base de données connectée.')
    const { error } = await supabase.auth.updateUser({ password: a }); setMsg(error ? error.message : '✓ Mot de passe modifié'); if (!error) { setA(''); setB('') }
  }
  return <><label>Nouveau mot de passe</label><input type="password" value={a} onChange={e => setA(e.target.value)} /><label>Confirmer le mot de passe</label><input type="password" value={b} onChange={e => setB(e.target.value)} />
    <br /><button className="btn" onClick={go}>Changer le mot de passe</button>{msg && <p role="status" style={{ marginTop: 10 }}>{msg}</p>}</>
}
function Blocked() {
  const [bl, setBl] = useStore('blocked', []), [n, setN] = useState('')
  return <><div className="row" style={{ marginTop: 10 }}><input placeholder="Pseudo à bloquer" value={n} onChange={e => setN(e.target.value)} /><button className="btn sm" onClick={() => { const x = n.trim(); if (x && !bl.includes(x)) setBl([...bl, x]); setN('') }}>Bloquer</button></div>
    {!bl.length && <p className="mut" style={{ marginTop: 12 }}>Aucun utilisateur bloqué.</p>}
    {bl.map(x => <Line key={x} l={x}><button className="btn out sm" onClick={() => setBl(bl.filter(y => y !== x))}>Débloquer</button></Line>)}</>
}
function Delete({ onClose }) {
  const [, setUser] = useUser(), [w, setW] = useState(''), [msg, setMsg] = useState('')
  const go = async () => {
    try { if (supabase) { const { error } = await supabase.rpc('delete_my_account'); if (error) throw error; await supabase.auth.signOut() }
      Object.keys(localStorage).filter(k => k.startsWith('vtk_')).forEach(k => localStorage.removeItem(k)); setUser(null); location.href = '/' } catch (e) { setMsg(e.message) }
  }
  return <><p style={{ margin: '10px 0' }}>Cette action est définitive : ton profil, ta progression, tes listes et ta carte Otaku seront supprimés.</p>
    <label>Tape SUPPRIMER pour confirmer</label><input value={w} onChange={e => setW(e.target.value)} />
    <br /><button className="btn" style={{ background: 'var(--red)' }} disabled={w !== 'SUPPRIMER'} onClick={go}>Supprimer définitivement</button>{msg && <p role="alert" style={{ marginTop: 10 }}>{msg}</p>}</>
}
export const TITLES = { compte: 'Mon compte', privacy: 'Confidentialité', notifs: 'Préférences de notifications', content: 'Préférences de contenu', security: 'Sécurité', blocked: 'Utilisateurs bloqués', delete: 'Supprimer mon compte' }
const BODY = { compte: Compte, privacy: Privacy, notifs: Notifs, content: Content, security: Security, blocked: Blocked, delete: Delete }
export default function Menu({ id, onClose }) {
  const B = BODY[id]
  return <div style={{ position: 'fixed', inset: 0, zIndex: 30, background: '#000a', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={TITLES[id]} onClick={e => e.stopPropagation()} style={{ background: 'var(--surf)', width: '100%', maxWidth: 520, margin: '0 auto', maxHeight: '85vh', overflow: 'auto', borderRadius: '24px 24px 0 0', padding: 18 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><h2>{TITLES[id]}</h2><button className="chip" aria-label="Fermer" onClick={onClose}>✕</button></div><B onClose={onClose} /></div></div>
}
