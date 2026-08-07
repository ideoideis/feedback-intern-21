import { describe, expect, it } from "vitest";
import {
  DEPARTMENTS,
  DEPARTMENT_PRIVATE,
  DIMENSIONS,
  DIM_OPTIONS,
  MOOD_WORDS,
  SECTIONS,
  ZONES,
  ZONE_GROUPS,
  fieldCount,
  requiredIds,
  visibleSections,
  type ZoneId,
} from "./questions";
import { CHOICE_REACTIONS, HAPPY_CHOICES, HAPPY_WORDS, SCALE_REACTIONS, WORD_REACTIONS } from "./reactions";

const ids = (zone: ZoneId[]) => visibleSections(zone).map((s) => s.id);
const zoneSections = SECTIONS.filter((s) => s.showIf);
const allQuestions = SECTIONS.flatMap((s) => s.questions);

describe("secțiunile care se arată", () => {
  it("arată doar secțiunile comune când nu e bifat nimic", () => {
    expect(ids([])).toEqual(["tine", "stare", "program", "echipa", "idei", "final"]);
  });

  it("fiecare direcție bifată aduce exact o secțiune, a ei", () => {
    for (const z of ZONES) {
      const proprii = ids([z.id]).filter((id) => !ids([]).includes(id));
      expect(proprii, `direcția ${z.label}`).toEqual([z.id]);
    }
  });

  it("nu întreabă un departament despre treaba altuia", () => {
    // Cazul concret al lui Anuța: foto-video nu primește întrebări despre
    // tehnicul de la gale, despre transporturi sau despre bani.
    const fotovideo = ids(["fotovideo"]);
    expect(fotovideo).toContain("fotovideo");
    for (const strain of ["tehnic_in", "tehnic_out", "transporturi", "financiar", "cazari"])
      expect(fotovideo).not.toContain(strain);
  });

  it("două direcții bifate dau două secțiuni, în ordinea din listă", () => {
    expect(ids(["mese", "cazari"])).toEqual(ids(["cazari", "mese"]));
    expect(ids(["cazari", "mese"]).filter((id) => !ids([]).includes(id))).toEqual(["cazari", "mese"]);
  });

  it("arată tot cuiva care a bifat toate direcțiile", () => {
    expect(ids(ZONES.map((z) => z.id))).toHaveLength(SECTIONS.length);
  });
});

describe("direcțiile", () => {
  it("fiecare bifă are o secțiune și fiecare secțiune are o bifă", () => {
    expect(zoneSections.map((s) => s.id).sort()).toEqual(ZONES.map((z) => z.id).sort());
  });

  it("grupele acoperă toate direcțiile, fără dubluri", () => {
    const dinGrupe = ZONE_GROUPS.flatMap((g) => g.zones.map((z) => z.id));
    expect(new Set(dinGrupe).size).toBe(dinGrupe.length);
    expect(dinGrupe.sort()).toEqual(ZONES.map((z) => z.id).sort());
  });

  it("fiecare direcție începe cu aceleași patru întrebări, în aceeași ordine", () => {
    // Welcome packs are o a doua întrebare deschisă (conținut, plus montarea
    // lor). Restul au exact patru. Ordinea nu se schimbă la nimeni.
    for (const s of zoneSections) {
      const tipuri = s.questions.map((q) => q.type);
      expect(tipuri.slice(0, 4), `direcția ${s.id}`).toEqual(["matrix", "items", "items", "long"]);
      expect(tipuri.slice(4), `direcția ${s.id}`).toEqual(
        s.id === "welcomepacks" ? ["long"] : [],
      );
    }
  });

  it("listele au același număr de rânduri, ca să fie comparabile între direcții", () => {
    const slots = zoneSections.flatMap((s) =>
      s.questions.filter((q) => q.type === "items").map((q) => (q.type === "items" ? q.slots : 0)),
    );
    expect(new Set(slots)).toEqual(new Set([2]));
  });

  it("întrebarea deschisă e diferită la fiecare direcție", () => {
    // Altfel n-am fi întrebat nimic specific, doar același lucru de 22 de ori.
    const deschise = zoneSections.map(
      (s) => s.questions.filter((q) => q.type === "long").map((q) => q.label)[0],
    );
    expect(new Set(deschise).size).toBe(deschise.length);
  });

  it("nimic nu e obligatoriu în secțiunile de direcție", () => {
    expect(requiredIds(zoneSections)).toEqual([]);
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
  it("cere doar strictul necesar, toate rapide", () => {
    expect(requiredIds(visibleSections([]))).toEqual([
      "departament",
      "zone",
      "stare_cuvinte",
      "volum",
      "s_claritate",
      "top3",
      "s_general",
    ]);
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
  it("rămâne scurt pentru cine a lucrat pe o direcție", () => {
    expect(fieldCount(["fotovideo"])).toBeLessThanOrEqual(34);
  });

  it("rămâne rezonabil pentru un coordonator cu trei direcții", () => {
    expect(fieldCount(["cazari", "mese", "welcomepacks"])).toBeLessThanOrEqual(45);
  });

  it("crește doar cu direcțiile bifate", () => {
    expect(fieldCount(["piata"])).toBeGreaterThan(fieldCount([]));
    expect(fieldCount(["piata", "ateliere"])).toBeGreaterThan(fieldCount(["piata"]));
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
