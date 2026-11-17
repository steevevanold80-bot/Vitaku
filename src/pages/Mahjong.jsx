import { useState, useEffect } from 'react'
// Mahjong solitaire en duel : tous les joueurs reçoivent le même plateau (graine = id du duel). Le plus rapide gagne.
const FACES = ['一', '二', '三', '四', '五', '六', '東', '南', '西', '北', '中', '發'], COL = ['#E11D48', '#16a34a', '#2563eb']
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
const POS = (() => { const p = []; for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) p.push([x * 2, y * 2, 0]); for (let y = 0; y < 2; y++) for (let x = 0; x < 6; x++) p.push([x * 2 + 2, y * 2 + 2, 1]); for (let x = 0; x < 4; x++) p.push([x * 2 + 4, 3, 2]); return p })()
const shuf = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
export default function Mahjong({ onEnd, seed = 'x' }) {
  const [T, setT] = useState(() => { const f = shuf(FACES.flatMap(x => [x, x, x, x]), rng([...seed].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7))); return POS.map(([x, y, z], i) => ({ x, y, z, f: f[i], gone: false })) })
  const [sel, setSel] = useState(null), [hint, setHint] = useState(null), [sec, setSec] = useState(0), [sh, setSh] = useState(3)
  const left = T.filter(t => !t.gone), near = (o, t) => Math.abs(o.y - t.y) < 2
  const free = t => !t.gone && !left.some(o => o.z > t.z && Math.abs(o.x - t.x) < 2 && near(o, t)) && !(left.some(o => o.z === t.z && o.x === t.x - 2 && near(o, t)) && left.some(o => o.z === t.z && o.x === t.x + 2 && near(o, t)))
  const fr = left.filter(free), pair = fr.flatMap((a, i) => fr.slice(i + 1).filter(b => b.f === a.f).map(b => [a, b]))[0], done = !left.length, stuck = !done && !pair
  useEffect(() => { if (done || stuck) return; const i = setInterval(() => setSec(s => s + 1), 1000); return () => clearInterval(i) }, [done, stuck])
  useEffect(() => { if (done) { const i = setTimeout(() => onEnd(`plateau terminé en ${sec}s`), 2200); return () => clearTimeout(i) } }, [done])
  const click = t => { if (!free(t)) return; setHint(null); if (!sel) return setSel(t); if (sel === t) return setSel(null)
    if (sel.f === t.f) { setT(T.map(o => o === sel || o === t ? { ...o, gone: true } : o)); setSel(null) } else setSel(t) }
  const mix = () => { const f = shuf(left.map(t => t.f), Math.random); let i = 0; setT(T.map(t => t.gone ? t : { ...t, f: f[i++] })); setSel(null); setSh(sh - 1) }
  return <div className="page glow"><div className="row" style={{ justifyContent: 'space-between' }}><h2 className="t">麻雀 Mahjong</h2><b className="t">⏱ {sec}s · {left.length} tuiles</b></div>
    <p className="mut">Associe 2 tuiles identiques libres. Même plateau pour tous les joueurs du duel.</p>
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9.6', margin: '12px 0', background: 'radial-gradient(circle,var(--vio-dd),var(--bg))', borderRadius: 16 }}>
      {[...left].sort((a, b) => a.z - b.z || a.y - b.y).map((t, i) => { const f = free(t), h = hint && hint.includes(t), s = sel === t
        return <button key={i} onClick={() => click(t)} aria-label={'Tuile ' + t.f} style={{ position: 'absolute', left: t.x / 16 * 100 + '%', top: t.y / 9.6 * 100 + '%', width: '12.5%', height: '20.8%', transform: `translate(${-t.z * 4}px,${-t.z * 5}px)`, border: 0, borderRadius: 6, borderBottom: '4px solid #b8a77a', boxShadow: '2px 3px 0 #0006', fontWeight: 800, fontSize: 'clamp(14px,5.4vw,28px)', color: COL[FACES.indexOf(t.f) % 3], background: s ? 'var(--pink)' : h ? '#facc15' : '#f5efe0', opacity: f ? 1 : .55, cursor: f ? 'pointer' : 'default' }}>{t.f}</button> })}</div>
    {done && <div className="card t" style={{ textAlign: 'center' }}>🎉 Plateau terminé en {sec}s !</div>}
    {stuck && <div className="card t" style={{ textAlign: 'center' }}>Plus de coups possibles.{sh > 0 ? ' Mélange les tuiles !' : ''}</div>}
    <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}><button className="btn out sm" disabled={!pair} onClick={() => setHint(pair)}>💡 Indice</button><button className="btn out sm" disabled={sh < 1 || done} onClick={mix}>🔀 Mélanger ({sh})</button><button className="btn out sm" onClick={() => onEnd(`${left.length} tuiles restantes · ${sec}s`)}>Quitter</button></div></div>
}
