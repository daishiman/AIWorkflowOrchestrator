# Phase 5: 実装順序

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 5                                                        |
| 作成日   | 2026-03-08                                               |

---

## 実装ステップ

### Step 1: settings-test-harness.ts 作成（store mock + electronAPI mock 一本化）

**目的**: AC-06 に基づき、store mock と electronAPI mock の境界を一箇所に集約する。

**実装内容**:

1. `MockStoreState` 型定義（AccountSection 18セレクタ + SettingsSlice + AuthModeSlice）
2. `createDefaultStoreState()` -- 全フィールドにデフォルト値設定
3. `createDefaultAuthModeSelectors()` -- 個別セレクタ5個のデフォルト値
4. `createDefaultElectronApiKey()` -- electronAPI.apiKey の list / save / delete / validate 4メソッドの vi.fn() モック
5. `createSettingsHarness(options)` -- 上記を統合するファクトリ関数

**ファイルパス**: `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`

**前提条件**: なし（最初に作成）

---

### Step 2: SettingsView.integration.test.tsx 作成（INT-01 〜 INT-05）

**目的**: Phase 4 で定義した INT-01 〜 INT-05（サブケース含む9件）の統合テストを実装する。

**実装内容**:

1. vi.mock 設定（ファイル先頭に hoist）
   - `useAppStore` をモジュールスコープ変数 `currentStoreState` で制御
   - 個別セレクタ（`useAuthMode` 等）をモジュールスコープ変数 `currentAuthMode` 等で制御
2. `beforeEach` で harness から値を同期
3. INT-01 〜 INT-05 のテストケース実装
   - P39 準拠: `fireEvent` を使用（`userEvent` 不使用）
   - P31 準拠: 個別セレクタ使用
   - P40 準拠: テスト実行は `apps/desktop` ディレクトリから

**ファイルパス**: `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`

**前提条件**: Step 1 完了

---

### Step 3: 各テストケースの GREEN 化確認

**目的**: 全9テストケースが PASS することを確認する。

**確認手順**:

1. INT-01: radiogroup が複数存在（ThemeSelector 含む）するため `getAllByRole` で対応
2. INT-02: `currentSetMode` を直接更新して render
3. INT-03: harness のデフォルト apiKey.list() レスポンスで自動的に Green
4. INT-04: `createSettingsHarness({ apiKeyListResult: ... })` で異常レスポンス注入
5. INT-05: `currentAuthModeStatus` を直接更新して render

**実行コマンド**:

```bash
cd apps/desktop
pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
```

**合格基準**: 9/9 テストケース PASS

---

## 依存関係グラフ

```
Step 1: settings-test-harness.ts
  │
  │  createDefaultStoreState()
  │  createDefaultAuthModeSelectors()
  │  createDefaultElectronApiKey()
  │  createSettingsHarness(options)
  │
  ▼
Step 2: SettingsView.integration.test.tsx
  │
  │  vi.mock (hoisted) ─── モジュールスコープ変数
  │  beforeEach ─────────── harness から値を同期
  │  INT-01 〜 INT-05 ──── テストケース実装
  │
  ▼
Step 3: GREEN 化確認
  │
  │  pnpm vitest run ────── 9/9 PASS 確認
  │  既存テスト確認 ──────── SettingsView.test.tsx 26件に影響なし
  │
  ▼
Phase 5 完了
```

### 技術的発見事項

#### vi.mock hoist とモジュール解決

- Vitest は `vi.mock()` をファイル先頭に自動 hoist する
- `require()` は TSX モジュールを解決できないため、ESM `import` を使用
- vi.mock の factory 内でモジュールスコープの `let` 変数を参照することで動的制御を実現

#### radiogroup の複数存在

- AuthModeSelector と ThemeSelector の両方が `role="radiogroup"` を持つ
- `getByRole("radiogroup")` は失敗するため、`getAllByRole` または aria-label 指定が必要

---

## 結果

全9テスト Green（PASS）
