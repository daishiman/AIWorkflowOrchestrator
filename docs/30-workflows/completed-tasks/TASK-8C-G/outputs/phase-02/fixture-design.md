# Phase 2: フィクスチャ設計書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 2          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 新規フィクスチャ設計（6種類）

### 1. boundary-skill/（境界値テスト用）

```
boundary-skill/
├── SKILL.md                     # name: 64文字, description: 10文字, version: semver
├── agents/
│   └── boundary-agent.md        # REQUIRED_SECTIONS全て含む
├── assets/
│   ├── chain-config.yaml        # steps: 2（最小値）
│   └── parallel-config.yaml     # tasks: 2（最小値）
└── schemas/
    └── boundary-schema.json     # $schema + type 含む有効スキーマ
```

**SKILL.md設計:**

| フィールド    | 値                                                                                   |
| ------------- | ------------------------------------------------------------------------------------ |
| name          | `boundary-test-skill-with-exactly-sixty-four-characters-in-name` (64文字 kebab-case) |
| description   | `Boundary.` (10文字)                                                                 |
| version       | `1.0.0`                                                                              |
| allowed-tools | `[Read, Write, Bash]`                                                                |
| body          | `## Anchors` + `## Trigger` セクション含む                                           |

**agents/boundary-agent.md設計:**

- `TASK_TITLE`, `STEPS`, `INPUTS`, `OUTPUTS` の4必須セクション全て含む
- 最小限の内容で構成

**assets/chain-config.yaml設計:**

- `steps:` 配列に2エントリ（step-1, step-2）
- `error_handling:` 含む

**assets/parallel-config.yaml設計:**

- `tasks:` 配列に2エントリ（task-1, task-2）
- `result_aggregation:` 含む

**schemas/boundary-schema.json設計:**

- `$schema`: `http://json-schema.org/draft-07/schema#`
- `type`: `object`
- 最小限の `properties` 定義

### 2. missing-fields-skill/（必須フィールド欠落用）

```
missing-fields-skill/
└── SKILL.md    # nameなし、descriptionなし
```

**SKILL.md設計:**

- Frontmatterブロックは存在するがname/descriptionが欠落
- `allowed-tools` のみ記載

### 3. forbidden-files-skill/（禁止ファイル検出用）

```
forbidden-files-skill/
├── SKILL.md    # 有効なFrontmatter
└── README.md   # FORBIDDEN_FILESに該当
```

**SKILL.md設計:**

- 有効なname, description, allowed-tools
- 検証パス可能な正常内容

**README.md:**

- 禁止ファイル検出テスト用ダミーコンテンツ

### 4. invalid-name-skill/（名前フォーマット違反用）

```
invalid-name-skill/
└── SKILL.md    # name: Invalid_Name_With_Uppercase
```

**SKILL.md設計:**

- `name`: `Invalid_Name_With_Uppercase` （非kebab-case）
- 他フィールドは有効

### 5. empty-agents-skill/（空agentsディレクトリ用）

```
empty-agents-skill/
├── SKILL.md        # 有効なFrontmatter
└── agents/
    └── .gitkeep    # 空ディレクトリ保持
```

**SKILL.md設計:**

- 有効なname, description, allowed-tools
- agents/ディレクトリは存在するが.mdファイルなし

### 6. invalid-schema-skill/（不正スキーマ用）

```
invalid-schema-skill/
├── SKILL.md                    # 有効なFrontmatter
└── schemas/
    └── invalid-schema.json     # $schemaなし、typeなし
```

**schemas/invalid-schema.json設計:**

- `$schema` プロパティなし
- `type` プロパティなし
- 有効なJSONだが不正なJSON Schema

## テストヘルパー設計

| ヘルパー関数            | 引数              | 戻り値                    | 用途                             |
| ----------------------- | ----------------- | ------------------------- | -------------------------------- |
| `parseValidationOutput` | `stdout: string`  | `Record<string, unknown>` | JSON出力のパース                 |
| `getExitCode`           | `command: string` | `number`                  | EXIT_CODEの取得                  |
| `fixtureDir`            | `name: string`    | `string`                  | フィクスチャディレクトリパス解決 |

**注**: `parseFrontmatter` と `fixturePath` は既存ヘルパーを活用。
