# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | カバレッジ確認                  |
| 前提Phase  | Phase 6                         |
| 後続Phase  | Phase 8                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

テストカバレッジが目標値を達成しているか確認する。未達の場合はPhase 6へ戻りテストを追加する。

## 背景

Phase 6でテストを拡充した。カバレッジ目標（Line 80%、Branch 60%、Function 80%）の達成を確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ測定

**目的**: 現在のテストカバレッジを測定する

**実行手順**:

1. カバレッジ付きテスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage --run
   ```

2. 対象ファイルのカバレッジ確認:
   - `apps/desktop/src/preload/skill-api.ts`
   - `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

3. カバレッジレポート出力:
   ```bash
   # HTML形式でカバレッジレポート生成
   pnpm --filter @repo/desktop test -- --coverage --reporter=html --run
   ```

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`: カバレッジ測定結果

---

### タスク2: カバレッジ目標判定

**目的**: カバレッジが目標値を達成しているか判定する

**実行手順**:

1. ユニットテストカバレッジ確認:

   | 指標              | 最低基準 | 推奨基準 | 実測値 | 判定 |
   | ----------------- | -------- | -------- | ------ | ---- |
   | Line Coverage     | 80%      | 90%      | ?      | ?    |
   | Branch Coverage   | 60%      | 70%      | ?      | ?    |
   | Function Coverage | 80%      | 90%      | ?      | ?    |

2. 判定:
   - 全項目が最低基準を満たす → PASS
   - いずれかが最低基準未満 → Phase 6へ戻る

**期待される成果物**:

- `outputs/phase-7/coverage-judgment.md`: カバレッジ判定結果

---

### タスク3: 未カバー箇所の特定（未達の場合）

**目的**: カバレッジが不足している箇所を特定する

**実行手順**:

1. カバレッジレポートで未カバー行を確認
2. 未カバーのブランチを特定
3. 追加が必要なテストケースをリストアップ

**期待される成果物**:

- `outputs/phase-7/uncovered-areas.md`: 未カバー箇所リスト（該当する場合）

---

### タスク4: 統合テスト再実行

**目的**: 統合テストが全てPASSすることを確認する

**実行手順**:

1. 統合テスト実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run
   ```

2. 全テストPASSを確認

**期待される成果物**:

- `outputs/phase-7/integration-test-result.md`: 統合テスト結果

---

## 参照資料

| 参照資料      | パス                                                                        | 内容           |
| ------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 6テスト | `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts`           | 拡充テスト     |
| 品質基準      | `.claude/skills/task-specification-creator/references/quality-standards.md` | カバレッジ基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容       |
| -------- | --------------------------------------------------------------------------- | ---------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト基準 |

---

## 成果物

| 成果物             | パス                                         | 内容           |
| ------------------ | -------------------------------------------- | -------------- |
| カバレッジ測定結果 | `outputs/phase-7/coverage-report.md`         | カバレッジ数値 |
| カバレッジ判定結果 | `outputs/phase-7/coverage-judgment.md`       | PASS/未達判定  |
| 未カバー箇所リスト | `outputs/phase-7/uncovered-areas.md`         | 未達の場合のみ |
| 統合テスト結果     | `outputs/phase-7/integration-test-result.md` | テスト実行結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 7での統合テスト連携アクション:**

- 統合テストの再実行とゲート判定を行う
- カバレッジ未達の場合はPhase 6へ戻りテストを追加する

---

## 完了条件

- [ ] カバレッジが測定されている
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] 全統合テストがPASSしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## ゲート判定

| 判定 | 条件                           | 次のアクション |
| ---- | ------------------------------ | -------------- |
| PASS | 全カバレッジ目標達成           | Phase 8へ進行  |
| 未達 | いずれかのカバレッジが目標未満 | Phase 6へ戻る  |

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-8-refactoring.md`
