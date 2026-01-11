# 型定義設計書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | AGENT-002  |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## 1. 概要

スキル管理UIで使用する全ての型定義を設計する。既存のシステム仕様（`interfaces-agent-sdk.md`）との整合性を確保しつつ、スキル管理に必要な型を定義する。

## 2. コア型定義

### 2.1 Skill型

```typescript
// packages/shared/src/types/skill.ts

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
 * スキルの基本情報
 */
export interface Skill {
  /** 一意識別子（パスのハッシュまたはslug） */
  id: string;
  /** スキル名（SKILL.md解析） */
  name: string;
  /** ディレクトリ名（URL-safe） */
  slug: string;
  /** 概要説明 */
  description: string;
  /** ファイルパス .claude/skills/xxx/SKILL.md */
  path: string;
  /** Triggerキーワード */
  triggers: string[];
  /** Anchor一覧 */
  anchors: Anchor[];
  /** カテゴリ（推論または手動設定） */
  category?: SkillCategory;
  /** 最終更新日（ISO 8601形式） */
  lastUpdated?: string;
}

/**
 * スキル詳細情報（Skillを継承）
 */
export interface SkillDetail extends Skill {
  /** ワークフロー定義（Markdown） */
  workflow?: string;
  /** ベストプラクティス一覧 */
  bestPractices?: string[];
  /** 参照リソースパス */
  references?: string[];
  /** アセットファイルパス */
  assets?: string[];
  /** SKILL.mdの全文 */
  fullContent: string;
}
```

### 2.2 カテゴリ型

```typescript
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
 * カテゴリメタ情報
 */
export interface SkillCategoryMeta {
  /** 表示ラベル */
  label: string;
  /** Tailwind CSS色クラス */
  color: string;
  /** アイコン名（Lucide Icons） */
  icon: string;
}

/**
 * スキルカテゴリ定義マップ
 */
export const SKILL_CATEGORIES: Record<SkillCategory, SkillCategoryMeta> = {
  testing: {
    label: "テスト",
    color: "green",
    icon: "TestTube",
  },
  design: {
    label: "設計",
    color: "blue",
    icon: "Palette",
  },
  development: {
    label: "開発",
    color: "purple",
    icon: "Code",
  },
  documentation: {
    label: "ドキュメント",
    color: "orange",
    icon: "FileText",
  },
  security: {
    label: "セキュリティ",
    color: "red",
    icon: "Shield",
  },
  performance: {
    label: "パフォーマンス",
    color: "yellow",
    icon: "Zap",
  },
  other: {
    label: "その他",
    color: "gray",
    icon: "MoreHorizontal",
  },
} as const;
```

### 2.3 インポート設定型

```typescript
/**
 * スキルインポート設定（永続化用）
 */
export interface SkillImportConfig {
  /** インポート済みスキルID一覧 */
  importedSkillIds: string[];
  /** 最終更新日時（ISO 8601形式） */
  lastUpdated: string;
  /** バージョン（マイグレーション用） */
  version: number;
}

/**
 * インポート設定のデフォルト値
 */
export const DEFAULT_SKILL_IMPORT_CONFIG: SkillImportConfig = {
  importedSkillIds: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
};
```

---

## 3. 状態管理型

### 3.1 スキル管理状態

```typescript
/**
 * スキル管理の状態
 */
export interface SkillManagementState {
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
  /** インポートダイアログ表示フラグ */
  isImportDialogOpen: boolean;
  /** スキル読み込みエラー */
  skillLoadError: string | null;
}

/**
 * スキル管理のアクション
 */
export interface SkillManagementActions {
  /** 利用可能スキルを取得 */
  fetchAvailableSkills: () => Promise<void>;
  /** インポート済みスキルを取得 */
  fetchImportedSkills: () => Promise<void>;
  /** スキルをインポート */
  importSkills: (skillIds: string[]) => Promise<void>;
  /** スキルを削除（インポート解除） */
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

/**
 * スキル管理Slice（State + Actions）
 */
export type SkillManagementSlice = SkillManagementState &
  SkillManagementActions;
```

### 3.2 初期状態

```typescript
/**
 * スキル管理状態の初期値
 */
export const initialSkillManagementState: SkillManagementState = {
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

---

## 4. IPC通信型

### 4.1 IPCチャンネル定義

```typescript
/**
 * スキル関連のIPCチャンネル
 */
export const SKILL_IPC_CHANNELS = {
  /** 利用可能スキル一覧取得 */
  LIST_AVAILABLE: "skill:list-available",
  /** インポート済みスキル一覧取得 */
  LIST_IMPORTED: "skill:list-imported",
  /** スキルインポート */
  IMPORT: "skill:import",
  /** スキル削除（インポート解除） */
  REMOVE: "skill:remove",
  /** スキル詳細取得 */
  GET_DETAIL: "skill:get-detail",
} as const;

export type SkillIPCChannel =
  (typeof SKILL_IPC_CHANNELS)[keyof typeof SKILL_IPC_CHANNELS];
```

### 4.2 IPCリクエスト/レスポンス型

```typescript
/**
 * スキルインポートリクエスト
 */
export interface SkillImportRequest {
  skillIds: string[];
}

/**
 * スキル削除リクエスト
 */
export interface SkillRemoveRequest {
  skillId: string;
}

/**
 * スキル詳細取得リクエスト
 */
export interface SkillDetailRequest {
  skillId: string;
}

/**
 * IPC操作結果
 */
export interface SkillOperationResult {
  success: boolean;
  error?: string;
}

/**
 * Preload API型定義
 */
export interface SkillAPI {
  /** 利用可能スキル一覧を取得 */
  listAvailable: () => Promise<Skill[]>;
  /** インポート済みスキル一覧を取得 */
  listImported: () => Promise<Skill[]>;
  /** スキルをインポート */
  import: (request: SkillImportRequest) => Promise<SkillOperationResult>;
  /** スキルを削除 */
  remove: (request: SkillRemoveRequest) => Promise<SkillOperationResult>;
  /** スキル詳細を取得 */
  getDetail: (request: SkillDetailRequest) => Promise<SkillDetail>;
}
```

### 4.3 Window拡張型

```typescript
/**
 * Window オブジェクトの拡張
 */
declare global {
  interface Window {
    skillAPI: SkillAPI;
  }
}
```

---

## 5. コンポーネントProps型

### 5.1 SkillCard Props

```typescript
export interface SkillCardProps {
  /** スキルデータ */
  skill: Skill;
  /** 選択状態 */
  isSelected: boolean;
  /** クリックハンドラ */
  onClick: () => void;
  /** キーボードフォーカス時の処理 */
  onFocus?: () => void;
  /** Refフォワーディング */
  ref?: React.Ref<HTMLButtonElement>;
}
```

### 5.2 SkillList Props

```typescript
export interface SkillListProps {
  /** スキル一覧 */
  skills: Skill[];
  /** 選択中スキルID */
  selectedSkillId: string | null;
  /** スキル選択ハンドラ */
  onSkillSelect: (skill: Skill) => void;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error?: string | null;
  /** 再試行ハンドラ */
  onRetry?: () => void;
}
```

### 5.3 SkillDetailPanel Props

```typescript
export interface SkillDetailPanelProps {
  /** 選択中スキル */
  skill: Skill | null;
  /** 実行ハンドラ */
  onExecute: (skill: Skill) => void;
  /** 削除ハンドラ */
  onDelete: (skill: Skill) => void;
  /** パネルを閉じるハンドラ */
  onClose: () => void;
  /** パネル表示状態 */
  isOpen: boolean;
}
```

### 5.4 SkillSearchBar Props

```typescript
export interface SkillSearchBarProps {
  /** 現在の検索値 */
  value: string;
  /** 値変更ハンドラ */
  onChange: (value: string) => void;
  /** プレースホルダー */
  placeholder?: string;
  /** 自動フォーカス */
  autoFocus?: boolean;
  /** aria-label */
  "aria-label"?: string;
}
```

### 5.5 SkillCategoryFilter Props

```typescript
export interface SkillCategoryFilterProps {
  /** 選択中カテゴリ */
  value: SkillCategory | null;
  /** 変更ハンドラ */
  onChange: (category: SkillCategory | null) => void;
  /** 利用可能カテゴリ一覧 */
  categories: SkillCategory[];
  /** 無効状態 */
  disabled?: boolean;
}
```

### 5.6 SkillImportDialog Props

```typescript
export interface SkillImportDialogProps {
  /** ダイアログ表示状態 */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** 利用可能スキル一覧 */
  availableSkills: Skill[];
  /** インポート済みスキルID一覧 */
  importedSkillIds: string[];
  /** インポートハンドラ */
  onImport: (skillIds: string[]) => Promise<void>;
  /** ローディング状態 */
  isLoading?: boolean;
}
```

---

## 6. ユーティリティ型

### 6.1 フィルタリング関数の型

```typescript
/**
 * スキルフィルタリング関数
 */
export type SkillFilterFn = (
  skills: Skill[],
  filter: string,
  category: SkillCategory | null,
) => Skill[];
```

### 6.2 カテゴリ抽出関数の型

```typescript
/**
 * スキル一覧からカテゴリを抽出する関数
 */
export type ExtractCategoriesFn = (skills: Skill[]) => SkillCategory[];
```

---

## 7. Zodスキーマ（バリデーション用）

```typescript
import { z } from "zod";

/**
 * Anchor Zodスキーマ
 */
export const AnchorSchema = z.object({
  source: z.string().min(1),
  application: z.string().min(1),
  purpose: z.string().min(1),
});

/**
 * SkillCategory Zodスキーマ
 */
export const SkillCategorySchema = z.enum([
  "testing",
  "design",
  "development",
  "documentation",
  "security",
  "performance",
  "other",
]);

/**
 * Skill Zodスキーマ
 */
export const SkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  path: z.string().min(1),
  triggers: z.array(z.string()),
  anchors: z.array(AnchorSchema),
  category: SkillCategorySchema.optional(),
  lastUpdated: z.string().optional(),
});

/**
 * SkillImportRequest Zodスキーマ
 */
export const SkillImportRequestSchema = z.object({
  skillIds: z.array(z.string().min(1)).min(1),
});

/**
 * SkillRemoveRequest Zodスキーマ
 */
export const SkillRemoveRequestSchema = z.object({
  skillId: z.string().min(1),
});
```

---

## 8. 確認済み

- [x] Skill型がシステム仕様と整合している
- [x] カテゴリ型とメタ情報が定義されている
- [x] 状態管理型（State/Actions）が定義されている
- [x] IPC通信型（Channel/Request/Response）が定義されている
- [x] コンポーネントProps型が定義されている
- [x] Zodバリデーションスキーマが定義されている
