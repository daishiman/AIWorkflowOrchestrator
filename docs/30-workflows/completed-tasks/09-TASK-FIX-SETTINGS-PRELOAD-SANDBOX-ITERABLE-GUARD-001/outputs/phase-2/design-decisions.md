# Phase 2 設計方針書

## メタ情報

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| Phase  | 2                                                       |
| 機能名 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| 作成日 | 2026-03-07                                              |
| 作成者 | SubAgent-Renderer-Guard                                 |

## 採用設計案: 案C（Renderer境界で正規化 + 異常表示 + テスト固定）

### 設計判断の根拠

task-04 では Preload層（`preload/index.ts`）の `safeInvoke` によるIPC通信の防御を実装した。
しかし、Renderer層の `ApiKeysSection` が `apiKey.list()` の戻り値を無検証で `result.data.providers` として配列前提で処理しており、以下の経路でクラッシュする:

1. `safeInvoke` が予期しない shape を返す（sandbox初期化失敗、IPC タイムアウト等）
2. `result.success === true` だが `result.data.providers` が配列でない
3. `state.providers` に非配列が格納され、`state.providers.find()` で TypeError

Renderer境界での正規化を選択した理由:

- Preload/Main層は task-04 で既に防御済みであり、追加変更の必要がない
- 問題はRenderer層が戻り値の shape を信頼している点に限定される
- ErrorBoundary は既存で機能しているが、クラッシュ前の防御（graceful degradation）が必要

### 防御レイヤー設計

#### レイヤー1: ApiKeysSection 内での戻り値正規化（主防御）

`loadProviders` 関数内で `apiKey.list()` の戻り値を正規化する。

**正規化ロジック:**

```typescript
// loadProviders 内
const result = await window.electronAPI.apiKey.list();

if (result.success && result.data) {
  // 防御レイヤー1: providers が配列であることを検証
  const rawProviders = result.data.providers;
  if (!Array.isArray(rawProviders)) {
    console.warn(
      "[ApiKeysSection] apiKey.list returned non-array providers, falling back to empty array:",
      typeof rawProviders,
      rawProviders,
    );
    setState((prev) => ({
      ...prev,
      providers: [],
      isLoading: false,
    }));
    return;
  }
  setState((prev) => ({
    ...prev,
    providers: rawProviders,
    isLoading: false,
  }));
}
```

**設計ポイント:**

- `Array.isArray()` による実行時型検証（P19: 型キャストによる実行時検証バイパス対策）
- 非配列の場合は空配列 `[]` にフォールバック
- `console.warn` でログを記録し、原因追跡を可能にする（silent failure を回避）
- 既存の `result.success` / `result.error` 分岐はそのまま維持

#### レイヤー2: AuthErrorBoundary（既存、変更なし）

`AuthErrorBoundary` は `apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx` に既に実装済み。
万一レイヤー1の正規化を通過した例外が発生した場合も、このBoundaryでキャッチされる。

**変更不要の根拠:**

- `getDerivedStateFromError` と `componentDidCatch` が正しく実装されている
- フォールバックUIに「エラーが発生しました」と「再試行」ボタンが表示される
- `onRetry` コールバックで状態リセットが可能

#### レイヤー3: SettingsView レベルの try-catch（不要）

SettingsView に追加の try-catch は導入しない。

**不要の根拠:**

- レイヤー1（ApiKeysSection内正規化）で非配列ケースは空配列にフォールバック済み
- レイヤー2（AuthErrorBoundary）で未捕捉例外もキャッチ済み
- SettingsView は `ApiKeysSection` を直接レンダリングしているのみで、追加の防御層は冗長

### ログ記録方針

| 状況                       | ログレベル      | メッセージ形式                                                                                     |
| -------------------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| providers が非配列         | `console.warn`  | `[ApiKeysSection] apiKey.list returned non-array providers, falling back to empty array: <型情報>` |
| apiKey.list() が例外を送出 | `console.error` | 既存の catch ブロックで処理済み（変更なし）                                                        |
| result.success === false   | なし            | 既存のエラー表示UIで処理済み（変更なし）                                                           |

### UI表示方針

- 空配列フォールバック時: 既存の `ALL_PROVIDERS.map()` ロジックにより、4プロバイダー全てが「未登録」状態で表示される。ApiKeysSectionが `state.providers` を空配列として処理するため、`existing` が `undefined` となり、フォールバックオブジェクト（`status: "not_registered"`）が使用される
- 追加のインフォメーション表示は不要: 空配列フォールバックは「プロバイダーが1つも登録されていない」状態と同じUIになるため、ユーザーに混乱を与えない
- エラー状態（`result.success === false`）: 既存のエラーUI（エラーメッセージ + 再試行ボタン）がそのまま機能する

### task-04 との責務分離

| 責務                          | task-04（完了済み）             | 本タスク（09）                             |
| ----------------------------- | ------------------------------- | ------------------------------------------ |
| IPC通信の安全性               | `safeInvoke` による通信ラッパー | 変更なし                                   |
| Preload payload の shape 防御 | `preload/index.ts` で実装済み   | 変更なし                                   |
| Renderer側の戻り値正規化      | 未実装                          | ApiKeysSection 内で `Array.isArray()` 追加 |
| テストでの shape 異常ケース   | Preload側のテストのみ           | Renderer側テスト追加                       |

### リスク評価

| リスク                                      | 対策                                                         | 残存リスク |
| ------------------------------------------- | ------------------------------------------------------------ | ---------- |
| `result.data` 自体が null/undefined の場合  | 既存の `result.success && result.data` チェックで防御済み    | なし       |
| `result.data.providers` が undefined の場合 | `Array.isArray(undefined)` は `false` を返すため正規化される | なし       |
| `result` 自体が非オブジェクトの場合         | `result.success` が falsy となり error 分岐に入る            | なし       |
| 正規化により本来のエラーが隠蔽される        | `console.warn` で記録、開発者ツールで確認可能                | 低         |
