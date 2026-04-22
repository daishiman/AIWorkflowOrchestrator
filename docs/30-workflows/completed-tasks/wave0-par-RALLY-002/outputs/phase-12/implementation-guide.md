# Phase 12 成果物: 実装ガイド

## タスクID: TASK-RALLY-002

## Part 1: 中学生向けの説明

### なぜ必要か

アプリで質問に答えている途中に「ひとつ前の質問へ戻る」ことがあります。このとき、画面はすぐ前の質問を見せたいですが、サーバーから新しい情報もあとで届きます。

たとえば、学校のプリントを一時的に机の上へ戻しておいて、新しいプリントが先生から届いたら机の上の古いものを片づける、という整理に近いです。最初は「いま戻りたい質問」を優先して見せ、あとから届く最新情報に自然に切り替わるようにしました。

### 今回作ったもの

何をしたかというと、見た目を変えたのではなく、「なぜそう切り替わるのか」をコメントとテストでわかるようにしました。

## Part 2: 技術者向け詳細

### 変更概要

- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
  - `pendingRequest` 合成式直上に優先ルールコメントを追加
  - clear `useEffect` 直上に requestId ベースの依存意図を追加
- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`
  - S-1〜S-4 / X-1〜X-2 を追加

### 契約

```ts
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;

useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

### APIシグネチャ

```ts
type PendingRequestSource =
  | { kind: "restored"; requestId: string }
  | { kind: "snapshot"; requestId: string }
  | { kind: "none" };
```

実コードでは exported API を追加していないため、ここで管理対象となるのは `pendingRequest` の選択規則と clear `useEffect` の依存契約です。

### 使用例

```ts
// undo 直後
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;

// 新しい requestId 到着後
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

### シナリオ一覧

| ID  | 内容                                                           |
| --- | -------------------------------------------------------------- |
| S-1 | 通常フローでは `workflowSnapshot.awaitingUserInput` を使う     |
| S-2 | undo 後は `restoredPendingRequest` を優先する                  |
| S-3 | 新しい requestId 到着後に restored state をクリアする          |
| S-4 | `awaitingUserInput = null` の場合はクリアしない                |
| X-1 | restored state が `null` のときは更新の影響を受けない          |
| X-2 | 同一 requestId の参照更新では clear `useEffect` を再実行しない |

### エラーハンドリング

- `workflowSnapshot` が `null` のときは `pendingRequest = null`
- 入力送信失敗時は既存の `rollbackLastUserMessage()` と `onError` 経路を維持

### エッジケース

- `awaitingUserInput` が `null` の場合は restored state を維持する
- 同一 requestId の新参照が届いても不要な clear を行わない
- `workflowSnapshot` が更新されても requestId が変わらなければ契約は維持される

### 設定項目と定数一覧

| 項目           | 値 / 由来                                             | 用途                               |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| clear 判定キー | `workflowSnapshot?.awaitingUserInput?.requestId`      | restore state の解放タイミング制御 |
| 優先順         | `restoredPendingRequest ?? awaitingUserInput ?? null` | undo 復元を一時優先                |

### テスト構成

| ファイル                                    | 役割                               |
| ------------------------------------------- | ---------------------------------- |
| `ConversationalInterview.test.tsx`          | S-1〜S-4 / X-1〜X-2 のシナリオ契約 |
| `outputs/phase-6/regression-test-result.md` | 回帰観点の要約                     |
| `outputs/phase-7/coverage-check-result.md`  | coverage の追跡                    |

### 検証結果

- `eslint` 対象2ファイル: PASS
- `vitest`: esbuild binary mismatch により環境ブロック
- `typecheck`: 結果未確定

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

参照:

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/evidence-index.md`

## Handoff

- RALLY-010 以降は `pendingRequest` の表示契約を前提に UI 機能を追加する
- 「restore優先 → requestId更新で通常フロー復帰」のルールは維持する
