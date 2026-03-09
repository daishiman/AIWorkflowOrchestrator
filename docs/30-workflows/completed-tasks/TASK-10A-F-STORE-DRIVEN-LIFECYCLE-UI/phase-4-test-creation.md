# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |
| モード | P50該当: 既存テストの検証・補完      |

## 目的

既存の analysis/create 導線テストと grep 監査を TASK-10A-F の正しい責務に合わせて整理する。

## 実行タスク

- hook観点整理: `useSkillAnalysis` の単体テスト観点を整理する
- view観点整理: `SkillAnalysisView` の統合観点を整理する
- wizard観点整理: `SkillCreateWizard` の統合観点を整理する
- grep観点整理: direct IPC 残存監査コマンドを整理する

## 参照資料

| 資料名                  | パス                                                                                                | 説明         |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| Phase 1                 | `phase-1-requirements.md`                                                                           | 要件観点     |
| Phase 2                 | `phase-2-design.md`                                                                                 | 設計観点     |
| Phase 3                 | `phase-3-design-review.md`                                                                          | レビュー結果 |
| useSkillAnalysis テスト | `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`                     | hook 単体    |
| AnalysisView 統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx` | view 統合    |
| CreateWizard 統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` | wizard 統合  |

## 実行手順

### ステップ1: 既存テスト資産を棚卸しする

- `useSkillAnalysis.test.ts`
- `SkillAnalysisView.test.tsx`
- `SkillAnalysisView.store-integration.test.tsx`
- `SkillCreateWizard.test.tsx`
- `SkillCreateWizard.store-integration.test.tsx`

### ステップ2: テストケースを定義する

## テストケース

| ID       | 対象                  | 期待結果                                      |
| -------- | --------------------- | --------------------------------------------- |
| TC-04-01 | `handleAnalyze`       | Store action が呼ばれ UIクラッシュしない      |
| TC-04-02 | `handleApplySelected` | 選択提案のみが渡される                        |
| TC-04-03 | `handleAutoImprove`   | confirm 後に action が呼ばれる                |
| TC-04-04 | `selectedSuggestions` | local state でトグルされる                    |
| TC-04-05 | `SkillAnalysisView`   | loading / error / success が描画される        |
| TC-04-06 | `SkillCreateWizard`   | `useCreateSkill()` 経由で完了 step へ遷移する |
| TC-04-07 | grep 監査             | analysis/create 導線に direct IPC が残らない  |

### ステップ3: grep 監査コマンドを固定する

```bash
rg -n 'window\\.electronAPI\\.skill\\.(analyze|applyImprovements|autoImprove)' \
  apps/desktop/src/renderer/components/skill

rg -n 'window\\.electronAPI\\.skill\\.create' \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

## 統合テスト連携

- hook / view / wizard / grep の4系統を Phase 9 へ渡す
- `SkillImportDialog` と `SkillEditor` は除外する

## 多角的チェック観点

| 観点       | 確認内容                                 |
| ---------- | ---------------------------------------- |
| テスト品質 | 既存テスト資産を再利用できているか       |
| P31        | action selector の安定参照テストがあるか |
| 回帰       | 既存 UI 表示テストを壊していないか       |
| スコープ   | import dialog 系テストを混入していないか |

## 成果物

| 成果物         | パス                                                                                                             | 説明           |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | -------------- |
| テスト設計書   | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/phase-4-test-creation.md`                | 本Phaseの正本  |
| テスト設計結果 | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-4/test-creation-result.md` | 実行時レポート |

## 完了条件

- [ ] TC-04-01 〜 TC-04-07 が定義されている
- [ ] grep 監査コマンドが記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 既存テスト確認
2. テストケース定義
3. grep 監査定義
4. 統合観点確認
5. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 5: 実装
