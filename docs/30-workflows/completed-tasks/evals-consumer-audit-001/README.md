# TASK-EVALS-CONSUMER-AUDIT-001 / evals-consumer-audit-001

> **EVALS consumer 完全監査（スキーマ変更前の全 consumer 特定）** のタスク仕様書一式。
> Issue: [#2279](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2279) （CLOSED 状態のままユーザー指示により仕様書を作成）

---

## 概要

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | TASK-EVALS-CONSUMER-AUDIT-001                                        |
| 分類         | 改善 / 監査（NON_VISUAL、調査・文書化タスク、コード実装なし）        |
| 優先度       | **高**                                                               |
| 規模         | 中規模                                                               |
| 発見元       | TASK-CONFLICT-PREVENT-001 Phase 12 unassigned-task-detection.md      |
| 依存         | TASK-CONFLICT-PREVENT-001（完了済み）                                |
| ブロック対象 | EVALS.json スキーマ変更を含む全タスク（AC-6 規則）                   |
| 元指示書     | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md` |

目的は `.claude/skills/*/EVALS.json` と `.agents/skills/*/EVALS.json` を **読み込む / 書き込む / 検証する** すべての consumer を特定し、スキーマ変更時の影響範囲を事前に把握可能にすること。

---

## ディレクトリ構成

```
evals-consumer-audit-001/
├── README.md                              # 本ファイル（index）
├── design-docs/                           # Phase 1-3 設計書（本仕様書作成の成果物）
│   ├── phase-1-requirements.md            # 要件定義
│   ├── phase-2-scope-architecture.md      # スコープ・アーキテクチャ
│   └── phase-3-phase-design.md            # Phase 4-13 設計
├── phase-1/  ... phase-13/                # 各Phaseの実行仕様書
│   └── spec.md
└── outputs/                               # 各Phase実行時に生成される成果物（実行時に作成）
    ├── phase-4/    # raw-consumer-list.md
    ├── phase-5/    # consumer-audit-report.md / evals-field-map.md
    ├── phase-6/    # dual-root-parity.md
    ├── phase-7/    # consumer-reaudit-report.md
    ├── phase-8/    # schema-change-guide.md
    ├── phase-9/    # spec-alignment-report.md
    ├── phase-10/   # final-review-result.md / ac6-release-verdict.md
    ├── phase-11/   # manual-test-result.md / reproduction-verification.md + logs/
    ├── phase-12/   # implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check
    └── phase-13/   # pr-description.md / approval-checklist.md
```

---

## Phase 一覧と責務

| Phase | spec                       | 役割                                        | 主な出力                                                                                                                      | 並列可否                       |
| ----- | -------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1     | `design-docs/phase-1-*.md` | 要件定義（Why / FR / NFR / AC / 非ゴール）  | phase-1-requirements.md                                                                                                       | 直列                           |
| 2     | `design-docs/phase-2-*.md` | スコープ・依存・アーキテクチャ判断・QG      | phase-2-scope-architecture.md                                                                                                 | 直列                           |
| 3     | `design-docs/phase-3-*.md` | Phase 4-13 設計                             | phase-3-phase-design.md                                                                                                       | 直列                           |
| 4     | `phase-4/spec.md`          | 静的検索による consumer 初期リストアップ    | raw-consumer-list.md                                                                                                          | 検索カテゴリ単位で 6 並列      |
| 5     | `phase-5/spec.md`          | consumer 分類・field map 作成               | consumer-audit-report.md / evals-field-map.md                                                                                 | 5-A(report) と 5-B(map) を並列 |
| 6     | `phase-6/spec.md`          | dual root 差分確認（.claude vs .agents）    | dual-root-parity.md                                                                                                           | スキル単位で並列               |
| 7     | `phase-7/spec.md`          | 漏れ再検索・動的パス consumer 確認          | consumer-reaudit-report.md                                                                                                    | 直列                           |
| 8     | `phase-8/spec.md`          | schema-change-guide.md 作成                 | schema-change-guide.md                                                                                                        | 直列                           |
| 9     | `phase-9/spec.md`          | aiworkflow-requirements spec との整合性検証 | spec-alignment-report.md                                                                                                      | 直列                           |
| 10    | `phase-10/spec.md`         | レビューゲート（AC-6 解除判定）             | final-review-result.md / ac6-release-verdict.md                                                                               | ゲート（直列）                 |
| 11    | `phase-11/spec.md`         | 再現検証（NON_VISUAL 読み替え）             | manual-test-result.md / reproduction-verification.md + logs/                                                                  | 直列                           |
| 12    | `phase-12/spec.md`         | close-out・仕様同期・中学生レベル説明統合   | implementation-guide / system-spec-update-summary / changelog / unassigned-task-detection / skill-feedback / compliance-check | 一部並列・最終確認は直列       |
| 13    | `phase-13/spec.md`         | 承認・PR 段取り（PR 作成は別ターン）        | pr-description.md / approval-checklist.md                                                                                     | ゲート（直列）                 |

---

## 実行ウェーブ（Phase 3設計書準拠）

| Wave | 対象 Phase                              | 並列度    | ゲート         |
| ---- | --------------------------------------- | --------- | -------------- |
| W1   | Phase 4                                 | 6 並列    | -              |
| W2   | Phase 5 (5-A/5-B) + Phase 6 (skill単位) | 2〜N 並列 | -              |
| W3   | Phase 7                                 | 1         | -              |
| W4   | Phase 8                                 | 1         | -              |
| W5   | Phase 9                                 | 1         | -              |
| W6   | Phase 10                                | 1         | **AC-6 判定**  |
| W7   | Phase 11                                | 1         | -              |
| W8   | Phase 12（Task 1 / 4 / 5）              | 3 並列    | -              |
| W9   | Phase 12（Task 2 / 3 → Task 6）         | 直列      | -              |
| W10  | Phase 13                                | 1         | **承認ゲート** |

---

## 最終成果物（canonical 4 点）

TASK-CONFLICT-PREVENT-001 AC-6 の解除条件に直接対応：

1. `outputs/phase-5/consumer-audit-report.md` — 全 consumer 一覧（コード・スクリプト・テスト・エージェント定義）
2. `outputs/phase-5/evals-field-map.md` — 各 consumer の参照／更新フィールドマップ
3. `outputs/phase-8/schema-change-guide.md` — フィールド追加／削除／リネーム時の影響範囲と手順
4. `outputs/phase-6/dual-root-parity.md` — `.claude/skills/` vs `.agents/skills/` の差分

これらの最終版が揃い、Phase 10 ゲートで **PASS** 判定されると AC-6 の「EVALS schema 変更禁止」制約が解除される。

---

## 関連資料

| 資料                                        | パス                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 元タスク指示書                              | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`                          |
| 発見元・AC-6 定義                           | `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` |
| task-specification-creator skill            | `.claude/skills/task-specification-creator/`                                                  |
| aiworkflow-requirements skill（正本仕様）   | `.claude/skills/aiworkflow-requirements/`                                                     |
| 代表スキーマサンプル                        | `.claude/skills/task-specification-creator/EVALS.json`                                        |
| self-improvement-cycle.md（EVALS 構造説明） | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`              |

---

## 重要制約

- **コード実装は行わない**（監査・文書化タスク）
- Phase 13 に記載の PR 作成・コミット・push は **ユーザー指示があるまで実行禁止**
- `--no-verify` や Issue 再オープン、`--amend` は禁止
- dual root の扱いは「正本断定せず差分可視化に留める」（Phase 2 アーキテクチャ決定）

---

## 変更履歴

| 日付       | 変更内容                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 2026-04-19 | 初版作成（Phase 1-3 設計書 + Phase 4-13 spec.md を task-specification-creator skill に準拠して生成） |
