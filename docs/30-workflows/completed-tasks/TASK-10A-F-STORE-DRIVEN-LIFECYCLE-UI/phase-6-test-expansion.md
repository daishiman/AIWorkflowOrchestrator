# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |
| モード | P50該当: 既存テスト補強              |

## 目的

error path と再分析 path を中心に、TASK-10A-F の再発条件をカバーするテスト観点を補強する。

## 実行タスク

- error path確認: `analyzeSkill` 失敗時の流れを確認する
- apply後再分析確認: `applySkillImprovements` 後の再分析を確認する
- auto後再分析確認: `autoImproveSkill` 後の再分析を確認する
- mock標準化確認: selector mock 標準化を確認する

## 参照資料

| 資料名                         | パス                                                                                                | 説明          |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ------------- |
| Phase 5                        | `phase-5-implementation.md`                                                                         | 実装確認結果  |
| `useSkillAnalysis` テスト      | `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`                     | hook テスト   |
| `SkillAnalysisView` 統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx` | view テスト   |
| 教訓                           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                              | mock パターン |

## 実行手順

### ステップ1: 追加観点を定義する

| ID       | 観点                     |
| -------- | ------------------------ |
| TC-06-01 | `skillError` 伝播        |
| TC-06-02 | apply 後の再分析         |
| TC-06-03 | autoImprove 後の再分析   |
| TC-06-04 | handler の未処理例外防止 |
| TC-06-05 | selector mock の一貫性   |

### ステップ2: lessons learned と突き合わせる

- `vi.mock("../../../store")` パターン
- P31 回帰観点

## 統合テスト連携

- 追加観点を Phase 7 のカバレッジ判定へ接続する

## 多角的チェック観点

| 観点               | 確認内容                         |
| ------------------ | -------------------------------- |
| テスト品質         | 再発条件を直接テストしているか   |
| エラーハンドリング | `skillError` が UI に流れるか    |
| 改善思考           | 教訓をテスト観点へ反映しているか |

## 成果物

| 成果物         | パス                                                                                                              | 説明             |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| テスト拡充結果 | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/outputs/phase-6/test-expansion-result.md` | 追加観点レポート |

## 完了条件

- [ ] error path と再分析 path の観点がある
- [ ] lessons learned の mock 観点を反映している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 追加観点抽出
2. 教訓照合
3. 結果記録
4. 完了条件確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 7: カバレッジ確認
