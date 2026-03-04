# Phase 10 是正指示書

## 必須是正（MAJOR）

- なし

## 推奨是正（MINOR）

1. Lightテーマの境界線視認性向上

- 対象: `--border-subtle` / `--border-default`
- 目的: Apple HIGの明度バランスを維持しつつ可読性改善

2. ConfirmDialog分岐テスト追加

- 対象: フォーカストラップ境界ケース

3. モバイル時の密度最適化

- 対象: CardGridカード内の余白と二次情報表示量

## 差し戻し条件

- MINORがMAJOR化（操作不能/誤操作誘発）した場合は Phase 8 へ戻す
