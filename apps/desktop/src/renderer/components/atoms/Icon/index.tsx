import React, { forwardRef } from "react";
import clsx from "clsx";
import {
  LayoutGrid,
  FolderTree,
  MessageCircle,
  Network,
  Aperture,
  User,
  UserPlus,
  LogIn,
  Folder,
  FolderOpen,
  FolderSearch,
  File,
  FileText,
  Sparkles,
  Menu,
  X,
  Check,
  CheckCircle,
  Loader2,
  Send,
  RefreshCw,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Sun,
  Moon,
  Monitor,
  Pencil,
  WifiOff,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  Bot,
  Globe,
  Zap,
  Eye,
  EyeOff,
  Lock,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  MapPin,
  Search,
  CaseSensitive,
  Regex,
  WholeWord,
  ArrowUp,
  ArrowDown,
  Replace,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "layout-grid"
  | "folder-tree"
  | "message-circle"
  | "network"
  | "aperture"
  | "user"
  | "user-plus"
  | "log-in"
  | "folder"
  | "folder-open"
  | "file-text"
  | "sparkles"
  | "menu"
  | "x"
  | "check"
  | "check-circle"
  | "loader-2"
  | "send"
  | "refresh-cw"
  | "settings"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "play"
  | "pause"
  | "sun"
  | "moon"
  | "monitor"
  | "pencil"
  | "wifi-off"
  | "alert-triangle"
  | "upload"
  | "download"
  | "trash-2"
  | "bot"
  | "globe"
  | "zap"
  | "eye"
  | "eye-off"
  | "lock"
  | "x-circle"
  | "clock"
  | "alert-circle"
  | "shield"
  | "map-pin"
  | "search"
  | "case-sensitive"
  | "regex"
  | "whole-word"
  | "arrow-up"
  | "arrow-down"
  | "file"
  | "folder-search"
  | "replace";

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  spin?: boolean;
}

const iconMap: Record<IconName, LucideIcon> = {
  "layout-grid": LayoutGrid,
  "folder-tree": FolderTree,
  "message-circle": MessageCircle,
  network: Network,
  aperture: Aperture,
  user: User,
  "user-plus": UserPlus,
  "log-in": LogIn,
  folder: Folder,
  "folder-open": FolderOpen,
  "file-text": FileText,
  sparkles: Sparkles,
  menu: Menu,
  x: X,
  check: Check,
  "check-circle": CheckCircle,
  "loader-2": Loader2,
  send: Send,
  "refresh-cw": RefreshCw,
  settings: Settings,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  play: Play,
  pause: Pause,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  pencil: Pencil,
  "wifi-off": WifiOff,
  "alert-triangle": AlertTriangle,
  upload: Upload,
  download: Download,
  "trash-2": Trash2,
  bot: Bot,
  globe: Globe,
  zap: Zap,
  eye: Eye,
  "eye-off": EyeOff,
  lock: Lock,
  "x-circle": XCircle,
  clock: Clock,
  "alert-circle": AlertCircle,
  shield: Shield,
  "map-pin": MapPin,
  search: Search,
  "case-sensitive": CaseSensitive,
  regex: Regex,
  "whole-word": WholeWord,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  file: File,
  "folder-search": FolderSearch,
  replace: Replace,
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = 20,
      color = "currentColor",
      className,
      spin = false,
      ...props
    },
    ref,
  ) => {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in icon map`);
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        size={size}
        color={color}
        className={clsx(spin && "animate-spin", className)}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

Icon.displayName = "Icon";
