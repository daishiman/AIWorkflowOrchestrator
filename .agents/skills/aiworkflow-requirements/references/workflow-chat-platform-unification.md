# Chat Platform Unification Playbook

> **用途**: `TASK-SKILL-LIFECYCLE-02` の current branch 実装内容、苦戦箇所、current/archive split、5分解決カードを 1 ファイルで再利用するための hub。
> **読むタイミング**: chat platform / handoff / revive / partial completion を追う前の最初の 3 分。

---

## 1. 先に押さえること

| 項目 | 要点 |
| --- | --- |
| phase12-complete workflow | `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/` |
| completed archive | `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/` |
| overall status | **Phase 1-12 完了だが top-level は `in_progress`**。transport 一本化と revive/recent rail ownership は follow-up |
| 代表フォローアップ | `UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001`, `UT-IMP-CHAT-PLATFORM-TRANSPORT-UNIFICATION-001` |

---

## 2. current branch で実装済みのこと

| 関心ごと | current code anchor | 今回固定した内容 | 未完了 |
| --- | --- | --- | --- |
| shared contract | `packages/shared/src/types/chat-platform.ts` | `ChatHandoffPayload` / `ChatReviveSnapshot` / `NON_PERSISTED_CHAT_OVERLAY_KEYS` を shared DTO として固定 | なし |
| Workspace handoff helper | `apps/desktop/src/renderer/features/chat-platform/contracts.ts` | `createWorkspaceChatHandoff()` / `buildChatPlatformRequest()` / `createChatReviveSnapshot()` を抽出し、request 正規化を共通化 | transport ownership の一本化 |
| lifecycle handoff | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | `createSkillLifecycleChatHandoff()` と allowed surface guard を追加し、entry surface 契約を固定 | ChatView 側 recent rail との完全統合 |
| lifecycle request continuity | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | `initialRequest` で `prepare` 済み request を panel 側にも残し、payload と UI state の文面を一致させた | create/use/improve の全 surface 共通 state 化 |
| execution overlay reset | `apps/desktop/src/renderer/store/slices/chatSlice.ts` | `createEmptyChatStreamOverlayState()` で cancel / end / error 後の non-persist overlay reset を統一 | revive と recent rail の最終 ownership |
| representative evidence | `apps/desktop/src/renderer/phase11-chat-platform.{html,tsx}` | dedicated harness で 5 scenario の screenshot を取得し、Apple UI/UX 観点レビューまで current workflow に保存 | app shell 全景との併読ガイド整備 |

---

## 3. current/archive split を崩さない理由

| 観点 | current workflow | completed archive |
| --- | --- | --- |
| 責務 | current HEAD の正本。shared contract、prepared request continuity、Phase 11/12 証跡を保持 | prior attempt の比較資料。苦戦箇所と旧判断の参照用 |
| 更新方針 | 現コードに合わせて再監査を継続する | 比較資料として保持し、current へ上書きしない |
| 破綻条件 | archive を current に戻すと code anchor と仕様がずれる | archive を削除すると sibling workflow の相対参照が切れる |

---

## 4. 苦戦箇所と簡潔解決

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| completed archive を current workflow へ戻すと current HEAD と乖離する | workflow 状態だけで正本を決める | current code anchor を先に固定し、archive は比較資料として残した | current と archive は別責務として扱う |
| handoff helper だけ作ると `prepare` 済み request が entry UI に残らない | payload 生成だけで panel state を更新しない | `SkillLifecyclePanel.initialRequest` を追加し、prepared request と handoff payload の元文面を一致させた | handoff 生成時は entry surface の request continuity も同時に固定する |
| shared contract 実装済みでも task 全体を completed に見せやすい | screenshot と outputs が揃った時点で閉じる | `artifacts.status=in_progress` を維持し、follow-up 2件を formalize した | Phase 1-12 完了と overall completed を分離する |
| shell 全景 screenshot だけでは contract 境界が読めない | representative evidence を route 全景だけで閉じる | dedicated harness で selector 単位の境界を撮影した | 基盤統合タスクは dedicated harness を優先する |

---

## 5. 同種課題の5分解決カード

1. current HEAD の code anchor を shared contract / entry helper / execution overlay / evidence の4層で固定する。
2. current workflow と completed archive の両方が必要かを先に判定し、役割を分けて保持する。
3. handoff helper を追加したら、entry surface の prepared request continuity (`initialRequest` など) も同時に固定する。
4. residual follow-up が残る場合は `artifacts.status=in_progress` と未タスク formalization を同一ターンで残す。
5. representative evidence は app shell 全景ではなく、責務境界が読める dedicated harness を正本にする。

---

## 6. どの仕様書に何を書くか

| 目的 | 正本 |
| --- | --- |
| current branch 全体像を 3 分で掴む | `workflow-chat-platform-unification.md` |
| 完了記録、検証証跡、follow-up 台帳 | `task-workflow.md` |
| 苦戦箇所と再発防止ルール | `lessons-learned.md` |
| LLM / stream / handoff contract | `interfaces-llm.md`, `llm-ipc-types.md`, `llm-streaming.md` |
| history / revive / persistence 境界 | `interfaces-chat-history.md`, `architecture-chat-history.md`, `api-chat-history.md` |
| Workspace 固有文脈と handoff helper | `llm-workspace-chat-edit.md` |
| entry surface / execution surface の UI 契約 | `ui-ux-feature-components.md`, `ui-ux-navigation.md` |
| overlay reset と state ownership | `arch-state-management.md` |

---

## 7. 検証アンカー

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop exec vitest run src/renderer/features/chat-platform/contracts.test.ts src/renderer/navigation/skillLifecycleJourney.test.ts src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx src/renderer/store/slices/chatSlice.test.ts`
- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/chat-platform.test.ts`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/outputs/phase-11/screenshots/`

---

## 8. 関連ドキュメント

- [interfaces-llm.md](./interfaces-llm.md)
- [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md)
- [arch-state-management.md](./arch-state-management.md)
- [task-workflow.md](./task-workflow.md)
- [lessons-learned.md](./lessons-learned.md)

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
| --- | --- | --- |
| 1.0.0 | 2026-03-12 | `TASK-SKILL-LIFECYCLE-02` current branch の shared contract、prepared request continuity、partial completion、current/archive split、5分解決カードを 1 ファイルへ集約 |
