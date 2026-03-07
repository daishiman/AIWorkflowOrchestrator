# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| 更新日     | 2026-03-07                                       |
| ステータス | 未実施                                           |

## 目的

Phase 2 の設計（`normalizeProviders` 正規化関数、Main 側バリデーション、profileHandlers パターン統一）に対する Red テストを作成し、GAP-01〜06 の各異常ケースを失敗として固定する。

## 背景

### 既存テストの網羅範囲

PR #1036/#1038 で以下の6テストケースが **既に実装済み**:

| テスト ID | 異常ケース                                            | ステータス |
| --------- | ----------------------------------------------------- | ---------- |
| RED-01    | `result.data.providers` が非配列（オブジェクト `{}`） | 既実装     |
| RED-02    | `result.data.providers` が `undefined`                | 既実装     |
| RED-03a   | `window.electronAPI` が `undefined`                   | 既実装     |
| RED-03b   | `window.electronAPI.apiKey` が `undefined`            | 既実装     |
| RED-04    | `result.data.providers` が `null`                     | 既実装     |
| RED-05    | `result.data.providers` が `string` 型                | 既実装     |

### 残存 gap 対応テスト（本 Phase で追加）

| テスト ID   | Gap ID | 異常ケース                                                           | テストファイル                            |
| ----------- | ------ | -------------------------------------------------------------------- | ----------------------------------------- |
| GAP-TEST-01 | GAP-01 | `result.data` 自体が `undefined`                                     | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-02 | GAP-01 | `result.data` が `null`                                              | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-03 | GAP-02 | `result.data.providers` が空配列 `[]` — UI フィードバック表示確認    | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-04 | GAP-03 | `providers` 配列要素の `provider` フィールド欠損                     | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-05 | GAP-03 | `providers` 配列要素の `status` フィールド欠損                       | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-06 | GAP-03 | `providers` 配列に正常要素と malformed 要素が混在 — 正常要素のみ表示 | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-07 | GAP-04 | `apiKey.list()` が reject（Promise rejection） — エラー表示確認      | `ApiKeysSection.test.tsx`                 |
| GAP-TEST-08 | GAP-05 | Main `apiKeyHandlers` で非配列 providers を空配列に正規化            | `apiKeyHandlers.test.ts`（新規 or 既存）  |
| GAP-TEST-09 | GAP-06 | `profileHandlers` の `identities` が非配列 — `Array.isArray` で防御  | `profileHandlers.test.ts`（新規 or 既存） |

## Agent Team 編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 4 の責務                           |
| ----------------------- | -------------------------------- | ---------- | ---------------------------------------- |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | GAP-TEST-01〜07 の Renderer テスト作成   |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | GAP-TEST-08〜09 の Main テスト作成       |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | テストデータファクトリとフィクスチャ設計 |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | 全テストケースの整合性確認               |

## 実行タスク

### Task 1: テストデータファクトリ設計（testing-component-patterns.md 準拠）

```typescript
// テストデータファクトリ — ProviderStatus の正常値生成
function createMockProviderStatus(
  overrides?: Partial<ProviderStatus>,
): ProviderStatus {
  return {
    provider: "anthropic" as AIProvider,
    displayName: "Anthropic",
    status: "registered" as RegistrationStatus,
    lastValidatedAt: "2026-03-06T00:00:00Z",
    ...overrides,
  };
}

// テストデータファクトリ — IPCResponse<ProviderListResult> の正常値生成
function createMockListResponse(
  overrides?: Partial<ProviderListResult>,
): IPCResponse<ProviderListResult> {
  const providers = overrides?.providers ?? [createMockProviderStatus()];
  return {
    success: true,
    data: {
      providers,
      registeredCount: overrides?.registeredCount ?? providers.length,
      totalCount: overrides?.totalCount ?? 3,
      ...overrides,
    },
  };
}
```

### Task 2: Renderer 異常系テスト（GAP-TEST-01〜07）

#### GAP-TEST-01: `result.data` が `undefined`

```typescript
it("result.data が undefined の場合、fallback 表示して TypeError を送出しない", async () => {
  mockApiKeyList.mockResolvedValue({ success: true, data: undefined });
  // → providers 表示が空 or fallback メッセージが表示される
  // → TypeError が発生しない
});
```

#### GAP-TEST-02: `result.data` が `null`

```typescript
it("result.data が null の場合、fallback 表示して TypeError を送出しない", async () => {
  mockApiKeyList.mockResolvedValue({ success: true, data: null });
  // → providers 表示が空 or fallback メッセージが表示される
});
```

#### GAP-TEST-03: 空配列時のフィードバック

```typescript
it("providers が空配列の場合、未登録メッセージを表示する", async () => {
  mockApiKeyList.mockResolvedValue(createMockListResponse({ providers: [] }));
  // → 「プロバイダーが登録されていません」等のメッセージが表示される
});
```

#### GAP-TEST-04〜06: 要素 shape malformed

```typescript
it("provider フィールド欠損の要素をスキップしてクラッシュしない", async () => {
  const malformed = { status: "registered", displayName: "Test" }; // provider 欠損
  mockApiKeyList.mockResolvedValue(
    createMockListResponse({
      providers: [createMockProviderStatus(), malformed as any],
    }),
  );
  // → 正常要素のみ表示、malformed 要素はスキップ
});
```

#### GAP-TEST-07: Promise rejection

```typescript
it("apiKey.list() が reject した場合、エラー表示して SettingsView は継続描画", async () => {
  mockApiKeyList.mockRejectedValue(new Error("Network error"));
  // → エラーメッセージが表示される
  // → SettingsView 全体は描画を継続
});
```

### Task 3: Main Process テスト（GAP-TEST-08〜09）

#### GAP-TEST-08: apiKeyHandlers providers バリデーション

```typescript
it("providers が非配列の場合、空配列に正規化してレスポンスを返す", async () => {
  // apiKeyHandlers 内部で providers が object {} の場合
  // → { success: true, data: { providers: [], ... } } を返す
});
```

#### GAP-TEST-09: profileHandlers Array.isArray 統一

```typescript
it("identities が非配列の場合、Array.isArray で防御し空配列を返す", async () => {
  // profileHandlers の identities が null/undefined/object の場合
  // → 空配列として処理される
});
```

### Task 4: フィクスチャ設計

| フィクスチャ名              | テストケース対応 | 内容                                                                            |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `FIXTURE_DATA_UNDEFINED`    | GAP-TEST-01      | `{ success: true, data: undefined }`                                            |
| `FIXTURE_DATA_NULL`         | GAP-TEST-02      | `{ success: true, data: null }`                                                 |
| `FIXTURE_EMPTY_PROVIDERS`   | GAP-TEST-03      | `{ success: true, data: { providers: [], registeredCount: 0, totalCount: 3 } }` |
| `FIXTURE_MALFORMED_ELEMENT` | GAP-TEST-04〜06  | providers 配列内に必須フィールド欠損要素を含む                                  |
| `FIXTURE_REJECTION`         | GAP-TEST-07      | `mockRejectedValue(new Error("Network error"))`                                 |

## 参照資料

### 実装・証跡

| 資料名         | パス                                                                                              | 用途                                          |
| -------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Renderer Tests | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | GAP-TEST-01〜07 追加先                        |
| Main IPC       | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | GAP-TEST-08 対象                              |
| Main IPC       | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | GAP-TEST-09 対象                              |
| Shared Types   | `packages/shared/types/api-keys.ts`                                                               | `ProviderStatus`, `ProviderListResult` 型参照 |

### システム仕様

| 資料名                     | パス                                                                              | 用途                                     |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストデータファクトリパターン準拠       |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ基準（Line 80%+, Branch 60%+） |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | 空配列・エラー時の表示テキスト確認       |
| known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                              | P39: happy-dom 環境 fireEvent 使用必須   |

### 前提Phase成果物

| 資料名         | パス               | 用途                                        |
| -------------- | ------------------ | ------------------------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | AC-01〜07、GAP-01〜06 を参照                |
| Phase 2 成果物 | `outputs/phase-2/` | 設計方針（DD-01〜04）、正規化関数設計を参照 |
| Phase 3 成果物 | `outputs/phase-3/` | レビュー結果・ゲート判定を参照              |

## 実行手順

1. Phase 2 の設計（`normalizeProviders`、Main バリデーション、profileHandlers 統一）から失敗させる条件を GAP-TEST-01〜09 として切り出す。
2. テストデータファクトリ（`createMockProviderStatus`, `createMockListResponse`）を定義する。
3. Renderer テスト（GAP-TEST-01〜07）を `ApiKeysSection.test.tsx` に追加する。
4. Main テスト（GAP-TEST-08〜09）を対応するテストファイルに追加する。
5. フィクスチャと テストケース ID の対応を確認する。

## テスト環境注意事項

- **P39 準拠**: happy-dom 環境では `userEvent` ではなく `fireEvent` を使用する
- **P40 準拠**: テスト実行は `cd apps/desktop && pnpm vitest run` で実行する
- **P9 準拠**: テスト間で状態を共有しない（`beforeEach` でモックをリセット）

## 統合テスト連携

- GAP-TEST-01〜07 は同一の `createMockListResponse` ファクトリを共有し、各テストで overrides を変えてパターンを検証する
- GAP-TEST-08〜09 は独立した unit test として Main Process のバリデーションロジックを検証する
- 既存 RED-01〜RED-03b テストと新規 GAP-TEST の fixture が競合しないことを確認する

## 多角的チェック観点

| 観点     | 確認内容                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| 防御境界 | GAP-TEST-01〜07 が `normalizeProviders` の各防御ポイントに1:1で対応しているか       |
| 契約監査 | テストの mock レスポンスが `IPCResponse<ProviderListResult>` の型に準拠しているか   |
| UX       | GAP-TEST-03（空配列）・GAP-TEST-07（rejection）で UI フィードバックを検証しているか |
| 回帰耐性 | 既存 RED-01〜RED-03b テストが新規テスト追加で破壊されないか                         |

## 成果物

| 成果物         | パス                                        | 説明                                             |
| -------------- | ------------------------------------------- | ------------------------------------------------ |
| Red テスト計画 | `outputs/phase-4/red-test-plan.md`          | GAP-TEST-01〜09 のテストケース一覧とフィクスチャ |
| 統合ケース     | `outputs/phase-4/integration-test-cases.md` | ファクトリ共有とテスト間独立性の設計             |

## 完了条件

- [ ] GAP-TEST-01〜09 の9ケースが Red テストとして定義されている
- [ ] テストデータファクトリ（`createMockProviderStatus`, `createMockListResponse`）が設計されている
- [ ] フィクスチャ名とテストケース ID が対応付いている
- [ ] テスト環境注意事項（P39/P40/P9 準拠）が明記されている
- [ ] Phase 5 がそのまま実装に入れる粒度の changed-files-plan を参照できる
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既存テスト（RED-01〜RED-03b）の網羅範囲確認
2. テストデータファクトリ設計
3. Renderer テスト（GAP-TEST-01〜07）の設計
4. Main テスト（GAP-TEST-08〜09）の設計
5. フィクスチャ設計と ID 対応付け
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 5: 実装
