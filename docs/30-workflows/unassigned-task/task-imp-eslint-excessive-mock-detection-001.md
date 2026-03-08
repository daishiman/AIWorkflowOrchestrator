# vi.mock 過剰使用検出 ESLint ルール - タスク指示書

## メタ情報

```yaml
issue_number: 1077
```

## メタ情報

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | UT-08-P50-ESLINT-EXCESSIVE-MOCK-DETECTION                                        |
| タスク名     | vi.mock 過剰使用検出 ESLint カスタムルール作成                                   |
| 分類         | テスト品質自動化                                                                 |
| 対象機能     | ESLint カスタムルール + テストファイル全体                                       |
| 優先度       | 低                                                                               |
| 見積もり規模 | 中規模                                                                           |
| ステータス   | 未実施                                                                           |
| 発見元       | Phase 12 FB-04 + P50（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK で P50（過剰 vi.mock による統合テスト空洞化）を発見・文書化した。SettingsView のテストでは AccountSection, ApiKeysSection, AuthModeSelector の3コンポーネントが全て `vi.mock(() => () => null)` でモックされており、「統合テスト」と称しながら実質的にコンポーネント間連携が検証されていなかった。

この問題はコードレビューで検出可能だが、レビュアーが意識しなければ見逃す。ESLint カスタムルールで機械的に検出することで、P50 の再発を防止できる。

### 1.2 問題点・課題

1. **レビュー依存の検出**: P50 はコードレビューでしか検出できず、見逃しリスクが高い
2. **テスト名と実態の乖離**: `*.integration.test.tsx` というファイル名で vi.mock が大量に使われると、テストの意図と実態が乖離する
3. **新規開発者への影響**: 既存の過剰モックテストをテンプレートとしてコピーすると、空洞テストが増殖する

### 1.3 放置した場合の影響

- AgentView, ChatView 等の新規 View テストで同じ過剰モックパターンが適用される
- 「統合テスト」の信頼性が低下し、手動テストへの依存が増加する
- CI がグリーンでも実際の画面で不具合が発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

`*.integration.test.tsx` ファイル内の vi.mock 呼び出し数を監視し、テスト対象コンポーネントの直接子コンポーネントをモックしすぎている場合に ESLint 警告を出す。

### 2.2 最終ゴール

- ESLint カスタムルール `no-excessive-integration-mock` が作成されている
- 統合テストファイルで vi.mock が3回以上使用されている場合に警告が出る
- 既存の正当なモック（store, electronAPI）は除外される

### 2.3 スコープ

#### 含むもの

- ESLint カスタムルール `no-excessive-integration-mock` の作成
- ルール設定（閾値、除外パターン）
- テスト用のテストケース（ルール自体のテスト）

#### 含まないもの

- 既存テストファイルの修正（警告の修正は別タスク）
- ESLint プラグインとしての公開
- CI パイプラインへの組み込み（別途検討）

### 2.4 成果物

- `eslint-rules/no-excessive-integration-mock.js`
- `eslint-rules/__tests__/no-excessive-integration-mock.test.js`
- `.eslintrc.js` への設定追加

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: ルール設計

```typescript
// ルール名: no-excessive-integration-mock
// 適用対象: *.integration.test.tsx, *.integration.test.ts
// 検出条件: vi.mock() の呼び出しでコンポーネントパスをモックしている箇所が N 個以上
// 除外パターン: store, electronAPI, external service のモック

// 設定例
rules: {
  'custom/no-excessive-integration-mock': ['warn', {
    maxComponentMocks: 2,  // コンポーネントモック数の上限
    excludePatterns: [
      '**/store',          // store モックは許可
      '**/store/**',
      'electron',          // electronAPI は許可
    ],
  }],
}
```

#### Step 2: AST ベースの検出ロジック

```javascript
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "統合テストでの過剰な vi.mock 使用を検出する",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxComponentMocks: { type: "number", default: 2 },
          excludePatterns: { type: "array", items: { type: "string" } },
        },
      },
    ],
  },
  create(context) {
    // vi.mock() 呼び出しを収集
    // 除外パターンにマッチしないモックをカウント
    // 閾値超過時に報告
  },
};
```

#### Step 3: テスト作成・実行

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: P50 の発見が Phase 1（要件定義）で初めて顕在化

**問題**: SettingsView の既存テストが「統合テスト」と見なされていたが、実際は3コンポーネント全てがモックされた空洞テストだった。テストが PASS するため、コードレビューでも気づかれなかった。

**解決策**: テストファイル名（`*.integration.test.tsx`）と内容（vi.mock 数）の整合性を機械的にチェックする仕組みが必要。本タスクの ESLint ルールがこれを実現する。

#### 苦戦箇所2: 正当なモックと過剰モックの区別

**問題**: store モック（`vi.mock("../../../store")`）や electronAPI モックは統合テストでも正当。一方、テスト対象の子コンポーネントのモック（`vi.mock("../components/AccountSection")`）は過剰。この区別を自動化する必要がある。

**解決策**: `excludePatterns` 設定でstore/外部APIモックを除外し、コンポーネントパスのモックのみをカウントする。

---

## 4. 受け入れ基準

- [ ] ESLint カスタムルール `no-excessive-integration-mock` が作成されている
- [ ] `*.integration.test.tsx` ファイルで vi.mock が設定閾値を超えた場合に警告が出る
- [ ] store, electronAPI 等の正当なモックは除外される
- [ ] ルール自体のテストが PASS する

---

## 5. 参照資料

| 資料              | パス                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| P50 pitfall       | `.claude/rules/06-known-pitfalls.md#P50`                                                   |
| S-INT-01 パターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`          |
| 統合テスト実装例  | `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` |

---

## 6. 関連タスク

| タスクID                                                 | 関係                           |
| -------------------------------------------------------- | ------------------------------ |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 発見元                         |
| UT-08-004                                                | ハーネスパターン仕様化（前提） |
