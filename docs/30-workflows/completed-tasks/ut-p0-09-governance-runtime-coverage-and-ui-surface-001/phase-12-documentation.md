# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 12                                                      |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

実装ガイド・システムドキュメント更新・未タスク検出・スキルフィードバック・準拠チェックを作成し、ドキュメントを最新化する。

## 実行タスク

- タスク1: 実装ガイド作成（Part 1 + Part 2）【必須】
- タスク2: システムドキュメント更新（Step 1-A〜1-D + Step 2）【必須】
- タスク3: ドキュメント更新履歴作成【必須】
- タスク4: 未タスク検出【必須・0件でも出力】
- タスク5: スキルフィードバックレポート作成【必須・改善点なしでも出力】
- タスク6: phase12-task-spec-compliance-check【必須】

## 参照資料

| 資料名                | パス                                                                                    | 説明             |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| Phase 12 ガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | 詳細手順         |
| Phase 12 テンプレート | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`        | 必須タスクの正本 |
| Phase 12 準拠チェック | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 必須項目の検証   |
| 検証行列              | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator 条件   |
| Phase 11 証跡         | `outputs/phase-11/`                                                                     | 手動テスト結果   |
| 実装ファイル          | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`   | 実装内容         |

## 実行手順

### タスク1: 実装ガイド作成

**出力先**: `outputs/phase-12/implementation-guide.md`

**Part 1（初学者向け）**:

- `## Part 1`
  - `### なぜ必要か` — governance 状態を「見える化」する必要性
  - `### 何をするか` — GovernanceSummaryPanel の機能説明
  - `### 日常の例え` — 「たとえば:」必須（例: 空港のセキュリティゲートのように、各ツール呼び出しが許可されているか確認する）
  - `### 今回作ったもの` — 概念一覧表

**Part 2（開発者向け）**:

- `## Part 2`
  - `### 型定義` — SkillCreatorGovernanceState
  - `### 使用例` — GovernanceSummaryPanel の使用例
  - `### エラーハンドリング` — IPC エラー時の挙動
  - `### エッジケース` — recentDenials 空の場合、ポーリング中断の場合
  - `### 設定項目と定数一覧` — ポーリング間隔等
  - `### テスト構成` — テスト数と実測カバレッジ値

### タスク2: システムドキュメント更新

**Step 1-A: 仕様書完了記録**

- workflow 本文の `phase-12-documentation.md` と `task-workflow.md` を同期
- aiworkflow-requirements 仕様書に完了記録追加
- `artifacts.json` と `outputs/artifacts.json` を同一内容へ同期
- LOGS.md 2ファイル同時更新:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
- SKILL.md 変更履歴更新:
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`

**Step 1-B: 実装状況テーブル更新**

- `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` を「未実装」→「完了」
- current facts と矛盾しないことを確認する

**Step 1-C: 関連タスクテーブル更新**

- TASK-P0-09 仕様書に follow-up 完了記録追加
- `関連タスク` / `未タスク候補` / `残課題` の table を grep で横断確認

**Step 1-D: topic-map.md 再生成（変更があれば）**

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**Step 2: システム仕様更新**

- GovernanceSummaryPanel は新規インターフェース追加に該当 → 更新必要
- governance 全フェーズ適用の明示化
- 更新対象は `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` を優先し、必要時のみ関連 `interfaces-*.md` / `task-workflow.md` へ波及させる
- 更新不要の場合も、その理由を `system-spec-update-summary.md` と `documentation-changelog.md` に残す

### タスク3: ドキュメント更新履歴

**出力先**: `outputs/phase-12/documentation-changelog.md`

- Step 1-A〜Step 2 の実行結果を記録
- current / baseline / validator 結果を分けて記録
- `artifacts.json` と `outputs/artifacts.json` の同期結果を記録

### タスク4: 未タスク検出

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

確認ソース:

1. Phase 3 レビューの MINOR 指摘事項
2. Phase 10 レビューの MINOR 指摘事項
3. Phase 11 `discovered-issues.md`
4. Phase 成果物の TODO/FIXME コメント
5. コードベースの TODO/FIXME コメント

0件でも `unassigned-task-detection.md` を作成し、0件と明記する。

### タスク5: スキルフィードバックレポート

**出力先**: `outputs/phase-12/skill-feedback-report.md`

| セクション       | 内容                                                              |
| ---------------- | ----------------------------------------------------------------- |
| テンプレート改善 | Phase 11 スクリーンショット要件の明確化提案等                     |
| ワークフロー改善 | 機械検証の改善余地                                                |
| ドキュメント改善 | 横断ガイドライン化の候補                                          |
| 準拠改善         | task-specification-creator / aiworkflow-requirements への改善提案 |

### タスク6: phase12-task-spec-compliance-check【必須】

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 1〜5 の完了確認
- Step 1-A〜1-D と Step 2 の完了確認
- 計画系 wording 残存の有無確認
- `artifacts.json` / `outputs/artifacts.json` 同期確認
- `validate-phase12-implementation-guide.js` / `verify-all-specs` / `validate-phase-output` の結果確認

## 成果物

| 成果物               | パス                                                     | 説明                         |
| -------------------- | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1/2 必須                |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 の結果              |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`            | Step 1-A〜2 結果             |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力                  |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善提案                     |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜5 / Step 1〜2 の確認 |

## 完了条件

- [ ] 実装ガイド（Part 1 + Part 2）が作成されている（「たとえば:」必須）
- [ ] LOGS.md 2ファイルが同時更新されている
- [ ] topic-map.md が再生成されている（変更があれば）
- [ ] 未タスク検出レポートが出力されている（0件でも）
- [ ] スキルフィードバックレポートが出力されている（改善点なしでも）
- [ ] システム仕様更新サマリーが出力されている
- [ ] phase12-task-spec-compliance-check が出力されている
- [ ] `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR 作成
