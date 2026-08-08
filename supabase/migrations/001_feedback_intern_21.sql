-- feedback_intern_21: feedbackul echipei interne după festivalul ideo ideis #21.
-- Un rând per formular trimis.
--
-- De ce jsonb: întrebările se schimbă de la o ediție la alta, iar textul lor
-- stă în src/data/questions.ts. Ca să nu fie nevoie de o migrare la fiecare
-- reformulare, toate răspunsurile intră în `answers` (cheia = id-ul întrebării
-- din questions.ts). Coloanele separate există doar pentru ce filtrăm sau
-- mediem. Pentru citit în Excel, vezi 002_export_excel.sql.
--
-- Nu cerem rolul: rolul din structura echipei ("Coord. Ateliere") e un singur
-- om, deci ar face degeaba numele opțional. Departamentul e un grup.
create table if not exists public.feedback_intern_21 (
  id uuid primary key default gen_random_uuid(),

  nume text,                       -- opțional: se poate completa anonim
  departament text,                -- Board | Artistic | Welcoming | Comunicare |
                                   -- Tehnic | Producție | Financiar | Website |
                                   -- prefer să nu spun
  editii text,                     -- 'prima' | 'a doua' | 'a treia' | 'mai multe'

  -- zonele despre care a dat feedback detaliat, în pagina opțională
  zone text[] not null default '{}',
  sectiuni text[] not null default '{}',

  -- 'da' | 'da, dar în alt rol' | 'nu știu încă' | 'probabil nu'
  -- Cel mai bun indicator agregat pentru cum a fost de fapt în echipă.
  revenire text,

  -- scalele 1 la 5 (null dacă persoana a sărit peste)
  scala_claritate smallint check (scala_claritate between 1 and 5),
  scala_program smallint check (scala_program between 1 and 5),
  scala_sustinere smallint check (scala_sustinere between 1 and 5),
  scala_epuizare smallint check (scala_epuizare between 1 and 5),
  scala_general smallint check (scala_general between 1 and 5),

  -- toate răspunsurile, inclusiv cele de mai sus și grilele de diagnostic
  answers jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

comment on table public.feedback_intern_21 is
  'Feedback echipă internă, ideo ideis #21. Întrebările sunt în repo: src/data/questions.ts';

-- RLS: formularul public poate INSERA, doar utilizatorii autentificați pot CITI.
alter table public.feedback_intern_21 enable row level security;

drop policy if exists "Anyone can insert feedback intern 21" on public.feedback_intern_21;
create policy "Anyone can insert feedback intern 21"
  on public.feedback_intern_21 for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated can read feedback intern 21" on public.feedback_intern_21;
create policy "Authenticated can read feedback intern 21"
  on public.feedback_intern_21 for select
  to authenticated
  using (true);

-- Drepturile de tabel, pe lângă politici. Supabase le dă implicit la tabelele
-- noi, dar dacă proiectul a fost configurat altfel, formularul ar primi
-- "permission denied" chiar și cu politica de mai sus. Costă nimic să fim expliciți.
grant insert on public.feedback_intern_21 to anon, authenticated;
grant select on public.feedback_intern_21 to authenticated;

create index if not exists feedback_intern_21_created_at_idx
  on public.feedback_intern_21 (created_at desc);

-- Verificare, la finalul rulării: dacă lipsește politica de inserare, nimeni nu
-- poate trimite formularul, iar eroarea se vede abia când apeși "trimite".
do $$
declare n int;
begin
  select count(*) into n from pg_policies
  where schemaname = 'public' and tablename = 'feedback_intern_21' and cmd = 'INSERT';
  if n = 0 then
    raise exception 'Politica de INSERT lipsește: formularul nu ar putea trimite nimic.';
  end if;
  raise notice 'OK: % politici de inserare, formularul poate trimite.', n;
end $$;
