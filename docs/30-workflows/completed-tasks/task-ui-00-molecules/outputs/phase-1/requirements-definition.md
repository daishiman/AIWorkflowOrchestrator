# Phase 1 要件定義書

- 対象: TASK-UI-00-MOLECULES
- 作成日: 2026-03-04
- 参照: `phase-1-requirements.md`, `task-053-ui-00-3-molecules-components.md`

## 要件一覧

| コンポーネント | 主要要件                                                                              | REQ-ID        |
| -------------- | ------------------------------------------------------------------------------------- | ------------- |
| SearchBar      | 即時 onChange、デバウンス onDebouncedChange、Escape クリア、searchbox role            | SB-REQ-01〜05 |
| CodeViewer     | 行番号切替、コピー、Copy→Check遷移、filePathヘッダー、ARIAラベル                      | CV-REQ-01〜05 |
| TabSwitcher    | underline/pill 切替、Arrow/Home/End/Enter、disabledスキップ、tablist/tab role         | TS-REQ-01〜05 |
| SlideInPanel   | isOpen制御、left/right切替、フォーカストラップ、フォーカス復元、Escape close          | SP-REQ-01〜05 |
| ConfirmDialog  | destructive表示、loadingロック、初期フォーカス(キャンセル)、alertdialog、Enter/Escape | CD-REQ-01〜05 |

## 非機能要件

| 要件   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| NFR-01 | 3テーマ（kanagawa-dragon / light / dark）描画を検証する    |
| NFR-02 | WCAG 2.1 AA（キーボード操作、role/aria、フォーカス視認性） |
| NFR-03 | Props駆動を維持し、Molecules内でStoreを直接参照しない      |
| NFR-04 | happy-dom前提で `fireEvent` を使用する                     |
| NFR-05 | `apps/desktop` 起点で Vitest を実行する                    |

## 依存関係

- 前提: `TASK-UI-00-TOKENS`, `TASK-UI-00-ATOMS`
- 後続: `TASK-UI-00-ORGANISMS`
