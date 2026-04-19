# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase      | 10                                                              |
| 機能名     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 9                                                         |
| 後続Phase  | Phase 11                                                        |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

最終ゲートで全体品質・整合性を検証し、出荷可否と是正項目を確定する。
auth:login IPC回帰テストとしての有効性を全Phase横断で確認し、是正不要であれば Phase 11 へ進む。

## 背景

`SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` クリーンアップおよびリファクタリングが完了した後、全Phaseを横断して整合性・矛盾・漏れを最終確認する。セキュリティ観点（auth:login回帰検出）の有効性も併せて判定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと       | 主担当                           |
| ---------- | -------------- | -------------------------------- |
| SubAgent-A | テスト品質責務 | テスト整合性・カバレッジ最終確認 |
| SubAgent-B | コード品質責務 | リファクタ成果・import整理確認   |
| SubAgent-C | 要件追跡責務   | 全Phase要件への追跡確認          |
| SubAgent-D | 統合監査       | 矛盾・漏れ・整合・依存最終判定   |

## 実行タスク

- 最終整合レビュー: 全Phaseの矛盾と漏れを再確認する
- 是正計画確定: 未解決項目の是正順序を確定する
- 出荷判定: 実装移行可否の判定基準を固定する

## ゲート判定基準

| 判定  | 基準                                                        | 対応                       |
| ----- | ----------------------------------------------------------- | -------------------------- |
| PASS  | 全AC達成・describe.skip 0件・全テストPASS・lint/型エラー0件 | Phase 11 へ進む            |
| MINOR | 軽微な修正（コメント・整形のみ）が残存                      | 即日修正後 Phase 11 へ進む |
| MAJOR | テスト失敗・型エラー・auth:loginテスト未有効化              | Phase 5 に差し戻し         |

## 出荷準備チェックリスト

- [ ] 全AC達成: 受け入れ基準（`outputs/phase-1/acceptance-criteria.md`）を全件充足
- [ ] 全Phase成果物: Phase 1〜9 の成果物が全件生成済み
- [ ] describe.skip 0件: `grep -c "describe\.skip"` 結果が 0
- [ ] auth:loginテスト有効化: 1件以上のauth:loginテストが有効
- [ ] 全テストPASS: Vitest 全件 PASS
- [ ] TypeScript 0 error: 型チェック通過
- [ ] ESLint 0 error: lint通過
- [ ] ドキュメント準備: Phase 12 ドキュメント更新の準備完了

## 是正計画テーブル

| 是正ID    | 発見箇所   | 内容       | 優先度 | 担当Phase |
| --------- | ---------- | ---------- | ------ | --------- |
| COR-10-01 | （未発見） | （未記録） | -      | -         |

> 是正項目が発見された場合にこのテーブルを更新する。

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| 設計書                 | `outputs/phase-2/design.md`                       | Phase 2 成果物 |
| テスト仕様書           | `outputs/phase-4/test-specification.md`           | Phase 4 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物 |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物 |
| 品質レポート           | `outputs/phase-9/quality-report.md`               | Phase 9 成果物 |
| リスク台帳             | `outputs/phase-9/risk-register.md`                | Phase 9 成果物 |
| 因果ループ監査         | `outputs/phase-9/causal-loop-check.md`            | Phase 9 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-10/` に定義する。
4. ゲート判定基準に従い PASS / MINOR / MAJOR を判定する。
5. 完了条件で矛盾・漏れ・整合・依存を判定する。

### 具体的なコマンド手順

```bash
# describe.skip 残存の最終確認
grep -rn "describe.skip\|it.skip\|test.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# auth:loginテスト有効数の最終確認
grep -c "auth:login\|auth.*login" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 全テスト実行（最終確認）
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillLifecyclePanel.auth-regression" --run

# 型チェック最終確認
pnpm --filter @repo/desktop typecheck

# Lint最終確認
pnpm --filter @repo/desktop lint
```

## 多角的チェック観点

| 観点     | 確認内容                                                 |
| -------- | -------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                       |
| 漏れ     | 要件から成果物への未反映項目がないか確認する             |
| 整合性   | テストコードとauth:login IPC仕様が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する            |

## 統合テスト連携

| 判定項目                | 基準                     | 結果    |
| ----------------------- | ------------------------ | ------- |
| `describe.skip` 残数    | 0件                      | pending |
| auth:loginテスト有効数  | 1件以上                  | pending |
| 受け入れ基準 全AC       | すべて根拠付きで充足     | pending |
| Phase 11 NON_VISUAL連携 | N/A 根拠と補助成果物あり | pending |

## 成果物

| 成果物           | パス                                              | 説明         |
| ---------------- | ------------------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 最終判定     |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | 是正手順     |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | 移行可否確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `describe.skip` が0件であることを最終確認
- [ ] auth:loginテストが最低1件有効化されていることを最終確認
- [ ] 全テストがPASSであることを最終確認
- [ ] ゲート判定（PASS / MINOR / MAJOR）が記録されていることを確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次のPhase

Phase 11: 手動テスト検証
