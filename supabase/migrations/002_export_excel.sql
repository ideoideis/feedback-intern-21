-- Export pentru Excel, plus reparațiile de schemă.
--
-- Răspunsurile stau în `answers` (jsonb), ca să putem schimba întrebările fără
-- migrări. Dar jsonb nu se citește în Excel, așa că vederea de mai jos îl
-- desface în coloane cu nume în română, o linie per om. În Supabase:
--   Table Editor -> feedback_intern_21_excel -> Export -> CSV
-- și se deschide direct în Excel (UTF-8).
--
-- Fișierul se poate rula de câte ori vrei, inclusiv peste un tabel creat cu o
-- versiune mai veche din 001: adaugă ce lipsește și nu strică nimic.
-- Când adaugi o întrebare în src/data/questions.ts, adaugă și o coloană aici.

-- ── Reparații de schemă, pentru tabelele create înainte ────────────────────
alter table public.feedback_intern_21 add column if not exists departament text;
alter table public.feedback_intern_21 add column if not exists scala_program smallint;
-- zonele despre care omul a intrat în detaliu, dintre cele bifate
alter table public.feedback_intern_21 add column if not exists zone_deep text[] default '{}';

-- Rolul nu se mai cere (identifica exact o persoană). Dacă tabelul a fost creat
-- cu `rol not null`, inserările ar eșua, așa că scoatem constrângerea.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'feedback_intern_21' and column_name = 'rol'
  ) then
    execute 'alter table public.feedback_intern_21 alter column rol drop not null';
  end if;
end $$;

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

-- O celulă din grila de diagnostic: "a fost ok", "pe muchie" sau "a lipsit".
create or replace function public.ii_diag(v jsonb, zona text, dim text)
returns text language sql immutable as $$
  select case v -> (zona || '_diag') ->> dim
    when 'ok'     then 'a fost ok'
    when 'muchie' then 'pe muchie'
    when 'lipsa'  then 'a lipsit'
  end
$$;

-- Grila unei direcții, pe un rând: "oameni: ok · timp: pe muchie · ...".
-- Util când vrei să vezi tot dintr-o privire, fără cinci coloane per direcție.
create or replace function public.ii_diag_all(v jsonb, zona text)
returns text language sql immutable as $$
  select nullif(string_agg(d.label || ': ' || public.ii_diag(v, zona, d.dim), ' · '), '')
  from (values
    ('oameni', 'oameni'), ('timp', 'timp'), ('informatie', 'informație'),
    ('resurse', 'resurse'), ('decizii', 'decizii')
  ) as d(dim, label)
  where public.ii_diag(v, zona, d.dim) is not null
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
  f.editii                                        as "A câta ediție",
  array_to_string(f.zone, ', ')                   as "De ce s-a ocupat",
  array_to_string(f.zone_deep, ', ')              as "Zone detaliate",
  f.answers ->> 'zone_altele'                     as "Altceva, anume",

  -- cum a trecut prin festival
  public.ii_list(f.answers -> 'stare_cuvinte')    as "Cum s-a simțit",
  f.answers ->> 'moment_bun'                      as "Moment bun",
  f.answers ->> 'moment_greu'                     as "Moment greu",
  f.scala_sustinere                               as "Sprijin 1-5",
  f.scala_epuizare                                as "Energie la final 1-5",
  f.revenire                                      as "Revine la #22",

  -- program și flow
  f.answers ->> 'volum'                           as "Programul, ca volum",
  public.ii_list(f.answers -> 'program_taie')     as "Ce ar tăia din program",
  f.scala_program                                 as "A știut programul la timp 1-5",
  f.answers ->> 'program_info'                    as "Unde s-a rupt informația",
  f.answers ->> 'moment_zi'                       as "Când se rupea ziua",
  f.answers ->> 'suprapuneri_triaj'               as "Suprapuneri: ce păstrăm, ce separăm",

  -- echipa
  f.answers ->> 'facut_degeaba'                   as "Ce a făcut și nu era treaba lui",
  f.answers ->> 'nefacut'                         as "Ce nu s-a făcut deloc",
  f.answers ->> 'departamente'                    as "Unde s-a rupt între departamente",
  f.answers ->> 'ajutor'                          as "Cine i-a fost de ajutor",
  f.scala_claritate                               as "Claritate roluri 1-5",
  f.answers ->> 'claritate_de_ce'                 as "De ce nota la claritate",

  -- ce schimbăm la #22
  nullif(trim(f.answers -> 'top3' ->> 0), '')     as "Top 1",
  nullif(trim(f.answers -> 'top3' ->> 1), '')     as "Top 2",
  nullif(trim(f.answers -> 'top3' ->> 2), '')     as "Top 3",

  -- per ansamblu
  f.answers ->> 'zona_bine'                       as "Zona care a mers cel mai bine",
  f.answers ->> 'zona_prost'                      as "Zona care a mers cel mai prost",
  f.scala_general                                 as "Mulțumire generală 1-5",
  f.answers ->> 'recomanzi'                       as "Recomandă pentru un rol mai mare",
  f.answers ->> 'orice'                           as "Altceva",

  -- ── direcțiile: grila de diagnostic, de păstrat, de schimbat, text liber ──
  public.ii_diag_all(f.answers, 'participanti')   as "Participanți: diagnostic",
  public.ii_list(f.answers -> 'participanti_keep')   as "Participanți: de păstrat",
  public.ii_list(f.answers -> 'participanti_change') as "Participanți: de schimbat",
  f.answers ->> 'participanti_context'            as "Participanți: text liber",

  public.ii_diag_all(f.answers, 'invitati')       as "Invitați: diagnostic",
  public.ii_list(f.answers -> 'invitati_keep')    as "Invitați: de păstrat",
  public.ii_list(f.answers -> 'invitati_change')  as "Invitați: de schimbat",
  f.answers ->> 'invitati_context'                as "Invitați: text liber",

  public.ii_diag_all(f.answers, 'piata')          as "Piața: diagnostic",
  public.ii_list(f.answers -> 'piata_keep')       as "Piața: de păstrat",
  public.ii_list(f.answers -> 'piata_change')     as "Piața: de schimbat",
  f.answers ->> 'piata_context'                   as "Piața: text liber",

  public.ii_diag_all(f.answers, 'indoor')         as "Indoor: diagnostic",
  public.ii_list(f.answers -> 'indoor_keep')      as "Indoor: de păstrat",
  public.ii_list(f.answers -> 'indoor_change')    as "Indoor: de schimbat",
  f.answers ->> 'indoor_context'                  as "Indoor: text liber",

  public.ii_diag_all(f.answers, 'kaufland')       as "Kaufland: diagnostic",
  public.ii_list(f.answers -> 'kaufland_keep')    as "Kaufland: de păstrat",
  public.ii_list(f.answers -> 'kaufland_change')  as "Kaufland: de schimbat",
  f.answers ->> 'kaufland_context'                as "Kaufland: text liber",

  public.ii_diag_all(f.answers, 'ateliere')       as "Ateliere: diagnostic",
  public.ii_list(f.answers -> 'ateliere_keep')    as "Ateliere: de păstrat",
  public.ii_list(f.answers -> 'ateliere_change')  as "Ateliere: de schimbat",
  f.answers ->> 'ateliere_context'                as "Ateliere: text liber",

  public.ii_diag_all(f.answers, 'scenografie')       as "Scenografie: diagnostic",
  public.ii_list(f.answers -> 'scenografie_keep')    as "Scenografie: de păstrat",
  public.ii_list(f.answers -> 'scenografie_change')  as "Scenografie: de schimbat",
  f.answers ->> 'scenografie_context'             as "Scenografie: text liber",

  public.ii_diag_all(f.answers, 'tehnic_out')     as "Tehnic outdoor: diagnostic",
  public.ii_list(f.answers -> 'tehnic_out_keep')  as "Tehnic outdoor: de păstrat",
  public.ii_list(f.answers -> 'tehnic_out_change') as "Tehnic outdoor: de schimbat",
  f.answers ->> 'tehnic_out_context'              as "Tehnic outdoor: text liber",

  public.ii_diag_all(f.answers, 'tehnic_in')      as "Tehnic indoor: diagnostic",
  public.ii_list(f.answers -> 'tehnic_in_keep')   as "Tehnic indoor: de păstrat",
  public.ii_list(f.answers -> 'tehnic_in_change') as "Tehnic indoor: de schimbat",
  f.answers ->> 'tehnic_in_context'               as "Tehnic indoor: text liber",

  public.ii_diag_all(f.answers, 'productie')      as "Producție: diagnostic",
  public.ii_list(f.answers -> 'productie_keep')   as "Producție: de păstrat",
  public.ii_list(f.answers -> 'productie_change') as "Producție: de schimbat",
  f.answers ->> 'productie_context'               as "Producție: text liber",

  public.ii_diag_all(f.answers, 'transporturi')      as "Transporturi: diagnostic",
  public.ii_list(f.answers -> 'transporturi_keep')   as "Transporturi: de păstrat",
  public.ii_list(f.answers -> 'transporturi_change') as "Transporturi: de schimbat",
  f.answers ->> 'transporturi_context'            as "Transporturi: text liber",

  public.ii_diag_all(f.answers, 'cazari')         as "Cazări: diagnostic",
  public.ii_list(f.answers -> 'cazari_keep')      as "Cazări: de păstrat",
  public.ii_list(f.answers -> 'cazari_change')    as "Cazări: de schimbat",
  f.answers ->> 'cazari_context'                  as "Cazări: text liber",

  public.ii_diag_all(f.answers, 'mese')           as "Mese: diagnostic",
  public.ii_list(f.answers -> 'mese_keep')        as "Mese: de păstrat",
  public.ii_list(f.answers -> 'mese_change')      as "Mese: de schimbat",
  f.answers ->> 'mese_context'                    as "Mese: text liber",

  public.ii_diag_all(f.answers, 'welcomepacks')      as "Welcome packs: diagnostic",
  public.ii_list(f.answers -> 'welcomepacks_keep')   as "Welcome packs: de păstrat",
  public.ii_list(f.answers -> 'welcomepacks_change') as "Welcome packs: de schimbat",
  f.answers ->> 'welcomepacks_context'            as "Welcome packs: ce intră și ce iese",
  f.answers ->> 'welcomepacks_context2'           as "Welcome packs: când și cum se montează",

  public.ii_diag_all(f.answers, 'voluntari')      as "Voluntari: diagnostic",
  public.ii_list(f.answers -> 'voluntari_keep')   as "Voluntari: de păstrat",
  public.ii_list(f.answers -> 'voluntari_change') as "Voluntari: de schimbat",
  f.answers ->> 'voluntari_context'               as "Voluntari: text liber",

  public.ii_diag_all(f.answers, 'comunicare')     as "Comunicare: diagnostic",
  public.ii_list(f.answers -> 'comunicare_keep')  as "Comunicare: de păstrat",
  public.ii_list(f.answers -> 'comunicare_change') as "Comunicare: de schimbat",
  f.answers ->> 'comunicare_context'              as "Comunicare: text liber",

  public.ii_diag_all(f.answers, 'fotovideo')      as "Foto-video: diagnostic",
  public.ii_list(f.answers -> 'fotovideo_keep')   as "Foto-video: de păstrat",
  public.ii_list(f.answers -> 'fotovideo_change') as "Foto-video: de schimbat",
  f.answers ->> 'fotovideo_context'               as "Foto-video: text liber",

  public.ii_diag_all(f.answers, 'sponsori')       as "Sponsori: diagnostic",
  public.ii_list(f.answers -> 'sponsori_keep')    as "Sponsori: de păstrat",
  public.ii_list(f.answers -> 'sponsori_change')  as "Sponsori: de schimbat",
  f.answers ->> 'sponsori_context'                as "Sponsori: text liber",

  public.ii_diag_all(f.answers, 'financiar')      as "Financiar: diagnostic",
  public.ii_list(f.answers -> 'financiar_keep')   as "Financiar: de păstrat",
  public.ii_list(f.answers -> 'financiar_change') as "Financiar: de schimbat",
  f.answers ->> 'financiar_context'               as "Financiar: text liber",

  public.ii_diag_all(f.answers, 'website')        as "Website: diagnostic",
  public.ii_list(f.answers -> 'website_keep')     as "Website: de păstrat",
  public.ii_list(f.answers -> 'website_change')   as "Website: de schimbat",
  f.answers ->> 'website_context'                 as "Website: text liber",

  public.ii_diag_all(f.answers, 'ticketing')      as "Ticketing: diagnostic",
  public.ii_list(f.answers -> 'ticketing_keep')   as "Ticketing: de păstrat",
  public.ii_list(f.answers -> 'ticketing_change') as "Ticketing: de schimbat",
  f.answers ->> 'ticketing_context'               as "Ticketing: text liber",

  public.ii_diag_all(f.answers, 'altele')         as "Altceva: diagnostic",
  public.ii_list(f.answers -> 'altele_keep')      as "Altceva: de păstrat",
  public.ii_list(f.answers -> 'altele_change')    as "Altceva: de schimbat",
  f.answers ->> 'altele_context'                  as "Altceva: text liber",

  array_to_string(f.sectiuni, ', ')               as "Secțiuni primite",
  f.id                                            as "id"
from public.feedback_intern_21 f
order by f.created_at;

comment on view public.feedback_intern_21_excel is
  'Feedback #21 desfăcut în coloane, pentru export CSV / Excel. O linie per om.';

-- Cheia publică nu are ce citi aici.
revoke all on public.feedback_intern_21_excel from anon;
