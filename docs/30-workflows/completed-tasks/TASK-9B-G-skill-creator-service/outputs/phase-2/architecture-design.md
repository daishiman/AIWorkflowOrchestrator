# TASK-9B-G アーキテクチャ設計書

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| タスクID | TASK-9B-G             |
| 機能名   | skill-creator-service |
| Phase    | 2                     |
| 作成日   | 2026-02-03            |

---

## 1. システム概要

### 1.1 アーキテクチャ図

```
┌─────────────────────────────────────────────────────┐
│                   SkillCreatorService               │
│               (Facadeパターン/統合層)               │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ createSkill()   │  │ executeTasks()  │          │
│  │ detectMode()    │  │ validateSkill() │          │
│  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │
│  ┌────────▼────────────────────▼────────┐          │
│  │           ScriptExecutor             │          │
│  │  (scripts/*.js への委譲 = 100%精度)  │          │
│  │       【Script First原則】           │          │
│  └────────┬─────────────────────────────┘          │
│           │                                         │
│  ┌────────▼─────────────────────────────┐          │
│  │           ResourceLoader              │          │
│  │  (必要時のみリソース読み込み)         │          │
│  │   【Progressive Disclosure原則】      │          │
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

### 1.2 レイヤー構成

| レイヤー         | 責務                             | コンポーネント          |
| ---------------- | -------------------------------- | ----------------------- |
| Facade層         | API統合、ワークフロー制御        | SkillCreatorService     |
| 実行層           | スクリプト実行（決定論的処理）   | ScriptExecutor          |
| データアクセス層 | リソース読み込み（遅延読み込み） | ResourceLoader          |
| 外部リソース層   | skill-creatorリソース            | scripts/, agents/, etc. |

---

## 2. 設計原則の適用

### 2.1 Script First

| 原則             | 説明                                 | 適用                              |
| ---------------- | ------------------------------------ | --------------------------------- |
| 決定論的処理委譲 | 確実に実行できる処理はスクリプトへ   | ScriptExecutorクラスに集約        |
| 100%精度保証     | スクリプトは常に期待通りの結果を返す | validate_all.js, detect_mode.js等 |
| エラーの明示     | 失敗時は明確なエラーコードを返す     | ScriptResultのexitCodeで判定      |

**委譲対象スクリプト:**

| スクリプト           | 用途         |
| -------------------- | ------------ |
| detect_mode.js       | モード判定   |
| init_skill.js        | スキル初期化 |
| generate_skill_md.js | SKILL.md生成 |
| validate_all.js      | 全体検証     |
| validate_schema.js   | スキーマ検証 |

### 2.2 Progressive Disclosure

| 原則         | 説明                             | 適用                                    |
| ------------ | -------------------------------- | --------------------------------------- |
| 遅延読み込み | 必要になるまでリソースを読まない | ResourceLoaderクラスに集約              |
| キャッシュ   | 一度読んだリソースは再利用       | Map<string, string>でキャッシュ         |
| カテゴリ分離 | リソースをカテゴリ別に管理       | agents/, references/, assets/, schemas/ |

### 2.3 Facadeパターン

| 原則         | 説明                                      | 適用                              |
| ------------ | ----------------------------------------- | --------------------------------- |
| 単一エントリ | 複雑な処理を単一APIで提供                 | SkillCreatorServiceの公開メソッド |
| 内部詳細隠蔽 | ScriptExecutor/ResourceLoaderの詳細を隠す | privateメソッドとして実装         |
| 依存性注入   | テスタビリティのため依存を外部から渡す    | constructorパラメータ             |

### 2.4 Result型パターン

| 原則           | 説明                           | 適用                          |
| -------------- | ------------------------------ | ----------------------------- |
| 成功/失敗明示  | 全メソッドで結果を明示的に返す | ScriptResult, ExecutionReport |
| エラー情報保持 | 失敗時は詳細なエラー情報を含む | error, stderr プロパティ      |

---

## 3. コンポーネント設計

### 3.1 SkillCreatorService

**責務:** skill-creatorの全機能を統合するFacade

```
SkillCreatorService
├── 公開メソッド
│   ├── detectMode(request) → SkillCreatorMode
│   ├── createSkill(options) → string (skillDir)
│   ├── executeTasks(options) → ExecutionReport
│   ├── validateSkill(skillDir) → boolean
│   └── validateWithSchema(schema, data) → boolean
│
├── 非公開メソッド
│   ├── runCollaborativeWorkflow()
│   ├── runOrchestrateWorkflow()
│   ├── runCreateWorkflow()
│   ├── scanTasks()
│   ├── buildDependencyGraph()
│   ├── detectCycles()
│   ├── topologicalSort()
│   ├── executeTask()
│   └── summarizeResults()
│
└── 依存
    ├── ScriptExecutor
    └── ResourceLoader
```

### 3.2 ScriptExecutor

**責務:** スクリプト実行の抽象化（Script First原則）

```
ScriptExecutor
├── 公開メソッド
│   ├── execute(scriptName, args) → ScriptResult
│   └── executeJson<T>(scriptName, args) → T
│
└── 内部
    └── scriptsDir: string (scriptsディレクトリパス)
```

### 3.3 ResourceLoader

**責務:** リソースの遅延読み込み（Progressive Disclosure原則）

```
ResourceLoader
├── 公開メソッド
│   ├── load(category, name) → string
│   ├── loadAgent(agentName) → string
│   ├── loadSchema(schemaName) → object
│   └── clearCache() → void
│
└── 内部
    ├── basePath: string
    └── cache: Map<string, string>
```

---

## 4. データフロー

### 4.1 スキル作成フロー

```
1. createSkill(options)
   │
   ├─2. detectMode() または options.mode から決定
   │
   ├─3. モード別ワークフロー実行
   │    ├── collaborative: runCollaborativeWorkflow()
   │    │   └── ResourceLoader.loadAgent("discover-problem") 等
   │    ├── orchestrate: runOrchestrateWorkflow()
   │    │   └── ResourceLoader.loadAgent("interview-execution-mode")
   │    └── create: runCreateWorkflow()
   │        └── ResourceLoader.loadAgent("analyze-request")
   │
   ├─4. ScriptExecutor.execute("init_skill.js", [...])
   │
   ├─5. ScriptExecutor.execute("generate_skill_md.js", [...])
   │
   ├─6. validateSkill(skillDir)
   │    └── ScriptExecutor.execute("validate_all.js", [...])
   │
   └─7. return skillDir
```

### 4.2 タスク実行フロー

```
1. executeTasks(options)
   │
   ├─2. scanTasks(tasksDir) → TaskSpec[]
   │
   ├─3. buildDependencyGraph(tasks) → DependencyGraph
   │
   ├─4. detectCycles(graph)
   │    └── 循環あり → throw Error
   │
   ├─5. topologicalSort(graph) → TaskSpec[][]
   │
   ├─6. dryRun?
   │    ├── true → return { mode: "dry-run", tasks, estimatedTime }
   │    └── false → continue
   │
   ├─7. 実行ループ
   │    └── for group of executionOrder
   │        ├── parallel? → Promise.all(group.map(executeTask))
   │        └── sequential → for task of group: executeTask(task)
   │
   └─8. return { mode: "execution", results, summary }
```

---

## 5. エラーハンドリング設計

### 5.1 エラー分類

| エラー種別              | 発生条件                         | 対応                       |
| ----------------------- | -------------------------------- | -------------------------- |
| ScriptNotFoundError     | スクリプトファイル不存在         | 明確なエラーメッセージ     |
| ScriptExecutionError    | スクリプト実行失敗（exitCode≠0） | stderr内容をエラーに含む   |
| ResourceNotFoundError   | リソースファイル不存在           | パスを含むエラーメッセージ |
| CircularDependencyError | タスク間循環依存                 | 循環パスをエラーに含む     |
| ValidationError         | スキル検証失敗                   | 検証詳細をエラーに含む     |

### 5.2 エラー伝播

```
ScriptExecutor → SkillCreatorService → 呼び出し元
     ↓                   ↓
ScriptResult      catch & wrap
(success: false)  (詳細情報追加)
```

---

## 6. 統合ポイント

### 6.1 スクリプト連携契約

| 契約項目   | 定義                                   |
| ---------- | -------------------------------------- |
| 入力形式   | `--arg value` 形式のコマンドライン引数 |
| 出力形式   | stdout: 結果文字列（またはJSON）       |
| エラー形式 | stderr: エラーメッセージ               |
| 終了コード | 0: 成功, 非0: 失敗                     |

### 6.2 リソース連携契約

| 契約項目         | 定義                           |
| ---------------- | ------------------------------ |
| パス形式         | `{basePath}/{category}/{name}` |
| エンコーディング | UTF-8                          |
| キャッシュキー   | `{category}/{name}`            |

---

## 7. 将来拡張ポイント

| 拡張ポイント         | 説明                             | 設計対応                       |
| -------------------- | -------------------------------- | ------------------------------ |
| 新規モード追加       | SkillCreatorModeに新しい値を追加 | switch文による分岐設計         |
| 新規スクリプト追加   | scripts/に新しいスクリプトを配置 | ScriptExecutor経由で呼び出し   |
| Claude Agent SDK統合 | query() APIでタスク実行          | executeTask()内で切り替え可能  |
| IPC通信対応          | Renderer Processからの呼び出し   | サービスメソッドをそのまま公開 |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-03 | 初版作成 |
