# Phase 2: 設計 - Before/After 比較

## Before

```ts
const applyWorkflowSnapshot = useCallback(
  (snapshot: SkillCreatorWorkflowUiSnapshot) => {
    setWorkflowSnapshot(snapshot);
    setWorkflowError(null);
    if (snapshot.handoffBundle) {
      setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
    }
  },
  [setHandoffGuidance, setWorkflowError, setWorkflowSnapshot],
);
```

## After

```ts
const applyWorkflowSnapshot = useCallback(
  (snapshot: SkillCreatorWorkflowUiSnapshot) => {
    setWorkflowSnapshot(snapshot);
    if (snapshot.currentPhase !== "handoff") {
      setWorkflowError(null);
    }
    if (snapshot.handoffBundle) {
      setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
    }
  },
  [setHandoffGuidance, setWorkflowError, setWorkflowSnapshot],
);
```

## 変更意図

- `handoff` 以外の snapshot では従来どおりエラーをクリアする。
- `handoff` snapshot では `setWorkflowError(null)` を抑止し、失敗状態を保持する。
- `handoffBundle` の処理は `currentPhase` と独立して維持する。

## AC 充足確認

| AC   | 判定 | 根拠                                                   |
| ---- | ---- | ------------------------------------------------------ |
| AC-1 | PASS | `handoff` 時は条件式で `setWorkflowError(null)` を回避 |
| AC-2 | PASS | `execute` / `verify` などは従来どおりクリア            |
| AC-3 | PASS | 連続 snapshot でも `handoff` のときだけ保持される      |
| AC-4 | PASS | 既存テストの対象ロジックを壊さない                     |
| AC-5 | PASS | 型変更・IPC 変更なし                                   |

## テスト設計

- シナリオA: `handoff` snapshot の後に `execute` snapshot を流し、エラーが消えないことを確認する。
- シナリオB: `execute` / `verify` snapshot では `setWorkflowError(null)` が呼ばれることを確認する。
- シナリオC: `handoffBundle` がある/ないの両方で guidance 更新が維持されることを確認する。
