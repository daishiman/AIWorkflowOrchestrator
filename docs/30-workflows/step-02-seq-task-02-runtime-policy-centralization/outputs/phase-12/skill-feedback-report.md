# Phase 12: Skill Feedback Report

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001              |
| 作成日     | 2026-03-21                                              |
| 対象 skill | `task-specification-creator`, `aiworkflow-requirements` |

---

## 提案1: design task の status guard を明文化する

### 問題

Task02 は設計成果物としては閉じていたが、workflow root や成果物文面から feature 実装完了と誤読しやすかった。

### 改善

- workflow root は `implementation_ready`
- completed ledger は `spec_created`
- feature 実装 gap が残る場合は follow-up task を同一ターンで formalize

## 提案2: worktree を理由に `.claude` 正本更新を先送りしない

### 問題

worktree 環境では LOGS / SKILL / backlog 更新を後回しにしてよい、という誤った運用が再発しうる。

### 改善

- `.claude/skills/...` を常に canonical root とする
- `.agents/skills/...` は mirror として `rsync` / `diff` で確認する
- Phase 12 完了条件に「正本更新済み」を明記する

## 提案3: design close-out でも current code sweep を必須化する

### 問題

設計タスクの Phase 12 を docs だけで閉じると、consumer 実装や test coverage の未完が見逃される。

### 改善

- 最終再監査で composition root / IPC consumer / execute path / tests を grep ベースで確認する
- 実装 gap が見つかった場合は高優先度 implementation closure task を追加する

## 提案4: outputs/phase-12 の必須 6成果物を validator 前提で扱う

### 問題

`skill-feedback-report.md` が欠けたままでも Phase 12 が閉じたように見える。

### 改善

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

上記 6成果物がそろって初めて Phase 12 完了とする。
