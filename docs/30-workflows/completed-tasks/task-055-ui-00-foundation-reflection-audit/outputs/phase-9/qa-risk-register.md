# Phase 9 リスク台帳

## 1. リスク一覧（SubAgent-QA-RISK）

| risk_id      | source      | impact                      | likelihood | priority | mitigation                       | owner              |
| ------------ | ----------- | --------------------------- | ---------- | -------- | -------------------------------- | ------------------ |
| RISK-055-001 | FND-055-001 | 高: token反映トレース不能化 | 中         | P1       | 00-1正本導線をPhase 12までに修正 | SubAgent-QA-ACTION |
| RISK-055-002 | FND-055-002 | 中: UX語彙の解釈ぶれ        | 中         | P2       | 5D語彙具体例テーブルを追加       | SubAgent-QA-ACTION |
| RISK-055-003 | FND-055-003 | 低: 対象外判定運用の揺れ    | 低         | P3       | 対象外テンプレートを定義         | SubAgent-QA-ACTION |

## 2. 残存リスク判定

- Critical: 0
- High: 1
- Medium: 1
- Low: 1

## 3. エスカレーション条件

- P1がPhase 10時点でopenの場合はMINOR継続（Phase 11進行可）。
- P1が複数化した場合はMAJOR再判定。

## 4. Task 100% 実行確認

- [x] リスクを優先度付きで記録
- [x] エスカレーション条件を定義
