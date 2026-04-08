# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 10                        |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

実装完了後、全体的な品質・整合性を検証し、Phase 11（手動テスト）へ進んで良いかを判定する。

## 実行タスク

- 受け入れ基準確認: Phase 1 で定義した AC-1〜AC-6 の達成状況を検証
- 全体整合性確認: 設計・実装・テストの整合性を確認
- 判定結果記録: PASS / MINOR / MAJOR / CRITICAL の判定と理由を記録
- MINOR指摘の未タスク化: MINOR判定事項を未タスク候補として記録

## 参照資料

| 資料名               | パス                                        | 説明             |
| -------------------- | ------------------------------------------- | ---------------- |
| Phase 1 受け入れ基準 | `outputs/phase-1/requirements.md`           | AC-1〜AC-6の定義 |
| Phase 9 品質レポート | `outputs/phase-9/quality-report.md`         | 品質ゲート結果   |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装変更内容     |

## 実行手順

### ステップ1: 受け入れ基準の達成確認

| AC ID | 基準                                                                                                            | 確認方法                                | 達成状況 |
| ----- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------- |
| AC-1  | `executeAsync()` が `classifyExecuteResult()` + `switch(outcome)` + module-local `assertNever` で実装されている | コードレビュー                          | -        |
| AC-2  | `assertNever` が helper の終端または switch の default case に配置されている                                    | コードレビュー                          | -        |
| AC-3  | union 型に仮バリアントを追加するとコンパイルエラーが発生する                                                    | `pnpm typecheck` 実行（手動検証）       | -        |
| AC-4  | 既存テスト T-01〜T-06 が全て PASS する（回帰なし）                                                              | `pnpm vitest run <testfile>`            | -        |
| AC-5  | TypeScript 型チェックエラー 0 件                                                                                | `pnpm --filter @repo/desktop typecheck` | -        |
| AC-6  | ESLint エラー 0 件                                                                                              | `pnpm --filter @repo/desktop lint`      | -        |

### ステップ2: 全体整合性確認

| 確認項目               | 確認内容                                                                                     | 結果 |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---- |
| 設計 ↔ 実装の整合性    | Phase 2 設計通りの switch 化が実装されているか                                               | -    |
| テスト ↔ 実装の整合性  | TC-07/TC-08 が `classifyExecuteResult()` と public seam の exhaustive check を検証しているか | -    |
| assertNever の配置     | 設計で決定した module-local helper に配置されているか                                        | -    |
| スコープ外変更がないか | IPC/Renderer 側の変更がないか                                                                | -    |

### ステップ3: 判定

| 判定     | 条件                             | 対応                                 |
| -------- | -------------------------------- | ------------------------------------ |
| PASS     | 全 AC 達成・整合性問題なし       | Phase 11 へ進行                      |
| MINOR    | 軽微な指摘あり（機能に影響なし） | 未タスクとして記録後 Phase 11 へ進行 |
| MAJOR    | 重大な問題あり                   | 影響範囲に応じて Phase 5〜8 へ戻る   |
| CRITICAL | 要件レベルの問題あり             | Phase 1 へ戻りユーザーと確認         |

> **注意**: MINOR 判定の指摘事項は「機能に影響なし」であっても必ず未タスク化すること（未タスク化なしでの進行は禁止）。

## 統合テスト連携

| レビュー項目 | 確認内容                           |
| ------------ | ---------------------------------- |
| 全テスト結果 | T-01〜T-06 + TC-07〜TC-12 全 PASS  |
| 型チェック   | TypeScript エラー 0 件             |
| IPC影響なし  | 変更がMain内部に限定されていること |

## 成果物

| 成果物           | パス                               | 説明             |
| ---------------- | ---------------------------------- | ---------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review.md` | 判定結果・AC確認 |
| MINOR課題一覧    | `outputs/phase-10/minor-issues.md` | MINOR判定時のみ  |

## 完了条件

- [ ] 全受け入れ基準（AC-1〜AC-6）の達成状況が記録されている
- [ ] 全体整合性確認が完了している
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が明記されている
- [ ] MINOR 判定事項があれば未タスク候補として記録済み（`outputs/phase-10/minor-issues.md`）
- [ ] Phase 11 進行 or フィードバック対応が決定している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 10
```
