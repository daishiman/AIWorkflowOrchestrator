# Phase 2: normalizer 設計書

## Task 1: 正規化イベント型の設計

### 型定義

```typescript
type SkillCreatorSdkEventType = "init" | "assistant" | "result" | "error";

interface SkillCreatorSdkEventSourceProvenance {
  sourceRoot: string;
  manifestHash?: string;
}

interface SkillCreatorSdkEvent {
  eventType: SkillCreatorSdkEventType;
  sessionId?: string;
  resultSubtype?: string;
  text?: string;
  permissionDenials?: string[];
  sourceProvenance?: SkillCreatorSdkEventSourceProvenance;
  stopReason?: string;
}
```

### 配置先

- `packages/shared/src/types/skillCreator.ts` に追加
- `packages/shared/src/types/index.ts` から re-export

## Task 2: normalizer の入出力設計

### 入力

- `rawMessage: unknown` — query() から受信した SDK 生メッセージ 1 件
- `context: NormalizerContext` — provenance + 伝播 sessionId

### 出力

- `SkillCreatorSdkEvent` — 正規化済みイベント 1 件

### 変換ルール

| SDK type       | SDK subtype    | → eventType | 追加抽出                |
| -------------- | -------------- | ----------- | ----------------------- |
| system         | init           | init        | session_id              |
| assistant      | - (text)       | assistant   | content[0].text         |
| assistant      | - (permission) | assistant   | permissionDenials       |
| assistant      | - (tool error) | error       | tool_result.content     |
| result         | success        | result      | subtype, stop_reason    |
| result         | error          | result      | error text, stop_reason |
| (unknown)      | -              | error       | エラーメッセージ        |
| null/undefined | -              | error       | "Invalid SDK message"   |

### 欠損項目の扱い

- session_id 欠損: warning ログ、sessionId = undefined
- text 欠損: text = undefined
- sourceProvenance なし: sourceProvenance = undefined

## Task 3: 統合点の設計

### 配置

```
query() stream → [normalizer] → SkillCreatorSdkEvent → Facade → IPC → renderer
```

- **Facade が normalizer の owner**: `RuntimeSkillCreatorFacade.normalizeSdkMessage()` / `normalizeSdkStream()`
- **Facade が NormalizerContext を構築**: `buildNormalizerContext()` で sourceProvenance を解決
- **IPC**: `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES` チャネル経由で renderer に提供
- **renderer**: lane event (`SkillCreatorSdkEvent`) のみを消費

## Task 4: provenance と session_id の引き回し設計

### session_id ライフサイクル

1. `system/init` メッセージから取得
2. `normalizeSdkStream()` 内で後続メッセージに伝播
3. `result` メッセージが自身の session_id を持つ場合はそちらを優先
4. 既存 sessionId が context にある場合（resume）はそれを初期値とする

### provenance 伝播経路

1. `SkillCreatorSourceResolver.resolve()` → resolvedSkillCreatorRoot
2. `PhaseResourcePlanner.plan()` → snapshot
3. `RuntimeSkillCreatorFacade.buildSourceProvenance()` → SkillCreatorWorkflowSourceProvenance
4. `RuntimeSkillCreatorFacade.buildNormalizerContext()` → NormalizerContext.sourceProvenance
5. normalizer → 全 SkillCreatorSdkEvent.sourceProvenance
