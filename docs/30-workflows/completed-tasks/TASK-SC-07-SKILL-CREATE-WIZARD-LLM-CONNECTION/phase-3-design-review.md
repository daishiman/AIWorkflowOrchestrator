# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| Phase名    | 設計レビューゲート                            |
| 前提Phase  | Phase 2                                       |
| 後続Phase  | Phase 4                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 2 で作成した設計の妥当性を検証し、Phase 4（テスト作成）に進めるかを判定する。TASK-SC-06 の苦戦箇所が設計レベルで回避されているかを確認する。

## 背景

TASK-SC-06 で4つの苦戦箇所（C-1: executePlan 引数不足、C-2: generationProgress 未表示、C-4: PlanResult 二重定義、Hybrid State Pattern 非対称クリア）が報告されている。設計レビューで事前に回避策が組み込まれていることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TASK-SC-06 苦戦箇所回避チェック

**目的**: 設計が既知の落とし穴を回避していることを確認する

**実行手順**:

1. Phase 2 の型定義設計（`outputs/phase-2/type-definitions.md`）を読み込む
2. 以下のチェックリストを確認する

| チェック項目                           | 確認観点                                                                                   | PASS 基準                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| C-1: executePlan 引数型                | `SkillCreatorRuntimeApi.executePlan` の `skillSpec` が `string`（必須）で定義されているか  | optional (`?`) でないこと                                               |
| C-2: generationProgress JSX 表示       | GenerateStepProps に `generationProgress: string \| null` が含まれているか                 | Props に存在 + JSX 表示設計あり                                         |
| C-4: PlanResult Single Source of Truth | GenerateStepProps / SkillCreateWizard が `agentSlice` の `PlanResult` を import する設計か | ローカル型定義がないこと                                                |
| 対称クリア                             | データフロー設計で handleCancelPlan / handleExecutePlan 両方に対称クリアが含まれているか   | 両方で `setLocalPlanResult(null)` + `clearGenerationState()` が呼ばれる |

3. 結果を `outputs/phase-3/sc06-avoidance-check.md` に記録する

**期待される成果物**:

- `outputs/phase-3/sc06-avoidance-check.md`

---

### タスク2: 受入条件カバレッジチェック

**目的**: Phase 2 の設計が AC-1〜AC-10 を全てカバーしていることを確認する

**実行手順**:

1. Phase 1 の受入条件（`outputs/phase-1/acceptance-criteria.md`）を読み込む
2. Phase 2 の各設計成果物を照合する

| AC    | 設計カバレッジ                                                           | 充足 |
| ----- | ------------------------------------------------------------------------ | ---- |
| AC-1  | DescribeStepProps に generationMode / onGenerationModeChange が追加      | -    |
| AC-2  | データフローで LLM 選択 → goToStep(2) → planSkill 呼出が設計済み         | -    |
| AC-3  | GenerateStepProps に planResult が追加、表示設計あり                     | -    |
| AC-4  | データフローで onExecutePlan → executePlan → goToStep(3) が設計済み      | -    |
| AC-5  | データフローで onCancelPlan → goToStep(0) が設計済み                     | -    |
| AC-6  | GenerateStepProps に generationProgress が追加、ローディング表示設計あり | -    |
| AC-7  | データフローでエラーパスに setGenerationError が設計済み                 | -    |
| AC-8  | フロー B（テンプレート）が既存フローそのまま維持の設計                   | -    |
| AC-9  | 型定義設計で PlanResult は agentSlice から import                        | -    |
| AC-10 | 対称クリアが handleCancelPlan / handleExecutePlan に設計済み             | -    |

3. 結果を `outputs/phase-3/ac-coverage-check.md` に記録する

**期待される成果物**:

- `outputs/phase-3/ac-coverage-check.md`

---

### タスク3: 非破壊性チェック

**目的**: テンプレートフローの既存動作が設計レベルで保証されていることを確認する

**実行手順**:

1. Phase 2 のステップ遷移設計（`outputs/phase-2/step-transition.md`）を読み込む
2. 以下を確認する:
   - `generationMode` のデフォルト値が `"template"` であること
   - テンプレートモード時の遷移パスが変更されていないこと
   - `handleGenerate`（既存）が変更されていないこと
   - ConfigureStep の Props / 動作に変更がないこと
3. 結果を `outputs/phase-3/non-destructive-check.md` に記録する

**期待される成果物**:

- `outputs/phase-3/non-destructive-check.md`

---

### タスク4: レビュー判定

**目的**: 設計全体の合否を判定する

**実行手順**:

1. タスク1〜3 の結果を総合的に評価する
2. 以下の判定基準に従い結果を判定する

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ     |
| MAJOR    | 重大な問題あり           | Phase 2 へ戻り設計修正     |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

3. 結果を `outputs/phase-3/review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-3/review-result.md`

---

## 参照資料

| 参照資料            | パス                                                                                 | 内容               |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| Phase 1 成果物      | `outputs/phase-1/`                                                                   | 受入条件・スコープ |
| Phase 2 成果物      | `outputs/phase-2/`                                                                   | 設計書一式         |
| TASK-SC-06 苦戦箇所 | `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md` | 苦戦箇所テーブル   |

---

## 成果物

| 成果物                | パス                                       | 内容                            |
| --------------------- | ------------------------------------------ | ------------------------------- |
| SC-06 回避チェック    | `outputs/phase-3/sc06-avoidance-check.md`  | 苦戦箇所回避の確認結果          |
| AC カバレッジチェック | `outputs/phase-3/ac-coverage-check.md`     | AC-1〜AC-10 充足確認            |
| 非破壊性チェック      | `outputs/phase-3/non-destructive-check.md` | テンプレートフロー保全          |
| レビュー判定結果      | `outputs/phase-3/review-result.md`         | PASS / MINOR / MAJOR / CRITICAL |

---

## 統合テスト連携（Phase 3）

統合テスト観点のレビューゲートを実施:

- planSkill / executePlan の IPC 契約が設計で正しく参照されているか
- Preload API シグネチャとローカル型の一致が設計で確認されているか
- エラーパスでの IPC エラー伝播が設計されているか

---

## 完了条件

- [ ] SC-06 苦戦箇所（C-1, C-2, C-4, 対称クリア）が全て設計レベルで回避されている
- [ ] AC-1〜AC-10 が全て設計でカバーされている
- [ ] テンプレートフローの非破壊性が確認されている
- [ ] レビュー判定が PASS または MINOR（対応済み）であること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行            |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ    |
| MAJOR    | 重大な問題あり           | Phase 2 へ戻り設計修正     |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4（テスト作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-4-test-creation.md`
