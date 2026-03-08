# testing-component-patterns.md への統合テストハーネスパターン追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1082
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-08-004-TESTING-COMPONENT-PATTERNS-HARNESS-ADDITION                |
| タスク名     | testing-component-patterns.md への統合テストハーネスパターン追加     |
| 分類         | 仕様書更新                                                           |
| 対象機能     | テストパターン仕様書（testing-component-patterns.md）                |
| 優先度       | 低                                                                   |
| 見積もり規模 | 小規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | Phase 12（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 で SettingsView の統合テスト用ハーネス（`settings-test-harness.ts`）を設計・実装した。このハーネスは以下の3パターンを統合した新しいテスト設計パターンである:

1. **createXxxHarness(options) パターン**: store mock + 外部 API mock を一本化したファクトリ関数
2. **vi.mock hoisting + モジュールスコープ変数パターン**: vi.mock のファクトリ関数内でモジュールスコープの `let` 変数を参照し、`beforeEach` で再代入する
3. **HarnessOptions によるテストケースごとのカスタマイズ**: `storeOverrides`, `authModeOverrides`, `apiKeyOverrides` 等でテストごとの状態を注入

これらのパターンは `testing-component-patterns.md`（テストパターン仕様書）に未記載であり、今後の統合テスト実装時にハーネス設計の再発明が発生するリスクがある。

### 1.2 問題点・課題

1. **パターンの属人化**: settings-test-harness.ts の設計知見が実装者の暗黙知にとどまり、他の開発者（およびAIエージェント）が参照できない
2. **再発明コスト**: 別の View（AgentView, ChatView 等）の統合テストを作成する際に、同様のハーネス設計を一から考える必要がある
3. **vi.mock hoisting の落とし穴が未文書化**: この技術課題は08-TASKで最も苦戦した箇所だが、仕様書に記載されていないため同じ苦戦が繰り返される

### 1.3 放置した場合の影響

- 新規 View の統合テスト作成時に、ハーネス設計で同じ苦戦を繰り返す
- テストパターンの不統一が進み、保守コストが増加する
- AIエージェントが統合テストを実装する際に、適切なパターンを選択できない

---

## 2. 何を達成するか（What）

### 2.1 目的

testing-component-patterns.md に統合テストハーネスパターン（S-INT-01）を追加し、今後の統合テスト実装時にパターンの再発明を防止する。

### 2.2 最終ゴール

- testing-component-patterns.md に S-INT-01（統合テストハーネスパターン）が追加されている
- vi.mock hoisting + モジュールスコープ変数パターンがコード例付きで記載されている
- HarnessOptions パターンが設計判断の根拠付きで記載されている

### 2.3 スコープ

#### 含むもの

- testing-component-patterns.md への新規セクション「S-INT-01: 統合テストハーネスパターン」追加
- コード例（settings-test-harness.ts ベース）
- 設計判断の根拠と trade-offs
- 苦戦箇所と解決策のまとめ

#### 含まないもの

- testing-component-patterns.md の既存パターンの変更
- 他の仕様書の更新
- テストコードの変更

### 2.4 成果物

- 更新済み `testing-component-patterns.md`

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: testing-component-patterns.md の現状確認

```bash
cat .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md
```

#### Step 2: S-INT-01 セクションの追加

以下の内容を追加:

````markdown
### S-INT-01: 統合テストハーネスパターン

#### 概要

複数のコンポーネントを real composition（vi.mock 不使用）でレンダーし、store mock + 外部 API mock を統合ハーネスで管理する。

#### 適用基準

- 3つ以上の子コンポーネントを含む View レベルのコンポーネント
- store セレクタが10個以上使用されている
- 外部 API（electronAPI 等）への依存がある

#### パターン構造

1. **ハーネスファイル**（`xxx-test-harness.ts`）

```typescript
export interface HarnessOptions {
  storeOverrides?: Partial<MockStoreState>;
  apiOverrides?: Partial<MockExternalApi>;
}

export function createXxxHarness(options: HarnessOptions = {}) {
  const storeState = createDefaultStoreState(options.storeOverrides);
  const externalApi = createDefaultExternalApi(options.apiOverrides);

  return {
    storeState,
    externalApi,
    createStoreMockFactory: () => ({
      /* ... */
    }),
    setupExternalApi: () => {
      /* Object.defineProperty */
    },
    updateStoreState: (updates) => {
      Object.assign(storeState, updates);
    },
  };
}
```
````

2. **テストファイル**（vi.mock hoisting パターン）

```typescript
// モジュールスコープ変数（vi.mock ファクトリから参照される）
let currentStoreState: MockStoreState;

// vi.mock（ファイル先頭に hoist される）
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(currentStoreState)),
}));

// 通常の import（vi.mock の後に配置）
import { TargetView } from "../index";

// beforeEach で変数を再代入
beforeEach(() => {
  currentStoreState = createDefaultStoreState();
});
```

#### なぜこのパターンが必要か

- `vi.mock` は Vitest によりファイル先頭に hoist されるため、テスト内で設定した変数をファクトリ関数内で参照できない
- 通常の `vi.mock(() => ({ ... }))` ではテストケースごとの状態カスタマイズが困難
- モジュールスコープ変数を使うことで、`beforeEach` や `it` 内から動的にモック値を変更可能

#### 注意事項

- P39: happy-dom 環境では `userEvent` が使用不可。`fireEvent` を使用する
- P31: 個別セレクタ（`useAuthMode()` 等）を使用し、合成 Hook を避ける
- M-01: 全セレクタのデフォルト値を harness に網羅的に定義する

````

#### Step 3: topic-map.md の再生成

```bash
cd .claude/skills/aiworkflow-requirements
node generate-index.js
````

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: vi.mock hoisting の理解

**問題**: vi.mock はファイル先頭に hoisting されるため、以下のコードは動作しない:

```typescript
// vi.mock は hoist されるため、harness は undefined
const harness = createSettingsHarness();
vi.mock("../../../store", () => harness.createStoreMockFactory());
```

**解決策**: モジュールスコープの `let` 変数を宣言し、vi.mock ファクトリ内でその変数を参照する。`beforeEach` で変数を再代入する。

#### 苦戦箇所2: AccountSection の17セレクタ問題（M-01）

**問題**: AccountSection が authSlice の17セレクタを使用しており、1つでもデフォルト値が欠けると `undefined` エラーが発生する。統合テストで real composition を使う場合、全セレクタのモック値が必要。

**解決策**: `createDefaultStoreState()` に全セレクタのデフォルト値を定義し、テストでは `storeOverrides` で必要なプロパティのみ上書きする。

#### 苦戦箇所3: electronAPI の Object.defineProperty パターン

**問題**: `window.electronAPI` は Electron の Preload スクリプトが設定するため、テスト環境では存在しない。単純な代入（`window.electronAPI = { ... }`）では TypeScript の型チェックでエラーになる。

**解決策**: `Object.defineProperty(window, "electronAPI", { value: { ... }, writable: true, configurable: true })` で設定する。harness の `setupElectronApi()` メソッドとして提供。

---

## 4. 受け入れ基準

- [ ] testing-component-patterns.md に S-INT-01 セクションが追加されている
- [ ] vi.mock hoisting + モジュールスコープ変数パターンのコード例が含まれている
- [ ] HarnessOptions パターンの設計判断と trade-offs が記載されている
- [ ] 苦戦箇所（M-01, P31, P39）への参照が含まれている
- [ ] topic-map.md が再生成されている

---

## 5. 参照資料

| 資料                          | パス                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| testing-component-patterns.md | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                |
| settings-test-harness.ts      | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`                                |
| 統合テスト本体                | `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`                       |
| Phase 2 設計判断              | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-2/design-decisions.md` |

---

## 6. 関連タスク

| タスクID                                                 | 関係                              |
| -------------------------------------------------------- | --------------------------------- |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 親タスク（発見元）                |
| UT-08-001                                                | act() 警告解消                    |
| UT-08-003                                                | INT-11~13 拡充（ハーネス活用）    |
| UT-10A-F-STORE-MOCK-PATTERN-STANDARDIZATION-GUARD        | Store mock 標準化（関連パターン） |
