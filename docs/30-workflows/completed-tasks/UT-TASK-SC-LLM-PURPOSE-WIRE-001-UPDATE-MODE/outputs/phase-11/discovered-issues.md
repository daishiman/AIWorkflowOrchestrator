# Phase 11: 発見課題

## 検出結果

1. `runUpdateWorkflow` は dispatch 修正後もスタブのまま。
2. `runImprovePromptWorkflow` もスタブのままで、実処理は未配線。
3. `vitest` 再実行はこの環境で `SIGKILL` が発生し、追加の実測証跡取得に制約がある。

## 扱い

- 上記 1,2 は Phase 12 の未タスク検出へ移送。
- 3 は workflow close-out の留保事項として documentation に残す。
