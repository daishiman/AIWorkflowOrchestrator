# スコープ境界: TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| Phase    | 1（要件定義）                                        |
| 作成日   | 2026-03-07                                           |

## 対象スコープ（IN-SCOPE）

### S-01: Renderer境界での防御的正規化

- `ApiKeysSection` の `loadProviders` 関数内で、`window.electronAPI.apiKey.list()` の戻り値shapeを検証する
- `result.data.providers` が配列であることを `Array.isArray()` で確認してからiterable操作を実行する
- 異常shape検出時は空配列にフォールバックし、エラー状態を表示する

### S-02: AuthGuard初期化境界の堅牢化

- `window.electronAPI` のshapeが不完全な場合に、AuthGuardが例外を送出せず安全に状態遷移する
- store初期化時のelectronAPI呼び出しが失敗した場合のフォールバック処理を追加する

### S-03: shape異常時のログ記録

- 異常shape検出時に `console.warn` でログを記録する
- ログメッセージにコンポーネント名プレフィックスを付与する
- 機密情報をログに含めない

### S-04: テスト追加

- `apiKey.list()` の戻り値が異常パターンの場合のテストケースを追加する
- AuthGuard初期化境界の異常系テストケースを追加する
- 既存テストの非破壊を確認する

## 非スコープ（OUT-OF-SCOPE）

### OS-01: preload APIの機能追加

- `preload/index.ts` への新規IPC チャンネル追加や既存APIの拡張は行わない
- preload層のshape検証はtask-04で実装済みであり、本タスクではRenderer側の消費コンポーネントのみを対象とする

### OS-02: Auth機能仕様拡張

- 認証フロー（OAuth, PKCE等）の変更は行わない
- 認証状態の遷移ロジック（`getAuthState` 関数）の仕様変更は行わない
- `AuthView`（ログイン画面）の変更は行わない

### OS-03: 設定UIデザイン刷新

- Settings画面のレイアウト変更やUIコンポーネントの新規追加は行わない
- CSS / Tailwindクラスの変更はfallback表示に必要な最小限にとどめる
- `SettingsCard`, `GlassPanel` 等の共通コンポーネントの変更は行わない

### OS-04: Main ProcessのIPCハンドラ修正

- `apiKey:list` IPCハンドラのレスポンス形式変更は行わない
- `auth:getSession` 等の認証系IPCハンドラの変更は行わない
- Main Process側のバリデーションロジック変更は行わない

### OS-05: 他のView / コンポーネントの防御的正規化

- `EditorView`, `AgentView`, `AnalyticsDashboard` 等のSettings画面以外のViewは対象外とする
- `SkillCreateWizard`, `CommunityVisualization` 等のelectronAPI呼び出し箇所は対象外とする
- 同様の防御パターンが必要な箇所は未タスクとして検出する（Phase 12で対応）

### OS-06: preload/types.ts の型定義変更

- `ElectronAPI` インターフェースの変更は行わない
- `ProviderStatus`, `ApiKeyValidationStatus` 等の共有型の変更は行わない
- 型定義は現行のままで、Renderer側のランタイム検証で対処する

## スコープ判定基準

本タスクのスコープは「Renderer境界（AuthGuard初期化境界 + ApiKeysSection + SettingsView）での防御的正規化」に限定される。以下の判定基準でスコープ内外を判断する:

| 判定基準         | スコープ内                                       | スコープ外                           |
| ---------------- | ------------------------------------------------ | ------------------------------------ |
| 変更対象レイヤー | Renderer（React コンポーネント、hooks、store）   | Preload、Main Process                |
| 変更対象画面     | Settings画面のみ                                 | 他のView                             |
| 変更の種類       | 防御的ガード追加、フォールバック追加、テスト追加 | 機能追加、UIデザイン変更、型定義変更 |
| IPC関連          | Renderer側の戻り値検証のみ                       | IPCハンドラ変更、チャンネル追加      |
