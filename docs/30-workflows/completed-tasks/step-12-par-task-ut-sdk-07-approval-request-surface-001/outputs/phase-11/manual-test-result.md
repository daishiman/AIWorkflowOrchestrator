# Phase 11 成果物: 手動テスト結果

## テスト日: 2026-04-06

## 手動テスト環境

Electron の実機起動ではなく、`ApprovalRequestPanel` を実コンポーネントとして
読み込む Playwright ハーネスで visual audit を実施した。
これにより `approval:request` surface の pending / expired / approved / rejected を
6 枚のスクリーンショットとして保存できた。

---

## AC-2: Renderer に approval 確認 UI が表示される

### 自動テスト代替検証

| 検証項目                               | テストケース | 結果   |
| -------------------------------------- | ------------ | ------ |
| approval:request 受信後に UI 表示      | TC-012       | ✓ PASS |
| operationType・description 表示        | TC-004       | ✓ PASS |
| 承認・拒否ボタン表示（pending）        | TC-005       | ✓ PASS |
| TTL 超過で expired 状態 + ボタン無効化 | TC-006       | ✓ PASS |
| 期限切れメッセージ表示                 | TC-006       | ✓ PASS |
| null の場合は表示なし                  | TC-007       | ✓ PASS |

### UI 仕様（実装済みの要素）

`ApprovalRequestPanel` は `SkillLifecyclePanel` 内で次の状態を表現する。

- `pending`: 承認ボタン / 拒否ボタンが有効
- `resolving`: 送信中で二重送信を防止
- `expired`: TTL 超過でボタン無効化

---

## AC-3: approve/reject 操作の接続

- `respondToApproval(sessionId, operationId, action)` が `approve` / `reject` の両方で呼ばれる
- `respondToApproval()` が `success:false` を返した場合はエラーバナーを表示し、UI を `resolving` で固めない

---

## AC-4: enforcement の確認

- approval なしに `respondToApproval` は呼ばれない
- expired 後はボタンが無効化され操作不可
- `safeOn` によるチャネル検証で不正チャネルからのイベントは無視される
- 画面証跡は `outputs/phase-11/screenshots/` に保存済み

---

## スクリーンショット一覧

| TC    | ファイル名                          | 状態             |
| ----- | ----------------------------------- | ---------------- |
| TC-01 | `TC-01-approval-pending-light.png`  | pending / light  |
| TC-02 | `TC-02-approval-pending-dark.png`   | pending / dark   |
| TC-03 | `TC-03-approval-expired-light.png`  | expired / light  |
| TC-04 | `TC-04-approval-expired-dark.png`   | expired / dark   |
| TC-05 | `TC-05-approval-approved-light.png` | approved / light |
| TC-06 | `TC-06-approval-rejected-light.png` | rejected / light |

スクリーンショットの取得ハーネス:

- `apps/desktop/src/renderer/phase11-approval-request-surface.html`
- `apps/desktop/src/renderer/phase11-approval-request-surface.tsx`
- `apps/desktop/scripts/capture-ut-sdk-07-approval-request-surface-phase11.mjs`

---

## 完了確認

- [x] AC-2 を実コンポーネント経由で検証した
- [x] AC-4 enforcement を確認した
- [x] スクリーンショット 6 枚を保存した
- [x] 本Phase内の全タスクを100%実行完了
