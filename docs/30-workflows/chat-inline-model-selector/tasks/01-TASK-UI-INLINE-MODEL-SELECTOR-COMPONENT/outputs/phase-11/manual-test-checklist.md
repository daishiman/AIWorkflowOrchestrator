# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| タスクID | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT |
| 作成日   | 2026-03-22                              |
| 状態     | completed_with_blockers                 |

## 実施前確認

- [x] Task01 が shared component 作成タスクであることを確認した
- [x] ChatView mount が Task02 未実装であることを確認した
- [x] WorkspaceChatPanel mount が Task03 未実装であることを確認した
- [x] `pnpm exec tsc -p tsconfig.json --noEmit --pretty false` を実行した
- [x] targeted vitest が `esbuild` platform mismatch で起動不能であることを確認した

## 確認項目

- [x] provider hydrate fallback の contract を test で確認した
- [x] provider change 時の default model 選択を確認した
- [x] provider change 時の health refresh を確認した
- [x] live screen capture が consumer task 未着手で block されることを記録した

## ブロッカー

1. ChatView / WorkspaceChatPanel に current branch で `InlineModelSelector` が mount されていない
2. `pnpm exec vitest run` は `@esbuild/darwin-arm64` と `darwin-x64` の不一致で起動前に停止する
