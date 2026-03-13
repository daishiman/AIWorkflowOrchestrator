# SubAgent Ownership

## 目的

関心ごとの分離に基づき、Phase 1-13 を複数責務に分けて整理する。

## Phase 1-3: 要件・設計・レビュー

| サブエージェント      | 主責務                                                                                              | 並列可否                      | 出力                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| Requirements Agent    | 原本 task と現行実装コードの差分抽出・要件定義                                                      | Phase 1 内で起点              | requirements-definition.md、acceptance-criteria.md |
| System Spec Agent     | `aiworkflow-requirements` から制約抽出、既知の落とし穴確認                                          | Requirements Agent と並列可能 | 仕様抽出メモ                                       |
| UI Architecture Agent | overlay 構造、component tree（4ステップ＋完了画面）、レスポンシブ設計                               | Phase 1 完了後に並列可能      | architecture / component design                    |
| State / IPC Agent     | persistence key（4キー）、`updateUserProfile` 連携、`ThemeMode` 契約整理、`allowDismiss` フラグ設計 | Phase 1 完了後に並列可能      | state / IPC design                                 |
| Review Agent          | ギャップ評価、進行判定                                                                              | Phase 2 完了後に直列          | review gate（PASS / MINOR / MAJOR）                |

## Phase 4-7: テスト作成・実装・カバレッジ

| サブエージェント     | 主責務                                                                      | 並列可否                    | 出力                                            |
| -------------------- | --------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------- |
| Test Design Agent    | 受け入れ基準 1-26 に対応するテストケース設計（`OnboardingWizard.test.tsx`） | Phase 3 完了後              | テストコード（Red 状態）                        |
| Implementation Agent | `OnboardingWizard/index.tsx` および `App.tsx` 統合実装                      | Test Design Agent と順次    | プロダクションコード（Green 状態）              |
| Coverage Agent       | カバレッジ計測・不足箇所の追加テスト                                        | Implementation Agent 完了後 | カバレッジレポート（Line 80%+ / Function 80%+） |

注意事項（P39/P40 既知落とし穴対策）:

- テストは happy-dom 環境のため `userEvent` ではなく `fireEvent` を使用する。
- テスト実行は `apps/desktop/` ディレクトリで行う。
- P47 対策: `variantStyles` 定数をコンポーネントから export し、テストで import して期待値を生成する。

## Phase 8-10: リファクタリング・品質検証・最終レビュー

| サブエージェント   | 主責務                                         | 並列可否                     | 出力                       |
| ------------------ | ---------------------------------------------- | ---------------------------- | -------------------------- |
| Refactor Agent     | コード品質改善（型安全、冗長コード削除）       | Phase 7 完了後               | リファクタリング済みコード |
| Quality Agent      | Lint・型チェック・全テスト実行                 | Refactor Agent 完了後        | 品質レポート               |
| Final Review Agent | 多角的品質・整合性検証、MINOR 指摘の未タスク化 | Quality Agent 完了後（直列） | 最終レビュー結果           |

## Phase 11-13: 手動テスト・ドキュメント・完了

| サブエージェント    | 主責務                                                    | 並列可否        | 出力            |
| ------------------- | --------------------------------------------------------- | --------------- | --------------- |
| Manual Test Agent   | UI シナリオ実行（初回表示、Settings 再表示、完了フロー）  | Phase 10 完了後 | 手動テスト結果  |
| Documentation Agent | implementation-guide.md、システム仕様書更新、未タスク検出 | Phase 11 完了後 | Phase 12 成果物 |
| Completion Agent    | 成果物最終確認・PR 準備                                   | Phase 12 完了後 | PR 本文草案     |

## 進行順序

1. Requirements Agent と System Spec Agent が Phase 1 入力を固める（並列）。
2. UI Architecture Agent と State / IPC Agent が Phase 2 を並列で詳細化する。
3. Review Agent が Phase 3 で統合レビューを行う（直列）。
4. Phase 3 完了後にのみ Phase 4 以降へ進める。
5. Phase 4-7 は Test Design → Implementation → Coverage の順で進める（Coverage は Implementation 完了後）。
6. Phase 8-10 は Refactor → Quality → Final Review の順（全て直列）。
7. Phase 11-13 は Manual Test → Documentation → Completion の順（全て直列）。
