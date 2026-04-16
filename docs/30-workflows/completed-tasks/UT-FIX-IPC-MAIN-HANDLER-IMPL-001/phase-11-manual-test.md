# Phase 11 — 手動テスト

## メタ情報

| 項目           | 値                                    |
| -------------- | ------------------------------------- |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH11 |
| フェーズ       | Phase 11（手動テスト）                |
| ステータス     | completed                             |
| 前フェーズ     | Phase 10（最終レビュー）              |
| 次フェーズ     | Phase 12（ドキュメント更新）          |

---

## 1. 手動テストの目的

自動テストでは検証しにくい実際の動作（OAuth フロー・設定保存・エージェント実行）を開発環境で確認する。

---

## 2. 前提条件

- Electron アプリをローカル開発モードで起動できること
- `NODE_ENV=development` が設定されていること（デフォルト）

```bash
pnpm --filter @repo/desktop dev
```

---

## 3. テストシナリオ

### 3.1 `auth:start-oauth-flow` の動作確認

**シナリオ**: OAuth フローが起動できること

**手順:**

1. Electron アプリを開発モードで起動する
2. DevTools のコンソールで以下を実行する:

```javascript
// Renderer プロセスの DevTools コンソールで実行
window.electronAPI
  .invoke("auth:start-oauth-flow", { provider: "google" })
  .then((result) => console.log("result:", result));
```

**期待する結果:**

- `{ success: true }` が返る
- ブラウザウィンドウまたはシステムブラウザで OAuth 画面が開く（または開こうとする）

**代替確認方法（DevTools が使用できない場合）:**

```bash
# Main プロセスのログを確認
# アプリ起動後、ログに "[AuthHandlers]" が出力されないことを確認（エラーなし）
```

---

### 3.2 `auth:test-callback` の動作確認

**シナリオ 1**: 開発環境でのコールバック手動送信

**手順:**

1. `NODE_ENV=development` で起動済みのアプリの DevTools で実行:

```javascript
window.electronAPI
  .invoke("auth:test-callback", {
    callbackUrl: "aiworkflow://auth/callback?code=test-code&state=test-state",
  })
  .then((result) => console.log("result:", result));
```

**期待する結果:** `{ success: false, error: { code: 'CALLBACK_FAILED', ... } }` または処理試行の痕跡（本番Supabase URLがないため失敗は許容）

**シナリオ 2**: 本番環境ガードの確認（重要）

```bash
# 本番環境を模擬して起動
NODE_ENV=production pnpm --filter @repo/desktop dev
```

DevTools で実行:

```javascript
window.electronAPI
  .invoke("auth:test-callback", { callbackUrl: "aiworkflow://..." })
  .then((result) => console.log("result:", result));
```

**期待する結果:** `{ success: false, error: { code: 'FORBIDDEN', ... } }` が即座に返る（処理は一切行われない）

---

### 3.3 `settings:get` / `settings:update` の動作確認

**シナリオ**: userSettings オブジェクトの保存・取得が機能すること

```javascript
// settings:update で保存（部分更新）
await window.electronAPI.invoke("settings:update", {
  theme: "dark",
  language: "ja",
});

// settings:get で取得（userSettings 全体）
const result = await window.electronAPI.invoke("settings:get", {});
console.log(result); // { success: true, data: { theme: 'dark', language: 'ja' } }

// 既存設定に対する追加更新
await window.electronAPI.invoke("settings:update", {
  notifications: true,
});

const result2 = await window.electronAPI.invoke("settings:get");
console.log(result2); // { success: true, data: { theme: 'dark', language: 'ja', notifications: true } }
```

**期待する結果:** 部分更新した userSettings がそのまま取得できること

---

### 3.4 `agent:get-skills` の動作確認

**シナリオ**: スキル一覧が取得できること

```javascript
const result = await window.electronAPI.invoke("agent:get-skills");
console.log("skills:", result);
// 期待: { success: true, data: [...] }（スキルが0件でも配列が返る）
```

---

### 3.5 `agent:get-skill-detail` の動作確認

**シナリオ**: スキル詳細が取得できること

```javascript
// まず agent:get-skills でスキルIDを取得
const skills = await window.electronAPI.invoke("agent:get-skills");
if (skills.data && skills.data.length > 0) {
  const skillId = skills.data[0].id || skills.data[0].name;
  const detail = await window.electronAPI.invoke("agent:get-skill-detail", {
    skillId,
  });
  console.log("detail:", detail);
}

// 存在しないIDでのエラー確認
const notFound = await window.electronAPI.invoke("agent:get-skill-detail", {
  skillId: "nonexistent",
});
console.log("not found:", notFound); // { success: false, error: { code: 'NOT_FOUND' } }
```

---

### 3.6 `agent:execute` の動作確認

**シナリオ**: エージェント実行が開始できること

```javascript
const result = await window.electronAPI.invoke("agent:execute", {
  prompt: "Hello, agent!",
  skillId: undefined, // オプション
});
console.log("execute result:", result);
// 期待: { success: true, executionId: '<uuid>' }
```

---

### 3.7 `agent:permission-respond` の動作確認

**シナリオ**: 実行中のパーミッションリクエストに応答できること

```javascript
// agent:execute で実行開始後、パーミッションリクエストが発生した場合に応答
const response = await window.electronAPI.invoke("agent:permission-respond", {
  requestId: "req-test-123",
  approved: true,
});
console.log("permission response:", response);
// 期待: { success: true } または { success: false }（requestIdが存在しない場合）
```

---

## 4. 確認できない場合の代替手段

Electron アプリの起動環境がない場合や DevTools が使用できない場合:

1. **ユニットテストの実行**: Phase 4 で作成したテストが PASS することで動作を担保する
2. **`ipcMain.handle` の登録確認**: Phase 7 のコマンドで静的確認を実施する
3. **CI での確認**: `node scripts/verify-ipc-4layer.cjs` の Rule-2 PASS をもって動作確認とみなす

---

## 5. 手動テスト結果記録

| シナリオ                            | 結果                    | 備考 |
| ----------------------------------- | ----------------------- | ---- |
| `auth:start-oauth-flow` 基本動作    | [x] PASS / [ ] SKIP     |      |
| `auth:test-callback` 開発環境       | [x] PASS / [ ] SKIP     |      |
| `auth:test-callback` 本番環境ガード | [x] PASS / **必須確認** |      |
| `settings:get` / `settings:update`  | [x] PASS / [ ] SKIP     |      |
| `agent:get-skills`                  | [x] PASS / [ ] SKIP     |      |
| `agent:get-skill-detail`            | [x] PASS / [ ] SKIP     |      |
| `agent:execute`                     | [x] PASS / [ ] SKIP     |      |
| `agent:permission-respond`          | [x] PASS / [ ] SKIP     |      |

> `auth:test-callback` の本番環境ガード確認は SKIP 不可。必ずユニットテストまたは手動で確認すること。
