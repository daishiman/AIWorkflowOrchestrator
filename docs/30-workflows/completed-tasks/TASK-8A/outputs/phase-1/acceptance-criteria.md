# Phase 1: 受け入れ基準

## 定義日: 2026-02-02

## 受け入れ基準一覧

### AC-01: テストケース数

- **基準**: 44テストケースすべてが実装されていること
- **計測方法**: `pnpm --filter @repo/desktop vitest run --reporter=verbose` の出力から対象5ファイルのテストケース数をカウント
- **判定**: 44件以上のテストケースが出力に含まれること（既存テストは44件を大幅に超えるため、仕様定義の44件すべてが含まれていることを確認）

### AC-02: テスト通過率

- **基準**: 全テストケースが通過すること（0件失敗）
- **計測方法**: `pnpm --filter @repo/desktop vitest run` の実行結果で `FAIL` が0件であること
- **判定**: 全テストの `Tests` 行で `X passed, 0 failed` であること

### AC-03: Line Coverage

- **基準**: 対象5モジュールの Line Coverage 80%以上
- **計測方法**: `pnpm --filter @repo/desktop vitest run --coverage` の出力で各モジュールのLines列を確認
- **対象ファイル**:
  - `src/main/services/skill/SkillScanner.ts`
  - `src/main/services/skill/SkillImportManager.ts`
  - `src/main/services/skill/SkillExecutor.ts`
  - `src/main/services/skill/PermissionResolver.ts`
  - `src/renderer/store/slices/skillSlice.ts`

### AC-04: Branch Coverage

- **基準**: 対象5モジュールの Branch Coverage 60%以上
- **計測方法**: `pnpm --filter @repo/desktop vitest run --coverage` の出力で各モジュールのBranches列を確認

### AC-05: Function Coverage

- **基準**: 対象5モジュールの Function Coverage 80%以上
- **計測方法**: `pnpm --filter @repo/desktop vitest run --coverage` の出力で各モジュールのFunctions列を確認

### AC-06: テスト実行時間

- **基準**: 対象5テストファイルの実行が10秒以内に完了すること
- **計測方法**: `time pnpm --filter @repo/desktop vitest run <対象5ファイル>` の実行時間を確認
- **判定**: real時間が10秒未満

### AC-07: 型安全性

- **基準**: テストファイルに `any` 型の使用がないこと
- **計測方法**: `pnpm --filter @repo/desktop tsc --noEmit` でテスト関連の型エラーが0件、かつ `grep -rn ': any' <テストファイル>` の結果が0件
- **例外**: `vi.mocked()` の型推論が不可能な場合の `as unknown as Type` パターンは許容

### AC-08: 既存テスト互換性

- **基準**: 既存テストが1件も失敗しないこと
- **計測方法**: `pnpm --filter @repo/desktop vitest run` で全テスト実行し、変更前と同じテスト数が通過していること
- **判定**: 既存テストの通過数が減少していないこと

## カバレッジ閾値（Vitest設定）

| メトリクス | 最低基準 | 推奨目標 | Vitest設定値 |
| ---------- | -------- | -------- | ------------ |
| Lines      | 80%      | 90%      | 80           |
| Functions  | 80%      | 90%      | 80           |
| Branches   | 60%      | 70%      | 60           |
| Statements | 80%      | 90%      | 80           |
