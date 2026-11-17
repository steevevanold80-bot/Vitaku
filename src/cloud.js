import { useEffect, useState } from 'react'
import { supabase } from './supabase'
// Vrai compte Supabase (le mode démo n'a pas d'identifiant) ?
export const isCloud = u => !!(supabase && u?.id)
export const rows = p => p.then(r => r.data || [])
// Charge des données et les recharge toutes seules (temps réel) quand l'une des tables change.
export function useLive(fn, tables = [], deps = [], on = true) {
  const [d, setD] = useState(null), [n, setN] = useState(0)
  useEffect(() => { if (!supabase || !on) return; let ok = true; Promise.resolve(fn()).then(r => ok && setD(r)).catch(() => {}); return () => { ok = false } }, [...deps, n, on])
  useEffect(() => {
    if (!supabase || !on || !tables.length) return
    const ch = supabase.channel('rt' + Math.random().toString(36).slice(2)); tables.forEach(t => ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, () => setN(x => x + 1))); ch.subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [on])
  return [d, () => setN(x => x + 1)]
}
