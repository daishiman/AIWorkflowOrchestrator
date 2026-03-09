# 実装ガイド - TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| 作成日   | 2026-03-09                                |
| Phase    | 12                                        |

---

## Part 1: やさしい解説（中学生レベル）

### ゲームのセーブデータが毎回消される問題

#### なぜこの修正が必要だったの？

たとえば、ゲームを起動するたびに誰かが勝手にセーブデータを全部消してしまう状態をイメージしてください。

#### どんな問題が起きていたの？

ゲームを起動するたびに、誰かが勝手にセーブデータを全部消してしまう仕組みが入っていました。

これは開発者がテスト中に使っていた「全データリセットボタン」のようなもので、テストが終わったら外すべきものでした。しかし外し忘れたため、ゲームを開くたびにセーブデータ（設定、認証情報、アプリの状態）が消えてしまっていました。

さらに悪いことに、データを消した後にゲームを強制再起動する処理も入っていたため、起動 → データ消去 → 再起動 → 正常起動 という2段階の起動になっていました。この強制再起動が、アプリの内部で「もう閉じたウィンドウを操作しようとしている」というエラーの原因になっていました。

#### 何をしたか

デバッグ中だけ使うはずだった「全データリセット + 強制再起動」のコードを削除しました。

#### どう直したの？

修正は単純で、この「全データリセットボタン」のコードを削除するだけです。これにより、セーブデータは正常に保持され、強制再起動も発生しなくなります。

#### 修正前と修正後の比較

**修正前（問題あり）**:

```
アプリ起動
  → セーブデータ全消去
  → 強制再起動
  → 認証情報がない状態で起動
  → ずっとローディング中...
```

**修正後（正常）**:

```
アプリ起動
  → セーブデータを読み込む
  → 以前の設定が復元される
  → 正常に表示される ✓
```

---

## Part 2: 開発者向け実装詳細

### 1. 問題の技術的説明

#### 削除対象コード

**ファイル**: `apps/desktop/src/renderer/App.tsx` L46-61

```typescript
// 🔧 デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）
useEffect(() => {
  if (
    import.meta.env.VITE_E2E_MODE === "true" ||
    window.location.search.includes("skipAuth=true")
  ) {
    return;
  }

  const shouldClear = sessionStorage.getItem("debug-clear-storage");
  if (!shouldClear) {
    console.log("🔧 [DEBUG] Clearing all storage for clean auth test...");
    localStorage.clear();
    sessionStorage.setItem("debug-clear-storage", "done");
    window.location.reload();
  }
}, []);
```

#### なぜこのコードが問題なのか

**問題1: Zustand persist の全破壊**

Zustand の `persist` ミドルウェアはアプリの状態を localStorage に保存します。`localStorage.clear()` はこの全データを削除するため、毎起動時に以下が失われます:

- 認証状態（`isAuthenticated`, `authUser`）
- LLM設定（`llmProviders`, `selectedModel`）
- テーマ設定（`themeMode`）
- その他のアプリ設定

**問題2: window.location.reload() が引き起こすElectronエラー**

`window.location.reload()` は BrowserWindow の WebContents をリロードします。Electron の内部処理では、リロード直後に前のウィンドウへのアクセスが発生することがあり、`BROWSER_GET_LAST_WEB_PREFERENCES` エラーが発生します。

**問題3: sessionStorage の揮発性**

`sessionStorage` はブラウザセッションが終了するとクリアされます。Electron の BrowserWindow が閉じられる（またはリロードされる）と sessionStorage もクリアされます。そのため `"debug-clear-storage"` キーは次回起動時には存在せず、毎セッション初回マウント時に `localStorage.clear()` が実行されます。

### 2. 修正内容

**削除するコード**: `apps/desktop/src/renderer/App.tsx` L46-61 の `useEffect` ブロック全体

**削除後の影響**:

- `useEffect` の import は L71, L87, L100 で使用しているため維持
- 他の機能への影響なし（sessionStorage の使用はこのコードのみ）

### 2-A. 型定義

今回の修正はコード削除が中心だが、再発防止の観点では「どの副作用を止める修正か」を型で整理するとレビューしやすい。

```typescript
type DebugStorageSideEffect =
  | "localstorage-clear"
  | "sessionstorage-flag"
  | "forced-reload";

interface DebugStorageRemovalPlan {
  filePath: "apps/desktop/src/renderer/App.tsx";
  removeLines: "L46-L61";
  preservedImports: Array<"useEffect">;
  blockedSideEffects: DebugStorageSideEffect[];
}

interface PersistenceVerificationCheck {
  storageKey: string;
  expectedAfterRestart: "preserved";
  verificationMethod: "manual-test" | "vitest";
}
```

### 2-B. CLIシグネチャ / APIシグネチャ

このタスクで実際に確認すべき呼び出しは、削除対象コードの静的検査と回帰テストの2系統。

```bash
rg "debug-clear-storage|localStorage.clear|window.location.reload" \
  apps/desktop/src/renderer/App.tsx

pnpm --filter @repo/desktop exec vitest run \
  src/renderer/__tests__/App.debug-removal.test.tsx
```

```typescript
localStorage.clear(): void
sessionStorage.getItem(key: string): string | null
window.location.reload(): void
```

### 2-C. 使用例

使用例として、削除後に確認すべき最小シナリオを固定しておく。

```bash
# 1. アプリを起動
pnpm --filter @repo/desktop dev

# 2. 起動後ログを確認
rg "\\[DEBUG\\] Clearing all storage" apps/desktop/src/renderer/App.tsx

# 3. localStorage の persist 値が消えないことを手動確認
# DevTools > Application > Local Storage
```

```typescript
// 削除後の期待値
const persistedTheme = localStorage.getItem("knowledge-studio-store");
if (!persistedTheme) {
  throw new Error("persist データが起動時に失われている");
}
```

### 2-D. エラーハンドリング

この修正自体は削除のみなので新しいエラーハンドリング分岐は追加しない。ただし、検証時には以下を異常として扱う。

- `BROWSER_GET_LAST_WEB_PREFERENCES` が再度出力された場合は `window.location.reload()` の残存や別経路の reload 呼び出しを疑う
- persist データが消失した場合は `localStorage.clear()` の残存、または別コードからの全消去を疑う
- happy-dom テストで `localStorage is undefined` になった場合は polyfill 不足として `testing-component-patterns.md` を参照する

### 2-E. エッジケース

- `VITE_E2E_MODE=true` のときも、削除対象コードそのものが消えていれば挙動差分は発生しない
- `skipAuth=true` の deep link が残っていても、debug-clear-storage フラグに依存しないため reload ループは起きない
- 既に破損した persist データが localStorage に残っている場合は、本修正だけでは復旧しないため TASK-07 の hardening 契約で吸収する

### 2-F. 設定項目と定数一覧

| 設定項目 / 定数          | 用途                          | このタスクでの扱い                  |
| ------------------------ | ----------------------------- | ----------------------------------- |
| `VITE_E2E_MODE`          | E2E 起動モード判定            | 削除対象 `useEffect` と一緒に不要化 |
| `skipAuth=true`          | 認証スキップ付き起動          | 既存 E2E 導線の互換確認対象         |
| `debug-clear-storage`    | sessionStorage 上の一時フラグ | 削除対象                            |
| `knowledge-studio-store` | Zustand persist の主要保存先  | 手動テストの確認対象                |

### 3. localStorage.clear() が Zustand persist に与える影響

```
Zustand persist ミドルウェア
  ↓ localStorage にデータを書き込む
  ↓ キー: "app-store", "skill-store" など
  ↓ localStorage.clear() で全削除
  ↓ 次回起動時にデータが存在しない
  ↓ Store が initial state から再作成
  ↓ isLoading=false が初期値だが、
  ↓ initializeAuth() が isLoading=true を設定
  ↓ IPC 呼び出しが完了するまでローディング継続
```

### 4. window.location.reload() が Electron の WebContents ライフサイクルに与える影響

```
window.location.reload() 呼び出し
  ↓ WebContents.loadURL() が内部で呼ばれる
  ↓ 旧 WebContents が破棄前に参照されることがある
  ↓ BROWSER_GET_LAST_WEB_PREFERENCES エラー発生
  ↓ コンソールにエラーログが出力
  ↓ 一部のIPC通信が不安定になる可能性
```

### 5. 再発防止策

デバッグコードを一時的に追加する場合は、以下のルールを守ること:

```typescript
// ✅ 正しい書き方: 期限付きコメントを付ける
// TODO(cleanup): 2026-04-01 までに削除 - デバッグ用ストレージクリア
// Issue: #XXX
useEffect(() => {
  // デバッグコード
}, []);
```

または、デバッグフラグを環境変数で制御する:

```typescript
// ✅ 環境変数でデバッグコードを制御
if (import.meta.env.VITE_DEBUG_CLEAR_STORAGE === "true") {
  // デバッグコード（本番ビルドでは実行されない）
}
```

### 6. テスト確認事項

修正後に以下を確認:

| 確認項目                                              | 確認方法                              | 期待結果                     |
| ----------------------------------------------------- | ------------------------------------- | ---------------------------- |
| localStorage がクリアされないこと                     | DevTools > Application > LocalStorage | アプリ再起動後もデータが残存 |
| persist 状態が維持されること                          | アプリ再起動後に設定が復元されること  | 設定が復元される             |
| `🔧 [DEBUG]` ログが出ないこと                         | DevTools > Console                    | ログが出力されない           |
| `BROWSER_GET_LAST_WEB_PREFERENCES` エラーが出ないこと | Main Process ログ                     | エラーが出ない               |
| E2E テストが動作すること                              | `VITE_E2E_MODE=true` で起動           | 正常動作                     |
| 全既存テストが PASS すること                          | `pnpm test`                           | 全 PASS                      |

### 7. 関連する知識

- [Zustand persist ミドルウェア公式ドキュメント](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- P13（タイマーテストの無限ループ）- タイマー系テストの注意点
- P19（型キャストによる実行時検証バイパス）- localStorage からのデータ読み込み時の注意点

---

## 関連タスク

| タスク ID                                      | 関係                                                 |
| ---------------------------------------------- | ---------------------------------------------------- |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001                | IPC 層の防御（本タスクと組み合わせて多層防御を構成） |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | UI 層の防御（本タスクと組み合わせて多層防御を構成）  |
