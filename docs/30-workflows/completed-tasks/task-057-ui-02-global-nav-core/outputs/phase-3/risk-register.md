# Phase 3 リスク登録簿

| Risk ID | 内容                                          | 影響                     | 回避策                                 | 戻り先  |
| ------- | --------------------------------------------- | ------------------------ | -------------------------------------- | ------- |
| R-01    | `navContract` と UI 実装の重複                | 導線ドリフト             | 定数は正本参照のみ                     | Phase 2 |
| R-02    | `responsiveMode` が実ウィンドウ幅に追従しない | tablet / mobile 検証不能 | resize sync を追加                     | Phase 5 |
| R-03    | More メニューが stacking context に埋もれる   | mobile 導線不能          | portal + overlay を採用                | Phase 2 |
| R-04    | 編集要素上で shortcut 誤発火                  | 入力破壊                 | editable guard を共通化                | Phase 4 |
| R-05    | AppDock を早期削除して rollback 不可          | 高                       | feature flag 維持、Step 3 readiness 化 | Phase 8 |
| R-06    | existing view を ComingSoon に置換して退行    | 高                       | 実ビュー維持、fallback のみ追加        | Phase 5 |

## 優先度

- High:
  - R-02, R-05, R-06
- Medium:
  - R-01, R-03, R-04
