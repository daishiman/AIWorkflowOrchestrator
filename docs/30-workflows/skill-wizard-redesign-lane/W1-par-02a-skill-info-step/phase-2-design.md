# Phase 2: 設計

## メタ情報

- Phase: 2
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

Phase 1 で確定した要件を基に、`SkillInfoStep` コンポーネントの詳細設計を行う。コンポーネント構造・状態管理・バリデーションロジック・スタイリング方針を定める。

## 実行タスク

- [ ] コンポーネントの責務分割を設計する
- [ ] Props / 状態の設計を行う
- [ ] バリデーションロジックの設計を行う
- [ ] カテゴリタグ選択UIの設計を行う
- [ ] 「次へ」ボタンの活性化条件を設計する
- [ ] ファイル配置を決定する

## 参照資料

| 資料名                       | パス                                                 | 説明             |
| ---------------------------- | ---------------------------------------------------- | ---------------- |
| Phase 1 要件定義             | `phase-1-requirements.md`                            | 確定した要件     |
| 既存ウィザードコンポーネント | `apps/desktop/src/renderer/components/skill/wizard/` | 既存実装参照     |
| 共有型定義                   | `packages/shared/src/types/`                         | 型定義参照       |
| Tailwind CSS 設定            | `apps/desktop/tailwind.config.ts`                    | スタイリング設定 |

## 実行手順

### Step 1: コンポーネント構造設計

```
SkillInfoStep
├── SkillNameInput         # スキル名テキスト入力（任意）
├── PurposeTextarea        # 目的・背景テキストエリア（必須）
├── CategoryTagSelector    # カテゴリタグ単選択
└── NextButton             # 「次へ」ボタン（条件付き活性化）
```

サブコンポーネントはインライン実装とし、別ファイル分割は行わない（単一ファイル方針）。

### Step 2: Props 設計

`SkillInfoFormData` / `SkillCategory` は W0 で `packages/shared/src/types/skillCreator.ts` に追加された canonical な型。`category` は `SkillCategory | null` で初期状態の未選択を許容し、UI は選択後に `null` に戻さない単一選択として設計する。

```typescript
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";

interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

### Step 3: バリデーションロジック設計

```typescript
// 「次へ」ボタン活性化条件
const isNextEnabled = formData.purpose.trim().length >= 10;

// エラー表示条件（Touched-state 方式）
const [purposeTouched, setPurposeTouched] = useState(false);
const showPurposeError = purposeTouched && formData.purpose.trim().length < 10;
```

### Step 4: カテゴリタグ選択UI設計

```typescript
const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コードサポート" },
  { value: "other", label: "その他" },
];
```

- 各タグはボタン形式、単選択（再クリックしても `category` は保持し、`null` に戻らない）
- 選択中はハイライト表示（`bg-blue-100 border-blue-500` 相当）
- 未選択は通常表示（`bg-white border-gray-300` 相当）

### Step 5: 外部連携フラグ伝達設計

- `category === "external-integration"` のとき、Step 1 へ `formData` をそのまま渡す
- Step 1 側で `formData.category === "external-integration"` を判定して Q5 を必須化する
- 追加の Props や context は不要（`formData` の流通で完結）

### Step 6: ファイル配置設計

| ファイル                                                              | 操作     | 説明             |
| --------------------------------------------------------------------- | -------- | ---------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | 新規作成 | 本コンポーネント |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`  | 削除     | 旧実装           |

## 成果物

- コンポーネント構造図
- Props / 型定義の詳細設計
- バリデーションロジック設計
- カテゴリタグUI設計
- ファイル配置計画

## 完了条件

- [ ] コンポーネント構造が明確に設計されている
- [ ] `SkillInfoFormData` / `SkillInfoStepProps` の型定義が確定している
- [ ] バリデーションロジック（Touched-state 方式）が設計されている
- [ ] カテゴリタグ選択UIの挙動が仕様化されている
- [ ] 「次へ」ボタンの活性化条件が明確になっている
- [ ] ファイルの新規作成・削除計画が確定している
