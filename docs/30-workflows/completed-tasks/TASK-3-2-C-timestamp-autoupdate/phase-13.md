# Phase 13: PR作成

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 13                              |
| 機能名 | TASK-3-2-C-timestamp-autoupdate |
| 作成日 | 2026-01-28                      |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

---

## 実行タスク

- **Task 1**: ローカル動作確認依頼 - ユーザーにローカルでの動作確認を依頼
- **Task 2**: 変更サマリー提示 - 変更内容のサマリーを提示しPR作成の許可を確認
- **Task 3**: PR作成 - ユーザーの許可後にPRを作成
- **Task 4**: CI確認 - CIが通過したことを確認
- **Task 5**: タスク完了処理 - タスクディレクトリを完了フォルダに移動

---

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## 実行手順

### Task 1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

- タイムスタンプが自動更新されることを確認
- タブ非表示時に更新が停止することを確認
- 既存機能が正常に動作することを確認

### Task 2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー**:

```markdown
## 変更内容サマリー - TASK-3-2-C

### 新規追加ファイル

- `apps/desktop/src/renderer/hooks/useInterval.ts` - インターバルフック
- `apps/desktop/src/renderer/hooks/usePageVisibility.ts` - 可視状態フック
- `apps/desktop/src/renderer/contexts/TimestampContext.tsx` - タイムスタンプコンテキスト
- `apps/desktop/src/renderer/hooks/__tests__/useInterval.test.ts` - テスト
- `apps/desktop/src/renderer/hooks/__tests__/usePageVisibility.test.ts` - テスト
- `apps/desktop/src/renderer/contexts/__tests__/TimestampContext.test.tsx` - テスト

### 変更ファイル

- `apps/desktop/src/renderer/utils/formatTime.ts` - 更新間隔計算関数追加
- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` - 自動更新対応

### ドキュメント

- `docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/` - タスク仕様書
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` - 仕様更新
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 3: PR作成

ユーザーの許可を得た後、PR作成を実行する。

```bash
# /ai:diff-to-pr を実行
# または手動でPR作成

# ブランチをプッシュ
git push -u origin feature/task-3-2-c-timestamp-autoupdate

# PR作成
gh pr create --title "[TASK-3-2-C] SkillStreamDisplay タイムスタンプ自動更新" --body "$(cat <<'EOF'
## Summary
- MessageTimestampコンポーネントにタイムスタンプ自動更新機能を実装
- 更新間隔の最適化（1分未満:1秒、1分〜1時間:1分、1時間以上:1時間）
- タブ非表示時のタイマー停止によるパフォーマンス最適化

## Changes
- 新規Hook: useInterval, usePageVisibility
- 新規Context: TimestampProvider
- 新規ユーティリティ: calculateUpdateInterval, calculateMinUpdateInterval
- SkillStreamDisplay.tsx: TimestampProvider統合

## Test plan
- [ ] 自動テストが全てPASS
- [ ] タイムスタンプが自動更新されることを確認
- [ ] タブ非表示時に更新が停止することを確認
- [ ] 100メッセージでパフォーマンス低下がないことを確認

Closes #533

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 4: CI確認

PRが作成されたら、CIの結果を確認する。

```bash
# PRのステータス確認
gh pr checks

# 確認項目
# - [ ] 全てのCIチェックがPASS
# - [ ] ビルドが成功
# - [ ] テストが成功
# - [ ] リントが成功
```

### Task 5: タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-3-2-C-timestamp-autoupdate/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-3-2-C

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-3-2-Cをcompleted-tasksに移動"
git push
```

---

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## 次のPhase

なし（ワークフロー完了）
