# Phase 12 成果物: スキルフィードバック

## 学び

1. manifest 優先の dynamic path と fallback path は、同じ request モデルで記述するとズレが減る
2. root dedupe は resolver に寄せると、planner と facade の責務が分かれる
3. improve だけでなく plan も同じルールで扱うと、後から見たときの説明コストが下がる
4. UI 変更がないタスクでも、manual test の non-visual 記録は残しておくと追跡しやすい
5. manifest 不在だけを fallback にして、broken manifest や phase 不在は validation error に切ると、silent regression を防げる

## 次に気をつけること

- 仕様書のスコープと実装差分をずらさない
- 変更が plan/improve の両方にまたがるときは、片側だけの説明にしない
- manifest validation のテストは、fallback path のテストと分けて持つ
