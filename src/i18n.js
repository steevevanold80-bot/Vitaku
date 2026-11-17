import { useStore } from './store'
// Langue de l'interface (FR par défaut). Les contenus venant d'AniList restent dans leur langue d'origine.
const EN = {
 'Accueil': 'Home', 'Communauté': 'Community', 'Duel': 'Duel', 'Téléchargement': 'Downloads', 'Profil': 'Profile',
 'Ton univers commence ici.': 'Your universe starts here.', 'Exprime ton talent. Prouve ton niveau. Défie le monde.': 'Show your talent. Prove your level. Challenge the world.',
 'Commencer la partie': 'Start playing', 'Se connecter': 'Sign in', 'Continuer en mode démo': 'Continue in demo mode',
 'Prochaines sorties': 'Coming soon', 'Anime tendance': 'Trending anime', 'En diffusion': 'Now airing', 'Catégories': 'Categories', 'Annonce de sortie': 'Release announcement',
 'Rechercher un anime, un manga…': 'Search an anime, a manga…', '📚 Mangas, BD & scans': '📚 Manga, comics & scans', '🇫🇷 Version française': '🇫🇷 French version', '🇯🇵 Version originale': '🇯🇵 Original version',
 'Action': 'Action', 'Aventure': 'Adventure', 'Fantasy': 'Fantasy', 'Drame': 'Drama', 'Comédie': 'Comedy', 'Isekai': 'Isekai', 'Romance': 'Romance',
 'Mes contenus': 'My content', '⬇ Téléchargés': '⬇ Downloaded', '★ Ma liste': '★ My list', '📚 Mangas': '📚 Manga',
 '📅 Événements': '📅 Events', '💬 Discussion': '💬 Chat', '📊 Sondages': '📊 Polls', '👥 Groupes': '👥 Groups',
 'Duels': 'Duels', 'Défier un otaku': 'Challenge an otaku', 'Mes duels': 'My duels', 'Envoyer le défi': 'Send challenge', 'Jouer': 'Play', 'Adversaire(s) ou communauté': 'Opponent(s) or community', 'Sujet du duel': 'Duel subject', 'Date et heure': 'Date and time', 'Règles': 'Rules',
 'Ma carte Otaku': 'My Otaku card', 'Historique de visionnage': 'Watch history', 'Paramètres': 'Settings', 'En ligne': 'Online', 'Non évalué': 'Not rated',
 'Notifications': 'Notifications', 'Télécharger en arrière-plan': 'Download in background', 'Langue': 'Language', 'Thème': 'Theme', 'Français': 'French', 'English': 'English',
 'Vérifier la mise à jour': 'Check for updates', 'Vérification…': 'Checking…', 'Version': 'Version', 'à jour': 'up to date', 'Nouvelle version disponible': 'New version available', 'Recharger': 'Reload', 'Impossible de vérifier (hors ligne ?)': 'Unable to check (offline?)',
 'À propos de nous': 'About us', 'Politique de confidentialité': 'Privacy policy', 'Se déconnecter': 'Sign out', 'Mode administrateur (test)': 'Admin mode (test)', 'Retour': 'Back',
 'Violet néon': 'Neon violet', 'Rose néon': 'Neon pink', 'Rouge néon': 'Neon red', 'Général': 'General', 'Apparence': 'Appearance', 'Application': 'App',
}
export function useT() { const [l] = useStore('uilang', 'fr'); return s => (l === 'en' && EN[s]) || s }

const MORE = {
 'Chargement de ton univers…': 'Loading your universe…', 'Crée ton compte': 'Create your account', 'Content de te revoir': 'Welcome back', 'Pseudo': 'Username', 'E-mail': 'Email', 'Mot de passe': 'Password',
 '‹ Retour': '‹ Back', 'Déjà un compte ? Se connecter': 'Already have an account? Sign in', 'Pas de compte ? Commencer la partie': 'No account? Start playing',
 'Suggestion': 'Suggestion', 'Récent': 'Recent', '🗑 Effacer': '🗑 Clear', '🔥 Tout le monde recherche': '🔥 Everyone is searching', 'Aucun résultat. Essaie un autre titre.': 'No results. Try another title.',
 'Épisodes': 'Episodes', '+ Ajouter à la liste': '+ Add to list', '✓ Dans ma liste': '✓ In my list', 'Partager': 'Share', 'Voir sur Crunchyroll': 'Watch on Crunchyroll', 'Pour vous': 'For you', 'Envoyer': 'Send', 'Ton avis…': 'Your opinion…',
 '⬇ Télécharger': '⬇ Download', '✓ Téléchargé': '✓ Downloaded', "Rien pour l'instant. Ouvre un anime et appuie sur Télécharger.": 'Nothing yet. Open an anime and tap Download.',
 "Ta liste est vide. Les animes que tu télécharges ou ajoutes s'affichent ici.": 'Your list is empty. Anime you download or add appear here.',
 'Adversaire (pseudo)': 'Opponent (username)', 'Mise en XP virtuel (max 200)': 'Virtual XP stake (max 200)', 'Aucun duel. Lance un défi ci-dessus.': 'No duels yet. Send a challenge above.',
 'en attente': 'pending', 'approuvé': 'approved', 'refusé': 'declined', 'Adversaire accepte': 'Opponent accepts', 'Refuser': 'Decline', 'Quitter': 'Quit', 'Rejoindre': 'Join', 'Publier': 'Post',
 'Écrire un message': 'Write a message', '● En direct': '● Live', '● En ligne': '● Online', "Rien regardé pour l'instant.": 'Nothing watched yet.', 'Stratégie': 'Strategy', 'Combat': 'Combat', 'Magie': 'Magic', 'Savoir': 'Knowledge',
 'Maître': 'Master', 'Grand Maître': 'Grand Master', 'Légende': 'Legend', 'Connaisseur': 'Connoisseur',
 '🎁 Bonus de connexion': '🎁 Login bonus', '🎯 Quêtes quotidiennes': '🎯 Daily quests', 'Récupérer': 'Claim', '✓ Reçu': '✓ Claimed', 'Regarder un épisode': 'Watch an episode', 'Lancer un duel': 'Start a duel',
 'Écrire dans une discussion': 'Write in a chat', 'Rejoindre un groupe': 'Join a group', 'À faire': 'To do', 'Valider': 'Claim', '✓ Fait': '✓ Done', '🔐 Demandes pour voir ma carte': '🔐 Requests to view my card',
 'Accepter': 'Accept', '📢 Annonces de sortie': '📢 Release announcements', 'Mangas, BD & scans': 'Manga, comics & scans', 'Manche gagnée !': 'Round won!', 'Manche perdue': 'Round lost', 'Égalité': 'Draw',
 'Choisis ton geste': 'Choose your move', 'Blancs': 'White', 'Noirs': 'Black', 'TOUR': 'TURN', 'PIÈCE SÉLECTIONNÉE': 'SELECTED PIECE', 'HISTORIQUE': 'HISTORY', 'PIÈCES CAPTURÉES · ANALYSE': 'CAPTURED PIECES · ANALYSIS',
 'Position équilibrée': 'Balanced position', '＋ Nouvelle': '＋ New', '↶ Annuler': '↶ Undo', '💡 Indice': '💡 Hint', 'Échec ! Protège ton roi.': 'Check! Protect your king.', '🔀 Mélanger': '🔀 Shuffle',
 'Plus de coups possibles.': 'No more moves.', 'Associe 2 tuiles identiques libres. Même plateau pour tous les joueurs du duel.': 'Match 2 identical free tiles. Same board for every player in the duel.',
 'Ma carte Otaku': 'My Otaku card', 'Cartes de la communauté': 'Community cards', 'Enregistrer ma carte': 'Save my card', 'Couleur': 'Color', 'Forme': 'Shape', 'Prénom': 'First name', 'Nationalité': 'Nationality', 'Classe': 'Class',
 'Spécialité': 'Specialty', 'Passions': 'Interests', 'Objectif': 'Goal', 'Statistiques': 'Stats', 'Qui peut voir ma carte ?': 'Who can see my card?', 'Publique': 'Public', 'Sur demande': 'On request', 'Privée': 'Private',
 'Demander': 'Request', 'Dans ma bibliothèque': 'In my library', '+ Bibliothèque': '+ Library', 'Lire maintenant': 'Read now', "La lecture n'est pas encore activée par l'administrateur.": 'Reading is not enabled yet by the admin.',
 'Rechercher un manga, une BD…': 'Search a manga, a comic…', 'Infos & sources': 'Info & sources', 'Autoriser la lecture aux utilisateurs': 'Allow users to read',
}
Object.assign(EN, MORE); delete EN['Français']; delete EN['English']
const PAT = [[/^Niveau (\d+) · (\d+) XP$/, 'Level $1 · $2 XP'], [/^Annonce de sortie · (.*)$/, 'Release announcement · $1'], [/^Commentaires \((\d+)\)$/, 'Comments ($1)'],
  [/^Épisode (\d+)(.*)$/, 'Episode $1$2'], [/^Ép\. (\d+)$/, 'Ep. $1'], [/^Question (\d+)\/(\d+)$/, 'Question $1/$2'], [/^Manche (\d)\/3(.*)$/, 'Round $1/3$2'], [/^(\d+) tuiles$/, '$1 tiles'],
  [/^Série : (\d+) jours?$/, 'Streak: $1 day(s)'], [/^\+(\d+) XP aujourd'hui$/, '+$1 XP today'], [/^(\d+) chapitres$/, '$1 chapters'], [/^✓ Version (.+) · à jour$/, '✓ Version $1 · up to date']]
let en = false
const tr = s => { const k = s.replace(/\s+/g, ' ').trim(); if (!k) return s; let v = EN[k]; if (!v) for (const [re, r] of PAT) if (re.test(k)) { v = k.replace(re, r); break } return v ? s.replace(s.trim(), () => v) : s }
const nodeMem = new WeakMap(), attrMem = new WeakMap()
function text(n) { const cur = n.nodeValue; let s = nodeMem.get(n); if (!s || cur !== s.t) s = { o: cur, t: cur }; const t = en ? tr(s.o) : s.o; if (t !== cur) n.nodeValue = t; s.t = t; nodeMem.set(n, s) }
function attrs(e) { for (const a of ['placeholder', 'aria-label']) { const cur = e.getAttribute && e.getAttribute(a); if (cur == null) continue; const m = attrMem.get(e) || {}; let s = m[a]; if (!s || cur !== s.t) s = { o: cur, t: cur }; const t = en ? tr(s.o) : s.o; if (t !== cur) e.setAttribute(a, t); s.t = t; m[a] = s; attrMem.set(e, m) } }
function walk(n) { if (n.nodeType === 3) return text(n); if (n.nodeType === 1 && !['SCRIPT', 'STYLE', 'TEXTAREA'].includes(n.tagName)) { attrs(n); n.childNodes.forEach(walk) } }
let obs
// Traduit tout l'écran (et les écrans suivants) selon la langue choisie dans Paramètres. Les textes venant d'AniList restent tels quels.
export function applyLang(lang) {
  en = lang === 'en'; document.documentElement.lang = lang; walk(document.body)
  if (!obs) { obs = new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') text(m.target); else if (m.type === 'attributes') attrs(m.target); else m.addedNodes.forEach(walk) } })
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label'] }) }
}
Object.assign(EN, { "📲 Installer l'application": '📲 Install the app', 'Installer': 'Install', '✓ Application installée': '✓ App installed',
  "Sur iPhone : touche Partager, puis « Sur l'écran d'accueil ».": 'On iPhone: tap Share, then “Add to Home Screen”.', "Ouvre le menu du navigateur (⋮), puis « Installer l'application » ou « Ajouter à l'écran d'accueil ».": 'Open the browser menu (⋮), then “Install app” or “Add to Home screen”.' })
Object.assign(EN, { 'Compte': 'Account', 'Mon compte': 'My account', 'Confidentialité': 'Privacy', 'Préférences de notifications': 'Notification preferences', 'Préférences de contenu': 'Content preferences', 'Sécurité': 'Security',
  'Utilisateurs bloqués': 'Blocked users', 'Supprimer mon compte': 'Delete my account', 'Mode clair': 'Light mode', 'Mode sombre': 'Dark mode', 'Néon violet': 'Neon violet', 'Enregistrer': 'Save', '✓ Enregistré': '✓ Saved',
  'Le pseudo doit faire au moins 3 caractères.': 'Username must be at least 3 characters.', 'Ce pseudo est déjà pris.': 'This username is already taken.', 'Profil visible par tous': 'Profile visible to everyone',
  'Afficher « En ligne »': 'Show “Online”', 'Autoriser les messages privés': 'Allow private messages', 'Historique de visionnage visible': 'Watch history visible', 'Annonces de sortie': 'Release announcements', 'Événements': 'Events',
  'Quêtes et bonus quotidiens': 'Daily quests and bonuses', 'Défis et résultats de duels': 'Duel challenges and results', 'Messages et réactions': 'Messages and reactions',
  'Version proposée par défaut pour les animes et les mangas.': 'Default version offered for anime and manga.', 'Nouveau mot de passe': 'New password', 'Confirmer le mot de passe': 'Confirm password', 'Changer le mot de passe': 'Change password',
  '6 caractères minimum.': 'At least 6 characters.', 'Les mots de passe ne correspondent pas.': 'Passwords do not match.', 'Disponible une fois la base de données connectée.': 'Available once the database is connected.', '✓ Mot de passe modifié': '✓ Password changed',
  'Pseudo à bloquer': 'Username to block', 'Bloquer': 'Block', 'Débloquer': 'Unblock', 'Aucun utilisateur bloqué.': 'No blocked users.', 'Supprimer définitivement': 'Delete permanently', 'Tape SUPPRIMER pour confirmer': 'Type SUPPRIMER to confirm',
  'Cette action est définitive : ton profil, ta progression, tes listes et ta carte Otaku seront supprimés.': 'This is permanent: your profile, progress, lists and Otaku card will be deleted.' })
