import { useState } from 'react'
const H = { guu: ['✊', 'グー', 'Guu', 'Pierre'], paa: ['✋', 'パー', 'Paa', 'Feuille'], choki: ['✌️', 'チョキ', 'Choki', 'Ciseaux'] }, K = Object.keys(H)
export default function RPS({ onEnd }) {
  const [sc, setSc] = useState([0, 0]), [log, setLog] = useState([]), [last, setLast] = useState(null)
  const n = log.length
  const play = p => {
    const c = K[Math.floor(Math.random() * 3)], d = (K.indexOf(c) - K.indexOf(p) + 3) % 3, r = d === 2 ? 'win' : d === 1 ? 'lose' : 'draw'
    const s = [sc[0] + (r === 'win' ? 1 : 0), sc[1] + (r === 'lose' ? 1 : 0)]; setSc(s); setLog([...log, r]); setLast([p, c, r])
    if (n + 1 === 3) setTimeout(() => onEnd(`${s[0]}-${s[1]} (${s[0] > s[1] ? 'victoire' : s[0] < s[1] ? 'défaite' : 'égalité'})`), 1400)
  }
  return <div className="page glow" style={{ textAlign: 'center' }}>
    <h1 style={{ fontSize: 30 }}>じゃんけん</h1><div className="mut t" style={{ letterSpacing: 4 }}>JANKEN</div>
    <div className="card row" style={{ margin: '16px 0', justifyContent: 'space-around' }}><div><div className="mut">Toi</div><b className="t" style={{ fontSize: 40, color: 'var(--vio)' }}>{sc[0]}</b></div>
      <div className="row" style={{ gap: 8 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: log[i] === 'win' ? '#22c55e' : log[i] === 'lose' ? 'var(--red)' : log[i] ? '#facc15' : 'var(--chip)' }} />)}</div>
      <div><div className="mut">Rival</div><b className="t" style={{ fontSize: 40, color: 'var(--pink)' }}>{sc[1]}</b></div></div>
    <div style={{ height: 130, display: 'grid', placeItems: 'center', borderRadius: 24, background: 'radial-gradient(circle,var(--vio-dd),var(--bg))', boxShadow: '0 0 30px color-mix(in srgb,var(--vio) 27%,transparent) inset' }}>
      {last ? <div><div style={{ fontSize: 56 }}>{H[last[0]][0]} <span className="t" style={{ fontSize: 18 }}>VS</span> {H[last[1]][0]}</div><b className="t" style={{ color: last[2] === 'win' ? '#22c55e' : last[2] === 'lose' ? 'var(--red)' : '#facc15' }}>{last[2] === 'win' ? 'Manche gagnée !' : last[2] === 'lose' ? 'Manche perdue' : 'Égalité'}</b></div> : <b className="t">Manche 1/3 · Choisis ton geste</b>}</div>
    <div className="row" style={{ justifyContent: 'center', gap: 14, marginTop: 22 }}>{K.map(k => <button key={k} className="hand" disabled={n >= 3} onClick={() => play(k)}><span style={{ fontSize: 36 }}>{H[k][0]}</span><span>{H[k][1]}</span><small className="mut">{H[k][2]}</small></button>)}</div></div>
}
