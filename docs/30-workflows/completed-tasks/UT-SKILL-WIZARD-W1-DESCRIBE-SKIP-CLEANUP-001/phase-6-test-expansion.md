# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 5                                        |
| 後続Phase  | Phase 7                                        |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

変更後の回帰テスト確認と必要な補完テストを実施する。
NON_VISUAL クリーンアップタスクのため、テスト拡充は最小限とし、
`describe.skip` 外の全アクティブテストが PASS することを中心に確認する。

## テスト方針

本タスクはテストファイルの削除・書き換えのみであり、新規テストコードの追加は行わない。
以下の観点で既存テストの回帰確認を実施する。

- `describe.skip` 内を除く全アクティブテストが PASS することを確認
- 変更による意図しない回帰がないことを確認
- 旧 testid 参照がゼロ件であることを静的に確認

## 追加テストケース

| TC番号 | テスト名                                                                       | 種別       | 期待結果 |
| ------ | ------------------------------------------------------------------------------ | ---------- | -------- |
| TC-5   | 変更後も llm-generation.test.tsx の全アクティブテストが PASS すること          | 回帰 guard | PASS     |
| TC-6   | 変更後も auth-regression.test.tsx の全アクティブテストが PASS すること         | 回帰 guard | PASS     |
| TC-7   | `skill-lifecycle-request-input` が全テストファイルから完全に削除されていること | 静的確認   | 0件      |

## 補助コマンド

```bash
# 回帰ガード: 全テスト実行（verbose）
pnpm --filter @repo/desktop test:run --reporter=verbose

# 旧 testid の完全削除確認（0件が期待値）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# 対象ファイルのテストのみ実行（絞り込み確認）
pnpm --filter @repo/desktop test:run \
  SkillLifecyclePanel.llm-generation.test.tsx

pnpm --filter @repo/desktop test:run \
  SkillLifecyclePanel.auth-regression.test.tsx
```

## 異常系テスト

| シナリオ                                         | 期待される動作                                    |
| ------------------------------------------------ | ------------------------------------------------- |
| 旧 testid が削除されずに残っている場合           | `grep` で検出され、Phase 5 に差し戻す             |
| `describe.skip` 外のテストが誤って削除された場合 | `test:run` で FAIL が検出され、Phase 5 に差し戻す |
| 書き換え後の testid が現行 UI と一致しない場合   | 該当テストが FAIL し、差し戻す                    |

## 回帰テスト結果

```bash
# 実行コマンド
pnpm --filter @repo/desktop test:run --reporter=verbose

# 期待結果: 全アクティブテストが PASS
# （describe.skip 内は実行対象外のため除く）
```

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル | `outputs/phase-5/changed-files.md`          | Phase 5 成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |

## 実行手順

1. Phase 5 の実装結果（変更ファイル一覧）を確認する
2. `pnpm --filter @repo/desktop test:run --reporter=verbose` を実行する
3. 全アクティブテストの PASS を確認し記録する
4. `grep` で旧 testid の残存ゼロを静的確認する
5. 成果物を `outputs/phase-6/` に出力する

## 実行タスク

- Phase 5 の実装結果（変更ファイル一覧）を確認する
- pnpm --filter @repo/desktop test:run --reporter=verbose を実行する
- 全アクティブテストの PASS を確認し記録する
- grep で旧 testid の残存ゼロを静的確認する
- 成果物を outputs/phase-6/ に出力する

## 統合テスト連携

```bash
# 全体回帰確認（verbose）
pnpm --filter @repo/desktop test:run --reporter=verbose

# 型チェック（回帰確認）
pnpm --filter @repo/desktop typecheck
```

## 多角的チェック観点

| 観点        | 確認内容                                                     |
| ----------- | ------------------------------------------------------------ |
| 網羅性      | 対象2ファイルのアクティブテストが全て PASS していること      |
| 意図的 skip | `describe.skip` が変更によって意図せず有効化されていないこと |
| 静的整合性  | 旧 testid 参照がゼロ件であることを `grep` で確認していること |

## 成果物

| 成果物         | パス                                        | 説明                           |
| -------------- | ------------------------------------------- | ------------------------------ |
| 回帰テスト結果 | `outputs/phase-6/regression-test-result.md` | 全アクティブテスト PASS の記録 |

## 完了条件

- [ ] TC-5〜TC-7 の確認が完了している
- [ ] 全アクティブテストが PASS している
- [ ] 旧 testid の残存ゼロが静的確認されている
- [ ] 回帰テスト結果が成果物として記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. Phase 5 成果物の確認
2. 全テスト実行（verbose）と結果記録
3. 旧 testid 静的確認（grep）
4. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 7: テストカバレッジ確認
