# PermissionResolver 実装ガイド

## メタ情報

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| クラス名 | PermissionResolver                                           |
| パス     | `apps/desktop/src/main/services/skill/PermissionResolver.ts` |
| タスク   | TASK-3-2                                                     |
| 作成日   | 2026-01-25                                                   |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 役割

PermissionResolver は、**スキル実行時の権限確認を管理するコンポーネント**です。

AIエージェントがツール（ファイル操作やコマンド実行など）を使用しようとする際、
ユーザーの許可が必要な場合があります。PermissionResolver は、
ユーザーが許可するまで処理を待機し、その結果を実行処理に返します。

## 使用シナリオ

```
1. スキル実行中に危険なツール（ファイル削除など）が呼ばれる
2. Main Process が Renderer に権限確認ダイアログを表示させる
3. PermissionResolver がユーザー応答を待機
4. ユーザーが「許可」または「拒否」を選択
5. PermissionResolver が結果を返し、実行が続行/中止
```

### 具体例

例えば、AIエージェントが「このファイルを削除していいですか？」と確認する場合：

1. **エージェント**: 「ファイルを削除したい」
2. **システム**: 「ユーザーに確認が必要」→ ダイアログ表示
3. **PermissionResolver**: ユーザーの回答を待機中...
4. **ユーザー**: 「許可する」をクリック
5. **PermissionResolver**: 「許可されました」と回答
6. **エージェント**: ファイル削除を実行

## 他コンポーネントとの関係

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Process                             │
│                                                              │
│  ┌──────────────┐     ┌────────────────────┐                │
│  │SkillExecutor │────▶│ PermissionResolver │                │
│  └──────────────┘     └────────────────────┘                │
│         │                      ▲                             │
│         │                      │                             │
│         ▼                      │                             │
│  ┌──────────────┐     ┌────────────────────┐                │
│  │ IPC Handler  │────▶│  resolveRequest()  │                │
│  └──────────────┘     └────────────────────┘                │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │ IPC
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                          │
│                                                              │
│  ┌────────────────────┐                                      │
│  │ PermissionDialog   │  ← ユーザーが操作                    │
│  └────────────────────┘                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### コンポーネント説明

| コンポーネント     | 役割                                            |
| ------------------ | ----------------------------------------------- |
| SkillExecutor      | スキルを実行し、必要に応じて権限確認を要求      |
| PermissionResolver | ユーザー応答を待機・管理                        |
| IPC Handler        | Renderer からの応答を PermissionResolver に中継 |
| PermissionDialog   | ユーザーに権限確認ダイアログを表示              |

---

# Part 2: 技術的詳細（開発者向け）

## インポート

```typescript
import { PermissionResolver } from "@repo/desktop/main/services/skill";
```

## コンストラクタ

```typescript
new PermissionResolver(defaultTimeout?: number)
```

| パラメータ       | 型     | デフォルト | 説明                       |
| ---------------- | ------ | ---------- | -------------------------- |
| `defaultTimeout` | number | 300000     | タイムアウト時間（ミリ秒） |

## メソッド

### waitForResponse

権限応答を待機します。

```typescript
waitForResponse(
  requestId: string,
  signal?: AbortSignal
): Promise<SkillPermissionResponse>
```

| パラメータ  | 型          | 必須 | 説明                       |
| ----------- | ----------- | ---- | -------------------------- |
| `requestId` | string      | ✅   | 権限リクエストの一意識別子 |
| `signal`    | AbortSignal | ❌   | キャンセル用 AbortSignal   |

| 戻り値                             | 説明                 |
| ---------------------------------- | -------------------- |
| `Promise<SkillPermissionResponse>` | 権限応答オブジェクト |

| 例外               | 条件               |
| ------------------ | ------------------ |
| `Error: timed out` | タイムアウト発生時 |
| `Error: aborted`   | AbortSignal 発火時 |

### resolveRequest

待機中の権限リクエストを解決します。

```typescript
resolveRequest(response: SkillPermissionResponse): void
```

| パラメータ | 型                      | 説明     |
| ---------- | ----------------------- | -------- |
| `response` | SkillPermissionResponse | 権限応答 |

**注意**: 存在しない `requestId` の場合は何もしません（エラーなし）。

### cancelRequest

指定した権限リクエストをキャンセルします。

```typescript
cancelRequest(requestId: string, reason?: string): void
```

| パラメータ  | 型     | 必須 | 説明           |
| ----------- | ------ | ---- | -------------- |
| `requestId` | string | ✅   | リクエストID   |
| `reason`    | string | ❌   | キャンセル理由 |

### cancelAll

全ての待機中リクエストをキャンセルします。

```typescript
cancelAll(): void
```

### pendingCount

待機中のリクエスト数を取得します。

```typescript
get pendingCount(): number
```

## 使用例

### 基本的な使用

```typescript
const resolver = new PermissionResolver();

// 権限確認を待機
const promise = resolver.waitForResponse("request-123");

// 別のコンテキスト（IPC Handler）で解決
resolver.resolveRequest({
  requestId: "request-123",
  approved: true,
});

const response = await promise;
if (response.approved) {
  // ツール実行を続行
} else {
  // 実行を中止
}
```

### AbortSignal でのキャンセル

```typescript
const controller = new AbortController();
const resolver = new PermissionResolver();

const promise = resolver.waitForResponse("request-456", controller.signal);

// 別の場所でキャンセル
controller.abort();

try {
  await promise;
} catch (error) {
  // Error: Permission request aborted: request-456
}
```

### タイムアウトの設定

```typescript
// 1分でタイムアウト
const resolver = new PermissionResolver(60_000);
```

## 内部設計

### データ構造

```typescript
interface PendingRequest {
  resolve: (response: SkillPermissionResponse) => void;
  reject: (error: Error) => void;
  timeoutId: NodeJS.Timeout;
}
```

### プライベートメソッド

| メソッド            | 責務                     |
| ------------------- | ------------------------ |
| `setupTimeout`      | タイムアウトタイマー設定 |
| `setupAbortHandler` | AbortSignal リスナー設定 |
| `cleanup`           | タイマークリア + Map削除 |

## 注意事項

1. **タイムアウト**: 設定時間経過後は `Error` がスローされる
2. **AbortSignal**: キャンセル時は即座に `Error` で reject
3. **存在しない requestId**: `resolveRequest` / `cancelRequest` はエラーを投げない
4. **メモリリーク防止**: 全てのケースでタイマーがクリアされる
5. **並行処理**: 複数リクエストを同時に管理可能（Map による O(1) アクセス）

## 関連タスク

| タスク   | 内容                              |
| -------- | --------------------------------- |
| TASK-1-1 | 型定義（SkillPermissionResponse） |
| TASK-4-2 | IPC Handlers 実装                 |
| TASK-8c  | E2E 統合テスト                    |
