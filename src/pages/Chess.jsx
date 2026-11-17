import { useState, useEffect } from 'react'
const G = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }, NM = { k: 'Roi', q: 'Dame', r: 'Tour', b: 'Fou', n: 'Cavalier', p: 'Pion' }, VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const start = () => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'.split('/').map(r => [...r].flatMap(c => /\d/.test(c) ? Array(+c).fill('') : [c]))
const white = p => p === p.toUpperCase(), inb = (y, x) => y >= 0 && y < 8 && x >= 0 && x < 8
const D = { r: [[1, 0], [-1, 0], [0, 1], [0, -1]], b: [[1, 1], [1, -1], [-1, 1], [-1, -1]] }
function moves(b, r, c) {
  const p = b[r][c], w = white(p), t = p.toLowerCase(), out = []
  const add = (y, x) => { if (!inb(y, x)) return false; const q = b[y][x]; if (q && white(q) === w) return false; out.push([y, x]); return !q }
  if (t === 'p') { const d = w ? -1 : 1
    if (inb(r + d, c) && !b[r + d][c]) { out.push([r + d, c]); if ((w ? r === 6 : r === 1) && !b[r + 2 * d][c]) out.push([r + 2 * d, c]) }
    for (const x of [c - 1, c + 1]) if (inb(r + d, x) && b[r + d][x] && white(b[r + d][x]) !== w) out.push([r + d, x])
  } else if (t === 'n') [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([a, e]) => add(r + a, c + e))
  else if (t === 'k') [...D.r, ...D.b].forEach(([a, e]) => add(r + a, c + e))
  else (t === 'r' ? D.r : t === 'b' ? D.b : [...D.r, ...D.b]).forEach(([a, e]) => { let y = r + a, x = c + e; while (add(y, x)) { y += a; x += e } })
  return out
}
const apply = (b, [r0, c0], [r, c]) => { const n = b.map(x => [...x]); let p = n[r0][c0]; if (p === 'P' && r === 0) p = 'Q'; if (p === 'p' && r === 7) p = 'q'; n[r][c] = p; n[r0][c0] = ''; return n }
function inCheck(b, w) { let k; b.forEach((row, r) => row.forEach((p, c) => { if (p === (w ? 'K' : 'k')) k = [r, c] }))
  return !!k && b.some((row, r) => row.some((p, c) => p && white(p) !== w && moves(b, r, c).some(([y, x]) => y === k[0] && x === k[1]))) }
const legal = (b, r, c) => moves(b, r, c).filter(m => !inCheck(apply(b, [r, c], m), white(b[r][c])))
const all = (b, w) => b.flatMap((row, r) => row.flatMap((p, c) => p && white(p) === w ? legal(b, r, c).map(m => [[r, c], m]) : []))
const sq = (r, c) => 'abcdefgh'[c] + (8 - r), mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const fresh = () => ({ b: start(), turn: true, log: [], caps: [] })
// Échecs complets sauf roque et prise en passant : échec, échec et mat, pat, chrono, annuler, indice.
export default function Chess({ onEnd }) {
  const [g, setG] = useState(fresh), [stack, setStack] = useState([]), [sel, setSel] = useState(null), [hint, setHint] = useState(null), [t, setT] = useState([900, 900]), [out, setOut] = useState(null)
  const chk = inCheck(g.b, g.turn), can = all(g.b, g.turn).length > 0
  const result = out || (!can ? (chk ? `Échec et mat · ${g.turn ? 'les Noirs' : 'les Blancs'} gagnent` : 'Pat · égalité') : null)
  useEffect(() => { if (result) return; const i = setInterval(() => setT(x => { const n = [...x], k = g.turn ? 0 : 1; n[k]--; if (n[k] <= 0) setOut(`Temps écoulé · ${g.turn ? 'les Noirs' : 'les Blancs'} gagnent`); return n }), 1000); return () => clearInterval(i) }, [g.turn, result])
  useEffect(() => { if (result) { const i = setTimeout(() => onEnd(result), 2500); return () => clearTimeout(i) } }, [result])
  const mv = sel ? legal(g.b, sel[0], sel[1]) : []
  const click = (r, c) => {
    if (result) return
    if (sel && mv.some(([y, x]) => y === r && x === c)) {
      const cap = g.b[r][c]; setStack([...stack, g]); setHint(null)
      setG({ b: apply(g.b, sel, [r, c]), turn: !g.turn, log: [...g.log, sq(...sel) + (cap ? 'x' : '-') + sq(r, c)], caps: cap ? [...g.caps, { p: cap, by: g.turn }] : g.caps }); setSel(null)
    } else if (g.b[r][c] && white(g.b[r][c]) === g.turn) setSel([r, c]); else setSel(null)
  }
  const mat = g.b.flat().reduce((a, p) => a + (p ? (white(p) ? 1 : -1) * VAL[p.toLowerCase()] : 0), 0), P = sel && g.b[sel[0]][sel[1]]
  const player = (nm, w) => <div className="card" style={{ flex: 1, textAlign: 'center', boxShadow: g.turn === w ? '0 0 0 2px var(--pink)' : 'none', padding: 10 }}>
    <div style={{ fontSize: 24 }}>{w ? '♔' : '♚'}</div><b className="t">{nm}</b><div className="t" style={{ fontSize: 20, color: t[w ? 0 : 1] < 60 ? 'var(--red)' : '#fff' }}>⏱ {mmss(t[w ? 0 : 1])}</div></div>
  return <div className="page glow">
    <div className="row" style={{ justifyContent: 'space-between' }}><h2 className="t">ÉCHECS <span style={{ color: 'var(--pink)' }}>VITAKU</span></h2><span className="mut">Stratégie classique</span></div>
    <div className="row" style={{ margin: '10px 0' }}>{player('Blancs', true)}<div style={{ textAlign: 'center' }}><div className="mut">TOUR</div><b className="t" style={{ color: 'var(--pink)' }}>{g.turn ? 'BLANCS' : 'NOIRS'}</b></div>{player('Noirs', false)}</div>
    {(chk || result) && <div className="card t" style={{ textAlign: 'center', marginBottom: 8, background: '#E11D4833', color: '#fff' }}>{result || 'Échec ! Protège ton roi.'}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '16px repeat(8,1fr)', borderRadius: 12, overflow: 'hidden', background: 'var(--surf)' }}>
      {g.b.flatMap((row, r) => [<div key={'n' + r} className="mut" style={{ display: 'grid', placeItems: 'center', fontSize: 11 }}>{8 - r}</div>, ...row.map((p, c) => {
        const hit = mv.some(([y, x]) => y === r && x === c), s = sel && sel[0] === r && sel[1] === c, h = hint && ((hint[0][0] === r && hint[0][1] === c) || (hint[1][0] === r && hint[1][1] === c))
        return <button key={r + '-' + c} onClick={() => click(r, c)} aria-label={p ? NM[p.toLowerCase()] + ' ' + sq(r, c) : sq(r, c)} style={{ border: 0, aspectRatio: '1', position: 'relative', fontSize: 'clamp(20px,7vw,36px)', background: s ? 'var(--pink)' : h ? '#facc15' : (r + c) % 2 ? '#6d28d9' : '#e9d5ff', color: p && white(p) ? '#fff' : '#111', textShadow: p && white(p) ? '0 0 3px #000' : 'none' }}>
          {p && G[p.toLowerCase()]}{hit && <span style={{ position: 'absolute', inset: '38%', borderRadius: '50%', background: 'color-mix(in srgb,var(--pink) 67%,transparent)' }} />}</button>
      })])}
      <div />{[...'ABCDEFGH'].map(l => <div key={l} className="mut" style={{ textAlign: 'center', fontSize: 11 }}>{l}</div>)}</div>
    <div className="row" style={{ marginTop: 10, alignItems: 'stretch' }}>
      <div className="card" style={{ flex: 1 }}><div className="mut">PIÈCE SÉLECTIONNÉE</div>{P ? <><div style={{ fontSize: 34 }}>{G[P.toLowerCase()]}</div><b>{NM[P.toLowerCase()]}</b><div className="mut">Coups valides : {mv.length}</div></> : <div className="mut">Touche une pièce</div>}</div>
      <div className="card" style={{ flex: 1 }}><div className="mut">HISTORIQUE</div><div style={{ fontSize: 13 }}>{g.log.length ? Array.from({ length: Math.ceil(g.log.length / 2) }, (_, i) => <div key={i}>{i + 1}. {g.log[2 * i]} {g.log[2 * i + 1] || ''}</div>).slice(-5) : '—'}</div></div></div>
    <div className="card" style={{ marginTop: 10 }}><div className="mut">PIÈCES CAPTURÉES · ANALYSE</div>
      <div>Blancs : {g.caps.filter(c => c.by).map(c => G[c.p.toLowerCase()]).join(' ') || '—'}</div><div>Noirs : {g.caps.filter(c => !c.by).map(c => G[c.p.toLowerCase()]).join(' ') || '—'}</div>
      <b className="t" style={{ color: mat === 0 ? '#fff' : mat > 0 ? '#e9d5ff' : 'var(--pink)' }}>{mat === 0 ? 'Position équilibrée' : `Avantage ${mat > 0 ? 'Blancs' : 'Noirs'} +${Math.abs(mat)}`}</b></div>
    <div className="row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
      <button className="btn sm" onClick={() => { setG(fresh()); setStack([]); setSel(null); setT([900, 900]); setOut(null) }}>＋ Nouvelle</button>
      <button className="btn out sm" disabled={!stack.length || !!result} onClick={() => { setG(stack[stack.length - 1]); setStack(stack.slice(0, -1)); setSel(null) }}>↶ Annuler</button>
      <button className="btn out sm" onClick={() => { const m = all(g.b, g.turn); if (m.length) { const best = m.find(([, [y, x]]) => g.b[y][x]) || m[Math.floor(Math.random() * m.length)]; setHint(best) } }}>💡 Indice</button>
      <button className="btn out sm" onClick={() => onEnd('Abandon')}>Quitter</button></div></div>
}
