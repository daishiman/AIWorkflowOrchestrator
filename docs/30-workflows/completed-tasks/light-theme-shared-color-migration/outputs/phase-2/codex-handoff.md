# Phase 2 成果物: codex-handoff

## 実装レーン指示

### Lane B

- 対象: `ThemeSelector`, `AuthView`, `AccountSection`, `LocaleSelector`, `TimezoneSelector`
- 制約: semantic token / `color-mix(...)` のみ使用
- テスト: 既存 unit/integration に semantic contract assertion を追加

### Lane C

- 対象: `WorkspaceSearchPanel`, Phase 11 screenshot harness / capture script
- 制約: IPC contract は変更しない。見た目だけ直す
- テスト: component test + target file scan contract test

## 実装チェックリスト

- [ ] target file に `white/slate/zinc` 直書きが残っていない
- [ ] selected / hover / disabled / error の state が token で表現されている
- [ ] `pnpm --filter @repo/desktop vitest run` の対象テストが green
- [ ] Phase 11 で撮る UI state を data-testid / harness で安定化できる

## PR/commit ポリシー

- commit しない
- PR を作らない
- unrelated diff は触らない

## Phase 5 で許容する変更

- component 内の className 置換
- 画面検証専用 harness / screenshot script 追加
- テスト追加 / 更新

## Phase 5 で禁止する変更

- preload / IPC / store shape の変更
- token foundation の値変更
- unrelated component のついで修正
