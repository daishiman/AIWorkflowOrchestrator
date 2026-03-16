# Electron Main Process サービス / detail specification — Part 2: 高度なサービス・統合・永続化

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 分割元: [arch-electron-services-details.md](arch-electron-services-details.md)
> Part 1: [arch-electron-services-details-part1.md](arch-electron-services-details-part1.md)
> 役割: detail specification（SkillForker・RuntimeResolver・SkillScheduler・DI統合・永続化）

## SkillForker（TASK-9E）

`SkillForker` は Skill API ドメインでのフォーク実体処理を担当する。`SkillCreatorService.forkSkill()`（`skill-creator:fork`）とは別責務であり、`skill:fork` は既存スキルの派生コピー処理に特化する。

| メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| `fork` | `options: SkillForkOptions` | `Promise<SkillForkResult>` | SKILL.md更新、選択サブディレクトリコピー、metadata書き込み、失敗時ロールバック |
| `modifySkillMd` | `content: string, options: SkillForkOptions` | `string` | frontmatter の `name` / `description` / `allowed-tools` / `forked-from` を更新 |
| `validatePath` | `name: string` | `void` | `path.relative` ベースの境界検証（`/skills` と `/skills-evil` の prefix 衝突回避） |

**関連ファイル**:

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/main/services/skill/SkillForker.ts` | フォーク本体サービス |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | `skill:fork` IPCハンドラー（sender検証 + 入力検証 + サービス呼び出し） |
| `apps/desktop/src/preload/skill-api.ts` | `forkSkill(options)` の Preload API |
| `packages/shared/src/types/skill-fork.ts` | 入出力/メタデータ型の正本 |

## RuntimeResolver（runtime routing 共通化 — UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

> **実装完了**: 2026-03-15
> **実装場所**: `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`

`RuntimeResolver` は `skill:execute` / `agent:start` の runtime 判定を共通化するサービス。`ChatEditRuntimeResolver`（`services/chat-edit/RuntimeResolver.ts`）から LLMAdapter 依存を除去し、認証判定のみに特化した共通版。

### コンポーネント構成

| コンポーネント | ファイル | 責務 |
| --- | --- | --- |
| `RuntimeResolver` | `services/runtime/RuntimeResolver.ts` | 認証状態に基づく `integrated` / `handoff` 判定 |
| `ChatEditRuntimeResolver` | `services/chat-edit/RuntimeResolver.ts` | chat-edit 用の `RuntimeResolver`（LLMAdapter 生成含む） |

### RuntimeResolution 型

```typescript
export type RuntimeResolution =
  | { type: "integrated" }
  | { type: "handoff"; reason: string };
```

- `integrated`: API キー有効 → 既存実行フロー続行
- `handoff`: subscription モードまたは API キー未設定 → `HandoffGuidance` 応答を返す

### RuntimeResolver API

| メソッド | シグネチャ | 説明 |
| --- | --- | --- |
| `resolve` | `() => Promise<RuntimeResolution>` | authMode と API キー有無で判定 |

### 判定ロジック

| 条件 | 結果 | reason |
| --- | --- | --- |
| `authMode === "subscription"` | `handoff` | `"subscription mode: use Claude Code CLI"` |
| `hasKey() === false` | `handoff` | `"API key not configured"` |
| `getKey() === null` | `handoff` | `"API key unavailable"` |
| 上記以外 | `integrated` | — |

### DI と Composition Root

`ipc/index.ts` の `registerAllIpcHandlers()` で `new RuntimeResolver(authKeyService, authModeService)` を1回生成し、`registerAgentExecutionHandlers` / `registerSkillHandlers` / chat-edit ハンドラの3箇所へ注入する（P5 二重登録防止）。chat-edit は `ChatEditRuntimeResolver` alias で別 import。

### Handoff 応答パターン

| チャンネル | handoff 応答形式 | 備考 |
| --- | --- | --- |
| `skill:execute` | `{ success: true, data: { success: false, handoff: true, guidance, error } }` | IPC envelope 維持 |
| `agent:start` | `{ success: false, handoff: true, guidance, error }` | 直接応答 |

### テスト

| テストファイル | テスト数 | 検証内容 |
| --- | --- | --- |
| `services/runtime/__tests__/RuntimeResolver.test.ts` | 8 | subscription/apiKey判定 |
| `ipc/__tests__/skillHandlers.runtime.test.ts` | 3 | skill handoff 分岐 |
| `ipc/__tests__/agentHandlers.runtime.test.ts` | 2 | agent handoff 分岐 |

### 苦戦箇所

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| ChatEditRuntimeResolver との alias import 衝突 | 同名クラスを異なるパスから import | `import { RuntimeResolver as ChatEditRuntimeResolver }` で alias 分離 |
| Composition Root でのサービススコープ制限（P60） | authModeService が track() 内スコープに閉じる | 共通消費者の外側スコープで生成 |
| optional parameter による後方互換維持 | 既存テスト・呼び出し元の一括修正が必要 | `runtimeResolver?` で既存動作を保証 |

### 関連タスク

| タスクID | 概要 | ステータス |
| --- | --- | --- |
| UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 | Skill/Agent runtime routing 統合クロージャ | 完了（2026-03-15） |

## SkillScheduler / ScheduleStore（TASK-9G）

スキルスケジュール実行は、Facade の `SkillService` とは独立した専用サービスで構成する。

| コンポーネント | 責務 | 実装ファイル |
| --- | --- | --- |
| `ScheduleStore` | `electron-store` への CRUD 永続化、実行履歴最大100件管理、復元時バリデーション（P19） | `apps/desktop/src/main/services/skill/ScheduleStore.ts` |
| `SkillScheduler` | cron / interval / once / event のジョブ登録・停止、次回実行時刻計算、実行結果記録 | `apps/desktop/src/main/services/skill/SkillScheduler.ts` |
| `registerSkillScheduleHandlers` | 5チャネルの IPC 境界（sender 検証 + P42 バリデーション + エラー正規化） | `apps/desktop/src/main/ipc/skillHandlers.ts` |

### 初期化配線（Main Process）

`registerAllIpcHandlers`（`apps/desktop/src/main/ipc/index.ts`）で以下の順に初期化する。

1. `new ScheduleStore()`
2. `new SkillScheduler(scheduleStore, schedulerExecutorAdapter)`
3. `skillScheduler.initialize()`（非同期・非ブロッキング）
4. `registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore)`

### SchedulerSkillExecutor アダプタ

`SkillScheduler` は `SchedulerSkillExecutor` インターフェースに依存し、`skillService.executeSkill()` を呼び出すアダプタで接続する。

| 観点 | 設計方針 |
| --- | --- |
| 依存関係 | Scheduler は SkillService 実装詳細を知らない（DI） |
| テスタビリティ | `SchedulerSkillExecutor` をモック可能 |
| 責務分離 | 実行制御（Scheduler）とスキル実行本体（SkillService）を分離 |

## SkillService と SkillExecutor の統合（TASK-FIX-7-1）

> **実装完了**: 2026-02-11（TASK-FIX-7-1）

SkillService は Facade パターンで SkillExecutor への実行委譲を行う。

### Setter Injection パターン

SkillExecutor は `registerSkillHandlers()` 内で生成され、`setSkillExecutor()` で SkillService に注入される。

| ステップ | 処理 | ファイル |
|----------|------|----------|
| 1 | `registerSkillHandlers(mainWindow, skillService, authKeyService)` 呼び出し | `main/ipc/index.ts` |
| 2 | `new SkillExecutor(mainWindow, undefined, authKeyService)` でインスタンス生成 | `skillHandlers.ts` |
| 3 | `skillService.setSkillExecutor(executor)` で注入 | `skillHandlers.ts` |
| 4 | `skillService.executeSkill()` が内部で `skillExecutor.execute()` を呼び出し | `SkillService.ts` |

### 設計根拠

| 観点 | 説明 |
|------|------|
| 遅延初期化 | SkillExecutor は mainWindow を必要とするため、ハンドラー登録時に生成 |
| 単一責務 | SkillService はスキル管理、SkillExecutor は実行に責務を分離 |
| テスタビリティ | SkillExecutor をモックに差し替え可能 |

## Runtime routing / handoff DI 統合（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

`skill:execute` と `agent:start` は `RuntimeResolver` の判定結果で `integrated` / `handoff` を分岐する。Main 側では resolver と handoff builder を同一初期化タイミングで注入し、Skill/Agent の両経路で契約を統一する。

### Composition root 配線

| ステップ | 処理 | 実装ファイル |
| --- | --- | --- |
| 1 | `new RuntimeResolver(authModeService, authKeyService)` を生成 | `main/ipc/index.ts` |
| 2 | `new TerminalHandoffBuilder()` を生成 | `main/ipc/index.ts` |
| 3 | `registerSkillHandlers(mainWindow, skillService, authKeyService, runtimeResolver, handoffBuilder)` を登録 | `main/ipc/index.ts` |
| 4 | `registerAgentExecutionHandlers(mainWindow, authKeyService, runtimeResolver, handoffBuilder)` を登録 | `main/ipc/index.ts` |

### Runtime 分岐契約

| チャネル | integrated 条件 | handoff 条件 | handoff 応答 |
| --- | --- | --- | --- |
| `skill:execute` | `authMode=api-key` かつ API key 有効 | `authMode=subscription` または API key 未設定 | IPC envelope 内で `handoff=true` と `guidance` を返す |
| `agent:start` | `authMode=api-key` かつ API key 有効 | `authMode=subscription` または API key 未設定 | `success=false, handoff=true, guidance` を返す |

### セキュリティ境界

| 項目 | 方針 |
| --- | --- |
| 秘匿情報 | `TerminalHandoffBuilder` は API key を返さず、`terminalCommand/contextSummary/reason` のみ返却 |
| 既存契約維持 | `skill:execute` は `safeInvokeUnwrap` 互換の IPC envelope を維持 |
| Preload 契約 | Agent 実行は `AGENT_EXECUTION_*` チャネルへ統一し、旧 `agent:*` との差分を吸収 |

## キャッシュ機構

- スキャン結果はメモリにキャッシュ（TTLベース無効化）
- `clearCache()`で手動クリア可能
- アプリ再起動でキャッシュはクリア

## 永続化

- インポート状態は`electron-store`で永続化
- アプリ再起動後もインポート状態を維持
- ストレージキー: `importedSkillIds`

## SkillImportManager 永続化実装詳細（TASK-FIX-4-2）

> **実装完了**: 2026-02-07（TASK-FIX-4-2）
> **参照**: [error-handling.md](./error-handling.md) 外部ストレージフォールバックパターン

### 型バリデーション関数

外部ストレージからの値は型安全性が保証されないため、バリデーション関数で検証する。

| 入力値 | 出力 | 処理 |
|--------|------|------|
| null/undefined | `[]` | 空配列を返す |
| 非配列値 | `[]` | 空配列を返す + WARNログ |
| 混合配列 | フィルタ済み配列 | 非string要素を除外 + WARNログ |
| 正常配列（string[]） | そのまま | そのまま返す |

**関数シグネチャ**: `validateStoredSkillIds(value: unknown): string[]`

### SkillStoreインターフェース

electron-storeとの型安全な連携のための抽象化インターフェース。

| メソッド | 引数 | 戻り値 | 説明 |
|----------|------|--------|------|
| `get` | `key: string, defaultValue: string[]` | `unknown` | 外部ストレージからの取得（型保証なし） |
| `set` | `key: string, value: string[]` | `void` | ストレージへの保存 |
| `path` | - | `string \| undefined` | ストレージファイルパス（任意） |

**重要**: `get`メソッドの戻り値は`unknown`型とし、呼び出し側でバリデーションを行う。

### デバッグフラグ

開発環境でのデバッグ出力制御。

| オプション | 型 | デフォルト | 説明 |
|------------|-----|-----------|------|
| `debug` | `boolean` | `process.env.NODE_ENV === 'development'` | デバッグログ出力フラグ |

**コンストラクタ**: `constructor(store: SkillStore, options?: { debug?: boolean })`

### テストファイル構成

| ファイル | テスト内容 | ケース数 |
|----------|-----------|----------|
| `SkillImportManager.persistence.test.ts` | ストア保存・復元、再起動シミュレーション | 永続化 |
| `SkillImportManager.error.test.ts` | 異常系、例外処理、フォールバック | エラー |
| `SkillImportManager.boundary.test.ts` | null、空配列、最大長、Unicode | 境界値 |
