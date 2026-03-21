# Phase 4: テスト設計記録 - UT-TASK06-007-EXT-006

## 実施日

2026-03-21

## 実装内容

### export追加（5箇所）

| 対象                         | 変更                            |
| ---------------------------- | ------------------------------- |
| `CHANNEL_OBJECT_PATTERN`     | `const` -> `export const`       |
| `PRELOAD_CALL_START_PATTERN` | `const` -> `export const`       |
| `normalizeTypeAnnotation`    | `function` -> `export function` |
| `isPrimitiveTypeAnnotation`  | `function` -> `export function` |
| `mergeChannelMaps`           | `function` -> `export function` |

### import追加

- `normalizeTypeAnnotation`, `isPrimitiveTypeAnnotation`, `mergeChannelMaps`, `CHANNEL_OBJECT_PATTERN`, `PRELOAD_CALL_START_PATTERN`
- 一時ファイル用: `mkdtempSync`, `writeFileSync`, `rmSync`, `tmpdir`, `join`

### テスト追加（20件）

| describe                                              | テストID       | 件数 |
| ----------------------------------------------------- | -------------- | ---- |
| `normalizeTypeAnnotation`                             | T-N-01〜T-N-05 | 5件  |
| `isPrimitiveTypeAnnotation`                           | T-P-01〜T-P-06 | 6件  |
| `mergeChannelMaps`                                    | T-M-01〜T-M-04 | 4件  |
| `CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN` | T-R-01〜T-R-05 | 5件  |

### テスト設計判断

- T-N-01〜05: `normalizeTypeAnnotation` の pass-through / arrow / default / readonly / trim を直接検証
- T-P-01〜06: Phase 1仕様の union / intersection / 空文字列 / readonly配列 / undefined含みunion / custom type を採用
- T-M-01〜04: 一時ファイル方式（`os.tmpdir()`）で vi.mock 制約を回避し、2ファイル結合 + 先勝ちを実測する
- T-R-01〜05: `new RegExp(source, "gm")` で lastIndex 汚染を防止しつつ、複数 const object / 空 body / generic preload 開始を確認

## テスト実行結果

- テスト件数: 69件（既存49件 + 新規20件）
- PASS: 69件 / FAIL: 0件
- 実行時間: 1.31s

## 完了条件チェック

- [x] check-ipc-contracts.ts に5箇所の export が追加されている
- [x] check-ipc-contracts.test.ts の import ブロックに5つの新exportが追加されている
- [x] normalizeTypeAnnotation の describe ブロック（5件）が実装されている
- [x] isPrimitiveTypeAnnotation の describe ブロック（6件）が実装されている
- [x] mergeChannelMaps の describe ブロック（4件）が一時ファイル方式で実装されている
- [x] CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN の describe ブロック（5件）が実装されている
- [x] CHANNEL_OBJECT_PATTERN のテストが new RegExp(source, "gm") で lastIndex 対策済み
- [x] pnpm vitest run で全69件が PASS する
- [x] 本Phase内の全タスクを100%実行完了
