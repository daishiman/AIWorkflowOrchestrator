# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | カバレッジ確認                  |
| 前提Phase  | Phase 6（テスト拡充）           |
| 後続Phase  | Phase 8（リファクタリング）     |
| ステータス | pending                         |
| 作成日     | 2026-02-28                      |
| 機能名     | TASK-9D: スキルチェーン機能実装 |

---

## 目的

テストカバレッジが品質基準を達成していることを検証し、カバレッジレポートを生成する。全テスト（ユニット・統合・セキュリティ）を実行し、目標未達の場合は Phase 6 に戻りテストを追加する。

## 背景

品質基準として以下のカバレッジ目標を設定している：

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジレポート生成

**目的**: 全テストファイルを対象に詳細なカバレッジレポートを生成する

**実行手順**:

1. カバレッジ付きで全テストを実行する：

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/SkillChainExecutor.test.ts \
  src/main/services/skill/SkillChainStore.test.ts \
  src/main/ipc/skillHandlers.chain.test.ts \
  src/main/ipc/skillHandlers.chain.integration.test.ts
```

2. 各対象ファイルのカバレッジ指標を記録する：

| 対象ファイル              | Line    | Branch  | Function | 最低基準達成 | 推奨基準達成 |
| ------------------------- | ------- | ------- | -------- | ------------ | ------------ |
| SkillChainExecutor.ts     | \_\_\_% | \_\_\_% | \_\_\_%  | □            | □            |
| SkillChainStore.ts        | \_\_\_% | \_\_\_% | \_\_\_%  | □            | □            |
| skillHandlers.ts（chain） | \_\_\_% | \_\_\_% | \_\_\_%  | □            | □            |
| **総合**                  | \_\_\_% | \_\_\_% | \_\_\_%  | □            | □            |

3. `outputs/phase-7/coverage-report.md` にレポートを記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: 未カバー箇所の分析

**目的**: カバーされていない箇所を分析し、テスト追加の要否を判断する

**実行手順**:

1. カバレッジレポートの詳細（行単位）を確認する

2. 未カバーの行・分岐を特定し、以下の分類で分析する：

| 分類                   | 対応                         | 例                             |
| ---------------------- | ---------------------------- | ------------------------------ |
| テスト追加必要         | Phase 6 に戻りテスト追加     | 未テストの errorHandling 分岐  |
| 到達不能コード         | コード削除を検討（Phase 8）  | 理論上到達しない else 分岐     |
| 許容範囲（防御コード） | 記録のみ                     | catch ブロック内のログ出力     |
| P41 影響               | インライン関数テスト追加可能 | validateIpcSender コールバック |

3. 分析結果を `outputs/phase-7/uncovered-analysis.md` に記録する

**期待される成果物**:

- `outputs/phase-7/uncovered-analysis.md`

---

### タスク3: 統合テスト全実行

**目的**: 全統合テストが成功することを確認する

**実行手順**:

1. 統合テストを実行する：

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.chain.integration.test.ts
```

2. 以下の統合テストシナリオが全て PASS していることを確認する：

| シナリオ               | ステータス |
| ---------------------- | ---------- |
| save → get             | □          |
| save → list            | □          |
| save → delete → get    | □          |
| save → delete → list   | □          |
| save → execute         | □          |
| execute with variables | □          |
| Date シリアライズ検証  | □          |

3. `outputs/phase-7/integration-test.md` に実行結果を記録する

**期待される成果物**:

- `outputs/phase-7/integration-test.md`

---

### タスク4: テスト品質確認

**目的**: テストの品質を確認する

**実行手順**:

1. 以下のテスト品質基準を確認する：

| 基準                         | 確認項目                                                                       | 結果 |
| ---------------------------- | ------------------------------------------------------------------------------ | ---- |
| テストの独立性（P9）         | 各テストが他のテストに依存しておらず、beforeEach でリセットされている          | □    |
| テストの明確性               | テスト名から何をテストしているか一目で分かる                                   | □    |
| アサーションの適切性         | expect の引数が適切で、テスト対象の振る舞いを正確に検証している                | □    |
| テストの実行速度             | 各テストが5秒以内に完了する                                                    | □    |
| happy-dom 互換性（P39）      | userEvent を使用していない（fireEvent のみ）                                   | □    |
| P42 バリデーションテスト     | 全文字列引数に3段バリデーション失敗テストがある                                | □    |
| P41 インライン関数カバレッジ | validateIpcSender コールバックのテストがある                                   | □    |
| モック管理                   | vi.mock / vi.fn を `beforeEach`/`afterEach` でリセットし、テスト間リークがない | □    |

2. `outputs/phase-7/test-quality.md` に確認結果を記録する

**期待される成果物**:

- `outputs/phase-7/test-quality.md`

---

### タスク5: ゲート判定

**目的**: カバレッジ目標の達成を判定し、次のアクションを決定する

**実行手順**:

1. タスク1 の結果に基づきゲート判定を行う：

| 判定  | 条件                                                        | 次のアクション           |
| ----- | ----------------------------------------------------------- | ------------------------ |
| PASS  | 全3指標が最低基準（Line 80%、Branch 60%、Function 80%）以上 | Phase 8 へ進む           |
| MINOR | 1指標のみ最低基準未達（5%以内の差）                         | 記録し Phase 8 へ        |
| MAJOR | 複数指標が最低基準未達、または1指標が10%以上未達            | Phase 6 へ戻りテスト追加 |

2. 判定結果を記録する：

| 指標              | 最低基準 | 実績    | 差分    | 判定   |
| ----------------- | -------- | ------- | ------- | ------ |
| Line Coverage     | 80%      | \_\_\_% | \_\_\_% |        |
| Branch Coverage   | 60%      | \_\_\_% | \_\_\_% |        |
| Function Coverage | 80%      | \_\_\_% | \_\_\_% |        |
| **総合判定**      |          |         |         | \_\_\_ |

3. `outputs/phase-7/coverage-decision.md` に判定結果を記録する

**期待される成果物**:

- `outputs/phase-7/coverage-decision.md`

---

## 参照資料

| 参照資料       | パス                                                                   | 内容               |
| -------------- | ---------------------------------------------------------------------- | ------------------ |
| Phase 6 テスト | `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts`      | Executor テスト    |
| Phase 6 テスト | `apps/desktop/src/main/services/skill/SkillChainStore.test.ts`         | Store テスト       |
| Phase 6 テスト | `apps/desktop/src/main/ipc/skillHandlers.chain.test.ts`                | IPC ハンドラテスト |
| Phase 6 テスト | `apps/desktop/src/main/ipc/skillHandlers.chain.integration.test.ts`    | 統合テスト         |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`           | Executor 実装      |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillChainStore.ts`              | Store 実装         |
| Phase 5 実装   | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | IPC ハンドラ       |
| 品質基準       | `.claude/rules/02-code-quality.md`                                     | カバレッジ基準定義 |
| 教訓集         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | P39/P41 テスト注意 |

---

## 成果物

| 成果物             | パス                                    | 内容             |
| ------------------ | --------------------------------------- | ---------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`    | カバレッジ詳細   |
| 未カバー分析       | `outputs/phase-7/uncovered-analysis.md` | 未カバー箇所分析 |
| 統合テスト結果     | `outputs/phase-7/integration-test.md`   | 統合テスト確認   |
| テスト品質         | `outputs/phase-7/test-quality.md`       | 品質確認結果     |
| カバレッジ判定     | `outputs/phase-7/coverage-decision.md`  | ゲート判定結果   |

---

## 統合テスト連携

**Phase 7 では統合テストの最終確認として**:

- 全統合テストシナリオ（CRUD フロー、実行フロー、Date シリアライズ）が PASS していることを確認
- 統合テストのカバレッジも総合カバレッジに含める
- 将来の UI テスト（Phase 11）で使用可能な統合テストパターンを確認

---

## 多角的チェック観点

### カバレッジ品質

| 観点                       | 確認内容                                                                         | 結果 |
| -------------------------- | -------------------------------------------------------------------------------- | ---- |
| Line Coverage 最低基準     | 全対象ファイルで 80% 以上                                                        | □    |
| Branch Coverage 最低基準   | 全対象ファイルで 60% 以上                                                        | □    |
| Function Coverage 最低基準 | 全対象ファイルで 80% 以上                                                        | □    |
| P41 インライン関数         | v8 カバレッジのインライン関数カウントが Function Coverage に影響していないか確認 | □    |
| 到達不能コード             | 未カバー箇所が到達不能コードでないか確認                                         | □    |
| テスト独立性（P9）         | テスト実行順序を変えても全テストが PASS する                                     | □    |

### ゲート判定品質

| 観点         | 確認内容                                                          | 結果 |
| ------------ | ----------------------------------------------------------------- | ---- |
| 判定の正確性 | 全指標の実績値がカバレッジレポートと一致する                      | □    |
| 判定の根拠   | PASS/MINOR/MAJOR の判定根拠が明確に記録されている                 | □    |
| MINOR の追跡 | MINOR 判定の場合、Phase 12 の未タスクに5%以内の改善を記録している | □    |

---

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] Line Coverage が 80% 以上達成している
- [ ] Branch Coverage が 60% 以上達成している
- [ ] Function Coverage が 80% 以上達成している
- [ ] 未カバー箇所が分析され、分類されている
- [ ] 統合テストが全て PASS している
- [ ] テスト品質が確認されている（P9/P39/P41/P42 対策済み）
- [ ] ゲート判定が PASS または MINOR である
- [ ] MINOR 判定の場合、改善点がサブタスクに記録されている

---

## サブタスク管理

Phase 7 の進行中に検出したサブタスクは以下に記録し、Phase 12 の未タスク検出で処理する：

| #   | サブタスク | 対応Phase | ステータス |
| --- | ---------- | --------- | ---------- |
|     |            |           |            |

---

## タスク100%実行確認

| タスク | 内容                   | 完了 |
| ------ | ---------------------- | ---- |
| 1      | カバレッジレポート生成 | □    |
| 2      | 未カバー箇所分析       | □    |
| 3      | 統合テスト全実行       | □    |
| 4      | テスト品質確認         | □    |
| 5      | ゲート判定             | □    |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] ゲート判定の結果が明確に記録されている

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む（PASS/MINOR の場合）
- **戻り先**: Phase 6（MAJOR の場合）

---

## 次のPhase

判定が PASS または MINOR の場合、以下のファイルを実行してください:

`docs/30-workflows/TASK-9D-skill-chain/phase-8-refactoring.md`

判定が MAJOR の場合、Phase 6 に戻りテストを追加してください:

`docs/30-workflows/TASK-9D-skill-chain/phase-6-test-expansion.md`
