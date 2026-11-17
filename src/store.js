import { useState, useEffect } from 'react'
import { supabase } from './supabase'
// Store partagé + sauvegarde dans localStorage. Pour un vrai compte, les clés de SYNC sont aussi enregistrées dans Supabase (table user_data).
const mem = {}, subs = {}, timers = {}
let me = null
const SYNC = new Set(['downloads', 'mylist2', 'library', 'watched', 'history', 'photo', 'spec', 'privacy', 'notifprefs', 'notif', 'bgdl', 'cell', 'sdh', 'subs', 'lang', 'uilang', 'theme', 'daily', 'card2', 'blocked'])
const push = (key, val) => { if (!supabase || !me || !SYNC.has(key)) return; clearTimeout(timers[key]); timers[key] = setTimeout(() => supabase.from('user_data').upsert({ user_id: me, key, value: val ?? null, updated_at: new Date().toISOString() }).then(() => {}, () => {}), 900) }
export const setCloudUser = id => { me = id }
export async function pullCloud(id) {
  me = id; const { data, error } = await supabase.from('user_data').select('key,value'); if (error || !data) return
  const have = new Set()
  data.forEach(r => { if (!SYNC.has(r.key)) return; have.add(r.key); const k = 'vtk_' + r.key; mem[k] = r.value; try { localStorage.setItem(k, JSON.stringify(r.value)) } catch {} subs[k]?.forEach(f => f()) })
  SYNC.forEach(key => { if (have.has(key)) return; const k = 'vtk_' + key; if (mem[k] != null) push(key, mem[k]); else { try { const s = localStorage.getItem(k); if (s) push(key, JSON.parse(s)) } catch {} } })
}
export const wipeLocal = () => Object.keys(localStorage).filter(k => k.startsWith('vtk_') && k !== 'vtk_open').forEach(k => localStorage.removeItem(k))
export function useStore(key, initial) {
  const k = 'vtk_' + key
  if (!(k in mem)) { try { const s = localStorage.getItem(k); mem[k] = s ? JSON.parse(s) : initial } catch { mem[k] = initial } }
  const [, force] = useState(0)
  useEffect(() => { const s = (subs[k] ??= new Set()), f = () => force(x => x + 1); s.add(f); return () => s.delete(f) }, [k])
  const set = nv => { const val = typeof nv === 'function' ? nv(mem[k]) : nv; mem[k] = val; try { localStorage.setItem(k, JSON.stringify(val)) } catch {} push(key, val); subs[k]?.forEach(f => f()) }
  return [mem[k], set]
}
