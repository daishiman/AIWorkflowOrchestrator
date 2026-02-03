# TASK-9B-A スコープ定義

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-A                   |
| Phase    | 1                           |
| 作成日   | 2026-02-03                  |
| タイトル | skill-creator SKILL.md 作成 |

## スコープ内（In Scope）

### 成果物

| 成果物   | パス                                          | 説明                   |
| -------- | --------------------------------------------- | ---------------------- |
| SKILL.md | `~/.aiworkflow/skills/skill-creator/SKILL.md` | スキル定義ファイル本体 |

### 実装内容

1. **YAML Frontmatter**
   - name: skill-creator
   - description: Anchors + Trigger を含む複数行説明
   - allowed-tools: 9ツールのリスト

2. **Markdown Body**
   - タイトルと概要
   - 12機能の詳細説明
   - サブエージェント参照（5つ）
   - 参照資料参照（4つ）
   - ベストプラクティス

### 検証範囲

- ファイル構造検証
- YAML Frontmatter 形式検証
- 必須要素（ツール・機能・参照）の存在検証
- 参照パスの形式検証

## スコープ外（Out of Scope）

### 別タスクで対応

| 項目                          | 対応タスク |
| ----------------------------- | ---------- |
| agents/hearing-facilitator.md | TASK-9B-B  |
| agents/task-generator.md      | TASK-9B-C  |
| agents/code-generator.md      | TASK-9B-D  |
| agents/api-integrator.md      | TASK-9B-D  |
| agents/validator.md           | TASK-9B-E  |
| references/\*.md              | TASK-9B-F  |
| SkillCreatorService.ts        | TASK-9B-G  |

### 本タスクでは行わない

- サブエージェントの実装
- 参照資料の実装
- TypeScript実装（SkillCreatorService）
- 既存skill-creatorからの機能移行
- SkillScannerでの実行テスト（手動確認のみ）

## 制約条件

| 制約           | 内容                                               |
| -------------- | -------------------------------------------------- |
| ファイルパス   | `~/.aiworkflow/skills/skill-creator/SKILL.md` 固定 |
| フォーマット   | YAML Frontmatter + Markdown Body                   |
| 行数制限       | 500行以内（NFR-001）                               |
| ツール数       | 9ツール（既存8 + WebFetch）                        |
| 機能数         | 12機能                                             |
| エージェント数 | 5つ以上                                            |
| 参照資料数     | 4つ以上                                            |

## 依存関係

### 前提条件

- `~/.aiworkflow/skills/` ディレクトリへの書き込み権限

### 依存タスク

| タスク  | 関係   | 影響                        |
| ------- | ------ | --------------------------- |
| TASK-7D | 依存先 | ChatPanel統合済み（UI基盤） |

### 後続タスク（本タスクがブロック）

| タスク    | 内容                             |
| --------- | -------------------------------- |
| TASK-9B-B | hearing-facilitator エージェント |
| TASK-9B-C | task-generator エージェント      |
| TASK-9B-D | code-generator エージェント      |
| TASK-9B-E | validator エージェント           |
| TASK-9B-F | 参照資料                         |
| TASK-9B-G | SkillCreatorService              |

## リスク

| リスク                    | 影響   | 対策                                     |
| ------------------------- | ------ | ---------------------------------------- |
| 参照パスの実ファイル不在  | Medium | 形式検証のみ、実ファイルは別タスクで作成 |
| 既存skill-creatorとの乖離 | Low    | 既存パターンを参照して設計               |
| 500行超過                 | Low    | 詳細をreferencesに分離する設計           |

## 作成日時

2026-02-03
