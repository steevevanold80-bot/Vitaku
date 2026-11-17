import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { EVAL, GRADES } from '../data'
// Évaluation unique : après le résultat, elle n'est plus proposée.
export default function Evaluation() {
  const nav = useNavigate(); const [done, setDone] = useStore('eval', null)
  const [i, setI] = useState(0); const [score, setScore] = useState(0)
  if (done) return <div className="glow center"><h2>Ton niveau : {done.grade}</h2><p className="mut">Évaluation déjà passée, elle ne se refait pas.</p><button className="btn" onClick={() => nav('/home')}>Entrer dans VITAKU</button></div>
  const pick = n => {
    const s = score + n
    if (i + 1 < EVAL.length) { setScore(s); setI(i + 1); return }
    const max = EVAL.length * 3; setDone({ grade: GRADES[Math.min(3, Math.floor((s / max) * 4))], score: s })
  }
  return <div className="glow page"><h1>Quel otaku es-tu ?</h1><div className="bar" style={{ margin: '12px 0' }}><div style={{ width: (i / EVAL.length) * 100 + '%' }} /></div>
    <div className="card"><h3>{EVAL[i].q}</h3><br />{EVAL[i].a.map((a, n) => <button key={a} className="btn out" style={{ marginBottom: 10 }} onClick={() => pick(n)}>{a}</button>)}</div></div>
}
