# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |
| モード | P50該当: 検証・補完モード            |

## 目的

`useSkillAnalysis` の Store action / selector 利用、`SkillAnalysisView` の表示責務、`SkillCreateWizard` の `useCreateSkill()` 利用継続を設計として固定する。

## 実行タスク

- 対応表定義: direct IPC → Store action 対応表を定義する
- state境界定義: Store state / local state 境界を定義する
- テスト観点設計: hook / view / wizard / grep の観点を設計する
- 責務境界固定: TASK-10A-E-C / TASK-10A-G との責務境界を固定する

## 参照資料

| 資料名       | パス                                                                                        | 説明                    |
| ------------ | ------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1      | `phase-1-requirements.md`                                                                   | 要件定義                |
| 状態管理仕様 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state境界               |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S26 パターン            |
| UI機能仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | UI責務                  |
| Hook 実装    | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                      | 対象本体                |
| Store action | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      | analyze/apply/create 系 |

## 実行手順

### ステップ1: direct IPC → Store action 対応を定義する

| 旧呼び出し                                                           | 新呼び出し                    |
| -------------------------------------------------------------------- | ----------------------------- |
| `window.electronAPI.skill.analyze(skillName)`                        | `useAnalyzeSkill()`           |
| `window.electronAPI.skill.applyImprovements(skillName, suggestions)` | `useApplySkillImprovements()` |
| `window.electronAPI.skill.autoImprove(skillName)`                    | `useAutoImproveSkill()`       |
| `window.electronAPI.skill.create({...})`                             | `useCreateSkill()`            |

### ステップ2: state境界を定義する

| 状態                                                          | 配置先      | 理由             |
| ------------------------------------------------------------- | ----------- | ---------------- |
| `currentAnalysis`, `isAnalyzing`, `isImproving`, `skillError` | Store       | 共有状態         |
| `selectedSuggestions`, `improvementResult`                    | local state | 画面固有一時状態 |

### ステップ3: テスト観点を定義する

- hook 単体
- view 統合
- wizard 統合
- grep 監査

## 統合テスト連携

| ID      | 内容                                                     |
| ------- | -------------------------------------------------------- |
| IT-2-01 | SkillAnalysisView が Store 状態を描画する                |
| IT-2-02 | apply / autoImprove 後に再分析が反映される               |
| IT-2-03 | CreateWizard が Store action 経由で完了 step へ進む      |
| IT-2-04 | `SkillImportDialog` / `SkillEditor` を誤って巻き込まない |

## 多角的チェック観点

| 観点               | 確認内容                              |
| ------------------ | ------------------------------------- |
| アーキテクチャ     | hook / view / wizard の責務分離       |
| パフォーマンス     | 不要な Store state 追加を避けているか |
| エラーハンドリング | `skillError` に集約されているか       |
| 依存関係           | 先行タスクと後続タスクの境界が明確か  |

## 成果物

| 成果物       | パス                                                                                                       | 説明             |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| 設計書       | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/phase-2-design.md`                 | 本Phaseの正本    |
| 設計サマリー | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-2/design-summary.md` | 実行時補助成果物 |

## 完了条件

- [ ] direct IPC → Store action 対応表がある
- [ ] Store / local state 境界が定義されている
- [ ] テスト観点と責務境界が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 正本仕様確認
2. 対応表作成
3. state境界作成
4. 統合観点作成
5. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 3: 設計レビューゲート
