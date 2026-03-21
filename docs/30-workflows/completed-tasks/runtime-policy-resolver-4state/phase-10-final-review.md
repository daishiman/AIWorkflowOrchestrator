# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 10                                            |
| Phase 名   | 最終レビュー                                  |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 9（品質検証）                           |
| 後続 Phase | Phase 11（手動テスト）                        |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

多角的品質・整合性の最終検証を行い、Phase 11 へ進めるかを判定する。

## 実行タスク

- 網羅性最終確認: 4状態分岐の欠落がないことを確認する
- enforcement 最終確認: `assertNoSilentFallback()` の fail-fast を確認する
- 旧語彙最終確認: direct caller スコープの語彙残存をなくす
- 品質基準確認: coverage と Phase 9 実行結果を照合する
- レビュー判定: Phase 11 に進む条件を確定する

## 参照資料

| 参照資料       | パス                                                      | 内容                   |
| -------------- | --------------------------------------------------------- | ---------------------- |
| index.md       | docs/30-workflows/runtime-policy-resolver-4state/index.md | 受入基準 AC-1〜AC-8    |
| Phase 1 要件   | phase-1-requirements.md                                   | 境界・受入基準         |
| Phase 2 設計書 | phase-2-design.md                                         | インターフェース設計   |
| Phase 5 実装   | phase-5-implementation.md                                 | capability bridge 実装 |
| Pitfall ルール | .claude/rules/06-known-pitfalls.md                        | P62 教訓               |

## 実行手順

### ステップ1: 受入基準 AC-1〜AC-8 の検証

| AC   | 検証方法                                                                                                      | 期待結果                                |
| ---- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| AC-1 | RuntimePolicyResolver.resolve() の戻り値型が RuntimeDecision であり `capability` を保持することをコードで確認 | 型定義が RuntimeDecision                |
| AC-2 | テストで capability "none" のとき例外が throw されることを確認                                                | テスト PASS                             |
| AC-3 | 全呼び出し元の switch 文が4状態を網羅していることをコードレビュー                                             | 4状態全てハンドル                       |
| AC-4 | apiKeyDegraded テスト（TC-05, TC-06）が PASS していることを確認                                               | テスト PASS                             |
| AC-5 | grep で旧語彙が排除されていることを確認                                                                       | 0件                                     |
| AC-6 | `grep -rn "authMode" apps/desktop/src/main/services/runtime/` が0件                                           | 0件（RuntimeResolver スコープ外は除外） |
| AC-7 | カバレッジレポートで基準充足を確認                                                                            | Line 80%+, Branch 60%+, Func 80%+       |
| AC-8 | Phase 9 の全コマンドが PASS                                                                                   | 全 PASS                                 |

### ステップ2: レビューゲート判定

| 判定     | 対応                                           |
| -------- | ---------------------------------------------- |
| PASS     | Phase 11 へ                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | Phase 1 へ戻り要件再確認                       |

## 成果物

| 成果物                               | 配置先                             |
| ------------------------------------ | ---------------------------------- |
| 最終レビュー結果                     | 本ファイル実行結果欄追記           |
| MINOR 指摘がある場合は未タスク仕様書 | docs/30-workflows/unassigned-task/ |

## 統合テスト連携

- acceptance gate: AC-1〜AC-8 を code / test / grep / spec sync の4系統で検証する
- evidence bundle: Phase 7 coverage、Phase 9 品質ログ、Phase 12 validator を同じ根拠集合で扱う
- parent boundary: broader consumer 側の未完了事項は parent closure task に留め、本 workflow の合否と混同しない

## 完了条件

- [ ] AC-1〜AC-8 が全て検証済み
- [ ] レビューゲート判定が PASS または MINOR
- [ ] MINOR 指摘は全て未タスク仕様書に変換済み

## 次 Phase

- PASS / MINOR: Phase 11（手動テスト）へ進む
- MAJOR / CRITICAL: 該当 Phase へ戻る
