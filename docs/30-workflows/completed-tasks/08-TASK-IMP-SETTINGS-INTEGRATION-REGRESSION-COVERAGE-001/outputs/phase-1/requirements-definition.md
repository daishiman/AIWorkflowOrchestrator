# Phase 1: 要件定義書

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 1                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |

---

## 1. 現状分析

### 1.1 過剰モック3件の具体的な問題点

#### 問題1: AccountSection のモック（行6-9）

```typescript
vi.mock("../../components/organisms/AccountSection", () => ({
  AccountSection: () => (
    <div data-testid="account-section">AccountSection Mock</div>
  ),
}));
```

- **問題**: AccountSection は `useAppStore` から 18 個の個別セレクタ（`isAuthenticated`, `authUser`, `profile`, `linkedProviders` 等）を取得し、認証状態に応じて未認証 UI / 認証済み UI を切り替える。モックにより、store 状態と AccountSection の連動が一切検証されない。
- **影響**: store の `isAuthenticated` が `true` でも AccountSection が正しくプロフィール情報を表示するかは未検証。

#### 問題2: ApiKeysSection のモック（行13-23）

```typescript
vi.mock("../../components/organisms/ApiKeysSection", () => ({
  ApiKeysSection: () => (
    <div data-testid="api-keys-section" id="api-keys-settings-heading">
      <h3>APIキー設定</h3>
      <div>OpenAI</div><div>Anthropic</div><div>Google AI</div><div>xAI</div>
    </div>
  ),
}));
```

- **問題**: ApiKeysSection は `window.electronAPI.apiKey.list()` を mount 時に呼び出し、レスポンスの `providers` 配列を防御的にフィルタリングする（task-06 で追加予定の契約ガード）。モックにより、IPC レスポンスの shape 異常時のフォールバック（空配列化、エラー表示、再試行ボタン）が SettingsView 統合で動作するか未検証。
- **影響**: `result.data.providers` が非配列の場合に SettingsView 全体がクラッシュする回帰を検出できない。

#### 問題3: AuthModeSelector のモック（行26-55）

```typescript
vi.mock("../../components/settings/AuthModeSelector", () => ({
  AuthModeSelector: ({ currentMode, onModeChange, disabled }) => (
    <div data-testid="auth-mode-selector">
      <button onClick={() => onModeChange("subscription")} ... />
      <button onClick={() => onModeChange("api-key")} ... />
    </div>
  ),
}));
```

- **問題**: 実 AuthModeSelector は `role="radiogroup"` + `role="radio"` + `aria-checked` + roving tabindex パターンを持つセグメントコントロール。モックは `<button>` 2つの簡素な構造であり、キーボードナビゲーション（ArrowRight/Left/Up/Down）、アクセシビリティ属性、200ms トランジション、disabled 時の cursor-not-allowed が全て欠落している。
- **影響**: task-05 で追加予定の auth-mode 切替 UI 導線の回帰テストが実コンポーネントを通っていない。

### 1.2 manual evidence の不足

- task-03/04 の手動証跡は専用テストハーネスで取得されており、SettingsView の settings shell を経由していない。
- 「設定画面を開いて auth-mode を切り替え、ApiKeysSection で4プロバイダーが表示される」という実運用導線が証跡として存在しない。

---

## 2. 機能要件

### FR-01: SettingsView real composition 統合テスト

SettingsView.test.tsx において、AccountSection / ApiKeysSection / AuthModeSelector の3コンポーネントを実コンポーネントとしてレンダリングし、以下のシナリオを検証する統合テストを追加する。

| シナリオ ID | シナリオ名                         | 検証内容                                                                                                 |
| ----------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| INT-01      | settings shell mount               | SettingsView がヘッダー、全セクション（Account, AuthMode, ApiKeys, Profile, Theme, RAG, Save）を表示する |
| INT-02      | auth-mode 切替 flow                | real AuthModeSelector で subscription → api-key 切替が動作し、status 表示が更新される                    |
| INT-03      | apiKey malformed response fallback | `apiKey.list()` が非配列 providers を返した場合、ApiKeysSection がクラッシュせず空状態を表示する         |
| INT-04      | apiKey list success                | `apiKey.list()` が正常なプロバイダー配列を返した場合、4プロバイダーが表示される                          |
| INT-05      | auth-mode invalid state recovery   | auth-mode が不正値の場合、デフォルト（subscription）にフォールバックする                                 |

### FR-02: settings integration harness

store 初期化と electronAPI mock を一箇所で管理する test harness を作成する。

- store: `useAppStore`, `useAuthMode`, `useAuthModeStatus`, `useAuthModeLoading`, `useSetAuthMode`, `useInitializeAuthMode` の mock を統一管理
- electronAPI: `window.electronAPI.apiKey.list()`, `window.electronAPI.apiKey.validate()`, `window.electronAPI.apiKey.save()`, `window.electronAPI.apiKey.delete()` の mock を統一管理

### FR-03: manual evidence テンプレート

Phase 11 の手動証跡テンプレートに以下の必須条件を組み込む:

- settings shell に到達していること（SettingsView が表示されている screenshot を含む）
- auth-mode セクションが実画面構成で表示されていること
- ApiKeysSection が実画面構成で表示されていること

### FR-04: 先行タスク AC の統合テスト行列反映

| 先行タスク | AC 概要                                                    | 統合テスト対応 |
| ---------- | ---------------------------------------------------------- | -------------- |
| task-05    | auth-mode → api-key 切替で authKey UI が表示される         | INT-02 で検証  |
| task-06    | malformed apiKey response でクラッシュしない               | INT-03 で検証  |
| task-07    | corrupted persist state で settings 遷移がクラッシュしない | INT-05 で検証  |

---

## 3. 非機能要件

### NFR-01: テスト実行速度

- 統合テスト全体の実行時間が 10 秒以内であること（happy-dom 環境、単一ファイル実行時）

### NFR-02: 保守性

- モック境界を外部副作用（IPC 通信 = `window.electronAPI`）に限定し、コンポーネント間のモックを排除する
- settings integration harness は他のテストファイルから再利用可能な形で設計する

### NFR-03: カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### NFR-04: テスト環境互換性

- happy-dom 環境で実行可能であること（P39: userEvent 非互換のため fireEvent を使用）
- P40 準拠: `apps/desktop` ディレクトリから実行すること

---

## 4. 制約事項

- E2E テスト（Playwright）の導入は本タスクのスコープ外
- SettingsView 以外の画面のテスト改善は本タスクのスコープ外
- visual regression テストの導入は本タスクのスコープ外
- 08 は 05/06/07 の仕様確定後に直列で実行する
