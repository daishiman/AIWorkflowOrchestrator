# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

PR #1036/#1038 で実装済みの防御ガード（`Array.isArray(result.data.providers)` + `window.electronAPI?.apiKey` 存在チェック）に対し、Phase 4 のテスト（RED-01〜RED-03b）ではカバーしきれていない残存 gap を埋める。

## 背景

既存テスト 6 ケース（RED-01〜RED-03b）は主要な防御パスをカバーしているが、以下の gap が残存している:

1. `result.data` 自体が `undefined`/`null`（`result.success === true && result.data === undefined`）
2. `result.data.providers` が空配列 `[]`
3. `providers` 配列要素が malformed（必須プロパティ欠落）
4. `apiKey.list()` が reject（throw）した場合
5. `profileHandlers.ts` の `identities ?? []` パターンが `Array.isArray` 未使用

## 実行タスク

### Task 1: 残存 gap テストケースの追加

以下のテストケースを `ApiKeysSection/__tests__/ApiKeysSection.test.tsx` に追加する。

#### EXP-01: `result.data` が undefined

```typescript
// result.success === true だが result.data が undefined
// 期待: providers を空配列としてフォールバック表示、console.warn 出力
mockApiKeyList.mockResolvedValue({ success: true, data: undefined });
```

**検証項目**:

- `Array.isArray(result.data?.providers)` が `false` を返す
- 空のプロバイダー一覧が表示される
- エラーメッセージではなく「プロバイダーが見つかりません」的な表示

#### EXP-02: `result.data.providers` が空配列

```typescript
// providers は配列だが要素 0 件
mockApiKeyList.mockResolvedValue({
  success: true,
  data: { providers: [], registeredCount: 0, totalCount: 0 },
});
```

**検証項目**:

- 空の一覧が正常表示される（エラーではない）
- 「API キーが未登録です」のような案内が表示される

#### EXP-03: providers 配列要素が malformed

```typescript
// displayName / status が欠落した不完全な ProviderStatus
mockApiKeyList.mockResolvedValue({
  success: true,
  data: {
    providers: [
      { provider: "openai" }, // displayName, status, lastValidatedAt 欠落
      {
        provider: "anthropic",
        displayName: "Anthropic",
        status: "registered",
        lastValidatedAt: null,
      },
    ],
    registeredCount: 1,
    totalCount: 2,
  },
});
```

**検証項目**:

- malformed 要素が安全にスキップまたはデフォルト値で表示される
- 正常な要素は正しく表示される
- コンソールに警告ログが出力される

#### EXP-04: `apiKey.list()` が reject

```typescript
// IPC 呼び出し自体が例外を送出
mockApiKeyList.mockRejectedValue(new Error("IPC channel destroyed"));
```

**検証項目**:

- エラー状態の UI が表示される（`aria-invalid` or エラーメッセージ）
- 再試行ボタンが表示される
- 画面全体がクラッシュしない

### Task 2: テストデータファクトリの導入

`testing-component-patterns.md` 準拠のファクトリパターンを導入する。

```typescript
// テストデータファクトリ（testing-component-patterns.md 準拠）
function createProviderStatus(
  overrides: Partial<ProviderStatus> = {},
): ProviderStatus {
  return {
    provider: "openai" as AIProvider,
    displayName: "OpenAI",
    status: "not_registered" as RegistrationStatus,
    lastValidatedAt: null,
    ...overrides,
  };
}

function createProviderListResult(
  overrides: Partial<ProviderListResult> = {},
): ProviderListResult {
  return {
    providers: [createProviderStatus()],
    registeredCount: 0,
    totalCount: 1,
    ...overrides,
  };
}
```

### Task 3: profileHandlers 防御パターン統一テスト

`profileHandlers.ts` の `identities ?? []` パターンが `Array.isArray` 未使用であることを検証するテストを追加する。

```typescript
// profileHandlers の identities が非配列の場合のフォールバック確認
// identities が null → [] にフォールバック（nullish coalescing）
// identities が "string" → ?? では防御できない（Array.isArray 必要）
```

**検証項目**:

- `identities` が `null` → 空配列フォールバック（OK）
- `identities` が `undefined` → 空配列フォールバック（OK）
- `identities` が非配列値（例: `"string"` or `42`）→ `??` では防御不可（gap として記録）

## 参照資料

### 実装・証跡

| 資料名             | パス                                                                                              | 用途                                       |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Renderer Component | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | providers 正規化の主対象                   |
| Renderer Tests     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 追加テストの配置先                         |
| Main IPC           | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | list 契約の確認先                          |
| Main IPC           | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | identities 防御パターンの確認先            |
| Shared Types       | `packages/shared/types/api-keys.ts`                                                               | ProviderStatus / ProviderListResult 型定義 |

### システム仕様

| 資料名                     | パス                                                                              | 用途                           |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストデータファクトリパターン |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | aria-invalid, aria-describedby |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | VALIDATION_ERROR = 1000番台    |
| ipc-contract-checklist     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P42/P44/P45 統合チェック       |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Renderer境界4層防御（v1.13.0） |
| interfaces-auth            | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | IPCResponse<T> envelope        |
| known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                              | P42, P48 準拠チェック          |

### 前提 Phase 成果物

| 資料名             | パス               | 用途                       |
| ------------------ | ------------------ | -------------------------- |
| Phase 4 テスト設計 | `outputs/phase-4/` | RED-01〜RED-03b の fixture |
| Phase 5 実装       | `outputs/phase-5/` | 実装済み防御ガードの確認   |

## 型情報（参照用）

```typescript
// packages/shared/types/api-keys.ts
interface ProviderStatus {
  provider: AIProvider;
  displayName: string;
  status: RegistrationStatus;
  lastValidatedAt: string | null;
}

interface ProviderListResult {
  providers: ProviderStatus[];
  registeredCount: number;
  totalCount: number;
}

// IPCResponse envelope (interfaces-auth.md)
interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}

interface IPCError {
  code: string;
  message: string;
  guidance?: string;
}
```

## 実行手順

1. Phase 4 の RED-01〜RED-03b テストを確認し、カバー済みパスを把握する
2. テストデータファクトリ `createProviderStatus()` / `createProviderListResult()` を作成する
3. EXP-01〜EXP-04 のテストケースを追加する
4. profileHandlers の identities 防御パターン gap を記録する
5. 追加テストの目的と gap を fixture-plan に記録する

## 成果物

| 成果物       | パス                                           | 説明                                        |
| ------------ | ---------------------------------------------- | ------------------------------------------- |
| 回帰拡張計画 | `outputs/phase-6/regression-expansion-plan.md` | EXP-01〜EXP-04 の追加テスト仕様             |
| fixture 計画 | `outputs/phase-6/fixture-plan.md`              | テストデータファクトリと再利用 fixture      |
| gap 記録     | `outputs/phase-6/gap-record.md`                | profileHandlers identities 防御パターン gap |

## 完了条件

- [ ] EXP-01〜EXP-04 の 4 テストケースが追加され全 PASS
- [ ] テストデータファクトリ `createProviderStatus()` が導入されている
- [ ] profileHandlers の identities 防御パターン gap が文書化されている
- [ ] Phase 4 の fixture が regression fixture へ昇格されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 7: テストカバレッジ確認

## 統合テスト連携

- 本Phaseの結果は `apps/desktop` の対象Vitest実行（`apiKeyHandlers.list` / `profileHandlers.identities` / `ApiKeysSection`）と連動して判定する。
- Phase 11 ではスクリーンショット証跡（TC-11-01〜03）を統合テスト結果と同じ実装リビジョンで取得する。
