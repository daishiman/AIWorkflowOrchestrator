# TASK-9B-G 実装ガイド (Phase 12)

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| タスクID | TASK-9B-G             |
| 機能名   | skill-creator-service |
| Phase    | 12                    |
| 作成日   | 2026-02-03            |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. スキル作成って何？

### レシピ本の例え

**スキル**とは、AIに「特定の仕事をやらせるための説明書」のことです。

料理で例えると：

- あなた = シェフ
- AI = 見習いコック
- スキル = レシピ本

レシピ本がなければ、見習いコックは「今日は何を作ればいいですか？」と毎回聞かなければなりません。でも、レシピ本（スキル）があれば、「カレーを作って」と言うだけで、材料の準備から盛り付けまで自分でできるようになります。

```
┌─────────────────────────────────────────────────────┐
│ スキルの構成                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📖 SKILL.md（レシピ名と概要）                       │
│  │                                                 │
│  ├── 🎯 目的（何を作るか）                          │
│  ├── 📝 手順（作り方）                              │
│  └── 🔧 必要な道具（ツール）                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 2. Script Firstとは？

### 自動販売機の例え

「Script First」とは、「決まりきった作業は機械にやらせる」という考え方です。

自動販売機で例えると：

- お金を入れる → ボタンを押す → 飲み物が出る

これは毎回同じ動きをします。人間が判断する必要がありません。

**Script Firstの仕組み**:

```
┌───────────────────────────────────────────────────┐
│                                                   │
│   ユーザーのリクエスト                             │
│         │                                         │
│         ▼                                         │
│   ┌─────────────────────┐                         │
│   │ ScriptExecutor      │ ← スクリプト実行担当    │
│   │ (自動販売機)        │                         │
│   └─────────────────────┘                         │
│         │                                         │
│         ▼                                         │
│   ┌─────────────────────┐                         │
│   │ detect_mode.js      │ ← 決まった処理を実行    │
│   │ validate_all.js     │                         │
│   │ etc...              │                         │
│   └─────────────────────┘                         │
│         │                                         │
│         ▼                                         │
│   決定論的な結果                                   │
│   (毎回同じ入力なら同じ結果)                       │
│                                                   │
└───────────────────────────────────────────────────┘
```

**メリット**:

- 予測可能：同じ入力なら必ず同じ結果
- 高速：AI推論なしで即座に実行
- テストしやすい：結果が確定的

---

## 3. Progressive Disclosureとは？

### 図書館の例え

「Progressive Disclosure」とは、「必要な時に必要なものだけ見る」という考え方です。

図書館で例えると：

- 図書館に入る → 全部の本を読む必要はない
- 探している本だけを取り出す → 必要な時に必要な本だけ

```
┌─────────────────────────────────────────────────────┐
│ 従来の方法（全部読み込み）                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│   起動時に全リソースを読み込む                       │
│   📚📚📚📚📚📚📚📚📚📚📚📚                           │
│                                                     │
│   → メモリ使用量: 大                                │
│   → 起動時間: 遅い                                  │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Progressive Disclosure（必要な時だけ）              │
├─────────────────────────────────────────────────────┤
│                                                     │
│   必要になったら読み込む                             │
│   📖 ← 今必要な1冊だけ                              │
│                                                     │
│   → メモリ使用量: 小                                │
│   → 起動時間: 速い                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**ResourceLoaderの役割**:

- 必要なリソースだけを読み込む
- 一度読んだものはキャッシュ（記憶）しておく
- 次に同じものが必要になったらキャッシュから取り出す

---

## 4. モードの違い

### チームワークの例え

スキル作成には5つの「モード」があります。これはチームでの働き方の違いです。

| モード         | 例え                     | 説明                                           |
| -------------- | ------------------------ | ---------------------------------------------- |
| collaborative  | ペアプログラミング       | 「一緒に考えよう！」ユーザーと対話しながら作る |
| orchestrate    | プロジェクトマネージャー | 「誰がやる？」実行者（Claude/Codex）を選ぶ     |
| create         | 一人作業                 | 「任せて！」指示に従って一人で作る             |
| update         | リファクタリング         | 「直しておくね」既存スキルを更新               |
| improve-prompt | レビュー会議             | 「もっと良くしよう」プロンプトを改善           |

```
┌─────────────────────────────────────────────────────┐
│ collaborative モードのイメージ                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👤 ユーザー                                        │
│   │                                                 │
│   │ 「こんなスキルが欲しい」                        │
│   │                                                 │
│   ▼                                                 │
│  🤖 AI（インタビュー）                              │
│   │                                                 │
│   │ 「どんな機能が必要ですか？」                    │
│   │ 「入力は何ですか？」                            │
│   │ 「出力は何ですか？」                            │
│   │                                                 │
│   ▼                                                 │
│  📖 スキル完成                                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. 型定義

### 1.1 モード・エンジン型

```typescript
// スキル作成モード
type SkillCreatorMode =
  | "collaborative" // ユーザー対話型スキル共創
  | "orchestrate" // 実行エンジン選択モード
  | "create" // 新規スキル作成
  | "update" // 既存スキル更新
  | "improve-prompt"; // プロンプト改善

// 実行エンジン（orchestrateモード用）
type ExecutionEngine =
  | "claude" // Claude Codeで実行
  | "codex" // OpenAI Codexで実行
  | "claude-to-codex"; // Claudeで設計→Codexで実行
```

### 1.2 スキル作成オプション

```typescript
interface CreateSkillOptions {
  name: string; // スキル名（ディレクトリ名）
  description: string; // スキルの説明
  mode: SkillCreatorMode; // 作成モード
  executionEngine?: ExecutionEngine; // 実行エンジン（orchestrateモード時）
  generateTasks?: boolean; // タスク仕様書を生成するか
  interviewResult?: InterviewResult; // インタビュー結果（collaborativeモード時）
  domainModel?: DomainModel; // ドメインモデル（collaborativeモード時）
}
```

### 1.3 タスク実行関連型

```typescript
interface ExecuteTasksOptions {
  tasksDir: string; // タスク仕様書のディレクトリパス
  parallel?: boolean; // 並列実行を許可するか（デフォルト: false）
  dryRun?: boolean; // ドライラン（実行せず計画のみ返す）
  maxTurns?: number; // 最大実行ターン数
}

interface ExecutionReport {
  mode: "dry-run" | "execution"; // 実行モード
  tasks?: string[][]; // 実行順序（ドライラン時）
  results?: TaskResult[]; // 実行結果（実行時）
  summary?: ExecutionSummary; // サマリー（実行時）
  estimatedTime?: number; // 見積もり時間（分）
}

interface TaskResult {
  taskId: string; // タスクID
  status: "completed" | "failed" | "skipped"; // 実行ステータス
  duration: number; // 実行時間（ミリ秒）
  error?: string; // エラーメッセージ
  artifacts?: string[]; // 生成された成果物パス
}
```

### 1.4 型関係図

```
┌─────────────────────────────────────────────────────────────────┐
│                        Type Relationships                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CreateSkillOptions ──────┬──→ SkillCreatorMode                 │
│          │                │                                     │
│          │                └──→ ExecutionEngine                  │
│          │                                                      │
│          ├──→ InterviewResult ──→ ExternalApiConfig             │
│          │                                                      │
│          └──→ DomainModel ──────→ Entity                        │
│                       │                                         │
│                       └─────────→ BoundedContext                │
│                                                                 │
│  ExecuteTasksOptions ───────────→ ExecutionReport               │
│                                       │                         │
│                                       ├──→ TaskResult           │
│                                       │                         │
│                                       └──→ ExecutionSummary     │
│                                                                 │
│  TaskSpec ────────────────────────→ DependencyGraph             │
│                                                                 │
│  ScriptResult ← (ScriptExecutor内部使用)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ScriptExecutor API

### 2.1 クラス概要

```typescript
class ScriptExecutor {
  constructor(skillCreatorPath: string);

  // スクリプトを実行
  async execute(scriptName: string, args: string[]): Promise<ScriptResult>;

  // JSON出力スクリプトを実行
  async executeJson<T>(scriptName: string, args: string[]): Promise<T>;
}
```

### 2.2 メソッド詳細

#### `execute(scriptName, args)`

スクリプトを実行し、結果を返します。

**シグネチャ**:

```typescript
async execute(scriptName: string, args: string[]): Promise<ScriptResult>
```

**パラメータ**:
| 名前 | 型 | 説明 |
| ---------- | -------- | -------------------------------- |
| scriptName | string | 実行するスクリプト名（例: "detect_mode.js"） |
| args | string[] | スクリプトに渡す引数 |

**戻り値**: `ScriptResult`

```typescript
interface ScriptResult {
  success: boolean; // 実行成功フラグ（exitCode === 0）
  stdout: string; // 標準出力
  stderr: string; // 標準エラー出力
  exitCode: number; // 終了コード
}
```

**使用例**:

```typescript
const executor = new ScriptExecutor("/path/to/skill-creator");
const result = await executor.execute("validate_all.js", [
  "--path",
  "/path/to/skill",
]);

if (result.success) {
  console.log("検証成功:", result.stdout);
} else {
  console.error("検証失敗:", result.stderr);
}
```

#### `executeJson<T>(scriptName, args)`

JSON出力スクリプトを実行し、パースした結果を返します。

**シグネチャ**:

```typescript
async executeJson<T>(scriptName: string, args: string[]): Promise<T>
```

**使用例**:

```typescript
interface ModeResult {
  mode: SkillCreatorMode;
}

const result = await executor.executeJson<ModeResult>("detect_mode.js", [
  "--request",
  "新しいスキルを作りたい",
]);
console.log("検出されたモード:", result.mode);
```

### 2.3 セキュリティ

**パストラバーサル防止（BC-003）**:

```typescript
// 以下のスクリプト名は拒否される
await executor.execute("../../../etc/passwd", []); // Error: Invalid script name
await executor.execute("subdir/script.js", []); // Error: Invalid script name
await executor.execute("subdir\\script.js", []); // Error: Invalid script name
```

---

## 3. ResourceLoader API

### 3.1 クラス概要

```typescript
class ResourceLoader {
  constructor(skillCreatorPath: string);

  // リソースを読み込む（キャッシュ優先）
  async load(category: ResourceCategory, name: string): Promise<string>;

  // エージェントプロンプトを読み込む
  async loadAgent(agentName: string): Promise<string>;

  // JSONスキーマを読み込んでパース
  async loadSchema(schemaName: string): Promise<object>;

  // キャッシュをクリア
  clearCache(): void;
}

type ResourceCategory = "agents" | "references" | "assets" | "schemas";
```

### 3.2 メソッド詳細

#### `load(category, name)`

リソースを読み込みます。キャッシュがあればキャッシュから返します。

**シグネチャ**:

```typescript
async load(category: ResourceCategory, name: string): Promise<string>
```

**使用例**:

```typescript
const loader = new ResourceLoader("/path/to/skill-creator");

// エージェントプロンプトを読み込み
const prompt = await loader.load("agents", "hearing.md");

// 2回目はキャッシュから取得（高速）
const cachedPrompt = await loader.load("agents", "hearing.md");
```

#### `loadAgent(agentName)` / `loadSchema(schemaName)`

ショートカットメソッドです。

```typescript
// これらは等価
await loader.loadAgent("hearing");
await loader.load("agents", "hearing.md");

// これらも等価
await loader.loadSchema("skill");
const raw = await loader.load("schemas", "skill.json");
JSON.parse(raw);
```

### 3.3 キャッシュ管理

```typescript
// キャッシュをクリア（メモリ解放）
loader.clearCache();

// 内部的なキャッシュキー形式
// "agents/hearing.md"
// "schemas/skill.json"
```

---

## 4. SkillCreatorService API

### 4.1 クラス概要

```typescript
class SkillCreatorService {
  constructor(skillsDir?: string, workflowsDir?: string);

  // モード判定
  async detectMode(request: string): Promise<SkillCreatorMode>;

  // スキル作成
  async createSkill(options: CreateSkillOptions): Promise<string>;

  // タスク実行
  async executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport>;

  // スキル検証
  async validateSkill(skillDir: string): Promise<boolean>;

  // スキーマ検証
  async validateWithSchema(schemaName: string, data: unknown): Promise<boolean>;
}
```

### 4.2 メソッド詳細

#### `detectMode(request)`

ユーザーリクエストから適切なモードを判定します。

**シグネチャ**:

```typescript
async detectMode(request: string): Promise<SkillCreatorMode>
```

**使用例**:

```typescript
const service = new SkillCreatorService();

// 各種リクエストに対するモード判定
const mode1 = await service.detectMode("新しいスキルを一緒に作りたい");
// → "collaborative"

const mode2 = await service.detectMode("Codexで実行したい");
// → "orchestrate"

const mode3 = await service.detectMode("my-skillという名前でスキル作成");
// → "create"
```

#### `createSkill(options)`

スキルを作成します。

**シグネチャ**:

```typescript
async createSkill(options: CreateSkillOptions): Promise<string>
```

**使用例**:

```typescript
// collaborativeモード
const skillPath = await service.createSkill({
  name: "my-new-skill",
  description: "A skill for data analysis",
  mode: "collaborative",
  interviewResult: {
    purpose: "データ分析を自動化する",
    features: ["CSV読み込み", "統計分析", "グラフ生成"],
    inputs: ["CSVファイルパス"],
    outputs: ["分析レポート"],
    toolsNeeded: ["Read", "Write"],
    abstractionLevel: "L2",
  },
});
console.log("作成されたスキル:", skillPath);
```

#### `executeTasks(options)`

タスクを依存関係順に実行します。

**シグネチャ**:

```typescript
async executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport>
```

**使用例**:

```typescript
// ドライラン（実行計画のみ）
const plan = await service.executeTasks({
  tasksDir: "/path/to/tasks",
  dryRun: true,
});
console.log("実行順序:", plan.tasks);
console.log("見積もり時間:", plan.estimatedTime, "分");

// 実行
const report = await service.executeTasks({
  tasksDir: "/path/to/tasks",
  parallel: false,
});
console.log("結果:", report.summary);
```

---

## 5. エラーハンドリング

### 5.1 エラー種別

| エラーメッセージ                                         | 原因                                     | 復旧手順               |
| -------------------------------------------------------- | ---------------------------------------- | ---------------------- |
| `Invalid script name: X. Path traversal is not allowed.` | パストラバーサル検出                     | スクリプト名を修正     |
| `Script X failed: Y`                                     | スクリプト実行失敗                       | スクリプトを確認       |
| `Interview result is required for collaborative mode`    | collaborativeモードでinterviewResult不足 | interviewResultを指定  |
| `Circular dependency detected in tasks`                  | タスク間の循環依存                       | タスク依存関係を修正   |
| `Failed to initialize skill: X`                          | スキル初期化失敗                         | エラーメッセージを確認 |
| `Skill validation failed`                                | スキル検証失敗                           | スキル構造を確認       |

### 5.2 エラーハンドリング例

```typescript
try {
  const skillPath = await service.createSkill(options);
} catch (error) {
  if (error.message.includes("Interview result is required")) {
    // collaborativeモードでinterviewResultが不足
    console.error("インタビュー結果を指定してください");
  } else if (error.message.includes("Circular dependency")) {
    // 循環依存
    console.error("タスク間に循環依存があります");
  } else {
    console.error("予期しないエラー:", error.message);
  }
}
```

---

## 6. 拡張ポイント

### 6.1 新規モード追加

1. **型定義を更新** (`packages/shared/src/types/skillCreator.ts`):

```typescript
type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt"
  | "new-mode"; // 追加
```

2. **サービスにケースを追加** (`SkillCreatorService.ts`):

```typescript
switch (options.mode) {
  // ...既存ケース
  case "new-mode":
    await this.runNewModeWorkflow(options);
    break;
}
```

3. **モード判定スクリプトを更新** (`scripts/detect_mode.js`):

```javascript
// new-modeの判定ロジックを追加
```

### 6.2 新規スクリプト追加

1. **スクリプトを作成** (`skill-creator/scripts/my_script.js`):

```javascript
#!/usr/bin/env node
const args = process.argv.slice(2);
// 処理ロジック
console.log(JSON.stringify({ result: "success" }));
```

2. **ScriptExecutorから呼び出し**:

```typescript
const result = await executor.executeJson<MyResult>("my_script.js", [
  "--arg1",
  "value1",
]);
```

### 6.3 新規リソースカテゴリ追加

1. **型定義を更新** (`ResourceLoader.ts`):

```typescript
type ResourceCategory =
  | "agents"
  | "references"
  | "assets"
  | "schemas"
  | "templates"; // 追加
```

2. **ディレクトリを作成**:

```bash
mkdir -p ~/.aiworkflow/skills/skill-creator/templates
```

3. **ResourceLoaderから読み込み**:

```typescript
const template = await loader.load("templates", "default.md");
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-03 | 初版作成 |
