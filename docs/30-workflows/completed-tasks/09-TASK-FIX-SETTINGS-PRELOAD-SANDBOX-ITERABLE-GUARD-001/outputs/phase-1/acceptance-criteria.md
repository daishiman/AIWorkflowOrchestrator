# 受け入れ基準: TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| Phase    | 1（要件定義）                                        |
| 作成日   | 2026-03-07                                           |

## 受け入れ基準一覧

### AC-01: window.electronAPI shape欠損時のAuthGuard安全遷移

- **条件**: `window.electronAPI` が `undefined` またはshapeが不完全（`auth` プロパティ欠損等）の状態でAuthGuardが初期化される
- **期待結果**: AuthGuard初期化境界が例外を送出せず、`unauthenticated` 状態に安全に遷移する
- **判定**: Yes / No

### AC-02: preload初期化失敗時のfallback表示とログ方針の一意性

- **条件**: preloadスクリプトの初期化が失敗し、`window.electronAPI` が未定義の状態でSettings画面を表示する
- **期待結果**: fallback表示（エラーメッセージまたはLoadingScreen）が表示され、ログ方針が `console.warn` に統一されている（`console.error` との混在なし）
- **判定**: Yes / No

### AC-03: preload payload shape欠損時のiterable前提処理の回避

- **条件**: `window.electronAPI.apiKey.list()` が `{ success: true, data: undefined }` または `{ success: true, data: { providers: "not-an-array" } }` を返した場合
- **期待結果**: `Array.isArray()` ガードにより `.find()` / `.map()` 等のiterable前提処理を実行せず、空配列にフォールバックする
- **判定**: Yes / No

### AC-04: apiKey.list() が非配列を返した場合のSettingsView継続表示

- **条件**: `window.electronAPI.apiKey.list()` の戻り値が以下のいずれかである場合:
  - `undefined`
  - `null`
  - `{ success: true, data: null }`
  - `{ success: true, data: { providers: null } }`
  - `{ success: true, data: { providers: {} } }`（オブジェクト）
- **期待結果**: SettingsViewがクラッシュせず継続表示され、ApiKeysSectionがエラー状態（「APIキーの取得に失敗しました」）を表示する
- **判定**: Yes / No

### AC-05: shape異常時のconsole.warnログ記録

- **条件**: `window.electronAPI` のshapeが異常、または `apiKey.list()` の戻り値shapeが異常の場合
- **期待結果**: `console.warn` でログが記録され、ログメッセージに `[ApiKeysSection]` 等のプレフィックスが付与されている。機密情報（APIキー値、トークン等）はログに含まれない
- **判定**: Yes / No

### AC-06: 既存テストの非破壊

- **条件**: 本タスクの変更を適用した状態で既存テストを実行する
- **期待結果**: 以下の既存テストが全てPASSする:
  - `ApiKeysSection.test.tsx`
  - `ApiKeysSection.a11y.test.tsx`
  - `SettingsView.test.tsx`
  - `AuthGuard` 関連テスト
- **判定**: Yes / No

### AC-07: 新規テストケースによる異常パターン網羅

- **条件**: 新規テストケースが追加され、以下の異常パターンをカバーしている
- **期待結果**:
  - `apiKey.list()` が `undefined` を返すケース
  - `apiKey.list()` が `{ success: true, data: { providers: null } }` を返すケース
  - `apiKey.list()` が例外をスローするケース
  - `window.electronAPI.apiKey` が `undefined` のケース
- **判定**: Yes / No

## 判定基準

- **全AC PASS**: 全てのACが Yes → Phase 2 へ進行
- **一部 FAIL**: いずれかのACが No → 該当要件を再定義し、再レビュー
