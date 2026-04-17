# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 11（手動テスト）          |
| 後続Phase  | Phase 13                        |
| 作成日     | 2026-04-16                      |
| ステータス | completed                       |

## 目的

TASK-SC-SHARED-TYPE-PROMOTE-001 の実装完了（または「昇格不要」のクローズ）を受け、
実装ガイド・system spec 更新サマリー・更新履歴・未タスク検出・スキルフィードバック・準拠チェックの
6成果物を同一 wave で閉じる。

## 実行タスク（全6タスク必須）

### 事前チェック: Phase 12 開始前 parity 確認

- [ ] `outputs/artifacts.json` を生成し、root `artifacts.json` との parity を確認する
- [ ] `diff -qr artifacts.json outputs/artifacts.json` で drift が 0 件であることを確認してから Task 12-1 へ進む

### Task 12-1: 実装ガイド作成

`outputs/phase-12/implementation-guide.md` を作成する。

**Part 1（中学生レベル）**:

- なぜこのタスクが必要だったのかを日常の例え話を使って説明する
- 「型定義を一か所にまとめる」という概念を `たとえば` を使って説明する
- 「Single Source of Truth」の意味を中学生でもわかる言葉で説明する

**Part 2（開発者レベル）**:

- `StructurePlanJson` インタフェースの定義・フィールド一覧
- `@repo/shared/types` からの import 方法（使用例）
- 昇格前後の変更サマリー（昇格した場合 / 昇格しなかった場合）
- 昇格しなかった場合: ローカル定義維持の理由と将来の判断基準

### Task 12-2: システム仕様書更新

`outputs/phase-12/system-spec-update-summary.md` を作成し、Step 1-A〜1-G と Step 2 の実施結果を記録する。

#### Step 1-A: タスク完了記録

- `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- `.claude/skills/task-specification-creator/LOGS.md` を更新する
- 関連仕様書に `## 完了タスク` セクションを追加する
- 関連仕様書に実装ガイドへのリンクを追加する

#### Step 1-B: 実装状況テーブル更新

- 実装完了の場合: 対象タスクを `completed` に更新する
- 仕様書作成のみの場合: `spec_created` を使う
- `.claude/skills/aiworkflow-requirements/references/` の関連ファイルを更新する

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-SC-SHARED-TYPE-PROMOTE-001" .claude/skills/aiworkflow-requirements/references/
```

- マッチした仕様書の関連タスクや未タスク候補のステータスを更新する
- `TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001` との依存関係を記録する

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 1-E: 未タスク指示書とリンク整合

- 未タスク候補がある場合は `docs/30-workflows/unassigned-task/` に指示書を作成する
- `task-workflow.md` の残課題テーブルへ登録する

#### Step 1-F: DevOps / UI / screenshot の追加同期

- 本タスクは NON_VISUAL であり、原則 N/A
- N/A の理由を `system-spec-update-summary.md` に記録する

#### Step 1-G: 検証コマンド順次実行

```bash
# 実装ガイド内容要件
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001 \
  --json

# ワークフロー全体の整合
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001 \
  --strict

# 未タスクリンク / 未タスク監査
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001 \
  --output docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001/outputs/phase-12/.tmp-unassigned-candidates.json

# SKILL構造検証（正しい path）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

### Task 12-3: ドキュメント更新履歴

`outputs/phase-12/documentation-changelog.md` を作成する。

記録内容:

- 本タスクで変更したファイル一覧（昇格実施の場合）
- 変更種別（追加 / 変更 / 削除）
- 変更理由

### Task 12-4: 未タスク検出レポート

`outputs/phase-12/unassigned-task-detection.md` を作成する。

調査対象:

- `StructurePlanJson` に追加フィールドが必要になる可能性がある未タスク
- `@repo/shared/types` の型定義管理に関する未タスク
- `TASK-SC-SHARED-TYPE-PROMOTE-001` の完了後に発生する可能性のある後続タスク

### Task 12-5: スキルフィードバックレポート

`outputs/phase-12/skill-feedback-report.md` を作成する。

記録内容:

- task-specification-creator skill への改善提案
- 型昇格判断タスクに特化したテンプレートの改善点
- 条件付き成果物（昇格実施の場合のみ）の扱いに関するフィードバック

### Task 12-6: Phase 12 準拠チェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する。

確認内容:

- Task 12-1〜12-5 の全成果物が揃っていること
- 各成果物のフォーマットが準拠していること
- Phase 12 完了条件を全て満たしていること

## 参照資料

| 資料名                  | パス                                                                                    | 用途                  |
| ----------------------- | --------------------------------------------------------------------------------------- | --------------------- |
| Phase 12 完了条件       | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | parity / 完了条件確認 |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                                | 完了確認              |
| Phase 1 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`                                                | AC-1〜AC-5 確認       |
| Phase 9 品質保証記録    | `outputs/phase-9/qa-results.md`                                                         | 実装結果確認          |
| GitHub Issue #2182      | [#2182](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2182)                | タスク原本確認        |
| task-workflow.md        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | ステータス更新先      |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                 | 内容     |
| ------------------ | -------------------------------------------------------------------- | -------- |
| LOGS.md            | `.claude/skills/aiworkflow-requirements/LOGS.md`                     | 更新対象 |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 更新対象 |

## 統合テスト連携

Phase 12 は NON_VISUAL タスクのため、統合テストの対象は N/A です。
ドキュメントの整合性確認が主な作業です。

## 多角的チェック観点（AIが判断）

- **中学生レベルの説明の質**: 「型定義を一か所にまとめる」という抽象概念を、具体的な日常の例え話で説明できているか
- **昇格不要の場合のドキュメント**: 昇格しなかった場合も、その判断理由と将来の再判断基準を記録することでタスクの価値を残す
- **Phase 12 の closed issue 対応**: Issue #2182 は CLOSED 状態だが、仕様書作成は有効なため、「仕様書作成完了・実装判断待ち」として記録する

## サブタスク管理

| サブタスクID | 名称                                         | ステータス |
| ------------ | -------------------------------------------- | ---------- |
| T-12-1       | 実装ガイド作成（Part1中学生 + Part2技術者）  | completed  |
| T-12-2       | システム仕様書更新（Step 1-A〜1-G + Step 2） | completed  |
| T-12-3       | ドキュメント更新履歴                         | completed  |
| T-12-4       | 未タスク検出レポート                         | completed  |
| T-12-5       | スキルフィードバックレポート                 | completed  |
| T-12-6       | Phase 12 準拠チェック                        | completed  |

## 成果物

| 成果物名                                | パス                                                     | 種別         |
| --------------------------------------- | -------------------------------------------------------- | ------------ |
| 実装ガイド（Part1中学生 + Part2技術者） | `outputs/phase-12/implementation-guide.md`               | ドキュメント |
| システム仕様書更新サマリー              | `outputs/phase-12/system-spec-update-summary.md`         | ドキュメント |
| ドキュメント更新履歴                    | `outputs/phase-12/documentation-changelog.md`            | ドキュメント |
| 未タスク検出レポート                    | `outputs/phase-12/unassigned-task-detection.md`          | ドキュメント |
| スキルフィードバックレポート            | `outputs/phase-12/skill-feedback-report.md`              | ドキュメント |
| Phase 12 準拠チェック                   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ドキュメント |

## 完了条件

- [ ] Task 12-1〜12-6 の全成果物が作成されていること
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G の実施結果が記録されていること
- [ ] `implementation-guide.md` に Part 1（中学生レベル）と Part 2（開発者レベル）が含まれていること
- [ ] `unassigned-task-detection.md` に未タスク候補が記録されていること
- [ ] `phase12-task-spec-compliance-check.md` で全チェックが PASS していること

## タスク100%実行確認【必須】

- [ ] Task 12-1: 実装ガイド作成完了
- [ ] Task 12-2: システム仕様書更新完了（Step 1-A〜1-G + Step 2）
- [ ] Task 12-3: ドキュメント更新履歴作成完了
- [ ] Task 12-4: 未タスク検出レポート作成完了
- [ ] Task 12-5: スキルフィードバックレポート作成完了
- [ ] Task 12-6: Phase 12 準拠チェック完了

## 次Phase

[Phase 13: PR作成](phase-13-pr-creation.md)
