# スキルフィードバックレポート

## タスクID

TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001

## 報告日

2026-03-17

## 改善点

1. **Phase 11 guide への運用追記**
   - `renderView` 系タスクでは、画面到達（route）と分岐保証（unit test）を分離するルールを追加する。
2. **未タスク formalize の標準化**
   - Phase 11 Note を Task 4 で必ず指示書化し、`task-workflow-backlog` と `lessons` へ同値同期する。

## 反映先

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/task-specification-creator/SKILL.md`

## 再発防止策

- screenshot 失敗を「到達失敗」と「分岐失敗」に分離記録する
- `documentation-changelog.md` と `unassigned-task-detection.md` の検出件数を一致させる
- `spec-update-summary.md` に canonical/mirror の両方を記録する

---

## 追加改善提案（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 実行経験に基づく）

### 提案1: P40 dynamic import 派生パターンの明文化

- **対象**: `.claude/rules/06-known-pitfalls.md` P40 エントリ
- **内容**: dynamic import (`await import("@/renderer/App")`) を使うテストは P40 の影響を特に受けやすい。`vi.mock` はコンパイル時に解決されるが、dynamic import はランタイムで `vitest.config.ts` の `resolve.alias` に依存するため、ディレクトリ不一致で即座にモジュール解決失敗する
- **ステータス**: 反映済み（本タスクで P40 に追記完了）

### 提案2: Phase 12 worktree 環境での LOGS.md/SKILL.md 更新手順の明確化

- **対象**: `.claude/skills/task-specification-creator/SKILL.md` Phase 12 苦戦防止Tips
- **内容**: worktree 環境（`.worktrees/` 配下）では `.claude/skills/` がメインの作業ツリーと共有されないため、LOGS.md/SKILL.md の更新が PR マージまで遅延する。Phase 12 Step 1-A の手順に「worktree 環境では `spec-update-summary.md` に更新予定内容を記録し、PR マージ後にメインブランチで反映する」代替フローを追加すべき
- **ステータス**: 提案のみ（SKILL.md への直接反映は worktree 環境での `.claude/skills/` 編集リスクを考慮し保留）

### 提案3: 並列エージェント実行時の成果物確認パターンの標準化

- **対象**: `.claude/skills/task-specification-creator/references/phase-templates.md` または Phase 12 苦戦防止Tips
- **内容**: 大規模タスク（12 Phase 一括）を並列エージェントで実行する際、コンテキスト制限（rate limit / token limit）に到達してエージェント完了確認ができなくなる。成果物はファイルシステム上で確認するパターンを標準化すべき:
  1. `git diff --stat` で変更ファイルを確認
  2. `ls outputs/phase-*/` で成果物ディレクトリの存在を確認
  3. `artifacts.json` の Phase ステータスを確認
- **ステータス**: 提案のみ（P43/P59 の延長として `.claude/rules/06-known-pitfalls.md` への追記候補）
