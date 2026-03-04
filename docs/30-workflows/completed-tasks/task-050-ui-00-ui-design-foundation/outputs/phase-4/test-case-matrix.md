# Phase 4 テストケース台帳

| TC ID        | 対象                 | 観点                                          | 期待結果                                       |
| ------------ | -------------------- | --------------------------------------------- | ---------------------------------------------- |
| TC-UI-00-101 | `tokens.css`         | 3テーマ定義                                   | `kanagawa-dragon/light/dark` が解決される      |
| TC-UI-00-102 | Atoms                | status/chip/badge/skeleton/empty/time         | propsに応じた表示とARIA属性                    |
| TC-UI-00-103 | Molecules            | SearchBar/CodeViewer/TabSwitcher/Panel/Dialog | 入力・タブ・開閉・確認動作が成立               |
| TC-UI-00-104 | Organisms            | CardGrid/MasterDetail/SearchFilterList        | 一覧・詳細・検索フィルター統合                 |
| TC-UI-00-105 | 全新規コンポーネント | 3テーマ描画                                   | `renderWithAllThemes` で例外なし               |
| TC-UI-00-106 | A11y                 | role/aria/キーボード                          | `searchbox/tab/dialog/alertdialog/grid` が成立 |
| TC-UI-00-107 | SearchFilterList     | 検索ANDフィルター                             | 積集合ロジックが正しく絞り込む                 |
| TC-UI-00-108 | TypeScript           | strict型検証                                  | `pnpm --filter @repo/desktop typecheck` 通過   |
| TC-UI-00-109 | Coverage             | lines/branches/functions                      | 対象範囲閾値達成                               |
