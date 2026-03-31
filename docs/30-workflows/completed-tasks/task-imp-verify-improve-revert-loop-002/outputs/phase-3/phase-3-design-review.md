# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 3                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

Phase 2 の設計が AC を満たすか、既存パターンとの整合性、責務境界、無限ループ防止、エラーハンドリング戦略をレビューする。

## 実行タスク

### Task 3-1: AC-1〜AC-7 との整合性確認

| AC   | 設計での対応                                                                    | 判定    | 備考                                                               |
| ---- | ------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| AC-1 | `recordVerifyPass()` で `verifyResult.status = "pass"` に遷移                   | ✅ PASS | チェック結果も artifact として記録                                 |
| AC-2 | `verifyAndImproveLoop()` 内で `improve()` + `applyImprovement()` を自動呼び出し | ✅ PASS | `formatVerifyChecksAsFeedback()` でフィードバック自動生成          |
| AC-3 | while ループで re-verify を自動実行（ループ先頭へ戻る）                         | ✅ PASS | verify → improve → verify の再帰がコードで表現                     |
| AC-4 | `attemptCount >= maxRetry` で `loopExhausted: true` + `"review"` 遷移           | ✅ PASS | デフォルト3回。`RuntimeSkillCreatorFacadeDeps` で設定可能          |
| AC-5 | try-catch で improve/apply エラーを捕捉 → `recordVerifyFailure("review")`       | ✅ PASS | エラーメッセージを `verifyResult.message` に記録                   |
| AC-6 | `verifyAndImproveLoop()` メソッドを `RuntimeSkillCreatorFacade` に追加          | ✅ PASS | シグネチャと擬似コードが設計済み                                   |
| AC-7 | 既存メソッドは変更なし。新規メソッド追加のみ                                    | ✅ PASS | `recordVerifyFailure()` / `requestReverify()` 等は手動用として維持 |

### Task 3-2: 責務境界レビュー

| コンポーネント                   | 責務                     | 変更後も適切か                                                | 判定 |
| -------------------------------- | ------------------------ | ------------------------------------------------------------- | ---- |
| `RuntimeSkillCreatorFacade`      | オーケストレーション     | ✅ `verifyAndImproveLoop()` はオーケストレーションの典型      | PASS |
| `SkillCreatorWorkflowEngine`     | ワークフロー状態管理     | ✅ `recordVerifyPass()` / `recordImproveAttempt()` は状態記録 | PASS |
| `SkillCreatorVerificationEngine` | 検証実行（変更なし）     | ✅ 呼ばれる側のまま                                           | PASS |
| `formatVerifyChecksAsFeedback`   | データ変換ユーティリティ | ✅ 純粋関数。副作用なし。テスト容易                           | PASS |
| `skillCreator.ts`                | 型契約                   | ✅ optional フィールド追加のみ。後方互換                      | PASS |

### Task 3-3: 無限ループ防止レビュー

| 観点                                      | 確認結果                                                               | 判定     |
| ----------------------------------------- | ---------------------------------------------------------------------- | -------- |
| `maxImproveRetry` のデフォルト値          | 3 — improve + re-verify を3回で十分。LLM の改善能力の限界を考慮        | ✅ PASS  |
| `maxImproveRetry` の設定上限（10）        | 安全上限として妥当。10回以上は LLM コストも高く意味が薄い              | ✅ PASS  |
| ループ停止条件の網羅性                    | 4条件: ①全PASS, ②maxRetry到達, ③エラー発生, ④改善提案0件               | ✅ PASS  |
| `attemptCount` のインクリメントタイミング | improve 開始前にインクリメント（`recordImproveAttempt()` 内）          | ✅ PASS  |
| verify エラーでのループ脱出               | try-catch でループ外に脱出                                             | ✅ PASS  |
| improve が同じ修正を無限に繰り返すリスク  | LLM の応答は非決定的だが、同じフィードバックで同じ修正を返す可能性あり | ⚠️ MINOR |

### Task 3-4: エラーハンドリング戦略レビュー

| 設計判断                                      | 根拠                                              | リスク                              | 判定                               |
| --------------------------------------------- | ------------------------------------------------- | ----------------------------------- | ---------------------------------- |
| ループ停止後は `"review"` に遷移              | ユーザーに最終判断を委ねる安全設計                | UI で review 状態の表示が必要       | ✅ PASS                            |
| improve エラーで execute 全体を fail にしない | verify まで成功している。improve は付加価値       | エラーがサイレントに見逃される      | ✅ PASS（`errorMessage` で可視化） |
| `verificationEngine` 未DI時は空配列 → 全PASS  | 既存 `verifySkill()` の graceful degradation 動作 | verify が常にスキップされる設定ミス | ⚠️ MINOR                           |
| `suggestions.length === 0` でループ停止       | LLM が改善を提案できないなら再試行しても同じ      | パーサーバグで false negative       | ✅ PASS                            |

### Task 3-5: 既存パターンとの整合性

| パターン                   | 既存実装での使用例                                 | Phase 2 設計との整合                                            |
| -------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| DI optional deps           | `llmAdapter?`, `verificationEngine?`               | ✅ `maxImproveRetry?` も同じパターン                            |
| graceful degradation       | `verifySkill()` で engine 未DI → 空配列            | ✅ 閉ループでも同様の degradation パス                          |
| ユーティリティ分離         | `parseLlmResponseToContent.ts`                     | ✅ `formatVerifyChecksAsFeedback.ts` も同パターン               |
| 状態記録 artifact          | `recordVerifyFailure()` → `verify_result` artifact | ✅ `recordVerifyPass()` / `recordImproveAttempt()` も同パターン |
| 結果型にエラー情報埋め込み | `persistError?` in `ExecuteResult`                 | ✅ `errorMessage?` in `VerifyAndImproveResult`                  |

### Task 3-6: IPC / 型の後方互換性レビュー

| 観点                            | 確認結果                                                               | 判定    |
| ------------------------------- | ---------------------------------------------------------------------- | ------- |
| `SkillCreatorVerifyResult` 拡張 | 全フィールドが optional（`improveAttemptCount?`, `loopExhausted?` 等） | ✅ PASS |
| 新規型の IPC 影響               | `RuntimeSkillCreatorVerifyAndImproveResult` は Facade 内部型。IPC 不要 | ✅ PASS |
| `FacadeDeps` 拡張               | `maxImproveRetry?` は optional。既存の DI コードに影響なし             | ✅ PASS |
| Renderer 側の影響               | 新フィールドを参照しなくても動作（optional のため）                    | ✅ PASS |

### Task 3-7: セキュリティレビュー

| 観点                       | 確認結果                                                                         | 判定    |
| -------------------------- | -------------------------------------------------------------------------------- | ------- |
| LLM improve 結果の安全性   | `applyImprovement()` は `SkillFileWriter` のバリデーション（パス横断防止）に依存 | ✅ PASS |
| フィードバック文字列の生成 | `formatVerifyChecksAsFeedback()` は内部データのみ使用。外部入力の注入リスクなし  | ✅ PASS |
| ループによるリソース消費   | `maxImproveRetry`（最大10）で LLM 呼び出し回数に上限あり                         | ✅ PASS |

## レビュー総合判定

| 判定     | 結果     |
| -------- | -------- |
| **総合** | **PASS** |
| CRITICAL | 0件      |
| MAJOR    | 0件      |
| MINOR    | 2件      |

### MINOR 指摘

| ID    | 指摘                                                                                        | 対応方針                                                                         |
| ----- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| MR-01 | LLM が同じ修正を繰り返すリスク: 前回の improve 内容を次回フィードバックに含めると効果的     | Phase 5 で検討。将来の未タスク候補として記録                                     |
| MR-02 | `verificationEngine` 未DI時に全PASSとなり、閉ループが verify をスキップする設定ミスのリスク | Phase 5 で `console.warn` を追加。将来的にはヘルスチェックで検出する仕組みを検討 |

## 参照資料

| 資料名       | パス                      | 説明     |
| ------------ | ------------------------- | -------- |
| Phase 1 要件 | `phase-1-requirements.md` | 要件定義 |
| Phase 2 設計 | `phase-2-design.md`       | 詳細設計 |
| index        | `index.md`                | 概要     |

## 統合テスト連携

| 観点               | 内容                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| レビュー結果の反映 | MINOR MR-01/MR-02 を Phase 5 で対応検討。Phase 12 で未タスク候補として記録 |

## 成果物

| 成果物           | パス                                     | 説明             |
| ---------------- | ---------------------------------------- | ---------------- |
| 設計レビュー結果 | `phase-3-design-review.md`（本ファイル） | レビュー判定結果 |

## 完了条件

- [ ] AC-1〜AC-7 との整合性が確認されている（全 PASS）
- [ ] 責務境界が適切であることを確認している
- [ ] 無限ループ防止が十分であることを確認している
- [ ] エラーハンドリング戦略がレビューされている
- [ ] 既存パターンとの整合性が確認されている
- [ ] IPC / 型の後方互換性が確認されている
- [ ] セキュリティ観点がレビューされている
- [ ] MINOR 指摘 2件を記録し、対応方針を決定している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 4: テスト作成（TDD）
