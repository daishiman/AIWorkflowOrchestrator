# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                   |
| --------- | ---------------------- |
| Phase     | 12                     |
| 名称      | ドキュメント更新       |
| 前提Phase | Phase 11（手動テスト） |
| 次Phase   | Phase 13（PR作成）     |
| 作成日    | 2026-04-03             |

## 目的

Phase 12 の必須6タスクは完了済み。実装ガイド作成、システム仕様書更新、ドキュメント更新履歴、未タスク検出、スキルフィードバック、タスク仕様準拠チェックを同一ターンで記録する。

## 実行タスク

### Task 12-1: 実装ガイド作成（2パート構成）

#### Part 1: 初学者・中学生レベル

対象読者: 初学者・中学生レベル
内容:

- 日常生活の例え話を使った概念説明（たとえば「verify は先生が宿題をチェックするようなもの」「improve は赤ペンで直すようなもの」）
- 「なぜ verify / improve パネルが必要か」を先に説明
- 専門用語は使わない（使う場合は即座に説明）

#### Part 2: 技術者レベル

対象読者: 開発者・技術者
内容:

- VerifyResultDetailPanel / ImproveResultDetailPanel のインターフェース/型定義
- Props と使用例
- Layer 別グループ化ロジック
- result-panel-parts.tsx との統合パターン
- StatusBadge の label override 設計
- エラーハンドリングとエッジケース

成果物: `outputs/phase-12/implementation-guide.md`

### Task 12-2: システム仕様書更新（5サブステップ）

#### Step 1-A: タスク完了記録

- 完了タスクセクション追加
- 関連ドキュメントリンク
- 変更履歴
- task-workflow.md の完了記録更新（必要な場合）
- LOGS.md × 2（aiworkflow-requirements + task-specification-creator）
- SKILL.md × 2（aiworkflow-requirements + task-specification-creator）

#### Step 1-B: 実装状況テーブル更新

- TASK-RT-03-VERIFY-IMPROVE-PANEL-001 のステータスを「完了」に更新

#### Step 1-C: 関連タスクテーブル更新

- TASK-RT-03 の関連タスクとして本タスクの完了を記録
- TASK-SDK-02 との関連を更新

#### Step 1-D: topic-map.md 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js --workflow docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001 --regenerate` を実行
- 再生成された topic-map.md の新規見出しと行番号が正しいことを確認する
- `indexes/topic-map.md` と `indexes/keywords.json` の両方が再生成済みであることを確認する

#### Step 2: システム仕様更新（完了）

判定: 新規 UI コンポーネント（VerifyResultDetailPanel / ImproveResultDetailPanel）を追加したが、IPC インターフェースの変更はなし。UI コンポーネントのリファレンス更新と completed records の同期を実施済み。

- workflow 定義や教訓の同期は不要と判断し、同一ターンで `task-workflow-completed-skill-lifecycle-ui.md` / `ui-ux-feature-components-reference.md` / `ui-ux-feature-components-history.md` を更新した。

成果物: `outputs/phase-12/system-spec-update-summary.md`

### Task 12-3: ドキュメント更新履歴作成

Step 1-A〜1-D、Step 2 の結果を個別に明記（「該当なし」も記録）。

成果物: `outputs/phase-12/documentation-changelog.md`

### Task 12-4: 未タスク検出レポート（0件でも出力必須）

確認ソース:

- 元タスク仕様書のスコープ外項目（Storybook Story: TASK-RT-03-STORYBOOK-001）
- Phase 3/10 レビューの MINOR 指摘
- Phase 11 手動テストの発見事項
- コードコメント（TODO/FIXME/HACK/XXX）

成果物: `outputs/phase-12/unassigned-task-detection.md`

### Task 12-5: スキルフィードバックレポート（改善点なしでも出力必須）

観点:

- テンプレート改善
- ワークフロー改善
- ドキュメント改善

成果物: `outputs/phase-12/skill-feedback-report.md`

### Task 12-6: タスク仕様準拠チェック（root evidence）

Task 12-1〜12-5 と Step 1-A〜1-D / Step 2 の準拠状況を 1 ファイルへ集約する。成果物の存在だけでなく、implementation guide 品質、未タスク配置、system spec 同期、検証値の同値転記、current / baseline の分離、`validate-phase12-implementation-guide`、`verify-unassigned-links`、`audit-unassigned-tasks`、`quick_validate.js` / `validate_all.js` / `diff -qr` の確認まで含める。

補助確認:

- Step 1-E: `verify-unassigned-links` / `audit-unassigned-tasks`
- Step 1-F: `task-workflow.md` / `lessons-learned.md` の同期要否
- Step 1-G: `validate-phase12-implementation-guide` / `quick_validate.js` / `validate_all.js` / `diff -qr`

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 成果物

| 成果物                       | 配置先                                                   |
| ---------------------------- | -------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              |
| タスク仕様準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [x] Task 12-1: 実装ガイドが Part 1/2 を満たしている
- [x] Task 12-2: Step 1-A〜1-D と Step 2 判定が記録されている
- [x] Task 12-3: documentation-changelog.md が全 Step の結果を個別に記録している
- [x] Task 12-4: 未タスク検出レポートが出力されている（0件でも）
- [x] Task 12-5: スキルフィードバックレポートが出力されている（改善点なしでも）
- [x] Task 12-6: タスク仕様準拠チェックが root evidence として出力されている
- [x] LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されている
- [x] SKILL.md 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されている
- [x] topic-map.md が再生成されている

## タスク100%実行確認【必須】

- [x] Task 12-1: 実装ガイド作成
- [x] Task 12-2: システム仕様書更新
- [x] Task 12-3: ドキュメント更新履歴作成
- [x] Task 12-4: 未タスク検出レポート
- [x] Task 12-5: スキルフィードバックレポート
- [x] Task 12-6: タスク仕様準拠チェック

## 次Phase

Phase 13（PR作成）はユーザーの明示的な許可待ちで blocked。
