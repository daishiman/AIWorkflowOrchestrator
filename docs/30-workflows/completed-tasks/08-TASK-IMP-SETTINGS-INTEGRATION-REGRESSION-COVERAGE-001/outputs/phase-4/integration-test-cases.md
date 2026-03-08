# Phase 4: 統合テストケース定義

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 4                                                        |
| 作成日   | 2026-03-08                                               |

---

## テストファイルパス

```
apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
```

---

## テストケース詳細定義

### INT-01: real composition で全セクション表示

- **目的**: SettingsView が real コンポーネントで全セクションを正しくレンダリングすることを検証
- **前提条件**: 未認証状態（isAuthenticated: false）、デフォルト store state
- **検証項目**:
  - ヘッダー「設定」表示
  - real AccountSection が「アカウント登録・ログイン」を表示（未認証時）
  - real AuthModeSelector が radiogroup として存在
  - real ApiKeysSection が「APIキー設定」を非同期ロード後に表示
  - ThemeSelector が「テーマ設定」を表示
  - RAG 設定セクション表示
  - 「設定を保存」ボタン表示
- **AC 対応**: AC-01

### INT-02: AuthModeSelector mode 切替

- **目的**: real AuthModeSelector で role="radio" 経由の mode 切替が動作することを検証
- **前提条件**: mode="subscription" 初期状態
- **検証項目**:
  - サブスクリプション radio が aria-checked="true"
  - APIキー radio が aria-checked="false"
  - APIキー radio をクリック後、setMode("api-key") が呼ばれる
- **AC 対応**: AC-02

### INT-03: ApiKeysSection 正常プロバイダー表示

- **目的**: real ApiKeysSection が正常な apiKey.list() レスポンスで4プロバイダーを表示することを検証
- **前提条件**: apiKey.list() が4プロバイダーの正常レスポンスを返す
- **検証項目**:
  - OpenAI, Anthropic, Google AI, xAI の4プロバイダー表示
  - apiKey.list が1回呼ばれる
- **AC 対応**: AC-03

### INT-04: ApiKeysSection 異常レスポンスフォールバック

#### INT-04a: providers が非配列

- **前提条件**: apiKey.list() が `{ success: true, data: { providers: "not-an-array" } }` を返す
- **検証項目**: 4プロバイダーが全て「未登録」で表示
- **AC 対応**: AC-03

#### INT-04b: providers が undefined

- **前提条件**: apiKey.list() が `{ success: true, data: { providers: undefined } }` を返す
- **検証項目**: 4プロバイダーが全て「未登録」で表示
- **AC 対応**: AC-03

#### INT-04c: list 失敗

- **前提条件**: apiKey.list() が `{ success: false, error: { message: "接続エラー" } }` を返す
- **検証項目**: role="alert" とエラーメッセージ「接続エラー」が表示
- **AC 対応**: AC-03

### INT-05: auth-mode status メッセージの条件付き表示

#### INT-05a: status null

- **前提条件**: useAuthModeStatus が null を返す
- **検証項目**: data-testid="auth-mode-status" が存在しない
- **AC 対応**: AC-05

#### INT-05b: status 設定時

- **前提条件**: status に isValid: false, errorCode, guidance を含むオブジェクト
- **検証項目**: message, errorCode, guidance が表示される
- **AC 対応**: AC-05

#### INT-05c: isValid 成功スタイル

- **前提条件**: status.isValid === true
- **検証項目**: bg-green-50 クラスが適用される
- **AC 対応**: AC-05

---

## task-05/06/07 AC マッピング行列（AC-05 準拠）

先行タスクの受入基準と統合テストケース ID の対応関係を明示する。

### マッピング行列

| 先行タスク | 先行タスク AC 概要                                                                                    | 対応統合テストケース                   | 検証内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| task-05    | auth-mode 切替 UI 導線（subscription/api-key の radio 切替が動作すること）                            | **INT-02**                             | real AuthModeSelector で role="radio" 経由の mode 切替。setMode("api-key") 呼び出し確認 |
| task-06    | malformed apiKey response fallback（apiKey.list() が非配列/undefined を返してもクラッシュしないこと） | **INT-04** (INT-04a, INT-04b, INT-04c) | providers 非配列/undefined/list 失敗時のフォールバック表示検証                          |
| task-07    | corrupted persist state recovery（store の persist 状態が破損していてもリカバリーできること）         | **INT-05** (INT-05a, INT-05b, INT-05c) | auth-mode status の条件付き表示。不正状態からの回復パス検証                             |

### 詳細対応表

| 先行タスク AC                               | AC 判定条件                                     | INT テストケースでの検証方法                                                                                                          |
| ------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| task-05: auth-mode → api-key 切替 UI 導線   | radio 要素経由で mode 切替操作が動作する        | INT-02: subscription radio の aria-checked="true" 確認後、api-key radio を fireEvent.click() で切替。setMode が呼ばれることをアサート |
| task-06: malformed apiKey response fallback | 非配列 providers でクラッシュしない             | INT-04a: providers に文字列を設定。INT-04b: providers に undefined を設定。いずれも4プロバイダー「未登録」表示を確認                  |
| task-06: list 失敗時のエラー表示            | success: false 時にエラーメッセージが表示される | INT-04c: list() が失敗レスポンスを返した場合に role="alert" とエラーメッセージ表示を確認                                              |
| task-07: corrupted persist state recovery   | 不正な auth-mode 状態から正常にリカバリーする   | INT-05a: status null 時の非表示。INT-05b: 不正状態時のエラー情報表示。INT-05c: 有効状態時の成功スタイル適用                           |

### AC 充足行列サマリ

| AC    | INT テストケース                                     | 充足状態                                           |
| ----- | ---------------------------------------------------- | -------------------------------------------------- |
| AC-01 | INT-01, INT-02, INT-03, INT-04, INT-05               | 全テストで real composition を使用                 |
| AC-02 | INT-02                                               | role="radio" 経由の切替テスト                      |
| AC-03 | INT-03, INT-04a, INT-04b, INT-04c                    | 正常/非配列/undefined/失敗の4パターン              |
| AC-04 | Phase 11 で対応                                      | 手動テスト手順で settings shell 到達を必須化       |
| AC-05 | INT-02 (task-05), INT-04 (task-06), INT-05 (task-07) | 先行タスク AC との対応行列が本セクションで定義済み |
| AC-06 | 全テスト                                             | settings-test-harness.ts による境界一本化          |
