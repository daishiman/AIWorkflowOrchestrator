# TASK-SKILL-CREATOR-EXECUTE-PLAN-CONSUMER-ALIGNMENT-001: executePlan consumer 契約整合

## メタ情報

| 項目     | 値                                                                                            |
| -------- | --------------------------------------------------------------------------------------------- |
| タスクID | TASK-SKILL-CREATOR-EXECUTE-PLAN-CONSUMER-ALIGNMENT-001                                        |
| 検出元   | TASK-FIX-EXECUTE-PLAN-FF-001 Phase 12 unassigned-task-detection（2026-04-01）                 |
| 優先度   | HIGH                                                                                          |
| 影響     | renderer 側の consumer が非ブロッキング化後の ack + snapshot 購読の両方に整合していない可能性 |
| 検出日   | 2026-04-01                                                                                    |

## 概要

`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` が `{ accepted: true, planId }` の ack と `onWorkflowStateChanged` による snapshot 購読の両方に整合するか再確認が必要。現在は `isSkillCreatorExecutePlanAck` type guard で一時吸収済みだが、正式な契約整合が未完了。

## 背景

TASK-FIX-EXECUTE-PLAN-FF-001 で `skill-creator:execute-plan` を fire-and-forget (非ブロッキング) へ移行した。これにより IPC レスポンスの形式が変わり:

1. **ack レスポンス**: `{ accepted: true, planId }` を即時返却
2. **非同期進捗通知**: `onWorkflowStateChanged` イベントを通じた snapshot 購読

renderer 側の consumer (`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`) が、両経路を正しくハンドリングしているか確認が必要。暫定措置として `isSkillCreatorExecutePlanAck` type guard を追加して吸収しているが、これが恒久的な設計として適切かどうかの判断が必要。

## 推定作業内容

- [ ] `SkillCreateWizard.tsx` が `{ accepted: true, planId }` ack を受け取り UI 遷移を行えているか確認
- [ ] `SkillLifecyclePanel.tsx` が `onWorkflowStateChanged` の snapshot を通じて状態更新できているか確認
- [ ] `isSkillCreatorExecutePlanAck` type guard の恒久的な配置先と責務を設計・確定する
- [ ] consumer 側の型定義が ack と snapshot の両方をカバーしているか確認
- [ ] ack 受信後に snapshot 購読が適切に開始されるフローをテストで検証する
- [ ] 既存テストが fire-and-forget 後のレスポンス形式変更に対応しているか確認・修正する

## 完了条件

- [ ] `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` が ack + snapshot 購読の両方に正式に対応している
- [ ] `isSkillCreatorExecutePlanAck` type guard の配置と責務が設計書に明記されている
- [ ] consumer 側の型が ack レスポンスと snapshot レスポンスを discriminated union で区別できている
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 苦戦箇所（TASK-FIX-EXECUTE-PLAN-FF-001 より）

### IPC consumer 契約差分の型安全性確保

- **困難だった理由**: `{ success: true }` → `{ accepted: true, planId }` への戻り値型変更時、既存 consumer（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`）との後方互換性を保つ設計判断が難しかった。ack と snapshot 購読の2経路が混在するため、型定義の整合点が曖昧になりやすい
- **採った解決策**: preload 層に `isSkillCreatorExecutePlanAck` type guard を導入し、compat path として一時吸収。ack 型を `SkillCreatorExecutePlanAck` として統一した
- **将来への知見**: IPC ハンドラーの戻り値型を変更する際は preload 層の type guard が有効な緩衝材になるが、consumer 側の完全整合は scope を超えるため別タスク化すること。contract drift を防ぐため、ack 型と snapshot 型は discriminated union で明示的に区別すること

## 関連

- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
  - `apps/desktop/src/preload/skill-creator-api.ts`
