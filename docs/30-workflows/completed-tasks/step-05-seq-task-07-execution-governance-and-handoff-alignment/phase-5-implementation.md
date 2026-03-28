# Phase 5: 実装

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 5                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

downstream 実装タスクが参照する実装契約を固定し、existing runtime policy / handoff / approval / disclosure 実装を Skill Creator public surface へどう接続するかを明示する。

## downstream 実装対象

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
- `apps/desktop/src/main/services/runtime/ApprovalGate.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/main/ipc/approvalHandlers.ts`
- `apps/desktop/src/main/ipc/disclosureHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

## 実行タスク

- route authority と early return の実装差分を整理する
- shared `HandoffGuidance` / approval / disclosure surface を Skill Creator から利用可能にする
- Skill Creator renderer 側の visible handoff と disclosure slot を整える
- public surface と internal adapter の contract drift を解消する

## 参照資料

| 資料名          | パス                                                                   | 説明                       |
| --------------- | ---------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計    | `phase-2-design.md`                                                    | topology / contract        |
| Phase 4 テスト  | `phase-4-test-creation.md`                                             | test matrix 基準           |
| unassigned task | `../../unassigned-task/UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001.md` | public IPC wiring 既知 gap |

## 実装方針

1. route authority は Main に留め、Renderer で handoff reason や approval 状態を再生成しない。
2. shared `approval:*` / `execution:get-disclosure-info` を再利用し、Skill Creator 専用 channel を発明しない。
3. `SkillLifecyclePanel.tsx` の execute handoff は console 出力で終わらせず visible surface へ接続する。
4. consumer auth guard と sanitize は `RuntimePolicyResolver` / `TerminalHandoffBuilder` 側で一元管理する。

## Task08 へ渡す canonical 前提

`route authority は Main owner のまま維持し、Skill Creator は shared `HandoffGuidance`/`approval:\*`/`execution:get-disclosure-info` を再利用する。Renderer は visible handoff と disclosure summary の表示に留まり、manual boundary と consumer auth guard を上書きしない。`

## 実装しないこと

- create mainline の最終構成変更
- verify / improve detail surface の完成
- resume persistence / compatibility 保存形式
- advanced console 全画面の UI 改修

## 実装完了の判断

- Skill Creator が shared governance bundle を経由して `integrated_api` / `terminal_handoff` を説明できる
- approval / disclosure の shared contract と public Skill Creator API の drift が解消される
- Task08 が route state と manual boundary をそのまま前提にできる

## 成果物

| 成果物   | パス                        | 説明             |
| -------- | --------------------------- | ---------------- |
| 実装計画 | `phase-5-implementation.md` | 実装順序と変更点 |

## 統合テスト連携

- Phase 4 の test matrix を Main service -> IPC -> preload -> renderer の順で消化する
- `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` は Task07 scope へ吸収して証跡を一本化する

## 完了条件

- [ ] governance 実装対象が整理されている
- [ ] shared contract 再利用方針が明記されている
- [ ] public surface と internal adapter の drift 解消が実装対象に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
