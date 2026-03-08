# store-driven-lifecycle-ui - タスク実行仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | TASK-10A-F                            |
| 機能名     | store-driven-lifecycle-ui             |
| タイトル   | スキルライフサイクルUIのStore駆動統合 |
| 作成日     | 2026-03-08                            |
| ステータス | completed                             |
| 実行モード | 仕様再監査のみ（commit / PRなし）     |
| 総Phase数  | 13                                    |
| 依存タスク | TASK-10A-B, TASK-10A-C, TASK-10A-D    |
| ブロック   | TASK-10A-G                            |

---

## 概要

`SkillAnalysisView` / `useSkillAnalysis` に残る直接 `window.electronAPI.skill.*` 呼び出しを `agentSlice` の store action 経由へ統一し、`SkillCreateWizard` で既に導入済みの store 駆動パターンとの責務境界を再確認する。作成後一覧同期、改善後再分析、P31/P48 再発防止、Phase 11/12 の証跡整合をこのワークフローで固定する。

## 移管結果

| 項目          | パス                                                                           | 役割                                         | 状態              |
| ------------- | ------------------------------------------------------------------------------ | -------------------------------------------- | ----------------- |
| 正本 workflow | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/`                 | Phase 12 完了確認後に統合した公式成果物      | `completed-tasks` |
| 関連未タスク  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/` | TASK-10A-F 由来の open backlog 5件を継続管理 | `open backlog`    |

- 移管前は current/completed の 2workflow で再監査し、Phase 11/12 の証跡と baseline 正規化を確定した
- Phase 12 完了後は current workflow を本ディレクトリへ統合し、参照先を `completed-tasks` 正本へ一本化した
- legacy 命名や phase 形式ドリフトの是正手順は、本 workflow と `task-workflow.md` / `lessons-learned.md` に残して再利用可能にした

---

## 親タスク仕様書

- [task-044-task-10a-f-store-driven-lifecycle-ui.md](../skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-044-task-10a-f-store-driven-lifecycle-ui.md)

---

## aiworkflow-requirements 抽出方針

1. `indexes/quick-reference.md` で技術キーワードを初期特定する
2. `indexes/resource-map.md` で正本仕様の参照先を絞り込む
3. Phase ごとに必要な `references/*.md` を紐付け、漏れを `outputs/requirements-coverage-matrix.md` で検証する
4. `task-workflow.md` / `lessons-learned.md` で移管前 2workflow 監査結果と移管後の completed 正本を確認する

### 抽出入口

| 資料            | パス                                                                | 用途                                     |
| --------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| Quick Reference | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | P31対策、IPC/Store個別セレクタの要点抽出 |
| Resource Map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`    | 必須カテゴリの探索漏れ防止               |
| Coverage Matrix | `outputs/requirements-coverage-matrix.md`                           | 今回実装に必要な仕様抽出の網羅性確認     |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR準備・承認待ち     | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
Phase 1 -> Phase 2 -> Phase 3 (Gate) -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
                         |                                      |
                    (MAJOR->戻り)                           (未達->戻り)
                         |                                      |
Phase 8 -> Phase 9 -> Phase 10 (Gate) -> Phase 11 -> Phase 12 -> Phase 13 -> 完了
                         |
                    (MAJOR->戻り)
```

---

## 対象ファイル

| ファイル                                                                          | 主な確認/変更内容                                              |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | `useCreateSkill()` 契約の維持、作成後一覧同期の確認            |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`            | analyze/apply/autoImprove の直接IPC排除、store action 経由統一 |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`             | 一覧同期と view 遷移の整合確認                                 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | Store action 経由テストの維持・拡充                            |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` | Store action 経由テストの維持・拡充                            |

---

## Phase完了時の必須アクション

1. Phase内で指定された全タスクを100%実行する
2. 必須成果物の実体と参照リンクを確認する
3. `artifacts.json` を `complete-phase.js` で更新する
4. `validate-phase-output.js` と必要な validator を実行し、完了条件と同期させる

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 補助成果物

| 成果物                      | パス                                       | 説明                                                         |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| requirements 抽出マトリクス | `outputs/requirements-coverage-matrix.md`  | aiworkflow-requirements から必要仕様を抽出できているかの確認 |
| 2workflow監査サマリ         | `outputs/two-workflow-audit-summary.md`    | 移管前 2workflow 監査と completed 正本への統合結果           |
| 仕様検証レポート            | `outputs/verification-report.md`           | `verify-all-specs.js` の出力                                 |
| artifacts 同期台帳          | `artifacts.json`, `outputs/artifacts.json` | Phase 1-12 完了と移管後の実行台帳                            |

---

_このファイルは TASK-10A-F の仕様書群を管理するインデックスです。_
_最終更新: 2026-03-08_
