# Phase 2 Normalizer Design

## 設計方針

- SDK 生メッセージの解釈は Runtime facade 内で閉じる
- `SkillExecutor` は raw SDK message 配列を返却できるようにする
- lane 外へは `SkillCreatorSdkEvent` と集約済み execute result だけを返す

## 追加する契約

```ts
type SkillCreatorSdkEventType = "init" | "assistant" | "result" | "error";

interface SkillCreatorSdkEvent {
  eventType: SkillCreatorSdkEventType;
  rawType: string;
  sequence: number;
  sessionId?: string;
  messageId?: string;
  text?: string;
  resultSubtype?: string;
  stopReason?: string;
  permissionDenials?: Array<{
    toolName?: string;
    toolUseId?: string;
    reason: string;
  }>;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}
```

## 変換規則

| SDK 側                                                   | lane 側               |
| -------------------------------------------------------- | --------------------- |
| `type=system` + `subtype=init` または `type=system/init` | `eventType=init`      |
| `type=assistant` / `type=text`                           | `eventType=assistant` |
| `type=result`                                            | `eventType=result`    |
| `type=error` または `error.message` 保有                 | `eventType=error`     |

## 欠損時ポリシー

- `system/init` 不在でも fail しない
- `sessionId` は最初に見つかった値を execute result に昇格する
- `resultSubtype` / `stopReason` / permission denial は最後の `result` event を優先
- SDK message が 0 件でも synthetic result / error event を生成して lane 契約を空にしない

## 境界

- `SkillExecutor`: raw SDK messages 取得まで
- `RuntimeSkillCreatorFacade`: 正規化と execute result 集約
- `WorkflowEngine`: 正規化済み execute result を保存
- IPC / preload / renderer: 正規化済み execute response のみを消費
