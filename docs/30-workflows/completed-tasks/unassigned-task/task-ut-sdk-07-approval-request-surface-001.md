# UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: Skill Creator preload / renderer に approval:request surface を追加

## メタ情報

```yaml
issue_number: 1694
task_id: UT-SDK-07-APPROVAL-REQUEST-SURFACE-001
task_name: Skill Creator preload / renderer に approval:request surface を追加
category: 実装
target_feature: Skill Creator approval request UI surface
priority: 中
scale: 中規模
status: 完了
source_phase: TASK-SDK-07 Phase 12 unassigned-task-detection（2026-03-28）
created_date: 2026-03-28
dependencies: [TASK-SDK-07]
```

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001                                |
| タスク名     | Skill Creator preload / renderer に approval:request surface を追加   |
| 分類         | 実装                                                                  |
| 対象機能     | `approval:request` channel の Skill Creator 側受信 / UI 表示          |
| 優先度       | 中                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | 完了                                                                  |
| 発見元       | TASK-SDK-07 Phase 12 AC-4 一部確認（approval request surface 未接続） |
| 発見日       | 2026-03-28                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task07 Phase 12 で AC-4 を確認した結果、disclosure 側は `getDisclosureInfo()` / `fetchDisclosureInfo()` で接続済みだが、**approval request surface**（Main → Renderer への `approval:request` push）が未接続のまま閉じた。`skillCreatorAPI.respondToApproval()` は実装済みだが、approval request を受け取って UI に表示する Renderer 側の surface が存在しない。

### 1.2 問題点・課題

- `approval:request` channel の Main → Renderer イベントを受信する listener が未実装
- ユーザーが approval/reject を判断するための UI コンポーネントが未実装
- `respondToApproval()` は実装済みだが、呼び出しトリガーとなる UI がない

### 1.3 放置した場合の影響

- Skill Creator の危険操作（高権限 tool 実行など）が approval なしに進む
- AC-4 の「危険操作の確認（approval）」が Renderer レベルで機能しない

---

## 2. 何を達成するか（What）

### 2.1 目的

`approval:request` イベントを受信して UI に表示し、ユーザーが approve/reject を選択できる surface を Skill Creator に追加する。

### 2.2 最終ゴール

- `approval:request` channel の onEvent listener を preload に追加
- `SkillLifecyclePanel` または専用コンポーネントで approval 確認 UI を表示
- ユーザーの approve/reject 操作が `respondToApproval()` を呼び出す
- approval TTL（300s）超過時の expired 表示対応

### 2.3 スコープ

#### 含むもの

- `approval:request` onEvent listener の preload 追加
- approval 確認 UI コンポーネントの実装
- `respondToApproval()` との接続

#### 含まないもの

- approval TTL の変更
- Main 側の ApprovalGate 変更（既に実装済み）

---

## 3. 実行手順

1. `apps/desktop/src/preload/channels.ts` の `APPROVAL_REQUEST` channel を確認
2. `apps/desktop/src/preload/skill-creator-api.ts` に `onApprovalRequest` listener を追加
3. `SkillCreatorAPI` interface に `onApprovalRequest` を追加
4. `SkillLifecyclePanel.tsx` で approval request を受信して UI 表示
5. approve/reject ボタンから `respondToApproval()` を呼び出す
6. TTL expired の場合は警告メッセージを表示

---

## 4. 完了条件チェックリスト

- [ ] `approval:request` onEvent が preload に登録されている
- [ ] Renderer に approval 確認 UI が表示される
- [ ] approve/reject 操作が `respondToApproval()` と接続されている
- [ ] AC-4 enforcement の手動テスト screenshot あり

---

## 5. 参照情報

- `apps/desktop/src/preload/skill-creator-api.ts`（`respondToApproval` 実装済み）
- `apps/desktop/src/main/ipc/approvalHandlers.ts`（Main 側 approval handler）
- `apps/desktop/src/main/services/runtime/ApprovalGate.ts`（TTL / single-use 実装）
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`（approval lifecycle テスト）
- `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-12/implementation-guide.md`（AC-4）

---

## 完了記録

2026-04-06 に本タスクの実装・テスト・スクリーンショット証跡・Phase 12/13
ドキュメント更新まで完了した。canonical な成果物は
`docs/30-workflows/step-12-par-task-ut-sdk-07-approval-request-surface-001/` に集約されている。
