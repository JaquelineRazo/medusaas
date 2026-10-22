import type { CSSProperties } from "react";

// Sign-in background: a bloom of luminescent jellyfish rising with the current, with
// moments from the platform drifting among them. Decorative only.

type Vars = CSSProperties & Record<`--${string}`, string>;

// Deterministic pseudo-random in [0, 1) so server and client render the same scene.
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// left %, size px, seconds to rise, depth (0 near … 1 far)
const bloom = [
  { left: 6, size: 72, dur: 30, depth: 0 },
  { left: 18, size: 34, dur: 42, depth: 0.8 },
  { left: 31, size: 54, dur: 36, depth: 0.4 },
  { left: 47, size: 120, dur: 52, depth: 0.9 },
  { left: 60, size: 40, dur: 34, depth: 0.6 },
  { left: 71, size: 88, dur: 40, depth: 0.2 },
  { left: 84, size: 30, dur: 30, depth: 0.9 },
  { left: 92, size: 60, dur: 38, depth: 0.3 },
  { left: 2, size: 26, dur: 28, depth: 1 },
  { left: 39, size: 24, dur: 26, depth: 1 },
];

// Moments a client recognises from their own workspace.
const moments = [
  { text: "✓ Payment confirmed", top: 13, left: 42 },
  { text: "Request MS-1042 · Delivered", top: 80, left: 6 },
  { text: "Your site is online · 99.98%", top: 91, left: 30 },
  { text: "New update from your team", top: 15, left: 70 },
  { text: "Quote approved", top: 58, left: 1.5 },
];

export function GlowJelly({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 64 96" className="glow-jelly" aria-hidden="true">
      <defs>
        <radialGradient id="gj-bell" cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#FFF4C7" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FFE89A" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F7C948" stopOpacity="0.2" />
        </radialGradient>
        <linearGradient id="gj-strand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE89A" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFE89A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="strands">
        {["M20 34c-4 12 5 20-1 34", "M28 35c-2 14 6 20 0 38", "M36 35c2 14-6 20 0 36", "M44 34c4 12-5 20 1 32"].map((d) => (
          <path key={d} d={d} stroke="url(#gj-strand)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        ))}
      </g>
      <g className="bell">
        <path
          d="M8 32C8 16 18.5 6 32 6s24 10 24 26c0 3-2 4.5-5 4.5H13c-3 0-5-1.5-5-4.5Z"
          fill="url(#gj-bell)"
          stroke="#FFE89A"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
        <ellipse cx="23" cy="15" rx="7" ry="3" fill="#FFFFFF" opacity="0.45" transform="rotate(-25 23 15)" />
      </g>
    </svg>
  );
}

export function DeepSea() {
  return (
    <div aria-hidden="true" className="deep-sea pointer-events-none absolute inset-0 overflow-hidden">
      {/* Marine snow */}
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={`p${i}`}
          className="sea-rise absolute top-full rounded-full bg-soft-gold"
          style={
            {
              left: `${hash(i) * 100}%`,
              width: `${1 + hash(i + 50) * 2.5}px`,
              height: `${1 + hash(i + 50) * 2.5}px`,
              opacity: 0.15 + hash(i + 90) * 0.4,
              "--dur": `${22 + hash(i + 20) * 30}s`,
              "--delay": `-${hash(i + 30) * 50}s`,
            } as Vars
          }
        />
      ))}

      {bloom.map((j, i) => (
        <div
          key={`j${i}`}
          className="sea-rise absolute top-full"
          style={
            {
              left: `${j.left}%`,
              opacity: 0.95 - j.depth * 0.6,
              filter: j.depth > 0.7 ? `blur(${(j.depth * 2.5).toFixed(1)}px)` : undefined,
              "--dur": `${j.dur}s`,
              "--delay": `-${(hash(i + 7) * j.dur).toFixed(1)}s`,
            } as Vars
          }
        >
          <div className="sea-current" style={{ "--sway": `${7 + hash(i) * 6}s` } as Vars}>
            <GlowJelly size={j.size} />
          </div>
        </div>
      ))}

      {moments.map((m, i) => (
        <span
          key={m.text}
          className="sea-chip absolute hidden rounded-full border border-cream/15 bg-cream/[0.07] px-3 py-1.5 text-xs whitespace-nowrap text-cream/75 backdrop-blur-sm lg:block"
          style={
            {
              top: `${m.top}%`,
              left: `${m.left}%`,
              "--dur": `${11 + i * 2}s`,
              "--delay": `-${i * 3}s`,
            } as Vars
          }
        >
          {m.text}
        </span>
      ))}
    </div>
  );
}
