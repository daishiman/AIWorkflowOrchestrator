# Phase 12 成果物: 実装ガイド

## Part 1: 概念説明（中学生向け）

### 「承認リクエスト」とは？

AIアシスタントが危険な操作（例: システムファイルの書き換え）をしようとするとき、人間に「本当にやっていいですか？」と確認する仕組みです。

```
AI: 「/etc/hosts を書き換えようとしています。承認しますか？」
人間: 「承認する」または「拒否する」
AI: 「承認を受けました。実行します。」
```

### 情報の流れ

```
Main プロセス (Electron バックエンド)
    ↓ IPC チャンネル「approval:request」でメッセージを送信
Preload スクリプト (橋渡し役)
    ↓ onApprovalRequest() 経由で受け取り
Renderer プロセス (画面)
    ↓ ApprovalRequestPanel を表示
ユーザー (承認/拒否ボタンをクリック)
    ↓ respondToApproval() でメインプロセスに返信
Main プロセス (実行継続または中断)
```

### タイムアウト（期限切れ）

承認リクエストには5分（300秒）の期限があります。期限が切れると：

- ボタンが押せなくなる
- 「この承認リクエストは期限切れです」と表示される

---

## Part 2: 技術者向け詳細

### 変更ファイル一覧

| ファイル                                                              | 種別 | 変更内容                                                        |
| --------------------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | 変更 | `ApprovalRequestPayload` shared alias・`onApprovalRequest` 追加 |
| `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx` | 新規 | 承認確認UIコンポーネント                                        |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | 変更 | approval state と ApprovalRequestPanel の統合                   |
| `apps/desktop/src/preload/types.ts`                                   | 変更 | `ExecutionAPI.onApprovalRequest` を shared 型へ同期             |

### Preload 実装パターン

```typescript
// skill-creator-api.ts
import type {
  ApprovalRequestPayload as SharedApprovalRequestPayload,
} from "@repo/shared/types";

export type ApprovalRequestPayload = SharedApprovalRequestPayload;

// interface に追加
onApprovalRequest: (callback: (request: ApprovalRequestPayload) => void) => () => void;

// 実装
onApprovalRequest: (callback): (() => void) =>
  safeOn<ApprovalRequestPayload>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

`safeOn` は `ALLOWED_ON_CHANNELS` ホワイトリストを確認してからリスナーを登録し、クリーンアップ関数を返します。これによりメモリリークとチャンネルインジェクション攻撃を防ぎます。

### TTL カウントダウン実装

```typescript
const APPROVAL_TTL_MS = 300_000; // 300s（ApprovalGate.ts と合わせる）

useEffect(() => {
  if (!request) return;
  const startedAt = Date.now();

  const interval = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= APPROVAL_TTL_MS) {
      setStatus("expired");
      clearInterval(interval);
    } else {
      setRemainingSeconds(Math.ceil((APPROVAL_TTL_MS - elapsed) / 1000));
    }
  }, 1000);

  return () => clearInterval(interval); // cleanup
}, [request]);
```

### SkillLifecyclePanel への統合

```typescript
// state
const [approvalRequest, setApprovalRequest] =
  useState<ApprovalRequestPayload | null>(null);

// useEffect でリスナー登録（cleanup 付き）
useEffect(() => {
  if (!api?.onApprovalRequest) return;
  return api.onApprovalRequest((req) => setApprovalRequest(req));
}, [api]);

// JSX
{approvalRequest ? (
  <ApprovalRequestPanel
    request={approvalRequest}
    onApprove={handleApprovalApprove}
    onReject={handleApprovalReject}
  />
) : null}
```

### 失敗時の挙動

`respondToApproval()` が `success: false` を返した場合は、`SkillLifecyclePanel` が
`localError` にメッセージを入れ、`ApprovalRequestPanel` は `pending` に戻ります。
これにより、失敗時に画面が `resolving` のまま固まらないようにしています。

### テスト戦略

| テストファイル                          | テスト数 | テスト対象                         |
| --------------------------------------- | -------- | ---------------------------------- |
| `skill-creator-api.approval.test.ts`    | 7        | preload API・チャンネル登録        |
| `ApprovalRequestPanel.test.tsx`         | 11       | UI 状態・TTL・ボタン操作・失敗復帰 |
| `SkillLifecyclePanel.approval.test.tsx` | 7        | 統合動作・respondToApproval 接続   |

TTL テストは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` で実時間を使わずに高速実行します。

### Phase 11 スクリーンショット証跡

| TC番号 | ファイル名                          | 状態             |
| ------ | ----------------------------------- | ---------------- |
| TC-01  | `TC-01-approval-pending-light.png`  | pending / light  |
| TC-02  | `TC-02-approval-pending-dark.png`   | pending / dark   |
| TC-03  | `TC-03-approval-expired-light.png`  | expired / light  |
| TC-04  | `TC-04-approval-expired-dark.png`   | expired / dark   |
| TC-05  | `TC-05-approval-approved-light.png` | approved / light |
| TC-06  | `TC-06-approval-rejected-light.png` | rejected / light |

撮影ページ: `apps/desktop/src/renderer/phase11-approval-request-surface.html`
撮影スクリプト: `apps/desktop/scripts/capture-ut-sdk-07-approval-request-surface-phase11.mjs`

---

## 完了確認

- [x] Part 1（概念説明）作成
- [x] Part 2（技術詳細）作成
- [x] 本Phase内の全タスクを100%実行完了
