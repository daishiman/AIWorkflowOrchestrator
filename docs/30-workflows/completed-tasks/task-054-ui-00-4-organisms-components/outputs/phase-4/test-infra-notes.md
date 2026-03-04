# Phase 4 テスト基盤メモ

## 1. P39/P40対策

- userEventは不使用、`fireEvent` を使用。
- テストは `cd apps/desktop` で実行。

## 2. matchMediaモック方針

- CardGrid / MasterDetailLayout テスト内で `window.matchMedia` を明示モック。
- desktop/tablet/mobile の疑似切替を test case単位で行う。

## 3. 環境メモ

- 初回実行時に `@rollup/rollup-darwin-x64` 欠落で起動エラー。
- `pnpm install` 実施後にテスト起動可能となった。
- Node version 警告（22.20.0 vs wanted >=22.21.1）は継続だがテスト実行は可能。
