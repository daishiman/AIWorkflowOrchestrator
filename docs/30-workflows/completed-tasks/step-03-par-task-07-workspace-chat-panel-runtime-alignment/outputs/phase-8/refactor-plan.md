# Phase 8: リファクタ計画

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 8                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## T8-4: Dead Code 検出結果

| 検出パターン                                                     | 結果           | 除去対象           |
| ---------------------------------------------------------------- | -------------- | ------------------ |
| `authMode\|isApiKey\|apiKeyToggle` in WorkspaceView/             | 0件            | なし               |
| `DEFAULT_CONFIG\|defaultConfig\|fallbackModel` in WorkspaceView/ | 0件            | なし               |
| `subscription\|toggle` in WorkspaceView/                         | UI toggle のみ | なし（正規コード） |

**結論**: dead code は検出されなかった。P62 fallback（`?? "gpt-4o"`）は Phase 5 で既に除去済み。

## T8-3: 命名・語彙統一チェック

| 旧表現                 | 検出結果 | 対応                   |
| ---------------------- | -------- | ---------------------- |
| `isApiKeyAvailable`    | 0件      | 不要（未使用）         |
| `openTerminal`         | 0件      | 不要（未使用）         |
| `showHelp` / `showTip` | 0件      | 不要（未使用）         |
| `authMode` / `apiMode` | 0件      | 不要（未使用）         |
| `fallbackModel`        | 0件      | 不要（P62 で削除済み） |

**結論**: 語彙統一テーブルの旧表現は全て検出されなかった。Phase 5 実装時に正しい語彙で実装されている。

## T8-1/T8-2: State・Helper 整理（計画）

### 現状のファイル構造

| ファイル                      | 行数 | 責務                              |
| ----------------------------- | ---- | --------------------------------- |
| useWorkspaceChatController.ts | 640  | controller 全体（hook + helpers） |

### 既に分離されている要素

| 要素                     | 分離状態             | 行数 |
| ------------------------ | -------------------- | ---- |
| flattenFiles             | モジュールレベル関数 | 19   |
| readSelectedFile         | モジュールレベル関数 | 14   |
| buildFileContextBlock    | モジュールレベル関数 | 33   |
| buildChatRequest         | モジュールレベル関数 | 24   |
| getWorkspaceSuggestions  | モジュールレベル関数 | 4    |
| useWorkspaceMentionQuery | 独立 hook ファイル   | -    |

### 抽出候補（環境制約により計画のみ）

| 抽出先 hook                | 移動対象                                    | 推定行数 | リスク |
| -------------------------- | ------------------------------------------- | -------- | ------ |
| useStreamingState          | isStreaming, streamContent, refs, listeners | ~120     | Medium |
| useCancelStream            | cancelStream, requestIdRef, cleanup effect  | ~30      | Low    |
| useConversationPersistence | ensureConversation, persistAssistantMessage | ~60      | Medium |

### 環境制約による実装延期の理由

esbuild アーキテクチャ不一致（`@esbuild/darwin-arm64` vs `@esbuild/darwin-x64`）により vitest が実行不可。Phase 8 のリファクタリング原則「1 hook 抽出ごとにテストを実行して緑を確認する」を遵守できないため、hook 抽出は延期する。

TypeScript コンパイル（`tsc --noEmit`）は PASS しており、型レベルの整合性は確認済み。

### Controller 行数

- 現在: 640行（うちモジュールレベル関数 94行、hook 本体 546行）
- 目標: 300行以下
- 差分: hook 抽出で ~210行移動可能 → ~430行（目標未達）
- 300行以下達成には mention 関連（insertMention, selectMentionAtIndex 等 ~70行）の完全分離も必要

## T8-3: Import 整理

未使用 import は検出されなかった（TypeScript コンパイル PASS で確認）。

## セキュリティスキャン（T9-4 先行）

| スキャン                                      | 結果 |
| --------------------------------------------- | ---- |
| `homedir\|__dirname\|process.env` in Renderer | 0件  |

## 回帰確認

| 確認項目              | 結果                 |
| --------------------- | -------------------- |
| TypeScript コンパイル | PASS（error 0）      |
| 機能変更              | なし（コード変更 0） |
| テスト assertion 変更 | なし（コード変更 0） |
| dead code 除去        | なし（検出 0件）     |

## 未タスク候補

| ID                                                | 内容                                                                    | 優先度 |
| ------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001    | useStreamingState / useCancelStream / useConversationPersistence の抽出 | Low    |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-MENTION-001 | mention 関連ロジックの完全分離                                          | Low    |
