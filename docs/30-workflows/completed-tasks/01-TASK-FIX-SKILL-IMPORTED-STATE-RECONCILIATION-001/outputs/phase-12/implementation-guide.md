# Phase 12 実装ガイド

## Part 1: 概要

- タスク: インポート済みスキル復元の name/id 互換解決
- 解決方針: cache検索を id 優先 + name フォールバックへ変更し、後方互換復元を保証した。

## Part 2: 実装詳細

### 変更ファイル

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`

### テスト

- 実行コマンド: `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillService.test.ts`
- 結果: 1 file / 26 tests PASS

### 再現手順（要点）

1. 既存不具合シナリオを実行する。
2. 修正後挙動が安定することを確認する。
3. 回帰テストを実行して固定する。
