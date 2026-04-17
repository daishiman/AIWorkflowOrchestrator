# Phase 4: テスト作成 - TASK-CONFLICT-PREVENT-001

## ステータス: 完了

## タスク種別: NON_VISUAL

Git設定変更のため自動ユニットテストは不要。手動確認手順で代替する。

---

## テストケース定義

### TC-01: SKILL.md merge=union 動作確認

**目的**: `SKILL.md`に`merge=union`が適用されてコンフリクトマーカーが残らないこと

**手順**:

```bash
# gitattributesの設定確認
git check-attr merge .claude/skills/skill-creator/SKILL.md
# 期待値: .claude/skills/skill-creator/SKILL.md: merge: union

git check-attr merge .agents/skills/skill-creator/SKILL.md
# 期待値: .agents/skills/skill-creator/SKILL.md: merge: union
```

**合否基準**: 出力に`merge: union`が含まれること

---

### TC-02: settings.local.json merge=ours 動作確認

**目的**: `settings.local.json`に`merge=ours`が適用されること

**手順**:

```bash
git check-attr merge .claude/settings.local.json
# 期待値: .claude/settings.local.json: merge: ours
```

**合否基準**: 出力に`merge: ours`が含まれること

---

### TC-03: post-merge フック実行確認

**目的**: `.husky/post-merge`が正常実行されること

**手順**:

```bash
# フックを直接実行（worktreeルートから）
cd <project-root>
sh .husky/post-merge
# 期待値: "[post-merge] ✓ 再生成成功" が出力される
echo "exit code: $?"
# 期待値: exit code: 0
```

**合否基準**: exit code 0 かつ成功メッセージが出力されること

---

### TC-04: .backups/ gitignore 確認

**目的**: `.backups/`が追跡対象外であること

**手順**:

```bash
git status .claude/skills/.backups/
# 期待値: 何も表示されない（tracked/untracked どちらも出ない）

git check-ignore -v .claude/skills/.backups/test-file.md
# 期待値: .gitignore:NN:.claude/skills/.backups/ .claude/skills/.backups/test-file.md
```

**合否基準**: `.gitignore`によって除外されていること

---

### TC-05: post-merge フック失敗時動作確認

**目的**: スクリプト失敗時に`exit 1`で終了すること

**手順**:

```bash
# generate-index.jsを一時的に壊して実行
SCRIPT=".claude/skills/aiworkflow-requirements/scripts/generate-index.js"
mv "$SCRIPT" "${SCRIPT}.bak"
sh .husky/post-merge
echo "exit code: $?"
# 期待値: exit code 1 または 0（スクリプトが見つからない場合はスキップ）
mv "${SCRIPT}.bak" "$SCRIPT"
```

**合否基準**: エラーメッセージが表示されること

---

## テスト優先順位

| TC    | 優先度 | 自動化         |
| ----- | ------ | -------------- |
| TC-01 | P0     | bash one-liner |
| TC-02 | P0     | bash one-liner |
| TC-03 | P0     | sh実行         |
| TC-04 | P1     | bash one-liner |
| TC-05 | P2     | 手動           |
