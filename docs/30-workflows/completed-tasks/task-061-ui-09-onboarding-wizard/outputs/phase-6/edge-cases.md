# Phase 6 Edge Cases

| ケース | 実装上の扱い | 検証状況 |
| --- | --- | --- |
| `userProfile.name === "ユーザー"` | display name fallback から除外し、別候補へフォールバックする | unit regression 済み |
| `window.electronAPI.store` 不在 | onboarding を open fallback にする | 実装済み、manual 未実施 |
| Step 3 import failure | `skillError` または import state 不整合で error message 化 | 実装済み、追加 test は未実施 |
| skill list empty | `EmptyState` を表示する | UI 実装済み |
| theme mode が `system` | `resolvedTheme` を wizard default に使う | 実装済み |
| rerun 保存失敗 | error message を settings card 上に表示する | UI 実装済み |
| mobile の縦密度 | card を 1 column 化し、step chip を縦方向で維持する | screenshot で確認済み |

## 次に厚くしたい箇所

1. import failure の専用テスト追加。
2. store API 不在時の explicit regression 追加。
3. act warning を出さない async effect harness への整理。
