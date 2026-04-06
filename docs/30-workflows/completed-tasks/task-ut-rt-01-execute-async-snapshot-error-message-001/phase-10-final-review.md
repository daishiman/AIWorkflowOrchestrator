# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 10                                                     |
| Phase 名   | 最終レビューゲート                                     |
| 前提 Phase | Phase 9（品質保証）完了                                |
| 後続 Phase | Phase 11（手動テスト検証）                             |
| ステータス | 未着手                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

実装完了後、全体的な品質・整合性を検証する。AC-1〜AC-4 の達成状況を確認し、Phase 11 へ進むか、問題があれば該当 Phase へ戻るかを判定する。

---

## 判定基準

| 判定     | 条件                                                             | 対応                                      |
| -------- | ---------------------------------------------------------------- | ----------------------------------------- |
| PASS     | AC-1〜AC-4 が全て達成 + typecheck / lint / test が全て PASS      | Phase 11 へ進行                           |
| MINOR    | AC-1〜AC-4 は達成しているが、軽微な改善点がある                  | 未タスク候補として記録後、Phase 11 へ進行 |
| MAJOR    | AC-1〜AC-4 のいずれかが未達、または型エラーがある                | 影響範囲に応じて戻り先 Phase へ戻る       |
| CRITICAL | 致命的な問題あり（要件の根本的な誤り、スコープ外の破壊的変更等） | Phase 1 へ戻りユーザーと要件を再確認      |

**最終判定**: （実施後記入）

---

## Acceptance Criteria チェック（AC-1〜AC-4）

### AC-1: structured error パスでの `onWorkflowStateSnapshot` エラーメッセージ伝搬

**条件**: `executeAsync()` が structured error（`success: false`）を受け取った時、snapshot の有無に関わらず `onWorkflowStateSnapshot` にエラーメッセージが伝搬される。

| 確認項目                                                                                                  | 確認方法                     | 結果           |
| --------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------- |
| `if (!snapshot)` 条件ブロックが削除されていること                                                         | コードレビュー / git diff    | （実施後記入） |
| `onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorResponse.error.message)` が常に呼び出されること | コードレビュー / テスト T-01 | （実施後記入） |
| snapshot あり・なし 両パターンでエラーメッセージが伝搬されること                                          | テスト T-01 / T-05 PASS      | （実施後記入） |

**AC-1 判定**: （実施後記入: PASS / FAIL）

---

### AC-2: catch パスでの `onWorkflowStateSnapshot` エラーメッセージ伝搬

**条件**: catch ブロックでも snapshot の有無に関わらずエラーメッセージが伝搬される。

| 確認項目                                                                                   | 確認方法                     | 結果           |
| ------------------------------------------------------------------------------------------ | ---------------------------- | -------------- |
| catch パスの `if (!snapshot)` 条件ブロックが削除されていること                             | コードレビュー / git diff    | （実施後記入） |
| `onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage)` が常に呼び出されること | コードレビュー / テスト T-02 | （実施後記入） |
| 例外スロー時に snapshot あり・なし 両パターンでエラーメッセージが伝搬されること            | テスト T-02 / T-06 PASS      | （実施後記入） |

**AC-2 判定**: （実施後記入: PASS / FAIL）

---

### AC-3: TypeScript コンパイルエラーが 0 件

**条件**: `pnpm --filter @repo/desktop typecheck` が PASS する。

| 確認項目                                             | 確認方法                                     | 結果           |
| ---------------------------------------------------- | -------------------------------------------- | -------------- |
| typecheck コマンドがエラー 0 件で完了すること        | `pnpm --filter @repo/desktop typecheck` 実行 | （実施後記入） |
| `snapshot ?? null` の型推論が正しいこと              | typecheck PASS で確認                        | （実施後記入） |
| `onWorkflowStateSnapshot` の引数型が一致していること | typecheck PASS で確認                        | （実施後記入） |

**AC-3 判定**: （実施後記入: PASS / FAIL）

---

### AC-4: テスト T-01〜T-06 が全て PASS

**条件**: structured error 伝搬シナリオのテストが全て PASS する。

| テスト ID | シナリオ                                                                                             | 期待結果                                                                                                    | 結果           |
| --------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------- |
| T-01      | structured error パス: snapshot が存在する場合の error.message 伝搬                                  | `onWorkflowStateSnapshot` が `"API キーを設定してください"` を第3引数に渡して呼び出される                   | （実施後記入） |
| T-02      | catch パス: snapshot が存在する場合の error.message 伝搬                                             | `onWorkflowStateSnapshot` が error.message を第3引数に渡して呼び出される                                    | （実施後記入） |
| T-03      | terminal_handoff パス: error 引数なし                                                                | `onWorkflowStateSnapshot` の第3引数は `undefined` / フェーズが `complete` に遷移する                        | （実施後記入） |
| T-04      | success パス: error 引数なし                                                                         | `onWorkflowStateSnapshot` の第3引数は `undefined` / フェーズが `complete` に遷移する                        | （実施後記入） |
| T-05      | structured error パス: snapshot が存在しない場合も伝搬                                               | `onWorkflowStateSnapshot` に `null` snapshot と error.message が渡される                                    | （実施後記入） |
| T-06      | catch パス: `Error` 以外の値を受け取り `String(error)` を使い、`snapshot ?? null` の null 分岐も通る | `String(error)` が使われ、`onWorkflowStateSnapshot` に `null` snapshot と文字列化されたメッセージが渡される | （実施後記入） |

**AC-4 判定**: （実施後記入: PASS / FAIL）

---

## 総合判定ロジック

```
AC-1 PASS AND AC-2 PASS AND AC-3 PASS AND AC-4 PASS
  → typecheck PASS AND lint PASS AND test PASS
    → PASS（Phase 11 へ進行）
    → MINOR（軽微な改善点あり → 未タスク候補記録後 Phase 11 へ）
  → MAJOR（いずれかが FAIL → 戻り先 Phase へ戻る）
AC-1〜AC-4 のいずれかが FAIL
  → MAJOR
致命的な問題（要件の根本的誤り等）
  → CRITICAL
```

---

## MINOR 判定時の未タスク候補記録

MINOR 判定となった場合、以下の候補を未タスクとして記録する:

| 候補 ID | 内容                                                                                          | 記録 Phase | 解決予定   |
| ------- | --------------------------------------------------------------------------------------------- | ---------- | ---------- |
| M-01    | `RuntimeSkillCreatorExecuteResponse` union 拡張時の exhaustive check 導入（Phase 3 より継続） | Phase 3    | 将来タスク |

> Phase 3 設計レビューで記録済みの未タスク候補。union 型が将来拡張された際に網羅性保証のため exhaustive check パターンを導入する。現時点では inline 判定で十分であり、スコープ外。

---

## 戻り先決定基準（MAJOR / CRITICAL 時）

| 問題の種類                            | 戻り先                                      |
| ------------------------------------- | ------------------------------------------- |
| AC-1 または AC-2 が未達（実装の問題） | Phase 5（実装）                             |
| AC-3 が未達（TypeScript エラー）      | Phase 5（実装）                             |
| AC-4 が未達（テスト FAIL）            | Phase 5（実装）または Phase 4（テスト設計） |
| 要件との不整合                        | Phase 1（要件定義）                         |
| 設計の根本的誤り                      | Phase 2（設計）                             |

---

## Phase 11 開始条件

以下を**全て満たした**場合にのみ、Phase 11（手動テスト検証）への進行を許可する:

- [ ] AC-1 PASS: structured error パスでのエラーメッセージ伝搬確認
- [ ] AC-2 PASS: catch パスでのエラーメッセージ伝搬確認
- [ ] AC-3 PASS: TypeScript コンパイルエラー 0 件
- [ ] AC-4 PASS: テスト T-01〜T-06 が全件 PASS
- [ ] Phase 10 最終レビュー判定が PASS または MINOR（MINOR の場合は未タスク候補を記録済み）

---

## Phase 13 blocked 条件

以下のいずれかに該当する場合、Phase 13（PR 作成）は blocked とする:

- AC-1〜AC-4 のいずれかが未達
- TypeScript コンパイルエラーが残存している
- T-01〜T-06 のいずれかのテストが FAIL
- Phase 10 最終レビューで MAJOR または CRITICAL が検出されている
- ユーザーの明示的な承認が得られていない

---

## レビュー観点チェックリスト

### 実装の正確性

| 観点                                                        | 確認内容                                                  | 判定           |
| ----------------------------------------------------------- | --------------------------------------------------------- | -------------- |
| structured error パスの `if (!snapshot)` が削除されているか | git diff で確認                                           | （実施後記入） |
| catch パスの `if (!snapshot)` が削除されているか            | git diff で確認                                           | （実施後記入） |
| `snapshot ?? null` が正しく使用されているか                 | コードレビュー                                            | （実施後記入） |
| `onWorkflowStateSnapshot` の呼び出し順序が正しいか          | コードレビュー（`triggerPhaseTransition` の後に呼び出す） | （実施後記入） |

### スコープ遵守

| 観点                                                      | 確認内容        | 判定           |
| --------------------------------------------------------- | --------------- | -------------- |
| `execute()` / `plan()` / `improve()` が変更されていないか | git diff で確認 | （実施後記入） |
| `creatorHandlers.ts` が変更されていないか                 | git diff で確認 | （実施後記入） |
| 型定義（`skillCreator.ts` 等）が変更されていないか        | git diff で確認 | （実施後記入） |
| Renderer 側コンポーネントが変更されていないか             | git diff で確認 | （実施後記入） |

### 統合整合性

| 観点                                                                                          | 確認内容              | 判定           |
| --------------------------------------------------------------------------------------------- | --------------------- | -------------- |
| `onWorkflowStateSnapshot` の下流（`creatorHandlers.ts`）との接続が壊れていないこと            | Phase 9 link 確認結果 | （実施後記入） |
| 既存テスト（TC-T4-01〜TC-T4-04: success / terminal_handoff / error パス）が回帰していないこと | テスト実行結果        | （実施後記入） |

---

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認する:

| レビュー項目             | 確認内容                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| typecheck                | `pnpm --filter @repo/desktop typecheck` エラー 0 件                                           |
| lint                     | `pnpm --filter @repo/desktop lint` エラー 0 件                                                |
| 対象テスト（T-01〜T-06） | `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"` 全件 PASS |
| 接続テスト               | `onWorkflowStateSnapshot` → `creatorHandlers.ts` → IPC の接続正常                             |

---

## 成果物

| 成果物                        | パス                                                                                                | 内容                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 10 最終レビュー仕様書   | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-10-final-review.md` | 本ドキュメント                |
| 最終レビュー結果              | `outputs/phase-10/final-review-result.md`                                                           | 判定結果（実施後作成）        |
| Phase 10 outputs ディレクトリ | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-10/`        | Phase 10 出力格納ディレクトリ |

---

## 完了条件

- [ ] AC-1〜AC-4 の確認が完了し、全て PASS した
- [ ] 総合判定（PASS / MINOR / MAJOR / CRITICAL）を明記した
- [ ] MINOR 判定の場合、未タスク候補を記録した
- [ ] MAJOR / CRITICAL 判定の場合、戻り先 Phase を明記した
- [ ] Phase 11 開始条件を確認し、進行可否を明記した
- [ ] Phase 13 blocked 条件を確認した
- [ ] `outputs/phase-10/final-review-result.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 末端アクション【必須】

- [ ] Phase 10 内の全タスクを 100% 実行完了
- [ ] AC-1〜AC-4 の全確認を完了し、判定を明記
- [ ] 成果物（本ドキュメント・`outputs/phase-10/final-review-result.md`）が生成されていることを確認

---

## 次 Phase

Phase 10 完了（PASS または MINOR 判定）後、次は **Phase 11（手動テスト検証）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-11-manual-test.md`
