# Phase 6: Edge Case Test Expansion

## テスト拡張方針

Phase 4 で定義した基本テスト（30 件）に対し、以下の 4 カテゴリでエッジケースを追加。
各パネルの堅牢性を検証し、プロダクション環境で発生しうる境界値・特殊入力に耐えることを確認する。

## カテゴリ 1: 空データ境界

| テストケース    | 対象パネル               | シナリオ                                              | 期待結果                                           |
| --------------- | ------------------------ | ----------------------------------------------------- | -------------------------------------------------- |
| T-EDGE-EMPTY-01 | PlanResultDetailPanel    | agents, scripts, triggers, anchors が全て同時に空配列 | 全セクションにフォールバックメッセージが表示される |
| T-EDGE-EMPTY-02 | PlanResultDetailPanel    | skillName が空文字列                                  | ヘッダーがフォールバック表示される                 |
| T-EDGE-EMPTY-03 | PlanResultDetailPanel    | skillSpec が undefined                                | 折りたたみセクションが非表示になる                 |
| T-EDGE-EMPTY-04 | ExecuteResultDetailPanel | permissionDenials, sdkEvents が同時に空配列           | 折りたたみセクションに「0件」が表示される          |
| T-EDGE-EMPTY-05 | ExecuteResultDetailPanel | sessionId, resultSubtype, stopReason が全て undefined | metadata セクションが非表示になる                  |
| T-EDGE-EMPTY-06 | ExecuteResultDetailPanel | sourceProvenance が undefined                         | provenance セクションが非表示になる                |

## カテゴリ 2: 長大データ境界

| テストケース   | 対象パネル               | シナリオ                                | 期待結果                                 |
| -------------- | ------------------------ | --------------------------------------- | ---------------------------------------- |
| T-EDGE-LONG-01 | PlanResultDetailPanel    | skillName が 200 文字                   | テキストが折り返されてレイアウト崩れなし |
| T-EDGE-LONG-02 | PlanResultDetailPanel    | description が 2000 文字                | テキストが折り返されてレイアウト崩れなし |
| T-EDGE-LONG-03 | PlanResultDetailPanel    | agents が 50 件                         | 全エントリが表示される                   |
| T-EDGE-LONG-04 | PlanResultDetailPanel    | triggers が 30 件                       | 全タグが折り返し表示される               |
| T-EDGE-LONG-05 | ExecuteResultDetailPanel | error メッセージが 500 文字             | テキストが折り返されてレイアウト崩れなし |
| T-EDGE-LONG-06 | ExecuteResultDetailPanel | permissionDenials が 20 件              | 全エントリが折りたたみ内に表示される     |
| T-EDGE-LONG-07 | ExecuteResultDetailPanel | sdkEvents が 100 件                     | 全イベントが折りたたみ内に表示される     |
| T-EDGE-LONG-08 | ExecuteResultDetailPanel | sourceProvenance パスが長大（深い階層） | パスが折り返されてレイアウト崩れなし     |

## カテゴリ 3: 特殊文字

| テストケース   | 対象パネル               | シナリオ                                                | 期待結果                                                   |
| -------------- | ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------- |
| T-EDGE-CHAR-01 | PlanResultDetailPanel    | skillName が日本語（「スキル作成テスト」）              | 日本語が正常に表示される                                   |
| T-EDGE-CHAR-02 | PlanResultDetailPanel    | description に HTML タグ（`<script>alert(1)</script>`） | タグがエスケープされ、スクリプトが実行されない（XSS 防止） |
| T-EDGE-CHAR-03 | ExecuteResultDetailPanel | error メッセージに HTML タグ                            | タグがエスケープされ、スクリプトが実行されない             |

## カテゴリ 4: 状態遷移

| テストケース    | 対象パネル               | シナリオ                              | 期待結果                                   |
| --------------- | ------------------------ | ------------------------------------- | ------------------------------------------ |
| T-EDGE-STATE-01 | PlanResultDetailPanel    | isLoading が true から false に変化   | スケルトンが消えて結果パネルが表示される   |
| T-EDGE-STATE-02 | ExecuteResultDetailPanel | error が設定後に executeResult が設定 | ErrorBanner が消えて結果パネルが表示される |
| T-EDGE-STATE-03 | PlanResultDetailPanel    | 同一 props で再レンダリング           | 表示が変化しない（冪等性の確認）           |

## テスト追加サマリ

| 対象パネル               | 追加テスト数 | 内訳                                                                  |
| ------------------------ | ------------ | --------------------------------------------------------------------- |
| PlanResultDetailPanel    | 6            | 空データ 3 + 長大データ 4 + 特殊文字 2 + 状態遷移 2（パネル跨ぎ含む） |
| ExecuteResultDetailPanel | 6            | 空データ 3 + 長大データ 4 + 特殊文字 1 + 状態遷移 1（パネル跨ぎ含む） |
| **合計**                 | **12**       |                                                                       |

## Phase 4 テスト数との整合

| 項目                     | Phase 4 時点           | Phase 6 追加                        | 累計   |
| ------------------------ | ---------------------- | ----------------------------------- | ------ |
| ErrorBanner              | 5                      | 0                                   | 5      |
| PlanResultDetailPanel    | 14                     | 6                                   | 20     |
| ExecuteResultDetailPanel | 11                     | 6                                   | 17     |
| SkillLifecyclePanel 統合 | (Phase 4 の 51 に含む) | 0                                   | (含む) |
| **合計**                 | **51**                 | **+12 → 但し Phase 4 は 51 ベース** | **53** |

> 注: Phase 4 時点では 51 テストとしていたが、Phase 5 実装時にSkillLifecyclePanel 統合テスト 2 件が ErrorBanner/Panel テストに統合され、Phase 6 で 12 件追加の結果、最終的に 53 テストとなった。
