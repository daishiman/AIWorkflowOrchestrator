# Phase 6 アクセシビリティ回帰計画

## 回帰対象

| 項目                   | 期待値                                   | 自動検証     | 手動検証                   |
| ---------------------- | ---------------------------------------- | ------------ | -------------------------- |
| `aria-current="page"`  | 現在ページの nav item に付与される       | 実施済み     | Phase 11 desktop/tablet    |
| keyboard roving focus  | ArrowUp/Down/Home/End で移動できる       | 実施済み     | Phase 11 tablet            |
| `NavCollapseToggle`    | toggle の状態が認識しやすい              | 実施済み     | Phase 11 desktop           |
| `MoreMenu` role        | `menu` / `menuitem` が設定される         | 実施済み     | Phase 11 mobile            |
| Escape / outside click | menu を閉じられる                        | 実施済み     | Phase 11 mobile            |
| editable guard         | 入力中に shortcut が誤発火しない         | 実施済み     | Phase 11 desktop           |
| back shortcut          | `Cmd/Ctrl+[` が `viewHistory` を尊重する | 実施済み     | Phase 11 desktop           |
| spacing/contrast       | 主要導線が読める                         | 一部手動依存 | Phase 11 screenshot review |

## WCAG/HIG 観点

- フォーカス位置が見失われないこと。
- active state が hover 依存にならないこと。
- mobile のタップ領域が密集しすぎないこと。
- nav 自体は控えめでも、現在地は即座に判別できること。

## 残課題

| 項目                                 | 状態     | 扱い                                                |
| ------------------------------------ | -------- | --------------------------------------------------- |
| dashboard 本文側のコントラストの弱さ | 既存課題 | 本タスクでは nav 由来ではないため観察事項として記録 |
| `MoreMenu` branch 79.17%             | 軽微     | テスト強化候補として Phase 7/8 に引き継ぎ           |
