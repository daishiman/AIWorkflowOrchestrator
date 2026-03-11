# Phase 11 成果物: discovered-issues

## 発見事項

| ID       | 重要度 | 内容                                                                                               | 切り分け                                              | 対応方針                                                                                          |
| -------- | ------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| LI-11-01 | 高     | Dashboard の統計カード周辺で補助テキストとラベルのコントラストが不足し、白背景上で判読性が低下する | token + component 併発（token改善のみでは収束しない） | `light-theme-shared-color-migration` で優先対応し、`text-secondary/tertiary` 実利用値を再割当する |
| LI-11-02 | 中     | Settings / AgentView の補助テキストが light 背景で弱く、情報階層が曖昧になる                       | component 側の text utility 影響が混在                | `light-theme-shared-color-migration` で調整                                                       |
| LI-11-03 | 低     | 情報量が多い画面で border と補助文の階層差が弱い箇所が残る                                         | token + component 併発                                | regression guard のチェックリストへ反映                                                           |

## 結論

- 主要導線は機能するが、light mode の情報階層は追加改善が必要（Phase 11 は条件付き PASS）。
- 残課題は token 基盤外として後続タスク（shared migration / regression guard）へ引き継ぐ。
