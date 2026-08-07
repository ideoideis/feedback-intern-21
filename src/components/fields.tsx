import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHearts } from "@/components/Hearts";
import {
  DIMENSIONS,
  DIM_OPTIONS,
  ZONES,
  ZONE_GROUPS,
  type Question,
  type ZoneId,
} from "@/data/questions";
import {
  CHOICE_REACTIONS,
  HAPPY_CHOICES,
  HAPPY_WORDS,
  SCALE_REACTIONS,
  WORD_REACTIONS,
} from "@/data/reactions";

export type AnswerValue = string | number | string[] | Record<string, string>;
export type Answers = Record<string, AnswerValue>;

/** Rândul mic de reacție care apare sub o întrebare. */
function Reaction({ text }: { text?: string }) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.p
          key={text}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-3 text-sm font-medium text-primary"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const inputClass = (invalid?: boolean) =>
  cn(
    "w-full border bg-background px-4 py-3 text-base",
    "placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
    invalid ? "border-primary" : "border-input",
  );

/** Textarea care crește pe măsură ce scrii, ca să nu apară scroll în cutie. */
export function AutoTextarea({
  value,
  onChange,
  placeholder,
  placeholders,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Sugestii care se rotesc, pentru câmpurile complet deschise. */
  placeholders?: string[];
  invalid?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState(0);
  const long = value.length > 220;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
  }, [value]);

  // Easter egg: sugestiile se schimbă singure, cât timp câmpul e gol.
  useEffect(() => {
    if (!placeholders?.length || value.length > 0) return;
    const t = window.setInterval(() => setHint((i) => (i + 1) % placeholders.length), 3800);
    return () => window.clearInterval(t);
  }, [placeholders, value.length]);

  return (
    <>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders?.length ? placeholders[hint] : (placeholder ?? "scrie aici...")}
        rows={3}
        className={cn(
          "w-full resize-none border bg-background px-4 py-3 text-base leading-relaxed",
          "placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
          invalid ? "border-primary" : "border-input",
        )}
      />
      {/* Fără inimioare aici: se scrie pe larg și la momentele grele. */}
      <Reaction text={long ? "scrii pe larg. chiar citim tot, promitem." : undefined} />
    </>
  );
}

/** Scală 1 la 5, butoane mari (se apasă ușor și pe telefon). */
function Scale({
  id,
  value,
  onChange,
  low,
  high,
  invalid,
}: {
  id: string;
  value: number | undefined;
  onChange: (v: number) => void;
  low: string;
  high: string;
  invalid?: boolean;
}) {
  const hearts = useHearts();

  return (
    <div>
      <div className={cn("flex gap-2", invalid && "ring-2 ring-primary ring-offset-4")}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={(e) => {
                onChange(n);
                if (n === 5) hearts.burstFrom(e.currentTarget, 7);
              }}
              aria-pressed={active}
              className={cn(
                "flex-1 border py-4 text-lg font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:border-primary hover:text-primary",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-4 text-xs text-muted-foreground">
        <span>1 = {low}</span>
        <span className="text-right">5 = {high}</span>
      </div>
      <Reaction text={value ? SCALE_REACTIONS[id]?.[value] : undefined} />
    </div>
  );
}

/** Variante pe un rând, ca niște pastile. */
function Choice({
  id,
  options,
  value,
  onChange,
  invalid,
}: {
  id: string;
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  const hearts = useHearts();

  return (
    <div>
      <div className={cn("flex flex-wrap gap-2", invalid && "ring-2 ring-primary ring-offset-4")}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={(e) => {
                onChange(o);
                // Inimioare doar la variantele bune.
                if (HAPPY_CHOICES.includes(o)) hearts.burstFrom(e.currentTarget, 5);
              }}
              aria-pressed={active}
              className={cn(
                "border px-5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:border-primary hover:text-primary",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
      <Reaction text={value ? CHOICE_REACTIONS[id]?.[value] : undefined} />
    </div>
  );
}

/** Cuvinte, maximum `max` bucăți. Fiecare cuvânt are un răspuns al lui. */
function Words({
  options,
  max,
  value,
  onChange,
  invalid,
}: {
  options: string[];
  max: number;
  value: string[];
  onChange: (v: string[]) => void;
  invalid?: boolean;
}) {
  const hearts = useHearts();
  const [last, setLast] = useState<string | null>(null);
  const full = value.length >= max;

  const toggle = (w: string, el: Element) => {
    if (value.includes(w)) {
      onChange(value.filter((x) => x !== w));
      setLast(null);
      return;
    }
    if (full) return;
    onChange([...value, w]);
    setLast(w);
    // Inimioare doar la cuvintele bune. Nu sărbătorim că cineva s-a simțit
    // frustrat sau copleșit, nici măcar când completează ultimul cuvânt.
    if (HAPPY_WORDS.includes(w)) hearts.burstFrom(el, 5);
  };

  const anyHard = value.some((w) => !HAPPY_WORDS.includes(w));

  return (
    <div>
      <div className={cn("flex flex-wrap gap-2", invalid && "ring-2 ring-primary ring-offset-4")}>
        {options.map((w) => {
          const active = value.includes(w);
          return (
            <button
              key={w}
              type="button"
              onClick={(e) => toggle(w, e.currentTarget)}
              aria-pressed={active}
              disabled={full && !active}
              className={cn(
                "border px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:border-primary hover:text-primary",
                full && !active && "opacity-40 hover:border-input hover:text-foreground",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>
      <p className={cn("mt-2 text-xs", full ? "font-medium text-primary" : "text-muted-foreground")}>
        {full
          ? anyHard
            ? "am înțeles. mulțumim că ai fost sincer/ă."
            : `${max} din ${max}. portret complet.`
          : `${value.length} din ${max} alese`}
      </p>
      <Reaction text={last ? WORD_REACTIONS[last] : undefined} />
    </div>
  );
}

/** Câmpuri scurte, separate, care se pot număra între respondenți. */
function Items({
  value,
  onChange,
  slots,
  ranked,
  accent,
  placeholder,
  invalid,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  slots: number;
  ranked?: boolean;
  accent?: "keep" | "change";
  placeholder?: string;
  invalid?: boolean;
}) {
  const hearts = useHearts();
  const celebrated = useRef<Set<number>>(new Set());
  const fullHouse = useRef(false);
  const rows = Array.from({ length: slots }, (_, i) => value[i] ?? "");
  const allFilled = rows.every((r) => r.trim().length > 0);

  const setAt = (i: number, v: string, el: Element) => {
    const next = [...rows];
    next[i] = v;
    // Inimioare o singură dată per câmp, când chiar s-a scris ceva în el.
    if (accent === "keep" && v.trim().length === 4 && !celebrated.current.has(i)) {
      celebrated.current.add(i);
      hearts.burstFrom(el, 4);
    }
    // Și un puf mai mare când s-au completat toate rândurile. Doar la listele de
    // păstrat și la topul ordonat: pe o listă de nemulțumiri n-avem ce sărbători.
    if (!fullHouse.current && (accent === "keep" || ranked) && next.every((r) => r.trim().length > 0)) {
      fullHouse.current = true;
      hearts.burstFrom(el, 9);
    }
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {rows.map((v, i) => (
        <div key={i} className="flex items-stretch">
          <span
            className={cn(
              "flex w-10 flex-none items-center justify-center border border-r-0 text-sm font-semibold",
              invalid && i === 0 ? "border-primary" : "border-input",
              accent === "keep" && "text-primary",
            )}
          >
            {ranked ? i + 1 : accent === "keep" ? "♥" : "›"}
          </span>
          <input
            type="text"
            value={v}
            onChange={(e) => setAt(i, e.target.value, e.currentTarget)}
            placeholder={i === 0 ? placeholder : ""}
            className={cn(inputClass(invalid && i === 0), "border-l-0")}
          />
        </div>
      ))}
      <Reaction
        text={
          !allFilled
            ? undefined
            : ranked
              ? `${slots} din ${slots}, în ordine. exact ce ne trebuia.`
              : accent === "keep"
                ? "bine de știut ce ținem."
                : undefined
        }
      />
    </div>
  );
}

/**
 * Grila de diagnostic: cele cinci dimensiuni pe trei variante.
 *
 * Coloana vertebrală a formularului. Apare identică la fiecare direcție, ca la
 * final să se poată număra: dacă "informația a lipsit" iese la nouă direcții,
 * aia e problema ediției, indiferent ce scrie fiecare în text.
 */
function Matrix({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const hearts = useHearts();
  const answered = DIMENSIONS.filter((d) => value[d.id]).length;

  const set = (dim: string, opt: string, el: Element) => {
    const next = { ...value };
    if (next[dim] === opt) delete next[dim];
    else next[dim] = opt;
    onChange(next);
    // Toate cinci "a fost ok" e rar și merită sărbătorit.
    if (DIMENSIONS.every((d) => next[d.id] === "ok")) hearts.burstFrom(el, 10);
  };

  return (
    <div className="space-y-4">
      {DIMENSIONS.map((d) => (
        <div key={d.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
          <p className={cn("font-medium leading-snug", value[d.id] && "text-primary")}>{d.label}</p>
          <p className="mb-2 text-xs text-muted-foreground">{d.hint}</p>
          <div className="flex gap-1.5">
            {DIM_OPTIONS.map((o) => {
              const active = value[d.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={(e) => set(d.id, o.id, e.currentTarget)}
                  aria-pressed={active}
                  aria-label={`${d.label}: ${o.label}`}
                  className={cn(
                    "flex-1 border px-1 py-3 text-xs font-semibold transition-colors sm:text-sm",
                    !active && "border-input bg-background hover:border-primary hover:text-primary",
                    // Severitatea se vede din culoare: neutru, roșu deschis, roșu plin.
                    active && o.id === "ok" && "border-secondary bg-secondary text-secondary-foreground",
                    active && o.id === "muchie" && "border-primary bg-primary/10 text-primary",
                    active && o.id === "lipsa" && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p
        className={cn(
          "text-xs",
          answered === DIMENSIONS.length ? "font-medium text-primary" : "text-muted-foreground",
        )}
      >
        {answered === DIMENSIONS.length
          ? "toate cinci. mulțumim, asta ne ajută cel mai mult."
          : `${answered} din ${DIMENSIONS.length}`}
      </p>
    </div>
  );
}

/** Bifele care decid ce secțiuni urmează. Grupate, ca să se scaneze din ochi. */
function ZonePicker({
  value,
  onChange,
  invalid,
}: {
  value: ZoneId[];
  onChange: (v: ZoneId[]) => void;
  invalid?: boolean;
}) {
  const toggle = (id: ZoneId) => {
    const next = value.includes(id) ? value.filter((z) => z !== id) : [...value, id];
    onChange(next);
    // Easter egg pentru cine chiar a fost peste tot.
    if (next.length === ZONES.length) toast("ai bifat tot. ai dormit vreodată?");
  };

  return (
    <div className={cn("space-y-5", invalid && "ring-2 ring-primary ring-offset-4")}>
      {ZONE_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="micro-label mb-2">{group.label}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.zones.map((z) => {
              const active = value.includes(z.id);
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => toggle(z.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-3 border p-3 text-left transition-colors",
                    active ? "border-primary bg-primary/5" : "border-input bg-background hover:border-primary",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 flex-none items-center justify-center border",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-input",
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span>
                    <span className={cn("block font-semibold leading-tight", active && "text-primary")}>
                      {z.label}
                    </span>
                    {z.hint && (
                      <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                        {z.hint}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Un câmp, ales după tipul întrebării. */
export function Field({
  q,
  answers,
  set,
  error,
}: {
  q: Question;
  answers: Answers;
  set: (id: string, v: AnswerValue) => void;
  error?: string;
}) {
  const raw = answers[q.id];

  return (
    <div className="border-t border-border pt-7 first:border-t-0 first:pt-0">
      <label className="block text-lg font-semibold leading-snug">
        {q.label}
        {!q.required && <span className="ml-2 text-sm font-normal text-muted-foreground">opțional</span>}
      </label>

      {q.help && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{q.help}</p>}

      <div className="mt-4">
        {q.type === "short" && (
          <>
            <input
              type="text"
              value={(raw as string) ?? ""}
              onChange={(e) => set(q.id, e.target.value)}
              placeholder={q.placeholder}
              className={inputClass(!!error)}
            />
            {/* Easter egg: dacă își scrie numele, îl salutăm. */}
            {q.greet && (
              <Reaction
                text={
                  ((raw as string) ?? "").trim().length > 1
                    ? `salut, ${((raw as string) ?? "").trim().split(/\s+/)[0]}.`
                    : undefined
                }
              />
            )}
          </>
        )}

        {q.type === "long" && (
          <AutoTextarea
            value={(raw as string) ?? ""}
            onChange={(v) => set(q.id, v)}
            placeholder={q.placeholder}
            placeholders={q.placeholders}
            invalid={!!error}
          />
        )}

        {q.type === "scale" && (
          <Scale
            id={q.id}
            value={raw as number | undefined}
            onChange={(v) => set(q.id, v)}
            low={q.low}
            high={q.high}
            invalid={!!error}
          />
        )}

        {q.type === "choice" && (
          <Choice
            id={q.id}
            options={q.options}
            value={raw as string | undefined}
            onChange={(v) => set(q.id, v)}
            invalid={!!error}
          />
        )}

        {q.type === "words" && (
          <Words
            options={q.options}
            max={q.max}
            value={(raw as string[]) ?? []}
            onChange={(v) => set(q.id, v)}
            invalid={!!error}
          />
        )}

        {q.type === "items" && (
          <Items
            value={(raw as string[]) ?? []}
            onChange={(v) => set(q.id, v)}
            slots={q.slots}
            ranked={q.ranked}
            accent={q.accent}
            placeholder={q.placeholder}
            invalid={!!error}
          />
        )}

        {q.type === "matrix" && (
          <Matrix
            value={(raw as Record<string, string>) ?? {}}
            onChange={(v) => set(q.id, v)}
          />
        )}

        {q.type === "zones" && (
          <>
            <ZonePicker
              value={(raw as ZoneId[]) ?? []}
              onChange={(v) => set(q.id, v)}
              invalid={!!error}
            />
            {((raw as ZoneId[]) ?? []).includes("altele") && (
              <input
                type="text"
                value={(answers.zone_altele as string) ?? ""}
                onChange={(e) => set("zone_altele", e.target.value)}
                placeholder="de ce anume te-ai ocupat?"
                className={cn(inputClass(false), "mt-3")}
              />
            )}
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm font-medium text-primary">{error}</p>}
    </div>
  );
}
