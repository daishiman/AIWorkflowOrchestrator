# Skill Lifecycle Routing - スキルライフサイクル導線配線

## 概要

SkillCreateWizard, SkillAnalysisView, SkillEditorView は全て実装済みだが、SkillCenterView（メイン入口画面）からこれらの画面への遷移導線が存在しない。本パックは「死んだ機能」をユーザーが到達可能にする導線配線を行う。

## 問題の根拠

9つの独立した分析エージェント（初期調査4 + 多角的検証5）が同一結論に収束:

- **批判的思考**: SkillCenterView に作成/編集/改善への導線が存在しない（反証なし）
- **システム思考**: ライフサイクルの因果ループに5つの断絶
- **UXジャーニー**: 主要ジャーニー4つ中3つが到達不能
- **MECE整合性**: SKILL_UPDATE デッドチャンネル、Skill Creator API 12メソッドが UI 未統合
- **代替案探索**: 10案を比較し、案4+5+2 の組み合わせが最適と判定

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| パック名   | skill-lifecycle-routing                |
| 優先度     | 高                                     |
| ステータス | spec_created                           |
| 依存パック | skill-lifecycle-unification (完了済み) |

## タスク一覧

| 順序 | タスクID                                    | ディレクトリ            | 責務                                                           | 実行順序                   |
| ---- | ------------------------------------------- | ----------------------- | -------------------------------------------------------------- | -------------------------- |
| 1    | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | `step-01-seq-task-01-*` | ViewType に skillAnalysis, skillCreate を追加。renderView 拡張 | 最優先・直列               |
| 2    | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001       | `step-02-par-task-02-*` | SkillCenterView にヘッダーCTA + JourneyPanel クリッカブル化    | Task01 Phase 3 後・並列    |
| 3    | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001     | `step-02-par-task-03-*` | SkillDetailPanel に編集・分析ボタン追加                        | Task01 Phase 3 後・並列    |
| 4    | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001        | `step-03-seq-task-04-*` | AgentView → SkillAnalysis 改善導線 + 戻り導線                  | Task02/03 Phase 3 後・直列 |
| 5    | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001        | `step-02-par-task-05-*` | SKILL_UPDATE ハンドラ登録 + SKILL_GET_DETAIL Preload 公開      | 独立・Task01 と並列可能    |

## 依存関係図

```
Task01 (ViewType基盤) ──┬──→ Task02 (SkillCenter導線) ──┐
                        ├──→ Task03 (DetailPanel拡張)  ──┤──→ Task04 (AgentView改善)
                        │                                │
Task05 (IPC修正) ───────┘  ← 独立実行可能                │
```

## 補助 Codepath 所有表

| codepath                                             | 所有タスク | 扱い方                                                   |
| ---------------------------------------------------- | ---------- | -------------------------------------------------------- |
| `store/types.ts` (ViewType)                          | Task01     | skillAnalysis, skillCreate を追加                        |
| `App.tsx` (renderView)                               | Task01     | 新 ViewType の case 追加                                 |
| `navigation/skillLifecycleJourney.ts`                | Task01/02  | Job Guide に onAction callback 型追加                    |
| `views/SkillCenterView/index.tsx`                    | Task02     | ヘッダーCTA + JourneyPanel CTA ボタン追加                |
| `views/SkillCenterView/hooks/useSkillCenter.ts`      | Task02     | 遷移アクション追加                                       |
| `views/SkillCenterView/components/SkillDetailPanel/` | Task03     | 編集・分析ボタン追加、onEdit/onAnalyze prop 追加         |
| `views/AgentView/index.tsx`                          | Task04     | 実行完了後の改善CTA追加                                  |
| `components/skill/SkillAnalysisView.tsx`             | Task04     | 戻り導線 (onNavigateBack) prop 追加                      |
| `preload/channels.ts`                                | Task05     | SKILL_UPDATE の整合性確認                                |
| `main/ipc/skillHandlers.ts`                          | Task05     | SKILL_UPDATE ハンドラ登録 + SKILL_GET_DETAIL Preload公開 |
| `preload/skill-api.ts`                               | Task05     | getDetail() / update() メソッド追加                      |

## 関連仕様書

| 仕様書                               | パス                                                                                        | 用途                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------- |
| ナビゲーション正本                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様  |
| 機能別コンポーネント                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillEditor 仕様  |
| スキルライフサイクル統合             | `docs/30-workflows/skill-lifecycle-unification/index.md`                                    | ジョブガイド・Surface Ownership |
| 導線契約正本                         | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                             | 画面責務境界                    |
| ナビゲーション契約                   | `apps/desktop/src/renderer/navigation/navContract.ts`                                       | NavStrip / MobileNavBar 仕様    |
| IPC契約チェックリスト                | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | Task05 の IPC 修正手順          |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand/IPC パターン            |

## 必要仕様抽出マトリクス（aiworkflow-requirements）

> `resource-map.md` と `quick-reference-search-patterns.md` を起点に、今回実装に必要な正本のみを抽出した結果。

### 共通（Task01〜04）

| 関心ごと                       | 参照仕様                                                                                                    | 抽出理由                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 導線・ViewType 正本            | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                     | `skill-center` alias 正規化、`Skill Center` 一次導線、surface ownership の契約を固定するため |
| 画面責務・UI要素               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                             | SkillCenter / Agent / SkillAnalysis の UI責務境界を固定するため                              |
| 状態管理契約                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                | `setCurrentView` / slice責務 / state handoff の境界を明確化するため                          |
| shell配置・legacy整合          | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                           | `normalizeSkillLifecycleView()` と shell 側責務の整合を確認するため                          |
| 導線再利用知見（作成済み利用） | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | create/use/improve の handoff 設計を再利用するため                                           |
| 導線再利用知見（評価ゲート）   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | Agent→Analysis 改善ループの設計原則を再利用するため                                          |

### IPC専用（Task05）

| 関心ごと                  | 参照仕様                                                                          | 抽出理由                                               |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| IPC契約ドリフト防止       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | Main/Preload/型定義/仕様書の同時更新規約を適用するため |
| IPC API 正本              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:*` チャンネル契約の確認                         |
| IPC セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証・safeInvoke境界・エラー露出制御を確認       |
| スキルIPC専用セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | skill系チャンネルの公開面と制約を確認                  |
| Skill API 型契約          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Preload API の型整合（P32/P44/P45）を確認              |

## タスク別仕様適用表

| タスク                                | 主要仕様セット                                                                                         | 実装アンカー                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Task01 ViewType/renderView 基盤       | `ui-ux-navigation`, `arch-state-management`, `architecture-overview-core`                              | `store/types.ts`, `App.tsx`, `navigation/skillLifecycleJourney.ts`         |
| Task02 SkillCenter 作成導線           | `ui-ux-navigation`, `ui-ux-feature-components`, `workflow-skill-lifecycle-created-skill-usage-journey` | `views/SkillCenterView/*`, `useSkillCenter.ts`, `skillLifecycleJourney.ts` |
| Task03 SkillDetailPanel 編集/分析導線 | `ui-ux-feature-components`, `ui-ux-navigation`, `arch-state-management`                                | `SkillDetailPanel.tsx`, `SkillCenterView/index.tsx`, `useSkillCenter.ts`   |
| Task04 AgentView 改善導線             | `workflow-skill-lifecycle-evaluation-scoring-gate`, `ui-ux-navigation`, `arch-state-management`        | `views/AgentView/index.tsx`, `SkillAnalysisView.tsx`, `App.tsx`            |
| Task05 IPC 整合修正                   | `ipc-contract-checklist`, `api-ipc-agent`, `security-electron-ipc`, `interfaces-agent-sdk-skill`       | `main/ipc/skillHandlers.ts`, `preload/skill-api.ts`, `preload/channels.ts` |

## エレガンス監査（破棄判断）

| 候補案                                                             | 判断 | 理由                                                             |
| ------------------------------------------------------------------ | ---- | ---------------------------------------------------------------- |
| すべてを Task01 に統合して一括修正                                 | 破棄 | UI導線責務とIPC契約修正が混在し、レビュー/回帰範囲が膨張するため |
| Task02〜04 を完全独立で同時実装                                    | 破棄 | Task01 の ViewType 基盤未確定時に仕様ドリフトが発生するため      |
| 現行案（Task01基盤 → Task02/03並列 + Task05独立並列 → Task04収束） | 採用 | 関心分離を維持しつつ、依存順序と並列性を両立できるため           |

## 機械検証結果

| 検証          | コマンド                                  | 結果                            |
| ------------- | ----------------------------------------- | ------------------------------- |
| 構造検証      | `verify-all-specs.js --workflow <各task>` | 全 task `passed=true`（13/13）  |
| Phase仕様検証 | `validate-phase-output.js <各task>`       | 全 task エラー0（警告のみ残存） |
