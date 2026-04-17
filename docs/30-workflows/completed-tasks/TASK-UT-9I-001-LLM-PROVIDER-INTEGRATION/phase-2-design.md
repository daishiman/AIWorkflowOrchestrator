# Phase 2: 設計

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 2                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 1 完了                                |
| 後続Phase  | Phase 3                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

LLM プロバイダ連携の実装アーキテクチャを設計し、Phase 4 以降の実装が開始できる状態にする。

## 実行タスク

1. LLMClient モジュール構成を設計する
2. DI 注入パターンを設計する（LLMDocQueryAdapter の委譲箇所と ipc/index.ts の薄い wiring を特定）
3. エラー正規化設計を記述する
4. 型定義配置方針（`@repo/shared` 対応）を確定する
5. validation matrix を定義する

## 参照資料

| 資料名                        | パス                                                                                | 用途                 |
| ----------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義              | `docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION/phase-1-requirements.md` | AC・エラーコード参照 |
| SkillDocGenerator             | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                         | DI境界・LLMQueryFn型 |
| IPC登録（LLMDocQueryAdapter） | `apps/desktop/src/main/ipc/index.ts`                                                | 現行 wiring の確認   |
| IPC skillHandlers             | `apps/desktop/src/main/ipc/skillHandlers.ts`                                        | ハンドラ修正対象     |
| Preload公開API                | `apps/desktop/src/preload/index.ts`                                                 | 型契約の公開境界     |
| IPC契約チェックリスト         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`       | 契約検証基準         |

## 実行手順

1. 既存の `services/` ディレクトリ構成を確認し、`services/llm/` の配置を決定する
2. `LLMClient` インターフェースを設計する（Facade パターン）
3. `AnthropicProvider` 実装設計を記述する
4. `LLMDocQueryAdapter.ts` の委譲箇所と `ipc/index.ts` の薄い wiring 方針を設計する
5. エラー正規化ロジックの設計を記述する
6. 型定義配置方針テーブルを作成する

## アーキテクチャ設計

### モジュール構成

```
apps/desktop/src/main/
├── services/
│   └── llm/                          # 新規
│       ├── LLMClient.ts              # 新規: Facade インターフェース + 実装
│       ├── providers/
│       │   └── AnthropicProvider.ts  # 新規: Anthropic API プロバイダ
│       └── __tests__/
│           └── LLMClient.test.ts     # 新規: ユニットテスト
└── ipc/
    └── index.ts                      # 変更なし: LLMDocQueryAdapter を登録
```

### LLMClient インターフェース設計

```typescript
// apps/desktop/src/main/services/llm/LLMClient.ts

export interface ILLMClient {
  query(prompt: string): Promise<LLMQueryResult>;
}

export type LLMQueryResult =
  | { success: true; content: string }
  | {
      success: false;
      errorCode: DocErrorCode;
      message: string;
      retryable: boolean;
    };

export type DocErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";
```

### DI注入設計（LLMDocQueryAdapter の委譲方針）

```typescript
const adapter = new LLMDocQueryAdapter(
  () => authKeyService.getKey(),
  "anthropic",
);
const queryFn: LLMQueryFn = async (prompt: string) => {
  const result = await adapter.query(prompt);
  if (result.success && result.data !== undefined) {
    return { content: result.data };
  }
  throw new Error(result.error?.message ?? "LLM query failed");
};
const skillDocGenerator = new SkillDocGeneratorCls(queryFn, skillFileManager);

// 委譲先の実装イメージ
const llmClient = new LLMClient({
  provider: "anthropic",
  apiKey: authKeyService.getKey(),
  model: "claude-haiku-4-5-20251001",
  timeoutMs: 30_000,
  maxRetries: 3,
});
```

### エラー正規化設計

```typescript
// skillHandlers.ts でのエラー正規化
// 現行: { success: false, error: "Internal error" }
// 拡張: { success: false, error: string, errorCode?: DocErrorCode, retryable?: boolean }

function normalizeDocError(error: unknown): {
  success: false;
  error: string;
  errorCode: DocErrorCode;
  retryable: boolean;
} {
  if (error instanceof LLMQueryError) {
    const userMessages: Record<DocErrorCode, string> = {
      API_KEY_MISSING:
        "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
      API_KEY_INVALID: "APIキーが無効です。正しいAPIキーを設定してください。",
      RATE_LIMIT:
        "リクエスト制限に達しました。しばらく待ってから再試行してください。",
      SERVER_ERROR: "サーバーエラーが発生しました。再試行してください。",
      TIMEOUT: "タイムアウトしました。再試行してください。",
      NETWORK_ERROR:
        "ネットワークエラーが発生しました。接続を確認してください。",
      INTERNAL_ERROR: "内部エラーが発生しました。",
    };
    const retryableErrors: DocErrorCode[] = [
      "RATE_LIMIT",
      "SERVER_ERROR",
      "TIMEOUT",
      "NETWORK_ERROR",
    ];
    return {
      success: false,
      error: userMessages[error.code],
      errorCode: error.code,
      retryable: retryableErrors.includes(error.code),
    };
  }
  return {
    success: false,
    error: "内部エラーが発生しました。",
    errorCode: "INTERNAL_ERROR",
    retryable: false,
  };
}
```

### 型定義配置方針テーブル

| 型名             | 現在の配置                      | 新配置方針                                    | 理由                          |
| ---------------- | ------------------------------- | --------------------------------------------- | ----------------------------- |
| `LLMQueryFn`     | `SkillDocGenerator.ts` L18-19   | 現状維持（Main Process 内部）                 | Preload/Renderer から参照なし |
| `DocErrorCode`   | 未定義                          | `services/llm/LLMClient.ts` に新規定義        | Main Process 内部使用のみ     |
| `LLMQueryResult` | 未定義                          | `services/llm/LLMClient.ts` に新規定義        | Main Process 内部使用のみ     |
| IPC返却型        | `skillHandlers.ts` 内インライン | `skillHandlers.ts` に `DocErrorCode` をimport | Preload 側は現行型を維持      |

**型ドリフト防止チェック**:

```bash
grep -rn "interface ILLMClient\|type DocErrorCode" packages/ apps/
```

### Validation Matrix

| コマンド                                                                                        | 期待結果      | Phase |
| ----------------------------------------------------------------------------------------------- | ------------- | ----- |
| `pnpm --filter @repo/desktop exec tsc --noEmit`                                                 | エラー0       | 5, 9  |
| `pnpm --filter @repo/desktop exec vitest run src/main/services/llm/`                            | グリーン      | 5, 6  |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts` | グリーン      | 5, 6  |
| `pnpm --filter @repo/desktop exec vitest run --coverage`                                        | 新規行80%以上 | 7     |

## 実装ファイル一覧

### 新規作成

| ファイルパス                                                        | 種別 | 説明                            |
| ------------------------------------------------------------------- | ---- | ------------------------------- |
| `apps/desktop/src/main/services/llm/LLMClient.ts`                   | 新規 | LLMクライアントFacade           |
| `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts` | 新規 | Anthropic API プロバイダ実装    |
| `apps/desktop/src/main/services/llm/__tests__/LLMClient.test.ts`    | 新規 | ユニットテスト                  |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.test.ts`    | 新規 | IPC統合テスト（エラーパス含む） |

### 修正対象

| ファイルパス                                                 | 修正内容                                 |
| ------------------------------------------------------------ | ---------------------------------------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` | stub 実装を `LLMClient` 委譲に置換       |
| `apps/desktop/src/main/ipc/index.ts`                         | 変更なし（薄い wiring を維持）           |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | エラー正規化（`normalizeDocError` 追加） |

## 統合テスト連携

- SubAgent-A/B が LLMClient・エラー正規化の設計検証を行う
- SubAgent-C が型定義配置の整合性を確認する
- SubAgent-D が全設計の矛盾・漏れを検査する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                          |
| ------------ | --------------------------------------------------------------------- |
| セキュリティ | APIキーが `sanitizeErrorMessage()` でマスクされるか                   |
| 後方互換性   | 成功時の IPC 返却形式（`{ success: true, data: ... }`）が変わらないか |
| テスト可能性 | `LLMClient` がモック可能なインターフェースか                          |
| P42準拠      | `prompt` 引数の `.trim()` バリデーションが維持されるか                |

## 成果物

- `outputs/phase-2/architecture-design.md`: アーキテクチャ設計書
- `outputs/phase-2/module-structure.md`: モジュール構成図
- `outputs/phase-2/ipc-contract-extension.md`: IPC契約拡張設計

## 完了条件

- [ ] LLMClient モジュール構成が確定している
- [ ] DI 注入パターンが `LLMDocQueryAdapter.ts` の委譲箇所として特定されている
- [ ] エラー正規化ロジックが設計されている
- [ ] 型定義配置方針テーブルが完成している
- [ ] 新規・修正ファイル一覧が確定している

## タスク100%実行確認【必須】

- [ ] モジュール構成設計完了
- [ ] DI注入設計完了（修正箇所特定）
- [ ] エラー正規化設計完了
- [ ] 型定義配置方針完了
- [ ] Validation Matrix 定義完了
- [ ] 成果物ファイル出力完了

## 次Phase

Phase 3（設計レビュー）へ進む。
