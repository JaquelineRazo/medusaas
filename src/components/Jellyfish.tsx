// Provisional SVGs traced from the creative board (BRAND.md) until final vectors exist.

// Outline isotype used in the logo lockup.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF9EB" />
          <stop offset="1" stopColor="#FFE89A" />
        </linearGradient>
      </defs>
      <path
        d="M13 30C13 16 21.5 7 32 7s19 9 19 23c0 3-1.8 4.5-4.5 4.5h-29C15 34.5 13 33 13 30Z"
        fill="url(#lm-fill)"
        stroke="#F7C948"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <ellipse cx="27" cy="22" rx="2.4" ry="3.8" fill="#F7C948" />
      <ellipse cx="37" cy="22" rx="2.4" ry="3.8" fill="#F7C948" />
      {["M20 35c-2 7 3 11-1 20", "M28 35c-1 8 4 12 1 22", "M36 35c1 8-4 12-1 21", "M44 35c2 7-3 11 1 19"].map(
        (d) => (
          <path key={d} d={d} stroke="#F7C948" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        ),
      )}
    </svg>
  );
}

// Mavi, the assistant: filled, glossy, with a face.
export function Mavi({
  size = 40,
  float = false,
  className = "",
}: {
  size?: number;
  float?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`${float ? "animate-float" : ""} ${className}`}
    >
      <defs>
        <radialGradient id="mavi-bell" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF4C7" />
          <stop offset="0.55" stopColor="#FFDD6E" />
          <stop offset="1" stopColor="#F2B83A" />
        </radialGradient>
        <linearGradient id="mavi-arm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C948" />
          <stop offset="1" stopColor="#FFE89A" />
        </linearGradient>
      </defs>
      {/* Class names let a parent animate the arms, eyes and face (see .mavi-swim). */}
      {["M19 33c-3 8 4 13-1 23", "M27 34c-2 9 5 13 0 24", "M37 34c2 9-5 13 0 23", "M45 33c3 8-4 13 1 21"].map(
        (d, i) => (
          <path
            key={d}
            d={d}
            className={i === 0 ? "mavi-arm mavi-arm-lead" : i === 3 ? "mavi-arm mavi-arm-tail" : "mavi-arm"}
            stroke="url(#mavi-arm)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        ),
      )}
      <path
        d="M10 30C10 15 20 6 32 6s22 9 22 24c0 4-2.5 6-6 6H16c-3.5 0-6-2-6-6Z"
        fill="url(#mavi-bell)"
      />
      <ellipse cx="22" cy="13" rx="6" ry="3" fill="#FFFFFF" opacity="0.55" transform="rotate(-25 22 13)" />
      <g className="mavi-face">
        <g className="mavi-eyes">
          <ellipse cx="26" cy="21" rx="2.2" ry="3.6" fill="#25231F" />
          <ellipse cx="39" cy="21" rx="2.2" ry="3.6" fill="#25231F" />
        </g>
        <path d="M29.5 27c1.6 1.6 4.4 1.6 6 0" stroke="#25231F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// "medu" regular + "SAAS" bold, as in the creative lockup. The descriptor only
// appears in the large lockup (landing, sign-in): BRAND.md.
export function Wordmark({ size = 32, descriptor = false }: { size?: number; descriptor?: boolean }) {
  return (
    <span className="flex items-center gap-2" aria-label="meduSAAS">
      <LogoMark size={size} />
      <span className="leading-none" aria-hidden="true">
        <span className="block text-xl tracking-tight">
          <span className="font-medium">medu</span>
          <span className="font-extrabold">SAAS</span>
        </span>
        {descriptor && (
          <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] uppercase opacity-70">
            Software as a Service
          </span>
        )}
      </span>
    </span>
  );
}
