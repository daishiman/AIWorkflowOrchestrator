# TASK-RT-05 Phase 11 Checklist

## 対象

- `multi_select` request の表示
- 複数候補の選択
- submit payload 反映
- kind 切り替え時の state reset
- 既存 4 kind の非破壊

## チェック項目

- [ ] `multi_select` request が表示される
- [ ] 2件以上の候補を選択できる
- [ ] 送信時に複数 id が payload へ入る
- [ ] kind 切り替え時に前の state が残らない
- [ ] `single_select` / `free_text` / `secret` / `confirm` が従来どおり動く

## 注記

- 2026-03-30 時点でコード修正は反映済みだが、手動 walkthrough とスクリーンショット取得は未実施
