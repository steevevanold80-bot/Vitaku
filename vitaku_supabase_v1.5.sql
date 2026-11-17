-- VITAKU v1.5 : à lancer APRÈS vitaku_supabase.sql (Supabase > SQL Editor > New query > coller > Run). Peut être relancé sans risque.

-- 1. Données personnelles synchronisées (liste, téléchargements, réglages…)
create table if not exists public.user_data (user_id uuid not null references public.profiles on delete cascade, key text not null, value jsonb, updated_at timestamptz not null default now(), primary key (user_id, key));
alter table public.user_data enable row level security;
drop policy if exists "mes données" on public.user_data;
create policy "mes données" on public.user_data for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2. Communauté façon WhatsApp : groupes (privés) et mini-communautés (publiques)
alter table public.communities drop constraint if exists communities_name_key;
alter table public.communities add column if not exists kind text not null default 'group' check (kind in ('group','community'));
update public.communities set kind = 'community' where created_by is null;
create or replace function public.add_owner() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into public.community_members (community_id, user_id, role) values (new.id, new.created_by, 'owner') on conflict do nothing; return new; end $$;
drop trigger if exists communities_owner on public.communities;
create trigger communities_owner after insert on public.communities for each row execute function public.add_owner();
drop policy if exists "lire communautés" on public.communities;
create policy "lire communautés" on public.communities for select to authenticated using (kind = 'community' or created_by = auth.uid() or exists(select 1 from public.community_members m where m.community_id = communities.id and m.user_id = auth.uid()));
drop policy if exists "ajouter un membre" on public.community_members;
create policy "ajouter un membre" on public.community_members for insert to authenticated with check (exists(select 1 from public.community_members m where m.community_id = community_members.community_id and m.user_id = auth.uid() and m.role in ('owner','moderator')));
drop policy if exists "supprimer son statut" on public.stories;
create policy "supprimer son statut" on public.stories for delete to authenticated using (user_id = auth.uid());

-- 3. Discussions privées (1 à 1)
create table if not exists public.dm_messages (id uuid primary key default gen_random_uuid(), sender_id uuid not null references public.profiles on delete cascade, receiver_id uuid not null references public.profiles on delete cascade, body text not null check (char_length(body) between 1 and 2000), created_at timestamptz not null default now());
create index if not exists dm_idx on public.dm_messages (sender_id, receiver_id, created_at);
alter table public.dm_messages enable row level security;
drop policy if exists "lire mes messages privés" on public.dm_messages; create policy "lire mes messages privés" on public.dm_messages for select to authenticated using (auth.uid() in (sender_id, receiver_id));
drop policy if exists "écrire message privé" on public.dm_messages; create policy "écrire message privé" on public.dm_messages for insert to authenticated with check (sender_id = auth.uid());

-- 4. Événements : tout le monde peut en publier
alter table public.events add column if not exists category text not null default 'Autre';
alter table public.events add column if not exists description text;
drop policy if exists "créer événement" on public.events; create policy "créer événement" on public.events for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "supprimer son événement" on public.events; create policy "supprimer son événement" on public.events for delete to authenticated using (created_by = auth.uid() or public.is_staff());

-- 5. Chaînes et publications façon TikTok
create table if not exists public.channels (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles on delete cascade, name text not null check (char_length(name) between 2 and 40), description text, created_at timestamptz not null default now());
create unique index if not exists channels_name_idx on public.channels (lower(name));
create table if not exists public.channel_follows (channel_id uuid references public.channels on delete cascade, user_id uuid references public.profiles on delete cascade, primary key (channel_id, user_id));
create table if not exists public.posts (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade, channel_id uuid references public.channels on delete set null, event_id uuid references public.events on delete set null,
  kind text not null default 'post' check (kind in ('post','podcast','streaming','live','montage','playlist')), title text not null check (char_length(title) between 1 and 120), body text, url text, media_url text, media_type text, created_at timestamptz not null default now());
create index if not exists posts_idx on public.posts (created_at desc);
create table if not exists public.post_likes (post_id uuid references public.posts on delete cascade, user_id uuid references public.profiles on delete cascade, primary key (post_id, user_id));
create table if not exists public.post_favs (post_id uuid references public.posts on delete cascade, user_id uuid references public.profiles on delete cascade, primary key (post_id, user_id));
create table if not exists public.post_comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts on delete cascade, user_id uuid not null references public.profiles on delete cascade, body text not null check (char_length(body) between 1 and 500), created_at timestamptz not null default now());
do $$ declare t text; begin foreach t in array array['channels','channel_follows','posts','post_likes','post_favs','post_comments'] loop execute format('alter table public.%I enable row level security', t); end loop; end $$;
drop policy if exists "lire chaînes" on public.channels; create policy "lire chaînes" on public.channels for select to authenticated using (true);
drop policy if exists "créer chaîne" on public.channels; create policy "créer chaîne" on public.channels for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "gérer sa chaîne" on public.channels; create policy "gérer sa chaîne" on public.channels for delete to authenticated using (owner_id = auth.uid() or public.is_staff());
drop policy if exists "lire abonnements" on public.channel_follows; create policy "lire abonnements" on public.channel_follows for select to authenticated using (true);
drop policy if exists "suivre" on public.channel_follows; create policy "suivre" on public.channel_follows for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "ne plus suivre" on public.channel_follows; create policy "ne plus suivre" on public.channel_follows for delete to authenticated using (user_id = auth.uid());
drop policy if exists "lire publications" on public.posts; create policy "lire publications" on public.posts for select to authenticated using (true);
drop policy if exists "publier" on public.posts; create policy "publier" on public.posts for insert to authenticated with check (user_id = auth.uid() and (channel_id is null or exists(select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())));
drop policy if exists "supprimer sa publication" on public.posts; create policy "supprimer sa publication" on public.posts for delete to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists "lire likes" on public.post_likes; create policy "lire likes" on public.post_likes for select to authenticated using (true);
drop policy if exists "liker" on public.post_likes; create policy "liker" on public.post_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "retirer like" on public.post_likes; create policy "retirer like" on public.post_likes for delete to authenticated using (user_id = auth.uid());
drop policy if exists "mes favoris" on public.post_favs; create policy "mes favoris" on public.post_favs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "lire commentaires publications" on public.post_comments; create policy "lire commentaires publications" on public.post_comments for select to authenticated using (true);
drop policy if exists "commenter publication" on public.post_comments; create policy "commenter publication" on public.post_comments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "supprimer son commentaire publication" on public.post_comments; create policy "supprimer son commentaire publication" on public.post_comments for delete to authenticated using (user_id = auth.uid() or public.is_staff());

-- 6. Stockage des photos / vidéos des publications (50 Mo max par fichier)
insert into storage.buckets (id, name, public, file_size_limit) values ('posts', 'posts', true, 52428800) on conflict (id) do nothing;
drop policy if exists "lire médias" on storage.objects; create policy "lire médias" on storage.objects for select using (bucket_id = 'posts');
drop policy if exists "envoyer médias" on storage.objects; create policy "envoyer médias" on storage.objects for insert to authenticated with check (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);

-- 7. Temps réel
do $$ declare t text; begin foreach t in array array['dm_messages','posts','post_comments','post_likes','channels','channel_follows','communities','community_members'] loop
  begin execute format('alter publication supabase_realtime add table public.%I', t); exception when duplicate_object then null; end; end loop; end $$;
