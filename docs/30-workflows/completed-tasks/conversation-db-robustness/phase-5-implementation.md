# Phase 5: 実装

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 5                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 4（テスト作成）                   |
| 次Phase  | Phase 6（テスト拡充）                   |

## 目的

module-level Factory 関数パターンで会話 DB 初期化ロジックを分離し、既存の DB 初期化を DI パターンに変更する。

## 事前確認

- [ ] 変更対象ファイルの既存テストが全て GREEN（baseline 確認）
- [ ] `grep -rn "registerConversationHandlers\|CONVERSATION_DB_SCHEMA" apps/desktop/src/main/` で影響範囲を確認

## 実行タスク

- タスク1: module-level Factory 関数パターンでの会話 DB 初期化実装
- タスク2: `registerAllIpcHandlers` の Section 13 リファクタリング（DI シグネチャ変更）
- タスク3: `apps/desktop/src/main/index.ts` への統合（ライフサイクル管理含む）

## 実行手順

### ステップ1: module-level Factory 関数パターン実装

新規ファイル: `apps/desktop/src/main/database/conversationDatabase.ts`

実装パターン: クラスではなく module-level の Factory 関数群で実装する。

```typescript
// module-level state
let db: Database.Database | null = null;

export function initializeConversationDatabase(dbPath?: string): Database.Database { ... }
export function getConversationDatabase(): Database.Database { ... }
export function closeConversationDatabase(): void { ... }
export function isConversationDatabaseInitialized(): boolean { ... }
export function _resetForTesting(): void { ... }
```

実装ポイント:

- `app.getPath('userData')` でデフォルト DB パスを取得
- `fs.mkdirSync(dir, { recursive: true })` でディレクトリ事前作成
- `new Database(dbPath)` で DB ファイル作成
- pragma 設定: `journal_mode = WAL`, `foreign_keys = ON`, `busy_timeout = 5000`, `synchronous = NORMAL`
- `CONVERSATION_DB_SCHEMA` の exec でテーブル作成
- `closeConversationDatabase()` で `db.close()` を実行し `db = null` にリセット
- `_resetForTesting()` でテスト間のモジュール状態リークを防止（P9対策）

### ステップ2: ipc/index.ts の Section 13 変更

- `CONVERSATION_DB_SCHEMA` 定数を `conversationDatabase.ts` に移動
- `registerAllIpcHandlers` の第2引数に `conversationDb: Database.Database | null` を追加（`null` で後方互換を維持）
- Section 13 で `conversationDb` が渡された場合は内部初期化をスキップ
- `conversationDb` が渡されない場合は従来通り内部初期化（後方互換）

#### IPC レスポンス形式の確認（P60対策）

```bash
grep -rn "success:" apps/desktop/src/main/ipc/conversationHandlers.ts | head -5
```

既存 conversation ハンドラのレスポンス形式（`{ success: boolean, error?: { code, message } }`）と一致していること。

### ステップ3: main/index.ts への統合

- `app.whenReady()` 内で `initializeConversationDatabase()` を呼び出し
- `registerAllIpcHandlers(mainWindow, getConversationDatabase())` で DB を注入
- `app.on('will-quit', () => closeConversationDatabase())` でライフサイクル管理（`before-quit` ではなく `will-quit` を使用 — `before-quit` はユーザーキャンセル可能なため DB クローズには不適切）

#### activate イベントでの DB 再利用フロー（P5対策）

macOS の `activate` イベントでウィンドウ再作成時、DB は再初期化せず既存インスタンスを再利用する:

```
activate:
  -> unregisterAllIpcHandlers()
  -> registerAllIpcHandlers(mainWindow, getConversationDatabase())
```

- `getConversationDatabase()` は既に初期化済みの DB インスタンスを返す（二重初期化なし）
- IPC ハンドラのみ新しい `mainWindow` で再登録する

### IPC ハンドラ register/unregister ペア確認

- [ ] Section 13 の変更で `unregisterAllIpcHandlers()` に影響がないか確認
- [ ] macOS `activate` イベントでの再登録パスで二重登録が発生しないか確認

## 参照資料

### 前Phase成果物

| 成果物     | パス                             |
| ---------- | -------------------------------- |
| テスト設計 | `outputs/phase-4/test-matrix.md` |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン  |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPC セキュリティ |

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（実装後に全テスト PASS を確認）。

## 多角的チェック観点（AIが判断）

| 観点                             | チェック項目                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P5（二重登録防止）               | `activate` イベントでの IPC ハンドラ再登録時に `unregisterAllIpcHandlers()` を先に呼んでいるか。DB インスタンスは `getConversationDatabase()` で再利用し、再初期化していないか |
| P42（.trim() 3段バリデーション） | DB パス引数に対して `typeof === "string"` -> `=== ""` -> `.trim() === ""` の3段バリデーションを実施しているか                                                                  |
| P54（safeRegister 不適合）       | DB 初期化関数は戻り値（DB インスタンス）のキャプチャが必要なため `safeRegister` パターン不適合。個別 try-catch で実装しているか                                                |
| `will-quit` vs `before-quit`     | DB クローズは `will-quit`（キャンセル不可）で行っているか。`before-quit` はユーザーキャンセル可能で DB クローズが保証されない                                                  |
| DI シグネチャ                    | `conversationDb: Database.Database \| null` 型で、`null` の場合に後方互換（内部初期化）が動作するか                                                                            |

## 成果物

| 成果物             | パス                                                     | 説明                               |
| ------------------ | -------------------------------------------------------- | ---------------------------------- |
| 実装計画           | `outputs/phase-5/implementation-plan.md`                 | 実装手順・設計判断の記録           |
| 実装コード（新規） | `apps/desktop/src/main/database/conversationDatabase.ts` | Factory 関数パターン DB 初期化実装 |
| 変更コード         | `apps/desktop/src/main/ipc/index.ts`                     | Section 13 DI 対応                 |
| 変更コード         | `apps/desktop/src/main/index.ts`                         | DB初期化・ライフサイクル統合       |

## 完了条件

- [ ] Factory 関数パターン（`initializeConversationDatabase` / `getConversationDatabase` / `closeConversationDatabase`）が実装されている
- [ ] Phase 4 のテストが全て GREEN になっている
- [ ] 既存の133テスト（conversation 関連）が全て PASS している
- [ ] `registerAllIpcHandlers` が DB インスタンスを DI で受け取れる
- [ ] 後方互換（DB 未注入時）が維持されている
- [ ] テスト実行は `cd apps/desktop` から行っていること（P40対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] タスク1: module-level Factory 関数パターンでの会話 DB 初期化実装
- [ ] タスク2: `registerAllIpcHandlers` の Section 13 リファクタリング（DI シグネチャ `conversationDb: Database.Database | null`）
- [ ] タスク3: `apps/desktop/src/main/index.ts` への統合（`will-quit` でクローズ、`activate` で DB 再利用）
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 5 完了後、Phase 6（テスト拡充）に進む。
