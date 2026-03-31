# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 11                                       |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

Electron を実際に起動して、`better-sqlite3` の ABI 不一致が解消され、会話 DB が正常に初期化・動作することを確認する。

## 手動テスト手順

### 前提条件の確認

- [ ] Phase 5 の実装（`postinstall` 追加）が完了していること
- [ ] `pnpm --filter @repo/desktop test:run` が全テスト通過していること

### Step 1: クリーン環境の準備

```bash
# node_modules をクリアして pnpm install を再実行
rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules packages/ui/node_modules
pnpm install
```

**確認ポイント**: インストールログに以下が含まれること

```
> @repo/desktop@ postinstall /path/to/apps/desktop
> pnpm rebuild:native
```

### Step 2: Electron を開発モードで起動

```bash
# 別ターミナルを2つ使用する場合:
# ターミナル 1: 開発サーバー起動
pnpm --filter @repo/web dev

# ターミナル 2: Electron 起動（ログを全て出力）
pnpm --filter @repo/desktop dev 2>&1 | tee /tmp/electron-startup.log
```

あるいはコンソールログを DevTools で確認する場合:

```bash
pnpm --filter @repo/desktop dev
```

### Step 3: 起動ログの確認ポイント

Electron 起動後、ターミナルまたは DevTools のコンソールで以下の4つのログパターンを確認する。

#### 確認ポイント 1: ERR_DLOPEN_FAILED が出ないこと（AC-1）

```bash
# ログに含まれていてはいけないパターン
grep -i "ERR_DLOPEN_FAILED\|NODE_MODULE_VERSION\|was compiled against" /tmp/electron-startup.log
```

期待結果: **0件（ヒットなし）**

---

#### 確認ポイント 2: DB 初期化失敗ログが出ないこと（AC-2）

```bash
grep "\[DB\] Failed to initialize" /tmp/electron-startup.log
```

期待結果: **0件（ヒットなし）**

---

#### 確認ポイント 3: DB 初期化成功ログが出ること（AC-2 の裏付け）

```bash
grep "\[DB\] Conversation database initialized\|\[DB\] Database initialized" /tmp/electron-startup.log
```

期待結果: **1件以上ヒット**

---

#### 確認ポイント 4: IPC ハンドラ登録の失敗件数が 0 であること（AC-2 の裏付け）

```bash
grep "Handler registration completed" /tmp/electron-startup.log
```

期待される出力例:

```
[IPC] Handler registration completed: { total: 42, failed: 0 }
```

`failed: 0` であることを確認する。

### Step 4: 会話履歴機能の動作確認

Electron が起動したら、DevTools（`Ctrl+Shift+I` または `Cmd+Option+I`）のコンソールで以下を実行する:

```javascript
// 会話リストの取得が正常に返ることを確認
window.electronAPI
  .invoke("conversation:list")
  .then((result) => {
    console.log("会話リスト取得成功:", result);
  })
  .catch((err) => {
    console.error("会話リスト取得失敗:", err);
  });
```

期待結果: エラーなしで結果（配列）が返ること

### Step 5: 新規会話の作成確認

```javascript
// 新規会話を作成して DB への書き込みを確認
window.electronAPI
  .invoke("conversation:create", { title: "テスト会話" })
  .then((result) => {
    console.log("会話作成成功:", result);
  })
  .catch((err) => {
    console.error("会話作成失敗:", err);
  });
```

期待結果: `{ id: <number>, title: 'テスト会話', ... }` のようなオブジェクトが返ること

## 手動テスト結果記録

| テスト項目                 | 期待値                     | 実測値 | 判定 |
| -------------------------- | -------------------------- | ------ | ---- |
| ERR_DLOPEN_FAILED なし     | 0件                        | -      | -    |
| DB 初期化失敗ログなし      | 0件                        | -      | -    |
| DB 初期化成功ログあり      | 1件以上                    | -      | -    |
| IPC 失敗件数               | `failed: 0`                | -      | -    |
| `conversation:list` 応答   | 配列が返る                 | -      | -    |
| `conversation:create` 応答 | 新規会話オブジェクトが返る | -      | -    |

## 成果物

| 成果物                    | パス                                     | 説明                                                     |
| ------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| 手動テスト結果レポート    | `outputs/phase-11/manual-test-result.md` | 本 Phase の正本（期待値/実測値/判定/証跡リンクを記録）   |
| Electron 起動ログ（証跡） | `/tmp/electron-startup.log`              | 手動テスト時のログ（一時保存。必要箇所をレポートへ抜粋） |

## 完了条件

- [ ] クリーン環境（`pnpm install` 後）で Electron が正常起動すること
- [ ] `ERR_DLOPEN_FAILED` ログが出ないこと（AC-1）
- [ ] `[DB] Failed to initialize conversation database` ログが出ないこと（AC-2）
- [ ] `[DB] Conversation database initialized` ログが出ること（AC-2 の裏付け）
- [ ] `[IPC] Handler registration completed` の失敗件数が `0` であること（AC-2 の裏付け）
- [ ] DevTools で `conversation:list` が正常に応答すること
