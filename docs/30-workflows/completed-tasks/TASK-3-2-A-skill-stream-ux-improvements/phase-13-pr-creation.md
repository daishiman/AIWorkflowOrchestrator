# Phase 13: PR作成

## メタ情報

| 項目      | 内容                         |
| --------- | ---------------------------- |
| Phase     | 13                           |
| 名称      | PR作成                       |
| タスクID  | TASK-3-2-A                   |
| Issue番号 | #520                         |
| 前提Phase | Phase 12（ドキュメント更新） |
| 次Phase   | なし（タスク完了）           |

---

## 1. 目的

全ての作業を完了し、Pull Requestを作成してコードレビューに備える。

---

## 2. タスク

### Task 13-1: 最終確認

**確認項目**:

| ID  | チェック項目                 | 判定      |
| --- | ---------------------------- | --------- |
| 1   | 全テストがPASS               | PASS/FAIL |
| 2   | TypeScriptエラーなし         | PASS/FAIL |
| 3   | ESLintエラーなし             | PASS/FAIL |
| 4   | 全Phase成果物が揃っている    | PASS/FAIL |
| 5   | ドキュメントが更新されている | PASS/FAIL |

**コマンド**:

```bash
# テスト
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

---

### Task 13-2: コミット準備

**コミット対象ファイル**:

| カテゴリ       | ファイル                                                                             |
| -------------- | ------------------------------------------------------------------------------------ |
| 実装           | apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx                |
| ユーティリティ | apps/desktop/src/renderer/utils/formatTime.ts                                        |
| テスト         | apps/desktop/src/renderer/components/AgentView/**tests**/SkillStreamDisplay.test.tsx |
| テスト         | apps/desktop/src/renderer/utils/**tests**/formatTime.test.ts                         |
| 仕様書更新     | .claude/skills/aiworkflow-requirements/references/ui-ux-\*.md                        |

**コミットメッセージ形式**:

```
feat(desktop): SkillStreamDisplay UX改善

- R1: ローディングスピナー追加
- R2: メッセージタイムスタンプ表示
- R3: クリップボードコピー機能

Closes #520

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

### Task 13-3: PR作成

**注意**: PR作成はユーザーの明示的な許可を得てから実行すること。

**PRタイトル**: `feat(desktop): SkillStreamDisplay UX改善 (#520)`

**PR本文テンプレート**:

```markdown
## Summary

- R1: status="running"時にスピナーアニメーションを表示
- R2: 各メッセージに相対時刻（「X秒前」形式）を表示
- R3: メッセージのワンクリックコピー機能とフィードバック表示

## Test plan

- [ ] 全ユニットテストがPASS
- [ ] 手動テストでR1〜R3の動作確認
- [ ] アクセシビリティ確認（キーボード操作、スクリーンリーダー）
- [ ] 既存機能への影響なし確認

## Related Issues

- Closes #520

---

Generated with [Claude Code](https://claude.com/claude-code)
```

**PRコマンド（許可後に実行）**:

```bash
gh pr create \
  --title "feat(desktop): SkillStreamDisplay UX改善 (#520)" \
  --body "$(cat <<'EOF'
## Summary
- R1: status="running"時にスピナーアニメーションを表示
- R2: 各メッセージに相対時刻（「X秒前」形式）を表示
- R3: メッセージのワンクリックコピー機能とフィードバック表示

## Test plan
- [ ] 全ユニットテストがPASS
- [ ] 手動テストでR1〜R3の動作確認
- [ ] アクセシビリティ確認（キーボード操作、スクリーンリーダー）
- [ ] 既存機能への影響なし確認

## Related Issues
- Closes #520

---
Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 3. 完了条件

| ID  | 条件                                 | 確認方法       |
| --- | ------------------------------------ | -------------- |
| 1   | 全最終確認項目がPASS                 | チェックリスト |
| 2   | コミットが作成されている             | git log        |
| 3   | PRが作成されている（ユーザー許可後） | GitHub確認     |

---

## 4. 成果物

| 成果物       | パス/URL                                                     |
| ------------ | ------------------------------------------------------------ |
| Pull Request | https://github.com/daishiman/AIWorkflowOrchestrator/pull/XXX |

---

## 5. タスク完了後の処理

PR作成後、以下の処理を行う：

1. **unassigned-taskからの移動**:
   - `docs/30-workflows/unassigned-task/task-3-2-A-skill-stream-ux-improvements.md`を削除またはcompleted-tasksに移動

2. **ステータス更新**:
   - artifacts.jsonの全Phaseを"completed"に更新

---

## 6. 参考資料

| 資料           | パス/URL                    |
| -------------- | --------------------------- |
| PRガイドライン | CLAUDE.mdのPR作成セクション |
| GitHub CLI     | https://cli.github.com/     |
