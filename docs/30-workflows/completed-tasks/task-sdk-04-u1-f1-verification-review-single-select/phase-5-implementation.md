# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 5                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 4                                                      |
| 後続Phase  | Phase 6                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

TDD Green フェーズとして、Phase 4 で作成したテストを Green にする最小限の実装を行う。

## 参照資料

| 資料名         | パス                                                                                  | 説明             |
| -------------- | ------------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                               | Phase 4 成果物   |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`                                                  | Phase 4 成果物   |
| 実装対象       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | 変更対象ファイル |
| テスト対象     | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 変更対象ファイル |

## 変更ファイル一覧（必須記載）

**[Feedback RT-03 対応]** 実装計画に「新規作成」「修正」ファイルパス一覧を必須記載する。

### 修正ファイル

| #   | ファイルパス                                                                          | 変更内容                                                                                                            |
| --- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | `createVerificationReviewRequest()` の kind を `free_text` → `single_select` に変更、options 追加、placeholder 削除 |
| 2   | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | TC-MOD-1〜3 の `textValue` → `selectedOptionId` 変更、TC-NEW-1〜3 の Green 化                                       |

### 新規作成ファイル

なし

## 実行タスク

- Task 1: `createVerificationReviewRequest()` の kind / options 変更
- Task 2: テストファイルの更新（TC-MOD-1〜3 を single_select 対応に変更）

## 実行手順

### Task 1: `createVerificationReviewRequest()` の変更

対象: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

変更内容:

1. `kind` を `"single_select"` に変更
2. `options` に以下を追加:
   ```typescript
   options: [
     { id: "approve", label: "承認してhandoffへ進む" },
     { id: "improve", label: "改善して再検証する" },
     { id: "reject", label: "差し戻して再計画する" },
   ];
   ```
3. `placeholder` フィールドを削除（single_select では不要）

### Task 2: テストファイルの更新

対象: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`

変更内容:

1. verification_review 関連テスト（TC-MOD-1〜3）の submission を `textValue` → `selectedOptionId` に変更
2. TC-NEW-1〜3 のテストを Green にする（実装が完了することで自動的に Green になる）

### Green 確認

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

全テスト PASS を確認する。

### typecheck 確認

```bash
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携

```bash
# 全テスト実行（回帰確認）
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts

# typecheck
pnpm --filter @repo/desktop typecheck
```

## サブタスク管理

- Lane A: `SkillCreatorWorkflowEngine.ts` の最小変更を実施する
- Lane B: `SkillCreatorWorkflowEngine.test.ts` の single_select 化を反映する
- Lane C: A/B の結果を統合して Green / typecheck を確認する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| 観点     | 確認内容                                                                           |
| -------- | ---------------------------------------------------------------------------------- |
| 最小変更 | `createVerificationReviewRequest()` 本体の変更のみで両呼び出し元に反映されているか |
| 型安全性 | TypeScript エラーなし（typecheck pass）                                            |
| 回帰     | 変更前に PASS していたテストが引き続き PASS であること                             |

## 成果物

| 成果物           | パス                                        | 説明                               |
| ---------------- | ------------------------------------------- | ---------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 変更内容の要約                     |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 実際に変更したファイルと diff 概要 |

**注意**: 実装コードは `outputs/` 配下に配置しない。

## 完了条件

- [ ] `createVerificationReviewRequest()` が `kind: "single_select"` を返すこと
- [ ] options に approve / improve / reject が含まれること
- [ ] TC-NEW-1〜3 が Green であること
- [ ] 既存テスト全件 PASS（回帰なし）
- [ ] typecheck が PASS であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 5
```

## 次のPhase

Phase 6: テスト拡充
