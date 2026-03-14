# TASK-SKILL-LIFECYCLE-04: aiworkflow-requirements 抽出マップ

## 目的

評価・採点・受け入れゲート統合で必要な正本仕様を、`aiworkflow-requirements` から漏れなく再現可能に抽出する。

## 抽出原則（Progressive Disclosure）

- 入口は `indexes/resource-map.md` と `indexes/quick-reference.md` を固定する。
- 検索は 1 概念 1 クエリで分割する。
- 実装アンカーは Renderer/Main/Shared の 3 層で照合する。
- 抽出結果は `必須` と `補助` に分離する。

## 検索コマンド（再現手順）

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill lifecycle" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillAnalysisView" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:optimize:evaluate" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "PromptEvaluation" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Store-Driven Lifecycle Integration" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ipc sender validation" -C 3
```

## 必須仕様セット

| 関心ごと            | 正本仕様                                                                                  | 確認ポイント                                         |
| ------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 導線契約            | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                   | create/use/improve 導線、surface責務、advanced route |
| 評価UI契約          | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md` | `SkillAnalysisView` / `ScoreDisplay` / 改善導線      |
| ライフサイクル統合  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`           | Store-Driven Lifecycle Integration                   |
| IPCチャネル契約     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md` | `skill:optimize:evaluate` / `PromptEvaluation`       |
| IPCセキュリティ契約 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`            | sender検証、入力検証、サニタイズ                     |
| IPC全体契約         | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                     | IPC命名とAPI境界                                     |
| 状態管理契約        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`              | state ownership / hook責務                           |
| 全体アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`              | Skillチャネル群とレイヤー責務                        |
| Phase 12 同期先     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                      | 完了記録の同期先                                     |
| Phase 12 同期先     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                    | 教訓の同期先                                         |

## 補助仕様セット

| 関心ごと             | 正本仕様                                                                                    | 用途                          |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| Skill型の入口仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | child companion 入口確認      |
| Electron IPC横断原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証/例外処理の横断原則 |
| 要件品質基準         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 受入基準の検証観点補強        |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 共通化/責務分離の再利用       |

## 実装アンカー

| レイヤー            | パス                                                                   | 用途                                 |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------ |
| Renderer navigation | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`        | create/use/improve 導線契約          |
| Renderer view       | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | 評価画面への導線接続                 |
| Renderer UI         | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     | 評価表示と改善操作                   |
| Renderer UI         | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`          | 総合/カテゴリ別スコア表示            |
| Renderer hook       | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 分析・改善状態管理                   |
| Main IPC            | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | `skill:optimize:evaluate` 受付       |
| Main service        | `apps/desktop/src/main/services/skill/PromptOptimizer.ts`              | 評価ロジック                         |
| Shared type         | `packages/shared/src/types/skill-improver.ts`                          | `PromptEvaluation` / `SkillAnalysis` |

## SubAgent 分担（関心分離）

| SubAgent   | 関心ごと                  | 出力                             |
| ---------- | ------------------------- | -------------------------------- |
| SubAgent-A | 導線・UI仕様抽出          | `ui-contract-notes.md`           |
| SubAgent-B | IPC・型・セキュリティ抽出 | `ipc-contract-notes.md`          |
| SubAgent-C | 実装アンカー照合          | `implementation-anchor-notes.md` |

## 抽出完全性チェック

| チェック項目             | 結果 |
| ------------------------ | ---- |
| 必須仕様セット 10 件抽出 | PASS |
| 補助仕様セット 4 件抽出  | PASS |
| 実装アンカー 8 件照合    | PASS |
| SubAgent責務分離         | PASS |

## 完了条件

- [ ] 必須仕様セット 10 件を抽出した
- [ ] 補助仕様セット 4 件を抽出した
- [ ] 実装アンカー 8 件を照合した
- [ ] SubAgent-A/B/C の責務分離を記録した
