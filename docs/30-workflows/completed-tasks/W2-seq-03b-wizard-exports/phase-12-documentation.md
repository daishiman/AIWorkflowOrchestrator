# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 12                               |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 11                         |
| 後続Phase  | Phase 13                         |
| 作成日     | 2026-04-07                       |
| ステータス | completed                        |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物を揃え、ドキュメントとシステム仕様を最新状態に維持する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件                        |
| -------- | --------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可                      |
| C        | `system-spec-update-summary.md`         | Part 2 の更新対象確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可                      |
| E        | `unassigned-task-detection.md`          | D と並列可                      |
| F        | `skill-feedback-report.md`              | E と並列可                      |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## 必須6タスク

### Task 12-1: 実装ガイド作成

Part 1（中学生向け）と Part 2（技術者向け）の2部構成で作成する。

#### Part 1: 中学生向け説明

**wizard/index.ts のエクスポート更新とは何か？**

ソフトウェアでは「部品箱」から使いたい部品を取り出すことを「インポート（import）」と言います。そして「部品箱に何を入れるか」を定義するのが「エクスポート（export）」です。

今回は「スキル作成ウィザード」の部品箱（`wizard/index.ts`）の中身を整理しました。古くなった部品（DescribeStep）を取り出して見えなくし、`ConfigureStep` 系は既に削除済みであることを前提に公開面を整えました。よく使う部品（StepIndicator・InterviewProgressBar・ApplySummaryCard・GenerateStep・CompleteStep）はそのまま残しました。

**例えば：**

- 古い部品「DescribeStep（説明入力画面）」は削除
- `SkillInfoStepProps` の公開を追加

**専門用語の説明：**

- **エクスポート（export）**：他のファイルから使えるように公開すること
- **バレルエクスポート**：`index.ts` に複数のエクスポートをまとめて一覧化すること
- **型エクスポート（export type）**：TypeScript の型定義を公開すること
- **@deprecated**：「この機能は古いので使わないでください」という印

#### Part 2: 技術者向け説明

**変更概要：**

`wizard/index.ts` から旧コンポーネントの公開を整理し、`SkillInfoStepProps` 型の再公開を追加した。維持エクスポートは `StepIndicator` / `InterviewProgressBar` / `ApplySummaryCard` / `GenerateStep` / `CompleteStep` 系を継続する。

**削除エクスポート（2件）：**

```typescript
// 削除
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
```

**追加エクスポート（4件）：**

```typescript
// 追加
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
```

**維持エクスポート（10件）：**

```typescript
// 変更なし
export { StepIndicator } from "./StepIndicator";
export type { StepIndicatorProps } from "./StepIndicator";
export { InterviewProgressBar } from "./InterviewProgressBar";
export type { InterviewProgressBarProps } from "./InterviewProgressBar";
export { ApplySummaryCard } from "./ApplySummaryCard";
export type { ApplySummaryCardProps } from "./ApplySummaryCard";
export { GenerateStep } from "./GenerateStep";
export type { GenerateStepProps } from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps } from "./CompleteStep";
```

**エッジケース：**

- 廃止ファイル（DescribeStep.tsx）は `@deprecated` JSDoc を付与し残留させる。`ConfigureStep.tsx` は既に削除済み
- `GenerationMode` は `GenerateStep` 側で維持公開されるため、削除対象ではない
- 外部参照が残っている場合は TypeScript が即時検出する

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・関連リンク・LOGS.md 更新

- `docs/30-workflows/skill-wizard-redesign-lane/index.md` の W2-seq-03b ステータスを `completed` へ更新
- 関連レーンの LOGS.md（2ファイル）に完了記録を追加
- `topic-map.md` の skill-wizard-redesign 項目を更新

#### Step 1-B: 実装状況テーブル更新

- W2-seq-03b の実装状況を `spec_created` → `completed` へ更新

#### Step 1-C: 関連タスクテーブル更新

| タスク     | 依存関係                    | ステータス更新 |
| ---------- | --------------------------- | -------------- |
| W2-seq-03a | W2-seq-03b と並列（Wave 2） | 変更なし       |
| W3-seq-04  | W2-seq-03a 完了後着手       | 変更なし       |

#### Step 2: 新規 I/F 追加の仕様更新判定

`SkillInfoStep` / `ConversationRoundStep` の追加エクスポートは、既存の `wizard/index.ts` バレル契約の拡張である。  
W2-seq-03a が参照する新エクスポートのインターフェースに変更がないことを確認する。  
→ 仕様変更なしの場合は Step 2 を no-op として `system-spec-update-summary.md` に記録する。

### Task 12-3: 更新履歴作成

`documentation-changelog.md` を生成し、全 Step 結果を記録する。

### Task 12-4: 未タスク検出

プロジェクト全体で UT-SKILL-WIZARD-W2-seq-03b に関連する未着手タスクを検出し、0件でも `unassigned-task-detection.md` を出力する。

### Task 12-5: スキルフィードバック作成

実装・テスト・設計を通じて発見した改善点を記録する。改善点が0件でも `skill-feedback-report.md` を出力する。

### Task 12-6: phase12-task-spec-compliance-check

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の両方に対して準拠しているかを最終確認する。

- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の存在確認
- canonical filename の不一致、見出し不足、planned wording 残存の確認
- PASS / FAIL と不足点の記録

## 参照資料

| 資料名                 | パス                                                 | 用途              |
| ---------------------- | ---------------------------------------------------- | ----------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`             | Phase 11 成果物   |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`                 | Phase 11 成果物   |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`                | Phase 11 成果物   |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`            | Phase 10 成果物   |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物    |
| task-spec 正本         | `.claude/skills/task-specification-creator/SKILL.md` | Phase 12 判定基準 |
| system spec 正本       | `.claude/skills/aiworkflow-requirements/SKILL.md`    | 更新対象基準      |

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録・LOGS.md（2ファイル）・topic-map.md を更新する。
3. Task 12-2 Step 1-B: W2-seq-03b 実装状況を `completed` へ更新する。
4. Task 12-2 Step 1-C: 関連タスク表を確認する。
5. Task 12-2 Step 2: 新規 I/F 追加有無を判定し、変更がない場合は no-op として `system-spec-update-summary.md` に理由を記録する。
6. Task 12-3: `documentation-changelog.md` を作成する。
7. Task 12-4: `unassigned-task-detection.md` を作成する。
8. Task 12-5: `skill-feedback-report.md` を作成する。
9. Task 12-6: `phase12-task-spec-compliance-check.md` を作成する。

## 成果物

| 成果物                   | パス                                                     | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 構成           |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 記録 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴         |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）      |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）        |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の整合確認            |

## Phase 12 Task 2 判定基準

| 判定項目 | 実行条件                       | 完了条件                               |
| -------- | ------------------------------ | -------------------------------------- |
| Step 1-A | 全タスクで必須                 | 完了記録 + LOGS.md(2) + topic-map 更新 |
| Step 1-B | 全タスクで必須                 | 実装状況を `completed` へ更新          |
| Step 1-C | 関連タスク記載がある場合は必須 | 関連タスク表ステータス更新             |
| Step 2   | 新規 I/F 追加がある場合        | 対象仕様を更新し変更履歴へ記録         |

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明・日常例・専門用語の即時説明を含む。
- Part 2: TypeScript 型・API シグネチャ・エッジケース・設定値一覧を含む。
- 未タスク検出レポートは 0件でも必ず出力する。
- スキルフィードバックは改善点 0件でも必ず出力する。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Task 12-1 実装ガイドが Part 1/Part 2 で完成していること
- [ ] Task 12-2 Step 1-A/1-B/1-C が全て実施されていること
- [ ] Task 12-3 更新履歴が作成されていること
- [ ] Task 12-4 未タスク検出レポートが作成されていること（0件でも）
- [ ] Task 12-5 フィードバックレポートが作成されていること（0件でも）
- [ ] Task 12-6 仕様準拠チェックが PASS であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システム仕様更新（Step 1-A/1-B/1-C/Step 2）
4. Task 12-3/12-4/12-5/12-6: changelog・未タスク・フィードバック・準拠チェック出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR 作成
