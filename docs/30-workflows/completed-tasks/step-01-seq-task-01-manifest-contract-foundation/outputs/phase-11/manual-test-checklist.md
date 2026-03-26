# Manual Test Checklist

## 対象

- index
- Phase 1
- Phase 2
- Phase 10
- `outputs/phase-1/current-code-anchor-map.md`
- `outputs/phase-2/authority-split-matrix.md`
- `outputs/phase-10/task02-handoff-checklist.md`

## 実施項目

- [x] TC-11-01: manifest scope を 3 文以内で説明できる
- [x] TC-11-02: loader 非責務を根拠付きで説明できる
- [x] TC-11-03: Task02/03/04 handoff の不足有無を説明できる

## scope 説明

manifest は phase topology、resource descriptor、entry-exit hook の宣言だけを持つ。  
loader はその宣言を検証し正規化するが、実行しない。  
runtime authority は facade / IPC / preload 側に残る。

## 備考

- 本 task は docs-only walkthrough のため、画像証跡は採取しない。
