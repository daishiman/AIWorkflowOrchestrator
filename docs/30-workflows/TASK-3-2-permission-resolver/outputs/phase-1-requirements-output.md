# Phase 1: 要件定義 - 成果物

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 1          |
| Phase名    | 要件定義   |
| 完了日時   | 2026-01-25 |
| ステータス | 完了       |
| 作成者     | Claude     |

---

## タスク 1: 機能要件の明確化 ✅

### 参照資料の確認

- **元タスク定義**: `docs/30-workflows/skill-import-agent-system/tasks/task-3-2-permission-resolver.md` 確認済み
- **型定義**: `packages/shared/src/types/skill.ts` 確認済み
  - `SkillPermissionRequest`: 権限確認リクエスト（Main → Renderer）
  - `SkillPermissionResponse`: 権限確認応答（Renderer → Main）

### 機能要件一覧

#### FR-1: 権限応答待機

- **メソッド**: `waitForResponse(requestId: string, signal?: AbortSignal): Promise<SkillPermissionResponse>`
- **責務**:
  - Promise を返し、権限応答を受信するまで待機
  - 設定されたタイムアウト時間が経過した場合は Error を throw
  - AbortSignal が発火した場合は即座に待機を中断し Error を throw
- **前提条件**: requestId は一意であること

#### FR-2: 権限リクエスト解決

- **メソッド**: `resolveRequest(response: SkillPermissionResponse): void`
- **責務**:
  - `response.requestId` に対応する待機中の Promise を解決
  - タイマーをクリア
  - pendingRequests から削除
- **例外**: 存在しない `requestId` の場合は何もしない（エラーなし）

#### FR-3: 個別キャンセル

- **メソッド**: `cancelRequest(requestId: string, reason?: string): void`
- **責務**:
  - 指定した requestId の待機を Error で reject
  - タイマーをクリア
  - pendingRequests から削除
- **例外**: 存在しない `requestId` の場合は何もしない（エラーなし）

#### FR-4: 全キャンセル

- **メソッド**: `cancelAll(): void`
- **責務**:
  - 全ての待機中リクエストを Error で reject
  - 全てのタイマーをクリア
  - pendingRequests を空にする

#### FR-5: 保留中リクエスト数

- **ゲッター**: `get pendingCount(): number`
- **責務**: 現在待機中のリクエスト数を返す

---

## タスク 2: 非機能要件の明確化 ✅

### NFR-1: タイムアウト

- デフォルト値: **300,000ms（5分）**
- コンストラクタのパラメータで設定可能
- タイムアウト時のエラーメッセージには `requestId` を含める

### NFR-2: 並行処理

- 複数のリクエストを同時に管理可能
- 各リクエストは独立して動作（干渉なし）
- Map を使用したO(1)アクセス

### NFR-3: メモリ管理

- 完了時: タイマークリア + Map からエントリ削除
- キャンセル時: タイマークリア + Map からエントリ削除
- タイムアウト時: タイマークリア + Map からエントリ削除
- メモリリークを防止するため、全てのケースでクリーンアップを保証

### NFR-4: AbortSignal 対応

- `abort` イベント時に即座に待機を中断
- タイマーをクリア
- Map からエントリを削除
- 適切なエラーメッセージで reject

---

## タスク 3: 受け入れ基準の策定 ✅

### AC-1: 正常系

- [x] `waitForResponse()` を呼び出し後、`resolveRequest()` で Promise が解決される
- [x] 解決値が渡された `SkillPermissionResponse` と完全一致する

### AC-2: タイムアウト

- [x] 設定時間経過後に Promise が reject される
- [x] エラーメッセージに `requestId` が含まれる
- [x] エラーメッセージに "timeout" または "timed out" が含まれる

### AC-3: AbortSignal

- [x] `signal.abort()` 呼び出しで Promise が即座に reject される
- [x] タイマーがクリアされる（リソースリーク防止）
- [x] エラーメッセージに "abort" が含まれる

### AC-4: キャンセル

- [x] `cancelRequest()` で指定したリクエストが reject される
- [x] `cancelAll()` で全てのリクエストが reject される
- [x] キャンセル後の `pendingCount` が正しく減少する

### AC-5: 存在しない requestId

- [x] `resolveRequest()` が例外を throw しない
- [x] `cancelRequest()` が例外を throw しない

### AC-6: pendingCount

- [x] 待機中リクエスト数が正確に反映される
- [x] `waitForResponse()` 呼び出しで増加する
- [x] `resolveRequest()` 後に減少する
- [x] `cancelRequest()` 後に減少する
- [x] タイムアウト後に減少する
- [x] `cancelAll()` 後に 0 になる

---

## 型定義の確認

### 使用する型（TASK-1-1 成果物より）

```typescript
// packages/shared/src/types/skill.ts より

/**
 * スキル実行時の権限確認リクエスト（Main → Renderer）
 */
export interface SkillPermissionRequest {
  /** 実行ID */
  executionId: string;
  /** リクエストID（応答のマッチング用） */
  requestId: string;
  /** ツール名 */
  toolName: string;
  /** ツール引数 */
  args: Record<string, unknown>;
  /** 確認を求める理由（オプション） */
  reason?: string;
}

/**
 * スキル実行時の権限確認レスポンス（Renderer → Main）
 */
export interface SkillPermissionResponse {
  /** リクエストID（リクエストとのマッチング用） */
  requestId: string;
  /** 承認されたかどうか */
  approved: boolean;
  /** この選択を記憶するか（オプション） */
  rememberChoice?: boolean;
  /** 拒否理由（オプション） */
  rejectReason?: string;
}
```

---

## Phase 1 完了条件チェック

- [x] 機能要件（FR-1〜FR-5）が定義されている
- [x] 非機能要件（NFR-1〜NFR-4）が定義されている
- [x] 受け入れ基準（AC-1〜AC-6）が策定されている
- [x] 各要件がテスト可能な形式で記述されている
- [x] 参照資料（型定義、元タスク仕様）を確認済み

---

## 次のPhase

Phase 2: 設計 へ進む

`docs/30-workflows/TASK-3-2-permission-resolver/phase-2-design.md`
