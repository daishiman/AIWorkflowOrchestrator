# IPCチャネル分析レポート

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-4-1                               |
| Phase    | 1                                      |
| 作成日   | 2026-01-25                             |
| 分析対象 | `apps/desktop/src/preload/channels.ts` |

---

## 1. 既存チャネル構造の確認

### 1.1 IPC_CHANNELS オブジェクト構造

既存のチャネル定義は`IPC_CHANNELS`オブジェクトに集約されており、以下のカテゴリに分類されている:

- File operations
- Store operations
- AI operations
- Graph operations
- Dashboard operations
- Window operations
- App operations
- Theme operations
- Auth operations
- Profile operations
- Avatar operations
- Settings operations
- API Key operations
- Dialog operations
- Workspace operations
- Search operations
- Replace operations
- File Selection operations
- LLM operations
- Slide operations
- Agent operations
- **Skill management operations** ← 今回の対象

### 1.2 既存スキル関連チャネル一覧

```typescript
// 現在定義されているスキルチャネル（IPC_CHANNELS内）
SKILL_LIST_AVAILABLE: "skill:list-available",
SKILL_LIST_IMPORTED: "skill:list-imported",
SKILL_IMPORT: "skill:import",
SKILL_REMOVE: "skill:remove",
SKILL_GET_DETAIL: "skill:get-detail",
SKILL_EXECUTE: "skill:execute",
SKILL_STREAM: "skill:stream",
SKILL_ABORT: "skill:abort",
SKILL_GET_STATUS: "skill:get-status",
```

### 1.3 ホワイトリスト登録状況

**ALLOWED_INVOKE_CHANNELS（R→M）**:

- SKILL_LIST_AVAILABLE
- SKILL_LIST_IMPORTED
- SKILL_IMPORT
- SKILL_REMOVE
- SKILL_GET_DETAIL
- SKILL_EXECUTE
- SKILL_ABORT
- SKILL_GET_STATUS

**ALLOWED_ON_CHANNELS（M→R）**:

- SKILL_STREAM

---

## 2. 仕様書からの要件チャネル

### 2.1 仕様書要求チャネル（13チャネル）

| チャネル名                | チャネル値                  | 方向 | 用途               |
| ------------------------- | --------------------------- | ---- | ------------------ |
| SKILL_LIST                | `skill:list`                | R→M  | 全スキル一覧取得   |
| SKILL_SCAN                | `skill:scan`                | R→M  | 再スキャン         |
| SKILL_IMPORT              | `skill:import`              | R→M  | インポート         |
| SKILL_REMOVE              | `skill:remove`              | R→M  | 削除               |
| SKILL_GET_IMPORTED        | `skill:getImported`         | R→M  | インポート済み取得 |
| SKILL_UPDATE              | `skill:update`              | R→M  | スキル情報更新     |
| SKILL_EXECUTE             | `skill:execute`             | R→M  | 実行開始           |
| SKILL_ABORT               | `skill:abort`               | R→M  | 実行中止           |
| SKILL_STREAM              | `skill:stream`              | M→R  | ストリーミング     |
| SKILL_COMPLETE            | `skill:complete`            | M→R  | 完了通知           |
| SKILL_ERROR               | `skill:error`               | M→R  | エラー通知         |
| SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | M→R  | 権限確認要求       |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` | R→M  | 権限確認応答       |

---

## 3. 重複分析

### 3.1 比較表

| 仕様書チャネル            | 仕様書チャネル値            | 既存チャネル         | 既存チャネル値         | 判定         |
| ------------------------- | --------------------------- | -------------------- | ---------------------- | ------------ |
| SKILL_LIST                | `skill:list`                | SKILL_LIST_AVAILABLE | `skill:list-available` | **新規追加** |
| SKILL_SCAN                | `skill:scan`                | なし                 | -                      | **新規追加** |
| SKILL_IMPORT              | `skill:import`              | SKILL_IMPORT         | `skill:import`         | 既存流用可   |
| SKILL_REMOVE              | `skill:remove`              | SKILL_REMOVE         | `skill:remove`         | 既存流用可   |
| SKILL_GET_IMPORTED        | `skill:getImported`         | SKILL_LIST_IMPORTED  | `skill:list-imported`  | **新規追加** |
| SKILL_UPDATE              | `skill:update`              | なし                 | -                      | **新規追加** |
| SKILL_EXECUTE             | `skill:execute`             | SKILL_EXECUTE        | `skill:execute`        | 既存流用可   |
| SKILL_ABORT               | `skill:abort`               | SKILL_ABORT          | `skill:abort`          | 既存流用可   |
| SKILL_STREAM              | `skill:stream`              | SKILL_STREAM         | `skill:stream`         | 既存流用可   |
| SKILL_COMPLETE            | `skill:complete`            | なし                 | -                      | **新規追加** |
| SKILL_ERROR               | `skill:error`               | なし                 | -                      | **新規追加** |
| SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | なし                 | -                      | **新規追加** |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` | なし                 | -                      | **新規追加** |

### 3.2 判定結果サマリー

**既存チャネルを再利用（5チャネル）**:

1. `SKILL_IMPORT` → `IPC_CHANNELS.SKILL_IMPORT` (値: `skill:import`)
2. `SKILL_REMOVE` → `IPC_CHANNELS.SKILL_REMOVE` (値: `skill:remove`)
3. `SKILL_EXECUTE` → `IPC_CHANNELS.SKILL_EXECUTE` (値: `skill:execute`)
4. `SKILL_ABORT` → `IPC_CHANNELS.SKILL_ABORT` (値: `skill:abort`)
5. `SKILL_STREAM` → `IPC_CHANNELS.SKILL_STREAM` (値: `skill:stream`)

**新規追加が必要（8チャネル）**:

1. `SKILL_LIST` (値: `skill:list`)
2. `SKILL_SCAN` (値: `skill:scan`)
3. `SKILL_GET_IMPORTED` (値: `skill:getImported`)
4. `SKILL_UPDATE` (値: `skill:update`)
5. `SKILL_COMPLETE` (値: `skill:complete`)
6. `SKILL_ERROR` (値: `skill:error`)
7. `SKILL_PERMISSION_REQUEST` (値: `skill:permission:request`)
8. `SKILL_PERMISSION_RESPONSE` (値: `skill:permission:response`)

### 3.3 命名衝突確認

| 新規チャネル値              | 既存チャネル値         | 衝突有無 |
| --------------------------- | ---------------------- | -------- |
| `skill:list`                | `skill:list-available` | なし     |
| `skill:scan`                | -                      | なし     |
| `skill:getImported`         | `skill:list-imported`  | なし     |
| `skill:update`              | -                      | なし     |
| `skill:complete`            | -                      | なし     |
| `skill:error`               | -                      | なし     |
| `skill:permission:request`  | -                      | なし     |
| `skill:permission:response` | -                      | なし     |

**結論**: 命名衝突なし。新規チャネルは安全に追加可能。

---

## 4. ホワイトリスト更新計画

### 4.1 ALLOWED_INVOKE_CHANNELS に追加（R→M）

```typescript
// 新規追加
IPC_CHANNELS.SKILL_LIST,          // skill:list
IPC_CHANNELS.SKILL_SCAN,          // skill:scan
IPC_CHANNELS.SKILL_GET_IMPORTED,  // skill:getImported
IPC_CHANNELS.SKILL_UPDATE,        // skill:update
IPC_CHANNELS.SKILL_PERMISSION_RESPONSE, // skill:permission:response
```

※ 以下は既存で登録済み:

- SKILL_IMPORT
- SKILL_REMOVE
- SKILL_EXECUTE
- SKILL_ABORT

### 4.2 ALLOWED_ON_CHANNELS に追加（M→R）

```typescript
// 新規追加
IPC_CHANNELS.SKILL_COMPLETE,          // skill:complete
IPC_CHANNELS.SKILL_ERROR,             // skill:error
IPC_CHANNELS.SKILL_PERMISSION_REQUEST, // skill:permission:request
```

※ 以下は既存で登録済み:

- SKILL_STREAM

---

## 5. 実装方針

### 5.1 アプローチ

仕様書では`SKILL_CHANNELS`という独立したオブジェクトを提案しているが、
既存のコードベースでは`IPC_CHANNELS`に全チャネルが集約されている。

**方針**: 既存パターンに従い、`IPC_CHANNELS`内のSkill management operationsセクションに新規チャネルを追加する。

### 5.2 実装内容

1. `IPC_CHANNELS`に8つの新規チャネル定義を追加
2. `ALLOWED_INVOKE_CHANNELS`に5つのチャネルを追加
3. `ALLOWED_ON_CHANNELS`に3つのチャネルを追加
4. 既存の5チャネルは変更なし

---

## 6. 結論

- 新規追加チャネル: **8チャネル**
- 既存再利用チャネル: **5チャネル**
- 命名衝突: **なし**
- ホワイトリスト追加: invoke=5, on=3

本分析に基づき、Phase 2以降で実装を進める。
