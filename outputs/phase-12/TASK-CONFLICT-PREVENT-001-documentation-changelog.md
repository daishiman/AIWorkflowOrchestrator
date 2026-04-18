# Phase 12 ドキュメント変更ログ

## タスクID: TASK-CONFLICT-PREVENT-001

---

## 変更ファイル一覧

### 1. `.gitattributes`

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 変更種別   | 変更（既存ファイルへの追記） |
| 実施 Phase | Phase 5                      |

**変更内容:**

4カテゴリの merge policy を追加。

```gitattributes
# Generated index files - always use ours on conflict
.claude/skills/**/indexes/keywords.json merge=ours
.claude/skills/**/indexes/topic-map.md merge=ours
.claude/skills/**/indexes/resource-map.md merge=ours
.claude/skills/**/indexes/quick-reference.md merge=ours

# Mirror tree - canonical is .claude/skills/, agents/ is always regenerated
.agents/skills/** merge=ours

# EVALS - schema is single-owner
**/EVALS.json merge=ours

# LOGS - append-only, union merge to combine both sides' appends
**/LOGS.md merge=union
```

**設計根拠:**

- `keywords.json` 等の索引ファイルは `generate-index.js` により自動生成される。deterministic 化後は内容が同一となるため `merge=ours` で安全に解決できる。
- `.agents/skills/` は `.claude/skills/` の mirror であり、canonical ブランチから生成するため常に ours が正解。
- `LOGS.md` は append-only ログであるため、両ブランチの追記を結合する `merge=union` が適切。

---

### 2. `.claude/scripts/setup-merge-drivers.sh`（新規作成）

| 項目       | 内容     |
| ---------- | -------- |
| 変更種別   | 新規作成 |
| 実施 Phase | Phase 5  |

**変更内容:**

custom `keep-ours` merge driver をローカル git config に登録する bootstrap スクリプト。

```bash
#!/usr/bin/env bash
# setup-merge-drivers.sh
# custom merge driver "ours" を .git/config に登録する
set -euo pipefail

git config merge.ours.driver true
echo "✅ merge.ours.driver = true を設定しました"
```

**設計根拠:**
`.gitattributes` に `merge=ours` を記述するだけでは git は merge driver を認識しない。`.git/config` への登録が必須だが、`.git/config` はリポジトリ管理外のため各開発者が手動実行する必要がある。このスクリプトで操作を1コマンドに集約した。

---

### 3. `.claude/hooks/session-init.sh`

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 変更種別   | 変更（既存ファイルへの追記） |
| 実施 Phase | Phase 5                      |

**変更内容:**

セッション開始時に `merge.ours.driver` の設定状態を確認し、未設定の場合に警告を表示するチェックを追加。

```bash
# merge driver 設定チェック
OURS_DRIVER=$(git config merge.ours.driver 2>/dev/null || true)
if [ "$OURS_DRIVER" != "true" ]; then
  echo "⚠️  [session-init] merge.ours.driver が未設定です。"
  echo "    bash .claude/scripts/setup-merge-drivers.sh を実行してください。"
fi
```

**設計根拠:**
新しい開発環境や worktree では `setup-merge-drivers.sh` の実行が忘れられやすい。セッション開始時に自動チェックすることで、コンフリクト発生前に気付ける設計にした。

---

### 4. `.claude/hooks/post-merge-index-regenerate.sh`

| 項目       | 内容                       |
| ---------- | -------------------------- |
| 変更種別   | 変更（再生成 hook の追加） |
| 実施 Phase | Phase 5                    |

**変更内容:**

git merge 完了後に索引ファイルを再生成するフックを追加。

```bash
#!/usr/bin/env bash
# post-merge-index-regenerate.sh
# merge 後に generate-index.js を実行して索引を最新化する
set -euo pipefail

SCRIPT_PATH=".claude/skills/aiworkflow-requirements/scripts/generate-index.js"

if [ -f "$SCRIPT_PATH" ]; then
  echo "🔄 [post-merge] 索引ファイルを再生成します..."
  node "$SCRIPT_PATH"
  echo "✅ [post-merge] 索引ファイルの再生成が完了しました"
fi
```

**設計根拠:**
`merge=ours` で自動解決された場合、手元ブランチの索引がそのまま使われる。マージ後に最新の全ファイルから索引を再生成することで、常に正確な索引が維持される。

---

### 5. `.agents/skills/aiworkflow-requirements/scripts/generate-index.js`（deterministic 化）

| 項目       | 内容                     |
| ---------- | ------------------------ |
| 変更種別   | 変更（日付ヘッダー除去） |
| 実施 Phase | Phase 5                  |

**変更内容:**

生成ファイルの先頭に出力していたタイムスタンプ行を除去。

```diff
- // Generated: 2026-04-17T12:34:56.789Z
- // Do not edit manually
  # Keywords Index
```

**設計根拠:**
タイムスタンプが含まれると、異なるブランチで異なる時刻に生成した索引ファイルの内容が一致せず、`merge=ours` の設定があっても不必要な差分が生まれる。タイムスタンプを除去することで同一コンテンツから常に同一の出力が得られる。

---

### 6. `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`（deterministic 化）

| 項目       | 内容                     |
| ---------- | ------------------------ |
| 変更種別   | 変更（日付ヘッダー除去） |
| 実施 Phase | Phase 5                  |

`.agents/skills/` 側と同一の変更。canonical パスと mirror パスの両方に同じ修正を適用。

---

## 変更統計

| 変更種別                 | ファイル数 |
| ------------------------ | ---------- |
| 新規作成                 | 1          |
| 変更（追記）             | 3          |
| 変更（deterministic 化） | 2          |
| **合計**                 | **6**      |
