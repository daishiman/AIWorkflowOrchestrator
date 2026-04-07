# Phase 13 成果物: PR 前の変更サマリー

## 作成日: 2026-04-06

## タスク

**UT-SDK-07-APPROVAL-REQUEST-SURFACE-001**: Skill Creator に approval:request surface を追加

Issue: #1694

---

## 変更概要

Skill Creator の renderer プロセスに承認リクエスト確認 UI を追加する。
Main プロセスが発火する `approval:request` IPC イベントを preload 経由で受信し、
ユーザーが承認/拒否を操作できる UI を `SkillLifecyclePanel` 内に表示する。
あわせて `ApprovalRequestPayload` を shared 正本に寄せ、Phase 11 の visual evidence を
Playwright ハーネスで保存した。

---

## 変更ファイル詳細

### ソースファイル（変更）

#### `apps/desktop/src/preload/skill-creator-api.ts`

- `ApprovalRequestPayload` を shared alias として再公開
- `SkillCreatorAPI` interface に `onApprovalRequest` メソッドを追加
- `onApprovalRequest` の実装を追加（`safeOn<ApprovalRequestPayload>` パターン使用）

#### `apps/desktop/src/preload/types.ts`

- `ExecutionAPI.onApprovalRequest` を shared `ApprovalRequestPayload` へ同期

#### `apps/desktop/src/main/ipc/approvalHandlers.ts`

- `pushApprovalRequest` の引数型を shared `ApprovalRequestPayload` に統一

変更行数: +29

#### `apps/desktop/electron.vite.config.ts`

- `phase11-approval-request-surface.html` を renderer entry に追加

#### `apps/desktop/package.json`

- `screenshot:ut-sdk-07-approval-request-surface` script を追加

#### `packages/shared/src/types/skillCreator.ts`

- `ApprovalRequestPayload` の canonical 定義を追加

#### `packages/shared/src/types/index.ts`

- `ApprovalRequestPayload` を shared export に追加

#### `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

- `ApprovalRequestPanel` コンポーネントの import を追加
- `ApprovalRequestPayload` 型の import を追加
- `approvalRequest` state を追加
- `onApprovalRequest` リスナーの `useEffect` を追加（cleanup 付き）
- `handleApprovalApprove` / `handleApprovalReject` ハンドラを追加
- `respondToApproval()` の `success:false` を local error として表示
- JSX に `ApprovalRequestPanel` の条件付きレンダリングを追加

変更行数: +55

#### `apps/desktop/src/renderer/phase11-approval-request-surface.html`

- Phase 11 screenshot harness の HTML entry point 追加

#### `apps/desktop/src/renderer/phase11-approval-request-surface.tsx`

- `ApprovalRequestPanel` の pending / expired / approved / rejected を撮影する harness 追加

#### `apps/desktop/scripts/capture-ut-sdk-07-approval-request-surface-phase11.mjs`

- 6 状態の screenshot を自動保存する Playwright スクリプトを追加

### ソースファイル（新規追加）

#### `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx`

承認リクエスト確認 UI コンポーネント。

- props: `request: ApprovalRequestPayload | null`, `onApprove`, `onReject`
- 状態: `pending` / `resolving` / `expired`
- TTL カウントダウン: `useEffect` + `setInterval`（300s）
- `data-testid`: `approval-request-panel`, `approval-approve-button`, `approval-reject-button`, `approval-expired-message`, `approval-destination`

### テストファイル（新規追加）

| ファイル                                                                        | テスト数 | 内容                              |
| ------------------------------------------------------------------------------- | -------- | --------------------------------- |
| `src/preload/__tests__/skill-creator-api.approval.test.ts`                      | 7        | preload API・チャンネル登録テスト |
| `src/renderer/components/skill/__tests__/ApprovalRequestPanel.test.tsx`         | 11       | UI 状態・TTL・ボタン操作テスト    |
| `src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | 7        | 統合テスト                        |

**合計**: 25 tests / 全 PASS

---

## 変更なし（確認済み）

- `apps/desktop/src/preload/channels.ts` — `APPROVAL_REQUEST` チャンネルは既存定義を使用
- `apps/desktop/src/main/ipc/approvalHandlers.ts` — ロジック変更なし、shared 型へ統一
- `packages/shared/src/governance/ApprovalGate.ts` — 変更なし
- `outputs/phase-11/screenshots/` — 6 枚の screenshot evidence を追加

---

## PR タイトル（案）

```
feat(ui): UT-SDK-07 Skill Creator に approval:request 確認 UI を追加
```

## PR ボディ（案）

```markdown
## Summary

- `approval:request` IPC イベントを受信する preload `onApprovalRequest` リスナーを追加
- 承認リクエスト確認 UI `ApprovalRequestPanel` を新規作成（pending/resolving/expired 状態、TTL カウントダウン）
- `SkillLifecyclePanel` に統合し、approve/reject が `respondToApproval()` へ接続

## Test plan

- [ ] `pnpm --filter @repo/desktop test` → 25/25 PASS を確認
- [ ] `pnpm --filter @repo/desktop typecheck` → 0 errors を確認
- [ ] `pnpm --filter @repo/desktop screenshot:ut-sdk-07-approval-request-surface` → 6 枚の screenshot を確認
- [ ] Electron アプリ起動後、ApprovalRequestPanel の表示・ボタン操作を確認

Closes #1694
```

## 完了確認

- [x] 変更ファイルを一覧化
- [x] テスト数と結果を記録
- [x] PR タイトル・ボディ案を作成
- [x] 本Phase内の全タスクを100%実行完了
