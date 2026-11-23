// A slushie cup drawn in SVG, filled with the recipe's colour.
export function Cup({ color = "#ff3b6b", size = 120, label }: { color?: string; size?: number; label?: string }) {
  const id = `g${color.replace("#", "")}`;
  return (
    <svg className="cup-svg" width={size} height={size * 1.35} viewBox="0 0 100 135" role="img" aria-label={label ?? "slushie cup"}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor="#1a1033" stopOpacity="0.25" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d="M18 48 L82 48 L74 128 L26 128 Z" />
        </clipPath>
      </defs>
      {/* straw */}
      <path d="M58 6 L64 3 L56 60" fill="none" stroke="#1a1033" strokeWidth="9" strokeLinecap="round" />
      <path d="M58 6 L64 3 L56 60" fill="none" stroke="#fffaf1" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 6" />
      {/* dome of slush */}
      <path d="M14 48 C14 22 86 22 86 48 Z" fill={color} stroke="#1a1033" strokeWidth="3" />
      <circle cx="34" cy="38" r="4" fill="#fff" opacity="0.7" />
      <circle cx="46" cy="32" r="2.5" fill="#fff" opacity="0.7" />
      <circle cx="66" cy="40" r="3" fill="#fff" opacity="0.5" />
      {/* cup */}
      <path d="M18 48 L82 48 L74 128 L26 128 Z" fill="#fffaf1" stroke="#1a1033" strokeWidth="3" />
      <g clipPath={`url(#${id}c)`}>
        <rect x="10" y="48" width="80" height="85" fill={`url(#${id})`} />
        <path d="M10 66 Q30 58 50 66 T90 66" fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" />
        <path d="M10 92 Q30 84 50 92 T90 92" fill="none" stroke="#fff" strokeWidth="3" opacity="0.3" />
        <rect x="26" y="54" width="7" height="60" rx="3.5" fill="#fff" opacity="0.4" />
      </g>
      <path d="M18 48 L82 48 L74 128 L26 128 Z" fill="none" stroke="#1a1033" strokeWidth="3" />
      {/* lid rim */}
      <rect x="10" y="44" width="80" height="9" rx="4.5" fill="#fffaf1" stroke="#1a1033" strokeWidth="3" />
    </svg>
  );
}
