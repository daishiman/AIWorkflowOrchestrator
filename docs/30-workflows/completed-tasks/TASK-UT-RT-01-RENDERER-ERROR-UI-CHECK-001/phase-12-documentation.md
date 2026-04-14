# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 12                                           |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 11                                     |
| 後続Phase  | Phase 13                                     |
| 作成日     | 2026-04-13                                   |
| ステータス | completed                                    |

## 目的

Phase 1〜11 の実装・検証結果をドキュメントとして整理し、
実装ガイド・仕様更新サマリー・未タスク検出・スキルフィードバックを完成させる。

## 6タスク構成（全て完了必須）

### Phase 12 実行レーン

| Lane   | 責務      | 主な Task               | 並列方針                              |
| ------ | --------- | ----------------------- | ------------------------------------- |
| Lane-A | Guide     | Task 12-1               | 独立して先行実施                      |
| Lane-B | Spec sync | Task 12-2 / 12-3        | 12-2 を先に固定し、12-3 を続ける      |
| Lane-C | Evidence  | Task 12-4 / 12-5 / 12-6 | 12-4 / 12-5 は並列、12-6 は最終ゲート |

### Task 12-1: 実装ガイド作成（2パート構成）

#### Part 1: 初学者向け概念説明（中学生レベル）

- 日常生活での例え話を含める
- `たとえば` を最低 1 回は明示する
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**例え話の軸**: スキルの実行が失敗したとき、ユーザーに「何が起きたか」を教える仕組みの確認

#### Part 2: 技術者向け詳細

- TypeScript の型定義（`interface` / `type`）
- API シグネチャと使用例
- エラーハンドリングとエッジケース
- 設定可能なパラメータと定数
- `onWorkflowStateChanged(snapshot, errorMessage?)` の variadic シグネチャ
- `currentSurfaceError = localError ?? workflowError ?? skillError` の優先順位
- `data-testid="skill-lifecycle-error"` の条件分岐実装
- Vitest テスト（UT-01〜UT-11）の概要

出力: `outputs/phase-12/implementation-guide.md`

---

### Task 12-2: システム仕様書更新（Step 1-A〜1-G + Step 2）

#### Step 1-A: タスク完了記録

- aiworkflow-requirements の「完了タスク」セクションに追加
- 関連ドキュメントリンク記載
- `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` を同一 wave で更新
- `LOGS.md`（aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方）更新
- `artifacts.json` と `outputs/artifacts.json` の parity を同一 wave で確認

#### Step 1-B: 実装状況テーブル更新

- 本タスクの実装状況を、実装ありなら `completed`、仕様のみなら `spec_created` に更新

#### Step 1-C: 関連タスクテーブル更新

- `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` との関連を current facts に合わせて更新
- 仕様書内の「関連タスク」「未タスク候補」「残課題」を横断確認する

#### Step 1-D: topic-map / index 再生成

- `generate-index.js` で `indexes/topic-map.md` と `indexes/keywords.json` を再生成する
- `validate-structure.js` で index の破綻がないか確認する

#### Step 1-E: 未タスク / リンク検証

- `unassigned-task-detection.md` を 0件でも出力する
- 生成後に `verify-unassigned-links.js` で formalize 先まで辿れることを確認する
- current と baseline を分離して書く

#### Step 1-F: lessons-learned / artifacts 同期

- `lessons-learned.md` に今回の難所・回避策・次回の注意点を追記する
- `artifacts.json` と `outputs/artifacts.json` の completed 一覧を一致させる
- skill artifacts は該当する場合のみ同一 wave で更新する

#### Step 1-G: 検証 / planned wording 監査

- `validate-phase-output.js`
- `verify-all-specs.js`
- `validate-phase11-screenshot-coverage.js`
- `validate-phase12-implementation-guide.js`
- `diff -qr`
- `rg -n "仕様策定のみ|実行予定|保留として記録|TODO|will be|予定"`

#### Step 2: システム仕様更新（条件付き）

- 新規 interface / state / security / UI contract の追加がなければ **N/A**
- 既存 contract のみで閉じる場合は、その根拠を `system-spec-update-summary.md` に明記する
- docs-only / follow-up で後追い code wave が入った場合は再判定する

出力: `outputs/phase-12/system-spec-update-summary.md`

---

### Task 12-3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001
```

出力: `outputs/phase-12/documentation-changelog.md`

- Step 1-A〜1-G と Step 2 の結果を、それぞれ独立した節で記録する
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の parity を記録する
- `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` の更新理由を current facts で残す
- planned wording を最終行まで残さない

---

### Task 12-4: 未タスク検出レポート作成（0件でも必須）

検出ソース:

- Phase 3/10 MINOR 指摘
- Phase 11 で発見した制限事項（IPC runtime E2E、Playwright E2E など）
- コードコメント（TODO/FIXME）
- `describe.skip` ブロック
- current / baseline の差分

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/skill \
  --output .tmp/unassigned-candidates.json

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --target-file outputs/phase-12/unassigned-task-detection.md
```

出力: `outputs/phase-12/unassigned-task-detection.md`

**注意**: 0件でも出力必須。formalize 先がある場合は `unassigned-task/` まで書き切る。

---

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも必須）

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ       |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |
| 次回への引き継ぎ | 次に同種のタスクを実行する際の注意点   |

- 改善点が 0 件でも「改善点なし」と理由を書いて出力する

出力: `outputs/phase-12/skill-feedback-report.md`

---

### Task 12-6: Phase 12 Task Spec 適合チェック

root evidence として残す（削除不可）。

- Task 12-1〜12-5 が完了してから作成する
- `phase12-task-spec-compliance-check.md` に current facts / validator 結果 / mirror parity / artifacts sync を集約する
- `outputs/phase-12/*.md` に planned wording が残っていないことを確認する
- `validate-phase11-screenshot-coverage.js` を通して UI 証跡の欠落がないことを確認する

出力: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## よくある漏れチェックリスト

- [x] LOGS.md は aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の**両方**を更新
- [x] `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` を同一 wave で更新
- [x] topic-map.md を更新した（新規セクション追加時）
- [x] `artifacts.json` と `outputs/artifacts.json` の parity を確認
- [x] `documentation-changelog.md` に全 Step（1-A〜1-G / Step 2）の結果を個別に明記
- [x] `system-spec-update-summary.md` が作成されている
- [x] `unassigned-task-detection.md` が 0件でも出力されている
- [x] `skill-feedback-report.md` が改善点なしでも出力されている
- [x] `phase12-task-spec-compliance-check.md` が root evidence として残っている

## Phase 12 と Phase 13 の境界

| Task      | 完了条件                                             |
| --------- | ---------------------------------------------------- |
| Task 12-1 | `implementation-guide.md` が Part 1/2 を満たす       |
| Task 12-2 | Step 1-A〜1-G と Step 2 の判定が記録される           |
| Task 12-3 | `documentation-changelog.md` が artifacts と同期     |
| Task 12-4 | 0件でも `unassigned-task-detection.md` が出力される  |
| Task 12-5 | 改善点なしでも `skill-feedback-report.md` が出力     |
| Task 12-6 | `phase12-task-spec-compliance-check.md` が残っている |
| Phase 13  | **ユーザーの明示承認後のみ実施**                     |

## 参照資料

| 参照資料                     | パス                                                                                    | 説明               |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                                | Phase 11 成果物    |
| 証跡インデックス             | `outputs/phase-11/evidence-index.md`                                                    | Phase 11 成果物    |
| Phase 12 チェックリスト定義  | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | Task 12-1 / 12-6   |
| 技術ドキュメントガイド       | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Task 12-1 Part 1/2 |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 手順          |
| phase-12-documentation-guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Phase 12 詳細手順  |

## 成果物

| 成果物                 | パス                                                     | 説明                      |
| ---------------------- | -------------------------------------------------------- | ------------------------- |
| 実装ガイド（Part 1/2） | `outputs/phase-12/implementation-guide.md`               | Task 12-1                 |
| 仕様更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`         | Task 12-2                 |
| 更新履歴               | `outputs/phase-12/documentation-changelog.md`            | Task 12-3                 |
| 未タスク検出           | `outputs/phase-12/unassigned-task-detection.md`          | Task 12-4（0件でも必須）  |
| スキルフィードバック   | `outputs/phase-12/skill-feedback-report.md`              | Task 12-5（なしでも必須） |
| Task Spec 適合チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-6                 |

## 完了条件

- [x] Task 12-1〜12-6 が全て完了している
- [x] LOGS.md 2ファイルが同波更新されている
- [x] `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` が同一 wave で更新されている
- [x] topic-map.md が更新されている（セクション変更がある場合）
- [x] `artifacts.json` と `outputs/artifacts.json` の parity が取れている
- [x] `artifacts.json` のステータスが `phase12_completed` に更新されている
- [x] planned wording が `outputs/phase-12/*.md` に残っていない
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の6ファイルを全件生成
- [x] よくある漏れチェックリストを全件確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド"
```

## 次のPhase

Phase 13: PR作成（ユーザーの明示承認後のみ）
