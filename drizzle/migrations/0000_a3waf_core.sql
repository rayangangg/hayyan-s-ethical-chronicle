-- Roles
create type public.app_role as enum ('admin', 'editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create policy "own roles readable" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Field Note',
  summary text not null default '',
  content text not null default '',
  cover_url text,
  tags text[] not null default '{}',
  published boolean not null default false,
  views integer not null default 0,
  author_name text not null default 'Hayyan Da Edistein',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_created_idx on public.posts (published, created_at desc);

grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;

create policy "published posts are public" on public.posts
for select to anon using (published = true);

create policy "admins read all posts" on public.posts
for select to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor') or published = true);

create policy "admins insert posts" on public.posts
for insert to authenticated with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "admins update posts" on public.posts
for update to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "admins delete posts" on public.posts
for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Risk reports
create table public.risk_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_name text not null,
  reporter_email text not null,
  affected_system text not null,
  details text not null,
  severity text not null default 'medium',
  status text not null default 'new',
  admin_notes text not null default '',
  created_at timestamptz not null default now()
);

grant insert on public.risk_reports to anon;
grant select, insert, update, delete on public.risk_reports to authenticated;
grant all on public.risk_reports to service_role;
alter table public.risk_reports enable row level security;

create policy "anyone can submit a report" on public.risk_reports
for insert to anon with check (true);

create policy "authenticated can submit a report" on public.risk_reports
for insert to authenticated with check (true);

create policy "admins read reports" on public.risk_reports
for select to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "admins update reports" on public.risk_reports
for update to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "admins delete reports" on public.risk_reports
for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Visitor counter
create table public.page_views (
  id bigserial primary key,
  path text not null default '/',
  viewed_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index page_views_day_idx on public.page_views (viewed_on);

grant select on public.page_views to authenticated;
grant all on public.page_views to service_role;
alter table public.page_views enable row level security;

create policy "admins read page views" on public.page_views
for select to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create or replace function public.record_visit(p_path text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare total bigint;
begin
  insert into public.page_views (path) values (coalesce(nullif(trim(p_path), ''), '/'));
  select count(*) into total from public.page_views;
  return total;
end;
$$;

grant execute on function public.record_visit(text) to anon, authenticated;

create or replace function public.visit_total()
returns bigint
language sql
stable
security definer
set search_path = public
as $$ select count(*) from public.page_views; $$;

grant execute on function public.visit_total() to anon, authenticated;

create or replace function public.bump_post_views(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$ update public.posts set views = views + 1 where slug = p_slug and published = true; $$;

grant execute on function public.bump_post_views(text) to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger posts_touch_updated before update on public.posts
for each row execute function public.touch_updated_at();

-- Seed dispatches
insert into public.posts (slug, title, category, summary, content, published, tags) values
('login-boundary-becomes-suggestion', 'When a Login Boundary Becomes a Suggestion', 'Disclosure', 'A redacted field report on authorization drift, careful verification, and a disclosure completed without retaining user data.', 'A routine review of a public portal showed that a session check was applied on the interface but never on the data path behind it. We verified the finding with a single request, captured no records, and wrote to the owner the same day.

The fix took the team four hours. We published nothing until it shipped. This is the shape of most of our work: quiet, small, and reversible.', true, array['responsible disclosure','authorization','a3waf']),
('ethics-of-the-uninvited-guest', 'The Ethics of the Uninvited Guest', 'Ethics', 'Where gray-hat research must stop, why proof should be minimal, and how awareness can replace spectacle.', 'Gray-hat work lives in a narrow corridor. You are not invited, yet you are not there to take. The discipline is knowing the exact moment to stop: the instant a weakness is proven, the work becomes a letter, not an exploit.

We do not sell data. We do not keep it. We forget whom we just helped.', true, array['ethical hacking','gray hat','awareness']),
('no-trophy-no-dataset', 'No Trophy, No Dataset, No Customer List', 'Field Note', 'Our plain-language standard for documenting risk while leaving private information untouched.', 'Every A3WAF note follows the same template: what was reachable, what it would cost the owner, what we did not touch, and how to repair it. Screenshots are cropped. Identifiers are removed. Nothing leaves the report.', true, array['field note','security research','a3waf']);
