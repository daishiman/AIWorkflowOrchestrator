# Phase 9: 品質検証

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 9                                                      |
| Phase名    | 品質検証                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                |
| タスク名   | 会話基盤・セッション統合                               |
| 前提Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)     |
| 後続Phase  | [phase-10-final-review.md](./phase-10-final-review.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-12                                             |

## 目的

Task02 の基盤設計が UX、IPC 安全性、状態整合性の観点で妥当か確認する。

## 実行タスク

- UX 観点: mode 差分だけが見え、基盤差分が体験へ漏れていないかを確認する
- IPC 観点: requestId / cancel / end / error の契約が安全かを確認する
- history 観点: revive / handoff / persistence の破損がないかを確認する
- context 観点: workspace 文脈が general chat へ漏れないかを確認する
- archive 観点: current workflow と completed archive の説明が矛盾しないかを確認する

## 参照資料

| 参照資料           | パス                                    | 内容           |
| ------------------ | --------------------------------------- | -------------- |
| implementation log | `outputs/phase-5/implementation-log.md` | 実装差分       |
| refactoring log    | `outputs/phase-8/refactoring-log.md`    | 最終構造       |
| ownership diff     | `outputs/phase-8/ownership-diff.md`     | ownership 差分 |
| coverage report    | `outputs/phase-7/coverage-report.md`    | coverage 結果  |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                 |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------- |
| interfaces-llm          | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | LLM 契約             |
| llm-ipc-types           | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`           | IPC 型               |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | history 契約         |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPC 安全性           |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | current/archive 台帳 |

## 統合テスト連携

| 観点          | 連携内容                                          |
| ------------- | ------------------------------------------------- |
| quality gate  | Phase 10 の最終判定へ品質観点を引き継ぐ           |
| manual test   | Phase 11 の手動テストシナリオへ体験観点を引き継ぐ |
| documentation | Phase 12 へ current/archive split 記録を引き継ぐ  |

## 成果物

| 成果物          | パス                                | 説明     |
| --------------- | ----------------------------------- | -------- |
| quality report  | `outputs/phase-9/quality-report.md` | 品質判定 |
| issue checklist | `outputs/phase-9/quality-issues.md` | 懸念一覧 |

## 完了条件

- [x] 重大な会話状態不整合が整理されている
- [x] IPC / history / context の懸念が整理されている
- [x] current/archive split の説明が矛盾していない
- [x] Phase 10 に渡す品質判定が記録されている
