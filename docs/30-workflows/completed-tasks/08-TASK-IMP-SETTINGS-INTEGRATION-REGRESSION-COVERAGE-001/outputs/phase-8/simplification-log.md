# Phase 8: 簡素化ログ

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 8                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |
| 入力     | Phase 4-7 成果物 + refactor-guardrails.md                |

---

## 削減候補

### SL-01: SettingsView.test.tsx の既存モック定義と harness の重複

**現状**:

- `SettingsView.test.tsx` は独自に `vi.mock()` で AccountSection / ApiKeysSection / AuthModeSelector をモックしている
- `settings-test-harness.ts` は store と electronAPI の mock 初期化を一元管理している
- 両者の store mock 初期化パターン（`useAppStore` のセレクタ mock 等）が重複する可能性がある

**判断**: **削減しない**

**理由**:

- `SettingsView.test.tsx` は既存 unit test であり、変更禁止対象（振る舞い維持条件）
- unit test はコンポーネントをモックして SettingsView の「構成」のみをテストする意図がある
- integration test は real composition で「振る舞い」をテストする意図がある
- 両者の責務が異なるため、mock 定義の重複は許容する
- harness への依存を強制すると unit test の自己完結性が失われる

**結論**: 重複は認識するが、責務分離の観点から意図的に残す

---

### SL-02: provider list fixture の複数箇所定義

**現状**:

- `ApiKeysSection.test.tsx` に provider list の fixture 定義が存在する
- `SettingsView.integration.test.tsx` にも同様の provider list 定義が必要になる
- harness 内にもデフォルトの provider list が定義される

**判断**: **harness 内に共通定数として集約する（integration test 側のみ）**

**削減内容**:

- `settings-test-harness.ts` に `DEFAULT_FIXTURES.providerList` を定義する
- `SettingsView.integration.test.tsx` はこの定数を import して使用する
- テストケース固有の異常値 fixture は各テストケース内に留める

**残す制約**:

- `ApiKeysSection.test.tsx` 内の fixture 定義は変更しない（既存 unit test 不可侵ルール）
- harness と ApiKeysSection.test.tsx の重複は意図的に残す

**削減効果**: integration test 内での provider list ハードコードを1箇所に集約

---

### SL-03: mockAuthModeValues の複数箇所初期化

**現状**:

- AuthModeSelector.test.tsx に authMode / authModeStatus / authModeLoading の mock 初期化が存在する
- integration test でも同じ値の初期化が必要になる
- harness 内にもデフォルトの authMode 状態が定義される

**判断**: **harness 内のデフォルト値で集約する（integration test 側のみ）**

**削減内容**:

- `settings-test-harness.ts` の `SettingsHarnessOptions.storeOverrides` にデフォルト authMode 値を定義する
- integration test はデフォルト値を使用するか、`storeOverrides` で上書きする
- 明示的な `vi.fn(() => "subscription")` 等のボイラープレートを integration test から除去する

**残す制約**:

- `AuthModeSelector.test.tsx` 内の mock 初期化は変更しない（既存 unit test 不可侵ルール）

**削減効果**: integration test 内の authMode 初期化ボイラープレートを harness のデフォルト値に吸収

---

## 残す制約の一覧

| 制約 ID | 制約内容                                               | 理由                                                                                    |
| ------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| C-01    | 既存 unit test の独立性を維持する                      | unit test は harness に依存させない。自己完結で動く必要がある                           |
| C-02    | ApiKeysSection.test.tsx の独自 electronAPI mock を残す | component test の責務は個別コンポーネントの振る舞い検証であり、harness の責務とは異なる |
| C-03    | AuthModeSelector.test.tsx の独自 store mock を残す     | 同上。component test は store のセレクタ mock を自己完結で持つ                          |
| C-04    | 異常値 fixture は各テストケース内に留める              | 異常値はテストケースの文脈でのみ意味を持つ。共通化すると可読性が下がる                  |
| C-05    | harness は integration test 専用とする                 | unit test が harness に依存すると、harness 変更時の影響範囲が肥大化する                 |

---

## 削減サマリ

| 項目  | 削減前                | 削減後                             | 効果                                    |
| ----- | --------------------- | ---------------------------------- | --------------------------------------- |
| SL-01 | 重複 mock 定義2箇所   | 重複維持（意図的残存）             | 責務分離の明確化                        |
| SL-02 | provider fixture 重複 | harness 内 DEFAULT_FIXTURES に集約 | integration test のハードコード削減     |
| SL-03 | authMode 初期化重複   | harness デフォルト値に吸収         | integration test のボイラープレート削減 |

---

## リファクタリング実行順序

1. **RF-03**: テスト名の命名規則統一（振る舞い変更なし、最もリスクが低い）
2. **RF-02**: fixture 定数の共通化（SL-02, SL-03 の適用）
3. **RF-01**: harness 内の重複ヘルパー削除
4. **RF-04**: 不要 mock の削除確認（最終確認）

各ステップで 105件テスト全 PASS を確認してから次のステップに進む。
