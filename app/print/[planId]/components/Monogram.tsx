import type { Advisor } from "@/lib/agent/schemas";

/**
 * Circular monogram using the advisor's firm initials.
 * Used on cover and closing pages, mirroring the sample PDF's "G" badge.
 */
export function Monogram({
  advisor,
  size = 64,
  variant = "onDeep",
}: {
  advisor: Advisor;
  size?: number;
  variant?: "onDeep" | "onSurface";
}) {
  const initials = advisor.firm
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const stroke =
    variant === "onDeep"
      ? "var(--palette-accent-primary)"
      : "var(--palette-accent-primary)";
  const textColor =
    variant === "onDeep"
      ? "var(--palette-accent-primary)"
      : "var(--palette-text-on-surface)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${advisor.firm} monogram`}
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.6"
        strokeWidth="0.75"
      />
      <circle
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.3"
        strokeWidth="0.5"
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display-stack)"
        fontSize="16"
        fontStyle="italic"
        fontWeight="400"
        fill={textColor}
        letterSpacing="0.05em"
      >
        {initials}
      </text>
    </svg>
  );
}
