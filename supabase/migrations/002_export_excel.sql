-- Export pentru Excel.
--
-- Răspunsurile stau în `answers` (jsonb), ca să putem schimba întrebările fără
-- migrări. Dar jsonb nu se citește în Excel, așa că vederea de mai jos îl
-- desface în coloane cu nume în română, o linie per om. În Supabase:
--   Table Editor -> feedback_intern_21_excel -> Export -> CSV
-- și se deschide direct în Excel (CSV cu virgulă, UTF-8).
--
-- Când adaugi o întrebare în src/data/questions.ts, adaugă și o coloană aici.

-- ── Ajutoare ──────────────────────────────────────────────────────────────

-- Listele scurte (de păstrat / de schimbat / topul) devin un singur text,
-- despărțit cu " | ", în ordinea în care au fost scrise.
create or replace function public.ii_list(v jsonb)
returns text language sql immutable as $$
  select case when jsonb_typeof(v) = 'array' then (
    select nullif(string_agg(trim(t.x), ' | ' order by t.ord), '')
    from jsonb_array_elements_text(v) with ordinality as t(x, ord)
    where trim(t.x) <> ''
  ) end
$$;

-- Nota dată unei zone în grilă. Numeric, ca să se poată face medii în Excel;
-- "n-am văzut" iese null aici și apare în coloana cu zonele nevăzute.
create or replace function public.ii_nota(v jsonb, zona text)
returns smallint language sql immutable as $$
  select case
    when jsonb_typeof(v -> 'grila' -> zona) = 'number'
    then (v -> 'grila' ->> zona)::smallint
  end
$$;

-- Zonele pe care omul a marcat explicit "n-am văzut".
create or replace function public.ii_nevazute(v jsonb)
returns text language sql immutable as $$
  select case when jsonb_typeof(v -> 'grila') = 'object' then (
    select nullif(string_agg(k, ', ' order by k), '')
    from jsonb_each(v -> 'grila') as g(k, val)
    where val = '"nu"'::jsonb
  ) end
$$;

-- ── Vederea ───────────────────────────────────────────────────────────────
-- security_invoker: vederea respectă RLS-ul tabelului, deci cheia publică
-- (anon) NU poate citi prin ea. Fără asta, o vedere citește cu drepturile
-- proprietarului și ar expune tot feedbackul.
create or replace view public.feedback_intern_21_excel
with (security_invoker = true) as
select
  to_char(f.created_at at time zone 'Europe/Bucharest', 'DD.MM.YYYY HH24:MI') as "Trimis la",
  coalesce(f.nume, '(anonim)')                    as "Nume",
  f.rol                                           as "Rol",
  f.editii                                        as "A câta ediție",
  array_to_string(f.zone, ', ')                   as "Zone bifate",
  f.answers ->> 'zone_altele'                     as "Altă zonă bifată",

  -- cum a trecut prin festival
  public.ii_list(f.answers -> 'stare_cuvinte')    as "Cum s-a simțit",
  f.answers ->> 'moment_bun'                      as "Moment bun",
  f.answers ->> 'moment_greu'                     as "Moment greu",
  f.scala_sustinere                               as "Sprijin 1-5",
  f.scala_epuizare                                as "Energie la final 1-5",
  f.revenire                                      as "Revine la #22",

  -- rolul lui
  f.scala_claritate                               as "Claritate roluri 1-5",
  f.answers ->> 'claritate_de_ce'                 as "De ce nota la claritate",
  f.answers ->> 'lipsit'                          as "Ce i-a lipsit",

  -- flow și program
  f.answers ->> 'suprapuneri_triaj'               as "Suprapuneri: ce păstrăm, ce separăm",
  f.scala_comunicare                              as "Comunicare în timp real 1-5",
  f.answers ->> 'comunicare'                      as "Ce ar schimba la comunicarea internă",

  -- Piața
  public.ii_list(f.answers -> 'piata_keep')       as "Piața: de păstrat",
  public.ii_list(f.answers -> 'piata_change')     as "Piața: de schimbat",
  f.answers ->> 'piata_context'                   as "Piața: altele",

  -- trupele
  public.ii_list(f.answers -> 'trupe_keep')       as "Trupe: de păstrat",
  public.ii_list(f.answers -> 'trupe_change')     as "Trupe: de schimbat",
  f.answers ->> 'trupe_context'                   as "Trupe: ce le-a lipsit",

  -- atelierele
  public.ii_list(f.answers -> 'ateliere_keep')    as "Ateliere: de păstrat",
  public.ii_list(f.answers -> 'ateliere_change')  as "Ateliere: de schimbat",
  f.answers ->> 'ateliere_context'                as "Ateliere: altele",

  -- invitați, mentori, juriu
  public.ii_list(f.answers -> 'invitati_keep')    as "Invitați: de păstrat",
  public.ii_list(f.answers -> 'invitati_change')  as "Invitați: de schimbat",
  f.answers ->> 'invitati_context'                as "Invitați: a fost clar ce se aștepta",

  -- evenimentul lui
  f.answers ->> 'ev_care'                         as "Evenimentul lui: care",
  public.ii_list(f.answers -> 'ev_keep')          as "Evenimentul lui: de păstrat",
  public.ii_list(f.answers -> 'ev_change')        as "Evenimentul lui: de schimbat",
  f.answers ->> 'ev_context'                      as "Evenimentul lui: de ce are nevoie",

  -- comunicare și promovare
  public.ii_list(f.answers -> 'com_keep')         as "Comunicare: de păstrat",
  public.ii_list(f.answers -> 'com_change')       as "Comunicare: de schimbat",
  f.answers ->> 'com_context'                     as "Comunicare: a primit la timp ce trebuia",

  -- voluntari
  public.ii_list(f.answers -> 'vol_keep')         as "Voluntari: de păstrat",
  public.ii_list(f.answers -> 'vol_change')       as "Voluntari: de schimbat",
  f.answers ->> 'vol_context'                     as "Voluntari: destui și pregătiți",

  -- parteneri și finanțare
  public.ii_list(f.answers -> 'part_keep')        as "Parteneri: de păstrat",
  public.ii_list(f.answers -> 'part_change')      as "Parteneri: de schimbat",
  f.answers ->> 'part_context'                    as "Parteneri: promis vs livrat",

  -- orașul
  public.ii_list(f.answers -> 'oras_keep')        as "Oraș: de păstrat",
  public.ii_list(f.answers -> 'oras_change')      as "Oraș: de schimbat",
  f.answers ->> 'oras_context'                    as "Oraș: relația cu instituțiile",

  -- locații și logistică
  public.ii_list(f.answers -> 'loc_keep')         as "Locații: de păstrat",
  public.ii_list(f.answers -> 'loc_change')       as "Locații: de schimbat",
  f.answers ->> 'loc_context'                     as "Locații: ce spațiu a lipsit",
  f.scala_logistica                               as "Logistică 1-5",

  -- oameni și echipă
  f.answers ->> 'efort'                           as "Supraîncărcați / subfolosiți",
  f.answers ->> 'departamente'                    as "Unde s-a rupt între departamente",
  f.answers ->> 'crescut'                         as "Cine a crescut",

  -- notele pe zone
  public.ii_nota(f.answers, 'trupe')              as "Notă trupe",
  public.ii_nota(f.answers, 'piata')              as "Notă Piața",
  public.ii_nota(f.answers, 'ateliere')           as "Notă ateliere",
  public.ii_nota(f.answers, 'gale')               as "Notă gale",
  public.ii_nota(f.answers, 'invitati')           as "Notă invitați",
  public.ii_nota(f.answers, 'evenimente')         as "Notă evenimente conexe",
  public.ii_nota(f.answers, 'locatii')            as "Notă locații",
  public.ii_nota(f.answers, 'logistica')          as "Notă logistică",
  public.ii_nota(f.answers, 'comunicare')         as "Notă comunicare",
  public.ii_nota(f.answers, 'voluntari')          as "Notă voluntari",
  public.ii_nota(f.answers, 'parteneri')          as "Notă parteneri",
  public.ii_nota(f.answers, 'oras')               as "Notă oraș",
  public.ii_nota(f.answers, 'cazare')             as "Notă cazare și masă",
  public.ii_nota(f.answers, 'coordonare')         as "Notă coordonare internă",
  public.ii_nota(f.answers, 'atmosfera')          as "Notă atmosferă",
  public.ii_nevazute(f.answers)                   as "Zone pe care nu le-a văzut",
  f.answers ->> 'zona_lipsa'                      as "Zonă care lipsea din listă",

  -- ce schimbăm la #22
  nullif(trim(f.answers -> 'top3' ->> 0), '')     as "Top 1",
  nullif(trim(f.answers -> 'top3' ->> 1), '')     as "Top 2",
  nullif(trim(f.answers -> 'top3' ->> 2), '')     as "Top 3",
  f.answers ->> 'idee'                            as "Idee nouă",

  -- final
  f.scala_general                                 as "Mulțumire generală 1-5",
  f.answers ->> 'recomanzi'                       as "Recomandă în echipa principală",
  f.answers ->> 'orice'                           as "Altceva",

  array_to_string(f.sectiuni, ', ')               as "Secțiuni primite",
  f.id                                            as "id"
from public.feedback_intern_21 f
order by f.created_at;

comment on view public.feedback_intern_21_excel is
  'Feedback #21 desfăcut în coloane, pentru export CSV / Excel. O linie per om.';

-- Cheia publică nu are ce citi aici.
revoke all on public.feedback_intern_21_excel from anon;
