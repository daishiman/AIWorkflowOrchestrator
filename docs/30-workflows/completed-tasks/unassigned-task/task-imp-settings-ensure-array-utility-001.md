# ensureArray 共通ヘルパー導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1043
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-FIX-ENSURE-ARRAY-COMMON-UTIL-001                 |
| タスク名     | ensureArray 共通ヘルパー導入                        |
| 分類         | リファクタリング                                    |
| 対象機能     | `apiKeyHandlers` / `profileHandlers` の配列防御処理 |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | Phase 12                                            |
| 発見日       | 2026-03-07                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の実装中に、`Array.isArray(x) ? x : []` パターンが5箇所で使用されていることが判明した:

- `apiKeyHandlers.ts`: 1箇所（GAP-05修正 -- providers配列バリデーション）
- `profileHandlers.ts`: 3箇所（GAP-06修正 -- identities配列の `?? []` を `Array.isArray` に統一）
- `ApiKeysSection/index.tsx`: 1箇所（GAP-03 Renderer側防御）

P48（`??` vs `Array.isArray`）で `??` では null/undefined 以外の非配列型（文字列、オブジェクト等）を防御できないことが判明し、全箇所を `Array.isArray` パターンに統一した。

### 1.2 問題点・課題

- 同じ防御ロジック（`Array.isArray(x) ? x : []`）が3ファイル5箇所に分散しており、仕様変更時に修正漏れが起きやすい
- `profileHandlers.ts` では GAP-06 修正時に3箇所を個別に `?? []` から `Array.isArray` に書き換えたが、パターンが同一であるため共通化の余地がある
- 型パラメータ（`T`）が各箇所で異なる（`ProviderStatus[]` / `Identity[]`）ため、ジェネリクスでの抽象化が必要

### 1.3 放置した場合の影響

- 新規 IPC ハンドラ追加時に `?? []`（P48 違反）パターンが再び使用されるリスクがある
- 配列防御の実装揺れが発生し、IPC契約の安定性が低下する
- CC-7（レスポンス配列フィールドの防御検証）チェックリストで毎回同一パターンを手動記述する非効率が続く

---

## 2. 何を達成するか（What）

### 2.1 目的

配列防御ロジックを共通化し、実装とテストの再利用性を高める。

### 2.2 最終ゴール

`ensureArray<T>(value: unknown): T[]` を共通ユーティリティとして導入し、対象箇所で利用する。

### 2.3 スコープ

#### 含むもの

- `packages/shared` への共通ユーティリティ追加（`packages/shared/src/utils/ensureArray.ts`）
- `ensureArray` の単体テスト追加
- `apiKeyHandlers.ts` / `profileHandlers.ts` での共通関数適用
- 既存テストの回帰確認

#### 含まないもの

- UI挙動の変更
- 新規IPCチャネル追加
- `ApiKeysSection/index.tsx`（Renderer側）の共通化（Renderer側は別途検討）

---

## 3. どう実装するか（How）

### 3.1 実装方針

共通関数を先に追加し、呼び出し側を置換した後、既存テストを回帰する。

**前提条件**: 現在の `apiKey:list` 契約防御がPASSしていること。

**依存タスク**: TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 完了

**必要な知識**: TypeScript ジェネリクス、IPCハンドラ実装、Vitest

### 3.2 修正対象ファイル

| ファイルパス                                        | 変更種別 | 変更内容                                                     |
| --------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `packages/shared/src/utils/ensureArray.ts`          | 新規作成 | `ensureArray<T>` ユーティリティ関数                          |
| `packages/shared/src/utils/ensureArray.test.ts`     | 新規作成 | 単体テスト（6パターン以上）                                  |
| `packages/shared/src/index.ts`                      | 修正     | `ensureArray` の re-export 追加                              |
| `apps/desktop/src/main/handlers/apiKeyHandlers.ts`  | 修正     | `Array.isArray(x) ? x : []` を `ensureArray` に置換（1箇所） |
| `apps/desktop/src/main/handlers/profileHandlers.ts` | 修正     | `Array.isArray(x) ? x : []` を `ensureArray` に置換（3箇所） |

### 3.3 実装手順

#### Phase 1: ユーティリティ追加

**目的**: 配列防御の単一実装を提供する。

**手順**:

1. `packages/shared/src/utils/ensureArray.ts` を作成
2. ジェネリクス型パラメータ `<T>` で型安全な実装を行う
3. 単体テストを作成（null / undefined / string / object / number / 正常配列の6パターン）
4. `packages/shared/src/index.ts` から re-export

**完了条件**: ユーティリティ単体テストPASS

#### Phase 2: 呼び出し側置換

**目的**: 既存の散在パターンを共通関数で置換する。

**手順**:

1. `apiKeyHandlers.ts` の `Array.isArray(x) ? x : []` を `ensureArray<ProviderStatus>(x)` に置換
2. `profileHandlers.ts` の3箇所を `ensureArray<Identity>(x)` に置換
3. `@repo/shared` からの import を追加

**完了条件**: 型エラーなし（`pnpm typecheck` PASS）

#### Phase 3: テスト回帰

**目的**: 置換による機能退行がないことを確認する。

**手順**:

1. `apiKeyHandlers` 関連テストを実行
2. `profileHandlers` 関連テストを実行
3. `rg "Array\.isArray\(" apps/desktop/src/main/handlers/` で残件がないことを確認

**完了条件**: 既存テスト全PASS、残件0

---

## 4. 受入基準

### 機能要件

- [ ] `ensureArray<T>(value: unknown): T[]` が `@repo/shared` から export されている
- [ ] `apiKeyHandlers.ts` の1箇所で `ensureArray` を利用している
- [ ] `profileHandlers.ts` の3箇所で `ensureArray` を利用している
- [ ] null / undefined / string / object / number / 正常配列の全入力パターンで正しく動作する

### 品質要件

- [ ] 既存テスト回帰PASS
- [ ] `pnpm typecheck` で型エラーなし
- [ ] `pnpm lint` でLintエラーなし

### ドキュメント要件

- [ ] 変更点を `documentation-changelog` に記録
- [ ] 必要に応じてシステム仕様書（`architecture-implementation-patterns.md` 等）を更新

---

## 5. テスト計画

### 単体テスト（ensureArray）

| テストケース     | 入力             | 期待結果     |
| ---------------- | ---------------- | ------------ |
| null入力         | `null`           | `[]`         |
| undefined入力    | `undefined`      | `[]`         |
| 文字列入力       | `"hello"`        | `[]`         |
| オブジェクト入力 | `{ key: "val" }` | `[]`         |
| 数値入力         | `42`             | `[]`         |
| 正常配列入力     | `[1, 2, 3]`      | `[1, 2, 3]`  |
| 空配列入力       | `[]`             | `[]`         |
| ネストされた配列 | `[[1], [2]]`     | `[[1], [2]]` |

### 統合テスト（回帰確認）

| テスト対象               | 検証内容                                              |
| ------------------------ | ----------------------------------------------------- |
| `apiKeyHandlers` テスト  | providers が非配列の場合に空配列にフォールバックする  |
| `profileHandlers` テスト | identities が非配列の場合に空配列にフォールバックする |

### 検証手順

1. `pnpm --filter @repo/shared vitest run src/utils/ensureArray.test.ts`
2. `pnpm --filter @repo/desktop vitest run` で関連テスト回帰
3. `pnpm typecheck` で型整合性確認

---

## 6. リスク・注意事項

| リスク                       | 影響度 | 発生確率 | 対策                                                                         |
| ---------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| 置換漏れ                     | 中     | 中       | `rg "Array\.isArray\("` で残件確認                                           |
| 型崩れ（ジェネリクス不整合） | 低     | 低       | ジェネリクス型テスト追加                                                     |
| shared パッケージビルド順序  | 低     | 低       | `pnpm --filter @repo/shared build` を先に実行                                |
| 過度なジェネリクス複雑化     | 中     | 中       | シンプルな `<T>(value: unknown): T[]` を採用し、過度なオーバーロードを避ける |

---

## 7. 関連タスク・参照資料

### 関連タスク

| タスクID                                    | 関係         | 状態 |
| ------------------------------------------- | ------------ | ---- |
| TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | 発見元タスク | 完了 |

### 参照資料（aiworkflow-requirements）

| 仕様書                                        | 参照内容                                                         |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `architecture-implementation-patterns.md` S27 | Renderer境界5層防御パターン                                      |
| `architecture-implementation-patterns.md` S29 | Renderer境界 providers 正規化パターン（Array.isArray の4層防御） |
| `security-electron-ipc.md`                    | GAP-05: Main側 providers 非配列ガード                            |
| `security-electron-ipc.md` v1.14.0            | providers 正規化の仕様                                           |
| `ipc-contract-checklist.md` CC-7              | レスポンス配列フィールドの防御検証                               |
| `testing-component-patterns.md` セクション15  | IPC レスポンス異常値テストパターン                               |
| `lessons-learned.md`                          | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 教訓                 |
| `api-ipc-system.md`                           | `apiKey:list` 契約定義                                           |
| `06-known-pitfalls.md` P48                    | `??` vs `Array.isArray` の防御力差                               |
| `06-known-pitfalls.md` P50                    | 既実装防御の発見パターン                                         |

### その他参照

- `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/unassigned-task-report.md`
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

---

## 8. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **`?? []` vs `Array.isArray` の防御力の差（P48）**: `profileHandlers.ts` の3箇所で `user.identities ?? []` を使用していたが、identities が文字列やオブジェクトだった場合に防御できない。`Array.isArray` への統一で全非配列型を防御できるようになった。`ensureArray` ヘルパーはこのパターンを1関数に集約する

2. **パターンの散在と一括修正の難易度**: 5箇所が3ファイルに分散しており、`grep -rn "Array.isArray"` で全箇所を特定してから修正する必要があった。共通ヘルパーに集約すれば、仕様変更時の修正は1箇所で済む

3. **ジェネリクスの型推論**: `Array.isArray` 後の要素型が `any[]` に推論されるため、呼び出し側で `ensureArray<ProviderStatus>(value)` のように型パラメータを明示する必要がある。型パラメータなしで安全に使えるオーバーロードも検討すべき

4. **Array.isArray パターンの散在（P50 関連）**: apiKeyHandlers.ts（1箇所）と profileHandlers.ts（3箇所）で `Array.isArray(x) ? x : []` が計4箇所に散在している。共通化の閾値判断が難しく、現時点では「4箇所のためインライン記述で十分」と判断したが、今後同パターンが増加する場合は共通ヘルパーの導入が効果的

5. **ensureArray のジェネリクス設計**: `ensureArray<T>(value: unknown): T[]` の型パラメータ設計で、入力が `T[] | null | undefined | unknown` のどれかを受け入れる必要がある。過度に複雑なジェネリクスは学習コストを上げるため、シンプルな `(value: unknown) => unknown[]` + 呼び出し側での型アサーション vs 完全型安全な `<T>(value: T[] | null | undefined): T[]` のトレードオフを検討すること

6. **テスト時の DI モック影響（P35）**: 共通ヘルパーを導入しても、各ハンドラのテストではモック経由で動作確認するため、ヘルパー自体の単体テストと、ハンドラテストでの統合確認の両方が必要

### レビュー指摘の原文

```text
UT-1: ensureArray ヘルパーの共通化 -- 同一パターン（Array.isArray(x) ? x : []）が
apiKeyHandlers.ts（1箇所）と profileHandlers.ts（3箇所）で使用されている。
今後さらに同パターンが増加する場合、packages/shared に共通ヘルパーとして抽出する。
```

### 補足事項

- 本タスクは優先度低で、同種コードが6箇所以上に増えた時点で着手を推奨する
- 実装時は `packages/shared/src/utils/ensureArray.ts` に配置し、`@repo/shared` から export する
- テストでは null / undefined / string / object / number / 正常配列の6パターンを網羅すること
