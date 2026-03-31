# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                                                |
| --------- | --------------------------------------------------- |
| Phase     | 12                                                  |
| 名称      | ドキュメント更新                                    |
| 前提Phase | Phase 11                                            |
| 成果物    | 6つの Phase 12 成果物 + root / system spec 同期記録 |

## 目的

本タスクで行った変更を、初学者にも技術者にも追跡できる形で整理し、AIWorkflowOrchestrator の正本仕様と workflow 台帳を同一 wave で同期する。Phase 12 は「説明文を書く」だけでは完了せず、実体のある成果物・台帳・検証結果が一致していることを確認して閉じる。

## 背景知識

### Electron の3層構造

- **Main**: ファイルアクセスや DB アクセスを担当する
- **Preload**: Main と Renderer の橋渡しをする
- **Renderer**: 画面表示を担当する

### ESM と CJS

- **ESM** は `import` / `export` を使う
- **CJS** は `require()` / `module.exports` を使う
- preload が CJS で動く以上、ESM のみの共有モジュールはそのままでは読めない

### ネイティブモジュールの ABI

better-sqlite3 のようなネイティブモジュールは、ビルド時の Node/Electron ABI に縛られる。Electron 向けに再ビルドしないと、開発環境では通っても Electron 実行時に落ちる。

## 参照導線

1. `aiworkflow-requirements` の `resource-map` で current canonical set を特定する
2. `topic-map` で関連セクションの行番号を確認する
3. `spec-update-workflow.md` で Step 1 / Step 2 の境界を確認する
4. `phase-12-documentation-guide.md` と `phase-12-completion-checklist.md` で完了条件を照合する

## 実行タスク

### Task 12-1: 実装ガイド作成【必須・2パート構成】

| パート     | 対象読者                 | 内容                                                                      |
| ---------- | ------------------------ | ------------------------------------------------------------------------- |
| **Part 1** | **初学者・中学生レベル** | **概念説明。日常の例え話を含め、専門用語は使わないか即座に説明する**      |
| **Part 2** | **開発者・技術者**       | **技術的詳細。型、API、使用例、エラー、エッジケース、設定値を省略しない** |

**Part 1 の必須要件**

- なぜ必要かを先に説明する
- 日常生活の例え話を必ず1つ以上含める
- `たとえば` を最低1回明示する
- 図表より文章を優先する
- 専門用語を使う場合は、その場で平易な説明を添える

**Part 2 の必須要件**

- TypeScript の型定義またはインターフェースを含める
- API シグネチャと使用例を含める
- エラーハンドリングとエッジケースを含める
- 設定可能なパラメータと定数を一覧化する
- `current contract` と `target delta` を分けて書く

**検証**

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/electron-build-infra-fix \
  --json
```

**成果物**

- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/implementation-guide.md`

**補助参照**

- `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`
- `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`

### Task 12-2: system spec update summary

Phase 12 は、実装ガイドを書いた時点では閉じない。Step 1 と Step 2 を分けて、何を同期し、何を同期しないかを記録する。

#### Step 1: 完了記録

| Step     | 必須 | 内容                                                                                                                                                                         |
| -------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A | ✅   | 完了タスクの記録、関連ドキュメントリンク、変更履歴、workflow summary / task-workflow ledger、canonical root / mirror policy、`LOGS.md` 2ファイル、`SKILL.md` 2ファイルの更新 |
| Step 1-B | ✅   | 実装状況テーブルの更新。実装完了は `completed`、仕様書作成のみは `spec_created`                                                                                              |
| Step 1-C | ✅   | `関連タスク` / `未タスク候補` / `残課題` テーブルの更新                                                                                                                      |
| Step 1-D | ✅   | 見出しや行番号が変わった場合の index 再生成                                                                                                                                  |
| Step 1-E | ✅   | 未タスクが 1 件以上なら formalize。0 件でも検出結果は残す                                                                                                                    |
| Step 1-F | ✅   | lessons learned、workflow summary、cross-skill 参照の補助更新                                                                                                                |
| Step 1-G | ✅   | 変換後の検証コマンドと実測結果を記録する                                                                                                                                     |

#### Step 2: domain spec sync 判定

| 変更種別                                                    | 更新対象の例                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| 新規 interface / 型                                         | `interfaces-*.md`                                               |
| API / IPC 変更                                              | `api-*.md`                                                      |
| architecture 変更                                           | `architecture-*.md`                                             |
| state / data flow 変更                                      | `arch-state-management.md`、`database-*.md`                     |
| UI contract 変更                                            | `ui-ux-*.md`                                                    |
| security contract 変更                                      | `security-*.md`                                                 |
| shared runtime catalog / registry 変更                      | 関連する `interfaces-*.md` / `api-*.md` / `ui-ux-*.md`          |
| phase owner / transition semantics / failure lifecycle 変更 | `architecture-*.md`、`task-workflow*.md`、`lessons-learned*.md` |

**判断ルール**

- 外部から見える contract が変わったら Step 2 を実施する
- 内部実装のみで shared / public contract が変わらない場合は no-op 根拠を記録する
- `spec_created` でも、後から code wave が入ったら Step 2 を再判定する

**成果物**

- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/system-spec-update-summary.md`

### Task 12-3: documentation changelog

Phase 12 の記録は、変更したファイルの列挙だけで終わらせない。検証結果、current/baseline の区別、台帳同期まで含めて 1 本にまとめる。

**含める内容**

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- `artifacts.json` と `outputs/artifacts.json` の同期結果
- `outputs/phase-12` 以外に更新した root 文書と system spec 正本 / mirror の一覧
- `更新予定` / `計画済み` / `PR マージ後に実施` のような future wording が残っていないことの確認

**自動生成**

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/electron-build-infra-fix
```

**成果物**

- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/documentation-changelog.md`

### Task 12-4: unassigned-task detection

未タスク検出は 0 件でも必ず出力する。既存の課題を無理に新規化せず、今回差分に由来するものだけを formalize する。

**含める内容**

- Phase 11 の結果から拾った未完了項目
- 既存の `unassigned-task` と今回差分の切り分け
- current / baseline の分離
- 1 件以上ある場合の formalize 結果

**成果物**

- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/unassigned-task-detection.md`

### Task 12-5: skill feedback

改善点がある場合は next action を書く。改善点がない場合でも、なぜ不要かを一文で残す。

**観点**

- テンプレート改善
- ワークフロー改善
- ドキュメント改善

**成果物**

- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/skill-feedback-report.md`

### Task 12-6: phase12-task-spec-compliance-check

Phase 12 は、成果物が並んでいるだけでは完了にならない。実体・台帳・記述の3点が一致していることを最後に確認する。

**チェック対象**

1. `outputs/phase-12/` の必須 6 成果物が存在する
2. `artifacts.json` の Phase 12 記録が最新である
3. `outputs/artifacts.json` が root 台帳と同期している
4. `phase-12-documentation.md` 自体の記述が実績と一致している
5. completed workflow 側に future wording が残っていない
6. `audit-unassigned-tasks.js` の `currentViolations.total` が 0 である

**成果物**

- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 資料名                       | パス                                                                                    | 用途                                 |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| システム仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 の境界確認           |
| Phase 12 ドキュメントガイド  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | 必須成果物と記述要件                 |
| 完了条件チェックリスト       | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | 閉じる前の最終確認                   |
| 技術ドキュメントガイド       | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 2 の書き方確認                  |
| Part 1 定義                  | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 中学生レベル説明の要件確認           |
| Electron サービス仕様        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`           | Main / Preload / Renderer の責務確認 |
| デプロイ仕様                 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md`              | Electron ビルドと配布の変更確認      |
| 技術スタック                 | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`               | デスクトップ向け構成の整合確認       |

## 成果物

| 成果物                     | 配置先                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 実装ガイド                 | `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/implementation-guide.md`               |
| system spec update summary | `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/system-spec-update-summary.md`         |
| documentation changelog    | `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/documentation-changelog.md`            |
| unassigned-task detection  | `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/unassigned-task-detection.md`          |
| skill feedback             | `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/skill-feedback-report.md`              |
| phase12 compliance check   | `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/phase12-task-spec-compliance-check.md` |

### 同時更新対象（same-wave sync）

- `CHANGELOG.md`
- `CLAUDE.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/references/deployment-electron.md`
- `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`
- `.agents/skills/aiworkflow-requirements/` 配下の mirror

## 完了条件

- [ ] Part 1 / Part 2 の両方を満たす実装ガイドがある
- [ ] Step 1-A〜1-G と Step 2 の判定結果が system spec update summary に残っている
- [ ] documentation changelog に変更ファイル、検証結果、台帳同期が記録されている
- [ ] unassigned-task detection が 0 件でも出力されている
- [ ] skill feedback が改善点あり/なしのどちらでも出力されている
- [ ] phase12-task-spec-compliance-check が実体・台帳・文面の同期を確認している
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期している
- [ ] future wording が `phase-12-documentation.md` と `outputs/phase-12/*.md` に残っていない
- [ ] **本Phase内の全タスクを100%実行完了**
