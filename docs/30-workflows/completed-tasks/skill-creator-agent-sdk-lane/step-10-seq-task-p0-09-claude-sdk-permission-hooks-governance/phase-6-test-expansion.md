# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 6                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

permission denial、hook failure、unexpected tool request の edge case を検証する。

## 実行タスク

- denial ケース追加
- hook failure ケース追加
- unexpected tool request ケース追加

## 実行手順

### ステップ1: denial ケースを追加する

- 予期された拒否
- 予期しない tool request

### ステップ2: hook failure ケースを追加する

- hook 例外
- audit sink failure

### ステップ3: unexpected tool request ケースを追加する

- phase 境界外の write
- deny されるべき tool

### ステップ4: 回帰防止観点を固定する

- 新規ケースが既存ケースを壊していないか確認する

## 参照資料

| 資料名  | パス                       | 説明       |
| ------- | -------------------------- | ---------- |
| Phase 4 | `phase-4-test-creation.md` | 基本テスト |

## 成果物

| 成果物               | パス                                      | 説明       |
| -------------------- | ----------------------------------------- | ---------- |
| extended test record | `outputs/phase-6/extended-test-record.md` | 拡張テスト |

## 完了条件

- [x] edge case が追加されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 4 の基本テストに対する fail path を追加する
- Phase 7 の coverage で edge case が見えるようにする

## 多角的チェック観点（AIが判断）

- denial / hook failure / unexpected request が分離されているか
- boundary を超える tool がテストに残っていないか
- 失敗ケースが過剰に増えて可読性を落としていないか

## サブタスク管理

| SubAgent   | 責務                      |
| ---------- | ------------------------- |
| SubAgent-A | denial ケース             |
| SubAgent-B | hook failure ケース       |
| SubAgent-C | unexpected request ケース |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 7: カバレッジ確認
