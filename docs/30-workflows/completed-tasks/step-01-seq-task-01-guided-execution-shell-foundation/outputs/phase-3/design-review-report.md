# Phase 3: 設計レビュー報告

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 3                                              |
| 作成日   | 2026-03-24                                     |
| 判定     | **PASS**                                       |

## レビュー結果サマリー

| 観点            | 判定 | 備考                                                       |
| --------------- | ---- | ---------------------------------------------------------- |
| Naming Review   | PASS | primary/handoff/advanced の 3 層が明確に分離               |
| Route Review    | PASS | `executionConsole` ViewType + renderView + action 定義済み |
| CTA Review      | PASS | 4 surface すべてに同一 dispatcher 配線済み                 |
| Fallback Review | PASS | no-op 禁止 / agent 代替除去が明記済み                      |

## 1. Naming Review

### 判定: PASS

| チェック項目                                     | 結果 | 根拠                              |
| ------------------------------------------------ | ---- | --------------------------------- |
| primary label が `実行コンソール` に統一         | OK   | design-summary.md Naming Contract |
| handoff label が `端末で続ける` に固定           | OK   | design-summary.md Label 階層      |
| `terminal` が front 主導線に残存しない           | OK   | 退避ルールに明記                  |
| advanced label が `高度な表示` で secondary 扱い | OK   | Label 階層テーブル                |

### 残留リスク

- `runtimeAccess.ts` の関数名 `launchMainlineTerminal` は内部 API であり front 露出ではないが、rename の優先度を明確にすべき → **MINOR**（Phase 5 で対応可）

## 2. Route Review

### 判定: PASS

| チェック項目                                         | 結果 | 根拠                                         |
| ---------------------------------------------------- | ---- | -------------------------------------------- |
| `ViewType` に `executionConsole` が定義される        | OK   | route-and-action-contract.md ViewType 拡張   |
| `renderView()` に分岐が追加される                    | OK   | route-and-action-contract.md renderView 定義 |
| lazy import で chunk 分離                            | OK   | 配置ルールに明記                             |
| `openExecutionConsole()` が shared action として定義 | OK   | route-and-action-contract.md Shared Action   |
| 呼び出し規約（直接 setCurrentView 禁止）             | OK   | 呼び出し規約セクション                       |
| Close/Back 遷移が viewHistory 準拠                   | OK   | State Ownership セクション                   |

### system spec との整合性

| System Spec                     | 本設計との整合 | 備考                             |
| ------------------------------- | -------------- | -------------------------------- |
| `ui-ux-navigation.md`           | 整合           | 既存 ViewType パターンに準拠     |
| `arch-state-management-core.md` | 整合           | surface ownership パターンに準拠 |
| navContract.ts                  | 整合           | 既存 NavItem interface に準拠    |

## 3. CTA Review

### 判定: PASS

| チェック項目                                        | 結果 | 根拠                             |
| --------------------------------------------------- | ---- | -------------------------------- |
| App Shell の CTA が `openExecutionConsole()` を呼ぶ | OK   | cta-mapping.md App Shell         |
| Chat surface の CTA が統一 dispatcher を使う        | OK   | cta-mapping.md Chat Surface      |
| Workspace surface の CTA が配線される               | OK   | cta-mapping.md Workspace Surface |
| Skill Creator の interface が定義される             | OK   | cta-mapping.md (後続定義あり)    |
| agent 代替が全箇所で除去方針明記                    | OK   | design-summary.md Agent 代替除去 |

### Surface 網羅性

| Surface       | CTA 数 | 全配線 | 備考                |
| ------------- | ------ | ------ | ------------------- |
| App Shell     | 2      | OK     | nav item + launcher |
| Chat          | 4      | OK     | 4 コンポーネント    |
| Workspace     | 1      | OK     | secondary CTA       |
| Skill Creator | 1      | 後続   | interface のみ      |

## 4. Fallback Review

### 判定: PASS

| チェック項目                                     | 結果 | 根拠                        |
| ------------------------------------------------ | ---- | --------------------------- |
| `setCurrentView("agent")` 代替を許容しない       | OK   | cta-mapping.md 禁止パターン |
| no-op CTA を許容しない                           | OK   | cta-mapping.md 禁止パターン |
| silent fallback を許容しない                     | OK   | cta-mapping.md 禁止パターン |
| unavailable 状態の disabled 表示が定義されている | OK   | cta-mapping.md 許可パターン |

## 指摘事項

### MINOR 指摘

| ID  | 指摘内容                                                                        | 対応方針                      |
| --- | ------------------------------------------------------------------------------- | ----------------------------- |
| M-1 | `runtimeAccess.ts` の関数名 rename 優先度が不明確                               | Phase 5 実装計画で優先度明記  |
| M-2 | Skill Creator surface の CTA は「後続定義」だが、interface の型定義は本タスクで | Phase 5 で action 型を export |
| M-3 | `TerminalLauncher` → `ExecutionConsoleLauncher` の rename 時に既存テスト修正要  | Phase 4 テスト計画に含める    |

### MAJOR 指摘

なし。

## 結論

設計は Phase 1 の要件（FR-1〜FR-7, NFR-1〜NFR-4, AC-1〜AC-4）を満たしており、Phase 4 着手条件を満たす。MINOR 指摘は Phase 4-5 で対応する。
