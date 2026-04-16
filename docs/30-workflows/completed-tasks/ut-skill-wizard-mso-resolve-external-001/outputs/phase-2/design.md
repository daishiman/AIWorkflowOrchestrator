# 設計書: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## 型定義設計

```typescript
export interface ExternalToolIntegration {
  toolName: string;
  apiEndpoints: string[];
  authMethods: string[];
  mainOperations: string[];
}

export interface MergedExternalIntegration {
  tools: ExternalToolIntegration[];
  apiEndpoints: string[];
  authMethods: string[];
  mainOperations: string[];
}
```

## 関数シグネチャ変更

**変更前**:

```typescript
export function resolveExternalIntegration(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null | undefined,
): ExternalIntegrationState;
```

**変更後**:

```typescript
export async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration>;
```

## fetchToolIntegrationInfo 設計

新規ファイル `apps/desktop/src/renderer/components/skill/fetchToolIntegrationInfo.ts` に分離。
テスト時にモック可能にするため独立モジュールとして配置。

```typescript
export async function fetchToolIntegrationInfo(
  toolName: string,
): Promise<ExternalToolIntegration>;
```

対応ツール: Slack, GitHub, Notion（その他は throw → null 吸収）

## 並列処理戦略: Promise.all（案A採用）

AC-1「並列処理」要件に対応。個々のエラーは null に吸収して成功分のみマージ。

```typescript
const results = await Promise.all(
  normalizedToolNames.map(async (toolName) => {
    try {
      return await fetchToolIntegrationInfo(toolName);
    } catch {
      return null;
    }
  }),
);
```

## マージ戦略: flatMap + Set 重複排除

```typescript
function mergeIntegrations(
  infos: ExternalToolIntegration[],
): MergedExternalIntegration {
  return {
    tools: infos,
    apiEndpoints: [...new Set(infos.flatMap((info) => info.apiEndpoints))],
    authMethods: [...new Set(infos.flatMap((info) => info.authMethods))],
    mainOperations: [...new Set(infos.flatMap((info) => info.mainOperations))],
  };
}
```

## フォールバック設計

| ケース       | 動作                                          | AC   |
| ------------ | --------------------------------------------- | ---- |
| 空配列 `[]`  | `defaultMergedExternalIntegration()` 即時返却 | AC-4 |
| 未対応ツール | fetchToolIntegrationInfo が throw → null 吸収 | AC-4 |
| 全ツール失敗 | `mergeIntegrations([])` で空結果返却          | AC-4 |

## 呼び出し箇所更新設計（AC-5）

**変更前（3箇所）**:

```typescript
const integration = resolveExternalIntegration(answers.q5, defaults.tool);
setHasExternalIntegration(integration.hasExternalIntegration);
setExternalToolName(integration.externalToolName);
```

**変更後**:

```typescript
void resolveExternalIntegration(answers.q5.selectedOptions).then(
  (integration) => {
    setHasExternalIntegration(integration.tools.length > 0);
    setExternalToolName(
      integration.tools.length > 0
        ? integration.tools.map((t) => t.toolName).join(", ")
        : null,
    );
  },
);
```

※ async 関数（handleStep0Next, handleGenerate）では await を使用

## バッジ削除設計（6種）

| 削除対象                                                      | ファイル                         |
| ------------------------------------------------------------- | -------------------------------- |
| `MAIN_TOOL_BADGE_ENABLED` 定数                                | `ConversationRoundStep.tsx`      |
| `MainToolBadgeProps` interface                                | `ConversationRoundStep.tsx`      |
| `shouldShowMainToolBadge` 関数                                | `ConversationRoundStep.tsx`      |
| `isMainTool` 変数 + `mainToolBadgeId` 変数                    | `ConversationRoundStep.tsx`      |
| バッジ JSX (`{isMainTool && ...}`)                            | `ConversationRoundStep.tsx`      |
| `aria-describedby={isMainTool ? mainToolBadgeId : undefined}` | `ConversationRoundStep.tsx`      |
| TODO コメント (line 465)                                      | `ConversationRoundStep.tsx`      |
| TC-1〜TC-6 + 拡充テスト describe ブロック                     | `ConversationRoundStep.test.tsx` |

## 設計判断記録

| 判断事項                 | 採用方針                    | 理由                                     |
| ------------------------ | --------------------------- | ---------------------------------------- |
| 並列処理                 | Promise.all (案A)           | AC-1「並列処理」要件・パフォーマンス優位 |
| エラーハンドリング       | null 吸収で成功分のみマージ | 一部失敗が全体を止めない安全設計（AC-4） |
| マージ                   | flatMap + Set 重複排除      | 全ツール網羅・重複排除                   |
| fetchToolIntegrationInfo | 独立ファイルに分離          | テスト時にモック可能にするため           |
| externalToolName         | tools をカンマ連結 or null  | 複数ツール選択時の後方互換・UI 表示維持  |
