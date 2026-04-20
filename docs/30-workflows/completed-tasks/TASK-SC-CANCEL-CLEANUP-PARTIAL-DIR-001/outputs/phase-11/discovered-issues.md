# 発見事項レポート

## 発見事項一覧

| #   | シナリオ                 | 発見事項                                                                                | 分類 | 対応方針                                                             |
| --- | ------------------------ | --------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------- |
| 1   | esbuild バージョン不一致 | 初回テスト実行時に `esbuild@0.21.5` と `esbuild@0.25.12` のバージョン不一致エラーが発生 | Info | `pnpm install` で解消済み。回帰リスクなし                            |
| 2   | code/spec walkthrough    | `finally + createdByThisRun` 前提の旧記述が仕様書に混在していた                         | Note | Phase 5 patch-plan.md で spec 修正対象として記録済み。本 task で解消 |

## Blocker 件数

**0 件**

## Info / Note の詳細

### Info-1: esbuild バージョン不一致

- **発生状況**: `pnpm --filter @repo/desktop test -- SkillCreatorService` 初回実行時
- **原因**: worktree 環境でのパッケージインストール未完了
- **解消方法**: `pnpm install` を実行してバージョンを統一
- **再現性**: なし（インストール後は解消）

### Note-2: spec の旧前提記述

- **発生状況**: phase spec 群のレビュー中
- **発見内容**: 旧仕様書が `finally` ブロックでの cleanup を前提としていた
- **影響**: spec を読んだ開発者が誤った前提で実装変更を試みるリスク
- **解消方法**: Phase 5 で spec を実コード実態に合わせて修正（本 task の主目的）
- **解消確認**: Phase 5 diff-check.md および Phase 9 quality-gate-report.md で確認済み

## 将来課題（未タスク化）

なし。本 task の範囲内で解消完了。
