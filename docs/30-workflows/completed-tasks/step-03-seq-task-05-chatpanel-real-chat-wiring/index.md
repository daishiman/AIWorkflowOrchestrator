# chatpanel-real-chat-wiring - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| タスク名     | chatpanel-real-chat-wiring          |
| 分類         | 設計                                |
| 対象機能     | ChatPanel の実 AI チャット配線      |
| 優先度       | 高                                  |
| 見積もり規模 | 中規模                              |
| ステータス   | spec_created                        |
| 作成日       | 2026-03-13                          |

## タスク概要

### 目的

placeholder の ChatPanel を `Integrated API Runtime` の real AI chat 経路へ接続し、未接続時は `Claude Code terminal` への fallback UX を返せるようにする。

### 背景

現状の ChatPanel は model selector、message list、input が placeholder のままで、AI_CHAT と settings の切替が UI へ届いていない。さらに manual terminal と integrated runtime の区別がないと、チャット UI が何を実行する surface なのか説明できない。task-specification-creator の必須構造に合わせて仕様を再編する。

### 最終ゴール

ChatPanel が real chat 契約、selected config、integrated runtime、workspace context の handoff を持ち、未接続時は terminal launcher / guidance を返す設計を確定する。

### タスク種別と Phase 4-13 の位置づけ

本タスクは「設計」タスクであり、プロダクションコードの実装は行わない。Phase 4-13 は将来の実装フェーズで使用される「実装仕様書」として定義する。各 Phase の記述はコード実装の手順ではなく、実装時に従うべき設計契約・テスト設計・品質基準を規定するものである。

| Phase 範囲 | 本タスクでの扱い                                           |
| ---------- | ---------------------------------------------------------- |
| Phase 1-3  | 要件定義・設計・レビューを実施し、成果物を出力する         |
| Phase 4-13 | 実装仕様書として設計内容を記述する（コード実装は行わない） |

### 成果物一覧

| 種別               | 成果物                                                                                                                          | 配置先                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                         | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                            | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring/outputs/phase-*/` |
| system spec 同期先 | interfaces-llm.md / api-ipc-system.md / ui-ux-feature-components.md / ui-ux-settings.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                     |

## 参照ファイル

| 参照資料                                        | パス                                                                                                     | 内容                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index                               | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                               | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                    | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation                 | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation            | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| ChatPanel                                       | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                | placeholder UI の現状を確認する                                                   |
| ai handlers                                     | `apps/desktop/src/main/ipc/index.ts`                                                                     | AI_CHAT と selected config の current path を確認する                             |
| ChatPanel tests                                 | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`                                 | 既存 UI 契約を確認する                                                            |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                    | LLM と chat contract の正本                                                       |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                    | AI_CHAT と selected config の IPC 正本                                            |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                          | Workspace Chat Panel と ChatPanel 関連 UI 正本                                    |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                    | access capability と settings 表示契約                                            |
| ui-ux-panels                                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                                      | ChatPanel 統合パターンの正本                                                      |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md`   | selected config と auth key の既存ルール                                          |
| useStreamingChat                                | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                                                    | streaming hook 契約（実装済み、179行）                                            |
| StreamingMessage                                | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`                                         | streaming 表示コンポーネント（実装済み、83行）                                    |
| aiHandlers                                      | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                                | AI_CHAT ハンドラ（実装済み、234行）                                               |
| llm handlers                                    | `apps/desktop/src/main/handlers/llm.ts`                                                                  | LLM ストリーミングハンドラ（実装済み、442行）                                     |
| code-research-report                            | `outputs/code-research-report.md`                                                                        | 現行コード・テスト調査レポート（GAP分析含む）                                     |
| spec-research-report                            | `outputs/spec-research-report.md`                                                                        | システム仕様調査レポート（型定義・IPC契約・UI状態定義）                           |

## 受入基準

| ID    | 受入基準                                                                                          | 検証方法                                            |
| ----- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| AC-1  | placeholder 3箇所（model-selector-slot, message-list-slot, chat-input-slot）の置換対象が整理済み  | Phase 1 成果物で確認                                |
| AC-2  | ChatPanel の auth / runtime 要件が FR/NFR 分類で定義済み                                          | Phase 1 成果物で確認                                |
| AC-3  | 状態機械（8状態+遷移）とコンポーネント階層（12コンポーネント）が設計済み                          | Phase 2 成果物で確認                                |
| AC-4  | IPC 契約マトリクス（10チャンネル）が定義済み                                                      | Phase 2 成果物で確認                                |
| AC-5  | 16 レビュー観点で MAJOR 指摘 0 件                                                                 | Phase 3 成果物で確認                                |
| AC-6  | テストマトリクス（52テストケース）が定義済み                                                      | Phase 4 成果物で確認                                |
| AC-7  | 実装計画（6段階順序、変更ファイル13ファイル）が定義済み                                           | Phase 5 成果物で確認                                |
| AC-8  | カバレッジ目標（Line 80%, Branch 60%, Function 80%）が全対象ファイルで定義済み                    | Phase 7 成果物で確認                                |
| AC-9  | Phase 12 の 5 タスク必須構成（実装ガイド/仕様更新/changelog/未タスク/feedback）が仕様書に明記済み | Phase 12 仕様書で確認                               |
| AC-10 | 既知の落とし穴（P31/P39/P40/P42/P48/P60/P62）への対策が全 Phase に反映済み                        | 各 Phase 仕様書の多角的チェック観点セクションで確認 |

## タスク分解サマリー

| ID   | フェーズ | サブタスク名                 | 責務                                                                       | タスク数 | 完了条件数 | 依存 |
| ---- | -------- | ---------------------------- | -------------------------------------------------------------------------- | -------- | ---------- | ---- |
| T-01 | Phase 1  | 要件定義（P50チェック含む）  | placeholder 3箇所特定、FR/NFR分類、既存資産インベントリ、access capability | 7        | 8          | -    |
| T-02 | Phase 2  | 設計確定                     | 状態機械、コンポーネント階層、IPC契約、UX/a11y/セキュリティ設計            | 8        | 12         | T-01 |
| T-03 | Phase 3  | 設計レビュー（16観点）       | アーキテクチャ/IPC/UI/落とし穴の4カテゴリx4項目レビュー                    | 5        | 8          | T-02 |
| T-04 | Phase 4  | テスト作成（52テストケース） | 6カテゴリのテストマトリクス、IPC モック戦略                                | 6        | 10         | T-03 |
| T-05 | Phase 5  | 実装（6段階順序）            | placeholder置換、hook接続、コンポーネント実装                              | 7        | 10         | T-04 |
| T-06 | Phase 6  | テスト拡充（17エッジケース） | 長文入力、連続送信、mode切替、streaming中断、エラー回帰                    | 6        | 8          | T-05 |
| T-07 | Phase 7  | カバレッジ確認（13ファイル） | Line 80%/Branch 60%/Function 80% 目標達成確認                              | 4        | 8          | T-06 |
| T-08 | Phase 8  | リファクタリング             | state分離、コンポーネント分離、重複削除、命名統一                          | 4        | 8          | T-07 |
| T-09 | Phase 9  | 品質検証                     | UX/セキュリティ確認、lint/typecheck、全テスト実行                          | 5        | 10         | T-08 |
| T-10 | Phase 10 | 最終レビュー（21観点）       | 4段階レビューゲート（PASS/MINOR/MAJOR/CRITICAL）                           | 5        | 10         | T-09 |
| T-11 | Phase 11 | 手動テスト（7シナリオ）      | チャット送信/エラー/キャンセル/handoff/capability/a11y/旧API               | 7        | 12         | T-10 |
| T-12 | Phase 12 | ドキュメント（5タスク必須）  | 実装ガイド/仕様更新/changelog/未タスク/feedback                            | 5        | 17         | T-11 |
| T-13 | Phase 13 | PR作成                       | ブランチ作成、コミット前チェック、PR本文生成、CI確認                       | 5        | 13         | T-12 |

## 実行フロー

1. Phase 1-3 で前提、設計、レビューゲートを固める。
2. Phase 4-7 でテスト作成（TDD-Red）、実装（TDD-Green）、テスト拡充、カバレッジ確認を完結させる。
3. Phase 8-13 で実装順序、文書同期、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- integrated runtime、terminal fallback、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは AI_CHAT、selected config、workspace context、streaming UX、terminal launcher を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
