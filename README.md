# VITAKU (V1 prototype)
```
npm install
npm run dev
```
Les données sont stockées dans localStorage (téléchargements, avatar, évaluation, duels, messages).

## Base de données gratuite recommandée : Supabase
Offre gratuite : PostgreSQL, authentification (e-mail, Google), stockage de fichiers, temps réel (chat, événements, statuts), règles de sécurité par ligne. Idéal pour VITAKU.
1. Créer un projet sur supabase.com, copier URL + clé anon dans `.env` (voir `.env.example`).
2. `npm i @supabase/supabase-js`, puis remplacer les fonctions de `src/store.js` par des appels Supabase.
3. Tables : profiles, anime, user_downloads, duels, communities, events, messages, polls.
Alternative : Firebase (Spark plan). Pour les vidéos, prévoir un stockage externe (Cloudflare R2 a un palier gratuit).

## Installer VITAKU comme une application (PWA)
1. `npm run build` puis héberge le dossier `dist` gratuitement (Vercel, Netlify ou Cloudflare Pages). L'installation exige HTTPS (ou localhost).
2. Ouvre le site sur le téléphone : bouton « Installer l'application » (Paramètres ou écran d'accueil).
   - Android/Chrome : fenêtre d'installation. iPhone/Safari : Partager > Sur l'écran d'accueil.
3. Le logo s'affiche comme icône. L'application s'ouvre en plein écran et fonctionne hors ligne (l'interface ; AniList demande internet).
4. Vidéos : place tes fichiers dans `public/videos/<id>-VF.mp4` ou `<id>-VO.mp4`. « Télécharger » les enregistre sur l'appareil pour les revoir hors ligne.
5. Nouvelle version : augmente `version` dans package.json et public/version.json, puis redéploie.

## Connexion à Supabase
1. Supabase > Project Settings > API : copie « Project URL » et la clé « anon » (ou « publishable »). Jamais la clé « service_role ».
2. Copie `.env.example` en `.env`, colle les 2 valeurs, puis `npm install` et relance `npm run dev`.
3. Supabase > Authentication > Sign In / Providers > Email : pour tester, désactive « Confirm email ».
4. Sur Vercel/Netlify : ajoute les 2 mêmes variables dans les réglages du projet avant de déployer.
Branchées : inscription, connexion, déconnexion, profil (pseudo, XP, grade, thème, langue). Le reste (listes, duels, chat...) est encore local.

## Mise en ligne (pour partager le lien)
1. Supabase > SQL Editor : lancer `vitaku_supabase.sql` puis `vitaku_supabase_v1.5.sql`.
2. Supabase > Authentication > URL Configuration : mettre l'adresse du site en ligne dans « Site URL ».
3. Hébergement gratuit : Vercel ou Netlify. Importer le projet (GitHub), commande `npm run build`, dossier `dist`,
   variables d'environnement : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TELEGRAM_URL`.
4. Partager le lien. Android (Chrome) : menu ⋮ > Installer l'application. iPhone (Safari) : Partager > Sur l'écran d'accueil.
