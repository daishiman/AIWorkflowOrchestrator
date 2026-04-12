# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 12                                                    |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 11                                              |
| 後続Phase  | Phase 13                                              |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

6つの必須タスクを全て完了し、root evidence を含めてタスクをクローズできる状態にする。

> **NOTE**: 全 6 タスクが必須。改善点なし・未タスク 0 件でも出力は省略しないこと。

---

## 実行タスク

### Task 12-1: 実装ガイド作成

実装内容を 2 パート構成で文書化する。Phase 12 の最重要成果物であり、
`QuestionSemanticLabelMap` / `SEMANTIC_LABEL_MAP` / `resolveSemanticLabel()` / `applySmartDefaults()` の関係を、
初学者にも技術者にも追える形で説明する。

## Part 1

### なぜ必要か

`ConversationRoundStep.tsx` では、質問ごとの入力値を画面表示に合う言葉へそろえる必要がある。
たとえば「自分だけ」という入力を「自分のみ」に統一しないと、同じ意味なのに表示がばらつく。

### 何をするか

- 質問ごとの言い換えを 1 か所の表にまとめる
- その表を `shared` から参照する
- `applySmartDefaults()` が初期値を作るときに、その表を使って言葉をそろえる

### 日常の例え

みんなで同じ言い方を使うための「共有の辞書」を作るイメージ。
各部屋に別々の辞書を置くのではなく、1 冊の辞書を共有して見るようにする。

### 今回作ったもの

- `QuestionSemanticLabelMap`: 質問ごとの言い換え表の型
- `SEMANTIC_LABEL_MAP`: 正準の言い換え表
- `resolveSemanticLabel()`: 1 つの値を言い換える内部処理
- `applySmartDefaults()`: 初期値をまとめて反映する処理

## Part 2

### 型定義

```typescript
// packages/shared/src/types/skill-wizard-label-map.ts
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  q5: { slack: "Slack", github: "GitHub", notion: "その他" },
  q6: { 週次: "週に1回" },
};
```

### APIシグネチャ

```typescript
function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap?: QuestionSemanticLabelMap,
): string | undefined;
```

### 使用例

```typescript
import {
  SEMANTIC_LABEL_MAP,
  type QuestionSemanticLabelMap,
} from "@repo/shared/types/skillWizard";

const customMap: QuestionSemanticLabelMap = {
  q5: { notion: "Notion" },
};

const label = resolveSemanticLabel("自分だけ", "q1", SEMANTIC_LABEL_MAP);
const customLabel = resolveSemanticLabel("notion", "q5", customMap);
```

### エラーハンドリング

- `value` が `undefined` の場合は `undefined` を返す
- `questionId` が未知の場合は元の `value` を返す
- `labelMap` が未指定の場合は `SEMANTIC_LABEL_MAP` を使う
- 未定義の `rawValue` は元の値を返す

### エッジケース

- 空文字列は仕様上の扱いを明示する
- `q5` の外部ツール連携は大文字小文字の揺れを吸収する
- `q6` の頻度は同義語を 1 つの表示に寄せる
- 将来 `q7` 以降が増えた場合は、表の追記だけで対応できる

### 設定項目と定数一覧

| 項目                 | 型                                      | 既定値               | 用途               |
| -------------------- | --------------------------------------- | -------------------- | ------------------ |
| `value`              | `string \| undefined`                   | なし                 | 正規化対象の生値   |
| `questionId`         | `string`                                | なし                 | 対象質問の識別子   |
| `labelMap`           | `QuestionSemanticLabelMap \| undefined` | `SEMANTIC_LABEL_MAP` | DI 用の正準マップ  |
| `SEMANTIC_LABEL_MAP` | `QuestionSemanticLabelMap`              | なし                 | 共有する正準マップ |

### テスト構成

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` で `applySmartDefaults()` の初期反映を確認する
- `resolveSemanticLabel()` の振る舞いは `applySmartDefaults()` 経由で間接検証する
- `@repo/shared/types/skillWizard` の import 可否を型チェックで確認する
- 既存のページング・スケジュール展開・外部ツール連携テストを回帰として維持する

**出力先:** `outputs/phase-12/implementation-guide.md`

---

### Task 12-2: システム仕様書更新

#### Step 1-A: タスク完了記録

以下のファイルに UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 の完了記録を追記する。

| 更新対象ファイル                                    | 記録内容                                         |
| --------------------------------------------------- | ------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | タスク完了日・変更ファイル・概要を追記           |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書作成完了・フェーズ数・特記事項を追記 |

記録フォーマット例:

```text
## 2026-04-11 UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 完了

- 変更ファイル:
  - 新規: packages/shared/src/types/skill-wizard-label-map.ts
  - 修正: apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
  - 修正: outputs/phase-3/design-decisions.md
- 概要: resolveSemanticLabel() 変換テーブルを @repo/shared に外部化
```

#### Step 1-B: 実装状況テーブル更新

該当タスクのステータスを更新する。

| タスクID                                           | 更新前         | 更新後      |
| -------------------------------------------------- | -------------- | ----------- |
| UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 | `spec_created` | `completed` |

> 実装完了後に `completed` へ変更すること（仕様書作成時点では `spec_created` のまま）。

#### Step 1-C: 関連タスクテーブル更新

UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 との関連を更新する。

| 関連元タスクID                                     | 関連先タスクID                                 | 関係種別 | 更新内容             |
| -------------------------------------------------- | ---------------------------------------------- | -------- | -------------------- |
| UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 | 派生元   | 完了済みに関係を更新 |

#### Step 1-D: index / artifacts の同期

- `index.md` の Phase 12 成果物一覧を 6 件に更新する
- `artifacts.json` に `outputs/phase-12/phase12-task-spec-compliance-check.md` を root evidence として登録する
- `phase-13-pr-creation.md` の Phase 12 完了条件を 6 成果物前提に更新する

#### Step 1-E: 仕様決定ログの追記

- `outputs/phase-3/design-decisions.md` に `QuestionSemanticLabelMap` と `SEMANTIC_LABEL_MAP` の設計根拠を追記する
- `interfaces-agent-sdk-skill-reference.md` の更新方針を明記する
- `packages/shared/package.json` の `exports` と `typesVersions` を同時更新する方針を残す

#### Step 1-F: 検証結果の記録

- `validate-phase-output.js` の結果を記録する
- `validate-phase12-implementation-guide.js` の結果を記録する
- `pnpm --filter @repo/shared build` と `pnpm --filter @repo/desktop typecheck` の結果を記録する

#### Step 1-G: 最終 parity 確認

- `task-workflow-completed` / `task-workflow-backlog` / root evidence の値が一致していることを記録する
- `planned wording` を残さず、`completed` / `spec_created` / `N/A` のいずれかに収束させる
- `phase12-task-spec-compliance-check.md` に root parity を集約する

#### Step 2（条件付き）: 新規インターフェース追加

新規インターフェース `QuestionSemanticLabelMap` を追加したため Step 2 の実行が必要。

| 更新先                                                                                      | 追記内容                                                                                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `QuestionSemanticLabelMap` 型、`SEMANTIC_LABEL_MAP` 定数、`resolveSemanticLabel()` の役割を追記 |

**出力先:** `outputs/phase-12/system-spec-update-summary.md`

---

### Task 12-3: ドキュメント更新履歴作成

全 Step（1-A / 1-B / 1-C / 1-D / 1-E / 1-F / 1-G / Step 2）の実行結果を個別に記録する。
「該当なし」となった Step も省略せず記録すること。

| Step   | 記録内容                                                             | 記録方針                     |
| ------ | -------------------------------------------------------------------- | ---------------------------- |
| 1-A    | LOGS.md 2 ファイルの更新内容                                         | 追記した行を全文記録         |
| 1-B    | ステータス変更の内容                                                 | 変更前後の値を記録           |
| 1-C    | 関連タスクテーブルの変更内容                                         | 変更行を記録                 |
| 1-D    | `index.md` / `artifacts.json` / `phase-13-pr-creation.md` の更新内容 | 変更した要約を記録           |
| 1-E    | 仕様決定ログの追記内容                                               | 追記した要約を記録           |
| 1-F    | 検証コマンドの結果                                                   | PASS / FAIL と要点を記録     |
| 1-G    | root parity / planned wording の最終確認                             | 判定結果を記録               |
| Step 2 | `QuestionSemanticLabelMap` 追記内容                                  | 追記したセクションを全文記録 |

**出力先:** `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポート作成

> **NOTE**: 0 件の場合も「検出 0 件」として必ず出力すること。省略禁止。

**検出ソース:**

| ソース                         | 具体例                                                            |
| ------------------------------ | ----------------------------------------------------------------- |
| スコープ外として明示された項目 | `inferSmartDefaults` 本体の変更（スコープ外）                     |
| Phase 10 MINOR 指摘            | Phase 10 のレビューで MINOR 判定された指摘事項                    |
| コードコメント TODO / FIXME    | 実装ファイル中の `TODO:` / `FIXME:` コメント                      |
| 将来の質問追加対応             | q7〜qN が追加された際の `SEMANTIC_LABEL_MAP` 拡張（未タスク候補） |

**出力フォーマット例:**

```markdown
## 未タスク検出レポート

### 検出件数: N 件

| No  | 検出元         | 内容                            | 優先度 | 対応方針       |
| --- | -------------- | ------------------------------- | ------ | -------------- |
| 1   | スコープ外明示 | inferSmartDefaults 本体変更     | LOW    | 別タスクで対応 |
| 2   | TODO コメント  | TODO: q7 追加時のマップ拡張手順 | LOW    | 未タスク化候補 |

### 検出 0 件の場合の記載例

検出 0 件。スコープ外・MINOR 指摘・TODO/FIXME・将来拡張候補のいずれも該当なし。
```

**出力先:** `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポート作成

> **NOTE**: 改善点なしの場合も「改善提案なし」として必ず出力すること。省略禁止。

**観点:**

| 観点             | 確認内容                                                        |
| ---------------- | --------------------------------------------------------------- |
| テンプレート改善 | 小規模リファクタリングタスクへの Phase テンプレート最適化の余地 |
| ワークフロー改善 | `@repo/shared` への型追加を標準フローとして定義する提案         |
| ドキュメント改善 | 変換テーブル設計の横断ガイドライン化（デザインパターン集）候補  |

**出力フォーマット例:**

```markdown
## スキルフィードバックレポート

### テンプレート改善

- （提案内容、または「改善提案なし」）

### ワークフロー改善

- （提案内容、または「改善提案なし」）

### ドキュメント改善

- （提案内容、または「改善提案なし」）
```

**出力先:** `outputs/phase-12/skill-feedback-report.md`

---

### Task 12-6: 仕様準拠チェック

root evidence として、Phase 12 の 6 成果物と system spec 同期を 1 ファイルへ集約する。

**記録内容:**

| チェック項目    | 判定        | 根拠                                                                   |
| --------------- | ----------- | ---------------------------------------------------------------------- |
| Task 12-1〜12-5 | PASS / FAIL | 各成果物の存在と内容                                                   |
| Step 1-A〜1-G   | PASS / FAIL | `system-spec-update-summary.md` と `documentation-changelog.md` の突合 |
| Step 2          | PASS / N/A  | `interfaces-agent-sdk-skill-reference.md` の更新有無                   |
| 4条件           | PASS / FAIL | 矛盾なし・漏れなし・整合性あり・依存関係整合                           |

**出力先:** `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 成果物一覧

| Phase | 主要成果物                                                                                   |
| ----- | -------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果, 差分カバレッジ, トレーサビリティ行列                 |
| 2     | アーキテクチャ設計, 型設計書, テスト戦略, 依存整合マトリクス                                 |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                                                 |
| 4     | テスト仕様書, Red結果, 統合テスト計画                                                        |
| 5     | 実装サマリー, 変更ファイル一覧, 契約差分                                                     |
| 6     | 拡張テストケース, 回帰テスト結果, 異常系結果                                                 |
| 7     | カバレッジ計画, 未到達分析, トレーサビリティ網羅率                                           |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                                 |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                     |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                                 |
| 11    | 手動テスト結果（NON_VISUAL）, 証跡インデックス, スクリーンショット計画                       |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, 仕様準拠チェック |
| 13    | PR（ユーザー承認後のみ）                                                                     |

---

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が Part 1（初学者向け）と Part 2（技術者向け）の両方を含む
- [ ] `outputs/phase-12/system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 の実行結果が記録されている
- [ ] `outputs/phase-12/documentation-changelog.md` に 6 ステップ分の記録がある
- [ ] `outputs/phase-12/unassigned-task-detection.md` が出力されている（0 件でも可）
- [ ] `outputs/phase-12/skill-feedback-report.md` が出力されている（改善点なしでも可）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が出力されている

## タスク100%実行確認【必須】

- [ ] Task 12-1: 実装ガイド作成（Part 1 / Part 2） ✅
- [ ] Task 12-2: システム仕様書更新（Step 1-A / 1-B / 1-C / 1-D / 1-E / 1-F / 1-G / Step 2） ✅
- [ ] Task 12-3: ドキュメント更新履歴作成 ✅
- [ ] Task 12-4: 未タスク検出レポート作成（0 件でも出力） ✅
- [ ] Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力） ✅
- [ ] Task 12-6: 仕様準拠チェック ✅
- [ ] 全成果物が `outputs/phase-12/` に保存されていること ✅

---

## 次Phase

Phase 12 の 6 成果物と root evidence の整合が確認できたら → **Phase 13: PR作成**（`phase-13-pr-creation.md`）へ進む。
