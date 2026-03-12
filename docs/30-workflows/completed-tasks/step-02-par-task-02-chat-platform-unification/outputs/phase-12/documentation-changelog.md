# Documentation Changelog

## 2026-03-12

### Phase 12 outputs 追補

- `unassigned-task-detection.md` を 1 件起票状態へ更新し、`UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001` の物理配置・task-workflow 登録・関連仕様書リンク追加を反映
- `phase12-task-spec-compliance-check.md` / `spec-update-summary.md` を、`verify-unassigned-links=216/216` と新規未タスク 1 件に追補

### System spec 正本 追補（`.claude/skills/aiworkflow-requirements/`）

- `task-workflow.md` / `ui-ux-feature-components.md` / `arch-state-management.md` / `lessons-learned.md` に `UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001` を登録
- `LOGS.md` / `SKILL.md` に 2026-03-12 の follow-up 更新履歴を追加

## 2026-03-11

### Task spec / workflow 本文

- `index.md` の task status を `in_progress`、Phase 1〜12 を `completed` に同期
- `phase-3-design-review.md` の曖昧表現を是正し、Phase 1 成果物参照を補完
- `phase-6-test-expansion.md` の曖昧表現と実行タスク表現を validator 互換へ是正
- `phase-7-coverage-check.md` / `phase-8-refactoring.md` / `phase-10-final-review.md` / `phase-11-manual-test.md` に `統合テスト連携` を追加
- `phase-7..13` の参照資料へ依存 Phase 成果物を補完し、`verify-all-specs` warning 起点を解消

### Phase 12 outputs

- `implementation-guide.md` を Part 1 / Part 2 の内容要件に合わせて全面再作成
- `spec-update-summary.md` を Step 1-A / 1-B / 1-C / Step 2 単位の記録へ更新
- `phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 の合否根拠を集約
- `unassigned-task-detection.md` に `verify-unassigned-links=214/214`、`audit current=0 / baseline=134 / misplaced=38` を反映
- `skill-feedback-report.md` に実際に反映した skill 更新内容を追記
- `manual-test-result.md` / `screenshot-coverage.md` を validator 互換の TC / 証跡表へ更新

### System spec 正本（`.claude/skills/aiworkflow-requirements/`）

- `interfaces-llm.md` / `llm-ipc-types.md` / `llm-streaming.md` に renderer unified chat platform 契約を追加
- `interfaces-chat-history.md` / `architecture-chat-history.md` / `api-chat-history.md` に renderer session overlay と long-term history / DTO 境界を追記
- `llm-workspace-chat-edit.md` に Workspace mode handoff context と `buildWorkspaceChatContext()` の責務境界を追記
- `arch-state-management.md` に `chatSlice` / `useStreamingChat` / persist revive 契約を追記
- `ui-ux-feature-components.md` / `ui-ux-navigation.md` に ChatView / WorkspaceView / SkillCenterView handoff と visual QA を追記
- `task-workflow.md` / `lessons-learned.md` / `LOGS.md` に完了記録と再発防止知見を同期
- `generate-index.js` を再実行し、topic-map / keywords を再生成

### task-specification-creator 改善

- `scripts/complete-phase.js` を current `artifacts.json` 配列スキーマ互換へ更新
- `SKILL.md` / `LOGS.md` に Phase 12 root evidence 集約と skill validation 再監査の改善履歴を追記
- `LOGS.md` に current workflow 再監査での改善内容を記録

### skill-creator 改善

- `references/patterns.md` に chat platform unification の成功パターンを追加
- `assets/phase12-system-spec-retrospective-template.md` / `assets/phase12-spec-sync-subagent-template.md` に chat platform プロファイルを追加
- `SKILL.md` / `LOGS.md` に今回のテンプレート改善を記録

### 検証結果

- `verify-all-specs --workflow ... --json`: PASS（13/13, warning 0, info 1）
- `validate-phase-output.js <workflow>`: PASS（28項目）
- `validate-phase12-implementation-guide.js --workflow ... --json`: PASS
- `validate-phase11-screenshot-coverage.js --workflow ...`: PASS（expected=5 / covered=5）
- `verify-unassigned-links.js --source .claude/.../task-workflow.md`: PASS（214 / 214）
- `audit-unassigned-tasks.js --json --diff-from HEAD`: current=0 / baseline=134
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`: PASS
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`: PASS
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`: PASS（0 error / 135 warning、`resource-map.md` / `topic-map.md` で到達可能なため「許容」）
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop exec vitest run ...`: PASS（28 tests）
