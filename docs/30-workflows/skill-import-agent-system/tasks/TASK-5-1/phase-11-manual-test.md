# Phase 11: 手動テスト検証

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 11                        |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

自動テストでは検証できないユーザー体験・実環境動作を手動で確認する。

## 実行タスク

- IPC通信検証: Renderer-Main間の通信確認
- エラー表示検証: エラー発生時のUI動作確認
- 統合動作検証: 実際のスキル実行フロー確認

---

## テストカテゴリ

### 1. 機能テスト

| No  | テスト項目               | 前提条件             | 操作手順                                   | 期待結果                     | 実行結果 |
| --- | ------------------------ | -------------------- | ------------------------------------------ | ---------------------------- | -------- |
| 1   | execute 呼び出し         | アプリ起動済み       | `window.skillAPI.execute()` を実行         | executionId が返される       | [ ]      |
| 2   | abort 呼び出し           | スキル実行中         | `window.skillAPI.abort(id)` を実行         | true が返される              | [ ]      |
| 3   | onStream 登録            | アプリ起動済み       | `window.skillAPI.onStream(cb)` を実行      | クリーンアップ関数が返される | [ ]      |
| 4   | ストリーム受信           | スキル実行中         | Main からストリームメッセージ送信          | コールバックが呼び出される   | [ ]      |
| 5   | onPermissionRequest 登録 | アプリ起動済み       | `window.skillAPI.onPermissionRequest(cb)`  | クリーンアップ関数が返される | [ ]      |
| 6   | 権限リクエスト受信       | スキル実行中         | Main から権限リクエスト送信                | コールバックが呼び出される   | [ ]      |
| 7   | sendPermissionResponse   | 権限リクエスト受信後 | `window.skillAPI.sendPermissionResponse()` | `{success: true}` が返される | [ ]      |

### 2. セキュリティテスト

| No  | テスト項目         | 前提条件       | 操作手順                               | 期待結果                     | 実行結果 |
| --- | ------------------ | -------------- | -------------------------------------- | ---------------------------- | -------- |
| 1   | 不正チャネルinvoke | アプリ起動済み | 許可されていないチャネルにinvoke       | エラーがスローされる         | [ ]      |
| 2   | 不正チャネルon     | アプリ起動済み | 許可されていないチャネルにリスナー登録 | 空のクリーンアップ関数が返る | [ ]      |

### 3. 統合テスト（手動）

| No  | テスト項目 | 前提条件       | 操作手順                                 | 期待結果               | 実行結果 |
| --- | ---------- | -------------- | ---------------------------------------- | ---------------------- | -------- |
| 1   | 完全フロー | アプリ起動済み | execute → ストリーム受信 → 完了確認      | 全フローが正常に動作   | [ ]      |
| 2   | 中断フロー | スキル実行中   | execute → abort → クリーンアップ確認     | 中断が正常に動作       | [ ]      |
| 3   | 権限フロー | スキル実行中   | 権限リクエスト受信 → 応答送信 → 続行確認 | 権限フローが正常に動作 | [ ]      |

---

## 統合テスト連携【必須】

手動統合テスト（IPC接続）を確認:

| テスト項目         | 確認内容                         | 期待結果           | 実行結果 |
| ------------------ | -------------------------------- | ------------------ | -------- |
| IPC接続            | Renderer→Preload→Main の通信疎通 | 正常に通信できる   | [ ]      |
| ストリームフロー   | Main→Preload→Renderer のイベント | コールバック実行   | [ ]      |
| 権限確認フロー     | リクエスト→応答→続行             | フロー正常完了     | [ ]      |
| エラーハンドリング | 不正チャネルアクセス時           | エラーが返される   | [ ]      |
| クリーンアップ     | リスナー解除後のメモリリーク確認 | リソース解放される | [ ]      |

---

## 手動テスト手順

### 準備

```bash
# 開発サーバー起動
pnpm --filter @repo/desktop dev
```

### テスト実行（DevTools Console）

```javascript
// 1. execute テスト
const result = await window.skillAPI.execute({ skillName: "test-skill" });
console.log("Execute result:", result);

// 2. onStream テスト
const cleanup = window.skillAPI.onStream((msg) => {
  console.log("Stream message:", msg);
});
// 後で: cleanup();

// 3. abort テスト（実行中のIDを使用）
const abortResult = await window.skillAPI.abort(result.executionId);
console.log("Abort result:", abortResult);

// 4. onPermissionRequest テスト
const permCleanup = window.skillAPI.onPermissionRequest((req) => {
  console.log("Permission request:", req);
});
// 後で: permCleanup();

// 5. sendPermissionResponse テスト（リクエストを受信した後）
const permResult = await window.skillAPI.sendPermissionResponse({
  requestId: "test-request-id",
  allowed: true,
});
console.log("Permission response result:", permResult);
```

---

## 成果物

| 成果物     | パス                                     | 説明           |
| ---------- | ---------------------------------------- | -------------- |
| テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト結果 |

---

## テスト結果テンプレート

```markdown
## 手動テスト結果

### 実行環境

| 項目     | 内容        |
| -------- | ----------- |
| 実行日   | YYYY-MM-DD  |
| OS       | macOS XX.XX |
| Electron | vXX.XX.XX   |
| Node.js  | vXX.XX.XX   |

### 機能テスト結果

| No  | テスト項目 | 結果  | 備考 |
| --- | ---------- | ----- | ---- |
| 1   | execute    | ✅/❌ | -    |
| 2   | abort      | ✅/❌ | -    |
| ... | ...        | ...   | ...  |

### セキュリティテスト結果

| No  | テスト項目       | 結果  | 備考 |
| --- | ---------------- | ----- | ---- |
| 1   | 不正チャネル拒否 | ✅/❌ | -    |
| ... | ...              | ...   | ...  |

### 統合テスト結果

| No  | テスト項目 | 結果  | 備考 |
| --- | ---------- | ----- | ---- |
| 1   | 完全フロー | ✅/❌ | -    |
| ... | ...        | ...   | ...  |

### 発見事項

| No  | カテゴリ | 内容 | 重要度 | 対応 |
| --- | -------- | ---- | ------ | ---- |
| 1   | -        | -    | -      | -    |
```

---

## 完了条件

- [ ] すべてのテストケースが実行済み
- [ ] すべてのテストケースがPASS
- [ ] 発見事項が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 12: ドキュメント更新
