// Petits composants partagés : fenêtre flottante (ou plein écran), avatar, alerte d'erreur Supabase.
export const Sheet = ({ title, onClose, back, full, foot, children }) => <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: '#000a', display: 'flex', alignItems: 'flex-end' }} onClick={full ? undefined : onClose}>
  <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={{ background: 'var(--surf)', width: '100%', maxWidth: 520, margin: '0 auto', height: full ? '100%' : '84vh', display: 'flex', flexDirection: 'column', borderRadius: full ? 0 : '24px 24px 0 0', padding: 16 }}>
    <div className="row" style={{ alignItems: 'center' }}>{back && <button className="chip" aria-label="Retour" onClick={back}>‹</button>}<h2 style={{ flex: 1 }}>{title}</h2><button className="chip" aria-label="Fermer" onClick={onClose}>✕</button></div>
    <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>{children}</div>{foot}</div></div>
export const Av = ({ n = '?' }) => <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--grad)', display: 'grid', placeItems: 'center', fontWeight: 800, flex: '0 0 auto' }}>{String(n)[0].toUpperCase()}</div>
export const ok = r => { if (r?.error) alert(r.error.message); return !r?.error }
