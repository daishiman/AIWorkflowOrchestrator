# Phase 2: 修正計画

## 作成日

2026-04-07

## 1. artifacts.json 修正計画

| タスクID   | 現行 status          | 修正後 status | lastUpdated 更新 | 備考                                              |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------------------------- |
| TASK-P0-01 | `phase_12_completed` | `completed`   | 2026-04-07       | 非標準値を標準値に正規化。phases も確認・更新     |
| TASK-P0-02 | `in_progress`        | `completed`   | 2026-04-07       | recordVerifyPass / requestReverify 実装済み       |
| TASK-P0-04 | `in_progress`        | `completed`   | 2026-04-07       | hasDynamicResourcePipeline 実装済み               |
| TASK-P0-05 | `in_progress`        | `completed`   | 2026-04-07       | \_executeInternal パイプライン実装済み            |
| TASK-P0-06 | `in_progress`        | `completed`   | 2026-04-07       | ConversationalInterview.tsx 実装済み              |
| TASK-P0-07 | `completed`          | 変更なし      | 変更なし         | 既に正しい値。index.md のみ更新                   |
| TASK-P0-08 | `in_progress`        | `completed`   | 2026-04-07       | UI・IPC 実装完了。Phase 11-12 も completed に更新 |
| TASK-P0-09 | `completed`          | 変更なし      | 変更なし         | 既に正しい値。index.md のみ更新                   |

## 2. index.md ステータス修正計画

各タスクの index.md メタ情報テーブル内の「ステータス」行と「更新日」を更新する。

| タスクID   | 現行 index.md ステータス                                 | 修正後      |
| ---------- | -------------------------------------------------------- | ----------- |
| TASK-P0-01 | `phase_12_completed`                                     | `completed` |
| TASK-P0-02 | `spec_created`                                           | `completed` |
| TASK-P0-04 | `spec_created`                                           | `completed` |
| TASK-P0-05 | `実行中`                                                 | `completed` |
| TASK-P0-06 | `spec_created`                                           | `completed` |
| TASK-P0-07 | `spec_created（Phase 1-12 complete / Phase 13 blocked）` | `completed` |
| TASK-P0-08 | `spec_created`                                           | `completed` |
| TASK-P0-09 | `spec_created`                                           | `completed` |

## 3. completed-tasks 移動計画

**調査結果**: 全 8 タスクは既に `docs/30-workflows/completed-tasks/` に存在する。移動作業は不要。

```
確認済みパス:
- completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/
- completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop/
- completed-tasks/step-10-seq-task-p0-04-manifest-loader-default-activation/
- completed-tasks/step-09-par-task-p0-05-execute-skill-file-writer-integration/
- completed-tasks/step-09-par-task-p0-06-conversational-interview-ui/
- completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/
- completed-tasks/step-10-seq-task-p0-08-session-resume-renderer-integration/
- completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/
```

## 4. skill-creator-agent-sdk-lane/index.md リンク修正計画

P0是正タスクへの参照パスが壊れているため、`../completed-tasks/` を prefix として付与する。

| 現行パス                                                          | 修正後パス                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `step-10-seq-task-p0-02-verify-improve-reverify-closed-loop`      | `../completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop`      |
| `step-10-seq-task-p0-04-manifest-loader-default-activation`       | `../completed-tasks/step-10-seq-task-p0-04-manifest-loader-default-activation`       |
| `step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution` | `../completed-tasks/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution` |
| `step-10-seq-task-p0-08-session-resume-renderer-integration`      | `../completed-tasks/step-10-seq-task-p0-08-session-resume-renderer-integration`      |
| `step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance`   | `../completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance`   |

## 5. executor-guide.md 更新計画

`docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md` に P0 タスク完了状態を反映する。

- 各 P0 タスクのステータスカラムを `completed` に更新
- 完了済みタスクを `completed-tasks/` への正しいパスで参照するよう更新

## 6. 相互参照リンクへの影響評価

- 全タスクは既に `completed-tasks/` に物理移動済みのため、新たなリンク切れは発生しない
- `skill-creator-agent-sdk-lane/index.md` のリンク修正が唯一の構造変更
- Phase 仕様書（phase-\*.md）内のリンクは相対パスで自己完結しているため影響なし

## 実行優先順

1. 各タスクの `artifacts.json` 更新（status + lastUpdated）
2. 各タスクの `index.md` ステータス更新
3. `skill-creator-agent-sdk-lane/index.md` のリンク修正
4. `executor-guide.md` の更新
