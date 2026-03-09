# Phase 5: 実装 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-10A-G                 |
| Phase    | 5 - 実装                   |
| 前Phase  | `phase-4-test-creation.md` |
| 次Phase  | Phase 6（テスト拡充）      |

## 目的

Phase 4 で確定した不足テストを既存 suite へ追加する。  
基本方針は **tests first / runtime minimal**。runtime 修正は RT-01〜RT-07 に直接紐づく欠陥が出た場合のみ許可する。

## 実装対象

| SubAgent | ファイル                                    | 実装内容                                    |
| -------- | ------------------------------------------- | ------------------------------------------- |
| G1       | `SkillCreateWizard.test.tsx`                | create action / 成功 / 失敗の回帰補完       |
| G1       | `SkillManagementPanel.integration.test.tsx` | create / analysis view 往復と一覧維持の補完 |
| G2       | `SkillAnalysisView.test.tsx`                | analyze / retry / improve / disabled の補完 |
| G2       | `useSkillAnalysis.test.ts`                  | hook 委譲・confirm 分岐の補完               |
| G2       | `agentSlice.skill-lifecycle.test.ts`        | state/action の成功・失敗・再試行補完       |
| G3       | `ChatPanel.skill-management.test.tsx`       | top-level toggle 回帰の維持                 |

## runtime 修正を許可する境界

以下の file に限り、テストで実欠陥が出た場合のみ最小修正を許可する。

- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`
- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`

禁止:

- Main IPC 側への横滑り
- `SkillEditor.tsx` direct IPC backlog の先行着手
- user 未承認のコミット / PR

## 実装手順

1. G1 と G2 を並列で着手する。
2. G3 は G1/G2 の差分が見えた後に回帰確認を統合する。
3. テスト失敗の原因が環境 blocker か product defect かを分離する。
4. runtime 修正が発生した場合は RT-ID と紐付けて記録する。

## 実行コマンド

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx \
  src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
  src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

## 完了条件

- [x] 追加テストが既存 suite 内に実装されている
- [x] runtime 修正がある場合、RT-ID 単位で必要性が説明されている
- [x] Main IPC 新規テストが紛れ込んでいない
- [x] コミット / PR を行っていない

## テンプレート準拠追補

## 実行タスク

- T1: Phase 4 で確定した補完ケースを既存 suite へ実装する
- T2: 実欠陥が出た場合に限定して最小 runtime 修正を行う
- T3: G1 / G2 / G3 の差分を Phase 6 へ引き渡す

## 参照資料

| 参照資料           | パス                                                                              | 用途                                     |
| ------------------ | --------------------------------------------------------------------------------- | ---------------------------------------- |
| 依存Phase 4        | `phase-4-test-creation.md`                                                        | ケース定義確認                           |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | state/action 契約確認                    |
| UI仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | view / toggle 契約確認                   |
| Skill実行I/F仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | analyze/improve/execute 呼び出し契約確認 |
| IPC契約仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC戻り値・エラー契約確認                |
| Agent実行UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | 実行中 disabled / guard 確認             |
| SkillStream UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md` | streaming view 契約確認                  |
| quick-reference    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | TASK-10A-G 入口確認                      |

## 実行手順

1. G1 / G2 を並列で進める
2. runtime 修正が必要になった場合は RT-ID と紐付けて最小補完する
3. G3 で ChatPanel 回帰と top-level 連携を確認する

## 統合テスト連携

| 連携面  | 内容                                             |
| ------- | ------------------------------------------------ |
| G1 ↔ G2 | create / analysis 往復の整合を維持する           |
| G2 ↔ G3 | `isExecuting` / panel toggle の連動を壊さない    |
| Phase 6 | 追加ケースのうち境界値・排他制御の不足を洗い出す |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                             |
| ------------------ | ---- | ---------------------------------------------------- |
| テスト実装         | ✅   | 既存 mock / helper パターンに寄せているか            |
| アーキテクチャ     | ✅   | Main IPC と `SkillEditor` backlog へ逸脱していないか |
| エラーハンドリング | ✅   | env blocker と runtime defect を分離しているか       |
| 運用制約           | ✅   | no-commit / no-PR を守っているか                     |

## 成果物

| 成果物       | パス                                       | 説明                           |
| ------------ | ------------------------------------------ | ------------------------------ |
| 実装仕様     | `phase-5-implementation.md`                | 実装対象、runtime 境界、実行順 |
| 修正テスト群 | `apps/desktop/src/renderer/.../__tests__/` | 既存 suite への補完差分        |

## サブタスク管理

1. G1 実装
2. G2 実装
3. G3 回帰確認
4. runtime 境界の記録

## タスク100%実行確認

- [x] Phase 4 の補完ケースを既存 suite に反映した
- [x] runtime 修正の要否を RT-ID と紐付けた
- [x] no-commit / no-PR / no-new-Main-IPC を守った

## 次のPhase

Phase 6（テスト拡充）
