# Phase 5: 実装

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| Phase名    | 実装                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                  |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤               |
| 前提Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md)   |
| 後続Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

Task01 設計に従って、route、navigation、主要画面の入口整理、advanced 導線の補助導線化を実装する。

## Atent Team 編成

| 役割       | 担当           | 責務                                  |
| ---------- | -------------- | ------------------------------------- |
| Lead       | 実装統合       | 変更順序、依存衝突解消                |
| SubAgent-A | Journey Agent  | `App.tsx` と route 露出整理           |
| SubAgent-B | Surface Agent  | `AppLayout` nav、画面ラベル、入口表示 |
| SubAgent-C | Contract Agent | Task02-05 用の contract surface 固定  |
| SubAgent-D | Evidence Agent | 実装ログ、変更ファイル表、Green 記録  |

## 実行タスク

- shell 実装: `App.tsx` と navigation shell の導線を整理する
- 入口実装: `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` の入口を定義どおり整理する
- advanced 実装: advanced / hidden 導線を補助導線へ退避またはラベル変更する
- contract surface 実装: Task02-05 が依存する入力/出力 surface を明確にする
- 実装記録: 変更理由、変更ファイル、Green 状態を記録する

## 参照資料

| 参照資料              | パス                                                                      | 内容                       |
| --------------------- | ------------------------------------------------------------------------- | -------------------------- |
| test cases            | `outputs/phase-4/test-cases.md`                                           | Red/Green 対象             |
| route contract        | `outputs/phase-4/route-contract-test-matrix.md`                           | route 実装基準             |
| responsibility matrix | `outputs/phase-2/surface-responsibility-matrix.md`                        | 画面責務正本               |
| app shell             | `apps/desktop/src/renderer/App.tsx`                                       | route 実装先               |
| nav contract          | `apps/desktop/src/renderer/navigation/navContract.ts`                     | ViewType 正本              |
| SkillManagementPanel  | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | create/improve handoff     |
| public view guard     | `apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts`       | `settings` reset exclusion |
| AppLayout             | `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`      | shell                      |
| GlobalNavStrip        | `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/index.tsx` | desktop/tablet nav         |
| MobileNavBar          | `apps/desktop/src/renderer/components/organisms/MobileNavBar/index.tsx`   | mobile nav                 |
| SkillCenterView       | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 発見導線                   |
| WorkspaceView         | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                 | 作業導線                   |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | 実行導線                   |
| ChatView              | `apps/desktop/src/renderer/views/ChatView/index.tsx`                      | 会話導線                   |
| SkillCreateWizard     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | 作成導線                   |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`        | 改善導線                   |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                                         |
| --------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| UIナビゲーション      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | nav/shell 契約                               |
| feature components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Skill Center / Workspace / Agent / lifecycle |
| state management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state ownership                              |
| architecture overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | renderer 構成                                |
| Agent UI              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`  | 実行 UI 契約                                 |
| Agent execution       | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`    | 権限/ログ表示                                |
| Workspace Chat/Edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`  | workspace/chat/edit 境界                     |

## 実行手順

1. `shared contract -> shell -> view entry -> advanced fallback -> tests` の順で変更する。
2. route と nav の正本を `navContract.ts` に寄せ、重複定義を残さない。
3. `SkillManagementPanel` と `/advanced/*` の handoff を整理し、create/improve 導線の二重露出を避ける。
4. `VITE_USE_GLOBAL_NAV_STRIP` rollback と `settings` bypass を例外経路として隔離し、主要導線の説明責務を混ぜない。
5. 主要導線の入口表現を統一し、advanced 導線は補助文脈へ退避する。
6. Task02-05 が参照する入口 surface を変える場合は依存契約表へ即時反映する。
7. commit / PR は実行せず、実装ログとテスト結果のみを残す。

## 統合テスト連携

| 観点              | 連携内容                                                              |
| ----------------- | --------------------------------------------------------------------- |
| shell 統合        | `App.tsx` と nav shell の結線を検証する                               |
| entry surface     | 主要画面の入口が一意に表示されることを検証する                        |
| advanced fallback | advanced 導線が主要導線を置換しないことを検証する                     |
| 公開ビュー例外    | `settings` bypass と reset exclusion が設計どおりであることを検証する |

## 成果物

| 成果物           | パス                                      | 説明               |
| ---------------- | ----------------------------------------- | ------------------ |
| 実装ログ         | `outputs/phase-5/implementation-log.md`   | 実装順序と判断理由 |
| 変更ファイル表   | `outputs/phase-5/change-file-matrix.md`   | 変更対象一覧       |
| Green 実行記録   | `outputs/phase-5/green-test-log.txt`      | 実装時テスト結果   |
| 導線差分サマリー | `outputs/phase-5/journey-diff-summary.md` | before/after 差分  |

## 完了条件

- [x] 一次導線が UI 上で露出している
- [x] 主要画面の責務に反する入口が除去または退避されている
- [x] advanced 導線が主要導線の代替になっていない
- [x] Task02-05 が依存する surface が安定している
- [x] 実装ログと Green 記録が残っている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-4-test-creation.md](./phase-4-test-creation.md)
- 後続: [phase-6-test-expansion.md](./phase-6-test-expansion.md)

## サブタスク管理

- [x] 参照資料確認
- [x] shell 実装
- [x] view entry 実装
- [x] advanced 実装
- [x] Green 確認
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 設計どおりの surface が実装されている
- [x] commit / PR を未実行のまま記録が残っている

## 次のPhase

Phase 6: [phase-6-test-expansion.md](./phase-6-test-expansion.md)
