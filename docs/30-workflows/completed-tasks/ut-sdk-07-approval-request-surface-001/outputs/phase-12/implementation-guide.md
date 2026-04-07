# Phase 12 - 実装ガイド

## Part 1: 中学生レベルの説明

### なぜこの機能が必要か

AI アシスタントが「ファイルを削除します」「外部サービスに送信します」といった重要な操作を行う前に、ユーザーに確認を求める仕組みが必要です。
確認なしでは AI が自動で危険な操作を実行してしまう可能性があります。

### 承認要求とは何か

#### 日常生活での例え

友だちから「この自転車、借りてもいい？」と聞かれて、あなたが「いいよ」か「今はだめ」と返す場面に似ています。
この「聞く」側が AI、「答える」側がユーザーです。このやり取りを画面上で実現するのが本機能です。

たとえば、AI が「このファイルを削除しますが、よいですか？」と画面に表示して、ユーザーが「承認」か「拒否」を選べるようにする仕組みです。

#### この機能が追加する前に何が起きていたか

「承認をお願いする」（`onApprovalRequest`）という窓口が存在しなかったため、AI から承認要求が届いても、アプリがそれを受け取って画面に表示することができませんでした。

#### この機能が追加した後に何が変わるか

AI が「これをやっていいですか？」と尋ねてくると、アプリが受け取って画面にダイアログ（ApprovalSheet）を表示します。ユーザーが「承認」か「拒否」を選ぶと、その返答が AI に送り返されます。

---

## Part 2: 技術者向け実装説明

### 変更概要

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 変更タイプ | 新規メソッド追加（preload API 拡張）+ UI 条件レンダリング + 応答中ロック追加 |
| 影響範囲   | `skill-creator-api.ts`（preload）、`SkillLifecyclePanel.tsx`（renderer）     |
| テスト     | 20 件追加（TC-APPR-01〜20）                                                  |
| 破壊的変更 | なし                                                                         |

---

### API シグネチャ

```typescript
// SkillCreatorAPI interface（追加分）
interface SkillCreatorAPI {
  // 既存
  respondToApproval(
    sessionId: string,
    operationId: string,
    action: "approve" | "reject",
  ): Promise<IpcResult<unknown>>;
  getDisclosureInfo(): Promise<IpcResult<unknown>>;
  onDisclosureInfo(callback: (info: DisclosureInfo) => void): () => void;

  // 今回追加
  onApprovalRequest(callback: (request: ApprovalRequest) => void): () => void;
}

// ApprovalRequest 型（参照）
interface ApprovalRequest {
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
}
```

---

### 設定と定数

```typescript
// IPC チャンネル定数（既存定義 — 変更なし）
const APPROVAL_CHANNELS = {
  APPROVAL_REQUEST: "skill-creator:approval:request", // Main → Renderer
  APPROVAL_RESPOND: "skill-creator:approval:respond", // Renderer → Main
} as const;
```

---

### 変更ファイル詳細

#### 1. `apps/desktop/src/preload/skill-creator-api.ts`

**変更内容**: `SkillCreatorAPI` interface に `onApprovalRequest` メソッドを追加し、`safeOn` パターンで実装。

```typescript
// interface に追加
onApprovalRequest(callback: (request: ApprovalRequest) => void): () => void;

// 実装
onApprovalRequest(callback: (request: ApprovalRequest) => void): () => void {
  return safeOn(APPROVAL_CHANNELS.APPROVAL_REQUEST, callback);
}
```

**設計ポイント**:

- `safeOn` パターンで IPC チャンネルを購読（`onDisclosureInfo` と同パターン）
- 返り値は unsubscribe 関数（`() => void`）。React の `useEffect` cleanup と互換
- `APPROVAL_CHANNELS.APPROVAL_REQUEST` チャンネルを使用（IPC 契約対称性を維持）

---

#### 2. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**変更内容**: `ApprovalSheet` 再利用、`pendingApproval` state 追加、`handleApprove`/`handleReject` 追加、`useEffect` cleanup、応答中ロック追加。

```typescript
// state 追加
const [localError, setLocalError] = useState<string | null>(null);
const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);
const [isApprovalResponding, setIsApprovalResponding] = useState(false);

// useEffect で購読（cleanup 付き）
useEffect(() => {
  const api = getSkillCreatorApi();
  if (!api) return;
  const unsubscribe = api.onApprovalRequest((request) => {
    setLocalError(null);
    setIsApprovalResponding(false);
    setPendingApproval(request);
  });
  return unsubscribe; // cleanup
}, []);

// ハンドラ
const handleApprove = async () => {
  if (!pendingApproval) return;
  if (isApprovalResponding) return;
  setIsApprovalResponding(true);
  const result = await skillCreatorAPI.respondToApproval(
    pendingApproval.sessionId,
    pendingApproval.operationId,
    "approve",
  );
  if (!result.success) {
    setLocalError(result.error ?? "承認応答に失敗しました。");
    setIsApprovalResponding(false);
    return;
  }
  setPendingApproval(null);
  setIsApprovalResponding(false);
};

const handleReject = async () => {
  if (!pendingApproval) return;
  if (isApprovalResponding) return;
  setIsApprovalResponding(true);
  const result = await skillCreatorAPI.respondToApproval(
    pendingApproval.sessionId,
    pendingApproval.operationId,
    "reject",
  );
  if (!result.success) {
    setLocalError(result.error ?? "拒否応答に失敗しました。");
    setIsApprovalResponding(false);
    return;
  }
  setPendingApproval(null);
  setIsApprovalResponding(false);
};

// 条件レンダリング
{pendingApproval && (
  <ApprovalSheet
    operationType={pendingApproval.operationType}
    description={pendingApproval.description}
    destination={pendingApproval.destination}
    aiServiceName={disclosureInfo?.aiServiceName ?? "AI"}
    externalDestinations={disclosureInfo?.externalDestinations ?? []}
    onApprove={handleApprove}
    onReject={handleReject}
    isResponding={isApprovalResponding}
  />
)}
```

**設計ポイント**:

- `ApprovalSheet` は既存コンポーネントを再利用（新規 UI 実装ゼロ）
- `pendingApproval === null` の場合は `ApprovalSheet` 非表示（既存 UI への影響なし）
- `useEffect` cleanup で確実に unsubscribe（メモリリーク防止）
- `respondToApproval` 成功後のみ `setPendingApproval(null)` でリセットし、失敗時はシートを維持して再試行可能にする
- 応答中は `ApprovalSheet` の操作ボタンを無効化し、二重送信を防止する

---

### 使用例

React コンポーネント内での典型的な使用パターン：

```typescript
// SkillLifecyclePanel.tsx — 抜粋
import { useState, useEffect } from "react";
import { getSkillCreatorApi } from "@/lib/skill-creator-api";
import { ApprovalSheet } from "@/components/approval/ApprovalSheet";
import type { ApprovalRequest } from "@/types/approval";

export function SkillLifecyclePanel() {
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);
  const [disclosureInfo] = useState<{
    aiServiceName: string;
    externalDestinations: string[];
  } | null>(null);
  const [isApprovalResponding, setIsApprovalResponding] = useState(false);

  useEffect(() => {
    const api = getSkillCreatorApi();
    if (!api) return; // API 未設定時はスキップ（エッジケース）
    const unsubscribe = api.onApprovalRequest((request) => {
      setPendingApproval(request);
      setIsApprovalResponding(false);
    });
    return unsubscribe; // React cleanup → unsubscribe 自動実行
  }, []);

  return (
    <>
      {/* 既存コンテンツ */}
      {pendingApproval && (
        <ApprovalSheet
          operationType={pendingApproval.operationType}
          description={pendingApproval.description}
          destination={pendingApproval.destination}
          aiServiceName={disclosureInfo?.aiServiceName ?? "AI"}
          externalDestinations={disclosureInfo?.externalDestinations ?? []}
          onApprove={async () => {
            if (isApprovalResponding) {
              return;
            }
            setIsApprovalResponding(true);
            const result = await skillCreatorAPI.respondToApproval(
              pendingApproval.sessionId,
              pendingApproval.operationId,
              "approve",
            );
            if (!result.success) {
              setLocalError(result.error ?? "承認応答に失敗しました。");
              setIsApprovalResponding(false);
              return;
            }
            setPendingApproval(null);
            setIsApprovalResponding(false);
          }}
          onReject={async () => {
            if (isApprovalResponding) {
              return;
            }
            setIsApprovalResponding(true);
            const result = await skillCreatorAPI.respondToApproval(
              pendingApproval.sessionId,
              pendingApproval.operationId,
              "reject",
            );
            if (!result.success) {
              setLocalError(result.error ?? "拒否応答に失敗しました。");
              setIsApprovalResponding(false);
              return;
            }
            setPendingApproval(null);
            setIsApprovalResponding(false);
          }}
          isResponding={isApprovalResponding}
        />
      )}
    </>
  );
}
```

---

### エラーハンドリング

| 状況                           | 挙動                                               |
| ------------------------------ | -------------------------------------------------- |
| `getSkillCreatorApi()` が null | `useEffect` 内で早期 return、購読なし（安全）      |
| `respondToApproval` が例外     | catch で localError を設定し、ApprovalSheet は維持 |
| IPC チャンネル受信が重複       | `setPendingApproval` 上書き（TC-APPR-13 で検証済） |
| コンポーネントアンマウント     | `useEffect` cleanup で unsubscribe 自動実行        |

---

### エッジケース

| エッジケース                           | 対応方法                                            |
| -------------------------------------- | --------------------------------------------------- |
| API 未設定（テスト環境・SSR）          | `if (!api) return` で早期 return（購読スキップ）    |
| 多重購読（コンポーネント再マウント）   | React の `useEffect` cleanup が前の購読を解除       |
| `respondToApproval` 失敗後の状態       | `setPendingApproval(null)` は成功時のみ呼ばれる設計 |
| `pendingApproval` が null 時のクリック | guard `if (!pendingApproval) return` で防止         |

---

### Phase 11 スクリーンショット証跡

本タスクは UI task のため、Phase 11 で以下 4 画像を証跡対象とした。

- `outputs/phase-11/screenshots/TC-11-UI-01-approval-request.png`
- `outputs/phase-11/screenshots/TC-11-UI-02-after-approve.png`
- `outputs/phase-11/screenshots/TC-11-UI-03-after-reject.png`
- `outputs/phase-11/screenshots/TC-11-UI-04-with-disclosure.png`

ただし worktree 環境制約により Electron capture は `CAPTURE_BLOCKED`。未実施分は以下に formalize 済み。

- `docs/30-workflows/unassigned-task/ut-sdk-07-approval-request-surface-001-phase11-screenshot.md`

代替 evidence として unit test（TC-APPR-01〜20）を採用し、`outputs/phase-11/manual-test-result.md` と `outputs/phase-11/evidence-index.md` に記録済み。

---

### アーキテクチャ上の位置づけ

```
Main Process
  └─ IPC: APPROVAL_CHANNELS.APPROVAL_REQUEST （送信）
          ↓
Preload Layer
  └─ skill-creator-api.ts: onApprovalRequest() （safeOn ラッパー）
          ↓
Renderer Layer
  └─ SkillLifecyclePanel.tsx: pendingApproval state
          ↓
          └─ ApprovalSheet コンポーネント（条件表示）
                    ↓
          ユーザー承認/拒否
                    ↓
  └─ respondToApproval() → IPC: APPROVAL_CHANNELS.APPROVAL_RESPOND
          ↓
Main Process （承認結果受信）
```

---

### `onDisclosureInfo` との対称性

本実装は `onDisclosureInfo` と完全に同パターンで設計されている。

| 項目              | `onDisclosureInfo`         | `onApprovalRequest`（今回）          |
| ----------------- | -------------------------- | ------------------------------------ |
| IPC チャンネル    | `DISCLOSURE_CHANNELS.INFO` | `APPROVAL_CHANNELS.APPROVAL_REQUEST` |
| state             | `disclosureInfo`           | `pendingApproval`                    |
| UI コンポーネント | `SessionDisclosureBanner`  | `ApprovalSheet`                      |
| cleanup           | useEffect unsubscribe      | useEffect unsubscribe                |

### Phase 11 証跡参照

Visual TC は worktree 環境制約により CAPTURE_BLOCKED になっているため、実スクリーンショットは未取得のまま残している。
現在の証跡は unit テスト群と未タスク化された blocker 記録で補完している。

| 証跡種別                     | パス                                                                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                                                                                                                                                                                                      |
| 証跡インデックス             | `outputs/phase-11/evidence-index.md`                                                                                                                                                                                                                          |
| スクリーンショット計画       | `outputs/phase-11/screenshot-plan.md` / `outputs/phase-11/screenshot-plan.json`                                                                                                                                                                               |
| 未タスク記録                 | `docs/30-workflows/unassigned-task/ut-sdk-07-approval-request-surface-001-phase11-screenshot.md`                                                                                                                                                              |
| 取得予定の screenshot 出力先 | `outputs/phase-11/screenshots/TC-11-UI-01-approval-request.png` / `outputs/phase-11/screenshots/TC-11-UI-02-after-approve.png` / `outputs/phase-11/screenshots/TC-11-UI-03-after-reject.png` / `outputs/phase-11/screenshots/TC-11-UI-04-with-disclosure.png` |

---

_作成日: 2026-04-06_
_Phase 12 ドキュメント更新_
