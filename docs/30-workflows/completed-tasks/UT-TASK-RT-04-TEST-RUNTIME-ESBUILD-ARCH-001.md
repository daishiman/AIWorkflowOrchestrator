# UT-TASK-RT-04-TEST-RUNTIME-ESBUILD-ARCH-001

## 概要

`ApiKeySettingsPanel.test.tsx` 実行時に `esbuild` バイナリのアーキ不一致（darwin-arm64 vs darwin-x64）で起動失敗。

## ステータス

- resolved: 2026-03-29

## 影響

- Phase 9/10 の品質証跡が不足
- Phase 12 changelog のテスト結果を確定できない

## 2026-03-29 実施ログ

- `node -p "process.platform + ' ' + process.arch"`: `darwin x64`
- `pnpm rebuild esbuild`: 実行済み（`@esbuild/darwin-x64` 取得を試行）
- `pnpm -C apps/desktop test -- ApiKeySettingsPanel.test.tsx`: 依然として `@esbuild/darwin-arm64` 検出により起動失敗
- `pnpm install --force`: optional dependency を現在アーキへ再解決
- `pnpm -C apps/desktop test:run src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`: PASS（30 tests）

## 完了条件

- [x] `apps/desktop` で Vitest が起動し、対象テストが完走する
- [x] 実行ログを Phase 12 changelog に反映する
