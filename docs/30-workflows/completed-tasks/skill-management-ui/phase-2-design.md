# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 2                   |
| Phase名    | 設計                |
| 前提Phase  | Phase 1             |
| 後続Phase  | Phase 3             |
| ステータス | 未実施              |
| 作成日     | 2026-01-10          |
| 機能名     | skill-management-ui |

---

## 目的

スキル管理UIのアーキテクチャ、コンポーネント構造、型定義を設計し、実装の基盤を構築する。

## 背景

Phase 1で定義した要件を基に、Atomic Designに従ったコンポーネント構造、TypeScript型定義、Zustand状態管理の設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Skill型定義の設計

**目的**: 型安全なスキルデータ構造を定義する

**実行手順**:

1. システム仕様（`interfaces-agent-sdk.md`）のSkill型定義を確認
2. 以下の型定義を設計:

```typescript
// packages/shared/src/types/skill.ts

/**
 * スキルの基本情報
 */
export interface Skill {
  /** 一意識別子（パスのハッシュ） */
  id: string;
  /** スキル名（SKILL.md解析） */
  name: string;
  /** ディレクトリ名 */
  slug: string;
  /** 概要説明 */
  description: string;
  /** .claude/skills/xxx/SKILL.md */
  path: string;
  /** Triggerキーワード */
  triggers: string[];
  /** Anchor一覧 */
  anchors: Anchor[];
  /** カテゴリ（推論または手動設定） */
  category?: string;
  /** 最終更新日 */
  lastUpdated?: string;
}

/**
 * スキルのアンカー情報（参照文献と適用方法）
 */
export interface Anchor {
  /** 参考文献名 */
  source: string;
  /** 適用方法 */
  application: string;
  /** 目的 */
  purpose: string;
}

/**
 * スキル詳細情報（Skillを継承）
 */
export interface SkillDetail extends Skill {
  /** ワークフロー定義 */
  workflow?: string;
  /** ベストプラクティス */
  bestPractices?: string[];
  /** 参照リソース */
  references?: string[];
  /** アセットパス */
  assets?: string[];
}

/**
 * スキルインポート設定
 */
export interface SkillImportConfig {
  /** インポート済みスキルID一覧 */
  importedSkillIds: string[];
  /** 最終更新日時 */
  lastUpdated: string;
}

/**
 * スキルカテゴリ
 */
export type SkillCategory =
  | "testing"
  | "design"
  | "development"
  | "documentation"
  | "security"
  | "performance"
  | "other";

/**
 * スキルカテゴリ定義
 */
export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { label: string; color: string }
> = {
  testing: { label: "テスト", color: "green" },
  design: { label: "設計", color: "blue" },
  development: { label: "開発", color: "purple" },
  documentation: { label: "ドキュメント", color: "orange" },
  security: { label: "セキュリティ", color: "red" },
  performance: { label: "パフォーマンス", color: "yellow" },
  other: { label: "その他", color: "gray" },
};
```

3. 型定義を文書化

**期待される成果物**:

- 型定義設計書（`outputs/phase-2/type-definitions.md`）

---

### タスク2: コンポーネント構造の設計

**目的**: Atomic Designに従ったコンポーネント階層を設計する

**実行手順**:

1. 以下のコンポーネント構造を設計:

```
AgentView
├── SkillManagementSection (organism)
│   ├── SkillToolbar (molecule)
│   │   ├── SkillSearchBar (molecule)
│   │   │   └── Input (atom)
│   │   ├── SkillCategoryFilter (molecule)
│   │   │   └── Select (atom)
│   │   └── ImportButton (atom)
│   ├── SkillList (organism)
│   │   ├── SkillCard[] (molecule)
│   │   │   ├── SkillCardHeader
│   │   │   ├── SkillCardDescription
│   │   │   └── SkillCardTags
│   │   └── EmptyState (molecule)
│   └── SkillDetailPanel (organism)
│       ├── SkillHeader
│       ├── SkillDescription
│       ├── SkillTriggers
│       ├── SkillAnchors
│       └── SkillActions
├── SkillImportDialog (organism)
│   ├── DialogHeader
│   ├── SkillSearchBar (再利用)
│   ├── AvailableSkillList
│   │   └── SkillCheckboxItem[]
│   └── DialogActions
```

2. 各コンポーネントのProps定義:

```typescript
// SkillCard.tsx
interface SkillCardProps {
  skill: Skill;
  isSelected: boolean;
  onClick: () => void;
}

// SkillList.tsx
interface SkillListProps {
  skills: Skill[];
  selectedSkillId: string | null;
  onSkillSelect: (skill: Skill) => void;
  isLoading: boolean;
  filter: string;
  category: string | null;
}

// SkillDetailPanel.tsx
interface SkillDetailPanelProps {
  skill: Skill | null;
  onExecute: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
  onClose: () => void;
}

// SkillSearchBar.tsx
interface SkillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// SkillCategoryFilter.tsx
interface SkillCategoryFilterProps {
  value: string | null;
  onChange: (category: string | null) => void;
  categories: SkillCategory[];
}

// SkillImportDialog.tsx
interface SkillImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  availableSkills: Skill[];
  importedSkillIds: string[];
  onImport: (skillIds: string[]) => void;
}
```

3. コンポーネント構造を文書化

**期待される成果物**:

- コンポーネント設計書（`outputs/phase-2/component-design.md`）

---

### タスク3: レイアウト設計

**目的**: 詳細なUIレイアウトとスタイルを設計する

**実行手順**:

1. メインレイアウト（3カラム構成）:

```
┌─────────────────────────────────────────────────────────────────┐
│ AgentView                                                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ SkillToolbar                                                 │ │
│ │ ┌──────────────────────────┐ ┌────────────┐ ┌─────────────┐ │ │
│ │ │ 🔍 スキルを検索...        │ │ カテゴリ ▼ │ │ + インポート │ │ │
│ │ └──────────────────────────┘ └────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┬─────────────────────┐ │
│ │ SkillList (60%)                       │ SkillDetailPanel    │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐   │ (40%)               │ │
│ │ │ Card 1  │ │ Card 2  │ │ Card 3  │   │                     │ │
│ │ │ ▪▪▪▪▪▪  │ │ ▪▪▪▪▪▪  │ │ ▪▪▪▪▪▪  │   │ ┌─────────────────┐ │ │
│ │ │ tags    │ │ tags    │ │ tags    │   │ │ Skill Name      │ │ │
│ │ └─────────┘ └─────────┘ └─────────┘   │ │ Description...  │ │ │
│ │ ┌─────────┐ ┌─────────┐               │ │ Triggers: ...   │ │ │
│ │ │ Card 4  │ │ Card 5  │               │ │ Anchors: ...    │ │ │
│ │ │ ▪▪▪▪▪▪  │ │ ▪▪▪▪▪▪  │               │ │ [実行] [削除]   │ │ │
│ │ │ tags    │ │ tags    │               │ └─────────────────┘ │ │
│ │ └─────────┘ └─────────┘               │                     │ │
│ └───────────────────────────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

2. SkillCard詳細デザイン:

```
┌─────────────────────────────────┐
│ SkillCard (GlassPanel)          │
│ padding: spacing-4 (16px)       │
│ border-radius: 12px             │
│ ┌─────────────────────────────┐ │
│ │ 📦 skill-name               │ │  ← text-lg, font-semibold
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Description text that may   │ │  ← text-sm, text-muted
│ │ span multiple lines...      │ │     line-clamp-2
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [テスト] [TDD]              │ │  ← Badge, gap-2
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
  hover: scale(1.02), shadow-lg
  selected: ring-2 ring-primary
```

3. スタイル定義（Tailwind CSS）を文書化

**期待される成果物**:

- レイアウト設計書（`outputs/phase-2/layout-design.md`）

---

### タスク4: Zustand agentSlice拡張設計

**目的**: スキル管理用の状態管理を設計する

**実行手順**:

1. システム仕様（`architecture-patterns.md`）のZustand Sliceパターンを確認
2. 以下の状態・アクションを設計:

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

// 追加する状態
interface SkillManagementState {
  /** 利用可能なスキル一覧（.claude/skills/配下） */
  availableSkills: Skill[];
  /** インポート済みスキル一覧 */
  importedSkills: Skill[];
  /** 選択中のスキル */
  selectedSkill: Skill | null;
  /** 検索フィルター */
  skillFilter: string;
  /** カテゴリフィルター */
  skillCategory: SkillCategory | null;
  /** スキル読み込み中 */
  isLoadingSkills: boolean;
  /** インポートダイアログ表示 */
  isImportDialogOpen: boolean;
  /** スキル読み込みエラー */
  skillLoadError: string | null;
}

// 追加するアクション
interface SkillManagementActions {
  /** 利用可能スキルを取得 */
  fetchAvailableSkills: () => Promise<void>;
  /** インポート済みスキルを取得 */
  fetchImportedSkills: () => Promise<void>;
  /** スキルをインポート */
  importSkills: (skillIds: string[]) => Promise<void>;
  /** スキルを削除 */
  removeSkill: (skillId: string) => Promise<void>;
  /** スキルを選択 */
  selectSkill: (skill: Skill | null) => void;
  /** フィルターを設定 */
  setSkillFilter: (filter: string) => void;
  /** カテゴリを設定 */
  setSkillCategory: (category: SkillCategory | null) => void;
  /** インポートダイアログを開く */
  openImportDialog: () => void;
  /** インポートダイアログを閉じる */
  closeImportDialog: () => void;
  /** スキル状態をリセット */
  resetSkillState: () => void;
}

// 初期状態
const initialSkillState: SkillManagementState = {
  availableSkills: [],
  importedSkills: [],
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,
  isLoadingSkills: false,
  isImportDialogOpen: false,
  skillLoadError: null,
};
```

3. 状態管理設計を文書化

**期待される成果物**:

- 状態管理設計書（`outputs/phase-2/state-management-design.md`）

---

### タスク5: IPC API設計

**目的**: Main ProcessとRenderer Process間のIPC通信を設計する

**実行手順**:

1. 以下のIPCチャンネルを設計:

```typescript
// IPCチャンネル定義
const SKILL_IPC_CHANNELS = {
  // 利用可能スキル取得
  LIST_AVAILABLE: "skill:list-available",
  // インポート済みスキル取得
  LIST_IMPORTED: "skill:list-imported",
  // スキルインポート
  IMPORT: "skill:import",
  // スキル削除
  REMOVE: "skill:remove",
  // スキル詳細取得
  GET_DETAIL: "skill:get-detail",
} as const;

// Preload API
interface SkillAPI {
  /** 利用可能スキル一覧を取得 */
  listAvailable: () => Promise<Skill[]>;
  /** インポート済みスキル一覧を取得 */
  listImported: () => Promise<Skill[]>;
  /** スキルをインポート */
  import: (skillIds: string[]) => Promise<void>;
  /** スキルを削除 */
  remove: (skillId: string) => Promise<void>;
  /** スキル詳細を取得 */
  getDetail: (skillId: string) => Promise<SkillDetail>;
}

// window.skillAPI として公開
declare global {
  interface Window {
    skillAPI: SkillAPI;
  }
}
```

2. IPC API設計を文書化

**期待される成果物**:

- IPC API設計書（`outputs/phase-2/ipc-api-design.md`）

---

### タスク6: 設計書のとりまとめ

**目的**: 全設計を統合した設計書を作成する

**実行手順**:

1. タスク1〜5の成果物を統合
2. 設計書を作成

**期待される成果物**:

- 設計書（`outputs/phase-2/design.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                         | 内容                      |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| UI/UXコンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design、Props設計  |
| UI/UXデザインシステム仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | Glass Panel、スペーシング |
| アーキテクチャパターン     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Sliceパターン     |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Skill型定義、AgentState   |
| Phase 1成果物              | `outputs/phase-1/requirements.md`                                            | 要件定義書                |

---

## 成果物

| 成果物               | パス                                         | 内容                   |
| -------------------- | -------------------------------------------- | ---------------------- |
| 型定義設計書         | `outputs/phase-2/type-definitions.md`        | Skill型、カテゴリ型    |
| コンポーネント設計書 | `outputs/phase-2/component-design.md`        | コンポーネント階層     |
| レイアウト設計書     | `outputs/phase-2/layout-design.md`           | UIレイアウト、スタイル |
| 状態管理設計書       | `outputs/phase-2/state-management-design.md` | Zustand agentSlice拡張 |
| IPC API設計書        | `outputs/phase-2/ipc-api-design.md`          | IPCチャンネル設計      |
| 設計書               | `outputs/phase-2/design.md`                  | 統合設計書             |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での統合テスト連携アクション

- 統合ポイント/契約（IPC API・Skill型）を設計に反映
- Zustand agentSliceとSkillListコンポーネントの接続ポイントを定義
- IPC通信のモックデータ形式を定義
- エラーハンドリングの統合パターンを設計

---

## 完了条件

- [ ] Skill型定義が完成している
- [ ] コンポーネント構造がAtomic Designに従って設計されている
- [ ] 各コンポーネントのPropsが定義されている
- [ ] レイアウト（3カラム構成）が設計されている
- [ ] Zustand agentSlice拡張が設計されている
- [ ] IPC APIが設計されている
- [ ] 設計書が完成している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-management-ui/phase-3-design-review.md`
