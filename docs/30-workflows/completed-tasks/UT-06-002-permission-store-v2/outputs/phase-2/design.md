# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| 機能名   | UT-06-002-permission-store-v2 |
| 作成日   | 2026-03-23                    |
| タスクID | UT-06-002                     |

## 目的

`AllowedToolEntryV2` ベースの `PermissionStore` V2 アーキテクチャ、IPC チャンネル設計、マイグレーション戦略を定義する。

## 参照資料

| 資料名                     | パス                                                                                                                              | 説明                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Phase 5 PermissionStore IF | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts` | AllowedToolEntryV2 / PermissionStoreInterface 正式定義 |
| 既存 PermissionStore       | `apps/desktop/src/main/services/skill/PermissionStore.ts`                                                                         | V1 実装（拡張対象）                                    |
| 既存 共有型定義            | `packages/shared/src/types/permission-store.ts`                                                                                   | V1 型定義（拡張対象）                                  |
| 既存 IPC ハンドラ          | `apps/desktop/src/main/ipc/permission-store-handlers.ts`                                                                          | V1 ハンドラ（拡張対象）                                |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                                     | IPC 品質基準                                           |

## 設計方針

### V1→V2 拡張戦略

V1 の既存コードを**その場で拡張**する。新規ファイル作成ではなく、既存ファイルの段階的拡張を採用する。

**理由**:

- 既存の `PermissionStore` クラスにキャッシュ/バリデーション/ログのインフラが整備済み
- `IPermissionStore` インターフェースが他のコンポーネントから参照済み
- 新規クラス作成は二重管理になりリスクが高い

### 後方互換性ルール（TC-T-004）

Phase 5 設計書で定義された後方互換性ルール：

- `expiresAt` が `undefined` → 「無期限有効」として扱う
- `skillName` が `undefined` → 「全スキルに適用」として扱う
- `expiryPolicy` が `undefined` → `"permanent"` として扱う
- V1 の `AllowedToolEntry` は `AllowedToolEntryV2` に代入可能

## アーキテクチャ設計

### レイヤー図

```
Renderer Process
  └── permission:clear-session (IPC invoke)
       │
Preload (contextBridge)
  └── channels.ts: PERMISSION_CLEAR_SESSION
       │
Main Process
  ├── permission-store-handlers.ts
  │     └── ipcMain.handle("permission:clear-session")
  ├── PermissionStore (V2)
  │     ├── isToolAllowed(toolName, skillName?) ── 6分岐フロー
  │     ├── allowTool(entry: AllowedToolEntryV2)
  │     ├── revokeSessionEntries(sessionId)
  │     ├── getAllowedTools() ── 期限切れ自動削除
  │     └── revokeAll() / revokeTool()
  └── app.on('before-quit') → revokeSessionEntries()
       │
electron-store (永続化)
  └── permission-store.json (schema v2)
```

### 依存方向

```
@repo/shared (型定義)
  ├── AllowedToolEntryV2
  ├── IPermissionStoreV2
  ├── PermissionStoreSchemaV2
  └── calcExpiresAt()
       ↑
apps/desktop/src/main/services/skill/PermissionStore.ts (実装)
       ↑
apps/desktop/src/main/ipc/permission-store-handlers.ts (IPC)
```

## 型定義設計

### 1. AllowedToolEntryV2（`@repo/shared`）

```typescript
// packages/shared/src/types/permission-store.ts に追加

/**
 * V2: 失効情報・スキル名を持つ拡張エントリ
 *
 * 後方互換性: V1 の AllowedToolEntry（expiresAt/skillName/expiryPolicy 未定義）は
 * 「無期限有効・全スキル対象・permanent」として動作する
 */
export interface AllowedToolEntryV2 extends AllowedToolEntry {
  /** 失効タイムスタンプ（Unix ms）。undefined = 無期限 */
  expiresAt?: number;
  /** 適用対象スキル名。undefined = 全スキルに適用 */
  skillName?: string;
  /** 失効ポリシー種別 */
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}

/** 失効ポリシーのユニオン型 */
export type ExpiryPolicy = NonNullable<AllowedToolEntryV2["expiryPolicy"]>;
```

### 2. calcExpiresAt 関数（`@repo/shared`）

```typescript
// packages/shared/src/types/permission-store.ts に追加

/**
 * 失効ポリシーに基づき expiresAt を計算する
 *
 * | ポリシー   | expiresAt           | 備考             |
 * | ---------- | ------------------- | ---------------- |
 * | session    | undefined           | セッション終了時 |
 * | time_24h   | allowedAt + 86400000 | 24時間後         |
 * | time_7d    | allowedAt + 604800000 | 7日後           |
 * | permanent  | undefined           | 明示取り消しまで |
 */
export function calcExpiresAt(
  policy: ExpiryPolicy,
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      return undefined;
    case "time_24h":
      return allowedAt + 86_400_000;
    case "time_7d":
      return allowedAt + 604_800_000;
    case "permanent":
      return undefined;
  }
}

export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;
```

### 3. IPermissionStoreV2 インターフェース（`@repo/shared`）

```typescript
// packages/shared/src/types/permission-store.ts に追加

/**
 * V2 PermissionStore インターフェース
 *
 * V1 の IPermissionStore を拡張し、スコープ管理と期限管理を追加
 */
export interface IPermissionStoreV2 extends IPermissionStore {
  /**
   * ツールが許可済みかどうかを判定（6分岐フロー）
   * @param toolName - 判定対象のツール名
   * @param skillName - 呼び出し元スキル名（省略時は全スキルに対する許可を確認）
   */
  isToolAllowed(toolName: string, skillName?: string): boolean;

  /**
   * AllowedToolEntryV2 を受け入れてツールを許可
   * expiryPolicy に基づき expiresAt を自動計算
   */
  allowToolV2(entry: AllowedToolEntryV2): void;

  /**
   * セッションスコープのエントリのみ削除
   * expiryPolicy === "session" のエントリを全て削除する
   */
  revokeSessionEntries(sessionId: string): number;

  /**
   * 現在有効な許可エントリを全て返す（期限切れは自動削除）
   */
  getAllowedToolEntriesV2(): AllowedToolEntryV2[];
}
```

### 4. PermissionStoreSchemaV2（`@repo/shared`）

```typescript
// packages/shared/src/types/permission-store.ts に追加

/**
 * V2 electron-store スキーマ
 */
export interface PermissionStoreSchemaV2 {
  /** スキーマバージョン（2） */
  version: 2;
  /** 許可済みツールの配列（V2） */
  allowedTools: AllowedToolEntryV2[];
  /** 最終更新日時（ISO8601形式） */
  updatedAt: string;
}
```

## PermissionStore V2 実装設計

### isToolAllowed 6分岐フロー

```
isToolAllowed(toolName, skillName?)
  │
  ├─ (1) entry = cache.get(toolName)
  │     └─ entry なし → return false
  │
  ├─ (2) entry.expiresAt === undefined
  │     └─ → skillName チェック (5) へ
  │
  ├─ (3) entry.expiresAt < Date.now()
  │     └─ → cache から削除, store 更新, return false
  │
  ├─ (4) entry.expiresAt >= Date.now()
  │     └─ → skillName チェック (5) へ
  │
  ├─ (5) entry.skillName !== undefined && entry.skillName !== skillName
  │     └─ → return false
  │
  └─ (6) 全条件クリア → return true
```

### allowTool V2 フロー

```typescript
allowToolV2(entry: AllowedToolEntryV2): void {
  // 1. ポリシー決定（未指定時は permanent）
  const policy = entry.expiryPolicy ?? "permanent";

  // 2. allowedAt の型変換（V1 は ISO8601 string、V2 内部計算は number ms）
  const allowedAtMs = typeof entry.allowedAt === "string"
    ? new Date(entry.allowedAt).getTime()
    : entry.allowedAt;

  // 3. expiresAt を計算
  // ガード: session/permanent は expiresAt を強制 undefined にリセット（整合性保証）
  // → expiryPolicy === "session" なのに expiresAt が設定された不整合を防止
  const expiresAt = (policy === "session" || policy === "permanent")
    ? undefined
    : (entry.expiresAt ?? calcExpiresAt(policy, allowedAtMs));

  // 4. V2 エントリ構築
  const v2Entry: AllowedToolEntryV2 = {
    ...entry,
    expiresAt,
    expiryPolicy: policy,
  };

  // 5. キャッシュに保存（既存エントリは上書き）
  this.toolCache.set(entry.toolName, v2Entry);

  // 6. electron-store に永続化
  this.updateStore();
}
```

### revokeSessionEntries フロー

```typescript
revokeSessionEntries(sessionId: string): number {
  let removedCount = 0;

  for (const [key, entry] of this.toolCache.entries()) {
    if (entry.expiryPolicy === "session") {
      this.toolCache.delete(key);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    this.updateStore();
    log.info(`[PermissionStore] Session entries revoked: ${removedCount} (session: ${sessionId})`);
  }

  return removedCount;
}
```

### V1→V2 マイグレーション

```typescript
private migrateV1ToV2(v1Data: PermissionStoreSchema): PermissionStoreSchemaV2 {
  return {
    version: 2,
    allowedTools: v1Data.allowedTools.map((entry) => ({
      ...entry,
      // V1 エントリは永続・全スキル対象として扱う
      expiresAt: undefined,
      skillName: undefined,
      expiryPolicy: "permanent" as const,
    })),
    updatedAt: new Date().toISOString(),
  };
}
```

## IPC チャンネル設計

### 新規チャンネル

| チャンネル名               | 定数名                     | 方向          | 用途                       |
| -------------------------- | -------------------------- | ------------- | -------------------------- |
| `permission:clear-session` | `PERMISSION_CLEAR_SESSION` | Renderer→Main | セッションエントリのクリア |

### ハンドラ設計

```typescript
// permission-store-handlers.ts に追加

/**
 * permission:clear-session ハンドラ
 *
 * P42準拠 3段バリデーション適用
 */
ipcMain.handle(
  IPC_CHANNELS.PERMISSION_CLEAR_SESSION,
  async (
    _event,
    args: { sessionId?: string },
  ): Promise<ClearSessionResponse> => {
    // 3段バリデーション
    const sessionId = args?.sessionId;
    if (typeof sessionId !== "string" || sessionId.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "sessionId must be a non-empty string",
        },
      };
    }

    const removedCount = permissionStore.revokeSessionEntries(sessionId.trim());
    return { success: true, removedCount };
  },
);
```

### レスポンス型

```typescript
export interface ClearSessionResponse {
  success: boolean;
  removedCount?: number;
  error?: { code: string; message: string };
}
```

## セッション終了フック設計

### before-quit フック

```typescript
// apps/desktop/src/main/index.ts（または適切なライフサイクル管理ファイル）

app.on("before-quit", () => {
  try {
    const removedCount = permissionStore.revokeSessionEntries("app-quit");
    log.info(`[App] Session entries cleared on quit: ${removedCount}`);
  } catch (error) {
    log.error("[App] Failed to clear session entries on quit:", error);
  }
});
```

### 発火タイミング

| イベント                       | アクション                         | 備考                             |
| ------------------------------ | ---------------------------------- | -------------------------------- |
| `before-quit`                  | `revokeSessionEntries("app-quit")` | アプリ終了時                     |
| `permission:clear-session` IPC | `revokeSessionEntries(sessionId)`  | スキル実行完了時（Renderer起点） |

## 変更対象ファイル一覧

| #   | ファイル                                                  | 変更種別 | 内容                                                                                                        |
| --- | --------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | `packages/shared/src/types/permission-store.ts`           | 拡張     | `AllowedToolEntryV2`, `IPermissionStoreV2`, `PermissionStoreSchemaV2`, `calcExpiresAt`, `ExpiryPolicy` 追加 |
| 2   | `packages/shared/src/types/index.ts`                      | 拡張     | 新型のエクスポート追加                                                                                      |
| 3   | `packages/shared/index.ts`                                | 拡張     | 新型のエクスポート追加（必要な場合）                                                                        |
| 4   | `apps/desktop/src/main/services/skill/PermissionStore.ts` | 拡張     | V2 メソッド追加、マイグレーション、キャッシュ型変更                                                         |
| 5   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`  | 拡張     | `permission:clear-session` ハンドラ追加                                                                     |
| 6   | `apps/desktop/src/preload/channels.ts`                    | 拡張     | `PERMISSION_CLEAR_SESSION` チャンネル定数追加                                                               |
| 7   | `apps/desktop/src/main/index.ts`（または相当）            | 拡張     | `before-quit` フック追加                                                                                    |

## テスト対象ファイル

| #   | ファイル                                                                 | 変更種別 | 内容                                      |
| --- | ------------------------------------------------------------------------ | -------- | ----------------------------------------- |
| 1   | `packages/shared/src/types/__tests__/permission-store.test.ts`           | 新規     | `calcExpiresAt` 単体テスト                |
| 2   | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts` | 拡張     | V2 メソッドテスト、マイグレーションテスト |
| 3   | `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts`  | 拡張     | `permission:clear-session` ハンドラテスト |

## リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                                                            |
| ---------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------- |
| V1→V2 マイグレーションでの既存データ破損 | 高     | 低       | マイグレーション関数の単体テスト、元データ保全                                                  |
| `allowedAt` 型不一致（string vs number） | 中     | 高       | V1 は ISO8601 string、V2 は引き続き string を維持し、`calcExpiresAt` 呼び出し時のみ ms 変換     |
| セッション終了タイミングの競合           | 中     | 中       | `before-quit` イベントは同期的に処理                                                            |
| `expiryPolicy` vs `expiresAt` 不整合     | 高     | 中       | `allowToolV2` で session/permanent は `expiresAt` を強制 `undefined` にリセットするガードを実装 |
| 強制終了時の session エントリ残存        | 中     | 低       | SIGKILL 等で `before-quit` 未発火の場合、次回起動時のクリーンアップを将来タスクとして検討       |
| `allowedAt` の NaN 変換リスク            | 高     | 低       | `new Date(allowedAt).getTime()` が NaN を返す場合の防御ガード（`isNaN` チェック）を追加         |
| 既存テストの破壊                         | 中     | 中       | V1 シグネチャの後方互換性を維持                                                                 |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                             |
| ------------------ | ---- | ---------------------------------------------------- |
| セキュリティ       | 適用 | IPC ハンドラの入力バリデーション（P42準拠）          |
| アーキテクチャ     | 適用 | レイヤー依存方向（shared→desktop 一方向）            |
| エラーハンドリング | 適用 | electron-store 読み書きエラーの graceful degradation |
| IPC通信            | 適用 | `ipc-contract-checklist.md` Phase 1-6 準拠           |

## 成果物

| 成果物 | パス                        | 説明           |
| ------ | --------------------------- | -------------- |
| 設計書 | `outputs/phase-2/design.md` | 本ドキュメント |

## 完了条件

- [x] アーキテクチャ設計が定義されている
- [x] 型定義設計が完了している
- [x] IPC チャンネル設計が完了している
- [x] マイグレーション戦略が定義されている
- [x] 変更対象ファイル一覧が明確である
- [x] リスクと対策が記述されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
