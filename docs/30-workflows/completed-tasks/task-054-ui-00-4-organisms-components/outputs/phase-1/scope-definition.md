# Phase 1 スコープ定義

## 1. 対象

- CardGrid<T>
- MasterDetailLayout
- SearchFilterList<T>

## 2. 実装対象（In Scope）

| 区分       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| UI         | 3コンポーネント本体、状態表示（loading/empty/detail open/結果0件） |
| a11y       | role/aria/keyboard/focus                                           |
| responsive | desktop/tablet/mobileの表示切替                                    |
| theme      | kanagawa-dragon / light / dark の表示確認                          |
| test       | Redテスト、Green化、拡充、coverage、回帰                           |
| docs       | Phase 1〜12 の成果物ドキュメント                                   |

## 3. 非対象（Out of Scope）

| 区分       | 内容                                 |
| ---------- | ------------------------------------ |
| データ取得 | API/IPCの新規追加・変更              |
| 永続化     | DBスキーマ変更                       |
| 仮想化     | 大規模リスト向け仮想スクロール最適化 |
| i18n       | 多言語文言展開                       |
| Storybook  | 専用ストーリー作成                   |

## 4. 制約

| 制約ID | 内容                                            |
| ------ | ----------------------------------------------- |
| SC-01  | P31: store直接参照禁止（props駆動 + 局所状態）  |
| SC-02  | P39: userEvent禁止、fireEvent標準               |
| SC-03  | P40: テスト実行ディレクトリ固定（apps/desktop） |

## 5. SubAgent チーム編成

| SubAgent           | 役割                  | 直列/並列           |
| ------------------ | --------------------- | ------------------- |
| SubAgent-REQ-UI    | 要件分解・仕様固定    | 直列（Phase 1前半） |
| SubAgent-REQ-A11Y  | AC定義                | 並列                |
| SubAgent-REQ-TEST  | テスト観点抽出        | 並列                |
| SubAgent-DESIGN-\* | Phase 2設計           | 並列                |
| SubAgent-TEST/IMPL | Phase 4〜8 実装・検証 | 並列                |

## 6. Phase 2 への引き継ぎ

- ACをテストIDへ展開する設計マップを作成する。
- `matchMedia` モック前提でレスポンシブ設計を確定する。
- propsの必須/任意/デフォルト値を型契約として固定する。
