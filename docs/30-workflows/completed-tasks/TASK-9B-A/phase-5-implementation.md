# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 5                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

テストを通すための SKILL.md ファイルを作成する。

## 実行タスク

### Task 1: ディレクトリ作成

```bash
mkdir -p ~/.aiworkflow/skills/skill-creator
```

### Task 2: SKILL.md 作成

**ツール**: Write

**操作**: `~/.aiworkflow/skills/skill-creator/SKILL.md` を作成

**SKILL.md 完全仕様**:

```markdown
---
name: skill-creator
description: |
  スキルを対話的に作成・改善・実行するメタスキル。
  会話形式でニーズをヒアリングし、API連携やコード実行を含むスキルを生成できる。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語・Bounded Context / 目的: ドメイン構造明確化
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルール / 目的: 変更に強いスキル
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創

  Trigger:
  Use when creating new skills, updating existing skills, or improving prompts.
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt

allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - WebFetch
  - AskUserQuestion
---

# skill-creator

スキルを対話的に作成・改善・実行するメタスキル。
会話形式でニーズをヒアリングし、API連携やコード実行を含むスキルを生成できる。

## 機能

### 1. 対話的スキル作成 (`/skill-creator` または `/skill-creator chat`)

会話形式でスキルを作成します。

### 2. 外部API連携スキル (`/skill-creator api`)

REST API/Webhook連携スキルを生成します。

### 3. 既存スキル改善 (`/skill-creator improve`)

既存スキルを分析し、改善を提案・実行します。

### 4. タスク実行 (`/skill-creator execute`)

タスク仕様書に従ってタスクを自動実行します。

### 5. 即時使用 (`/skill-creator use`)

作成したスキルを即座に現在のセッションで使用します。

### 6. スキルチェーン作成 (`/skill-creator chain`)

複数のスキルをパイプラインとして連携させます。

### 7. スキルフォーク (`/skill-creator fork`)

既存スキルをベースに新しいスキルを作成します。

### 8. スキル共有 (`/skill-creator share`)

作成したスキルをGist/GitHubで共有、またはインポートします。

### 9. スケジュール設定 (`/skill-creator schedule`)

スキルの定期実行スケジュールを設定します。

### 10. デバッグ実行 (`/skill-creator debug`)

スキルをデバッグモードで実行します。

### 11. ドキュメント生成 (`/skill-creator docs`)

スキルのドキュメントを自動生成します。

### 12. 使用統計 (`/skill-creator stats`)

スキルの使用状況と分析を表示します。

## サブエージェント

- `agents/hearing-facilitator.md` - 対話的ヒアリング
- `agents/task-generator.md` - タスク仕様書生成
- `agents/code-generator.md` - コード生成
- `agents/api-integrator.md` - API連携コード生成
- `agents/validator.md` - 検証・テスト

## 参照資料

- `references/task-template.md` - タスク仕様書テンプレート
- `references/skill-structure.md` - スキル構造ガイド
- `references/api-patterns.md` - API連携パターン集
- `references/security-guide.md` - 認証・機密情報管理ガイド
```

### Task 3: テスト実行

```bash
# 検証スクリプト実行
bash outputs/phase-4/validate-skill-md.sh

# 全テストがパスすることを確認
```

## 参照資料

| 資料名            | パス                                                                      | 説明         |
| ----------------- | ------------------------------------------------------------------------- | ------------ |
| Phase 4成果物     | `outputs/phase-4/test-specification.md`                                   | テスト仕様   |
| 元タスク仕様      | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-a-skill-md.md` | SKILL.md仕様 |
| 既存skill-creator | `~/.claude/skills/skill-creator/SKILL.md`                                 | 参考実装     |

## 統合テスト連携【必須】

| 実装項目         | 内容                                          |
| ---------------- | --------------------------------------------- |
| ファイル作成     | `~/.aiworkflow/skills/skill-creator/SKILL.md` |
| フォーマット準拠 | YAML Frontmatter + Markdown Body              |
| スキャン対応     | SkillScanner で検出・パース可能               |

## アーキテクチャ層別実装

| 層               | 実装観点                       | 実装ファイル配置                              |
| ---------------- | ------------------------------ | --------------------------------------------- |
| ファイルシステム | スキルディレクトリ構造         | `~/.aiworkflow/skills/skill-creator/`         |
| スキル定義       | SKILL.md（Frontmatter + Body） | `~/.aiworkflow/skills/skill-creator/SKILL.md` |

## 成果物

| 成果物   | パス                                          | 説明           |
| -------- | --------------------------------------------- | -------------- |
| SKILL.md | `~/.aiworkflow/skills/skill-creator/SKILL.md` | スキル定義本体 |

## 完了条件

- [ ] ディレクトリ `~/.aiworkflow/skills/skill-creator/` が作成されている
- [ ] SKILL.md が作成されている
- [ ] YAML Frontmatter に name, description, allowed-tools が存在する
- [ ] allowed-tools に9つの必須ツールが含まれている
- [ ] 12の機能セクションが存在する
- [ ] サブエージェント参照が5つ以上存在する
- [ ] 参照資料参照が4つ以上存在する
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
bash outputs/phase-4/validate-skill-md.sh

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
