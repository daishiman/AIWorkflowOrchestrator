# LocalStorage / セッションデータのクリア方法

## 問題: ログイン画面が表示されない

古いセッションデータやLocalStorageが残っている場合、ログイン画面が表示されない可能性があります。

---

## 🔧 解決策: ストレージをクリア

### 方法1: DevToolsからクリア（推奨）

1. アプリを起動（`pnpm --filter @repo/desktop preview`）
2. DevToolsを開く（`Cmd+Option+I` または `F12`）
3. **Application** タブを開く
4. 左サイドバーの **Local Storage** を展開
5. ドメイン（例: `file://`）を選択
6. 右クリック → **Clear**
7. **Session Storage** も同様にクリア
8. アプリを再起動

---

### 方法2: コードから強制クリア

> **Historical Note** (TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001, 2026-03):
> 以下のデバッグコードパターンは根本原因が解決済みのため、歴史的記録として残しています。
> `localStorage.clear()` は Zustand persist 状態を破壊するため、App.tsx に追加してはいけません。
> ストレージクリアが必要な場合は方法1（DevTools）または方法3（electron-store）を使用してください。

~~**一時的なデバッグコード**を`App.tsx`の冒頭に追加：~~

```typescript
// [廃止] このパターンは使用禁止です
// apps/desktop/src/renderer/App.tsx
// localStorage.clear() + window.location.reload() は
// Zustand persist 状態を破壊するため禁止されています
```

~~**使用後は削除してください。**~~

---

### 方法3: electron-storeデータのクリア

Electron-storeに保存されたデータをクリア：

```typescript
// DevTools Console (Renderer Process)
await window.electronAPI.storage.clear();
```

または、手動でファイルを削除：

```bash
# macOS
rm ~/Library/Application\ Support/AI\ Workflow\ Orchestrator/config.json

# Windows
del %APPDATA%\AI Workflow Orchestrator\config.json

# Linux
rm ~/.config/AI\ Workflow\ Orchestrator/config.json
```

---

### 方法4: 認証状態を強制リセット

DevToolsコンソールから：

```javascript
// Renderer Process (DevTools Console)
// Zustandストアをリセット
const store = window.__ZUSTAND_STORE__;
if (store) {
  store.setState({
    isAuthenticated: false,
    isLoading: false,
    authUser: null,
    currentView: "dashboard",
  });
}

// または直接LocalStorageを操作
localStorage.removeItem("knowledge-studio-store");
location.reload();
```

---

## 🔍 デバッグ方法

### 現在の認証状態を確認

DevToolsコンソールで実行：

```javascript
// 現在のZustandストア状態を確認
console.log('Current state:', {
  isAuthenticated: window.electronAPI ? 'electronAPI available' : 'electronAPI NOT available',
  isLoading: /* ストアから取得 */,
  currentView: /* ストアから取得 */,
});

// LocalStorageの内容を確認
console.log('LocalStorage:', localStorage.getItem('knowledge-studio-store'));
```

### AuthGuard状態を確認

追加したデバッグログを確認：

```
[useAuthState] isLoading: false isAuthenticated: false → authState: unauthenticated
```

- `isLoading: false` かつ `isAuthenticated: false` → ログイン画面が表示されるはず
- `isLoading: true` → LoadingScreenが表示されるはず
- `isAuthenticated: true` → ダッシュボードが表示されるはず

---

## ⚠️ トラブルシューティング

### Q1: LocalStorageをクリアしてもログイン画面が表示されない

**A**: electron-storeデータもクリアしてください（方法3）。

### Q2: DevToolsでエラーが出る

**A**: コンソールのエラーメッセージを確認し、IPCハンドラーが正しく登録されているか確認してください。

```javascript
// IPC handlers check
console.log("electronAPI:", window.electronAPI);
console.log("auth methods:", window.electronAPI?.auth);
```

### Q3: `isLoading`がtrueのまま

**A**: `initializeAuth()`が失敗している可能性があります。Main Processのログを確認：

```bash
# ターミナルで実行中のpnpm previewのログを確認
# [AuthSlice] などのログを探す
```

---

## 📋 推奨手順

1. **LocalStorageクリア**（方法1）
2. **アプリ再起動**
3. **DevToolsでログ確認**
4. **認証状態が `isAuthenticated: false` になっているか確認**
5. **ログイン画面（AuthView）が表示されるか確認**

問題が続く場合は、デバッグログの出力を共有してください。
