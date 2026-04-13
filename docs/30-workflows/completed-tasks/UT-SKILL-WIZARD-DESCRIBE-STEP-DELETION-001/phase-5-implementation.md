# Phase 5: 実装（TDD Green）

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 5                                                 |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 4                                           |
| 後続Phase  | Phase 6                                           |
| 作成日     | 2026-04-11                                        |
| ステータス | 未実施                                            |

## 目的

`DescribeStep.tsx` への参照残留を全量確認したうえで、`DescribeStep.tsx` と
`DescribeStep.test.tsx` を物理削除し、`pnpm typecheck` および `pnpm test` の通過を確認することで
TDD Green を達成する。

## 前提条件

Phase 4 で以下が確認済みであること：

- `import.*DescribeStep` パターンの検索結果が 0 件
- 削除前の状態で `pnpm typecheck` が PASS
- `wizard-exports.test.ts` が新規作成され、DescribeStep 非存在テストを含む contract guard になっている

## canUseTool 適用範囲

N/A（LLM / SDK を使用しない削除タスク）

## 削除対象ファイル

| ファイル                                                                  | 変更種別 | 備考                                               |
| ------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`      | 削除     | `@deprecated` 付与済み・エクスポート削除済みのため |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` | 削除     | companion test のため同時削除                      |

## 実行タスク

実行手順を参照。

## 実行手順

### Step 1: 参照残留の全量確認（念のため）

```bash
# 1a. import 文での参照確認
grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# 1b. export 文での再エクスポート確認
grep -r "export.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# 1c. JSX 要素としての使用確認（<DescribeStep）
grep -r "<DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
# 期待: 出力なし（0件）

# 1d. wizard/index.ts の状態確認（エクスポート削除済み）
grep "DescribeStep" apps/desktop/src/renderer/components/skill/wizard/index.ts
# 期待: 出力なし（0件）
```

**判定基準**: 上記 1a〜1d 全て 0 件であれば Step 2 に進む。
1 件でも残留がある場合は即時停止し、Phase 2（設計）へ戻って影響範囲を再確認する。

### Step 2: DescribeStep 系ファイルの物理削除

```bash
# git rm で削除（git の管理下から除外）
git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx

# git rm が使えない場合は rm + git add -u
# rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
# rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx
# git add -u apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
# git add -u apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx
```

### Step 3: 削除後の型チェック確認

```bash
pnpm typecheck
# 期待: exit code 0 / エラーなし
```

エラーが発生した場合は内容を記録し、対応方針を決定してから修正する。

### Step 4: テスト確認

```bash
pnpm --filter @repo/desktop test
# 期待: wizard-exports.test.ts を含む全テストが PASS
```

`wizard-exports.test.ts` の DescribeStep 非存在テストが引き続き PASS することを確認する。

## 統合テスト連携（Phase 11 まで必須）

```bash
# wizard-exports テストに絞って実行
pnpm --filter @repo/desktop test -- wizard-exports --reporter=verbose
# 期待: DescribeStep がエクスポートされていないことを確認するテストが PASS
```

## 多角的チェック観点

| 観点           | 確認内容                                                                         |
| -------------- | -------------------------------------------------------------------------------- |
| 参照ゼロ確認   | `grep -r "import.*DescribeStep"` の結果が空であること                            |
| ガードテスト   | `wizard-exports.test.ts` の DescribeStep 非存在テストが削除後も Green であること |
| typecheck      | `pnpm typecheck` の exit code が 0 であること                                    |
| git 状態       | `git status` に 2 件の `deleted:` が表示されること                               |
| 副作用なし     | 削除対象以外のファイルに変更がないこと                                           |
| 注意事項の遵守 | `wizard-exports.test.ts` の DescribeStep テストを誤って削除していないこと        |

## 参照資料

| 資料名           | パス                                      | 用途                          |
| ---------------- | ----------------------------------------- | ----------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`   | Phase 4 成果物                |
| 削除前状態記録   | `outputs/phase-4/pre-deletion-state.md`   | 削除前の Green 状態の記録     |
| 前提条件確認結果 | `outputs/phase-4/precondition-check.md`   | 参照ゼロ・typecheck PASS 確認 |
| 作成完了記録     | `outputs/phase-4/test-creation-result.md` | Phase 4 成果物                |

## 成果物

| 成果物         | パス                                        | 説明                                |
| -------------- | ------------------------------------------- | ----------------------------------- |
| 参照確認結果   | `outputs/phase-5/reference-check-result.md` | Step 1（1a〜1d）の grep 実行結果    |
| 削除実行記録   | `outputs/phase-5/deletion-execution-log.md` | git rm の実行結果と git status 出力 |
| typecheck 結果 | `outputs/phase-5/typecheck-result.md`       | pnpm typecheck の実行結果           |
| テスト実行結果 | `outputs/phase-5/test-execution-result.md`  | pnpm test の実行結果                |

## 完了条件

- [ ] Step 1（1a〜1d）の参照確認が全て 0 件
- [ ] `DescribeStep.tsx` と `DescribeStep.test.tsx` が物理削除済み（git rm 完了）
- [ ] `pnpm typecheck` が exit code 0 で PASS
- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] `wizard-exports.test.ts` の DescribeStep 非存在テストが PASS
- [ ] 成果物テーブル記載のファイルを全件生成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
```

## 次のPhase

Phase 6: テスト拡充
