import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import Logo from '../Logo'
import { supabase } from '../supabase'
// mode = 'signup' (Commencer la partie) ou 'login' (Se connecter). Avec Supabase configuré : vrais comptes.
export default function Auth({ mode }) {
  const nav = useNavigate(), [, setUser] = useStore('user', null), [ev, setEv] = useStore('eval', null)
  const [f, setF] = useState({ name: '', email: '', pass: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false), set = k => e => setF({ ...f, [k]: e.target.value }), signup = mode === 'signup'
  const go = async e => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      if (!supabase) { setUser({ name: f.name || f.email.split('@')[0] || 'Otaku', email: f.email, xp: 0 }); nav(signup && !ev ? '/evaluation' : '/home'); return }
      const r = signup ? await supabase.auth.signUp({ email: f.email, password: f.pass, options: { data: { username: f.name } } }) : await supabase.auth.signInWithPassword({ email: f.email, password: f.pass })
      if (r.error) throw r.error
      if (!r.data.session) { setErr('Compte créé. Vérifie ton e-mail pour confirmer, puis connecte-toi.'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', r.data.user.id).single()
      setUser({ id: r.data.user.id, name: p?.username || f.name, email: f.email, xp: p?.xp || 0, role: p?.role || 'user' })
      if (p?.eval_done) setEv({ grade: p.grade, score: p.eval_score || 0 })
      nav(!p?.eval_done && !ev ? '/evaluation' : '/home')
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return <div className="glow center" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
    <button className="chip" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/welcome')}>‹ Retour</button>
    <Logo size={90} /><div className="logo">VITAKU</div>
    <h2>{signup ? 'Crée ton compte' : 'Content de te revoir'}</h2>
    <form onSubmit={go} style={{ width: '100%', textAlign: 'left' }}>
      {signup && <><label>Pseudo</label><input required minLength={3} maxLength={24} value={f.name} onChange={set('name')} /></>}
      <label>E-mail</label><input type="email" required value={f.email} onChange={set('email')} />
      <label>Mot de passe</label><input type="password" required minLength={6} value={f.pass} onChange={set('pass')} />
      {err && <p role="alert" style={{ color: 'var(--pink)', marginTop: 10 }}>{err}</p>}
      <br /><button className="btn" disabled={busy}>{busy ? '…' : signup ? 'Commencer la partie' : 'Se connecter'}</button>
    </form>
    <button className="chip" onClick={() => nav(signup ? '/login' : '/signup')}>{signup ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Commencer la partie'}</button>
  </div>
}
