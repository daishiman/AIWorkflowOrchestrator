# 実装ガイド

## Part 1: 初学者・中学生向け

### これは何を解決する仕組みか

未タスク監査は、これまで「学校全体の忘れ物検査」を毎回やっている状態だった。
すると、今日あなたが忘れ物をしていなくても、過去の誰かの忘れ物が大量に出てきて、
「今日のあなたは合格か不合格か」が分かりにくくなる。

今回の改善は、次の2段に分ける。

1. **対象監査（current）**: 今日のあなたの持ち物だけチェック
2. **全体監査（baseline）**: 学校全体の忘れ物傾向を確認

これで「今回の変更が正しいか」をすぐ判定できる。

### 何が変わったか

| 追加機能             | 役割                      | 使い方                                      |
| -------------------- | ------------------------- | ------------------------------------------- |
| `--target-file`      | 1ファイルだけ対象監査する | 今回触った未タスク指示書だけを current 判定 |
| `--diff-from`        | git差分を対象監査する     | 変更ファイル群を current 判定               |
| `currentViolations`  | 今回分の違反              | ここが0なら今回合格                         |
| `baselineViolations` | 既存分の違反              | 資産健全性として別管理                      |

### 使い方（運用順）

1. `--target-file` で今回変更分の合否を判定
2. 必要なら `--diff-from` で差分群を判定
3. 最後に scopeなし全体監査で baseline を確認

---

## Part 2: 技術者向け

### CLIオプション

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <path>
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from <git-ref>
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
```

### 出力スキーマ（追加分）

```ts
type ScopeInfo = {
  mode: "full" | "scoped";
  targetFiles: string[];
  diffFrom: string | null;
  currentFiles: string[];
};

type ViolationBuckets = {
  formatViolations: Array<{ filePath: string; missingHeadings: string[] }>;
  namingViolations: string[];
  misplacedFiles: string[];
  total: number;
};
```

既存 `summary` に以下を追加:

- `scope: ScopeInfo`
- `currentViolations: ViolationBuckets`
- `baselineViolations: ViolationBuckets`
- `totals.currentViolations`, `totals.baselineViolations`

### exit code契約

| 条件                                               | exit |
| -------------------------------------------------- | ---- |
| 不正入力（未知オプション、不正パス、不正diff ref） | 2    |
| scope指定あり + current違反あり                    | 1    |
| scope指定あり + current違反0                       | 0    |
| scope指定なし + 全体違反あり                       | 1    |
| scope指定なし + 全体違反0                          | 0    |

### エッジケース

1. `--target-file` が監査対象ディレクトリ外: exit 2
2. `--target-file` が存在しない: exit 2
3. `--diff-from` が解決不能: exit 2
4. scope指定ありだが current 対象0件: current違反0として扱い exit 0

### 設定可能パラメータ

- `--unassigned-dir`（既定: `docs/30-workflows/unassigned-task`）
- `--completed-unassigned-dir`（既定: `docs/30-workflows/completed-tasks/unassigned-task`）
- `--target-file`（複数指定/カンマ区切り対応）
- `--diff-from`
