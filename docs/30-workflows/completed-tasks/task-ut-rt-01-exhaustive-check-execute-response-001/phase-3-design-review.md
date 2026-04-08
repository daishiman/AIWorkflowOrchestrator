# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 3                                                   |
| Phase 名   | 設計レビューゲート                                  |
| 前提 Phase | Phase 2（設計）                                     |
| 後続 Phase | Phase 4（テスト作成）                               |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

Phase 2 の設計が Phase 4 以降の実装に進むための品質基準を満たしているかを判定する。discriminant の正確性・exhaustive check の完全性・後方互換性をレビューし、PASS/FAIL を判定する。

## 背景

本タスクは TypeScript discriminated union の exhaustive check というパターン導入が核心であり、discriminant の識別順序が正確でないと runtime エラーを引き起こす可能性がある。Phase 3 でこの設計の妥当性を確認することが必須である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` または `outputs/phase-3/` へ記録する。

### タスク 1: 設計書の構造レビュー

**目的**: Phase 2 の設計書が完全かつ整合性のある状態であることを確認する。

**実行手順**:

1. Phase 2 実行記録を読み、以下が揃っているか確認する：
   - `assertNever` の配置場所と実装仕様
   - `classifyExecuteResult()` のインターフェースと分岐ロジック
   - `executeAsync()` の switch 化設計（各ケースの処理）
   - テストケース設計表（TC-01〜TC-05）
2. 不足しているドキュメントがある場合は MAJOR/MINOR を判定する

---

### タスク 2: discriminant 設計レビュー

**目的**: `classifyExecuteResult()` の discriminant 判定順序が正確かを確認する。

**実行手順**:

1. 以下の discriminant 優先順位が正しいことを確認する：
   - Step 1: `"type" in result && result.type === "terminal_handoff"` → `terminal_handoff` への早期リターン
   - Step 2: `"success" in result && result.success === true` → `success`
   - Step 3: `"success" in result && result.success === false` → `error`
   - Step 4: `default` ブランチで `assertNever(result)` → exhaustive check

2. `RuntimeSkillCreatorExecuteErrorResponse` と `RuntimeSkillCreatorExecuteResult` の `success: false` を、`extractExecuteErrorMessage()` の入力差分として正しく扱えているか確認する

3. 判定に問題があれば MAJOR 指摘として記録する

---

### タスク 3: 後方互換性レビュー

**目的**: 既存の `executeAsync()` の動作（phase 遷移・`onWorkflowStateSnapshot` 呼び出し）が switch 化後も保たれることを確認する。

**実行手順**:

1. 現行の各ケース処理と switch 化後のケース処理が等価か確認する：
   - `terminal_handoff` ケース: 元の分岐と同じ処理が設計されているか
   - `error` ケース: `extractExecuteErrorMessage()` の結果が `onWorkflowStateSnapshot` の第 3 引数に渡るか
   - `success` ケース: `phase = "complete"` への遷移が設計されているか

2. `onWorkflowStateSnapshot` の第 3 引数（`error?: string`）の渡し方が各ケースで適切か確認する

3. 問題があれば MAJOR/CRITICAL 指摘として記録する

---

### タスク 4: テストカバレッジ設計レビュー

**目的**: Phase 4 のテストケース設計が受入条件を網羅しているかを確認する。

**実行手順**:

1. TC-01〜TC-05 が受入条件 AC-1〜AC-8 を満たしているか確認する
2. 特に `assertNever` の exhaustive check（TC-05 型テスト）が設計されているか確認する
3. テスト不足があれば MINOR として記録し、Phase 4 で追加するよう指示する

---

### タスク 5: レビュー判定

**目的**: 全レビュー結果を総合して PASS/MINOR/MAJOR/CRITICAL を判定する。

**実行手順**:

1. タスク 1〜4 の結果を集約する
2. 以下の判定基準に従って判定する：

   | 判定     | 条件                                    | 次のアクション             |
   | -------- | --------------------------------------- | -------------------------- |
   | PASS     | 全レビュー観点で問題なし                | Phase 4 へ進行             |
   | MINOR    | 軽微な指摘あり（設計意図は正しい）      | 指摘対応後、Phase 4 へ進行 |
   | MAJOR    | discriminant 設計ミス or 後方互換性問題 | Phase 2 へ戻り設計修正     |
   | CRITICAL | union 型定義の誤解 or 要件漏れ          | Phase 1 へ戻りユーザー確認 |

3. 判定結果と理由を Phase 実行記録に記録する

---

## 参照資料

| 参照資料                     | パス                                                                                                                | 内容                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 2 実行記録             | 本ワークフロー Phase 2 完了記録                                                                                     | 設計書                         |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                               | 現行実装（レビュー比較用）     |
| skillCreator.ts              | `packages/shared/src/types/skillCreator.ts`                                                                         | union 型定義（レビュー比較用） |
| 親タスク Phase 3 レビュー    | `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-3-design-review.md` | 参考レビュー                   |

---

## 成果物

| 成果物           | パス               | 内容                             |
| ---------------- | ------------------ | -------------------------------- |
| レビュー判定記録 | （Phase 実行記録） | PASS/MINOR/MAJOR/CRITICAL と理由 |
| 指摘事項リスト   | （Phase 実行記録） | 指摘内容と対応方針               |

---

## 統合テスト連携

- discriminant 分岐の正確性をレビューゲートで確認し、runtime での型安全性を保証する。

---

## 完了条件

- [ ] 設計書の構造が完全であることが確認されている
- [ ] discriminant 判定順序が正確であることが確認されている
- [ ] 後方互換性が設計で保たれていることが確認されている
- [ ] テストケース設計が受入条件を網羅していることが確認されている
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション                  |
| -------- | ------------------------ | ------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行                  |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ進行      |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて Phase 2 へ戻る |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認      |

### 戻り先決定基準

| 問題の種類               | 戻り先                  |
| ------------------------ | ----------------------- |
| discriminant 設計ミス    | Phase 2（設計）         |
| 後方互換性の問題         | Phase 2（設計）         |
| テストカバレッジ不足     | Phase 4（テスト）で追加 |
| union 型の誤解・要件漏れ | Phase 1（要件定義）     |

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2（設計）が完了していること
- **後続**: Phase 4（テスト作成）へ進む（PASS または MINOR の場合）

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 3 実行記録

### レビュー判定

**判定**: [PASS / MINOR / MAJOR / CRITICAL]

### 指摘事項

| 重要度 | 指摘内容 | 対応方針 |
| ------ | -------- | -------- |
| -      | -        | -        |

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後（PASS/MINOR の場合）、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-4-test-creation.md`
