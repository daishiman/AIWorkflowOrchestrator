# Markdown/コードコンバーター実装 - タスク実行仕様書

## ユーザーからの元の指示

```
@docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md のタスクを実行してほしいです。まずはタスク仕様書を作成してほしいです。次のプロンプトを用いてタスク仕様書を作成してください。このタスク仕様書を作成する以外のタスクは絶対に実行しないでください。@docs/00-requirements/task-orchestration-specification.md
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | CONV-02-03                                     |
| Worktreeパス | `.worktrees/task-20251225-183404`              |
| ブランチ名   | `task-20251225-183404`                         |
| タスク名     | Markdown/コードコンバーター実装                |
| 分類         | 機能実装                                       |
| 対象機能     | RAGファイル変換システム - コード系コンバーター |
| 優先度       | 中                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未実施                                         |
| 作成日       | 2025-12-25                                     |

---

## タスク概要

### 目的

RAGファイル変換システムにおいて、Markdown、TypeScript、JavaScript、Python、YAML等のコード系ファイルを変換するコンバーターを実装する。これにより、テキスト系ファイルとコード系ファイルの両方がRAGシステムで検索可能になり、システム全体の対応フォーマットが拡充される。

### 背景

現在、ファイル変換基盤 (CONV-02-01) とテキスト系コンバーター (CONV-02-02) が実装済みであり、RAGシステムの基本的な変換機能が動作している。次のステップとして、開発プロジェクトで頻繁に扱うコード系ファイルの対応が必要である。特に、Markdownはドキュメント作成に、TypeScript/JavaScript/Pythonはソースコード管理に、YAMLは設定ファイル管理に広く使用されており、これらのファイルをRAGシステムで検索可能にすることで、プロジェクト全体の情報検索性が大幅に向上する。

### 最終ゴール

以下のコンバーターを実装し、`BaseConverter`を継承した統一されたインターフェースで動作させる:

1. **MarkdownConverter**: Markdown正規化、見出し・リンク・コードブロック抽出
2. **CodeConverter**: TypeScript/JavaScript/Python構造抽出（関数・クラス・インポート）
3. **YAMLConverter**: YAML構造解析（トップレベルキー、インデント深さ）

すべてのコンバーターが単体テストでカバーされ、`BaseConverter`の規約に準拠し、RAGシステムで正常に動作する状態。

### 成果物一覧

| 種別         | 成果物                  | 配置先                                                                                    |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------- |
| 環境         | Git Worktree環境        | `.worktrees/task-20251225-183404`                                                         |
| 実装         | MarkdownConverter       | `packages/shared/src/services/conversion/converters/markdown-converter.ts`                |
| 実装         | CodeConverter           | `packages/shared/src/services/conversion/converters/code-converter.ts`                    |
| 実装         | YAMLConverter           | `packages/shared/src/services/conversion/converters/yaml-converter.ts`                    |
| 実装         | コンバーター登録更新    | `packages/shared/src/services/conversion/converters/index.ts`                             |
| テスト       | MarkdownConverterテスト | `packages/shared/src/services/conversion/converters/__tests__/markdown-converter.test.ts` |
| テスト       | CodeConverterテスト     | `packages/shared/src/services/conversion/converters/__tests__/code-converter.test.ts`     |
| テスト       | YAMLConverterテスト     | `packages/shared/src/services/conversion/converters/__tests__/yaml-converter.test.ts`     |
| ドキュメント | 実装内容反映            | `docs/00-requirements/` 配下の関連ドキュメント                                            |
| ドキュメント | 未完了タスク記録        | `docs/30-workflows/unassigned-task/` 配下 (必要に応じて)                                  |
| PR           | GitHub Pull Request     | GitHub UI                                                                                 |

---

## 参照ファイル

本仕様書のコマンド選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー
- `packages/shared/src/services/conversion/base-converter.ts` - ベースコンバータークラス (依存タスク CONV-02-01 の成果物)
- `packages/shared/src/services/conversion/types.ts` - 型定義 (依存タスク CONV-02-01 の成果物)
- `docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` - 元のタスク定義

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                   | 責務                                             | 依存                   |
| ------ | -------- | ------------------------------ | ------------------------------------------------ | ---------------------- |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化   | 独立した作業環境の準備                           | なし                   |
| T-00-1 | Phase 0  | 実装要件の詳細化               | コンバーター実装の要件を明確化                   | T--1-1                 |
| T-01-1 | Phase 1  | Markdownコンバーター設計       | Markdown正規化・メタデータ抽出ロジック設計       | T-00-1                 |
| T-01-2 | Phase 1  | コードコンバーター設計         | TypeScript/JavaScript/Python構造抽出ロジック設計 | T-00-1                 |
| T-01-3 | Phase 1  | YAMLコンバーター設計           | YAML構造解析ロジック設計                         | T-00-1                 |
| T-02-1 | Phase 2  | 設計レビューゲート             | 設計の妥当性検証                                 | T-01-1, T-01-2, T-01-3 |
| T-03-1 | Phase 3  | Markdownコンバーターテスト作成 | MarkdownConverterのユニットテスト作成 (Red)      | T-02-1                 |
| T-03-2 | Phase 3  | コードコンバーターテスト作成   | CodeConverterのユニットテスト作成 (Red)          | T-02-1                 |
| T-03-3 | Phase 3  | YAMLコンバーターテスト作成     | YAMLConverterのユニットテスト作成 (Red)          | T-02-1                 |
| T-04-1 | Phase 4  | Markdownコンバーター実装       | MarkdownConverter実装 (Green)                    | T-03-1                 |
| T-04-2 | Phase 4  | コードコンバーター実装         | CodeConverter実装 (Green)                        | T-03-2                 |
| T-04-3 | Phase 4  | YAMLコンバーター実装           | YAMLConverter実装 (Green)                        | T-03-3                 |
| T-04-4 | Phase 4  | コンバーター登録更新           | index.tsに新規コンバーターを登録                 | T-04-1, T-04-2, T-04-3 |
| T-05-1 | Phase 5  | コードリファクタリング         | コード品質改善・重複排除 (Refactor)              | T-04-4                 |
| T-06-1 | Phase 6  | 品質保証                       | テスト・Lint・型チェックの実行                   | T-05-1                 |
| T-07-1 | Phase 7  | 最終レビューゲート             | 実装全体の品質検証                               | T-06-1                 |
| T-08-1 | Phase 8  | 手動テスト検証                 | 実際のファイルでの動作確認                       | T-07-1                 |
| T-09-1 | Phase 9  | ドキュメント更新               | システムドキュメント更新                         | T-08-1                 |
| T-09-2 | Phase 9  | 未完了タスク記録               | レビューで発見された未完了タスクの記録           | T-08-1                 |
| T-10-1 | Phase 10 | 差分確認・コミット作成         | Git差分確認とコミット作成                        | T-09-1, T-09-2         |
| T-10-2 | Phase 10 | PR作成                         | GitHub Pull Request作成                          | T-10-1                 |
| T-10-3 | Phase 10 | PR補足コメント追加             | PR詳細情報の追加                                 | T-10-2                 |
| T-10-4 | Phase 10 | CI/CD完了確認                  | CIステータス確認                                 | T-10-3                 |
| T-10-5 | Phase 10 | ユーザーへマージ可能通知       | マージ準備完了の通知                             | T-10-4                 |

**総サブタスク数**: 24個

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

#### Claude Code スラッシュコマンド（該当する場合）

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
# 現時点では専用のスラッシュコマンドは存在しません
# 以下のBashコマンドを使用してください
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 実行手順

**注意: このWorktree環境は既に作成済みです。以下の手順は参考情報です。**

**1. タスク識別子の確認**

```bash
pwd
# 出力: /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20251225-183404
```

**2. 現在のブランチ確認**

```bash
git branch --show-current
```

**3. Git状態確認**

```bash
git status
```

**4. 依存関係確認（必要に応じて）**

```bash
# node_modules が存在するか確認
ls node_modules/ > /dev/null 2>&1 && echo "依存関係: インストール済み" || echo "依存関係: 未インストール"

# 必要に応じてインストール
# pnpm install
```

**5. ビルド確認**

```bash
# 共有パッケージのビルド確認
pnpm --filter @repo/shared build
```

#### 成果物

| 成果物           | パス                              | 内容                             |
| ---------------- | --------------------------------- | -------------------------------- |
| Git Worktree環境 | `.worktrees/task-20251225-183404` | 独立した作業ディレクトリ         |
| 新規ブランチ     | `task-20251225-183404`            | タスク専用ブランチ               |
| 初期化済み環境   | -                                 | 依存関係インストール・ビルド完了 |

#### 完了条件

- [x] Git Worktreeが正常に作成されている（既に作成済み）
- [ ] 新規ブランチが作成されている（`git branch --show-current`で確認）
- [x] Worktreeディレクトリへ移動済み
- [ ] 依存関係がインストールされている（`node_modules/`が存在）
- [ ] ビルドが成功する（`pnpm --filter @repo/shared build`が成功）
- [ ] Git状態がクリーンである（`git status`で未コミット変更なし）

#### 依存関係

- **前提**: なし（最初のフェーズ）
- **後続**: Phase 0（要件定義）

---

## Phase 0: 要件定義

### T-00-1: 実装要件の詳細化

#### 目的

Markdown/コードコンバーターの実装要件を明確化し、実装の指針を確立する。元のタスク定義ファイル (`task-02-03-markdown-code-converters.md`) に記載された内容を踏まえ、具体的な実装要件を整理する。

#### 背景

元のタスク定義には実装の詳細が記載されているが、実際の実装前に依存タスク (CONV-02-01) で作成された基盤 (`BaseConverter`, 型定義) との整合性を確認し、必要に応じて要件を調整する必要がある。

#### 責務（単一責務）

実装要件の詳細化と明文化のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:write-spec markdown-code-converters
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `markdown-code-converters`
- **目的**: 実装可能な詳細仕様書を作成

#### 実行内容

1. `docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` の内容を確認
2. `packages/shared/src/services/conversion/base-converter.ts` と `types.ts` を確認
3. 以下の観点で要件を詳細化:
   - **MarkdownConverter**: フロントマター処理、見出し抽出ルール、コードブロック除外ルール
   - **CodeConverter**: 対応言語 (TypeScript/JavaScript/Python)、構造抽出精度、正規表現パターン
   - **YAMLConverter**: トップレベルキー抽出、インデント検出ロジック
   - **共通**: `ExtractedMetadata` インターフェースとの整合性、エラーハンドリング方針

#### 成果物

| 成果物                     | パス                                                                               | 内容               |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| 実装要件詳細化ドキュメント | `docs/30-workflows/rag-conversion-system/requirements-markdown-code-converters.md` | 実装要件の詳細仕様 |

#### 完了条件

- [ ] 各コンバーターの責務が明確に定義されている
- [ ] `BaseConverter` との継承関係が整理されている
- [ ] `ExtractedMetadata` の各フィールド設定方針が決定されている
- [ ] エラーハンドリング方針が明確化されている
- [ ] 正規表現パターンや判定ロジックの基本方針が決定されている

#### 依存関係

- **前提**: T--1-1（環境準備完了）
- **後続**: Phase 1（設計）

---

## Phase 1: 設計

### T-01-1: Markdownコンバーター設計

#### 目的

MarkdownConverter の詳細設計を行い、実装の指針を確立する。特に、フロントマター処理、見出し抽出、コードブロック除外の具体的なロジックを設計する。

#### 背景

Markdownは構造化されたテキストフォーマットであり、見出し・リンク・コードブロック等の構造情報を適切に抽出することでRAG検索の精度が向上する。フロントマター (YAML形式のメタデータ) の処理方法も決定する必要がある。

#### 責務（単一責務）

MarkdownConverter の設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:design-architecture markdown-converter
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `markdown-converter`
- **目的**: MarkdownConverter のアーキテクチャ設計

#### 設計対象

1. **正規化ロジック**:
   - BOM除去、改行コード統一、連続空行制限
   - フロントマター除去（メタデータとして別途抽出）
   - コードブロック内はそのまま保持
2. **メタデータ抽出**:
   - 見出し抽出（`h1`～`h6`）、タイトル抽出（最初の`h1`）
   - リンク抽出（外部URLのみ）
   - コードブロックカウント
   - 言語検出（日本語/英語の簡易判定）
3. **エラーハンドリング**: `Result<ConverterOutput, RAGError>` 形式での返却

#### 成果物

| 成果物                  | パス                                                                   | 内容     |
| ----------------------- | ---------------------------------------------------------------------- | -------- |
| MarkdownConverter設計書 | `docs/30-workflows/rag-conversion-system/design-markdown-converter.md` | 設計詳細 |

#### 完了条件

- [ ] 正規化ロジックが明確に定義されている
- [ ] メタデータ抽出ロジックが明確に定義されている
- [ ] 正規表現パターンが設計されている
- [ ] エラーハンドリングが設計されている

#### 依存関係

- **前提**: T-00-1（要件定義完了）
- **後続**: T-02-1（設計レビューゲート）

---

### T-01-2: コードコンバーター設計

#### 目的

CodeConverter の詳細設計を行い、TypeScript/JavaScript/Python の構造抽出ロジックを確立する。

#### 背景

ソースコードは構造化されたテキストであり、関数・クラス・インポート等の構造情報を抽出することでRAG検索の精度が向上する。正規表現ベースの簡易実装を行うが、将来的なAST解析への拡張も考慮した設計とする。

#### 責務（単一責務）

CodeConverter の設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:design-architecture
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `code-converter`
- **目的**: CodeConverter のアーキテクチャ設計

#### 設計対象

1. **言語判定**: ファイル拡張子ベースの言語判定 (ts/tsx/js/jsx/py)
2. **構造抽出**:
   - **JavaScript/TypeScript**: 関数定義、アロー関数、クラス定義、インポート、エクスポート
   - **Python**: 関数定義、クラス定義、インポート
3. **Markdown形式で整形**: コード構造サマリー + ソースコード本体
4. **メタデータ生成**: 関数数、クラス数、インポート数、エクスポート数

#### 成果物

| 成果物              | パス                                                               | 内容     |
| ------------------- | ------------------------------------------------------------------ | -------- |
| CodeConverter設計書 | `docs/30-workflows/rag-conversion-system/design-code-converter.md` | 設計詳細 |

#### 完了条件

- [ ] 言語判定ロジックが明確に定義されている
- [ ] 各言語の構造抽出ロジックが明確に定義されている
- [ ] 正規表現パターンが設計されている
- [ ] Markdown形式の整形ロジックが設計されている

#### 依存関係

- **前提**: T-00-1（要件定義完了）
- **後続**: T-02-1（設計レビューゲート）

---

### T-01-3: YAMLコンバーター設計

#### 目的

YAMLConverter の詳細設計を行い、YAML構造解析ロジックを確立する。

#### 背景

YAMLは設定ファイルに広く使用されており、トップレベルキーやインデント深さ等の構造情報を抽出することでRAG検索の精度が向上する。正規表現ベースの簡易実装を行うが、必要に応じて将来的にjs-yamlライブラリの導入も検討する。

#### 責務（単一責務）

YAMLConverter の設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:design-architecture
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `yaml-converter`
- **目的**: YAMLConverter のアーキテクチャ設計

#### 設計対象

1. **YAML構造解析**:
   - トップレベルキー検出
   - コメント検出
   - インデント深さ検出
2. **Markdown形式で整形**: 構造サマリー + YAML本体
3. **メタデータ生成**: トップレベルキー一覧、コメント有無、最大インデント深さ

#### 成果物

| 成果物              | パス                                                               | 内容     |
| ------------------- | ------------------------------------------------------------------ | -------- |
| YAMLConverter設計書 | `docs/30-workflows/rag-conversion-system/design-yaml-converter.md` | 設計詳細 |

#### 完了条件

- [ ] YAML構造解析ロジックが明確に定義されている
- [ ] 正規表現パターンが設計されている
- [ ] Markdown形式の整形ロジックが設計されている

#### 依存関係

- **前提**: T-00-1（要件定義完了）
- **後続**: T-02-1（設計レビューゲート）

---

## Phase 2: 設計レビューゲート

### T-02-1: 設計レビューゲート

#### 目的

実装開始前に設計の妥当性を検証し、問題を早期発見することで実装フェーズでの手戻りを最小化する。

#### 背景

設計ミスが実装後に発見されると修正コストが大幅に増加する。「Shift Left」原則に基づき、問題を可能な限り早期に検出する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:review-architecture
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `rag-conversion-system`
- **目的**: アーキテクチャレビューと依存関係チェック

#### レビュー観点

1. **BaseConverter 継承**: すべてのコンバーターが `BaseConverter` を正しく継承しているか
2. **型整合性**: `ExtractedMetadata` インターフェースとの整合性が取れているか
3. **エラーハンドリング**: `Result<ConverterOutput, RAGError>` 形式での返却が設計されているか
4. **正規表現パターン**: パフォーマンスやエッジケースへの対応が考慮されているか
5. **単一責務の原則**: 各コンバーターが単一の責務のみを持っているか

#### レビュー結果判定

- **PASS**: 全レビュー観点で問題なし → Phase 3へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 3へ進行
- **MAJOR**: 重大な問題あり → 影響範囲に応じて戻り先を決定
  - 設計の問題: Phase 1（設計）へ戻る
  - 要件の問題: Phase 0（要件定義）へ戻る

#### 成果物

| 成果物               | パス                                                              | 内容         |
| -------------------- | ----------------------------------------------------------------- | ------------ |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-report.md` | レビュー結果 |

#### 完了条件

- [ ] 全レビュー観点でチェックが完了している
- [ ] レビュー結果がPASSまたはMINOR（対応済み）である
- [ ] 指摘事項がすべて解決されている

#### 依存関係

- **前提**: T-01-1, T-01-2, T-01-3（設計完了）
- **後続**: Phase 3（テスト作成）またはPhase 1/0（戻り）

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: Markdownコンバーターテスト作成

#### 目的

MarkdownConverter の期待される動作を検証するユニットテストを実装より先に作成する (TDD: Red)。

#### 背景

TDD (Test-Driven Development) のRedフェーズでは、実装前にテストを作成し、テストが失敗することを確認する。これにより、実装の仕様が明確化され、実装後のテストが成功することで正しい実装が保証される。

#### 責務（単一責務）

MarkdownConverter のユニットテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:generate-unit-tests
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `packages/shared/src/services/conversion/converters/markdown-converter.ts` (実装予定ファイル)
- **目的**: ユニットテストの自動生成

#### テストケース

1. **正規化テスト**:
   - BOM除去
   - 改行コード統一
   - 連続空行制限
   - フロントマター除去
2. **メタデータ抽出テスト**:
   - 見出し抽出（複数レベル）
   - タイトル抽出（最初のh1）
   - リンク抽出（外部URLのみ）
   - コードブロックカウント
   - 言語検出（日本語/英語）
3. **エッジケーステスト**:
   - 空ファイル
   - 見出しなし
   - コードブロックなし

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/markdown-converter.test.ts
```

#### 成果物

| 成果物                     | パス                                                                                      | 内容           |
| -------------------------- | ----------------------------------------------------------------------------------------- | -------------- |
| Markdownコンバーターテスト | `packages/shared/src/services/conversion/converters/__tests__/markdown-converter.test.ts` | ユニットテスト |

#### 完了条件

- [ ] テストファイルが作成されている
- [ ] すべてのテストケースが網羅されている
- [ ] テストを実行してRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビューゲート完了）
- **後続**: T-04-1（Markdownコンバーター実装）

---

### T-03-2: コードコンバーターテスト作成

#### 目的

CodeConverter の期待される動作を検証するユニットテストを実装より先に作成する (TDD: Red)。

#### 背景

TDDのRedフェーズでは、実装前にテストを作成し、テストが失敗することを確認する。これにより、実装の仕様が明確化され、実装後のテストが成功することで正しい実装が保証される。

#### 責務（単一責務）

CodeConverter のユニットテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:generate-unit-tests
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `packages/shared/src/services/conversion/converters/code-converter.ts` (実装予定ファイル)
- **目的**: ユニットテストの自動生成

#### テストケース

1. **言語判定テスト**: ts/tsx/js/jsx/py各拡張子の判定
2. **TypeScript/JavaScript構造抽出テスト**:
   - 関数定義抽出
   - アロー関数抽出
   - クラス定義抽出
   - インポート抽出
   - エクスポート抽出
3. **Python構造抽出テスト**:
   - 関数定義抽出
   - クラス定義抽出
   - インポート抽出
4. **メタデータ生成テスト**: 関数数、クラス数、インポート数、エクスポート数

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/code-converter.test.ts
```

#### 成果物

| 成果物                   | パス                                                                                  | 内容           |
| ------------------------ | ------------------------------------------------------------------------------------- | -------------- |
| コードコンバーターテスト | `packages/shared/src/services/conversion/converters/__tests__/code-converter.test.ts` | ユニットテスト |

#### 完了条件

- [ ] テストファイルが作成されている
- [ ] すべてのテストケースが網羅されている
- [ ] テストを実行してRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビューゲート完了）
- **後続**: T-04-2（コードコンバーター実装）

---

### T-03-3: YAMLコンバーターテスト作成

#### 目的

YAMLConverter の期待される動作を検証するユニットテストを実装より先に作成する (TDD: Red)。

#### 背景

TDDのRedフェーズでは、実装前にテストを作成し、テストが失敗することを確認する。これにより、実装の仕様が明確化され、実装後のテストが成功することで正しい実装が保証される。

#### 責務（単一責務）

YAMLConverter のユニットテスト作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:generate-unit-tests
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `packages/shared/src/services/conversion/converters/yaml-converter.ts` (実装予定ファイル)
- **目的**: ユニットテストの自動生成

#### テストケース

1. **YAML構造解析テスト**:
   - トップレベルキー抽出
   - コメント検出
   - インデント深さ検出
2. **メタデータ生成テスト**: トップレベルキー一覧、コメント有無、最大インデント深さ
3. **エッジケーステスト**: 空ファイル、コメントのみのファイル

#### 検証

テストを実行してRed（失敗）を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/yaml-converter.test.ts
```

#### 成果物

| 成果物                 | パス                                                                                  | 内容           |
| ---------------------- | ------------------------------------------------------------------------------------- | -------------- |
| YAMLコンバーターテスト | `packages/shared/src/services/conversion/converters/__tests__/yaml-converter.test.ts` | ユニットテスト |

#### 完了条件

- [ ] テストファイルが作成されている
- [ ] すべてのテストケースが網羅されている
- [ ] テストを実行してRed（失敗）が確認できる

#### 依存関係

- **前提**: T-02-1（設計レビューゲート完了）
- **後続**: T-04-3（YAMLコンバーター実装）

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: Markdownコンバーター実装

#### 目的

MarkdownConverter を実装し、テストを通す (TDD: Green)。

#### 背景

TDDのGreenフェーズでは、Redフェーズで作成したテストを通すための最小限の実装を行う。実装後、テストが成功することで正しい実装が保証される。

#### 責務（単一責務）

MarkdownConverter の実装のみを担当する。

#### 実装内容

`docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` の「1. Markdownコンバーター」セクションの実装コードを参考に実装:

- `BaseConverter` を継承
- `doConvert()` メソッドを実装
- 正規化ロジックを実装 (`normalizeMarkdown()`, `normalizeTextPart()`)
- メタデータ抽出ロジックを実装 (`extractMarkdownMetadata()`, `detectLanguage()`)

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/markdown-converter.test.ts
```

#### 成果物

| 成果物                   | パス                                                                       | 内容       |
| ------------------------ | -------------------------------------------------------------------------- | ---------- |
| Markdownコンバーター実装 | `packages/shared/src/services/conversion/converters/markdown-converter.ts` | 実装コード |

#### 完了条件

- [ ] 実装ファイルが作成されている
- [ ] `BaseConverter` を継承している
- [ ] すべてのテストが成功する（Green）

#### 依存関係

- **前提**: T-03-1（Markdownコンバーターテスト作成完了）
- **後続**: T-04-4（コンバーター登録更新）

---

### T-04-2: コードコンバーター実装

#### 目的

CodeConverter を実装し、テストを通す (TDD: Green)。

#### 背景

TDDのGreenフェーズでは、Redフェーズで作成したテストを通すための最小限の実装を行う。実装後、テストが成功することで正しい実装が保証される。

#### 責務（単一責務）

CodeConverter の実装のみを担当する。

#### 実装内容

`docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` の「2. TypeScript/JavaScriptコンバーター」セクションの実装コードを参考に実装:

- `BaseConverter` を継承
- `doConvert()` メソッドを実装
- 言語判定ロジックを実装 (`detectLanguage()`)
- 構造抽出ロジックを実装 (`extractCodeStructure()`, `extractJSStructure()`, `extractPythonStructure()`)
- Markdown形式整形ロジックを実装 (`formatAsMarkdown()`)
- メタデータ作成ロジックを実装 (`createMetadata()`)

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/code-converter.test.ts
```

#### 成果物

| 成果物                 | パス                                                                   | 内容       |
| ---------------------- | ---------------------------------------------------------------------- | ---------- |
| コードコンバーター実装 | `packages/shared/src/services/conversion/converters/code-converter.ts` | 実装コード |

#### 完了条件

- [ ] 実装ファイルが作成されている
- [ ] `BaseConverter` を継承している
- [ ] すべてのテストが成功する（Green）

#### 依存関係

- **前提**: T-03-2（コードコンバーターテスト作成完了）
- **後続**: T-04-4（コンバーター登録更新）

---

### T-04-3: YAMLコンバーター実装

#### 目的

YAMLConverter を実装し、テストを通す (TDD: Green)。

#### 背景

TDDのGreenフェーズでは、Redフェーズで作成したテストを通すための最小限の実装を行う。実装後、テストが成功することで正しい実装が保証される。

#### 責務（単一責務）

YAMLConverter の実装のみを担当する。

#### 実装内容

`docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` の「3. YAMLコンバーター」セクションの実装コードを参考に実装:

- `BaseConverter` を継承
- `doConvert()` メソッドを実装
- YAML構造解析ロジックを実装 (`analyzeYAMLStructure()`)
- Markdown形式整形ロジックを実装 (`formatAsMarkdown()`)

#### 検証

テストを実行してGreen（成功）を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/yaml-converter.test.ts
```

#### 成果物

| 成果物               | パス                                                                   | 内容       |
| -------------------- | ---------------------------------------------------------------------- | ---------- |
| YAMLコンバーター実装 | `packages/shared/src/services/conversion/converters/yaml-converter.ts` | 実装コード |

#### 完了条件

- [ ] 実装ファイルが作成されている
- [ ] `BaseConverter` を継承している
- [ ] すべてのテストが成功する（Green）

#### 依存関係

- **前提**: T-03-3（YAMLコンバーターテスト作成完了）
- **後続**: T-04-4（コンバーター登録更新）

---

### T-04-4: コンバーター登録更新

#### 目的

新規作成したコンバーターを `index.ts` に登録し、ConversionService から利用可能にする。

#### 背景

`packages/shared/src/services/conversion/converters/index.ts` で `registerDefaultConverters()` 関数が定義されており、すべてのデフォルトコンバーターを登録している。新規コンバーターを追加した場合、この関数を更新する必要がある。

#### 責務（単一責務）

コンバーター登録の更新のみを担当する。

#### 実装内容

`docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md` の「4. コンバーター登録追加」セクションを参考に、`index.ts` を更新:

1. `MarkdownConverter`, `CodeConverter`, `YAMLConverter` をインポート
2. `registerDefaultConverters()` 関数内で3つのコンバーターを登録
3. エクスポートリストに追加

#### 検証

型チェックとビルドが成功することを確認:

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared build
```

#### 成果物

| 成果物               | パス                                                          | 内容       |
| -------------------- | ------------------------------------------------------------- | ---------- |
| コンバーター登録更新 | `packages/shared/src/services/conversion/converters/index.ts` | 登録コード |

#### 完了条件

- [ ] `index.ts` が更新されている
- [ ] すべてのコンバーターがエクスポートされている
- [ ] `registerDefaultConverters()` 関数が更新されている
- [ ] 型チェックが成功する
- [ ] ビルドが成功する

#### 依存関係

- **前提**: T-04-1, T-04-2, T-04-3（各コンバーター実装完了）
- **後続**: Phase 5（リファクタリング）

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: コードリファクタリング

#### 目的

動作を変えずにコード品質を改善する (TDD: Refactor)。

#### 背景

TDDのRefactorフェーズでは、実装後にコードの品質を改善する。テストが通っている状態を維持しながら、コードの可読性・保守性・拡張性を向上させる。

#### 責務（単一責務）

コードリファクタリングのみを担当する。

#### リファクタリング観点

1. **重複コード排除**: 共通ロジックの抽出
2. **命名改善**: より明確で意図が伝わる命名
3. **関数分割**: 複雑な関数を小さな関数に分割
4. **型定義改善**: より厳密な型定義
5. **コメント追加**: 複雑なロジックへのコメント追加

#### 検証

テストを再実行して継続成功を確認:

```bash
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/
```

#### 成果物

リファクタリング後のコード（既存ファイル更新）

#### 完了条件

- [ ] リファクタリングが完了している
- [ ] すべてのテストが継続して成功する
- [ ] ESLintエラーがない
- [ ] 型チェックが成功する

#### 依存関係

- **前提**: T-04-4（コンバーター登録更新完了）
- **後続**: Phase 6（品質保証）

---

## Phase 6: 品質保証

### T-06-1: 品質保証

#### 目的

定義された品質基準をすべて満たすことを検証する。

#### 背景

Phase 5までの実装とリファクタリングが完了した後、自動化された品質チェックを実行し、すべての品質基準を満たしていることを確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:lint --fix
```

- **参照**: `.claude/commands/ai/command_list.md`
- **目的**: ESLintによるコード品質チェックと自動修正

#### 品質ゲート

以下のすべての項目をクリアする必要がある:

1. **機能検証: 自動テストの完全成功**

   ```bash
   pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/
   ```

2. **コード品質: Lint/型チェッククリア**

   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/shared typecheck
   ```

3. **ビルド成功**

   ```bash
   pnpm --filter @repo/shared build
   ```

4. **テスト網羅性: カバレッジ基準達成**

   ```bash
   pnpm --filter @repo/shared test:coverage
   ```

   - 目標: 各コンバーターで80%以上のカバレッジ

#### 成果物

| 成果物       | パス                                                        | 内容         |
| ------------ | ----------------------------------------------------------- | ------------ |
| 品質レポート | `docs/30-workflows/rag-conversion-system/quality-report.md` | 品質検証結果 |

#### 完了条件

- [ ] すべての自動テストが成功する
- [ ] ESLintエラーがない
- [ ] 型チェックが成功する
- [ ] ビルドが成功する
- [ ] カバレッジ基準を達成している（80%以上）

#### 依存関係

- **前提**: T-05-1（リファクタリング完了）
- **後続**: Phase 7（最終レビューゲート）

---

## Phase 7: 最終レビューゲート

### T-07-1: 最終レビューゲート

#### 目的

実装完了後、ドキュメント更新前に全体的な品質・整合性を検証する。Phase 6の自動検証だけでは検出できない設計判断やベストプラクティス違反を確認する。

#### 背景

Phase 6の自動検証では、テスト・Lint・型チェック等の機械的な検証が完了しているが、設計判断やアーキテクチャの整合性、ベストプラクティスの遵守等、人間の目で確認すべき項目が残っている。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:review-architecture
```

- **参照**: `.claude/commands/ai/command_list.md`
- **引数**: `rag-conversion-system`
- **目的**: アーキテクチャレビューと最終品質検証

#### レビュー観点

1. **アーキテクチャ整合性**: `BaseConverter` の継承が適切か、インターフェース準拠しているか
2. **コード品質**: 可読性、保守性、拡張性が確保されているか
3. **テストカバレッジ**: エッジケースが網羅されているか
4. **ドキュメント**: コード内コメントが適切か
5. **ベストプラクティス**: DRY原則、SOLID原則等が遵守されているか

#### レビュー結果判定

- **PASS**: 全レビュー観点で問題なし → Phase 8へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 8へ進行（Phase 5内で修正可能）
- **MAJOR**: 重大な問題あり → 影響範囲に応じて戻り先を決定
  - コード品質の問題: Phase 5（リファクタリング）へ戻る
  - 実装の問題: Phase 4（実装）へ戻る
  - テスト設計の問題: Phase 3（テスト作成）へ戻る
  - 設計の問題: Phase 1（設計）へ戻る
- **CRITICAL**: 致命的な問題あり → Phase 0へ戻りユーザーと要件を再確認

#### エスカレーション条件

以下の場合はユーザーに報告し、戻り先と対応方針を協議する:

- 戻り先の判断が困難な場合
- 複数フェーズにまたがる問題の場合
- 要件自体の見直しが必要な場合

#### 成果物

| 成果物               | パス                                                             | 内容         |
| -------------------- | ---------------------------------------------------------------- | ------------ |
| 最終レビューレポート | `docs/30-workflows/rag-conversion-system/final-review-report.md` | レビュー結果 |

#### 完了条件

- [ ] 全レビュー観点でチェックが完了している
- [ ] レビュー結果がPASSまたはMINOR（対応済み）である
- [ ] 指摘事項がすべて解決されている

#### 依存関係

- **前提**: T-06-1（品質保証完了）
- **後続**: Phase 8（手動テスト）またはPhase 5/4/3/1/0（戻り）

---

## Phase 8: 手動テスト検証

### T-08-1: 手動テスト検証

#### 目的

自動テストでは検証できない実際のファイルでの動作を手動で確認し、実際のユーザー視点での品質を担保する。

#### 背景

自動テストはロジックの正しさを検証するが、実際のMarkdown/コード/YAMLファイルでの動作や、ConversionServiceとの統合動作は手動確認が必要である。

#### 手動テスト分類

##### 機能テスト

- **正常系**: 実際のMarkdown/TypeScript/JavaScript/Python/YAMLファイルで変換が成功するか
- **異常系**: 不正なファイル、空ファイル、巨大ファイルで適切にエラー処理されるか
- **境界値**: コードブロック数やインデント深さの境界値での動作確認

##### 統合テスト

- **ConversionService連携**: ConversionService経由での変換が正常に動作するか
- **コンバーター選択**: MIMEタイプに応じて正しいコンバーターが選択されるか

#### テストケース

| No  | カテゴリ | テスト項目               | 前提条件                         | 操作手順                           | 期待結果                                               | 実行結果 | 備考 |
| --- | -------- | ------------------------ | -------------------------------- | ---------------------------------- | ------------------------------------------------------ | -------- | ---- |
| 1   | 機能     | Markdown変換（正常系）   | 実際のMarkdownファイルを準備     | ConversionService.convert() を実行 | 変換成功、見出し・リンク・コードブロックが抽出される   |          |      |
| 2   | 機能     | TypeScript変換（正常系） | 実際のTypeScriptファイルを準備   | ConversionService.convert() を実行 | 変換成功、関数・クラス・インポートが抽出される         |          |      |
| 3   | 機能     | JavaScript変換（正常系） | 実際のJavaScriptファイルを準備   | ConversionService.convert() を実行 | 変換成功、関数・クラス・インポートが抽出される         |          |      |
| 4   | 機能     | Python変換（正常系）     | 実際のPythonファイルを準備       | ConversionService.convert() を実行 | 変換成功、関数・クラス・インポートが抽出される         |          |      |
| 5   | 機能     | YAML変換（正常系）       | 実際のYAMLファイルを準備         | ConversionService.convert() を実行 | 変換成功、トップレベルキー・インデント深さが抽出される |          |      |
| 6   | 機能     | 空ファイル（異常系）     | 空のMarkdownファイルを準備       | ConversionService.convert() を実行 | 変換成功、空コンテンツが返される                       |          |      |
| 7   | 統合     | コンバーター自動選択     | 複数のMIMEタイプのファイルを準備 | ConversionService.convert() を実行 | 各ファイルに適したコンバーターが選択される             |          |      |

#### 成果物

| 成果物                 | パス                                                            | 内容       |
| ---------------------- | --------------------------------------------------------------- | ---------- |
| 手動テスト結果レポート | `docs/30-workflows/rag-conversion-system/manual-test-report.md` | テスト結果 |

#### 完了条件

- [ ] すべての手動テストケースが実行済み
- [ ] すべてのテストケースがPASS（または既知の問題として記録）
- [ ] 発見された不具合が修正済みまたは未完了タスクとして記録済み

#### 依存関係

- **前提**: T-07-1（最終レビューゲート完了）
- **後続**: Phase 9（ドキュメント更新）

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: ドキュメント更新

#### 目的

タスク完了後、実装した内容をシステム要件ドキュメントに反映する。

#### 背景

`docs/00-requirements/` 配下のドキュメントは、システム構築に必要十分な情報を記載する「Single Source of Truth」として機能する。実装完了後、システムの現状を正確に反映する必要がある。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`
- **目的**: システムドキュメント更新

#### 更新対象ドキュメント

以下のドキュメントを更新する可能性がある（タスクの性質に応じて選定）:

- `docs/00-requirements/03-technology-stack.md` - 使用ライブラリ・依存関係の追加（該当なし）
- `docs/00-requirements/04-directory-structure.md` - ディレクトリ構造の変更（該当なし）
- `docs/00-requirements/05-architecture.md` - RAGファイル変換システムのコンバーター一覧更新
- `docs/00-requirements/06-core-interfaces.md` - コンバーターインターフェース更新（該当なし、既存）

#### 更新原則

- **概要のみ記載**（詳細な実装説明は不要）
- **システム構築に必要十分な情報のみ追記**
- **既存ドキュメントの構造・フォーマットを維持**
- **Single Source of Truth原則を遵守**（重複記載禁止）

#### 成果物

| 成果物                         | パス                                                | 内容             |
| ------------------------------ | --------------------------------------------------- | ---------------- |
| 更新されたシステムドキュメント | `docs/00-requirements/` 配下                        | システム要件反映 |
| requirements-index.md 更新     | `.claude/skills/**/resources/requirements-index.md` | インデックス更新 |

#### 完了条件

- [ ] 関連ドキュメントがすべて更新されている
- [ ] 更新内容が既存フォーマットに準拠している
- [ ] requirements-index.md が更新されている

#### 依存関係

- **前提**: T-08-1（手動テスト完了）
- **後続**: T-09-2（未完了タスク記録）

---

### T-09-2: 未完了タスク記録

#### 目的

レビューで発見された未対応の課題や、スコープ外だが将来対応が必要なタスクを、誰でも実行可能な粒度でドキュメント化する。

#### 背景

Phase 7レビューやPhase 8手動テストで発見された未対応項目や改善点を、将来の実装タスクとして記録する必要がある。100人中100人が同じ理解でタスクを実行できる粒度で記述する。

#### 出力先

`docs/30-workflows/unassigned-task/`

#### ファイル命名規則

- 要件系: `requirements-{{機能領域}}.md`
- 改善系: `task-{{改善領域}}-improvements.md`

#### 記録基準

以下のいずれかに該当する場合に記録する:

- Phase 7レビューでMINOR判定された未対応項目
- Phase 8手動テストで発見されたが今回スコープ外の改善点
- 将来的に必要となる拡張機能（例: AST解析への拡張、js-yamlライブラリの導入）
- 技術的負債として認識された項目

#### 品質基準

100人中100人が同じ理解でタスクを実行できる粒度で記述する（未完了タスクテンプレートに準拠）。

#### 成果物

| 成果物                   | パス                                      | 内容                         |
| ------------------------ | ----------------------------------------- | ---------------------------- |
| 未完了タスクドキュメント | `docs/30-workflows/unassigned-task/` 配下 | 未完了タスク（必要に応じて） |

#### 完了条件

- [ ] 未完了タスクがある場合、すべて記録されている
- [ ] タスクドキュメントが未完了タスクテンプレートに準拠している
- [ ] 100人中100人が同じ理解で実行できる粒度で記述されている

#### 依存関係

- **前提**: T-08-1（手動テスト完了）
- **後続**: Phase 10（PR作成）

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: 差分確認・コミット作成

#### 目的

Git Worktree内の変更をコミットし、PRの準備を行う。

#### 背景

`.kamui/prompt/merge-prompt.txt` に基づき、差分からコミット作成までの一連のフローを実行する。コミットメッセージはConventional Commits形式で記述する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:commit
```

- **参照**: `.claude/commands/ai/command_list.md`
- **目的**: コミット作成

#### 実行手順

**1. 差分確認**

```bash
git status
git diff
```

**2. 変更内容を分析し、適切なコミットメッセージを生成**

- タイプ: `feat` (新機能)
- スコープ: `conversion` (RAGファイル変換システム)
- subject: `add markdown, code, and yaml converters`

**3. コミット実行**

```bash
git add .
git commit -m "$(cat <<'EOF'
feat(conversion): add markdown, code, and yaml converters

Implement MarkdownConverter, CodeConverter, and YAMLConverter for RAG file conversion system.
- MarkdownConverter: normalize markdown, extract headers/links/code blocks
- CodeConverter: extract structure from TypeScript/JavaScript/Python files
- YAMLConverter: analyze YAML structure and extract top-level keys

All converters inherit from BaseConverter and include unit tests.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

#### 成果物

Git コミット

#### 完了条件

- [ ] Git差分が確認されている
- [ ] コミットが作成されている
- [ ] コミットメッセージがConventional Commits形式である

#### 依存関係

- **前提**: T-09-1, T-09-2（ドキュメント更新・未完了タスク記録完了）
- **後続**: T-10-2（PR作成）

---

### T-10-2: PR作成

#### 目的

GitHub Pull Request を作成し、コードレビューとマージの準備を行う。

#### 背景

ブランチをプッシュし、PRテンプレートに従ってPRを作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-20251225-183404`) 内で実行してください

```
/ai:create-pr
```

- **参照**: `.claude/commands/ai/command_list.md`
- **目的**: PR作成

#### 実行手順

**1. ブランチプッシュ**

```bash
git push -u origin $(git branch --show-current)
```

**2. PR作成**

```bash
gh pr create --title "feat(conversion): add markdown, code, and yaml converters" --body "$(cat <<'EOF'
## 概要

RAGファイル変換システムに、Markdown/コード/YAMLファイルを変換するコンバーターを追加しました。

## 変更内容

- ✨ MarkdownConverter実装（Markdown正規化、見出し・リンク・コードブロック抽出）
- ✨ CodeConverter実装（TypeScript/JavaScript/Python構造抽出）
- ✨ YAMLConverter実装（YAML構造解析）
- 🧪 各コンバーターのユニットテスト作成
- 📝 システムドキュメント更新

## 変更タイプ

- [x] ✨ 新機能 (new feature)
- [ ] 🐛 バグ修正 (bug fix)
- [ ] 🔨 リファクタリング (refactoring)
- [x] 📝 ドキュメント (documentation)
- [x] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

- [x] ユニットテスト実行 (`pnpm test`)
- [x] 型チェック実行 (`pnpm typecheck`)
- [x] ESLint チェック実行 (`pnpm lint`)
- [x] ビルド確認 (`pnpm build`)
- [x] 手動テスト実施

## 関連 Issue

Closes #

## 破壊的変更

- [ ] この PR には破壊的変更が含まれます

## チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのテストがローカルで成功する
- [x] Pre-commit hooks が成功する

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

#### 成果物

GitHub Pull Request

#### 完了条件

- [ ] ブランチがプッシュされている
- [ ] PRが作成されている
- [ ] PRタイトル・本文がテンプレートに準拠している

#### 依存関係

- **前提**: T-10-1（コミット作成完了）
- **後続**: T-10-3（PR補足コメント追加）

---

### T-10-3: PR補足コメント追加

#### 目的

PRに補足コメントを投稿し、レビュアーに技術的詳細や注意点を伝える。

#### 実行手順

**1. PR番号取得**

```bash
PR_NUMBER=$(gh pr view --json number -q .number)
```

**2. 補足コメント投稿**

````bash
gh pr comment "${PR_NUMBER}" --body "$(cat <<'EOF'
## 📝 実装の詳細

### MarkdownConverter
- フロントマター（YAML形式）を除去し、メタデータとして抽出
- コードブロック内は正規化対象外（そのまま保持）
- 見出し抽出（h1～h6）、リンク抽出（外部URLのみ）、言語検出（日本語/英語）

### CodeConverter
- TypeScript/JavaScript/Python対応
- 正規表現ベースの簡易構造抽出（将来的にAST解析への拡張を検討）
- 関数定義、クラス定義、インポート、エクスポートを抽出
- Markdown形式で構造サマリー + ソースコードを出力

### YAMLConverter
- 正規表現ベースの簡易YAML構造解析（将来的にjs-yamlライブラリの導入を検討）
- トップレベルキー抽出、コメント検出、インデント深さ検出

## ⚠️ レビュー時の注意点

- すべてのコンバーターが `BaseConverter` を継承している
- `ExtractedMetadata` インターフェースに準拠している
- ユニットテストでエッジケース（空ファイル、コードブロックなし等）をカバーしている

## 🔍 テスト方法

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test packages/shared/src/services/conversion/converters/__tests__/

# 統合テスト（実際のファイルでの動作確認）
# 手動テストレポート参照: docs/30-workflows/rag-conversion-system/manual-test-report.md
````

## 📚 参考資料

- タスク定義: `docs/30-workflows/unassigned-task/task-02-03-markdown-code-converters.md`
- 設計ドキュメント: `docs/30-workflows/rag-conversion-system/design-*.md`
- システムアーキテクチャ: `docs/00-requirements/05-architecture.md`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

````

#### 成果物
PR補足コメント

#### 完了条件
- [ ] PR番号が取得されている
- [ ] 補足コメントが投稿されている

#### 依存関係
- **前提**: T-10-2（PR作成完了）
- **後続**: T-10-4（CI/CD完了確認）

---

### T-10-4: CI/CD完了確認

#### 目的
CIステータスを確認し、すべてのチェックが成功していることを確認する。

#### 実行手順

**1. CIステータス確認（待機ループ）**
```bash
for i in {1..10}; do
  gh pr checks ${PR_NUMBER}
  if gh pr checks ${PR_NUMBER} 2>&1 | grep -qE "(pending|in_progress)"; then
    echo "CI実行中... 30秒後に再確認"
    sleep 30
  else
    echo "CI完了"
    break
  fi
done
````

**2. CI結果の最終確認**

```bash
gh pr checks ${PR_NUMBER}
```

**3. 全チェックがpassであることを確認**

#### 成果物

CIステータス確認結果

#### 完了条件

- [ ] CIステータスが確認されている
- [ ] すべてのチェックがpass（成功）している

#### 依存関係

- **前提**: T-10-3（PR補足コメント追加完了）
- **後続**: T-10-5（ユーザーへマージ可能通知）

---

### T-10-5: ユーザーへマージ可能通知

#### 目的

ユーザーにPR作成完了とマージ可能を通知する。

#### 実行手順

AIはユーザーに以下を報告する:

1. **PR作成完了の通知**
   - PR URL
   - PR番号

2. **CI/CD完了の報告**
   - 全チェック pass ✅

3. **マージ手順の案内**
   - GitHub Web UIでPRを開く
   - CI結果を最終確認
   - 「Squash and merge」をクリック
   - 「Delete branch」にチェック

4. **マージ後の同期手順（オプション）**
   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
   git checkout main
   git pull origin main
   git worktree remove .worktrees/task-20251225-183404
   git fetch --prune
   ```

#### 成果物

ユーザーへの通知

#### 完了条件

- [ ] ユーザーにPR作成完了が通知されている
- [ ] ユーザーにCI/CD完了が通知されている
- [ ] ユーザーにマージ手順が案内されている

#### 依存関係

- **前提**: T-10-4（CI/CD完了確認）
- **後続**: なし（タスク完了）

---

## 重要事項

- **PRマージは必ずユーザーがGitHub UIで手動実行する**
- **AIはCI完了確認までを担当し、マージ準備完了をユーザーに通知する**
- **CI未完了またはfail状態ではマージ通知を行わない**

---

## 受け入れ条件（全体）

以下のすべての条件を満たす必要がある:

### 機能要件

- [ ] `MarkdownConverter` がMarkdownを正規化できる
- [ ] `MarkdownConverter` が見出し・リンク・コードブロックを抽出できる
- [ ] `CodeConverter` がTypeScript/JavaScript/Pythonの構造を抽出できる
- [ ] `CodeConverter` が関数・クラス・インポートを検出できる
- [ ] `YAMLConverter` がYAML構造を解析できる
- [ ] 全コンバーターが `BaseConverter` を継承している

### 品質要件

- [ ] 単体テストが作成されている
- [ ] すべてのテストが成功する
- [ ] カバレッジが80%以上である
- [ ] ESLintエラーがない
- [ ] 型チェックが成功する
- [ ] ビルドが成功する

### ドキュメント要件

- [ ] システムドキュメントが更新されている
- [ ] 未完了タスクが記録されている（必要に応じて）

### PR要件

- [ ] PRが作成されている
- [ ] CIがすべてpassしている
- [ ] ユーザーにマージ可能が通知されている

---

## リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------- |
| 正規表現パターンの複雑化によるパフォーマンス低下 | 中     | 中       | ベンチマークテストを実施し、大規模ファイルでのパフォーマンスを検証  |
| 言語検出の精度不足（日本語/英語のみ）            | 低     | 高       | 将来的に多言語対応を検討（未完了タスクとして記録）                  |
| AST解析への拡張が必要になった場合の影響範囲      | 中     | 低       | インターフェース設計を拡張可能にしておく                            |
| YAMLパース精度の限界（js-yamlライブラリ未使用）  | 低     | 中       | 必要に応じてjs-yamlライブラリの導入を検討（未完了タスクとして記録） |

---

## 備考

### 技術的補足事項

- コード解析は正規表現ベースの簡易版（AST解析が必要な場合はtypescript, @babel/parser等を使用）
- YAML解析も簡易版（完全なパースが必要な場合はjs-yamlを使用）
- フロントマター（YAML形式のメタデータ）はMarkdownコンバーターで処理
- コードの構造情報はチャンキング時にセマンティックな分割に活用可能

### 将来的な拡張（未完了タスク候補）

- AST解析への拡張（TypeScript Compiler API、@babel/parser）
- js-yamlライブラリの導入による完全なYAMLパース
- 多言語検出（日本語/英語以外）
- コードブロック内のシンタックスハイライト対応
- インラインコメント抽出（JSDoc、Pythonドキュメンテーション文字列）
