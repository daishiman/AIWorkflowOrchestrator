# step-11-par-task-docs-sdk-spec-sync

## 概要

UT-IMP-SDK-02 と UT-IMP-SDK-04 を統合した docs-only 仕様同期タスクである。

- **UT-IMP-SDK-02**: `SkillCreatorWorkflowEngine` 実装済み current facts が canonical system spec に閉じていない問題を是正する。`architecture-overview-core.md`、`arch-electron-services-details-part2.md`、`api-ipc-system-core.md` を現状コードに合わせて更新する。
- **UT-IMP-SDK-04**: TASK-SDK-04 の Phase 12 再監査で発覚した canonical path drift を是正する。`task-workflow-completed.md` / `resource-map.md` / `quick-reference.md` / `topic-map.md` のパス・リンクを現状コードに合わせて修正する。

**コード変更なし、docs/仕様書のみ更新する docs-only タスクである。**

## メタ情報

| 項目         | 値                                                           |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-SDK-02+SDK-04                                         |
| タスク名     | docs-only 仕様同期: system spec 同期 + canonical path resync |
| ステータス   | `spec_created`                                               |
| 分類         | docs-only improvement                                        |
| 優先度       | 高                                                           |
| 見積もり規模 | 中規模                                                       |
| 親 workflow  | `docs/30-workflows/skill-creator-agent-sdk-lane/`            |
| 関連 Issue   | #1647 (SDK-02), #1662 (SDK-04)                               |
| 作成日       | 2026-03-31                                                   |
| タスク種別   | docs-only                                                    |

## 目的

1. `SkillCreatorWorkflowEngine` の current facts を canonical system spec へ同期する（SDK-02）
2. TASK-SDK-04 の canonical path drift を解消し、完了証跡と導線を current path へ揃える（SDK-04）
3. 両タスクを同一 PR にまとめ、docs-only remediation を効率的に閉じる
4. validator / grep で未完了表現・旧 path が 0 件になることを完了条件とする

## 統合理由

| 観点               | 説明                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 同一性質           | 両タスクとも「コード変更なし、docs/仕様書のみ更新」という docs-only タスク |
| 作業手順の同様性   | 現状コード確認 → 仕様書更新 → レビュー の流れが共通                        |
| 対象ファイルの分離 | 対象ファイルは異なるため、作業内容の混在・競合はない                       |
| PR 効率化          | 同一 PR にまとめることでレビューコストを削減できる                         |

## 実行オーケストレーション

| SubAgent / Lane | 責務          | 実行形態                           | 主な対象                                                                                                                                                                                       |
| --------------- | ------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lane A          | skill準拠検証 | Lane B と並列、Lane C の前提       | `task-specification-creator` / `aiworkflow-requirements` の差分照合                                                                                                                            |
| Lane B          | 30思考法分析  | Lane A と並列、Lane C の前提       | 30種の思考法を Phase 1-3 に集約                                                                                                                                                                |
| Lane C          | spec 改善反映 | A/B 完了後に直列、各 file 群は並列 | `phase-2`〜`phase-12` の文面更新                                                                                                                                                               |
| Lane D          | 最終検証      | C 完了後に直列                     | `quick_validate` / `validate_all` / `verify-all-specs` / `validate-phase-output` / `validate-phase12-implementation-guide` / `verify-unassigned-links` / `audit-unassigned-tasks` / `diff -qr` |

### 並列実行ルール

- 独立ファイルは並列で更新する。
- 依存がある場合のみ直列にする。
- shared canonical は先に確定し、その後の index 群は並列で閉じる。
- 破棄判断は Phase 3 で確定し、Phase 5 以降へ持ち越さない。

## 30思考法の適用方針

30種の思考法は Phase 1-3 に集約し、以降の Phase はその結論を消費する。Lane B が下表を分析根拠に使い、Lane C 以降は結論のみを再利用する。

| カテゴリ     | 思考法                                                                    | 主な適用フェーズ     | 目的                                     |
| ------------ | ------------------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| 論理分析系   | 批判的思考 / 演繹思考 / 帰納的思考 / アブダクション / 垂直思考            | Phase 1 / 3 / 9      | 矛盾検出と結論の妥当性確認               |
| 構造分解系   | 要素分解 / MECE / 2軸思考 / プロセス思考                                  | Phase 1 / 2 / 5      | 対象の漏れと重複を排除して分割する       |
| メタ・抽象系 | メタ思考 / 抽象化思考 / ダブル・ループ思考                                | Phase 1 / 3 / 12     | 前提を見直し、再発ルールへ昇格する       |
| 発想・拡張系 | ブレインストーミング / 水平思考 / 逆説思考 / 類推思考 / if思考 / 素人思考 | Phase 2 / 4 / 5      | 代替案を広く出し、最小複雑性へ収束させる |
| システム系   | システム思考 / 因果関係分析 / 因果ループ                                  | Phase 2 / 5 / 7      | 依存関係と波及効果を閉じる               |
| 戦略・価値系 | トレードオン思考 / プラスサム思考 / 価値提案思考 / 戦略的思考             | Phase 1 / 2 / 10     | 価値最大化とコスト最小化を両立する       |
| 問題解決系   | why思考 / 改善思考 / 仮説思考 / 論点思考 / KJ法                           | Phase 1 / 3 / 4 / 12 | 真の論点を固定し、改善案を束ねる         |

## 受入基準

| ID    | 基準                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | `architecture-overview-core.md` が `SkillCreatorWorkflowEngine` を current owner として記述している                                   |
| AC-2  | `arch-electron-services-details-part2.md` の記述が現状コードと整合している                                                            |
| AC-3  | `api-ipc-system-core.md` の API/IPC 仕様記述が現状コードと整合している                                                                |
| AC-4  | `task-workflow-completed.md` の TASK-SDK-04 完了記録のパスがすべて current path を指す                                                |
| AC-5  | `resource-map.md` のリンクに stale path が残っていない                                                                                |
| AC-6  | `quick-reference.md` のリンクに stale path が残っていない                                                                             |
| AC-7  | `topic-map.md` のリンクに stale path が残っていない                                                                                   |
| AC-8  | grep による未完了表現チェックが 0 件である（`更新予定`、`後でやる`、`後続判断待ち`、`仕様策定のみ`、`実行予定`、`保留として記録` 等） |
| AC-9  | grep による旧 path チェックが 0 件である                                                                                              |
| AC-10 | コード変更（`.ts`、`.tsx` 等）が含まれていない                                                                                        |

## スコープ

### 含む（SDK-02）

- `architecture-overview-core.md` の `SkillCreatorWorkflowEngine` current owner 化
- `arch-electron-services-details-part2.md` の現状コード整合更新
- `api-ipc-system-core.md` の API/IPC 仕様現状整合更新

### 含む（SDK-04）

- `task-workflow-completed.md` の TASK-SDK-04 完了記録パス修正
- `resource-map.md` の stale path 修正
- `quick-reference.md` の stale path 修正
- `topic-map.md` の stale path 修正

### 含まない

- `SkillCreatorWorkflowEngine` や runtime 実装の追加・修正
- Task05 / Task07 / Task08 の機能実装
- 新規 IPC / preload / renderer 契約の追加設計
- commit、PR 作成、push（Phase 13 で指示があるまで実行しない）
- `.ts`、`.tsx`、`.test.ts` 等のコードファイル変更

## 依存関係

| 種別        | 参照先                                                                                                  | 役割                                       |
| ----------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| predecessor | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-02-system-spec-and-path-sync-001/index.md`           | SDK-02 是正要求の原票                      |
| predecessor | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-04-phase12-canonical-path-resync-001/index.md`       | SDK-04 是正要求の原票                      |
| canonical   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                          | TASK-SDK-02/04 完了記録の current fact     |
| canonical   | `.claude/skills/task-specification-creator/SKILL.md`                                                    | Phase 1-13 / Phase 12 template の正本      |
| canonical   | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                       | system spec / canonical set の正本         |
| canonical   | `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md`                  | 4層監査 / Lane-A〜D の正本                 |
| canonical   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | current canonical set / artifact inventory |
| canonical   | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                  | Phase 12 documentation wave の正本         |
| canonical   | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`                 | validator matrix の正本                    |
| canonical   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`       | Phase 12 same-wave 運用ルール              |
| canonical   | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                            | follow-up / backlog の current fact        |

## 想定変更ポイント（docs のみ）

### SDK-02 対象

| ファイル                                  | 更新観点                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `architecture-overview-core.md`           | `SkillCreatorWorkflowEngine` を future ではなく current owner として記述 |
| `arch-electron-services-details-part2.md` | Electron サービス層の実装済み facts を反映                               |
| `api-ipc-system-core.md`                  | workflow engine の IPC/API 仕様を実装済み契約に更新                      |

### SDK-04 対象

| ファイル                     | 更新観点                                                          |
| ---------------------------- | ----------------------------------------------------------------- |
| `task-workflow-completed.md` | TASK-SDK-04 完了記録のパス・リンクを current path に修正          |
| `resource-map.md`            | step-03 配下の旧パスを completed-tasks 配下の current path に修正 |
| `quick-reference.md`         | TASK-SDK-04 関連のリンクを current path に修正                    |
| `topic-map.md`               | TASK-SDK-04 関連のトピックリンクを current path に修正            |

## 完了イメージ

- canonical system spec が `SkillCreatorWorkflowEngine` を future ではなく current owner として扱う
- `resource-map.md`、`quick-reference.md`、`topic-map.md` に stale path が残らない
- `task-workflow-completed.md` の TASK-SDK-04 記録が current path を指す
- `verify-all-specs` と grep 観点で未完了表現・旧 path が 0 件になる
- コード変更が一切含まれていない

## ディレクトリ構成

```text
step-11-par-task-docs-sdk-spec-sync/
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
    ├── phase-1/
    │   └── spec-extraction-map.md
    ├── phase-2/
    │   └── canonical-sync-target-matrix.md
    ├── phase-3/
    │   └── design-review-gate.md
    ├── phase-4/
    │   └── test-matrix.md
    ├── phase-5/
    │   └── implementation-sequencing.md
    ├── phase-6/
    │   └── test-expansion-summary.md
    ├── phase-7/
    │   └── coverage-summary.md
    ├── phase-8/
    │   └── refactoring-summary.md
    ├── phase-9/
    │   └── qa-summary.md
    ├── phase-10/
    │   └── final-review-summary.md
    ├── phase-11/
    │   ├── manual-test-checklist.md
    │   └── manual-test-result.md
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   ├── skill-feedback-report.md
    │   └── phase12-task-spec-compliance-check.md
    └── phase-13/
        └── pr-preparation.md
```

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
