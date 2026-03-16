# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 11                                             |
| Phase名    | 手動テスト                                     |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 10（最終レビュー）                       |
| 後続Phase  | Phase 12（ドキュメント更新）                   |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

自動テストでは検証できない実際の動作を確認し、IPC ハンドラが Electron アプリ上で正しく
動作することをエンドツーエンドで検証する。

本タスクは **IPC/API 変更のみ**（UI 変更なし）のため、スクリーンショット取得は
「推奨」レベルとする（必須ではない）。

## 実行タスク

- TC-01〜TC-08 の手動テストシナリオ実行
- DevTools Console による conversation API の動作確認
- DB 初期化失敗シミュレーションによるフォールバック検証
- 発見課題の記録（0 件でも出力必須）

## 参照資料

### システム仕様テーブル

| 参照資料                | パス                                                                           | 内容                                |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Electronアーキテクチャ、IPC登録一覧 |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB初期化パターン                    |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPCセキュリティ原則                 |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーハンドリングパターン          |

### コードベース参照

| ファイル              | パス                                                                                        | 備考                 |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| IPC登録ハブ           | `apps/desktop/src/main/ipc/index.ts`                                                        | Section 13 実装済み  |
| Conversationハンドラ  | `apps/desktop/src/main/ipc/conversationHandlers.ts`                                         | 7チャンネル実装      |
| Preload API           | `apps/desktop/src/preload/index.ts`                                                         | conversationAPI 定義 |
| Phase 10 最終レビュー | `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-10-final-review.md` | PASS 判定確認用      |

## テスト環境

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| OS           | macOS 14.x                      |
| Node.js      | v20.x                           |
| Electron     | pnpm --filter @repo/desktop dev |
| テストモード | 開発モード（DevTools 使用可）   |

## 実行手順

### Step 1: アプリ起動確認

```bash
pnpm --filter @repo/desktop dev
```

起動後、DevTools を開く（`Cmd+Option+I`）。Console タブに切り替え、
以下のいずれかのエラーが **出ていないこと** を確認する。

| 確認項目                                                       | 期待結果                   |
| -------------------------------------------------------------- | -------------------------- |
| `No handler registered for 'conversation:create'`              | 出力されない               |
| `No handler registered for 'conversation:list'`                | 出力されない               |
| DB 初期化エラーが Console に出力されていないこと（正常起動時） | 出力されない（正常な場合） |

### Step 2: テストシナリオ実行

テストシナリオを TC-01 から順に実行する。各 TC の実行後、結果を
`outputs/phase-11/manual-test-result.md` に記録する。

#### TC-01: conversation:create 基本動作

**目的**: `conversation:create` が正しく動作することを確認する。

**操作手順（DevTools Console）**:

```javascript
const result = await window.conversationAPI.create({
  title: "test",
  userId: "u1",
});
console.log(JSON.stringify(result));
```

**期待結果**:

```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "title": "test",
    "userId": "u1",
    "createdAt": "<ISO日時>",
    "updatedAt": "<ISO日時>"
  }
}
```

**確認ポイント**: `success: true` であること、`id` フィールドが存在すること。

---

#### TC-02: conversation:list 一覧取得

**目的**: TC-01 で作成した会話が一覧に含まれることを確認する。

**操作手順（DevTools Console）**:

```javascript
const result = await window.conversationAPI.list({ userId: "u1" });
console.log(JSON.stringify(result));
```

**期待結果**:

```json
{
  "success": true,
  "data": {
    "conversations": [
      { "id": "<TC-01のid>", "title": "test", "userId": "u1", ... }
    ],
    "total": 1
  }
}
```

**確認ポイント**: TC-01 で作成した会話が配列内に含まれること。

---

#### TC-03: conversation:get 詳細取得

**目的**: `conversation:get` が会話の詳細を返すことを確認する。

**操作手順（DevTools Console）**:

```javascript
// TC-01 で取得した id を使用
const id = "<TC-01で取得したid>";
const result = await window.conversationAPI.get({ id });
console.log(JSON.stringify(result));
```

**期待結果**: `success: true`、`data.id` が指定した id と一致すること。

---

#### TC-04: conversation:update 更新

**目的**: 会話タイトルを更新できることを確認する。

**操作手順（DevTools Console）**:

```javascript
const id = "<TC-01で取得したid>";
const result = await window.conversationAPI.update({
  id,
  data: { title: "updated" },
});
console.log(JSON.stringify(result));
```

**期待結果**: `success: true`、更新後の `title` が `"updated"` であること。

---

#### TC-05: conversation:addMessage メッセージ追加

**目的**: 会話にメッセージを追加できることを確認する。

**操作手順（DevTools Console）**:

```javascript
const sessionId = "<TC-01で取得したid>";
const result = await window.conversationAPI.addMessage({
  sessionId,
  message: { content: "hello", role: "user" },
});
console.log(JSON.stringify(result));
```

**期待結果**: `success: true`、メッセージが追加されていること。

---

#### TC-06: conversation:search 検索

**目的**: キーワード検索が機能することを確認する。

**操作手順（DevTools Console）**:

```javascript
const result = await window.conversationAPI.search({
  userId: "u1",
  query: "test",
});
console.log(JSON.stringify(result));
```

**期待結果**: `success: true`、TC-01 で作成した `"test"` タイトルの会話が
検索結果に含まれること。

---

#### TC-07: conversation:delete 削除

**目的**: 会話を削除できることを確認する。

**操作手順（DevTools Console）**:

```javascript
const id = "<TC-01で取得したid>";
const result = await window.conversationAPI.delete({ id });
console.log(JSON.stringify(result));
```

**期待結果**: `success: true`、削除後に TC-02 を実行すると該当会話が
含まれないこと。

---

#### TC-08: フォールバック応答確認（DB 初期化失敗シミュレーション）

**目的**: DB 初期化失敗時に全 7 チャンネルが
`{ success: false, error: { code: "DB_NOT_AVAILABLE" } }` を返すことを確認する。

**操作手順**:

1. `apps/desktop/src/main/ipc/index.ts` の Section 13 を一時的に
   `throw new Error("SIMULATED_DB_FAIL")` に書き換え、アプリを再起動する。
2. DevTools Console で以下を実行する。

```javascript
const result = await window.conversationAPI.create({
  title: "test",
  userId: "u1",
});
console.log(JSON.stringify(result));
```

**期待結果**:

```json
{
  "success": false,
  "error": {
    "code": "DB_NOT_AVAILABLE",
    "message": "Conversation database is not available"
  }
}
```

3. 確認後、Section 13 の一時的な変更を元に戻す。

---

### Step 3: 発見課題の記録

テスト実行中に発見した課題・改善提案を以下の形式で記録する（0 件でも出力必須）。

| 発見ID  | TC  | 内容     | 重大度 | 対応方針 |
| ------- | --- | -------- | ------ | -------- |
| BUG-001 | -   | （なし） | -      | -        |

## 統合テスト連携

本 Phase で実行する手動テストと、自動テストの対応を以下に示す。

| TC    | 対応する自動テスト                                     | 自動テストとの差異       |
| ----- | ------------------------------------------------------ | ------------------------ |
| TC-01 | `conversationHandlers.test.ts` - create 正常系         | 実際の Electron IPC 経由 |
| TC-02 | `conversationHandlers.test.ts` - list 正常系           | 実際の DB ファイル使用   |
| TC-03 | `conversationHandlers.test.ts` - get 正常系            | 実際の Electron IPC 経由 |
| TC-04 | `conversationHandlers.test.ts` - update 正常系         | 実際の DB ファイル使用   |
| TC-05 | `conversationHandlers.test.ts` - addMessage 正常系     | 実際の Electron IPC 経由 |
| TC-06 | `conversationHandlers.test.ts` - search 正常系         | 実際の DB ファイル使用   |
| TC-07 | `conversationHandlers.test.ts` - delete 正常系         | 実際の Electron IPC 経由 |
| TC-08 | `ipc-graceful-degradation.test.ts` - fallback ハンドラ | 実際の起動フロー全体     |

## 成果物

| 成果物             | パス                                     | 内容                                |
| ------------------ | ---------------------------------------- | ----------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | TC-01〜TC-08 の実行結果・判定       |
| 発見課題一覧       | `outputs/phase-11/manual-test-result.md` | 発見 BUG/改善提案（0件でも必須）    |
| スクリーンショット | `outputs/phase-11/screenshots/`          | 任意（IPC変更タスクのため推奨のみ） |

## 完了条件

- [ ] アプリが `pnpm --filter @repo/desktop dev` で正常起動した
- [ ] TC-01〜TC-07 の全テストシナリオを実行した
- [ ] TC-08（フォールバック確認）を実行した
- [ ] 全 TC で期待結果と一致することを確認した（または差異を記録した）
- [ ] 発見課題一覧（0件でも）を `outputs/phase-11/manual-test-result.md` に記録した
- [ ] 手動テスト結果（`outputs/phase-11/manual-test-result.md`）を作成した

## 次のPhase

**全 TC が期待結果と一致した場合**: Phase 12（ドキュメント更新）へ進む。

**重大度「高」のバグが発見された場合**: 影響範囲に応じて Phase 5〜9 へ戻る。

`docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-12-documentation.md`
