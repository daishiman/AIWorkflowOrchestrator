# コンポーネントドキュメント: ApiKeysSection 防御パターン

## メタ情報

| 項目           | 値                                                                        |
| -------------- | ------------------------------------------------------------------------- |
| タスクID       | TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001                      |
| コンポーネント | `ApiKeysSection`                                                          |
| ファイルパス   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` |
| 作成日         | 2026-03-07                                                                |

## コンポーネント概要

`ApiKeysSection` は Settings 画面（SettingsView）内で API キーの管理を担当する Organism レベルのコンポーネント。`window.electronAPI.apiKey.list()` を呼び出してプロバイダー一覧を取得し、各プロバイダーの登録状態を表示する。

## 防御パターン

### 防御対象: `loadProviders` 関数

`loadProviders` は `useEffect` から呼び出される非同期関数で、IPC 経由でプロバイダー情報を取得する。Preload/Main Process からの戻り値が期待する shape を持たない場合にクラッシュを防止するため、4段階の防御ガードを実装している。

### ガード1: `window.electronAPI?.apiKey` optional chaining

**目的**: Preload スクリプトの初期化失敗や sandbox 制約により `window.electronAPI` が `undefined` の場合のクラッシュ防止。

**動作**: `window.electronAPI` が `undefined` の場合、`apiKeyApi` が `undefined` となり、後続のガード2で検出される。

```typescript
const apiKeyApi = window.electronAPI?.apiKey;
```

### ガード2: `apiKeyApi?.list` 存在チェック + `console.warn`

**目的**: `apiKeyApi` オブジェクトが存在しない、または `list` メソッドが存在しない場合の早期リターン。

**動作**: `apiKeyApi?.list` が falsy の場合、`console.warn` で警告ログを記録し、`isLoading: false` に設定して処理を中断する。

```typescript
if (!apiKeyApi?.list) {
  console.warn("[ApiKeysSection] apiKeyApi.list is not available");
  setState((prev) => ({ ...prev, isLoading: false }));
  return;
}
```

**ログ出力**: `[ApiKeysSection] apiKeyApi.list is not available`

### ガード3: `Array.isArray(result.data.providers)` iterable ガード

**目的**: `result.data.providers` が配列でない場合（`undefined`, `null`, オブジェクト, 文字列等）に、後続の `.find()` / `.map()` 操作での TypeError を防止する。

**動作**: `Array.isArray()` チェックに失敗した場合、`providers: []` にフォールバックし、`console.warn` で型情報を含む警告ログを記録する。

```typescript
if (!Array.isArray(result.data.providers)) {
  console.warn(
    "[ApiKeysSection] apiKey.list returned non-array providers, falling back to empty array:",
    typeof result.data.providers,
    result.data.providers,
  );
  setState((prev) => ({ ...prev, providers: [], isLoading: false }));
  return;
}
```

**フォールバック動作**: 空配列が設定されると、既存の `ALL_PROVIDERS.map()` ロジックにより全プロバイダーが「未登録」状態で表示される。ユーザーに対して追加のエラー表示は行わない（「プロバイダーが未登録」という通常の表示と同じ見た目になるため、混乱を与えない）。

### ガード4: `result?.error?.message` null-safe アクセス

**目的**: `result.error` が `null` や `undefined` の場合にエラーメッセージ表示でクラッシュしないようにする。

**動作**: optional chaining (`?.`) を使用して安全にエラーメッセージを取得する。`undefined` の場合はデフォルトのエラーメッセージが表示される。

```typescript
const errorMessage = result?.error?.message ?? "APIキーの取得に失敗しました";
```

## 多層防御アーキテクチャ

```
[ユーザー操作] Settings 画面を開く
       |
       v
[ApiKeysSection] loadProviders 実行
       |
       +-- ガード1: electronAPI 存在確認 (optional chaining)
       |     失敗 -> ガード2 で検出
       |
       +-- ガード2: apiKeyApi.list 存在確認
       |     失敗 -> console.warn + 早期リターン
       |
       +-- [IPC 呼び出し] apiKeyApi.list()
       |     |
       |     +-- [Preload 層] safeInvoke (task-04 で防御済み)
       |     +-- [Main Process] IPC ハンドラ
       |
       +-- ガード3: Array.isArray(providers) 検証
       |     失敗 -> console.warn + 空配列フォールバック
       |
       +-- ガード4: error?.message null-safe アクセス
       |     失敗 -> デフォルトエラーメッセージ
       |
       +-- 正常パス: providers を state に設定
       |
       v
[AuthErrorBoundary] (既存、最終防御)
       未捕捉例外 -> フォールバック UI 表示
```

## テストカバレッジ

### 防御ガード関連テスト

| テストID | テスト内容                            | 対応ガード        |
| -------- | ------------------------------------- | ----------------- |
| RED-01   | `window.electronAPI` が `undefined`   | ガード1 + ガード2 |
| RED-01b  | `apiKeyApi.list` が `undefined`       | ガード2           |
| RED-02   | `providers` が `null`                 | ガード3           |
| RED-02b  | `providers` が文字列                  | ガード3           |
| RED-03   | `result.error` が `null`              | ガード4           |
| RED-03b  | `result.error.message` が `undefined` | ガード4           |

### カバレッジ

| 指標          | 値     | 基準充足           |
| ------------- | ------ | ------------------ |
| Line Coverage | 91.92% | 推奨基準(90%) 達成 |
| 全テスト数    | 39     | 全 PASS            |

## 設計判断の根拠

### なぜ Renderer 側で防御するのか

1. **Preload 層は task-04 で防御済み**: `safeInvoke` による IPC 通信ラッパーは既に実装されている
2. **問題は Renderer 側の信頼前提**: Renderer が IPC 戻り値の shape を無検証で使用していた
3. **最小変更原則**: Preload/Main 層の変更なしに、Renderer 側の1ファイルの修正でクラッシュを防止できる

### なぜ ErrorBoundary の追加ではなく inline ガードか

1. **ErrorBoundary は事後対処**: 例外が発生してからキャッチする。inline ガードは例外の発生自体を防止する
2. **既存の AuthErrorBoundary で十分**: 万一ガードをすり抜けた例外は既存の ErrorBoundary でキャッチされる
3. **UX の質**: inline ガードは graceful degradation（空配列フォールバック）を実現し、ユーザーに「クラッシュ」ではなく「データなし」状態を見せる

## 関連タスク

| タスクID                                                  | 関係         | 概要                                   |
| --------------------------------------------------------- | ------------ | -------------------------------------- |
| task-04 (INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001) | 先行タスク   | Preload 層の payload 防御              |
| UT-09-001                                                 | 後続未タスク | 他コンポーネントへの同パターン横展開   |
| UT-09-002                                                 | 後続未タスク | Preload 層の共通バリデーション関数導入 |
