import { describe, expect, it } from "vitest";
import {
  DEPARTMENTS,
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

  it("adaugă secțiunea outdoor doar celor care au bifat outdoor", () => {
    expect(ids(["outdoor"])).toContain("outdoor");
    expect(ids(["ateliere"])).not.toContain("outdoor");
  });

  it("adaugă secțiunea atelierelor doar celor care au bifat atelierele", () => {
    expect(ids(["ateliere"])).toContain("ateliere");
    expect(ids(["outdoor"])).not.toContain("ateliere");
  });

  it("dă fiecărei zone de lucru o secțiune a ei", () => {
    // Fiecare bifă, în afară de "altceva", duce într-o secțiune proprie.
    for (const z of ZONES.filter((z) => z.id !== "altele")) {
      const proprii = ids([z.id]).filter((id) => !ids([]).includes(id));
      expect(proprii.length, `zona ${z.label} nu duce nicăieri`).toBeGreaterThan(0);
    }
    expect(ids(["altele"])).toEqual(ids([]));
  });

  it("nu întreabă un departament despre treaba altuia", () => {
    // Cazul concret al lui Anuța: foto-video nu primește întrebări despre
    // tehnicul de la gale sau despre transporturi.
    const fotovideo = ids(["fotovideo"]);
    expect(fotovideo).toContain("fotovideo");
    expect(fotovideo).not.toContain("tehnic");
    expect(fotovideo).not.toContain("transport");
    expect(fotovideo).not.toContain("productie");

    const tehnic = ids(["tehnic"]);
    expect(tehnic).toContain("tehnic");
    expect(tehnic).not.toContain("fotovideo");
    expect(tehnic).not.toContain("financiar");
  });

  it("nu are zone care se suprapun ca înțeles", () => {
    // "alte evenimente" și "altceva" erau același lucru: outdoor și indoor le-au
    // luat locul. Nu vrem să reapară o zonă-umbrelă lângă "altceva".
    const etichete = ZONES.map((z) => z.label.toLowerCase());
    expect(etichete.filter((l) => l.includes("alt"))).toEqual(["altceva"]);
  });

  it("arată tot cuiva care a bifat toate zonele", () => {
    expect(ids(ZONES.map((z) => z.id))).toHaveLength(SECTIONS.length);
  });

  it("păstrează ordinea din SECTIONS, oricum sunt bifate zonele", () => {
    expect(ids(["ateliere", "outdoor"])).toEqual(ids(["outdoor", "ateliere"]));
  });
});

describe("întrebările obligatorii", () => {
  it("cere doar strictul necesar (restul e opțional)", () => {
    expect(requiredIds(visibleSections([]))).toEqual([
      "departament",
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

  it("listele pe zone au același număr de rânduri, ca să fie comparabile", () => {
    const slots = zoneSections.flatMap((s) =>
      s.questions.filter((q) => q.type === "items").map((q) => (q.type === "items" ? q.slots : 0)),
    );
    expect(new Set(slots)).toEqual(new Set([2]));
  });

  it("fiecare secțiune de zonă are și un câmp liber, pentru ce nu încape în liste", () => {
    for (const s of zoneSections) {
      const open = s.questions.filter((q) => q.type === "long");
      expect(open.length, `secțiunea ${s.id}`).toBeGreaterThanOrEqual(1);
    }
  });

  it("grila acoperă fiecare zonă de lucru, plus coordonarea și atmosfera", () => {
    const rows = GRID_ROWS.map((r) => r.id);
    for (const z of ZONES.filter((z) => !["altele", "trupe"].includes(z.id)))
      expect(rows, `zona ${z.id} nu are rând în grilă`).toContain(z.id);
    expect(rows).toContain("coordonare");
    expect(rows).toContain("atmosfera");
  });

  it("grila arată doar zonele pe care omul avea cum să le vadă", () => {
    // Cazul concret: foto-video nu e pus să dea notă tehnicului sau producției.
    const fotovideo = gridRowsFor(["fotovideo"]).map((r) => r.id);
    expect(fotovideo).not.toContain("tehnic");
    expect(fotovideo).not.toContain("productie");
    expect(fotovideo).not.toContain("transport");
    expect(fotovideo).toContain("comunicare");

    const outdoor = gridRowsFor(["outdoor"]).map((r) => r.id);
    expect(outdoor).toContain("outdoor");
    expect(outdoor).not.toContain("financiar");
  });

  it("lasă pentru toată lumea doar ce a trăit toată lumea", () => {
    const oricine = gridRowsFor([]).map((r) => r.id);
    expect(oricine).toEqual(["trupe", "cazari", "coordonare", "atmosfera"]);
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

describe("structura echipei", () => {
  it("acoperă departamentele reale, fără voluntari, juniori și shtanga boyz", () => {
    expect(DEPARTMENTS).toEqual([
      "Board",
      "Artistic",
      "Welcoming",
      "Comunicare",
      "Tehnic",
      "Producție",
      "Financiar",
      "Website",
    ]);
    expect(DEPARTMENTS).not.toContain("Voluntari");
    expect(DEPARTMENTS).not.toContain("Juniori");
  });
});

describe("lungimea formularului", () => {
  it("rămâne scurt pentru cine a lucrat într-o singură zonă", () => {
    // Un om de la comunicare: cât mai puține câmpuri, niciunul despre logistică.
    expect(fieldCount(["comunicare"])).toBeLessThanOrEqual(30);
  });

  it("rămâne rezonabil și pentru un coordonator cu mai multe zone", () => {
    // Cazul realist cel mai încărcat: cineva din Welcoming care ține cazări,
    // transporturi și voluntari. Dacă cifra asta crește, taie ceva.
    expect(fieldCount(["cazari", "transport", "voluntari"])).toBeLessThanOrEqual(40);
  });

  it("crește doar cu zonele bifate", () => {
    expect(fieldCount(["outdoor"])).toBeGreaterThan(fieldCount([]));
    expect(fieldCount(["outdoor", "ateliere"])).toBeGreaterThan(fieldCount(["outdoor"]));
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
