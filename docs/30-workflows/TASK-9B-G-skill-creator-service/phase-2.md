# Phase 2: 設計

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 2                     |
| タスク | TASK-9B-G             |
| 機能名 | skill-creator-service |
| 作成日 | 2026-02-03            |

## 目的

要件を実現可能な構造に落とし込み、クラス設計・インターフェース定義・依存関係を設計する。

## 実行タスク

- Task 2-1: アーキテクチャ設計
- Task 2-2: 型定義設計
- Task 2-3: クラス設計
- Task 2-4: インターフェース設計

## 参照資料

| 資料名        | パス                                                                     | 説明                     |
| ------------- | ------------------------------------------------------------------------ | ------------------------ |
| 要件定義書    | `outputs/phase-1/requirements-definition.md`                             | Phase 1成果物            |
| 元タスク仕様  | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-g-service.md` | コード例参照             |
| 実装パターン  | `aiworkflow-requirements: architecture-implementation-patterns.md`       | デスクトップ実装パターン |
| Agent SDK仕様 | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`                 | SDK連携設計              |

## 実行手順

### Task 2-1: アーキテクチャ設計

#### レイヤー構成

```
┌─────────────────────────────────────────────────────┐
│                   SkillCreatorService               │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ createSkill()   │  │ executeTasks()  │          │
│  │ detectMode()    │  │ validateSkill() │          │
│  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │
│  ┌────────▼────────────────────▼────────┐          │
│  │           ScriptExecutor             │          │
│  │  (scripts/*.js への委譲 = 100%精度)  │          │
│  └────────┬─────────────────────────────┘          │
│           │                                         │
│  ┌────────▼─────────────────────────────┐          │
│  │           ResourceLoader              │          │
│  │  (Progressive Disclosure)             │          │
│  └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  ~/.aiworkflow/skills/skill-creator/                │
│  ├── scripts/    (28+) → 決定論的実行              │
│  ├── agents/     (36+) → プロンプト読み込み        │
│  ├── references/ (40+) → ガイド参照                │
│  ├── assets/     (38+) → テンプレート適用          │
│  └── schemas/    (38+) → バリデーション            │
└─────────────────────────────────────────────────────┘
```

#### 設計原則の適用

| 原則                   | 設計への反映                                    |
| ---------------------- | ----------------------------------------------- |
| Script First           | ScriptExecutorクラスに決定論的処理を集約        |
| Progressive Disclosure | ResourceLoaderクラスで遅延読み込み + キャッシュ |
| Facadeパターン         | SkillCreatorServiceが複雑な処理を統合           |
| Result型パターン       | 全メソッドで成功/失敗を明示的に返却             |

### Task 2-2: 型定義設計

`packages/shared/src/types/skillCreator.ts` に以下の型を定義：

| 型名                | 用途                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| SkillCreatorMode    | モード列挙（collaborative/orchestrate/create/update/improve-prompt） |
| ExecutionEngine     | 実行エンジン列挙（claude/codex/claude-to-codex）                     |
| CreateSkillOptions  | スキル作成オプション                                                 |
| InterviewResult     | collaborativeモードのインタビュー結果                                |
| DomainModel         | ドメインモデル定義                                                   |
| ExecuteTasksOptions | タスク実行オプション                                                 |
| ExecutionReport     | 実行レポート                                                         |
| TaskResult          | 個別タスク結果                                                       |
| ExecutionSummary    | 実行サマリー                                                         |
| Entity              | エンティティ定義                                                     |
| BoundedContext      | 境界づけられたコンテキスト                                           |
| ExternalApiConfig   | 外部API設定                                                          |

### Task 2-3: クラス設計

#### ScriptExecutor

| メソッド       | 引数                               | 戻り値                | 説明                          |
| -------------- | ---------------------------------- | --------------------- | ----------------------------- |
| constructor    | skillCreatorPath: string           | -                     | scriptsディレクトリパスを設定 |
| execute        | scriptName: string, args: string[] | Promise<ScriptResult> | スクリプト実行                |
| executeJson<T> | scriptName: string, args: string[] | Promise<T>            | JSON出力スクリプト実行        |

#### ResourceLoader

| メソッド    | 引数                     | 戻り値          | 説明                               |
| ----------- | ------------------------ | --------------- | ---------------------------------- |
| constructor | skillCreatorPath: string | -               | basePathを設定                     |
| load        | category, name: string   | Promise<string> | リソース読み込み（キャッシュ付き） |
| loadAgent   | agentName: string        | Promise<string> | エージェント読み込み               |
| loadSchema  | schemaName: string       | Promise<object> | スキーマ読み込み（JSON parse）     |
| clearCache  | -                        | void            | キャッシュクリア                   |

#### SkillCreatorService

| メソッド           | 引数                         | 戻り値                    | 説明                               |
| ------------------ | ---------------------------- | ------------------------- | ---------------------------------- |
| constructor        | skillsDir?, workflowsDir?    | -                         | パス設定、依存コンポーネント初期化 |
| detectMode         | request: string              | Promise<SkillCreatorMode> | モード判定（Script First）         |
| createSkill        | options: CreateSkillOptions  | Promise<string>           | スキル作成                         |
| executeTasks       | options: ExecuteTasksOptions | Promise<ExecutionReport>  | タスク実行                         |
| validateSkill      | skillDir: string             | Promise<boolean>          | スキル検証                         |
| validateWithSchema | schemaName, data             | Promise<boolean>          | スキーマ検証                       |

### Task 2-4: インターフェース設計

#### ScriptResult

| プロパティ | 型      | 説明           |
| ---------- | ------- | -------------- |
| success    | boolean | 実行成功フラグ |
| stdout     | string  | 標準出力       |
| stderr     | string  | 標準エラー出力 |
| exitCode   | number  | 終了コード     |

#### TaskSpec（内部型）

| プロパティ    | 型       | 説明         |
| ------------- | -------- | ------------ |
| id            | string   | タスクID     |
| content       | string   | タスク内容   |
| allowedTools? | string[] | 許可ツール   |
| depends_on?   | string[] | 依存タスクID |

## 統合テスト連携【必須】

| 統合ポイント                         | 契約定義                            |
| ------------------------------------ | ----------------------------------- |
| ScriptExecutor → scripts/\*.js       | ScriptResult型で結果を返却          |
| ResourceLoader → ファイルシステム    | キャッシュ付きでstring/objectを返却 |
| SkillCreatorService → ScriptExecutor | 全決定論的処理をスクリプト委譲      |

## アーキテクチャ層別設計

| 層                   | 設計観点                               | 仕様参照先                                   |
| -------------------- | -------------------------------------- | -------------------------------------------- |
| バックエンド（Main） | サービス設計、依存性注入               | `aiworkflow-requirements: architecture-*.md` |
| IPC通信              | 将来のチャンネル設計（skill:create等） | `aiworkflow-requirements: api-*.md`          |
| データ               | TaskSpec型、DependencyGraph型          | -                                            |

## 成果物

| 成果物               | パス                                     | 説明         |
| -------------------- | ---------------------------------------- | ------------ |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | システム構造 |
| 型定義設計書         | `outputs/phase-2/type-definitions.md`    | 型一覧       |
| クラス設計書         | `outputs/phase-2/class-design.md`        | クラス構造   |

## 完了条件

- [ ] アーキテクチャ設計が完了している
- [ ] 型定義が設計されている
- [ ] クラス設計が完了している
- [ ] インターフェース設計が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 2-1: アーキテクチャ設計
3. Task 2-2: 型定義設計
4. Task 2-3: クラス設計
5. Task 2-4: インターフェース設計
6. 成果物の作成・配置
7. 完了条件の検証

## 次のPhase

Phase 3: 設計レビューゲート
