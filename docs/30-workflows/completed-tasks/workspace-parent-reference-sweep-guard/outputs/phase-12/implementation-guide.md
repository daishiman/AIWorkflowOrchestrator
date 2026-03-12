# 実装ガイド

## Part 1: まず、なぜ必要か

この仕組みが必要なのは、親の案内ページだけを直しても、ほかの案内板や記録が古いままだと、次に見る人がまた迷うからです。たとえば、引っ越しのあとに住所録を 1 か所だけ直しても、学校の連絡網、宅配の送り先メモ、家族のスマホの連絡先が古いままだと、また同じ間違いが起きます。

今回やったことも同じです。`task-060` という親の案内だけでなく、古い一覧表、補助の説明ページ、証拠の置き場所を書いた資料、そして正本の写しまでまとめて点検しないと、古い道案内が残ってしまいます。

何をしたかというと、「どこを見れば正しい場所に着けるか」を 1 枚の点検表にまとめ、その点検表どおりに順番に直しました。さらに、最後に自動チェックを 1 回走らせれば、古い道案内が残っていないかをすぐ確かめられるようにしました。

## Part 2: 技術者向け詳細

### 全体像

Workspace 親導線 sweep guard は、docs-only parent workflow に対する cross-file consistency check である。対象は pointer docs、index docs、system spec、capture script、skill mirror の 5 群で、出力は `path-drift` / `status-drift` / `mirror-drift` の 3 分類に固定する。

### 型定義

```ts
type DriftType = "path-drift" | "status-drift" | "mirror-drift";

interface FileCheck {
  file: string;
  type: DriftType;
  requiredStrings?: string[];
  forbiddenStrings?: string[];
  forbiddenRegexes?: RegExp[];
}

interface MirrorPair {
  canonical: string;
  mirror: string;
}

interface DriftFinding {
  type: DriftType;
  file: string;
  message: string;
  expected: string;
  actual: string;
}

interface ValidationResult {
  ok: boolean;
  root: string;
  summary: Record<DriftType, number>;
  findings: DriftFinding[];
}
```

### CLI シグネチャ

```bash
node scripts/validate-workspace-parent-reference-sweep.mjs [--json] [--root <path>]
```

- `--json`: 集計と findings を JSON で出力する。
- `--root <path>`: fixture や別 worktree を対象にする。

### 使用例

```bash
# 実 repo を検証
node scripts/validate-workspace-parent-reference-sweep.mjs --json

# 一時 fixture を検証
node scripts/validate-workspace-parent-reference-sweep.mjs --json --root /tmp/workspace-parent-sweep-fixture
```

### 実装の流れ

1. `FILE_CHECKS` で required / forbidden 条件を file class ごとに定義する。
2. `REQUIRED_PATHS` で completed workflow 実体の存在を検証する。
3. `runFileChecks()` で path/status drift を収集する。
4. `runMirrorChecks()` で `.claude` と `.agents` の `diff -qr` を実行する。
5. drift 件数を summary に集約し、`ok` を返す。

### エラーハンドリング

- target file が存在しない場合は、その時点で finding を追加し、他のチェックを継続する。
- `diff -qr` 実行時に OS レベルの error が出た場合も `mirror-drift` finding として返す。
- JSON 出力でも text 出力でも、fail の根拠は `file` / `expected` / `actual` で追える形にする。

### エッジケース

- completed-task pointer docs は `completed` と厳密一致させず、`未着手` / `pending` 残存だけを fail にする。
- aiworkflow indexes 再生成後は一時的に mirror drift が出ることがあるため、`generate-index` と `rsync` の順序を固定する。
- 新しい Workspace parent 参照先が増えた場合、validator は自動追従しない。まず `outputs/phase-2/sweep-manifest-design.md` と `FILE_CHECKS` を同時更新する。

### 設定と定数

| 定数 / 設定      | 意味                                          |
| ---------------- | --------------------------------------------- |
| `FILE_CHECKS`    | file class ごとの required / forbidden ルール |
| `REQUIRED_PATHS` | completed workflow 実体として必須の path      |
| `MIRROR_PAIRS`   | canonical root と mirror root の対応          |
| `--json`         | CI や Phase 9/12 記録向けの構造化出力         |
| `--root`         | fixture / 別 worktree 向けの検証対象切替      |

### 関連コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
rsync -a --checksum --delete .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
pnpm exec vitest run scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --completed-unassigned-dir docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task --target-file docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```
