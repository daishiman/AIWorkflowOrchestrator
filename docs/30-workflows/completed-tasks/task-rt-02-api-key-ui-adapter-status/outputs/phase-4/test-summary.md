# Phase 4: Test Summary

## 想定対象

| ファイル                                                                                               | 目的                                  |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `apps/desktop/src/renderer/components/atoms/AdapterStatusBadge/__tests__/AdapterStatusBadge.test.tsx`  | status 表示と a11y                    |
| `apps/desktop/src/renderer/components/atoms/RetryButton/__tests__/RetryButton.test.tsx`                | retry CTA の表示と disabled/loading   |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`      | provider 一覧・API key 操作の既存回帰 |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.a11y.test.tsx` | Settings UI の a11y 回帰              |

## 現状メモ

- AdapterStatusBadge / RetryButton のテストファイルは存在
- `ApiKeysSection` の adapter status 挙動を直接検証する targeted case は未追加
- Vitest 実行は `esbuild` の platform mismatch により未完了

## 追加推奨ケース

1. 登録済み provider が `checkHealth()` で `connected` を返したとき `準備完了` を表示する
2. `checkHealth()` 失敗時に `failed` と `RetryButton` を表示する
3. retry 時に対象 provider のみ `initializing` に戻る
