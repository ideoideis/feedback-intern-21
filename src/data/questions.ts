/**
 * Conținutul formularului de feedback pentru echipa internă, ideo ideis #21.
 *
 * Totul e declarativ: ca să schimbi o întrebare, editezi textul de aici.
 * Pagina (src/pages/Index.tsx) se construiește singură din structura asta.
 *
 * Pentru cine: echipa mare (board, artistic, welcoming, comunicare, tehnic,
 * producție, financiar, website). NU pentru voluntari, juniori și shtanga boyz,
 * care au nevoie de alt formular, cu alte întrebări.
 *
 * Cum e construit, și de ce:
 *
 * 1. Nimeni nu e întrebat despre ce n-a lucrat. Prima secțiune întreabă de ce
 *    s-a ocupat fiecare, din direcțiile reale ale festivalului, și pentru fiecare
 *    bifă primește o secțiune. Cine a făcut foto-video nu vede întrebări despre
 *    sunetul de la gale.
 *
 * 2. Aceleași cinci dimensiuni la fiecare direcție (oameni, timp, informație,
 *    resurse, decizii). Asta e coloana vertebrală: dacă "informația a lipsit"
 *    apare la nouă direcții din douăzeci, ai găsit problema ediției fără să
 *    citești un rând de text. Fără grila asta, întrebările deschise ies ori prea
 *    generale, ori prea nișate, și răspunsurile nu se pot compara între ele.
 *
 * 3. Fără nume și fără rol obligatoriu. Rolul ar identifica exact o persoană
 *    ("Coord. Ateliere" e un singur om), deci ar face degeaba numele opțional.
 *    Rămâne doar departamentul, care e un grup, plus "prefer să nu spun" pentru
 *    departamentele mici.
 */

/**
 * Cifrele de pe ecranul de mulțumire.
 *
 * CORECTEAZĂ-LE. Sunt numărate din lista de echipă de la #21 (board, artistic,
 * welcoming, comunicare, tehnic, producție, financiar, website, plus voluntari,
 * juniori și shtanga boyz) și nu includ trupele, publicul sau copiii de la
 * ateliere, pentru că nu am cifrele lor.
 */
export const FESTIVAL_STATS = {
  oameni_in_echipa: 183,
};

/** Departamentele din structura echipei. Pentru filtrat în Excel. */
export const DEPARTMENTS: string[] = [
  "Board",
  "Artistic",
  "Welcoming",
  "Comunicare",
  "Tehnic",
  "Producție",
  "Financiar",
  "Website",
];

/** Ultima variantă de la departament, pentru cine e singur în departamentul lui. */
export const DEPARTMENT_PRIVATE = "prefer să nu spun";

export type ZoneId =
  | "participanti"
  | "invitati"
  | "piata"
  | "indoor"
  | "kaufland"
  | "ateliere"
  | "scenografie"
  | "tehnic_out"
  | "tehnic_in"
  | "productie"
  | "transporturi"
  | "cazari"
  | "mese"
  | "welcomepacks"
  | "voluntari"
  | "comunicare"
  | "fotovideo"
  | "sponsori"
  | "financiar"
  | "website"
  | "ticketing"
  | "altele";

export type Zone = { id: ZoneId; label: string; hint?: string };

/**
 * Direcțiile de lucru, așa cum le-a dat echipa. O singură listă, fără capete de
 * grup: împărțirea pe departamente ar sugera că bifezi unde ești încadrat, nu de
 * ce te-ai ocupat efectiv. Ordinea le ține pe cele înrudite una lângă alta.
 */
export const ZONES: Zone[] = [
  { id: "participanti", label: "Participanți", hint: "trupele, program, repetiții, însoțitori" },
  { id: "invitati", label: "Invitați", hint: "invitații, program, însoțire, contracte" },
  { id: "piata", label: "Piața" },
  { id: "indoor", label: "Evenimente indoor" },
  { id: "kaufland", label: "Kaufland" },
  { id: "ateliere", label: "Ateliere" },
  { id: "scenografie", label: "Scenografie" },
  { id: "tehnic_out", label: "Tehnic outdoor" },
  { id: "tehnic_in", label: "Tehnic indoor" },
  { id: "productie", label: "Producție" },
  { id: "transporturi", label: "Transporturi" },
  { id: "cazari", label: "Cazări" },
  { id: "mese", label: "Mese" },
  { id: "welcomepacks", label: "Welcome packs" },
  { id: "voluntari", label: "Voluntari" },
  { id: "comunicare", label: "Comunicare" },
  { id: "fotovideo", label: "Foto și video" },
  { id: "sponsori", label: "Sponsori" },
  { id: "financiar", label: "Financiar" },
  { id: "website", label: "Website" },
  { id: "ticketing", label: "Ticketing" },
  { id: "altele", label: "Altceva", hint: "HQ, punct medical, curățenie, merch, orice altceva" },
];

/** Cele cinci lucruri care decid dacă o direcție a funcționat sau nu. */
export const DIMENSIONS: { id: string; label: string; hint: string }[] = [
  { id: "oameni", label: "Oameni", hint: "câți am fost, cât de pregătiți" },
  { id: "timp", label: "Timp", hint: "când am început, cât a durat pe teren" },
  { id: "informatie", label: "Informație", hint: "a ajuns la timp de la ceilalți" },
  { id: "resurse", label: "Resurse", hint: "bani, materiale, echipament, spațiu" },
  { id: "decizii", label: "Decizii", hint: "cine decide și cât de repede" },
];

/** Variantele din grila de diagnostic, de la bine la rău. */
export const DIM_OPTIONS: { id: string; label: string }[] = [
  { id: "ok", label: "a fost ok" },
  { id: "muchie", label: "pe muchie" },
  { id: "lipsa", label: "a lipsit" },
];

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
      /** Grila de diagnostic: cele cinci dimensiuni pe trei variante. */
      type: "matrix";
      id: string;
      label: string;
      help?: string;
      required?: boolean;
    }
  | {
      /**
       * Pagina opțională de detaliu: alegi una sau mai multe zone dintre cele
       * bifate, și întrebările lor apar aici, în aceeași pagină.
       */
      type: "zonedeep";
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
 * O direcție de lucru primește mereu aceleași patru întrebări: grila de
 * diagnostic, două lucruri de păstrat, două de schimbat, un câmp liber. Faptul
 * că sunt identice e tot scopul: răspunsurile se pot compara și număra între
 * direcții.
 */
const ZONE_SECTIONS: {
  key: ZoneId;
  title: string;
  /** Cum se citește în întrebări: "Ce trebuie păstrat <label>?" */
  label: string;
  /** Întrebarea deschisă de la finalul secțiunii, specifică direcției. */
  open: { label: string; help?: string };
  /** A doua întrebare deschisă, doar unde chiar e nevoie de două. */
  open2?: { label: string; help?: string };
}[] = [
  {
    key: "participanti",
    title: "participanții",
    label: "la relația cu participanții",
    open: {
      label: "Ce feedback ai auzit de la trupe și ar trebui luat în considerare?",
      help: "Ce ți-au spus direct sau ce ai prins din discuții: program, repetiții, mâncare, cazare, cum au fost primiți.",
    },
  },
  {
    key: "invitati",
    title: "invitații",
    label: "la relația cu invitații",
    open: {
      label: "Ce feedback ai auzit de la invitați și ar trebui luat în considerare?",
      help: "Ce le-a lipsit sau ce ne-au cerut și nu am putut duce: program, cazare, însoțire, contracte, plăți.",
    },
  },
  {
    key: "piata",
    title: "Piața",
    label: "la Piață",
    open: {
      label: "Unde și la ce ore ar trebui să fie Piața la #22?",
      help: "Poziționarea, fluxul oamenilor, ora de deschidere și de închidere. Dacă rămâne bine cum a fost, scrie asta.",
    },
  },
  {
    key: "indoor",
    title: "evenimentele indoor",
    label: "la evenimentele indoor",
    open: {
      label: "Ce eveniment ar trebui mutat în altă sală sau la altă oră la #22?",
      help: "Și de ce: capacitate, tehnic, distanța dintre spații, publicul care nu ajungea, tranzițiile prea scurte.",
    },
  },
  {
    key: "kaufland",
    title: "Kaufland",
    label: "la Kaufland",
    open: {
      label: "Ce feedback ai auzit despre Kaufland, de la public sau de la ei?",
      help: "Ce ne-au cerut, ce a mers pentru ei, ce a mers pentru noi, ce am promis și nu am livrat.",
    },
  },
  {
    key: "ateliere",
    title: "atelierele",
    label: "la ateliere",
    open: {
      label: "Ce feedback ai auzit de la traineri sau de la participanți?",
      help: "Despre spații, orar, materiale, înscrieri, nivelul grupelor.",
    },
  },
  {
    key: "scenografie",
    title: "scenografia",
    label: "la scenografie",
    open: {
      label: "Ce s-a desenat și nu s-a putut executa? De ce?",
      help: "Timp, bani, materiale, oameni la montaj, transport, depozitare, demontare.",
    },
  },
  {
    key: "tehnic_out",
    title: "tehnicul outdoor",
    label: "la tehnicul outdoor",
    open: {
      label: "Ce s-a cerut și nu s-a putut face tehnic, afară?",
      help: "Curent, sunet în aer liber, vremea, montaj și demontaj, echipamente, ce am improvizat.",
    },
  },
  {
    key: "tehnic_in",
    title: "tehnicul indoor",
    label: "la tehnicul indoor",
    open: {
      label: "Ce s-a cerut și nu s-a putut face tehnic, în sală?",
      help: "Timp de probe, lumini, sunet, regie, tranziții între evenimente, ce am improvizat.",
    },
  },
  {
    key: "productie",
    title: "producția",
    label: "la producție",
    open: {
      label: "Ce s-a cumpărat prea târziu, degeaba, sau a lipsit de tot?",
      help: "Și cum a mers fluxul: cine cere, cine aprobă, cine cumpără, cine cară.",
    },
  },
  {
    key: "transporturi",
    title: "transporturile",
    label: "la transporturi",
    open: {
      label: "Cum s-au cerut și s-au confirmat cursele? Unde s-a așteptat degeaba?",
      help: "Cine cerea, cine confirma, orare, mașini, șoferi, drumuri făcute pe jumătate goale.",
    },
  },
  {
    key: "cazari",
    title: "cazările",
    label: "la cazări",
    open: {
      label: "Unde au fost cele mai multe nemulțumiri la cazare și ce le-a cauzat?",
      help: "Camere, repartizări, curățenie, cine gestiona reclamațiile, ce s-a rezolvat pe loc.",
    },
  },
  {
    key: "mese",
    title: "mesele",
    label: "la mese",
    open: {
      label: "Unde ar trebui să mănânce participanții la #22 și ce nu a funcționat la locul de acum?",
      help: "Spațiul, distanța, orarele, cozile, cantitățile, nevoile speciale, cine rămânea nemâncat.",
    },
  },
  {
    key: "welcomepacks",
    title: "welcome packs",
    label: "la welcome packs",
    open: {
      label: "Ce ar trebui să fie în welcome pack la #22 și ce iese?",
      help: "Ce s-a folosit, ce a rămas aruncat, ce ne-a cerut lumea și nu era.",
    },
    open2: {
      label: "Când și cum ar trebui montate pachetele?",
      help: "Realist, cu timpul, locul și oamenii disponibili înainte de festival. Scrie și varianta ideală, dacă e alta.",
    },
  },
  {
    key: "voluntari",
    title: "voluntarii",
    label: "la voluntari",
    open: {
      label: "Cum le-am putea crește interesul și moralul, ca la #22 să fie mai implicați?",
      help: "Ce i-a motivat și ce i-a demotivat: ture, brief-uri, mâncare, cazare, apartenență, cine ținea de ei.",
    },
  },
  {
    key: "comunicare",
    title: "comunicarea",
    label: "la comunicare",
    open: {
      label: "Ce a adus public și ce a fost efort degeaba?",
      help: "Ce a funcționat online și offline, ce am făcut din obișnuință, ce n-a văzut nimeni.",
    },
  },
  {
    key: "fotovideo",
    title: "foto și video",
    label: "la foto și video",
    open: {
      label: "Ce am ratat ca imagine și de ce?",
      help: "Acces, informații primite târziu, echipament, prea puțini oameni, livrarea materialelor.",
    },
  },
  {
    key: "sponsori",
    title: "sponsorii",
    label: "la sponsori",
    open: {
      label: "Ce am promis sponsorilor și nu am livrat, sau invers?",
      help: "Vizibilitate, rapoarte, cine ținea legătura, ce ne-au cerut și n-am putut duce.",
    },
  },
  {
    key: "financiar",
    title: "partea financiară",
    label: "la partea financiară",
    open: {
      label: "Unde ne-au lipsit banii și unde am cheltuit degeaba?",
      help: "Cât de repede se decidea, cum au mers avansurile și decontările, ce a stat blocat.",
    },
  },
  {
    key: "website",
    title: "website",
    label: "la site",
    open: {
      label: "Ce ar trebui să facă site-ul și nu face?",
      help: "Program, informații, actualizări, ce întrebări primeai des pentru că nu erau pe site.",
    },
  },
  {
    key: "ticketing",
    title: "ticketing",
    label: "la ticketing",
    open: {
      label: "Unde s-a blocat ticketingul și ce ai automatiza?",
      help: "Rezervări, cozi, locuri, oameni care au rezervat și nu au venit, ce s-a făcut de mână.",
    },
  },
  {
    key: "altele",
    title: "altceva",
    label: "la zona pe care ai bifat-o",
    open: {
      label: "Despre ce e vorba și cum a mers?",
      help: "Spune-ne cât să înțelegem, fiindcă noi nu am pus întrebări despre zona asta.",
    },
  },
];

/**
 * Exemplele din câmpurile scurte, per direcție.
 *
 * Sunt teme, nu propuneri: "programul din sală" spune ce fel de lucru se scrie
 * acolo, fără să sugereze răspunsul. Un exemplu de forma "programul final cu
 * două săptămâni înainte" pune deja răspunsul în gura omului.
 */
const EXAMPLES: Record<string, { keep: string; change: string }> = {
  participanti: { keep: "cine ține legătura cu trupele", change: "modul de selecție al trupelor" },
  invitati: { keep: "cine îi contactează", change: "programul lor pe zile" },
  piata: { keep: "amplasare scenă mică", change: "programul evenimentelor" },
  indoor: { keep: "programul din sală", change: "programul din sală" },
  kaufland: { keep: "ora de deschidere", change: "programul de acolo" },
  ateliere: { keep: "împărțirea pe grupe", change: "orarul atelierelor" },
  scenografie: { keep: "echipa de montaj", change: "timpul de execuție" },
  tehnic_out: { keep: "sonorizarea din piață", change: "timpul de montaj" },
  tehnic_in: { keep: "regia din sală", change: "timpul de probe" },
  productie: { keep: "lista de achiziții", change: "fluxul de aprobări" },
  transporturi: { keep: "orarul curselor", change: "cine confirmă cursele" },
  cazari: { keep: "repartizarea pe camere", change: "locul de cazare" },
  mese: { keep: "orarul meselor", change: "locul unde se mănâncă" },
  welcomepacks: { keep: "ce conțin", change: "când se montează" },
  voluntari: { keep: "brief-ul de dimineață", change: "împărțirea pe ture" },
  comunicare: { keep: "tonul din online", change: "calendarul de postări" },
  fotovideo: { keep: "împărțirea pe evenimente", change: "lista de momente obligatorii" },
  sponsori: { keep: "cine ține legătura", change: "ce le promitem" },
  financiar: { keep: "modul de decontare", change: "termenele de plată" },
  website: { keep: "structura paginii de program", change: "cine actualizează programul" },
  ticketing: { keep: "sistemul de rezervări", change: "gestionarea locurilor" },
  altele: { keep: "ce a funcționat acolo", change: "ce nu a funcționat acolo" },
};

/** Titlul zonei, pentru capul de bloc din pagina de detaliu. */
export const zoneTitle = (id: ZoneId): string =>
  ZONE_SECTIONS.find((z) => z.key === id)?.title ?? id;

/**
 * Întrebările unei zone: grila de diagnostic, două de păstrat, două de schimbat,
 * una deschisă, proprie zonei. Apar în pagina de detaliu, doar pentru zonele pe
 * care omul le alege acolo.
 */
export const zoneDeepQuestions = (id: ZoneId): Question[] => {
  const z = ZONE_SECTIONS.find((x) => x.key === id);
  if (!z) return [];
  return [
    {
      type: "matrix",
      id: `${z.key}_diag`,
      // `label` e deja forma cu prepoziție ("la Piață", "la mese"), doar o
      // scriem cu majusculă. Titlul secțiunii are articol și ar suna greșit.
      label: `${z.label[0].toUpperCase()}${z.label.slice(1)}, cum au stat lucrurile?`,
      help: "Aceleași cinci lucruri la toate direcțiile, ca să se poată compara.",
    },
    {
      type: "items",
      id: `${z.key}_keep`,
      label: `Ce trebuie păstrat ${z.label}?`,
      help: "Un lucru per rând. Ce ar fi o pierdere să dispară.",
      slots: 2,
      accent: "keep",
      placeholder: `ex. ${EXAMPLES[z.key].keep}`,
    },
    {
      type: "items",
      id: `${z.key}_change`,
      label: `Ce trebuie schimbat ${z.label}?`,
      help: "Un lucru per rând. Dacă știi și cum, scrie cum.",
      slots: 2,
      accent: "change",
      placeholder: `ex. ${EXAMPLES[z.key].change}`,
    },
    { type: "long", id: `${z.key}_context`, label: z.open.label, help: z.open.help },
    ...(z.open2
      ? [{ type: "long" as const, id: `${z.key}_context2`, label: z.open2.label, help: z.open2.help }]
      : []),
  ];
};

export const SECTIONS: Section[] = [
  {
    id: "tine",
    title: "despre tine",
    questions: [
      {
        type: "short",
        id: "nume",
        label: "Numele tău",
        help: "Poți completa anonim. Dacă îți scrii numele, putem reveni la tine pentru detalii.",
        placeholder: "opțional",
        greet: true,
      },
      {
        type: "choice",
        id: "departament",
        label: "Din ce departament ai făcut parte?",
        options: [...DEPARTMENTS, DEPARTMENT_PRIVATE],
        required: true,
      },
      {
        type: "choice",
        id: "editii",
        label: "A câta ediție a fost pentru tine?",
        options: ["prima", "a doua", "a treia", "mai multe"],
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
        required: true,
      },
      {
        type: "scale",
        id: "s_epuizare",
        label: "Cu cât ai terminat festivalul, ca energie?",
        low: "pe jantă",
        high: "încă aveam benzină",
        required: true,
      },
      {
        type: "choice",
        id: "revenire",
        label: "Ai vrea să revii în echipă la #22?",
        help: "Dacă vrei să explici, scrie la ultima întrebare din formular.",
        options: ["da", "da, dar în alt rol", "nu știu încă", "probabil nu"],
        required: true,
      },
    ],
  },

  {
    id: "program",
    title: "program și flow",
    intro: "Programul, văzut ca orar de muncă, nu ca spectator.",
    questions: [
      {
        type: "choice",
        id: "volum",
        label: "Cum a fost programul, ca volum?",
        options: ["prea încărcat", "cam bine", "am mai fi putut duce"],
        required: true,
      },
      {
        type: "items",
        id: "program_taie",
        label: "Ce ai tăia din program?",
        help: "Un lucru per rând.",
        slots: 2,
        accent: "change",
        placeholder: "ex. un eveniment care se suprapunea",
        required: true,
      },
      {
        type: "scale",
        id: "s_program",
        label: "Ai știut la timp programul și schimbările de ultim moment?",
        low: "aflam pe ultima sută",
        high: "știam mereu",
        required: true,
      },
      {
        type: "long",
        id: "program_info",
        label: "Unde s-a rupt informația despre program?",
        help: "Cine afla târziu, de la cine, și ce s-a stricat din cauza asta.",
      },
      {
        type: "choice",
        id: "moment_zi",
        label: "În ce moment se rupea ziua cel mai des?",
        options: [
          "dimineața, la început",
          "la tranziția între evenimente",
          "seara târziu",
          "noaptea, la demontat",
          "nu se rupea",
        ],
        required: true,
      },
      {
        type: "long",
        id: "suprapuneri_triaj",
        label:
          "La suprapunerile din program: care merită păstrate (e ok să ruleze în paralel) și care trebuie neapărat separate anul viitor?",
        help: "Dacă una te-a afectat direct, scrie cum s-a văzut: public împuținat, prea puțini oameni pe poziții, tu în două locuri deodată.",
      },
    ],
  },

  {
    id: "echipa",
    title: "echipa",
    questions: [
      {
        type: "long",
        id: "facut_degeaba",
        label: "Ce ai făcut tu și n-ar fi trebuit să fie treaba ta?",
      },
      {
        type: "long",
        id: "nefacut",
        label: "Ce nu s-a făcut deloc și ar fi trebuit?",
        help: "Lucrurile de care nu răspundea nimeni.",
      },
      {
        type: "long",
        id: "departamente",
        label: "Unde s-a rupt firul între departamente?",
        help: "Momentele în care două departamente au așteptat unul după altul, sau au făcut aceeași treabă de două ori.",
      },
      {
        // Un rând, nu o casetă: cere un nume, nu un eseu.
        type: "short",
        id: "ajutor",
        label: "Cine ți-a fost cel mai de ajutor?",
        placeholder: "un nume sau două",
      },
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
        required: true,
      },
    ],
  },

  {
    /**
     * Pagina opțională de detaliu.
     *
     * Înainte, fiecare bifă dădea o secțiune: cine a atins șapte zone primea
     * șapte pagini și abandona la a treia (chiar așa s-a întâmplat la testare,
     * "am ajuns la 11 din 20"). Acum e o singură pagină, opțională: alegi o zonă
     * și îi apar întrebările aici, alegi două și apar amândouă. Cine sare peste,
     * dă un tap și merge mai departe.
     */
    id: "detaliu",
    title: "feedback pe o zonă anume",
    intro:
      "Pagina asta e opțională. Alegi o zonă a festivalului din care ai făcut parte și ne spui la obiect ce a fost cu ea. Dacă nu vrei, apasă continuă și mergi la ultima pagină.",
    questions: [
      {
        type: "zonedeep",
        id: "zone",
        label: "Pe ce zonă vrei să dai feedback detaliat?",
        help: "Apasă o zonă și îți apar întrebările ei imediat sub. Poți alege mai multe, dacă ai lucrat pe mai multe. Poți să nu alegi niciuna.",
      },
    ],
  },

  {
    // Un singur final, nu două. Înainte erau "ce schimbăm la #22" și "note de
    // final" una după alta, cu aceeași senzație de încheiere de două ori.
    id: "final",
    title: "la final",
    questions: [
      {
        type: "items",
        id: "top3",
        label: "Dacă la #22 s-ar schimba doar trei lucruri, care ar fi?",
        help: "În ordinea importanței, cel mai important primul. Poate fi o reparație, dar și o idee nouă, sau ceva din pregătirea de dinainte.",
        slots: 3,
        ranked: true,
        accent: "change",
        placeholder: "ex. cine decide pe teren",
        required: true,
      },
      {
        type: "short",
        id: "zona_bine",
        label: "Care zonă a festivalului a mers cel mai bine?",
        help: "Din tot ce ai văzut, nu doar din ce ai lucrat.",
        required: true,
      },
      {
        type: "short",
        id: "zona_prost",
        label: "Care a mers cel mai prost?",
        required: true,
      },
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
        label: "Pe cine ai recomanda pentru un rol mai mare la #22? De ce?",
        help: "Inclusiv juniori, voluntari sau shtanga boyz.",
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
