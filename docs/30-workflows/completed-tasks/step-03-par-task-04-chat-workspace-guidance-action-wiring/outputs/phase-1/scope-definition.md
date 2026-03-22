# Phase 1: スコープ定義 - Scope Definition

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 1                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 対象スコープ

### 対象ファイル

| ファイル                                                                          | 変更種別 | 概要                                |
| --------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| apps/desktop/src/renderer/views/ChatView/index.tsx                                | 修正     | local 判定除去、policy DTO 消費     |
| apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx              | 修正     | local 判定除去、policy DTO 消費     |
| apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx        | 拡張     | secondary CTA 対応、handoff variant |
| apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts | 修正     | policy DTO 消費への切替             |
| apps/desktop/src/renderer/store/slices/chatSlice.ts                               | 修正     | guidance derived state 追加候補     |
| 新規: blocked guidance mapping 定義ファイル                                       | 新規     | reason -> action の統一定義         |

### 対象設計領域

- blocked reason -> action mapping の定義
- ChatView / WorkspaceChatPanel の policy 消費境界
- GuidanceBlock の props 拡張設計
- settings 遷移・terminal launcher 導線
- CTA ラベル・メッセージの統一ソース

## 2. 除外スコープ

| 除外項目                           | 理由                                     | 委譲先タスク                               |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------ |
| RuntimePolicy の実装変更           | Task02 (Policy Centralization) の責務    | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| Terminal Surface の UI 実装        | Task06 (Terminal Handoff Surface) の責務 | 別タスク                                   |
| Settings / Shell Access Matrix     | Task03 の責務                            | 別タスク                                   |
| LLMGuidanceBanner の内部実装       | 本タスクは wiring 設計のみ、実装は後続   | 後続実装タスク                             |
| chatSlice の callLLMAPI リファクタ | AI 実行ロジック自体は別責務              | 後続実装タスク                             |
| Playwright / E2E テスト実装        | 本タスクは設計タスク、テスト設計のみ     | 後続実装タスク                             |
| コミット・PR 作成                  | ユーザー指示待ち                         | Phase 13 でブロック                        |

## 3. 依存タスク

### 前提依存（本タスク開始前に完了している必要があるもの）

| タスクID                                   | 内容                     | 状態      |
| ------------------------------------------ | ------------------------ | --------- |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 | RuntimePolicy の中央集約 | completed |

### 後続依存（本タスクの成果物を使用するタスク）

| タスクID | 内容                                         | 使用する成果物                                                 |
| -------- | -------------------------------------------- | -------------------------------------------------------------- |
| 後続実装 | ChatView / WorkspaceChatPanel の wiring 実装 | design-summary.md, contract-matrix.md, implementation-guide.md |
| Task06   | Terminal Handoff Surface                     | handoff guidance 設計                                          |

## 4. blocked reason 対象確定

Phase 1 仕様書の候補から、以下の6つを対象 reason として確定:

| reason             | 対象判定 | 根拠                                                |
| ------------------ | -------- | --------------------------------------------------- |
| `NO_PROVIDER`      | 対象     | 現状で GuidanceBanner が検出（ChatView L243）       |
| `NO_MODEL`         | 対象     | 現状で controller.selectedModelId null 検出         |
| `NO_API_KEY`       | 対象     | useWorkspaceChatController の error handling に存在 |
| `AUTH_EXPIRED`     | 対象     | interfaces-auth.md で定義されている                 |
| `NETWORK_ERROR`    | 対象     | health-degraded として ui-ux-realization で定義     |
| `POLICY_VIOLATION` | 対象     | handoff case として RuntimePolicy で定義            |

## 5. ゲート条件

### Phase 4 着手前提

- Phase 1-3 が全て completed であること
- Phase 3 の gate 判定が PASS または MINOR（修正済み）であること
- MAJOR / CRITICAL の場合は戻り先 Phase で再実行

### Phase 13 blocked 条件

- ユーザーの明示的な指示なしにコミット・PR を作成しない
- 全 Phase (1-12) が completed であること
