# 要件定義書: TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| Phase    | 1（要件定義）                                        |
| 作成日   | 2026-03-07                                           |
| カテゴリ | バグ修正 / 防御的プログラミング                      |
| 優先度   | High（クラッシュ防止）                               |

## 1. 背景

### 1.1 問題の概要

Settings画面において、`window.electronAPI` の公開オブジェクト（contextBridge経由）が期待するshapeを持たない場合、Renderer側の複数箇所で未処理例外が発生しクラッシュする。

具体的には以下の2つの境界で防御が不足している:

1. **AuthGuard初期化境界**: `useAuthState` フックが `useAppStore` から取得する `isLoading` / `isAuthenticated` の値は、store初期化時に `window.electronAPI.auth.getSession()` 等を呼び出す。preloadスクリプトの初期化失敗やsandbox制約により `window.electronAPI` のshapeが壊れた場合、storeの初期化自体が例外を送出し、AuthGuardが適切な状態遷移を行えない。

2. **ApiKeysSection境界**: `ApiKeysSection` コンポーネントの `loadProviders` 関数が `window.electronAPI.apiKey.list()` を呼び出し、`result.data.providers` に対して `.find()` / `.map()` 等のiterable前提の操作を行う。`result` が期待する `{ success: boolean, data: { providers: ProviderStatus[] } }` 形式でない場合（例: `undefined`, `null`, 非オブジェクト）、iterable前提の処理でTypeErrorが発生する。

### 1.2 先行タスクとの関係

- **task-04（preload payload防御）**: preload層でのpayload正規化を実装済み。ただし、Renderer側の消費コンポーネント（AuthGuard初期化境界、ApiKeysSection）での戻り値shape検証は未対応。
- 本タスクは、Renderer境界での防御的正規化を追加する補完タスクである。

## 2. 機能要件

### FR-01: window.electronAPI shape欠損時のAuthGuard安全遷移

- **条件**: `window.electronAPI` が `undefined` またはshapeが不完全（`auth` プロパティ欠損等）の場合
- **動作**: AuthGuard初期化境界が例外を送出せず、`checking` 状態から `unauthenticated` 状態へ安全に遷移する
- **ログ**: `console.warn` でshape異常を記録する（1回のみ、重複抑制）

### FR-02: apiKey.list() 戻り値の防御的正規化

- **条件**: `window.electronAPI.apiKey.list()` の戻り値が以下のいずれかの異常パターンに該当する場合:
  - `undefined` / `null`
  - `success` プロパティが `true` だが `data` が `undefined` / `null`
  - `data.providers` が配列でない（`undefined`, `null`, オブジェクト, 文字列等）
- **動作**: `providers` を空配列 `[]` として扱い、エラー状態を表示する（「APIキーの取得に失敗しました」）
- **ログ**: 異常なshapeを検出した場合、`console.warn` でログを記録する

### FR-03: iterable前提処理の事前ガード

- **条件**: `result.data.providers` に対する `.find()` / `.map()` 等のiterable操作の実行前
- **動作**: `Array.isArray()` による型ガードを挿入し、配列でない場合は空配列にフォールバックする
- **対象箇所**: `ApiKeysSection` の `loadProviders` 関数内、および `providerList` 構築ロジック

### FR-04: preload初期化失敗時のfallback表示

- **条件**: preloadスクリプトの `contextBridge.exposeInMainWorld` が失敗し、`window.electronAPI` が未定義の場合
- **動作**: Settings画面全体がクラッシュせず、ユーザーに「設定の読み込みに失敗しました」等のエラー表示を提供する
- **方針**: ErrorBoundary またはコンポーネントレベルのtry-catchで対処する

## 3. 非機能要件

### NFR-01: パフォーマンス影響なし

- shape検証は `typeof` / `Array.isArray()` 等の軽量チェックのみ使用する
- 正常パス（shape正常時）の実行コストは無視可能レベル（O(1)）とする
- 追加のIPC呼び出しや非同期処理を導入しない

### NFR-02: 既存テスト非破壊

- 既存の `ApiKeysSection.test.tsx`、`ApiKeysSection.a11y.test.tsx`、`SettingsView.test.tsx` が全てPASSすること
- 新規テストケースは既存テストに追加する形で実装し、テストファイルの分割は不要

### NFR-03: 型安全性の維持

- `any` 型を使用しない
- 防御的ガードは `unknown` 型からの型絞り込みパターンで実装する
- 既存の型定義（`ElectronAPI`, `ProviderStatus[]` 等）を変更しない

### NFR-04: ログ方針の統一

- shape異常検出時は `console.warn` を使用する（`console.error` は使用しない）
- ログメッセージには `[SettingsView]` または `[ApiKeysSection]` プレフィックスを付与する
- APIキーの値やトークン等の機密情報をログに含めない（P19準拠）

## 4. 影響範囲

### 4.1 変更対象ファイル（想定）

| ファイルパス                                                                                 | 変更内容                                                                            |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                    | `loadProviders` 内の戻り値shape検証追加、`providerList` 構築時のArray.isArrayガード |
| `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts` または関連store slice | store初期化時のelectronAPI shape検証                                                |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                     | ErrorBoundaryまたはfallback表示の追加（必要に応じて）                               |

### 4.2 影響を受けるコンポーネント

- `AuthGuard`: 初期化境界の堅牢化による安全な状態遷移
- `ApiKeysSection`: IPC戻り値のshape検証追加
- `SettingsView`: 子コンポーネントのクラッシュ時のfallback表示

### 4.3 影響を受けないコンポーネント

- `preload/index.ts`: preload層自体は変更しない（task-04で対応済み）
- Main ProcessのIPCハンドラ: 変更なし
- 他のView（EditorView, AgentView等）: 本タスクのスコープ外

## 5. 前提条件

- task-04（preload payload防御）が完了していること
- `window.electronAPI` の型定義（`ElectronAPI`）が `apps/desktop/src/preload/types.ts` で定義されていること
- `contextBridge.exposeInMainWorld` が sandbox: true 環境で動作していること

## 6. リスク

| リスク                                                | 影響度 | 対策                                                                                    |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| shape検証の条件漏れにより一部の異常パターンが未カバー | 中     | テストケースで主要な異常パターン（undefined, null, 非配列, 空オブジェクト）を網羅       |
| console.warn のログ出力がテスト結果を汚染する（P20）  | 低     | テスト環境では `vi.spyOn(console, 'warn')` でキャプチャし、期待するログメッセージを検証 |
| ErrorBoundaryの追加によるレンダリングツリーの変更     | 低     | 既存のAuthErrorBoundaryパターンに従い、最小限のラッパーで実装                           |
