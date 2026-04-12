<<<<<<< Updated upstream

# Phase 12: 実装ガイド - UT-SKILL-WIZARD-W2-seq-03a

||||||| Stash base

# Phase 12: 実装ガイド - UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

=======

# 実装ガイド - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

## Part 1: 中学生レベルの説明

<<<<<<< Updated upstream
| 項目 | 内容 |
| -------- | ------------------------------------------ |
| タスクID | UT-SKILL-WIZARD-W2-seq-03a |
| 作成日 | 2026-04-11 |
| 対象 | SkillCreateWizard オーケストレーション更新 |
| 状態 | completed（Phase 12 完了 / PR 未作成） |
||||||| Stash base
| 項目 | 内容 |
| -------- | ------------------------------------------------ |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 作成日 | 2026-04-11 |
| 対象 | `SkillCategory` の日本語ラベルマッピング共有契約 |
| 状態 | completed（Phase 12 canonical 6 を更新済み） |
=======

### たとえ話

> > > > > > > Stashed changes

カレンダーにない日付は、どれだけ待っても来ません。たとえば「2月31日」は存在しないので、「毎年2月31日に実行してください」と言っても、実行日は永遠に来ません。

### 何が変わったか

<<<<<<< Updated upstream

### SkillCreateWizard のオーケストレーション更新とは何か？

||||||| Stash base

### 何を直したのか

=======
`validateCronExpression` に `semantic` という追加スイッチを入れました。

> > > > > > > Stashed changes

<<<<<<< Updated upstream
スキルを作るための「ウィザード（案内役）」を大幅に改良した話です。

以前は「テンプレートで作る方法」と「AIに考えてもらう方法」の2択がありました。でも2択があると使う人が迷ってしまいます。今回は「AIに考えてもらう方法」だけに統一しました。
||||||| Stash base
スキルのカテゴリ名は、もともと `automation` や `code-support` のような英語の札でした。  
今回は、その札を日本語の札に変える仕組みを 1 か所にまとめました。

たとえば、引き出しに英語の番号だけが書いてあると、使う人は中身をすぐに思い出しにくいです。  
そこで、番号の横に「自動化」「外部連携」などの日本語の名前を貼るイメージです。
=======

- `semantic` を付けないときは、今まで通り「書き方が正しいか」だけを見ます
- `semantic: true` を付けたときだけ、「その日付が本当に存在するか」まで見ます
  > > > > > > > Stashed changes

また、AIにスキルを作ってもらうとき、ユーザーが入力した「スキル名」「目的」「カテゴリ」から、AIへの質問の答えを自動で予測する「スマートデフォルト」機能を追加しました。たとえば「目的に `slack` / `Slack` / `SLACK` のどれが書かれていても、Q5の答え候補を `slack` として推論する」という感じです。これで、ユーザーが同じことを何度も入力する手間を省けます。

<<<<<<< Updated upstream
完了画面では、生成したスキルのパスを見ながら品質フィードバックを送り、イメージと違ったら Step 0 に戻ってやり直せます。前回の入力は残るので、毎回最初から入力し直す必要はありません。
||||||| Stash base

- 人が見たときに意味がわかりやすいからです
- 画面ごとに違う名前を書かなくてよくなるからです
- # 1つの名前を直せば、関係する画面にまとめて反映できるからです
  書き方は合っているのに、実際には一度も動かないスケジュールを防ぐためです。ユーザーが気づく前に警告できれば、あとで原因調査をする手間を減らせます。
  > > > > > > > Stashed changes

<<<<<<< Updated upstream
**例えば：**
||||||| Stash base

### 何をするか

=======

## Part 2: 技術者向けの説明

> > > > > > > Stashed changes

<<<<<<< Updated upstream

- 「毎日Slackに通知を送る」と入力すると、自動で「タイミング：定期実行」「ツール：Slack」が選ばれる
- カテゴリを「code-support（コードサポート）」にすると、自動で「出力形式：コード」が選ばれる

**専門用語の説明：**

- **ウィザード**：複数の画面を順番に案内してくれる入力フォームのこと
- **オーケストレーション**：複数のコンポーネント（部品）を指揮して動かす役割
- **スマートデフォルト**：ユーザーの入力から自動で答えを予測する仕組み
- **state（ステート）**：コンポーネントが持っている「今の状態」の情報
  ||||||| Stash base
- `SkillCategory` の 5 つの値に日本語ラベルを付ける
- そのラベルを `skillCreator.ts` に集める
- # 画面では、そのラベルをそのまま使う

### 変更ファイル

> > > > > > > Stashed changes

| ファイル                                                                | 変更種別 | 変更内容                                                                                                               |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 修正     | `ValidateCronOptions` インターフェース追加、`validateCronExpression` シグネチャ拡張、semantic ロジック追加、JSDoc 更新 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 修正     | TC-01〜TC-16（semantic validation テスト）追加                                                                         |
| `apps/desktop/package.json`                                             | 修正     | `cron-parser@5.5.0` を `dependencies` に追加                                                                           |

<<<<<<< Updated upstream

## Part 2: 技術者向け説明

||||||| Stash base

## Part 2: 開発者向け説明

=======

### API 変更

> > > > > > > Stashed changes

<<<<<<< Updated upstream

### 変更概要

`SkillCreateWizard.tsx` から `description` / `options` / `generationMode` state と関連する全 `template` 分岐を除去し、LLM 専用化した。新たに `formData`/`answers`/`smartDefaults`/`generationMethod`/`skillPath`/`hasExternalIntegration`/`externalToolName` の state を追加し、`handleRetry` で Step 0 への復帰を接続する。`inferSmartDefaults` は `purpose` を小文字化して判定し、`slack`/`github`/`notion` を大小文字不問で推論する。生成開始時は `generationLockRef` と `clearGenerationState()` で再入とストア残留を抑える。

### STEPS 配列変更

```typescript
// 変更前
["説明入力", "設定", "生成", "完了"];

// 変更後
["スキル情報入力", "詳細設定", "生成", "完了"];
```

### inferSmartDefaults 関数（分離先: `wizard/utils/inferSmartDefaults.ts`）

````typescript
export function inferSmartDefaults(
  data: SkillInfoFormData,
): SmartDefaultResult {
  // purpose テキストからツール・タイミングを推論（大小文字不問）
  // category から出力フォーマットを推論
  // inferenceLog に推論根拠を記録
||||||| Stash base
### 変更点サマリー

| ファイル                                                                                    | 変更内容                                                                                    |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                                 | `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` を公開し、`satisfies` で型網羅性を固定 |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                           | `SkillCategory` の union 劣化を検出する型テストを追加                                       |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                       | カテゴリ表示を shared helper から生成するように変更                                         |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                        | deprecated step でも shared helper を参照し、`コード支援` の drift を解消                   |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`         | canonical label が option として描画されることを追加検証                                    |
| `docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001/*`                         | 参照リンク、AC、品質確認、Phase 12 台帳を current facts に同期                              |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | Skill Wizard Shared Contracts へラベル共有契約を追記                                        |

### current contract

```ts
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";

export const SKILL_CATEGORY_LABELS = {
  automation: "自動化",
  "external-integration": "外部連携",
  "data-analysis": "データ分析",
  "code-support": "コードサポート",
  other: "その他",
} as const satisfies Record<SkillCategory, string>;

export function getSkillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_LABELS[category];
=======
```typescript
export interface ValidateCronOptions {
  /** true の場合、cron-parser を使用して意味論的バリデーション（next-execution-time 計算）を実行する */
  semantic?: boolean;
>>>>>>> Stashed changes
}
````

<<<<<<< Updated upstream
**推論ルール**:

| 条件                                     | 結果                  |
| ---------------------------------------- | --------------------- |
| purpose に "slack"（大小文字不問）       | tool = "slack"        |
| purpose に "github"（大小文字不問）      | tool = "github"       |
| purpose に "notion"（大小文字不問）      | tool = "notion"       |
| purpose に "毎日/毎週/定期/スケジュール" | timing = "scheduled"  |
| purpose に "リアルタイム/即座/すぐに"    | timing = "realtime"   |
| category === "code-support"              | format = "code"       |
| category === "data-analysis"             | format = "structured" |

### API シグネチャ

````typescript
handleStep0Next(): void
handleGenerate(method: "complete" | "skip"): Promise<void>
handleQualityFeedback(satisfied: boolean): void
handleRetry(): void
handleCancelGeneration(): void
||||||| Stash base
### target delta

- 共有型の正本を 1 か所に置く
- UI はその正本を読む
- 新しいカテゴリ追加時は TypeScript がラベル漏れを止める

### 使用例

```ts
import {
  getSkillCategoryLabel,
  type SkillCategory,
} from "@repo/shared/types/skillCreator";

const category: SkillCategory = "external-integration";
const label = getSkillCategoryLabel(category); // "外部連携"
=======
```typescript
/**
 * cron 式を検証する。
 * @param value - 検証する cron 式（5フィールド形式）
 * @param options - オプション（省略時は従来の構文・値域チェックのみ）
 * @param options.semantic - true の場合、next-execution-time 計算による意味論的バリデーションを追加する
 * @returns エラーメッセージ文字列（エラーなしの場合は null）
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null;
>>>>>>> Stashed changes
````

<<<<<<< Updated upstream

### エッジケース

||||||| Stash base

### エラーとエッジケース

=======

### 実装の要点

> > > > > > > Stashed changes

<<<<<<< Updated upstream

- LLM 生成失敗時: `isGenerating=false` + エラー state で UI フィードバック
- 二重呼び出し: `generationLockRef` + `isGenerating` で防止
- 推論0件: `inferenceLog` が空配列で返る（エラーにならない）
- `handleRetry`: `formData` を保持し、`answers` / `smartDefaults` / `skillPath` / `hasExternalIntegration` / `externalToolName` / `error` / `generationMethod` / `isGenerating` をリセット
  ||||||| Stash base
- 新しい `SkillCategory` を増やしてラベルを追加し忘れると、`satisfies Record<SkillCategory, string>` がコンパイルで止める
- `DescribeStep` のような旧画面が別表記を持っても、shared helper 参照に寄せたので drift を防げる
- # `@repo/shared` root barrel には広げず、`@repo/shared/types/skillCreator` の subpath で閉じる

```typescript
import { CronExpressionParser } from "cron-parser";
>>>>>>> Stashed changes

<<<<<<< Updated upstream
### 変更ファイル一覧
||||||| Stash base
### 設定可能なパラメータと定数
=======
if (options?.semantic === true) {
  try {
    const interval = CronExpressionParser.parse(trimmed);
    interval.next();
  } catch {
    return "指定した日付の組み合わせは存在しません（例: 2月31日）";
  }
}
```

> > > > > > > Stashed changes

<<<<<<< Updated upstream
| ファイル | 変更内容 |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | generationMode 削除、新 state/ハンドラ追加、Step 0/2 レンダリング修正 |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | 新規作成（分離） |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | inferSmartDefaults / STEPS 単体テスト追加 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | describe.skip（削除対象 TASK-SC-07 テスト） |
||||||| Stash base
| 名前 | 種別 | 役割 |
| ----------------------- | ----------- | --------------------------------------------- |
| `SkillCategory` | type | 5 つのカテゴリ値を固定する |
| `SKILL_CATEGORY_LABELS` | const | UI 表示用の日本語ラベル正本 |
| `getSkillCategoryLabel` | function | 表示名を 1 つ返す共通 API |
| `CATEGORY_VALUES` | local const | `SkillInfoStep` / `DescribeStep` の表示順制御 |
=======

- `semantic` は opt-in です。既存呼び出しはそのまま動きます
- `validateSkillWizardScheduleConfig` は変更していません。呼び出し元が必要な場合だけ `semantic` を渡します
- `cron-parser@5.5.0` は day-of-week を使った救済を保証しません。安全側に倒して、到達不能と判断したものはエラーにしています
  > > > > > > > Stashed changes

<<<<<<< Updated upstream

### Phase 11 visual evidence

||||||| Stash base

### 検証メモ

=======

### 使い方

> > > > > > > Stashed changes

<<<<<<< Updated upstream
Phase 11 のスクリーンショットは、Step 0〜3 の見た目と回復導線が仕様どおりかを最終確認する根拠として参照した。
||||||| Stash base

- TypeScript 型チェックは PASS
- ESLint は PASS
- `vitest` はこの環境で esbuild バイナリ不整合により起動失敗したため、追加確認は別 wave が必要
- # 新規スクリーンショットは未作成。今回はラベル共有と drift 解消が主で、レイアウト変更ではない

```typescript
// 従来どおり: 構文・値域チェックのみ
validateCronExpression("0 0 31 2 *"); // null
>>>>>>> Stashed changes

<<<<<<< Updated upstream
| 画面                  | 参照先                                                                                                                                       | 確認観点                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Step 0                | [TC-11-01-step0-description-category.png](../phase-11/screenshots/TC-11-01-step0-description-category.png)                                   | 初期入力とカテゴリ表示   |
| Step 1                | [TC-11-02-step1-page1-defaults.png](../phase-11/screenshots/TC-11-02-step1-page1-defaults.png)                                               | smartDefaults の初期反映 |
| Step 1 エラー         | [TC-11-03-step1-cron-error.png](../phase-11/screenshots/TC-11-03-step1-cron-error.png)                                                       | cron バリデーション表示  |
| Step 2                | [TC-11-04-step2-required-q5.png](../phase-11/screenshots/TC-11-04-step2-required-q5.png)                                                     | Q5 必須表示              |
| Step 3                | [TC-11-05-summary-card-warning.png](../phase-11/screenshots/TC-11-05-summary-card-warning.png)                                               | サマリー警告             |
| Lifecycle panel light | [skill-lifecycle-panel-light.png](../phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-light.png) | ウィザード導線の初期状態 |
| Lifecycle panel dark  | [skill-lifecycle-panel-dark.png](../phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-dark.png)   | 同上のダーク表示         |
||||||| Stash base
### まとめ

この更新で、カテゴリ名は shared の 1 つの正本に集まりました。
画面側はその正本を読むだけになり、表示名のズレを減らせます。
=======
// 意味論チェックを有効化
validateCronExpression("0 0 31 2 *", { semantic: true });
// → "指定した日付の組み合わせは存在しません（例: 2月31日）"

// 到達可能な式は通す
validateCronExpression("0 0 * * *", { semantic: true }); // null
```

### テスト結果

- 全 42 テスト PASS（TC-01〜TC-16 + SCV-01〜SCV-12 + エッジケース）
- TypeScript 型チェック PASS
- ESLint PASS（0 errors）
- カバレッジ: Line 100% / Branch 86.84%（目標 90%/85% 達成）

## 関連 Issue

[#2074](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2074)

> > > > > > > Stashed changes
