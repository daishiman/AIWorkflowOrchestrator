# Phase 7: カバレッジレポート

## 概要

severity filter 関連コードのテストカバレッジ確認。

## 対象コード

| コード                          | カバレッジ状況                                            |
| ------------------------------- | --------------------------------------------------------- |
| `SeverityFilterValue` 型定義    | 全3値をテストで使用                                       |
| `SEVERITY_FILTER_OPTIONS` 定数  | 全3オプションをレンダリング検証                           |
| `shouldShowCheck()` 関数        | 全分岐（all/warning+/error × info/warning/error）をテスト |
| `severityFilter` useState       | 初期値・切り替え・リセットをテスト                        |
| `filteredChecksByLayer` useMemo | フィルタ前後の出力を検証                                  |
| セグメントコントロール JSX      | レンダリング・クリック・a11y属性を検証                    |

## テストマトリクス

| filter \ severity | info                | warning             | error      |
| ----------------- | ------------------- | ------------------- | ---------- |
| all               | SF-TC-01 ✓          | SF-TC-01 ✓          | SF-TC-01 ✓ |
| warning+          | SF-TC-02 (hidden) ✓ | SF-TC-02 ✓          | SF-TC-02 ✓ |
| error             | SF-TC-03 (hidden) ✓ | SF-TC-03 (hidden) ✓ | SF-TC-03 ✓ |

## 判定

severity filter の全分岐・全 state 遷移がテストでカバーされている。
