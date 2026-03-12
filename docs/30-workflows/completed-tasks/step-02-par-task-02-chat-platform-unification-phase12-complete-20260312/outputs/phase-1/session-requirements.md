# Session Requirements

## 必須契約

| 契約           | 必須フィールド                                           | 補足                                                   |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| create         | `mode` `request` `title`                                 | title は helper で決定する                             |
| handoff        | `sourceSurface` `targetSurface` `attachments` `metadata` | entry surface は payload 作成だけを担当する            |
| append         | `conversationId` `requestId`                             | workspace 経路では `conversationAPI.addMessage` へ渡る |
| revive         | `conversationId` `draftInput` `systemPrompt` `summary`   | overlay 非永続値は含めない                             |
| cancel / error | `currentStreamId` `streamingMessageId` `streamingError`  | 永続化せず即時クリアする                               |

## revive に含めるもの

- mode
- conversationId
- title
- draftInput
- systemPrompt
- summary
- attachments
- metadata

## revive に含めないもの

- isStreaming
- streamingContent
- currentStreamId
- streamingMessageId
- streamingError

## 残す判断

general chat の `conversationId` ライフサイクルは、このターンでは shared contract の定義までとし、transport 一本化は follow-up に分離する。
