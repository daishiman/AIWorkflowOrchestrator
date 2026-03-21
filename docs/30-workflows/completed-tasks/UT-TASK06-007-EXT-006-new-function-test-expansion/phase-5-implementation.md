# Phase 5: 実装 - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                   |
| ------- | ---------------------------------------------------- |
| Phase   | 5                                                    |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion    |
| 作成日  | 2026-03-21                                           |
| 前Phase | [phase-4-test-creation.md](phase-4-test-creation.md) |

## 目的

本タスクはテスト拡充のみであるため、Phase 4 で追加した export が正しく公開されていることを確認し、全69件のテスト（既存49件 + 新規20件）が PASS することを確認する。プロダクションコードのロジック変更はなし。

## 実行タスク

- Task 5-1: Phase 4 で追加した5箇所の export を確認する
- Task 5-2: 型チェックが通ることを確認する
- Task 5-3: テスト全69件の PASS を確認する
- Task 5-4: Green確認結果を記録する

## 参照資料

| 資料名         | パス                                                         | 説明                   |
| -------------- | ------------------------------------------------------------ | ---------------------- |
| Phase 4成果物  | [phase-4-test-creation.md](phase-4-test-creation.md)         | テスト実装内容         |
| 対象スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts`                | export追加済みファイル |
| テストファイル | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | 69テスト（確認対象）   |
| テスト設計記録 | `outputs/phase-4/test-design.md`                             | Phase 4 成果物         |

## 実行手順

### ステップ1: export 追加の確認

Phase 4 で追加した5箇所の export が正しく存在することをコード確認する。

確認すべき export 一覧:

| 識別子                       | 種別              | 元の行番号 |
| ---------------------------- | ----------------- | ---------- |
| `CHANNEL_OBJECT_PATTERN`     | `export const`    | L53        |
| `PRELOAD_CALL_START_PATTERN` | `export const`    | L56        |
| `normalizeTypeAnnotation`    | `export function` | L68        |
| `isPrimitiveTypeAnnotation`  | `export function` | L76        |
| `mergeChannelMaps`           | `export function` | L271       |

確認コマンド:

```bash
grep -n "^export" apps/desktop/scripts/check-ipc-contracts.ts | head -20
```

期待する出力（抜粋）:

```
export const CHANNEL_OBJECT_PATTERN = ...
export const PRELOAD_CALL_START_PATTERN = ...
export function normalizeTypeAnnotation(...
export function isPrimitiveTypeAnnotation(...
export function mergeChannelMaps(...
export function extractMainHandlers(...
export function extractPreloadEntries(...
export function resolveChannelMap(...
export function matchAndValidate(...
export function generateReport(...
export function main(...
```

### ステップ2: TypeScript 型チェック

export 追加によりコンパイルエラーが発生していないことを確認する。

```bash
pnpm --filter @repo/desktop typecheck
```

期待: エラーなし（0件）

### ステップ3: テスト全件実行（Green確認）

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts 2>&1
```

期待する出力:

```
Test Files  1 passed (1)
Tests  69 passed (69)
Duration  <N>ms
```

内訳:

- 既存テスト: 49件（回帰確認）
- 新規テスト: 20件（FR-1: 5件 + FR-2: 6件 + FR-3: 4件 + FR-4: 5件）

### ステップ4: 失敗時の対処

テストが失敗した場合は以下の順で調査する:

1. **import エラーの場合**: ステップ1のexport確認を再実行し、対象の export が存在するか確認する
2. **型エラーの場合**: `pnpm --filter @repo/desktop typecheck` の出力を確認し、ステップ1の変更箇所を修正する
3. **アサーションエラーの場合**: 失敗しているテストケースを特定し、Phase 4 の実装手順（ステップ3〜6）に従って修正する
4. **`mergeChannelMaps` テストでファイルエラーの場合**: `beforeEach` の一時ディレクトリ作成と `afterEach` の削除が正しく設定されているか確認する
5. **`CHANNEL_OBJECT_PATTERN` テストが意図しない結果の場合**: `new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm")` で新インスタンスを生成しているか確認する（lastIndex 問題）

### ステップ5: Green 確認結果の記録

全69件 PASS を確認後、`outputs/phase-5/green-confirmation.md` に結果を記録する。

記録内容:

- テスト実行日時
- 総テスト件数（69件）
- 既存テスト件数（49件）と新規テスト件数（20件）
- 実行時間

## 統合テスト連携

Phase 6 でカバレッジ不足箇所の追加テストを検討する。Phase 7 でカバレッジ基準（Line Coverage 95%以上）の充足を確認する。

## 成果物

| 成果物            | パス                                    | 説明                   |
| ----------------- | --------------------------------------- | ---------------------- |
| Green確認レポート | `outputs/phase-5/green-confirmation.md` | テスト全件PASS確認結果 |

## 完了条件

- [x] `check-ipc-contracts.ts` に5箇所の export が存在することが確認されている
- [x] `pnpm --filter @repo/desktop typecheck` が 0 エラーで完了している
- [x] `pnpm vitest run` で全69件が PASS している
- [x] `outputs/phase-5/green-confirmation.md` が作成されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 6（テスト拡充）に進む。
