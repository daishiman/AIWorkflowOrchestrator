# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| Phase名    | 要件定義                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-01                    |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤 |
| 機能名     | skill-lifecycle-journey-foundation         |
| ステータス | completed                                  |
| 後続Phase  | [phase-2-design.md](./phase-2-design.md)   |
| 作成日     | 2026-03-11                                 |

## 目的

現行の `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` 導線を棚卸しし、一次導線に必要なジョブ、責務境界、advanced 導線の扱いを要件として固定する。

## 背景

既存仕様は UI 断片ごとに正本が分かれており、`skill lifecycle` をそのまま逆引きしづらい。Task01 では、実装前に「どこから始めるか」「どの画面が何を担うか」を要件レベルで一本化する必要がある。

## Atent Team 編成

| 役割       | 担当            | 責務                             |
| ---------- | --------------- | -------------------------------- |
| Lead       | 要件統合        | 判定基準、受入基準、依存範囲確定 |
| SubAgent-A | Discovery Agent | 現行導線棚卸し、入口一覧化       |
| SubAgent-B | UX Agent        | ジョブ定義、迷いポイント抽出     |
| SubAgent-C | Contract Agent  | Task02-05 への入力条件定義       |
| SubAgent-D | Spec Agent      | `.claude` 正本仕様の参照経路確定 |

## 実行タスク

- P50判定: 現行ブランチ差分と実装状態を調査し、新規設計か検証・補完モードかを判定する
- 要件抽出: `作る` `使う` `改善する` の 3 ジョブと品質ゲート位置を定義する
- 入口棚卸し: 現行の入口、隠し導線、advanced 導線を一覧化する
- 責務候補整理: 主要画面の主責務、禁止責務、受け渡し責務を整理する
- 依存条件定義: Task02-05 が必要とする入力、出力、禁止事項を整理する

## 参照資料

| 参照資料               | パス                                                                      | 内容                             |
| ---------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| app shell              | `apps/desktop/src/renderer/App.tsx`                                       | 主要 view と route 露出状況      |
| nav contract           | `apps/desktop/src/renderer/navigation/navContract.ts`                     | ViewType と主要導線の正本        |
| Skill management panel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | create/improve handoff の交点    |
| public view guard      | `apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts`       | `settings` 公開 shell の例外条件 |
| Skill Center view      | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 発見・追加導線                   |
| Workspace view         | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                 | 作業導線                         |
| Agent view             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | 実行導線                         |
| Chat view              | `apps/desktop/src/renderer/views/ChatView/index.tsx`                      | 会話導線                         |
| Skill creator UI       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | 作成導線                         |
| task-spec templates    | `.claude/skills/task-specification-creator/references/phase-templates.md` | Phase必須構造                    |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                                              |
| --------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| UIナビゲーション      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | nav 正本、ViewType、rollback/advanced 前提        |
| feature catalog       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Skill Center / Workspace / Agent / lifecycle 断片 |
| state management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | navigationSlice / uiSlice / view ownership        |
| architecture overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | shell と view 全体構造                            |
| Agent UI              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`  | 実行画面の正式責務                                |
| Agent execution       | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`    | 実行導線・Permission UI                           |
| Workspace chat/edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`  | workspace/chat/edit 境界                          |

## 実行手順

### 0. P50チェック: 既実装状態の調査

1. `git diff --stat` と `git status --short` で current worktree の変更範囲を確認する。
2. `App.tsx` `navContract.ts` `SkillManagementPanel` `shouldResetUnauthenticatedView` `SkillCenterView` `WorkspaceView` `AgentView` `ChatView` `SkillCreateWizard` の現状を確認する。
3. `App.tsx` の `/advanced/*` 実体、`VITE_USE_GLOBAL_NAV_STRIP` rollback、`settings` bypass を例外条件として記録する。
4. 既存実装が Task01 の一部を先行実装している場合は、以降の Phase を「検証・補完モード」で進める。

### 1. 要件抽出

1. 一次導線の開始地点、主要分岐、完了地点を抽出する。
2. `採点/評価` を独立画面にせず、品質ゲートとして扱う前提を要件化する。

### 2. 入口棚卸し

1. 主要ナビ、画面内ボタン、advanced / hidden ルートを一覧化する。
2. 「主要導線」「補助導線」「廃止候補」の 3 分類で整理する。
3. `SkillManagementPanel` 内の create / analyze 切替を、主要導線か補助導線かで明示分類する。

### 3. 責務候補整理

1. 各画面の主責務、禁止責務、受け渡し責務を整理する。
2. 内部実行方式である Atent Team / SubAgent が UI 概念として露出しない条件を定義する。

### 4. 依存条件定義

1. Task02-05 が参照する入力・出力・禁止事項を定義する。
2. 後続タスクが参照すべき `.claude` 正本仕様の起点を明記する。

## 統合テスト連携

| 観点           | 連携内容                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| ルート導線     | `App.tsx` と `navContract.ts` の導線整合を later test 対象として明記する                   |
| 画面責務       | `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` の責務重複をテスト観点へ引き継ぐ |
| advanced 導線  | hidden / advanced 導線が主要導線へ逆流しないことをテスト対象へ引き継ぐ                     |
| 公開ビュー例外 | `settings` の bypass / reset exclusion が他導線へ波及しないことをテスト対象へ引き継ぐ      |

## 多角的チェック観点

| 観点               | 適用内容                                                   |
| ------------------ | ---------------------------------------------------------- |
| UI/UX              | 一次導線の理解しやすさ、責務分離、用語一貫性               |
| アーキテクチャ     | view / shell / state の責務分離                            |
| セキュリティ       | advanced ルート露出が不要な権限迂回を生まないこと          |
| エラーハンドリング | 入口不明時の fallback 説明と回復導線                       |
| テスタビリティ     | 入口、遷移、責務境界がテスト可能な単位へ分解されていること |

## 成果物

| 成果物           | パス                                                   | 説明                        |
| ---------------- | ------------------------------------------------------ | --------------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`           | ジョブ、制約、受入基準      |
| スコープ定義     | `outputs/phase-1/scope-definition.md`                  | 含む/含まない、関係画面     |
| 導線棚卸し       | `outputs/phase-1/journey-entry-inventory.md`           | 入口、advanced、hidden 一覧 |
| 画面責務候補一覧 | `outputs/phase-1/surface-responsibility-candidates.md` | 主責務と禁止責務            |
| SubAgent責務表   | `outputs/phase-1/subagent-team-plan.md`                | 関心ごとの分離計画          |

## 完了条件

- [x] P50判定結果が記録されている
- [x] 3つのユーザージョブと品質ゲート位置が定義されている
- [x] 現行入口と advanced / hidden 導線が一覧化されている
- [x] 主要画面の責務候補が整理されている
- [x] Task02-05 への入力条件が記述されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: なし
- 後続: [phase-2-design.md](./phase-2-design.md)

## サブタスク管理

- [x] 参照資料確認
- [x] P50判定
- [x] 入口棚卸し
- [x] 責務候補整理
- [x] 依存条件定義
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物パスが Phase 2 から参照可能
- [x] `.claude` 正本仕様の参照起点が明記されている

## 次のPhase

Phase 2: [phase-2-design.md](./phase-2-design.md)
