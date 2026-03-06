# Phase 7 カバレッジギャップ分析

## 分類結果

| 区分         | 項目                     | 内容                                         | 優先度 |
| ------------ | ------------------------ | -------------------------------------------- | ------ |
| 仕様漏れ     | なし                     | 必須仕様に対する未定義ギャップは見つからない | -      |
| 実装漏れ     | なし                     | blocking な未実装分岐はない                  | -      |
| テスト漏れ   | `MoreMenu` の一部 branch | document/portal 系の分岐で未到達が残る       | 中     |
| テスト漏れ   | Step 3 完全削除経路      | `AppDock` 完全削除後の grep 0件確認は未実施  | 中     |
| 環境ギャップ | repo-wide threshold      | タスク差分と無関係な全体閾値 fail が出る     | 低     |

## 詳細

### 1. `MoreMenu` branch 79.17%

- 原因: portal 展開時の document listener と close 分岐のうち、非ブラウザ相当の枝が残っている。
- 影響: 現行要件の達成には影響しない。
- 対応方針: Step 3 ではなく Phase 8 の技術負債として管理する。

### 2. Step 3 削除経路は未検証

- 原因: rollback safe を優先し、`AppDock` を残している。
- 影響: 完全移行の readiness はあるが、削除完了の証跡ではない。
- 対応方針: `appdock-removal-readiness.md` に No-Go 条件として明記する。

### 3. repo-wide coverage threshold fail

- 原因: タスク対象外コードが coverage 分母に含まれる。
- 影響: CI 上で誤読すると task-057 自体が fail に見える。
- 対応方針: task scope の抽出値を正本とし、repo-wide 値は環境情報として扱う。

## Phase 8 への引き継ぎ

1. `MoreMenu` の未到達 branch を狙うか、現状の 79.17% を受容するかを決める。
2. `AppDock` 削除 readiness を「依存棚卸し」と「実際の削除」に分けて判断する。
3. coverage 運用は task scope と repo-wide を分離して記録する。
