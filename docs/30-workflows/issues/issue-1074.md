# [#1074] "[UT-08-001-SETTINGS-INTEGRATION-ACT-WARNING-FIX] SettingsView 統合テスト act() 警告解消"

## メタ情報

```yaml
task_id: UT-08-001-SETTINGS-INTEGRATION-ACT-WARNING-FIX
task_name: SettingsView 統合テスト act() 警告解消
category: テスト品質改善
target_feature: SettingsView.integration.test.tsx（INT-05 テストスイート）
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001）
created_date: 2026-03-08
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-settings-integration-act-warning-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 で SettingsView の統合テスト（18テスト）を実装した。INT-05（auth-mode status メッセージの条件付き表示）の3テストで、テスト結果は全て PASS するが、コンソールに `act()` 警告が出力される。

この警告は、SettingsView 全体をレンダーする際に ApiKeysSection の `useEffect` 内 `apiKey.list()` が Promise を返し、テスト終了後に state 更新が発生することが原因。INT-05 は auth-mode status の表示を検証する目的であり、ApiKeysSection の非同期ロード完了を `waitFor` で待機していない。

### 1.2 問題点・課題

1. **コンソール出力汚染**: INT-05 の3テストで `act()` 警告がコンソールに出力され、他のテスト結果の可読性を低下させる
2. **CI ログの可読性低下**: CI パイプラインのログに不要な警告が混在し、実際のエラーを見逃すリスクがある
3. **テストの信頼性印象**: 警告が出るテストは「不完全」な印象を与え、テストスイート全体の信頼性を低下させる

### 1.3 放置した場合の影響

- テスト数が増加するにつれ、`act()` 警告が累積しコンソール出力が読みにくくなる
- 新規テスト追加時に同じパターンの警告を放置する文化が定着する
- 将来の React バージョンアップで `act()` 警告がエラーに昇格する可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

INT-05 テストスイートの3テストで `act()` 警告を解消し、テスト実行時のコンソール出力をクリーンにする。

### 2.2 最終ゴール

- INT-05 の3テストが `act()` 警告なしで PASS する
- 既存の18テスト全てが引き続き PASS する
- テスト実行時のコンソール出力に `act()` 警告が含まれない

### 2.3 スコープ

#### 含むもの

- `SettingsView.integration.test.tsx` の INT-05 テスト修正
- `settings-test-harness.ts` の修正（必要な場合のみ）

#### 含まないもの

- INT-05 以外のテストケースの変更
- テストの追加・削除
- プロダクションコードの変更

### 2.4 成果物

- 更新済み `SettingsView.integration.test.tsx`（act() 警告解消済み）

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: 現状の act() 警告の確認

```bash
cd apps/desktop
pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx 2>&1 | grep "act()"
```

#### Step 2: 対策パターンの選択

以下の2つのアプローチから選択:

**アプローチA（推奨）: 各テスト末尾に非同期更新待機を追加**

```typescript
// INT-05 の各テスト末尾に追加
await waitFor(() => {
  // ApiKeysSection の非同期ロード完了を待機
});
```

**アプローチB: INT-05 専用の同期 mock に差し替え**

```typescript
// settings-test-harness.ts で INT-05 専用オプション
apiKeyOverrides: {
  list: vi.fn().mockReturnValue({
    // mockResolvedValue → mockReturnValue
    success: true,
    data: { providers: [] },
  });
}
```

#### Step 3: テスト実行・確認

```bash
pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
```

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: vi.mock hoisting とモジュールスコープ変数

**問題**: `vi.mock` はファイル先頭に hoisting されるため、テストの `beforeEach` で設定したモック値が `vi.mock` ファクトリ関数内で参照できない。

**解決策**: モジュールスコープの `let` 変数を宣言し、`vi.mock` ファクトリ内でその変数を参照する。`beforeEach` でその変数を再代入する。

```typescript
// モジュールスコープ
let currentStoreState: MockStoreState;

// vi.mock ファクトリ（hoist される）
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(currentStoreState)),
}));

// beforeEach で再代入
beforeEach(() => {
  currentStoreState = createDefaultStoreState();
});
```

#### 苦戦箇所2: real composition での非同期副作用

**問題**: SettingsView を real composition でレンダーすると、ApiKeysSection の `useEffect` が `apiKey.list()` を呼び出し、Promise 解決後に state 更新が発生する。テスト対象が auth-mode status の場合でも、この副作用の完了を待機しないと `act()` 警告が出る。

**解決策**: テスト末尾に `await waitFor(() => {})` を追加するか、テスト固有の harness オプションで `apiKey.list` を同期的に返す mock に差し替える。

#### 苦戦箇所3: P39 happy-dom での userEvent 非互換

**問題**: `@testing-library/user-event` は happy-dom 環境で Symbol 操作エラーを起こす。

**解決策**: happy-dom 環境では `fireEvent` を使用し、非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。

---

## 4. 受け入れ基準

- [ ] INT-05 の3テストが `act()` 警告なしで PASS する
- [ ] 既存の18テスト全てが PASS する
- [ ] `pnpm vitest run` 実行時にコンソールに `act()` 関連の警告が出力されない

---

## 5. 参照資料

| 資料                  | パス                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 統合テスト本体        | `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`                                 |
| テストハーネス        | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`                                          |
| Phase 12 未タスク検出 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-12/unassigned-task-detection.md` |
| P39 pitfall           | `.claude/rules/06-known-pitfalls.md#P39`                                                                                   |

---

## 6. 関連タスク

| タスクID                                                 | 関係               |
| -------------------------------------------------------- | ------------------ |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 親タスク（発見元） |
