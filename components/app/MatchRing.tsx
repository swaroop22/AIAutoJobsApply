const DEFAULT_SIZE = 52;
const STROKE = 3.5;

export function MatchRing({
  percent,
  size = DEFAULT_SIZE,
  showLabel = true,
}: {
  percent: number;
  size?: number;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  // In Tsenta, the stroke is dark slate/ink for strong matches
  const strokeColor = clamped >= 80 ? '#1e293b' : clamped >= 60 ? '#334155' : '#94a3b8';

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center bg-transparent"
      style={{ width: size, height: size }}
      title={`${clamped}% profile match`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.08)"
          strokeWidth={STROKE}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center select-none" style={{ marginTop: '-1px' }}>
        <span className="text-xs font-bold leading-none text-ink">{clamped}%</span>
        {showLabel && (
          <span className="text-[9px] font-normal leading-tight text-ink/75 mt-0.5">match</span>
        )}
      </div>
    </div>
  );
}
