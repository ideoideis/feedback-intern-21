import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

/**
 * Stratul de inimioare. Orice componentă poate cere un puf de inimioare într-un
 * punct de pe ecran: `const hearts = useHearts(); hearts.burstAt(x, y)`.
 *
 * Sunt pur decorative: `pointer-events: none`, nu intră în ordinea de tabulare
 * și dispar singure. Cine are "reduced motion" pornit nu le vede deloc (vezi
 * index.css).
 */

type Heart = { id: number; x: number; y: number; dx: number; rot: number; size: number; dur: number };

type HeartsApi = {
  /** Un puf de inimioare într-un punct (coordonate de ecran). */
  burstAt: (x: number, y: number, count?: number) => void;
  /** Un puf care pleacă din elementul apăsat. */
  burstFrom: (el: Element | null, count?: number) => void;
  /** Ploaie de inimioare pe tot ecranul, pentru momentele mari. */
  rain: (count?: number) => void;
};

const HeartsCtx = createContext<HeartsApi>({
  burstAt: () => {},
  burstFrom: () => {},
  rain: () => {},
});

export const useHearts = () => useContext(HeartsCtx);

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function HeartsProvider({ children }: { children: ReactNode }) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const seq = useRef(0);

  const spawn = useCallback((made: Omit<Heart, "id">[]) => {
    const withIds = made.map((h) => ({ ...h, id: seq.current++ }));
    setHearts((prev) => [...prev, ...withIds]);
    const ids = new Set(withIds.map((h) => h.id));
    // Curățăm după ce s-a terminat animația, ca să nu crească DOM-ul la infinit.
    window.setTimeout(() => setHearts((prev) => prev.filter((h) => !ids.has(h.id))), 2200);
  }, []);

  const burstAt = useCallback(
    (x: number, y: number, count = 6) => {
      spawn(
        Array.from({ length: count }, () => ({
          x: x + rand(-14, 14),
          y: y + rand(-8, 8),
          dx: rand(-70, 70),
          rot: rand(-25, 25),
          size: rand(12, 24),
          dur: rand(1.1, 1.8),
        })),
      );
    },
    [spawn],
  );

  const burstFrom = useCallback(
    (el: Element | null, count = 6) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      burstAt(r.left + r.width / 2, r.top + r.height / 2, count);
    },
    [burstAt],
  );

  const rain = useCallback(
    (count = 28) => {
      spawn(
        Array.from({ length: count }, () => ({
          x: rand(0, window.innerWidth),
          y: rand(window.innerHeight * 0.55, window.innerHeight * 0.95),
          dx: rand(-50, 50),
          rot: rand(-30, 30),
          size: rand(12, 30),
          dur: rand(1.4, 2.1),
        })),
      );
    },
    [spawn],
  );

  return (
    <HeartsCtx.Provider value={{ burstAt, burstFrom, rain }}>
      {children}
      <div aria-hidden="true">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart"
            style={{
              left: h.x,
              top: h.y,
              fontSize: h.size,
              ["--dx" as string]: `${h.dx}px`,
              ["--rot" as string]: `${h.rot}deg`,
              ["--dur" as string]: `${h.dur}s`,
            }}
          >
            ♥
          </span>
        ))}
      </div>
    </HeartsCtx.Provider>
  );
}
