import { DEPARTMENTS } from "./questions";

/**
 * Formularul răspunde înapoi. Când cineva dă o notă sau alege un cuvânt, apare
 * un rând mic sub întrebare, ca într-o conversație.
 *
 * De ce: un formular de 15 minute completat în tăcere e o corvoadă. Unul care
 * confirmă că ai fost auzit se termină. Textele sunt scurte și oneste: la note
 * mici recunoaștem problema, nu ne scuzăm și nu facem glume.
 */

/** Reacție per notă (1 la 5), pe id-ul întrebării de tip scale. */
export const SCALE_REACTIONS: Record<string, Record<number, string>> = {
  s_claritate: {
    1: "notat. exact asta trebuie reparat la #22.",
    2: "prea puțin clar. spune-ne mai jos unde s-a rupt.",
    3: "deci a funcționat, dar pe ghicit.",
    4: "bine. ce ar fi lipsit ca să fie 5?",
    5: "rar și frumos.",
  },
  s_sustinere: {
    1: "nu ar fi trebuit să fii pe cont propriu. ne pare rău.",
    2: "prea puțin sprijin. scrie-ne unde.",
    3: "uneori da, uneori nu.",
    4: "bine, deci a fost cine să prindă.",
    5: "asta ne bucură cel mai mult.",
  },
  s_epuizare: {
    1: "te-am stors. ne pare rău.",
    2: "prea aproape de gol.",
    3: "cam așa se termină un festival.",
    4: "sună sănătos.",
    5: "atunci mai avem loc să creștem.",
  },
  s_program: {
    1: "pe ultima sută. asta e de reparat.",
    2: "prea târziu, prea des.",
    3: "pe jumătate.",
    4: "aproape.",
    5: "atunci am făcut ceva bine.",
  },
  s_general: {
    1: "ne pare rău. mulțumim că ai spus-o direct.",
    2: "mulțumim pentru sinceritate. avem de muncă.",
    3: "ok. avem de muncă.",
    4: "ne bucurăm.",
    5: "mulțumim. serios.",
  },
};

/** Reacție la cuvântul ales, în secțiunea de stare. */
export const WORD_REACTIONS: Record<string, string> = {
  "energizat/ă": "asta căutăm.",
  "copleșit/ă": "prea mult, prea repede. notat.",
  "util/ă": "ai fost.",
  "mereu pe fugă": "știm senzația.",
  "în control": "te invidiem.",
  "invizibil/ă": "asta nu ar trebui să se întâmple. mulțumim că ai spus.",
  "susținut/ă": "bine.",
  "frustrat/ă": "spune-ne pe ce, mai jos.",
  "mândru/ă": "și noi de tine.",
  "singur/ă în treaba mea": "hai să nu se repete la #22.",
  "conectat/ă cu echipa": "cel mai bun semn.",
  "epuizat/ă": "ai nevoie de o vacanță, nu de un formular.",
  "nesigur/ă pe ce trebuie făcut": "asta e treaba noastră, nu a ta.",
  "în locul potrivit": "atunci te vrem și la #22.",
};

/**
 * Cuvintele la care iese un puf de inimioare.
 *
 * Regula, pe care merită să n-o încalci când adaugi cuvinte: inimioare doar la
 * cuvintele bune. Nu sărbătorim că cineva s-a simțit frustrat, copleșit sau
 * invizibil, oricât de drăguț ar fi efectul.
 */
export const HAPPY_WORDS = [
  "energizat/ă",
  "util/ă",
  "în control",
  "susținut/ă",
  "mândru/ă",
  "conectat/ă cu echipa",
  "în locul potrivit",
];

/** Reacție la varianta aleasă, pentru întrebările cu pastile. */
export const CHOICE_REACTIONS: Record<string, Record<string, string>> = {
  editii: {
    prima: "bine ai venit în echipă.",
    "a doua": "deci te-ai întors. semn bun.",
    "a treia": "începi să fii dintre cei vechi.",
    "mai multe": "veteran/ă. mulțumim că mai vii.",
  },
  departament: {
    Board: "voi ați dus greul. mulțumim.",
    Artistic: "de la voi vine tot ce se vede pe scenă.",
    Welcoming: "voi sunteți primii pe care îi vede toată lumea.",
    Comunicare: "fără voi nu s-ar fi văzut nimic.",
    Tehnic: "fără voi nu s-ar fi auzit nimic.",
    Producție: "voi țineți tot în picioare.",
    Financiar: "voi faceți posibil restul.",
    Website: "mulțumim, chiar contează.",
    "prefer să nu spun": "e ok. mulțumim oricum.",
  },
  volum: {
    "prea încărcat": "notat. la #22 tăiem.",
    "cam bine": "bun de știut.",
    "am mai fi putut duce": "ambițios/oasă. ținem minte.",
  },
  moment_zi: {
    "dimineața, la început": "deci startul e problema.",
    "la tranziția între evenimente": "acolo se pierde tot, în fiecare an.",
    "seara târziu": "notat.",
    "noaptea, la demontat": "acolo se vede cine rămâne.",
    "nu se rupea": "atunci a mers bine.",
  },
  revenire: {
    da: "ne bucurăm. serios.",
    "da, dar în alt rol": "notat. hai să vorbim despre unde.",
    "nu știu încă": "e un răspuns cinstit. mulțumim.",
    "probabil nu": "am înțeles. mulțumim că ai spus-o direct.",
  },
};

/** Variantele la care merg inimioarele. Restul primesc doar text. */
export const HAPPY_CHOICES = [
  "prima",
  "a doua",
  "a treia",
  "mai multe",
  "da",
  "da, dar în alt rol",
  "cam bine",
  "nu se rupea",
  ...DEPARTMENTS,
];

/** Rândul de încurajare la trecerea prin secțiuni (după numărul secțiunii). */
export const MILESTONES: Record<number, string> = {
  2: "merge repede, nu?",
  3: "o treime. respiră.",
  5: "jumătate. partea grea a trecut.",
  7: "aproape.",
};
