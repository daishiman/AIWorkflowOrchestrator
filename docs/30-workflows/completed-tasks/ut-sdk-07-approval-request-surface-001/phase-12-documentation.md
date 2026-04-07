# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

実装完了後のドキュメント更新・仕様書への反映を行い、workflow artifact と system spec の整合性を確保する。

## Phase 12 記録分離方針

- `実行タスク` は plan、`outputs/phase-12/*.md` と `outputs/artifacts.json` は current fact として扱う
- `phase12-task-spec-compliance-check.md` は Task 12-1〜12-6 の root evidence として必ず作成する
- root `artifacts.json` と `outputs/artifacts.json` の parity を最初に確認する
- docs-only / spec_created workflow では Step 1-B status を `spec_created` とし、`completed` へ置き換えない
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする
- Task 12-1 / 12-3 / 12-4 / 12-5 は Task 12-2 Step 1 が固定された後に並列実行できる
- Task 12-6 は全成果物と validator が揃うまで実行しない

---

## 実行タスク

| Task      | 内容                                                   | 主成果物                                                 |
| --------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 コンプライアンス確認                          | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: Phase 12 コンプライアンス確認（Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 の同値性確認）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと。

### 並列実行方針

- `Task 12-1` / `Task 12-3` / `Task 12-4` / `Task 12-5` は、`Task 12-2` の Step 1 が固定された後に並列実行できる
- `Task 12-6` は全成果物の完成後にのみ実行する

## Task 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する。対象は `onApprovalRequest` surface と `SkillLifecyclePanel` の approval request 接続。

| パート | 対象読者         | 内容                                                               |
| ------ | ---------------- | ------------------------------------------------------------------ |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                                 |
| Part 2 | 開発者・技術者   | 技術的な詳細（型、シグネチャ、使用例、エラー、エッジケース、設定） |

**Part 1 記述ルール**:

- 日常生活での例え話を**必ず**含め、`たとえば` を最低1回明示する
- 専門用語は使わない（使う場合は即座に説明する）
- 「なぜ必要か」を先に説明してから「何をするか」を説明する

**Part 2 追補ルール**:

- current contract と target delta を分けて書く
- TypeScript の interface / type 定義を含める
- API シグネチャと使用例を記載する
- エラーハンドリングとエッジケースを説明する
- 設定可能なパラメータと定数を一覧化する

**確認コマンド**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

---

## Task 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須】

#### Step 1-A: 仕様書完了記録

- [ ] `phase-12-documentation.md` に完了記録を追加する
- [ ] `index.md` の Phase 12 参照を canonical outputs と一致させる
- [ ] `artifacts.json` を更新する
- [ ] `outputs/artifacts.json` を生成し、root `artifacts.json` との parity を確認する
- [ ] `skill-creator-api.ts` / `SkillLifecyclePanel.tsx` の JSDoc / コメント状態を確認する
- [ ] `system-spec-update-summary.md` に current / baseline の差分を記録する
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` に必要なタスク完了エントリを追加する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` に必要なタスク完了記録を追加する
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴を更新する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴を更新する

#### Step 1-B: 実装状況テーブル更新

- [ ] 実装完了の対象は `completed`
- [ ] 仕様作成のみで実装未着手の場合は `spec_created`

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK_ID" references/` で関連仕様書を検索する
- [ ] 仕様書内の「関連タスク」「未タスク候補」テーブルの状態を更新する

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
- [ ] 変更した見出しの行番号が `topic-map.md` と一致していることを確認する

#### Step 1-E: 未タスク登録

- [ ] 0件でも detection report を出力する
- [ ] 1件以上なら `docs/30-workflows/unassigned-task/` に正式化する

#### Step 1-F: 補助更新

- [ ] 必要に応じて lessons learned、cross-skill spec、workflow summary を同期する

#### Step 1-G: 検証

- [ ] `quick_validate.js`
- [ ] `validate_all.js`
- [ ] `verify-all-specs.js`
- [ ] `validate-phase-output.js`
- [ ] `diff -qr`

### Step 2: システム仕様更新【条件付き】

| 更新必要                     | 更新不要                    |
| ---------------------------- | --------------------------- |
| 新規 interface / 型追加      | 内部実装の変更のみ          |
| 既存 interface 変更          | リファクタリング（IF 不変） |
| 新規定数 / 設定値追加        | バグ修正（仕様変更なし）    |
| API / IPC / UI contract 変更 | テスト追加のみ              |

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- `system-spec-update-summary.md` には、更新の有無と理由を必ず残す
- Step 2 が不要でも、判断根拠を `documentation-changelog.md` に残す

---

## Task 12-3: ドキュメント更新履歴【必須】

**必須成果物**: `outputs/phase-12/documentation-changelog.md`

**記載内容**:

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- root `artifacts.json` と `outputs/artifacts.json` の同期結果
- `implementation-guide.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の canonical path
- `phase12-task-spec-compliance-check.md` の canonical path
- planned wording（`計画済み` / `予定` / `TODO` / `PR マージ後`）の残存有無

---

## Task 12-4: 未タスク検出【必須】

**必須成果物**: `outputs/phase-12/unassigned-task-detection.md`

**記載内容**:

- 0件でも summary を残す
- 1件以上なら formalize path を記録する
- raw メモで終わらせず、`audit-unassigned-tasks.js --target-file` が通る full template まで昇格させる
- baseline 違反が多い場合は `current` と `baseline` を分離して記録する
- 親タスクの苦戦箇所を `unassigned-task/` に formalize する場合は、3ステップ（指示書作成 → task-workflow.md 登録 → 関連仕様書リンク）を満たす
- `verify-unassigned-links.js` を実行し、`task-workflow.md` の参照切れが 0 件であることを確認する

---

## Task 12-5: スキルフィードバック【必須】

**必須成果物**: `outputs/phase-12/skill-feedback-report.md`

**記載内容**:

- 改善点があれば next action を書く
- 改善点がなくても「なし」と理由を書く
- この workflow に対する改善提案と、skill 自体への改善提案を分けて記録する

---

## Task 12-6: コンプライアンス確認【必須】

**必須成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

**記載内容**:

- Task 12-1〜12-5 の全完了確認
- Step 1-A〜1-G / Step 2 の実施結果
- `artifacts.json` と `outputs/artifacts.json` の同値性
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4点同期
- planned wording の残存なし
- `outputs/phase-12/*.md` に `仕様策定のみ` / `実行予定` / `TODO` などが残っていないこと
- `verify-unassigned-links.js` の結果が 0 件であること

---

## 参照資料

| 参照資料                  | パス                                                                                    | 内容                         |
| ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| 実装ガイド定義            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 実装ガイド要件               |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1 / Part 2 の記述ルール |
| システム仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 の実行フロー |
| 検証マトリクス            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator と記録先の正本     |
| Phase 12 詳細テンプレート | `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md` | 6成果物の詳細定義            |

---

## 成果物

| 成果物                       | パス                                                                                                                                                          | 内容                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                                                                                                    | 概念的 + 技術的ドキュメント |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`                                                                                                              | Step 1 / Step 2 の結果      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                                                                                                 | 変更内容サマリー            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                                                                                               | 検出結果（0件でも必須）     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                                                                                                   | 改善点（なしでも必須）      |
| コンプライアンスチェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                                      | Task 12-1〜12-6 の準拠確認  |
| 台帳                         | `docs/30-workflows/ut-sdk-07-approval-request-surface-001/artifacts.json` / `docs/30-workflows/ut-sdk-07-approval-request-surface-001/outputs/artifacts.json` | parity 同期                 |

---

## 完了条件

- [ ] Task 12-1〜12-6 の全成果物が作成されている
- [ ] implementation-guide.md の Part 1 / Part 2 が要件を満たしている
- [ ] system-spec-update-summary.md に Step 1 / Step 2 の結果が記録されている
- [ ] documentation-changelog.md に current / baseline と artifacts parity が記録されている
- [ ] unassigned-task-detection.md が 0件でも作成されている
- [ ] skill-feedback-report.md が改善点なしでも作成されている
- [ ] phase12-task-spec-compliance-check.md が Task 12-1〜12-6 の root evidence として完成している
- [ ] root `artifacts.json` と `outputs/artifacts.json` が同期している
- [ ] `phase-12-documentation.md` / `outputs/phase-12/*.md` に planned wording が残っていない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 13: PR作成（blocked） → [phase-13-pr-creation.md](phase-13-pr-creation.md)
