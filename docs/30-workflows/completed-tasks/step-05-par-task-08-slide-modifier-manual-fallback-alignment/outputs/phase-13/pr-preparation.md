# Phase 13: PR 準備メモ

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 13                                                    |
| 作成日   | 2026-03-23                                            |
| 状態     | BLOCKED（ユーザー指示待ち）                           |

---

## 現在の BLOCKED 状態

| Blocked 条件                                                            | 理由                                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| ユーザーから commit / PR 作成の明示指示がない                           | CLAUDE.md の制約（`--no-verify` 禁止、PR 作成は指示後のみ） |
| 本タスクは設計タスクのため PR 作成はオプション                          | プロダクションコード変更なし。docs/ のみ変更                |
| 依存タスク（TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001）が未完了 | terminal launcher 契約が確定していない                      |

---

## PR 作成前の確認項目チェックリスト

ユーザーから PR 作成の指示を受けた場合、以下を確認してから実行する。

### 1. ブランチ確認

```bash
git status
git log --oneline -5
```

- [ ] 現在のブランチが正しい worktree であること
- [ ] コミット対象のファイルが `outputs/phase-8/` 〜 `outputs/phase-13/` の範囲内であること

### 2. コミット対象ファイルの確認

```bash
git diff --stat -- \
  "docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/"
```

**今回のコミット対象（設計ドキュメントのみ）**:

| ファイル                                               | 内容               |
| ------------------------------------------------------ | ------------------ |
| outputs/phase-8/refactor-boundaries.md                 | リファクタ境界     |
| outputs/phase-8/simplification-candidates.md           | 簡素化候補         |
| outputs/phase-9/quality-checklist.md                   | 品質チェックリスト |
| outputs/phase-9/risk-register.md                       | リスク登録簿       |
| outputs/phase-10/final-review-report.md                | 最終レビュー報告   |
| outputs/phase-10/final-gate-decision.md                | 最終ゲート判定     |
| outputs/phase-11/manual-test-plan.md                   | 手動テスト計画     |
| outputs/phase-11/screenshot-plan.json                  | screenshot 計画    |
| outputs/phase-11/discovered-issues.md                  | 発見事項           |
| outputs/phase-12/implementation-guide.md               | 実装ガイド         |
| outputs/phase-12/system-spec-update-summary.md         | 仕様同期サマリー   |
| outputs/phase-12/documentation-changelog.md            | 更新履歴           |
| outputs/phase-12/unassigned-task-detection.md          | 未タスク検出       |
| outputs/phase-12/phase12-task-spec-compliance-check.md | 準拠チェック       |
| outputs/phase-13/pr-preparation.md                     | 本ファイル         |

### 3. PR 作成前の最終確認

- [ ] `pnpm lint` が PASS すること（ドキュメントのみのため自動スキップの可能性あり）
- [ ] `pnpm typecheck` が PASS すること（ドキュメントのみのため自動スキップの可能性あり）
- [ ] PR タイトルが70文字以内であること
- [ ] PR 本文に Summary と Test Plan が含まれること
- [ ] `--no-verify` を使用しないこと

### 4. PR タイトル案

```
design(slide): Slide/Modifier manual fallback alignment 設計完了 (Phase 8-13)
```

文字数: 55文字（70文字以内）

### 5. PR 本文案

```markdown
## Summary

- Slide/Modifier の 2 lane（integrated/manual）と 4状態（synced/running/degraded/guidance）を設計
- 不正遷移4パターン禁止・UI 4領域表示マトリクス・cleanup 順序9ステップを確定
- Phase 3 PASS（MINOR 1件: MN-01 SlideCapabilityDTO IPC channel は UT-SLIDE-IMPL-001 で追跡）

## Test Plan

- [x] Phase 10 最終レビュー: PASS（MAJOR/CRITICAL なし）
- [x] AC-1〜AC-4 全件充足
- [x] 未タスク5件を unassigned-task-detection.md に登録
- [ ] UX-07 TC-ID 5件の screenshot は UT-SLIDE-UI-001 で実施（設計タスクのため今回は対象外）

## Blocked

- `TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001` 完了まで terminal launcher 契約は未確定
- UT-SLIDE-IMPL-001 完了まで SlideCapabilityDTO の IPC channel 名は仮定義（MN-01）

## 関連タスク

- UT-SLIDE-IMPL-001: Modifier/agent-client 実装（HIGH priority）
- UT-SLIDE-UI-001: SlideWorkspace UI 4領域実装（HIGH priority）
- UT-SLIDE-P31-001: P31/P48 無限ループ対策（MEDIUM）
- UT-SLIDE-HANDOFF-DUP-001: terminal handoff 重複解消（MEDIUM）
- Task09 follow-up: IPC namespace 統一（MEDIUM）
```

---

## `.claude/skills/` 実更新の手順（PR 前に実施）

PR 作成前に以下の実ファイル更新を完了させること（P57 対策）。

```bash
# 1. LOGS.md の更新（2ファイル）
# .claude/skills/aiworkflow-requirements/LOGS.md に完了記録を追加
# .claude/skills/task-specification-creator/LOGS.md に完了記録を追加

# 2. SKILL.md の更新（2ファイル）
# .claude/skills/aiworkflow-requirements/SKILL.md の変更履歴テーブルを更新
# .claude/skills/task-specification-creator/SKILL.md の変更履歴テーブルを更新

# 3. references/ の更新
# references/arch-state-management.md に SlideUIStatus セクションを追記
# references/interfaces-slide.md に SlideCapabilityDTO / ModifierResponse 拡張を追記
# references/task-workflow.md に Task08 完了記録と未タスク5件を追記

# 4. topic-map.md 再生成
node ./.claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 5. Mirror sync
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
diff -qr ./.claude/skills/ ./.agents/skills/

# 6. unassigned-task/ 指示書の作成（P3/P58 対策: 3ステップ完全実施）
# docs/30-workflows/unassigned-task/UT-SLIDE-IMPL-001.md
# docs/30-workflows/unassigned-task/UT-SLIDE-UI-001.md
# docs/30-workflows/unassigned-task/UT-SLIDE-P31-001.md
# docs/30-workflows/unassigned-task/UT-SLIDE-HANDOFF-DUP-001.md
# docs/30-workflows/unassigned-task/UT-SLIDE-TASK09-IPC-NAMESPACE-001.md
```
