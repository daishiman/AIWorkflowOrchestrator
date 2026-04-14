# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 12                                                |
| Phase名    | ドキュメント更新                                  |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                          |
| 機能名     | current facts 同期・skill準拠検証・docs-only 改善 |
| 前提Phase  | Phase 11                                          |
| 次Phase    | Phase 13                                          |
| ステータス | pending                                           |
| 作成日     | 2026-04-14                                        |

## 目的

Phase 1〜11 の成果を、task-specification-creator / aiworkflow-requirements の正本に照らしてドキュメントへ同期する。
current facts を固定しつつ、issue 8 の follow-up 候補を別タスクへ切り出したうえで、workflow の current contract を future drift に耐える形へ整える。

---

## SubAgent分担

| SubAgent | 担当                                        | 並列条件     |
| -------- | ------------------------------------------- | ------------ |
| A        | Task 1 実装ガイド Part 1（中学生向け）草案  | B と並列可   |
| B        | Task 1 実装ガイド Part 2（技術者向け）草案  | A と並列可   |
| C        | Task 2 システム仕様更新（Step 1-A/1-B/1-C） | A/B と並列可 |
| D        | Task 2 Step 2 + Task 3 ドキュメント更新履歴 | C 完了後     |
| E        | Task 4 未タスク検出 + Task 5 フィードバック | D と並列可   |
| F        | Task 6 phase12-task-spec-compliance-check   | A〜E 完了後  |

---

## 実行タスク

- [ ] **Task 1**: 実装ガイド作成（Part 1 中学生向け / Part 2 技術者向けの2パート構成）
- [ ] **Task 2**: システム仕様書更新（4サブステップ: Step 1-A/1-B/1-C + Step 2）
- [ ] **Task 3**: ドキュメント更新履歴作成
- [ ] **Task 4**: 未タスク検出レポート作成（0件でも出力必須）
- [ ] **Task 5**: スキルフィードバックレポート作成（改善点なしでも出力必須）
- [ ] **Task 6**: `phase12-task-spec-compliance-check.md` 作成

---

## 実行手順

### Task 1: 実装ガイド作成【必須・2パート構成】

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 初学者・中学生レベルの概念説明

**テーマ**: 「一覧がすぐ更新されること」と「失敗したときに止まりすぎないことを分けて考える」

日常生活での例え話を必ず含め、技術用語を使わずに概念を説明する。

**必須の例え話**:

- **スキル一覧が更新される問題**:
  たとえば、「新しい商品を倉庫に入れたのに、店頭の棚札が古いまま」ではお客さんに伝わらない。
  今回の実際の動きは、棚札を更新する担当がすでにいることを示している。

- **空なら失敗画面に分ける仕組み**:
  「荷物が届いたか確認して、届いていなければ受け取り案内を出す」ように、結果が空なら失敗画面に分ける。
  何も届いていないのに成功したように見せないことが大事。

- **成功ヘッダーの条件表示**:
  「答案が返ってきてから点数を見せる」のと同じで、結果が空のときに合格メッセージを出さない。

#### Part 2: 開発者・技術者レベルの技術的詳細

**テーマ**: current contract の固定、evidence の対応、follow-up 候補の分離

**必須要素**:

- **current contract**:
  - `CompleteStepProps` は `skillPath?: string | null`
  - `onRetry?: () => void` はオプショナル
  - `skillPath === null` のみがエラー UI
  - `skillPath !== null` で成功ヘッダー / 完了 UI

- **SkillLifecyclePanel current flow**:
  - `executePlan → loadVerifyDetail → fetchSkills → selectSkillByName`
  - `terminal_handoff` は early return

- **follow-up 候補**:
  - issue 8 の `fetchSkills()` 非ブロッキング化は current task に含めない
  - 必要なら別タスクとして `SkillLifecyclePanel` とそのテストに限定する

- **evidence mapping**:
  - `SkillLifecyclePanel.llm-generation.test.tsx`
  - `CompleteStep.test.tsx`

- **output parity**:
  - `artifacts.json` と `outputs/artifacts.json` の同期
  - `phase13 blocked` の明記

**Part 2 必須見出し**:

5. **Consumer Contract & IPC Compatibility**:
   - IPC 変更なしのため N/A
   - public API の変更がないことを明記

---

### Task 2: システム仕様書更新【必須・4サブステップ】

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: タスク完了記録

- TASK-SW-FIX-FEEDBACK-001 のステータスを `completed` に更新する
- `artifacts.json` と `outputs/artifacts.json` の Phase 状態を同期する
- `phase13` を `blocked` として明記する
- `LOGS.md` を更新する（aiworkflow-requirements + task-specification-creator）
- `SKILL.md` の変更履歴を更新する（aiworkflow-requirements + task-specification-creator）
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に current facts / follow-up 分離セクションを追加する

#### Step 1-B: 実装状況テーブル更新

以下のステータスを current facts に合わせて更新する:

| 項目                                   | 旧ステータス | 新ステータス  |
| -------------------------------------- | ------------ | ------------- |
| SkillLifecyclePanel current flow       | 未反映       | 完了          |
| terminal_handoff early return          | 未反映       | 完了          |
| CompleteStep skillPath null ガード     | 未反映       | 完了          |
| CompleteStep 成功ヘッダー条件表示      | 未反映       | 完了          |
| issue 8 の non-blocking follow-up 分離 | 未整理       | follow-up候補 |

#### Step 1-C: 関連タスクテーブル更新

| タスクID                 | 旧ステータス | 新ステータス | 備考                           |
| ------------------------ | ------------ | ------------ | ------------------------------ |
| TASK-SW-FIX-FEEDBACK-001 | 未実施       | completed    | Wave B                         |
| TASK-SW-FIX-DATAFLOW-001 | 完了済み     | 完了済み     | Wave A（前提タスク、変更なし） |

#### Step 2: システム仕様更新（条件付き実行）

- `CompleteStepProps` の current contract を仕様本文へ反映する
- `fetchSkills()` 非ブロッキング化は current task ではなく follow-up として記録する
- 公開 API / IPC の変更がないため、変更なしの根拠を記録する

---

### Task 3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- `artifacts.json` と `outputs/artifacts.json` の同期結果
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点同期結果
- Step 1-A で更新した `aiworkflow-requirements` / `task-specification-creator` の `SKILL.md` / `LOGS.md` を canonical path で列挙する
- `更新予定` / `計画済み` / `PR マージ後に実施` のような future wording を残さない

---

### Task 4: 未タスク検出レポート作成

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

本タスク実装中に発見した未解決事項・後続タスクの候補を記録する。
**0件でも結論を残し、summary を出力すること。**

**検出ソース**:

- Phase 3/10 の MINOR 指摘
- Phase 11 の発見課題（`discovered-issues.md`）
- ソースコード内の TODO/FIXME

> 0件の場合: 「検出対象を精査した結果、未タスクは0件であった。」と明記する。

---

### Task 5: スキルフィードバックレポート作成

**出力先**: `outputs/phase-12/skill-feedback-report.md`

- `task-specification-creator` の Phase 12 で current facts を先に固定する改善点があれば next action を書く
- `aiworkflow-requirements` の参照資料の改善点があれば記録する
- 改善点なしの場合は「改善提案は0件であった。」と明記する

---

### Task 6: phase12-task-spec-compliance-check 作成

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 1〜5 の全完了を確認してから作成する
- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の 6 ファイルを揃える
- `artifacts.json` と `outputs/artifacts.json` の parity を確認する
- `phase13` が `blocked` であることを確認する
- `phase-12-documentation.md` と `outputs/phase-12/*.md` に future wording が残っていないことを確認する
- `spec_created` workflow として、current facts と evidence が一致していることを validator 実測値で記録する

**確認コマンド**:

```bash
rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" outputs/phase-12/*.md
rg -E "予定|Phase.?13|マージ後|保留" artifacts.json outputs/artifacts.json
```

---

## 自動化コマンド

```bash
# topic-map / workflow index 再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/TASK-SW-FIX-FEEDBACK-001 \
  --regenerate

# 実装ガイド内容要件確認
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/TASK-SW-FIX-FEEDBACK-001 \
  --json

# Phase 12 最終出力確認
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-SW-FIX-FEEDBACK-001
```

---

## 必須出力テーブル

| file                                  | パス                                                     | 最低限必要な内容                               |
| ------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生レベル）/ Part 2（技術者レベル） |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C / Step 2 の結果               |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル、validator結果                    |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          | 0件でもsummaryを残す                           |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              | 改善点 or 改善点なし                           |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` | current facts/evidence/parity の最終確認       |

---

## 参照資料テーブル

| 資料名                | パス                                                                                    | 用途                          |
| --------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 12 ガイド       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Task 1〜6 要件確認            |
| 仕様更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Task 2 Step定義               |
| 技術文書ガイド        | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1/Part 2 品質            |
| 証跡同期ルール        | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`           | Task 3/4/5/6 の台帳同期       |
| 実体チェック定義      | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | Task 1/3/4/5/6 の検証         |
| task-spec 正本        | `.claude/skills/task-specification-creator/SKILL.md`                                    | Phase 12 判定基準             |
| system spec 正本      | `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | current facts 基準            |
| topic map             | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                           | 用語・依存の整合              |
| UI コンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`               | current contract の参照       |
| 状態管理設計          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`            | SkillLifecyclePanel の参照    |
| Phase 1 仕様          | `phase-1-requirements.md`                                                               | 依存入力（要件定義）          |
| Phase 2 仕様          | `phase-2-design.md`                                                                     | 依存入力（設計）              |
| Phase 5 仕様          | `phase-5-implementation.md`                                                             | 依存入力（no-op / follow-up） |
| Phase 10 仕様         | `phase-10-final-review.md`                                                              | 依存入力（最終レビュー）      |
| Phase 11 仕様         | `phase-11-manual-test.md`                                                               | 依存入力（手動テスト）        |

---

## 成果物

`outputs/phase-12/` 配下の各ファイル:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 完了条件チェックリスト

- [ ] Task 1: 実装ガイドの Part 1（中学生レベル例え話）と Part 2（技術詳細）が作成されている
- [ ] Task 2: Step 1-A（タスク完了記録）が完了している
- [ ] Task 2: `artifacts.json` と `outputs/artifacts.json` の parity が確認されている
- [ ] Task 2: `phase13` が `blocked` であることが反映されている
- [ ] Task 2: `SKILL.md` と `LOGS.md` の更新履歴が同期している
- [ ] Task 3: ドキュメント更新履歴が current / baseline を分けて記録している
- [ ] Task 4: 未タスク検出レポートが出力されている【0件でも必須】
- [ ] Task 5: スキルフィードバックレポートが出力されている【改善点なしでも必須】
- [ ] Task 6: `phase12-task-spec-compliance-check.md` が出力されている
- [ ] `phase-12-documentation.md` と `outputs/phase-12/*.md` に future wording が残っていない
- [ ] `task-specification-creator` / `aiworkflow-requirements` の current facts が整合している
- [ ] 本Phase内の全タスクを100%実行完了
