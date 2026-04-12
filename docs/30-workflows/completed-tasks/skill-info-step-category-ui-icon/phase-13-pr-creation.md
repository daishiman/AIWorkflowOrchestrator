# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 13                                   |
| 名称       | PR作成                               |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 重要: ユーザー承認が必要

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

Phase 12 完了後、ユーザーに以下を確認してから実施する：

```
Phase 12 のドキュメント更新が完了しました。
PR 作成を実施してよいですか？
```

---

## 実行タスク

### Task 1: ブランチ確認

```bash
# 現在のブランチ確認
git status
git branch

# 差分確認
git diff --stat HEAD~1
```

### Task 2: コミット状態確認

```bash
# 変更ファイルの確認
git diff --stat

# ステージング状態確認
git status
```

変更対象ファイル（予定）:

| ファイル                                                                             | 変更内容                                                       |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | `CategoryOption` 型追加・CATEGORY_OPTIONS 拡張・ボタン UI 変更 |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | アイコン・ツールチップ・A11y テスト追加                        |

### Task 3: PR 作成

```bash
gh pr create \
  --title "feat(skill-wizard): SkillInfoStep カテゴリ選択 UI にアイコン・ツールチップ追加 (#2028)" \
  --body "$(cat <<'EOF'
## Summary

- `CATEGORY_OPTIONS` に `icon`（絵文字）と `description` フィールドを追加
- 各カテゴリボタンにアイコン表示・ホバーツールチップ（`title` 属性）を実装
- `aria-label` 追加によりアクセシビリティを改善
- テスト（TC-IC/TT/A1/RG/EC/A2 計 20件）を追加

## 関連 Issue

Closes #2028

## 注意事項

`UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001` と同一ファイル変更のため、並列実施時は PR を分離済み。

## Test plan

- [ ] `pnpm typecheck` PASS 確認
- [ ] `pnpm lint` PASS 確認
- [ ] `pnpm vitest run SkillInfoStep.test.tsx` 全件 PASS 確認
- [ ] 手動テスト: アイコン表示・ツールチップ動作・選択状態確認
- [ ] Phase 11 スクリーンショット（SS-01〜SS-04）で視覚確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 4: CI 確認

```bash
# PR 作成後に CI 状態を確認
gh pr checks

# CI が全て PASS するまで待機
gh run watch
```

### Task 5: タスク完了処理

```bash
# artifacts.json のステータスを completed へ更新
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-info-step-category-ui-icon \
  --phase 13 \
  --artifacts "PR作成完了"
```

---

## PR blocked 条件

以下の条件では PR を作成しない（blocked）：

- [ ] Phase 10 最終レビューで MAJOR 指摘が未解消
- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm test` が FAIL
- [ ] Phase 12 の必須6タスクが未完了
- [ ] ユーザーの明示的な承認が得られていない

---

## 参照資料

- `.claude/skills/task-specification-creator/references/review-gate-criteria.md`
- `phase-12-documentation.md` - Phase 12 完了確認

---

## 成果物

| 成果物              | 配置先                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- |
| GitHub Pull Request | GitHub UI（PR URL を記録）                                                          |
| PR 作成記録         | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-13/pr-summary.md` |

---

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] PR blocked 条件を全て確認（未該当）
- [ ] `gh pr create` でPR作成完了
- [ ] CI（`gh pr checks`）が全て PASS
- [ ] PR URL を記録

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: ブランチ・差分確認
- [ ] Task 2 完了: コミット状態確認
- [ ] Task 3 完了: PR 作成（ユーザー承認後）
- [ ] Task 4 完了: CI 確認
- [ ] Task 5 完了: タスク完了処理

---

## タスク全体完了

Phase 13 完了 → **`UT-SKILL-WIZARD-CATEGORY-UI-ICON-001` タスク全体完了**
