# Phase 1 要件定義（SubAgent-A）

## 機能要件（FR）

| ID    | 要件                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| FR-01 | `ViewType` 契約に `workspace` / `skillCenter` / `historySearch` を含め、`store/types.ts` を単一正本として扱う。 |
| FR-02 | `App.tsx` の `renderView()` がナビゲーション対象の全ViewTypeを分岐し、`never` 到達保証を維持する。              |
| FR-03 | AppDockナビ項目とショートカットを固定契約化し、後続 `TASK-UI-02` の `NAV_SECTIONS` と整合可能な形にする。       |
| FR-04 | Cmd/Ctrl + `1..8` と Cmd/Ctrl + `,` でビュー遷移できること。                                                    |
| FR-05 | 入力中（input/textarea/select/contenteditable）ではショートカットが誤発火しないこと。                           |

## 非機能要件（NFR）

| ID     | 要件                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------- |
| NFR-01 | 関心分離: ナビ契約は `navigation/navContract.ts` に集約し、`AppDock` と `App.tsx` が同じ契約を参照する。 |
| NFR-02 | 型安全: `ViewType` 互換性を壊さず、既存 `skill-center` 互換分岐を維持する。                              |
| NFR-03 | テスト可能性: 契約・ショートカット解決ロジックを単体テスト可能な純関数で提供する。                       |
| NFR-04 | セキュリティ境界: Renderer内のショートカット処理はIPC追加なし（Main/Preload境界への影響ゼロ）。          |
