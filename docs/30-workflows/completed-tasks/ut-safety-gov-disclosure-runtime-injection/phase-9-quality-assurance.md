# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 9                                          |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

lint / typecheck / テスト全通過を一括確認し、カバレッジ基準の達成を検証する。
Phase 10 の最終レビューゲートに進む前に、品質指標をすべて満たしているかを判定する。

## 実行タスク

- タスク1: ESLint 全通過確認
- タスク2: TypeScript typecheck 全通過確認
- タスク3: テスト全通過確認
- タスク4: カバレッジ基準達成確認
- タスク5: 品質保証レポート作成

## 実行手順

### ステップ1: ESLint 全通過確認

```bash
pnpm --filter @repo/desktop lint
```

期待結果: エラー 0 件・警告 0 件。
エラーが残る場合は Phase 8 に戻って修正する。

### ステップ2: TypeScript typecheck 全通過確認

```bash
pnpm --filter @repo/desktop typecheck
```

期待結果: エラー 0 件。
型エラーが残る場合は Phase 8 に戻って修正する。

### ステップ3: テスト全通過確認

```bash
pnpm --filter @repo/desktop test -- --run
```

期待結果: 全テスト PASS。
失敗テストが存在する場合は Phase 6 または Phase 5 に戻って修正する。

特に以下のテストが PASS していることを確認する:

- `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` の全テスト

### ステップ4: カバレッジ基準達成確認

```bash
pnpm --filter @repo/desktop test -- --run --coverage
```

`disclosureHandlers.test.ts` のカバレッジを確認する:

| 指標              | 最低基準 | 確認結果 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%+     | -        |
| Branch Coverage   | 60%+     | -        |
| Function Coverage | 80%+     | -        |

未達の場合は Phase 6 に戻ってテストを追加する。

### ステップ5: 品質保証レポート作成

確認結果を以下のテーブルにまとめる:

| 確認項目             | コマンド                                    | 結果      |
| -------------------- | ------------------------------------------- | --------- |
| ESLint               | `pnpm --filter @repo/desktop lint`          | PASS/FAIL |
| TypeScript typecheck | `pnpm --filter @repo/desktop typecheck`     | PASS/FAIL |
| テスト全 PASS        | `pnpm --filter @repo/desktop test -- --run` | PASS/FAIL |
| Line Coverage        | `... --coverage`                            | XX%       |
| Branch Coverage      | `... --coverage`                            | XX%       |
| Function Coverage    | `... --coverage`                            | XX%       |

レポートを `outputs/phase-9/quality-report.md` に保存する。

## 参照資料

| 資料名                   | パス                                                             | 説明                         |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------- |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`                                      | カバレッジ基準値の参照元     |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                         | lint/typecheck 修正内容      |
| テストファイル           | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | テスト対象ファイル           |
| 実装ファイル             | `apps/desktop/src/main/ipc/index.ts`                             | buildDisclosureInfo 実装箇所 |

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果   |
| ------------------------ | ---- | ------ |
| ユニットテストLine       | 80%+ | 未計測 |
| ユニットテストBranch     | 60%+ | 未計測 |
| ユニットテストFunction   | 80%+ | 未計測 |
| 結合テストAPI            | 100% | 未計測 |
| 結合テストシナリオ正常系 | 100% | 未計測 |
| 結合テストシナリオ異常系 | 80%+ | 未計測 |

## 成果物

| 成果物           | パス                                | 説明             |
| ---------------- | ----------------------------------- | ---------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 全確認項目と結果 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` が PASS（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop test -- --run` が全テスト PASS
- [ ] Line Coverage 80%+ を達成している
- [ ] Branch Coverage 60%+ を達成している
- [ ] Function Coverage 80%+ を達成している
- [ ] 品質保証レポートが `outputs/phase-9/quality-report.md` に作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                      | 状態 | 備考 |
| --------------------------- | ---- | ---- |
| ESLint 全通過確認           | -    | -    |
| TypeScript typecheck 全通過 | -    | -    |
| テスト全通過確認            | -    | -    |
| カバレッジ基準達成確認      | -    | -    |
| 品質保証レポート作成        | -    | -    |

## 次のPhase

Phase 10: 最終レビューゲート → [phase-10-final-review.md](phase-10-final-review.md)

**ゲート**: lint / typecheck / テスト / カバレッジ すべて PASS 後にのみ Phase 10 へ進む。
