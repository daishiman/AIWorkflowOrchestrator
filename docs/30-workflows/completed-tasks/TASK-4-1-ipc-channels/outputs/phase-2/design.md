# TASK-4-1: IPCチャネル定義 - 設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-4-1   |
| Phase      | 2          |
| 作成日     | 2026-01-25 |
| ステータス | 完了       |

---

## 1. 設計概要

### 1.1 設計方針

既存の`IPC_CHANNELS`オブジェクトに新規チャネルを追加する方式を採用する。
独立した`SKILL_CHANNELS`オブジェクトは作成しない（既存パターンとの一貫性を維持）。

### 1.2 設計判断の根拠

1. **一貫性**: 既存コードでは全チャネルが`IPC_CHANNELS`に集約
2. **型安全性**: 既存の`IpcChannel`型が自動的に新規チャネルを含む
3. **保守性**: 単一の定義場所により変更管理が容易
4. **ホワイトリスト**: 既存の配列構造をそのまま利用可能

---

## 2. チャネル定数設計

### 2.1 追加するチャネル定義

`IPC_CHANNELS`オブジェクトの「Skill import operations」セクションとして追加:

```typescript
// Skill import operations (TASK-4-1)
SKILL_LIST: "skill:list",                            // 全スキル一覧取得
SKILL_SCAN: "skill:scan",                            // スキル再スキャン
SKILL_GET_IMPORTED: "skill:getImported",             // インポート済みスキル取得
SKILL_UPDATE: "skill:update",                        // スキル情報更新
SKILL_COMPLETE: "skill:complete",                    // 実行完了通知
SKILL_ERROR: "skill:error",                          // エラー通知
SKILL_PERMISSION_REQUEST: "skill:permission:request",   // 権限確認リクエスト
SKILL_PERMISSION_RESPONSE: "skill:permission:response", // 権限確認応答
```

### 2.2 チャネル配置位置

`IPC_CHANNELS`内の「Skill management operations」セクションの後に配置:

```typescript
// Skill management operations (既存)
SKILL_LIST_AVAILABLE: "skill:list-available",
SKILL_LIST_IMPORTED: "skill:list-imported",
SKILL_IMPORT: "skill:import",
SKILL_REMOVE: "skill:remove",
SKILL_GET_DETAIL: "skill:get-detail",
SKILL_EXECUTE: "skill:execute",
SKILL_STREAM: "skill:stream",
SKILL_ABORT: "skill:abort",
SKILL_GET_STATUS: "skill:get-status",

// Skill import operations (新規追加 - TASK-4-1)
SKILL_LIST: "skill:list",
SKILL_SCAN: "skill:scan",
SKILL_GET_IMPORTED: "skill:getImported",
SKILL_UPDATE: "skill:update",
SKILL_COMPLETE: "skill:complete",
SKILL_ERROR: "skill:error",
SKILL_PERMISSION_REQUEST: "skill:permission:request",
SKILL_PERMISSION_RESPONSE: "skill:permission:response",
```

### 2.3 命名規則

| 項目             | 規則                                       | 例                         |
| ---------------- | ------------------------------------------ | -------------------------- |
| 定数名           | SCREAMING*SNAKE_CASE、SKILL*プレフィックス | `SKILL_LIST`               |
| チャネル値       | kebab-case、skill:プレフィックス           | `skill:list`               |
| 権限関連チャネル | skill:permission:サフィックス              | `skill:permission:request` |

---

## 3. 型定義設計

### 3.1 既存型の活用

新規チャネルは自動的に`IpcChannel`型に含まれる（追加の型定義不要）:

```typescript
// 既存の型定義（変更不要）
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
```

### 3.2 補助型（オプション）

スキル関連チャネルのみを抽出する型が必要な場合:

```typescript
// スキルチャネルのユニオン型（必要な場合のみ）
export type SkillChannel =
  | typeof IPC_CHANNELS.SKILL_LIST
  | typeof IPC_CHANNELS.SKILL_SCAN
  | typeof IPC_CHANNELS.SKILL_IMPORT
  | typeof IPC_CHANNELS.SKILL_REMOVE
  | typeof IPC_CHANNELS.SKILL_GET_IMPORTED
  | typeof IPC_CHANNELS.SKILL_UPDATE
  | typeof IPC_CHANNELS.SKILL_EXECUTE
  | typeof IPC_CHANNELS.SKILL_ABORT
  | typeof IPC_CHANNELS.SKILL_STREAM
  | typeof IPC_CHANNELS.SKILL_COMPLETE
  | typeof IPC_CHANNELS.SKILL_ERROR
  | typeof IPC_CHANNELS.SKILL_PERMISSION_REQUEST
  | typeof IPC_CHANNELS.SKILL_PERMISSION_RESPONSE;
```

**判断**: 本タスクでは`SkillChannel`型は追加しない。
必要になった段階で後続タスク（TASK-4-2, TASK-5-1）で追加可能。

---

## 4. ホワイトリスト設計

### 4.1 ALLOWED_INVOKE_CHANNELS（R→M）

#### 追加するチャネル

```typescript
// Skill import channels (TASK-4-1)
IPC_CHANNELS.SKILL_LIST,
IPC_CHANNELS.SKILL_SCAN,
IPC_CHANNELS.SKILL_GET_IMPORTED,
IPC_CHANNELS.SKILL_UPDATE,
IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
```

#### 配置位置

既存の「Skill management channels」セクションの後:

```typescript
// Skill management channels (既存)
IPC_CHANNELS.SKILL_LIST_AVAILABLE,
IPC_CHANNELS.SKILL_LIST_IMPORTED,
IPC_CHANNELS.SKILL_IMPORT,
IPC_CHANNELS.SKILL_REMOVE,
IPC_CHANNELS.SKILL_GET_DETAIL,
IPC_CHANNELS.SKILL_EXECUTE,
IPC_CHANNELS.SKILL_ABORT,
IPC_CHANNELS.SKILL_GET_STATUS,
// Skill import channels (TASK-4-1)
IPC_CHANNELS.SKILL_LIST,
IPC_CHANNELS.SKILL_SCAN,
IPC_CHANNELS.SKILL_GET_IMPORTED,
IPC_CHANNELS.SKILL_UPDATE,
IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
```

### 4.2 ALLOWED_ON_CHANNELS（M→R）

#### 追加するチャネル

```typescript
// Skill import streaming channels (TASK-4-1)
IPC_CHANNELS.SKILL_COMPLETE,
IPC_CHANNELS.SKILL_ERROR,
IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
```

#### 配置位置

既存の「Skill streaming channels」セクションの後:

```typescript
// Skill streaming channels (既存)
IPC_CHANNELS.SKILL_STREAM,
// Skill import streaming channels (TASK-4-1)
IPC_CHANNELS.SKILL_COMPLETE,
IPC_CHANNELS.SKILL_ERROR,
IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
```

---

## 5. 実装詳細設計

### 5.1 変更対象ファイル

| ファイル                               | 変更内容                             |
| -------------------------------------- | ------------------------------------ |
| `apps/desktop/src/preload/channels.ts` | チャネル定義追加、ホワイトリスト更新 |

### 5.2 具体的な変更差分（擬似diff）

```diff
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // Skill management operations
  SKILL_LIST_AVAILABLE: "skill:list-available",
  SKILL_LIST_IMPORTED: "skill:list-imported",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_GET_DETAIL: "skill:get-detail",
  SKILL_EXECUTE: "skill:execute",
  SKILL_STREAM: "skill:stream",
  SKILL_ABORT: "skill:abort",
  SKILL_GET_STATUS: "skill:get-status",

+  // Skill import operations (TASK-4-1)
+  SKILL_LIST: "skill:list",
+  SKILL_SCAN: "skill:scan",
+  SKILL_GET_IMPORTED: "skill:getImported",
+  SKILL_UPDATE: "skill:update",
+  SKILL_COMPLETE: "skill:complete",
+  SKILL_ERROR: "skill:error",
+  SKILL_PERMISSION_REQUEST: "skill:permission:request",
+  SKILL_PERMISSION_RESPONSE: "skill:permission:response",

  // ... 後続チャネル ...
} as const;
```

```diff
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャネル ...
  // Skill management channels
  IPC_CHANNELS.SKILL_LIST_AVAILABLE,
  IPC_CHANNELS.SKILL_LIST_IMPORTED,
  IPC_CHANNELS.SKILL_IMPORT,
  IPC_CHANNELS.SKILL_REMOVE,
  IPC_CHANNELS.SKILL_GET_DETAIL,
  IPC_CHANNELS.SKILL_EXECUTE,
  IPC_CHANNELS.SKILL_ABORT,
  IPC_CHANNELS.SKILL_GET_STATUS,
+  // Skill import channels (TASK-4-1)
+  IPC_CHANNELS.SKILL_LIST,
+  IPC_CHANNELS.SKILL_SCAN,
+  IPC_CHANNELS.SKILL_GET_IMPORTED,
+  IPC_CHANNELS.SKILL_UPDATE,
+  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
  // ... 後続チャネル ...
];
```

```diff
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存チャネル ...
  // Skill streaming channels
  IPC_CHANNELS.SKILL_STREAM,
+  // Skill import streaming channels (TASK-4-1)
+  IPC_CHANNELS.SKILL_COMPLETE,
+  IPC_CHANNELS.SKILL_ERROR,
+  IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
];
```

---

## 6. 検証方針

### 6.1 型チェック検証

```bash
# TypeScriptコンパイルエラーがないことを確認
pnpm --filter @repo/desktop typecheck
```

検証項目:

- 新規チャネル定数が正しく定義されている
- `IpcChannel`型に新規チャネルが含まれている
- ホワイトリスト配列の型が正しい

### 6.2 静的解析検証

```bash
# ESLintエラーがないことを確認
pnpm --filter @repo/desktop lint
```

検証項目:

- コーディング規約に準拠している
- 未使用変数がない
- 命名規則に違反がない

### 6.3 重複チェック

```bash
# チャネル値の重複がないことを確認（Phase 4でテスト化）
grep -o '"skill:[^"]*"' apps/desktop/src/preload/channels.ts | sort | uniq -d
```

---

## 7. 影響範囲

### 7.1 直接影響

| コンポーネント | 影響             | 理由             |
| -------------- | ---------------- | ---------------- |
| `channels.ts`  | 変更             | チャネル定義追加 |
| preload API    | なし（本タスク） | TASK-5-1で対応   |
| IPC handlers   | なし（本タスク） | TASK-4-2で対応   |

### 7.2 間接影響

| コンポーネント         | 影響   | 理由                   |
| ---------------------- | ------ | ---------------------- |
| `IpcChannel`型利用箇所 | 型拡張 | 新規チャネルが型に追加 |

---

## 8. セキュリティ考慮

### 8.1 ホワイトリスト方式の維持

- 全チャネルは明示的にホワイトリストに登録
- invoke/onの分離を維持
- 未登録チャネルへのアクセスは拒否

### 8.2 チャネル名の命名

- `skill:`プレフィックスによる名前空間の分離
- 予測困難な形式（権限関連は`skill:permission:`）

---

## 9. Phase完了確認

### タスク実行状況

- [x] タスク1: チャネル定数の設計 - 完了
- [x] タスク2: 型定義の設計 - 完了
- [x] タスク3: ホワイトリスト登録の設計 - 完了
- [x] タスク4: 設計書の作成 - 完了

### 成果物生成状況

- [x] `outputs/phase-2/design.md` - 生成完了

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
