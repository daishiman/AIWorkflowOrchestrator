# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 7                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

新規追加した `healthPolicy` DI パスのカバレッジを計測し、
Line 80%以上・Branch 60%以上の目標を達成していることを確認する。
未達の場合は Phase 6 に戻り、テストを補完する。

---

## 実行タスク

- **タスク1**: カバレッジ計測コマンドの実行
- **タスク2**: `RuntimeSkillCreatorFacade.ts` の新規追加コードのカバレッジ確認
- **タスク3**: 未カバーブランチの特定（`healthPolicy` undefined 分岐など）
- **タスク4**: 目標達成判定とゲート判断

---

## 参照資料

| 資料名                         | パス                                                                         | 説明                |
| ------------------------------ | ---------------------------------------------------------------------------- | ------------------- |
| Phase 6 テスト拡充結果         | `outputs/phase-6/test-expansion-result.md`                                   | 全テスト GREEN 確認 |
| RuntimeSkillCreatorFacade 実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | カバレッジ計測対象  |
| カバレッジ基準                 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 目標値の根拠        |

---

## 実行手順

### ステップ1: カバレッジ計測

```bash
# RuntimeSkillCreatorFacade のカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts \
  --coverage \
  --coverage.include="src/main/services/runtime/RuntimeSkillCreatorFacade.ts"
```

### ステップ2: カバレッジ目標の確認

| 指標              | 最低基準 | 推奨基準 | 計測結果 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | TBD      |
| Branch Coverage   | 60%      | 70%      | TBD      |
| Function Coverage | 80%      | 90%      | TBD      |

**重点確認ブランチ**:

| ブランチ                                  | 対応テスト | カバー済み |
| ----------------------------------------- | ---------- | ---------- |
| `deps.healthPolicy` が `undefined` の場合 | TC-H-02    | TBD        |
| `deps.healthPolicy` が存在する場合        | TC-H-01    | TBD        |
| `isDegraded: true` の場合                 | TC-H-03    | TBD        |
| `isDegraded: false` の場合                | TC-H-04    | TBD        |

### ステップ3: 未達の場合の対応

**カバレッジ未達のブランチ例と対策**:

| 未達ブランチ                 | 追加するテスト                               | 追加先     |
| ---------------------------- | -------------------------------------------- | ---------- |
| `healthPolicy` null 判定     | `should handle null healthPolicy gracefully` | `.test.ts` |
| `resolveHealthPolicy` エラー | エラーパスのテスト（必要な場合）             | `.test.ts` |

**カバレッジ未達時の処置**:

1. Phase 6 に戻り、未カバーブランチをカバーするテストを追加する
2. 追加後に再度カバレッジを計測する
3. 最大2回の反復で目標達成を目指す

### ステップ4: ゲート判定

| 状態                   | 判定 | 次のアクション               |
| ---------------------- | ---- | ---------------------------- |
| 全指標が最低基準以上   | PASS | Phase 8 へ進む               |
| いずれかが最低基準未満 | FAIL | Phase 6 に戻り、テストを補完 |

---

## 統合テスト連携

- 統合テストの再実行とカバレッジゲート判定
- `RuntimeSkillCreatorFacade` の `healthPolicy` DI パスが全て計測対象

---

## サブタスク管理

| ID     | タスク名               | ステータス |
| ------ | ---------------------- | ---------- |
| T-07-1 | カバレッジ計測実行     | 未実施     |
| T-07-2 | 計測結果の分析         | 未実施     |
| T-07-3 | 未カバーブランチの特定 | 未実施     |
| T-07-4 | ゲート判定             | 未実施     |

---

## 成果物

| 成果物             | 配置先                               | 形式     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Markdown |

---

## 完了条件

- [ ] カバレッジ計測を実行済みであること
- [ ] Line Coverage が 80% 以上であること
- [ ] Branch Coverage が 60% 以上であること
- [ ] Function Coverage が 80% 以上であること
- [ ] 計測結果が `outputs/phase-7/coverage-report.md` に記録されていること
- [ ] ゲート判定（PASS/FAIL）が確定していること

---

## タスク100%実行確認【必須】

- [ ] T-07-1: カバレッジ計測を実行済み
- [ ] T-07-2: 計測結果を分析し `outputs/phase-7/coverage-report.md` に記録済み
- [ ] T-07-3: 未カバーブランチを特定済み（なし or 一覧記録）
- [ ] T-07-4: ゲート判定を記録済み（PASS → Phase 8 へ）

---

## 次Phase

**Phase 8: リファクタリング** — コードの命名・責務整理・不要コード除去を行う。

**Phase 8 開始条件**: カバレッジゲートが PASS であること。
**未達時**: Phase 6 に戻り、テストを補完してから再度 Phase 7 を実行する。
