# Phase 2 成果物: 設計サマリー

## 型定義追加

```typescript
// packages/shared/src/types/skillCreator.ts L340 以降に追加
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };
```

## execute() 分岐フローチャート

```
execute(planResult, authMode, apiKey)
  |
  +-- resolveDecision(authMode, apiKey)
  |
  +-- decision.type === "terminal_handoff" ?
  |   +-- Yes --> handoffBuilder.build() --> return { type, bundle }
  |   +-- No  --> skillExecutor.execute() --> return { executeId, ... }
```

## テスト修正方針

既存テスト L207-246（矛盾: terminal_handoff resolve + executor 呼び出し期待）を2つに分割:

1. terminal_handoff テスト: 早期リターン + executeMock 未呼び出し確認
2. エラー変換テスト: integrated_api resolve + executor エラー変換確認

## IPC 影響

execute() の呼び出し元 IPC ハンドラが存在する場合、戻り値が Union になるため Renderer 側での分岐が必要。plan/improve で既にパターンがあるため同様に対応。
