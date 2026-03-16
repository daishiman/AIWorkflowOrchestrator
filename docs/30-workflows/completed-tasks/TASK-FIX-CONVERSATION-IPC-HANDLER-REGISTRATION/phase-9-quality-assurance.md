# Phase 9: 品質検証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| Phase名    | 品質検証                                       |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 8（リファクタリング）                    |
| 後続Phase  | Phase 10（最終レビュー）                       |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

Lint・TypeScript 型チェック・全テスト実行を行い、品質ゲートをすべてパスすることを確認する。
本 Phase は品質の **検証** であり、新規実装は行わない。

品質ゲートがすべて PASS した場合のみ Phase 10（最終レビュー）へ進む。
いずれかが FAIL した場合は対応する Phase（Lint/型エラー → Phase 5、テスト失敗 → Phase 5-6）へ戻る。

## 実行タスク

- ESLint 検証（`pnpm lint`）
- TypeScript 型チェック（`pnpm typecheck`）
- IPC 関連テスト限定実行（`cd apps/desktop && pnpm vitest run src/main/ipc/`）
- 全テスト実行（`pnpm test`）
- 品質ゲートテーブルの充足確認

## 参照資料

### システム仕様テーブル

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electronアーキテクチャ、IPC登録一覧      |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                      |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリングパターン               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（S30 Graceful Degradation） |

### コードベース参照

| ファイル               | パス                                                                                       | 備考                                   |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| IPC登録ハブ            | `apps/desktop/src/main/ipc/index.ts`                                                       | リファクタリング済み Section 13 を含む |
| Conversationハンドラ   | `apps/desktop/src/main/ipc/conversationHandlers.ts`                                        | 変更なし（確認対象）                   |
| Conversationリポジトリ | `apps/desktop/src/main/repositories/conversationRepository.ts`                             | 変更なし（確認対象）                   |
| Phase 1 仕様書         | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-1-requirements.md` | 受入基準 AC-01〜AC-08                  |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                       | P40（テスト実行ディレクトリ依存）      |

## 実行手順

### Step 1: ESLint 検証

プロジェクトルートから実行する。

```bash
pnpm lint
```

#### 合格基準

- エラー（error）が 0 件
- 警告（warning）は許容するが、新規追加の警告がないことを確認

#### よくある ESLint エラーと対処

| エラー                               | 対処                                           |
| ------------------------------------ | ---------------------------------------------- |
| `no-unused-vars`                     | 不要な import を削除する                       |
| `@typescript-eslint/no-explicit-any` | `any` を具体的な型に置き換える                 |
| `prettier/prettier`                  | `pnpm format` を実行してフォーマットを修正する |

### Step 2: TypeScript 型チェック

```bash
pnpm typecheck
```

#### 合格基準

- TypeScript コンパイルエラーが 0 件
- `strict: true` の設定のもとで型チェックが通過すること

#### 確認対象ファイル

新規追加した import・定数・関数に対して以下を確認する:

| 確認項目                                         | 期待値                                                        |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `import Database from "better-sqlite3"` の型解決 | `@types/better-sqlite3` から型が解決される                    |
| `new Database(conversationDbPath)` の型          | `Database.Database` 型                                        |
| `new ConversationRepository(db)` の型            | コンストラクタ引数 `Database.Database` に適合                 |
| `safeRegister(...)` の戻り値型                   | `boolean` 型として推論される                                  |
| `CONVERSATION_DB_SCHEMA` の型                    | `string` 型（テンプレートリテラル）                           |
| `FallbackHandler` 型への適合                     | `registerConversationFallbackHandlers` 内の配列が型エラーなし |

### Step 3: IPC 関連テスト限定実行

P40（テスト実行ディレクトリ依存）に従い、`apps/desktop` ディレクトリから実行する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/
```

#### 合格基準

- 全テストが PASS
- テスト数が Phase 6 完了時点と一致している（リファクタリングでテストが削除されていないこと）

#### 確認対象テストファイル

| テストファイル                                            | 確認内容                              |
| --------------------------------------------------------- | ------------------------------------- |
| `src/main/ipc/__tests__/conversationHandlers.test.ts`     | 全テスト PASS（ハンドラ動作が不変）   |
| `src/main/ipc/__tests__/ipc-graceful-degradation.test.ts` | フォールバックハンドラ登録テスト PASS |
| `src/main/ipc/__tests__/ipc-double-registration.test.ts`  | 二重登録防止テスト PASS               |

### Step 4: 全テスト実行

```bash
pnpm test
```

#### 合格基準

- 全テストが PASS
- テスト失敗件数: 0
- P22 対策として、タイムアウトや Worker 予期終了が発生した場合は `--no-file-parallelism` オプションで再実行して確認

```bash
# タイムアウト発生時の代替実行
pnpm --filter @repo/desktop exec vitest run --no-file-parallelism
```

### Step 5: 品質ゲートテーブルの評価

#### 品質ゲートテーブル

| カテゴリ     | チェック項目                                | 合格基準                         | 結果 |
| ------------ | ------------------------------------------- | -------------------------------- | ---- |
| 機能検証     | AC-01: `conversation:create` ハンドラ登録   | ユニットテスト PASS              | -    |
| 機能検証     | AC-02: 全 7 チャンネル登録                  | ユニットテスト PASS              | -    |
| 機能検証     | AC-03: DB テーブル存在確認                  | リポジトリテスト PASS            | -    |
| 機能検証     | AC-04: フォールバックハンドラ登録           | Graceful Degradation テスト PASS | -    |
| 機能検証     | AC-05: `unregisterAllIpcHandlers()` の解除  | 二重登録防止テスト PASS          | -    |
| 機能検証     | AC-06: 再登録時の二重登録エラーなし         | 二重登録防止テスト PASS          | -    |
| コード品質   | ESLint エラー 0 件                          | `pnpm lint` PASS                 | -    |
| コード品質   | TypeScript 型エラー 0 件                    | `pnpm typecheck` PASS            | -    |
| コード品質   | `any` 型・unsafe キャスト不使用             | コードレビューで確認             | -    |
| テスト網羅性 | AC-07: 既存テスト全 PASS                    | `pnpm test` PASS                 | -    |
| テスト網羅性 | AC-08: TypeScript 型チェック PASS           | `pnpm typecheck` PASS            | -    |
| セキュリティ | エラーメッセージにパス情報が含まれない      | P55 準拠確認（コードレビュー）   | -    |
| セキュリティ | DB ファイルパスがホームディレクトリ配下のみ | コードレビューで確認             | -    |

#### 品質ゲートの判定基準

| 判定 | 条件                                                | 対応                      |
| ---- | --------------------------------------------------- | ------------------------- |
| PASS | 全項目が合格基準を充足している                      | Phase 10 へ進む           |
| FAIL | 1 件以上のテスト失敗 / Lint エラー / 型エラーがある | 対応 Phase へ戻り修正する |

### Step 6: FAIL 時の対応フロー

| FAIL 種別                            | 対応先 Phase | 対応内容                                 |
| ------------------------------------ | ------------ | ---------------------------------------- |
| ESLint エラー                        | Phase 5      | 実装コードの Lint 修正                   |
| TypeScript 型エラー                  | Phase 5      | 型定義の修正                             |
| conversationHandlers テスト FAIL     | Phase 5      | ハンドラ実装の修正                       |
| ipc-graceful-degradation テスト FAIL | Phase 5-6    | フォールバックハンドラ実装・テストの修正 |
| ipc-double-registration テスト FAIL  | Phase 5      | 二重登録防止実装の修正                   |
| カバレッジ不足                       | Phase 6      | テストの追加                             |

## 統合テスト連携

本 Phase の完了条件として、以下の受入基準（Phase 1 定義）を自動テストで検証済みとする:

| 受入基準 | 検証方法                               | 対応テスト                         |
| -------- | -------------------------------------- | ---------------------------------- |
| AC-01    | `conversation:create` ハンドラ登録確認 | `conversationHandlers.test.ts`     |
| AC-02    | 全 7 チャンネル登録確認                | `conversationHandlers.test.ts`     |
| AC-03    | DB テーブル存在確認                    | `conversationRepository.test.ts`   |
| AC-04    | フォールバックハンドラ登録確認         | `ipc-graceful-degradation.test.ts` |
| AC-05    | `unregisterAllIpcHandlers()` 解除確認  | `ipc-double-registration.test.ts`  |
| AC-06    | 再登録時の二重登録エラーなし確認       | `ipc-double-registration.test.ts`  |
| AC-07    | 既存テスト全 PASS                      | `pnpm test`                        |
| AC-08    | TypeScript 型チェック PASS             | `pnpm typecheck`                   |

## 成果物

| 成果物           | パス                                                                                            | 内容                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 9 仕様書   | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-9-quality-assurance.md` | 本ドキュメント                               |
| 品質検証レポート | `outputs/phase-9/quality-report.md`                                                             | 各 Step の実行結果（PASS/FAIL + 件数）の記録 |

## 完了条件

- [ ] `pnpm lint` が PASS（エラー 0 件）
- [ ] `pnpm typecheck` が PASS（型エラー 0 件）
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/` が全 PASS
- [ ] `pnpm test` が全 PASS
- [ ] 品質ゲートテーブルの全項目が合格基準を充足している
- [ ] 品質検証レポート（`outputs/phase-9/quality-report.md`）が作成されている

## 次のPhase

Phase 10（最終レビュー）へ進む。多角的な品質・整合性検証を行い、PASS/MINOR/MAJOR/CRITICAL の判定を行う。
