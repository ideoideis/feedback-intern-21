import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase, FEEDBACK_TABLE } from "@/lib/supabase";
import { useHearts } from "@/components/Hearts";
import { Field, type AnswerValue, type Answers } from "@/components/fields";
import { DIMENSIONS, FESTIVAL_STATS, SECTIONS, type Section, type ZoneId } from "@/data/questions";
import { MILESTONES } from "@/data/reactions";
import etichetaLogo from "@/assets/eticheta-ideoideis.png";

const DRAFT_KEY = "ii21_feedback_intern_draft";
const REQUIRED = "răspunsul ăsta ne trebuie";

type Draft = { answers: Answers; step: number };

const loadDraft = (): Draft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};

/** Un răspuns lipsește? Merge pe toate tipurile de câmp. */
const isEmpty = (v: AnswerValue | undefined): boolean => {
  if (v === undefined || v === null || v === "") return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "number") return false;
  if (Array.isArray(v)) return v.every((x) => !x || String(x).trim() === "");
  return Object.keys(v).length === 0;
};

/** Eticheta festivalului. O apeși, se clatină și scoate inimioare. */
function Eticheta({ className }: { className?: string }) {
  const hearts = useHearts();
  const [wiggling, setWiggling] = useState(false);

  return (
    <img
      src={etichetaLogo}
      alt="ideo ideis"
      draggable={false}
      onClick={(e) => {
        hearts.burstFrom(e.currentTarget, 8);
        setWiggling(true);
        window.setTimeout(() => setWiggling(false), 650);
      }}
      className={cn("cursor-pointer select-none", wiggling && "wiggle", className)}
    />
  );
}

export default function Index() {
  const hearts = useHearts();
  const [phase, setPhase] = useState<"intro" | "form" | "done">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);
  const [saved, setSaved] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);
  const navRef = useRef<HTMLButtonElement>(null);
  const backCount = useRef(0);
  const heartClicks = useRef(0);
  const thanksClicks = useRef(0);
  const startedAt = useRef<number | null>(null);
  const [minutes, setMinutes] = useState(0);

  // Ciorna stă în browserul de pe care se completează. Nu are nevoie de nume:
  // cine începe pe telefon își găsește răspunsurile pe același telefon, fără
  // să știm cine e. Butonul "începe de la zero" e pentru cazul în care doi
  // oameni folosesc același laptop.
  useEffect(() => {
    const d = loadDraft();
    if (d && Object.keys(d.answers ?? {}).length > 0) {
      setAnswers(d.answers);
      setStep(d.step ?? 0);
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (phase === "done" || Object.keys(answers).length === 0) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, step }));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [answers, step, phase]);

  // Easter eggs de tastatură: scrie "ideo" oriunde, sau codul Konami cu
  // săgețile. Amândouă plouă cu inimioare.
  useEffect(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight"];
    let letters = "";
    let arrows: string[] = [];

    const onKey = (e: KeyboardEvent) => {
      if (e.key.startsWith("Arrow")) {
        arrows = [...arrows, e.key].slice(-KONAMI.length);
        if (arrows.join() === KONAMI.join()) {
          hearts.rain(40);
          toast.success("cod acceptat ♥");
          arrows = [];
        }
        return;
      }
      // Un indiciu pentru cine bâjbâie după easter eggs.
      if (e.key === "?") {
        toast("apasă ♥ din bara de sus, scrie ideo, sau încearcă săgețile.");
        return;
      }
      if (e.key.length !== 1) return;
      letters = (letters + e.key.toLowerCase()).slice(-8);
      if (letters.endsWith("ideo")) {
        hearts.rain(30);
        letters = "";
      }
      if (letters.endsWith("shtanga")) {
        hearts.rain(45);
        toast("shtanga boyz forever ♥");
        letters = "";
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hearts]);

  // Easter egg 5: pentru cine deschide dev tools. Cătălin, tu ești.
  useEffect(() => {
    console.log(
      "%cideo ideis #21 ♥",
      "color:#E7004C;font-size:20px;font-weight:700",
    );
    console.log("dacă ai ajuns aici, înseamnă că ești de-al casei. mulțumim.");
  }, []);

  // Easter egg 2, și singurul care e și util: dacă același lucru lipsește la trei
  // direcții diferite, i-o spunem pe loc. Ăsta e exact tiparul pe care formularul
  // e construit să-l găsească.
  const announced = useRef<Set<string>>(new Set());
  useEffect(() => {
    const counts: Record<string, number> = {};
    for (const [key, value] of Object.entries(answers)) {
      if (!key.endsWith("_diag") || typeof value !== "object" || Array.isArray(value)) continue;
      for (const [dim, val] of Object.entries(value as Record<string, string>))
        if (val === "lipsa") counts[dim] = (counts[dim] ?? 0) + 1;
    }
    for (const [dim, n] of Object.entries(counts)) {
      if (n < 3 || announced.current.has(dim)) continue;
      announced.current.add(dim);
      const label = DIMENSIONS.find((d) => d.id === dim)?.label.toLowerCase() ?? dim;
      toast(`${label}: a treia direcție unde a lipsit. am notat, chiar am notat.`);
    }
  }, [answers]);

  // Aceleași șase pagini pentru toată lumea. Zonele nu se mai bifează la
  // început: se aleg direct în pagina de detaliu, care e opțională.
  const sections = SECTIONS;
  const questionsOf = (s: Section) => s.questions;

  /** Câte cuvinte a scris, pentru bonul de la final. Bifele nu se numără. */
  const wordCount = useMemo(
    () =>
      Object.entries(answers).reduce((n, [key, value]) => {
        if (key === "zone") return n;
        const text = typeof value === "string" ? value : Array.isArray(value) ? value.join(" ") : "";
        return n + (text.trim() ? text.trim().split(/\s+/).length : 0);
      }, 0),
    [answers],
  );
  const section: Section | undefined = sections[step];

  const set = (id: string, v: AnswerValue) => setAnswers((a) => ({ ...a, [id]: v }));

  const errorsFor = (s: Section) => {
    const e: Record<string, string> = {};
    for (const q of questionsOf(s)) {
      if (!q.required) continue;
      if (!isEmpty(answers[q.id])) continue;
      if (q.type === "words") e[q.id] = "alege cel puțin un cuvânt";
      else if (q.type === "items") e[q.id] = "scrie cel puțin unul";
      else e[q.id] = REQUIRED;
    }
    return e;
  };

  const errors = section ? errorsFor(section) : {};
  const isLast = step === sections.length - 1;

  const goTo = (nextStep: number) => {
    setStep(nextStep);
    setShowErrors(false);
    setMilestone(MILESTONES[nextStep + 1] ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      toast.error("Mai e ceva de completat în secțiunea asta.");
      return;
    }
    if (isLast) {
      void submit();
      return;
    }
    hearts.burstFrom(navRef.current, 3);
    goTo(step + 1);
  };

  const startOver = () => {
    localStorage.removeItem(DRAFT_KEY);
    setAnswers({});
    setStep(0);
    setRestored(false);
    toast.success("Am șters ciorna. Formularul e gol.");
  };

  const submit = async () => {
    const missing = sections.filter((s) => Object.keys(errorsFor(s)).length > 0);
    if (missing.length > 0) {
      toast.error(`Lipsesc răspunsuri la: ${missing.map((s) => s.title).join(", ")}`);
      setStep(sections.indexOf(missing[0]));
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!supabase) {
      toast.error("Formularul nu e conectat la baza de date. Scrie-ne, te rugăm.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from(FEEDBACK_TABLE).insert({
      nume: ((answers.nume as string) ?? "").trim() || null,
      departament: (answers.departament as string) ?? null,
      editii: (answers.editii as string) ?? null,
      zone: (answers.zone as ZoneId[]) ?? [],
      sectiuni: sections.map((s) => s.id),
      revenire: (answers.revenire as string) ?? null,
      scala_claritate: (answers.s_claritate as number) ?? null,
      scala_program: (answers.s_program as number) ?? null,
      scala_sustinere: (answers.s_sustinere as number) ?? null,
      scala_epuizare: (answers.s_epuizare as number) ?? null,
      scala_general: (answers.s_general as number) ?? null,
      answers,
    });
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error("Nu am putut trimite formularul. Mai încearcă o dată, te rugăm.");
      return;
    }

    localStorage.removeItem(DRAFT_KEY);
    setMinutes(
      startedAt.current ? Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)) : 0,
    );
    setPhase("done");
    window.scrollTo({ top: 0 });
    window.setTimeout(() => hearts.rain(34), 250);
  };

  /* ─── ecran de final ─── */
  if (phase === "done") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16 text-center">
        <Eticheta className="w-40 sm:w-52" />
        <h1 className="mt-10 text-4xl font-bold leading-[1.05] text-primary sm:text-6xl">mulțumim.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">
          Feedbackul tău a ajuns la noi. Îl citim pe tot, cap-coadă, și din el ies deciziile pentru
          #22.
        </p>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Dacă îți mai vine ceva în minte peste două zile, scrie-ne oricând.
        </p>

        {/* Bonul: cifre despre tine, plus una despre noi toți. */}
        <dl className="mt-10 w-full max-w-md border-t border-border pt-8 text-left">
          {[
            ["secțiuni completate", `${sections.length}`],
            ["cuvinte scrise", `${wordCount}`],
            ["cât ai rezistat", minutes === 1 ? "un minut" : `${minutes} minute`],
            ["inimioare adunate", `${hearts.total}`],
            ["oameni care au făcut #21", `${FESTIVAL_STATS.oameni_in_echipa}, și tu unul dintre ei`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-2.5">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-right font-semibold tabular-nums text-primary">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Easter egg final: cu cât insiști, cu atât se întâmplă mai mult. */}
        <button
          type="button"
          onClick={(e) => {
            thanksClicks.current += 1;
            if (thanksClicks.current === 10) toast("gata, ajunge. mergi să te odihnești ♥");
            hearts.burstFrom(e.currentTarget, 6 + thanksClicks.current * 3);
          }}
          className="mt-10 text-3xl text-primary transition-transform hover:scale-125"
          aria-label="inimioare"
        >
          ♥
        </button>
      </main>
    );
  }

  /* ─── ecran de intro ─── */
  if (phase === "intro") {
    return (
      <main className="min-h-dvh bg-background">
        <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
          <Eticheta className="w-28 sm:w-36" />

          <p className="micro-label mt-10">festivalul ideo ideis #21</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.05] text-primary sm:text-6xl">
            feedback
            <br />
            echipa de organizatori
          </h1>
          <span className="red-line mt-7 w-24" />

          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            <p>
              S-a terminat #21. Înainte să uităm cum a fost cu adevărat, avem nevoie de ce ai văzut
              tu, din locul în care ai stat.
            </p>
            <p>
              Nu căutăm laude și nu ne supărăm pe critică. Căutăm lucruri concrete: ce a scârțâit, ce
              a mers surprinzător de bine, ce ai face altfel dacă ai începe mâine organizarea ediției
              următoare.
            </p>
          </div>

          <ul className="mt-10 space-y-3 border-t border-border pt-8 text-base">
            {[
              "Durează 5 - 10 minute.",
              "Se salvează singur pe telefonul sau laptopul de pe care completezi, deci poți închide pagina și continua de pe același dispozitiv.",
              "Numele e opțional. În afară de câteva întrebări, restul e opțional.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="mt-1 h-4 w-4 flex-none text-primary" strokeWidth={3} />
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>

          {/* Easter egg 7: pentru cine completează la ore imposibile. */}
          {new Date().getHours() < 5 && (
            <p className="mt-8 text-sm font-medium text-primary">
              e {new Date().getHours()} noaptea. sper că nu e din vina noastră.
            </p>
          )}

          {restored && (
            <div className="mt-8 border-l-2 border-primary bg-primary/5 p-4">
              <p className="text-sm leading-relaxed">
                Pe dispozitivul ăsta e un formular început. Continuă de unde ai rămas, sau ia-o de la
                zero dacă nu e al tău.
              </p>
              <button
                type="button"
                onClick={startOver}
                className="mt-3 text-sm font-semibold text-primary underline"
              >
                începe de la zero
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setPhase("form");
              startedAt.current = Date.now();
              window.scrollTo({ top: 0 });
            }}
            className="mt-10 w-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            {restored ? "continuă formularul ›" : "începe ›"}
          </button>
        </div>
      </main>
    );
  }

  /* ─── formularul ─── */
  const progress = ((step + 1) / sections.length) * 100;

  return (
    <main className="min-h-dvh bg-background pb-28">
      {/* Progres lipit sus, ca să știi mereu cât mai e. */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="h-1 w-full bg-muted">
          <motion.div
            className={cn("h-full bg-primary", isLast && "animate-pulse")}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
          <span className="micro-label">
            secțiunea {step + 1} din {sections.length}
          </span>
          <AnimatePresence mode="wait">
            {milestone ? (
              <motion.span
                key={milestone}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium text-primary"
              >
                {milestone}
              </motion.span>
            ) : saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground"
              >
                salvat
              </motion.span>
            ) : (
              <span key="empty" />
            )}
          </AnimatePresence>

          {/* Easter egg la vedere: se apasă oricând, oricât. La a cincea apăsare
              se lasă convins și plouă. */}
          <button
            type="button"
            onClick={(e) => {
              heartClicks.current += 1;
              if (heartClicks.current === 5) {
                hearts.rain(34);
                toast("ok, ne-am prins că-ți place ♥");
              } else {
                hearts.burstFrom(e.currentTarget, 6);
              }
            }}
            aria-label="inimioare"
            className="flex items-center gap-1 text-primary transition-transform hover:scale-125"
          >
            ♥
            {hearts.total > 0 && (
              <span className="text-xs font-medium tabular-nums">{hearts.total}</span>
            )}
          </button>
        </div>
      </div>

      {/* Schimbarea de secțiune e vizuală; asta o spune și cititoarelor de ecran. */}
      <p className="sr-only" role="status" aria-live="polite">
        Secțiunea {step + 1} din {sections.length}: {section?.title}
      </p>

      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={section?.id ?? step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold leading-[1.1] text-primary sm:text-5xl">
              {section?.title}
            </h2>
            {section?.intro && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{section.intro}</p>
            )}
            {section?.optionalNote && (
              <p className="mt-5 border-l-2 border-primary bg-primary/5 p-4 text-sm leading-relaxed">
                {section.optionalNote}
              </p>
            )}

            <div className="mt-10 space-y-7">
              {section?.questions.map((q) => (
                <Field
                  key={q.id}
                  q={q}
                  answers={answers}
                  set={set}
                  error={showErrors ? errors[q.id] : undefined}
                />
              ))}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigare lipită jos, la degetul mare. */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                backCount.current += 1;
                // Easter egg: cine tot se întoarce merită liniștit.
                if (backCount.current === 3) toast("nu se pierde nimic, te poți plimba liniștit/ă.");
                goTo(step - 1);
              }}
              className="border border-input px-5 py-3.5 font-medium transition-colors hover:border-primary hover:text-primary"
            >
              ‹ înapoi
            </button>
          )}
          <button
            ref={navRef}
            type="button"
            onClick={next}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLast ? (submitting ? "se trimite..." : "trimite feedbackul ♥") : "continuă ›"}
          </button>
        </div>
      </div>
    </main>
  );
}
