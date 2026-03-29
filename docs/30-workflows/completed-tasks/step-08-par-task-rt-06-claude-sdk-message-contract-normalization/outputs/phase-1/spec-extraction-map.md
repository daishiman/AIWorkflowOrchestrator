# Phase 1: SDK 契約抽出マップ

## Task 1: 主要 message 種別の列挙

### `query()` が返す SDK message 種別

| 種別              | type フィールド | subtype             | 出現タイミング     | 用途                      |
| ----------------- | --------------- | ------------------- | ------------------ | ------------------------- |
| system/init       | `system`        | `init`              | ストリーム開始直後 | session_id の受け渡し     |
| assistant         | `assistant`     | -                   | LLM 応答中         | text / tool_use の伝達    |
| result            | `result`        | `success` / `error` | ストリーム終了時   | 最終結果 + stop_reason    |
| error (tool)      | `assistant`     | -                   | ツール実行失敗時   | tool_result.is_error=true |
| permission denial | `assistant`     | -                   | 権限拒否時         | permission_denied=true    |

## Task 2: 保持要件の定義

| 項目              | 必須/optional | 欠損時の扱い             | 下流ユースケース       |
| ----------------- | ------------- | ------------------------ | ---------------------- |
| session_id        | optional      | undefined（warning log） | session resume (P0-08) |
| resultSubtype     | optional      | undefined                | 結果パネル表示 (RT-03) |
| permissionDenials | optional      | 空配列省略               | audit / hooks (P0-09)  |
| stopReason        | optional      | undefined                | execute 判定 (P0-05)   |
| sourceProvenance  | optional      | undefined                | provenance 追跡        |
| text              | optional      | undefined                | UI テキスト表示        |

## Task 3: 最小契約の定義

UI / IPC / WorkflowEngine が消費する最小共通契約:

```typescript
interface SkillCreatorSdkEvent {
  eventType: "init" | "assistant" | "result" | "error";
  sessionId?: string;
  resultSubtype?: string;
  text?: string;
  permissionDenials?: string[];
  sourceProvenance?: { sourceRoot: string; manifestHash?: string };
  stopReason?: string;
}
```

### 消費者別の必要フィールド

| 消費者                   | 必要フィールド                                        |
| ------------------------ | ----------------------------------------------------- |
| UI (renderer)            | eventType, text, permissionDenials, resultSubtype     |
| IPC (creatorHandlers)    | 全フィールド（透過的に forward）                      |
| WorkflowEngine           | eventType, sessionId, resultSubtype, sourceProvenance |
| session resume (P0-08)   | sessionId                                             |
| result panel (RT-03)     | eventType, text, resultSubtype, stopReason            |
| execute writer (P0-05)   | eventType, resultSubtype, text                        |
| permission/hooks (P0-09) | permissionDenials, eventType                          |

## Task 4: provenance の結びつけ

- **取得元**: `SkillCreatorSourceResolver.resolve()` → `resolvedSkillCreatorRoot`
- **埋め込み方法**: NormalizerContext に `sourceProvenance` として渡し、全イベントに付与
- **manifestHash**: `PhaseResourcePlanningSnapshot.foundationSnapshot?.resourceDescriptorHash` から取得

## 非目標

- `.claude/skills/skill-creator/` の内容固定化やハードコードはしない
- 動的読込の主線は変更しない
- query() 呼び出しそのものの置き換えはしない
