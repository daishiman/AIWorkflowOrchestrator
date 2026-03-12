# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| Phase名    | テスト作成                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 前提Phase  | [phase-3-design-review.md](./phase-3-design-review.md)   |
| 後続Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-12                                               |

## 目的

共通チャット基盤の mode 切替、ストリーミング、履歴、文脈注入を検証するテスト仕様を作成する。

## 実行タスク

- session test 設計: conversation create / revive / handoff の contract test を定義する
- mode test 設計: general / workspace / skill-lifecycle の state 遷移を定義する
- streaming test 設計: requestId / cancel / end / error の契約を定義する
- context test 設計: workspace 文脈注入と lifecycle handoff の境界を定義する
- screenshot preplan: Phase 11 で確認する 3 モード導線を TC-ID 化する

## 参照資料

| 参照資料             | パス                                                                        | 内容            |
| -------------------- | --------------------------------------------------------------------------- | --------------- |
| design review result | `outputs/phase-3/design-review-result.md`                                   | レビュー判定    |
| design findings      | `outputs/phase-3/design-review-findings.md`                                 | 追加観点        |
| session model        | `outputs/phase-2/session-model.md`                                          | session 契約    |
| mode state machine   | `outputs/phase-2/chat-mode-state-machine.md`                                | mode 遷移       |
| streaming contract   | `outputs/phase-2/streaming-contract.md`                                     | stream 契約     |
| phase 11/12 guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | screenshot 前提 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容              |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------- |
| interfaces-llm          | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | LLM 契約          |
| llm-ipc-types           | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`           | IPC 型            |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | stream テスト観点 |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | history 契約      |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state ownership   |

## 統合テスト連携

| 観点            | 連携内容                                           |
| --------------- | -------------------------------------------------- |
| mode contract   | 3 モードを同一 matrix で比較する                   |
| stream contract | chunk / cancel / end / error を 1 セットで確認する |
| screenshot plan | Phase 11 の手動確認と TC-ID を先に固定する         |

## 成果物

| 成果物              | パス                                            | 説明                      |
| ------------------- | ----------------------------------------------- | ------------------------- |
| テストケース一覧    | `outputs/phase-4/test-cases.md`                 | TC-ID と期待結果          |
| session test matrix | `outputs/phase-4/session-contract-tests.md`     | create / revive / handoff |
| mode test matrix    | `outputs/phase-4/mode-transition-tests.md`      | 3 モード遷移              |
| screenshot preplan  | `outputs/phase-4/phase11-screenshot-preplan.md` | Phase 11 の撮影計画       |

## 完了条件

- [x] session / mode / streaming / context の観点が分離されている
- [x] Task03 handoff の contract test 観点が含まれている
- [x] Phase 11 の TC-ID と screenshot 対象が列挙されている
- [x] prior attempt archive との差分検証観点が含まれている
