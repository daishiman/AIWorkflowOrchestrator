# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| Phase名    | カバレッジ確認                                |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 機能名     | runtime-policy-resolver-4state                |
| 作成日     | 2026-03-21                                    |
| 前提Phase  | Phase 6（テスト拡充）                         |
| 後続Phase  | Phase 8（リファクタリング）                   |
| ステータス | completed                                     |

## 目的

RuntimePolicyResolver 関連のテストカバレッジが基準を満たしているか確認する。

## 実行タスク

- 計測実行: direct caller suite の coverage を取得する
- 基準判定: line / branch / function の基準を確認する
- 差分対処: 未達箇所を Phase 6 へ戻して埋める

## 参照資料

- Phase 5 実装: `docs/30-workflows/runtime-policy-resolver-4state/phase-5-implementation.md`
- Phase 6 テスト拡充: `docs/30-workflows/runtime-policy-resolver-4state/phase-6-test-expansion.md`
- カバレッジ基準: `.claude/rules/02-code-quality.md`

## 実行手順

### ステップ1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts
```

### ステップ2: 基準判定

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### ステップ3: 未達の場合

- Phase 6 に戻り、不足箇所のテストを追加する
- 未達箇所を特定し、テストケースを設計する

## 成果物

- カバレッジレポート（`apps/desktop/coverage/` 配下に出力）

## 統合テスト連携

- direct caller scope: `RuntimePolicyResolver.test.ts` と `RuntimeSkillCreatorFacade.test.ts` を coverage 計測対象にする
- shared contract trace: capability 語彙の分岐漏れが出た場合は shared contract test と照合する
- return gate: 未達時は Phase 6 へ戻し、broader parent task へ責務を逃がさない

## 完了条件

- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] 未達の場合は Phase 6 に戻って対処済みである

## 次 Phase

Phase 8（リファクタリング）へ進む。
