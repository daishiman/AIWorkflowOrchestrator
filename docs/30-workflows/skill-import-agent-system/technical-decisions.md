# 技術選定・設計判断

## 1. Claude Agent SDK vs Direct SDK

### 1.1 比較表

| 観点               | Claude Agent SDK                              | Direct SDK (@anthropic-ai/sdk) |
| ------------------ | --------------------------------------------- | ------------------------------ |
| パッケージ         | `@anthropic-ai/claude-agent-sdk`              | `@anthropic-ai/sdk`            |
| バージョン         | 0.2.15                                        | 0.x.x                          |
| Hooks              | ✅ PreToolUse, PostToolUse, PermissionRequest | ❌ なし                        |
| ツール実行         | ✅ 組み込み（Bash, Read, Edit等）             | ❌ 自前実装                    |
| Permission Control | ✅ 4層システム                                | ❌ 自前実装                    |
| ストリーミング     | ✅ stream() メソッド                          | ✅ stream: true                |
| セッション管理     | ✅ V2 Preview（不安定）                       | ❌ なし                        |
| 適用場面           | 対話型エージェント                            | バッチ処理/シンプルクエリ      |

### 1.2 選定結果

**Claude Agent SDK を採用**

理由:

1. スキル実行にはツール使用（Read, Edit, Bash等）が必須
2. Hooksによる権限制御・UI統合が必要
3. 既存の`AgentExecutor`がSDK使用パターンを採用済み
4. スキルの`allowed-tools`との親和性が高い

### 1.3 既存実装との関係

```
既存実装:
├── AgentExecutor.ts     ← Claude Agent SDK (query() API)
├── agent-client.ts      ← Direct SDK (Anthropic)
└── SkillExecutor.ts     ← 新規 (Claude Agent SDK)
```

- `SkillExecutor`は`AgentExecutor`のパターンを踏襲
- スキル固有のプロンプト構築・コンテキスト注入を追加

---

## 2. スキル検出方式

### 2.1 オプション比較

| 方式                        | メリット               | デメリット           |
| --------------------------- | ---------------------- | -------------------- |
| A: ファイルシステムスキャン | シンプル、追加設定不要 | 起動時オーバーヘッド |
| B: 設定ファイル定義         | 明示的、起動高速       | 手動メンテナンス必要 |
| C: ハイブリッド             | 柔軟性                 | 複雑                 |

### 2.2 選定結果

**A: ファイルシステムスキャン を採用**

理由:

1. Claude Code本体と同様のアプローチ
2. スキル追加時の手動設定が不要
3. `~/.aiworkflow/skills/`（アプリ独自）と `~/.claude/skills/`（読み取り専用）の2パスをスキャン
4. SKILL.md frontmatterから必要な情報を取得可能

### 2.3 スキャンタイミング

```
[アプリ起動時]
    │
    ▼ SkillScanner.scan()
    ├─ ~/.aiworkflow/skills/ (読み書き)
    └─ ~/.claude/skills/ (読み取り専用)
[メモリにキャッシュ]
    │
    ▼ ファイル変更監視 (chokidar)
    ├─ ~/.aiworkflow/skills/ のみ監視
[変更検知時に再スキャン]
```

### 2.4 スキル保存場所の分離

**決定事項**: アプリ独自のスキル保存場所を設ける

| 場所                    | 用途                             | アクセス                       |
| ----------------------- | -------------------------------- | ------------------------------ |
| `~/.claude/skills/`     | Claude Code CLI標準スキル        | 読み取り専用（インポート可能） |
| `~/.aiworkflow/skills/` | AIWorkflowOrchestrator独自スキル | 読み書き可能                   |

理由:

1. Claude Code CLIのスキルと混在を防止
2. アプリ独自のスキル管理を可能に
3. 将来のWebアプリ化時のDB移行を容易に

---

## 3. インポート永続化

### 3.1 オプション比較

| 方式                | メリット               | デメリット       |
| ------------------- | ---------------------- | ---------------- |
| A: electron-store   | シンプル、既存利用実績 | JSON形式のみ     |
| B: SQLite (Drizzle) | リレーション、クエリ   | オーバースペック |
| C: ファイルシステム | 透明性                 | 管理複雑         |

### 3.2 選定結果

**A: electron-store を採用**

理由:

1. 既存の設定管理と統一
2. インポート情報は単純なKey-Value
3. `~/.aiworkflow/config/` に保存
4. 暗号化オプションあり（将来の認証情報保存用）

---

## 3.5 スキル関連データの保存場所

### 3.5.1 ディレクトリ構造

```
~/.aiworkflow/
├── skills/                       # アプリで作成したスキル
│   └── {skill-name}/
│       ├── SKILL.md
│       ├── agents/
│       ├── references/
│       └── scripts/
│
├── conversations/                # スキルごとのチャット履歴
│   └── {skill-name}/
│       ├── {conversation-id}.json
│       └── ...
│
├── artifacts/                    # 生成した成果物
│   └── {skill-name}/
│       └── {conversation-id}/
│           └── output.html
│
└── config/                       # electron-store保存先
    └── skill-imports.json
```

### 3.5.2 チャット履歴の構造

```typescript
interface SkillConversation {
  id: string;
  skillName: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
  metadata: {
    totalTokens: number;
    toolsUsed: string[];
    artifacts?: ArtifactReference[];
  };
}
```

### 3.5.3 将来のDB対応

**現状（Phase 1）**: ファイルシステム + electron-store

- スキルファイル: `~/.aiworkflow/skills/`
- チャット履歴: `~/.aiworkflow/conversations/` (JSON)
- 設定: `electron-store`

**将来（Phase 2 - Web対応時）**: DB導入を検討

- SQLite → PostgreSQL移行可能な設計
- 認証追加
- Object Storage（成果物保存用）

> **注意**: DB導入は将来対応として保留。現状はファイルベースで実装する。

### 3.5.4 ディレクトリの自動作成

アプリ起動時に `~/.aiworkflow` およびサブディレクトリが存在しない場合は自動作成する。

```typescript
// アプリ起動時の初期化処理
async function ensureAppDirectories(): Promise<void> {
  const baseDir = path.join(os.homedir(), ".aiworkflow");

  const directories = [
    baseDir,
    path.join(baseDir, "skills"),
    path.join(baseDir, "conversations"),
    path.join(baseDir, "artifacts"),
    path.join(baseDir, "config"),
  ];

  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
}
```

**実行タイミング**:

- Electronアプリの `app.whenReady()` 時
- SkillScanner初回実行時（フォールバック）

**エラーハンドリング**:

- 作成失敗時はエラーログを出力し、ユーザーに通知
- 権限不足の場合は手動作成を案内

---

## 4. UI コンポーネント設計

### 4.1 スキル選択UI

```typescript
// 既存のLLMセレクターパターンを踏襲
interface SkillSelectorProps {
  skills: ImportedSkill[];
  selectedSkill: string | null;
  onSelect: (skillName: string | null) => void;
  onImport: () => void;
}
```

### 4.2 既存コンポーネントとの関係

```
ChatPanel
├── ModelSelector     ← 既存
├── SkillSelector     ← 新規（ModelSelectorと同じ行）
├── MessageList       ← 既存（拡張: スキル実行結果表示）
└── InputArea         ← 既存
```

### 4.3 状態管理

```typescript
// React Context for skill state
interface SkillContextValue {
  // 利用可能スキル（インポート済み + 未インポート）
  availableSkills: SkillMetadata[];
  // インポート済みスキル
  importedSkills: ImportedSkill[];
  // 選択中のスキル
  selectedSkill: string | null;
  // 実行中の状態
  isExecuting: boolean;
  // アクション
  importSkill: (name: string) => Promise<void>;
  removeSkill: (name: string) => Promise<void>;
  selectSkill: (name: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;
}
```

---

## 5. プロンプト構築戦略

### 5.1 構造

```
<command-name>/{skill-name}</command-name>

{SKILL.md 全文}

ARGUMENTS: {user-input}
```

### 5.2 コンテキスト読み込み

Claude Code本体のスキル実行と同様に:

1. SKILL.md 本文をコンテキストとして注入
2. agents/, references/ は必要時にLLMが読み込む（Progressive Disclosure）
3. scripts/ はBashツールで実行

### 5.3 Progressive Disclosure

```
[初期コンテキスト]
└── SKILL.md 本文のみ（500行以内）

[LLMが必要に応じて読み込み]
├── agents/{task}.md      ← Task実行時
├── references/{ref}.md   ← 詳細知識が必要時
└── assets/{template}     ← 出力生成時
```

---

## 6. エラーハンドリング

### 6.1 エラー分類

| カテゴリ       | 例            | 対処                        |
| -------------- | ------------- | --------------------------- |
| スキル読み込み | SKILL.md不正  | インポート拒否 + エラー表示 |
| SDK初期化      | APIキー未設定 | 設定画面へ誘導              |
| 実行時         | ツール失敗    | リトライ or ユーザー確認    |
| タイムアウト   | 長時間無応答  | AbortSignalで中断           |

### 6.2 リトライ戦略

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
```

---

## 7. セキュリティ設計

### 7.1 ツール使用制限

```typescript
// スキルのallowed-toolsをホワイトリストとして使用
const ALLOWED_TOOLS = ["Read", "Edit", "Write", "Bash", "Glob", "Grep"];

function validateAllowedTools(tools: string[]): string[] {
  return tools.filter((t) => ALLOWED_TOOLS.includes(t));
}
```

### 7.2 危険コマンドブロック

```typescript
const DANGEROUS_PATTERNS = [
  "rm -rf",
  "sudo",
  "chmod 777",
  "dd if=",
  ":(){:|:&};:", // fork bomb
];

function isDangerousCommand(command: string): boolean {
  return DANGEROUS_PATTERNS.some((p) => command.includes(p));
}
```

### 7.3 ファイルアクセス制限

- 作業ディレクトリ外へのアクセスは要確認
- システムディレクトリ（/etc, /sys等）は禁止
- 隠しファイル（.env等）は警告

---

## 8. パフォーマンス考慮

### 8.1 スキルスキャン最適化

```typescript
// スキャン結果をメモリキャッシュ
const skillCache = new Map<string, SkillMetadata>();

// ファイル変更時のみ再スキャン
const watcher = chokidar.watch("~/.aiworkflow/skills/**/SKILL.md");
watcher.on("change", (path) => {
  invalidateCache(path);
});
```

### 8.2 SKILL.md コンテンツキャッシュ

```typescript
// インポート時にSKILL.md本文もキャッシュ
interface ImportedSkill {
  // ...
  content?: string; // SKILL.md 本文
  contentHash?: string; // 変更検知用
}
```

---

## 9. 将来拡張性

### 9.1 Phase 2: エージェント固有出力

```typescript
// スキル別の出力ハンドラー
interface SkillOutputHandler {
  // 出力タイプ
  type: "html" | "slide" | "file" | "chart";
  // 出力処理
  handle(output: unknown): Promise<void>;
}

// presentation-slide-generator の場合
const slideHandler: SkillOutputHandler = {
  type: "slide",
  async handle(output) {
    // スライドプレビュー表示
    await showSlidePreview(output as SlideData);
  },
};
```

### 9.2 Phase 3: 複数エージェント連携

```typescript
// パイプライン実行
interface SkillPipeline {
  steps: Array<{
    skill: string;
    inputMapping: (prev: unknown) => string;
  }>;
}
```

---

## 10. スキル編集・管理機能

### 10.1 オプション比較

| 方式                | メリット                 | デメリット         |
| ------------------- | ------------------------ | ------------------ |
| A: 外部エディタ連携 | シンプル、既存ツール活用 | UX断絶、学習コスト |
| B: 組み込みエディタ | 統合UX、即座にプレビュー | 実装コスト高       |
| C: ハイブリッド     | 柔軟性、両方のメリット   | 複雑               |

### 10.2 選定結果

**B: 組み込みエディタ を採用**

理由:

1. スキルの編集→プレビュー→テストのループを高速化
2. YAML frontmatter のバリデーションを即座に実行可能
3. agents/, references/ のファイルツリー表示と編集を統合
4. Claude Agent SDKによる改善提案を直接反映

### 10.3 エディタ機能構成

```
SkillEditor
├── SkillFileTree      - ファイルツリーナビゲーション
├── SkillCodeEditor    - Monaco Editor統合
├── SkillPreview       - SKILL.md プレビュー
└── SkillValidation    - リアルタイムバリデーション
```

### 10.4 バックアップ戦略

```typescript
// バックアップ設定
const BACKUP_CONFIG = {
  maxBackups: 10, // 最大バックアップ数
  backupOnSave: true, // 保存時にバックアップ
  backupDir: ".skill-backups", // バックアップディレクトリ
};
```

---

## 11. skill-creator メタスキル設計

### 11.1 設計思想

skill-creatorは「スキルを生成するスキル」というメタスキルで、
無限にスキルを量産して作業を自動化する中核となる。

### 11.2 アーキテクチャ

```
skill-creator スキル
├── SKILL.md            - メタスキル本体
├── agents/
│   ├── task-generator.md    - タスク仕様書生成エージェント
│   ├── code-generator.md    - コード生成エージェント
│   └── validator.md         - 検証エージェント
├── references/
│   └── skill-structure.md   - スキル構造仕様
└── schemas/
    └── skill-schema.json    - スキルスキーマ定義
```

### 11.3 生成フロー

```
[ユーザー要求]
    │
    ▼
[要件抽出] ──────────▶ [タスク仕様書生成]
    │                         │
    │                         ▼
    │                  [コード生成]
    │                         │
    │                         ▼
    │                  [検証・テスト]
    │                         │
    ▼                         ▼
[新規スキル完成] ◀─────────────┘
```

### 11.4 Claude Agent SDK統合

```typescript
// skill-creatorはClaude Agent SDKを直接使用
import { query } from "@anthropic-ai/claude-agent-sdk";

async function createSkill(requirements: string): Promise<SkillMetadata> {
  const conversation = query({
    prompt: buildSkillCreationPrompt(requirements),
    options: {
      tools: ["Read", "Write", "Edit", "Bash", "Glob"],
      hooks: createSkillCreatorHooks(),
      permissionMode: "default",
    },
  });

  // ストリーミングで生成過程を表示
  for await (const msg of conversation.stream()) {
    handleCreationProgress(msg);
  }

  return extractCreatedSkill(conversation);
}
```

---

## 12. スキル改善（AI分析）

### 12.1 オプション比較

| 方式            | メリット         | デメリット         |
| --------------- | ---------------- | ------------------ |
| A: 静的解析のみ | 高速、確定的     | 限定的な改善       |
| B: AI分析のみ   | 深い洞察、創造的 | コスト、レイテンシ |
| C: ハイブリッド | 両方のメリット   | 実装複雑           |

### 12.2 選定結果

**C: ハイブリッド を採用**

理由:

1. 静的解析で明確な問題（構文エラー、不足フィールド）を即座に検出
2. AI分析でプロンプト改善、コンテキスト最適化を提案
3. ユーザーは両方の提案を確認してから適用を選択

### 12.3 分析パイプライン

```
[スキル読み込み]
      │
      ├──▶ [静的解析] ──▶ 構文エラー、スキーマ違反
      │
      └──▶ [AI分析] ──▶ プロンプト改善、効率化提案
             │
             ▼
      [改善提案マージ]
             │
             ▼
      [ユーザー確認] ──▶ [適用]
```

### 12.4 スコアリングシステム

```typescript
interface SkillScore {
  overall: number; // 総合スコア (0-100)
  categories: {
    clarity: number; // 明確さ
    efficiency: number; // 効率性
    security: number; // セキュリティ
    maintainability: number; // 保守性
  };
  suggestions: SkillSuggestion[];
}
```

---

## 13. スキルライフサイクル管理UI

### 13.1 UI構成

```
SkillManagementPanel
├── SkillListView       - スキル一覧（グリッド/リスト切替）
├── SkillAnalysisView   - 分析結果・スコア表示
├── SkillCreateWizard   - 新規スキル作成ウィザード
└── SkillSettings       - 個別スキル設定
```

### 13.2 ウィザードフロー

```
[Step 1: 基本情報]
    │ - スキル名
    │ - 説明
    │ - トリガーキーワード
    ▼
[Step 2: 許可ツール選択]
    │ - ツールチェックボックス
    │ - 権限レベル設定
    ▼
[Step 3: 構成選択]
    │ - agents/ 追加
    │ - references/ 追加
    │ - scripts/ 追加
    ▼
[Step 4: プレビュー・確認]
    │ - SKILL.md プレビュー
    │ - ディレクトリ構造確認
    ▼
[完了: スキル生成]
```

### 13.3 状態管理拡張

```typescript
// skillSlice拡張
interface SkillLifecycleState {
  // 分析関連
  analysisResults: Record<string, SkillScore>;
  isAnalyzing: boolean;

  // 作成関連
  wizardStep: number;
  wizardData: Partial<WizardData>;
  isCreating: boolean;

  // 編集関連
  editingSkill: string | null;
  unsavedChanges: boolean;

  // アクション
  analyzeSkill: (skillName: string) => Promise<void>;
  improveSkill: (skillName: string, suggestions: string[]) => Promise<void>;
  startWizard: () => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  finishWizard: () => Promise<void>;
}
```

---

## 14. 無限スキル量産アーキテクチャ

### 14.1 全体フロー

```
┌──────────────────┐
│  ユーザー要求     │
│  「〇〇機能作って」│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────────────────────────┐
│  skill-creator   │────▶│  新規スキルのタスク仕様書を生成       │
│  (メタスキル)    │     │  docs/30-workflows/{skill-name}/tasks/│
└────────┬─────────┘     └──────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────────────────────────┐
│  task-executor   │────▶│  タスク仕様書を順次実行               │
│  (実行エンジン)  │     │  依存順序に従い自動実装               │
└────────┬─────────┘     └──────────────────────────────────────┘
         │
         ▼
┌──────────────────────┐
│  完成したスキル       │
│  ~/.aiworkflow/skills/│
└────────┬─────────────┘
         │
         ▼ (このスキルが次の要求を処理)
┌──────────────────┐
│  新たな要求...    │ ──▶ 無限ループ
└──────────────────┘
```

### 14.2 タスク仕様書フォーマット

```yaml
# 必須フィールド
id: string # 一意識別子 (TASK-{PHASE}-{ID})
title: string # タスクタイトル
phase: number # フェーズ番号（実行優先度）
depends_on: string[] # 依存タスクID
status: enum # pending | in_progress | completed | blocked | failed

# 実行設定
execution:
  mode: enum # sequential | parallel | interactive
  timeout_minutes: number
  retry_count: number

# 検証設定
verification:
  auto_verify: boolean
  require_tests: boolean
  require_typecheck: boolean

# 成果物
artifacts:
  creates: string[] # 新規作成ファイル
  modifies: string[] # 修正ファイル
```

### 14.3 実行戦略

| モード      | 説明                         | ユースケース         |
| ----------- | ---------------------------- | -------------------- |
| sequential  | 依存順に1つずつ実行          | 依存関係が複雑な場合 |
| parallel    | 依存のないタスクを並列実行   | 独立したタスク群     |
| interactive | ユーザー確認を挟みながら実行 | リスクの高い操作     |

---

## 15. 対話的スキル作成の設計判断

### 15.1 オプション比較

| 方式                | メリット                       | デメリット                 |
| ------------------- | ------------------------------ | -------------------------- |
| A: ウィザード形式   | 構造化、入力バリデーション容易 | 柔軟性低、会話的でない     |
| B: 対話チャット形式 | 自然、柔軟、複雑要件に対応     | 実装複雑、状態管理が難しい |
| C: ハイブリッド     | 両方のメリット                 | UI複雑、学習コスト         |

### 15.2 選定結果

**B: 対話チャット形式 + クイック選択を採用**

理由:

1. スキル要件は多様で、固定ウィザードでは対応しきれない
2. AIがユーザーの曖昧な要求を解釈・明確化できる
3. API連携やコード実行の詳細を対話で確認できる
4. クイック選択ボタンで入力の手間を軽減

### 15.3 対話フェーズ設計

```
Phase 1: ニーズヒアリング
├── 何を実現したいか
├── 入力と出力の形式
└── 利用シーン

Phase 2: 連携方式の確認
├── API連携が必要か
├── どの外部サービスと連携するか
└── 認証方式（APIキー、OAuth等）

Phase 3: 実行方式の確認
├── コード実行が必要か
├── 使用言語/ランタイム
└── 依存パッケージ

Phase 4: セキュリティ・権限
├── 認証情報の保存方法
├── 許可するツール
└── アクセス制限

Phase 5: プレビュー・確認
├── SKILL.md構造確認
├── ディレクトリ構成確認
└── 最終確認

Phase 6: 生成・即時使用
├── スキル生成
├── テスト実行
└── セッション登録
```

---

## 16. 外部API連携の設計判断

### 16.1 オプション比較

| 方式                      | メリット           | デメリット                   |
| ------------------------- | ------------------ | ---------------------------- |
| A: Bashでcurl             | シンプル、汎用的   | 複雑なフロー困難、認証管理難 |
| B: 専用スクリプト生成     | 型安全、再利用可能 | 生成コード保守必要           |
| C: WebFetchツール直接使用 | SDK統合、シンプル  | 複雑なAPIには不十分          |

### 16.2 選定結果

**B: 専用スクリプト生成 + C: WebFetchツールのハイブリッド**

理由:

1. 単純なGET/POSTはWebFetchツールで直接実行
2. 複雑なAPI連携（OAuth、リトライ、レート制限）は専用スクリプト生成
3. 生成スクリプトはskill/scripts/配下に保存し再利用可能

### 16.3 サポートする連携パターン

| パターン | 説明                | 実装方式                      |
| -------- | ------------------- | ----------------------------- |
| REST API | GET/POST/PUT/DELETE | ApiIntegrationGenerator       |
| GraphQL  | Query/Mutation      | ApiIntegrationGenerator       |
| Webhook  | 受信/送信           | ApiIntegrationGenerator + IPC |
| CLI連携  | gh, gcloud, aws等   | ExternalToolGenerator         |
| MCP連携  | MCPサーバー統合     | ExternalToolGenerator         |

### 16.4 認証情報管理

| 方式           | セキュリティ | 利便性 | 採用          |
| -------------- | ------------ | ------ | ------------- |
| 環境変数       | 中           | 高     | ✅ デフォルト |
| macOS Keychain | 高           | 中     | ✅ オプション |
| 設定ファイル   | 低           | 高     | ⚠️ 非推奨     |
| 毎回入力       | 高           | 低     | ✅ オプション |

---

## 17. コード実行の設計判断

### 17.1 オプション比較

| 方式                  | メリット                 | デメリット                   |
| --------------------- | ------------------------ | ---------------------------- |
| A: Bashツールのみ     | シンプル、既存統合       | 複雑なコード困難             |
| B: 専用Executor       | 型安全、タイムアウト制御 | 実装コスト                   |
| C: サンドボックス実行 | セキュア                 | パフォーマンスオーバーヘッド |

### 17.2 選定結果

**B: 専用Executor + A: Bashフォールバック**

理由:

1. Node.js/Pythonコードは専用Executorで安全に実行
2. シンプルなシェルコマンドはBashツールを使用
3. タイムアウト・エラーハンドリングをExecutorで統一管理

### 17.3 サポートするランタイム

| ランタイム | 実装優先度 | 備考               |
| ---------- | ---------- | ------------------ |
| Node.js    | 高         | プロジェクト標準   |
| Bash       | 高         | Bashツール使用     |
| Python     | 中         | venv/conda対応検討 |
| Deno       | 低         | セキュアランタイム |
| Bun        | 低         | 高速ランタイム     |

### 17.4 セキュリティ考慮

```typescript
interface SandboxConfig {
  // ネットワークアクセス制御
  networkAccess: boolean;
  allowedHosts?: string[];

  // ファイルシステムアクセス制御
  fileSystemAccess: "none" | "read" | "readwrite";
  allowedPaths?: string[];

  // リソース制限
  timeout: number; // 実行タイムアウト（秒）
  maxMemory?: number; // メモリ上限（MB）
  maxCpu?: number; // CPU使用率上限（%）
}
```

---

## 18. 即時使用機能の設計判断

### 18.1 オプション比較

| 方式              | メリット               | デメリット       |
| ----------------- | ---------------------- | ---------------- |
| A: アプリ再起動   | 確実、シンプル         | UX悪い           |
| B: ホットリロード | UX良い、即座に使用可能 | 状態管理複雑     |
| C: 別セッション   | 分離された環境         | コンテキスト失う |

### 18.2 選定結果

**B: ホットリロード を採用**

理由:

1. スキル作成→即使用のUXを重視
2. Rendererへのイベント通知で状態更新
3. セッション内でのスキル切り替えをスムーズに

### 18.3 実装フロー

```
[スキル生成完了]
    │
    ▼
[SkillHotLoader.hotLoad()]
    │
    ├─▶ SkillScanner.scanOne()  // 新スキルのみスキャン
    │
    ├─▶ SkillImportStore.add()  // インポート済みに追加
    │
    └─▶ IPC: 'skill:hot-loaded' // Rendererに通知
         │
         ▼
    [skillSlice更新]
         │
         ▼
    [SkillSelectorに表示]
         │
         ▼
    [即座に選択・使用可能]
```

### 18.4 テスト実行機能

```typescript
interface TestRunConfig {
  // テストプロンプト
  testPrompt: string;

  // 期待結果（オプション）
  expectedOutput?: string;

  // 自動検証
  autoVerify: boolean;

  // ドライラン（実際の操作は行わない）
  dryRun: boolean;
}

// テスト結果
interface TestRunResult {
  success: boolean;
  output: string;
  executionTime: number;
  toolsUsed: string[];
  errors?: string[];
  warnings?: string[];
}
```

---

## 19. スキル連携・チェーン機能の設計判断

### 19.1 オプション比較

| 方式                       | メリット                 | デメリット             |
| -------------------------- | ------------------------ | ---------------------- |
| A: 単純な順次実行          | シンプル、実装容易       | 柔軟性低、条件分岐不可 |
| B: パイプライン構造        | データフロー明確、型安全 | 設計複雑               |
| C: DAG（有向非巡回グラフ） | 並列実行可、柔軟         | 実装・UI複雑           |

### 19.2 選定結果

**B: パイプライン構造 を採用**

理由:

1. 大半のユースケースは「A→B→C」の線形フロー
2. 入出力マッピングで柔軟なデータ変換が可能
3. UIでの視覚化がシンプル（ステップを縦に並べる）
4. 将来的にDAGへ拡張可能な設計

### 19.3 入出力マッピング方式

| 方式           | 説明                           | 採用 |
| -------------- | ------------------------------ | ---- |
| literal        | 固定値を渡す                   | ✅   |
| variable       | チェーン内変数を参照           | ✅   |
| template       | Mustacheテンプレートで構築     | ✅   |
| previousOutput | 前ステップの出力をそのまま渡す | ✅   |

---

## 20. フォーク・派生機能の設計判断

### 20.1 オプション比較

| 方式                   | メリット            | デメリット               |
| ---------------------- | ------------------- | ------------------------ |
| A: シンプルコピー      | 実装容易            | 元スキルとの関連が切れる |
| B: 継承ベース          | 変更追従可能        | 複雑、循環参照リスク     |
| C: コピー + メタデータ | シンプル + 追跡可能 | 手動での更新同期         |

### 20.2 選定結果

**C: コピー + メタデータ を採用**

理由:

1. スキルは独立して動作すべき（継承による複雑性を避ける）
2. フォーク元の情報を記録することで系譜を追跡可能
3. 必要に応じて手動でフォーク元の変更を取り込み可能
4. GitHubのフォークモデルに類似した直感的なUX

### 20.3 メタデータ記録

```typescript
interface ForkMetadata {
  forkedFrom: string; // フォーク元スキル名
  forkedAt: string; // フォーク日時
  originalPath: string; // フォーク元のパス
  upstreamVersion?: string; // フォーク時のバージョン（将来用）
}
```

---

## 21. 共有・インポート機能の設計判断

### 21.1 オプション比較

| 方式                | メリット             | デメリット         |
| ------------------- | -------------------- | ------------------ |
| A: GitHub専用       | 強力なバージョン管理 | GitHub依存         |
| B: 汎用URL          | シンプル             | セキュリティリスク |
| C: マルチソース対応 | 柔軟                 | 実装コスト高       |

### 21.2 選定結果

**C: マルチソース対応 を採用**

対応ソース:

| ソース   | 優先度 | 備考                       |
| -------- | ------ | -------------------------- |
| GitHub   | 高     | リポジトリ、パス指定       |
| Gist     | 高     | 単一スキル共有に最適       |
| URL      | 中     | raw URLでSKILL.mdを指定    |
| ローカル | 高     | ファイルシステムからコピー |

### 21.3 セキュリティ考慮

```typescript
// インポート時の検証
interface ImportValidation {
  // SKILL.mdの存在チェック
  hasSkillMd: boolean;
  // 許可ツールの検証
  allowedToolsValid: boolean;
  // 危険パターンのスキャン
  securityScan: {
    suspicious: boolean;
    warnings: string[];
  };
}
```

---

## 22. スケジュール実行機能の設計判断

### 22.1 オプション比較

| 方式                  | メリット               | デメリット           |
| --------------------- | ---------------------- | -------------------- |
| A: OS cronを利用      | 信頼性高、リソース軽量 | プラットフォーム依存 |
| B: Node.js cron       | クロスプラットフォーム | アプリ起動時のみ動作 |
| C: 永続化スケジューラ | アプリ非起動時も実行可 | 複雑、別プロセス必要 |

### 22.2 選定結果

**B: Node.js cron（node-cron）を採用**

理由:

1. Electronアプリ内で完結（追加依存なし）
2. クロスプラットフォーム対応
3. アプリ起動時に十分なユースケース
4. 将来的にOS cronへの委譲も可能

### 22.3 スケジュールタイプ設計

| タイプ   | 実装方式         | 永続化 |
| -------- | ---------------- | ------ |
| cron     | node-cron        | ✅     |
| interval | setInterval      | ✅     |
| once     | setTimeout       | ✅     |
| event    | EventEmitter連携 | ✅     |

---

## 23. デバッグモード機能の設計判断

### 23.1 オプション比較

| 方式                 | メリット           | デメリット |
| -------------------- | ------------------ | ---------- |
| A: ログ出力のみ      | シンプル           | 介入不可   |
| B: 完全デバッガ      | 強力なデバッグ機能 | 実装複雑   |
| C: Hooks活用ブレーク | SDK統合、柔軟      | SDK依存    |

### 23.2 選定結果

**C: Hooks活用ブレークポイント を採用**

理由:

1. Claude Agent SDKのPreToolUse/PostToolUseを活用
2. ツール呼び出し前後でインターセプト可能
3. 変数の検査・操作が可能
4. 既存のHooksシステムと統合

### 23.3 ブレークポイント設計

```typescript
interface BreakpointConfig {
  type: "tool" | "message" | "condition";

  // tool: 特定ツール呼び出し時
  toolName?: string;

  // message: メッセージパターンマッチ
  messagePattern?: string;

  // condition: JavaScript式評価
  condition?: string;
}
```

---

## 24. ドキュメント自動生成機能の設計判断

### 24.1 オプション比較

| 方式                  | メリット         | デメリット   |
| --------------------- | ---------------- | ------------ |
| A: テンプレートベース | 高速、一貫性     | 柔軟性低     |
| B: LLM生成            | 自然な文章、柔軟 | コスト、遅延 |
| C: ハイブリッド       | 両方のメリット   | 実装複雑     |

### 24.2 選定結果

**C: ハイブリッド を採用**

理由:

1. 構造（目次、セクション）はテンプレートで統一
2. 内容（説明、例）はLLMで生成
3. コスト効率と品質のバランス
4. ユーザーが生成セクションを選択可能

### 24.3 生成フロー

```
[スキル読み込み]
    │
    ├─▶ [テンプレート適用] ──▶ 構造生成
    │
    └─▶ [LLM呼び出し] ──▶ 内容生成
             │
             ▼
       [マージ・フォーマット]
             │
             ▼
       [出力（md/html/pdf）]
```

---

## 25. 使用統計・分析機能の設計判断

### 25.1 オプション比較

| 方式                | メリット           | デメリット       |
| ------------------- | ------------------ | ---------------- |
| A: メモリ内統計のみ | シンプル           | セッション限定   |
| B: ローカル永続化   | 履歴保持、分析可能 | ストレージ使用   |
| C: 外部サービス連携 | 高度な分析         | プライバシー懸念 |

### 25.2 選定結果

**B: ローカル永続化（electron-store）を採用**

理由:

1. ユーザーデータをローカルに保持（プライバシー重視）
2. 既存のelectron-storeインフラを活用
3. 十分な分析機能を提供可能
4. 将来的にエクスポート機能を追加可能

### 25.3 データ収集項目

| 項目             | 収集目的               | 保存期間 |
| ---------------- | ---------------------- | -------- |
| 実行日時         | 使用パターン分析       | 1年      |
| 実行時間         | パフォーマンス分析     | 1年      |
| 使用ツール       | ツール使用傾向         | 1年      |
| 成功/失敗        | 信頼性分析             | 1年      |
| エラーメッセージ | トラブルシューティング | 3ヶ月    |

### 25.4 プライバシー配慮

```typescript
// 収集しないデータ
const EXCLUDED_DATA = [
  "user_prompt", // ユーザー入力プロンプト
  "skill_output", // スキル出力内容
  "file_contents", // ファイル内容
  "api_keys", // 認証情報
];

// 匿名化処理
function anonymize(execution: SkillExecution): AnonymizedExecution {
  return {
    ...execution,
    skillName: execution.skillName, // スキル名は保持
    prompt: undefined, // プロンプトは削除
    output: undefined, // 出力は削除
    error: categorizeError(execution.error), // エラーはカテゴリ化
  };
}
```

---

## 26. 関連ドキュメント

- [仕様書](./specification.md)
- [タスク一覧](./tasks/index.md)
- [Claude Agent SDK リファレンス](/.claude/skills/claude-agent-sdk/references/query-api.md)
- [既存AgentExecutor](../../../apps/desktop/src/main/services/agent/AgentExecutor.ts)
- [skill-creator統合仕様](./tasks/_skill-creator-integration.md)
