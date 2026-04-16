import React from "react";
import { Svg, Path, Circle, Rect } from "@react-pdf/renderer";

interface IconProps {
  size?: number;
  color?: string;
}

function ShieldIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v4c0 4.52-3.13 8.69-7 9.93C8.13 20.69 5 16.52 5 12V8l7-3.82z"
        fill={color}
      />
      <Path d="M10 15.5l-3-3 1.41-1.41L10 12.67l5.59-5.59L17 8.5l-7 7z" fill={color} />
    </Svg>
  );
}

function ClockIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M12 7v5l3.5 3.5" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

function DollarIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2v2m0 16v2m-4-14c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}

function ChartIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="12" width="4" height="9" rx="1" fill={color} />
      <Rect x="10" y="7" width="4" height="14" rx="1" fill={color} />
      <Rect x="17" y="3" width="4" height="18" rx="1" fill={color} />
    </Svg>
  );
}

function LockIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="11" width="14" height="10" rx="2" fill={color} />
      <Path
        d="M8 11V7a4 4 0 1 1 8 0v4"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </Svg>
  );
}

function HeartIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </Svg>
  );
}

function HomeIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill={color} />
    </Svg>
  );
}

function StarIcon({ size = 24, color = "#C4963B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={color}
      />
    </Svg>
  );
}

export const iconMap: Record<string, React.FC<IconProps>> = {
  shield: ShieldIcon,
  clock: ClockIcon,
  dollar: DollarIcon,
  chart: ChartIcon,
  lock: LockIcon,
  heart: HeartIcon,
  home: HomeIcon,
  star: StarIcon,
};

export function Icon({
  name,
  size = 24,
  color = "#C4963B",
}: { name: string } & IconProps) {
  const IconComponent = iconMap[name] || StarIcon;
  return <IconComponent size={size} color={color} />;
}
