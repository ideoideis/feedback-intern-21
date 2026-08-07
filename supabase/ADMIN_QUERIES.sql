-- Interogări pentru citit feedbackul echipei (rulează-le în SQL Editor din Supabase).
-- Tabelul: public.feedback_intern_21
--
-- Ordinea în care merită citite după festival:
--   1, 2   cine a răspuns
--   3, 4   cifrele care se compară între ediții
--   5      LISTA de păstrat / de schimbat, pe zone  <- asta e cea importantă
--   6      topul schimbărilor, ponderat
--   7      grila pe tot festivalul (unde s-a văzut prost din mai multe unghiuri)
--   8, 9   oamenii: stare, epuizare, cine nu mai vrea să revină
--   10+    text pe întrebări, pentru citit pe îndelete
--
-- Pentru Excel nu folosi interogările de aici: ai o vedere gata făcută,
-- `feedback_intern_21_excel` (vezi migrations/002_export_excel.sql). O deschizi
-- în Table Editor si dai Export -> CSV, o linie per om, coloane cu nume în
-- română. Interogările de mai jos sunt pentru citit și grupat, nu pentru export.

-- ── 1. Câte răspunsuri avem ───────────────────────────────────────────────
select count(*) as raspunsuri,
       count(nume) as cu_nume,
       count(*) - count(nume) as anonime
from public.feedback_intern_21;

-- ── 2. Toate răspunsurile, pe scurt ───────────────────────────────────────
select created_at, coalesce(nume, '(anonim)') as nume, rol, editii, zone, revenire,
       scala_claritate, scala_comunicare, scala_logistica,
       scala_sustinere, scala_epuizare, scala_general
from public.feedback_intern_21
order by created_at desc;

-- ── 3. Mediile scalelor (cifrele pe care le compari între ediții) ──────────
select round(avg(scala_claritate), 2)  as claritate_responsabilitati,
       round(avg(scala_comunicare), 2) as comunicare_timp_real,
       round(avg(scala_logistica), 2)  as logistica,
       round(avg(scala_sustinere), 2)  as sprijin_cand_a_fost_greu,
       round(avg(scala_epuizare), 2)   as energie_la_final,
       round(avg(scala_general), 2)    as satisfactie_generala,
       count(*)                        as din_raspunsuri
from public.feedback_intern_21;

-- ── 4. Cine a fost implicat unde ──────────────────────────────────────────
select z as zona, count(*) as oameni
from public.feedback_intern_21, unnest(zone) as z
group by z
order by oameni desc;

-- ── 5. CE PĂSTRĂM / CE SCHIMBĂM, pe zone ──────────────────────────────────
-- Toate lucrurile scurte scrise de toată lumea, grupate pe zonă. De aici ies
-- deciziile: ce apare la mai mulți oameni e o prioritate, nu o părere.
select case when a.key like '%\_keep' then 'păstrăm' else 'schimbăm' end as tip,
       case split_part(a.key, '_', 1)
         when 'piata'    then 'Piața'
         when 'trupe'    then 'trupele și participanții'
         when 'ateliere' then 'atelierele'
         when 'invitati' then 'invitați, mentori, juriu'
         when 'ev'       then 'evenimente proprii'
         when 'com'      then 'comunicare și promovare'
         when 'vol'      then 'voluntari'
         when 'part'     then 'parteneri și finanțare'
         when 'oras'     then 'orașul și instituțiile'
         when 'loc'      then 'locații și logistică'
         else split_part(a.key, '_', 1)
       end as zona,
       trim(item) as lucru,
       coalesce(f.nume, '(anonim)') as cine,
       f.rol
from public.feedback_intern_21 f,
     jsonb_each(f.answers) as a,
     jsonb_array_elements_text(a.value) as item
where jsonb_typeof(a.value) = 'array'
  and (a.key like '%\_keep' or a.key like '%\_change')
  and trim(item) <> ''
order by tip desc, zona, cine;

-- ── 5b. Aceleași lucruri, numărate ────────────────────────────────────────
-- Atenție: grupează după text exact, deci "standuri târziu" și "standurile mai
-- târziu" ies ca două rânduri. Citește lista și grupează sinonimele de mână;
-- scopul e doar să vezi repede ce se repetă.
select case when a.key like '%\_keep' then 'păstrăm' else 'schimbăm' end as tip,
       lower(trim(item)) as lucru,
       count(*) as de_cati_oameni
from public.feedback_intern_21 f,
     jsonb_each(f.answers) as a,
     jsonb_array_elements_text(a.value) as item
where jsonb_typeof(a.value) = 'array'
  and (a.key like '%\_keep' or a.key like '%\_change')
  and trim(item) <> ''
group by tip, lower(trim(item))
having count(*) > 1
order by de_cati_oameni desc;

-- ── 6. Topul schimbărilor pentru #22, ponderat ────────────────────────────
-- Fiecare om a dat trei lucruri, în ordine. Primul valorează 3 puncte, al
-- doilea 2, al treilea 1. Ordonat după puncte, nu după cine a scris mai mult.
select trim(item) as schimbare,
       sum(4 - ord) as puncte,
       count(*) as mentionat_de,
       min(ord) as cel_mai_sus_pus
from public.feedback_intern_21 f,
     jsonb_array_elements_text(f.answers -> 'top3') with ordinality as t(item, ord)
where trim(item) <> ''
group by trim(item)
order by puncte desc;

-- ── 7. Grila: cum a mers fiecare zonă, din toate unghiurile ───────────────
-- Include și oamenii care n-au lucrat în zona respectivă, dar au văzut-o.
-- Zonele de la capătul de jos al listei sunt cele de reparat.
select r.key as zona,
       round(avg(case when jsonb_typeof(r.value) = 'number'
                      then (r.value #>> '{}')::numeric end), 2) as nota_medie,
       count(*) filter (where jsonb_typeof(r.value) = 'number') as cate_note,
       count(*) filter (where r.value = '"nu"'::jsonb) as n_au_vazut
from public.feedback_intern_21 f,
     jsonb_each(f.answers -> 'grila') as r
group by r.key
order by nota_medie nulls last;

-- ── 8. Cum s-au simțit oamenii (cuvintele alese) ──────────────────────────
select trim(w) as cuvant, count(*) as de_cati_oameni
from public.feedback_intern_21 f,
     jsonb_array_elements_text(f.answers -> 'stare_cuvinte') as w
group by trim(w)
order by de_cati_oameni desc;

-- ── 9. Semnale de alarmă ──────────────────────────────────────────────────
-- Cine a terminat pe jantă, cine s-a simțit singur, cine nu mai vrea să revină.
-- Astea se discută în echipa principală, nu se pun într-un raport.
select coalesce(nume, '(anonim)') as nume, rol,
       scala_epuizare as energie, scala_sustinere as sprijin, revenire,
       answers ->> 'moment_greu' as momentul_greu,
       answers ->> 'orice' as altceva
from public.feedback_intern_21
where coalesce(scala_epuizare, 5) <= 2
   or coalesce(scala_sustinere, 5) <= 2
   or revenire in ('probabil nu', 'nu știu încă')
order by scala_epuizare nulls last;

-- ── 10. Vrea lumea să revină? ─────────────────────────────────────────────
select coalesce(revenire, '(fără răspuns)') as revenire, count(*) as oameni
from public.feedback_intern_21
group by revenire
order by oameni desc;

-- ── 11. Momentele bune (pentru deschiderea ediției următoare) ─────────────
select coalesce(nume, '(anonim)') as nume, rol,
       answers ->> 'moment_bun' as moment
from public.feedback_intern_21
where coalesce(trim(answers ->> 'moment_bun'), '') <> ''
order by created_at;

-- ── 12. O singură întrebare, toate răspunsurile ───────────────────────────
-- Înlocuiește 'suprapuneri_triaj' cu id-ul întrebării din src/data/questions.ts
-- (ex: comunicare, lipsit, efort, departamente, crescut, idee, recomanzi, orice).
select coalesce(nume, '(anonim)') as nume, rol,
       answers ->> 'suprapuneri_triaj' as raspuns
from public.feedback_intern_21
where coalesce(trim(answers ->> 'suprapuneri_triaj'), '') <> ''
order by created_at;

-- ── 13. Tot textul deschis, un rând per întrebare (pentru export) ─────────
select f.created_at,
       coalesce(f.nume, '(anonim)') as nume,
       f.rol,
       a.key as intrebare,
       a.value as raspuns
from public.feedback_intern_21 f,
     jsonb_each_text(f.answers) as a
where a.key not in ('nume', 'rol', 'editii', 'zone', 'zone_altele', 'revenire')
  and a.key not like 's\_%'
  and coalesce(trim(a.value), '') <> ''
order by f.created_at, a.key;
