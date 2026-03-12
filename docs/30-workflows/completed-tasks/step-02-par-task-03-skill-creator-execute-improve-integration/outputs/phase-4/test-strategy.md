# Phase 4 テスト戦略

## 目的

Task03 の変更を UI、store handoff、internal engine 境界の 3 レイヤで検証する。

## テストレイヤ

| レイヤ                | 対象                                                                        | 目的                                                                      |
| --------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Component integration | `SkillManagementPanel`                                                      | session card の入力、表示、action 遷移を検証する                          |
| Store integration     | `agentSlice`, store selectors                                               | create / execute / improve の handoff を検証する                          |
| Existing regression   | `SkillCreateWizard`, `SkillAnalysisView`, `SkillManagementPanel` 既存テスト | 既存 create view / analysis view / list view を壊していないことを確認する |

## 重点観点

1. 自然言語入力から mode hint が表示されること
2. create 成功後に skill 名を選択 state へ handoff できること
3. 実行と改善が同一 session card から起動できること
4. wizard が二次導線として残ること
5. internal engine の詳細が UI 文言へ漏れないこと

## 実行方針

- Phase 4 では `SkillManagementPanel` 向けの新規統合テストを追加して Red を確認する。
- Phase 5 で実装後、追加テストと既存関連テストを Green 化する。
- Phase 6 で failure 系を追加し、Phase 7 で網羅状況を整理する。
