# TASK-SC-07-DEBOUNCE: ストリーミング進捗更新のデバウンス実装（100ms）

## メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| タスクID | TASK-SC-07-DEBOUNCE                                 |
| 検出元   | TASK-SC-07-STREAMING-PROGRESS-UI Phase 3 未実装検出 |
| 優先度   | MEDIUM                                              |
| 影響     | 高速ストリーミング時のUI描画負荷リスク（NFR未達）   |
| 検出日   | 2026-03-25                                          |

## 概要

Phase 1 NFR「高速連続更新に対するデバウンス処理（100ms）」が未実装。高速ストリーミング時に IPC イベントが大量発生した場合、React の再レンダリングが頻発し UI 描画負荷が増大するリスクがある。

## 現状

```typescript
// apps/desktop/src/renderer/hooks/useStreamingProgress.ts
// または generationProgressSlice.ts
// デバウンスなしで進捗を即時 dispatch している
dispatch(updateProgress(payload));
```

## 期待される修正

```typescript
// デバウンス処理（100ms）を追加
const debouncedDispatch = useMemo(
  () =>
    debounce(
      (payload: ProgressPayload) => dispatch(updateProgress(payload)),
      100,
    ),
  [dispatch],
);
debouncedDispatch(payload);
```

## 完了条件

- [ ] 100ms のデバウンス処理が `useStreamingProgress.ts` または `generationProgressSlice.ts` に実装されている
- [ ] 高速連続更新時に dispatch 回数が抑制されることがテストで確認できる
- [ ] デバウンス中でも最終イベント（`complete` / `error`）は即時処理される
- [ ] 既存テストが全て PASS する

## 関連

- 親タスク: TASK-SC-07-STREAMING-PROGRESS-UI
- 関連仕様: `docs/30-workflows/w5a-sc-streaming-progress-ui/phase-01-requirements.md`
- 対象ファイル: `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts` または `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
