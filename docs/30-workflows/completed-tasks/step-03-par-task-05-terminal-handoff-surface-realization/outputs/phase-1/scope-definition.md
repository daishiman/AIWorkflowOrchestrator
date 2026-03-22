# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| タスクID | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase    | 1                                                 |
| 作成日   | 2026-03-22                                        |

## 1. 対象スコープ

### 1.1 設計対象

| 対象                         | 説明                                                         | 成果物                                           |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| Persistent Terminal Launcher | 全 mainline surface で常時表示される launcher の統一仕様     | 配置・見た目・動作の設計書                       |
| Shared Handoff Card          | integrated 実行不可時の統一 handoff UI                       | HandoffGuidance DTO 消費の共通コンポーネント仕様 |
| Guidance-Only Consumer 統一  | Skill Docs 等の guidance-only consumer が同一 DTO を使う設計 | SkillDocsCapabilityResult DTO 統一図             |
| Manual Boundary 固定         | auto-send 禁止・hidden injection 禁止の制約定義              | 4 層防御の設計と screenshot 契約                 |
| Context Summary 仕様         | TerminalHandoffBuilder の context summary 生成仕様           | DTO フィールド定義と生成ルール                   |

### 1.2 対象ファイル（設計影響範囲）

| ファイル                          | 影響種別                           |
| --------------------------------- | ---------------------------------- |
| `ExecutionEnvironment/index.tsx`  | 設計変更（terminal case 実装計画） |
| `TerminalHandoffBuilder.ts`       | 設計確認（既存 DTO 契約の固定）    |
| `SkillDocsCapabilityResolver.ts`  | 設計確認（capability 分岐の統一）  |
| `TerminalHandoffCard.tsx`（既存） | 設計変更（shared handoff card 化） |

## 2. 除外スコープ

| 除外対象                               | 理由                                   | 担当タスク       |
| -------------------------------------- | -------------------------------------- | ---------------- |
| TerminalDock の実装                    | 実装は後続タスク                       | 未タスク化予定   |
| Transcript Share Actions の実装        | Task06 の責務                          | TASK-06          |
| Chat/Workspace の Guidance Wiring 実装 | Task04 の責務                          | TASK-04          |
| Slide/Modifier の Manual Fallback 実装 | Task08 の責務                          | TASK-08          |
| Open Working Directory 機能            | セキュリティリスク評価後に後続タスク化 | 未タスク化予定   |
| プロダクションコードの実装             | 本タスクは設計タスク                   | 後続実装タスク   |
| コミット・PR 作成                      | ユーザー指示なしに実行禁止             | Phase 13 blocked |

## 3. 依存タスク

### 3.1 上流依存（本タスクが依存するタスク）

| タスク                                     | 依存内容                                      | ステータス |
| ------------------------------------------ | --------------------------------------------- | ---------- |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 | HandoffGuidance DTO / capability DTO の定義元 | 完了       |
| Task01 (Contract Foundation)               | terminal-handoff capability の根拠定義        | 完了       |
| Task02 (Central Policy)                    | manual lane policy / no auto-send rule        | 完了       |

### 3.2 下流依存（本タスクの成果物を使うタスク）

| タスク                            | 消費内容                                 |
| --------------------------------- | ---------------------------------------- |
| Task03 (Settings/Shell)           | launcher visibility rule、access matrix  |
| Task04 (Chat/Workspace Guidance)  | handoff card パターン、CTA 定義          |
| Task06 (Transcript Provenance)    | transcript share の出発点                |
| Task07 (ChatPanel Review Harness) | persistent launcher の mainline contract |
| Task08 (Slide/Modifier Fallback)  | manual fallback card パターン            |

## 4. Phase 実行ゲート条件

| ゲート                | 条件                                      | 違反時の対応       |
| --------------------- | ----------------------------------------- | ------------------ |
| Phase 4 着手条件      | Phase 1-3 が全て完了していること          | Phase 4 に進まない |
| Phase 13 blocked 条件 | ユーザー指示なしに commit/PR を作成しない | ユーザー指示待ち   |
| 設計タスク制約        | プロダクションコードの変更は含まない      | 設計文書のみ出力   |
