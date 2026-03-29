# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 8                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

Phase 5 実装のコード品質を向上させる。重複コードの共通化、命名の統一、不要なコードの除去を行う。

## 実行タスク

- plan() / execute() / improve() のエラー生成ロジックを共通ヘルパーに抽出する
- reason code → userMessage マッピングを定数として集約する
- IPC handler のエラー検出ロジックの重複を排除する
- renderer のエラー表示ロジックの共通化を検討する
- 不要なコメント・TODO の整理

## 参照資料

| 資料名       | パス                                                                  | 説明                 |
| ------------ | --------------------------------------------------------------------- | -------------------- |
| Phase 5 実装 | `phase-5-implementation.md`                                           | 実装内容             |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタリング対象 |
| IPC handler  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | リファクタリング対象 |

## 実行手順

### ステップ1: Facade のエラー生成ヘルパーを抽出する

```typescript
// RuntimeSkillCreatorFacade.ts 内にプライベートメソッドを追加

private createDegradedErrorResponse<T>(
  baseFields: Partial<T>,
): T & { status: "error"; degradedReason: SkillCreatorDegradedReason; userMessage: string } {
  const reason: SkillCreatorDegradedReason = !this.llmAdapter
    ? "llm_adapter_unavailable"
    : "resource_loader_unavailable";

  const userMessage = DEGRADED_REASON_MESSAGES[reason];

  this.logger?.warn(`[degraded] stub response replaced with error: ${reason}`);

  return {
    ...baseFields,
    status: "error" as const,
    degradedReason: reason,
    userMessage,
  } as T & { status: "error"; degradedReason: SkillCreatorDegradedReason; userMessage: string };
}
```

### ステップ2: reason code → userMessage マッピングを定数化する

```typescript
const DEGRADED_REASON_MESSAGES: Record<SkillCreatorDegradedReason, string> = {
  llm_adapter_unavailable:
    "LLM アダプタが利用できません。設定を確認してください。",
  resource_loader_unavailable: "リソースローダーが利用できません。",
};
```

### ステップ3: IPC handler のエラー検出を共通化する

- plan / execute / improve の各ハンドラで共通の `checkDegradedResponse()` ヘルパーを導入する。

### ステップ4: テストが GREEN のままであることを確認する

- リファクタリング後に全テスト（TC-01〜TC-16）を再実行する。
- `pnpm typecheck` が通ることを確認する。

## 統合テスト連携

- Phase 9 で品質監査を実施する。

## 成果物

| 成果物               | パス                           | 説明                        |
| -------------------- | ------------------------------ | --------------------------- |
| リファクタリング済み | `RuntimeSkillCreatorFacade.ts` | 共通ヘルパー抽出            |
| 定数集約             | `RuntimeSkillCreatorFacade.ts` | reason → message マッピング |
| IPC 共通化           | `creatorHandlers.ts`           | エラー検出ヘルパー          |

## 完了条件

- [ ] エラー生成ロジックが共通ヘルパーに抽出されている
- [ ] reason code → userMessage マッピングが定数化されている
- [ ] IPC handler の重複が排除されている
- [ ] 全テストが GREEN のままである
- [ ] `pnpm typecheck` が通る
- [ ] **本Phase内の全タスクを100%実行完了**
