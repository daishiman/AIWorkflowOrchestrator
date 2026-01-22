# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 7                              |
| Phase名    | カバレッジ確認                 |
| 前提Phase  | Phase 6                        |
| 後続Phase  | Phase 8                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | skill-execution-implementation |

---

## 目的

テストカバレッジが目標値を満たしているか確認し、不足部分を特定する。

## 背景

Phase 6でテスト拡充を行ったが、実際のカバレッジ達成状況を計測・評価する必要がある。
目標未達の場合はPhase 6に戻り、追加テストを行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測

**目的**: テストカバレッジを計測する

**実行手順**:

1. カバレッジ計測を実行

```bash
pnpm --filter @repo/desktop test -- --coverage
```

2. レポートを確認
3. `outputs/phase-7/coverage-metrics.md` に結果を出力

**期待される成果物**:

- カバレッジメトリクス

---

### タスク2: カバレッジ評価

**目的**: カバレッジが目標値を満たしているか評価する

**実行手順**:

1. 以下の目標値と比較

| 指標              | 最低基準 | 推奨基準 | 実績 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | [ ]  |
| Branch Coverage   | 60%      | 70%      | [ ]  |
| Function Coverage | 80%      | 90%      | [ ]  |

2. `outputs/phase-7/coverage-assessment.md` に評価結果を出力

**期待される成果物**:

- カバレッジ評価結果

---

### タスク3: 未カバー部分の特定

**目的**: カバレッジが不足している部分を特定する

**実行手順**:

1. 以下のファイルの未カバー行を確認

| ファイル                                               | 未カバー行 | 対応方針 |
| ------------------------------------------------------ | ---------- | -------- |
| `apps/desktop/src/renderer/preload/index.ts`           | [ ]        | [ ]      |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | [ ]        | [ ]      |
| `apps/desktop/src/main/services/skill/SkillService.ts` | [ ]        | [ ]      |

2. `outputs/phase-7/uncovered-analysis.md` に分析結果を出力

**期待される成果物**:

- 未カバー部分分析

---

### タスク4: カバレッジ判定

**目的**: カバレッジゲートの判定を行う

**実行手順**:

1. 判定基準に基づき判定

- **PASS**: 全ての指標が最低基準以上 → Phase 8へ進む
- **FAIL**: いずれかの指標が最低基準未満 → Phase 6へ戻る

2. `outputs/phase-7/coverage-gate-decision.md` に判定結果を出力

**期待される成果物**:

- カバレッジゲート判定結果

---

## 参照資料

| 参照資料          | パス                              | 内容                 |
| ----------------- | --------------------------------- | -------------------- |
| Phase 6テスト拡充 | `outputs/phase-6/`                | テスト拡充結果       |
| Vitestカバレッジ  | https://vitest.dev/guide/coverage | カバレッジ計測ガイド |

---

## 成果物

| 成果物               | 配置先                                       | 内容               |
| -------------------- | -------------------------------------------- | ------------------ |
| カバレッジメトリクス | `outputs/phase-7/coverage-metrics.md`        | 計測結果           |
| カバレッジ評価結果   | `outputs/phase-7/coverage-assessment.md`     | 目標値との比較     |
| 未カバー部分分析     | `outputs/phase-7/uncovered-analysis.md`      | 不足部分の特定     |
| カバレッジゲート判定 | `outputs/phase-7/coverage-gate-decision.md`  | PASS/FAIL判定      |
| 統合テスト結果       | `outputs/phase-7/integration-test-result.md` | 統合テスト実行結果 |

---

## 統合テスト連携

| アクション                     | 詳細                                               |
| ------------------------------ | -------------------------------------------------- |
| 統合テストの再実行とゲート判定 | skillAPI → IPC → SkillService の統合テスト結果確認 |

---

## 完了条件

- [ ] カバレッジ計測が完了している
- [ ] Line Coverage が80%以上
- [ ] Branch Coverage が60%以上
- [ ] Function Coverage が80%以上
- [ ] 統合テスト連携アクションが実施されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] outputs/phase-7/ ディレクトリに全成果物を配置

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む
- **ループバック**: カバレッジ未達の場合 → Phase 6へ戻る

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

- タスク1: カバレッジ計測 - [完了/未完了]
- タスク2: カバレッジ評価 - [完了/未完了]
- タスク3: 未カバー部分の特定 - [完了/未完了]
- タスク4: カバレッジ判定 - [完了/未完了]

### カバレッジ結果

- Line Coverage: [ ]%
- Branch Coverage: [ ]%
- Function Coverage: [ ]%
- 判定: [PASS/FAIL]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

- **PASS の場合**: `docs/30-workflows/skill-execution-implementation/phase-8-refactoring.md`
- **FAIL の場合**: `docs/30-workflows/skill-execution-implementation/phase-6-test-expansion.md`
