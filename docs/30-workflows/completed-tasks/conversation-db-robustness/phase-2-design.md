# Phase 2: 設計

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 2                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 1（要件定義）                     |
| 次Phase  | Phase 3（設計レビュー）                 |

## 目的

DB 初期化の分離・DI・ライフサイクル管理のアーキテクチャを設計する。

## 実行タスク

- タスク1: Conversation DB Factory 関数設計（module-level 関数パターン）
- タスク2: `registerAllIpcHandlers` の DI インターフェース設計
- タスク3: アプリ起動フローへの統合設計

## 参照資料

### 前Phase成果物

| 成果物   | パス                                         |
| -------- | -------------------------------------------- |
| 要件定義 | `outputs/phase-1/requirements-definition.md` |
| 受入基準 | `outputs/phase-1/acceptance-criteria.md`     |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | レイヤー依存方向 |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン  |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーカテゴリ   |

## 実行手順

### ステップ1: Conversation DB Factory 関数設計

新規ファイル `apps/desktop/src/main/database/conversationDatabase.ts` に以下を定義:

```typescript
// 設計ターゲット: Factory 関数パターン（electron-store と同一パターン）
interface ConversationDatabaseConfig {
  dbPath?: string; // デフォルト: app.getPath('userData') + '/conversations.db'
  enableWAL?: boolean; // デフォルト: true
  busyTimeout?: number; // デフォルト: 5000ms
  foreignKeys?: boolean; // デフォルト: true
}

// module-level 状態（Singleton 相当）
let db: Database.Database | null = null;

// DB 初期化（成功時は Database インスタンス、失敗時は null を返す）
export function initializeConversationDatabase(
  config?: ConversationDatabaseConfig,
): Database.Database | null;

// 現在の DB インスタンスを取得（未初期化時は null）
export function getConversationDatabase(): Database.Database | null;

// DB クローズ（WAL チェックポイント完了後にクローズ）
export function closeConversationDatabase(): void;

// テスト用: module-level 状態をリセット（P9 対策）
export function _resetForTesting(): void;
```

設計判断:

- **Factory 関数パターン**: 既存の electron-store パターンに合わせた module-level 関数（クラス不使用）
- **Graceful Degradation**: DB 初期化失敗時は null を返し、`registerAllIpcHandlers` 内でフォールバックハンドラを登録する（S30 パターン準拠）
- **テスト容易性**: `_resetForTesting()` で module-level 状態をリセット可能（P9 対策）

### ステップ2: registerAllIpcHandlers DI 変更

```typescript
// Before: DB初期化が内部にある
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
): IpcHandlerRegistrationResult;

// After: DBインスタンスを外部から注入（null は初期化失敗を明示）
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  conversationDb: Database.Database | null, // 明示的 null（オプショナルではない）
): IpcHandlerRegistrationResult;
```

### ステップ3: アプリ起動フロー統合

```
app.whenReady()
  ↓
1. initializeConversationDatabase(config)  // null 許容（失敗時は null）
  ↓
2. createWindow()
  ↓
3. registerAllIpcHandlers(mainWindow, getConversationDatabase())
  ↓
4. app.on('will-quit', () => closeConversationDatabase())
   // will-quit: 終了確定後に実行（before-quit は event.preventDefault() でキャンセルされうる）
```

### M1: activate イベントの設計（P5 対策）

```
app.on('activate')
  ↓
1. unregisterAllIpcHandlers()         // 既存ハンドラを一括解除（P5: 二重登録防止）
  ↓
2. createWindow()                     // ウィンドウ再作成（存在しない場合のみ）
  ↓
3. registerAllIpcHandlers(mainWindow, getConversationDatabase())
   // 既存 DB インスタンスを再利用（再初期化しない）
```

> **注意**: activate イベントでは DB の再初期化を行わない。`getConversationDatabase()` で既存インスタンスを取得し、IPC ハンドラの再登録のみ行う。

### IPC ハンドラ設計確認項目

- [ ] `registerAllIpcHandlers` の第2引数は `Database.Database | null` 型（明示的 null）
- [ ] IPC レスポンス形式は既存の `{ success, error }` ラッパーを維持
- [ ] DB 初期化失敗時（null 渡し時）は既存のフォールバックハンドラが引き続き登録される
- [ ] activate イベントでは DB 再初期化せず既存インスタンスを再利用する

### ステップ4: DI シグネチャ定義

`outputs/phase-2/interface-definitions.md` に以下を定義する:

```typescript
// Factory 関数パターンのため、Port インターフェースではなく
// Database.Database | null を直接 DI する（シンプルさを優先）
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  conversationDb: Database.Database | null, // 明示的 null（オプショナルではない）
): IpcHandlerRegistrationResult;

// テスト用リセット関数（P9 対策: テスト間の状態リーク防止）
export function _resetForTesting(): void;
```

## 成果物

| 成果物               | パス                                       | 説明                                                         |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| 設計サマリー         | `outputs/phase-2/design-summary.md`        | Factory 関数設計・DI フロー図・設計判断を記録                |
| インターフェース定義 | `outputs/phase-2/interface-definitions.md` | Factory 関数シグネチャ・registerAllIpcHandlers DI シグネチャ |

## 統合テスト連携【必須】

設計フェーズのため自動テストは実施しないが、以下のテスト影響範囲を記録する:

| 影響テストファイル                                                 | 影響理由                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `src/main/ipc/__tests__/register-conversation-handlers.test.ts`    | registerAllIpcHandlers シグネチャ変更                            |
| `src/main/database/__tests__/conversationDatabase.test.ts`（新規） | Factory 関数（initialize/get/close/\_resetForTesting）単体テスト |

## 多角的チェック観点

| 観点               | 適用判断 | 仕様参照先                                                  |
| ------------------ | -------- | ----------------------------------------------------------- |
| セキュリティ       | 適用     | `security-electron-ipc.md` — DB パスのパストラバーサル対策  |
| アーキテクチャ     | 適用     | `architecture-overview.md` — DI パターン・DIP 準拠確認      |
| データ整合性       | 適用     | `database-implementation.md` — WAL/pragma 設定              |
| エラーハンドリング | 適用     | `error-handling.md` — Result パターン・Graceful Degradation |
| パフォーマンス     | 適用     | WAL モード・busyTimeout 設定の適切性                        |

## 完了条件

- [ ] `Factory 関数（initializeConversationDatabase / getConversationDatabase / closeConversationDatabase）` のインターフェースが定義されている
- [ ] `registerAllIpcHandlers` の DI シグネチャが決定している
- [ ] アプリ起動フローの統合タイミングが決定している
- [ ] テスト容易性（モック可能性）が確認されている
- [ ] DB 注入が明示的 null（`Database.Database | null`）であり、フォールバック動作が担保されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 2 完了後、Phase 3（設計レビュー）に進む。
