# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 12                                       |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 1h                                       |

## 目的

実装ガイドの作成・システム仕様書の更新・未タスク文書のチェックボックス更新・ドキュメント変更履歴の記録を行い、タスクを正式に完了状態にする。

## 実行タスク

1. `implementation-guide.md` を Part 1 / Part 2 で作成する
2. `artifacts.json` と `outputs/artifacts.json` を同期する
3. `unassigned-task` 文書を更新し、未タスクを検出する
4. 変更履歴・フィードバック・仕様準拠チェックを作成する
5. 検証結果を outputs に記録する

## 参照資料

| 参照資料             | パス                                                                  | 用途                 |
| -------------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`                                             | スコープと受入条件   |
| Phase 2 設計         | `phase-2-design.md`                                                   | app.exit(0) 受容方針 |
| Phase 3 設計レビュー | `phase-3-design-review.md`                                            | PASS 根拠            |
| Phase 4〜11 成果物   | `outputs/phase-4/` 〜 `outputs/phase-11/`                             | 文書更新の入力       |
| beforeQuitGuard 実装 | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                        | 実装説明の入力       |
| Facade 実装          | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 技術説明の入力       |

## Task 1: 実装ガイド作成（2パート）

### Part 1: 初学者向け概念説明

**出力先**: `outputs/phase-12/implementation-guide.md`（Part 1 セクション）

**内容**:

- before-quit ガードを「引越し業者が荷物を運んでいる最中にいきなり電源を落とさないようにする仕組み」に例えて説明
- `app.exit(0)` が即時終了であることのリスクと「受容した理由」を平易な言葉で説明

### Part 2: 開発者向け技術説明

**出力先**: `outputs/phase-12/implementation-guide.md`（Part 2 セクション）

**内容**:

```typescript
type BeforeQuitGuardDeps = {
  app: App;
  dialog: Dialog;
  facade: RuntimeSkillCreatorFacade;
};

registerBeforeQuitGuard(deps: BeforeQuitGuardDeps): () => void
hasRunningExecution(): boolean
execute(planResult, authMode, apiKey): Promise<SkillExecuteResponse>

// current contract
// - execute() が activeExecutionCount を増減する
// - hasRunningExecution() が before-quit で参照される

// target delta
// - app.exit(0) の既知制限を文書化
// - graceful shutdown は follow-up task として分離

const cleanup = registerBeforeQuitGuard({ app, dialog, facade });
// アンマウント時: cleanup()
```

**既知の制限**:

- `app.exit(0)` は OS レベルの強制終了に近い。LLM API への中断リクエストは送信されない
- graceful shutdown（完了待機）は将来タスクとして backlog に記録（TASK-SKILL-CREATOR-GRACEFUL-SHUTDOWN-001 相当）

## Task 2: システム仕様書更新

### Step 1-A: 完了記録の同期

```bash
# 正本更新対象
# - .claude/skills/aiworkflow-requirements/references/task-workflow.md
# - .claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-security.md
# - .claude/skills/aiworkflow-requirements/LOGS.md
# - .claude/skills/task-specification-creator/LOGS.md
# - .claude/skills/aiworkflow-requirements/SKILL.md
# - .claude/skills/task-specification-creator/SKILL.md
```

追記内容:

```markdown
| TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 | before-quit guard 実装・検証 | 2026-04-XX | 完了 |
```

### Step 1-B: 実装状況テーブル更新

`unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md` のチェックボックスを更新:

```markdown
## 推定作業内容

- [x] `SkillCreatorWorkflowEngine` または `RuntimeSkillCreatorFacade` に「実行中かどうか」を問い合わせる API を追加する
      → `RuntimeSkillCreatorFacade.hasRunningExecution()` として実装済み（TASK-NOTIFICATION-SERVICE-001）
- [x] Electron の `app.on('before-quit', ...)` ハンドラを実装する
      → `apps/desktop/src/main/ipc/beforeQuitGuard.ts` として実装済み
- [x] スキル生成実行中にアプリ終了が要求された場合の挙動を設計する
      → 警告ダイアログ表示 + 「中断して終了」/「キャンセル」選択方式を採用
- [x] 選択した挙動を実装する
      → `registerBeforeQuitGuard` で実装済み
- [x] `before-quit` ガードが正常に動作することをテストで確認する
      → TC-B-01〜TC-B-05, TC-F-04〜TC-F-08 で検証済み
- [x] ユーザーへの通知 UI（ダイアログ等）を実装する場合はアクセシビリティを考慮する
      → OS 標準ダイアログを使用（アクセシビリティは OS が保証）

## 完了条件

- [x] スキル生成実行中にアプリを終了しようとした際に期待どおりの処理が行われる
- [x] アプリが突然終了してもファイルシステムや状態が不整合にならない
      ※ app.exit(0) による即時終了は設計上の既知制限として受容（実装ガイドに記録）
- [x] スキル生成を実行していない場合は通常通りアプリが終了できる
- [x] TypeScript 型チェック PASS
- [x] 関連テスト全件 PASS
```

### Step 1-C: LOGS.md / SKILL.md 更新（2ファイルずつ）

```bash
# task-specification-creator の LOGS.md / SKILL.md
# aiworkflow-requirements の LOGS.md / SKILL.md
```

### Step 1-D: index 再生成

```bash
# 仕様書の見出しや行数が変わった場合は index を再生成する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Step 1-E: 未タスク登録

0件でも detection report を作成する。1件以上なら `docs/30-workflows/unassigned-task/` に正式化する。

### Step 1-F: 補助更新

- lessons-learned の更新が必要な場合は同一 wave で反映する
- `outputs/artifacts.json` と `artifacts.json` の phase 状態・artifact 名を同期する

### Step 1-G: 検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/skill-creator-before-quit-guard
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/skill-creator-before-quit-guard
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/completed-tasks/skill-creator-before-quit-guard --regenerate
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

結果は `documentation-changelog.md` と `system-spec-update-summary.md` に転記する。

## Task 3: ドキュメント更新履歴

**出力先**: `outputs/phase-12/documentation-changelog.md`

```markdown
## 変更履歴

| 日付       | ファイル                                                    | 変更内容                 |
| ---------- | ----------------------------------------------------------- | ------------------------ |
| 2026-04-XX | unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md | 全チェックボックスを更新 |
| 2026-04-XX | task-workflow-completed-skill-lifecycle-security.md         | 完了タスク追記           |
| 2026-04-XX | outputs/phase-12/implementation-guide.md                    | 新規作成                 |
| 2026-04-XX | outputs/phase-12/system-spec-update-summary.md              | 新規作成                 |
| 2026-04-XX | outputs/artifacts.json                                      | 更新                     |
```

## Task 4: 未タスク検出（0件でも必須）

```bash
rg -n "TODO|FIXME|HACK" \
  apps/desktop/src/main/ipc/beforeQuitGuard.ts \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

想定: 新規未タスクなし（0件）。ただし将来タスクの候補があれば `TASK-SKILL-CREATOR-GRACEFUL-SHUTDOWN-001` 相当として formalize する。

## Task 5: スキルフィードバック（改善なしでも必須）

**出力先**: `outputs/phase-12/skill-feedback-report.md`

**フィードバック内容**:

- task-specification-creator スキルへの改善提案（あれば）
- 本タスクで得られた知見（既存テストファイルを再利用し、重複ファイルを作らない方がエレガントであること）

## Task 6: 仕様準拠チェック

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

**内容**:

- Phase 12 成果物 6 本の存在確認
- Task 12-1〜12-5 の実施結果要約
- 仕様書整合チェックの結果
- `artifacts.json` / `outputs/artifacts.json` / `index.md` の同期結果
- 30種の思考法を踏まえた最終判定

## 成果物

| 成果物                             | パス                                                     | 説明           |
| ---------------------------------- | -------------------------------------------------------- | -------------- |
| implementation-guide               | `outputs/phase-12/implementation-guide.md`               | 実装ガイド     |
| system-spec-update-summary         | `outputs/phase-12/system-spec-update-summary.md`         | 同期結果       |
| documentation-changelog            | `outputs/phase-12/documentation-changelog.md`            | 変更履歴       |
| unassigned-task-detection          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出   |
| skill-feedback-report              | `outputs/phase-12/skill-feedback-report.md`              | フィードバック |
| phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 仕様準拠確認   |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1 + Part 2）作成完了
- [ ] Task 2: 正本台帳・LOGS.md・SKILL.md・index の同期完了
- [ ] Task 2: unassigned-task doc のチェックボックス更新完了
- [ ] Task 2: 完了タスク台帳への追記完了
- [ ] Task 3: ドキュメント変更履歴記録完了
- [ ] Task 4: 未タスク検出レポート作成完了（0件でも必須）
- [ ] Task 5: スキルフィードバックレポート作成完了
- [ ] Task 6: 仕様準拠チェック作成完了

## タスク 100% 実行確認【必須】

- [ ] Task 1〜6 を全て完了した
- [ ] `unassigned-task/TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001.md` のチェックボックスが全て ✅ になっている

## 次 Phase

Phase 12 完了後、ユーザーの明示的な承認を得てから Phase 13（PR作成）に進む。
