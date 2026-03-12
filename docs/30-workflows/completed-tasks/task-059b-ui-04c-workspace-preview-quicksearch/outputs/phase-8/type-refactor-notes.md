# Phase 8 型整理メモ

## 明示した型

- `QuickFileSearchResult`
- `UseQuickFileSearchArgs`
- `UseQuickFileSearchReturn`
- `PreviewPanelProps`
- `StructuredResult`

## 型設計メモ

- 既存 preload type を流用し、shared contract は変更しない
- QuickSearch result は UI 表示に必要な `path / fileName / relativePath / score` に限定した
- Preview mode は `source | preview` の union とし、分岐を狭めた
