# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 11                                   |
| 後続Phase  | Phase 13                                   |
| 作成日     | 2026-04-07                                 |
| ステータス | completed（Phase 12 完了 / PR 未作成）     |

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

**SkillCreateWizard のオーケストレーション更新とは何か？**

スキルを作るための「ウィザード（案内役）」を大幅に改良した話です。

以前は「テンプレートで作る方法」と「AIに考えてもらう方法」の2択がありました。でも2択があると使う人が迷ってしまいます。今回は「AIに考えてもらう方法」だけに統一しました。

また、AIにスキルを作ってもらうとき、ユーザーが入力した「スキル名」「目的」「カテゴリ」から、AIへの質問の答えを自動で予測する「スマートデフォルト」機能を追加しました。たとえば「目的に `slack` / `Slack` / `SLACK` のどれが書かれていても、Q5の答え候補を `slack` として推論する」という感じです。これで、ユーザーが同じことを何度も入力する手間を省けます。

完了画面では、生成したスキルのパスを見ながら品質フィードバックを送り、イメージと違ったら Step 0 に戻ってやり直せます。前回の入力は残るので、毎回最初から入力し直す必要はありません。

**例えば：**

- 「毎日Slackに通知を送る」と入力すると、自動で「タイミング：定期実行」「ツール：Slack」が選ばれる
- カテゴリを「code-support（コードサポート）」にすると、自動で「出力形式：コード」が選ばれる

**専門用語の説明：**

- **ウィザード**：複数の画面を順番に案内してくれる入力フォームのこと
- **オーケストレーション**：複数のコンポーネント（部品）を指揮して動かす役割
- **スマートデフォルト**：ユーザーの入力から自動で答えを予測する仕組み
- **state（ステート）**：コンポーネントが持っている「今の状態」の情報

#### Part 2: 技術者向け説明

**変更概要：**

`SkillCreateWizard.tsx` から `description` / `options` / `generationMode` state と関連する全 `template` 分岐を除去し、LLM 専用化した。新たに `formData`/`answers`/`smartDefaults`/`generationMethod`/`skillPath`/`hasExternalIntegration`/`externalToolName` の state を追加し、`handleRetry` で Step 0 への復帰を接続する。`inferSmartDefaults` は `purpose` を小文字化して判定し、`slack`/`github`/`notion` を大小文字不問で推論する。生成開始時は `generationLockRef` と `clearGenerationState()` で再入とストア残留を抑える。

**inferSmartDefaults 関数：**

```typescript
function inferSmartDefaults(data: SkillInfoFormData): SmartDefaultResult {
  // purpose テキストからツール・タイミングを推論
  // category から出力フォーマットを推論
  // inferenceLog に推論根拠を記録
}
```

**STEPS 配列変更：**

```typescript
// 変更前
["説明入力", "設定", "生成", "完了"];

// 変更後
["スキル情報入力", "詳細設定", "生成", "完了"];
```

**API シグネチャ：**

```typescript
handleStep0Next(): void
handleGenerate(method: "complete" | "skip"): Promise<void>
handleQualityFeedback(satisfied: boolean): void
handleRetry(): void
```

**エッジケース：**

- LLM 生成失敗時: `isGenerating=false` + エラー state で UI フィードバック
- 二重呼び出し: `generationLockRef` + `isGenerating` で防止
- 推論0件: `inferenceLog` が空配列で返る（エラーにならない）
- `handleRetry`: `formData` を保持し、`answers` / `smartDefaults` / `skillPath` / `hasExternalIntegration` / `externalToolName` / `error` / `generationMethod` / `isGenerating` をリセット

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・関連リンク更新

- `docs/30-workflows/W2-seq-03a-skill-create-wizard/index.md` のステータスを `Phase 12 完了（PR 未作成）` へ更新
- `docs/30-workflows/skill-wizard-redesign-lane/index.md` に W2-seq-03a 完了と W3 着手条件充足の注記を追加
- 本ワークツリーには `LOGS.md` / `topic-map.md` の対象ファイルが存在しないため、このタスクでは N/A として扱う

#### Step 1-B: 実装状況テーブル更新

- W2-seq-03a の実装状況を `spec_created` → `completed` へ更新

#### Step 1-C: 関連タスクテーブル確認

| タスク     | 依存関係              | ステータス更新                   |
| ---------- | --------------------- | -------------------------------- |
| W3-seq-04  | W2-seq-03a 完了後着手 | `ready` 判定（実着手は別タスク） |
| W2-seq-03b | W2-seq-03a と並列     | 変更なし                         |

#### Step 2: 新規 I/F 追加の仕様更新判定

`inferSmartDefaults` 関数は内部ユーティリティのため外部 API 契約変更なし。  
`handleGenerate(method)` は `ConversationRoundStep` から呼ばれる親ハンドラであり、`GenerateStep` への props 契約変更ではない。内部では `generationLockRef` と `clearGenerationState()` を使って再入防止と旧ストア状態の初期化を行う。
外部 I/F の更新点は `GenerateStep` から `generationMode` を外すことと、`CompleteStep` に `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` を接続すること。  
→ `wizard/index.ts` の re-export 変更は W2-seq-03b の対象なので、この Task 12-2 では props 契約の更新が必要であることを `system-spec-update-summary.md` に記録する。

### Task 12-3: 更新履歴作成

`documentation-changelog.md` を生成し、全 Step 結果を記録する。

### Task 12-4: 未タスク検出

プロジェクト全体で UT-SKILL-WIZARD-W2-seq-03a に関連する未着手タスクを検出し、0件でも `unassigned-task-detection.md` を出力する。

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
2. Task 12-2 Step 1-A: 完了タスク記録と関連リンクを更新する（`LOGS.md` / `topic-map.md` は N/A 判定を記録）。
3. Task 12-2 Step 1-B: W2-seq-03a 実装状況を `completed` へ更新する。
4. Task 12-2 Step 1-C: W3-seq-04 の着手条件を `ready` 判定として記録する。
5. Task 12-2 Step 2: `GenerateStep` / `CompleteStep` の props 契約を確認し、`generationMode` 削除・`skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` 接続の更新内容を `system-spec-update-summary.md` に記録する。
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

| 判定項目 | 実行条件                       | 完了条件                                                                        |
| -------- | ------------------------------ | ------------------------------------------------------------------------------- |
| Step 1-A | 全タスクで必須                 | 完了記録 + 関連リンク更新（`LOGS.md` / `topic-map.md` は対象なしなら N/A 記録） |
| Step 1-B | 全タスクで必須                 | 実装状況を `completed` へ更新                                                   |
| Step 1-C | 関連タスク記載がある場合は必須 | 関連タスク表ステータス更新                                                      |
| Step 2   | 新規 I/F 追加がある場合        | 対象仕様を更新し変更履歴へ記録                                                  |

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
