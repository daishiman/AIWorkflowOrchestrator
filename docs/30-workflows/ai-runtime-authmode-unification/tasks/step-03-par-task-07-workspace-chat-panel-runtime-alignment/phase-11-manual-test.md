# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 11                                           |
| Phase名    | 手動テスト                                   |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 10（最終レビュー）                     |
| 後続Phase  | Phase 12（ドキュメント）                     |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

代表シナリオを手動で確認する。

## 実行タスク

- 代表操作確認: initial zero state、mention、file attach、streaming、cancel、unsupported capability guidance を確認する
- screenshot 計画: zero state / streaming / error / compact 幅の代表画面を定義する
- compact UX 確認: narrow width でも context chips と composer action が崩れないことを確認する
- 常設 terminal 確認: panel header からいつでも terminal dock を開けることを確認する
- transcript 添付確認: terminal transcript の手動共有が transcript provenance chip として見えることを確認する

## テストケース

| テストケース | 目的                         | 期待結果                                                |
| ------------ | ---------------------------- | ------------------------------------------------------- |
| TC-11-01     | zero state                   | suggestion bubble と capability が同時に見える          |
| TC-11-02     | streaming / cancel           | streaming と cancel 後の状態復帰が分かる                |
| TC-11-03     | file context / mention       | chips、mention、selected file の導線が失われない        |
| TC-11-04     | guidance / compact           | unsupported capability guidance が compact 幅でも読める |
| TC-11-05     | persistent terminal launcher | panel 上から terminal dock をいつでも開ける             |
| TC-11-06     | transcript provenance chip   | terminal 共有内容が file context と区別されて見える     |

## 画面カバレッジマトリクス

| テストケース | 対象画面             | 状態                         | 証跡計画                                      |
| ------------ | -------------------- | ---------------------------- | --------------------------------------------- |
| TC-11-01     | Workspace Chat Panel | zero state                   | TC-11-01-workspace-chat-zero-state.png        |
| TC-11-02     | Workspace Chat Panel | streaming + cancel           | TC-11-02-workspace-chat-streaming-cancel.png  |
| TC-11-03     | Workspace Chat Panel | file context + mention       | TC-11-03-workspace-chat-file-context.png      |
| TC-11-04     | Workspace Chat Panel | compact guidance             | TC-11-04-workspace-chat-compact-guidance.png  |
| TC-11-05     | Workspace Chat Panel | persistent terminal launcher | TC-11-05-workspace-chat-terminal-launcher.png |
| TC-11-06     | Workspace Chat Panel | transcript provenance chip   | TC-11-06-workspace-chat-transcript-chip.png   |

## 参照資料

| 参照資料                    | パス                                                                     | 内容                                                              |
| --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                | 対象範囲と代表導線を確認する                                      |
| Phase 2（設計）             | `phase-2-design.md`                                                      | authority と handoff 契約を確認する                               |
| Phase 5（実装）             | `phase-5-implementation.md`                                              | 手動確認対象の変更点を確認する                                    |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                              | 回帰シナリオを確認する                                            |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                              | coverage gap を確認する                                           |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                 | 整理後の責務境界を確認する                                        |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                           | 品質観点の確認結果を確認する                                      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                               | 最終判定後の確認観点を確認する                                    |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`   | UI 画面の確認対象を確認する                                       |
| WorkspaceView               | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                | file preview / panel 統合の確認対象を確認する                     |
| pack UI/UX 正本             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md` | Workspace Chat Panel の zero / streaming / compact 状態を確認する |

## 統合テスト連携

zero state、mention、file attach、streaming、cancel、unsupported capability guidance の代表シナリオを手動で確認する。

## 成果物

| 成果物                 | パス                                     | 内容                         |
| ---------------------- | ---------------------------------------- | ---------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 実施結果と問題を記録する     |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.json`  | 取得対象と判定基準を整理する |

## 完了条件

- [ ] stream / context / fail-fast / guidance の代表シナリオが含まれている
- [ ] zero / streaming / file-context / compact-guidance の 4 状態が screenshot 証跡に残っている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
