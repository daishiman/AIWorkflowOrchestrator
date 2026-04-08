# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 11                             |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

ローカル環境での実際の git 操作による動作確認を行う。
本タスクは UI を持たない設定変更・シェルスクリプト実装のため、NON_VISUAL モードで実施する。
自動テスト（Phase 4〜7）で検証できない **実際の git マージ動作** を手動で確認する。
AC-1〜AC-8 のうち、ローカル実機でしか確認しにくいものを優先的に再確認する。

> NON_VISUAL: 視覚的な UI 確認は不要。コマンドライン操作による動作確認のみ。

---

## 実行タスク

- **タスク1**: ローカル並列ブランチマージの実動作確認（LOGS.md・EVALS.json・SKILL-changelog.md）
- **タスク2**: post-merge フックのセッション内動作確認
- **タスク3**: CI の paths-ignore 動作確認（GitHub 上での確認または ローカルシミュレーション）
- **タスク4**: 発見された問題の記録

---

## 手動テスト手順

### MT-1: LOGS.md 並列マージ（コンフリクトなし確認）

```bash
# テスト用リポジトリのクリーンな状態から実施
CURRENT_BRANCH=$(git branch --show-current)

# ブランチ A: LOGS.md に追記
git checkout -b test/manual-logs-a
echo "- テストエントリ A ($(date))" >> .claude/skills/aiworkflow-requirements/LOGS.md
git add .claude/skills/aiworkflow-requirements/LOGS.md
git commit -m "test: LOGS.md 追記 A"

# ブランチ B: 同じファイルに別追記
git checkout "$CURRENT_BRANCH"
git checkout -b test/manual-logs-b
echo "- テストエントリ B ($(date))" >> .claude/skills/aiworkflow-requirements/LOGS.md
git add .claude/skills/aiworkflow-requirements/LOGS.md
git commit -m "test: LOGS.md 追記 B"

# マージ（コンフリクトなしを期待）
git merge test/manual-logs-a --no-edit
echo "終了コード: $?"  # 0 であること

# 両エントリが存在することを確認
grep "テストエントリ A" .claude/skills/aiworkflow-requirements/LOGS.md && echo "PASS: エントリ A"
grep "テストエントリ B" .claude/skills/aiworkflow-requirements/LOGS.md && echo "PASS: エントリ B"

# クリーンアップ
git checkout "$CURRENT_BRANCH"
git branch -D test/manual-logs-a test/manual-logs-b
```

### MT-2: EVALS.json 並列マージ（JSON 破損なし確認）

```bash
CURRENT_BRANCH=$(git branch --show-current)
EVALS_FILE=".claude/skills/aiworkflow-requirements/EVALS.json"

# 現在の内容をバックアップ
cp "$EVALS_FILE" "${EVALS_FILE}.bak"

# ブランチ A
git checkout -b test/manual-evals-a
jq '.total_usage_count += 1' "$EVALS_FILE" > /tmp/evals_a.json && mv /tmp/evals_a.json "$EVALS_FILE"
git add "$EVALS_FILE" && git commit -m "test: EVALS 更新 A"

# ブランチ B
git checkout "$CURRENT_BRANCH"
git checkout -b test/manual-evals-b
jq '.current_level = 5' "$EVALS_FILE" > /tmp/evals_b.json && mv /tmp/evals_b.json "$EVALS_FILE"
git add "$EVALS_FILE" && git commit -m "test: EVALS 更新 B"

# マージ（merge=ours で現ブランチ B の値が保持され、消失分は復元対象として扱う）
git merge test/manual-evals-a --no-edit

# JSON が有効であることを確認
jq . "$EVALS_FILE" && echo "PASS: JSON valid" || echo "FAIL: JSON invalid"

# クリーンアップ
cp "${EVALS_FILE}.bak" "$EVALS_FILE"
git add "$EVALS_FILE" && git commit -m "test: EVALS 復元"
git checkout "$CURRENT_BRANCH"
git branch -D test/manual-evals-a test/manual-evals-b
```

### MT-3: post-merge フック動作確認

```bash
# フックが存在し実行可能であることを確認
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
ls -la "$HOOK_PATH"

# フックを手動実行（ドライラン）
bash "$HOOK_PATH"
echo "終了コード: $?"  # 0 であること

# マージ実行でフックが自動起動することを確認
# （実際のマージで "[post-merge] indexes/*.json を再生成中..." が出力される）
```

### MT-4: SKILL-changelog.md 並列マージ確認

```bash
CURRENT_BRANCH=$(git branch --show-current)
CHANGELOG=".claude/skills/aiworkflow-requirements/SKILL-changelog.md"

git checkout -b test/manual-changelog-a
printf "\n## テスト v1.0 - %s\n- 変更 A\n" "$(date +%Y-%m-%d)" >> "$CHANGELOG"
git add "$CHANGELOG" && git commit -m "test: changelog 追記 A"

git checkout "$CURRENT_BRANCH"
git checkout -b test/manual-changelog-b
printf "\n## テスト v1.1 - %s\n- 変更 B\n" "$(date +%Y-%m-%d)" >> "$CHANGELOG"
git add "$CHANGELOG" && git commit -m "test: changelog 追記 B"

git merge test/manual-changelog-a --no-edit
grep "変更 A" "$CHANGELOG" && echo "PASS: 変更 A が存在"
grep "変更 B" "$CHANGELOG" && echo "PASS: 変更 B が存在"

git checkout "$CURRENT_BRANCH"
git branch -D test/manual-changelog-a test/manual-changelog-b
```

### MT-5: gwt() の post-merge フック自動インストール確認

```bash
# worktree 作成後に post-merge hook が実行可能であることを確認
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
ls -la "$HOOK_PATH"
test -x "$HOOK_PATH" && echo "PASS: post-merge hook executable"
```

### MT-6: tmux B の heavy hook skip 確認

```bash
# tmux 設定に heavy hook skip が埋め込まれていることを確認
grep "CLAUDE_SKIP_HEAVY_HOOKS=1" ~/.tmux.conf && echo "PASS: skip flag present"
```

---

## 成果物

| 成果物             | 配置先                                   | 形式     |
| ------------------ | ---------------------------------------- | -------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | Markdown |
| 手動テストレポート | `outputs/phase-11/manual-test-report.md` | Markdown |
| 発見問題一覧       | `outputs/phase-11/discovered-issues.md`  | Markdown |

---

## 完了条件

- [ ] MT-1: LOGS.md 並列マージでコンフリクトが発生しないことを確認済み
- [ ] MT-2: EVALS.json 並列マージで JSON 構造が有効であることを確認済み
- [ ] MT-3: post-merge フックがマージ後に自動起動することを確認済み
- [ ] MT-4: SKILL-changelog.md 並列マージで両エントリが統合されることを確認済み
- [ ] MT-5: gwt() による post-merge フック自動インストールを確認済み
- [ ] MT-6: tmux B 起動時に heavy hook skip が設定されていることを確認済み
- [ ] 発見された問題がある場合は `outputs/phase-11/discovered-issues.md` に記録済み

---

## 次 Phase

**Phase 12: ドキュメント更新** — 実装ガイド・変更ログ・スキルフィードバックを記録する。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
