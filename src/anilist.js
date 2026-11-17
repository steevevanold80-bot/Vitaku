import { useEffect, useState } from 'react'
import { ANIMES as LOCAL } from './data'
// AniList : API GraphQL gratuite, sans clé. Si elle échoue, on garde les 8 animes locaux.
const Q = `query($s:String,$type:MediaType=ANIME,$sort:[MediaSort],$st:MediaStatus,$se:MediaSeason,$y:Int){Page(perPage:24){media(type:$type,search:$s,sort:$sort,status:$st,season:$se,seasonYear:$y,isAdult:false){id title{romaji english native}synonyms seasonYear status averageScore genres episodes chapters siteUrl description(asHtml:false)coverImage{large extraLarge}bannerImage startDate{year month day}}}}`
let cache = LOCAL.map(a => ({ ...a, id: a.id + 100000 })), upc = [], started = false; const subs = new Set()
const p2 = n => String(n).padStart(2, '0')
const map = (m, up) => {
  const sd = m.startDate || {}, bg = `url("${m.coverImage.large}") center/cover, #1A1230`
  return { id: m.id, title: m.title.english || m.title.romaji, orig: m.title.romaji, native: m.title.native, syn: m.synonyms || [], year: m.seasonYear || sd.year || '—', genre: m.genres.slice(0, 3), rating: m.averageScore ? m.averageScore / 10 : '—', lang: 'VO',
    status: m.status === 'RELEASING' ? 'En diffusion' : m.status === 'NOT_YET_RELEASED' ? 'À venir' : 'Terminé', seasons: 1, chapters: m.chapters, url: m.siteUrl, eps: m.episodes || '?', size: '45 MB', bg,
    hero: m.bannerImage ? `url("${m.bannerImage}") center/cover, #1A1230` : bg, poster: m.coverImage.extraLarge || m.coverImage.large, upcoming: up || m.status === 'NOT_YET_RELEASED',
    release: sd.year ? (sd.day ? `${p2(sd.day)}/${p2(sd.month)}/${sd.year}` : sd.month ? `${p2(sd.month)}/${sd.year}` : `${sd.year}`) : 'Date à venir',
    key: sd.year ? sd.year * 10000 + (sd.month || 12) * 100 + (sd.day || 28) : 99999999,
    synopsis: (m.description || 'Pas de synopsis.').replace(/<[^>]+>/g, '') }
}
async function load(v, up) {
  const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: Q, variables: v }) })
  const list = (await r.json()).data.Page.media.map(m => map(m, up)), ids = new Set(list.map(a => a.id))
  cache = [...list, ...cache.filter(a => !ids.has(a.id))]
  if (up) { const s = new Set(upc.map(a => a.id)); upc = [...upc, ...list.filter(a => !s.has(a.id))].sort((a, b) => a.key - b.key) }
  subs.forEach(f => f()); return list
}
let mg = []
export async function loadManga(s) {
  const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: Q, variables: { s: s || undefined, type: 'MANGA', sort: [s ? 'SEARCH_MATCH' : 'TRENDING_DESC'] } }) })
  mg = (await r.json()).data.Page.media.map(m => map(m)); subs.forEach(f => f())
}
export function useManga() { useSub(); return mg }
export const searchAnilist = s => load({ s, sort: ['SEARCH_MATCH'] }).catch(() => [])
function start() {
  if (started) return; started = true
  load({ sort: ['TRENDING_DESC'] }).catch(() => {})
  load({ sort: ['POPULARITY_DESC'], st: 'NOT_YET_RELEASED' }, true).catch(() => {})   // annonces officielles
  const now = new Date(), c = Math.floor(now.getMonth() / 3), S = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  ;[1, 2].forEach(k => load({ sort: ['POPULARITY_DESC'], se: S[(c + k) % 4], y: now.getFullYear() + Math.floor((c + k) / 4) }, true).catch(() => {})) // 2 prochaines saisons
}
function useSub() { const [, n] = useState(0); useEffect(() => { const f = () => n(x => x + 1); subs.add(f); start(); return () => subs.delete(f) }, []) }
export function useAnimes() { useSub(); return cache }
export function useUpcoming() { useSub(); return upc.length ? upc : cache.slice(0, 3) }
