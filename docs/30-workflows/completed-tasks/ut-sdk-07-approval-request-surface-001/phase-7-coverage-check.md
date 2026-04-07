# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 7                                           |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 6                                     |
| 後続Phase  | Phase 8                                     |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

変更したファイルのカバレッジを計測し、`onApprovalRequest` 実装と approval UI の関連コードが適切にテストされていることを確認する。

## カバレッジ対象範囲（変更ブロック限定）

| 対象ファイル                                                         | 対象関数/ブロック                             | 目標 line | 目標 branch |
| -------------------------------------------------------------------- | --------------------------------------------- | --------- | ----------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | `onApprovalRequest` 実装                      | 100%      | 100%        |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | approval request / ApprovalSheet 関連ブロック | 90%以上   | 80%以上     |

**対象外（変更なし）:**

- `apps/desktop/src/preload/channels.ts`
- `packages/shared/src/ipc/channels.ts`
- `apps/desktop/src/main/ipc/approvalHandlers.ts`

## 実行タスク

- カバレッジ計測: 対象ファイルの line / branch カバレッジを計測する
- 未到達分析: カバレッジが目標未達のブロックを特定し、原因を分析する
- トレーサビリティ確認: TC-APPR-01〜18 と実装ブロックの対応を確認する

## コマンド

```bash
# 対象ファイル限定でカバレッジを計測
pnpm --filter @repo/desktop vitest run --coverage \
  --coverage.include="apps/desktop/src/preload/skill-creator-api.ts" \
  --coverage.include="apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx"
```

## 参照資料

| 参照資料         | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | Phase 6 成果物 |

## 実行手順

1. Phase 6 成果物を確認する。
2. カバレッジコマンドを実行する。
3. `onApprovalRequest` 実装ブロックの line 100% / branch 100% を確認する。
4. `SkillLifecyclePanel.tsx` の approval 関連ブロックのカバレッジ実測値を記録する。
5. 未到達ブロックがある場合は原因を分析する。
6. 成果物を記録する。

## 成果物

| 成果物                 | パス                                              | 説明                     |
| ---------------------- | ------------------------------------------------- | ------------------------ |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 目標・対象範囲・コマンド |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達ブロック分析       |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | TC vs 実装対応表         |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `onApprovalRequest` 実装ブロックの line 100% / branch 100% を確認
- [ ] `SkillLifecyclePanel.tsx` approval 関連ブロックの実測値を記録
- [ ] カバレッジ目標未達の場合は原因と対策を記載
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 次のPhase

Phase 8: リファクタリング
