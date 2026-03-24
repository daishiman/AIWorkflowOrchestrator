# Phase 10: 最終レビュー報告

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase      | 10                                             |
| 作成日     | 2026-03-24                                     |
| レビュア   | Phase 10 最終レビュー担当                      |
| 入力成果物 | Phase 1-3 設計成果物 + Phase 5-9 実装計画      |

## 1. AC Fulfillment 判定

### AC-1: front の primary label が `実行コンソール` 系へ統一されている

| 判定       | **PASS（設計レベル）**                                                           |
| ---------- | -------------------------------------------------------------------------------- |
| 検証方法   | `grep -rn "ターミナルを開く\|terminal を開く" apps/desktop/src/renderer` で 0 件 |
| 現状の残存 | 以下の箇所に旧ラベルが残存しており、Phase 5 実装で変更対象として明記済み         |

#### 現状の旧ラベル残存箇所（Phase 5 変更対象）

| ファイル                                | 行         | 現行ラベル         | 変更後ラベル           | 設計根拠          |
| --------------------------------------- | ---------- | ------------------ | ---------------------- | ----------------- |
| `HandoffBlock.tsx` L21                  | front 露出 | `ターミナルを開く` | `端末で続ける`         | cta-mapping.md    |
| `TerminalHandoffCard/index.tsx` L130    | front 露出 | `terminal を開く`  | `端末で続ける`         | cta-mapping.md    |
| `AppLayout/TerminalLauncher.tsx` L25    | aria-label | `ターミナルを開く` | `実行コンソール`       | design-summary.md |
| `modelSelectionGuidance.ts` L38-39      | 定数       | `ターミナルを開く` | `実行コンソールを開く` | cta-mapping.md    |
| `slide/TerminalLauncher.tsx` L39,42     | front 露出 | `ターミナルを開く` | `実行コンソール`       | design-summary.md |
| `SlideWorkspace.tsx` L191               | 定数       | `ターミナルを開く` | `実行コンソールを開く` | cta-mapping.md    |
| `PersistentTerminalLauncher.tsx` L15,17 | front 露出 | `ターミナルを開く` | `実行コンソールを開く` | design-summary.md |

**判定根拠**: 設計文書（cta-mapping.md, design-summary.md）に全変更箇所と変更後ラベルが網羅的に定義されている。Phase 5 実装完了後に `grep` 検証で 0 件を確認する。

### AC-2: `ViewType` / route / shared action の正本が定義されている

| 判定     | **PASS**                             |
| -------- | ------------------------------------ |
| 検証方法 | 設計成果物に以下が全て定義されている |

| 定義項目                 | 定義場所                     | 内容                                                                       | 状態   |
| ------------------------ | ---------------------------- | -------------------------------------------------------------------------- | ------ |
| `ViewType` 追加          | route-and-action-contract.md | `executionConsole` を ViewType に追加                                      | 定義済 |
| `renderView()` 分岐      | route-and-action-contract.md | `case "executionConsole": return <ExecutionConsoleView />`                 | 定義済 |
| lazy import              | route-and-action-contract.md | `React.lazy(() => import("./views/ExecutionConsoleView"))`                 | 定義済 |
| `openExecutionConsole()` | route-and-action-contract.md | `useAppStore.getState().setCurrentView("executionConsole")`                | 定義済 |
| 呼び出し規約             | route-and-action-contract.md | 直接 `setCurrentView` 禁止、`openExecutionConsole()` 経由必須              | 定義済 |
| Close/Back 遷移          | route-and-action-contract.md | `viewHistory` 直前 view に戻る                                             | 定義済 |
| navContract 追加         | design-summary.md            | `id: "executionConsole"`, `icon: "play-circle"`, `label: "実行コンソール"` | 定義済 |
| stub view                | design-summary.md            | `ExecutionConsoleView/index.tsx` placeholder                               | 定義済 |

**判定根拠**: route owner の正本が route-and-action-contract.md に集約され、`actions/executionConsole.ts` が shared action の配置先として定義されている。

### AC-3: App Shell / Chat / Workspace / Skill Creator の CTA が同一ラベル・同一挙動で設計されている

| 判定     | **PASS**                                                                                  |
| -------- | ----------------------------------------------------------------------------------------- |
| 検証方法 | cta-mapping.md に全 surface の CTA が `openExecutionConsole()` を呼ぶ設計が記載されている |

| Surface       | CTA 数                                                                 | Action                   | 全て `openExecutionConsole()` 経由 |
| ------------- | ---------------------------------------------------------------------- | ------------------------ | ---------------------------------- |
| App Shell     | 2 (nav item + launcher)                                                | `openExecutionConsole()` | OK                                 |
| Chat          | 4 (ChatPanel + LLMGuidanceBanner + HandoffBlock + TerminalHandoffCard) | `openExecutionConsole()` | OK                                 |
| Workspace     | 1 (WorkspaceChatPanel secondary)                                       | `openExecutionConsole()` | OK                                 |
| Skill Creator | 1 (後続 Task02/03 で詳細化、interface のみ定義)                        | `openExecutionConsole()` | OK（interface 定義済）             |

**判定根拠**: 全 8 CTA が同一の `openExecutionConsole()` shared action を呼ぶ設計。Skill Creator は interface 定義のみだが、同一 action を使用する契約が cta-mapping.md に記載されている。

### AC-4: `agent` 代替や no-op CTA の除去方針が明記されている

| 判定     | **PASS**                                                               |
| -------- | ---------------------------------------------------------------------- |
| 検証方法 | Phase 5 実装で `setCurrentView("agent")` の terminal 代替が 0 件になる |

#### 現状の `setCurrentView("agent")` terminal 代替（Phase 5 除去対象）

| ファイル             | 行                     | 現行コード                | 変更後                   | 設計根拠                         |
| -------------------- | ---------------------- | ------------------------- | ------------------------ | -------------------------------- |
| `ChatPanel.tsx` L130 | `handleTerminalSwitch` | `setCurrentView("agent")` | `openExecutionConsole()` | design-summary.md Agent 代替除去 |
| `ChatPanel.tsx` L149 | `handleOpenTerminal`   | `setCurrentView("agent")` | `openExecutionConsole()` | design-summary.md Agent 代替除去 |

#### 未配線 CTA の配線方針

| ファイル                             | 現状                   | 配線先                   | 設計根拠       |
| ------------------------------------ | ---------------------- | ------------------------ | -------------- |
| `LLMGuidanceBanner` secondaryAction  | `open-terminal` 未接続 | `openExecutionConsole()` | cta-mapping.md |
| `WorkspaceChatPanel` secondaryAction | `open-terminal` 未接続 | `openExecutionConsole()` | cta-mapping.md |

#### 禁止パターンの明記

cta-mapping.md に以下の禁止パターンが定義されている:

- `setCurrentView("agent")` での代替遷移
- CTA が no-op（handler 未接続）
- `console.warn` での silent fallback
- label と実際の遷移先の不一致

**判定根拠**: 除去対象の全箇所が特定され、除去方針と禁止パターンが cta-mapping.md に明記されている。

## 2. Dependency Review

### Task02/Task03 への渡し条件

| 条件                                                                   | 状態                    | 根拠                         |
| ---------------------------------------------------------------------- | ----------------------- | ---------------------------- |
| `executionConsole` ViewType が types.ts に追加される                   | Phase 5 で実装予定      | route-and-action-contract.md |
| `ExecutionConsoleView` stub が存在する                                 | Phase 5 で作成予定      | design-summary.md            |
| `openExecutionConsole()` が `actions/executionConsole.ts` に定義される | Phase 5 で実装予定      | route-and-action-contract.md |
| navContract に `executionConsole` エントリが追加される                 | Phase 5 で実装予定      | design-summary.md            |
| 全 CTA が `openExecutionConsole()` を呼ぶ                              | Phase 5 で配線予定      | cta-mapping.md               |
| Skill Creator の action interface が export される                     | Phase 5 で M-2 対応予定 | gate-decision.md             |

### Task02 依存

Task02（Execution Console 内部コンポーネント実装）は以下を前提とする:

- `ExecutionConsoleView` stub が route owner として機能していること
- `openExecutionConsole()` が全 surface から呼べること
- session state / terminal state は Task02/03 で定義（本タスクでは未定義）

### Task03 依存

Task03（Advanced View / Raw Terminal）は以下を前提とする:

- `高度な表示` label が secondary/tertiary 扱いで退避されていること
- `terminal` label が front 主導線に存在しないこと

## 3. 横断品質チェック

### Naming 一貫性

| チェック項目                                             | 結果 | 備考              |
| -------------------------------------------------------- | ---- | ----------------- |
| `実行コンソール` が primary label として全設計文書で統一 | OK   | design-summary.md |
| `端末で続ける` が handoff label として統一               | OK   | cta-mapping.md    |
| `高度な表示` が advanced label として定義                | OK   | design-summary.md |
| `ターミナル` / `terminal` が front 主導線に出ない        | OK   | 退避ルールに明記  |

### Architecture 整合性

| チェック項目                        | 結果 | 備考                     |
| ----------------------------------- | ---- | ------------------------ |
| ViewType 追加が既存パターンに準拠   | OK   | union type への追加      |
| lazy import による chunk 分離       | OK   | 既存 view と同一パターン |
| shared action が store 経由         | OK   | `useAppStore.getState()` |
| navContract 型が既存 interface 準拠 | OK   | `NavItemContract`        |

### 未解決 MINOR 指摘（Phase 3 からの持越し）

| ID  | 内容                                                         | 対応 Phase | 影響度               |
| --- | ------------------------------------------------------------ | ---------- | -------------------- |
| M-1 | `runtimeAccess.ts` の `launchMainlineTerminal` rename 優先度 | Phase 5    | 低（内部 API）       |
| M-2 | Skill Creator CTA の action 型定義                           | Phase 5    | 低（interface のみ） |
| M-3 | `TerminalLauncher` rename 時の既存テスト修正                 | Phase 4-5  | 中（テスト修正）     |

## 4. リスク評価

| リスク                                               | 影響度 | 発生確率 | 軽減策                               |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------ |
| 既存テストの `ターミナルを開く` 文字列マッチ修正漏れ | 中     | 中       | Phase 5 後に `grep` で全件確認       |
| `setCurrentView("agent")` のテスト用使用箇所との混同 | 低     | 低       | テストファイルは AC-4 の対象外と明記 |
| Skill Creator surface の interface 定義不足          | 低     | 低       | Task02/03 で詳細化、M-2 で対応       |
