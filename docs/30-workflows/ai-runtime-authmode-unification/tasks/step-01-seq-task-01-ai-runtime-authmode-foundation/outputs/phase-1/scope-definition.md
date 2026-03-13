# Phase 1 スコープ定義: AI Runtime / AuthMode 基盤統一

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001               |
| Phase      | 1 - 要件定義                                               |
| 作成日     | 2026-03-13                                                 |
| ステータス | completed                                                  |
| 関連文書   | [requirements-definition.md](./requirements-definition.md) |

---

## 1. 対象範囲（本タスク Task01 で扱う）

### 1.1 概要

本タスク（Task01: ai-runtime-authmode-foundation）は、全 AI surface の access capability matrix と legacy authMode migration の**要件定義・設計・テスト仕様の確定**を行う。実装は行わない。

### 1.2 対象範囲の詳細

| #   | 対象                                     | 内容                                                                                                                                           | 成果物                               |
| --- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| S1  | Surface Inventory の確定                 | 全 AI surface（Main 12 + Renderer 9 + Backend 6 = 27 項目）の現状 access と目標 capability を明文化する                                        | requirements-definition.md Section 2 |
| S2  | Capability 5 区分の定義確定              | `integrated-api` / `terminal-handoff` / `terminal-only` / `guidance-only` / `stub/todo` の定義・実行責任・API key 要否を固定する               | requirements-definition.md Section 3 |
| S3  | State / Cache 差分の列挙                 | `authMode` → `accessCapability` の移行、adapter cache invalidation、terminal availability、changed event payload の差分を列挙する              | requirements-definition.md Section 4 |
| S4  | Security / Permission 差分の列挙         | sender 検証、error envelope、no auto-send 境界、権限確認フローの差分を列挙する                                                                 | requirements-definition.md Section 5 |
| S5  | Legacy migration 方針の確定              | `authMode=subscription` → `terminal capability enabled`、`authMode=api-key` → `integrated-api capability enabled` の migration path を定義する | Phase 2 設計文書                     |
| S6  | Access Model 方針の確定                  | Integrated API Runtime / Claude Code Terminal Surface / Fallback 禁止 / UI authority の方針を確定する                                          | index.md Access Model 方針           |
| S7  | 後続タスク（Task02-10）への handoff 定義 | 各 surface が属する後続タスクの割り当てと依存関係を定義する                                                                                    | scope-definition.md Section 4-5      |
| S8  | 契約テスト仕様の設計                     | capability 判定、migration、terminal boundary、cache invalidation の契約テスト仕様を定義する                                                   | Phase 4 テスト仕様                   |

### 1.3 対象ファイル（参照・調査対象）

| レイヤー         | ファイル                                                        | 調査内容                                                 |
| ---------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| Main - Auth      | `AuthModeService.ts`                                            | legacy toggle 構造、StubSubscriptionAuthProvider、永続化 |
| Main - LLM       | `LLMAdapterFactory.ts`                                          | API key 直接取得、adapter cache、4 provider 対応         |
| Main - IPC       | `aiHandlers.ts`                                                 | AI_CHAT / AI_CHECK_CONNECTION / AI_INDEX の stub 状態    |
| Main - Skill     | `SkillExecutor.ts`                                              | AuthKeyService DI、Anthropic 限定、retry/abort           |
| Main - Agent     | `AgentExecutor.ts`                                              | SDK query() 直接、@ts-expect-error                       |
| Main - Chat      | `chatEditHandlers.ts`                                           | runtime 入口、stub 状態                                  |
| Main - Docs      | `SkillDocGenerator.ts`                                          | LLMQueryFn DI、stubQueryFn 残存                          |
| Main - CLI       | `ipc-handler.ts`                                                | ClaudeCliManager、sender 検証                            |
| Main - Slide     | `skill-executor.ts`, `agent-client.ts`                          | direct SDK 残存                                          |
| Renderer - Auth  | `skillExecutionAuthPreflight.ts`                                | API key 存在確認 preflight                               |
| Renderer - Store | `authModeSlice.ts`                                              | legacy state、changed event 受信                         |
| Renderer - UI    | `WorkspaceChatPanel.tsx`, `ChatPanel.tsx`, `SlideWorkspace.tsx` | surface 接点                                             |

---

## 2. 除外範囲（Task02-10 へ委譲するもの）

### 2.1 除外一覧

| #   | 除外項目                                                                                        | 委譲先    | 理由                                                           |
| --- | ----------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------- |
| E1  | Claude Code Terminal Surface の実装（embedded terminal UI、session lifecycle、transcript 保持） | Task02    | terminal surface は独自の UI / IPC / session 設計が必要        |
| E2  | Workspace Chat Edit の runtime 有効化（stub → integrated-api 接続）                             | Task03    | chatEditHandlers の stub 解消は実装タスク                      |
| E3  | Skill / Agent 実行の terminal-handoff 実装                                                      | Task04    | SkillExecutor / AgentExecutor の handoff 分岐は実装タスク      |
| E4  | Skill Docs の runtime 接続（stubQueryFn 解消）                                                  | Task05    | SkillDocGenerator の DI 実体注入は実装タスク                   |
| E5  | Settings / Access Card UI の capability card 実装                                               | Task06    | AuthModeSelector の置換は UI 実装タスク                        |
| E6  | ChatPanel の placeholder 解消と real AI chat 接続                                               | Task07    | ChatPanel の実装は UI + IPC 接続タスク                         |
| E7  | Workspace Chat Panel の streaming + terminal launcher 両立                                      | Task08    | streaming と launcher の並立は実装タスク                       |
| E8  | RAG / Embedding / Extraction / Graph Summary / CRAG / Reranking の API 接続                     | Task09    | backend pipeline の stub 解消は実装タスク                      |
| E9  | Slide / Modifier / Legacy Agent の direct SDK 解消                                              | Task10    | slide 系の legacy 経路整理は実装タスク                         |
| E10 | AuthModeService の `authMode` 値域の削除                                                        | Task06+   | migration 完了後に実施。本タスクでは migration path の定義のみ |
| E11 | LLMAdapterFactory の API key 変更時自動 cache clear 実装                                        | Task03/06 | cache invalidation の連動実装は実装タスク                      |
| E12 | sender 検証の追加実装（aiHandlers、chatEditHandlers）                                           | Task03/06 | IPC セキュリティ強化は実装タスク                               |

### 2.2 除外判断の基準

本タスク（Task01）と後続タスク（Task02-10）の境界は以下の基準で判断する:

| 基準            | Task01（本タスク）           | Task02-10（後続）                  |
| --------------- | ---------------------------- | ---------------------------------- |
| 成果物の種別    | 仕様書・設計文書・テスト仕様 | プロダクションコード・テストコード |
| 変更対象        | `docs/` 配下のみ             | `apps/` / `packages/` 配下         |
| 作業内容        | 調査・分析・定義・設計       | 実装・リファクタリング・テスト実行 |
| legacy authMode | migration path の定義        | migration の実装と旧値域の削除     |

---

## 3. 依存関係

### 3.1 上流依存（本タスクが依存するもの）

| 依存元                  | 内容                                       | ステータス |
| ----------------------- | ------------------------------------------ | ---------- |
| pack parent index       | 実行順序、依存グラフ、共通方針             | 作成済み   |
| pack design audit       | 多角的監査の結論、禁止事項                 | 作成済み   |
| pack UI/UX 図解         | 5 図セットの画面構成、状態遷移             | 作成済み   |
| pack UI/UX 正本         | 全 surface 共通の状態、CTA、microcopy 契約 | 作成済み   |
| ソースコード調査        | 10 コンポーネントの現状分析                | 完了       |
| aiworkflow-requirements | system spec 正本群（30+ ファイル）         | 参照可能   |

### 3.2 下流依存（本タスクに依存するもの）

| 依存先                         | 依存内容                                                               | 依存の強度                 |
| ------------------------------ | ---------------------------------------------------------------------- | -------------------------- |
| Task02: Terminal Surface       | terminal-only / terminal-handoff の capability 定義、no auto-send 境界 | 強（定義なしでは設計不可） |
| Task03: Workspace Chat Edit    | integrated-api の runtime 入口定義、chatEditHandlers の gap 分析       | 強                         |
| Task04: Skill / Agent          | integrated-api + terminal-handoff の capability 定義、preflight 要件   | 強                         |
| Task05: Skill Docs             | integrated-api の DI 契約、stubQueryFn の gap 分析                     | 中                         |
| Task06: Settings / Access Card | dual capability の state 設計、legacy migration path                   | 強（UI 設計の前提）        |
| Task07: ChatPanel              | integrated-api + terminal-handoff の分離方針                           | 中                         |
| Task08: Workspace Chat Panel   | streaming + terminal launcher 並立の要件                               | 中                         |
| Task09: RAG Pipeline           | integrated-api + guidance-only の capability 定義                      | 弱（stub 解消が主）        |
| Task10: Slide / Legacy         | integrated-api + terminal-guidance の capability 定義                  | 弱                         |

---

## 4. 後続タスクとの接点

### 4.1 Task01 → 後続タスクへの Handoff Matrix

| 後続タスク | 受け取る成果物                                  | 受け取る定義                                                      | 接点となる Surface                                                        |
| ---------- | ----------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Task02     | requirements-definition.md, scope-definition.md | terminal-only / terminal-handoff の定義、no auto-send 境界 4 項目 | M10 (Claude CLI IPC), R5 (WorkspaceChatPanel), R6 (ChatPanel)             |
| Task03     | requirements-definition.md                      | integrated-api の runtime 入口、chatEditHandlers gap              | M8 (chatEditHandlers), R5 (WorkspaceChatPanel)                            |
| Task04     | requirements-definition.md                      | SkillExecutor / AgentExecutor の capability gap、preflight 要件   | M6 (SkillExecutor), M7 (AgentExecutor), R1 (preflight)                    |
| Task05     | requirements-definition.md                      | SkillDocGenerator の DI 契約と gap                                | M9 (SkillDocGenerator)                                                    |
| Task06     | requirements-definition.md, Phase 2 設計文書    | legacy migration path、dual capability state 設計、UI authority   | M1 (AuthModeService), R2 (authModeSlice), R8 (Settings)                   |
| Task07     | requirements-definition.md                      | ChatPanel の placeholder 解消方針                                 | R6 (ChatPanel)                                                            |
| Task08     | requirements-definition.md                      | streaming + terminal launcher 並立要件                            | R5 (WorkspaceChatPanel)                                                   |
| Task09     | requirements-definition.md                      | RAG pipeline の capability 定義、guidance-only 要件               | B1-B6 (Backend Pipeline)                                                  |
| Task10     | requirements-definition.md                      | Slide / Legacy の direct SDK 解消方針                             | M11 (slide skill-executor), M12 (slide agent-client), R9 (SlideWorkspace) |

### 4.2 後続タスクの実行順序制約

```
Task01 (本タスク: 基盤定義)
  |
  +---> Task02 (Terminal Surface)  ----+
  |                                     |
  +---> Task06 (Settings / Access Card) +---> Task07 (ChatPanel)
  |                                     |
  +---> Task03 (Workspace Chat Edit)    +---> Task08 (Workspace Chat Panel)
  |
  +---> Task04 (Skill / Agent)
  |
  +---> Task05 (Skill Docs)
  |
  +---> Task09 (RAG Pipeline)     [独立実行可能]
  |
  +---> Task10 (Slide / Legacy)   [独立実行可能]
```

- Task02 と Task06 は Task01 完了後に並列実行可能
- Task07 / Task08 は Task02 + Task06 の両方に依存
- Task03 / Task04 / Task05 は Task01 完了後に並列実行可能
- Task09 / Task10 は Task01 完了後に独立実行可能

### 4.3 共有契約（全後続タスクが参照する定義）

| 契約                                              | 定義元                                 | 参照する後続タスク                     |
| ------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| Capability 5 区分の定義                           | requirements-definition.md Section 3   | 全タスク（Task02-10）                  |
| No auto-send 境界 4 項目                          | requirements-definition.md Section 5.3 | Task02, Task04, Task08                 |
| Silent fallback 禁止                              | requirements-definition.md 制約 C2     | Task03, Task04, Task06, Task07, Task08 |
| UI authority（Main Process が capability を返す） | requirements-definition.md 制約 C5     | Task06, Task07, Task08                 |
| Legacy migration path                             | Phase 2 設計文書（予定）               | Task06                                 |
| Error envelope に capability 情報を含める         | requirements-definition.md Section 5.2 | Task03, Task04, Task05                 |
