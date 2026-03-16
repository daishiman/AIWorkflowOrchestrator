# Phase 8: リファクタリング - 判断記録

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| ステータス | PASS (リファクタリング不要)                    |
| 実行日     | 2026-03-16                                     |

## Step 1: 現行実装の評価

| 観点               | 評価                                                                  | 判定 |
| ------------------ | --------------------------------------------------------------------- | ---- |
| 可読性             | Section 13 の try ブロックは 10 行（閾値 15 行以下）                  | OK   |
| パターン整合       | `safeRegister` + 戻り値分岐は Supabase 条件分岐パターンと整合         | OK   |
| フォールバック構造 | `registerFallbackHandlers` に `ReadonlyArray<FallbackHandler>` で準拠 | OK   |
| 定数配置           | `CONVERSATION_DB_SCHEMA` はモジュールスコープ（L102-138）に配置、適切 | OK   |
| 命名規則           | `registerConversationFallbackHandlers` は既存パターン準拠             | OK   |

## Step 2: `createConversationDatabase()` ヘルパー抽出判断

**判断: 抽出不要**

理由: Section 13 の safeRegister コールバック内は 10 行で、15 行閾値を下回る。
インラインのまま維持することで、コードの局所性が保たれ可読性は十分。

## Step 3: MINOR-01 対応（`track()` パターン整合）

**判断: 設計通り採用（MINOR-01 解消）**

理由:

1. `track()` の責務は「登録成功のカウント」のみ
2. フォールバック登録という追加副作用を `track()` に内包すると SRP 違反
3. `safeRegister()` の boolean 戻り値による明示的分岐は、フォールバックパスの可視性が高い
4. フォールバック部分で `track()` がラップしている（L930）のは、フォールバック登録自体の失敗も failures に記録する追加安全性

## Step 4: フォールバックハンドラ構造確認

全 7 チャンネルが網羅されていることを確認:

| チャンネル                              | 登録 |
| --------------------------------------- | ---- |
| `IPC_CHANNELS.CONVERSATION_LIST`        | OK   |
| `IPC_CHANNELS.CONVERSATION_GET`         | OK   |
| `IPC_CHANNELS.CONVERSATION_CREATE`      | OK   |
| `IPC_CHANNELS.CONVERSATION_UPDATE`      | OK   |
| `IPC_CHANNELS.CONVERSATION_DELETE`      | OK   |
| `IPC_CHANNELS.CONVERSATION_ADD_MESSAGE` | OK   |
| `IPC_CHANNELS.CONVERSATION_SEARCH`      | OK   |

`ReadonlyArray<FallbackHandler>` 型に適合していることを確認。

## 完了条件チェック

- [x] Section 13 コードの可読性評価が完了
- [x] `createConversationDatabase()` 抽出の要否判断が記録（不要と判断）
- [x] MINOR-01 対応判断が記録（設計通り採用で解消）
- [x] フォールバックハンドラが 7 チャンネル全て網羅を確認
- [x] リファクタリング変更なし → テスト継続 PASS は Phase 6-7 で確認済み
