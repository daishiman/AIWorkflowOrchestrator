# Phase 1: 受け入れ基準

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 1                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |

---

## 受け入れ基準一覧

### AC-01: 過剰モック解消

**判定文**: SettingsView.test.tsx（または新規の統合テストファイル）において、AccountSection / ApiKeysSection / AuthModeSelector の3コンポーネントが `vi.mock()` でモックされていない統合テストが1つ以上存在する。

**Yes 条件**:

- 統合テストファイル内に `vi.mock("../../components/organisms/AccountSection")` が存在しない
- 統合テストファイル内に `vi.mock("../../components/organisms/ApiKeysSection")` が存在しない
- 統合テストファイル内に `vi.mock("../../components/settings/AuthModeSelector")` が存在しない
- 上記3コンポーネントが実コンポーネントとしてレンダリングされるテストケースが存在する

**No 条件**: 上記いずれかのモックが統合テストに残っている

---

### AC-02: real AuthModeSelector 経由の auth-mode 切替テスト

**判定文**: real AuthModeSelector コンポーネントを通して、auth-mode の subscription/api-key 切替が動作することを検証するテストケースが存在する。

**Yes 条件**:

- テストケースが `role="radio"` の要素を経由して mode 切替操作を行っている
- 切替後に `setAuthMode` または相当するアクションが呼び出されていることを検証している
- AuthModeSelector の `disabled` 状態での操作無効化を検証するテストケースが存在する

**No 条件**: mode 切替テストが `data-testid="auth-mode-subscription"` 等のモック固有の test ID に依存している

---

### AC-03: real ApiKeysSection 経由の provider fallback テスト

**判定文**: real ApiKeysSection コンポーネントを通して、`apiKey.list()` の異常レスポンス時にクラッシュせずフォールバックする動作を検証するテストケースが存在する。

**Yes 条件**:

- `window.electronAPI.apiKey.list()` が非配列の `providers` を返すモック設定のテストケースが存在する
- 上記テストケースで ApiKeysSection がエラー表示または空状態を表示することを検証している
- `window.electronAPI.apiKey.list()` が正常な providers 配列を返すモック設定のテストケースが存在する
- 上記テストケースで4プロバイダーが表示されることを検証している

**No 条件**: ApiKeysSection がモックされた状態で provider 表示を検証している

---

### AC-04: manual evidence の settings shell 到達必須条件

**判定文**: Phase 11 の手動テスト証跡テンプレートにおいて、settings shell への到達が必須条件として明記されている。

**Yes 条件**:

- 手動テスト手順に「SettingsView を表示する」ステップが含まれている
- 証跡（screenshot）の必須項目に「設定画面全体の表示」が含まれている
- 「設定画面を経由せず個別コンポーネントのみで検証した証跡は不可」と明記されている

**No 条件**: 手動テスト手順が個別コンポーネント単体での検証を許容している

---

### AC-05: 先行タスク AC の統合テスト行列反映

**判定文**: task-05 / task-06 / task-07 の受入基準が、統合テストのテストケース ID に対応付けられた行列として管理されている。

**Yes 条件**:

- task-05 の AC（auth-mode → api-key 切替 UI 導線）に対応する統合テストケース ID が明示されている
- task-06 の AC（malformed apiKey response fallback）に対応する統合テストケース ID が明示されている
- task-07 の AC（corrupted persist state recovery）に対応する統合テストケース ID が明示されている
- 行列（マッピングテーブル）が成果物として存在する

**No 条件**: 先行タスクの AC とテストケースの対応が暗黙的で、明示的な行列が存在しない

---

### AC-06: settings integration harness の境界一本化

**判定文**: settings integration harness が store mock と electronAPI mock の境界を一箇所で管理する設計になっている。

**Yes 条件**:

- store mock（`useAppStore`, `useAuthMode`, `useAuthModeStatus` 等）の初期化が harness 内の単一関数で行われる
- electronAPI mock（`window.electronAPI.apiKey.*`）の初期化が harness 内の単一関数で行われる
- harness を使用するテストファイルが個別に store mock と electronAPI mock を定義していない
- harness がパラメータ（初期 store 状態、electronAPI の戻り値）を受け取り、テストケースごとにカスタマイズ可能である

**No 条件**: store mock と electronAPI mock が複数のテストファイルに分散して定義されている

---

## 判定基準まとめ

| AC    | 判定対象                 | Yes 判定のキー条件                                          |
| ----- | ------------------------ | ----------------------------------------------------------- |
| AC-01 | 過剰モック解消           | 3コンポーネントの vi.mock() が統合テストに存在しない        |
| AC-02 | auth-mode 切替テスト     | role="radio" 経由での切替操作テストが存在する               |
| AC-03 | provider fallback テスト | 異常レスポンス時のフォールバックテストが存在する            |
| AC-04 | manual evidence 必須条件 | settings shell 到達が手動テスト手順に含まれている           |
| AC-05 | 統合テスト行列           | 05/06/07 の AC と テストケース ID の対応行列が存在する      |
| AC-06 | harness 境界一本化       | store + electronAPI の mock が harness で一元管理されている |
