# 要件定義書: SkillService.executeSkill() の SkillExecutor 委譲

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase      | 1                                     |
| 作成日     | 2026-02-11                            |
| 依存タスク | TASK-FIX-15-1, TASK-FIX-16-1 (完了済) |

---

## 1. 概要

### 1.1 目的

SkillService.executeSkill() のスタブ実装を解消し、完全実装済みの SkillExecutor に実行を委譲することで、スキル実行機能を完成させる。

### 1.2 背景

#### 現状の問題

| コンポーネント                | 現状                                     | 問題点                              |
| ----------------------------- | ---------------------------------------- | ----------------------------------- |
| `SkillService.executeSkill()` | 常に成功を返すスタブ (L161-200)          | 実際のスキル実行が行われない        |
| `SkillExecutor.execute()`     | SDK query() 使用の完全実装               | IPCハンドラーから呼び出されていない |
| `skill:execute` IPCハンドラー | `skillService.executeSkill()` を呼び出し | SkillExecutor の機能が未使用        |

#### SkillExecutor の実装済み機能

- SDK query() を使用したスキル実行
- ストリーミング応答配信 (SKILL_CHANNELS.SKILL_STREAM)
- リトライ対応 (Exponential Backoff + Jitter)
- 中断（abort）対応
- 権限管理 (PermissionResolver/PermissionStore)
- Hooks対応 (PreToolUse/PostToolUse)
- AuthKeyService統合 (TASK-FIX-16-1)

---

## 2. 機能要件 (FR)

### FR-001: スキル実行委譲

| 項目   | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 優先度 | P0 (必須)                                                                |
| 説明   | `skill:execute` IPCハンドラーが `SkillExecutor.execute()` を直接呼び出す |

#### 詳細

1. IPCハンドラーで `skillId` から `Skill` を取得 (`SkillService.getSkillById()`)
2. `Skill` を `SkillMetadata` に変換
3. `SkillExecutionRequest` を構築
4. `SkillExecutor.execute(request, skillMetadata)` を呼び出し
5. レスポンスを変換して返却

### FR-002: ストリーミング応答の配信

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| 優先度 | P0 (必須)                                            |
| 説明   | スキル実行結果がストリーミングでRendererに配信される |

#### ストリームメッセージタイプ

| タイプ     | 説明               |
| ---------- | ------------------ |
| `text`     | テキストメッセージ |
| `tool_use` | ツール使用通知     |
| `error`    | エラー通知         |
| `complete` | 完了通知           |
| `retry`    | リトライ通知       |

### FR-003: 実行パラメータの引き継ぎ

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 優先度 | P0 (必須)                                                             |
| 説明   | IPCハンドラーの引数（skillId, params）がSkillExecutorに正しく渡される |

#### パラメータ変換仕様

| IPC引数          | SkillExecutionRequest | 変換ルール                                |
| ---------------- | --------------------- | ----------------------------------------- |
| `params.prompt`  | `prompt`              | 優先使用                                  |
| `params.message` | `prompt`              | `prompt` がない場合の互換性フォールバック |
| `params.timeout` | `timeout`             | そのまま渡す                              |
| `skillId`        | `skillId`             | そのまま渡す                              |

### FR-004: 中断機能の連携

| 項目   | 内容                                                |
| ------ | --------------------------------------------------- |
| 優先度 | P1 (重要)                                           |
| 説明   | `skill:abort` が `SkillExecutor.abort()` と連携する |

### FR-005: 実行状態の取得

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 優先度 | P1 (重要)                                                             |
| 説明   | `skill:get-status` が `SkillExecutor.getExecutionStatus()` と連携する |

---

## 3. 非機能要件 (NFR)

### NFR-001: セキュリティ

| 項目   | 内容                             |
| ------ | -------------------------------- |
| 優先度 | P0 (必須)                        |
| 説明   | 既存のセキュリティ機構を維持する |

#### セキュリティ要件

| 要件              | 実装方法                         |
| ----------------- | -------------------------------- |
| 送信元検証        | `validateIpcSender()` を維持     |
| 安全なIPC呼び出し | safeInvoke/safeOnパターンを維持  |
| チャンネル名管理  | IPC_CHANNELSホワイトリストを維持 |

### NFR-002: エラーハンドリング

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 優先度 | P0 (必須)                                    |
| 説明   | エラー発生時の適切なハンドリングとレスポンス |

#### エラーカテゴリとコード範囲

| カテゴリ               | コード範囲 | 適用例                                     | リトライ |
| ---------------------- | ---------- | ------------------------------------------ | -------- |
| Validation Error       | 1000-1999  | skillId未指定、スキル未インポート          | 不可     |
| Business Error         | 2000-2999  | スキル未存在、SkillExecutor未初期化        | 不可     |
| External Service Error | 3000-3999  | SDK認証エラー、SDK実行エラー、タイムアウト | **可能** |
| Internal Error         | 5000-5999  | 予期せぬエラー                             | 不可     |

#### ログサニタイズ要件

| 項目                 | 方針                                               |
| -------------------- | -------------------------------------------------- |
| APIキー              | ログ出力禁止（`[REDACTED]` に置換）                |
| ユーザー入力(prompt) | 最初の50文字のみログ出力                           |
| スタック情報         | 本番環境ではユーザー向けエラーに含めない           |
| エラーメッセージ     | 内部詳細を含めない（サニタイズ後に Renderer 送信） |

### NFR-003: 後方互換性

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 優先度 | P1 (重要)                                  |
| 説明   | 既存のRenderer側コードが変更なしで動作する |

#### 互換性維持項目

| 項目                       | 維持方法                              |
| -------------------------- | ------------------------------------- |
| レスポンス形式             | `{ success, data, error }` 形式を維持 |
| `useSkillExecution` フック | インターフェース変更なし              |
| ストリームチャンネル       | `SKILL_CHANNELS.SKILL_STREAM` を維持  |

### NFR-004: パフォーマンス

| 項目   | 内容                             |
| ------ | -------------------------------- |
| 優先度 | P2 (望ましい)                    |
| 説明   | スキル実行のレイテンシを維持する |

---

## 4. スコープ定義

### 4.1 スコープ内

1. `skill:execute` IPCハンドラーの修正
2. パラメータ変換関数の追加 (`extractPromptFromParams`)
3. `Skill` → `SkillMetadata` 変換関数の追加
4. `SkillService.executeSkill()` への `@deprecated` 追加
5. 必要なテストの追加・修正

### 4.2 スコープ外

1. SkillExecutorの機能追加
2. 新しいIPCチャンネルの追加
3. Renderer側コンポーネントの変更
4. PermissionStore/PermissionResolverの変更

---

## 5. データフロー

### 5.1 正常系

```
1. Renderer: useSkillExecution.execute({ skillId, params })
      ↓
2. Preload: safeInvoke('skill:execute', { skillId, params })
      ↓
3. Main: skillHandlers skill:execute handler
      ↓
4. Main: SkillService.getSkillById(skillId) → Skill
      ↓
5. Main: SkillExecutor.execute(request, skillMetadata)
      ↓
6. Main: SDK query() 開始
      ↓
7. Main: for await (message of response.stream())
      ↓ (並行)
8. Main: mainWindow.webContents.send(SKILL_STREAM, message)
      ↓
9. Renderer: onSkillStream コールバックで受信
      ↓
10. Main: 完了メッセージ送信 (type: 'complete')
      ↓
11. Main: return { success: true, data: { executionId } }
      ↓
12. Renderer: 実行完了
```

### 5.2 エラー系

| エラー発生ポイント | エラー種別       | 対応                                           |
| ------------------ | ---------------- | ---------------------------------------------- |
| Step 4             | スキル未発見     | `SKILL_NOT_FOUND` エラーを返却                 |
| Step 5             | Executor未初期化 | `EXECUTOR_NOT_INITIALIZED` エラーを返却        |
| Step 6             | 認証エラー       | `AUTHENTICATION_ERROR` + ストリームでerror通知 |
| Step 7             | SDK実行エラー    | `EXECUTION_FAILED` + ストリームでerror通知     |
| Step 7             | ユーザー中断     | `ABORTED` + ストリームでerror通知              |

---

## 6. 接続要件

### 6.1 IPCチャンネル

| チャンネル         | 方向            | 定数                            | 用途                 |
| ------------------ | --------------- | ------------------------------- | -------------------- |
| `skill:execute`    | Renderer → Main | `IPC_CHANNELS.SKILL_EXECUTE`    | 実行開始             |
| `skill:stream`     | Main → Renderer | `SKILL_CHANNELS.SKILL_STREAM`   | メッセージストリーム |
| `skill:abort`      | Renderer → Main | `IPC_CHANNELS.SKILL_ABORT`      | 実行中断             |
| `skill:get-status` | Renderer → Main | `IPC_CHANNELS.SKILL_GET_STATUS` | ステータス照会       |

### 6.2 認証フロー

- AuthKeyService経由でAnthropic APIキー取得
- 環境変数 `ANTHROPIC_API_KEY` へのフォールバック対応

---

## 7. 関連資料

| 資料名                   | パス                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------ |
| SkillService実装         | `apps/desktop/src/main/services/skill/SkillService.ts`                               |
| SkillExecutor実装        | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              |
| skillHandlers実装        | `apps/desktop/src/main/ipc/skillHandlers.ts`                                         |
| SkillExecutor仕様書      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` |
| IPCセキュリティ仕様書    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`            |
| エラーハンドリング仕様書 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                |
