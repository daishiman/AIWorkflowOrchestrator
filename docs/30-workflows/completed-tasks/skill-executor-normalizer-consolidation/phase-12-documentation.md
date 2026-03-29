# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 内容             |
| --------- | ---------------- |
| Phase     | 12               |
| Phase名   | ドキュメント更新 |
| カテゴリ  | 文書化           |
| 前提Phase | Phase 11         |
| 後続Phase | Phase 13         |

## 目的

実装ガイド、システム仕様書更新、ドキュメント更新履歴、未タスク検出、スキルフィードバック、Phase 12 準拠チェックの6タスクを全て完了する。

## Phase 12 初手チェック

Phase 12 着手前に `outputs/artifacts.json` と各 `phase-*.md` の artifact 名を1対1で突合し、不一致があれば着手前に修正する。

## 実行タスク（6タスク - 全て完了必須）

### Task 12-1: 実装ガイド作成（2パート構成）

#### Part 1: 初学者・中学生レベル

**目的**: 技術的背景のない読者に「なぜこの変更が必要か」を説明する

**必須要件**:

- 日常生活での例え話を含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**例え話の案**: 「同じ翻訳作業を2人が別々にやっていたのを、共通のマニュアルにまとめた」

#### Part 2: 開発者・技術者レベル

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- API シグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**成果物**: `outputs/phase-12/implementation-guide.md`

### Task 12-2: システム仕様書更新（4サブステップ）

#### Step 1-A: タスク完了記録

- 完了タスクセクション追加
- 関連ドキュメントリンク
- 変更履歴
- LOGS.md × 2 更新（aiworkflow-requirements + task-specification-creator）
- topic-map.md 更新

#### Step 1-B: 実装状況テーブル更新

- `未実装` → `completed` に更新

#### Step 1-C: 関連タスクテーブル更新

- TASK-RT-06 の関連タスクテーブルで本タスクのステータスを更新

#### Step 2: システム仕様更新（条件付き）

本タスクはリファクタリング（インターフェース不変）のため、**Step 2 は N/A**。

判断根拠:

- 新規インターフェース追加なし
- 既存インターフェース変更なし
- 新規定数/設定値の追加なし
- API 仕様の変更なし

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Task 12-3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js
```

**成果物**: `outputs/phase-12/documentation-changelog.md`

### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan apps/desktop/src/main/services/runtime apps/desktop/src/main/services/skill --output .tmp/unassigned-candidates.json
```

**確認ソース**:

| ソース                  | 確認項目                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| 元タスク仕様書          | スコープ外項目（SkillStreamMessage/SkillCreatorSdkEvent 型統一） |
| Phase 3/10 レビュー結果 | MINOR 判定の指摘事項                                             |
| Phase 11 手動テスト     | スコープ外の発見事項                                             |
| コードコメント          | TODO/FIXME/HACK/XXX                                              |

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ       |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### Task 12-6: Phase 12 準拠チェック

**目的**: Task 12-1〜12-5 の成果物、validator 実測値、artifact 台帳同期を突合し、将来表現の残存や漏れがないことを最終確認する

**必須確認項目**:

- `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` が残っていないこと
- `outputs/artifacts.json` と `artifacts.json` の Phase 12 artifact 一覧が一致していること
- `outputs/phase-11/manual-test-result.md` と `outputs/phase-11/manual-test-checklist.md` の整合が取れていること
- `validate-phase-output` / `verify-all-specs` の実行結果を記録していること
- Step 2 を N/A とした根拠が `system-spec-update-summary.md` と `documentation-changelog.md` の両方に残っていること

**確認コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-executor-normalizer-consolidation --phase 12

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/skill-executor-normalizer-consolidation
```

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 参照資料             | パス                                                                                   | 内容                  |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------- |
| Phase 12 ガイド      | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Phase 12 詳細手順     |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1-A〜Step 2 手順 |
| 未タスクガイドライン | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`   | 未タスク検出基準      |

## 成果物一覧

| 成果物                       | パス                                                     | 必須 |
| ---------------------------- | -------------------------------------------------------- | ---- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | ✅   |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| Phase12準拠チェック          | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

## 完了条件

- [ ] Task 12-1: implementation-guide.md が Part 1/2 を満たすこと
- [ ] Task 12-2: Step 1-A〜1-C が完了し、Step 2 の判定が記録されていること
- [ ] Task 12-3: documentation-changelog.md が作成されていること
- [ ] Task 12-4: unassigned-task-detection.md が作成されていること（0件でも出力）
- [ ] Task 12-5: skill-feedback-report.md が作成されていること（改善点なしでも出力）
- [ ] Task 12-6: phase12-task-spec-compliance-check.md が作成されていること
- [ ] LOGS.md が2ファイル（aiworkflow-requirements + task-specification-creator）更新されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] Task 12-1: 実装ガイド作成 → 完了
- [ ] Task 12-2: システム仕様書更新 → 完了
- [ ] Task 12-3: ドキュメント更新履歴 → 完了
- [ ] Task 12-4: 未タスク検出レポート → 完了
- [ ] Task 12-5: スキルフィードバックレポート → 完了
- [ ] Task 12-6: Phase 12 準拠チェック → 完了

## 次Phase

Phase 13（PR作成）へ進む。全 Task 完了前に Phase 13 に着手しないこと。
