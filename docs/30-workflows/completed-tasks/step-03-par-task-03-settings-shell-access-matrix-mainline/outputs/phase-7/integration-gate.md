# Phase 7: 統合ゲート

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 再実行対象

| ゲート種別  | 対象テスト                                                 | PASS 条件                                |
| ----------- | ---------------------------------------------------------- | ---------------------------------------- |
| Smoke       | TC-C01（integratedRuntime/ready）, TC-L01（launcher 活性） | 基本パスが動作すること                   |
| Integration | SC-01〜SC-06                                               | 全統合シナリオが PASS すること           |
| Regression  | RG-01〜RG-06                                               | 全回帰テストが PASS すること             |
| Walkthrough | SC-01 + SC-02（認証/未認証の切り替えフロー）               | 認証状態変更時の UI 整合性が保たれること |

## 2. 統合ゲート判定

- 本タスクは設計タスクのため、実テスト実行は後続実装タスクで実施する
- 設計ドキュメントベースの walkthrough として、contract-matrix.md の全パターンが矛盾なく定義されていることを確認した
- 判定: **設計レベル PASS**（実テスト実行は後続タスクに委譲）

## 3. Phase 9 へ持ち越す Residual Risk

- 実テスト実行時の Branch Coverage 推奨基準未達リスク
- health IPC の実装状況に依存する HealthStatusRow のテスト成否
- P41（v8 インライン関数カウント）による Function Coverage 低下リスク
