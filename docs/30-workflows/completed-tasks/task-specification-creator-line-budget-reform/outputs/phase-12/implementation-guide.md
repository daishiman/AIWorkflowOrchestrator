# task-specification-creator line budget reform 実装ガイド

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| 機能名   | task-specification-creator line budget reform              |
| 作成日   | 2026-03-12                                                 |
| 対象読者 | 初学者から保守担当開発者まで                               |

## Part 1

### なぜ必要か

大きすぎる説明書は、必要な情報を探すだけで時間がかかる。`task-specification-creator` では `SKILL.md`、`LOGS.md`、複数の guide が 500 行を超えており、「入口」と「詳細」が同じ棚に積み上がっていた。これでは次の人が読むときに、どこが案内板でどこが実務手順かを見分けにくい。

### 何をするか

大きな Markdown を 6 つの concern に分け、それぞれを「入口の親ファイル」と「詳細の子ファイル」に分離した。さらに `.claude` を正本、`.agents` を mirror として同期し、line budget、validator、mirror parity を毎回確認できるようにした。

### 日常の例え

たとえば: 教室の後ろにある本棚を想像するとわかりやすい。  
最初は、時間割、名簿、連絡帳、古いプリントが 1 つの箱に全部入っていた。必要な紙を探すたびに箱をひっくり返すことになる。  
今回やったことは、その箱を「案内板」「今週の連絡」「過去の記録」「教科別の棚」に分けた状態に近い。入口には何がどこにあるかだけを書き、詳しい内容はそれぞれの棚に置く。

### 今回作ったもの

| 日本語        | 英語          | 役割                                       |
| ------------- | ------------- | ------------------------------------------ |
| concern 分割  | concern split | 役割が混ざった大きな文書を責務単位に分ける |
| family file   | family file   | 親ファイルから関連 detail を束ねて案内する |
| rolling log   | rolling log   | 直近だけを残す軽いログ                     |
| archive index | archive index | 過去履歴へ辿るための入口                   |
| mirror sync   | mirror sync   | `.claude` と `.agents` の整合を保つ        |

## Part 2

### 型定義

```ts
type ConcernId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

interface SplitArtifact {
  concern: ConcernId;
  parentPath: string;
  childPaths: string[];
  beforeLines: number;
  afterLines: number;
}

interface ValidationResult {
  command: string;
  passed: boolean;
  note?: string;
}
```

### APIシグネチャ

```ts
function syncSkillMirror(
  canonicalRoot: string,
  mirrorRoot: string,
): Promise<void>;
function collectLineBudget(paths: string[]): Promise<ValidationResult[]>;
function validateWorkflow(workflowDir: string): Promise<ValidationResult[]>;
```

CLI シグネチャ:

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator --verbose
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator --verbose
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

### 使用例

```bash
# 1. 正本の line budget を確認する
wc -l .claude/skills/task-specification-creator/SKILL.md \
  .claude/skills/task-specification-creator/LOGS.md \
  .claude/skills/task-specification-creator/references/*.md

# 2. validator を実行する
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator --verbose
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator --verbose

# 3. mirror 差分を確認する
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

```ts
const artifacts: SplitArtifact[] = [
  {
    concern: "C1",
    parentPath: ".claude/skills/task-specification-creator/SKILL.md",
    childPaths: [
      ".claude/skills/task-specification-creator/references/phase-templates.md",
      ".claude/skills/task-specification-creator/references/spec-update-workflow.md",
    ],
    beforeLines: 508,
    afterLines: 227,
  },
];
```

### エラーハンドリング

validator が失敗したら、まず `wc -l` と `diff -qr` のどちらが落ちたかを切り分ける。  
`quick_validate.js` が落ちたときは `SKILL.md` の導線や agent 導線を見直す。  
`validate_all.js` が落ちたときは references 構造や file role を見直す。  
`diff -qr` が落ちたときは mirror 欠落か stray file を疑い、`.claude` 側を正本として再同期する。

### エッジケース

1. `quick_validate.js` の行数表示と `wc -l` が 1 行ずれることがあるが、両方とも 500 行以内なら blocker ではない。
2. root drift 用の `rg` は no-hit で exit code 1 を返すため、標準出力が空であれば PASS と解釈する。
3. docs-only task では通常 screenshot capture は不要だが、user が branch-level visual sanity を明示要求した場合は補助 evidence として representative screenshot を追加してよい。
4. archive file を増やしたときは `LOGS.md` と `logs-archive-index.md` を同時更新しないと孤立 file になる。

### 設定項目と定数一覧

| 項目           | 値                                | 意味                           |
| -------------- | --------------------------------- | ------------------------------ |
| line budget    | 500 行                            | 1 markdown file の上限         |
| canonical root | `.claude/skills/...`              | 正本を編集する場所             |
| mirror root    | `.agents/skills/...`              | 同期先                         |
| lane 上限      | 3                                 | 並列 concern lane の最大数     |
| validator 順序 | `wc -l` → validators → `diff -qr` | 失敗点の切り分けをしやすくする |

### テスト構成

| レイヤー      | 使った検証                                        |
| ------------- | ------------------------------------------------- | ----- |
| line budget   | `wc -l`                                           |
| 構造検証      | `quick_validate.js`, `validate_all.js`            |
| workflow 検証 | `validate-phase-output.js`, `verify-all-specs.js` |
| parity 検証   | `diff -qr`, `find                                 | sort` |
| manual 検証   | `SKILL.md` / `LOGS.md` navigation walkthrough     |

## まとめ

この reform は「大きい文書を小さくした」だけではなく、「入口と詳細を分け、正本と mirror を揃え、毎回検証できる形にした」ことが本質である。
