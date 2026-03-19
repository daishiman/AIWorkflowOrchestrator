# UT-TASK06-007-EXT-006: 新関数テスト拡充（型アノテーション分析・マルチオブジェクトチャンネル解決） - タスク指示書

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-TASK06-007-EXT-006                                                      |
| タスク名     | 新関数テスト拡充（型アノテーション分析・マルチオブジェクトチャンネル解決） |
| 分類         | テスト品質改善                                                             |
| 対象機能     | check-ipc-contracts.ts                                                     |
| 優先度       | 高                                                                         |
| 見積もり規模 | 小規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | UT-TASK06-007 Phase 7 カバレッジ改善セッション（2026-03-19）               |
| 発見日       | 2026-03-19                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-TASK06-007 の実装セッション中に linter（Hook）が `check-ipc-contracts.ts` に以下の新機能を自動追加した:

1. `normalizeTypeAnnotation()` - 型アノテーション正規化
2. `isPrimitiveTypeAnnotation()` - プリミティブ型判定（PRIMITIVE_TS_TYPES Set ベース）
3. `mergeChannelMaps()` - 複数ファイルからのチャンネル定数マージ
4. `CHANNEL_OBJECT_PATTERN` - `const XXX = { ... } as const` パターンの複数オブジェクト対応
5. `PRELOAD_CALL_START_PATTERN` - multi-line preload 呼び出し検出

これらの新関数に対するユニットテストは linter が5件追加したが、境界値・エッジケースのテストが不足している。

### 1.2 問題点・課題

- `isPrimitiveTypeAnnotation` のエッジケース未テスト: `string | undefined`, `readonly string`, `string => void`, union型, intersection型
- `mergeChannelMaps` の重複キー優先順位テスト未実施
- `CHANNEL_OBJECT_PATTERN` の nested object、複数 const object、空 body のテスト未実施
- multi-line preload の `safeInvoke<T>` ジェネリクス付きパターンの境界値テスト不足

### 1.3 放置した場合の影響

- 新関数のリグレッションが検出されないリスク
- スクリプトが 578 行に増加しており、将来の EXT-004（モジュール分割）時にテスト不足が顕在化する

---

## 2. 何を達成するか（What）

### 2.1 目的

linter 追加関数の境界値・エッジケーステストを追加し、テスト網羅性を向上させる。

### 2.2 最終ゴール

以下のテストケースが追加され、全 PASS すること:

1. `normalizeTypeAnnotation`: arrow function 除去、default value 除去、readonly 除去
2. `isPrimitiveTypeAnnotation`: union型（`string | number`）→ true、intersection型（`string & Branded`）→ false、空文字列 → false、`readonly string[]` → false
3. `mergeChannelMaps`: 2ファイルからのマージ、重複キーは先勝ち
4. `CHANNEL_OBJECT_PATTERN`: 複数 const object、空 body、`as const` なしは無視

### 2.3 スコープ

#### 含むもの

- `check-ipc-contracts.test.ts` へのテストケース追加（約15-20件）
- カバレッジ目標: Line 95%以上維持

#### 含まないもの

- 新関数のロジック変更（テスト追加のみ）
- EXT-004 モジュール分割

---

## 3. どう実施するか（How）

### 3.1 技術方針

既存テストファイルに新しい `describe` ブロックを追加する形で実装。

### 3.2 実装ステップ

1. `describe("normalizeTypeAnnotation")` ブロックを追加（5件）
2. `describe("isPrimitiveTypeAnnotation")` ブロックを追加（6件）
3. `describe("mergeChannelMaps")` ブロックを追加（4件）
4. `describe("CHANNEL_OBJECT_PATTERN / multi-line preload")` ブロックを追加（5件）
5. カバレッジ計測・確認

### 3.3 テスト方針

- 境界値テスト: 空文字列、1文字型、union 20型
- エッジケース: `as const` なし、nested object、re-export パターン
- 回帰テスト: 既存49テストが全 PASS を維持

---

## 4. 苦戦箇所（Lessons Learned from UT-TASK06-007）

### 4.1 vi.mock("fs") の describe 内配置制約

ESM モジュールを対象とするテストで `vi.mock("fs")` を describe 内に配置すると、`check-ipc-contracts.ts` の `import * as fs from "fs"` とは別の参照になりモック不適用。

**解決策**: `mergeChannelMaps` のテストでは fs モックを避け、テスト用の一時ファイルを作成するか、関数を export して直接テストする。

### 4.2 process.argv[1] パス解決（P40派生）

`main()` テストでは `process.argv[1]` をスクリプトパスに設定する必要あり。新関数の単体テストは `main()` を経由しないため影響なし。

---

## 5. 参照資料

| 資料名                       | パス                                                                                                                      | 説明                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 対象スクリプト               | `apps/desktop/scripts/check-ipc-contracts.ts`                                                                             | テスト対象（578行）  |
| 既存テスト                   | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                                              | 49テスト             |
| IPC drift detection パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md` | テスト戦略セクション |
| 苦戦箇所記録                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                                | v1.3.0 セクション    |

---

## 6. 完了条件

- [ ] `normalizeTypeAnnotation` のテスト5件が追加されている
- [ ] `isPrimitiveTypeAnnotation` のテスト6件が追加されている
- [ ] `mergeChannelMaps` のテスト4件が追加されている
- [ ] multi-line preload / CHANNEL_OBJECT_PATTERN のテスト5件が追加されている
- [ ] 全テスト PASS
- [ ] Line Coverage 95%以上を維持
