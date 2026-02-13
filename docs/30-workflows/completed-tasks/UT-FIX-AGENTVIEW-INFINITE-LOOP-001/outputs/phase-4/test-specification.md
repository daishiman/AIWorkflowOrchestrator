# Phase 4: テスト仕様書 (UT-FIX-AGENTVIEW-INFINITE-LOOP-001)

## メタ情報

| 項目           | 値                                                                       |
| -------------- | ------------------------------------------------------------------------ |
| タスクID       | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                                       |
| Phase          | 4 (テスト作成)                                                           |
| 作成日         | 2026-02-12                                                               |
| テスト対象     | AgentView コンポーネント                                                 |
| テストファイル | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` |

## テスト方針

### モック方式の変更

Phase 5で実装をインラインセレクタから個別セレクタHookに移行するため、テストのモック方式も同時に変更する。

**変更前**: `useAppStore` を直接モックし、`selector(createMockState())` パターンで返す
**変更後**: 各個別セレクタHook（`useIsLoadingSkills`, `useSkillError` 等）を個別にモック

### 新規追加テストケース

#### describe: 無限ループ防止（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

| テストケース                          | 検証内容                                       | 方式                 |
| ------------------------------------- | ---------------------------------------------- | -------------------- |
| デバッグ console.log 除去             | ソースコードに `console.log(` が含まれない     | ソースコード静的解析 |
| インラインセレクタ廃止                | `useAppStore((state) =>` パターンが含まれない  | ソースコード静的解析 |
| ローカル fetchSkills useCallback 廃止 | `const fetchSkills = useCallback` が含まれない | ソースコード静的解析 |

### 既存テストの変更

既存28テストケースのモック方式を個別セレクタHookベースに変更。テストの意図と検証内容は同一。

## テスト一覧（全31件）

| No. | describe             | テストケース                                                     | 状態 |
| --- | -------------------- | ---------------------------------------------------------------- | ---- |
| 1   | レンダリング         | should render without crashing                                   | PASS |
| 2   | レンダリング         | should display 'Agent' header                                    | PASS |
| 3   | レンダリング         | should display description text                                  | PASS |
| 4   | レンダリング         | should have h1 heading                                           | PASS |
| 5   | ローディング状態     | should display loading state when isLoadingSkills is true        | PASS |
| 6   | 空状態               | should display placeholder message when not loading              | PASS |
| 7   | エラー状態           | should display error message when error exists                   | PASS |
| 8   | className            | should accept custom className                                   | PASS |
| 9   | displayName          | should have displayName set                                      | PASS |
| 10  | アクセシビリティ     | should have accessible heading                                   | PASS |
| 11  | アクセシビリティ     | should have proper semantic structure                            | PASS |
| 12  | アクセシビリティ     | should have main content section                                 | PASS |
| 13  | スキル一覧表示       | should display skills when available                             | PASS |
| 14  | オプションフィールド | should render skill with missing optional category field         | PASS |
| 15  | オプションフィールド | should render skill with empty triggers array                    | PASS |
| 16  | 長いテキスト         | should handle very long skill name                               | PASS |
| 17  | 長いテキスト         | should handle very long skill description                        | PASS |
| 18  | 長いテキスト         | should handle long error message                                 | PASS |
| 19  | 空文字列             | should render skill with empty description                       | PASS |
| 20  | 大量データ           | should render many skills without crashing                       | PASS |
| 21  | アクセシビリティ拡張 | should have proper ARIA labels on main sections                  | PASS |
| 22  | アクセシビリティ拡張 | should have banner role for header                               | PASS |
| 23  | アクセシビリティ拡張 | should have heading hierarchy                                    | PASS |
| 24  | アクセシビリティ拡張 | should show error with proper styling                            | PASS |
| 25  | アクセシビリティ拡張 | should have region for error state                               | PASS |
| 26  | アクセシビリティ拡張 | should have region for main content                              | PASS |
| 27  | 状態遷移             | should display loading then content                              | PASS |
| 28  | 日本語コンテンツ     | should render Japanese skill name correctly                      | PASS |
| 29  | 無限ループ防止       | should not contain debug console.log statements in source        | PASS |
| 30  | 無限ループ防止       | should use individual selector hooks instead of inline selectors | PASS |
| 31  | 無限ループ防止       | should not have local fetchSkills useCallback                    | PASS |

## 実行結果

```
 Test Files  1 passed (1)
      Tests  31 passed (31)
   Duration  2.90s
```
