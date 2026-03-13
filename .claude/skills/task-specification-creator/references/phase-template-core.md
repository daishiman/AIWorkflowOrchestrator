# Phase Template Core

## 対象

Phase 1、Phase 2、Phase 3。

## 共通骨格

```md
# Phase {{N}}: {{PHASE_NAME}}

## メタ情報
## 目的
## 実行タスク
## 参照資料
## 実行手順
## 統合テスト連携
## 多角的チェック観点（AIが判断）
## サブタスク管理
## 成果物
## 完了条件
## タスク100%実行確認【必須】
## 次Phase
```

## Phase 1 のポイント

- inventory と source scope の差分を固定する。
- acceptance criteria を番号付きで定義する。
- Phase 1-3 完了前に Phase 4 へ進まない gate を書く。

## Phase 2 のポイント

- concern ごとの target topology を table 化する。
- lane 数は 3 以下に固定する。
- validation matrix を command 単位で定義する。

## Phase 3 のポイント

- PASS / MINOR / MAJOR の戻り先を明示する。
- simpler alternative を検討した結果を記録する。
- Phase 4 開始条件と Phase 13 blocked 条件を残す。
