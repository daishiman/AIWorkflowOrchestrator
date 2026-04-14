# TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

## メタ情報

```yaml
issue_number: 2159
task_id: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY
status: open
priority: low
scale: small
task_type: improvement
```

## 概要

LLM provider catalog の `description` フィールドを renderer でも表示する follow-up。

## 背景

- shared types に `description` が追加されても、renderer 側の一覧 UI が表示しなければ利用者には見えない。
- モデル選択時の説明表示を揃えると、provider 間の違いを UI で判断しやすくなる。

## 実行タスク

1. provider / model 選択 UI で `description` を表示できる箇所を特定する。
2. 必要に応じて一覧カード・ラベル・補助文のレイアウトを調整する。
3. description が空または未設定でも崩れないようにする。
4. 既存の model selection テストへ description 表示の期待値を追加する。

## 完了条件

- renderer の model/provider 選択 UI で description が見える。
- 既存の選択フローやアクセシビリティが壊れていない。
- docs と UI の文言が一致している。
