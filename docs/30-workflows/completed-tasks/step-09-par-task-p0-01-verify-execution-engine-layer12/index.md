# TASK-P0-01: verify-execution-engine-layer12

## 概要

`SkillCreatorWorkflowEngine` は verify phase の状態遷移のみを管理し、実際の Layer 1/2 品質チェックロジックが存在しない。本タスクは、独立モジュールとして `SkillCreatorVerificationEngine` を新規実装し、構造検証（Layer 1）とコンテンツルール検証（Layer 2）を動作させることを目的とする。

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-P0-01                                  |
| タスク種別 | 新規実装                                    |
| 優先度     | P0                                          |
| ステータス | spec_created                                |
| 上流ゲート | `../p0-verify-manifest-remediation-pack.md` |
| 依存タスク | なし                                        |
| 後続タスク | TASK-P0-02                                  |
| 作成日     | 2026-03-29                                  |
| 更新日     | 2026-03-29                                  |

## 受入基準

| ID   | 基準                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| AC-1 | `SkillCreatorVerificationEngine` クラスが `verify(skillDir: string)` メソッドを持って存在する |
| AC-2 | Layer 1 チェック: SKILL.md 存在、agents/ ディレクトリ存在、必須ファイル構造の検証             |
| AC-3 | Layer 2 チェック: SKILL.md 必須フィールド、フォーマット検証、スキーマ準拠                     |
| AC-4 | 戻り値が `RuntimeSkillCreatorVerifyCheck[]` で、`layer1` / `layer2` エントリを含む            |
| AC-5 | ユニットテストが Layer 1/2 の pass/fail シナリオを網羅する                                    |
| AC-6 | `RuntimeSkillCreatorFacade` が verification engine を inject して使用できる                   |

## スコープ

**含む**:

- `SkillCreatorVerificationEngine` クラスの新規実装
- Layer 1 構造検証ロジック（ファイル・ディレクトリ存在チェック）
- Layer 2 コンテンツルール検証ロジック（SKILL.md フィールド・フォーマットチェック）
- `RuntimeSkillCreatorVerifyCheck` 型の `layer` フィールド拡張（`"layer1"` | `"layer2"` 追加）
- Facade への injection point 追加
- ユニットテスト

**含まない**:

- Layer 3/4 の検証ロジック（既存スコープ外）
- verify→improve→re-verify 閉ループ修復（TASK-P0-02 の責務）
- `recordVerifyPass()` の実装（TASK-P0-02 の責務）
- workflow-manifest.json の配置（TASK-P0-03 の責務）
- ManifestLoader の有効化（TASK-P0-04 の責務）
- UI / renderer 側の変更

## 依存関係

| 種別       | 参照先                                      | 役割                            |
| ---------- | ------------------------------------------- | ------------------------------- |
| upstream   | `../p0-verify-manifest-remediation-pack.md` | P0 是正パックの背景と設計原則   |
| upstream   | `../requirements-draft.md`                  | FR-04 verify 契約の要件         |
| upstream   | `../root-workflow-pack/index.md`            | lane 共通不変条件と責務分離方針 |
| peer       | TASK-SDK-02 (WorkflowEngine)                | verify phase の state owner     |
| downstream | TASK-P0-02 (閉ループ修復)                   | verification engine の利用者    |

## 現行コードアンカー

| ファイル                                                                       | 現状の役割                                                                    | TASK-P0-01 での扱い                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` (970行) | verify phase の状態遷移管理。`buildVerifyDetail()` はスナップショット生成のみ | 検証結果の受け取り先として維持。engine 呼び出し側に留める |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` (937行)  | plan / execute / improve の public bridge                                     | verification engine の injection point を追加する         |
| `packages/shared/src/types/skillCreator.ts` (851行)                            | `RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyDetail` 型       | `layer` フィールドに `"layer1"` / `"layer2"` を追加する   |
| `apps/desktop/src/main/services/runtime/__tests__/`                            | 既存テストディレクトリ                                                        | verification engine のユニットテストを追加する            |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | verify が「状態遷移だけで品質チェックが空」である問題を、独立モジュールとして閉じること                             |
| 依存関係・責務境界   | WorkflowEngine は状態遷移 owner のまま維持し、検証ロジックは VerificationEngine に分離する。Facade は両者の橋渡し   |
| 価値とコストの不均衡 | Layer 1/2 は file system 操作と正規表現で実装可能。Layer 3/4（実行時検証）は別タスクへ分離済みで scope creep を防ぐ |
| 改善優先順位         | 1. 型拡張 2. Layer 1 validator 3. Layer 2 validator 4. engine aggregation 5. Facade injection                       |
| 4条件評価            | 価値性: P0（量産品質の前提）/ 実現性: 高（fs + regex）/ 整合性: 既存型を拡張 / 運用性: 独立テスト可能               |

## ディレクトリ構成

```text
step-09-par-task-p0-01-verify-execution-engine-layer12/
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
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/verification-engine-design.md
    ├── phase-2/layer-check-catalog.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   └── skill-feedback-report.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorVerifyCheck` 型を読了している
- `SkillCreatorWorkflowEngine.ts` の `buildVerifyDetail()` を読了している
- Layer 1/2 のみ実装し、Layer 3/4 と閉ループ修復は TASK-P0-02 以降であることに合意している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `layer` フィールド型拡張
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` — 新規作成
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — injection point 追加
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — 新規作成

### 非対象

- Layer 3/4 検証ロジック
- `recordVerifyPass()` 実装
- verify→improve→re-verify 閉ループ
- workflow-manifest.json 配置
- UI / renderer 変更

### 完了イメージ

- `SkillCreatorVerificationEngine.verify(skillDir)` を呼ぶと `RuntimeSkillCreatorVerifyCheck[]` が返る
- Layer 1 チェックが SKILL.md 存在、agents/ ディレクトリ存在、必須ファイル構造を検証する
- Layer 2 チェックが SKILL.md 必須フィールド、フォーマット準拠を検証する
- 全チェック項目の pass/fail をユニットテストで確認できる
- Facade から engine を inject して呼び出せる

### 並列実行メモ

- TASK-P0-01 は TASK-P0-03 と並列実行可能
- TASK-P0-02 は TASK-P0-01 完了後に着手
- shared type の `layer` フィールド拡張は P0-02 とのマージ競合に注意

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
