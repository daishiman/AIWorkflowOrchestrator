# TASK-RT-06: SDK Message Contract Normalization — 実装ガイド

---

## Part 1: やさしい解説（初学者向け）

### SDK 正規化って何？

SDK（ソフトウェア開発キット）は、外部のサービスと会話するための「通訳」のようなものです。Claude Code SDK は AI と会話するための通訳ですが、この通訳が返してくる「メッセージ」は、種類も形もバラバラです。

**日常生活の例え: 郵便局の仕分け**

海外から届く手紙を想像してください。手紙にはいろいろな種類があります:

- 「初めまして」の挨拶状（→ `system/init`）
- 本文が書かれた普通の手紙（→ `assistant`）
- 「手紙のやり取りは以上です」という終了通知（→ `result`）
- 「配達できませんでした」というエラー通知（→ `error`）

郵便局（normalizer）は、これらの手紙を全て「統一フォーマット」に書き直してから、受取人（UI画面）に届けます。受取人は海外の手紙のフォーマットを知らなくても、統一フォーマットを読むだけでOKです。

### なぜ正規化が必要か

SDK が返すメッセージの形が変わっても、正規化層（normalizer）だけ修正すればよく、UI やデータ保存の仕組みは変更不要になります。これが「安定した契約」の価値です。

### 何をするか

1. **SDK 生メッセージ**を受け取る
2. **4つの種類に分類**する（init / assistant / result / error）
3. **重要な情報を取り出す**（セッションID、結果の種類、権限拒否情報など）
4. **統一フォーマットに変換**して下流に渡す

---

## Part 2: 技術者向け詳細

### SkillCreatorSdkEvent 型定義

```typescript
// packages/shared/src/types/skillCreator.ts

type SkillCreatorSdkEventType = "init" | "assistant" | "result" | "error";

interface SkillCreatorSdkEventSourceProvenance {
  sourceRoot: string; // 解決された skill-creator ルートパス
  manifestHash?: string; // manifest ハッシュ（キャッシュ用）
}

interface SkillCreatorSdkEvent {
  eventType: SkillCreatorSdkEventType;
  sessionId?: string; // system/init or result から取得
  resultSubtype?: string; // "success" | "error" など
  text?: string; // テキストコンテンツ
  permissionDenials?: string[]; // ["Write: File write denied", ...]
  sourceProvenance?: SkillCreatorSdkEventSourceProvenance;
  stopReason?: string; // "end_turn" | "error" | "timeout" | "cancelled"
}
```

### normalizer API

```typescript
// apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts

interface NormalizerContext {
  sourceProvenance?: SkillCreatorSdkEventSourceProvenance;
  sessionId?: string; // resume 時の既存 sessionId
}

// 1件ずつ変換
function normalizeSdkMessage(
  rawMessage: unknown,
  context: NormalizerContext,
): SkillCreatorSdkEvent;

// ストリーム全体を変換（sessionId 自動伝播）
function normalizeSdkStream(
  rawMessages: unknown[],
  context: NormalizerContext,
): SkillCreatorSdkEvent[];
```

### 使用例

```typescript
// Facade 経由
const facade = new RuntimeSkillCreatorFacade(deps);
const event = facade.normalizeSdkMessage(rawSdkMsg);
const events = facade.normalizeSdkStream(rawMessages);

// IPC 経由（renderer から）
const result = await window.skillCreatorAPI.normalizeSdkMessages(rawMessages);
if (result.success) {
  console.log(result.data); // SkillCreatorSdkEvent[]
}
```

### エラーハンドリング

| ケース                      | 挙動                                                           |
| --------------------------- | -------------------------------------------------------------- |
| `session_id` 欠損           | `sessionId = undefined`（warning、正規化は継続）               |
| `permission_denied = true`  | `permissionDenials` に denied_tool + denied_reason を記録      |
| `system/init` 不在          | ストリーム内の他メッセージから sessionId を取得（result から） |
| null / undefined 入力       | `eventType: "error"`, `text: "Invalid SDK message"`            |
| 未知の type                 | `eventType: "error"`, `text: "Unknown SDK message type: ..."`  |
| tool_result.is_error = true | `eventType: "error"`, `text: tool_result.content`              |

### 統合ポイント

| コンポーネント | ファイル                                                         | 役割                                   |
| -------------- | ---------------------------------------------------------------- | -------------------------------------- |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                      | `SkillCreatorSdkEvent` 型              |
| normalizer     | `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts` | 変換ロジック                           |
| Facade         | `RuntimeSkillCreatorFacade.ts`                                   | normalizer owner, context 構築         |
| IPC handler    | `creatorHandlers.ts`                                             | `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES` |
| IPC channel    | `channels.ts`                                                    | チャネル定義                           |
| preload API    | `skill-creator-api.ts`                                           | `normalizeSdkMessages()`               |

### テスト

- ファイル: `sdkMessageNormalizer.test.ts`
- テスト数: 32件
- カバレッジ: Line 99.35% / Branch 91.22% / Function 100%
