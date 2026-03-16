# UT-06-003-PRELOAD-API-IMPL: Preload 層 SafetyGate API 実装

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスクID   | UT-06-003-PRELOAD-API-IMPL                  |
| タスク名   | Preload 層に evaluateSafety safeInvoke 追加 |
| 発見元     | UT-06-003 Phase 12                          |
| 優先度     | 高（priority:high）                         |
| 分類       | 実装                                        |
| ステータス | 未実施                                      |
| 作成日     | 2026-03-16                                  |

## 関連タスク

| タスクID                | 関係性                               | ステータス |
| ----------------------- | ------------------------------------ | ---------- |
| UT-06-003               | 親タスク（DefaultSafetyGate 実装）   | 完了       |
| TASK-SKILL-LIFECYCLE-08 | 後続（PermissionDialog で API 使用） | 未実施     |

## 目的

`skill:evaluate-safety` IPC ハンドラは Main Process 側に実装済みだが、Preload 層に safeInvoke 呼び出しが未実装のため、Renderer から SafetyGate 評価を呼び出せない。本タスクでは Preload 層の API を追加し、Renderer → Main の通信チェーンを完成させる。

## スコープ

### スコープ内

- ~~`apps/desktop/src/preload/channels.ts` に `SKILL_EVALUATE_SAFETY` チャンネル定数を追加~~ → **実装済み**（L359, ALLOWED_INVOKE_CHANNELS L631）
- `apps/desktop/src/preload/skill-api.ts` に `evaluateSafety(skillName: string)` メソッドを追加（safeInvoke 使用）
- `apps/desktop/src/preload/types.ts` に `SafetyGateResult` 等の型定義を追加
- P23/P32 準拠: Preload 型と shared 型の整合性確保

### スコープ外

- DefaultSafetyGate の実装変更（UT-06-003 で完了済み）
- PermissionDialog UI（TASK-SKILL-LIFECYCLE-08）

## 受入基準

- [ ] `window.electronAPI.skill.evaluateSafety(skillName)` が Renderer から呼び出し可能
- [ ] 戻り値が `SafetyGateResult` 型で返却される
- [ ] `SKILL_EVALUATE_SAFETY` チャンネル定数が `IPC_CHANNELS` に追加されている
- [ ] P42 準拠: skillName の 3 段バリデーションが Preload 側でも実施される
- [ ] 型チェック（`pnpm --filter @repo/desktop typecheck`）が通ること

## 参照資料

| 資料名            | パス                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| IPC ハンドラ実装  | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`                                                                |
| SafetyGate 型定義 | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts` |
| IPC 設計書        | `docs/30-workflows/safety-gate-implementation/outputs/phase-2/ipc-design.md`                                       |
