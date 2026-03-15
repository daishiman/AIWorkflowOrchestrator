# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 7                                                          |
| Phase名    | カバレッジ確認                                             |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 6（テスト拡充）                                      |
| 後続Phase  | Phase 8（リファクタリング）                                |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 6 のテスト拡充後にカバレッジ基準の充足を最終確認する。最低基準（Line 80%、Branch 60%、Function 80%）を達成していない場合は Phase 6 に戻り、テストを追加する。基準達成後はカバレッジレポートと統合テスト結果を成果物として記録する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行タスク

- カバレッジ測定実行: `vitest --coverage` で対象ファイルのカバレッジを測定する
- 基準判定: 最低基準未達の場合は Phase 6 に戻り、テストを追加する
- 統合テスト実行: `runtimeRouting.integration.test.ts` の全テストが PASS することを確認する
- レポート作成: カバレッジレポートと統合テスト結果を `outputs/phase-7/` に記録する

## 参照資料

| 参照資料             | パス                                        | 内容                                             |
| -------------------- | ------------------------------------------- | ------------------------------------------------ |
| Phase 6 拡充サマリー | `outputs/phase-6/test-expansion-summary.md` | 不足テストの特定結果と追加内容                   |
| Phase 4 テスト設計書 | `outputs/phase-4/test-design.md`            | テストケース一覧と E2E シナリオ（完了確認用）    |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更ファイル一覧（カバレッジ対象ファイルの確認） |

### システム仕様（aiworkflow-requirements）

> カバレッジ基準は以下の正本に定義されている。

| 参照資料               | パス                                                                          | 内容                 |
| ---------------------- | ----------------------------------------------------------------------------- | -------------------- |
| development-guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | カバレッジ基準の正本 |

## 実行手順

### ステップ1: 対象ファイルのカバレッジを測定する

```bash
# apps/desktop パッケージのカバレッジ測定
cd apps/desktop

# 対象ファイルを指定してカバレッジ測定
pnpm vitest run --coverage \
  --reporter=verbose \
  src/main/services/runtime/RuntimeResolver.ts \
  src/main/ipc/skillHandlers.ts \
  src/main/ipc/agentHandlers.ts \
  src/renderer/components/organisms/TerminalHandoffCard/index.tsx \
  src/renderer/hooks/useSkillExecution.ts \
  src/renderer/hooks/useAgent.ts \
  src/renderer/store/slices/agentSlice.ts
```

カバレッジレポート出力先: `apps/desktop/coverage/`

### ステップ2: カバレッジ基準を確認し判定する

各ファイルのカバレッジ値を以下のマトリクスに記録する:

| ファイル                                | Line Coverage | Branch Coverage | Function Coverage | 最低基準達成 |
| --------------------------------------- | ------------- | --------------- | ----------------- | ------------ |
| RuntimeResolver.ts                      | -             | -               | -                 | -            |
| skillHandlers.ts（runtime 追加分）      | -             | -               | -                 | -            |
| agentHandlers.ts（runtime 追加分）      | -             | -               | -                 | -            |
| TerminalHandoffCard/index.tsx           | -             | -               | -                 | -            |
| useSkillExecution.ts                    | -             | -               | -                 | -            |
| useAgent.ts                             | -             | -               | -                 | -            |
| agentSlice.ts（handoffGuidance 追加分） | -             | -               | -                 | -            |
| **全体**                                | -             | -               | -                 | -            |

判定ルール:

| 判定         | 条件                                                 | 対応                     |
| ------------ | ---------------------------------------------------- | ------------------------ |
| 基準達成     | 全ファイルで Line 80%、Branch 60%、Function 80% 以上 | Phase 8 へ進行           |
| 最低基準未達 | いずれかのファイルで最低基準を下回る                 | Phase 6 に戻りテスト追加 |

### ステップ3: 統合テストを実行する

```bash
# 統合テストの実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/runtimeRouting.integration.test.ts --reporter=verbose
```

統合テスト確認項目:

| テストケース                            | 期待結果 | 実際の結果 |
| --------------------------------------- | -------- | ---------- |
| api-key モードの integrated フロー      | PASS     | -          |
| subscription モードの handoff フロー    | PASS     | -          |
| Agent api-key フロー                    | PASS     | -          |
| Agent subscription handoff フロー       | PASS     | -          |
| chatEditHandlers との DI 競合がないこと | PASS     | -          |

### ステップ4: 全テストを実行しリグレッションを確認する

```bash
# 全テスト実行（既存テストが壊れていないことを最終確認）
cd apps/desktop
pnpm test
```

確認項目:

- 新規テストが全て PASS していること
- 既存テスト（変更前から存在するテスト）が全て PASS していること
- 合計テスト数と PASS 数が一致していること

### ステップ5: カバレッジレポートと統合テスト結果を記録する

`outputs/phase-7/coverage-report.md` に以下を記録する:

- 測定日時
- 各ファイルのカバレッジ値（ステップ2のマトリクス）
- 基準達成/未達の判定結果
- 推奨基準（90%）に達していない箇所の記録（未タスク候補として記録する）

`outputs/phase-7/integration-test.md` に以下を記録する:

- 統合テスト実行結果（ステップ3のマトリクス）
- 全テスト実行結果のサマリー（合計テスト数・PASS 数・FAIL 数）
- リグレッションが発生した場合の対応記録

### ステップ6: 最低基準未達の場合 Phase 6 に戻る

最低基準を下回るファイルが存在する場合:

1. 未達ファイルと未達指標を明確にする
2. Phase 6 に戻り、該当ファイルのテストを追加する
3. Phase 6 完了後に Phase 7 を再実行する

未達ファイルの記録フォーマット:

```
未達ファイル: <ファイルパス>
未達指標: Line <値>% (基準 80%)、Branch <値>% (基準 60%)
不足テスト: <追加すべきテスト内容>
```

## 統合テスト連携

- ユニットテスト + 統合テスト両方のカバレッジを確認する
- 統合テスト（`runtimeRouting.integration.test.ts`）が全 PASS であることを確認する
- Phase 4 で設計した E2E シナリオ（subscription handoff フロー、api-key integrated フロー）がテストとして実行されていることを確認する

## 成果物

| 成果物             | パス                                  | 内容                                                           |
| ------------------ | ------------------------------------- | -------------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 各ファイルのカバレッジ値、基準達成判定、推奨基準未達箇所の記録 |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果、全テストサマリー、リグレッション記録       |

## 完了条件

- [ ] 対象7ファイル（RuntimeResolver.ts、skillHandlers.ts、agentHandlers.ts、TerminalHandoffCard/index.tsx、useSkillExecution.ts、useAgent.ts、agentSlice.ts）のカバレッジが測定されている
- [ ] 全対象ファイルで Line Coverage が 80% 以上であることが確認されている
- [ ] 全対象ファイルで Branch Coverage が 60% 以上であることが確認されている
- [ ] 全対象ファイルで Function Coverage が 80% 以上であることが確認されている
- [ ] 最低基準未達がある場合は Phase 6 に戻り、基準達成後に Phase 7 を再実行している
- [ ] 統合テスト（runtimeRouting.integration.test.ts）の全テストが PASS している
- [ ] 全テスト実行（`pnpm test`）でリグレッションがないことが確認されている
- [ ] `outputs/phase-7/coverage-report.md` にカバレッジマトリクスが記録されている
- [ ] `outputs/phase-7/integration-test.md` に統合テスト結果が記録されている
- [ ] 推奨基準（90%）に達していない箇所が未タスク候補として `coverage-report.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
