# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 2                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 1                                                      |
| 後続Phase  | Phase 3                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

`createVerificationReviewRequest()` の kind 変更設計を確定し、
テスト戦略・影響範囲・変更差分を明文化する。

## 実行タスク

- kind 変更設計: `free_text` → `single_select` への変更内容を設計する
- options 設計: approve / improve / reject の3選択肢の id / label を確定する
- テスト戦略設計: 既存テストの変更箇所と新規テストケースを設計する

## サブタスク管理

- SubAgent A: `task-specification-creator` 準拠監査を実施する
- SubAgent B: `aiworkflow-requirements` と未タスク由来の整合を監査する
- SubAgent C: A/B の結果を統合し、最小差分の改善案へ収束させる
- A/B は並列、C は A/B 完了後に直列で実行する

### validation path

1. SubAgent A/B を並列で走らせ、skill 準拠と current facts を別々に固定する。
2. SubAgent C が A/B の差分を統合し、single_select only の最小変更案へ収束させる。
3. Phase 3 では design-document / subagent-lane-plan / test-strategy の 3 成果物が揃っていることを gate 条件にする。

## 多角的分析方針

Phase 2 では、以下の 30 種の思考法を全て 1 回以上適用し、カテゴリごとの所見を `design-document.md` に集約する。

| カテゴリ     | 適用する思考法                                                       |
| ------------ | -------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 |
| システム系   | システム思考、因果関係分析、因果ループ                               |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          |

- 各カテゴリの観点は重複してよいが、結論は synthesis lane で 1 つの改善案に統合する。
- skill 定義の原文を根拠として明示し、変更候補は最小複雑性で説明する。
- 既存 flow の破棄は、最小差分より明らかにエレガントな場合に限る。

## 参照資料

| 資料名                     | パス                                                                                                            | 説明                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`                                                                    | Phase 1 成果物             |
| 受け入れ基準               | `outputs/phase-1/acceptance-criteria.md`                                                                        | Phase 1 成果物             |
| WorkflowEngine             | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                          | 変更対象ファイル           |
| 型定義                     | `packages/shared/src/types/skillCreator.ts`                                                                     | 型契約参照                 |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                                                            | Phase 構成・Step 12 ルール |
| spec-update workflow       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                  | Step 1 / Step 2 判定       |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                               | 正本仕様の照合基準         |
| task-workflow / lessons    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `lessons-learned-ipc-preload-runtime.md` | current facts と教訓       |
| unassigned-task 原本       | `docs/30-workflows/unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md`               | 背景・リスク・分離方針     |

## 実行手順

### 1. kind 変更設計

**変更前（現状）**:

```typescript
function createVerificationReviewRequest(): SkillCreatorUserInputRequest {
  return {
    kind: "free_text",
    placeholder: "...",
    // ...
  };
}
```

**変更後（設計）**:

```typescript
function createVerificationReviewRequest(): SkillCreatorUserInputRequest {
  return {
    kind: "single_select",
    options: [
      { id: "approve", label: "承認してhandoffへ進む" },
      { id: "improve", label: "改善して再検証する" },
      { id: "reject", label: "差し戻して再計画する" },
    ],
    // placeholder は single_select では不要なため削除
  };
}
```

### 2. 影響範囲分析

| 呼び出し元                            | 変更内容               | 備考                                     |
| ------------------------------------- | ---------------------- | ---------------------------------------- |
| `recordExecutionFailure()`            | 関数本体変更で自動反映 | 呼び出し元コードの変更は不要             |
| `recordVerifyFailure()`               | 関数本体変更で自動反映 | 呼び出し元コードの変更は不要             |
| renderer（single_select 処理）        | 変更なし               | 既存の single_select handling で動作する |
| `applyVerificationReviewTransition()` | 変更なし               | selectedOptionId ベースで既に動作済み    |

### 3. テスト戦略

#### 既存テストの変更方針

| 変更前（free_text）               | 変更後（single_select）              |
| --------------------------------- | ------------------------------------ |
| `textValue: "some reason"` を送信 | `selectedOptionId: "approve"` を送信 |
| TC-MOD-1〜3 の `textValue` 削除   | `selectedOptionId` のみに変更        |

#### 新規テストケース

| TC-ID    | テスト内容                                                              | 期待結果                     |
| -------- | ----------------------------------------------------------------------- | ---------------------------- |
| TC-NEW-1 | `validateUserInputSubmission` に options 外の `selectedOptionId` を渡す | 拒否（バリデーションエラー） |
| TC-NEW-2 | `createVerificationReviewRequest()` の返り値の kind を確認              | `"single_select"`            |
| TC-NEW-3 | `createVerificationReviewRequest()` の options 配列を確認               | approve/improve/reject の3件 |

### 4. 変更ファイル一覧（実装時）

| ファイルパス                                                                          | 変更種別 | 変更内容                                      |
| ------------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | 修正     | `createVerificationReviewRequest()` 変更      |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 修正     | textValue → selectedOptionId 変更、新規TC追加 |

**新規作成ファイルなし**

## 統合テスト連携

変更は Main Process の単一関数のみ。統合テストは Vitest 単体テストで完結。

```bash
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| アーキテクチャ | Main Process 内で閉じた変更。IPC 契約・Preload・Renderer に影響なし       |
| 型安全性       | `SkillCreatorUserInputKind` に `single_select` が定義済みであることを確認 |
| 後方互換性     | free_text の `placeholder` フィールドを削除してよいか確認する             |

## 成果物

| 成果物             | パス                                    | 説明                                          |
| ------------------ | --------------------------------------- | --------------------------------------------- |
| 設計書             | `outputs/phase-2/design-document.md`    | kind 変更設計・影響範囲分析・30種思考法の統合 |
| SubAgent lane plan | `outputs/phase-2/subagent-lane-plan.md` | lane / validation path / 責務分担             |
| テスト戦略         | `outputs/phase-2/test-strategy.md`      | テスト変更方針・新規TCリスト                  |

## 完了条件

- [ ] kind 変更内容（before/after）が明文化されている
- [ ] options の id / label が確定している
- [ ] 影響範囲（呼び出し元2箇所）を特定した
- [ ] 変更ファイル一覧が確定している
- [ ] テスト変更方針が定義されている
- [ ] SubAgent lane plan と validation path が定義されている
- [ ] 30 種の思考法が 7 カテゴリ全てで適用されている
- [ ] free_text を維持する折衷案を採らない理由が明文化されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
