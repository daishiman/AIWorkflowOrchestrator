# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| Phase名    | ドキュメント更新                           |
| 前提Phase  | Phase 11                                   |
| 後続Phase  | Phase 13                                   |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

実装結果を記録し、次の担当者に引き継ぐ。Phase 12 の必須 5 タスクを全て完了する。

---

## Phase 12 必須タスク一覧

| Task | 名称                             | 必須 | 成果物                                                   |
| ---- | -------------------------------- | ---- | -------------------------------------------------------- |
| 12-1 | 実装ガイド作成（2パート構成）    | ✅   | `outputs/phase-12/implementation-guide.md`               |
| 12-2 | システム仕様書更新（Step 1+2）   | ✅   | `outputs/phase-12/system-spec-update-summary.md`         |
| 12-3 | ドキュメント更新履歴作成         | ✅   | `outputs/phase-12/documentation-changelog.md`            |
| 12-4 | 未タスク検出レポート作成         | ✅   | `outputs/phase-12/unassigned-task-detection.md`          |
| 12-5 | スキルフィードバックレポート作成 | ✅   | `outputs/phase-12/skill-feedback-report.md`              |
| 12-6 | Phase 12 準拠チェック            | ✅   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## Task 12-1: 実装ガイド（2パート構成）

**事前準備**:

- `mkdir -p docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement/outputs/phase-12` を実行する

### Part 1: 中学生レベルの概念説明

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明する

**例え話の素材（Issue #1932 本文より）**:

> 「学校の入り口に守衛さんがいます。守衛さんは『どの生徒がどの教室に入ってよいか』のルールブックを持っています（PermissionPolicy）。でも今は守衛さんが『あなたは教室に入っていいよ』とは言うけれど、『その教室は本当に君の担当教室？』と確認していません。このタスクでは、守衛さんが入室許可を出す前に『担当の教室番号（skillRoot）と、行こうとしている教室番号（targetPath）が一致するか』を必ず確認するように改善します。」

### Part 2: 技術者向け説明

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- API シグネチャと使用例を記載する
- エラーハンドリングとエッジケースを説明する
- 設定可能なパラメータと定数を一覧化する

**記載内容**:

```typescript
// CanUseToolContext インターフェース
export interface CanUseToolContext {
  targetPath?: string;
  allowedSkillRoot?: string;
}

// execute / improve で共通化する path-scoped 評価ヘルパーのイメージ
private createExecuteGovernanceCanUseTool(skillRoot: string):
  (toolName: string, input: Record<string, unknown>, options: { toolUseID: string }) => Promise<{ behavior: "allow" | "deny"; toolUseID: string; message?: string }>

// targetPath 抽出ロジック
const targetPath =
  (input?.file_path as string | undefined) ??
  (input?.path as string | undefined);
```

`execute` と `improve` は同じ `extractTargetPath(input)` / `allowedSkillRoot` 判定を共有し、片側だけ修正する構成を避ける。

作成後は `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement` で要件を検証する。

**期待される成果物**: `outputs/phase-12/implementation-guide.md`

---

## Task 12-2: システム仕様書更新

### Step 1-A: タスク完了記録

**更新対象**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` に完了エントリを追加
2. `docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement/phase-12-documentation.md` の完了タスク記録を `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に同期する
3. `.claude/skills/aiworkflow-requirements/LOGS.md` に完了エントリを追加
4. `.claude/skills/task-specification-creator/LOGS.md` に完了エントリを追加
5. `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の history を追記する
6. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を更新し、見出し変更がある場合は `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で再生成する

### Step 1-B: 実装状況テーブル更新

**更新対象**:

- `docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md` のステータスを `未実施` → `完了` に更新

### Step 1-C: 関連タスクテーブル更新

**更新対象**:

- `docs/30-workflows/completed-tasks/TASK-P0-09-claude-sdk-permission-hooks-governance.md` の「未タスク候補」テーブルにある `TASK-P0-09-U1` ステータスを更新

### Step 2: システム仕様更新（条件付き）

**判定**: 新規インターフェース追加なし（`CanUseToolContext` は既存）→ **N/A**

ただし以下を確認する:

- `extractTargetPath()` ユーティリティを新規定義した場合は Step 2 が必要
- `createImproveGovernanceCanUseTool` のシグネチャを変更した場合は Step 2 が必要

**期待される成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

## Task 12-3: ドキュメント更新履歴

**記録内容**:

- Step 1-A〜1-C の実施結果
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` と `task-workflow-completed.md`、両 `SKILL.md`、`topic-map.md` の更新結果
- Step 2 の判定結果（N/A 理由を含む）
- 更新したファイル一覧

**期待される成果物**: `outputs/phase-12/documentation-changelog.md`

---

## Task 12-4: 未タスク検出

**検出ソース**:
| ソース | 確認項目 |
| ---------------------- | ---------------------------------- |
| 元タスク仕様書 | 「スコープ外」として明示された項目 |
| Phase 3/10 レビュー結果 | MINOR 判定の指摘事項 |
| Phase 11 動作確認 | discovered-issues.md の内容 |
| コードコメント | TODO/FIXME/HACK/XXX |

**既知のスコープ外項目**（検出対象）:

- renderer 側 governance 表示 UI（将来スコープ）
- audit 永続化（将来スコープ）
- `plan` / `verify` phase への path 制約追加（read-only のため不要と判断済み）

**期待される成果物**: `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）

---

## Task 12-5: スキルフィードバック

**記録観点**:
| 観点 | 記録内容 |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase仕様書テンプレートの漏れや曖昧さ |
| ワークフロー改善 | 機械検証や手順分岐の改善余地 |
| ドキュメント改善 | 横断ガイドライン化の候補 |

**期待される成果物**: `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）

---

## Task 12-6: Phase 12 準拠チェック

**チェック項目**:

- [ ] `index.md` / `artifacts.json` / 各 `phase-*.md` の phase・artifact 名が 1:1 で一致している
- [ ] Phase 12 の全 6 成果物が揃っている
- [ ] LOGS.md が 2 ファイル更新されている（aiworkflow-requirements + task-specification-creator）
- [ ] `task-workflow.md` と `task-workflow-completed.md`、両 `SKILL.md` の history が更新されている
- [ ] `topic-map.md` が再生成されている

**期待される成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料                      | パス                                                                                    | 内容            |
| ----------------------------- | --------------------------------------------------------------------------------------- | --------------- |
| Phase 11 動作確認             | `outputs/phase-11/`                                                                     | テスト証跡      |
| Phase 10 最終レビュー         | `outputs/phase-10/final-review-result.md`                                               | レビュー結果    |
| task-workflow                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 完了記録反映先  |
| task-workflow-completed       | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`          | 完了台帳反映先  |
| technical-documentation-guide | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1/2 詳細   |
| phase12-checklist-definition  | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 完了条件定義    |
| spec-update-workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-2 手順   |
| Phase 12 documentation guide  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Phase 12 ガイド |

---

## 成果物（全 6 件必須）

| 成果物                                | パス                                                     | 内容                        |
| ------------------------------------- | -------------------------------------------------------- | --------------------------- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               | Part 1/2 実装ガイド         |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 結果 |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                    |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出（0件でも必須） |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック        |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック       |

---

## 完了条件

- [ ] `implementation-guide.md` が Part 1（中学生レベル）と Part 2（技術者レベル）を含む
- [ ] `system-spec-update-summary.md` が Step 1-A〜1-C と Step 2 判定を含む
- [ ] `documentation-changelog.md` が全 Step の結果を個別に記録している
- [ ] `unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] `skill-feedback-report.md` が作成されている（改善点なしでも必須）
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] `validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement` が PASS している
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` が更新されている
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` が更新されている
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` が更新されている
- [ ] `.claude/skills/task-specification-creator/LOGS.md` が更新されている
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の history が更新されている
- [ ] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` が再生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください（ユーザーの明示承認後のみ）:

`phase-13-pr-creation.md`
