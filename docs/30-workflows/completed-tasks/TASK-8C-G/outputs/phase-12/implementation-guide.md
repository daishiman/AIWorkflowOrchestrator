# TASK-8C-G 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### 境界値テストって何？

想像してください。遊園地のジェットコースターに「身長130cm以上の方のみ乗れます」というルールがあるとします。

- 身長131cmの人 → 乗れる（余裕あり）
- 身長130cmちょうどの人 → 乗れる？乗れない？
- 身長129cmの人 → 乗れない

この「130cmちょうど」のような、ルールの境目（境界）を重点的にテストするのが**境界値テスト**です。

### このタスクでやったこと

skill-creatorというツールが出力するファイルに対して、検証スクリプトが正しく動くかをテストしました。

**例えば:**

- スキルの名前は最大64文字 → 64文字ちょうどの名前を作って、ちゃんと通るかテスト
- スキルの説明は最低10文字 → 10文字ちょうどの説明を作って、テスト
- 禁止されているファイル（README.md）を入れたらエラーになるかテスト

### なぜ必要？

普通のテスト（名前が20文字の場合）は通っても、境界（64文字ちょうど）で壊れることがあります。バグは「普通の場合」より「特殊な場合」に潜んでいることが多いからです。

---

## Part 2: 技術的詳細

### 新規フィクスチャ（6種類）

| フィクスチャ           | 検証対象スクリプト          | 期待結果     | 対応ギャップ |
| ---------------------- | --------------------------- | ------------ | ------------ |
| boundary-skill/        | 全5スクリプト               | valid: true  | B1~B9, A7-A8 |
| missing-fields-skill/  | validate-skill-md.js        | valid: false | A2           |
| forbidden-files-skill/ | validate-skill-structure.js | valid: false | A1           |
| invalid-name-skill/    | validate-skill-md.js        | valid: false | A3           |
| empty-agents-skill/    | validate-agents.js          | valid: false | A4           |
| invalid-schema-skill/  | validate-schemas.js         | valid: false | A5           |

### boundary-skill/ ディレクトリ構造

```
boundary-skill/
├── SKILL.md                     # name: 64文字, description: 10文字
├── agents/
│   └── boundary-agent.md        # TASK_TITLE, STEPS, INPUTS, OUTPUTS
├── assets/
│   ├── chain-config.yaml        # steps: 2（最小値）
│   └── parallel-config.yaml     # tasks: 2（最小値）
└── schemas/
    └── boundary-schema.json     # $schema + type
```

### テストケース一覧（TC-063~TC-096）

#### Boundary Value Fixtures（12件: TC-063~TC-074）

name=64文字、description=10文字、version=semver、Anchors/Trigger、agents必須セクション、schema $schema/type、chain steps=2、parallel tasks=2、全スクリプト正常判定

#### Error Pattern Fixtures（8件: TC-075~TC-082）

missing-fields, forbidden-files, invalid-name, empty-agents, invalid-schema の各エラーパターン + エラーメッセージ具体性検証

#### Validation Script Edge Cases（8件: TC-083~TC-090）

4スクリプトの--target未指定（EXIT_CODE=2）、存在しないパス（EXIT_CODE=3）、run-all-validations.jsのagents/schemas/スキップ動作

#### Test Quality Improvements（6件: TC-091~TC-096）

parseFrontmatter による構造化検証、parseValidationOutput による JSON出力検証

### テストヘルパーAPI

| ヘルパー                | シグネチャ                                    | 用途             |
| ----------------------- | --------------------------------------------- | ---------------- |
| `parseValidationOutput` | `(stdout: string) => Record<string, unknown>` | JSON出力パース   |
| `getExitCode`           | `(command: string) => number`                 | EXIT_CODE取得    |
| `parseFrontmatter`      | `(content: string) => Record \| null`         | YAML Frontmatter |
| `fixturePath`           | `(...segments: string[]) => string`           | パス解決         |

### ギャップカバレッジマトリクス

全23件のギャップID（A1~A10, B1~B9, C1, D1~D3）がテストでカバー済み。カバレッジ100%。
