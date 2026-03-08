# SettingsView テストハーネス セレクタ同期ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1080
```

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-08-R02-SETTINGS-HARNESS-SELECTOR-SYNC-GUARD                                  |
| タスク名     | SettingsView テストハーネス セレクタ同期ガード                                  |
| 分類         | テスト保守性改善                                                                |
| 対象機能     | settings-test-harness.ts のセレクタデフォルト値管理                             |
| 優先度       | 低                                                                              |
| 見積もり規模 | 小規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | Phase 9 R-02 + M-01（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK で settings-test-harness.ts を作成し、AccountSection が使用する17個のセレクタ + SettingsView 自身のセレクタ全てにデフォルト値を設定した（M-01 対応）。Phase 9 の R-02 リスクとして「AccountSection に新規セレクタが追加された場合、harness のデフォルト値が不足して TypeError が発生する」リスクが識別されている。

現状では、新規セレクタ追加時に harness の更新が手動で行われるため、更新漏れのリスクがある。

### 1.2 問題点・課題

1. **更新漏れリスク**: 新規セレクタが AccountSection/AuthSlice に追加された際、harness の `MockStoreState` と `createDefaultStoreState()` の両方を更新する必要があるが、忘れる可能性が高い
2. **TypeError の遅延検出**: 更新漏れは統合テスト実行時に初めて TypeError として検出される。セレクタ追加のコミットとテスト失敗のタイミングがずれると原因特定が困難
3. **手動管理の限界**: セレクタ数が増加するにつれ、手動管理の信頼性が低下する

### 1.3 放置した場合の影響

- authSlice にセレクタが追加されるたびに統合テストが壊れる
- harness の更新を忘れた PR が CI で失敗し、修正に追加コミットが必要になる
- 統合テストの信頼性が低下し、開発者が統合テストを無効化する動機になる

---

## 2. 何を達成するか（What）

### 2.1 目的

settings-test-harness.ts のセレクタデフォルト値と実際のコンポーネントが使用するセレクタの同期を自動検証する仕組みを構築する。

### 2.2 最終ゴール

- セレクタ追加時に harness の更新漏れを自動検出するテストまたはスクリプトが存在する
- 新規セレクタ追加の手順書が harness ファイル内のコメントに記載されている

### 2.3 スコープ

#### 含むもの

- セレクタ同期検証テスト（harness 内のセレクタ数と実コンポーネントのセレクタ使用数の比較）
- settings-test-harness.ts への保守手順コメント追加
- 検出スクリプト（オプション）

#### 含まないもの

- harness の自動生成ツール
- 他の View の harness

### 2.4 成果物

- セレクタ同期検証テスト（`settings-test-harness.test.ts` 等）
- harness 内のコメント更新

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: 現在のセレクタ使用状況の調査

```bash
# AccountSection のセレクタ使用数
grep -c "useAppStore\|use[A-Z]" apps/desktop/src/renderer/views/SettingsView/components/organisms/AccountSection/
# harness のデフォルト値数
grep -c ":" apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts | head -5
```

#### Step 2: 同期検証テスト作成

```typescript
// settings-test-harness.test.ts
import { createDefaultStoreState } from "./settings-test-harness";

describe("settings-test-harness 同期検証", () => {
  it("createDefaultStoreState が全セレクタのデフォルト値を含む", () => {
    const state = createDefaultStoreState();

    // SettingsView が使用するセレクタ
    expect(state).toHaveProperty("apiKey");
    expect(state).toHaveProperty("themeMode");

    // AccountSection が使用するセレクタ（authSlice）
    expect(state).toHaveProperty("isAuthenticated");
    expect(state).toHaveProperty("authUser");
    expect(state).toHaveProperty("linkedProviders");
    // ... 全17セレクタ

    // AuthModeSlice
    expect(state).toHaveProperty("mode");
    expect(state).toHaveProperty("status");
  });
});
```

#### Step 3: 保守コメント追加

```typescript
/**
 * SettingsView 統合テスト用ハーネス
 *
 * セレクタ追加時の保守手順:
 * 1. MockStoreState インターフェースに新セレクタの型を追加
 * 2. createDefaultStoreState() にデフォルト値を追加
 * 3. settings-test-harness.test.ts の同期検証テストに expect を追加
 * 4. 統合テストを実行して全テストが PASS することを確認
 */
```

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: M-01 の17セレクタ網羅

**問題**: AccountSection が使用するセレクタが17個あり、1つでもデフォルト値が欠けると `TypeError: Cannot read properties of undefined` が発生。Phase 3 の MINOR 指摘で検出された。

**解決策**: `grep -rn "useAppStore" AccountSection/` で全セレクタを列挙し、`createDefaultStoreState()` に網羅的に定義した。

#### 苦戦箇所2: セレクタの型定義と実装値のミスマッチ

**問題**: `MockStoreState` の型定義で `linkedProviders: Array<{...}>` と定義したが、デフォルト値として空配列 `[]` を設定した際に型推論が `never[]` になり、後続のテストで型エラーが発生するケースがあった。

**解決策**: 明示的に `linkedProviders: [] as Array<{provider: string; email?: string; avatarUrl?: string}>` と型アサーションを付与。

---

## 4. 受け入れ基準

- [ ] セレクタ同期検証テストが PASS する
- [ ] harness ファイルに保守手順コメントが追加されている
- [ ] 既存の18テストが引き続き PASS する

---

## 5. 参照資料

| 資料                          | パス                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| settings-test-harness.ts      | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`                             |
| Phase 9 リスクレジスター R-02 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-9/risk-register.md` |
| Phase 3 M-01                  | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-3/gate-decision.md` |

---

## 6. 関連タスク

| タスクID                                                 | 関係                           |
| -------------------------------------------------------- | ------------------------------ |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 親タスク（発見元）             |
| UT-08-003                                                | INT-11~13 拡充（harness 利用） |
