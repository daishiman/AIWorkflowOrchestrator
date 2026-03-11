# [#1087] [UT-10A-F-SCREENSHOT-HARNESS-HARDENING] Screenshot Harness の data-testid ベース待機条件標準化

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | UT-10A-F-SCREENSHOT-HARNESS-HARDENING     |
| 分類         | 改善                                      |
| 対象機能     | Phase 11 スクリーンショット撮影スクリプト |
| 優先度       | 中                                        |
| 見積もり規模 | 小規模                                    |
| 発見元       | TASK-10A-F Phase 11 実行時の苦戦箇所 #8   |
| 発見日       | 2026-03-08                                |

## 概要

Phase 11 スクリーンショット撮影スクリプトの待機条件を `data-testid` ベースに標準化し、Store駆動パターンとの整合性を確保する。

## 背景・課題

- capture スクリプトが Store action 内部の例外メッセージに依存して待機条件を設定
- Store駆動パターンでは内部例外が Store action 内で吸収され、UIには汎用エラーメッセージが表示される
- `capture-skill-analysis-view-screenshots.mjs` も `data-testid` ではなくCSSセレクタに依存

## 成果物

- 修正済み capture スクリプト 2件
- capture スクリプトテンプレート
- `data-testid` 追加済みコンポーネント

## タスク仕様書

`docs/30-workflows/unassigned-task/task-10a-f-screenshot-harness-hardening.md`
