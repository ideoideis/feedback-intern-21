/**
 * Conținutul formularului de feedback pentru echipa de organizatori, ideo ideis #21.
 *
 * Totul e declarativ: ca să schimbi o întrebare, editezi textul de aici.
 * Pagina (src/pages/Index.tsx) se construiește singură din structura asta.
 *
 * Trei decizii care fac diferența față de un Google Form obișnuit:
 *
 * 1. Nimeni nu e întrebat despre ce nu putea să vadă. Echipa e împărțită pe
 *    departamente și direcții: cine a făcut foto-video nu are ce să spună despre
 *    tehnicul din Piață, iar cine a ținut finanțarea n-a văzut cum au mers
 *    înscrierile la ateliere. În prima secțiune fiecare bifează zonele în care a
 *    fost implicat, și de acolo se construiește un formular numai al lui.
 *
 * 2. Răspunsuri care se pot număra. Pentru fiecare zonă cerem lucruri scurte și
 *    separate ("de păstrat" / "de schimbat"), la fel formulate în toate zonele.
 *    Zece oameni care scriu fiecare două rânduri scurte dau o listă de
 *    priorități; zece paragrafe dau o lectură plăcută din care nu iese nimic.
 *
 * 3. Scurt, dar cu loc liber. Fiecare zonă are și o întrebare deschisă, iar la
 *    final se pot adăuga zone care nu apar în listă. Dacă adaugi o întrebare
 *    nouă, întreabă-te ce tai în schimb.
 */

export type ZoneId =
  | "piata"
  | "trupe"
  | "ateliere"
  | "gale"
  | "invitati"
  | "evenimente"
  | "logistica"
  | "cazare"
  | "comunicare"
  | "voluntari"
  | "parteneri"
  | "oras"
  | "altele";

export type Zone = { id: ZoneId; label: string; hint: string };

/** Zonele de lucru ale festivalului. Ordinea e cea din bifele primei secțiuni. */
export const ZONES: Zone[] = [
  { id: "piata", label: "Piața", hint: "organizare, program, standuri, oameni pe teren" },
  { id: "trupe", label: "Trupele și participanții", hint: "program, repetiții, însoțitori, tot ce au avut nevoie" },
  { id: "ateliere", label: "Atelierele", hint: "înscrieri, spații, traineri, prezență" },
  { id: "gale", label: "Gale și spectacole", hint: "sală, tehnic, public, program de scenă" },
  { id: "invitati", label: "Invitați, mentori, juriu", hint: "invitații, contracte, program, însoțire" },
  { id: "evenimente", label: "Alte evenimente", hint: "un eveniment de care ai fost responsabil/ă" },
  { id: "logistica", label: "Logistică și locații", hint: "săli, echipamente, montaj, transport materiale" },
  { id: "cazare", label: "Cazare, masă, transport", hint: "unde dorm, unde mănâncă, cum ajung oamenii" },
  { id: "comunicare", label: "Comunicare și promovare", hint: "online, presă, foto, video, afișe" },
  { id: "voluntari", label: "Coordonare voluntari", hint: "recrutare, ture, brief-uri, cine ține de ei" },
  { id: "parteneri", label: "Sponsori, parteneri, finanțare", hint: "bugete, contracte, ce am promis și livrat" },
  { id: "oras", label: "Orașul și instituțiile", hint: "primărie, școli, avize, vecinii locațiilor" },
  { id: "altele", label: "Altceva", hint: "scrie mai jos în ce anume" },
];

/**
 * Rândurile din grila de note.
 *
 * `always` = ce a trăit oricine din echipă pe pielea lui: a dormit, a mâncat, a
 * văzut trupele pe scenă, a simțit atmosfera, a primit sau nu instrucțiuni
 * clare. Restul apar doar la cine a bifat zona potrivită, plus sub butonul
 * "arată și celelalte zone" pentru cine chiar a văzut mai mult.
 */
export const GRID_ROWS: { id: string; label: string; zones?: ZoneId[]; always?: boolean }[] = [
  { id: "trupe", label: "Trupele: cum au fost primite și ținute", always: true },
  { id: "piata", label: "Piața", zones: ["piata"] },
  { id: "ateliere", label: "Atelierele", zones: ["ateliere"] },
  { id: "gale", label: "Galele și spectacolele", zones: ["gale", "trupe"] },
  { id: "invitati", label: "Invitații, mentorii, juriul", zones: ["invitati", "gale", "ateliere"] },
  { id: "evenimente", label: "Evenimentele conexe", zones: ["evenimente"] },
  {
    id: "locatii",
    label: "Sălile și locațiile",
    zones: ["logistica", "piata", "ateliere", "gale", "evenimente"],
  },
  { id: "logistica", label: "Logistica: montaj, transport, echipamente", zones: ["logistica"] },
  { id: "comunicare", label: "Comunicarea și promovarea", zones: ["comunicare"] },
  { id: "voluntari", label: "Voluntarii: câți au fost și cât de pregătiți", zones: ["voluntari", "piata"] },
  { id: "parteneri", label: "Partenerii și banii", zones: ["parteneri"] },
  { id: "oras", label: "Relația cu orașul", zones: ["oras", "piata"] },
  { id: "cazare", label: "Cazarea, masa, transportul", always: true },
  { id: "coordonare", label: "Coordonarea internă a echipei", always: true },
  { id: "atmosfera", label: "Atmosfera generală a festivalului", always: true },
];

const seesRow = (row: (typeof GRID_ROWS)[number], zone: ZoneId[]) =>
  !!row.always || !!row.zones?.some((z) => zone.includes(z));

/** Rândurile pe care le vede cineva din start. */
export const gridRowsFor = (zone: ZoneId[]) => GRID_ROWS.filter((r) => seesRow(r, zone));

/** Restul, ascunse sub "arată și celelalte zone". */
export const gridRowsRest = (zone: ZoneId[]) => GRID_ROWS.filter((r) => !seesRow(r, zone));

/** Cuvintele din care se alege starea. Ordine amestecată intenționat, ca lista
 *  să nu sugereze "răspunsurile bune" la început și cele urâte la sfârșit. */
export const MOOD_WORDS: string[] = [
  "energizat/ă",
  "copleșit/ă",
  "util/ă",
  "mereu pe fugă",
  "în control",
  "invizibil/ă",
  "susținut/ă",
  "frustrat/ă",
  "mândru/ă",
  "singur/ă în treaba mea",
  "conectat/ă cu echipa",
  "epuizat/ă",
  "nesigur/ă pe ce trebuie făcut",
  "în locul potrivit",
];

export type Question =
  | {
      type: "short";
      id: string;
      label: string;
      help?: string;
      placeholder?: string;
      /** Răspunde cu un salut pe nume, când e completat. */
      greet?: boolean;
      required?: boolean;
    }
  | {
      type: "long";
      id: string;
      label: string;
      help?: string;
      placeholder?: string;
      /** Sugestii care se schimbă la câteva secunde, pentru câmpurile deschise. */
      placeholders?: string[];
      required?: boolean;
    }
  | {
      type: "scale";
      id: string;
      label: string;
      help?: string;
      low: string;
      high: string;
      required?: boolean;
    }
  | {
      type: "choice";
      id: string;
      label: string;
      help?: string;
      options: string[];
      required?: boolean;
    }
  | {
      /** Câmpuri scurte, separate, care se pot număra între respondenți. */
      type: "items";
      id: string;
      label: string;
      help?: string;
      slots: number;
      placeholder?: string;
      /** Numerotate 1, 2, 3 (pentru topuri). Altfel doar câmpuri unele sub altele. */
      ranked?: boolean;
      accent?: "keep" | "change";
      required?: boolean;
    }
  | {
      /** Alegere de cuvinte, maximum `max`. */
      type: "words";
      id: string;
      label: string;
      help?: string;
      options: string[];
      max: number;
      required?: boolean;
    }
  | {
      /** Grila cu zonele festivalului: notă de la 1 la 5 sau "n-am văzut". */
      type: "grid";
      id: string;
      label: string;
      help?: string;
      low: string;
      high: string;
      required?: boolean;
    }
  | {
      /** Bifele care decid ce secțiuni apar mai departe. Apare o singură dată. */
      type: "zones";
      id: "zone";
      label: string;
      help?: string;
      required?: boolean;
    };

export type Section = {
  id: string;
  title: string;
  /** Un rând scurt sub titlu, pentru context. */
  intro?: string;
  /** Apare doar dacă persoana a bifat cel puțin una dintre zonele astea. */
  showIf?: ZoneId[];
  /** Text mic de tip "sari peste ce nu te-a atins". */
  optionalNote?: string;
  questions: Question[];
};

/**
 * Întrebările care se repetă identic în fiecare secțiune de zonă: doi lucruri de
 * păstrat, două de schimbat, plus loc liber. Faptul că sunt identice e tot
 * scopul: răspunsurile devin comparabile între zone și se pot număra.
 */
const zoneQuestions = (zona: string, id: string): Question[] => [
  {
    type: "items",
    id: `${id}_keep`,
    label: `Ce trebuie păstrat ${zona}?`,
    help: "Scurt, un lucru per rând. Ce a funcționat și ar fi o pierdere să dispară.",
    slots: 2,
    accent: "keep",
    placeholder: "ex. briefingul de dimineață, cu toată echipa",
  },
  {
    type: "items",
    id: `${id}_change`,
    label: `Ce trebuie schimbat ${zona}?`,
    help: "Scurt, un lucru per rând. Dacă știi și cum, scrie cum.",
    slots: 2,
    accent: "change",
    placeholder: "ex. standurile deschise de la 11, nu de la 9",
  },
];

/**
 * Zonele care primesc o secțiune proprie, generată la fel pentru toate.
 *
 * `key` e prefixul id-urilor (`piata_keep`, `piata_change`, `piata_context`).
 * Ține-l scurt și fără diacritice: ajunge direct în numele coloanelor din
 * exportul pentru Excel.
 */
const ZONE_SECTIONS: {
  key: string;
  title: string;
  /** Cum se citește în întrebări: "Ce trebuie păstrat <label>?" */
  label: string;
  showIf: ZoneId[];
  note?: string;
  /** Întrebările puse înaintea listelor. */
  before?: Question[];
  /** Întrebarea deschisă de la finalul secțiunii, specifică zonei. */
  open: { label: string; help: string };
}[] = [
  {
    key: "piata",
    title: "Piața",
    label: "la Piață",
    showIf: ["piata"],
    open: {
      label: "Orice altceva despre Piață",
      help: "A tras public spre festival sau a pierdut public din cauza suprapunerilor? Ce nu încape în listele de sus?",
    },
  },
  {
    key: "trupe",
    title: "trupele și participanții",
    label: "la felul în care am primit trupele",
    showIf: ["trupe"],
    open: {
      label: "Au avut trupele tot ce le trebuia?",
      help: "Program, spații de repetiție, mâncare, informații la timp, cineva la care să întrebe. Ce le-a lipsit?",
    },
  },
  {
    key: "ateliere",
    title: "atelierele",
    label: "la ateliere",
    showIf: ["ateliere"],
    open: {
      label: "Orice altceva despre ateliere",
      help: "Înscrieri, prezență, spații, traineri, materiale. De ce s-a întâmplat ce s-a întâmplat?",
    },
  },
  {
    key: "invitati",
    title: "invitații și mentorii",
    label: "la relația cu invitații",
    showIf: ["invitati"],
    open: {
      label: "A fost clar pentru invitați ce se așteaptă de la ei?",
      help: "Program, cazare, cine îi însoțește, cine le răspunde la întrebări, partea de contracte și plăți.",
    },
  },
  {
    key: "ev",
    title: "evenimentul tău",
    label: "la evenimentul tău",
    showIf: ["evenimente", "gale"],
    note: "Doar despre evenimentele de care ai fost tu responsabil/ă.",
    before: [
      {
        type: "short",
        id: "ev_care",
        label: "De ce eveniment sau evenimente ai fost responsabil/ă?",
      },
    ],
    open: {
      label: "Ce ți-ar trebui diferit anul viitor pentru același eveniment?",
      help: "Oameni, timp de pregătire, buget, tehnic, o decizie luată mai din vreme.",
    },
  },
  {
    key: "com",
    title: "comunicare și promovare",
    label: "la comunicare",
    showIf: ["comunicare"],
    open: {
      label: "Ai primit la timp ce îți trebuia de la celelalte departamente?",
      help: "Program final, acces în săli, informații despre invitați, aprobări, materiale.",
    },
  },
  {
    key: "vol",
    title: "voluntarii",
    label: "la coordonarea voluntarilor",
    showIf: ["voluntari"],
    open: {
      label: "Au fost destui și au știut ce au de făcut?",
      help: "Recrutare, ture, brief-uri, ce se întâmpla când cineva nu venea.",
    },
  },
  {
    key: "part",
    title: "parteneri și finanțare",
    label: "la partea de parteneri și finanțare",
    showIf: ["parteneri"],
    open: {
      label: "Ce am promis partenerilor și nu am livrat, sau invers?",
      help: "Și partea de bugete: unde ne-au lipsit banii și unde am cheltuit degeaba.",
    },
  },
  {
    key: "oras",
    title: "orașul și instituțiile",
    label: "la relația cu orașul",
    showIf: ["oras"],
    open: {
      label: "Cum a mers relația cu instituțiile și cu vecinii locațiilor?",
      help: "Primărie, școli, avize, plângeri, oameni care ne-au ajutat și merită ținuți aproape.",
    },
  },
  {
    key: "loc",
    title: "locații și logistică",
    label: "la locații și logistică",
    showIf: ["logistica", "cazare"],
    note: "Secțiunea asta apare pentru că ai lucrat pe logistică sau pe cazare.",
    open: {
      label: "Ce spațiu ne-a lipsit?",
      help: "O sală, un depozit, un loc de stat al echipei, o cameră de liniște, un spațiu de repetiții. Și unde a scârțâit cel mai tare logistica.",
    },
  },
];

const zoneSection = (z: (typeof ZONE_SECTIONS)[number]): Section => ({
  id: z.key,
  title: z.title,
  showIf: z.showIf,
  optionalNote: z.note ?? `Secțiunea asta apare pentru că ai bifat "${z.title}".`,
  questions: [
    ...(z.before ?? []),
    ...zoneQuestions(z.label, z.key),
    { type: "long", id: `${z.key}_context`, label: z.open.label, help: z.open.help },
  ],
});

export const SECTIONS: Section[] = [
  {
    id: "tine",
    title: "despre tine",
    intro:
      "Din bifele de mai jos se construiește restul formularului. Nu te întrebăm despre zone în care n-ai fost.",
    questions: [
      {
        type: "short",
        id: "nume",
        label: "Numele tău",
        help: "Opțional. Poți completa anonim. Dacă îți scrii numele, putem reveni la tine pentru detalii sau ca să ducem mai departe o idee.",
        placeholder: "opțional",
        greet: true,
      },
      {
        type: "short",
        id: "rol",
        label: "Ce rol ai avut la #21?",
        placeholder: "ex. coordonare logistică, foto-video, voluntar pe Piață",
        required: true,
      },
      {
        type: "choice",
        id: "editii",
        label: "A câta ediție a fost pentru tine?",
        options: ["prima", "a doua", "a treia", "mai multe"],
      },
      {
        type: "zones",
        id: "zone",
        label: "În ce zone ai fost implicat/ă direct sau ai văzut de aproape?",
        help: "Bifează tot ce se aplică. Ce nu bifezi, nu te mai întreabă nimeni.",
        required: true,
      },
    ],
  },

  {
    id: "stare",
    title: "cum ai trecut prin festival",
    intro: "Înainte de organizare, oamenii. Cum a fost pentru tine, nu cum ar fi trebuit să fie.",
    questions: [
      {
        type: "words",
        id: "stare_cuvinte",
        label: "Alege până la trei cuvinte care descriu cum te-ai simțit cel mai des.",
        options: MOOD_WORDS,
        max: 3,
        required: true,
      },
      {
        type: "long",
        id: "moment_bun",
        label: "Un moment în care ai simțit că merită.",
        help: "Momentele astea ajung în deschiderea ediției următoare.",
      },
      {
        type: "long",
        id: "moment_greu",
        label: "Un moment în care ți-a fost greu.",
        help: "Ce s-a întâmplat și ce ar fi ajutat atunci, pe loc.",
      },
      {
        type: "scale",
        id: "s_sustinere",
        label: "Când ți-a fost greu, te-ai simțit susținut/ă?",
        low: "am fost pe cont propriu",
        high: "am avut sprijin imediat",
      },
      {
        type: "scale",
        id: "s_epuizare",
        label: "Cu cât ai terminat festivalul, ca energie?",
        low: "pe jantă",
        high: "încă aveam benzină",
      },
      {
        type: "choice",
        id: "revenire",
        label: "Ai vrea să revii în echipă la #22?",
        help: "Răspunsul ăsta ne spune, mai bine decât orice altceva, cum a fost de fapt să lucrezi cu noi. Dacă vrei să explici, scrie la ultima întrebare din formular.",
        options: ["da", "da, dar în alt rol", "nu știu încă", "probabil nu"],
      },
    ],
  },

  {
    id: "rol",
    title: "rolul tău",
    intro: "Cât de clar a fost ce trebuie să faci și dacă ai avut cu ce.",
    questions: [
      {
        type: "scale",
        id: "s_claritate",
        label: "Cât de clare au fost responsabilitățile în echipă?",
        low: "deloc clare",
        high: "foarte clare",
        required: true,
      },
      {
        type: "long",
        id: "claritate_de_ce",
        label: "De ce ai dat nota asta?",
        help: "Dacă a fost un moment în care n-ai știut cine decide sau cine face, scrie-l aici.",
      },
      {
        type: "long",
        id: "lipsit",
        label: "Ce ți-a lipsit ca să-ți faci treaba mai bine?",
        help: "Timp, oameni, informație, buget, echipament, o decizie luată mai devreme.",
      },
    ],
  },

  {
    id: "flow",
    title: "flow și program",
    intro: "Partea pe care a simțit-o toată lumea, oriunde a lucrat.",
    questions: [
      {
        type: "long",
        id: "suprapuneri_triaj",
        label:
          "La suprapunerile din program: care merită păstrate (e ok să ruleze în paralel) și care trebuie neapărat separate anul viitor?",
        help: "Dacă una te-a afectat direct, scrie cum s-a văzut: public împuținat, prea puțini oameni pe poziții, tu în două locuri deodată.",
      },
      {
        type: "scale",
        id: "s_comunicare",
        label: "Cât de bine a funcționat comunicarea în timp real?",
        low: "haotic",
        high: "impecabil",
      },
      {
        type: "long",
        id: "comunicare",
        label: "Ce ai schimba la grupuri, briefinguri și anunțuri de ultim moment?",
      },
    ],
  },

  ...ZONE_SECTIONS.map(zoneSection),

  {
    id: "oameni",
    title: "oameni și echipă",
    intro: "Cum au fost împărțiți oamenii între departamente.",
    questions: [
      {
        type: "long",
        id: "efort",
        label: "Cine a fost supraîncărcat și cine subfolosit?",
        help: "Poți scrie roluri, nu neapărat nume, dacă îți e mai comod.",
      },
      {
        type: "long",
        id: "departamente",
        label: "Unde s-a rupt firul între departamente?",
      },
      {
        type: "long",
        id: "crescut",
        label: "Pe cine ai văzut că a crescut sau a avut o contribuție care merită menționată?",
      },
    ],
  },

  {
    id: "grila",
    title: "cum a mers, pe zone",
    intro:
      "Câteva note de câte două secunde. Apar doar zonele pe care ai avut cum să le vezi. Din ele iese o hartă a festivalului: ce se compară între ele și cu edițiile viitoare.",
    questions: [
      {
        type: "grid",
        id: "grila",
        label: "Cum a mers, din ce ai văzut tu?",
        help: 'Dacă n-ai avut cum să vezi o zonă, apasă "n-am văzut". E un răspuns bun, nu unul lipsă.',
        low: "a mers prost",
        high: "a mers foarte bine",
      },
      {
        type: "long",
        id: "zona_lipsa",
        label: "Ce parte a festivalului nu apare mai sus și merită discutată?",
        help: "Zonele mici se pierd ușor: merch, acreditări, foto de la gale, transportul de la gară, punctul medical, curățenia, muzica din pauze, petrecerea echipei. Scrie orice a fost al tău și nu l-a întrebat nimeni.",
      },
    ],
  },

  {
    id: "idei",
    title: "ce schimbăm la #22",
    intro: "Partea care se transformă direct în deciziile pentru ediția următoare.",
    questions: [
      {
        type: "items",
        id: "top3",
        label: "Dacă la #22 s-ar schimba doar trei lucruri, care ar fi?",
        help: "În ordinea importanței, cel mai important primul. Scurt, ca să se poată număra între noi toți. Poate fi și ceva din pregătirea de dinainte, nu doar din zilele festivalului.",
        slots: 3,
        ranked: true,
        accent: "change",
        required: true,
      },
      {
        type: "long",
        id: "idee",
        label: "Ce idee nouă ai propune pentru #22?",
        help: "Orice: un format, un eveniment, o regulă internă, un fel de a lucra. Dacă e o idee de care te-ai ocupa chiar tu, scrie și asta.",
      },
    ],
  },

  {
    id: "final",
    title: "note de final",
    questions: [
      {
        type: "scale",
        id: "s_general",
        label: "Cât de mulțumit/ă ești de #21 per ansamblu?",
        low: "deloc",
        high: "foarte",
        required: true,
      },
      {
        type: "long",
        id: "recomanzi",
        label: "Pe cine ai recomanda în echipa principală de la #22? De ce?",
      },
      {
        type: "long",
        id: "orice",
        label: "Mai vrei să ne spui că...",
        placeholder: "orice n-a încăput mai sus",
        placeholders: [
          "orice n-a încăput mai sus",
          "o glumă internă de la #21",
          "ce ți-a plăcut și nu te-a întrebat nimeni",
          "un mesaj pentru echipa de la #22",
          "ce ar trebui să nu uităm niciodată",
        ],
      },
    ],
  },
];

/** Secțiunile pe care le vede cineva, în funcție de zonele bifate. */
export const visibleSections = (zone: ZoneId[]): Section[] =>
  SECTIONS.filter((s) => !s.showIf || s.showIf.some((z) => zone.includes(z)));

/** Toate întrebările obligatorii dintr-un set de secțiuni vizibile. */
export const requiredIds = (sections: Section[]): string[] =>
  sections.flatMap((s) => s.questions.filter((q) => q.required).map((q) => q.id));

/** Câte câmpuri are formularul cuiva. Folosit în teste, ca să nu se lungească. */
export const fieldCount = (zone: ZoneId[]): number =>
  visibleSections(zone).reduce((n, s) => n + s.questions.length, 0);
