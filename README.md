# feedback echipa de organizatori, ideo ideis #21

Formular de feedback pentru echipa de organizatori, completat după festival.
Înlocuiește Google Form-ul folosit la edițiile trecute și rezolvă problema lui
principală: nu toată lumea s-a implicat în toate zonele, așa că nu are sens să
primească toată lumea aceleași întrebări.

**Live:** https://ideoideis.github.io/feedback-intern-21/

## Cum e gândit

- **Secțiuni pe zone.** În prima secțiune fiecare bifează zonele în care a fost
  implicat direct (Piața, atelierele, gale, alte evenimente, logistică, cazare,
  comunicare). Secțiunile despre Piață, ateliere și evenimente proprii apar doar
  pentru cine le-a bifat. Restul le vede toată lumea.
- **Răspunsuri care se pot număra.** Pentru fiecare zonă cerem lucruri scurte și
  separate, "de păstrat" și "de schimbat", nu un paragraf. Zece oameni care scriu
  fiecare două rânduri scurte dau o listă de priorități; zece paragrafe dau o
  lectură plăcută din care nu iese nicio decizie. Întrebările sunt identice pe
  toate zonele, ca răspunsurile să fie comparabile între ele.
- **Un top 3 ordonat** la final ("dacă s-ar schimba doar trei lucruri"). Se
  punctează 3-2-1 și iese o listă de priorități a echipei, nu o listă de păreri.
- **Grila pe tot festivalul.** Zece note de câte două secunde, cu "n-am văzut" ca
  răspuns valid. Așa avem o citire pe fiecare zonă din mai multe perechi de ochi,
  inclusiv de la oameni care n-au lucrat în ea, în timp ce textul lung vine doar
  de la cei implicați direct. Asta rezolvă problema principală de la edițiile
  trecute: nu toată lumea a fost în toate zonele.
- **Oamenii, nu doar organizarea.** O secțiune întreagă despre cum a fost pentru
  ei: trei cuvinte alese dintr-o listă, un moment bun, un moment greu, cât sprijin
  au simțit, cu cât au terminat ca energie și dacă vor să revină la #22. Ultima e
  cel mai bun indicator agregat pe care îl avem.
- **Scale de la 1 la 5** pentru claritatea responsabilităților, comunicare,
  logistică, sprijin, energie și satisfacție generală. La edițiile trecute totul
  era text liber, deci nu se putea compara nimic între ani. Astea se pot.
- **Aproape totul e opțional.** Obligatorii sunt doar șase lucruri, toate rapide:
  rolul, zonele, cele trei cuvinte, două scale și topul de la final. Mai puține
  răspunsuri, dar sincere, bat un formular completat de silă.
- **Numele e opțional.** Se poate completa anonim.
- **Ciorna se salvează local** (localStorage) la fiecare tastă. Nu are nevoie de
  nume: rămâne în browserul de pe care se completează, deci fiecare își regăsește
  răspunsurile pe același telefon sau laptop, fără să știm cine e. Pentru cazul în
  care doi oameni folosesc același dispozitiv există butonul "începe de la zero".

## Easter eggs

Un formular de 15 minute completat în tăcere e o corvoadă, așa că formularul
răspunde înapoi. Nimic din asta nu blochează completarea și tot e dezactivat
pentru cine are `prefers-reduced-motion` pornit.

- Inimioare: la nota 5 pe orice scală, la cuvintele bune din secțiunea de stare,
  când scrii primul lucru "de păstrat", la fiecare secțiune terminată, când
  completezi toată grila, pe eticheta din colț (o apeși și se clatină) și o ploaie
  întreagă la final.
- Micro-copy care reacționează: fiecare notă de la 1 la 5 și fiecare cuvânt de
  stare are un răspuns scurt, în [`src/data/reactions.ts`](src/data/reactions.ts).
  La note mici recunoaștem problema, nu facem glume.
- Rânduri de încurajare la o treime, la jumătate și aproape de final.
- Scrie `ideo` oriunde în pagină.

## Conținutul formularului

Toate întrebările, secțiunile și regulile de afișare stau într-un singur fișier:
[`src/data/questions.ts`](src/data/questions.ts). Ca să reformulezi o întrebare,
editezi textul de acolo; pagina se construiește singură din structura aia. Nu e
nevoie de nicio migrare în baza de date când schimbi textul unei întrebări.

Reacțiile (răspunsurile scurte la note și la cuvinte) sunt în
[`src/data/reactions.ts`](src/data/reactions.ts). Testele din
[`src/data/questions.test.ts`](src/data/questions.test.ts) verifică lucrurile care
s-ar strica în liniște la o editare: id-uri duplicate sau cu diacritice, secțiuni
care apar la oamenii nepotriviți, scale fără reacții, cuvinte fără răspuns.

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

Proiectul Supabase e cel comun al festivalului. Migrarea e în
[`supabase/migrations/001_feedback_intern_21.sql`](supabase/migrations/001_feedback_intern_21.sql):
tabelul `feedback_intern_21` plus politicile RLS (oricine poate insera prin
formular, doar utilizatorii autentificați pot citi).

Răspunsurile intră toate în coloana `answers` (jsonb, cheia = id-ul întrebării
din `questions.ts`). Separat există coloane pentru ce filtrăm sau mediem: `rol`,
`zone`, `sectiuni` și cele patru scale. Așa poți schimba întrebările fără să
strici tabelul.

Pentru citit răspunsurile: [`supabase/ADMIN_QUERIES.sql`](supabase/ADMIN_QUERIES.sql)
(numărători, mediile scalelor, o întrebare cu toate răspunsurile ei, notele mici
cu explicația lor, ideile cu autor).
