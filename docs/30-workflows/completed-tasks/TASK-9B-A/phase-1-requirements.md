# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

skill-creator スキルの SKILL.md ファイルに求められる要件を明確化する。

## 実行タスク

### Task 1: 要件抽出

ユーザー要求（TASK-9B-A仕様）から機能要件・非機能要件を抽出する。

**機能要件（FR）**:

| FR-ID  | 要件                                           | 優先度   |
| ------ | ---------------------------------------------- | -------- |
| FR-001 | SKILL.md がスキル構造仕様に準拠すること        | Critical |
| FR-002 | allowed-tools に必要な9ツールが定義されること  | Critical |
| FR-003 | 12の機能（コマンド）が記述されること           | Critical |
| FR-004 | サブエージェントへのパスが正しく設定されること | High     |
| FR-005 | 参照資料へのパスが正しく設定されること         | High     |
| FR-006 | YAML Frontmatterが仕様準拠であること           | Critical |
| FR-007 | description にAnchors/Triggerが含まれること    | High     |

**非機能要件（NFR）**:

| NFR-ID  | 要件                           | 優先度 |
| ------- | ------------------------------ | ------ |
| NFR-001 | SKILL.md は500行以内であること | Medium |
| NFR-002 | 可読性が高いこと               | Medium |
| NFR-003 | 既存パターンとの一貫性         | High   |

### Task 2: 受け入れ基準作成

| AC-ID  | 受け入れ基準                                                                                                       | 検証方法                |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| AC-001 | `~/.aiworkflow/skills/skill-creator/SKILL.md` が作成されている                                                     | `test -f`               |
| AC-002 | YAML Frontmatter に name, description, allowed-tools が存在する                                                    | `grep`                  |
| AC-003 | allowed-tools に Read, Write, Edit, Glob, Grep, Bash, Task, WebFetch, AskUserQuestion の9ツールが含まれる          | `grep -c`               |
| AC-004 | 12の機能セクション（chat, api, improve, execute, use, chain, fork, share, schedule, debug, docs, stats）が存在する | `grep`                  |
| AC-005 | agents/ ディレクトリへの参照パスが5つ以上存在する（カウント基準: `agents/` を含む行数）                            | `grep -c "agents/"`     |
| AC-006 | references/ ディレクトリへの参照パスが4つ以上存在する（カウント基準: `references/` を含む行数）                    | `grep -c "references/"` |

**Note**: allowed-tools は既存実装（8ツール）に WebFetch を追加した9ツール構成とする。API連携スキル機能（`/skill-creator api`）で外部API呼び出しが必要なため。

### Task 3: FR/NFR分類

上記で分類済み。

## 参照資料

| 資料名            | パス                                                                         | 説明                 |
| ----------------- | ---------------------------------------------------------------------------- | -------------------- |
| 元タスク仕様      | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-a-skill-md.md`    | タスク定義           |
| 親タスク仕様      | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-skill-creator.md` | 全体仕様             |
| スキル構造仕様    | `aiworkflow-requirements: claude-code-skills-structure.md`                   | SKILL.mdフォーマット |
| 既存skill-creator | `~/.claude/skills/skill-creator/SKILL.md`                                    | 参考実装             |

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                 |
| ---------------- | ---------------------------------------- |
| ファイルシステム | `~/.aiworkflow/skills/` への書き込み     |
| スキルスキャン   | 作成後、SkillScannerで検出可能であること |
| 構造検証         | skill-fixture-runnerで検証可能であること |

## アーキテクチャ層別要件

| 層               | 確認観点                              |
| ---------------- | ------------------------------------- |
| ファイルシステム | `~/.aiworkflow/skills/` パス構造      |
| スキル管理       | SkillScanner での検出・パース可能性   |
| フォーマット     | YAML Frontmatter + Markdown Body 構造 |

## 成果物

| 成果物       | パス                                         | 説明       |
| ------------ | -------------------------------------------- | ---------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲   |

## 完了条件

- [ ] 全機能要件（FR）が抽出されている
- [ ] 全非機能要件（NFR）が抽出されている
- [ ] 各要件に受け入れ基準（AC）がある
- [ ] FR/NFRが優先度付きで分類されている
- [ ] 参照資料が特定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
