# SDK メッセージ出力型統合 契約仕様

> 親仕様書: [api-ipc-agent-core.md](api-ipc-agent-core.md)
> 役割: SkillStreamMessage / SkillCreatorSdkEvent の出力型統合設計

## SDK メッセージ出力型統合（UT-RT-06 / UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001）

`SkillStreamMessage`（実行lane）と `SkillCreatorSdkEvent`（creator lane）の出力型を `packages/shared` に集約した設計。

### 共通基底型 SdkOutputMessageBase

| プロパティ  | 型                | 必須 | 説明                                         |
| ----------- | ----------------- | ---- | -------------------------------------------- |
| `type`      | `string`          | ○    | メッセージ種別 discriminator                 |
| `timestamp` | `number`          | -    | 発生タイムスタンプ（lane別に必須性が異なる） |

```typescript
// packages/shared/src/types/skillExecutor.ts
interface SdkOutputMessageBase {
  type: string;
  timestamp?: number;
}
```

### SkillExecutorStreamMessage（実行lane出力型）

実行lane（`SkillExecutor`）の出力型。`SdkOutputMessageBase` を継承し `timestamp` が**必須**。

| プロパティ  | 型                              | 必須 | 説明                           |
| ----------- | ------------------------------- | ---- | ------------------------------ |
| `type`      | `SkillExecutorStreamMessageType`| ○    | "text" / "tool_use" / "error" / "complete" / "retry" |
| `timestamp` | `number`                        | ○    | 発生タイムスタンプ（実行laneは必須） |
| `content`   | `string`                        | -    | テキスト / エラーメッセージ    |

### SkillCreatorSdkEvent（creator lane出力型）

creator lane の出力型。`SdkOutputMessageBase` を継承し `timestamp` は**省略可**。

| プロパティ  | 型                         | 必須 | 説明                                           |
| ----------- | -------------------------- | ---- | ---------------------------------------------- |
| `type`      | `SkillCreatorSdkEventType` | ○    | "init" / "assistant" / "result" / "error"     |
| `sessionId` | `string`                   | -    | セッションID（init→後続イベントへ伝播）        |
| `timestamp` | `number`                   | -    | 発生タイムスタンプ（creator laneは省略可）     |

### 新規 IPC チャンネル（UT-RT-06 追加分）

| チャンネル                               | 方向            | 用途                              |
| ---------------------------------------- | --------------- | --------------------------------- |
| `skill-creator:get-adapter-status`       | Renderer → Main | LLMAdapter 初期化状態取得         |
| `skill-creator:adapter-status-changed`   | Main → Renderer | LLMAdapter 状態変化通知           |
| `skill-creator:normalize-sdk-messages`   | Renderer → Main | SDK messages 正規化               |
| `skill-creator:get-governance-state`     | Renderer → Main | governance 状態取得               |

### 後方互換パターン（@deprecated エイリアス）

`SkillExecutor.ts` 内でローカル型を `@deprecated` エイリアスに変更し、後方互換を維持する。

```typescript
/** @deprecated Use SkillExecutorStreamMessage from @repo/shared */
type SkillStreamMessage = SkillExecutorStreamMessage;
```

### 設計上の注意点

| 項目                    | 内容                                                            |
| ----------------------- | --------------------------------------------------------------- |
| timestamp 必須性の差異  | 実行lane: 必須（`number`）、creator lane: 省略可（`number?`）  |
| snake_case/camelCase    | `session_id` / `sessionId` 両形式の正規化が必要               |
| sessionId 伝播          | init イベント観測時に contextual 管理し後続へ伝播              |
| discriminatorのない union | `type` フィールドによるガードを必ず実装すること                |
| Facade遅延注入          | 非同期初期化のため `RuntimeSkillCreatorFacade` は遅延注入パターンを使用 |

### 実装ファイル

| ファイル                                                              | 役割                                        |
| --------------------------------------------------------------------- | ------------------------------------------- |
| `packages/shared/src/types/skillExecutor.ts`                          | `SdkOutputMessageBase` / `SkillExecutorStreamMessage` 定義 |
| `packages/shared/src/types/skillCreator.ts`                           | `SkillCreatorSdkEvent` 定義                |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | Facade 遅延注入・正規化                    |
