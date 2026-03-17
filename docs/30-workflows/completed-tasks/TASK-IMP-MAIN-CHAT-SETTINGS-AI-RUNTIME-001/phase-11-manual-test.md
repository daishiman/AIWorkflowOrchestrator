# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| Phase名    | 手動テスト                                 |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 前提Phase  | Phase 10（最終レビュー）                   |
| 後続Phase  | Phase 12（ドキュメント）                   |
| ステータス | not_started                                |
| 作成日     | 2026-03-13                                 |
| 機能名     | main-chat-settings-runtime-sync            |

## 目的

代表シナリオを手動で確認する。

## 実行タスク

- 代表操作確認: access capability 切替、provider / model 切替、prompt 保存、health 反映、RAG state 表示を確認する
- screenshot 計画: Main Chat / Settings / selector の代表画面を定義する
- guidance 確認: missing key、model drift、terminal available の説明と CTA を確認する
- terminal 常設導線確認: Settings header からいつでも terminal dock を開けることを確認する

## テストケース

| テストケース | 目的                         | 期待結果                                                            |
| ------------ | ---------------------------- | ------------------------------------------------------------------- |
| TC-11-01     | Settings access card         | integrated ready / missing key / terminal available が分かる        |
| TC-11-02     | selector と prompt           | provider / model 切替と system prompt 保存が authority 通りに見える |
| TC-11-03     | health / RAG                 | health warning と RAG state が guidance と一緒に見える              |
| TC-11-04     | persistent terminal launcher | Settings から terminal を即座に開ける                               |

## 画面カバレッジマトリクス

| テストケース | 対象画面             | 状態                    | 証跡計画                                  |
| ------------ | -------------------- | ----------------------- | ----------------------------------------- |
| TC-11-01     | Settings             | access matrix cards     | TC-11-01-settings-access-matrix.png       |
| TC-11-02     | Main Chat / Settings | selector + prompt       | TC-11-02-main-chat-selector-prompt.png    |
| TC-11-03     | Settings             | health + RAG + guidance | TC-11-03-settings-health-rag-guidance.png |
| TC-11-04     | Settings             | terminal launcher       | TC-11-04-settings-terminal-launcher.png   |

## 参照資料

| 参照資料                    | パス                                                                     | 内容                                                         |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                | 対象範囲と代表導線を確認する                                 |
| Phase 2（設計）             | `phase-2-design.md`                                                      | authority と handoff 契約を確認する                          |
| Phase 5（実装）             | `phase-5-implementation.md`                                              | 手動確認対象の変更点を確認する                               |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                              | 回帰シナリオを確認する                                       |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                              | coverage gap を確認する                                      |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                 | 整理後の責務境界を確認する                                   |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                           | 品質観点の確認結果を確認する                                 |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                               | 最終判定後の確認観点を確認する                               |
| ChatView                    | `apps/desktop/src/renderer/views/ChatView/index.tsx`                     | main chat 画面の確認対象を確認する                           |
| SettingsView                | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                 | settings 画面の確認対象を確認する                            |
| pack UI/UX 正本             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md` | access card、selector、guidance の screenshot 契約を確認する |

## 統合テスト連携

access capability、provider / model、prompt、health、RAG state の代表シナリオを手動で確認する。

## 成果物

| 成果物                 | パス                                     | 内容                         |
| ---------------------- | ---------------------------------------- | ---------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 実施結果と問題を記録する     |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.json`  | 取得対象と判定基準を整理する |

## 完了条件

- [ ] access capability / selector / prompt / health の代表シナリオが含まれている
- [ ] access matrix、selector / prompt、health / guidance の 3 画面が screenshot 証跡に残っている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
