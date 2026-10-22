import type { CSSProperties } from "react";

// Decorative background: a grid of soft cells tinted with the brand yellows, with light
// sweeping through it like sun rays under water. Static when the user prefers reduced motion.

const COLS = 26;
const ROWS = 14;
const CYCLE = 11; // seconds for one light sweep
const SWELL = 7; // seconds for one wave to pass

// Deterministic pseudo-random in [0, 1) so server and client render the same grid.
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function cellStyle(r: number, c: number): CSSProperties {
  // Position in cells from the grid centre; the tint grows away from a diagonal band,
  // warm sunshine towards the top-right, soft gold towards the bottom-left.
  const x = c - (COLS - 1) / 2;
  const y = r - (ROWS - 1) / 2;
  const u = (x - y) / 11;
  const t = Math.min(1, Math.abs(u)) ** 1.4;
  const background =
    u > 0 ? `rgba(247, 201, 72, ${(0.3 * t).toFixed(3)})` : `rgba(255, 232, 154, ${(0.6 * t).toFixed(3)})`;
  const phase = (c * 0.5 + r * 0.3 + hash(r * COLS + c) * 1.6) % CYCLE;
  // The swell travels diagonally across the grid, like wind pushing waves.
  const swell = (c * 0.32 - r * 0.2 + 40) % SWELL;
  return {
    background,
    ["--glint-delay" as string]: `-${phase.toFixed(2)}s`,
    ["--swell-delay" as string]: `-${swell.toFixed(2)}s`,
  };
}

export function OceanGrid({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`ocean pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${className}`}>
      <div className="ocean-drift absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 gap-1.5"
          style={{ gridTemplateColumns: `repeat(${COLS}, 6rem)`, gridAutoRows: "6rem" }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const r = Math.floor(i / COLS);
            const c = i % COLS;
            const sparkle = hash(i + 7) < 0.12;
            return (
              <div key={i} className="ocean-cell relative overflow-hidden rounded-[1.25rem]" style={cellStyle(r, c)}>
                <span className="ocean-glint absolute inset-0" />
                {sparkle && (
                  <span
                    className="ocean-sparkle absolute inset-0"
                    style={{ animationDelay: `-${(hash(i + 3) * 7).toFixed(2)}s` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <span className="ocean-ray absolute -top-1/4 left-[18%] h-[150%] w-72" />
      <span className="ocean-ray ocean-ray-b absolute -top-1/4 left-[48%] h-[150%] w-96" />
      <span className="ocean-ray ocean-ray-c absolute -top-1/4 left-[76%] h-[150%] w-64" />
      {/* Calm the centre so the headline always reads cleanly. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_32%,var(--cream)_25%,transparent_75%)] opacity-80" />
    </div>
  );
}
