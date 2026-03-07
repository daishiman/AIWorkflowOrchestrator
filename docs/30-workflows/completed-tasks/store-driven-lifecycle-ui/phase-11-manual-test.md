# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| Phase      | 11         |
| タスクID   | TASK-10A-F |
| ステータス | completed  |

## テストケース

| TC-ID    | 内容                                |
| -------- | ----------------------------------- |
| TC-11-01 | SkillAnalysisView 初期表示（dark）  |
| TC-11-02 | SkillAnalysisView 提案選択状態      |
| TC-11-03 | SkillAnalysisView 改善適用後表示    |
| TC-11-04 | SkillAnalysisView 自動改善後表示    |
| TC-11-05 | SkillAnalysisView エラー表示        |
| TC-11-06 | SkillAnalysisView ローディング表示  |
| TC-11-07 | SkillAnalysisView 初期表示（light） |
| TC-11-08 | SkillAnalysisView モバイル表示      |
| TC-11-09 | SkillCreateWizard Step1 初期表示    |
| TC-11-10 | SkillCreateWizard Step2 設定表示    |
| TC-11-11 | SkillCreateWizard 完了表示          |

## 画面カバレッジマトリクス

| テストケース | 画面                    | 証跡                                                 |
| ------------ | ----------------------- | ---------------------------------------------------- |
| TC-11-01     | Analysis default dark   | `screenshots/TC-01-analysis-default-dark.png`        |
| TC-11-02     | Analysis selection      | `screenshots/TC-02-analysis-selection-dark.png`      |
| TC-11-03     | Analysis apply improved | `screenshots/TC-03-analysis-apply-improved-dark.png` |
| TC-11-04     | Analysis auto improved  | `screenshots/TC-04-analysis-auto-improved-dark.png`  |
| TC-11-05     | Analysis error          | `screenshots/TC-05-analysis-error-dark.png`          |
| TC-11-06     | Analysis loading        | `screenshots/TC-06-analysis-loading-dark.png`        |
| TC-11-07     | Analysis default light  | `screenshots/TC-07-analysis-default-light.png`       |
| TC-11-08     | Analysis mobile         | `screenshots/TC-08-analysis-default-mobile-dark.png` |
| TC-11-09     | Create step1            | `screenshots/TC-09-create-step1-dark.png`            |
| TC-11-10     | Create step2            | `screenshots/TC-10-create-step2-dark.png`            |
| TC-11-11     | Create complete         | `screenshots/TC-11-create-complete-dark.png`         |

## 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/screenshots/*.png`
