# Phase 5 Output: 実装ログ

## 変更1: .gitattributes — indexes/\*.md を union → ours に修正

**変更前**

```
.claude/skills/*/indexes/*.md     merge=union
.agents/skills/*/indexes/*.md     merge=union
```

**変更後**

```
.claude/skills/*/indexes/*.md     merge=ours
.agents/skills/*/indexes/*.md     merge=ours
```

**理由**: `topic-map.md` / `resource-map.md` / `quick-reference.md` は generate-index.js で再生成できる。union は行単位の追記を保持するが、生成ファイルでは不整合な中間状態を作る可能性がある。keep-ours（custom driver）でマージ後に再生成する方が安全。

---

## 変更2: generate-index.js — 日付ヘッダー除去

**変更前**

```js
let md = `# トピックマップ

> 自動生成: ${new Date().toISOString().split("T")[0]}
> 生成コマンド: node scripts/generate-index.js
```

**変更後**

```js
let md = `# トピックマップ

> 生成コマンド: node scripts/generate-index.js
```

**理由**: 日付を含むと毎回 diff が発生し、parallel worktree でのマージ時に不要な conflict を引き起こす。行番号索引（`| L\d+`）は維持する。

対象ファイル:

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `.agents/skills/aiworkflow-requirements/scripts/generate-index.js`（canonical から sync）

---

## 変更3: session-init.sh — merge.ours.driver 未設定 warn 追加

**追加コード**

```bash
# custom merge driver (merge=ours) の登録チェック
if git -C "$PROJECT_DIR" rev-parse --git-dir &>/dev/null; then
  OURS_DRIVER="$(git -C "$PROJECT_DIR" config --get merge.ours.driver 2>/dev/null || true)"
  if [ -z "$OURS_DRIVER" ]; then
    echo "⚠️  [session-init] merge.ours.driver が未設定です。..."
    echo "   修正: bash .claude/scripts/setup-merge-drivers.sh"
  fi
fi
```

**理由**: `.gitattributes` の `merge=ours` はカスタムドライバー名。未登録だと merge 時に fallback（通常 3-way merge）が走り、conflict が発生する可能性がある。

---

## 変更4: .claude/scripts/setup-merge-drivers.sh — 新規作成

```bash
git config merge.ours.driver true
```

bootstrap スクリプト。idempotent。
