# TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                    |
| タスク名   | Conversation DB 初期化堅牢化                               |
| 作成日     | 2026-03-18                                                 |
| 優先度     | HIGH                                                       |
| 見積もり   | Phase 1-13                                                 |
| 前提タスク | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION（完了済み） |
| ステータス | pending                                                    |

## 目的

不特定多数のユーザーが初回起動時に Workspace Chat の会話データベースを自動構築できるようにする。現在の実装では、DBパスのハードコード・ディレクトリ事前作成なし・DBライフサイクル管理なしの3重問題により、初回起動時に「Conversation database is not available」エラーが発生する。

## 背景

- `registerAllIpcHandlers()` 内で better-sqlite3 の `new Database()` がインラインで呼ばれ、親ディレクトリ不在・ネイティブモジュール不一致等で失敗するとフォールバックに落ちる
- DBパスが `~/.claude/conversations.db` にハードコードされており、Electron 標準の `app.getPath('userData')` を使っていない
- DB インスタンスのクローズ処理がなく、アプリ終了時にデータ破損リスクがある
- macOS の `activate` イベント（Dock クリック等）での DB 再利用が考慮されておらず、二重初期化や不整合が発生しうる

## スコープ

### 含まれるもの

1. DB 初期化を `registerAllIpcHandlers()` から分離し、`app.whenReady()` 直後に実行する `initializeConversationDatabase()` 関数の新設
2. DB パスを `app.getPath('userData')` ベースに変更
3. ディレクトリ事前作成（`fs.mkdirSync` + `recursive: true`）
4. DB ライフサイクル管理（`app.on('will-quit')` でクローズ）
5. 推奨 pragma 設定（WAL + foreign_keys + busy_timeout）

> **注意**: `busy_timeout` と `foreign_keys` の推奨値は既存仕様書に未定義のため、Phase 2 設計時に以下を基準として決定する:
>
> - `busy_timeout`: 5000ms（SQLite 公式推奨の一般的な値）
> - `foreign_keys`: ON（データ整合性の標準設定）

6. `registerAllIpcHandlers()` への DB インスタンス DI

### 含まれないもの

- スキーマバージョニング（マイグレーション機構）→ 別タスク
- better-sqlite3 の Electron ABI リビルド自動化 → 別タスク（postinstall 改善）
- Conversation UI の改善 → 別タスク

## 受入基準

1. 初回起動時（`~/.claude/conversations.db` も `userData/conversations.db` も存在しない状態）で、Workspace Chat が正常動作する
2. `app.getPath('userData')` 配下に `conversations.db` が自動作成される
3. アプリ終了時に DB が安全にクローズされる（WAL チェックポイント完了）
4. 既存の133テスト（conversationHandlers: 43, register-conversation-handlers: 15, conversationRepository: 75）が全て PASS する
5. `registerAllIpcHandlers()` が DB インスタンスを外部から受け取る DI パターンに変更されている

## 対象ファイル

| ファイル                                                                | 変更内容                                                    |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/index.ts`                                        | `initializeConversationDatabase()` 呼び出し追加             |
| `apps/desktop/src/main/ipc/index.ts`                                    | Section 13 を DI パターンに変更、DB 初期化ロジック分離      |
| `apps/desktop/src/main/database/conversationDatabase.ts`                | 新規: DB 初期化・ライフサイクル管理（Factory 関数パターン） |
| `apps/desktop/src/main/database/__tests__/conversationDatabase.test.ts` | 新規: DB 初期化テスト                                       |

## タスク通称

| Phase | 名称             | 成果物                              |
| ----- | ---------------- | ----------------------------------- |
| 1     | 要件定義         | 受入基準・inventory                 |
| 2     | 設計             | DB 初期化アーキテクチャ設計         |
| 3     | 設計レビュー     | PASS/MINOR/MAJOR 判定               |
| 4     | テスト作成       | テストケース設計・テストコード      |
| 5     | 実装             | `conversationDatabase.ts` + DI 変更 |
| 6     | テスト拡充       | 回帰テスト・エッジケース            |
| 7     | カバレッジ確認   | カバレッジ基準充足確認              |
| 8     | リファクタリング | コード品質改善                      |
| 9     | 品質検証         | Lint・型チェック・全テスト          |
| 10    | 最終レビュー     | 多角的品質検証                      |
| 11    | 手動テスト       | 初回起動シナリオ検証                |
| 12    | ドキュメント     | 実装ガイド・仕様更新                |
| 13    | PR作成           | PR 準備（ユーザー承認後）           |

## システム仕様参照（aiworkflow-requirements）

| 参照資料                                                   | パス                                                                                                              | 内容                                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| database-implementation                                    | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`                                    | DB 実装パターン（親）                                                                    |
| architecture-overview                                      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | 全体責務境界（親）                                                                       |
| error-handling                                             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                             | エラーハンドリング（親）                                                                 |
| security-electron-ipc                                      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                      | IPC セキュリティ（親）                                                                   |
| security-electron-ipc-core                                 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                                 | Conversation IPC セキュリティ契約・ERR_4006 フォールバック                               |
| architecture-implementation-patterns-details               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-details.md`               | WAL/NORMAL 同期推奨値・データ永続化パターン                                              |
| api-ipc-system-core                                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                        | DB 初期化フロー・Conversation IPC 7ch 仕様（注意: 旧パスハードコード記載あり）           |
| task-workflow-completed-ipc-graceful-degradation-lifecycle | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-graceful-degradation-lifecycle.md` | 前タスク実装内容・教訓                                                                   |
| lessons-learned-auth-ipc-fallback-registration-settings    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-fallback-registration-settings.md`    | better-sqlite3 WAL 初期化・DB 障害時フォールバック設計の教訓                             |
| architecture-implementation-patterns-core                  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md`                  | S30 Graceful Degradation パターン、P34 Setter Injection パターン                         |
| arch-electron-services-core                                | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md`                                | Main Process 責務、app lifecycle（activate/will-quit イベント）                          |
| lessons-learned-current                                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                    | P5 リスナー二重登録、P9 テスト間リーク、P42 trim バリデーション、P54 safeRegister 不適合 |
| arch-ipc-persistence                                       | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                                       | IPC handler 登録パターン・Conversation Repository 構成                                   |

## Phase ファイルリンク

| Phase | 名称             | ファイル                                                     |
| ----- | ---------------- | ------------------------------------------------------------ |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | 品質検証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | ドキュメント     | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

## 注意事項

- `api-ipc-system-core.md` には旧パス `~/.claude/conversations.db` がハードコードとして記載されている。本タスク完了後に Phase 12 で仕様書を更新すること
- DB ライフサイクル管理（`app.on('will-quit')` でのクローズ）パターンは既存仕様書に未定義。本タスクで初めて定義し、Phase 12 で仕様書に追記すること

## 依存グラフ

```
Phase 1-3 → Phase 4 → Phase 5 → Phase 6-7 → Phase 8-9 → Phase 10 → Phase 11-12 → Phase 13
```
