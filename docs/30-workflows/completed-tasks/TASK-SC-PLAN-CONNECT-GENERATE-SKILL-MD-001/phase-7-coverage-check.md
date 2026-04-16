# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 7                                                  |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001         |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connection    |
| 前提Phase  | Phase 6（テスト拡充完了・全テスト Green 確認済み） |
| 後続Phase  | Phase 8                                            |
| 作成日     | 2026-04-16                                         |
| ステータス | pending                                            |

## 目的

Phase 6 までのテストを踏まえ、`SkillCreatorService.ts` の新規追加コードのカバレッジが
目標値を満たしていることを確認する。未達の場合は Phase 6 に差し戻してテストを追加する。

## 実行タスク

### タスク1: カバレッジレポート生成

```bash
# SkillCreatorService.ts 対象のカバレッジレポート生成
pnpm --filter @repo/desktop test -- --run \
  --coverage \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  --coverage.reporter=text \
  src/main/services/skill/SkillCreatorService.test.ts

# HTML レポートも生成（視覚的確認用・任意）
pnpm --filter @repo/desktop test -- --run \
  --coverage \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  --coverage.reporter=html \
  src/main/services/skill/SkillCreatorService.test.ts

# レポートディレクトリ確認
ls apps/desktop/coverage/
```

### タスク2: カバレッジ目標確認

#### カバレッジ目標値

| 計測対象                              | Line    | Branch  | Function |
| ------------------------------------- | ------- | ------- | -------- |
| `if (structurePlan)` ブロック         | 100%    | 100%    | -        |
| `generateSkillMd` メソッド全体        | 80%以上 | 60%以上 | 100%     |
| `SkillCreatorService.ts` 新規追加部分 | 80%以上 | 60%以上 | 80%以上  |
| （推奨）                              | 90%以上 | 70%以上 | 90%以上  |

#### カバレッジ計測結果記録（実行時に記入）

| 計測対象                              | Line | Branch | Function | 判定    |
| ------------------------------------- | ---- | ------ | -------- | ------- |
| `if (structurePlan)` ブロック         | -    | -      | -        | pending |
| `generateSkillMd` メソッド全体        | -    | -      | -        | pending |
| `SkillCreatorService.ts` 新規追加部分 | -    | -      | -        | pending |

#### 未達時の対処

```bash
# 未達の場合: カバレッジレポートから未到達行を特定
pnpm --filter @repo/desktop test -- --run \
  --coverage \
  --coverage.include="src/main/services/skill/SkillCreatorService.ts" \
  --coverage.reporter=text \
  src/main/services/skill/SkillCreatorService.test.ts 2>&1 | \
  grep -A 20 "SkillCreatorService.ts"

# 未到達行を確認して Phase 6 に差し戻す
```

未達の場合は以下を記録してから Phase 6 に差し戻す:

- 未到達の行番号
- 未カバーの Branch（true/false の片側のみカバーされているケースなど）
- 追加すべきテストケースの概要

### タスク3: Branch カバレッジ確認観点

新規追加コードの各ブランチがすべてテストされていることを確認する。

| ブランチ                                                 | 対応 TC     |
| -------------------------------------------------------- | ----------- |
| `structurePlan` が truthy → `generateSkillMd` が呼ばれる | TC-1        |
| `structurePlan` が null → `logger.error` が呼ばれる      | TC-2        |
| `scriptExecutor.execute` 成功 → 正常終了                 | TC-3        |
| `scriptExecutor.execute` 失敗 → fallback が呼ばれる      | TC-4 / TC-5 |
| `fs.writeFile` 失敗 → fallback が呼ばれる                | TC-6        |
| `finally` ブロックの tmpPlanPath クリーンアップ          | TC-3 / TC-5 |

### タスク4: 統合テストカバレッジ確認

| 統合テストカテゴリ                  | テスト件数 | 目標カバレッジ | 結果    |
| ----------------------------------- | ---------- | -------------- | ------- |
| 正常系シナリオ（IT-1〜IT-2）        | 2          | 100%           | pending |
| 異常系シナリオ（IT-3〜IT-4）        | 2          | 80%以上        | pending |
| API エンドポイント（create モード） | -          | 100%           | pending |

```bash
# 統合テスト再実行
pnpm --filter @repo/desktop test -- --run --reporter=verbose \
  src/main/services/skill/SkillCreatorService.test.ts

# 全テスト（回帰確認）
pnpm --filter @repo/desktop test
```

## 参照資料

| 資料名                     | パス                                                               | 用途                         |
| -------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| Phase 6 カバレッジレポート | `outputs/phase-6/coverage-report.md`                               | Phase 6 時点のカバレッジ参照 |
| 実装ファイル               | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`      | カバレッジ対象コード確認     |
| テストファイル             | `apps/desktop/src/main/services/skill/SkillCreatorService.test.ts` | テスト件数・内容確認         |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/references/`               | プロジェクト共通仕様参照     |

## 統合テスト連携【必須】

統合テストの再実行とゲート判定。

| 判定項目                               | 基準    | 結果    |
| -------------------------------------- | ------- | ------- |
| `if (structurePlan)` Branch カバレッジ | 100%    | pending |
| `generateSkillMd` Line カバレッジ      | 80%以上 | pending |
| `generateSkillMd` Branch カバレッジ    | 60%以上 | pending |
| `generateSkillMd` Function カバレッジ  | 100%    | pending |
| 統合テスト正常系（IT-1〜IT-2）         | 100%    | pending |
| 統合テスト異常系（IT-3〜IT-4）         | 80%以上 | pending |
| 全テスト PASS                          | PASS    | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                   |
| -------- | -------------------------------------------------------------------------- |
| 矛盾     | カバレッジ目標値とテストケース数が矛盾していないか                         |
| 漏れ     | `finally` ブロック（tmpPlanPath クリーンアップ）がカバーされているか       |
| 整合性   | Phase 6 で追加した TC-5〜TC-8・IT-3〜IT-4 がカバレッジ向上に寄与しているか |
| 依存関係 | Phase 5 実装変更後のブランチ数と Phase 4〜6 テスト件数が整合しているか     |

## 成果物

| 成果物                     | パス                                       | 説明                                 |
| -------------------------- | ------------------------------------------ | ------------------------------------ |
| カバレッジ確認結果レポート | `outputs/phase-7/coverage-check-result.md` | 計測結果・目標達成判定・差し戻し記録 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test --coverage` でカバレッジ計測が実行されている
- [ ] `SkillCreatorService.ts` の新規追加コードの Line Coverage 80% 以上
- [ ] `SkillCreatorService.ts` の新規追加コードの Branch Coverage 60% 以上
- [ ] `SkillCreatorService.ts` の新規追加コードの Function Coverage 80% 以上
- [ ] 統合テスト（IT-1〜IT-4）カバレッジ 80% 以上
- [ ] `if (structurePlan)` の true / false 両 Branch がカバーされている
- [ ] 未達の場合 Phase 6 への差し戻し記録が `outputs/phase-7/coverage-check-result.md` にある
- [ ] 全テスト PASS
- [ ] `outputs/phase-7/coverage-check-result.md` が作成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行（text レポート）
2. 計測結果の記録（Line / Branch / Function 各値）
3. `if (structurePlan)` Branch カバレッジ観点の確認
4. `generateSkillMd` メソッド全体の Branch 観点確認（6ブランチ）
5. 統合テストカバレッジ確認（IT-1〜IT-4）
6. カバレッジ目標との照合（達成 / 未達判定）
7. 未達の場合: 未到達行特定・Phase 6 差し戻し記録
8. `outputs/phase-7/coverage-check-result.md` 作成
9. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## Phase末端アクション【必須】

- `outputs/phase-7/coverage-check-result.md` に計測結果（Line / Branch / Function カバレッジ値）と達成判定を記録する
- 未達の場合は未到達箇所を明記し、Phase 6 への差し戻し理由を記録する
- 達成の場合は Phase 8 の担当者に「カバレッジ目標達成・全テスト PASS」を引き継ぐ

## 次のPhase

Phase 8: リファクタリング
