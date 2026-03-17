import type { ViewType } from "../store/types";

export type SkillLifecycleJob = "create" | "use" | "improve";

export type SkillLifecycleSurfaceId =
  | "skillCenter"
  | "workspace"
  | "agent"
  | "chat"
  | "skillCreator"
  | "settings";

export interface SkillLifecycleJobGuide {
  id: SkillLifecycleJob;
  title: string;
  entryLabel: string;
  handoffLabel: string;
  summary: string;
  completion: string;
  onAction?: () => void;
}

export interface SkillLifecycleSurfaceResponsibility {
  id: SkillLifecycleSurfaceId;
  label: string;
  primaryResponsibility: string;
  forbiddenResponsibility: string;
  handoff: string;
}

export interface SkillLifecycleAdvancedRoute {
  path: string;
  label: string;
  role: string;
}

export interface SkillLifecycleDependencyContract {
  taskId: string;
  input: string;
  output: string;
  forbidden: string;
}

export const SKILL_LIFECYCLE_ENTRY_VIEW = "skillCenter" as const;

export const SKILL_LIFECYCLE_JOB_GUIDES: readonly SkillLifecycleJobGuide[] = [
  {
    id: "create",
    title: "スキルを作る",
    entryLabel: "Skill Center で目的と既存資産を確認する",
    handoffLabel: "Skill Creator で下書きを作る",
    summary:
      "新規作成は、いきなり詳細設定へ入らずに、まず入口で目的を言語化してから作成に進む。",
    completion: "作成後は Workspace または Agent へ渡して試す。",
  },
  {
    id: "use",
    title: "スキルを使う",
    entryLabel: "Workspace で文脈を集める",
    handoffLabel: "Agent で実行する",
    summary:
      "利用時は、作業中の文脈を Workspace で整え、実行判断と結果確認は Agent に寄せる。",
    completion: "結果を見て、そのまま改善判断へつなぐ。",
  },
  {
    id: "improve",
    title: "スキルを改善する",
    entryLabel: "追加済みスキルを分析対象として選ぶ",
    handoffLabel: "Skill Analysis で改善案を確認する",
    summary:
      "改善は独立した新規導線ではなく、使った後の評価結果から再度分析へ戻す流れとして扱う。",
    completion: "改善案の採用後に、再び Workspace / Agent で再評価する。",
  },
] as const;

export const SKILL_LIFECYCLE_SURFACE_RESPONSIBILITIES: readonly SkillLifecycleSurfaceResponsibility[] =
  [
    {
      id: "skillCenter",
      label: "Skill Center",
      primaryResponsibility:
        "入口としてツール探索、一次導線の案内、作成前の意図整理を担う。",
      forbiddenResponsibility: "直接実行や詳細分析の本体を背負わない。",
      handoff: "作成は Skill Creator、利用は Workspace / Agent へ渡す。",
    },
    {
      id: "workspace",
      label: "Workspace",
      primaryResponsibility: "作業文脈、ファイル、下準備をまとめる。",
      forbiddenResponsibility:
        "最終実行の意思決定や詳細設定の主責務を持たない。",
      handoff: "準備ができたら Agent へ実行を渡す。",
    },
    {
      id: "agent",
      label: "Agent",
      primaryResponsibility: "スキル実行、結果確認、改善判断の起点を担う。",
      forbiddenResponsibility: "探索一覧や作成ウィザードの代替にならない。",
      handoff: "改善が必要なら Skill Analysis へ戻す。",
    },
    {
      id: "chat",
      label: "Chat",
      primaryResponsibility: "会話と履歴への到達を担う補助面として機能する。",
      forbiddenResponsibility: "ライフサイクル全体の主入口にならない。",
      handoff: "必要時のみ Skill Center や履歴へ送る。",
    },
    {
      id: "skillCreator",
      label: "Skill Creator",
      primaryResponsibility: "新規スキルの作成工程を担う。",
      forbiddenResponsibility: "探索・実行・改善結果の一覧責務を持たない。",
      handoff: "作成完了後は Workspace / Agent へ戻す。",
    },
    {
      id: "settings",
      label: "Settings",
      primaryResponsibility: "公開シェル例外として設定変更を維持する。",
      forbiddenResponsibility: "一次導線の主経路に混ざらない。",
      handoff: "認証や設定の復旧後に主導線へ戻す。",
    },
  ] as const;

export const SKILL_LIFECYCLE_ADVANCED_ROUTES: readonly SkillLifecycleAdvancedRoute[] =
  [
    {
      path: "/advanced/skill-management-panel",
      label: "Skill Management Panel",
      role: "create / improve の補助導線。主要導線の代替にしない。",
    },
    {
      path: "/advanced/skill-analysis",
      label: "Skill Analysis",
      role: "改善検証用の直描画ルート。通常は Agent 経由で到達する。",
    },
    {
      path: "/advanced/skill-create-wizard",
      label: "Skill Create Wizard",
      role: "作成 UI の検証用直描画ルート。通常は入口設計に従って使う。",
    },
    {
      path: "/advanced/skill-center",
      label: "Skill Center standalone",
      role: "代表画面の検証用ルート。主要 shell の代替にはしない。",
    },
  ] as const;

export const SKILL_LIFECYCLE_DEPENDENCY_CONTRACTS: readonly SkillLifecycleDependencyContract[] =
  [
    {
      taskId: "TASK-SKILL-LIFECYCLE-02",
      input: "一次導線シーケンスと画面責務マトリクスを参照する。",
      output: "導線に沿った UI 実装差分を追加する。",
      forbidden: "advanced ルートを主入口へ昇格させない。",
    },
    {
      taskId: "TASK-SKILL-LIFECYCLE-03",
      input: "surface ごとの禁止責務を参照する。",
      output: "state ownership と handoff 契約を補強する。",
      forbidden: "shell / view / local state の責務を混線させない。",
    },
    {
      taskId: "TASK-SKILL-LIFECYCLE-04",
      input: "Agent / Workspace の実行境界を参照する。",
      output: "実行導線と改善導線の連携を実装する。",
      forbidden: "Chat を一次導線の主経路として扱わない。",
    },
    {
      taskId: "TASK-SKILL-LIFECYCLE-05",
      input: "Phase 11/12 の証跡要件を参照する。",
      output: "スクリーンショットと仕様同期を追加する。",
      forbidden: "settings 例外を一般導線へ拡張しない。",
    },
  ] as const;

export function normalizeSkillLifecycleView(
  view: ViewType,
): Exclude<ViewType, "skill-center"> {
  if (view === "skill-center") {
    return "skillCenter";
  }

  return view;
}

export function getSkillLifecycleSurfaceResponsibility(
  surface: SkillLifecycleSurfaceId | ViewType,
): SkillLifecycleSurfaceResponsibility | undefined {
  const normalizedSurface =
    surface === "skill-center" ? "skillCenter" : surface;

  return SKILL_LIFECYCLE_SURFACE_RESPONSIBILITIES.find(
    (item) => item.id === normalizedSurface,
  );
}

export function isSupportingAdvancedLifecycleRoute(path: string): boolean {
  return SKILL_LIFECYCLE_ADVANCED_ROUTES.some((route) => route.path === path);
}
