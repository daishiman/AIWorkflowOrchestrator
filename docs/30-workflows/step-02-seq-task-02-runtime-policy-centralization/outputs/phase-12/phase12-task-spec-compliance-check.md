# Phase 12: タスク仕様書準拠チェック

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 作成日   | 2026-03-21                                 |

---

## 05-task-execution.md Phase 12 チェックリスト

### Task 1: 実装ガイド

- [x] `implementation-guide.md` Part 1（中学生レベル概念説明 - 日常例え必須）
- [x] `implementation-guide.md` Part 2（開発者向け実装詳細）
- [x] design handoff と actual implementation completion を混同していない

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [x] `aiworkflow-requirements/LOGS.md` 更新
- [x] `task-specification-creator/LOGS.md` 更新
- [x] `aiworkflow-requirements/SKILL.md` 変更履歴更新（9.02.08）
- [x] `task-specification-creator/SKILL.md` 変更履歴更新（v10.09.11）

#### Step 1-B: 実装状況テーブル

- [x] workflow root を `implementation_ready` に正規化
- [x] completed ledger を `spec_created` として記録
- [x] `artifacts.json` / `outputs/artifacts.json` / `phase-1..13` を同期

#### Step 1-C: 関連タスクテーブル

- [x] `task-workflow-backlog.md` を更新
- [x] `task-workflow-completed.md` を更新
- [x] `workflow-ai-runtime-execution-responsibility-realignment.md` を更新
- [x] `lessons-learned-phase12-workflow-lifecycle.md` を更新

#### Step 1-D: topic-map.md 再生成

- [x] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` 実行

### Task 3: documentation-changelog.md

- [x] 全 Task 完了後の事後記録として作成
- [x] 更新した仕様書 / 台帳 / follow-up task を記録
- [x] 未タスク件数が `unassigned-task-detection.md` と一致（4件）

### Task 4: 未タスク検出

- [x] `unassigned-task-detection.md` 作成（4件検出）
- [x] `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` を formalize
- [x] `UT-CLEANUP-AI-CHECK-CONNECTION-001` / `UT-CLEANUP-RUNTIME-RESOLVER-001` / `UT-DESIGN-SANITIZE-PLACEMENT-001` を維持
- [x] `docs/30-workflows/unassigned-task/` に 4件の指示書を配置
- [x] backlog / workflow / lessons / completed への導線を追加

### Task 5: スキルフィードバック

- [x] `skill-feedback-report.md` を作成
- [x] status guard / worktree guard / code sweep 必須化を提案

### Mirror Sync

- [x] `rsync -avz --checksum .claude/skills/ .agents/skills/` 実行
- [x] `diff -qr .claude/skills/ .agents/skills/` で 0 差分確認

### validator 実行結果

- [x] `verify-all-specs.js --workflow ... --json` PASS（13/13, errors 0, warnings 0, info 1）
- [x] `validate-phase12-implementation-guide.js --workflow ... --json` PASS（10/10）
- [x] `verify-unassigned-links.js --source .../unassigned-task-detection.md` PASS（4/4, missing 0）

### 追加チェック

- [x] 設計タスクのためプロダクションコード変更が 0件であることを確認
- [x] current code 再監査で actual centralization gap を確認し、高優先度 follow-up task へ昇格
- [x] `outputs/phase-12/` の 6成果物がそろっている
