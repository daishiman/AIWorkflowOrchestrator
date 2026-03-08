# electronAPI Mock 契約同期ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1076
```

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-08-R03-ELECTRON-API-MOCK-CONTRACT-SYNC                                |
| タスク名     | electronAPI Mock 契約同期ガード                                          |
| 分類         | テスト信頼性改善                                                         |
| 対象機能     | settings-test-harness.ts の electronAPI mock と実 IPC 契約の同期         |
| 優先度       | 中                                                                       |
| 見積もり規模 | 中規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | Phase 9 R-03（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK で settings-test-harness.ts に `createDefaultElectronApiKey()` を実装し、`apiKey.list()`, `apiKey.save()`, `apiKey.delete()`, `apiKey.validate()` の4メソッドのモックを提供した。このモックは IPC ハンドラの実際のレスポンス形式に基づいて設計されている。

Phase 9 の R-03 リスクとして「IPC 契約（ハンドラの引数・戻り値形式）が変更された場合、harness のモックレスポンスが実態と乖離し、統合テストが実環境と異なる振る舞いを検証するリスク」が識別されている。

### 1.2 問題点・課題

1. **契約ドリフト**: IPC ハンドラのレスポンス形式変更が harness に反映されず、テストが旧契約に基づいて PASS し続ける
2. **型安全性の欠如**: `MockElectronApiKey` の型定義が `ReturnType<typeof vi.fn>` であり、実際のレスポンス型との整合性が TypeScript で検証されない
3. **P48 再発リスク**: non-null assertion（`result.data!.providers`）が harness 内で暗黙的に前提とされている場合、実際のレスポンスで `data` が undefined になるケースを見逃す

### 1.3 放置した場合の影響

- IPC ハンドラのレスポンス形式変更時に、統合テストが旧レスポンスに基づいて PASS し続け、回帰バグを検出できない
- 実環境でのみ発生する TypeError が CI で検出されない
- harness のモック値と実装の乖離が蓄積し、統合テストの信頼性が根本的に低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

electronAPI mock のレスポンス形式と実際の IPC ハンドラのレスポンス形式の同期を、型レベルおよびテストレベルで保証する仕組みを構築する。

### 2.2 最終ゴール

- harness の mock レスポンス型が実際の IPC レスポンス型と型レベルで一致している
- IPC 契約変更時に harness の更新漏れを自動検出するテストが存在する

### 2.3 スコープ

#### 含むもの

- `MockElectronApiKey` の型定義を Preload 層の実型（`preload/types.ts`）と整合させる
- 契約同期検証テスト
- 型レベルの整合性チェック（`satisfies` 等）

#### 含まないもの

- IPC ハンドラ自体の変更
- 他の electronAPI メソッド（apiKey 以外）のモック化
- E2E テスト

### 2.4 成果物

- 型定義更新済み `settings-test-harness.ts`
- 契約同期検証テスト

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: 実 IPC レスポンス型の確認

```bash
grep -rn "apiKey" apps/desktop/src/preload/types.ts
grep -rn "apiKey\|api-key" apps/desktop/src/main/handlers/
```

#### Step 2: 型レベルの整合性確保

```typescript
import type { ElectronApiKey } from "../../../../preload/types";

// harness のモック型が実型を満たすことを検証
const _typeCheck: ElectronApiKey =
  createDefaultElectronApiKey() as unknown as ElectronApiKey;
// またはsatisfies を使用
```

#### Step 3: 契約同期テスト

```typescript
describe("electronAPI mock 契約同期", () => {
  it("list() のレスポンス形式が実契約と一致する", () => {
    const mock = createDefaultElectronApiKey();
    const result = mock.list();
    // レスポンス構造の検証
    expect(result).resolves.toHaveProperty("success");
    expect(result).resolves.toHaveProperty("data.providers");
  });
});
```

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: P48（non-null assertion による安全性偽装）

**問題**: ApiKeysSection が `result.data!.providers` で non-null assertion を使用していた場合、contextBridge 経由のレスポンスで `data` が undefined になるとランタイムエラーが発生する。harness のモックは常に `data` を返すため、この問題をテストで検出できなかった。

**解決策**: harness に `data` が undefined のケースを含むテストフィクスチャを追加。INT-04b で実装済みだが、契約同期検証として体系化する。

#### 苦戦箇所2: contextBridge の structured clone 制約

**問題**: Electron の contextBridge は structured clone でデータを転送するため、関数やクラスインスタンスは転送できない。IPC レスポンスの型定義と実際の structured clone 後の shape が異なる場合がある。

**解決策**: harness のモック値は plain object（structured clone 互換）で定義する。クラスインスタンスや関数を含めない。

#### 苦戦箇所3: Preload 型定義の二箇所管理（P32）

**問題**: IPC 関連の型定義は `packages/shared/src/agent/types.ts` と `apps/desktop/src/preload/types.ts` の2箇所に分散しており、片方のみ更新すると型不整合が発生する。

**解決策**: harness の型定義は Preload 層の型（`preload/types.ts`）を import して使用し、共有型の変更が自動的に反映されるようにする。

---

## 4. 受け入れ基準

- [ ] `MockElectronApiKey` の型が実 IPC レスポンス型と整合している
- [ ] 契約同期検証テストが PASS する
- [ ] 既存の18テストが引き続き PASS する
- [ ] structured clone 互換のモック値のみ使用されている

---

## 5. 参照資料

| 資料                          | パス                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| settings-test-harness.ts      | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`                             |
| Preload 型定義                | `apps/desktop/src/preload/types.ts`                                                                           |
| Phase 9 リスクレジスター R-03 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-9/risk-register.md` |
| P48 pitfall                   | `.claude/rules/06-known-pitfalls.md#P48`                                                                      |
| P32 pitfall                   | `.claude/rules/06-known-pitfalls.md#P32`                                                                      |
| F-ELECTRON-01                 | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                                       |

---

## 6. 関連タスク

| タスクID                                                 | 関係                             |
| -------------------------------------------------------- | -------------------------------- |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 親タスク（発見元）               |
| UT-08-R02-SETTINGS-HARNESS-SELECTOR-SYNC-GUARD           | セレクタ同期ガード（並列タスク） |
| UT-08-004                                                | ハーネスパターン仕様化           |
