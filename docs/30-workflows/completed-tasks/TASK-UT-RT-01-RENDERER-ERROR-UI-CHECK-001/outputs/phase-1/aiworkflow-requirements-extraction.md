# Phase 1: aiworkflow-requirements 仕様抽出結果

## IPC 契約確認

### onWorkflowStateChanged シグネチャ（variadic 化済み）

```typescript
onWorkflowStateChanged?: (
  callback: (
    snapshot: SkillCreatorWorkflowUiSnapshot | null,
    errorMessage?: string,
  ) => void,
) => () => void;
```

- 第1引数: `snapshot` (nullable)
- 第2引数: `errorMessage` (optional string)
- 戻り値: クリーンアップ関数

### IPC 送信側（Main 層・スコープ外）

```
webContents.send(channel, snapshot, errorMessage)
```

Main 層は TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 で対応済み。
本タスクは Renderer 側の受信・表示の検証のみ。

## エラー表示要件

- エラーメッセージは `role="alert"` の要素に表示すること（アクセシビリティ）
- `data-testid="skill-lifecycle-error"` で DOM テスト可能にすること
- 優先順位: `localError > workflowError > skillError`

## テスト要件（FB-VSCPKR-02）

- `vi.stubGlobal("window", ...)` 使用禁止
- `Object.defineProperty(window, "skillCreatorAPI", { value: mock, writable: true, configurable: true })` を使用
