# スキルインポート機能 実装タスク仕様書

## 概要

本ドキュメントは、スキルインポート機能の実装タスクを責務ごとに分離し、並列実行可能な部分を明確化した実行計画である。

## 依存関係グラフ

```
Phase 1: 基盤層（型定義）
    │
    ▼
Phase 2: サービス層（並列実行可能）
┌───┴───┬───────────┐
│       │           │
▼       ▼           ▼
2A      2B          2C
Scanner Store       Security
│       │           │
└───┬───┴───────────┘
    │
    ▼
Phase 3: 実行エンジン
    │
    ▼
Phase 4: IPC層
    │
    ▼
Phase 5: Preload API
    │
    ▼
Phase 6: 状態管理（Zustand）
    │
    ▼
Phase 7: UIコンポーネント（並列実行可能）
┌───┴───┬───────────┐
│       │           │
▼       ▼           ▼
7A      7B          7C
Selector Dialog     Permission
    │
    ▼
Phase 8: テスト（並列実行可能）
┌───┴───┬───────────┐
│       │           │
▼       ▼           ▼
8A      8B          8C
Unit    Component   Integration
    │
    ▼
Phase 9: スキル管理拡張（並列実行可能）
┌───┴───┬───────────┐
│       │           │
▼       ▼           ▼
9A      9B          9C
Editor  skill-      Improver
        creator
            │
            ▼
Phase 9 Extended: 高度なスキル管理（並列実行可能）
┌───┴───┬───────────┬───────────┐
│       │           │           │
▼       ▼           ▼           ▼
9D      9E          9F          9G
Chain   Forker      Share       Schedule
│       │           │           │
├───────┴───────────┴───────────┤
│                               │
▼                               ▼
9H          9I          9J
Debugger    DocGen      Analytics
    │
    ▼
Phase 10: ライフサイクル管理
    │
    ▼
10A: SkillManagementPanel + CreateWizard
```

---

## Phase 1: 型定義（基盤層）

**依存関係**: なし（最初に実行必須）
**並列実行**: 不可
**推定規模**: 小

### タスク 1.1: 共通型定義の作成

**ファイル**: `packages/shared/src/types/skill.ts`

**実装内容**:

- `SkillMetadata` - スキルメタデータ型
- `SkillSubResource` - サブリソース型
- `SkillOtherFile` - その他ファイル型
- `ImportedSkill` - インポート済みスキル型
- `SkillExecutionRequest` / `SkillExecutionResponse`
- `SkillExecutionStatus`
- `SkillStreamMessage` (Discriminated Union)
- `PermissionRequest` / `PermissionResponse`

**完了条件**:

- [ ] 全型定義が作成されている
- [ ] 型エクスポートが `packages/shared/src/index.ts` に追加されている
- [ ] TypeScript コンパイルが通る

---

## Phase 2: サービス層（並列実行可能）

**依存関係**: Phase 1 完了後
**並列実行**: 2A, 2B, 2C は同時実行可能

### タスク 2A: SkillScanner 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillScanner.ts`

**実装内容**:

- `scanAll()` - 全スキルスキャン
- `parseSkill()` - 単一スキルパース
- `scanSubDirectory()` - サブディレクトリスキャン
- `scanOtherFiles()` - その他ファイルスキャン
- `extractDescription()` - 説明抽出
- `parseFrontmatter()` - YAML Frontmatter パース

**依存パッケージ**:

- `yaml` - YAMLパース用
- `fs/promises` - ファイルシステム操作

**完了条件**:

- [ ] `~/.aiworkflow/skills/`（読み書き）と `~/.claude/skills/`（読み取り専用）の両方をスキャン
- [ ] `~/.aiworkflow/` ディレクトリが存在しない場合は自動作成
- [ ] 6つのサブディレクトリ（agents, references, scripts, assets, schemas, indexes）をスキャン
- [ ] SKILL.md からメタデータを抽出
- [ ] スキルのソース（aiworkflow/claude）を識別
- [ ] 単体テスト作成・通過

### タスク 2B: SkillImportStore 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillImportStore.ts`

**実装内容**:

- `get()` - インポート済みスキル取得
- `add()` - スキルインポート
- `remove()` - スキル削除
- `update()` - スキル更新
- `exists()` - 存在確認
- スキーマバージョン対応

**依存パッケージ**:

- `electron-store` - 永続化

**完了条件**:

- [ ] CRUD操作が実装されている
- [ ] スキーマバージョン管理が実装されている
- [ ] 単体テスト作成・通過

### タスク 2C: セキュリティパターン定義

**ファイル**: `packages/shared/src/constants/security.ts`

**実装内容**:

- `DANGEROUS_PATTERNS.BASH_COMMANDS` - 危険コマンドパターン
- `DANGEROUS_PATTERNS.PROTECTED_PATHS` - 保護パスパターン
- `matchPath()` - パスマッチング関数

**完了条件**:

- [ ] 危険コマンドリストが定義されている
- [ ] 保護パスリストが定義されている
- [ ] パスマッチング関数が実装されている

---

## Phase 3: 実行エンジン

**依存関係**: Phase 2A (SkillScanner) 完了後
**並列実行**: 不可

### タスク 3.1: SkillExecutor 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

**実装内容**:

- `execute()` - スキル実行
- `abort()` - 実行中止
- `handlePermissionResponse()` - 権限応答処理
- `buildPrompt()` - プロンプト構築
- `buildContextInfo()` - コンテキスト情報構築
- `createHooks()` - SDK Hooks 作成

**依存パッケージ**:

- `@anthropic-ai/claude-agent-sdk` - Claude Agent SDK
- `uuid` - UUID生成

**SDK統合仕様**:

- `query()` API 使用
- `stream()` メソッドでストリーミング
- Hooks: `PreToolUse`, `PostToolUse`, `PermissionRequest`

**完了条件**:

- [ ] Claude Agent SDK 統合が実装されている
- [ ] ストリーミング処理が実装されている
- [ ] 権限確認フローが実装されている
- [ ] 危険コマンド・保護パスのブロックが実装されている

### タスク 3.2: PermissionResolver 実装

**ファイル**: `apps/desktop/src/main/services/skill/PermissionResolver.ts`

**実装内容**:

- `waitForResponse()` - 権限応答待機
- `resolveRequest()` - リクエスト解決
- `pendingRequests` 管理

**完了条件**:

- [ ] 権限リクエストの待機・解決が実装されている
- [ ] AbortSignal によるキャンセルが対応されている

---

## Phase 4: IPC層

**依存関係**: Phase 2 全体 + Phase 3 完了後
**並列実行**: 不可

### タスク 4.1: IPCチャネル定義

**ファイル**: `apps/desktop/src/preload/channels.ts`

**実装内容**:

```typescript
SKILL_CHANNELS = {
  SKILL_LIST,
  SKILL_SCAN,
  SKILL_IMPORT,
  SKILL_REMOVE,
  SKILL_GET_IMPORTED,
  SKILL_UPDATE,
  SKILL_EXECUTE,
  SKILL_ABORT,
  SKILL_STREAM,
  SKILL_COMPLETE,
  SKILL_ERROR,
  SKILL_PERMISSION_REQUEST,
  SKILL_PERMISSION_RESPONSE,
};
```

**完了条件**:

- [ ] 全チャネルが定義されている

### タスク 4.2: IPCハンドラー実装

**ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**実装内容**:

- `skill:list` → `SkillScanner.scanAll()`
- `skill:scan` → `SkillScanner.scanAll()` (キャッシュ無効化)
- `skill:import` → `SkillImportStore.add()`
- `skill:remove` → `SkillImportStore.remove()`
- `skill:getImported` → `SkillImportStore.get()`
- `skill:execute` → `SkillExecutor.execute()`
- `skill:abort` → `SkillExecutor.abort()`
- `skill:permission:response` → `SkillExecutor.handlePermissionResponse()`

**完了条件**:

- [ ] 全ハンドラーが実装されている
- [ ] エラーハンドリングが実装されている

---

## Phase 5: Preload API

**依存関係**: Phase 4 完了後
**並列実行**: 不可

### タスク 5.1: SkillAPI 実装

**ファイル**: `apps/desktop/src/preload/skill-api.ts`

**実装内容**:

```typescript
interface SkillAPI {
  list(): Promise<SkillMetadata[]>;
  rescan(): Promise<SkillMetadata[]>;
  import(skillName: string): Promise<ImportedSkill>;
  getImported(): Promise<ImportedSkill[]>;
  remove(skillName: string): Promise<void>;
  execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>;
  abort(executionId: string): Promise<void>;
  respondToPermission(response: PermissionResponse): void;
  onStream(callback): () => void;
  onComplete(callback): () => void;
  onError(callback): () => void;
  onPermissionRequest(callback): () => void;
}
```

**完了条件**:

- [ ] 全APIメソッドが実装されている
- [ ] `window.electronAPI.skill` に公開されている
- [ ] 型定義が一致している

---

## Phase 6: 状態管理（Zustand）

**依存関係**: Phase 5 完了後
**並列実行**: 不可

### タスク 6.1: SkillSlice 実装

**ファイル**: `apps/desktop/src/renderer/store/slices/skillSlice.ts`

**実装内容**:

- 状態:
  - `availableSkills`, `importedSkills`
  - `selectedSkillName`, `isExecuting`, `executionId`
  - `executionStatus`, `streamingMessages`
  - `pendingPermission`, `skillError`
  - ローディング状態（`isLoadingSkills`, `isScanning`, `isImporting`）
- アクション:
  - `fetchSkills`, `rescanSkills`
  - `importSkill`, `removeSkill`, `selectSkill`
  - `executeSkill`, `abortExecution`
  - `respondToPermission`, `clearError`
- 内部ハンドラー:
  - `_handleStreamMessage`, `_handleComplete`
  - `_handleError`, `_handlePermissionRequest`

**完了条件**:

- [ ] 全状態が定義されている
- [ ] 全アクションが実装されている
- [ ] IPCイベントリスナーが設定されている
- [ ] 既存store（`useAppStore`）への統合

---

## Phase 7: UIコンポーネント（並列実行可能）

**依存関係**: Phase 6 完了後
**並列実行**: 7A, 7B, 7C は同時実行可能

### タスク 7A: SkillSelector コンポーネント

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

**実装内容**:

- ドロップダウン形式のスキル選択UI
- インポート済み / 利用可能 のセクション分け
- スキル概要表示（サブエージェント数、参照資料数）
- 「インポート」ボタン
- 「再スキャン」ボタン
- アクセシビリティ対応（ARIA属性、キーボードナビゲーション）

**完了条件**:

- [ ] ドロップダウンUIが実装されている
- [ ] スキル選択が機能する
- [ ] アクセシビリティ要件を満たしている

### タスク 7B: SkillImportDialog コンポーネント

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`

**実装内容**:

- スキル詳細情報表示:
  - 基本情報（名前、説明）
  - 許可ツール一覧
  - agents/ 一覧
  - references/ 一覧
  - scripts/ 一覧
  - assets/ 一覧
- インポート / キャンセル ボタン
- ローディング状態表示

**完了条件**:

- [ ] 全詳細情報が表示される
- [ ] インポート処理が機能する
- [ ] ローディング状態が表示される

### タスク 7C: PermissionDialog コンポーネント

**ファイル**: `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`

**実装内容**:

- 権限確認モーダル
- ツール名・引数の表示
- 「拒否」「1回許可」「許可」ボタン
- 「このセッション中は自動許可」チェックボックス

**完了条件**:

- [ ] 権限情報が表示される
- [ ] 3つの選択肢が機能する
- [ ] 自動許可オプションが機能する

### タスク 7D: ChatPanel 統合

**ファイル**: `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（既存ファイル修正）

**実装内容**:

- SkillSelector を ModelSelector の隣に配置
- スキル実行結果のストリーミング表示
- ツール実行履歴の表示

**完了条件**:

- [ ] SkillSelector が配置されている
- [ ] 既存機能に影響がない
- [ ] スキル実行結果が表示される

---

## Phase 8: テスト

**依存関係**: 各Phase完了後、該当テストを実行可能
**並列実行**: テスト種別ごとに並列実行可能

### タスク 8A: 単体テスト

| 対象               | ファイル                               |
| ------------------ | -------------------------------------- |
| SkillScanner       | `__tests__/SkillScanner.test.ts`       |
| SkillImportStore   | `__tests__/SkillImportStore.test.ts`   |
| SkillExecutor      | `__tests__/SkillExecutor.test.ts`      |
| PermissionResolver | `__tests__/PermissionResolver.test.ts` |
| skillSlice         | `__tests__/skillSlice.test.ts`         |

### タスク 8B: コンポーネントテスト

| 対象              | ファイル                               |
| ----------------- | -------------------------------------- |
| SkillSelector     | `__tests__/SkillSelector.test.tsx`     |
| SkillImportDialog | `__tests__/SkillImportDialog.test.tsx` |
| PermissionDialog  | `__tests__/PermissionDialog.test.tsx`  |

### タスク 8C: 統合テスト

| 対象       | ファイル                            |
| ---------- | ----------------------------------- |
| IPC通信    | `__tests__/skillIpc.integration.ts` |
| 実行フロー | `__tests__/skillExecution.e2e.ts`   |

---

## Phase 9: スキル管理拡張

**依存関係**: Phase 8 全体完了後
**並列実行**: 9A, 9B, 9C は同時実行可能

### タスク 9A: SkillEditor 実装

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`

**実装内容**:

- SKILL.md の視覚的編集
- Frontmatter 編集フォーム
- Markdown プレビュー

### タスク 9B: skill-creator メタスキル実装

**ファイル**: `~/.aiworkflow/skills/skill-creator/`

> 注: Claude Code CLIのskill-creatorとは別に、AIWorkflowOrchestrator独自のskill-creatorを作成する

**実装内容**:

- 対話的スキル作成ウィザード
- 7つの追加コマンド（chain, fork, share, schedule, debug, docs, stats）
- API連携によるコード生成

### タスク 9C: SkillImprover 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillImprover.ts`

**実装内容**:

- 既存スキルの分析・改善提案
- LLMによるリファクタリング支援

---

## Phase 9 Extended: 高度なスキル管理機能

**依存関係**: TASK-9B 完了後
**並列実行**: 9D-9G は同時実行可能、9H-9J は同時実行可能

### タスク 9D: スキルチェーン機能

**ファイル**: `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`

**実装内容**:

- SkillChainDefinition / SkillChainStep 型
- 入出力マッピング（literal, variable, template, previousOutput）
- 条件分岐（ifVariable, ifPreviousSuccess, expression）
- エラーハンドリング（stop, skip, retry）

### タスク 9E: スキルフォーク・派生機能

**ファイル**: `apps/desktop/src/main/services/skill/SkillForker.ts`

**実装内容**:

- 既存スキルをコピーして新スキル作成
- コピー対象選択（agents, references, scripts, assets）
- forked-from メタデータ記録

### タスク 9F: スキル共有・インポート機能

**ファイル**: `apps/desktop/src/main/services/skill/SkillShareManager.ts`

**実装内容**:

- GitHub/Gist/URL/Local からのインポート
- Gist へのエクスポート
- セキュリティ検証

### タスク 9G: スキルスケジュール実行機能

**ファイル**: `apps/desktop/src/main/services/skill/SkillScheduler.ts`

**実装内容**:

- node-cron によるスケジュール実行
- cron/interval/once/event トリガー
- electron-store による永続化

### タスク 9H: スキルデバッグモード

**ファイル**: `apps/desktop/src/main/services/skill/SkillDebugger.ts`

**実装内容**:

- ブレークポイント設定
- ステップ実行（Continue, Step Over, Step Into）
- 変数インスペクション
- Claude Agent SDK Hooks 統合

### タスク 9I: スキルドキュメント生成機能

**ファイル**: `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`

**実装内容**:

- LLM によるドキュメント自動生成
- Markdown/HTML/PDF 出力
- テンプレートベース生成

### タスク 9J: スキル使用統計・分析機能

**ファイル**: `apps/desktop/src/main/services/skill/SkillAnalytics.ts`

**実装内容**:

- 使用イベント記録
- 統計計算（成功率、平均実行時間）
- ダッシュボード表示
- recharts によるグラフ

---

## Phase 10: ライフサイクル管理

**依存関係**: Phase 9 全体完了後
**並列実行**: 不可

### タスク 10A: SkillManagementPanel + CreateWizard

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

**実装内容**:

- スキルライフサイクル管理UI
- 作成ウィザード統合
- 全7機能（chain, fork, share, schedule, debug, docs, stats）へのアクセス
- 統合ダッシュボード

---

## 実行順序サマリー

```
Week 1:
┌─────────────────────────────────────────────────────────┐
│ Day 1-2: Phase 1 (型定義)                               │
├─────────────────────────────────────────────────────────┤
│ Day 3-4: Phase 2 (並列実行)                             │
│  ├── 2A: SkillScanner       ─┐                         │
│  ├── 2B: SkillImportStore    ├── 同時実行可能           │
│  └── 2C: Security Patterns  ─┘                         │
├─────────────────────────────────────────────────────────┤
│ Day 5: Phase 3 (SkillExecutor, PermissionResolver)     │
└─────────────────────────────────────────────────────────┘

Week 2:
┌─────────────────────────────────────────────────────────┐
│ Day 1: Phase 4 (IPC層)                                  │
├─────────────────────────────────────────────────────────┤
│ Day 2: Phase 5 (Preload API)                            │
├─────────────────────────────────────────────────────────┤
│ Day 3: Phase 6 (Zustand Slice)                          │
├─────────────────────────────────────────────────────────┤
│ Day 4-5: Phase 7 (並列実行)                             │
│  ├── 7A: SkillSelector      ─┐                         │
│  ├── 7B: SkillImportDialog   ├── 同時実行可能           │
│  ├── 7C: PermissionDialog   ─┘                         │
│  └── 7D: ChatPanel統合                                  │
└─────────────────────────────────────────────────────────┘

Week 3:
┌─────────────────────────────────────────────────────────┐
│ Day 1-3: Phase 8 (テスト)                               │
│  ├── 8A: 単体テスト         ─┐                         │
│  ├── 8B: コンポーネントテスト ├── 同時実行可能          │
│  └── 8C: 統合テスト         ─┘                         │
├─────────────────────────────────────────────────────────┤
│ Day 4-5: バグ修正・調整                                 │
└─────────────────────────────────────────────────────────┘

Week 4:
┌─────────────────────────────────────────────────────────┐
│ Day 1-2: Phase 9 (スキル管理拡張)                       │
│  ├── 9A: SkillEditor        ─┐                         │
│  ├── 9B: skill-creator       ├── 同時実行可能           │
│  └── 9C: SkillImprover      ─┘                         │
├─────────────────────────────────────────────────────────┤
│ Day 3-5: Phase 9 Extended (高度なスキル管理 - 並列)    │
│  ├── 9D: SkillChain         ─┐                         │
│  ├── 9E: SkillForker         ├── 同時実行可能           │
│  ├── 9F: SkillShareManager   │                         │
│  ├── 9G: SkillScheduler     ─┘                         │
│  ├── 9H: SkillDebugger      ─┐                         │
│  ├── 9I: SkillDocGenerator   ├── 同時実行可能           │
│  └── 9J: SkillAnalytics     ─┘                         │
└─────────────────────────────────────────────────────────┘

Week 5:
┌─────────────────────────────────────────────────────────┐
│ Day 1-3: Phase 10 (ライフサイクル管理)                  │
│  └── 10A: SkillManagementPanel + CreateWizard          │
├─────────────────────────────────────────────────────────┤
│ Day 4-5: 最終テスト・バグ修正                           │
└─────────────────────────────────────────────────────────┘
```

---

## リスク・注意点

1. **Claude Agent SDK バージョン互換性**
   - v0.1.73+ の Hooks 仕様を確認
   - `stream()` メソッドの存在確認

2. **electron-store スキーマ移行**
   - 既存データの移行計画が必要
   - `schemaVersion` による互換性管理

3. **既存AgentView/AgentExecutionViewとの統合**
   - 既存機能を壊さないよう注意
   - 段階的な機能追加を推奨

4. **パフォーマンス**
   - スキルスキャンのキャッシュ戦略
   - chokidar によるファイル監視の実装

---

## Appendix A: データ永続化詳細

### A.1 SkillImportStore スキーマ

**ファイル**: `apps/desktop/src/main/settings/skillImportStore.ts`

```typescript
interface SkillStoreSchema {
  /** スキーマバージョン（マイグレーション用） */
  schemaVersion: number;

  /** インポート済みスキル（キー: スキル名） */
  importedSkills: Record<string, ImportedSkillData>;

  /** スキル個別設定（キー: スキル名） */
  skillSettings: Record<string, SkillSettings>;

  /** 最終スキャン日時（キャッシュ用） */
  lastScanAt?: string;

  /** スキルメタデータキャッシュ */
  skillCache?: Record<string, { metadata: SkillMetadata; cachedAt: string }>;
}

interface ImportedSkillData {
  name: string;
  source: "aiworkflow" | "claude"; // スキルのソースを識別
  importedAt: string; // ISO文字列
  status: "active" | "disabled";
  lastUsedAt?: string; // ISO文字列
}

interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}
```

### A.2 マイグレーション

```typescript
const CURRENT_SCHEMA_VERSION = 1;

const store = new Store<SkillStoreSchema>({
  name: "skill-imports",
  defaults: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    importedSkills: {},
    skillSettings: {},
  },
  migrations: {
    "1": (store) => {
      store.set("schemaVersion", 1);
    },
    // 将来のマイグレーション:
    // '2': (store) => { ... }
  },
});
```

### A.3 API一覧

| メソッド               | 説明                     |
| ---------------------- | ------------------------ |
| `getImported()`        | インポート済みスキル一覧 |
| `addImport(name)`      | スキルをインポート       |
| `removeImport(name)`   | スキルを削除             |
| `getSettings(name)`    | スキル設定を取得         |
| `updateSettings()`     | スキル設定を更新         |
| `rememberPermission()` | 権限設定を記憶           |

---

## Appendix B: セキュリティパターン完全版

### B.1 危険コマンドパターン (BASH_COMMANDS)

```typescript
const DANGEROUS_BASH_COMMANDS = [
  // 破壊的コマンド
  "rm -rf",
  "rm -r",
  "> /dev/",
  "dd if=",
  "mkfs",

  // 権限昇格
  "sudo",
  "su -",
  "su ",

  // シェル操作
  "chmod 777",
  "chown root",
  "chattr",
  "setfacl",

  // コマンド置換（インジェクション防止）
  "$(",
  "`",

  // 危険なシェル起動
  "/bin/sh",
  "/bin/bash",
  "bash -c",
  "sh -c",

  // 評価・実行
  "eval ",
  "exec ",
  "source ",

  // スケジューラ操作
  "crontab",
  "at ",

  // フォークボム
  ":(){ :|:& };:",
] as const;
```

### B.2 保護パスパターン (PROTECTED_PATHS)

```typescript
const PROTECTED_PATHS = [
  // システムディレクトリ
  "/etc/**",
  "/usr/**",
  "/var/**",
  "/sys/**",
  "/proc/**",
  "/boot/**",
  "/root/**",

  // シェル設定ファイル
  "**/.bashrc",
  "**/.bash_profile",
  "**/.bash_login",
  "**/.zshrc",
  "**/.zshenv",
  "**/.zprofile",
  "**/.profile",

  // 認証・鍵ファイル
  "~/.ssh/**",
  "~/.gnupg/**",

  // クラウド認証情報
  "~/.aws/**",
  "~/.azure/**",
  "~/.kube/**",
  "~/.config/gcloud/**",

  // アプリケーション認証情報
  "**/.env",
  "**/.env.local",
  "**/.env.production",
  "**/credentials.json",
  "**/secrets.json",
] as const;
```

### B.3 許可ツールホワイトリスト

```typescript
const ALLOWED_TOOLS_WHITELIST = [
  "Read",
  "Write",
  "Edit",
  "Bash",
  "Glob",
  "Grep",
  "LS",
  "Task",
  "WebSearch",
  "WebFetch",
  "TodoWrite",
] as const;
```

### B.4 入力サニタイズ要件

- パス操作時は `path.normalize()` でトラバーサル攻撃を防止
- コマンド引数は適切にクォート
- ユーザー入力はそのまま使用せず、エスケープ処理

---

## Appendix C: 既存システムとの整合性

### C.1 UIコンポーネントパターン

| 既存コンポーネント | 新規コンポーネント | 準拠ポイント                       |
| ------------------ | ------------------ | ---------------------------------- |
| ModelSelector      | SkillSelector      | ドロップダウンUI、選択状態管理     |
| LLMSelectorPanel   | SkillSelectorPanel | パネルレイアウト、セクション区切り |
| ChatInput          | -                  | 変更なし、スキル選択時も同じ入力欄 |
| MessageList        | -                  | ツール使用表示を拡張               |

### C.2 Storeパターン

| 既存Slice | 新規Slice  | 準拠ポイント                         |
| --------- | ---------- | ------------------------------------ |
| ChatSlice | SkillSlice | 状態管理パターン、アクション命名規則 |
| LLMSlice  | SkillSlice | 選択状態、フェッチパターン           |

### C.3 IPCパターン

| 既存ハンドラ  | 新規ハンドラ  | 準拠ポイント                     |
| ------------- | ------------- | -------------------------------- |
| agentHandlers | skillHandlers | ハンドラ登録パターン、エラー処理 |
| preload API   | skill API     | safeInvoke/safeOnパターン        |

---

## Appendix D: 利用可能スキル一覧

### D.1 Claude Code CLI スキル（読み取り専用インポート）

`~/.claude/skills/` 配下に存在するスキル:

| スキル名                     | 説明                 | Allowed Tools           |
| ---------------------------- | -------------------- | ----------------------- |
| aiworkflow-requirements      | プロジェクト仕様管理 | -                       |
| claude-agent-sdk             | Agent SDK統合支援    | -                       |
| github-issue-manager         | GitHub Issue管理     | Bash, Read, Write, Edit |
| presentation-slide-generator | HTMLスライド生成     | Read, Write, Edit, Bash |
| skill-creator                | スキル作成支援       | -                       |
| task-specification-creator   | タスク仕様書作成     | -                       |

### D.2 AIWorkflowOrchestrator スキル

`~/.aiworkflow/skills/` 配下に保存されるスキル（アプリで作成・管理）:

| スキル名                   | 説明 | 備考                     |
| -------------------------- | ---- | ------------------------ |
| (ユーザーが作成したスキル) | -    | アプリ内で作成・編集可能 |

---

## Appendix E: エラーハンドリング

### E.1 エラー分類

| カテゴリ       | 例            | 対処                        |
| -------------- | ------------- | --------------------------- |
| スキル読み込み | SKILL.md不正  | インポート拒否 + エラー表示 |
| SDK初期化      | APIキー未設定 | 設定画面へ誘導              |
| 実行時         | ツール失敗    | リトライ or ユーザー確認    |
| タイムアウト   | 長時間無応答  | AbortSignalで中断           |
| 権限拒否       | ユーザー拒否  | 実行キャンセル + 通知       |
| ネットワーク   | API接続失敗   | リトライ + エラー表示       |

### E.2 リトライ戦略

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};
```

---

## 関連ドキュメント

- [仕様書](../../specification.md)
- [技術選定・設計判断](../../technical-decisions.md)
