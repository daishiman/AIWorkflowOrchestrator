# Phase 2 aiworkflow 正本仕様抽出マトリクス

| 正本                         | 反映対象                   | 設計反映                                      |
| ---------------------------- | -------------------------- | --------------------------------------------- |
| `ui-ux-navigation.md`        | 9 項目導線、ショートカット | `navContract.ts`, `useNavShortcuts`           |
| `ui-ux-components.md`        | organisms / molecules 境界 | `GlobalNavStrip`, `MobileNavBar`, `AppLayout` |
| `ui-ux-design-principles.md` | 視認性、階層               | expanded / collapsed の幅とラベル表示         |
| `ui-ux-design-system.md`     | 幅、spacing、glass         | 56 / 200 / 56、glass 背景継承                 |
| `ui-ux-portal-patterns.md`   | More メニュー overlay      | `MoreMenu` の portal 実装                     |
| `arch-state-management.md`   | P31, selector, slice 分離  | `uiSlice` 拡張、`navigationSlice` 維持        |
| `quality-requirements.md`    | TDD / coverage             | Phase 4〜7 のテスト構成                       |
| `testing-accessibility.md`   | aria / keyboard / focus    | a11y test plan                                |
