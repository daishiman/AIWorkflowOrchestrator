# Phase 2: 設計 - タスク仕様書

## 目的

Skill Creator をどのように表導線化し、共通会話基盤上で `作成 -> 実行 -> 改善` を閉じるかを設計する。

## 実行タスク

1. `skillCreatorAPI` を表 API にするか内部生成エンジンにするか決定する
2. wizard と会話導線の責務統合を設計する
3. `作成 -> 実行 -> 改善` の状態遷移を設計する
4. `Atent Team` / `SubAgent` / `Codex` の内部役割と権限境界を設計する
5. Task02 の `skill-lifecycle` mode を前提に UI と状態契約を設計する

## 設計方針

- ユーザーに見せる導線は 1 つにする
- 内部では `Planner Agent` `Executor Agent` `Improver Agent` の3役に分離可能とする
- 必要な場合のみ `Codex` へ委譲し、委譲は内部実行ログとして扱う
- wizard は補助 UI または設定確認 UI に縮退させる

## 参照資料

| 参照資料               | パス                                                                                                                              | 説明         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Task01 設計            | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md`                                     | 一次導線     |
| Task02 設計            | `../step-02-par-task-02-chat-platform-unification/phase-2-design.md`                                                              | 共通会話基盤 |
| skill creator 統合仕様 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-001-skill-creator-integration.md` | 既存 To-Be   |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容             |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| interfaces-agent-sdk-ui              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | UI 契約          |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 責務分離パターン |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload/IPC 境界 |

## 成果物

- `単一 skill lifecycle 会話フロー設計`
- `内部オーケストレーション役割設計`
- `wizard 縮退方針`

## 完了条件

- [ ] `skillCreatorAPI` の位置づけが決まっている
- [ ] 単一会話フローが設計されている
- [ ] SubAgent / Codex の責務と境界が定義されている
