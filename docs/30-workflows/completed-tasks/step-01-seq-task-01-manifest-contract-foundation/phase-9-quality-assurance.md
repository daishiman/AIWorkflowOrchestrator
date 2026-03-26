# Phase 9: 品質保証

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-SDK-01  |
| Phase      | 9            |
| Phase名    | 品質保証     |
| ステータス | spec_created |
| 前提Phase  | Phase 5      |
| 後続Phase  | Phase 10     |
| 作成日     | 2026-03-26   |

## 目的

manifest が runtime authority を奪わず、downstream task へ渡す contract として安定しているかを architecture、IPC、migration、spec sync の観点で確認する。

## 実行タスク

- architecture audit: manifest と loader が SRP を守っているかを確認する
- IPC boundary audit: channel 名、sender validation、timeout が manifest 側へ漏れていないかを確認する
- migration audit: existing plan / execute / improve surface を壊さない導入順かを確認する
- spec sync audit: Phase 12 で更新する台帳と lessons の対象を確定する

## 参照資料

| 資料名                  | パス                                         | 説明                 |
| ----------------------- | -------------------------------------------- | -------------------- |
| Phase 5                 | `phase-5-implementation.md`                  | 実装対象             |
| Phase 8                 | `phase-8-refactoring.md`                     | 最終語彙             |
| implementation-sequence | `outputs/phase-5/implementation-sequence.md` | migration 順         |
| naming-audit            | `outputs/phase-8/naming-audit.md`            | 語彙監査             |
| duplication-check       | `outputs/phase-8/duplication-check.md`       | source of truth 確認 |

### システム仕様（aiworkflow-requirements）

| 参照資料                                                 | パス                                                                                                            | 内容                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| architecture-overview-core                               | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                               | SRP / Facade / Bridge            |
| api-ipc-system-core                                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | public IPC authority             |
| security-electron-ipc                                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                    | preload / main security boundary |
| task-workflow                                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | Phase 12 同期先                  |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | drift lessons                    |

## 実行手順

1. architecture-overview-core を基準に、manifest と loader の責務が単一責務に収まっているかを確認する。
2. api-ipc-system-core と security-electron-ipc を基準に、manifest に IPC authority が入っていないかを確認する。
3. implementation-sequence を読み、既存 public surface を壊さない migration 順になっているかを確認する。
4. Phase 12 で同期する `task-workflow / lessons-learned / lane docs` を checklist 化する。

## 統合テスト連携

- Phase 10 は品質保証の結果を final gate 判定へ使う。
- Phase 11 は人間が manifest 非責務を読み分けられるかを確認する。
- Phase 12 は spec sync checklist を実行順として使う。

## 成果物

| 成果物              | パス                                     | 説明                                       |
| ------------------- | ---------------------------------------- | ------------------------------------------ |
| quality-checklist   | `outputs/phase-9/quality-checklist.md`   | architecture / IPC / migration / sync 監査 |
| risk-register       | `outputs/phase-9/risk-register.md`       | 残リスク一覧                               |
| spec-sync-checklist | `outputs/phase-9/spec-sync-checklist.md` | Phase 12 更新順                            |

## 完了条件

- [ ] architecture 監査結果が記録されている
- [ ] IPC boundary 監査結果が記録されている
- [ ] migration audit に existing public surface を壊さない順序が記録されている
- [ ] Phase 12 の spec sync checklist が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
