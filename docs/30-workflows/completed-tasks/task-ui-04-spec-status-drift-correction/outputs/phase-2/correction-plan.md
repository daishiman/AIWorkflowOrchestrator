# Phase 2 成果物: 修正計画書

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| 作成日   | 2026-04-07 |
| Phase    | 2 - 設計   |
| タスクID | TASK-UI-04 |

## 1. artifacts.json 修正計画

| タスクID   | 現行 status        | 修正後 status | lastUpdated 更新 | 備考                                      |
| ---------- | ------------------ | ------------- | ---------------- | ----------------------------------------- |
| TASK-P0-01 | phase_12_completed | completed     | 2026-04-07       | Phase 13 は PR 未作成で blocked           |
| TASK-P0-02 | in_progress        | completed     | 2026-04-07       | recordVerifyPass/requestReverify 実装済み |
| TASK-P0-04 | in_progress        | completed     | 2026-04-07       | hasDynamicResourcePipeline 実装済み       |
| TASK-P0-05 | in_progress        | completed     | 2026-04-07       | SkillFileWriter 連携実装済み              |
| TASK-P0-06 | in_progress        | completed     | 2026-04-07       | ConversationalInterview.tsx 実装済み      |
| TASK-P0-07 | completed          | 変更なし      | -                | 既に正確                                  |
| TASK-P0-08 | in_progress        | completed     | 2026-04-07       | session resume handlers 実装済み          |
| TASK-P0-09 | completed          | 変更なし      | -                | 既に正確                                  |

## 2. index.md 修正計画

各タスクの `index.md` メタ情報テーブルのステータス行を更新する。

| タスクID   | 現行ステータス行                                         | 修正後ステータス行 |
| ---------- | -------------------------------------------------------- | ------------------ |
| TASK-P0-01 | `phase_12_completed`                                     | `completed`        |
| TASK-P0-02 | `spec_created`                                           | `completed`        |
| TASK-P0-04 | `spec_created`                                           | `completed`        |
| TASK-P0-05 | `実行中`                                                 | `completed`        |
| TASK-P0-06 | `spec_created`                                           | `completed`        |
| TASK-P0-07 | `spec_created（Phase 1-12 complete / Phase 13 blocked）` | `completed`        |
| TASK-P0-08 | `spec_created`                                           | `completed`        |
| TASK-P0-09 | `spec_created`                                           | `completed`        |

更新日も `2026-04-07` に更新する。

## 3. completed-tasks 移動計画

全 P0 タスクはすでに `docs/30-workflows/completed-tasks/` に移動済み。
追加の移動は不要。

## 4. 残作業記録

全 P0 タスクのコード実装は完了済み。残作業なし。

## 5. skill-creator-agent-sdk-lane/index.md 更新計画

P0 タスク一覧テーブルのディレクトリ参照を `../completed-tasks/step-...` 形式に更新する。

現行（抜粋）:

```
| TASK-P0-02 | `step-10-seq-task-p0-02-verify-improve-reverify-closed-loop` | seq | ... |
```

修正後（抜粋）:

```
| TASK-P0-02 | `../completed-tasks/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop` | seq | ... |
```

## 6. executor-guide.md 更新計画

P0 タスク群の完了状態を明記するセクションを追加または更新する。

## 7. 相互参照リンクへの影響評価

- completed-tasks/ への移動は既に完了済みのため、リンク変更リスクは最小
- artifacts.json の status 変更は他ファイルから参照されない独立フィールド
- index.md のステータス行は他ファイルへのリンクを含まないため影響なし
