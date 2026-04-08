# 実装ガイド - TASK-FIX-WORKTREE-CONFLICT-001

## Part 1

### 1. まずなぜ必要か

並列 worktree が多いと、同じ種類のファイルが別々に書き換わって、あとで衝突しやすくなる。
たとえば、クラスの名簿を 2 人で別々に書き直すと、あとでどちらが正しいか迷うのと同じです。

今回の修正は、この「どちらの変更を残すか」の迷いを減らし、毎回同じ手順で戻せるようにするために必要だった。

### 2. 何をするか

今回作ったものは次の 3 つです。

### 今回作ったもの

- `post-merge` フックで `indexes/*.json` を再生成する
- `generate-index.js` を `--quiet` 対応にして、通常運用のログを最小化する
- `keywords.json` を決定的な出力にして、` .claude/` と `.agents/` の mirror parity を壊しにくくする

### 3. どう役立つか

| 役立つ点     | 説明                       | たとえば                                   |
| ------------ | -------------------------- | ------------------------------------------ |
| 迷いが減る   | 何を自動で戻すかが決まる   | 片方の作業で消えた索引をあとから復元できる |
| うるさくない | 普段はログを抑える         | 何度も同じ操作をしても画面が埋まらない     |
| ずれにくい   | 出力が毎回同じになりやすい | 正本と mirror を見比べたときに差が出にくい |

## Part 2

### CLIシグネチャ

```bash
bash .claude/scripts/install-git-hooks.sh
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)" && bash "$HOOK_PATH"
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
```

### TypeScript 型定義

```ts
type Phase12ArtifactName =
  | "implementation-guide"
  | "system-spec-update-summary"
  | "documentation-changelog"
  | "unassigned-task-detection"
  | "skill-feedback-report"
  | "phase12-task-spec-compliance-check";

interface Phase12ArtifactRecord {
  name: Phase12ArtifactName;
  path: string;
  type: "document";
}
```

### 使用例

```bash
# フックを入れる
bash .claude/scripts/install-git-hooks.sh

# フックの中身を確認しながら手で再実行する
bash "$(git rev-parse --git-path hooks/post-merge)"

# インデックスを静かに再生成する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --quiet
```

### エラーハンドリング

- `command -v node` で Node.js がなければ処理しない
- `set -euo pipefail` で、途中失敗を見逃さない
- 生成スクリプトが存在しなければフックをスキップする
- `git rev-parse --git-path hooks/post-merge` で解決した先を使い、パスを決め打ちしない

### エッジケース

- `husky` が `hooks/post-merge` の場所を変えても、`git rev-parse --git-path` なら追従できる
- `--quiet` を付けてもエラーは隠さず、標準エラーはそのまま見せる
- `keywords.json` に生成時刻を入れないので、別タイミングで再生成しても差分が増えにくい

### 設定項目と定数一覧

| 項目                      | 値                                 | 役割                                 |
| ------------------------- | ---------------------------------- | ------------------------------------ |
| `CLAUDE_SKIP_HEAVY_HOOKS` | `1`                                | 重いフックを飛ばして初期化を速くする |
| `QUIET`                   | `process.argv.includes("--quiet")` | 再生成ログを抑える                   |
| `INDEXES_DIR`             | `.../indexes`                      | 生成先ディレクトリ                   |
| `REFS_DIR`                | `.../references`                   | 索引元の参照ディレクトリ             |

### テスト構成

- `bash -n .claude/hooks/post-merge-index-regenerate.sh`
- `bash -n .claude/scripts/install-git-hooks.sh`
- `bash -n .claude/hooks/session-init.sh`
- `git diff --check`
- `diff -qr .claude/skills .agents/skills`
- `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "post-merge" --files-only --max-files 3`
