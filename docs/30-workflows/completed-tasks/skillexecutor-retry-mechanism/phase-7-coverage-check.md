# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 7                             |
| Phase名   | テストカバレッジ確認          |
| カテゴリ  | 品質                          |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 6（テスト拡充）         |
| 後続Phase | Phase 8（リファクタリング）   |

## 目的

リトライ機構のテストカバレッジを計測し、基準を満たしているかを確認する。未達の場合はPhase 6に戻り追加テストを作成する。

---

## 実行タスク

### Task 1: カバレッジ計測

**目的**: リトライ関連コードのテストカバレッジを計測する。

**手順**:

1. カバレッジ付きでテストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
   ```
2. SkillExecutor.tsのリトライ関連関数のカバレッジを確認する:
   - isRetryableError()
   - calculateBackoffDelay()
   - executeWithRetry()
   - sleep()
3. packages/shared/src/types/skill.tsの新規型のexportカバレッジを確認する

**期待される成果物**:

- カバレッジレポート（`outputs/phase-7/coverage-report.md`）

### Task 2: カバレッジ基準判定

**目的**: カバレッジが基準を満たしているかを判定する。

**手順**:

1. ユニットテストカバレッジ基準と照合する:
   | メトリクス | 最低基準 | 推奨基準 | 計測値 | 判定 |
   | ---------- | -------- | -------- | ------ | ---- |
   | Line | 80% | 90% | | |
   | Branch | 60% | 70% | | |
   | Function | 80% | 90% | | |
2. 統合テストカバレッジ基準と照合する:
   | メトリクス | 基準 | 計測値 | 判定 |
   | ---------- | ---- | ------ | ---- |
   | リトライ対象エラーシナリオ | 100% | | |
   | 正常系シナリオ（リトライ→成功） | 100% | | |
   | 異常系シナリオ（リトライ上限→エラー） | 80%+ | | |
   | abort連携シナリオ | 100% | | |
3. 最低基準未達の場合 → Phase 6に戻り追加テスト作成
4. 最低基準達成・推奨基準未達の場合 → 不足分析を記録してPhase 8へ進む
5. 推奨基準達成の場合 → Phase 8へ進む

**期待される成果物**:

- カバレッジ判定結果（`outputs/phase-7/coverage-judgment.md`）

### Task 3: 未カバー部分の分析

**目的**: カバレッジが不足している部分を特定し、対応方針を決定する。

**手順**:

1. 未カバー行・ブランチを一覧化する
2. 各未カバー部分について:
   - テスト追加が必要 → Phase 6に戻る場合に追加すべきテストケースを記録
   - テスト不要（デッドコード等） → リファクタリング対象としてPhase 8に引き継ぐ
3. 分析結果を記録する

**期待される成果物**:

- 未カバー分析レポート（`outputs/phase-7/uncovered-analysis.md`）

---

## 参照資料

| 参照資料       | パス                                                                         | 用途       |
| -------------- | ---------------------------------------------------------------------------- | ---------- |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 基準参照   |
| Phase 6テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | テスト参照 |

---

## 統合テスト連携

リトライロジック単体 + SkillExecutor統合のカバレッジを計測:

- リトライ単体のLine/Branch/Functionカバレッジ
- SkillExecutor全体のカバレッジが低下していないことを確認

---

## 成果物

| 成果物               | パス                                    | 種別     |
| -------------------- | --------------------------------------- | -------- |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`    | document |
| カバレッジ判定結果   | `outputs/phase-7/coverage-judgment.md`  | document |
| 未カバー分析レポート | `outputs/phase-7/uncovered-analysis.md` | document |

---

## 完了条件

- [ ] ユニットテストカバレッジが計測されている
- [ ] Line カバレッジ 80%以上（推奨90%以上）
- [ ] Branch カバレッジ 60%以上（推奨70%以上）
- [ ] Function カバレッジ 80%以上（推奨90%以上）
- [ ] 統合テストカバレッジが計測されている
- [ ] リトライ対象エラーシナリオ 100%カバー
- [ ] 正常系シナリオ（リトライ→成功） 100%カバー
- [ ] 異常系シナリオ（リトライ上限→エラー） 80%以上カバー
- [ ] 未カバー部分が分析され、対応方針が決定されている
- [ ] SkillExecutor全体のカバレッジが低下していないことを確認
- [ ] 本Phase内の全タスク（Task 1-3）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 7 \
  --artifacts "outputs/phase-7/coverage-report.md:カバレッジレポート"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 7
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)（カバレッジ基準達成時）
→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)（カバレッジ基準未達時）
