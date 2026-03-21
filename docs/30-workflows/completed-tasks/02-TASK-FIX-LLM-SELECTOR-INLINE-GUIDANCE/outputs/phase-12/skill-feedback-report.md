# Skill Feedback Report

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE |
| 作成日   | 2026-03-21                            |

## task-specification-creator 改善点

### 改善1: worktree でも `.claude` 正本を更新するルールを明文化する

- 症状: `SKILL.md` の Tips に「worktree 環境では LOGS.md / SKILL.md 更新を代替記録」と読める行が残っていた
- 影響: Phase 12 の成果物だけ更新し、正本同期を後回しにする誤判断を誘発する
- 反映: `task-specification-creator/SKILL.md` の Tips を実更新前提へ修正した

### 改善2: Phase 12 compliance file を初手で作る運用を強調する

- 症状: Task 1〜5 を埋めている途中で `phase12-task-spec-compliance-check.md` を忘れやすい
- 影響: validator は通っても root evidence が欠落する
- 反映: LOGS / lessons / compliance file に「先行作成」ルールを再記録した

### 改善3: `validate-phase-output.js` の実行タスク判定を `verify-all-specs.js` と整合させる

- 症状: `verify-all-specs.js` が 13/13 phase pass でも、`validate-phase-output.js` は複数 Phase に実行タスク warning を残した
- 影響: docs 本文の不足と validator heuristic の差を混同しやすい
- 反映: 今回は `phase12-task-spec-compliance-check.md` に non-blocking warning として切り分けを明記した。script 側は将来改善候補

## aiworkflow-requirements 改善点

### 改善1: same-wave sync の最小セットを明文化する

- 症状: Renderer-only タスクでも parent workflow、artifact inventory、legacy register、backlog、lessons、quick-reference の更新が抜けやすい
- 影響: current canonical set が Task 02 だけ旧 path のまま残る
- 反映: `workflow-ai-chat-llm-integration-fix*` と `SKILL.md` に最小同期セットを追記した

### 改善2: current build screenshot 再取得の fallback を pattern 化する

- 症状: worktree の UI task で screenshot 取得を先送りしやすい
- 影響: Phase 11 が placeholder のまま残る
- 反映: lessons に current renderer entry + static server + Playwright の回収パターンを追加した

## 総括

- テンプレート自体は有効だったが、運用ルールの一文が誤判断を誘発していた
- 今回は「改善点なし」ではなく、運用ルールと same-wave sync 範囲の明文化が必要だった
