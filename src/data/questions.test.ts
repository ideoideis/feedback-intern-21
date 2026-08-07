import { describe, expect, it } from "vitest";
import {
  DEPARTMENTS,
  DEPARTMENT_PRIVATE,
  zoneDeepQuestions,
  DIMENSIONS,
  DIM_OPTIONS,
  MOOD_WORDS,
  SECTIONS,
  ZONES,
  fieldCount,
  requiredIds,
  visibleSections,
  type ZoneId,
} from "./questions";
import { CHOICE_REACTIONS, HAPPY_CHOICES, HAPPY_WORDS, SCALE_REACTIONS, WORD_REACTIONS } from "./reactions";

const ids = (zone: ZoneId[]) => visibleSections(zone).map((s) => s.id);
const zoneSections = SECTIONS.filter((s) => s.showIf);
const allQuestions = [
  ...SECTIONS.flatMap((s) => s.questions),
  ...ZONES.flatMap((z) => zoneDeepQuestions(z.id)),
];

describe("aceleași pagini pentru toată lumea", () => {
  it("are șase secțiuni, oricâte direcții a bifat cineva", () => {
    // Înainte, fiecare bifă dădea o pagină: cine atinsese șapte zone abandona
    // pe drum ("am ajuns la 11 din 20", la testare). Acum detaliul pe zone stă
    // într-o singură pagină, opțională.
    expect(SECTIONS.map((s) => s.id)).toEqual([
      "tine",
      "stare",
      "program",
      "echipa",
      "detaliu",
      "final",
    ]);
    expect(visibleSections([])).toHaveLength(6);
  });

  it("nu mai există bife obligatorii de implicare pe prima pagină", () => {
    const tine = SECTIONS.find((s) => s.id === "tine")!;
    expect(tine.questions.map((q) => q.id)).toEqual(["nume", "departament", "editii"]);
  });

  it("pagina de detaliu nu cere nimic", () => {
    const detaliu = SECTIONS.find((s) => s.id === "detaliu")!;
    expect(requiredIds([detaliu])).toEqual([]);
  });

  it("nu mai există nicio secțiune care depinde de bife", () => {
    expect(SECTIONS.filter((s) => s.showIf)).toEqual([]);
  });
});

describe("întrebările unei zone", () => {
  it("fiecare zonă are aceleași patru întrebări, în aceeași ordine", () => {
    for (const z of ZONES) {
      const tipuri = zoneDeepQuestions(z.id).map((q) => q.type);
      expect(tipuri.slice(0, 4), `zona ${z.label}`).toEqual(["matrix", "items", "items", "long"]);
      // Welcome packs are o a doua întrebare deschisă: conținut, plus montarea.
      expect(tipuri.slice(4), `zona ${z.label}`).toEqual(z.id === "welcomepacks" ? ["long"] : []);
    }
  });

  it("id-urile sunt prefixate cu zona, ca să nu se suprascrie în jsonb", () => {
    for (const z of ZONES)
      for (const q of zoneDeepQuestions(z.id))
        expect(q.id.startsWith(`${z.id}_`), `${q.id} nu e prefixat cu ${z.id}`).toBe(true);
  });

  it("listele au același număr de rânduri, ca să fie comparabile între zone", () => {
    const slots = ZONES.flatMap((z) =>
      zoneDeepQuestions(z.id)
        .filter((q) => q.type === "items")
        .map((q) => (q.type === "items" ? q.slots : 0)),
    );
    expect(new Set(slots)).toEqual(new Set([2]));
  });

  it("întrebarea deschisă e diferită la fiecare zonă", () => {
    const deschise = ZONES.map(
      (z) => zoneDeepQuestions(z.id).filter((q) => q.type === "long")[0]?.label,
    );
    expect(new Set(deschise).size).toBe(deschise.length);
  });

  it("nu întreabă un departament despre treaba altuia", () => {
    // Cazul lui Anuța: cine alege foto-video nu vede întrebări despre tehnic.
    const foto = zoneDeepQuestions("fotovideo")
      .map((q) => q.label.toLowerCase())
      .join(" ");
    expect(foto).not.toContain("tehnic");
    expect(foto).not.toContain("transport");
  });
});

describe("grila de diagnostic", () => {
  it("are cele cinci dimensiuni și trei variante", () => {
    expect(DIMENSIONS.map((d) => d.id)).toEqual(["oameni", "timp", "informatie", "resurse", "decizii"]);
    expect(DIM_OPTIONS.map((o) => o.id)).toEqual(["ok", "muchie", "lipsa"]);
  });

  it("apare la fiecare direcție, cu id-ul direcției", () => {
    for (const s of zoneSections) {
      const matrix = s.questions.find((q) => q.type === "matrix");
      expect(matrix?.id, `direcția ${s.id}`).toBe(`${s.id}_diag`);
    }
  });
});

describe("întrebările obligatorii", () => {
  it("cere tot ce se răspunde repede, dar nu textul lung", () => {
    // Oamenii sar peste ce e opțional, deci notele, alegerile și răspunsurile
    // scurte care se pot număra sunt obligatorii. Textul lung rămâne la
    // latitudinea fiecăruia: forțat, iese "nu știu".
    expect(requiredIds(visibleSections([]))).toEqual([
      "departament",
      "editii",
      "stare_cuvinte",
      "s_sustinere",
      "s_epuizare",
      "revenire",
      "volum",
      "program_taie",
      "s_program",
      "moment_zi",
      "s_claritate",
      "claritate_de_ce",
      "top3",
      "zona_bine",
      "zona_prost",
      "s_general",
    ]);
  });

  it("lasă opțional textul lung și pagina de detaliu", () => {
    const optionale = SECTIONS.flatMap((s) =>
      s.questions.filter((q) => !q.required).map((q) => q.id),
    );
    for (const id of ["nume", "moment_bun", "moment_greu", "nefacut", "recomanzi", "orice", "zone"])
      expect(optionale, `${id} ar trebui să rămână opțional`).toContain(id);
  });

  it("nu cere rolul, ca numele opțional să însemne ceva", () => {
    // Rolul din structura echipei identifică exact o persoană.
    expect(allQuestions.map((q) => q.id)).not.toContain("rol");
    const nume = allQuestions.find((q) => q.id === "nume");
    expect(nume?.required).toBeFalsy();
  });

  it("dă și varianta de a nu spune departamentul", () => {
    const dept = allQuestions.find((q) => q.id === "departament");
    expect(dept?.type).toBe("choice");
    expect(dept?.type === "choice" && dept.options).toEqual([...DEPARTMENTS, DEPARTMENT_PRIVATE]);
  });
});

describe("fără întrebări care se repetă", () => {
  it("nu are id-uri duplicate (altfel răspunsurile se suprascriu în jsonb)", () => {
    const all = allQuestions.map((q) => q.id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("nu are două întrebări cu exact același text", () => {
    // Prinde cazul în care o întrebare ajunge, prin copiere, în două secțiuni.
    const comune = SECTIONS.filter((s) => !s.showIf).flatMap((s) => s.questions.map((q) => q.label));
    expect(new Set(comune).size).toBe(comune.length);
  });

  it("nu întreabă de două ori în secțiunile comune despre același lucru", () => {
    const comune = SECTIONS.filter((s) => !s.showIf)
      .flatMap((s) => s.questions.map((q) => q.label.toLowerCase()))
      .join(" ");
    // "ce ți-a lipsit" a fost înlocuit de grila de diagnostic (rândul resurse),
    // iar efortul din echipă de rândul oameni. Nu trebuie să reapară.
    expect(comune).not.toContain("ce ți-a lipsit");
    expect(comune).not.toContain("supraîncărcat");
  });

  it("nu folosește diacritice în id-uri (chei de coloană / jsonb)", () => {
    for (const q of allQuestions) expect(q.id).toMatch(/^[a-z0-9_]+$/);
  });
});

describe("lungimea formularului", () => {
  it("are aceleași câmpuri pentru toată lumea", () => {
    // Pagina de detaliu are o singură întrebare; ce apare în ea depinde de
    // câte zone alege omul acolo, și e opțional.
    expect(fieldCount([])).toBeLessThanOrEqual(30);
  });

  it("o zonă aleasă în detaliu adaugă patru întrebări, nu o pagină", () => {
    expect(zoneDeepQuestions("piata")).toHaveLength(4);
  });
});

describe("reacțiile (easter eggs)", () => {
  it("fiecare scală are reacții pentru toate cele cinci note", () => {
    for (const q of allQuestions.filter((q) => q.type === "scale")) {
      const set = SCALE_REACTIONS[q.id];
      expect(set, `lipsesc reacțiile pentru ${q.id}`).toBeDefined();
      expect(Object.keys(set)).toEqual(["1", "2", "3", "4", "5"]);
    }
  });

  it("fiecare întrebare cu pastile are reacții pentru toate variantele", () => {
    for (const q of allQuestions.filter((q) => q.type === "choice")) {
      if (q.type !== "choice") continue;
      const set = CHOICE_REACTIONS[q.id];
      expect(set, `lipsesc reacțiile pentru ${q.id}`).toBeDefined();
      for (const o of q.options) expect(set[o], `lipsește reacția la "${o}" (${q.id})`).toBeTruthy();
    }
  });

  it("fiecare cuvânt de stare are un răspuns", () => {
    for (const w of MOOD_WORDS) expect(WORD_REACTIONS[w], `lipsește reacția la "${w}"`).toBeTruthy();
  });

  it("inimioarele merg doar la lucrurile bune", () => {
    for (const w of HAPPY_WORDS) expect(MOOD_WORDS).toContain(w);
    for (const rau of ["frustrat/ă", "copleșit/ă", "invizibil/ă", "epuizat/ă"])
      expect(HAPPY_WORDS).not.toContain(rau);
    for (const rau of ["probabil nu", "prea încărcat", DEPARTMENT_PRIVATE])
      expect(HAPPY_CHOICES).not.toContain(rau);
  });
});
