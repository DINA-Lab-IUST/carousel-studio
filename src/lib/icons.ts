import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Heart,
  Lightbulb,
  MessageCircle,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/** A small curated set keeps the icon picker tidy and the bundle lean. */
export const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  rocket: Rocket,
  target: Target,
  zap: Zap,
  trending: TrendingUp,
  users: Users,
  lightbulb: Lightbulb,
  heart: Heart,
  star: Star,
  clock: Clock,
  shield: Shield,
  eye: Eye,
  check: CheckCircle2,
  warning: AlertTriangle,
  search: Search,
  message: MessageCircle,
  bookmark: Bookmark,
  flag: Flag,
}

export const ICON_NAMES = Object.keys(ICON_MAP)

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles
}
