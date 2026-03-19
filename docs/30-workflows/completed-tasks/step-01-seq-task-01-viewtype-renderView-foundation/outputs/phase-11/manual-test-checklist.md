# Phase 11 手動テストチェックリスト

## タスクID

TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001

## テストケース

| TC-ID    | テスト内容                                                    | 実施 | 備考            |
| -------- | ------------------------------------------------------------- | ---- | --------------- |
| TC-11-01 | `renderView("skillAnalysis")` が SkillAnalysisView を描画する | [x]  | screenshot 取得 |
| TC-11-02 | `renderView("skillCreate")` が SkillCreateWizard を描画する   | [x]  | screenshot 取得 |
| TC-11-03 | `renderView("dashboard")` が既存どおり描画される              | [x]  | screenshot 取得 |
| TC-11-04 | SkillAnalysisView の close で skillCenter へ戻る              | [x]  | screenshot 取得 |
| TC-11-05 | legacy alias `skill-center` が `skillCenter` に正規化される   | [x]  | screenshot 取得 |

## 実行コマンド

```bash
node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs
```
