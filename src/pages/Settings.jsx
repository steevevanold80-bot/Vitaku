import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store'
import Install from '../Install'
import { supabase } from '../supabase'
import { useT } from '../i18n'
import { APP_VERSION } from '../version'
import Menu, { Switch } from './SettingsMenus'
import { wipeLocal } from '../store'
// Page « Mon compte » façon Crunchyroll : profil en haut, puis listes à plat séparées par un filet.
const THEMES = [['clair', 'Mode clair', ['#F5F2FF', '#FFFFFF', '#7C3AED', '#DB2777', '#1B1330']], ['sombre', 'Mode sombre', ['#0E0E11', '#1A1A20', '#6366F1', '#8B93FF', '#F2F2F5']], ['neon', 'Néon violet', ['#0B0614', '#1A1230', '#8B5CF6', '#F43F8E', '#F5F0FF']]]
const Preview = ({ c }) => <div style={{ background: c[0], borderRadius: 14, padding: 8, height: 96, display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid #8884' }}>
  <div style={{ background: c[1], borderRadius: 8, padding: 6 }}><div style={{ height: 5, width: '60%', borderRadius: 3, background: c[4] }} /></div><div style={{ background: c[1], borderRadius: 8, height: 14 }} /><div style={{ marginTop: 'auto', height: 16, borderRadius: 10, background: `linear-gradient(90deg,${c[2]},${c[3]})` }} /></div>
const H = ({ children }) => <h3 style={{ margin: '28px 0 4px', color: 'var(--mut)', fontWeight: 600, fontSize: 18 }}>{children}</h3>
const Row = ({ l, v, onClick, to, href, children, danger }) => {
  const go = onClick || to || href, c = <div role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} onKeyDown={e => onClick && e.key === 'Enter' && onClick()} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 58, borderBottom: '1px solid #ffffff1f', cursor: go ? 'pointer' : 'default', fontSize: 17, color: danger ? 'var(--pink)' : 'inherit' }}>
    <span style={{ flex: 1 }}>{l}</span>{v && <span className="mut" style={{ fontSize: 15 }}>{v}</span>}{children}{go && !children && !danger && <span className="mut" style={{ fontSize: 24 }}>›</span>}</div>
  return to ? <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }}>{c}</Link> : href ? <a href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{c}</a> : c
}
export default function Settings() {
  const nav = useNavigate(), t = useT(), ref = useRef(), [user, setUser] = useStore('user', null), [photo, setPhoto] = useStore('photo', null)
  const [bg, setBg] = useStore('bgdl', true), [notif, setNotif] = useStore('notif', true), [cell, setCell] = useStore('cell', true), [sdh, setSdh] = useStore('sdh', true)
  const [uil, setUil] = useStore('uilang', 'fr'), [theme, setTheme] = useStore('theme', 'neon'), [lang, setLang] = useStore('lang', 'VF'), [sub, setSub] = useStore('subs', 'Français')
  const [upd, setUpd] = useState(null), [menu, setMenu] = useState(null), cur = ['clair', 'sombre', 'neon'].includes(theme) ? theme : 'neon', name = user?.name || 'Otaku'
  const check = async () => { setUpd('check'); try { const j = await (await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })).json(); setUpd(j.version === APP_VERSION ? 'ok' : j.version) } catch { setUpd('err') } }
  const onFile = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const k = Math.min(1, 300 / Math.min(img.width, img.height)), cv = document.createElement('canvas'); cv.width = img.width * k; cv.height = img.height * k; cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); setPhoto(cv.toDataURL('image/jpeg', .85)) }; img.src = URL.createObjectURL(f) }
  const S = ({ on, set, l }) => <Switch on={on} set={set} label={l} />
  return <div className="page glow"><button className="chip" onClick={() => nav(-1)}>‹ {t('Retour')}</button>
    <div style={{ textAlign: 'center', padding: '6px 0 10px' }}>
      <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto' }}>
        <div style={{ width: 130, height: 130, borderRadius: '50%', border: '4px solid #fff', overflow: 'hidden', background: 'var(--chip)', display: 'grid', placeItems: 'center', fontSize: 52 }}>{photo ? <img alt="" src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0].toUpperCase()}</div>
        <button aria-label="Modifier la photo" onClick={() => ref.current.click()} style={{ position: 'absolute', right: 0, bottom: 0, width: 38, height: 38, borderRadius: '50%', border: 0, background: '#fff', fontSize: 18 }}>✏️</button></div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onFile} /><h1 className="t" style={{ fontSize: 22, marginTop: 12 }}>{name}</h1></div>
    <Row l="Changer de profil" onClick={() => setMenu('compte')} />
    <H>{name}</H>
    <Row l="Langue audio" v={lang === 'VF' ? 'Français' : 'Japonais'} onClick={() => setLang(lang === 'VF' ? 'VO' : 'VF')} />
    <Row l="Sous-titres" v={sub} onClick={() => setSub(sub === 'Français' ? 'English' : sub === 'English' ? 'Aucun' : 'Français')} />
    <Row l="Afficher les sous-titres pour malentendants"><S on={sdh} set={setSdh} l="Sous-titres malentendants" /></Row>
    <H>Abonnement</H><Row l="Abonnement" v="Gratuit" />
    <H>Compte</H>
    <Row l="E-mail" v={user?.email || '—'} onClick={() => setMenu('compte')} /><Row l="Mot de passe" onClick={() => setMenu('security')} />
    <H>Votre App</H>
    <Row l={t('Notifications')}><S on={notif} set={setNotif} l="Notifications" /></Row>
    <Row l="Paramètres de notification" onClick={() => setMenu('notifs')} />
    <Row l="Utiliser les données cellulaires"><S on={cell} set={setCell} l="Données cellulaires" /></Row>
    <Row l={t('Télécharger en arrière-plan')}><S on={bg} set={setBg} l="Arrière-plan" /></Row>
    <Row l={t('Langue')}><div className="row">{[['fr', 'Français'], ['en', 'English']].map(([k, l]) => <button key={k} className={'tab ' + (uil === k ? 'on' : '')} style={{ margin: 0, padding: '8px 12px' }} onClick={() => setUil(k)}>{l}</button>)}</div></Row>
    <H>{t('Apparence')}</H>
    <div className="row" style={{ gap: 10, alignItems: 'stretch', margin: '8px 0' }}>{THEMES.map(([k, n, c]) => <button key={k} onClick={() => setTheme(k)} aria-pressed={cur === k} style={{ flex: 1, border: cur === k ? '2px solid var(--pink)' : '2px solid transparent', borderRadius: 18, padding: 8, background: 'var(--card)', color: 'var(--txt)', cursor: 'pointer' }}><Preview c={c} /><div className="t" style={{ fontSize: 12, marginTop: 8 }}>{cur === k ? '✓ ' : ''}{t(n)}</div></button>)}</div>
    <H>{t('Application')}</H><Install />
    <Row l={t('Vérifier la mise à jour')} onClick={check} />
    {upd && <div className="card" style={{ margin: '8px 0' }}>{upd === 'check' ? t('Vérification…') : upd === 'ok' ? `✓ ${t('Version')} ${APP_VERSION} · ${t('à jour')}` : upd === 'err' ? t('Impossible de vérifier (hors ligne ?)') : <>{t('Nouvelle version disponible')} : {upd} <button className="btn sm" style={{ marginLeft: 8 }} onClick={() => location.reload()}>{t('Recharger')}</button></>}</div>}
    {!supabase && <Row l={t('Mode administrateur (test)')}><S on={user?.role === 'admin'} set={v => setUser({ ...user, role: v ? 'admin' : 'user' })} l="Admin" /></Row>}
    <H>Confidentialité</H>
    <Row l="Confidentialité du profil" onClick={() => setMenu('privacy')} /><Row l="Utilisateurs bloqués" onClick={() => setMenu('blocked')} /><Row l="Supprimer mon compte" onClick={() => setMenu('delete')} />
    <H>Aide en ligne</H><Row l="Besoin d'aide ?" href="mailto:contact@vitaku.app" />
    <Row l={t('Se déconnecter')} onClick={async () => { if (supabase) await supabase.auth.signOut(); wipeLocal(); location.replace('/') }} />
    <div style={{ textAlign: 'center', margin: '28px 0 10px' }}><div className="mut">Version {APP_VERSION}</div>
      <Link to="/about" style={{ display: 'block', color: 'var(--pink)', fontWeight: 800, margin: '10px 0', textDecoration: 'none' }}>{t('À propos de nous')}</Link>
      <Link to="/privacy" style={{ display: 'block', color: 'var(--pink)', fontWeight: 800, textDecoration: 'none' }}>{t('Politique de confidentialité')}</Link></div>
    {menu && <Menu id={menu} onClose={() => setMenu(null)} />}
  </div>
}
