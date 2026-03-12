# Phase 11: 手動テスト - タスク仕様書

## 目的

ユーザー視点で、会話を通じてスキル作成から実行、改善まで完走できるかを確認する。

## シナリオ

1. 新規スキルを自然言語で作成する
2. 生成結果を確認して実行する
3. 実行結果を基に改善依頼する
4. 内部委譲が必要なケースで UI が破綻しないか確認する

## テストケース

| TC-ID    | シナリオ                                  | 目的                           | 期待結果                                      |
| -------- | ----------------------------------------- | ------------------------------ | --------------------------------------------- |
| TC-11-01 | 自然文から collaborative モードで作成する | request -> create の表導線確認 | mode 判定と生成結果が 1 画面で見える          |
| TC-11-02 | 生成直後にそのまま実行へ進む              | execute 導線の連結確認         | created state から実行中 UI へ遷移する        |
| TC-11-03 | 改善提案と詳細分析へ進む                  | improve 導線の連結確認         | creator 提案と analysis view が同画面で開ける |
| TC-11-04 | 内部委譲前提でも UI を増やさず継続できる  | orchestration 非露出確認       | `実行分担` mode でも UI が増えず崩れない      |

## 画面カバレッジマトリクス

| TC-ID    | 画面/状態                   | 証跡                                                                    |
| -------- | --------------------------- | ----------------------------------------------------------------------- |
| TC-11-01 | create flow                 | `outputs/phase-11/screenshots/TC-11-01-create-flow.png`                 |
| TC-11-02 | execute flow                | `outputs/phase-11/screenshots/TC-11-02-execute-flow.png`                |
| TC-11-03 | improve + analysis flow     | `outputs/phase-11/screenshots/TC-11-03-improve-flow.png`                |
| TC-11-04 | internal orchestration flow | `outputs/phase-11/screenshots/TC-11-04-internal-orchestration-flow.png` |

## 完了条件

- [ ] 4シナリオが完走可能
- [ ] 途中離脱ポイントが記録されている
- [ ] 各 TC-ID に対応するスクリーンショット証跡が outputs/phase-11/screenshots に存在する
