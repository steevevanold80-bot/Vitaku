import { useEffect } from 'react'
import { useT, applyLang } from './i18n'
import { supabase } from './supabase'
import Legal from './pages/Legal'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useStore, setCloudUser, pullCloud } from './store'
import Splash from './pages/Splash'
import Auth from './pages/Auth'
import Welcome from './pages/Welcome'
import Evaluation from './pages/Evaluation'
import Home from './pages/Home'
import Search from './pages/Search'
import AnimePage from './pages/AnimePage'
import Downloads from './pages/Downloads'
import Duels from './pages/Duels'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Card from './pages/Card'
import Manga from './pages/Manga'

const P = { home: <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />, users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.6 0 4.5 1.8 4.5 4.5" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />, dl: <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />, user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></> }
const Ic = ({ n }) => <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[n]}</svg>
const TABS = [['/home', 'home', 'Accueil'], ['/community', 'users', 'Communauté'], ['/duels', 'bolt', 'Duel'], ['/downloads', 'dl', 'Téléchargement'], ['/profile', 'user', 'Profil']]

const nt = x => ['clair', 'sombre', 'neon'].includes(x) ? x : 'neon'
export default function App() {
  const [user, setUser] = useStore('user', null), [ev] = useStore('eval', null), t = useT(), [theme] = useStore('theme', 'neon'), [ul] = useStore('uilang', 'fr')
  useEffect(() => { document.documentElement.dataset.theme = nt(theme); document.documentElement.lang = ul }, [theme, ul])
  const loc = useLocation()
  useEffect(() => { applyLang(ul) }, [ul])
  // Supabase : session expirée = déconnexion ; XP, évaluation, thème et langue enregistrés dans le profil
  useEffect(() => { if (supabase) supabase.auth.getSession().then(async ({ data }) => { if (!data.session) { if (user && !user.demo) setUser(null); return } if (user?.id) { const { data: p } = await supabase.from('profiles').select('username,role,xp').eq('id', user.id).single(); if (p) setUser(u => ({ ...u, name: p.username, role: p.role, xp: Math.max(u.xp || 0, p.xp || 0) })) } }) }, [])
  useEffect(() => { setCloudUser(supabase && user?.id ? user.id : null); if (supabase && user?.id) pullCloud(user.id) }, [user?.id])   // données perso synchronisées avec Supabase
  useEffect(() => { if (!supabase || !user?.id) return; const tm = setTimeout(() => supabase.from('profiles').update({ xp: user.xp || 0, language: ul, theme: nt(theme), ...(ev ? { eval_done: true, eval_score: ev.score || 0, grade: ev.grade } : {}) }).eq('id', user.id).then(() => {}), 800); return () => clearTimeout(tm) }, [user?.xp, ul, theme, ev])
  const open = ['/', '/welcome', '/login', '/signup', '/evaluation'].includes(loc.pathname)
  const guard = el => user ? el : <Navigate to="/welcome" />
  return (<>
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/auth" element={<Navigate to="/welcome" />} />
      <Route path="/evaluation" element={guard(<Evaluation />)} />
      <Route path="/home" element={guard(<Home />)} />
      <Route path="/search" element={guard(<Search />)} />
      <Route path="/anime/:id" element={guard(<AnimePage />)} />
      <Route path="/downloads" element={guard(<Downloads />)} />
      <Route path="/duels" element={guard(<Duels />)} />
      <Route path="/community" element={guard(<Community />)} />
      <Route path="/profile" element={guard(<Profile />)} />
      <Route path="/manga" element={guard(<Manga />)} />
      <Route path="/card" element={guard(<Card />)} />
      <Route path="/about" element={guard(<Legal mode="about" />)} />
      <Route path="/privacy" element={guard(<Legal mode="privacy" />)} />
      <Route path="/settings" element={guard(<Settings />)} />
    </Routes>
    {!open && <nav className="nav">{TABS.map(([to, i, l]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'on' : ''}><i><Ic n={i} /></i>{t(l)}</NavLink>)}</nav>}
  </>)
}
