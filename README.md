# feedback echipa de organizatori, ideo ideis #21

Formular de feedback pentru echipa internă, completat după festival.
Înlocuiește Google Form-ul folosit la edițiile trecute și rezolvă problema lui
principală: echipa e împărțită pe departamente și direcții, iar nimeni n-a văzut
tot festivalul. Cine a făcut foto-video nu are ce să spună despre sunetul de la
gale, deci nici nu e întrebat.

**Pentru cine:** Board, Artistic, Welcoming, Comunicare, Tehnic, Producție,
Financiar, Website. NU pentru voluntari, juniori și shtanga boyz, care au nevoie
de alt formular, cu alte întrebări.

**Live:** https://ideoideis.github.io/feedback-intern-21/

## Cum e gândit

- **Formular construit din bife.** Prima secțiune întreabă departamentul (una
  dintre cele opt din structura echipei, ca să se poată filtra în Excel) și
  zonele în care a fost implicat: evenimente outdoor și Piața, evenimente indoor
  și gale, ateliere, relații participanți și trupe, dezvoltare comunitară și
  murale, scenografie, tehnic, producție și achiziții, cazări și mese,
  transporturi, voluntari, comunicare și promovare, foto și video, finanțări și
  sponsorizări, website și ticketing. Fiecare are o secțiune a ei, deci niciun
  departament nu rămâne fără loc unde să vorbească, și nimeni nu primește
  întrebările altcuiva.
- **Răspunsuri care se pot număra.** Pentru fiecare zonă cerem lucruri scurte și
  separate, "de păstrat" și "de schimbat", la fel formulate în toate zonele. Zece
  oameni care scriu fiecare două rânduri scurte dau o listă de priorități; zece
  paragrafe dau o lectură plăcută din care nu iese nicio decizie.
- **Un top 3 ordonat** la final ("dacă s-ar schimba doar trei lucruri"). Se
  punctează 3-2-1 și iese o listă de priorități a echipei, nu o listă de păreri.
- **Loc liber peste tot.** Fiecare secțiune de zonă are și o întrebare deschisă
  pentru ce nu încape în liste, iar la grilă se poate adăuga o zonă care nu apare
  în listă (merch, acreditări, punctul medical, transportul de la gară, muzica
  din pauze). Zonele mici nu se pierd.
- **Oamenii, nu doar organizarea.** O secțiune întreagă despre cum a fost pentru
  ei: trei cuvinte alese dintr-o listă, un moment bun, un moment greu, cât sprijin
  au simțit, cu cât au terminat ca energie și dacă vor să revină la #22. Ultima e
  cel mai bun indicator agregat pe care îl avem.
- **Scale de la 1 la 5** pentru claritatea responsabilităților, comunicare,
  producție, sprijin, energie și satisfacție generală, plus grila pe zone. La
  edițiile trecute totul era text liber, deci nu se putea compara nimic între ani.
  Astea se pot.
- **Aproape totul e opțional.** Obligatorii sunt doar șapte lucruri, toate rapide:
  departamentul, rolul, zonele, cele trei cuvinte, două scale și topul de la final. Mai puține
  răspunsuri, dar sincere, bat un formular completat de silă.
- **Numele e opțional.** Se poate completa anonim.
- **Ciorna se salvează local** (localStorage) la fiecare tastă. Nu are nevoie de
  nume: rămâne în browserul de pe care se completează, deci fiecare își regăsește
  răspunsurile pe același telefon sau laptop, fără să știm cine e. Pentru cazul în
  care doi oameni folosesc același dispozitiv există butonul "începe de la zero".

## Easter eggs

Un formular completat în tăcere e o corvoadă, așa că formularul răspunde înapoi.
Nimic din asta nu blochează completarea și tot e dezactivat pentru cine are
`prefers-reduced-motion` pornit.

- **Inimioare** la nota 5 pe orice scală, la cuvintele bune din secțiunea de
  stare, la variantele bune de la "a câta ediție" și "revii la #22", când scrii
  primul lucru "de păstrat", la fiecare secțiune terminată, când completezi tot
  topul, când termini grila, pe eticheta din colț (se clatină dacă o apeși), pe
  ♥ din bara de sus (la a cincea apăsare se lasă convins și plouă) și o ploaie
  întreagă la final, care crește cu fiecare apăsare.
- **Regula lor:** inimioare doar la lucrurile bune. Nu sărbătorim că cineva s-a
  simțit frustrat, copleșit sau invizibil, oricât de drăguț ar fi efectul. Vezi
  `HAPPY_WORDS` și `HAPPY_CHOICES` în [`src/data/reactions.ts`](src/data/reactions.ts).
- **Micro-copy care reacționează:** fiecare notă de la 1 la 5, fiecare cuvânt de
  stare și fiecare variantă de la întrebările cu pastile are un răspuns scurt. La
  note mici recunoaștem problema, nu facem glume. Dacă scrii pe larg, îți spune că
  e citit. Dacă îți scrii numele, te salută.
- **Sugestii care se rotesc** în câmpul liber de la final, cât timp e gol.
- **Rânduri de încurajare** la o treime, la jumătate și aproape de final, plus
  "nu se pierde nimic" dacă te întorci de trei ori.
- **Coduri:** scrie `ideo` oriunde, sau Konami cu săgețile. Tasta `?` dă un
  indiciu. Dacă bifezi toate zonele, te întreabă dacă ai dormit vreodată.

## Conținutul formularului

Toate întrebările, secțiunile și regulile de afișare stau într-un singur fișier:
[`src/data/questions.ts`](src/data/questions.ts). Ca să reformulezi o întrebare,
editezi textul de acolo; pagina se construiește singură din structura aia. Nu e
nevoie de nicio migrare în baza de date când schimbi textul unei întrebări.
Reacțiile sunt în [`src/data/reactions.ts`](src/data/reactions.ts).

Testele din [`src/data/questions.test.ts`](src/data/questions.test.ts) verifică ce
s-ar strica în liniște la o editare: id-uri duplicate sau cu diacritice, secțiuni
care apar la oamenii nepotriviți, zone fără secțiune, liste cu lungimi diferite
(care ar strica comparabilitatea), scale fără reacții, cuvinte fără răspuns și
lungimea totală a formularului.

```bash
npm test
```

## Dezvoltare locală

```bash
npm install
npm run dev      # http://localhost:8083
```

Variabilele de mediu (Supabase) sunt în `.env` (vezi `.env.example`). Cheia din
browser e cea **publishable** (anon); datele sunt protejate prin Row Level
Security.

## Build

```bash
npm run build    # output în dist/
npm run preview  # servește build-ul de producție local
```

## Deploy, GitHub Pages

Automat prin GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
la fiecare push pe `main`. În producție `base` este `/feedback-intern-21/`
(vezi `vite.config.ts`), iar valorile publice de Supabase sunt în `.env.production`.

## Baza de date (Supabase)

Proiectul Supabase e cel comun al festivalului. Migrațiile se rulează în SQL
Editor, în ordine:

1. [`supabase/migrations/001_feedback_intern_21.sql`](supabase/migrations/001_feedback_intern_21.sql)
   tabelul `feedback_intern_21` plus politicile RLS (oricine poate insera prin
   formular, doar utilizatorii autentificați pot citi).
2. [`supabase/migrations/002_export_excel.sql`](supabase/migrations/002_export_excel.sql)
   vederea `feedback_intern_21_excel`, pentru export.

Răspunsurile intră toate în coloana `answers` (jsonb, cheia = id-ul întrebării
din `questions.ts`). Separat există coloane pentru ce filtrăm sau mediem: `departament`,
`rol`, `zone`, `sectiuni`, `revenire` și cele șase scale. Așa poți schimba întrebările
fără să strici tabelul.

### Export pentru Excel

jsonb nu se citește în Excel, așa că există o vedere care îl desface în coloane
cu nume în română, o linie per om:

**Table Editor -> `feedback_intern_21_excel` -> Export -> CSV**, apoi se deschide
direct în Excel. Notele din grilă sunt numerice (se pot face medii), listele
"de păstrat / de schimbat" vin unite cu ` | `, iar topul are trei coloane
separate. Când adaugi o întrebare în `questions.ts`, adaugă și o coloană în
vedere.

Vederea are `security_invoker = true`, deci respectă RLS-ul tabelului: cheia
publică nu poate citi prin ea.

Pentru citit și grupat (nu pentru export) sunt interogările din
[`supabase/ADMIN_QUERIES.sql`](supabase/ADMIN_QUERIES.sql): topul ponderat 3-2-1,
lucrurile de păstrat și de schimbat numărate pe zone, mediile pe zone, cine nu mai
vrea să revină, momentele bune.
