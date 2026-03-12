# [#1180] "[UT-IMP-CHAT-PLATFORM-TRANSPORT-UNIFICATION-001] chat platform transport unification"

## メタ情報

```yaml
task_id: UT-IMP-CHAT-PLATFORM-TRANSPORT-UNIFICATION-001
task_name: chat platform transport unification
category: 改善
target_feature: ChatView / WorkspaceView / conversationAPI / llm stream transport
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-02 Phase 11-12 再監査（2026-03-12）
created_date: 2026-03-12
dependencies: []
spec_path: docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/unassigned-task/task-imp-chat-platform-transport-unification-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-02 では mode / handoff / revive の contract layer を `packages/shared/src/types/chat-platform.ts` へ寄せ、Workspace / Skill Lifecycle の handoff helper も current branch に同期した。一方で runtime transport はまだ二重化されている。

- general chat: `chatSlice` + `useStreamingChat`
- workspace chat: `conversationAPI.create/addMessage` + `llm.streamChat/cancelStream`

### 1.2 問題点・課題

- `conversationId` / `requestId` / recent rail ownership が mode ごとに別の実装へ散っている
- revive ルールは shared contract で説明できても、transport owner が異なるため end-to-end では一つの語彙で説明できない
- Task03 downstream から見た ChatView handoff 先が「共通 surface」なのに、内部 transport は mode 別に分岐したまま残る

### 1.3 放置した場合の影響

- Phase 12 で `Phase 1-12 完了` と `overall completed` を分離し続ける必要があり、Task02 を fully closed できない
- future mode を追加するたびに transport 分岐が増え、handoff / revive guard の再利用性が落ちる
- recent rail / session revive の責務が曖昧なまま残り、UI と persistence の不整合が再発しやすい

---

## 2. 何を達成するか（What）

### 2.1 目的

general / workspace chat の transport と persistence を一本化し、ChatView を単一の execution transport owner として説明できる状態にする。

### 2.2 最終ゴール

1. general chat を `conversationAPI` ベースの session lifecycle に接続する
2. Workspace / general の `conversationId` / `requestId` / recent rail / revive ownership を一つの transport で説明できるようにする
3. Task03 downstream から見た handoff 先を `ChatView` 単一 transport として扱えるようにする

### 2.3 スコープ

#### 含むもの

- `ChatView` の persistence transport 見直し
- session create / append / revive の一本化
- general / workspace の streaming completion path 統一
- transport 一本化後の system spec / workflow / follow-up 台帳更新

#### 含まないもの

- Skill Lifecycle UI 自体の再設計
- Main Process の provider 追加
- general / workspace 以外の新規 chat mode 追加

### 2.4 成果物

- transport 統一後の session lifecycle 実装
- general / workspace 共通の transport 回帰テスト
- 更新済み system spec（LLM / history / state / workflow 台帳）
- Phase 11/12 再監査証跡

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-02 current branch で shared contract / handoff helper / follow-up 指示書が同期済みである
- `conversationAPI`、`chatSlice`、`useStreamingChat`、`useWorkspaceChatController` を横断して参照できる
- `aiworkflow-requirements` と `task-specification-creator` の最新正本を参照できる

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-02 会話基盤・セッション統合（Phase 1-12 完了 / overall in_progress）
- UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001（並列で進められるが、本タスクの回帰 guard と相互参照する）

### 3.3 必要な知識

- `chatSlice` の `chatSessions` / `activeChatSessionId` / `chatSessionOrder` / `modeSessionIds`
- `conversationAPI` の create / append / revive 契約
- `useWorkspaceChatController` の current local ownership
- Phase 11 harness と recent rail / revive evidence の構成

### 3.4 推奨アプローチ

1. current transport owner を general / workspace / revive の3視点で棚卸しする
2. `conversationAPI` を transport 正本に寄せるか、あるいは同等 abstraction を general 側へ導入する
3. unified transport の結合テストを先に設計し、recent rail / revive / cancel / end を同時に固定する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                     | 発見経緯                                                                                    | 解決策                                                                                                    | 教訓                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| shared contract が揃っても runtime owner が二重化される                  | Task02 で shared DTO を作っても AC-4 が false のまま残った                                  | DTO と transport を別レイヤーと認識し、transport owner を一本化する                                       | contract 統一だけで completed にしない                                               |
| general / workspace で requestId と conversationId の責務が分かれている  | general は store 主導、workspace は controller 主導で ID の由来が異なる                     | create / append / revive の owner を 1 箇所へ寄せる                                                       | session lifecycle の owner は単一にする                                              |
| current workflow と system spec の partial 注記が長く残る                | transport follow-up が formalize されるまで `in_progress` を維持した                        | この未タスクを完了させて partial 注記を外す                                                               | follow-up は system spec の本筋に戻す                                                |
| current workflow と completed archive を混同すると統一対象の実体がぶれる | archive 側の outputs だけを見ると current code anchor と transport owner の差分が見えにくい | `workflow-chat-platform-unification.md` を起点に current workflow の code anchor / outputs を先に固定した | transport 統一タスクは current workflow 正本から設計し、archive は比較資料に限定する |

### 3.6 SubAgent 分担（関心ごとの分離）

| SubAgent   | 担当関心         | 主担当作業                                                 | 依存関係   |
| ---------- | ---------------- | ---------------------------------------------------------- | ---------- |
| SubAgent-A | transport design | general / workspace current owner 棚卸し、統一先設計       | なし       |
| SubAgent-B | implementation   | ChatView / Workspace transport 統一実装                    | A 後       |
| SubAgent-C | regression       | unified transport の結合テスト、recent rail / revive guard | B と並列可 |
| SubAgent-D | spec sync        | system spec / workflow / outputs / 未タスク台帳更新        | C 後       |

---

## 4. 実行手順

### Phase A: 現状棚卸し

1. general chat と workspace chat の transport owner を比較表にする
2. `conversationId` / `requestId` / revive owner の現状差分を明文化する
3. Task03 downstream から見た ChatView contract を確認する

### Phase B: transport 統一設計

1. general 側を `conversationAPI` へ寄せるか、共通 transport abstraction を定義する
2. recent rail / revive / cancel / end の owner を一箇所に集約する
3. shared contract と runtime transport の責務境界を設計書へ落とす

### Phase C: 実装とテスト

1. unified transport を実装する
2. general / workspace / revive の結合テストを追加する
3. non-persist overlay reset が維持されることを確認する

### Phase D: 検証と同期

1. typecheck / targeted tests / Phase 11 representative screenshot を再実行する
2. system spec / workflow / outputs / lessons / LOGS / SKILL を同一ターンで更新する
3. Task02 の partial completion 注記を外せるか再判定する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] general / workspace の session transport を同じ語彙で説明できる
- [ ] `conversationId` と `requestId` の所有者が 1 箇所に揃う
- [ ] recent rail / revive / cancel / end が unified transport 上で説明できる

### 品質要件

- [ ] 結合テストと targeted tests が PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] current workflow と system spec の partial implementation 注記を外せる

### ドキュメント要件

- [ ] `task-workflow.md` の TASK-SKILL-LIFECYCLE-02 節が completed 扱いへ更新される
- [ ] `lessons-learned.md` に transport 一本化の教訓が追加される
- [ ] 本未タスク指示書が completed へ移管される

---

## 6. 検証方法

| 検証                   | 内容                                                    |
| ---------------------- | ------------------------------------------------------- |
| targeted vitest        | transport 統一後の session lifecycle と revive guard    |
| typecheck              | renderer / shared contract の型整合                     |
| Phase 11 screenshot    | general / workspace / revive の representative evidence |
| verify-all-specs       | workflow Phase 1-12 文書整合                            |
| audit-unassigned-tasks | current task 由来で follow-up が 0 件になったことの確認 |

---

## 7. リスクと対策

| リスク                  | 内容                                      | 対策                                                                   |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| session migration 破壊  | 既存 general chat の recent rail が壊れる | migration fixture と revive テストを先に置く                           |
| Workspace regression    | file context handoff が弱くなる           | workspace シナリオを dedicated test / screenshot で固定する            |
| partial completion 再発 | 実装後も spec だけが古いまま残る          | workflow / system spec / outputs / LOGS / SKILL を同一ターンで更新する |

---

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/workflow-chat-platform-unification.md`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification-phase12-complete-20260312/unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

---

## 9. 備考

- このタスクは TASK-SKILL-LIFECYCLE-02 を overall completed に引き上げるための主要 follow-up である。
- shared contract layer 自体は current branch で既に導入済みなので、ここでは runtime transport の一本化に集中する。
- `artifacts.status=in_progress` の解除条件は transport owner 一本化と current workflow 側の再監査完了であり、completed archive への先行移管ではない。
