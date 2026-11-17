const g = (a, b) => `linear-gradient(160deg,${a},${b})`
export const ANIMES = [
 { id: 1, title: 'Solo Leveling', year: 2024, genre: ['Action', 'Fantasy'], rating: 8.5, lang: 'VO', status: 'En diffusion', seasons: 2, eps: 25, size: '43.3 MB', bg: g('#8B5CF6', '#1A1230'), synopsis: "Sung Jin-woo, le chasseur le plus faible, obtient un pouvoir unique : monter en niveau sans limite." },
 { id: 2, title: 'Black Clover', year: 2022, genre: ['Action', 'Magie'], rating: 8.2, lang: 'VF', status: 'Terminé', seasons: 4, eps: 170, size: '47.6 MB', bg: g('#E11D48', '#1A1230'), synopsis: "Asta, né sans magie, rêve de devenir le Roi Mage dans un monde où tout le monde en possède." },
 { id: 3, title: 'My Hero Academia', year: 2023, genre: ['Action', 'Super-héros'], rating: 8.0, lang: 'VF', status: 'Terminé', seasons: 7, eps: 138, size: '45.1 MB', bg: g('#F43F8E', '#1A1230'), synopsis: "Dans un monde de super-pouvoirs, Izuku, sans don, hérite de celui du plus grand héros." },
 { id: 4, title: 'Jujutsu Kaisen', year: 2023, genre: ['Action', 'Surnaturel'], rating: 8.6, lang: 'VO', status: 'En diffusion', seasons: 2, eps: 47, size: '51.0 MB', bg: g('#6D28D9', '#0B0614'), synopsis: "Yuji avale un doigt maudit et entre dans le monde des exorcistes." },
 { id: 5, title: 'Demon Slayer', year: 2024, genre: ['Action', 'Historique'], rating: 8.7, lang: 'VF', status: 'En diffusion', seasons: 4, eps: 55, size: '49.8 MB', bg: g('#BE123C', '#0B0614'), synopsis: "Tanjiro devient chasseur de démons pour sauver sa soeur Nezuko transformée en démon." },
 { id: 6, title: 'One Piece', year: 2025, genre: ['Aventure', 'Shonen'], rating: 8.9, lang: 'VO', status: 'En diffusion', seasons: 21, eps: 1100, size: '40.2 MB', bg: g('#DB2777', '#1A1230'), synopsis: "Luffy et son équipage parcourent la Grand Line à la recherche du trésor ultime." },
 { id: 7, title: 'Attack on Titan', year: 2023, genre: ['Drame', 'Action'], rating: 9.0, lang: 'VF', status: 'Terminé', seasons: 4, eps: 94, size: '52.4 MB', bg: g('#7C3AED', '#0B0614'), synopsis: "L'humanité vit derrière des murs pour se protéger des Titans géants." },
 { id: 8, title: 'Naruto Shippuden', year: 2017, genre: ['Shonen', 'Ninja'], rating: 8.3, lang: 'VF', status: 'Terminé', seasons: 21, eps: 500, size: '38.9 MB', bg: g('#F43F8E', '#3B0764'), synopsis: "Naruto, devenu adolescent, affronte l'organisation Akatsuki." },
]
export const QUIZ = [
 { q: "Quel est le rêve de Luffy ?", a: ["Devenir Roi des Pirates", "Devenir Hokage", "Devenir Roi Mage", "Devenir Hunter"], c: 0 },
 { q: "Qui est le héros de Solo Leveling ?", a: ["Sung Jin-woo", "Asta", "Yuji Itadori", "Tanjiro"], c: 0 },
 { q: "Dans Black Clover, Asta n'a pas de…", a: ["Magie", "Épée", "Famille", "Amis"], c: 0 },
 { q: "Quel studio a animé Demon Slayer ?", a: ["Ufotable", "MAPPA", "Bones", "Pierrot"], c: 0 },
 { q: "Quel village est celui de Naruto ?", a: ["Konoha", "Suna", "Kiri", "Iwa"], c: 0 },
]
export const EVAL = [
 { q: "Depuis combien de temps regardes-tu des animes ?", a: ["Moins d'un an", "1 à 3 ans", "3 à 7 ans", "Plus de 7 ans"] },
 { q: "Combien d'animes as-tu terminés ?", a: ["Moins de 10", "10 à 50", "50 à 150", "Plus de 150"] },
 { q: "Lis-tu des mangas ?", a: ["Jamais", "Parfois", "Souvent", "Je collectionne"] },
 { q: "Genre préféré ?", a: ["Shonen", "Seinen", "Romance", "Isekai"] },
 { q: "Peux-tu citer un studio d'animation ?", a: ["Non", "Un", "Plusieurs", "Je connais leurs styles"] },
]
export const GRADES = ['Novice', 'Fan', 'Connaisseur', 'Expert', 'Maître', 'Grand Maître', 'Légende']
export const DUEL_SUBJECTS = [
 { id: 'quiz', name: 'Quiz Anime', icon: '❓', desc: '10 questions, temps limité' },
 { id: 'rps', name: 'Janken · じゃんけん', icon: '✊', desc: 'Guu, Paa, Choki · 3 manches' },
 { id: 'mahjong', name: 'Mahjong · 麻雀', icon: '🀄', desc: 'Même plateau pour tous, le plus rapide gagne' },
 { id: 'chess', name: 'Échecs', icon: '♟', desc: '2 joueurs, même écran' },
 ]
export const EVENTS = [
 { id: 1, title: 'Sortie Solo Leveling S3', when: 'Samedi 20:00', live: true, cat: 'Sorties' },
 { id: 2, title: 'Tournoi Quiz Cameroun', when: 'Dimanche 18:00', live: false, cat: 'Tournois' },
 { id: 3, title: 'Soirée visionnage : Jujutsu Kaisen', when: 'Vendredi 21:00', live: false, cat: 'Visionnage' },
]
export const COMMUNITIES = ['Solo Leveling FR', 'Otakus du Cameroun', 'Black Clover Fans', 'Manga Collectors']

// Telegram : ton canal (VITE_TELEGRAM_URL dans .env). Lien précis par épisode : TG_LINKS['idAnime-épisode-VF'] = 'https://t.me/canal/123'
export const TG_CHANNEL = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/TON_CANAL'
export const TG_LINKS = {}
export const tgLink = (id, ep, lang) => TG_LINKS[`${id}-${ep}-${lang}`] || TG_CHANNEL

// VF : ajoute ici les id (AniList) disponibles en version française. Sinon la version originale s'affiche automatiquement.
export const HAS_VF = new Set()
export const hasVF = a => a.lang === 'VF' || HAS_VF.has(a.id)
export const verOf = (a, want) => want === 'VF' && hasVF(a) ? 'VF' : 'VO'
// « titan vf » ou « titan version française » dans la recherche = on demande la VF
export const parseQ = q => ({ vf: /\bvf\b|\bfran[cç]ais(e)?\b/i.test(q), q: q.replace(/\bversion fran[cç]aise\b|\bvf\b|\bfran[cç]ais(e)?\b/gi, '').replace(/\s+/g, ' ').trim() })
const qs = a => encodeURIComponent(a.title)
// Où envoyer l'utilisateur pour regarder / télécharger : modifie ici les liens
export const PROVIDERS = [['Crunchyroll', a => 'https://www.crunchyroll.com/search?q=' + qs(a)], ['ADN', a => 'https://animationdigitalnetwork.com/search?search=' + qs(a)], ['Telegram', (a, ep, v) => tgLink(a.id, ep, v)]]
