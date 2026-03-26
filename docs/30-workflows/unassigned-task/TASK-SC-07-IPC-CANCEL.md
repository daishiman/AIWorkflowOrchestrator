# TASK-SC-07-IPC-CANCEL: skill-creator:cancel IPC送信の実装

## メタ情報

| 項目     | 値                                                        |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-SC-07-IPC-CANCEL                                     |
| 検出元   | TASK-SC-07-STREAMING-PROGRESS-UI Phase 3 未実装検出       |
| 優先度   | HIGH                                                      |
| 影響     | キャンセル時にMainプロセスのLLM処理が継続する（機能不全） |
| 検出日   | 2026-03-25                                                |

## 概要

`useCancelGeneration.ts` で `AbortController.abort()` のみ実装されているが、Phase 2/5 設計で要求された `skill-creator:cancel` IPC チャンネルへの送信が未実装。キャンセルボタン押下時に Main プロセスの LLM 処理が継続し続ける。

## 現状

```typescript
// apps/desktop/src/renderer/hooks/useCancelGeneration.ts
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort(); // AbortController のみ
  // skill-creator:cancel IPC 送信が未実装
}, []);
```

## 期待される修正

```typescript
// apps/desktop/src/renderer/hooks/useCancelGeneration.ts
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  window.api["skill-creator:cancel"](); // IPC 送信を追加
}, []);
```

## 完了条件

- [ ] `useCancelGeneration.ts` が `skill-creator:cancel` IPC チャンネルを呼び出している
- [ ] Main プロセス側で `skill-creator:cancel` ハンドラが LLM 処理を中断する
- [ ] キャンセル後に進捗状態が `cancelled` に遷移する
- [ ] 既存テストが全て PASS する

## 関連

- 親タスク: TASK-SC-07-STREAMING-PROGRESS-UI
- 関連仕様: `docs/30-workflows/w5a-sc-streaming-progress-ui/phase-05-implementation.md`
- 対象ファイル: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
