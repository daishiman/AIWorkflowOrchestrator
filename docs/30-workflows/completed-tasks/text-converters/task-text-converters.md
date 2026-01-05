# テキスト系コンバーター実装 - タスク実行仕様書

## ユーザーからの元の指示

```
@docs/30-workflows/unassigned-task/task-02-02-text-converters.md これを実装するために、次のプロンプトに従ってタスク仕様書を作成してください。タスクの実行に関しては、勝手に進めずにタスクの仕様書を作成するだけでOKです。今回やってといった内容以外に関しては、勝手に進めないようにしておいてください。 @docs/00-requirements/task-orchestration-specification.md
```

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | CONV-02-02                                           |
| Worktreeパス | `.worktrees/task-$(date +%s)-$(openssl rand -hex 4)` |
| ブランチ名   | `task-$(date +%s)-$(openssl rand -hex 4)`            |
| タスク名     | テキスト系コンバーター実装                           |
| 分類         | 新規機能実装                                         |
| 対象機能     | RAGファイル変換システム                              |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 作成日       | 2025-12-24                                           |

---

## タスク概要

### 目的

RAGシステムにおいて、プレーンテキスト、HTML、CSV/TSV、JSONの各種テキスト系ファイルを処理可能なコンバーターを実装し、ファイル変換基盤を完成させる。これにより、多様なテキスト形式のドキュメントをRAGシステムで扱えるようにする。

### 背景

CONV-02-01でファイル変換基盤（BaseConverter、ConverterRegistry、MetadataExtractor等）が実装済み。この基盤を活用し、実際のファイル形式に対応するコンバーターを実装する必要がある。テキスト系ファイルは最も基本的かつ利用頻度の高い形式であり、RAGシステムの機能として優先的に対応すべきである。

### 最終ゴール

- PlainTextConverter、HTMLConverter、CSVConverter、JSONConverterの4つのコンバーターが正常に動作する
- 各コンバーターがBaseConverterを継承し、統一されたインターフェースで変換を実行できる
- グローバルレジストリへの登録処理が実装され、システムから利用可能な状態となる
- 単体テストが完備され、品質が保証されている
- 次フェーズ（チャンキング戦略実装）に進める準備が整っている

### 成果物一覧

| 種別         | 成果物                   | 配置先                                                                       |
| ------------ | ------------------------ | ---------------------------------------------------------------------------- |
| 環境         | Git Worktree環境         | `.worktrees/task-$(date +%s)-$(openssl rand -hex 4)`                         |
| 機能         | PlainTextConverter       | `packages/shared/src/services/conversion/converters/plain-text-converter.ts` |
| 機能         | HTMLConverter            | `packages/shared/src/services/conversion/converters/html-converter.ts`       |
| 機能         | CSVConverter             | `packages/shared/src/services/conversion/converters/csv-converter.ts`        |
| 機能         | JSONConverter            | `packages/shared/src/services/conversion/converters/json-converter.ts`       |
| 機能         | コンバーター登録処理     | `packages/shared/src/services/conversion/converters/index.ts`                |
| テスト       | 各コンバーター単体テスト | `packages/shared/src/services/conversion/converters/__tests__/`              |
| ドキュメント | 更新済みシステム要件     | `docs/00-requirements/`                                                      |
| PR           | GitHub Pull Request      | GitHub UI                                                                    |

---

## 参照ファイル

本仕様書のコマンド・エージェント・スキル選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.claude/agents/agent_list.md` - エージェント定義
- `.claude/skills/skill_list.md` - スキル定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                 | 責務                                   | 依存   |
| ------ | -------- | ---------------------------- | -------------------------------------- | ------ |
| T--1-1 | Phase -1 | Git Worktree環境作成         | Worktree作成・初期化                   | なし   |
| T-00-1 | Phase 0  | 要件定義                     | コンバーター実装要件の明確化           | T--1-1 |
| T-01-1 | Phase 1  | 全体アーキテクチャ設計       | コンバーター全体の設計方針策定         | T-00-1 |
| T-01-2 | Phase 1  | PlainTextConverter設計       | プレーンテキスト変換の詳細設計         | T-01-1 |
| T-01-3 | Phase 1  | HTMLConverter設計            | HTML→Markdown変換の詳細設計            | T-01-1 |
| T-01-4 | Phase 1  | CSVConverter設計             | CSV/TSV→Markdownテーブル変換の詳細設計 | T-01-1 |
| T-01-5 | Phase 1  | JSONConverter設計            | JSON→読みやすいテキスト変換の詳細設計  | T-01-1 |
| T-02-1 | Phase 2  | 設計レビュー                 | 全設計の妥当性検証                     | T-01-5 |
| T-03-1 | Phase 3  | PlainTextConverterテスト作成 | PlainTextConverterのテスト実装         | T-02-1 |
| T-03-2 | Phase 3  | HTMLConverterテスト作成      | HTMLConverterのテスト実装              | T-02-1 |
| T-03-3 | Phase 3  | CSVConverterテスト作成       | CSVConverterのテスト実装               | T-02-1 |
| T-03-4 | Phase 3  | JSONConverterテスト作成      | JSONConverterのテスト実装              | T-02-1 |
| T-04-1 | Phase 4  | PlainTextConverter実装       | PlainTextConverter本体実装             | T-03-1 |
| T-04-2 | Phase 4  | HTMLConverter実装            | HTMLConverter本体実装                  | T-03-2 |
| T-04-3 | Phase 4  | CSVConverter実装             | CSVConverter本体実装                   | T-03-3 |
| T-04-4 | Phase 4  | JSONConverter実装            | JSONConverter本体実装                  | T-03-4 |
| T-04-5 | Phase 4  | コンバーター登録実装         | グローバルレジストリ登録処理実装       | T-04-4 |
| T-05-1 | Phase 5  | コード品質改善               | リファクタリング・最適化               | T-04-5 |
| T-06-1 | Phase 6  | 品質保証                     | 全テスト実行・品質チェック             | T-05-1 |
| T-07-1 | Phase 7  | 最終レビュー                 | 実装全体の最終検証                     | T-06-1 |
| T-08-1 | Phase 8  | 手動テスト                   | 実際のファイルでの動作確認             | T-07-1 |
| T-09-1 | Phase 9  | ドキュメント更新             | システム要件ドキュメント更新           | T-08-1 |
| T-10-1 | Phase 10 | PR作成・CI確認               | PR作成とCI完了確認                     | T-09-1 |

**総サブタスク数**: 23個

---

## 実行フロー図

```mermaid
graph TD
    START[タスク開始] --> T--1[Phase -1: 環境準備]
    T--1 --> T-00[Phase 0: 要件定義]
    T-00 --> T-01[Phase 1: 設計]
    T-01 --> T-02[Phase 2: 設計レビューゲート]
    T-02 --> T-03[Phase 3: テスト作成]
    T-03 --> T-04[Phase 4: 実装]
    T-04 --> T-05[Phase 5: リファクタリング]
    T-05 --> T-06[Phase 6: 品質保証]
    T-06 --> T-07[Phase 7: 最終レビューゲート]
    T-07 --> T-08[Phase 8: 手動テスト]
    T-08 --> T-09[Phase 9: ドキュメント更新]
    T-09 --> T-10[Phase 10: PR作成・CI確認]
    T-10 --> END[マージ準備完了]

    T-02 -->|MAJOR| T-01
    T-02 -->|MAJOR: 要件| T-00
    T-07 -->|MAJOR| T-05
    T-07 -->|MAJOR: 実装| T-04
    T-07 -->|MAJOR: テスト| T-03
    T-07 -->|MAJOR: 設計| T-01
    T-07 -->|CRITICAL| T-00
```

---

## Phase -1: 環境準備（Git Worktree作成）

### T--1-1: Git Worktree環境作成・初期化

#### 目的

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

#### 背景

複数タスクの並行開発や実験的な変更のため、各タスクごとに独立したWorktreeで作業を行う必要がある。これにより、本体ブランチを保護し、タスク間の干渉を防ぐ。

#### 責務（単一責務）

Git Worktree環境の作成と初期化のみを担当する。

#### 実行手順

**1. タスク識別子の生成**

```bash
TASK_ID="task-$(date +%s)-$(openssl rand -hex 4)"
echo "Generated Task ID: $TASK_ID"
```

**2. Git Worktreeの作成**

```bash
WORKTREE_PATH=".worktrees/$TASK_ID"
git worktree add "$WORKTREE_PATH" -b "$TASK_ID"
```

**3. Worktreeディレクトリへ移動**

```bash
cd "$WORKTREE_PATH"
pwd  # 現在のディレクトリを確認
```

**4. 環境確認**

```bash
# ブランチ確認
git branch --show-current

# Git状態確認
git status

# 依存関係インストール
pnpm install

# ビルド確認
pnpm --filter @repo/shared build
```

#### 使用エージェント

- **エージェント**: なし（Bashコマンド直接実行）
- **選定理由**: 定型的なGit操作のためエージェント不要

#### 成果物

| 成果物           | パス                                 | 内容                             |
| ---------------- | ------------------------------------ | -------------------------------- |
| Git Worktree環境 | `.worktrees/task-{timestamp}-{hash}` | 独立した作業ディレクトリ         |
| 新規ブランチ     | `task-{timestamp}-{hash}`            | タスク専用ブランチ               |
| 初期化済み環境   | -                                    | 依存関係インストール・ビルド完了 |

#### 完了条件

- [ ] Git Worktreeが正常に作成されている
- [ ] 新規ブランチが作成されている（`git branch --show-current`で確認）
- [ ] Worktreeディレクトリへ移動済み
- [ ] 依存関係がインストールされている（`node_modules/`が存在）
- [ ] ビルドが成功する（`pnpm --filter @repo/shared build`が成功）
- [ ] Git状態がクリーンである（`git status`で未コミット変更なし）

#### 依存関係

- **前提**: なし（最初のフェーズ）
- **後続**: Phase 0（要件定義）

---

## Phase 0: 要件定義

### T-00-1: コンバーター実装要件の明確化

#### 目的

PlainTextConverter、HTMLConverter、CSVConverter、JSONConverterの実装要件を明確化し、各コンバーターの責務とインターフェースを定義する。

#### 背景

CONV-02-01で基盤が整備されたため、実際のファイル形式に対応するコンバーターの実装が必要。各コンバーターは単一責務の原則に基づき、特定のMIMEタイプのみを処理する。

#### 責務（単一責務）

4つのテキスト系コンバーターの実装要件の定義のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:gather-requirements text-converters
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 要求工学の権威カール・ウィーガースの思想に基づき、曖昧な要望を検証可能な要件に変換する専門エージェント。テキスト系コンバーターの要件を機能要件・非機能要件に分解し、受け入れ基準を明確化する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                                         | 活用方法                         |
| ---------------------------------------------------------------- | -------------------------------- |
| `.claude/skills/functional-non-functional-requirements/SKILL.md` | 機能要件と非機能要件の明確な分離 |
| `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 検証可能な受け入れ基準の作成     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                                | 内容                                               |
| -------------------- | --------------------------------------------------- | -------------------------------------------------- |
| 要件定義ドキュメント | `docs/30-workflows/text-converters/requirements.md` | 各コンバーターの機能要件・非機能要件・受け入れ基準 |

#### 完了条件

- [ ] 各コンバーターの目的と責務が明確に定義されている
- [ ] サポートするMIMEタイプがリストアップされている
- [ ] 変換前後のフォーマットが明記されている
- [ ] 非機能要件（パフォーマンス、エラーハンドリング等）が定義されている
- [ ] 検証可能な受け入れ基準が記載されている
- [ ] BaseConverterインターフェースとの整合性が確認されている

#### 依存関係

- **前提**: T--1-1（Git Worktree環境作成）
- **後続**: Phase 1（設計）

---

## Phase 1: 設計

### T-01-1: 全体アーキテクチャ設計

#### 目的

4つのコンバーターを統一的に設計し、共通の設計方針とベストプラクティスを確立する。

#### 背景

各コンバーターが独立して実装されるが、全体として一貫性のあるアーキテクチャを保つ必要がある。BaseConverterの継承方針、メタデータ抽出戦略、エラーハンドリングパターンを統一する。

#### 責務（単一責務）

コンバーター全体のアーキテクチャ設計方針の策定のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:design-architecture text-converters clean-architecture
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: クリーンアーキテクチャ提唱者Uncle Bobの思想に基づき、依存関係のルールを守り、保守性を維持する専門エージェント。コンバーター実装におけるレイヤー分離と依存方向を監視する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                                | 活用方法                           |
| ------------------------------------------------------- | ---------------------------------- |
| `.claude/skills/clean-architecture-principles/SKILL.md` | 依存関係ルール、レイヤー構造の適用 |
| `.claude/skills/solid-principles/SKILL.md`              | 単一責務の原則（SRP）の適用        |
| `.claude/skills/architectural-patterns/SKILL.md`        | テンプレートメソッドパターンの活用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                                       | 内容                           |
| -------------------- | ---------------------------------------------------------- | ------------------------------ |
| アーキテクチャ設計書 | `docs/30-workflows/text-converters/architecture-design.md` | 全体方針、クラス図、依存関係図 |

#### 完了条件

- [ ] BaseConverterのテンプレートメソッドパターンの活用方針が明確
- [ ] 各コンバーターの責務分離が明記されている
- [ ] メタデータ抽出の共通戦略が定義されている
- [ ] エラーハンドリングパターンが統一されている
- [ ] クラス図と依存関係図が作成されている
- [ ] クリーンアーキテクチャ原則への準拠が確認されている

#### 依存関係

- **前提**: T-00-1（要件定義）
- **後続**: T-01-2～T-01-5（各コンバーター詳細設計）

---

### T-01-2: PlainTextConverter設計

#### 目的

プレーンテキストファイルの変換処理の詳細設計を行う。

#### 背景

最もシンプルなコンバーターだが、BOM除去、改行コード統一、空白処理など、細かな正規化処理が必要。

#### 責務（単一責務）

PlainTextConverterの詳細設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:write-spec PlainTextConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: 『達人プログラマー』著者アンドリュー・ハントの思想に基づき、実装者が迷わない正本としてのドキュメント作成を行う専門エージェント。PlainTextConverterの詳細仕様を記述する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法         |
| ---------------------------------------------- | ---------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い設計 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                   | パス                                                               | 内容                                   |
| ------------------------ | ------------------------------------------------------------------ | -------------------------------------- |
| PlainTextConverter設計書 | `docs/30-workflows/text-converters/plain-text-converter-design.md` | クラス構造、メソッド仕様、テストケース |

#### 完了条件

- [ ] サポートするMIMEタイプ（text/plain）が明記されている
- [ ] テキスト正規化処理（BOM除去、改行統一、空白処理）の詳細が記載されている
- [ ] メタデータ抽出処理の詳細が記載されている
- [ ] エラーケースと対処方法が明記されている
- [ ] テストケースが設計されている

#### 依存関係

- **前提**: T-01-1（全体アーキテクチャ設計）
- **後続**: T-03-1（PlainTextConverterテスト作成）

---

### T-01-3: HTMLConverter設計

#### 目的

HTMLファイルをMarkdown形式のテキストに変換する処理の詳細設計を行う。

#### 背景

HTMLタグの除去、Markdown形式への変換、エンティティデコード、スクリプト/スタイル除去など、複雑な変換処理が必要。

#### 責務（単一責務）

HTMLConverterの詳細設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:write-spec HTMLConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: HTMLからMarkdownへの変換ルールの詳細仕様を記述する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                           | 活用方法                   |
| -------------------------------------------------- | -------------------------- |
| `.claude/skills/clean-code-practices/SKILL.md`     | 可読性の高い設計           |
| `.claude/skills/markdown-advanced-syntax/SKILL.md` | Markdown形式への適切な変換 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                         | 内容                                 |
| ------------------- | ------------------------------------------------------------ | ------------------------------------ |
| HTMLConverter設計書 | `docs/30-workflows/text-converters/html-converter-design.md` | 変換ルール、クラス構造、メソッド仕様 |

#### 完了条件

- [ ] サポートするMIMEタイプ（text/html）が明記されている
- [ ] HTMLタグからMarkdown形式への変換ルールが詳細に記載されている
- [ ] script/styleタグの除去方法が明記されている
- [ ] HTMLエンティティデコード処理が設計されている
- [ ] タイトル・リンク抽出処理の詳細が記載されている
- [ ] テストケースが設計されている

#### 依存関係

- **前提**: T-01-1（全体アーキテクチャ設計）
- **後続**: T-03-2（HTMLConverterテスト作成）

---

### T-01-4: CSVConverter設計

#### 目的

CSV/TSVファイルをMarkdownテーブル形式に変換する処理の詳細設計を行う。

#### 背景

CSV/TSVのパース処理（ダブルクォート対応、エスケープ処理）とMarkdownテーブル生成が必要。

#### 責務（単一責務）

CSVConverterの詳細設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:write-spec CSVConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: CSV/TSVパース処理とMarkdownテーブル生成の詳細仕様を記述する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                           | 活用方法                     |
| -------------------------------------------------- | ---------------------------- |
| `.claude/skills/clean-code-practices/SKILL.md`     | 可読性の高い設計             |
| `.claude/skills/markdown-advanced-syntax/SKILL.md` | Markdownテーブル形式への変換 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物             | パス                                                        | 内容                                   |
| ------------------ | ----------------------------------------------------------- | -------------------------------------- |
| CSVConverter設計書 | `docs/30-workflows/text-converters/csv-converter-design.md` | パースロジック、変換ルール、クラス構造 |

#### 完了条件

- [ ] サポートするMIMEタイプ（text/csv、text/tab-separated-values）が明記されている
- [ ] CSVパース処理（ダブルクォート、エスケープ）の詳細が記載されている
- [ ] Markdownテーブル生成ロジックが設計されている
- [ ] 列数の不一致処理が明記されている
- [ ] メタデータ（行数、列数等）の抽出方法が記載されている
- [ ] テストケースが設計されている

#### 依存関係

- **前提**: T-01-1（全体アーキテクチャ設計）
- **後続**: T-03-3（CSVConverterテスト作成）

---

### T-01-5: JSONConverter設計

#### 目的

JSONファイルを読みやすいテキスト形式に変換する処理の詳細設計を行う。

#### 背景

JSONをそのまま保存するのではなく、RAG処理しやすい人間可読なテキスト形式に変換する必要がある。

#### 責務（単一責務）

JSONConverterの詳細設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:write-spec JSONConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: JSON構造の人間可読テキスト変換ロジックの詳細仕様を記述する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法         |
| ---------------------------------------------- | ---------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い設計 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                         | 内容                                   |
| ------------------- | ------------------------------------------------------------ | -------------------------------------- |
| JSONConverter設計書 | `docs/30-workflows/text-converters/json-converter-design.md` | 変換ロジック、クラス構造、メソッド仕様 |

#### 完了条件

- [ ] サポートするMIMEタイプ（application/json）が明記されている
- [ ] JSON→読みやすいテキスト変換ロジックの詳細が記載されている
- [ ] ネストされたオブジェクト/配列の処理方法が明記されている
- [ ] トップレベルキー抽出処理が設計されている
- [ ] メタデータ（キー数、型等）の抽出方法が記載されている
- [ ] テストケースが設計されている

#### 依存関係

- **前提**: T-01-1（全体アーキテクチャ設計）
- **後続**: Phase 2（設計レビューゲート）

---

## Phase 2: 設計レビューゲート

### T-02-1: 設計レビュー

#### 目的

実装開始前に全設計の妥当性を複数エージェントで検証し、問題を早期発見する。

#### 背景

設計ミスが実装後に発見されると修正コストが大幅に増加する。「Shift Left」原則に基づき、問題を可能な限り早期に検出する。

#### 責務（単一責務）

設計の妥当性検証のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:review-architecture text-converters
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビュー観点と使用エージェント

##### 要件充足性

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 要求工学の専門家として、設計が要件を満たしているかを検証する。
- **チェック項目**:
  - [ ] 要件が明確かつ検証可能か
  - [ ] スコープが適切に定義されているか
  - [ ] 受け入れ基準が具体的か

##### アーキテクチャ整合性

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: クリーンアーキテクチャの監視役として、レイヤー違反やDIP違反を検出する。
- **チェック項目**:
  - [ ] クリーンアーキテクチャのレイヤー違反がないか
  - [ ] 依存関係逆転の原則(DIP)が守られているか
  - [ ] BaseConverterの継承が適切か

##### コード品質

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: 設計段階でのコード品質方針を検証する。
- **チェック項目**:
  - [ ] SOLID原則への準拠
  - [ ] 可読性・保守性の確保
  - [ ] 適切なエラーハンドリング設計

#### レビュー結果判定

- **PASS**: 全レビュー観点で問題なし → Phase 3へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 3へ進行
- **MAJOR**: 重大な問題あり → 影響範囲に応じて戻り先を決定
  - 要件の問題: Phase 0へ戻る
  - 設計の問題: Phase 1へ戻る

#### 成果物

| 成果物               | パス                                                        | 内容                             |
| -------------------- | ----------------------------------------------------------- | -------------------------------- |
| 設計レビューレポート | `docs/30-workflows/text-converters/design-review-report.md` | レビュー結果、指摘事項、対応方針 |

#### 完了条件

- [ ] 全レビュー観点でチェックが完了している
- [ ] 発見された問題が記録されている
- [ ] 対応方針が明確になっている
- [ ] PASS判定、またはMINOR指摘の対応が完了している

#### 依存関係

- **前提**: T-01-5（JSONConverter設計）
- **後続**: Phase 3（テスト作成）

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: PlainTextConverterテスト作成

#### 目的

PlainTextConverterの期待される動作を検証するテストを実装より先に作成する。

#### 背景

TDD（テスト駆動開発）に基づき、実装前にテストを作成することで、仕様を明確化し、品質を担保する。

#### 責務（単一責務）

PlainTextConverterのテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:generate-unit-tests PlainTextConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: ユニットテストの専門家として、PlainTextConverterの全エッジケースをカバーするテストを作成する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                          | 活用方法                   |
| ------------------------------------------------- | -------------------------- |
| `.claude/skills/tdd-principles/SKILL.md`          | TDDサイクルの適用          |
| `.claude/skills/test-doubles/SKILL.md`            | モック・スタブの適切な使用 |
| `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テストケースの設計   |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                   | パス                                                                                        | 内容               |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------ |
| PlainTextConverterテスト | `packages/shared/src/services/conversion/converters/__tests__/plain-text-converter.test.ts` | ユニットテスト実装 |

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test plain-text-converter.test.ts
```

#### 完了条件

- [ ] 正常系テストが作成されている
- [ ] 異常系テストが作成されている
- [ ] 境界値テストが作成されている
- [ ] BOM除去、改行統一、空白処理のテストがある
- [ ] テスト実行でRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビュー）
- **後続**: T-04-1（PlainTextConverter実装）

---

### T-03-2: HTMLConverterテスト作成

#### 目的

HTMLConverterの期待される動作を検証するテストを実装より先に作成する。

#### 背景

HTMLからMarkdownへの変換処理は複雑なため、テストで仕様を明確化する。

#### 責務（単一責務）

HTMLConverterのテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:generate-unit-tests HTMLConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: HTML→Markdown変換の全パターンをカバーするテストを作成する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                          | 活用方法                 |
| ------------------------------------------------- | ------------------------ |
| `.claude/skills/tdd-principles/SKILL.md`          | TDDサイクルの適用        |
| `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テストケースの設計 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                                                  | 内容               |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| HTMLConverterテスト | `packages/shared/src/services/conversion/converters/__tests__/html-converter.test.ts` | ユニットテスト実装 |

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test html-converter.test.ts
```

#### 完了条件

- [ ] 正常系テストが作成されている
- [ ] 異常系テストが作成されている
- [ ] 各HTMLタグのMarkdown変換テストがある
- [ ] script/styleタグ除去のテストがある
- [ ] HTMLエンティティデコードのテストがある
- [ ] テスト実行でRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビュー）
- **後続**: T-04-2（HTMLConverter実装）

---

### T-03-3: CSVConverterテスト作成

#### 目的

CSVConverterの期待される動作を検証するテストを実装より先に作成する。

#### 背景

CSVパース処理（ダブルクォート対応）とMarkdownテーブル生成の正確性を保証する。

#### 責務（単一責務）

CSVConverterのテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:generate-unit-tests CSVConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: CSVパース処理の複雑なエッジケースをカバーするテストを作成する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                          | 活用方法                 |
| ------------------------------------------------- | ------------------------ |
| `.claude/skills/tdd-principles/SKILL.md`          | TDDサイクルの適用        |
| `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テストケースの設計 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物             | パス                                                                                 | 内容               |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------ |
| CSVConverterテスト | `packages/shared/src/services/conversion/converters/__tests__/csv-converter.test.ts` | ユニットテスト実装 |

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test csv-converter.test.ts
```

#### 完了条件

- [ ] 正常系テストが作成されている
- [ ] 異常系テストが作成されている
- [ ] ダブルクォート処理のテストがある
- [ ] エスケープ処理のテストがある
- [ ] Markdownテーブル生成のテストがある
- [ ] テスト実行でRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビュー）
- **後続**: T-04-3（CSVConverter実装）

---

### T-03-4: JSONConverterテスト作成

#### 目的

JSONConverterの期待される動作を検証するテストを実装より先に作成する。

#### 背景

JSON構造の人間可読テキスト変換の正確性を保証する。

#### 責務（単一責務）

JSONConverterのテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:generate-unit-tests JSONConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: JSON変換の全パターンをカバーするテストを作成する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                          | 活用方法                 |
| ------------------------------------------------- | ------------------------ |
| `.claude/skills/tdd-principles/SKILL.md`          | TDDサイクルの適用        |
| `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テストケースの設計 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                                                  | 内容               |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------ |
| JSONConverterテスト | `packages/shared/src/services/conversion/converters/__tests__/json-converter.test.ts` | ユニットテスト実装 |

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test json-converter.test.ts
```

#### 完了条件

- [ ] 正常系テストが作成されている
- [ ] 異常系テストが作成されている
- [ ] ネストされたオブジェクト/配列のテストがある
- [ ] トップレベルキー抽出のテストがある
- [ ] テスト実行でRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビュー）
- **後続**: Phase 4（実装）

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: PlainTextConverter実装

#### 目的

テストを通すためのPlainTextConverter本体を実装する。

#### 背景

TDDサイクルに従い、テストが成功するよう最小限の実装を行う。

#### 責務（単一責務）

PlainTextConverter本体の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:implement-business-logic PlainTextConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: マーティン・ファウラーの思想に基づき、可読性とテスト容易性を重視したビジネスロジック実装を行う専門エージェント。PlainTextConverterの実装を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法             |
| ---------------------------------------------- | -------------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い実装     |
| `.claude/skills/solid-principles/SKILL.md`     | 単一責務の原則の適用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物             | パス                                                                         | 内容         |
| ------------------ | ---------------------------------------------------------------------------- | ------------ |
| PlainTextConverter | `packages/shared/src/services/conversion/converters/plain-text-converter.ts` | 実装ファイル |

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test plain-text-converter.test.ts
```

#### 完了条件

- [ ] BaseConverterを継承している
- [ ] id、name、supportedMimeTypes、priorityが実装されている
- [ ] doConvert()メソッドが実装されている
- [ ] テキスト正規化処理が実装されている
- [ ] 全テストがGreen（成功）になる

#### 依存関係

- **前提**: T-03-1（PlainTextConverterテスト作成）
- **後続**: T-04-2（HTMLConverter実装）

---

### T-04-2: HTMLConverter実装

#### 目的

テストを通すためのHTMLConverter本体を実装する。

#### 背景

HTMLからMarkdownへの変換処理を実装する。

#### 責務（単一責務）

HTMLConverter本体の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:implement-business-logic HTMLConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: HTML→Markdown変換ロジックの実装を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法             |
| ---------------------------------------------- | -------------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い実装     |
| `.claude/skills/solid-principles/SKILL.md`     | 単一責務の原則の適用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物        | パス                                                                   | 内容         |
| ------------- | ---------------------------------------------------------------------- | ------------ |
| HTMLConverter | `packages/shared/src/services/conversion/converters/html-converter.ts` | 実装ファイル |

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test html-converter.test.ts
```

#### 完了条件

- [ ] BaseConverterを継承している
- [ ] id、name、supportedMimeTypes、priorityが実装されている
- [ ] doConvert()メソッドが実装されている
- [ ] HTML→Markdown変換処理が実装されている
- [ ] HTMLエンティティデコード処理が実装されている
- [ ] タイトル・リンク抽出が実装されている
- [ ] 全テストがGreen（成功）になる

#### 依存関係

- **前提**: T-03-2（HTMLConverterテスト作成）、T-04-1（PlainTextConverter実装）
- **後続**: T-04-3（CSVConverter実装）

---

### T-04-3: CSVConverter実装

#### 目的

テストを通すためのCSVConverter本体を実装する。

#### 背景

CSVパース処理とMarkdownテーブル生成を実装する。

#### 責務（単一責務）

CSVConverter本体の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:implement-business-logic CSVConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: CSVパース処理の実装を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法             |
| ---------------------------------------------- | -------------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い実装     |
| `.claude/skills/solid-principles/SKILL.md`     | 単一責務の原則の適用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                                                  | 内容         |
| ------------ | --------------------------------------------------------------------- | ------------ |
| CSVConverter | `packages/shared/src/services/conversion/converters/csv-converter.ts` | 実装ファイル |

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test csv-converter.test.ts
```

#### 完了条件

- [ ] BaseConverterを継承している
- [ ] id、name、supportedMimeTypes、priorityが実装されている
- [ ] doConvert()メソッドが実装されている
- [ ] CSVパース処理が実装されている
- [ ] Markdownテーブル生成が実装されている
- [ ] 全テストがGreen（成功）になる

#### 依存関係

- **前提**: T-03-3（CSVConverterテスト作成）、T-04-2（HTMLConverter実装）
- **後続**: T-04-4（JSONConverter実装）

---

### T-04-4: JSONConverter実装

#### 目的

テストを通すためのJSONConverter本体を実装する。

#### 背景

JSON→人間可読テキスト変換処理を実装する。

#### 責務（単一責務）

JSONConverter本体の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:implement-business-logic JSONConverter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: JSON変換ロジックの実装を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法             |
| ---------------------------------------------- | -------------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い実装     |
| `.claude/skills/solid-principles/SKILL.md`     | 単一責務の原則の適用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物        | パス                                                                   | 内容         |
| ------------- | ---------------------------------------------------------------------- | ------------ |
| JSONConverter | `packages/shared/src/services/conversion/converters/json-converter.ts` | 実装ファイル |

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test json-converter.test.ts
```

#### 完了条件

- [ ] BaseConverterを継承している
- [ ] id、name、supportedMimeTypes、priorityが実装されている
- [ ] doConvert()メソッドが実装されている
- [ ] JSON→読みやすいテキスト変換処理が実装されている
- [ ] トップレベルキー抽出が実装されている
- [ ] 全テストがGreen（成功）になる

#### 依存関係

- **前提**: T-03-4（JSONConverterテスト作成）、T-04-3（CSVConverter実装）
- **後続**: T-04-5（コンバーター登録実装）

---

### T-04-5: コンバーター登録実装

#### 目的

グローバルレジストリへのコンバーター登録処理を実装する。

#### 背景

各コンバーターをシステムから利用可能にするため、グローバルレジストリへの登録が必要。

#### 責務（単一責務）

コンバーター登録処理の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:implement-business-logic registerDefaultConverters
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: 登録ロジックの実装を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法         |
| ---------------------------------------------- | ---------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | 可読性の高い実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物   | パス                                                          | 内容                   |
| -------- | ------------------------------------------------------------- | ---------------------- |
| index.ts | `packages/shared/src/services/conversion/converters/index.ts` | エクスポートと登録処理 |

#### 完了条件

- [ ] 各コンバーターがエクスポートされている
- [ ] registerDefaultConverters()関数が実装されている
- [ ] グローバルレジストリへの登録処理が実装されている

#### 依存関係

- **前提**: T-04-4（JSONConverter実装）
- **後続**: Phase 5（リファクタリング）

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: コード品質改善

#### 目的

動作を変えずにコード品質を改善する。

#### 背景

実装完了後、リファクタリングにより保守性・可読性を向上させる。

#### 責務（単一責務）

コード品質改善のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:refactor packages/shared/src/services/conversion/converters/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: コード品質管理の専門家として、リファクタリングを実施する。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法                 |
| ---------------------------------------------- | ------------------------ |
| `.claude/skills/clean-code-practices/SKILL.md` | クリーンコード原則の適用 |
| `.claude/skills/code-smell-detection/SKILL.md` | コードスメルの検出と修正 |
| `.claude/skills/solid-principles/SKILL.md`     | SOLID原則の適用確認      |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                     | パス                                                  | 内容             |
| -------------------------- | ----------------------------------------------------- | ---------------- |
| リファクタリング済みコード | `packages/shared/src/services/conversion/converters/` | 改善されたコード |

#### 検証

テストを再実行して継続成功を確認:

```bash
pnpm --filter @repo/shared test converters
```

#### 完了条件

- [ ] コードスメルが除去されている
- [ ] 命名が明確である
- [ ] 重複コードが削除されている
- [ ] 全テストが継続して成功する

#### 依存関係

- **前提**: T-04-5（コンバーター登録実装）
- **後続**: Phase 6（品質保証）

---

## Phase 6: 品質保証

### T-06-1: 品質保証

#### 目的

定義された品質基準をすべて満たすことを検証する。

#### 背景

次フェーズに進む前に、品質ゲートをクリアする必要がある。

#### 責務（単一責務）

品質検証のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:analyze-code-quality packages/shared/src/services/conversion/converters/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: 品質基準の検証を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 品質ゲート

- [ ] **機能検証**: 全自動テストの完全成功
- [ ] **コード品質**: Lint/型チェッククリア
- [ ] **テスト網羅性**: カバレッジ基準達成（80%以上推奨）
- [ ] **セキュリティ**: 重大な脆弱性の不在

#### 実行コマンド

```bash
# テスト実行
pnpm --filter @repo/shared test converters

# Lint実行
pnpm --filter @repo/shared lint

# 型チェック
pnpm --filter @repo/shared typecheck

# カバレッジ確認
pnpm --filter @repo/shared test:coverage
```

#### 成果物

| 成果物       | パス                                                  | 内容         |
| ------------ | ----------------------------------------------------- | ------------ |
| 品質レポート | `docs/30-workflows/text-converters/quality-report.md` | 品質検証結果 |

#### 完了条件

- [ ] 全自動テストが成功している
- [ ] Lintエラーがゼロである
- [ ] 型エラーがゼロである
- [ ] カバレッジ基準を満たしている
- [ ] セキュリティ脆弱性が検出されていない

#### 依存関係

- **前提**: T-05-1（コード品質改善）
- **後続**: Phase 7（最終レビューゲート）

---

## Phase 7: 最終レビューゲート

### T-07-1: 最終レビュー

#### 目的

実装完了後、ドキュメント更新前に全体的な品質・整合性を検証する。

#### 背景

Phase 6の自動検証だけでは検出できない設計判断やベストプラクティス違反を確認する。

#### 責務（単一責務）

最終的な品質検証のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:code-review-complete packages/shared/src/services/conversion/converters/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビュー観点と使用エージェント

##### コード品質

- **エージェント**: `.claude/agents/code-quality.md`
- **チェック項目**:
  - [ ] コーディング規約への準拠
  - [ ] 可読性・保守性の確保
  - [ ] 適切なエラーハンドリング

##### アーキテクチャ遵守

- **エージェント**: `.claude/agents/arch-police.md`
- **チェック項目**:
  - [ ] 実装がアーキテクチャ設計に従っているか
  - [ ] レイヤー間の依存関係が適切か
  - [ ] SOLID原則への準拠

##### テスト品質

- **エージェント**: `.claude/agents/unit-tester.md`
- **チェック項目**:
  - [ ] テストカバレッジが十分か
  - [ ] テストケースが適切に設計されているか
  - [ ] 境界値・異常系のテストがあるか

#### レビュー結果判定

- **PASS**: 全レビュー観点で問題なし → Phase 8へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 8へ進行
- **MAJOR**: 重大な問題あり → 影響範囲に応じて戻り先を決定
  - 実装の問題: Phase 4へ戻る
  - テスト設計の問題: Phase 3へ戻る
  - コード品質の問題: Phase 5へ戻る

#### 成果物

| 成果物               | パス                                                       | 内容                             |
| -------------------- | ---------------------------------------------------------- | -------------------------------- |
| 最終レビューレポート | `docs/30-workflows/text-converters/final-review-report.md` | レビュー結果、指摘事項、対応方針 |

#### 完了条件

- [ ] 全レビュー観点でチェックが完了している
- [ ] 発見された問題が記録されている
- [ ] 対応方針が明確になっている
- [ ] PASS判定、またはMINOR指摘の対応が完了している

#### 依存関係

- **前提**: T-06-1（品質保証）
- **後続**: Phase 8（手動テスト）

---

## Phase 8: 手動テスト検証

### T-08-1: 手動テスト

#### 目的

実際のファイルを使用して、各コンバーターの動作を手動で確認する。

#### 背景

自動テストでは検証できない実際のファイル形式での動作確認が必要。

#### 責務（単一責務）

手動テストの実行のみを担当する。

#### 手動テストケース

| No  | カテゴリ           | テスト項目             | 前提条件                       | 操作手順                 | 期待結果                               | 実行結果 | 備考 |
| --- | ------------------ | ---------------------- | ------------------------------ | ------------------------ | -------------------------------------- | -------- | ---- |
| 1   | PlainTextConverter | BOM付きテキスト変換    | BOM付きUTF-8ファイルを用意     | PlainTextConverterで変換 | BOMが除去されている                    | -        |      |
| 2   | PlainTextConverter | 改行コード混在テキスト | CRLF/LF混在ファイルを用意      | PlainTextConverterで変換 | 改行コードがLFに統一されている         | -        |      |
| 3   | HTMLConverter      | 複雑なHTML変換         | 見出し・リンク・リスト含むHTML | HTMLConverterで変換      | Markdown形式に正しく変換されている     | -        |      |
| 4   | HTMLConverter      | script/styleタグ除去   | script/styleタグ含むHTML       | HTMLConverterで変換      | script/styleタグが除去されている       | -        |      |
| 5   | CSVConverter       | ダブルクォート含むCSV  | ダブルクォート含むCSVファイル  | CSVConverterで変換       | Markdownテーブルに正しく変換されている | -        |      |
| 6   | CSVConverter       | TSV変換                | TSVファイルを用意              | CSVConverterで変換       | Markdownテーブルに正しく変換されている | -        |      |
| 7   | JSONConverter      | ネストされたJSON       | 複雑なJSON構造                 | JSONConverterで変換      | 読みやすいテキストに変換されている     | -        |      |
| 8   | JSONConverter      | 配列形式JSON           | 配列形式のJSON                 | JSONConverterで変換      | 読みやすいテキストに変換されている     | -        |      |

#### 成果物

| 成果物         | パス                                                       | 内容           |
| -------------- | ---------------------------------------------------------- | -------------- |
| 手動テスト結果 | `docs/30-workflows/text-converters/manual-test-results.md` | テスト結果記録 |

#### 完了条件

- [ ] すべての手動テストケースが実行済み
- [ ] すべてのテストケースがPASS
- [ ] 発見された不具合が修正済みまたは未完了タスクとして記録済み

#### 依存関係

- **前提**: T-07-1（最終レビュー）
- **後続**: Phase 9（ドキュメント更新）

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: ドキュメント更新

#### 目的

システム要件ドキュメントに実装内容を反映する。

#### 背景

Single Source of Truth原則に基づき、実装完了後にドキュメントを更新する。

#### 責務（単一責務）

ドキュメント更新のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:update-all-docs text-converters
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: ドキュメント作成の専門家として、システム要件ドキュメントの更新を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 更新対象ドキュメント

##### 05-architecture.md

- RAG変換システムのコンポーネント図更新
- テキスト系コンバーター4種の追加

##### 06-core-interfaces.md

- IConverterインターフェースの実装クラス追加

#### スキル同期

実行コマンド:

```bash
python3 scripts/sync_requirements_to_skills.py
python3 scripts/update_skill_levels.py
```

#### 成果物

| 成果物               | パス                    | 内容                     |
| -------------------- | ----------------------- | ------------------------ |
| 更新済みドキュメント | `docs/00-requirements/` | システム要件ドキュメント |

#### 完了条件

- [ ] 05-architecture.mdが更新されている
- [ ] 06-core-interfaces.mdが更新されている
- [ ] スキル同期スクリプトが実行されている
- [ ] ドキュメントの整合性が保たれている

#### 依存関係

- **前提**: T-08-1（手動テスト）
- **後続**: Phase 10（PR作成・CI確認）

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: PR作成・CI確認

#### 目的

実装完了後、Git Worktreeの変更をコミット→PR作成→CI確認を行い、ユーザーがマージ可能な状態にする。

#### 背景

.kamui/prompt/merge-prompt.txt に基づき、差分からPR作成・CI確認までの一連のフローを自動化する。

#### 責務（単一責務）

PR作成とCI確認のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}-{hash}`) 内で実行してください

```
/ai:create-pr text-converters
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: Git/CI/CD、GitHub Actionsの専門家として、PR作成とCI確認を担当する。
- **参照**: `.claude/agents/agent_list.md`

#### 実行手順

**1. 差分確認・コミット作成**

```bash
# 差分確認
git status
git diff

# コミット作成（Conventional Commits形式）
git add .
git commit -m "$(cat <<'EOF'
feat(conversion): テキスト系コンバーター4種実装

PlainTextConverter、HTMLConverter、CSVConverter、JSONConverterを実装。
BaseConverterを継承し、各MIMEタイプに対応した変換処理を提供。

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**2. PR作成**

```bash
# ブランチプッシュ
BRANCH_NAME=$(git branch --show-current)
git push -u origin "$BRANCH_NAME"

# PR作成
gh pr create --title "feat(conversion): テキスト系コンバーター4種実装" --body "$(cat <<'EOF'
## 概要

RAGシステムのファイル変換基盤に、テキスト系コンバーター4種（PlainTextConverter、HTMLConverter、CSVConverter、JSONConverter）を実装しました。

## 変更内容

### 実装
- PlainTextConverter: プレーンテキストの正規化処理
- HTMLConverter: HTML→Markdown変換処理
- CSVConverter: CSV/TSV→Markdownテーブル変換
- JSONConverter: JSON→人間可読テキスト変換
- コンバーター登録: グローバルレジストリへの登録処理

### テスト
- 各コンバーターの単体テスト実装
- 正常系・異常系・境界値テストカバー
- テストカバレッジ80%以上達成

### ドキュメント
- システム要件ドキュメント更新
- スキル同期完了

## テスト結果

- 全自動テスト: ✅ PASS
- Lint: ✅ PASS
- 型チェック: ✅ PASS
- カバレッジ: ✅ 80%以上

## 手動テスト

- PlainTextConverter: ✅ BOM除去、改行統一確認済み
- HTMLConverter: ✅ Markdown変換確認済み
- CSVConverter: ✅ Markdownテーブル変換確認済み
- JSONConverter: ✅ 人間可読テキスト変換確認済み

## レビュー

- 設計レビュー: ✅ PASS
- 最終レビュー: ✅ PASS

## 依存タスク

- CONV-02-01: ファイル変換基盤・インターフェース（完了済み）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**3. CI完了確認**

```bash
# CI/CD完了確認
gh pr checks
```

**4. ユーザーにマージ可能を通知**

#### 成果物

| 成果物              | パス      | 内容       |
| ------------------- | --------- | ---------- |
| GitHub Pull Request | GitHub UI | PR         |
| CI完了通知          | -         | CI成功確認 |

#### 完了条件

- [ ] コミットが作成されている
- [ ] ブランチがプッシュされている
- [ ] PRが作成されている
- [ ] CIがすべて成功している
- [ ] ユーザーにマージ可能が通知されている

#### 依存関係

- **前提**: T-09-1（ドキュメント更新）
- **後続**: ユーザーによるマージ（GitHub UI）

---

## 完了条件チェックリスト

### 機能要件

- [ ] PlainTextConverterが正常に動作する
- [ ] HTMLConverterが正常に動作する
- [ ] CSVConverterが正常に動作する
- [ ] JSONConverterが正常に動作する
- [ ] グローバルレジストリへの登録が完了している
- [ ] BaseConverterを継承している
- [ ] 各コンバーターのMIMEタイプが正しく定義されている

### 品質要件

- [ ] 全自動テストが成功している
- [ ] Lintエラーがゼロである
- [ ] 型エラーがゼロである
- [ ] テストカバレッジが80%以上である
- [ ] 手動テストがすべてPASSしている
- [ ] 設計レビューがPASSしている
- [ ] 最終レビューがPASSしている

### ドキュメント要件

- [ ] システム要件ドキュメントが更新されている
- [ ] スキル同期が完了している
- [ ] PRが作成されている
- [ ] CIがすべて成功している

---

## リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                                             |
| --------------------------- | ------ | -------- | ------------------------------------------------ |
| HTML変換の複雑性            | 中     | 中       | シンプルな変換ルールに限定、複雑なHTMLは今後対応 |
| CSVパース処理のエッジケース | 中     | 中       | RFC 4180準拠、十分なテストケースでカバー         |
| パフォーマンス問題          | 低     | 低       | 大規模ファイルは将来的にストリーミング処理を検討 |
| メタデータ抽出の精度        | 低     | 低       | 簡易的な抽出に限定、高度な抽出は今後対応         |

---

## 参照情報

### 関連ドキュメント

- [task-02-02-text-converters.md](../unassigned-task/task-02-02-text-converters.md) - 元のタスク指示書
- [master_system_design.md](../../00-requirements/master_system_design.md) - システム全体設計
- [04-directory-structure.md](../../00-requirements/04-directory-structure.md) - ディレクトリ構造
- [task-orchestration-specification.md](../../00-requirements/task-orchestration-specification.md) - タスクオーケストレーション仕様

### 技術参照

- BaseConverter実装: `packages/shared/src/services/conversion/base-converter.ts`
- ConverterRegistry実装: `packages/shared/src/services/conversion/converter-registry.ts`
- MetadataExtractor実装: `packages/shared/src/services/conversion/metadata-extractor.ts`

---

## 備考

### 実装方針

- TDD（テスト駆動開発）を厳密に適用
- クリーンアーキテクチャ原則を遵守
- 単一責務の原則を徹底
- 各コンバーターは独立して実装可能

### 次フェーズ

このタスク完了後、CONV-06-01（チャンキング戦略実装）に進む予定。
