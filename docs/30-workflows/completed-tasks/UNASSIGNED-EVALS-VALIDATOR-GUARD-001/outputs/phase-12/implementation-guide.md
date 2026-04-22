# 実装ガイド — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

UI/UX変更なしのため Phase 11 スクリーンショット不要。

## Part 1

### なぜ必要か

validator が 0 件のままだと、EVALS.json が壊れても気づけない。今回はその状態を解消し、`skill-fixture-runner` から EVALS.json の基本品質を自動確認できるようにした。

### 何をするか

`validate-evals.js` は 3 段階で確認する。

1. L1: JSON として読めるか
2. L2: スキル名、レベル、メトリクスなどの土台があるか
3. L3: `.claude` と `.agents` の 2 か所が一致しているか

### 日常の例え

たとえば、レストランで食材チェックリストを毎日確認する係員がいないと、古い食材が使われてしまうかもしれません。同じように、EVALS.json の中身を検証する係がいないと、壊れたデータや欠けた情報が混ざっても見逃します。

dual root は、同じ在庫リストを 2 つの倉庫が持つ状態に近い。片方だけ直して片方を忘れると、在庫表が食い違う。

### 今回作ったもの

1. `validate-evals.js`
2. `run-all-validations.js` への統合
3. allowlist-only の fixture 除外
4. strict 契約と directory path 契約のテスト

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

## Part 2

### インターフェース定義

```ts
type ValidateEvalsOptions = {
  allSkills?: boolean;
  skill?: string;
  path?: string; // file or directory
  checkDualRoot?: boolean;
  checkExcluded?: boolean;
  strict?: boolean;
  json?: boolean;
  verbose?: boolean;
};

type ValidateLayerResult = {
  ok: boolean;
  layer: "L1" | "L2" | "L3";
  reason?: string;
  missing?: string[];
  warnings?: string[];
};

type ValidateEvalsResult = {
  skillName?: string;
  path: string;
  excluded: boolean;
  ok: boolean;
  l1?: ValidateLayerResult;
  l2?: ValidateLayerResult;
  l3?: ValidateLayerResult;
  error?: string;
};
```

### API シグネチャと使用例

```bash
node scripts/validate-evals.js --all-skills --check-dual-root
node scripts/validate-evals.js --skill skill-fixture-runner --strict
node scripts/validate-evals.js --path .claude/skills/skill-fixture-runner
node scripts/validate-evals.js --path apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
node scripts/validate-evals.js --all-skills --json
```

### L1/L2/L3 検証ロジック詳細

- L1: `JSON.parse()` で構文検証する。空ファイルも失敗にする。
- L2: `skillName/skill_name`、`currentLevel/current_level`、`metrics` を確認する。
- L3: `.claude/skills/<name>/EVALS.json` と `.agents/skills/<name>/EVALS.json` を `Buffer.compare()` で比較する。

### 方言許容モードと strict モード

```ts
const DIALECT_PAIRS = [
  ["skillName", "skill_name"],
  ["currentLevel", "current_level"],
] as const;
```

- デフォルト: 各 pair のどちらかがあれば通す
- `--strict`: 各 pair の両方が必要

### fixture 除外 allowlist の仕組み

```ts
const FIXTURE_EXCLUSION_LIST = [
  "apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json",
];
```

glob や `__fixtures__` 一括除外は使わず、明示 allowlist のみを除外する。

### run-all-validations.js への統合パターン

```ts
const evalsOutput = execSync(
  `node ${evalsValidatorPath} --all-skills --check-dual-root --json`,
  { encoding: "utf-8", timeout: 30000 },
);
const evalsResult = JSON.parse(evalsOutput.trim());
results.push({
  script: "validate-evals.js",
  valid: evalsResult.summary.fail === 0,
  errors: [],
});
```

### exit code 一覧

| exit code | 意味                       |
| --------- | -------------------------- |
| 0         | 全検証 PASS                |
| 1         | L1/L2/L3 のいずれかが FAIL |

### エラーハンドリング

- allowlist 外の `--skill` は即座に exit 1
- directory 指定で `EVALS.json` が 0 件なら exit 1
- dual root ドリフト、ミラー欠損、破損 JSON はすべて exit 1

### 設定可能パラメータと定数

| 名前                     | 種別 | 用途                               |
| ------------------------ | ---- | ---------------------------------- |
| `SKILL_ALLOWLIST`        | 定数 | 一括検証対象 6 スキル              |
| `FIXTURE_EXCLUSION_LIST` | 定数 | 明示除外する fixture               |
| `DIALECT_PAIRS`          | 定数 | strict / permissive 判定対象       |
| `--all-skills`           | 引数 | allowlist 全件検証                 |
| `--skill <id>`           | 引数 | 単一スキル検証                     |
| `--path <file-or-dir>`   | 引数 | 単一ファイルまたはディレクトリ検証 |
| `--check-dual-root`      | 引数 | L3 比較を強制                      |
| `--strict`               | 引数 | 両方言必須                         |
| `--json`                 | 引数 | JSON 出力                          |
| `--verbose`              | 引数 | 詳細ログ                           |

### テスト構成

| ファイル                                   | 役割                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| `scripts/__tests__/validate-evals.test.js` | L1/L2/L3 / fixture / strict / directory path / run-all 統合 |
| `scripts/run-all-validations.js`           | validator 統合の実行面                                      |
| `outputs/phase-11/manual-test-result.md`   | CLI 実測証跡                                                |

### エッジケース

| ケース                           | 結果               |
| -------------------------------- | ------------------ |
| allowlist 外 skill               | exit 1             |
| directory 指定で EVALS.json 不在 | exit 1             |
| allowlist 外 fixture 風パス      | 除外されず通常検証 |
| strict で片方方言のみ            | exit 1             |
