# Phase 13: PR作成

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

> **⚠️ ユーザーの明示的な承認後のみ実行すること**

---

## PR 情報

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| ブランチ | `feat/skill-center-lifecycle-navigation`                                   |
| ベース   | `main`                                                                     |
| タイトル | `feat(desktop): SkillCenterView → SkillManagementPanel ナビゲーション接続` |

---

## PR 本文テンプレート

```markdown
## Summary

- `ViewType` に `"skillManagement"` を追加し、`skillCreate` の主導線は維持
- `SkillCenterView` に「スキル管理」ボタンを追加し、`SkillManagementPanel` への副導線を新設
- `SkillManagementPanel` は `SkillLifecyclePanel` を内部サブビューとして再利用
- main-shell と `/advanced/skill-management-panel` の両方で同じ panel を扱えるよう `onClose` を整理

## Test plan

- [ ] TC-01〜TC-06（Unit Test 6件）PASS
- [ ] EC-01〜EC-04（エッジケース 4件）PASS
- [ ] RG-01〜RG-03（回帰テスト 3件）PASS
- [ ] Phase 11 スクリーンショット確認済み
- [ ] `pnpm typecheck` PASS
- [ ] `pnpm lint` PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## PR 作成コマンド（承認後に実行）

```bash
gh pr create \
  --title "feat(desktop): SkillCenterView → SkillManagementPanel ナビゲーション接続" \
  --body "$(cat <<'EOF'
## Summary
...
EOF
)"
```

---

## Phase 13 完了確認

- [ ] ユーザー明示承認取得
- [ ] PR 作成完了
- [ ] CI 確認完了
