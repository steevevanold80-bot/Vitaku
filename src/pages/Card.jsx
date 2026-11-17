import { useState } from 'react'
import { useStore } from '../store'
import { supabase as sb } from '../supabase'
import { isCloud, useLive, rows } from '../cloud'
import { useNavigate } from 'react-router-dom'
const ACC = { Rouge: '#E11D48', Rose: '#F43F8E', Violet: '#8B5CF6', Cyan: '#22d3ee', Or: '#f59e0b' }
const SL = ['Intelligence', 'Créativité', 'Persévérance', 'Force', 'Loyauté', 'Charisme']
export const DEMO = [
  { c: { color: 'Rose', shape: 'Coupée', pic: 'avatar', nation: 'Camerounaise', cls: 'Otaku légendaire', spec: 'Magie, quiz', passions: 'Anime, musique', goal: 'Devenir une légende de la communauté', fav: 'Mon héroïne préférée', visibility: 'Publique' }, name: 'Sakura_FR', grade: 'Expert', xp: 12400 },
  { c: { color: 'Cyan', shape: 'Arrondie', pic: 'avatar', nation: 'Ivoirienne', cls: 'Stratège', spec: 'Échecs, tactique', passions: 'Manga, jeux vidéo', goal: 'Gagner le tournoi', fav: 'Mon rival préféré', visibility: 'Sur demande' }, name: 'KageDuCmr', grade: 'Maître', xp: 21800 },
]
const bar = id => [...(id + id + id)].map((ch, i) => <rect key={i} x={i * 5} y="0" width={1 + ch.charCodeAt(0) % 3} height="30" fill="currentColor" />)
export function CardView({ s }) {
  const c = { color: 'Rouge', shape: 'Coupée', pic: 'avatar', stats: [90, 85, 95, 80, 90, 85], mode: 'MODE LÉGENDE', ...s.c }, col = ACC[c.color] || c.color, lv = Math.min(100, Math.floor((s.xp || 0) / 500) + 1)
  const id = 'OTAKU-' + [...s.name].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 1000000, 7).toString().padStart(6, '0')
  const shape = { Arrondie: { borderRadius: 26 }, Coupée: { clipPath: 'polygon(0 0,92% 0,100% 5%,100% 100%,8% 100%,0 95%)' }, Carrée: { borderRadius: 4 } }[c.shape]
  const F = ({ l, v }) => v ? <div style={{ borderLeft: `3px solid ${col}`, padding: '4px 8px', background: '#ffffff0a', marginBottom: 6 }}><div style={{ color: col, fontSize: 11, fontWeight: 800 }}>{l}</div><div style={{ fontSize: 13 }}>{v}</div></div> : null
  return <div style={{ ...shape, background: `radial-gradient(circle at 70% 20%,${col}55,transparent 55%),#0a0508`, color: '#fff', padding: 14, border: `2px solid ${col}`, boxShadow: `0 0 24px ${col}66` }}>
    <div className="row" style={{ justifyContent: 'space-between' }}><div><div className="t" style={{ fontSize: 26, letterSpacing: 1 }}>OTAKU CARD</div><div style={{ color: col, fontSize: 11 }}>オタクカード</div></div><div className="t" style={{ fontSize: 12, border: `1px solid ${col}`, padding: '4px 8px' }}>ID : {id}</div></div>
    <h2 className="t" style={{ fontSize: 34, margin: '6px 0 0' }}>{(c.first || s.name).toUpperCase()}</h2>
    <div className="t" style={{ background: col, display: 'inline-block', padding: '2px 14px', transform: 'skewX(-12deg)', fontSize: 14 }}>{c.cls || s.grade}</div>
    <div style={{ height: 270, margin: '10px 0', borderRadius: 14, overflow: 'hidden', display: 'grid', placeItems: 'center', background: `linear-gradient(180deg,#0000,${col}44)`, border: `1px solid ${col}88` }}>
      {(c.photo || s.photo) ? <img alt="" src={c.photo || s.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="t" style={{ fontSize: 90, color: col }}>{(s.name || 'O')[0].toUpperCase()}</div>}</div>
    <F l="PRÉNOM" v={c.first || s.name} /><F l="NATIONALITÉ" v={c.nation} /><F l="CLASSE" v={c.cls} /><F l="SPÉCIALITÉ" v={c.spec} /><F l="PASSIONS" v={c.passions} /><F l="OBJECTIF" v={c.goal} />
    <div className="row" style={{ margin: '10px 0 4px' }}><div><span style={{ fontSize: 12 }}>NIVEAU</span><div className="t" style={{ fontSize: 44, color: col, lineHeight: 1 }}>{lv}</div></div>
      <div style={{ flex: 1 }}>{SL.map((l, i) => <div key={l} className="row" style={{ gap: 6, fontSize: 11 }}><span style={{ width: 82 }}>{l}</span><div style={{ flex: 1, height: 6, background: '#ffffff22', borderRadius: 4 }}><div style={{ width: c.stats[i] + '%', height: '100%', background: col, borderRadius: 4 }} /></div><span>{c.stats[i]}</span></div>)}</div></div>
    <div className="row" style={{ marginTop: 10, alignItems: 'stretch' }}>
      <div style={{ flex: 1 }}><div className="t" style={{ color: col }}>{c.mode}</div><div style={{ color: '#fbbf24' }}>★★★★★</div><div style={{ fontSize: 12 }}>{s.grade} · {s.xp || 0} XP</div></div>
      <div style={{ flex: 1.2, border: `1px solid ${col}`, padding: 6, color: col }}><svg viewBox={`0 0 ${id.length * 15} 30`} width="100%" height="30" preserveAspectRatio="none">{bar(id)}</svg>{c.fav && <div style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>JOUEUR PRÉFÉRÉ : {c.fav}</div>}</div></div></div>
}
// Carte publique = visible par tous. « Sur demande » = le propriétaire doit accepter. « Privée » = jamais listée.
export function CardGate({ s }) {
  const [acc, setAcc] = useStore('access', {}), vis = s.c.visibility || 'Publique', st = acc[s.name]
  const ask = () => { setAcc({ ...acc, [s.name]: 'attente' }); setTimeout(() => setAcc(a => ({ ...a, [s.name]: 'ok' })), 2000) } // simulation sans serveur
  if (vis === 'Publique' || st === 'ok') return <div style={{ marginTop: 12 }}><CardView s={s} /></div>
  return <div className="card row" style={{ marginTop: 12 }}><div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2a1d4d', display: 'grid', placeItems: 'center', fontSize: 24 }}>🔒</div>
    <div style={{ flex: 1 }}><b className="t">{s.name}</b><div className="mut">Accès sur demande</div></div><button className="btn sm" disabled={st === 'attente'} onClick={ask}>{st === 'attente' ? 'En attente…' : 'Demander'}</button></div>
}
export default function Card() {
  const nav = useNavigate(), [user] = useStore('user', {}), [ev] = useStore('eval', null), [photo] = useStore('photo', null), [cards, setCards] = useStore('cards', [])
  const [c, setC] = useStore('card2', { color: 'Rouge', shape: 'Coupée', pic: 'avatar', visibility: 'Publique', stats: [90, 85, 95, 80, 90, 85], mode: 'MODE LÉGENDE', first: '', nation: '', cls: 'Otaku légendaire', spec: '', passions: '', goal: '', fav: '' })
  const set = k => v => setC({ ...c, [k]: v }), snap = { c, name: user.name || 'Otaku', grade: ev ? ev.grade : 'Novice', xp: user.xp || 0, photo }
  const VIS = { 'Publique': 'publique', 'Sur demande': 'sur_demande', 'Privée': 'privee' }, cloud = isCloud(user), [msg, setMsg] = useState('')
  const [dir] = useLive(() => sb.rpc('card_directory').then(r => r.data || []), ['card_access'], [user.id], cloud), [crow] = useLive(() => rows(sb.from('cards').select('user_id,config')), ['card_access'], [user.id], cloud)
  const [acc, rAcc] = useLive(() => rows(sb.from('card_access').select('owner_id,status').eq('viewer_id', user.id)), ['card_access'], [user.id], cloud)
  const save = async () => { setCards([snap, ...cards.filter(x => x.name !== snap.name)]); if (!cloud) return setMsg('✓ Enregistrée sur cet appareil'); const { error } = await sb.from('cards').upsert({ user_id: user.id, config: snap, visibility: VIS[c.visibility] || 'publique', published: c.visibility !== 'Privée', updated_at: new Date().toISOString() }); setMsg(error ? error.message : '✓ Carte enregistrée') }
  const Pick = ({ k, list }) => <div>{list.map(o => <button key={o} className={'tab ' + (c[k] === o ? 'on' : '')} style={{ marginBottom: 8 }} onClick={() => set(k)(o)}>{o}</button>)}</div>
  const T = ({ k, l }) => <><label>{l}</label><input value={c[k] || ''} onChange={e => set(k)(e.target.value)} /></>
  const onFile = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const k = Math.min(1, 480 / Math.max(img.width, img.height)), cv = document.createElement('canvas'); cv.width = img.width * k; cv.height = img.height * k; cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); setC({ ...c, pic: 'photo', photo: cv.toDataURL('image/jpeg', .8) }) }; img.src = URL.createObjectURL(f) }
  return <div className="page glow"><button className="chip" onClick={() => nav(-1)}>‹ Retour</button><h1 style={{ margin: '10px 0' }}>Ma carte Otaku</h1>
    <CardView s={snap} />
    <div className="card" style={{ marginTop: 14 }}>
      <label>Couleur</label><Pick k="color" list={Object.keys(ACC)} /><label>Forme</label><Pick k="shape" list={['Coupée', 'Arrondie', 'Carrée']} />
      <label>Photo de la carte (sinon ta photo de profil)</label><input type="file" accept="image/*" onChange={onFile} />
      <T k="first" l="Prénom" /><T k="nation" l="Nationalité" /><T k="cls" l="Classe" /><T k="spec" l="Spécialité" /><T k="passions" l="Passions" /><T k="goal" l="Objectif" /><T k="fav" l="Personnage ou joueur préféré" /><T k="mode" l="Titre du mode" />
      <label>Statistiques</label>{SL.map((l, i) => <div key={l} className="row"><span style={{ width: 110, fontSize: 13 }}>{l}</span><input type="range" min="0" max="100" value={c.stats[i]} onChange={e => set('stats')(c.stats.map((v, j) => j === i ? +e.target.value : v))} /></div>)}
      <label>Qui peut voir ma carte ?</label><Pick k="visibility" list={['Publique', 'Sur demande', 'Privée']} />
      <br /><button className="btn" onClick={save}>Enregistrer ma carte</button>{msg && <p role="status" style={{ marginTop: 10 }}>{msg}</p>}</div>
    <h2 className="h">Cartes de la communauté</h2>
    {cloud ? (dir || []).filter(d => d.user_id !== user.id).map(d => { const row = (crow || []).find(r => r.user_id === d.user_id), st = (acc || []).find(a => a.owner_id === d.user_id)?.status
      return row ? <div key={d.user_id} style={{ marginTop: 12 }}><CardView s={row.config} /></div> : <div key={d.user_id} className="card row" style={{ marginTop: 12 }}><div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2a1d4d', display: 'grid', placeItems: 'center', fontSize: 24 }}>🔒</div>
        <div style={{ flex: 1 }}><b className="t">{d.username}</b><div className="mut">{st === 'refused' ? 'Demande refusée' : 'Accès sur demande'}</div></div><button className="btn sm" disabled={!!st} onClick={() => sb.from('card_access').insert({ owner_id: d.user_id, viewer_id: user.id }).then(rAcc)}>{st === 'pending' ? 'En attente…' : st === 'accepted' ? '✓' : 'Demander'}</button></div> })
      : [...cards.filter(x => x.name !== snap.name), ...DEMO].filter(s => s.c.visibility !== 'Privée').map(s => <CardGate key={s.name} s={s} />)}
  </div>
}
