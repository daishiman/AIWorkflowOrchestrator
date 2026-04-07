# Phase 5: 実装

## メタ情報

- Phase: 5
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

設計・テストに基づき `ConversationRoundStep.tsx` を新規作成し、`ConfigureStep.tsx` を削除する。全テストが GREEN になることを目標とする。

## 依存関係と並列実装（重要）

最小の手戻りで進めるため、作業順と並列化境界を固定する。

| 作業                                | 依存              | 並列可 | 備考                                                                                  |
| ----------------------------------- | ----------------- | ------ | ------------------------------------------------------------------------------------- |
| shared 型の参照固定                 | -                 | -      | `ConversationAnswers` / `QuestionAnswer` / `SkillWizardScheduleConfig` を正本から参照 |
| `InterviewProgressBar.tsx` 作成     | shared 型         | ✅     | UI部品。単体で実装できる                                                              |
| `ApplySummaryCard.tsx` 作成         | shared 型         | ✅     | **key-based マッピングを必須**（後述）                                                |
| `ConversationRoundStep.tsx` 作成    | shared 型 + 2部品 | -      | 親コンポーネント。状態・分岐をここに集約                                              |
| `ConfigureStep.tsx` 削除 + 参照置換 | 親実装が動作      | -      | 最後にまとめて行い、残存参照を 0 件にする                                             |

## 実行タスク

- [ ] `ConversationAnswers` / `QuestionAnswer` / `SkillWizardScheduleConfig` を shared 正本から参照する
- [ ] `InterviewProgressBar.tsx` / `ApplySummaryCard.tsx` を **shared 型確定後に並列**で作成する
- [ ] `ConversationRoundStep.tsx` を作成し、Page 1/2 と Q3 展開・サマリー表示の状態を実装する
- [ ] `ConfigureStep.tsx` を削除し、`ConfigureStep` / `WizardOptions` 参照を 0 件にする
- [ ] 対象テストを実行し GREEN を確認する

## 参照資料

| 資料名               | パス                       | 説明         |
| -------------------- | -------------------------- | ------------ |
| Phase 4 テスト       | `phase-4-test-creation.md` | テスト仕様   |
| Phase 2 設計書       | `phase-2-design.md`        | 実装仕様     |
| Phase 3 設計レビュー | `phase-3-design-review.md` | 修正済み仕様 |

## 実行手順

### Step 1: shared 型の参照準備

`ConversationAnswers` / `QuestionAnswer` / `SkillWizardScheduleConfig` は `packages/shared/src/types/skillCreator.ts` に定義された正本を参照する。

```typescript
import type {
  ConversationAnswers,
  QuestionAnswer,
  SkillInfoFormData,
  SkillWizardScheduleConfig,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
```

### Step 2: InterviewProgressBar.tsx / ApplySummaryCard.tsx の新規作成（並列可）

#### InterviewProgressBar

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`

要件:

- 表示: `質問 {currentQuestion}/6`
- ゲージ: `currentQuestion/6` に比例して伸びる
- 外部依存を増やさない（単純な props + Tailwind で完結）

#### ApplySummaryCard（key-based マッピング必須）

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`

要件:

- 未回答問（`selectedOption === null` かつ `freeText.trim()===""`）に対し、`smartDefaults` の既定値を一覧表示する
- Q5 は `formData.category === "external-integration"` のときだけ警告を出す（警告はブロックしない）
- **インデックス依存は禁止**: `Object.keys()` の順序と `smartDefaults` の配列を突合しない
- 代わりに、**質問キー -> smartDefaults キー**の対応を 1 箇所に固定する

例（方針の固定。コード量は最小でよい）:

```typescript
type QuestionKey = keyof ConversationAnswers;

const QUESTION_KEYS: readonly QuestionKey[] = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
];

const DEFAULT_KEY_BY_QUESTION: Record<QuestionKey, keyof SmartDefaultResult> = {
  q1: "who",
  q2: "input",
  q3: "timing",
  q4: "output",
  q5: "tool",
  q6: "format",
};
```

### Step 3: ConversationRoundStep.tsx の新規作成

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

主要な実装方針:

- `useState<1 | 2>(1)` でページ管理
- `useState(false)` でサマリーカード表示管理
- Q3「定期実行」選択時のみ `ScheduleConfigInput` をインライン展開
- `InterviewProgressBar` / `ApplySummaryCard` は別ファイルから import
- `QuestionCard` はインライン実装（再利用予定なし）

各問の選択肢:

```typescript
const QUESTIONS = [
  {
    key: "q1",
    label: "利用者（誰が使うか）",
    options: ["自分のみ", "チームメンバー", "社内全体", "外部ユーザー"],
  },
  {
    key: "q2",
    label: "入力データ（何を渡すか）",
    options: ["テキスト", "ファイル", "URLリンク", "構造化データ"],
  },
  {
    key: "q3",
    label: "実行タイミング",
    options: ["手動実行", "定期実行", "イベント駆動", "都度判断"],
  },
  {
    key: "q4",
    label: "出力先（どこへ）",
    options: ["チャット返信", "ファイル保存", "外部ツール", "通知"],
  },
  {
    key: "q5",
    label: "外部ツール連携",
    options: ["なし", "Slack", "GitHub", "その他"],
  },
  {
    key: "q6",
    label: "出力フォーマット",
    options: ["Markdown", "プレーンテキスト", "JSON", "箇条書き"],
  },
] as const;
```

### Step 4: ConfigureStep.tsx の削除 + 参照箇所の置換

削除後、参照を 0 件にする。

- `import { ConfigureStep }` → `import { ConversationRoundStep }`
- `WizardOptions` 型の利用 → `ConversationAnswers` 等へ置換（利用実態に合わせて最小変更）

参照検索（高速化のため `rg` 推奨）:

```bash
rg -n "ConfigureStep|WizardOptions" apps packages
```

### Step 5: テスト実行（GREEN 確認）

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

## 成果物

### 新規作成

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`

### 修正

- `ConfigureStep` / `WizardOptions` を参照していた全ファイル（import 置き換え）

### 削除

- `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`

## 完了条件

- [ ] `ConversationRoundStep.tsx` が新規作成されている
- [ ] `InterviewProgressBar.tsx` が新規作成されている
- [ ] `ApplySummaryCard.tsx` が新規作成されている
- [ ] `ConversationAnswers` / `QuestionAnswer` / `SkillWizardScheduleConfig` は shared 正本から参照されている
- [ ] `ConfigureStep.tsx` が削除されている
- [ ] `WizardOptions` 型の参照が全て解消されている
- [ ] 全テストが GREEN になっている
- [ ] TypeScript のコンパイルエラーがない
