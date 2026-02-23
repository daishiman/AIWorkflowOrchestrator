# Phase 6: テスト拡充結果

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase        | 6                                       |
| 実行日時     | 2026-02-22                              |
| テストツール | Vitest v2.1.9                           |

## テスト実行結果

- 総テスト数: 43件（既存28件 + 追加15件）
- PASS: 43件
- FAIL: 0件

## 追加テストケース一覧

### 1. ロバスト性テスト: parseAliases (#29-32)

| #   | テストケース名                                      | 結果 |
| --- | --------------------------------------------------- | ---- |
| 29  | インデントがタブの場合も正しくパースする            | PASS |
| 30  | alias定義が複数行にまたがる場合も正しくパースする   | PASS |
| 31  | resolveの引数間にコメントがある場合はスキップされる | PASS |
| 32  | シングルクォートで囲まれたaliasキーはスキップされる | PASS |

### 2. 複合不整合テスト (#33-35)

| #   | テストケース名                                            | 結果 |
| --- | --------------------------------------------------------- | ---- |
| 33  | チェック1,3,5が同時に失敗する場合、全差分が出力される     | PASS |
| 34  | チェック1-5が全て失敗する場合、サマリーに総件数を出力する | PASS |
| 35  | 双方向チェック（1+2）で異なるエントリが不足する場合       | PASS |

### 3. エッジケーステスト (#36-40)

| #   | テストケース名                                                  | 結果 |
| --- | --------------------------------------------------------------- | ---- |
| 36  | exportsキーに深いネスト（./a/b/c）がある場合も正しく照合される  | PASS |
| 37  | typesVersionsに他バージョン条件があっても「\*」キーのみ使用する | PASS |
| 38  | package.jsonが不正なJSONの場合はSyntaxErrorをスローする         | PASS |
| 39  | tsconfig.jsonのcompilerOptionsが存在しない場合は空Mapを返す     | PASS |
| 40  | exportsエントリの値がnullの場合はスキップされる                 | PASS |

### 4. エラーハンドリングテスト (#41-43)

| #   | テストケース名                                                           | 結果 |
| --- | ------------------------------------------------------------------------ | ---- |
| 41  | package.jsonが存在しない場合はENOENTエラーをスローする                   | PASS |
| 42  | tsconfig.jsonが存在しない場合はENOENTエラーをスローする                  | PASS |
| 43  | vitest.config.tsパース結果が0件でaliasキーワードが含まれる場合は警告出力 | PASS |

## 実装修正（テストPASSのための最小限修正）

### 1. parseExports: null/undefined エントリのスキップ

exports エントリの値が `null` や `undefined` の場合、従来はそのまま Map に追加されていた。テストケース #40 の要件に合わせて、`null`/`undefined` 値をスキップするガードを追加した。

**変更箇所**: `scripts/check-shared-module-sync.ts` の `parseExports` 関数

```typescript
// 追加: null/undefined ガード
if (value === null || value === undefined) {
  continue;
}
```

### 2. parseAliases: 0件パース時の警告出力

パース結果が0件かつファイル内容に `alias` キーワードが含まれる場合、フォーマット不一致の可能性を警告するため `console.warn` を追加した。テストケース #43 の要件に対応。

**変更箇所**: `scripts/check-shared-module-sync.ts` の `parseAliases` 関数

```typescript
// 追加: 0件警告
if (result.size === 0 && content.includes("alias")) {
  console.warn(
    `Warning: vitest.config.ts contains "alias" but no @repo/shared aliases were parsed. Check the alias format.`,
  );
}
```

## P9 対策確認

- 全テストで `beforeEach` / `afterEach` により `vi.restoreAllMocks()` が実行される
- `console.warn` spy は各テスト内で設定し、`mockRestore()` でリストアしている
- モック値は各テストで個別に設定（テスト間で共有していない）

## 完了条件チェック

- [x] ロバスト性テスト（#29-32）が追加されている
- [x] 複合不整合テスト（#33-35）が追加されている
- [x] エッジケーステスト（#36-40）が追加されている
- [x] エラーハンドリングテスト（#41-43）が追加されている
- [x] 追加テスト15件を含む全テスト（28 + 15 = 43件）がPASSする
- [x] テスト間で状態を共有していない（P9対策: beforeEach / afterEach でリセット）
- [x] テスト拡充結果が本ファイルに記録されている
