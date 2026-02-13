# Phase 4: テスト作成 — 型安全性検証テストの設計・作成（TDD Red）

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION                           |
| Phase番号  | 4                                                          |
| Phase名    | テスト作成                                                 |
| 目的       | 型安全性を検証するテストケースの設計と作成（TDD Red 状態） |
| 前提Phase  | Phase 3（設計レビューゲート PASS）                         |
| 後続Phase  | Phase 5（実装）                                            |
| ステータス | 未実施                                                     |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration                  |
| 作成日     | 2026-02-12                                                 |

---

## 目的

Phase 2-3 で確定した設計に基づき、`SkillExecutor.ts` の `as any` 除去後の型安全性を検証するテストケースを設計・作成する。TDD の Red フェーズとして、実装前にテストを先行して作成し、テストが失敗する（Red）状態を確認する。既存の 6 つのテストファイルとの整合性を保ちつつ、型チェックに特化した新規テストファイルを追加する。

---

## 依存関係

| 依存元  | 成果物                                       | 用途                            |
| ------- | -------------------------------------------- | ------------------------------- |
| Phase 1 | `outputs/phase-1/requirements-definition.md` | FR/NFR の参照                   |
| Phase 1 | `outputs/phase-1/acceptance-criteria.md`     | 受入基準 AC-001〜AC-007 の参照  |
| Phase 2 | `outputs/phase-2/architecture-design.md`     | 型定義更新方針・import パターン |
| Phase 2 | `outputs/phase-2/type-mapping.md`            | 型マッピング表の参照            |
| Phase 3 | `outputs/phase-3/design-review-result.md`    | レビュー結果・MINOR 指摘の確認  |

---

## 実行タスク

### Task 1: テストケース設計 — 型安全性の検証戦略

#### 検証軸

本タスクでは以下の 3 軸でテストケースを設計する:

| 検証軸                 | 検証内容                                                         | 手法                           |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------ |
| コンパイル時型チェック | `as any` 除去後に TypeScript が正しい型を推論するか              | `@ts-expect-error` テスト      |
| 動的 import 型解決     | `import()` 式の戻り値が `any` でなく具体的なモジュール型になるか | モック経由のシグネチャ検証     |
| SDK モック型互換性     | テスト用モックが更新後の型定義と互換性を持つか                   | モック関数のシグネチャ型テスト |

#### テストケース一覧

| TC-ID  | テストケース名                                         | 検証軸                 | 受入基準対応   | 優先度 |
| ------ | ------------------------------------------------------ | ---------------------- | -------------- | ------ |
| TC-001 | callSDKQuery の戻り値型が正しいストリーム型であること  | 動的 import 型解決     | AC-003         | 必須   |
| TC-002 | SDK モックの query 関数が正しいシグネチャであること    | SDK モック型互換性     | AC-005         | 必須   |
| TC-003 | SDKQueryOptions が query() の options と互換であること | コンパイル時型チェック | AC-003, AC-004 | 必須   |
| TC-004 | 不正な引数型がコンパイルエラーになること               | コンパイル時型チェック | AC-004         | 必須   |
| TC-005 | query() にプロンプト未指定でコンパイルエラーになること | コンパイル時型チェック | AC-004         | 推奨   |
| TC-006 | 既存テスト 6 ファイルが変更なしで PASS すること        | 後方互換性             | AC-005         | 必須   |

#### 成果物

`outputs/phase-4/test-specification.md` にテストケース設計書を記録する。

---

### Task 2: 型安全テスト作成 — `SkillExecutor.sdk-types.test.ts` 新規作成

#### テストファイル配置

```
apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

#### TC-001: callSDKQuery の戻り値型が正しいストリーム型であること

```typescript
describe("SDK型安全性テスト", () => {
  describe("TC-001: callSDKQuery の戻り値型", () => {
    it("戻り値が stream() メソッドを持つオブジェクトであること", async () => {
      // callSDKQuery の戻り値型は { stream: () => AsyncIterable<SDKMessage> }
      // モック経由で呼び出し、stream() が AsyncIterable を返すことを確認
    });
  });
});
```

**検証内容**:

- `callSDKQuery()` の戻り値が `{ stream: () => AsyncIterable<SDKMessage> }` 型であること
- `stream()` を呼び出すと `AsyncIterable` が取得できること
- `SDKMessage` の各プロパティ（`type`, `content`, `tool_use`, `error`）が存在すること

#### TC-002: SDK モックの query 関数が正しいシグネチャでモック化されること

```typescript
describe("TC-002: SDK モックの query 関数シグネチャ", () => {
  it("query が prompt と options を受け取るシグネチャであること", () => {
    // モックの query 関数が { prompt: string, options: { apiKey, tools, permissionMode, signal } }
    // 形式の引数を受け取ることを検証
  });
});
```

**検証内容**:

- `query()` が `{ prompt: string, options: QueryCallOptions }` 形式の引数を受け取ること
- `options.apiKey` が `string` 型であること
- `options.tools` が `string[]` 型（省略可能）であること
- `options.permissionMode` が `string` 型（省略可能）であること
- `options.signal` が `AbortSignal` 型（省略可能）であること

#### TC-003: SDKQueryOptions の型が query() の options 引数と互換であること

```typescript
describe("TC-003: SDKQueryOptions と QueryCallOptions の互換性", () => {
  it("SDKQueryOptions のプロパティが QueryCallOptions のサブセットであること", () => {
    // SDKQueryOptions { tools, permissionMode, signal, timeout } が
    // query() の options 引数と構造的に互換であることを確認
  });
});
```

**検証内容**:

- `SDKQueryOptions.tools` → `QueryCallOptions.tools` への代入互換性
- `SDKQueryOptions.permissionMode` → `QueryCallOptions.permissionMode` への代入互換性
- `SDKQueryOptions.signal` → `QueryCallOptions.signal` への代入互換性
- `timeout` は SDK 側に渡されない（SkillExecutor ローカルのみ）ことを確認

#### TC-004: 不正な引数がコンパイルエラーになること（@ts-expect-error テスト）

```typescript
describe("TC-004: 不正な引数の型チェック", () => {
  it("tools に number[] を渡すとコンパイルエラーになること", () => {
    // @ts-expect-error — tools は string[] であり number[] は不正
    // query({ prompt: "test", options: { apiKey: "key", tools: [123] } });
  });

  it("apiKey に number を渡すとコンパイルエラーになること", () => {
    // @ts-expect-error — apiKey は string であり number は不正
    // query({ prompt: "test", options: { apiKey: 123 } });
  });
});
```

**検証内容**:

- `@ts-expect-error` で型エラーが発生することをコンパイル時に保証
- `tools` に `number[]` を渡した場合の型エラー検出
- `apiKey` に `number` を渡した場合の型エラー検出
- `prompt` を省略した場合の型エラー検出

---

### Task 3: 既存テスト互換性確認 — 6 テストファイルの PASS 計画

#### 既存テストファイル一覧

| No. | ファイル名                             | テスト内容               | 変更要否 |
| --- | -------------------------------------- | ------------------------ | -------- |
| 1   | `SkillExecutor.test.ts`                | 基本機能テスト           | 不要     |
| 2   | `SkillExecutor.auth.test.ts`           | 認証関連テスト           | 不要     |
| 3   | `SkillExecutor.retry.test.ts`          | リトライロジックテスト   | 不要     |
| 4   | `SkillExecutor.integration.test.ts`    | 統合テスト               | 不要     |
| 5   | `SkillExecutor.permission.test.ts`     | 権限管理テスト           | 不要     |
| 6   | `SkillExecutor.type-migration.test.ts` | 型マイグレーションテスト | 不要     |

#### 互換性確認計画

1. Phase 5 実装完了後に全 6 ファイルを `pnpm vitest run` で実行する
2. モックファイル（`apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts`）の更新により、モック型が新型定義と一致する必要がある
3. 既存テストコード自体の修正は**不要**であることを確認する（NFR-001 準拠）
4. モックファイルの更新で既存テストの動作が変わらないことを検証する

#### 既知の落とし穴への対策

| Pitfall ID | 内容                               | 対策                                                     |
| ---------- | ---------------------------------- | -------------------------------------------------------- |
| P21        | DI 追加時のモック大規模修正        | 本タスクは DI 追加なし。型定義のみの変更のため影響は軽微 |
| P9         | モジュールスコープ変数のリーク     | 新規テストファイルは `beforeEach` で状態をリセットする   |
| P11        | PostToolUse フックによる Edit 失敗 | 大量編集後は `git diff --stat` で変更数を検証する        |

---

## 参照資料

| 参照資料                       | パス                                                                                  | 内容                 |
| ------------------------------ | ------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義書             | `outputs/phase-1/requirements-definition.md`                                          | FR/NFR の参照        |
| Phase 1 受入基準書             | `outputs/phase-1/acceptance-criteria.md`                                              | AC-001〜AC-007       |
| Phase 2 アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`                                              | 型定義更新方針       |
| Phase 2 型マッピング表         | `outputs/phase-2/type-mapping.md`                                                     | 型の対応表           |
| Phase 3 設計レビュー結果       | `outputs/phase-3/design-review-result.md`                                             | ゲート判定結果       |
| SkillExecutor 実装             | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                               | 修正対象ファイル     |
| SDK 型定義（共有）             | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`                       | 現行の型宣言ファイル |
| SDK モックファイル             | `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts`                   | テスト用モック       |
| 既存テスト: 基本               | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`                | 既存テストの参照     |
| 既存テスト: 認証               | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`           | 既存テストの参照     |
| 既存テスト: リトライ           | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`          | 既存テストの参照     |
| 既存テスト: 統合               | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts`    | 既存テストの参照     |
| 既存テスト: 権限               | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`     | 既存テストの参照     |
| 既存テスト: 型マイグレーション | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts` | 既存テストの参照     |

---

## 実行手順

### Step 1: テストケース設計書の作成

1. Task 1 の検証戦略（3 軸）をテストケース設計書としてまとめる
2. 各テストケース（TC-001〜TC-006）の Given-When-Then を明記する
3. `outputs/phase-4/test-specification.md` に出力する

### Step 2: 新規テストファイルの作成

1. `SkillExecutor.sdk-types.test.ts` を作成する
2. TC-001〜TC-004 のテストコードを実装する
3. TC-005 のテストコードを実装する（推奨）
4. `beforeEach` で状態をリセットし、テスト間の独立性を保証する（P9 対策）

### Step 3: テスト実行確認（Red 状態）

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` を実行する
2. 型定義がまだ更新されていないため、TC-001〜TC-003 が失敗する（Red 状態）ことを確認する
3. TC-004 の `@ts-expect-error` テストは、`as any` が存在する間は型エラーが出ないため、`@ts-expect-error` 自体が不要なエラーとして検出される可能性がある

### Step 4: 既存テスト PASS 確認

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/` で既存 6 ファイルを実行する
2. 新規テストファイル追加が既存テストに影響しないことを確認する
3. 全既存テストが PASS することを記録する

---

## 成果物

| 成果物               | 説明                                    | 配置先                                                                           |
| -------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| テストケース設計書   | TC-001〜TC-006 の設計と Given-When-Then | `outputs/phase-4/test-specification.md`                                          |
| 型安全テストファイル | 新規テスト（TDD Red 状態）              | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` |

---

## 統合テスト連携

本タスクは型定義のみの変更であり、新規統合テストシナリオの作成は不要。既存の統合テスト（SkillExecutor 統合テストファイル）が型変更後も PASS することを Phase 5 で確認する。

---

## 完了条件

- [ ] テストケース TC-001〜TC-006 が設計書に記載されている
- [ ] `SkillExecutor.sdk-types.test.ts` が新規作成されている
- [ ] TC-001〜TC-004 のテストコードが実装されている
- [ ] TC-005 のテストコードが実装されている（推奨）
- [ ] テスト実行が Red 状態であることが確認されている（Phase 5 実装前のため）
- [ ] 既存 6 テストファイルが新規テスト追加の影響なく PASS している
- [ ] テスト間で状態が共有されない設計になっている（`beforeEach` でリセット）
- [ ] テストケース設計書が `outputs/phase-4/test-specification.md` に配置されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 5: 実装** — `as any` 除去と型安全な SDK インポートの実装（TDD Green 状態）
