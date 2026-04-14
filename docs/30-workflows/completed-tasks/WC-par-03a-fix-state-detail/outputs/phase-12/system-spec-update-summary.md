# Phase 12: システム仕様更新サマリー

## タスク情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-SW-FIX-STATE-DETAIL-001 |
| Phase    | 12                           |
| 作成日   | 2026-04-14                   |

---

## Step 1-A: 完了タスク記録

### current facts の固定

| 項目             | 更新先                                                                                                   | 判定                          |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------- |
| workflow index   | `docs/30-workflows/WC-par-03a-fix-state-detail/index.md`                                                 | completed へ更新              |
| task ledger      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                     | current facts を追加          |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                           | 完了記録を追加                |
| recent bundle    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-recent-2026-04g.md`           | 新規作成                      |
| backlog          | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                             | no-op（0件維持）              |
| skill logs       | `.claude/skills/aiworkflow-requirements/LOGS.md` / `.claude/skills/task-specification-creator/LOGS.md`   | 同波更新                      |
| skill specs      | `.claude/skills/aiworkflow-requirements/SKILL.md` / `.claude/skills/task-specification-creator/SKILL.md` | current facts を追記          |
| topic map        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                            | state detail セクションを追記 |
| resource map     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                         | bugfix ルックアップを追記     |

### Phase 11 evidence bundle

| ファイル                                         | 判定          |
| ------------------------------------------------ | ------------- |
| `outputs/phase-11/manual-test-result.md`         | current facts |
| `outputs/phase-11/manual-test-report.md`         | current facts |
| `outputs/phase-11/discovered-issues.md`          | 0件           |
| `outputs/phase-11/ui-sanity-visual-review.md`    | PASS          |
| `outputs/phase-11/screenshot-plan.json`          | 3件           |
| `outputs/phase-11/screenshot-coverage.md`        | 100%          |
| `outputs/phase-11/phase11-capture-metadata.json` | taskId 一致   |
| `outputs/phase-11/screenshots/*.png`             | 3件取得済み   |

## Step 1-B: 実装状況テーブル更新

| 問題番号 | 内容                          | 状態      |
| -------- | ----------------------------- | --------- |
| 12       | `internalAnswers` 残留        | completed |
| 13       | template error の回復導線不足 | completed |
| 18       | q5 再計算漏れ                 | completed |
| 19       | `generationLockRef` 競合      | completed |

## Step 1-C: 関連タスクテーブル更新

| 関連タスク                 | 関係           | current facts                   |
| -------------------------- | -------------- | ------------------------------- |
| `TASK-SW-FIX-UI-001`       | 並列           | Wave C の UI 側修正と別責務     |
| `TASK-SW-FIX-FEEDBACK-001` | 依存先完了済み | Wave B の完了後に本タスクを実施 |

## Step 2: システム仕様更新

### ConversationRoundStep

- `answers` prop 変化を `useEffect` で検知し、`internalAnswers` を再初期化する。
- `isInternalChangeRef` で親子の echo を防ぐ。

### GenerateStep

- `GenerationMode = "llm" | "template"` を current contract として追加した。
- `mode === "template"` の error 状態では `最初からやり直す` ボタンを表示する。

### SkillCreateWizard

- `generationMethod` を `GenerateStep` に伝播し、template / llm の見た目を分ける。
- q5 が変更されたときだけ `resolveExternalIntegration` を再計算する。
- `generationLockRef` は `finally` で必ず解除する。
- `requestId` による stale guard を残して、キャンセル後の遅延 reject を無視する。

### artifacts parity

| 対象                     | 判定                       |
| ------------------------ | -------------------------- |
| `artifacts.json`         | completed / blocked に同期 |
| `outputs/artifacts.json` | root と同値                |

## 結論

Phase 12 の current facts は、コード・画面証跡・台帳の 3 面で整合した。
