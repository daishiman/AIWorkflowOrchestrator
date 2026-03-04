# Phase 3 指摘一覧

## MAJOR

- なし

## MINOR

1. `ConfirmDialog` の既存機能名との意味衝突リスク

- 対応: Molecules配下の共通UI用途として命名を限定し、利用箇所を明記

2. `MasterDetailLayout` のモバイルクローズ導線

- 対応: `onCloseDetail` を任意追加し、オーバーレイ閉じ導線を実装

3. `CodeViewer` のシンタックスハイライト簡易化

- 対応: 初期実装は可読性優先（`--syntax-*` 拡張は後続改善項目として管理）

## 判定への影響

- MAJORが0件のためゲート通過可
