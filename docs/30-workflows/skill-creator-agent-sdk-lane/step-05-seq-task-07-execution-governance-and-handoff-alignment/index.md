# TASK-SDK-07: execution-governance-and-handoff-alignment

## 概要

foundation で固定した lane response baseline と、Task03-06 が定義した source provenance / interaction / mainline / verify surface を前提に、Skill Creator レーンへ execution governance bundle を適用する task。

本 task の主題は新しい実行経路を増やすことではない。既存の `integrated_api` / `terminal_handoff`、approval、disclosure、manual boundary、consumer auth guard を 1 つの説明可能な契約へ束ね、Task08 が resume 契約を設計できる状態まで hardening することである。

## 実装者向けクイックガイド

### 着手条件

- Task02 の workflow state owner と lane response baseline を読了している
- Task03 の provenance / degrade signal を読了している
- Task04 の interaction bridge と Task05/06 の mainline / verify surface を読了している
- API primary / terminal handoff secondary / manual boundary 固定の方針に合意している

### 想定変更ポイント

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

### 非対象

- manifest 契約そのもの
- create entry mainline の最終一本化
- verify / improve detail surface の完成
- session persistence / resume の durable semantics
- provider 切替や advanced console 全体の UI polish

### 完了イメージ

- `integrated_api` が正規レーン、`terminal_handoff` が補助レーンである理由を third-party に説明できる
- consumer auth token を API 実行へ流用しない guard、manual boundary、approval/disclosure の関係を 1 枚で説明できる
- Skill Creator が shared `HandoffGuidance` / approval / disclosure surface を再利用し、独自ルールを発明しない
- Task08 が route state と handoff/disclosure 前提を再定義せず persistence 契約へ進める

### Task08 へ渡す canonical 前提

`route authority は Main owner のまま維持し、Skill Creator は shared `HandoffGuidance`/`approval:\*`/`execution:get-disclosure-info` を再利用する。Renderer は visible handoff と disclosure summary の表示に留まり、manual boundary と consumer auth guard を上書きしない。`

### upstream / downstream

| 区分       | task        | 受け取るもの / 渡すもの                                  |
| ---------- | ----------- | -------------------------------------------------------- |
| upstream   | TASK-SDK-02 | workflow state owner、lane response baseline             |
| upstream   | TASK-SDK-03 | degrade signal、source provenance、resource warning      |
| upstream   | TASK-SDK-04 | interaction bridge、phase UI host、visible handoff 前提  |
| upstream   | TASK-SDK-05 | create mainline の host surface                          |
| upstream   | TASK-SDK-06 | verify / improve / re-entry surface                      |
| downstream | TASK-SDK-08 | route state、invalidation 前提、manual boundary 維持条件 |

### 並列実行メモ

- Task05 / 06 の後段として扱う
- governance が未固定のまま Task08 へ進めない
- 共有 surface を触る場合でも、approval/disclosure は既存 shared contract 再利用を優先する

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
