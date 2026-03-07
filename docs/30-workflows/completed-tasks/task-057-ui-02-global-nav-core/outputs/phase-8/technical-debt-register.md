# Phase 8 技術負債整理

| ID       | 項目                           | 内容                                             | 影響                  | 優先度 |
| -------- | ------------------------------ | ------------------------------------------------ | --------------------- | ------ |
| TD-08-01 | `AppDock` 残存                 | rollback path のため legacy 実装を保持している   | Step 3 を遅らせる     | 中     |
| TD-08-02 | `MoreMenu` branch 79.17%       | portal/document 系の未到達 branch が残る         | 軽微なテスト空白      | 低     |
| TD-08-03 | repo lint script 不在          | `apps/desktop` で lint を QA gate に含められない | 品質ゲートの粒度不足  | 中     |
| TD-08-04 | dashboard 側のコントラスト弱さ | nav ではなく既存本文デザイン由来                 | mobile 視認性の印象差 | 低     |

## 推奨対応

1. Step 3 実施時に `AppDock` 残存を解消する。
2. lint script は repo 方針として別タスクで整備する。
3. dashboard 本文のコントラストは別 UI タスクで扱う。
