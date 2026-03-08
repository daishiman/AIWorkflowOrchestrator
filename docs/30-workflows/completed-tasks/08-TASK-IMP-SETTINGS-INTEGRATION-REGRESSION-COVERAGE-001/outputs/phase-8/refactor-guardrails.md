# Phase 8: リファクタリングガードレール

## メタ情報

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001                |
| Phase    | 8                                                                       |
| 作成日   | 2026-03-08                                                              |
| 作成者   | SubAgent-Lead-Sync                                                      |
| 入力     | Phase 4-7 成果物（harness, integration test, fixture, coverage report） |

---

## 振る舞い維持条件

リファクタリング前後で以下の全テストが Green であることを必須条件とする。
1件でも Red になった場合、そのリファクタリングは revert する。

### 統合テスト（新規: Phase 4-7 成果物）

| テスト ID | テスト内容                                       | 対応 AC |
| --------- | ------------------------------------------------ | ------- |
| INT-01    | SettingsView real composition mount              | AC-01   |
| INT-02    | AccountSection 認証済み状態表示                  | AC-01   |
| INT-03    | AccountSection 未認証状態表示                    | AC-01   |
| INT-04    | AuthModeSelector subscription 選択               | AC-02   |
| INT-05    | AuthModeSelector api-key 選択                    | AC-02   |
| INT-06    | AuthModeSelector disabled 状態操作無効化         | AC-02   |
| INT-07    | ApiKeysSection 正常プロバイダー一覧表示          | AC-03   |
| INT-08    | ApiKeysSection 非配列 providers フォールバック   | AC-03   |
| INT-09    | ApiKeysSection null response フォールバック      | AC-03   |
| INT-10    | auth-mode 切替時の ApiKeysSection 表示連動       | AC-05   |
| INT-11    | persist corrupted state からの復旧               | AC-05   |
| INT-12    | 全セクション同時レンダリング（regression guard） | AC-05   |
| INT-13    | harness パラメータカスタマイズ検証               | AC-06   |

### 既存 unit test（変更禁止）

| テストファイル            | テスト件数 | 変更可否 |
| ------------------------- | ---------- | -------- |
| SettingsView.test.tsx     | 26件       | 変更禁止 |
| ApiKeysSection.test.tsx   | 46件       | 変更禁止 |
| AuthModeSelector.test.tsx | 20件       | 変更禁止 |

**合計ガードライン**: INT-01 ~ INT-13（13件） + 既存 unit test（92件） = **105件全 PASS**

### ガード実行手順

```bash
# Phase 8 リファクタリングごとに以下を実行
cd apps/desktop

# 1. 統合テスト
pnpm vitest run src/renderer/views/SettingsView/SettingsView.integration.test.tsx

# 2. 既存 unit test（3ファイル）
pnpm vitest run src/renderer/views/SettingsView/SettingsView.test.tsx
pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx
pnpm vitest run src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx

# 3. lint + typecheck
pnpm lint
pnpm typecheck
```

---

## リファクタリング対象

### RF-01: harness 内の重複ヘルパー削除

**対象**: `settings-test-harness.ts`

**確認項目**:

- [ ] `createSettingsHarness()` の store mock 初期化と既存テストの store mock が重複していないか確認する
- [ ] electronAPI mock の setup/cleanup が harness 内で一箇所にまとまっているか確認する
- [ ] `beforeEach` / `afterEach` のボイラープレートが harness の `setup()` / `cleanup()` に集約されているか確認する

**削除基準**: harness 内で同じ mock 初期化パターンが2回以上出現する場合、共通関数に抽出する

**残す制約**: 既存 unit test ファイル（SettingsView.test.tsx 等）は harness に依存させない。unit test の独立性を保持する

### RF-02: fixture 定数の共通化

**対象**: integration test 内の provider list、auth-mode 初期値、store state のハードコード定数

**確認項目**:

- [ ] provider list fixture（4プロバイダー: OpenAI, Anthropic, Google, Azure）が複数テストケースで同一定義されていないか確認する
- [ ] auth-mode の初期値（`subscription` / `api-key`）が harness のデフォルトと重複していないか確認する
- [ ] store state のデフォルト値が harness と個別テストケースで矛盾していないか確認する

**共通化先**: `settings-test-harness.ts` 内の `DEFAULT_FIXTURES` 定数として export する

```typescript
// 共通化のイメージ
export const DEFAULT_FIXTURES = {
  providerList: [
    { provider: "openai", isRegistered: false, maskedKey: "" },
    { provider: "anthropic", isRegistered: false, maskedKey: "" },
    { provider: "google", isRegistered: false, maskedKey: "" },
    { provider: "azure", isRegistered: false, maskedKey: "" },
  ],
  authModes: {
    subscription: "subscription" as const,
    apiKey: "api-key" as const,
  },
} as const;
```

**残す制約**: テストケース固有の異常値 fixture（非配列 providers、null response 等）は各テストケース内に残す。共通化しない

### RF-03: テスト名の命名規則統一

**対象**: `SettingsView.integration.test.tsx` 内の `describe` / `it` ブロック

**命名規則**:

- `describe` ブロック: 機能領域名（日本語）
- `it` ブロック: `INT-XX: 日本語説明` 形式

**統一例**:

```typescript
describe("SettingsView 統合テスト", () => {
  describe("real composition マウント", () => {
    it("INT-01: 全セクションが real composition でマウントされる", ...);
  });

  describe("auth-mode 切替", () => {
    it("INT-04: subscription モードが選択可能", ...);
    it("INT-05: api-key モードが選択可能", ...);
    it("INT-06: disabled 状態では操作が無効化される", ...);
  });

  describe("provider フォールバック", () => {
    it("INT-07: 正常レスポンスで4プロバイダーが表示される", ...);
    it("INT-08: 非配列 providers でクラッシュせずフォールバックする", ...);
    it("INT-09: null response でクラッシュせずフォールバックする", ...);
  });
});
```

**確認項目**:

- [ ] 全 `it` ブロックが `INT-XX:` プレフィックスを持つ
- [ ] テスト ID が AC との対応行列（AC-05）と一致する
- [ ] 日本語説明がテストの振る舞いを正確に表現している

### RF-04: 不要 mock の削除確認

**対象**: integration test ファイル内の `vi.mock()` 呼び出し

**確認項目**:

- [ ] `vi.mock("../../components/organisms/AccountSection")` が存在しないこと（AC-01）
- [ ] `vi.mock("../../components/organisms/ApiKeysSection")` が存在しないこと（AC-01）
- [ ] `vi.mock("../../components/settings/AuthModeSelector")` が存在しないこと（AC-01）
- [ ] `vi.mock("react-router-dom")` 等の外部ライブラリ mock が必要最小限であること
- [ ] 使用されていない mock 変数（`mockXxx` 等）が残っていないこと

---

## リファクタリング実行ルール

1. **1変更1確認**: リファクタリングは1つの RF 単位で行い、都度ガードテスト（105件）を実行する
2. **revert 即決**: ガードテストが1件でも Red になった場合、即座に `git checkout -- <file>` で revert する
3. **振る舞い不変**: テストの期待値（assert）は一切変更しない。変更するのはテストコードの構造のみ
4. **既存 unit test 不可侵**: SettingsView.test.tsx / ApiKeysSection.test.tsx / AuthModeSelector.test.tsx は一切編集しない
