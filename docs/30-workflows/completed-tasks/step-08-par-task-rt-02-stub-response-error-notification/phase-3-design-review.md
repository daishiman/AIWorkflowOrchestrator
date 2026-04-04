# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 3                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

## 目的

提案した契約整理が最小複雑性であり、既存公開契約と整合するかを判定する。
**（2026-04-04 更新）** 実装済みコードを参照し、残課題の設計妥当性を再確認する。

## 実行タスク

- 型後方互換性を判定する → **PASS（実装済み型を確認）**
- 責務境界の妥当性を判定する → **PASS（部分実装を確認）**
- IPC 契約の一貫性を判定する → **PASS（実装済みを確認）**
- renderer UX の妥当性を判定する → **PASS（実装済みを確認）**
- `execute()` guard 設計の妥当性を判定する → **PASS（see §追加Gate）**

## 参照資料

| 資料名       | パス                      | 説明                                |
| ------------ | ------------------------- | ----------------------------------- |
| Phase 1 要件 | `phase-1-requirements.md` | current facts（2026-04-04更新済み） |
| Phase 2 設計 | `phase-2-design.md`       | 提案契約（2026-04-04更新済み）      |

## 判定

PASS（`execute()` guard まで実装済み、全 Gate PASS）

## Gate Summary

| Gate                        | 結果 | 根拠                                                                                                                        |
| --------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| G-01 型後方互換性           | PASS | `RuntimeSkillCreatorPlanResponse` は union 追加で閉じ、既存成功 shape を壊さない（実装確認済み）                            |
| G-02 責務境界               | PASS | Facade は reason code 決定、IPC は transport error 専用、renderer は表示と抑止のみ（実装確認済み）                          |
| G-03 実コード整合           | PASS | `execute()` の `SkillExecuteResult` 型と互換する `error: string` 形式の guard を採用                                        |
| G-04 UX 妥当性              | PASS | plan/execute の失敗理由が即時表示され、空の成功画面を回避できる（SkillLifecyclePanel.tsx / SkillCreateWizard.tsx 確認済み） |
| G-05 RT-01 / RT-03 競合回避 | PASS | shared type 追加なし、結果パネルの後続拡張を阻害しない                                                                      |
| G-06 execute() guard 設計   | PASS | `terminal_handoff` 後の integrated_api 経路に `!this.llmAdapter` ガードを追加済みで型安全                                   |

## 追加Gate（2026-04-04）

### G-06: `execute()` guard 実装の妥当性

**実装内容:** `_executeInternal()` 内の `terminal_handoff` 分岐後（line 1046 直後）に以下を追加:

```typescript
if (!this.llmAdapter) {
  return { executeId: `degraded-...`, success: false, error: DEGRADED_REASON_MESSAGES.llm_adapter_unavailable, ... }
}
```

**判定根拠:**

- `terminal_handoff` は LLM 不要のため除外済みの位置で安全
- `SkillExecuteResult`（`error: string | undefined`）と互換 — 型変更不要
- `workflowEngine.recordExecutionFailure()` も呼ぶため状態整合が保たれる
- `governanceHooks.onSessionEnd()` も呼ぶため監査ログの取りこぼしがない
- `SkillLifecyclePanel.tsx:1307` の `if (!executeResponse.success)` が既にエラーを処理する

## Minor Notes（更新）

| MINOR ID | 項目                                  | 対応方針               | 状態                                     |
| -------- | ------------------------------------- | ---------------------- | ---------------------------------------- |
| M-01     | reason code 文言の共通化              | Phase 8 で定数化       | 後続タスクで対応                         |
| M-02     | plan logical error の type guard 名称 | Phase 5 で命名統一     | 実装済み（`isRuntimePlanErrorResponse`） |
| M-03     | wizard と lifecycle の文言差          | Phase 6 で parity test | 確認要                                   |

## 統合テスト連携

- Phase 4 で `execute()` guard のテストケースを追加する（TC-10・TC-11）
- Phase 5 で `_executeInternal()` guard を実装する
- Phase 9 で union 契約が lint / typecheck 上も自然かを再監査する

## 成果物

| 成果物      | パス                                    | 説明                |
| ----------- | --------------------------------------- | ------------------- |
| review gate | `outputs/phase-3/design-review-gate.md` | gate と minor notes |

## 完了条件

- [x] execute の過剰要件が除去されている（`SkillExecuteResult` 互換の設計で型変更不要）
- [x] union 契約が既存 improve 契約と整合している
- [x] IPC / renderer 境界が矛盾なく閉じている
- [x] Phase 4 に必要な test point が確定している（T-01: execute guard、T-02: stub-elimination test）
- [x] **本Phase内の全タスクを100%実行完了**
