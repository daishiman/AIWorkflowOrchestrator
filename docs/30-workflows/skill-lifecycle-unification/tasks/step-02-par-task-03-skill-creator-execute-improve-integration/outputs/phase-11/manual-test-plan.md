# Phase 11 手動テスト計画

## メタ情報

| 項目        | 値                                                 |
| ----------- | -------------------------------------------------- |
| 対象 route  | `/advanced/skill-management-panel`                 |
| 実行方法    | Playwright screenshot harness + 実レンダリング確認 |
| viewport    | 1440x1600                                          |
| colorScheme | light                                              |

## テストケース

| TC-ID    | シナリオ                                  | 目的                           | 期待結果                                      |
| -------- | ----------------------------------------- | ------------------------------ | --------------------------------------------- |
| TC-11-01 | 自然文から collaborative モードで作成する | request -> create の表導線確認 | mode 判定と生成結果が 1 画面で見える          |
| TC-11-02 | 生成直後にそのまま実行へ進む              | execute 導線の連結確認         | created state から実行中 UI へ遷移する        |
| TC-11-03 | 改善提案と詳細分析へ進む                  | improve 導線の連結確認         | creator 提案と analysis view が同画面で開ける |
| TC-11-04 | 内部委譲前提でも UI を増やさず継続できる  | orchestration 非露出確認       | `実行分担` mode でも UI が増えず崩れない      |

## 実行コマンド

```bash
node apps/desktop/scripts/capture-task-skill-lifecycle-task03-phase11.mjs
```
