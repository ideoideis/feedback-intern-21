import { describe, expect, it } from "vitest";
import {
  GRID_ROWS,
  MOOD_WORDS,
  SECTIONS,
  ZONES,
  fieldCount,
  gridRowsFor,
  gridRowsRest,
  requiredIds,
  visibleSections,
  type ZoneId,
} from "./questions";
import { HAPPY_WORDS, SCALE_REACTIONS, WORD_REACTIONS } from "./reactions";

const ids = (zone: ZoneId[]) => visibleSections(zone).map((s) => s.id);

describe("secțiunile care se arată", () => {
  it("arată doar secțiunile generale când nu e bifat nimic", () => {
    expect(ids([])).toEqual(["tine", "stare", "rol", "flow", "oameni", "grila", "idei", "final"]);
  });

  it("adaugă secțiunea Piața doar celor care au bifat Piața", () => {
    expect(ids(["piata"])).toContain("piata");
    expect(ids(["ateliere"])).not.toContain("piata");
  });

  it("adaugă secțiunea atelierelor doar celor care au bifat atelierele", () => {
    expect(ids(["ateliere"])).toContain("ateliere");
    expect(ids(["piata"])).not.toContain("ateliere");
  });

  it("arată secțiunea evenimentului propriu și pentru gale, și pentru alte evenimente", () => {
    expect(ids(["gale"])).toContain("evenimente");
    expect(ids(["evenimente"])).toContain("evenimente");
    expect(ids(["comunicare"])).not.toContain("evenimente");
  });

  it("dă departamentului de comunicare o secțiune a lui", () => {
    expect(ids(["comunicare"])).toContain("comunicare_dept");
    expect(ids(["piata"])).not.toContain("comunicare_dept");
  });

  it("nu întreabă de logistică pe cine n-a lucrat pe teren", () => {
    // Cine face foto-video nu are ce să spună despre montaj și transport.
    expect(ids(["comunicare"])).not.toContain("locatii");
    expect(ids(["logistica"])).toContain("locatii");
    expect(ids(["piata"])).toContain("locatii");
  });

  it("arată tot cuiva care a bifat toate zonele", () => {
    expect(ids(ZONES.map((z) => z.id))).toHaveLength(SECTIONS.length);
  });

  it("păstrează ordinea din SECTIONS, oricum sunt bifate zonele", () => {
    expect(ids(["ateliere", "piata"])).toEqual(ids(["piata", "ateliere"]));
  });
});

describe("întrebările obligatorii", () => {
  it("cere doar strictul necesar (restul e opțional)", () => {
    expect(requiredIds(visibleSections([]))).toEqual([
      "rol",
      "zone",
      "stare_cuvinte",
      "s_claritate",
      "top3",
      "s_general",
    ]);
  });

  it("nu face nimic obligatoriu în secțiunile pe zone", () => {
    expect(requiredIds(SECTIONS.filter((s) => s.showIf))).toEqual([]);
  });
});

describe("răspunsuri care se pot număra", () => {
  const zoneSections = SECTIONS.filter((s) => s.showIf);

  it("fiecare secțiune de zonă are aceeași pereche păstrăm / schimbăm", () => {
    for (const s of zoneSections) {
      const items = s.questions.filter((q) => q.type === "items");
      expect(items.map((q) => q.type === "items" && q.accent)).toEqual(["keep", "change"]);
    }
  });

  it("listele au același număr de rânduri, ca să fie comparabile între zone", () => {
    const slots = SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.type === "items").map((q) => (q.type === "items" ? q.slots : 0)),
    );
    expect(new Set(slots)).toEqual(new Set([3]));
  });

  it("grila acoperă tot festivalul, nu doar zonele de lucru", () => {
    expect(GRID_ROWS.length).toBeGreaterThanOrEqual(ZONES.length);
    const labels = GRID_ROWS.map((r) => r.id);
    expect(labels).toContain("coordonare");
    expect(labels).toContain("atmosfera");
  });

  it("grila arată doar zonele pe care omul avea cum să le vadă", () => {
    // Cazul concret: foto-video nu e pus să dea notă tehnicului din Piață.
    const comunicare = gridRowsFor(["comunicare"]).map((r) => r.id);
    expect(comunicare).not.toContain("piata");
    expect(comunicare).not.toContain("logistica");
    expect(comunicare).toContain("comunicare");

    const piata = gridRowsFor(["piata"]).map((r) => r.id);
    expect(piata).toContain("piata");
    expect(piata).not.toContain("comunicare");
  });

  it("lasă pentru toată lumea doar ce a trăit toată lumea", () => {
    const oricine = gridRowsFor([]).map((r) => r.id);
    expect(oricine).toEqual(["cazare", "coordonare", "atmosfera"]);
  });

  it("restul zonelor rămân disponibile sub buton, fără dubluri", () => {
    for (const zone of [[], ["piata"], ["comunicare"], ZONES.map((z) => z.id)] as ZoneId[][]) {
      const mine = gridRowsFor(zone).map((r) => r.id);
      const rest = gridRowsRest(zone).map((r) => r.id);
      expect([...mine, ...rest].sort()).toEqual(GRID_ROWS.map((r) => r.id).sort());
      expect(mine.filter((id) => rest.includes(id))).toEqual([]);
    }
  });

  it("topul de la final e ordonat", () => {
    const top = SECTIONS.flatMap((s) => s.questions).find((q) => q.id === "top3");
    expect(top?.type).toBe("items");
    expect(top?.type === "items" && top.ranked).toBe(true);
  });
});

describe("lungimea formularului", () => {
  it("rămâne scurt pentru cine a lucrat într-o singură zonă", () => {
    // Un om de la comunicare: cât mai puține câmpuri, niciunul despre logistică.
    expect(fieldCount(["comunicare"])).toBeLessThanOrEqual(30);
  });

  it("nu depășește un formular de un sfert de oră nici pentru cine a fost în tot", () => {
    expect(fieldCount(ZONES.map((z) => z.id))).toBeLessThanOrEqual(50);
  });

  it("crește doar cu zonele bifate", () => {
    expect(fieldCount(["piata"])).toBeGreaterThan(fieldCount([]));
    expect(fieldCount(["piata", "ateliere"])).toBeGreaterThan(fieldCount(["piata"]));
  });
});

describe("igiena datelor", () => {
  const allQuestions = SECTIONS.flatMap((s) => s.questions);

  it("nu are id-uri duplicate (altfel răspunsurile se suprascriu în jsonb)", () => {
    const all = allQuestions.map((q) => q.id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("nu folosește diacritice în id-uri (chei de coloană / jsonb)", () => {
    for (const q of allQuestions) expect(q.id).toMatch(/^[a-z0-9_]+$/);
  });

  it("fiecare scală are ambele capete etichetate", () => {
    for (const q of allQuestions)
      if (q.type === "scale") {
        expect(q.low).toBeTruthy();
        expect(q.high).toBeTruthy();
      }
  });
});

describe("reacțiile (easter eggs)", () => {
  it("fiecare scală are reacții pentru toate cele cinci note", () => {
    const scales = SECTIONS.flatMap((s) => s.questions).filter((q) => q.type === "scale");
    for (const q of scales) {
      const set = SCALE_REACTIONS[q.id];
      expect(set, `lipsesc reacțiile pentru ${q.id}`).toBeDefined();
      expect(Object.keys(set)).toEqual(["1", "2", "3", "4", "5"]);
    }
  });

  it("fiecare cuvânt de stare are un răspuns", () => {
    for (const w of MOOD_WORDS) expect(WORD_REACTIONS[w], `lipsește reacția la "${w}"`).toBeTruthy();
  });

  it("cuvintele cu inimioare sunt cuvinte care există", () => {
    for (const w of HAPPY_WORDS) expect(MOOD_WORDS).toContain(w);
  });
});
