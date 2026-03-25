# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| Phase名    | カバレッジ確認                                |
| 前提Phase  | Phase 6                                       |
| 後続Phase  | Phase 8                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 4〜6 で作成・拡充したテスト群が、対象ファイルのカバレッジゲート（Line 80%+, Branch 60%+, Function 80%+）を満たしていることを確認する。未達の場合は Phase 6 に戻り追加テストを実施する。

## 背景

TASK-SC-07 で変更した3ファイル（`SkillCreateWizard.tsx`, `GenerateStep.tsx`, `DescribeStep.tsx`）は LLM 生成フローという新規ブランチが追加された。Branch Coverage が重要な指標であり、特に `generationMode === "llm"` / `"template"` の分岐、エラーパス、finally ブロックが適切にカバーされている必要がある。

---

## カバレッジゲート

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 実行タスク

### タスク1: カバレッジ計測コマンドの実行

**目的**: 対象3ファイルのカバレッジを計測する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop vitest run --coverage -- \
  SkillCreateWizard \
  GenerateStep \
  DescribeStep
```

2. カバレッジレポートの出力形式（テキスト + HTML）を確認する

**補足コマンド（ファイル単位での確認）**:

```bash
# SkillCreateWizard のみ詳細確認
pnpm --filter @repo/desktop vitest run --coverage -- SkillCreateWizard

# HTML レポートを開く（macOS）
open apps/desktop/coverage/index.html
```

3. 計測結果を `outputs/phase-7/coverage-raw.md` に記録する

**期待される成果物**:

- `outputs/phase-7/coverage-raw.md`（計測結果の生ログ）

---

### タスク2: カバレッジゲート判定

**目的**: 各ファイルがゲートを満たしているか判定する

**実行手順**:

1. 以下の判定テーブルを埋める

| ファイル                | Line% | Branch% | Function% | Line PASS | Branch PASS | Function PASS |
| ----------------------- | ----- | ------- | --------- | --------- | ----------- | ------------- |
| `SkillCreateWizard.tsx` | -     | -       | -         | -         | -           | -             |
| `GenerateStep.tsx`      | -     | -       | -         | -         | -           | -             |
| `DescribeStep.tsx`      | -     | -       | -         | -         | -           | -             |

2. 全ファイルで以下を確認する:
   - Line Coverage >= 80% → PASS
   - Branch Coverage >= 60% → PASS
   - Function Coverage >= 80% → PASS

3. 判定結果を `outputs/phase-7/coverage-gate-judgment.md` に記録する

**期待される成果物**:

- `outputs/phase-7/coverage-gate-judgment.md`（判定テーブル・PASS/FAIL 結果）

---

### タスク3: 未達ブランチの特定

**目的**: Branch Coverage が 60% 未満の場合、未カバーのブランチを特定する

**実行手順**:

1. HTML レポートを確認し、未カバー行（赤ハイライト）を特定する
2. 以下の観点で未カバーブランチを分類する

| 分類             | 未カバーブランチの例                                            |
| ---------------- | --------------------------------------------------------------- |
| LLM フロー分岐   | `generationMode === "llm"` のブランチで一方がカバーされていない |
| エラーパス       | `result.success === false` のブランチがカバーされていない       |
| finally ブロック | `setIsGenerating(false)` の finally が常に実行されるか確認      |
| API 未定義       | `api.planSkill === undefined` のフォールバックブランチ          |
| PlanResult 分岐  | `planResult.type === "terminal_handoff"` のブランチ             |

3. 未カバーブランチがある場合は Phase 6 に戻るトリガーを記録する
4. 結果を `outputs/phase-7/uncovered-branches.md` に記録する

**期待される成果物**:

- `outputs/phase-7/uncovered-branches.md`（未カバーブランチ一覧または「なし」）

---

### タスク4: ゲート判定・分岐処理

**目的**: カバレッジ結果に応じて次の処理を決定する

**実行手順**:

1. 以下の判定フローに従う

```
全ファイル × 全指標が PASS
  └─ YES → タスク5（最終確認・成果物記録）へ
  └─ NO  → 未達ファイル・指標を記録
              └─ Branch Coverage のみ未達 → タスク3 で特定したブランチに対して Phase 6 に追加テストを依頼
              └─ Line/Function Coverage 未達 → 未テストの関数・行を確認し Phase 6 に追加テストを依頼
```

2. 未達の場合は以下の内容を記録して Phase 6 への差し戻しレポートを作成する

```markdown
## Phase 7 → Phase 6 差し戻しレポート

### 未達ファイル

- `SkillCreateWizard.tsx`: Branch Coverage XX%（目標 60%）

### 追加すべきテストケース

- [ ] `planResult.type === "terminal_handoff"` のブランチ（GenerateStep）
- [ ] executePlan の finally ブロック（SkillCreateWizard）
```

3. 結果を `outputs/phase-7/gate-decision.md` に記録する

**期待される成果物**:

- `outputs/phase-7/gate-decision.md`（PASS / Phase 6 差し戻し判定）

---

### タスク5: 最終カバレッジ確認・成果物記録

**目的**: 全ゲートが PASS した状態でカバレッジを最終記録する

**前提**: タスク2〜4 で全ファイル × 全指標が PASS であること

**実行手順**:

1. 最終カバレッジ計測を実行し、結果をスナップショットとして保存する

```bash
pnpm --filter @repo/desktop vitest run --coverage --reporter=json -- \
  SkillCreateWizard \
  GenerateStep \
  DescribeStep
```

2. 以下のサマリーを `outputs/phase-7/coverage-final-summary.md` に記録する

```markdown
## カバレッジ最終サマリー

| ファイル                | Line% | Branch% | Function% | 判定 |
| ----------------------- | ----- | ------- | --------- | ---- |
| `SkillCreateWizard.tsx` | XX%   | XX%     | XX%       | PASS |
| `GenerateStep.tsx`      | XX%   | XX%     | XX%       | PASS |
| `DescribeStep.tsx`      | XX%   | XX%     | XX%       | PASS |

**結論**: 全ゲート PASS → Phase 8（リファクタリング）へ進む
```

3. テスト総数・成功数・失敗数を記録する

**期待される成果物**:

- `outputs/phase-7/coverage-final-summary.md`（最終サマリー）

---

### タスク6: index.md ステータス更新

**目的**: タスク仕様書の Phase 7 ステータスを「完了」に更新する

**実行手順**:

1. `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md` の Phase 一覧テーブルを更新する
2. Phase 7 の「ステータス」列を「完了」に変更する

**期待される成果物**:

- `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md`（更新済み）

---

## 参照資料

| 参照資料                   | パス                                                                                             | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| Phase 6 拡充テスト実行結果 | `outputs/phase-6/expansion-test-results.md`                                                      | 拡充後テスト全 PASS の確認結果 |
| SkillCreateWizard テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | カバレッジ計測対象テスト       |
| SkillCreateWizard 実装     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | カバレッジ計測対象実装         |
| GenerateStep 実装          | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                             | カバレッジ計測対象実装         |
| DescribeStep 実装          | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                             | カバレッジ計測対象実装         |
| Phase 6 仕様書             | `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-6-test-expansion.md`      | 差し戻し先                     |
| index.md（タスク全体）     | `docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/index.md`                       | Phase 一覧・ステータス管理     |

---

## 成果物

| 成果物                 | パス                                        | 内容                             |
| ---------------------- | ------------------------------------------- | -------------------------------- |
| カバレッジ生ログ       | `outputs/phase-7/coverage-raw.md`           | vitest coverage の生出力         |
| ゲート判定テーブル     | `outputs/phase-7/coverage-gate-judgment.md` | ファイル別 PASS/FAIL 判定        |
| 未カバーブランチ一覧   | `outputs/phase-7/uncovered-branches.md`     | 未達の場合のブランチ特定結果     |
| 分岐判定結果           | `outputs/phase-7/gate-decision.md`          | PASS または Phase 6 差し戻し判定 |
| カバレッジ最終サマリー | `outputs/phase-7/coverage-final-summary.md` | 全 PASS 時の最終数値記録         |

---

## 統合テスト連携

- カバレッジは `vitest --coverage` を使用し、`c8` または `istanbul` プロバイダで計測する
- `apps/desktop/vitest.config.ts` のカバレッジ設定（`include` / `exclude` パターン）を事前に確認し、計測対象ファイルが正しく含まれていることを確認する
- Branch Coverage の未達は主に以下のパターンで発生する:
  - 三項演算子の一方のみカバー（`planResult ? ... : ...`）
  - Optional chaining の undefined ケース（`api.planSkill?.()` など）
  - エラーパスの `else` ブランチ

---

## 完了条件

- [ ] カバレッジ計測コマンドが正常実行されている
- [ ] `SkillCreateWizard.tsx`: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] `GenerateStep.tsx`: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] `DescribeStep.tsx`: Line >= 80%, Branch >= 60%, Function >= 80%
- [ ] 全ゲート PASS の場合: `coverage-final-summary.md` が作成されている
- [ ] 未達の場合: `gate-decision.md` に差し戻しレポートが記録されている
- [ ] 全成果物が `outputs/phase-7/` に生成されている

---

## レビューゲート

### カバレッジ結果判定

| 判定    | 条件                            | 次のアクション                                  |
| ------- | ------------------------------- | ----------------------------------------------- |
| PASS    | 全ファイル × 全指標がゲート達成 | Phase 8（リファクタリング）へ進む               |
| PARTIAL | 一部ファイルが未達              | 未達ファイルの未カバーブランチを Phase 6 で補完 |
| FAIL    | 複数ファイルが大幅に未達        | Phase 6 に戻り追加テストを実施                  |

### 差し戻し先の判断基準

| 問題の種類                 | 差し戻し先              |
| -------------------------- | ----------------------- |
| テスト不足（分岐未カバー） | Phase 6（テスト拡充）   |
| 実装の未カバー行           | Phase 5（実装）への確認 |
| カバレッジ設定の問題       | vitest.config.ts の修正 |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了し、拡充テストが全 Green であること
- **後続**: カバレッジ PASS → Phase 8（リファクタリング）へ進む
- **後続**: カバレッジ未達 → Phase 6 に戻る

---

## 次のPhase

全ゲート PASS の場合、完了後に以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-8-refactoring.md`

カバレッジ未達の場合は以下に戻ってください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-6-test-expansion.md`
