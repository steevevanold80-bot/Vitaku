-- VITAKU : base de données Supabase (PostgreSQL)
-- Utilisation : Supabase > SQL Editor > New query > coller tout ce fichier > Run.
-- Les animes viennent d'AniList : on ne stocke que leur identifiant (anime_id) et un résumé.

-- SI TU AS DÉJÀ LANCÉ UNE VERSION PRÉCÉDENTE (erreur « already exists ») : sélectionne et lance d'abord ce bloc seul, sur un projet de test.
-- drop table if exists public.mahjong_scores, public.manga_library, public.manga_reading, public.daily_progress, public.card_access, public.reports, public.notifications,
--   public.user_badges, public.badges, public.poll_votes, public.poll_options, public.polls, public.stories, public.messages, public.events, public.community_members,
--   public.communities, public.duels, public.quiz_questions, public.anime_comments, public.watch_history, public.user_list, public.user_downloads, public.cards, public.profiles cascade;
-- drop function if exists public.is_staff(), public.my_role(), public.handle_new_user() cascade;

create extension if not exists pgcrypto;

-- ========== PROFILS ==========
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24),
  role text not null default 'user' check (role in ('user','moderator','admin')),
  photo_url text,                            -- photo de profil
  specialty text default 'Stratégie',
  language text not null default 'fr' check (language in ('fr','en')),
  theme text not null default 'violet' check (theme in ('violet','rose','rouge')),
  notifications_on boolean not null default true,
  background_dl boolean not null default true,
  content_lang text not null default 'VF' check (content_lang in ('VF','VO')),
  grade text not null default 'Novice' check (grade in ('Novice','Fan','Connaisseur','Expert','Maître','Grand Maître','Légende')),
  level int not null default 1 check (level between 1 and 100),
  xp int not null default 0 check (xp >= 0),
  rank_points int not null default 0,        -- RANK compétitif (RIVALIS)
  country text, city text, bio text,
  eval_done boolean not null default false,  -- évaluation Otaku : une seule fois
  eval_score int,
  created_at timestamptz not null default now()
);

create function public.is_staff() returns boolean language sql security definer stable set search_path = public as
$$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('moderator','admin')) $$;
create function public.my_role() returns text language sql security definer stable set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- Profil créé automatiquement à l'inscription
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare u text;
begin
  u := left(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 18);
  if char_length(u) < 3 then u := 'otaku' || floor(random() * 9000 + 1000)::int; end if;
  if exists(select 1 from public.profiles where username = u) then u := u || floor(random() * 900 + 100)::int; end if;
  insert into public.profiles (id, username) values (new.id, u);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ========== CARTE OTAKU ==========
create table public.cards (
  user_id uuid primary key references public.profiles on delete cascade,
  config jsonb not null,                     -- style, forme, couleur, agencement, compétences
  photo_url text,
  visibility text not null default 'publique' check (visibility in ('publique','sur_demande','privee')),
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ========== ANIMES DE L'UTILISATEUR ==========
create table public.user_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  anime_id int not null, episode int not null default 1,
  anime jsonb not null,                      -- titre, image, synopsis (copie pour l'accès hors ligne)
  lang text not null default 'VF' check (lang in ('VF','VO')),
  created_at timestamptz not null default now(),
  unique (user_id, anime_id, episode)
);
create table public.user_list (
  user_id uuid not null references public.profiles on delete cascade,
  anime_id int not null, anime jsonb not null,
  status text not null default 'a_voir' check (status in ('en_cours','termine','a_voir','en_pause','abandonne')),
  primary key (user_id, anime_id)
);
create table public.watch_history (
  user_id uuid not null references public.profiles on delete cascade,
  anime_id int not null, anime jsonb not null, last_episode int default 1,
  watched_at timestamptz not null default now(),
  primary key (user_id, anime_id)
);
create table public.anime_comments (
  id uuid primary key default gen_random_uuid(),
  anime_id int not null,
  user_id uuid not null references public.profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.anime_comments (anime_id, created_at desc);

-- ========== DUELS ==========
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null, answers jsonb not null, correct_index int not null,
  difficulty text not null default 'normal' check (difficulty in ('facile','normal','difficile','expert','legendaire')),
  active boolean not null default true
);
create table public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles,
  opponent_id uuid not null references public.profiles check (opponent_id <> challenger_id),
  subject text not null check (subject in ('quiz','rps','chess','mahjong')),
  scheduled_at timestamptz not null,
  rules text,
  stake_xp int not null default 50 check (stake_xp between 10 and 200),   -- XP virtuel uniquement
  status text not null default 'pending' check (status in ('pending','approved','refused','played','cancelled')),
  challenger_score int, opponent_score int,
  winner_id uuid references public.profiles,
  created_at timestamptz not null default now()
);
create index on public.duels (challenger_id); create index on public.duels (opponent_id);

-- ========== COMMUNAUTÉS ==========
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, description text, rules text,
  created_by uuid references public.profiles,
  created_at timestamptz not null default now()
);
create table public.community_members (
  community_id uuid references public.communities on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('member','moderator','owner')),
  primary key (community_id, user_id)
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities on delete cascade,
  title text not null, starts_at timestamptz not null, is_live boolean not null default false,
  created_by uuid references public.profiles
);
create table public.messages (                -- discussion de groupe (type WhatsApp), en temps réel
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index on public.messages (community_id, created_at);
create table public.stories (                 -- statuts (type Instagram), expirent après 24 h
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  text text, image_url text,
  expires_at timestamptz not null default now() + interval '24 hours'
);
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities on delete cascade,
  question text not null, created_by uuid references public.profiles,
  created_at timestamptz not null default now()
);
create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls on delete cascade, label text not null
);
create table public.poll_votes (
  poll_id uuid not null references public.polls on delete cascade,
  option_id uuid not null references public.poll_options on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  primary key (poll_id, user_id)              -- un vote par personne et par sondage
);

-- ========== BADGES, NOTIFICATIONS, MODÉRATION ==========
create table public.badges (code text primary key, name text not null, description text);
create table public.user_badges (
  user_id uuid references public.profiles on delete cascade,
  badge_code text references public.badges, earned_at timestamptz default now(),
  primary key (user_id, badge_code)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  type text not null, body text not null, read boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles,
  target_type text not null check (target_type in ('post','comment','profile','message')),
  target_id uuid not null, reason text not null,
  status text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at timestamptz not null default now()
);

-- ========== MAHJONG, MANGAS, QUÊTES ==========
create table public.mahjong_scores (          -- même plateau pour tous (graine = id du duel) : le plus rapide gagne
  duel_id uuid not null references public.duels on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  seconds int not null, tiles_left int not null default 0,
  created_at timestamptz not null default now(),
  primary key (duel_id, user_id)
);
create table public.manga_library (
  user_id uuid not null references public.profiles on delete cascade,
  manga_id int not null, manga jsonb not null, added_at timestamptz not null default now(),
  primary key (user_id, manga_id)
);
create table public.manga_reading (            -- l'administrateur autorise la lecture et fournit le lien (contenu dont il détient les droits)
  manga_id int not null, lang text not null check (lang in ('VF','VO')),
  enabled boolean not null default false, reader_url text,
  updated_by uuid references public.profiles, updated_at timestamptz not null default now(),
  primary key (manga_id, lang)
);
create table public.daily_progress (           -- bonus de connexion et quêtes quotidiennes
  user_id uuid not null references public.profiles on delete cascade,
  day date not null default current_date,
  bonus_claimed boolean not null default false, quests_done text[] not null default '{}', streak int not null default 0,
  primary key (user_id, day)
);

-- ========== SÉCURITÉ (Row Level Security) ==========
do $$ declare t text; begin
  for t in select unnest(array['profiles','cards','user_downloads','user_list','watch_history','anime_comments','quiz_questions','duels',
    'communities','community_members','events','messages','stories','polls','poll_options','poll_votes','badges','user_badges','notifications','reports','mahjong_scores','manga_library','manga_reading','daily_progress'])
  loop execute format('alter table public.%I enable row level security', t); end loop; end $$;

-- Lecture publique pour les utilisateurs connectés
create policy "lire profils" on public.profiles for select to authenticated using (true);
create policy "modifier son profil" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "gérer sa carte" on public.cards for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "mes téléchargements" on public.user_downloads for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ma liste" on public.user_list for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "mon historique" on public.watch_history for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "lire commentaires" on public.anime_comments for select to authenticated using (true);
create policy "écrire commentaire" on public.anime_comments for insert to authenticated with check (user_id = auth.uid());
create policy "supprimer son commentaire" on public.anime_comments for delete to authenticated using (user_id = auth.uid() or public.is_staff());
create policy "lire questions" on public.quiz_questions for select to authenticated using (active);
create policy "admin questions" on public.quiz_questions for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Duels : visibles et modifiables seulement par les deux participants
create policy "voir mes duels" on public.duels for select to authenticated using (auth.uid() in (challenger_id, opponent_id));
create policy "lancer un défi" on public.duels for insert to authenticated with check (challenger_id = auth.uid() and status = 'pending');
create policy "répondre / jouer" on public.duels for update to authenticated using (auth.uid() in (challenger_id, opponent_id));

-- Communautés
create policy "lire communautés" on public.communities for select to authenticated using (true);
create policy "créer communauté" on public.communities for insert to authenticated with check (created_by = auth.uid());
create policy "lire membres" on public.community_members for select to authenticated using (true);
create policy "rejoindre" on public.community_members for insert to authenticated with check (user_id = auth.uid() and role = 'member');
create policy "quitter" on public.community_members for delete to authenticated using (user_id = auth.uid());
create policy "lire événements" on public.events for select to authenticated using (true);
create policy "créer événement" on public.events for insert to authenticated with check (public.is_staff());
create policy "lire messages" on public.messages for select to authenticated using (
  exists(select 1 from public.community_members m where m.community_id = messages.community_id and m.user_id = auth.uid()));
create policy "écrire message" on public.messages for insert to authenticated with check (
  user_id = auth.uid() and exists(select 1 from public.community_members m where m.community_id = messages.community_id and m.user_id = auth.uid()));
create policy "lire statuts" on public.stories for select to authenticated using (expires_at > now());
create policy "publier statut" on public.stories for insert to authenticated with check (user_id = auth.uid());
create policy "lire sondages" on public.polls for select to authenticated using (true);
create policy "créer sondage" on public.polls for insert to authenticated with check (created_by = auth.uid());
create policy "lire options" on public.poll_options for select to authenticated using (true);
create policy "créer options" on public.poll_options for insert to authenticated with check (
  exists(select 1 from public.polls p where p.id = poll_id and p.created_by = auth.uid()));
create policy "lire votes" on public.poll_votes for select to authenticated using (true);
create policy "voter" on public.poll_votes for insert to authenticated with check (user_id = auth.uid());

-- Badges, notifications, signalements
create policy "lire badges" on public.badges for select to authenticated using (true);
create policy "lire badges obtenus" on public.user_badges for select to authenticated using (true);
create policy "mes notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "marquer lue" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "signaler" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "voir signalements" on public.reports for select to authenticated using (public.is_staff());
create policy "traiter signalements" on public.reports for update to authenticated using (public.is_staff());

-- ========== TEMPS RÉEL ==========
alter publication supabase_realtime add table public.messages, public.events, public.duels, public.polls, public.poll_votes, public.stories, public.notifications;

-- ========== DONNÉES DE DÉPART ==========
insert into public.badges (code, name, description) values
 ('guerrier','Guerrier','10 victoires RIVALIS'),('invincible','Invincible','10 victoires consécutives'),
 ('immortel','Immortel','25 victoires consécutives'),('encyclopedie','Encyclopédie','1 000 réponses correctes'),
 ('explorateur','Explorateur','100 œuvres découvertes'),('roi_cameroun','Roi du Cameroun','1er du classement national');
insert into public.quiz_questions (question, answers, correct_index, difficulty) values
 ('Quel est le rêve de Luffy ?','["Devenir Roi des Pirates","Devenir Hokage","Devenir Roi Mage","Devenir Hunter"]',0,'facile'),
 ('Qui est le héros de Solo Leveling ?','["Sung Jin-woo","Asta","Yuji Itadori","Tanjiro"]',0,'facile'),
 ('Dans Black Clover, Asta n''a pas de…','["Magie","Épée","Famille","Amis"]',0,'normal'),
 ('Quel studio a animé Demon Slayer ?','["Ufotable","MAPPA","Bones","Pierrot"]',0,'normal'),
 ('Quel village est celui de Naruto ?','["Konoha","Suna","Kiri","Iwa"]',0,'facile');
insert into public.communities (name, description) values
 ('Solo Leveling FR','Discussions autour de Solo Leveling'),('Otakus du Cameroun','La communauté otaku camerounaise'),
 ('Black Clover Fans','Tout sur Black Clover'),('Manga Collectors','Collectionneurs de mangas');

-- Pour te donner le rôle admin après ton inscription :
-- update public.profiles set role = 'admin' where username = 'TON_PSEUDO';

-- ========== AJOUT : visibilité des cartes Otaku et demandes d'accès ==========
create table public.card_access (
  owner_id uuid not null references public.profiles on delete cascade,
  viewer_id uuid not null references public.profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','refused')),
  created_at timestamptz not null default now(),
  primary key (owner_id, viewer_id)
);
alter table public.card_access enable row level security;
create policy "voir mes demandes" on public.card_access for select to authenticated using (auth.uid() in (owner_id, viewer_id));
create policy "demander l'accès" on public.card_access for insert to authenticated with check (viewer_id = auth.uid() and status = 'pending');
create policy "répondre à une demande" on public.card_access for update to authenticated using (owner_id = auth.uid());
-- Remplace la règle de lecture des cartes : publique, ou acceptée, ou la sienne
create policy "lire cartes" on public.cards for select to authenticated using (
  user_id = auth.uid() or (published and visibility = 'publique')
  or (published and visibility = 'sur_demande' and exists(select 1 from public.card_access a where a.owner_id = cards.user_id and a.viewer_id = auth.uid() and a.status = 'accepted')));
alter publication supabase_realtime add table public.card_access;


-- ========== POLITIQUES : MAHJONG, MANGAS, QUÊTES ==========
create policy "voir scores mahjong" on public.mahjong_scores for select to authenticated using (
  exists(select 1 from public.duels d where d.id = duel_id and auth.uid() in (d.challenger_id, d.opponent_id)));
create policy "enregistrer mon score" on public.mahjong_scores for insert to authenticated with check (
  user_id = auth.uid() and exists(select 1 from public.duels d where d.id = duel_id and d.status = 'approved' and auth.uid() in (d.challenger_id, d.opponent_id)));
create policy "ma bibliothèque manga" on public.manga_library for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "lire accès lecture" on public.manga_reading for select to authenticated using (enabled or public.is_staff());
create policy "admin accès lecture" on public.manga_reading for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "ma progression" on public.daily_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
alter publication supabase_realtime add table public.mahjong_scores;
