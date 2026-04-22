# validate-evals.js インターフェース設計

## ファイルパス

- `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`（新設）
- `.agents/skills/skill-fixture-runner/scripts/validate-evals.js`（ミラー）

## CLI インターフェース（正本）

```
node validate-evals.js [options]

Options:
  --all-skills             allowlist 6 件を一括検証
  --skill <id>             特定スキルのみ検証
  --path <file-or-dir>     単一ファイルまたは fixture ディレクトリを検証対象として指定
  --check-dual-root        L3（dual root 比較）を強制実行
  --check-excluded         除外対象が除外されることを検査する監査モード
  --strict                 strict モード（両方言必須、デフォルト: 両方言許容）
  --json                   結果を JSON 形式で出力（デフォルト: テキスト）
  --verbose                詳細ログを出力
```

## 終了コード

| コード | 意味                                 |
| ------ | ------------------------------------ |
| 0      | 全 EVALS.json が PASS                |
| 1      | 1 件以上が FAIL                      |
| 2      | スクリプト自体のエラー（I/O 失敗等） |

## テキスト出力フォーマット

```
[EVALS Validator] 開始: 12 件を検証

✓ .claude/skills/aiworkflow-requirements/EVALS.json (L1+L2+L3)
✗ .claude/skills/github-issue-manager/EVALS.json
  L2: 必須フィールド不足: skillName / skill_name のいずれも存在しない

[EVALS Validator] 結果: 11/12 PASS, 1/12 FAIL
```

## スキル allowlist

```js
const SKILL_ALLOWLIST = [
  "aiworkflow-requirements",
  "github-issue-manager",
  "int-test-skill",
  "skill-creator",
  "skill-fixture-runner",
  "task-specification-creator",
];
```

## 方言フィールド対応表

| camelCase    | snake_case    | 検証方法                             |
| ------------ | ------------- | ------------------------------------ |
| skillName    | skill_name    | どちらか一方存在でOK（方言自動検出） |
| currentLevel | current_level | 検出方言に対応するキーが存在でOK     |
| metrics      | metrics       | 方言非依存、単独必須                 |
