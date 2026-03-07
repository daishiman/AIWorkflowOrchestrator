# Phase 2 実行計画

## メタ情報

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| Phase  | 2                                                       |
| 機能名 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| 作成日 | 2026-03-07                                              |
| 作成者 | SubAgent-Renderer-Guard                                 |

## 実装順序

### Step 1: ApiKeysSection の `loadProviders` に `Array.isArray()` ガード追加

**対象ファイル:** `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`

**変更箇所:** `loadProviders` 関数（行595-621付近）

**変更内容:**

```typescript
// 変更前（行599-606）
const result = await window.electronAPI.apiKey.list();

if (result.success && result.data) {
  setState((prev) => ({
    ...prev,
    providers: result.data!.providers,
    isLoading: false,
  }));
}

// 変更後
const result = await window.electronAPI.apiKey.list();

if (result.success && result.data) {
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

**確認ポイント:**

- `result.data!` の Non-null assertion を `result.data` に変更（既に `result.data` の truthy チェックが先行しているため安全）
- 既存の `catch` ブロックと `result.error` 分岐はそのまま維持
- `console.warn` の出力に型情報と実際の値を含める

### Step 2: ApiKeysSection 異常系テスト作成

**対象ファイル:** `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.guard.test.tsx`（新規作成）

**テストケース:**

| No  | テスト名                                                 | 入力                                                | 期待結果                                               |
| --- | -------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| 1   | providers が null の場合に空配列にフォールバック         | `{ success: true, data: { providers: null } }`      | 4プロバイダーが全て「未登録」で表示、console.warn 出力 |
| 2   | providers が undefined の場合に空配列にフォールバック    | `{ success: true, data: { providers: undefined } }` | 4プロバイダーが全て「未登録」で表示、console.warn 出力 |
| 3   | providers が文字列の場合に空配列にフォールバック         | `{ success: true, data: { providers: "invalid" } }` | 4プロバイダーが全て「未登録」で表示、console.warn 出力 |
| 4   | providers が数値の場合に空配列にフォールバック           | `{ success: true, data: { providers: 42 } }`        | 4プロバイダーが全て「未登録」で表示、console.warn 出力 |
| 5   | providers がオブジェクト（非配列）の場合にフォールバック | `{ success: true, data: { providers: {} } }`        | 4プロバイダーが全て「未登録」で表示、console.warn 出力 |
| 6   | providers が正常な配列の場合はそのまま使用               | `{ success: true, data: { providers: [...] } }`     | 正常に表示（回帰テスト）                               |
| 7   | result.data 自体が null の場合                           | `{ success: true, data: null }`                     | エラー表示（既存ロジックで処理）                       |
| 8   | result.success が false の場合                           | `{ success: false, error: { message: "..." } }`     | エラー表示と再試行ボタン（既存ロジック回帰テスト）     |

**テスト環境の注意:**

- happy-dom 環境を使用（P39: userEvent 非互換のため `fireEvent` を使用）
- `window.electronAPI.apiKey.list` をモック化
- `console.warn` を `vi.spyOn` で監視し、呼び出しを検証

### Step 3: AuthGuard shape 異常系テスト追加

**対象ファイル:** `apps/desktop/src/renderer/components/AuthGuard/AuthGuard.test.tsx`（既存に追加）

**テストケース:**

| No  | テスト名                                                    | 入力                                        | 期待結果                                             |
| --- | ----------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| 1   | window.electronAPI が undefined でもクラッシュしない        | `window.electronAPI = undefined`            | LoadingScreen または AuthView が表示                 |
| 2   | window.electronAPI.apiKey が undefined でもクラッシュしない | `window.electronAPI = { ... }` (apiKeyなし) | AuthGuard は正常動作（apiKey は AuthGuard の責務外） |

**注意:** AuthGuard は `useAuthState()` フック経由で `useAppStore` から認証状態を取得しており、`window.electronAPI.apiKey` を直接参照しない。このテストは AuthGuard が preload shape 欠損に影響されないことの確認であり、防御ロジックの追加ではない。

### Step 4: 実装後の検証

**自動検証:**

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/ApiKeysSection/` でテスト実行
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/AuthGuard/` でテスト実行
- `pnpm typecheck` で型チェック
- `pnpm lint` でリントチェック

**手動検証（Phase 11 で実施）:**

- DevTools で `window.electronAPI.apiKey.list` の戻り値を確認
- 正常系: 設定画面でAPIキー一覧が表示されること
- 異常系シミュレーション: DevTools Console から戻り値をモック化し、非配列でもクラッシュしないこと

## 並列/直列ポリシー

| Step   | 依存関係        | 実行モード        |
| ------ | --------------- | ----------------- |
| Step 1 | なし            | 独立              |
| Step 2 | Step 1 完了後   | 直列              |
| Step 3 | なし            | Step 2 と並列可能 |
| Step 4 | Step 1-3 完了後 | 直列              |

## 見積もり

| Step   | 作業内容                         | 想定工数            |
| ------ | -------------------------------- | ------------------- |
| Step 1 | ApiKeysSection ガード追加        | 変更行数: 約15行    |
| Step 2 | ApiKeysSection 異常系テスト作成  | 新規テスト: 8ケース |
| Step 3 | AuthGuard shape 異常系テスト追加 | 追加テスト: 2ケース |
| Step 4 | 自動検証                         | CI相当              |

## 既知の落とし穴への対策

| Pitfall | 内容                                      | 本タスクでの対策                                     |
| ------- | ----------------------------------------- | ---------------------------------------------------- |
| P19     | 型キャストによる実行時検証バイパス        | `Array.isArray()` で実行時型検証を実施               |
| P39     | happy-dom での userEvent 非互換           | テストでは `fireEvent` を使用                        |
| P40     | テスト実行ディレクトリ依存                | `pnpm --filter @repo/desktop exec vitest run` で実行 |
| P47     | CSS変数ベースのスタイルテストアサーション | 本タスクではスタイル変更なし、UI表示の有無のみ検証   |
