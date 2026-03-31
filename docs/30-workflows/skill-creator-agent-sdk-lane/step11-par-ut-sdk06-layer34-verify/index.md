# UT-IMP-SDK-06: Layer3/4 verify 拡張テスト

## 概要

`SkillCreatorVerificationEngine` は Layer1/2 を実装済み（TASK-P0-01 で完了）。本タスクは、Layer3（実行時 lint/schema 検証）と Layer4（セマンティック整合性チェック）のテストケースを `SkillCreatorVerificationEngine.test.ts` へ追加実装し、さらに `RuntimeSkillCreatorFacade` の verify→improve→reverify ループの結合テストを実装することを目的とする。

## スコープ

### 含む

- Layer3 / Layer4 の pass/fail テストケース定義
- `createSkillFixture` の拡張
- `SkillCreatorVerificationEngine.ts` の Layer3/4 stub 追加
- verify→improve→reverify 結合テスト
- Phase 6〜12 の edge case / coverage / QA / documentation / manual test

### 含まない

- commit 実行
- PR 作成
- push
- UI redesign
- Task07 / Task08 の owner 境界変更

## Current Canonical Facts

| 観点            | 現在の事実                                                                              |
| --------------- | --------------------------------------------------------------------------------------- |
| verify owner    | `SkillCreatorVerificationEngine` は Layer1/2 を既に持ち、Layer3/4 は拡張対象である      |
| bridge owner    | `RuntimeSkillCreatorFacade` は verify→improve→reverify の橋渡しを担当する               |
| boundary        | Task07 の governance / disclosure、Task08 の session semantics は本 task の責務外である |
| execution style | shared fixture を先に固め、その後に Layer3 / Layer4 を並列実装するのが最短である        |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| 真の論点             | Layer3/4 のテスト追加は、単なるケース増ではなく、fixture・結合・close-out を owner 境界を崩さずに閉じること |
| 依存関係・責務境界   | fixture helper → Layer3/4 test blocks → loop test → QA / docs の順で閉じる                                  |
| 価値とコストの不均衡 | 先に check ID と fixture を固定する方が、後戻りコストを最も下げられる                                       |
| 改善優先順位         | 1. チェック ID 固定 2. fixture 拡張 3. 結合テスト 4. coverage / QA 5. documentation close-out               |
| 4条件評価            | 価値性 / 実現性 / 整合性 / 運用性 を同時に満たす構成にする                                                  |

## 実行オーケストレーション

| Lane   | 責務                         | 実行形態                       | 主な対象                                                            |
| ------ | ---------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Lane A | skill準拠検証                | Lane B と並列、Lane C の前提   | `task-specification-creator` / `aiworkflow-requirements` の対照確認 |
| Lane B | 30思考法分析                 | Lane A と並列、Lane C の前提   | 30種の思考法を Phase 1-3 に集約                                     |
| Lane C | test / implementation        | A/B 完了後に直列、内部は並列可 | `phase-4`〜`phase-8` の文面更新                                     |
| Lane D | final validation / close-out | C 完了後に直列                 | `phase-9` / `phase-10` / `phase-11` / `phase-12` / `phase-13`       |

### 並列実行ルール

- `phase-1`〜`phase-3` は review / analysis を先に固める。
- `createSkillFixture` 拡張後は Layer3 と Layer4 の test block を並列で組める。
- 結合テストと edge case は依存関係がない範囲で並列化する。
- `phase-13` は user 指示がない限り blocked にする。

## 30思考法の適用方針

30種の思考法は Phase 1-3 に集約し、以降の Phase はその結論だけを消費する。

| カテゴリ     | 思考法                                                                    | 主な適用フェーズ     | 目的                                  |
| ------------ | ------------------------------------------------------------------------- | -------------------- | ------------------------------------- |
| 論理分析系   | 批判的思考 / 演繹思考 / 帰納的思考 / アブダクション / 垂直思考            | Phase 1 / 3 / 9      | 矛盾と推論の妥当性を検証する          |
| 構造分解系   | 要素分解 / MECE / 2軸思考 / プロセス思考                                  | Phase 1 / 2 / 5      | テスト体系を漏れなく分割する          |
| メタ・抽象系 | メタ思考 / 抽象化思考 / ダブル・ループ思考                                | Phase 1 / 3 / 12     | 前提と close-out の妥当性を点検する   |
| 発想・拡張系 | ブレインストーミング / 水平思考 / 逆説思考 / 類推思考 / if思考 / 素人思考 | Phase 2 / 4 / 5      | 代替 fixture と結合シナリオを広く出す |
| システム系   | システム思考 / 因果関係分析 / 因果ループ                                  | Phase 2 / 5 / 7      | 依存関係と波及効果を閉じる            |
| 戦略・価値系 | トレードオン思考 / プラスサム思考 / 価値提案思考 / 戦略的思考             | Phase 1 / 2 / 10     | 価値最大化とコスト最小化を両立する    |
| 問題解決系   | why思考 / 改善思考 / 仮説思考 / 論点思考 / KJ法                           | Phase 1 / 3 / 4 / 12 | 根本原因を固定し、改善案を束ねる      |

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | UT-IMP-SDK-06          |
| タスク種別 | テスト実装             |
| 優先度     | 高                     |
| ステータス | spec_created           |
| 依存タスク | TASK-P0-01, TASK-P0-02 |
| 後続タスク | なし                   |
| 作成日     | 2026-03-31             |
| 更新日     | 2026-03-31             |

## 受入基準

| ID   | 基準                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------- |
| AC-1 | Layer3 テスト: `output-schema.json` が JSON Schema draft-07 準拠かどうかを検証するテストが存在する                    |
| AC-2 | Layer3 テスト: agent ファイルの責務記述の品質（最低 N 文字以上）を検証するテストが存在する                            |
| AC-3 | Layer4 テスト: `SKILL.md` の `## Anchors` セクションに少なくとも 1 件のアンカーが存在するかを検証するテストが存在する |
| AC-4 | Layer4 テスト: `references/` 内に記載されたファイルへの参照が実在するかを検証するテストが存在する                     |
| AC-5 | 結合テスト: verify→improve→reverify ループで最終的に Layer3/4 チェックが pass になるシナリオが存在する                |
| AC-6 | 結合テスト: WorkflowEngine と VerificationEngine の連携が正しく機能することを確認するテストが存在する                 |
| AC-7 | 既存 Layer1/2 テストを破壊しない（デグレなし）                                                                        |
| AC-8 | 全テストが `pnpm vitest run` で pass する                                                                             |

## スコープ

**含む**:

- `SkillCreatorVerificationEngine.test.ts` への Layer3/4 テストケース追加
- Layer3 チェック ID 体系（`L3-001`〜）の定義
- Layer4 チェック ID 体系（`L4-001`〜）の定義
- verify→improve→reverify 結合テスト（`SkillCreatorWorkflowEngine` + `SkillCreatorVerificationEngine`）
- `RuntimeSkillCreatorFacade.verifySkill()` を通じた Layer3/4 結果の受け取り確認

**含まない**:

- `SkillCreatorVerificationEngine.ts` 本体への Layer3/4 実装（テスト先行で実装は別タスク）
- Layer3/4 の IPC/preload/renderer 側の変更
- governance / session semantics の変更（TASK-P0-07/08 の責務）
- UI / renderer 変更

## 依存関係

| 種別      | 参照先                                                                                      | 役割                                                     |
| --------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| upstream  | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/` | Layer1/2 実装の正本。テスト構造の参考                    |
| upstream  | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/`        | 既存 Layer3/4 設計仕様書                                 |
| canonical | `.claude/skills/task-specification-creator/SKILL.md`                                        | Phase 1-13 / Phase 12 運用・構造の正本（`.claude` が正） |
| canonical | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12 Task 12-2（Step 1/2）判断フローの正本           |
| canonical | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`     | Phase 12 validation matrix（pass 条件）の正本            |
| canonical | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Phase 12（Task 12-1〜12-6）成果物要件の正本              |
| canonical | `.claude/skills/aiworkflow-requirements/SKILL.md`                                           | system spec（`.claude` 正本）運用と参照起点の正本        |
| canonical | `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md`      | エレガンス/整合性監査の観点（用語統一・重複排除）        |
| peer      | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`   | 既存テストファイル（追加先）                             |
| peer      | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                  | テスト対象実装ファイル                                   |

## 現行コードアンカー

| ファイル                                                                                  | 現状の役割                          | 本タスクでの扱い                            |
| ----------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | Layer1/2 テストが実装済み           | Layer3/4 テストケースと結合テストを追加する |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | Layer1/2 検証のみ実装済み           | Layer3/4 メソッドの stub/mock 対象          |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                    | verify phase 状態遷移の owner       | 結合テストの connect 先                     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | verify / improve の public bridge   | verify→improve→reverify ループの接続先      |
| `packages/shared/src/types/skillCreator.ts`                                               | `RuntimeSkillCreatorVerifyCheck` 型 | Layer3/4 用 `layer` 値の追加を確認する      |

## ディレクトリ構成

```text
step-11-par-task-ut-sdk06-layer34-verify-expansion/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
└── phase-13-pr-creation.md
```

## outputs/ 期待構成（実行時に生成）

本 workflow は実行フェーズで `outputs/` を生成し、検証結果と Phase 12 成果物を機械検証可能な形で残す。
なお Phase 13 はユーザー明示指示がない限り `blocked` のため、`outputs/phase-13/` は optional とする。

```text
outputs/
├── artifacts.json
├── verification-report.md
├── phase-3/
│   ├── design-review-gate.md
│   └── skill-compliance-and-elegance-review.md
├── phase-4/
│   └── test-matrix.md
├── phase-5/
│   └── implementation-sequencing.md
├── phase-7/
│   └── coverage-summary.md
├── phase-9/
│   └── qa-summary.md
├── phase-10/
│   └── final-review-summary.md
├── phase-11/
│   ├── manual-test-checklist.md
│   ├── manual-test-result.md
│   └── discovered-issues.md
├── phase-12/
│   ├── implementation-guide.md
│   ├── system-spec-update-summary.md
│   ├── documentation-changelog.md
│   ├── unassigned-task-detection.md
│   ├── skill-feedback-report.md
│   └── phase12-task-spec-compliance-check.md
└── phase-13/ (optional)
    └── pr-preparation.md
```

## 実装者向けクイックガイド

### 着手条件

- `SkillCreatorVerificationEngine.test.ts` の既存 Layer1/2 テスト構造を読了している
- `SkillCreatorVerificationEngine.ts` の Layer1/2 実装を読了している
- Layer3/4 のテストが先行し、実装は後続タスクであることに合意している
- `RuntimeSkillCreatorFacade.verifySkill()` の動作を理解している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — Layer3/4 テストケースと結合テストを追加
- `packages/shared/src/types/skillCreator.ts` — `layer` フィールドに `"layer3"` | `"layer4"` を追加（未実装の場合）

### 完了イメージ

- `describe("Layer 3 checks")` ブロックに `L3-001`〜のテストが通過する
- `describe("Layer 4 checks")` ブロックに `L4-001`〜のテストが通過する
- `describe("verify→improve→reverify loop")` の結合テストが通過する
- 既存 Layer1/2 テストにデグレなし

### 並列実行メモ

- Layer3/4 の実装タスク（UT-IMP-SDK-06 本体）と並列着手不可（テスト先行のため）
- TASK-P0-02（閉ループ修復）完了後に結合テストの着手を推奨

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | pending    |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | pending    |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |
