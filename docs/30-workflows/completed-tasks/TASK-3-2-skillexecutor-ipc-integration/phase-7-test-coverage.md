# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| Phase名    | テストカバレッジ確認                   |
| 前提Phase  | Phase 6（テスト拡充）                  |
| 後続Phase  | Phase 8（リファクタリング）            |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

テストカバレッジ目標を検証し、不足があれば追加テストを作成する。

## 背景

Phase 4〜6で作成したテストのカバレッジを測定し、品質基準を満たしていることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ測定

**目的**: 現在のテストカバレッジを測定する

**実行手順**:

1. カバレッジ付きでテストを実行する

   ```bash
   pnpm --filter @repo/desktop test -- --coverage --grep "skillAPI|useSkillExecution|SkillStreamDisplay"
   ```

2. カバレッジレポートを確認する

   | 対象ファイル           | Line Coverage | Branch Coverage | Function Coverage |
   | ---------------------- | ------------- | --------------- | ----------------- |
   | skill-api.ts           |               |                 |                   |
   | useSkillExecution.ts   |               |                 |                   |
   | SkillStreamDisplay.tsx |               |                 |                   |

3. 結果を記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: カバレッジ目標との比較

**目的**: カバレッジが目標を満たしているか確認する

**実行手順**:

1. カバレッジ目標と比較する

   | 指標              | 目標 | 実績 | 判定 |
   | ----------------- | ---- | ---- | ---- |
   | Line Coverage     | 80%  |      |      |
   | Branch Coverage   | 60%  |      |      |
   | Function Coverage | 80%  |      |      |

2. 不足している場合、対象箇所を特定する

   | ファイル | 未カバー行/分岐 | 追加テスト必要 |
   | -------- | --------------- | -------------- |
   |          |                 |                |

**期待される成果物**:

- `outputs/phase-7/coverage-gap-analysis.md`

---

### タスク3: 不足テストの追加（必要な場合）

**目的**: カバレッジ目標を達成するために必要なテストを追加する

**実行手順**:

1. 未カバー箇所を分析する
   - 条件分岐の未テスト部分
   - エラーパスの未テスト部分
   - 境界条件の未テスト部分

2. 追加テストを作成する

3. 再度カバレッジを測定する

**期待される成果物**:

- 追加テストファイル（必要な場合）
- `outputs/phase-7/coverage-improvement.md`

---

### タスク4: 統合テスト実行確認

**目的**: 全ての統合テストがパスすることを確認する

**実行手順**:

1. 統合テストを実行する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "Skill Stream Integration"
   ```

2. 結果を確認する

   | シナリオID | シナリオ                | 結果 |
   | ---------- | ----------------------- | ---- |
   | IT-001     | スキル実行〜完了        |      |
   | IT-002     | スキル実行中断          |      |
   | IT-003     | エラー発生時            |      |
   | IT-004     | 複数実行                |      |
   | IT-005     | 高速開始/停止サイクル   |      |
   | IT-006     | 異なるskillIdの同時実行 |      |
   | IT-007     | ネットワーク障害復旧    |      |
   | IT-008     | エラー後のリトライ      |      |

**期待される成果物**:

- `outputs/phase-7/integration-test-results.md`

---

### タスク5: 最終カバレッジ確認

**目的**: 全ての目標を達成していることを確認する

**実行手順**:

1. 最終カバレッジを測定する

   ```bash
   pnpm --filter @repo/desktop test -- --coverage
   ```

2. 総合カバレッジ指数を計算する

   総合カバレッジ指数 = Line Coverage + Branch Coverage + Function Coverage

   目標: 180%以上（各指標の合計）

3. 結果を記録する

**期待される成果物**:

- `outputs/phase-7/final-coverage-report.md`

---

## 参照資料

| 参照資料         | パス                                                                        | 内容             |
| ---------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 4〜6テスト | テストファイル                                                              | 作成済みテスト   |
| Phase 5実装      | 実装ファイル                                                                | テスト対象コード |
| 品質基準         | `.claude/skills/task-specification-creator/references/quality-standards.md` | カバレッジ基準   |

---

## 成果物

| 成果物             | パス                                          | 内容           |
| ------------------ | --------------------------------------------- | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`          | 初回測定結果   |
| ギャップ分析       | `outputs/phase-7/coverage-gap-analysis.md`    | 不足分析       |
| カバレッジ改善     | `outputs/phase-7/coverage-improvement.md`     | 追加テスト結果 |
| 統合テスト結果     | `outputs/phase-7/integration-test-results.md` | 統合テスト結果 |
| 最終カバレッジ     | `outputs/phase-7/final-coverage-report.md`    | 最終結果       |

---

## カバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 統合テストカバレッジ

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |

---

## 完了条件

- [ ] カバレッジ測定が完了している
- [ ] Line Coverage 80%以上を達成
- [ ] Branch Coverage 60%以上を達成
- [ ] Function Coverage 80%以上を達成
- [ ] 全ての統合テストがパスしている
- [ ] 総合カバレッジ指数180%以上を達成
- [ ] 全ての成果物が`outputs/phase-7/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-8-refactoring.md`
