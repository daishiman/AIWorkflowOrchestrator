# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                      |
| --------- | ----------------------- |
| Phase番号 | 8                       |
| 機能名    | skill-create-wizard     |
| タスクID  | TASK-10A-C              |
| 作成日    | 2026-03-03              |
| 前Phase   | Phase 7: カバレッジ確認 |
| 次Phase   | Phase 9: 品質保証       |

## 目的

TDD サイクルの Refactor フェーズとして、**テストを壊さずにコード品質を改善**する。
Phase 5 で実装した `SkillCreateWizard` コンポーネント群のリファクタリングを行い、
保守性・可読性・再利用性を向上させる。

## 実行タスク

- リファクタリングタスク: 可読性・再利用性・保守性を向上し回帰なしを確認する。

| No  | タスク                     | 優先度 |
| --- | -------------------------- | ------ |
| 1   | カスタムフック抽出         | 高     |
| 2   | CSS変数・スタイル定数統一  | 高     |
| 3   | Props型のexportと再利用    | 中     |
| 4   | 重複コードの除去           | 中     |
| 5   | 不要コード・コメント削除   | 低     |
| 6   | テスト再実行・グリーン確認 | 高     |

## 参照資料

| 資料                                | パス                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| Phase 1 要件定義                    | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-1-requirements.md`            |
| Phase 2 設計                        | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-2-design.md`                  |
| P47パターン（バリアント定数外部化） | `.claude/rules/06-known-pitfalls.md#P47`                                                   |
| P31対策（Zustand個別セレクタ）      | `.claude/rules/06-known-pitfalls.md#P31`                                                   |
| P39対策（happy-dom fireEvent）      | `.claude/rules/06-known-pitfalls.md#P39`                                                   |
| Phase 6 テスト拡充                  | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-6-test-expansion.md`          |
| コーディング規約                    | `.claude/rules/02-code-quality.md`                                                         |
| 実装ガイド（Phase 5成果物）         | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/`                   |
| カバレッジレポート（Phase 7成果物） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md` |
| 状態管理アーキテクチャ              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`               |
| 機能別UIコンポーネント仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`            |
| Agent SDK スキル仕様                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`          |

## 実行手順

### Step 1: 現状把握と変更計画

```bash
# 現在のコンポーネント構成を確認
ls apps/desktop/src/renderer/components/skill/
ls apps/desktop/src/renderer/components/skill/wizard/

# テストが全てグリーンであることを確認（リファクタリング前ベースライン）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

既存実装を読み、以下の観点でリファクタリング候補を洗い出す:

- [ ] 20行超の `useEffect` / `useState` 群 → カスタムフックに抽出
- [ ] ハードコードされた色値（`#007AFF`, `rgb(...)` 等）→ CSS変数に置換
- [ ] インライン style オブジェクト → Tailwind CSS クラスに統一
- [ ] `as` 型アサーション箇所 → 適切な型ガードに変更
- [ ] `any` 型使用箇所 → 具体的な型に変更

### Step 2: カスタムフック抽出（`useWizardStep`）

ウィザードのステップ管理ロジックを `useWizardStep` カスタムフックに抽出する。

**抽出対象のロジック:**

- 現在のステップ状態（`currentStep`）管理
- 次のステップへの遷移（`goNext`）
- 前のステップへの戻り（`goBack`）
- 完了判定（`isLastStep`, `isFirstStep`）
- ステップバリデーション状態

**抽出先ファイル:**

```
apps/desktop/src/renderer/components/skill/hooks/useWizardStep.ts
```

**フック設計（参考）:**

```typescript
// ウィザードステップ数は実装に合わせて調整する
export type WizardStep = "describe" | "configure" | "generate" | "complete";

export interface UseWizardStepReturn {
  currentStep: WizardStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: WizardStep) => void;
}

export function useWizardStep(
  steps: readonly WizardStep[],
): UseWizardStepReturn {
  // 実装
}
```

**テストファイル:**

```
apps/desktop/src/renderer/components/skill/__tests__/useWizardStep.test.ts
```

テスト作成後に実装してグリーンを確認する。

### Step 3: バリアントスタイル定数の外部化（P47パターン）

CSS変数ベースのスタイルをコンポーネント外部の `Record` 定数として定義し、
テストから import できるようにする。

```typescript
// ❌ コンポーネント内インライン定義（テストでハードコード文字列が必要になる）
const stepColors = {
  active: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  pending: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
};

// ✅ モジュールスコープ定数としてexport（テストからimport可能）
export const stepVariantStyles: Record<WizardStepStatus, string> = {
  active: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  pending: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
};
```

**対象コンポーネント:**

- `SkillCreateWizard.tsx` のステップインジケーター
- `wizard/WizardStepIndicator.tsx`（存在する場合）
- `wizard/WizardProgressBar.tsx`（存在する場合）

### Step 4: Props型のexportと整理

サブコンポーネントの Props 型を export して再利用可能にする。

```typescript
// ❌ Props型がコンポーネントと同一ファイルかつ非export
interface WizardStepProps {
  step: WizardStep;
  isActive: boolean;
}

// ✅ export してテスト・親コンポーネントから参照可能に
export interface WizardStepProps {
  step: WizardStep;
  isActive: boolean;
  isCompleted: boolean;
}
```

**命名規則:** コンポーネント名 + `Props` サフィックス（例: `WizardStepIndicatorProps`）

### Step 5: clsx による条件付きクラス合成の統一

テンプレートリテラルによる条件付きクラス合成を `clsx` に統一する。

```typescript
// ❌ テンプレートリテラルによる条件付きクラス（可読性低い）
const className = `base-class ${isActive ? "active-class" : ""} ${isCompleted ? "completed-class" : ""}`;

// ✅ clsx による統一（可読性高い）
import clsx from "clsx";
const className = clsx(
  "base-class",
  isActive && "active-class",
  isCompleted && "completed-class",
);
```

`clsx` が `apps/desktop/package.json` に含まれていることを確認:

```bash
grep -n "clsx" apps/desktop/package.json
```

含まれていない場合は追加:

```bash
pnpm --filter @repo/desktop add clsx
```

### Step 6: IPC入力バリデーション確認（P42対策）

`skillHandlers.ts` の `skill:create` ハンドラーで3段バリデーションが実装されていることを確認する。

```typescript
// P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
if (
  typeof args?.description !== "string" ||
  args.description === "" ||
  args.description.trim() === ""
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "description must be a non-empty string",
  };
}
```

### Step 7: 不要コードの削除

- TODO コメント（Phase 5 実装時の一時的なもの）の解消または Issue 化
- デッドコード（使用されていない変数・関数・import）の削除
- 過度なインラインコメントの整理（コードが自明な箇所）

```bash
# 未使用importの検出
cd apps/desktop && pnpm lint --rule "no-unused-vars: error"

# TODO/FIXMEコメントの確認
grep -rn "TODO\|FIXME\|HACK" apps/desktop/src/renderer/components/skill/
```

### Step 8: テスト再実行・グリーン確認

```bash
# リファクタリング後にテストがグリーンであることを確認
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# カバレッジが低下していないことを確認
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/
```

**確認基準:**

- 全テストがグリーン（Phase 7 と同じ件数が PASS）
- Line Coverage: 80% 以上
- Function Coverage: 80% 以上
- Branch Coverage: 60% 以上

### Step 9: リファクタリングサマリーの作成

成果物として `outputs/phase-8/refactoring-summary.md` を作成する。

## 統合テスト連携

リファクタリング後に `SkillManagementPanel`（TASK-10A-A）や
`SkillAnalysisView`（TASK-10A-B）との統合テストに影響がないことを確認する。

```bash
# 関連コンポーネントのテストも実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

## 多角的チェック観点

| 観点           | 確認内容                                                         |
| -------------- | ---------------------------------------------------------------- |
| テスト安全性   | 全テストがグリーン（リファクタリング前後でテスト数・結果が同一） |
| 型安全性       | `any` 型なし、`@ts-ignore` なし、型アサーション最小化            |
| CSS変数統一    | ハードコード色値の排除、`var(--...)` への置換完了                |
| カスタムフック | `useWizardStep` が境界値を含めてテストされている                 |
| P47パターン    | バリアントスタイル定数が export され、テストからimport可能       |
| P42準拠        | IPC ハンドラーで3段バリデーション実装済み                        |
| P39準拠        | テストで `fireEvent` 使用（`userEvent` 不使用）                  |

## 成果物

| 成果物                               | パス                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| カスタムフック                       | `apps/desktop/src/renderer/components/skill/hooks/useWizardStep.ts`                            |
| カスタムフックテスト                 | `apps/desktop/src/renderer/components/skill/__tests__/useWizardStep.test.ts`                   |
| リファクタリング済みコンポーネント群 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` および `wizard/` 配下       |
| リファクタリングサマリー             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-8/refactoring-summary.md` |

## 完了条件

- [ ] `useWizardStep` カスタムフックが抽出され、テストが PASS している
- [ ] バリアントスタイル定数が export され、P47パターンに準拠している
- [ ] ハードコード色値がすべて CSS変数（`var(--...)`）に置換されている
- [ ] Props型がすべて export されている
- [ ] 条件付きクラス合成が `clsx` に統一されている
- [ ] `any` 型、`@ts-ignore` がコンポーネント内に残っていない
- [ ] 全テストがグリーン（リファクタリング前後でテスト数が同一）
- [ ] カバレッジが Phase 7 基準（Line 80%、Function 80%、Branch 60%）を維持
- [ ] `outputs/phase-8/refactoring-summary.md` が作成されている

## サブタスク管理

| No  | サブタスク                   | ステータス |
| --- | ---------------------------- | ---------- |
| 1   | 現状把握・変更計画策定       | pending    |
| 2   | `useWizardStep` フック抽出   | pending    |
| 3   | バリアントスタイル定数外部化 | pending    |
| 4   | Props型整理・export          | pending    |
| 5   | clsx統一                     | pending    |
| 6   | IPC バリデーション確認       | pending    |
| 7   | 不要コード削除               | pending    |
| 8   | テスト再実行・グリーン確認   | pending    |
| 9   | リファクタリングサマリー作成 | pending    |

## タスク100%実行確認【必須】

Phase 8 完了前に以下を全項目確認すること:

- [ ] リファクタリング開始前にテストベースラインを記録した
- [ ] リファクタリング後にテストがすべてグリーンであることを確認した
- [ ] カバレッジが基準値を維持していることを確認した
- [ ] `outputs/phase-8/refactoring-summary.md` を作成した
- [ ] 変更内容の要約を記録した（何を、なぜ変更したか）

## 次のPhase

Phase 8 の全完了条件チェックが終了したら、Phase 9（品質保証）へ進む。

仕様書: `docs/30-workflows/completed-tasks/skill-create-wizard/phase-9-quality-assurance.md`
