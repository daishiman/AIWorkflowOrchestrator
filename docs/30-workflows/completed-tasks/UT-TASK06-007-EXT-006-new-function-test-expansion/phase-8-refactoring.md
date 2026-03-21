# Phase 8: リファクタリング - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                |
| ------- | ------------------------------------------------- |
| Phase   | 8                                                 |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion |
| 作成日  | 2026-03-21                                        |
| 前Phase | phase-7-coverage-check.md（カバレッジ確認）       |

## 目的

Phase 4〜7で追加したテストコード（約20件）の品質を改善する。重複コードの共通化、describe構造の整合性確認、命名規則の統一を行い、テストスイート全体の保守性を高める。

## 実行タスク

- Task 8-1: テスト内重複コードの共通化要否を確認する
- Task 8-2: describe構造の一貫性を見直す
- Task 8-3: テスト命名規則（T-N/T-P/T-M/T-R）を確認する
- Task 8-4: `check-ipc-contracts.ts` の export 5箇所を再確認する
- Task 8-5: 全69件の PASS を最終確認する

## 参照資料

| 資料名           | パス                                                         | 説明                               |
| ---------------- | ------------------------------------------------------------ | ---------------------------------- |
| Phase 1成果物    | [phase-1-requirements.md](phase-1-requirements.md)           | テスト要件（FR-1〜FR-4、20件）     |
| Phase 2成果物    | [phase-2-design.md](phase-2-design.md)                       | describe構造設計、命名規則         |
| Phase 3成果物    | [phase-3-design-review.md](phase-3-design-review.md)         | 設計レビュー結果（PASS）           |
| Phase 5成果物    | `outputs/phase-5/green-confirmation.md`                      | export追加後のGreen確認            |
| Phase 6成果物    | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | 追加済みテストの現物               |
| Phase 7成果物    | `outputs/phase-7/coverage-report.md`                         | カバレッジ計測結果                 |
| 対象スクリプト   | `apps/desktop/scripts/check-ipc-contracts.ts`                | export追加対象（584行）            |
| テストファイル   | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | リファクタリング対象テストファイル |
| コード品質ルール | `.claude/rules/02-code-quality.md`                           | TDD原則、テスト設計の注意          |

## 実行手順

### ステップ1: export追加箇所の最終確認

`check-ipc-contracts.ts` に以下5つのexportが正しく追加されていることを確認する:

| 行番号（目安） | 変更内容                                                                           |
| -------------- | ---------------------------------------------------------------------------------- |
| L53付近        | `const CHANNEL_OBJECT_PATTERN` → `export const CHANNEL_OBJECT_PATTERN`             |
| L56付近        | `const PRELOAD_CALL_START_PATTERN` → `export const PRELOAD_CALL_START_PATTERN`     |
| L68付近        | `function normalizeTypeAnnotation` → `export function normalizeTypeAnnotation`     |
| L76付近        | `function isPrimitiveTypeAnnotation` → `export function isPrimitiveTypeAnnotation` |
| L271付近       | `function mergeChannelMaps` → `export function mergeChannelMaps`                   |

確認コマンド:

```bash
grep -n "^export" apps/desktop/scripts/check-ipc-contracts.ts
```

### ステップ2: テスト命名規則の確認

追加した4つのdescribeブロック内のテスト命名が、Phase 2設計書の規則に従っているか確認する:

| describeブロック                                      | テストID形式 | 件数 |
| ----------------------------------------------------- | ------------ | ---- |
| `normalizeTypeAnnotation`                             | T-N-01〜05   | 5件  |
| `isPrimitiveTypeAnnotation`                           | T-P-01〜06   | 6件  |
| `mergeChannelMaps`                                    | T-M-01〜04   | 4件  |
| `CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN` | T-R-01〜05   | 5件  |

確認方法:

```bash
grep -n "it(\"T-[NPMR]-" apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts
```

### ステップ3: 重複コードの共通化検討

以下の観点で重複コードを検出し、`beforeEach` または定数化による共通化が可能か判断する:

1. `mergeChannelMaps` テスト内の一時ファイル作成/削除処理が `beforeEach`/`afterEach` に正しく配置されているか確認
2. `CHANNEL_OBJECT_PATTERN` テストで `new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm")` の生成が各テスト内で一貫して行われているか確認（lastIndex汚染防止: Phase 2設計書 ステップ5参照）
3. テストデータ文字列（`as const` パターン等）が複数テストで再利用されている場合は定数化を検討

### ステップ4: describe構造の見直し

Phase 2設計書のdescribe構造（ステップ3）と実際の実装が一致しているか確認する:

```
期待される構造（末尾4ブロック追加後）:
├── describe("extractMainHandlers")               // T-4-1 既存
├── describe("extractPreloadEntries")             // T-4-2 既存
├── describe("R-01: チャンネル孤児検出 ...")       // T-4-3 既存
├── describe("R-02: 引数形式不一致検出 ...")       // T-4-4 既存
├── describe("R-03: ハードコード文字列チャンネル検出") // T-4-5 既存
├── describe("generateReport")                   // T-4-6 既存
├── describe("resolveChannelMap")                // T-4-7 既存
├── describe("matchAndValidate with channelMap") // T-4-8 既存
├── describe("Phase 6: 異常系テスト")             // T-6-1 既存
├── describe("Phase 6: 境界値テスト")             // T-6-2 既存
├── describe("Phase 6: エッジケーステスト")        // T-6-3 既存
├── describe("Phase 6: P44/P45回帰テスト")        // T-6-4 既存
├── describe("main() exit code logic")           // T-7 既存
├── describe("normalizeTypeAnnotation")          // T-N 新規追加
├── describe("isPrimitiveTypeAnnotation")        // T-P 新規追加
├── describe("mergeChannelMaps")                 // T-M 新規追加
└── describe("CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN") // T-R 新規追加
```

### ステップ5: 全テスト実行・PASS確認

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

期待する結果:

- テスト件数: 69件（既存49件 + 新規20件）
- PASS: 69件 / FAIL: 0件

### ステップ6: リファクタリング報告書の作成

`outputs/phase-8/refactoring-report.md` に以下を記録する:

- export追加確認結果（5箇所）
- 命名規則確認結果（命名が規則に合致しているか）
- 重複コード対応内容（共通化した箇所、または「共通化不要」の判断理由）
- describe構造確認結果
- テスト実行結果（件数とPASS/FAIL数）

## 統合テスト連携

Phase 8ではリファクタリングのみ。機能変更はなし。ステップ5の全テストPASS確認が統合テスト代替。

## 成果物

| 成果物                 | パス                                    | 説明                       |
| ---------------------- | --------------------------------------- | -------------------------- |
| リファクタリング報告書 | `outputs/phase-8/refactoring-report.md` | 各確認項目の結果と対応内容 |

## 完了条件

- [x] export追加5箇所が `check-ipc-contracts.ts` に存在することを確認
- [x] テスト命名規則（T-N/T-P/T-M/T-R）が統一されていることを確認
- [x] 重複コードの共通化検討が完了（共通化 or 不要の判断が記録されている）
- [x] describe構造が設計書と一致していることを確認
- [x] `cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts` で69件全PASS
- [x] `outputs/phase-8/refactoring-report.md` を作成
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 9（品質保証）に進む。
