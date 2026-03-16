# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 3                                              |
| Phase名    | 設計レビュー                                   |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 2（設計）                                |
| 後続Phase  | Phase 4（テスト作成）                          |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

Phase 2 設計の妥当性を多角的な観点から検証し、PASS / MINOR / MAJOR の判定を行う。
PASS または MINOR 判定であれば Phase 4（テスト作成）へ進む。
MAJOR 判定（要件問題）は Phase 1 へ、MAJOR 判定（設計問題）は Phase 2 へ戻る。

## 実行タスク

- レビュー観点テーブルに従った設計の検証
- P5（二重登録防止）の確認
- P42（trim バリデーション）の確認
- P54（safeRegister 適合）の確認
- 既存テストとの共存確認
- 最終判定（PASS / MINOR / MAJOR）

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| database-schema                      | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | SQLiteスキーマ定義                       |
| database-implementation              | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              | DB初期化パターン                         |
| database-implementation-core         | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`         | better-sqlite3初期化の詳細               |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル       | パス                                                                                       | 備考         |
| -------------- | ------------------------------------------------------------------------------------------ | ------------ |
| Phase 1 仕様書 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-1-requirements.md` | 要件定義     |
| Phase 2 仕様書 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-2-design.md`       | 設計         |
| IPC登録ハブ    | `apps/desktop/src/main/ipc/index.ts`                                                       | 現在の実装   |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`                                                       | P5, P42, P54 |

## 実行手順

### Step 1: レビュー観点テーブル

| ID   | 観点                     | チェック内容                                                                                            | 判定結果 |
| ---- | ------------------------ | ------------------------------------------------------------------------------------------------------- | -------- |
| R-01 | 機能要件充足             | FR-01〜FR-04 の全要件が設計に反映されているか                                                           | -        |
| R-02 | P5 二重登録防止          | `unregisterAllIpcHandlers()` が conversation チャンネルを解除できるか                                   | -        |
| R-03 | P42 trim バリデーション  | `conversationHandlers.ts` 内の引数バリデーションがP42準拠（3段）であるか                                | -        |
| R-04 | P54 safeRegister 適合    | `registerConversationHandlers` が void 戻り値のため safeRegister に適合するか                           | -        |
| R-05 | S30 Graceful Degradation | DB初期化失敗時にフォールバックハンドラが登録され、全7チャンネルが応答するか                             | -        |
| R-06 | 既存テスト共存           | 設計変更が既存テストに破壊的変更をもたらさないか                                                        | -        |
| R-07 | homeDir 参照可能性       | Section 13 が Section 8 の `homeDir` 変数を参照できるスコープにあるか                                   | -        |
| R-08 | import 循環依存なし      | `conversationHandlers` / `ConversationRepository` / `better-sqlite3` の追加importが循環依存を生まないか | -        |
| R-09 | セキュリティ             | エラーメッセージにパス等の内部情報が漏洩しないか                                                        | -        |
| R-10 | TypeScript 型安全        | 新規コードに `any` 型や unsafe キャストがないか                                                         | -        |

### Step 2: 各観点の詳細レビュー

#### R-01: 機能要件充足

| 要件                        | 設計での対応                                                                                                                                                      | 充足状況 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-01: DB初期化             | Section 13 内で `path.join(homeDir, ".claude", "conversations.db")` → `new Database(...)` → `db.pragma("journal_mode = WAL")` → `db.exec(CONVERSATION_DB_SCHEMA)` | ✅       |
| FR-02: ハンドラ登録         | `safeRegister("registerConversationHandlers", () => ..., failures)` + `successCount++` パターン、Section 13 として追加                                            | ✅       |
| FR-03: 解除の自動対応       | `CONVERSATION_*` は `channels.ts` L276-282 に定義済み。`unregisterAllIpcHandlers()` の `Object.values(IPC_CHANNELS)` 走査で自動解除                               | ✅       |
| FR-04: Graceful Degradation | `safeRegister` の戻り値 `false` 時に `registerConversationFallbackHandlers()` を呼び出し、7チャンネルにフォールバックハンドラ登録                                 | ✅       |

**判定: PASS**

#### R-02: P5 二重登録防止

P5 ルール（リスナー二重登録）の確認:

1. `registerAllIpcHandlers()` は `registerConversationHandlers(repository)` を1回だけ呼ぶ（`safeRegister` 経由）
2. `unregisterAllIpcHandlers()` が `IPC_CHANNELS.CONVERSATION_*` 全7チャンネルを `ipcMain.removeHandler()` する（`channels.ts` L276-282 に定義済みのため自動）
3. `activate` イベントなどで再登録が発生する場合、先に `unregisterAllIpcHandlers()` を呼ぶ既存フローが適用される
4. フォールバックハンドラも `ipcMain.handle()` で登録されるため、同様に `removeHandler()` で解除される

**懸念点**: DB初期化成功時は `registerConversationHandlers` で7チャンネルが登録される。
DB初期化失敗時は `registerConversationFallbackHandlers` で7チャンネルが登録される。
両方が同時に登録されることはない（`if (conversationRegistered)` / `else` の排他制御）。

**判定: PASS**

#### R-03: P42 trim バリデーション

`conversationHandlers.ts` の各ハンドラでのバリデーション確認:

| ハンドラ                | バリデーション対象                              | 実装（conversationHandlers.ts）                             |
| ----------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| conversation:list       | `request.userId`                                | L89: `!request.userId \|\| request.userId.trim() === ""` ✅ |
| conversation:get        | `request.id`                                    | L114: `!request.id \|\| request.id.trim() === ""` ✅        |
| conversation:create     | `request.title`                                 | L135: `!request.title \|\| request.title.trim() === ""` ✅  |
| conversation:update     | `request.id`                                    | L160: `!request.id \|\| request.id.trim() === ""` ✅        |
| conversation:delete     | `request.id`                                    | L180: `!request.id \|\| request.id.trim() === ""` ✅        |
| conversation:addMessage | `request.sessionId` + `request.message.content` | L202-209: 各フィールドのtrimチェック ✅                     |
| conversation:search     | `request.query`                                 | L290: `!query \|\| query.trim() === ""` ✅                  |

P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラで実装済み。

**判定: PASS**

#### R-04: P54 safeRegister 適合

P54 ルール（safeRegister は戻り値不要なハンドラに使用）の確認:

- `registerConversationHandlers(repository): void` — void 戻り値
- `ConversationRepository` コンストラクタは `unsubscribe` 関数等の戻り値を返さない
- `db.pragma()` / `db.exec()` の戻り値は不使用

しかし **懸念点あり**: 設計では `safeRegister` の戻り値（`boolean`）を直接使用してフォールバック分岐を行っている。
これは `track()` ヘルパーを使用しない変則的なパターンとなる。

```typescript
// 設計（変則パターン）
const conversationRegistered = safeRegister("registerConversationHandlers", () => {...}, failures);
if (conversationRegistered) {
  successCount++;
} else {
  registerConversationFallbackHandlers();
}
```

既存の Supabase 条件分岐（Section 4, L572-599）パターンとの比較:

- Section 4 では `if (supabase)` / `else` という外側の条件分岐で `track()` を使い分ける
- 本設計は `safeRegister` の成否で分岐するため、コード構造が既存パターンと異なる

**MINOR 指摘**: `track()` を使用せずに `safeRegister()` の戻り値を直接使用する変則パターンは、
コードの一貫性を損なう可能性がある。
**推奨対応**: `track()` を使用しつつ、フォールバック登録は `safeRegister` の後にエラー検出で行う代替設計を検討する。

ただし、機能的には正しく動作するため **MINOR** 判定とする。

#### R-05: S30 Graceful Degradation

フォールバックハンドラの設計確認:

1. DB初期化失敗時に全7チャンネルにフォールバックハンドラが登録される ✅
2. フォールバックレスポンス `{ success: false, error: { code: "DB_NOT_AVAILABLE", message: "..." } }` が一貫している ✅
3. 既存の `registerFallbackHandlers()` ユーティリティを再利用している ✅
4. `FallbackHandler` 型（`readonly [channel: string, handler: () => Promise<unknown>]`）に適合している ✅

**判定: PASS**

#### R-06: 既存テスト共存

影響を受ける既存テストの確認:

| テストファイル                     | 影響有無 | 理由                                                                           |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `conversationHandlers.test.ts`     | なし     | `registerConversationHandlers` の呼び出し元が変わるだけで関数シグネチャは不変  |
| `conversationRepository.test.ts`   | なし     | `ConversationRepository` クラス自体に変更なし                                  |
| `ipc-double-registration.test.ts`  | 要確認   | conversation チャンネルのテストが含まれる可能性あり（実装後に確認）            |
| `ipc-graceful-degradation.test.ts` | 要確認   | フォールバックハンドラの新規追加によりテスト拡充が必要な可能性あり             |
| `index.ts` の統合テスト            | 要確認   | `registerAllIpcHandlers()` のテストがある場合、successCount の期待値変更が必要 |

**MINOR 指摘**: `ipc-graceful-degradation.test.ts` に conversation フォールバックハンドラのテストケースを
追加する必要があるかを Phase 4（テスト作成）で確認する。

**判定: PASS（Phase 4 で追加確認）**

#### R-07: homeDir 参照可能性

`homeDir` は `ipc/index.ts` L645 にて `registerAllIpcHandlers()` のスコープ内（Section 8）で定義されている。
Section 13 は Section 8 の後に配置されるため、`homeDir` はスコープ内で参照可能。

```typescript
// L645（Section 8）
const homeDir = process.env.HOME || process.env.USERPROFILE || "";
// ...
// Section 13（Section 8 の後）
const conversationDbPath = path.join(homeDir, ".claude", "conversations.db");
```

**判定: PASS**

#### R-08: import 循環依存なし

追加する import の依存関係:

```
ipc/index.ts
  ← conversationHandlers.ts（ipc/ ディレクトリ）
  ← repositories/conversationRepository.ts（main/repositories/）
  ← better-sqlite3（外部パッケージ）
```

- `conversationHandlers.ts` は既に `ipcMain`, `IPC_CHANNELS`, `ConversationRepository` を使用
- `conversationRepository.ts` は `better-sqlite3`, `uuid`, 型定義のみに依存
- `ipc/index.ts` から `repositories/` への import は他のパターンでも存在するか確認が必要

**確認**: 現在の `ipc/index.ts` は `../services/` や `../infrastructure/` を import しているが、
`../repositories/` への直接 import は存在しない。`conversationHandlers.ts` が
`../repositories/conversationRepository` を import しているため、
`ipc/index.ts` から `../repositories/conversationRepository` を直接 import する必要があるかどうかを検討する。

**MINOR 指摘**: `ipc/index.ts` から `repositories/conversationRepository.ts` への直接 import を避け、
`conversationHandlers.ts` 経由でファクトリ関数を提供するリファクタリングも検討できるが、
既存パターン（SkillService 等でも `SkillService` を直接 import）に倣い、直接 import を採用する。

**判定: PASS**

#### R-09: セキュリティ

- DB ファイルパスは `homeDir` + `.claude/conversations.db` の固定パスのみ（パストラバーサル攻撃不可）
- エラーメッセージは `sanitizeRegistrationErrorMessage()` によりホームディレクトリパスがマスクされる（`safeRegister` 内で自動適用）
- フォールバックレスポンスには内部パス情報が含まれない（固定文字列 `"Conversation database is not available"`）

**判定: PASS**

#### R-10: TypeScript 型安全

設計で使用する型:

| コード                                 | 型                                                             | 評価                          |
| -------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| `new Database(conversationDbPath)`     | `Database.Database`                                            | ✅ better-sqlite3型定義に従う |
| `new ConversationRepository(db)`       | コンストラクタの型シグネチャに従う                             | ✅                            |
| `safeRegister(...)` の戻り値 `boolean` | 明示的な型                                                     | ✅                            |
| `dbNotAvailableResponse`               | `{ success: false; error: { code: string; message: string } }` | `as const` を使用 ✅          |
| `FallbackHandler` 型                   | `readonly [channel: string, handler: () => Promise<unknown>]`  | ✅ 既存型                     |

**判定: PASS**

### Step 3: MINOR 指摘事項のまとめ

| 指摘ID   | 観点            | 内容                                                                 | 対応方針                                                                    |
| -------- | --------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| MINOR-01 | R-04 P54        | `track()` を使用せず `safeRegister()` の戻り値で分岐する変則パターン | Phase 4-5 で実装時に `track()` と整合する代替コード構造を検討。機能影響なし |
| MINOR-02 | R-06 テスト共存 | `ipc-graceful-degradation.test.ts` へのテストケース追加要否          | Phase 4（テスト作成）で確認・対応                                           |

### Step 4: 設計レビュー最終判定

## 設計レビュー判定

**判定: MINOR**

**理由**:

- 機能要件（FR-01〜FR-04）はすべて設計に反映されている
- セキュリティ、型安全、P5/P42/P54 の各要件は充足されている
- 2件の MINOR 指摘（P54 コードパターンの一貫性、テストケース追加要否）があるが、いずれも機能影響なし
- MINOR 指摘は Phase 4-5 で対応可能

**対応**: MINOR 指摘（MINOR-01, MINOR-02）を以下の未タスクとして記録し、Phase 4 へ進む。

| 未タスク候補  | 内容                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| MINOR-01 対応 | Phase 5 実装時に `safeRegister` + `successCount` の構造を既存 `track()` パターンと整合させるか、設計通りに実装するかを判断する |
| MINOR-02 対応 | Phase 4 テスト作成時に `ipc-graceful-degradation.test.ts` の conversation フォールバックハンドラテスト追加要否を確認する       |

## 統合テスト連携

本設計レビューで MINOR 判定のため、Phase 4（テスト作成）に進む。
以下のテストがすべて PASS であることを Phase 9（品質検証）で確認する:

- `conversationHandlers.test.ts`: 全テストPASS
- `ipc-graceful-degradation.test.ts`: フォールバックハンドラ登録確認
- `ipc-double-registration.test.ts`: 二重登録防止確認
- TypeScript 型チェック (`pnpm typecheck`): エラーなし

## 成果物

| 成果物         | パス                                                                                        | 内容           |
| -------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 3 仕様書 | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [ ] レビュー観点テーブル（R-01〜R-10）の全観点について判定が記載されている
- [ ] P5（二重登録防止）の確認が完了している
- [ ] P42（trim バリデーション）の確認が完了している
- [ ] P54（safeRegister 適合）の確認が完了している
- [ ] 既存テストとの共存確認が完了している
- [ ] MINOR 指摘事項が記録されている
- [ ] 最終判定（PASS / MINOR / MAJOR）が記載されている

## 次のPhase

**MINOR 判定のため**: MINOR-01, MINOR-02 の指摘対応方針を記録した上で Phase 4（テスト作成）へ進む。

Phase 4 では以下を実施する:

1. ハンドラ登録の検証テストケース作成
2. フォールバックハンドラ（DB初期化失敗時）のテストケース作成
3. `ipc-graceful-degradation.test.ts` への conversation テスト追加要否の確認
4. 二重登録防止テストの確認
