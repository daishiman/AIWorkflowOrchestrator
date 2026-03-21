# Phase 9: 品質保証 - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                |
| ------- | ------------------------------------------------- |
| Phase   | 9                                                 |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion |
| 作成日  | 2026-03-21                                        |
| 前Phase | [phase-8-refactoring.md](phase-8-refactoring.md)  |

## 目的

Lint・型チェック・全テスト実行により、変更後のコードが品質基準（Line Coverage 95%以上、全69件PASS）を満たすことを確認する。

## 実行タスク

- `eslint` 実行: `check-ipc-contracts.ts` とテストファイルを対象とした静的検査
- `pnpm typecheck` 実行: export追加による型エラーがないことを確認
- 全テスト実行: 69件全PASS確認
- カバレッジ計測: Line Coverage 95%以上を確認
- 品質レポートの作成

## 参照資料

| 資料名                 | パス                                                                        | 説明                           |
| ---------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| Phase 8成果物          | [phase-8-refactoring.md](phase-8-refactoring.md)                            | リファクタリング完了状態       |
| Phase 5成果物          | `outputs/phase-5/green-confirmation.md`                                     | export追加とGreen確認の記録    |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                          | カバレッジ基準（Line 80%/90%） |
| 要件定義               | [phase-1-requirements.md](phase-1-requirements.md)                          | NFR-2: Line Coverage 95%以上   |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Phase 9品質ゲート基準          |
| リファクタリング報告書 | `outputs/phase-8/refactoring-report.md`                                     | Phase 8 成果物                 |

## 実行手順

### ステップ1: Lint実行

対象スクリプトとテストファイルに対してESLintを実行する。

```bash
pnpm --filter @repo/desktop exec eslint \
  scripts/check-ipc-contracts.ts \
  scripts/__tests__/check-ipc-contracts.test.ts
```

確認観点:

- `no-unused-vars`: 追加したexportが未使用インポートとして扱われていないか
- `@typescript-eslint/explicit-function-return-type`: export追加した関数の戻り型が明示されているか
- その他プロジェクト設定のESLintルール違反がないか

### ステップ2: TypeScript型チェック実行

export追加によりコンパイルエラーが発生していないことを確認する。

```bash
pnpm --filter @repo/desktop typecheck
```

確認観点:

- `normalizeTypeAnnotation`, `isPrimitiveTypeAnnotation`, `mergeChannelMaps`, `CHANNEL_OBJECT_PATTERN`, `PRELOAD_CALL_START_PATTERN` のexportが型エラーを生じさせていないこと
- テストファイルのimport（新規追加分5シンボル）が解決されていること
- `mergeChannelMaps` テストで使用する `mkdtempSync`, `writeFileSync`, `rmSync`, `tmpdir`, `join` のimportが正しいこと

### ステップ3: 全テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

期待する結果:

- テスト件数: 69件
- PASS: 69件 / FAIL: 0件
- 実行時間: 10秒以内（NFR-4）

### ステップ4: カバレッジ計測

```bash
pnpm --filter @repo/desktop exec vitest run \
  scripts/__tests__/check-ipc-contracts.test.ts \
  --coverage --coverage.include='scripts/check-ipc-contracts.ts'
```

確認項目（`apps/desktop/scripts/check-ipc-contracts.ts` のカバレッジ）:

| 指標              | 目標基準（NFR-2） | 最低基準（コード品質ルール） |
| ----------------- | ----------------- | ---------------------------- |
| Line Coverage     | 95%以上           | 80%以上                      |
| Branch Coverage   | 70%以上           | 60%以上                      |
| Function Coverage | 90%以上           | 80%以上                      |

カバレッジが基準を下回った場合: Phase 6（テスト拡充）に戻り、不足箇所のテストを追加する。

### ステップ5: 品質レポートの作成

`outputs/phase-9/quality-report.md` に以下を記録する:

```markdown
# Phase 9 品質レポート

## Lint結果

- 実行コマンド: ...
- 結果: PASS / FAIL
- 指摘件数: 0件 / N件（詳細）

## 型チェック結果

- 実行コマンド: ...
- 結果: PASS / FAIL
- エラー件数: 0件 / N件（詳細）

## テスト実行結果

- テスト件数: 69件
- PASS: 69件 / FAIL: 0件
- 実行時間: X秒

## カバレッジ結果

| 指標              | 計測値 | 目標基準 | 判定 |
| ----------------- | ------ | -------- | ---- |
| Line Coverage     | 95.79% | 95%      | PASS |
| Branch Coverage   | 91.55% | 70%      | PASS |
| Function Coverage | 100%   | 90%      | PASS |

## 総合判定

PASS
```

## 統合テスト連携

ステップ3の全テスト実行が統合テストを兼ねる。既存49件の回帰テストと新規20件の動作確認を同時に実施する。

## 成果物

| 成果物       | パス                                | 説明                                           |
| ------------ | ----------------------------------- | ---------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | Lint・型チェック・テスト・カバレッジの結果記録 |

## 完了条件

- [x] `pnpm --filter @repo/desktop exec eslint scripts/check-ipc-contracts.ts scripts/__tests__/check-ipc-contracts.test.ts` がエラー0件で通過
- [x] `pnpm --filter @repo/desktop typecheck` がエラー0件で通過
- [x] `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts` で69件全PASS
- [x] Line Coverage が 95%以上（NFR-2）
- [x] Branch Coverage が 70%以上
- [x] Function Coverage が 90%以上
- [x] カバレッジは基準達成済みのため Phase 6 差し戻し不要
- [x] `outputs/phase-9/quality-report.md` を作成
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 10（最終レビュー）に進む。
