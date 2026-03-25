# Phase 8: リファクタリング — 成果物

## 確認結果

| 項目                      | 結果                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| iconMap の並び順          | play-circle を folder-search と replace の間に配置。既存パターン維持      |
| NAV_SECTIONS items 順序   | ショートカット番号順（Cmd+7, Cmd+8, Cmd+9）と一致                         |
| NAV_SHORTCUT_TO_VIEW 順序 | 数字順(1-9) → 記号(,) の順序を維持                                        |
| DockViewType member 順序  | executionConsole を editor と settings の間に配置。意味的グルーピング維持 |

## 判定: リファクタリング不要

本タスクは「追加」のみの変更であり、既存コードの構造変更は不要。
