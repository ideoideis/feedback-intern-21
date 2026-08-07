-- Export pentru Excel.
--
-- Răspunsurile stau în `answers` (jsonb), ca să putem schimba întrebările fără
-- migrări. Dar jsonb nu se citește în Excel, așa că vederea de mai jos îl
-- desface în coloane cu nume în română, o linie per om. În Supabase:
--   Table Editor -> feedback_intern_21_excel -> Export -> CSV
-- și se deschide direct în Excel (UTF-8).
--
-- Fișierul se poate rula de câte ori vrei: nu strică nimic din ce există.
-- Când adaugi o întrebare în src/data/questions.ts, adaugă și o coloană aici.

-- ── Coloane adăugate după prima versiune a tabelului ──────────────────────
alter table public.feedback_intern_21 add column if not exists departament text;
alter table public.feedback_intern_21 add column if not exists scala_productie smallint;

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
drop view if exists public.feedback_intern_21_excel;
create view public.feedback_intern_21_excel
with (security_invoker = true) as
select
  to_char(f.created_at at time zone 'Europe/Bucharest', 'DD.MM.YYYY HH24:MI') as "Trimis la",
  coalesce(f.nume, '(anonim)')                    as "Nume",
  f.departament                                   as "Departament",
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

  -- evenimente outdoor și Piața
  public.ii_list(f.answers -> 'outdoor_keep')     as "Outdoor: de păstrat",
  public.ii_list(f.answers -> 'outdoor_change')   as "Outdoor: de schimbat",
  f.answers ->> 'outdoor_context'                 as "Outdoor: public și suprapuneri",

  -- evenimente indoor și gale
  public.ii_list(f.answers -> 'indoor_keep')      as "Indoor: de păstrat",
  public.ii_list(f.answers -> 'indoor_change')    as "Indoor: de schimbat",
  f.answers ->> 'indoor_context'                  as "Indoor: săli, public, program",

  -- ateliere
  public.ii_list(f.answers -> 'ateliere_keep')    as "Ateliere: de păstrat",
  public.ii_list(f.answers -> 'ateliere_change')  as "Ateliere: de schimbat",
  f.answers ->> 'ateliere_context'                as "Ateliere: altele",

  -- trupe și participanți
  public.ii_list(f.answers -> 'trupe_keep')       as "Trupe: de păstrat",
  public.ii_list(f.answers -> 'trupe_change')     as "Trupe: de schimbat",
  f.answers ->> 'trupe_context'                   as "Trupe: ce le-a lipsit",

  -- comunitate și murale
  public.ii_list(f.answers -> 'comunitate_keep')   as "Comunitate: de păstrat",
  public.ii_list(f.answers -> 'comunitate_change') as "Comunitate: de schimbat",
  f.answers ->> 'comunitate_context'               as "Comunitate: ce a rămas în oraș",

  -- scenografie
  public.ii_list(f.answers -> 'scenografie_keep')   as "Scenografie: de păstrat",
  public.ii_list(f.answers -> 'scenografie_change') as "Scenografie: de schimbat",
  f.answers ->> 'scenografie_context'               as "Scenografie: de la desen la montat",

  -- tehnic
  public.ii_list(f.answers -> 'tehnic_keep')      as "Tehnic: de păstrat",
  public.ii_list(f.answers -> 'tehnic_change')    as "Tehnic: de schimbat",
  f.answers ->> 'tehnic_context'                  as "Tehnic: unde am fost pe muchie",

  -- producție și achiziții
  f.scala_productie                               as "Producție 1-5",
  public.ii_list(f.answers -> 'productie_keep')   as "Producție: de păstrat",
  public.ii_list(f.answers -> 'productie_change') as "Producție: de schimbat",
  f.answers ->> 'productie_context'               as "Producție: cumpărat târziu sau degeaba",

  -- cazări, mese, welcome packs
  public.ii_list(f.answers -> 'cazari_keep')      as "Cazări și mese: de păstrat",
  public.ii_list(f.answers -> 'cazari_change')    as "Cazări și mese: de schimbat",
  f.answers ->> 'cazari_context'                  as "Cazări și mese: nemulțumiri",

  -- transporturi
  public.ii_list(f.answers -> 'transport_keep')   as "Transporturi: de păstrat",
  public.ii_list(f.answers -> 'transport_change') as "Transporturi: de schimbat",
  f.answers ->> 'transport_context'               as "Transporturi: ce a mers prost",

  -- voluntari
  public.ii_list(f.answers -> 'voluntari_keep')   as "Voluntari: de păstrat",
  public.ii_list(f.answers -> 'voluntari_change') as "Voluntari: de schimbat",
  f.answers ->> 'voluntari_context'               as "Voluntari: destui și pregătiți",

  -- comunicare și promovare
  public.ii_list(f.answers -> 'com_keep')         as "Comunicare: de păstrat",
  public.ii_list(f.answers -> 'com_change')       as "Comunicare: de schimbat",
  f.answers ->> 'com_context'                     as "Comunicare: a primit la timp ce trebuia",

  -- foto și video
  public.ii_list(f.answers -> 'fotovideo_keep')   as "Foto-video: de păstrat",
  public.ii_list(f.answers -> 'fotovideo_change') as "Foto-video: de schimbat",
  f.answers ->> 'fotovideo_context'               as "Foto-video: acces și informații",

  -- finanțări și sponsorizări
  public.ii_list(f.answers -> 'financiar_keep')   as "Financiar: de păstrat",
  public.ii_list(f.answers -> 'financiar_change') as "Financiar: de schimbat",
  f.answers ->> 'financiar_context'               as "Financiar: promis vs livrat",

  -- website și ticketing
  public.ii_list(f.answers -> 'website_keep')     as "Website: de păstrat",
  public.ii_list(f.answers -> 'website_change')   as "Website: de schimbat",
  f.answers ->> 'website_context'                 as "Website: ce ar trebui să facă",

  -- oameni și echipă
  f.answers ->> 'efort'                           as "Supraîncărcați / subfolosiți",
  f.answers ->> 'departamente'                    as "Unde s-a rupt între departamente",
  f.answers ->> 'crescut'                         as "Cine a crescut",

  -- notele pe zone
  public.ii_nota(f.answers, 'trupe')              as "Notă trupe",
  public.ii_nota(f.answers, 'outdoor')            as "Notă outdoor",
  public.ii_nota(f.answers, 'indoor')             as "Notă indoor",
  public.ii_nota(f.answers, 'ateliere')           as "Notă ateliere",
  public.ii_nota(f.answers, 'comunitate')         as "Notă comunitate",
  public.ii_nota(f.answers, 'scenografie')        as "Notă scenografie",
  public.ii_nota(f.answers, 'tehnic')             as "Notă tehnic",
  public.ii_nota(f.answers, 'productie')          as "Notă producție",
  public.ii_nota(f.answers, 'cazari')             as "Notă cazări și mese",
  public.ii_nota(f.answers, 'transport')          as "Notă transporturi",
  public.ii_nota(f.answers, 'voluntari')          as "Notă voluntari",
  public.ii_nota(f.answers, 'comunicare')         as "Notă comunicare",
  public.ii_nota(f.answers, 'financiar')          as "Notă financiar",
  public.ii_nota(f.answers, 'website')            as "Notă website",
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
