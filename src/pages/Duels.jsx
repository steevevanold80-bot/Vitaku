import { useState } from 'react'
import Chess from './Chess'
import RPS from './RPS'
import Mahjong from './Mahjong'
import { useT } from '../i18n'
import { DUEL_SUBJECTS, QUIZ } from '../data'
import { useStore } from '../store'
import { supabase as sb } from '../supabase'
import { isCloud, useLive, rows } from '../cloud'
// Compte Supabase : le défi est envoyé à un vrai pseudo, qui l'accepte ou le refuse de son côté. Mode démo : duels locaux.
const ST = { pending: 'en attente', approved: 'approuvé', refused: 'refusé' }, REV = { 'approuvé': 'approved', 'refusé': 'refused' }
export default function Duels() {
  const t = useT(), [user] = useStore('user', null), cloud = isCloud(user), me = user?.id, [local, setLocal] = useStore('duels', [])
  const [data, reload] = useLive(() => rows(sb.from('duels').select('*, c:profiles!duels_challenger_id_fkey(username), o:profiles!duels_opponent_id_fkey(username)').order('created_at', { ascending: false })), ['duels'], [me], cloud)
  const duels = cloud ? (data || []).map(d => ({ id: d.id, mine: d.challenger_id === me, opp: (d.challenger_id === me ? d.o : d.c)?.username || '?', subject: d.subject, date: new Date(d.scheduled_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }), rules: d.rules, stake: d.stake_xp, status: d.status === 'played' ? 'terminé · ' + (d.result || '') : ST[d.status] })) : local
  const [f, setF] = useState({ opp: '', subject: 'quiz', date: '', rules: '', stake: 50 }), [play, setPlay] = useState(null), [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const create = async e => {
    e.preventDefault(); setErr('')
    if (!cloud) { setLocal([{ ...f, id: Date.now(), status: 'en attente' }, ...local]); setF({ ...f, opp: '', rules: '' }); return }
    const { data: p } = await sb.from('profiles').select('id').eq('username', f.opp.trim()).maybeSingle()
    if (!p) return setErr('Pseudo introuvable : ton adversaire doit avoir un compte VITAKU.'); if (p.id === me) return setErr('Tu ne peux pas te défier toi-même.')
    const { error } = await sb.from('duels').insert({ challenger_id: me, opponent_id: p.id, subject: f.subject, scheduled_at: new Date(f.date).toISOString(), rules: f.rules || null, stake_xp: +f.stake, status: 'pending' })
    if (error) return setErr(error.message); setLocal([{ id: Date.now() }, ...local]); setF({ ...f, opp: '', rules: '' }); reload()
  }
  const upd = async (id, status) => {
    if (!cloud) return setLocal(local.map(d => d.id === id ? { ...d, status } : d))
    await sb.from('duels').update(status.startsWith('terminé') ? { status: 'played', result: status.replace('terminé · ', '') } : { status: REV[status] }).eq('id', id); reload()
  }
  if (play) { const G = { quiz: Quiz, rps: RPS, chess: Chess, mahjong: Mahjong }[play.subject]; return <G seed={String(play.id)} onEnd={r => { upd(play.id, 'terminé · ' + r); setPlay(null) }} /> }
  return <div className="page glow"><div className="arena-h">⚔ {t('Duels')}</div>
    <h2 className="h">{t('Défier un otaku')}</h2>
    <form className="card arena" onSubmit={create}>
      <label>{t('Adversaire(s) ou communauté')}</label><input required value={f.opp} onChange={set('opp')} placeholder={cloud ? 'Pseudo exact de ton adversaire' : ''} />
      <label>{t('Sujet du duel')}</label><select value={f.subject} onChange={set('subject')}>{DUEL_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name} — {s.desc}</option>)}</select>
      <label>{t('Date et heure')}</label><input type="datetime-local" required value={f.date} onChange={set('date')} />
      <label>{t('Règles')}</label><textarea rows={2} value={f.rules} onChange={set('rules')} placeholder="Ex : 10 questions, 15 s par question" />
      <label>Mise en XP virtuel (max 200)</label><input type="number" min="10" max="200" value={f.stake} onChange={set('stake')} />
      {err && <p role="alert" style={{ color: 'var(--pink)', marginTop: 10 }}>{err}</p>}
      <br /><button className="btn">{t('Envoyer le défi')}</button></form>
    <h2 className="h">{t('Mes duels')}</h2>
    {!duels.length && <p className="mut">Aucun duel. Lance un défi ci-dessus.</p>}
    {duels.map(d => <div key={d.id} className="card arena" style={{ marginBottom: 10 }}>
      <div className="vs">TOI <i>VS</i> {d.opp}</div><div className="mut">{DUEL_SUBJECTS.find(s => s.id === d.subject)?.name} · {d.date.replace('T', ' ')} · {d.stake} XP</div><div className="mut">{d.rules}</div>
      <div className="row" style={{ marginTop: 8 }}><span className={'st ' + (d.status === 'approuvé' ? 'ok' : d.status === 'refusé' ? 'no' : '')}>{d.status}</span>
        {d.status === 'en attente' && (!cloud || !d.mine) && <><button className="btn sm" onClick={() => upd(d.id, 'approuvé')}>{cloud ? 'Accepter' : 'Adversaire accepte'}</button><button className="btn out sm" onClick={() => upd(d.id, 'refusé')}>Refuser</button></>}
        {d.status === 'en attente' && cloud && d.mine && <span className="mut">En attente de {d.opp}…</span>}
        {d.status === 'approuvé' && <button className="btn sm" onClick={() => setPlay(d)}>{t('Jouer')}</button>}
      </div></div>)}
  </div>
}
function Quiz({ onEnd }) {
  const [i, setI] = useState(0); const [s, setS] = useState(0)
  const pick = n => { const ns = s + (n === QUIZ[i].c ? 1 : 0); if (i + 1 < QUIZ.length) { setS(ns); setI(i + 1) } else onEnd('score ' + ns + '/' + QUIZ.length) }
  return <div className="page glow"><h2>Question {i + 1}/{QUIZ.length}</h2><div className="card"><h3>{QUIZ[i].q}</h3><br />{QUIZ[i].a.map((a, n) => <button key={a} className="btn out" style={{ marginBottom: 10 }} onClick={() => pick(n)}>{a}</button>)}</div></div>
}
