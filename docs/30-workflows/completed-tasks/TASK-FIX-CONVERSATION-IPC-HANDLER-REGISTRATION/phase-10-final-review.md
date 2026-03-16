# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 10                                             |
| Phase名    | 最終レビュー                                   |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 9（品質検証）                            |
| 後続Phase  | Phase 11（手動テスト）                         |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

多角的な観点から品質・整合性を最終検証し、PASS / MINOR / MAJOR / CRITICAL の判定を行う。
本 Phase は **判断と記録** であり、新規実装は行わない。

| 判定     | 後続対応                                                          |
| -------- | ----------------------------------------------------------------- |
| PASS     | Phase 11（手動テスト）へ進む                                      |
| MINOR    | 指摘対応を未タスク仕様書に変換後、Phase 11 へ進む（**省略不可**） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る                                 |
| CRITICAL | Phase 1 へ戻り要件を再確認する                                    |

## 実行タスク

- 受入基準（AC-01〜AC-08）の全充足確認
- 既存ハンドラとの非干渉確認
- P5 / P42 / P54 準拠確認
- S30 Graceful Degradation 確認
- エラーメッセージ安全性確認（P55 準拠）
- MINOR 判定時の未タスク仕様書への変換（省略不可）
- 最終判定の記録

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル               | パス                                                                                        | 備考                              |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| IPC登録ハブ            | `apps/desktop/src/main/ipc/index.ts`                                                        | Section 13 を含む最終実装         |
| Conversationハンドラ   | `apps/desktop/src/main/ipc/conversationHandlers.ts`                                         | P42 バリデーション確認対象        |
| Conversationリポジトリ | `apps/desktop/src/main/repositories/conversationRepository.ts`                              | DB 初期化 I/F 確認対象            |
| Phase 1 仕様書         | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-1-requirements.md`  | 受入基準 AC-01〜AC-08             |
| Phase 3 レビュー       | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-3-design-review.md` | MINOR-01, MINOR-02 の処理状況確認 |
| Phase 9 レポート       | `outputs/phase-9/quality-report.md`                                                         | 品質検証の実行結果                |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P5, P42, P54, P55                 |

## 実行手順

### Step 1: 受入基準（AC-01〜AC-08）の充足確認

Phase 1 で定義した受入基準を最終確認する。

| 受入基準 | 内容                                                                                          | 検証結果（Phase 9 品質検証から引用） | 充足状況 |
| -------- | --------------------------------------------------------------------------------------------- | ------------------------------------ | -------- |
| AC-01    | `registerAllIpcHandlers()` 呼び出し後、`conversation:create` ハンドラが登録されている         | -                                    | -        |
| AC-02    | 全 7 チャンネル（list/get/create/update/delete/addMessage/search）が登録されている            | -                                    | -        |
| AC-03    | `ConversationRepository` が better-sqlite3 インスタンスで初期化、`chat_sessions` テーブル存在 | -                                    | -        |
| AC-04    | better-sqlite3 ロード失敗時、全 7 チャンネルにフォールバックハンドラが登録される              | -                                    | -        |
| AC-05    | `unregisterAllIpcHandlers()` が `conversation:*` チャンネルを正しく解除する                   | -                                    | -        |
| AC-06    | 再登録フロー（register → unregister → register）で二重登録エラーが発生しない                  | -                                    | -        |
| AC-07    | 既存の `conversationHandlers.test.ts` と `conversationRepository.test.ts` が全 PASS           | -                                    | -        |
| AC-08    | TypeScript 型チェックがエラーなしで通過する                                                   | -                                    | -        |

### Step 2: 多角的レビュー観点

#### R-01: 既存ハンドラとの非干渉確認

Section 1〜12 のハンドラが Section 13 追加後も正常に登録・動作することを確認する。

| 確認項目                            | 確認方法                                                        |
| ----------------------------------- | --------------------------------------------------------------- |
| Section 1〜12 のテストが継続 PASS   | Phase 9 の `pnpm test` 結果で確認                               |
| `successCount` のカウントが正確     | Section 13 が 1 カウントを追加していること                      |
| `registerAllIpcHandlers()` の戻り値 | `failures` 配列に conversation 関連エントリがないこと（正常時） |

#### R-02: P5（二重登録防止）準拠確認

| 確認項目                                             | 期待結果                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `registerConversationHandlers()` が 1 回だけ呼ばれる | `safeRegister` 経由のため制御されている                                 |
| フォールバック / 正常ハンドラが同時登録されない      | `if (conversationRegistered) / else` の排他制御が実装されている         |
| `unregisterAllIpcHandlers()` が 7 チャンネルを解除   | `IPC_CHANNELS.CONVERSATION_*` が `channels.ts` に定義済みのため自動解除 |

#### R-03: P42（trim バリデーション）準拠確認

`conversationHandlers.ts` の各ハンドラが P42 準拠の 3 段バリデーションを実装していることを確認する。

| ハンドラ                  | 確認コード（conversationHandlers.ts）                | 準拠状況 |
| ------------------------- | ---------------------------------------------------- | -------- |
| `conversation:list`       | `request.userId.trim() === ""`                       | -        |
| `conversation:get`        | `request.id.trim() === ""`                           | -        |
| `conversation:create`     | `request.title.trim() === ""`                        | -        |
| `conversation:update`     | `request.id.trim() === ""`                           | -        |
| `conversation:delete`     | `request.id.trim() === ""`                           | -        |
| `conversation:addMessage` | `request.sessionId.trim() === ""` + content チェック | -        |
| `conversation:search`     | `query.trim() === ""`                                | -        |

#### R-04: P54（safeRegister 適合）確認

| 確認項目                                        | 期待結果                                                |
| ----------------------------------------------- | ------------------------------------------------------- |
| `registerConversationHandlers()` が void 戻り値 | `safeRegister` の適用条件を満たす                       |
| MINOR-01 の対応判断が記録されている             | `outputs/phase-8/refactoring-decisions.md` に記録済み   |
| `safeRegister` + 戻り値判断の変則パターンの根拠 | SRP 原則に基づく「設計通り採用」が Phase 8 成果物に記録 |

#### R-05: S30 Graceful Degradation 確認

| 確認項目                                     | 期待結果                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| DB 初期化失敗時に全 7 チャンネルが応答する   | `registerConversationFallbackHandlers()` が登録されている                 |
| フォールバックレスポンスの構造が一貫している | `{ success: false, error: { code: "DB_NOT_AVAILABLE", message: "..." } }` |
| 既存の `registerFallbackHandlers()` を再利用 | 独自実装でなく共通ユーティリティを使用                                    |

#### R-06: P55（エラーメッセージ安全性）確認

DB 初期化失敗時のエラーメッセージにファイルパス等の内部情報が含まれないことを確認する。

| 確認項目                                                              | 期待結果                                                              |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `safeRegister` 内の `sanitizeRegistrationErrorMessage()` が適用される | パス情報がマスクされてログに記録される                                |
| フォールバックレスポンスの `message` フィールド                       | 固定文字列 `"Conversation database is not available"`（パス情報なし） |
| `console.error` 等のログ出力にホームパスが含まれない                  | P55 の `escapeRegExp` + マスク処理が適用されている                    |

#### R-07: import の整合性確認

`ipc/index.ts` に追加された import が型安全かつ循環依存がないことを確認する。

| import 対象                             | 型解決先                                           | 循環依存 |
| --------------------------------------- | -------------------------------------------------- | -------- |
| `import Database from "better-sqlite3"` | `@types/better-sqlite3`                            | なし     |
| `registerConversationHandlers`          | `./conversationHandlers`（同 `ipc/` ディレクトリ） | なし     |
| `ConversationRepository`                | `../repositories/conversationRepository`           | なし     |

#### R-08: CONVERSATION_DB_SCHEMA の整合性確認

`ipc/index.ts` に定義した DDL スキーマが `conversationRepository.test.ts` で使用しているスキーマと一致することを確認する。

| テーブル        | `CONVERSATION_DB_SCHEMA` | `conversationRepository.test.ts` | 一致状況 |
| --------------- | ------------------------ | -------------------------------- | -------- |
| `chat_sessions` | 定義あり                 | L46-65 に定義                    | -        |
| `chat_messages` | 定義あり                 | L67-83 に定義                    | -        |
| インデックス    | 4件定義あり              | テストで確認                     | -        |

### Step 3: MINOR 指摘の確認と未タスク変換

Phase 3 で記録した MINOR 指摘の処理状況を確認する。

| 指摘ID   | 内容                                                  | 処理状況                                              |
| -------- | ----------------------------------------------------- | ----------------------------------------------------- |
| MINOR-01 | `track()` を使用しない変則パターン                    | Phase 8 で「設計通り採用」として解消 → 未タスク化不要 |
| MINOR-02 | `ipc-graceful-degradation.test.ts` のテストケース追加 | Phase 4-6 で対応済みを確認 → 未タスク化不要           |

**重要**: 本 Phase の最終レビューで **新たな MINOR 指摘** が発生した場合は、
05-task-execution.md の規則に従い、全て未タスク仕様書に変換する（「機能影響なし」でも省略不可）。

### Step 4: 最終判定

上記 Step 1〜3 の結果をもとに、以下の基準で判定する。

#### 判定基準テーブル

| 判定     | 条件                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| PASS     | AC-01〜AC-08 が全て充足、R-01〜R-08 の全観点が問題なし、新規 MINOR 指摘なし    |
| MINOR    | AC-01〜AC-08 は全て充足、R-01〜R-08 でコード品質・保守性に関する軽微な指摘あり |
| MAJOR    | AC-01〜AC-08 のいずれかが未充足、または設計の根本的な問題が発見された          |
| CRITICAL | セキュリティ脆弱性、または要件の根本的な誤解が発見された                       |

#### MINOR 判定時の未タスク化手順

05-task-execution.md の規則に従い、以下 3 ステップを全て実施する（省略不可）:

1. `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書（本 Phase 10 仕様書）に参照リンクを追加

### Step 5: 判定記録

最終判定を `outputs/phase-10/final-review-result.md` に記録する。記録内容:

- 判定（PASS / MINOR / MAJOR / CRITICAL）
- 判定理由
- 各レビュー観点（R-01〜R-08）の確認結果
- MINOR 指摘がある場合は未タスク仕様書へのリンク

## 統合テスト連携

本 Phase では新規テスト実行は行わない。Phase 9 の品質検証レポート（`outputs/phase-9/quality-report.md`）を引用して AC-01〜AC-08 の充足を確認する。

## 成果物

| 成果物           | パス                                                                                            | 内容                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Phase 10 仕様書  | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-10-final-review.md`     | 本ドキュメント                                             |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                       | 判定・理由・各観点の確認結果                               |
| 未タスク仕様書   | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/unassigned-task/`（MINOR 時） | MINOR 指摘ごとに独立したファイルを作成（MINOR 判定時必須） |

## 完了条件

- [ ] AC-01〜AC-08 の充足状況が全て記録されている
- [ ] レビュー観点 R-01〜R-08 の確認結果が記録されている
- [ ] P5 / P42 / P54 / P55 準拠が確認されている
- [ ] 最終判定（PASS / MINOR / MAJOR / CRITICAL）が記録されている
- [ ] MINOR 判定の場合、全指摘が未タスク仕様書に変換されている（3 ステップ全完了）
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成されている

## 次のPhase

**PASS または MINOR 判定の場合**: Phase 11（手動テスト）へ進む。
**MAJOR 判定（要件問題）の場合**: Phase 1 へ戻る。
**MAJOR 判定（設計問題）の場合**: 影響範囲に応じて Phase 2〜5 へ戻る。
**CRITICAL 判定の場合**: Phase 1 へ戻り要件を再確認する。
