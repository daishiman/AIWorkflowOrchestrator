# TASK-8C-F 実装ガイド: Skill-Creator テスト用フィクスチャ & 実行スキル

## Part 1: 初学者向け説明

### テスト用フィクスチャって何？

テスト用フィクスチャは、「新しいクッキー型（skill-creator）がちゃんと動くかチェックするための"お試し生地セット"」のようなものです。

完璧な生地、最小限の生地、わざと失敗する生地を用意して、クッキー型がそれぞれに対して正しく動くか確かめます。

### なぜ必要なの？

skill-creator は「新しいスキル（AIアシスタントの能力）」を自動で作るツールです。新しいスキルを作るとき、ちゃんとした構造で作れているか自動的にチェックする仕組みが必要です。

人間が毎回目で確認するのは大変なので、「こういう形であるべき」というお手本（フィクスチャ）を用意し、自動でチェックできるようにしました。

### 何を用意したの？

5種類の「お試し生地セット」を用意しました:

1. **完全な生地（complete-skill）**: 全ての材料が揃った完璧なスキル。「正しいものはこうだ」という基準
2. **最小限の生地（minimal-skill）**: 一番シンプルな形。設定ファイル1つだけ
3. **部分的な生地（partial-skill）**: 一部の材料だけがある状態
4. **わざと壊した生地（invalid-skill）**: エラーが起きるようにわざと間違えたもの。「こういう場合はエラーになるべき」というチェック用
5. **オーケストレーション生地（orchestration-skill）**: 複数のスキルを連携させる設定付き

### 検証スクリプトとは？

「自動採点機」のようなものです。スキルの構造を自動でチェックして、合格・不合格を教えてくれます。

- フォルダの構造が正しいかチェック
- 設定ファイルが読めるかチェック
- エージェント仕様書が正しい形式かチェック
- JSONスキーマが正しいかチェック
- 上の全部をまとめて一気にチェック

結果は「合格（valid: true）」か「不合格（valid: false）+ 理由」で返ってきます。

---

## Part 2: 開発者向け技術ガイド

### フィクスチャ構造

```
apps/desktop/src/__tests__/__fixtures__/skill-creator/
├── complete-skill/          # 全ディレクトリを含む完全スキル
│   ├── SKILL.md             # Frontmatter: name, description, version, allowed-tools
│   ├── package.json         # @skills/fixture-complete-skill
│   ├── EVALS.json           # skill_name, current_level, metrics
│   ├── agents/              # エージェント仕様書
│   │   ├── analyze-request.md
│   │   └── generate-code.md
│   ├── references/          # 参照ガイド
│   │   ├── overview.md
│   │   └── quality-standards.md
│   ├── scripts/             # スクリプト
│   │   ├── utils.js         # EXIT_CODES, getArg(), resolvePath()
│   │   └── validate_all.js
│   ├── assets/              # テンプレート
│   │   └── skill-template.md
│   └── schemas/             # JSONスキーマ
│       └── agent-definition.json
├── minimal-skill/           # SKILL.mdのみ
│   └── SKILL.md
├── partial-skill/           # SKILL.md + agents/
│   ├── SKILL.md
│   └── agents/
│       └── single-agent.md
├── invalid-skill/           # 不正YAML
│   └── SKILL.md
└── orchestration-skill/     # YAML設定付き
    ├── SKILL.md
    └── assets/
        ├── chain-config.yaml
        └── parallel-config.yaml
```

### skill-creator との対応マッピング

| skill-creator コンポーネント  | フィクスチャ対応                                |
| ----------------------------- | ----------------------------------------------- |
| assets/skill-template.md      | complete-skill/SKILL.md                         |
| assets/agent-template.md      | complete-skill/agents/\*.md                     |
| schemas/agent-definition.json | complete-skill/schemas/agent-definition.json    |
| scripts/utils.js (EXIT_CODES) | complete-skill/scripts/utils.js                 |
| assets/chain-template.yaml    | orchestration-skill/assets/chain-config.yaml    |
| assets/parallel-template.yaml | orchestration-skill/assets/parallel-config.yaml |

### 検証スクリプト API

全スクリプトは `.claude/skills/skill-fixture-runner/scripts/` に配置。

| スクリプト                  | 入力              | 出力                                                         |
| --------------------------- | ----------------- | ------------------------------------------------------------ |
| validate-skill-structure.js | `--target <dir>`  | `{ valid, errors, structure: { directories, files } }`       |
| validate-skill-md.js        | `--target <file>` | `{ valid, errors, frontmatter, body: { headings } }`         |
| validate-agents.js          | `--target <dir>`  | `{ valid, errors, agents: [{ name, hasRequiredSections }] }` |
| validate-schemas.js         | `--target <dir>`  | `{ valid, errors, schemas: [{ name, isValidJsonSchema }] }`  |
| run-all-validations.js      | `--target <dir>`  | `{ overall, results: [{ script, valid, errors }] }`          |

EXIT_CODES: SUCCESS=0, ERROR=1, ARGS_ERROR=2, FILE_NOT_FOUND=3, VALIDATION_FAILED=4

### テスト実行

```bash
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts
```

62テストケース（TC-001〜TC-062）が実行される。

### skill-fixture-runner スキルの使い方

```bash
# complete-skill を全検証
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
  --target apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill

# SKILL.md のみ検証
node .claude/skills/skill-fixture-runner/scripts/validate-skill-md.js \
  --target apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/SKILL.md
```

### 拡張方法

新しいフィクスチャ種別を追加する場合:

1. `apps/desktop/src/__tests__/__fixtures__/skill-creator/<new-skill>/` にフィクスチャファイルを配置
2. `skill-creator.fixture.test.ts` に新しい describe ブロックとテストケースを追加
3. 必要に応じて検証スクリプトのロジックを拡張

### 注意事項

- **TASK-8C-E との違い**: TASK-8C-E のフィクスチャは SkillScanner E2E テスト用（`__fixtures__/skills/`）。TASK-8C-F のフィクスチャは skill-creator 出力検証用（`__fixtures__/skill-creator/`）
- 検証スクリプトは ESM モジュール形式（`import` 構文）
- invalid-skill の YAML エラーは意図的設計（`allowed-tools: not-an-array`）
