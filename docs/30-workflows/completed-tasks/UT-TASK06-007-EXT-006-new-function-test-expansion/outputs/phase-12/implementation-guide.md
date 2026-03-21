# 実装ガイド - UT-TASK06-007-EXT-006

## メタ情報

| 項目         | 内容                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| タスクID     | UT-TASK06-007-EXT-006                                                                                        |
| 機能名       | `check-ipc-contracts` テスト拡充                                                                             |
| 実装日       | 2026-03-21                                                                                                   |
| 対象ファイル | `apps/desktop/scripts/check-ipc-contracts.ts` / `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` |

## Part 1: 中学生レベルの概念説明

### なぜ必要だったか

この変更が必要だったのは、機械が点検する対象は増えていたのに、点検表が古いままだったからです。たとえば学校で新しい持ち物ルールが5つ増えたのに、先生のチェック表が昔のままだと、その5つは忘れても見逃されます。

`check-ipc-contracts.ts` でも同じで、内部では大事な補助関数や文字パターンが動いているのに、その部分だけを直接確認するテストが不足していました。そこで、5つの対象に対して20件の確認問題を追加し、「この入力ならこの答えになる」を機械が毎回見られるようにしました。

### 何をしたか

たとえば、複数クラスの連絡網を1枚にまとめるときは、「同じ人が2回出たら最初の情報を残す」などの細かいルールが必要です。このタスクでは、そのような細かいルールをプログラムにも覚えさせるために、次の5つを直接テストできるようにしました。

1. `normalizeTypeAnnotation`
   型の説明から余計な部分を外して、読みやすい形に整える
2. `isPrimitiveTypeAnnotation`
   基本型かどうかを見分ける
3. `mergeChannelMaps`
   複数ファイルのチャンネル表を1つにまとめる
4. `CHANNEL_OBJECT_PATTERN`
   `as const` 付きのチャンネル定義を探す
5. `PRELOAD_CALL_START_PATTERN`
   `safeInvoke` / `safeOn` の呼び出し開始を探す

### どんな観点を確認したか

- 空文字や custom type のような境界条件
- 複数ファイルをまとめるときの先勝ちルール
- generic 付き `safeInvoke<T>` / `safeOn<T>` のような少し複雑な書き方
- 正規表現を使い回したときの内部状態ずれ

## Part 2: 開発者向け実装詳細

### 背景

`apps/desktop/scripts/check-ipc-contracts.ts` は Main / Preload 間の IPC 契約ドリフトを静的解析する CLI スクリプトであり、補助関数5点は従来 module private 扱いだった。今回の変更は **ロジック変更なし** で、直接テストするための `export` 追加と、20件の direct unit test 追加に限定している。

### TypeScript 型定義

```ts
type TypeAnnotation = string;

interface CoverageSnapshot {
  line: number;
  branch: number;
  function: number;
}

export function normalizeTypeAnnotation(typeAnnotation: TypeAnnotation): string;
export function isPrimitiveTypeAnnotation(
  typeAnnotation: TypeAnnotation,
): boolean;
export function mergeChannelMaps(filePaths: string[]): Map<string, string>;

export const CHANNEL_OBJECT_PATTERN: RegExp;
export const PRELOAD_CALL_START_PATTERN: RegExp;
```

### API / CLI シグネチャ

```bash
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts --coverage --coverage.include='scripts/check-ipc-contracts.ts'
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec tsx scripts/check-ipc-contracts.ts --report-only --format json
```

### 使用例

```ts
import {
  normalizeTypeAnnotation,
  isPrimitiveTypeAnnotation,
  mergeChannelMaps,
  CHANNEL_OBJECT_PATTERN,
  PRELOAD_CALL_START_PATTERN,
} from "../check-ipc-contracts";

normalizeTypeAnnotation("(value: string) => void");
// => "(value: string)"

isPrimitiveTypeAnnotation("string | undefined");
// => true

const match = new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm").exec(
  "export const IPC = { A: 'a' } as const",
);

PRELOAD_CALL_START_PATTERN.test(
  "safeInvoke<{ success: boolean }>(IPC_CHANNELS.SKILL_IMPORT, skillName)",
);
```

```bash
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts
pnpm --filter @repo/desktop exec tsx scripts/check-ipc-contracts.ts --report-only --format json
```

### テストグループ

| グループ | テストID   | 検証内容                                                                                                     |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| T-N      | T-N-01..05 | パススルー / arrow function除去 / default除去 / readonly除去 / trim                                          |
| T-P      | T-P-01..06 | union / intersection / empty / readonly array / undefined union / custom type                                |
| T-M      | T-M-01..04 | 単一ファイル / 2ファイル結合と先勝ち / 空入力 / 定義なしファイル                                             |
| T-R      | T-R-01..05 | 基本 const object / export const object / `as const` なし除外 / 複数 object 抽出 / generic 付き preload 開始 |

### 一時ディレクトリ戦略

`mergeChannelMaps` は `fs.readFileSync` を内部で使うため、fs モックよりも実ファイルを作る方が短く安定する。そこで `mkdtempSync(join(tmpdir(), "ipc-test-"))` でテスト専用ディレクトリを作り、`writeFileSync` で fixture を置き、`rmSync(..., { recursive: true, force: true })` で毎回片付ける構成を採用した。

### エラーハンドリング

- `mergeChannelMaps` に存在しないパスを渡すと `fs.readFileSync` 由来の例外になる。今回は公開契約を変えず、呼び出し側で不正パスを避ける前提を維持した。
- `pnpm --filter @repo/desktop exec tsx scripts/check-ipc-contracts.ts --report-only --format json` の `passed: false` は、コードベースに既存 drift が残っていることを示す。export 追加や今回のテスト拡充の失敗ではない。
- `pnpm --filter @repo/desktop typecheck` と `vitest` の両方を通し、公開した識別子の型整合とテスト整合を確認した。

### エッジケース

- `isPrimitiveTypeAnnotation("")` は `false`
- `isPrimitiveTypeAnnotation("readonly string[]")` は `false`
- `isPrimitiveTypeAnnotation("MyCustomType")` は `false`
- `CHANNEL_OBJECT_PATTERN` は `as const` のないオブジェクトにマッチしない
- `CHANNEL_OBJECT_PATTERN` は `g` フラグを持つため、テストでは `new RegExp(pattern.source, "gm")` で都度作り直す

### 設定と定数

| 項目               | 値 / 方針                                                                  |
| ------------------ | -------------------------------------------------------------------------- |
| 追加した設定項目   | なし                                                                       |
| 新たに公開した定数 | `CHANNEL_OBJECT_PATTERN`, `PRELOAD_CALL_START_PATTERN`                     |
| 新たに公開した関数 | `normalizeTypeAnnotation`, `isPrimitiveTypeAnnotation`, `mergeChannelMaps` |
| 追加テスト件数     | 20件                                                                       |
| 最終テスト件数     | 69件                                                                       |
| カバレッジ結果     | Line 95.79% / Branch 91.55% / Function 100%                                |

### 検証結果

- `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts`: 69 passed / Duration 2.06s
- `pnpm --filter @repo/desktop exec vitest run ... --coverage --coverage.include='scripts/check-ipc-contracts.ts'`: Line 95.79 / Branch 91.55 / Function 100
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop exec tsx scripts/check-ipc-contracts.ts --report-only --format json`: `{ totalHandlers: 217, totalPreloads: 189, drifts: 198, orphans: 120, passed: false }`
