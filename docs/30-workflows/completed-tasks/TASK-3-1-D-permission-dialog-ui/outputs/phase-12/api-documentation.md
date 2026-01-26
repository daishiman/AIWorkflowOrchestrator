# skillAPI Permission拡張 APIドキュメント

## 概要

TASK-3-1-DでskillAPIにPermission要求処理機能を追加。
Main Processからの権限確認リクエストをRenderer側で受信し、ユーザーの許可/拒否をMain Processに返送する。

## ファイル

- **実装**: `apps/desktop/src/preload/skill-api.ts`
- **型定義**: `packages/shared/src/types/skill.ts`
- **Window型拡張**: `apps/desktop/src/preload/types.d.ts`

## メソッド

### onPermission

Main ProcessからのPermission要求をリッスンするリスナーを登録する。

**シグネチャ**:

```typescript
onPermission: (callback: (request: SkillPermissionRequest) => void) => () => void
```

**引数**:

| 名前     | 型                                          | 説明                           |
| -------- | ------------------------------------------- | ------------------------------ |
| callback | `(request: SkillPermissionRequest) => void` | リクエスト受信時のコールバック |

**戻り値**:

| 型           | 説明                               |
| ------------ | ---------------------------------- |
| `() => void` | リスナー解除用のクリーンアップ関数 |

**使用例**:

```typescript
// リスナー登録
const cleanup = window.skillAPI.onPermission((request) => {
  console.log("Permission requested:", request.toolName);
  console.log("Args:", request.args);
});

// クリーンアップ（コンポーネントアンマウント時など）
cleanup();
```

### respondPermission

Permission要求に対してユーザーの応答を送信する。

**シグネチャ**:

```typescript
respondPermission: (response: SkillPermissionResponse) => Promise<boolean>;
```

**引数**:

| 名前     | 型                        | 説明             |
| -------- | ------------------------- | ---------------- |
| response | `SkillPermissionResponse` | 応答オブジェクト |

**戻り値**:

| 型                 | 説明                   |
| ------------------ | ---------------------- |
| `Promise<boolean>` | 送信成功時`true`を返す |

**使用例**:

```typescript
// 許可応答
await window.skillAPI.respondPermission({
  requestId: request.requestId,
  approved: true,
  rememberChoice: false,
});

// 拒否応答
await window.skillAPI.respondPermission({
  requestId: request.requestId,
  approved: false,
  rememberChoice: true,
});
```

## 型定義

### SkillPermissionRequest

```typescript
interface SkillPermissionRequest {
  /** 実行ID */
  executionId: string;
  /** リクエストID（応答時に使用） */
  requestId: string;
  /** ツール名（例: "Bash", "Write"） */
  toolName: string;
  /** サニタイズされた引数 */
  args: Record<string, unknown>;
  /** ユーザー向け理由説明（オプション） */
  reason?: string;
}
```

### SkillPermissionResponse

```typescript
interface SkillPermissionResponse {
  /** リクエストID（リクエストと紐付け） */
  requestId: string;
  /** 許可/拒否 */
  approved: boolean;
  /** 選択を記憶するか（オプション） */
  rememberChoice?: boolean;
}
```

## セキュリティ

- `safeOn`: 許可されたチャンネルのみリッスン可能
- `safeInvoke`: 許可されたチャンネルのみ送信可能
- ホワイトリスト: `channels.ts`で管理

## 関連ファイル

| ファイル                 | 役割                    |
| ------------------------ | ----------------------- |
| `channels.ts`            | IPCチャンネル定義       |
| `useSkillPermission.ts`  | Reactフック（状態管理） |
| `SkillStreamDisplay.tsx` | UIコンポーネント統合    |

## Date

2026-01-26
