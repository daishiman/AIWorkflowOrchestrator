# Phase 1: 要件定義

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 1                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | なし                                    |
| 次Phase  | Phase 2（設計）                         |

## 目的

Conversation DB 初期化の現状を調査し、改善すべき要件と受入基準を確定する。

## 実行タスク

- タスク1: 現行 DB 初期化フローの inventory 作成
- タスク2: 受入基準の定義
- タスク3: 影響範囲の特定
- タスク4: FR/NFR分類 — 機能要件と非機能要件を分類し優先度を設定

## 参照資料

### プロジェクト内

| 参照資料   | パス                                                                                | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 現行実装   | `apps/desktop/src/main/ipc/index.ts` L933-956                                       | Section 13 の DB 初期化                                                                               |
| アプリ起動 | `apps/desktop/src/main/index.ts`                                                    | `app.whenReady()` フロー                                                                              |
| Repository | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | DB 操作層                                                                                             |
| 既存テスト | `apps/desktop/src/main/ipc/__tests__/register-conversation-handlers.test.ts` 他     | 133テスト（conversationHandlers: 43, register-conversation-handlers: 15, conversationRepository: 75） |
| 完了タスク | `docs/30-workflows/completed-tasks/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/` | ハンドラ登録修正                                                                                      |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン  |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーコード体系 |

## 実行手順

### ステップ0: P50チェック — 既実装状態の調査（必須）

```bash
git log --oneline -20 -- apps/desktop/src/main/ipc/index.ts
git log --oneline -20 -- apps/desktop/src/main/index.ts
grep -n "ConversationDatabaseManager\|conversationDb" apps/desktop/src/main/ipc/index.ts
grep -n "ConversationDatabaseManager\|conversationDb" apps/desktop/src/main/index.ts
```

| 判定       | 条件                             | 対応                                        |
| ---------- | -------------------------------- | ------------------------------------------- |
| 既実装あり | 対象機能が実装済みかつテストPASS | Phase 1-3を「検証・補完」モードに切り替える |
| 既実装なし | 対象機能が未実装                 | 通常の要件定義を実施                        |

### ステップ1: 現行フローの inventory

以下を調査して記録する:

1. `apps/desktop/src/main/ipc/index.ts` の Section 13（L933-956）で DB がどう初期化されるか
2. `apps/desktop/src/main/index.ts` の `app.whenReady()` 内で `registerAllIpcHandlers()` がどのタイミングで呼ばれるか
3. DB パス `path.join(homeDir, ".claude", "conversations.db")` の homeDir 解決メカニズム
4. `safeRegister` + `registerConversationFallbackHandlers` の Graceful Degradation フロー
5. `CONVERSATION_DB_SCHEMA`（L105-140）のテーブル定義

### ステップ2: 失敗シナリオの列挙

| シナリオ                          | 原因                            | 現在の結果                             |
| --------------------------------- | ------------------------------- | -------------------------------------- |
| `~/.claude/` ディレクトリ未作成   | 初回起動                        | `SQLITE_CANTOPEN` → フォールバック     |
| better-sqlite3 ABI 不一致         | Electron と Node.js の ABI 差異 | `ERR_DLOPEN_FAILED` → フォールバック   |
| ディスク容量不足                  | ストレージ枯渇                  | `SQLITE_FULL` → フォールバック         |
| ファイル権限なし                  | OS セキュリティ                 | `EACCES` → フォールバック              |
| activate イベントでのDB二重初期化 | macOS Dock クリック等で再活性化 | DB 二重初期化 → ハンドラ不整合・P5再発 |

### ステップ3: 受入基準の確定

受入基準を `outputs/phase-1/acceptance-criteria.md` に記録する。

## 成果物

| 成果物       | パス                                         | 説明                                                 |
| ------------ | -------------------------------------------- | ---------------------------------------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 現行フロー inventory・失敗シナリオ・FR/NFR分類を記録 |
| 受入基準     | `outputs/phase-1/acceptance-criteria.md`     | 番号付き受入基準5項目以上を定義                      |
| 影響範囲分析 | `outputs/phase-1/scope-definition.md`        | 変更対象ファイル一覧・スコープ外項目を明示           |

## 統合テスト連携【必須】

Phase 1 では既存テストの現状把握を実施する:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/register-conversation-handlers.test.ts --reporter=verbose
```

| 確認項目                             | 目的                         |
| ------------------------------------ | ---------------------------- |
| 既存 conversation テストの PASS 状況 | ベースラインの確認           |
| FAIL 件数の把握                      | 既知の問題のインベントリ作成 |

## 多角的チェック観点

| 観点               | 適用判断 | 仕様参照先                                                                                |
| ------------------ | -------- | ----------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | `security-electron-ipc.md` — DB パスのパストラバーサル検証（Main 側で引数バリデーション） |
| アーキテクチャ     | 適用     | `architecture-overview.md` — DI パターン・DIP 準拠確認                                    |
| データ整合性       | 適用     | `database-implementation.md` — WAL/pragma 設定                                            |
| エラーハンドリング | 適用     | `error-handling.md` — Infrastructure Error (4000-4999) 体系への準拠                       |
| パフォーマンス     | 適用     | WAL モード・busyTimeout 設定の適切性                                                      |
| 既存パターン整合   | 適用     | `arch-electron-services-core.md` — electron-store の Factory 関数パターンとの一致確認     |

## 完了条件

- [ ] 現行 DB 初期化フローの inventory が完成している
- [ ] 失敗シナリオが5つ以上列挙されている
- [ ] 受入基準が番号付きで5つ以上定義されている
- [ ] 影響範囲（変更対象ファイル一覧）が特定されている
- [ ] スコープ外項目が明示されている
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

Phase 1 完了後、Phase 2（設計）に進む。
