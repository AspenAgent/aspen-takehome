import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Wallet,
  Calendar,
  Users,
  Home,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Landmark,
  Heart,
  BookOpen,
  Scale,
  BarChart3,
  PiggyBank,
  Handshake,
} from "lucide-react";
import type { IconName, IconTilesBlockSchema } from "@/lib/agent/schemas";
import type { z } from "zod";

const ICONS: Record<IconName, LucideIcon> = {
  shield: Shield,
  wallet: Wallet,
  calendar: Calendar,
  users: Users,
  home: Home,
  briefcase: Briefcase,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  landmark: Landmark,
  heart: Heart,
  "book-open": BookOpen,
  scale: Scale,
  "chart-bar": BarChart3,
  "piggy-bank": PiggyBank,
  handshake: Handshake,
};

type Props = z.infer<typeof IconTilesBlockSchema>;

export function IconTiles({ tiles }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: "0.6in",
        rowGap: "0.45in",
        padding: "0.25in 0",
      }}
    >
      {tiles.map((tile, i) => {
        const Icon = ICONS[tile.icon];
        return (
          <div key={i}>
            <div
              style={{
                color: "var(--palette-accent-primary)",
                marginBottom: "0.6rem",
              }}
            >
              {Icon ? <Icon size={22} strokeWidth={1.4} /> : null}
            </div>
            <div
              className="display-md"
              style={{
                marginBottom: "0.3rem",
                color: "currentColor",
              }}
            >
              {tile.title}
            </div>
            <div
              className="body-md"
              style={{ color: "currentColor", opacity: 0.82 }}
            >
              {tile.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
