# 計装責務境界マップ

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 8                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 責務境界マップ

| ファイル                                    | 責務                                    | trackEvent 呼び出し | 備考                                             |
| ------------------------------------------- | --------------------------------------- | ------------------- | ------------------------------------------------ |
| `utils/trackEvent.ts`                       | renderer-local の薄い計装スタブ         | 定義元（no-op）     | dev: console.info / prod: no-op / 将来: sink差替 |
| `components/skill/SkillCreateWizard.tsx`    | 計装呼び出し・ウィザード制御            | 5 箇所呼び出し      | 計装の責任を一手に担う                           |
| `components/skill/wizard/CompleteStep.tsx`  | ネクストアクション UI（計装は外部委譲） | なし                | presentational のまま。onNextAction のみ受け取る |
| `SkillAnalytics` / `AnalyticsStore`（既存） | execution-centric の分析基盤            | なし（分離）        | W3 の UI 計装とは独立。接続しない                |

---

## 計装ポイント別責務マッピング

| 計装ポイント                        | 呼び出しファイル        | 発火タイミング                                                    |
| ----------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| `skill_wizard_started`              | `SkillCreateWizard.tsx` | `useEffect([], [])` マウント時                                    |
| `skill_wizard_step1_completed`      | `SkillCreateWizard.tsx` | `handleGenerate` 先頭                                             |
| `skill_wizard_generation_completed` | `SkillCreateWizard.tsx` | `createSkill` 成功後（catch 外）                                  |
| `skill_skeleton_quality_feedback`   | `SkillCreateWizard.tsx` | `handleQualityFeedback` 内                                        |
| `skill_wizard_next_action`          | `SkillCreateWizard.tsx` | `handleExecuteNow` / `handleOpenInEditor` / `handleCreateAnother` |

---

## 責務境界の設計原則

### CompleteStep を presentational に保つ理由

```
CompleteStep（UI）
  ↓ onNextAction(action) を呼ぶだけ
SkillCreateWizard（計装責任者）
  ↓ trackEvent("skill_wizard_next_action", { action }) を呼ぶ
trackEvent（スタブ）
  ↓ console.info / 将来の sink
```

この設計により:

- `CompleteStep` のテストに `trackEvent` モックが不要
- 計装ロジックの変更が `SkillCreateWizard` 1 ファイルに集中
- `CompleteStep` を他の場所で再利用する際に計装が混入しない

---

### SkillAnalytics / AnalyticsStore との分離理由

| 項目        | W3 UI 計装（renderer-local）  | SkillAnalytics / AnalyticsStore（既存） |
| ----------- | ----------------------------- | --------------------------------------- |
| 対象        | ウィザード操作の UI イベント  | スキル実行ログ・実行結果                |
| スコープ    | renderer のみ                 | main process / IPC 経由                 |
| 現在の sink | `console.info`（dev のみ）    | 既存の分析基盤                          |
| 将来の sink | 独立した UI analytics adapter | 変更なし                                |
| IPC 依存    | なし                          | あり                                    |

---

## 境界違反チェック

| 違反パターン                                           | 状態 | 確認方法                                                 |
| ------------------------------------------------------ | ---- | -------------------------------------------------------- |
| `CompleteStep.tsx` が `trackEvent` を直接呼ぶ          | なし | ファイル検索で `trackEvent` import がないことを確認      |
| `trackEvent.ts` が IPC を呼ぶ                          | なし | `trackEvent.ts` に `ipc` / `safeInvoke` がないことを確認 |
| `SkillAnalytics` を `SkillCreateWizard` 内で計装に使用 | なし | `SkillAnalytics` import がないことを確認                 |

---

## 完了条件チェックリスト

- [x] 責務境界マップが全ファイルについて記録されていること
- [x] `CompleteStep.tsx` が計装なしであることが明記されていること
- [x] `SkillAnalytics` / `AnalyticsStore` との分離理由が記録されていること
- [x] 境界違反チェックが完了していること
