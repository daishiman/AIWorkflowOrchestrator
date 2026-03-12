import type { IconName } from "../../../../components/atoms/Icon";
import type { ThemeMode } from "../../../../store/types";
import type { ImportedSkill, SkillMetadata, SkillName } from "@repo/shared";

export type OnboardingThemeMode = Exclude<ThemeMode, "system">;

export interface OnboardingSuggestion {
  id: string;
  label: string;
  response: string;
}

export interface OnboardingSkillCard {
  skillName: SkillName;
  label: string;
  description: string;
  icon: IconName;
  availability: "available" | "imported";
}

export interface OnboardingThemeOption {
  mode: OnboardingThemeMode;
  label: string;
  description: string;
  swatches: [string, string, string];
}

interface SkillCardBlueprint {
  skillName: SkillName;
  label: string;
  description: string;
  icon: IconName;
}

const SKILL_CARD_BLUEPRINTS: readonly SkillCardBlueprint[] = [
  {
    skillName: "aiworkflow-requirements",
    label: "仕様を見つける",
    description: "必要な要件や設計の正本をすばやく確認します。",
    icon: "search",
  },
  {
    skillName: "task-specification-creator",
    label: "タスクを分解",
    description: "実装前にフェーズと責務を整理して進めます。",
    icon: "file-text",
  },
  {
    skillName: "github-issue-manager",
    label: "Issueを整える",
    description: "進行中タスクの整理と同期をまとめて行います。",
    icon: "folder-search",
  },
  {
    skillName: "skill-creator",
    label: "スキルを作る",
    description: "新しいスキルの設計と改善を対話的に進めます。",
    icon: "sparkles",
  },
];

export const ONBOARDING_STEP_LABELS = [
  "なまえ",
  "おためし",
  "ツール",
  "テーマ",
] as const;

export const ONBOARDING_SUGGESTIONS: readonly OnboardingSuggestion[] = [
  {
    id: "movies",
    label: "おすすめの映画を教えて",
    response:
      "週末なら、静かに見られるヒューマンドラマか気分が上がる冒険ものがおすすめです。",
  },
  {
    id: "weather",
    label: "今日の天気は?",
    response:
      "外に出る前に知りたいことを、ひとことから気軽に聞けます。答え方もあとで調整できます。",
  },
  {
    id: "joke",
    label: "簡単なジョークを言って",
    response:
      "軽い雑談から始めても大丈夫です。まずは気軽に返事が返ってくる感覚をつかみましょう。",
  },
] as const;

export const ONBOARDING_THEME_OPTIONS: readonly OnboardingThemeOption[] = [
  {
    mode: "kanagawa-dragon",
    label: "Kanagawa",
    description: "深い藍色と暖色アクセントで落ち着いて集中できます。",
    swatches: ["#0d0c14", "#7fb4ca", "#c4746e"],
  },
  {
    mode: "light",
    label: "ライト",
    description: "白基調で情報をはっきり読みたいときに向いています。",
    swatches: ["#f8fafc", "#2563eb", "#0f172a"],
  },
  {
    mode: "dark",
    label: "ダーク",
    description: "夜間でも眩しさを抑えながら作業できます。",
    swatches: ["#111827", "#34d399", "#f3f4f6"],
  },
] as const;

function normalizeDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  return normalized.length > 56
    ? `${normalized.slice(0, 53).trimEnd()}...`
    : normalized;
}

function humanizeSkillName(name: string): string {
  return name
    .split(/[-_]/g)
    .filter((segment) => segment !== "")
    .map((segment) => {
      if (segment.length <= 2) {
        return segment.toUpperCase();
      }
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(" ");
}

function toFallbackCard(
  skill: SkillMetadata | ImportedSkill,
  availability: OnboardingSkillCard["availability"],
): OnboardingSkillCard {
  return {
    skillName: skill.name,
    label: humanizeSkillName(skill.name),
    description: normalizeDescription(skill.description),
    icon: availability === "available" ? "puzzle" : "check-circle",
    availability,
  };
}

export function buildOnboardingSkillCards(
  availableSkills: readonly SkillMetadata[],
  importedSkills: readonly ImportedSkill[],
): OnboardingSkillCard[] {
  const availableByName = new Map(
    availableSkills.map((skill) => [skill.name, skill] as const),
  );
  const importedByName = new Map(
    importedSkills.map((skill) => [skill.name, skill] as const),
  );
  const selected = new Set<SkillName>();
  const cards: OnboardingSkillCard[] = [];

  for (const blueprint of SKILL_CARD_BLUEPRINTS) {
    if (availableByName.has(blueprint.skillName)) {
      cards.push({ ...blueprint, availability: "available" });
      selected.add(blueprint.skillName);
    }
  }

  for (const skill of availableSkills) {
    if (cards.length >= 3) {
      break;
    }
    if (selected.has(skill.name)) {
      continue;
    }
    cards.push(toFallbackCard(skill, "available"));
    selected.add(skill.name);
  }

  for (const skill of importedSkills) {
    if (cards.length >= 3) {
      break;
    }
    if (selected.has(skill.name)) {
      continue;
    }
    cards.push(toFallbackCard(skill, "imported"));
    selected.add(skill.name);
  }

  return cards.slice(0, 3);
}
