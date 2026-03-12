# Phase 5: 実装

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| Phase名    | 実装                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 前提Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md)   |
| 後続Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-12                                               |

## 目的

Task02 設計に従い、共通会話基盤を実装し、既存チャット導線を mode 差分として統合する。

## 実行タスク

- session 実装: 共通 session model と revive / handoff の入口を実装する
- stream 実装: requestId / cancel / end / error の共通 contract を実装する
- history 実装: persistence 境界と assistant message 確定点を実装する
- adapter 実装: workspace / skill-lifecycle 文脈 adapter を実装する
- UI handoff 実装: general / workspace / skill-lifecycle が同一基盤へ乗る入口を実装する

## 参照資料

| 参照資料           | パス                                                 | 内容                 |
| ------------------ | ---------------------------------------------------- | -------------------- |
| session model      | `outputs/phase-2/session-model.md`                   | session 契約         |
| mode state machine | `outputs/phase-2/chat-mode-state-machine.md`         | mode 遷移            |
| streaming contract | `outputs/phase-2/streaming-contract.md`              | stream 契約          |
| mode adapter       | `outputs/phase-2/mode-adapter-design.md`             | adapter 設計         |
| test cases         | `outputs/phase-4/test-cases.md`                      | Red 観点             |
| current code       | `apps/desktop/src/renderer/views/ChatView/index.tsx` | general 実装アンカー |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容            |
| ----------------------- | ------------------------------------------------------------------------------ | --------------- |
| interfaces-llm          | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | LLM 契約        |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | stream 契約     |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | history 契約    |
| api-chat-history        | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`        | Use Case API    |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state ownership |

## 統合テスト連携

| 観点            | 連携内容                                            |
| --------------- | --------------------------------------------------- |
| common platform | Phase 6 で 3 モードが同一基盤を使うことを確認する   |
| stream safety   | abort / retry / error を Phase 6-9 の回帰観点へ渡す |
| history revive  | Phase 6 の境界テストと Phase 11 の手動確認へ渡す    |

## 成果物

| 成果物             | パス                                          | 説明              |
| ------------------ | --------------------------------------------- | ----------------- |
| 実装ログ           | `outputs/phase-5/implementation-log.md`       | 実装差分          |
| session 実装メモ   | `outputs/phase-5/session-implementation.md`   | session 実体      |
| streaming 実装メモ | `outputs/phase-5/streaming-implementation.md` | stream 実体       |
| adapter 実装メモ   | `outputs/phase-5/mode-adapter-log.md`         | mode adapter 実装 |

## 完了条件

- [x] 3 モードが同一基盤を共有している
- [x] requestId / cancel / end / error 契約が 1 系統に揃っている
- [x] revive / handoff の入口が定義されている
- [x] archive と current の差分が実装メモに記録されている
