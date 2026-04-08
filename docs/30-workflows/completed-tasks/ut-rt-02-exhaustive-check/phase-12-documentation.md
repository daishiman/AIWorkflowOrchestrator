# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 12                        |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 参照資料

| 資料名                | パス                                                                  | 説明                |
| --------------------- | --------------------------------------------------------------------- | ------------------- |
| Phase 1 受け入れ基準  | `outputs/phase-1/requirements.md`                                     | AC-1〜AC-6 の定義   |
| Phase 10 最終レビュー | `outputs/phase-10/final-review.md`                                    | 最終レビュー結果    |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md`                              | NON_VISUAL 代替証跡 |
| 実装ファイル          | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 実装対象            |
| SKILL.md（要件）      | `.claude/skills/aiworkflow-requirements/SKILL.md`                     | 要件スキル定義      |
| SKILL.md（仕様作成）  | `.claude/skills/task-specification-creator/SKILL.md`                  | 仕様作成スキル定義  |

## 事前チェック【必須】

Phase 12 実行前に以下の既知の落とし穴を確認する：

- P1: LOGS.md 2ファイル更新漏れ
- P2: topic-map.md 再生成忘れ
- P3: 未タスク管理の3ステップ不完全
- P4: documentation-changelog への早期「完了」記載
- P25: LOGS.md 2ファイル更新漏れ（再発）
- P27: topic-map.md 再生成トリガーの判断ミス
- P29: SKILL.md 変更履歴の更新漏れ

## 実行タスク

| Task      | 内容                                                  | 主成果物                                                 |
| --------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements等） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成                              | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                    | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成                      | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | 仕様準拠コンプライアンスチェック                      | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: 仕様準拠コンプライアンスチェック（Task 1〜5 と Step 1-A〜1-G / Step 2 の root evidence）

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する：

| パート | 対象読者         | 内容                                                                 |
| ------ | ---------------- | -------------------------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                                   |
| Part 2 | 開発者・技術者   | 技術的な詳細（TypeScript型定義・正規化 helper・assertNever・使用例） |

**Part 1（中学生レベル）必須要件**:

- 「exhaustive check とは何か」を日常の例え話で説明（例: レストランのメニュー全品の確認）
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 専門用語（TypeScript / union / never）は使う場合に即座に説明

**Part 2（技術者レベル）必須要件**:

- `assertNever` 関数のシグネチャ（`(x: never): never`）と使用例
- mixed union を直接 `switch` せず、`classifyExecuteResult()` の正規化 helper で outcome に変換してから `switch` する設計
- `assertNever` は module-local helper として配置してよい
- switch 文の前後（Before/After）コード例
- discriminated union の判別子設計（literal 型の必要性）
- 新バリアント追加時の手順（型定義 → case 追加 → テスト更新）

### Task 2: システムドキュメント更新【必須】

#### Step 1-A: タスク完了記録

- [ ] 関連仕様書（aiworkflow-requirements）に「完了タスク」セクションを追加
- [ ] `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` を最新実績へ同期
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加 **（P1対策）**
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加 **（P1/P25対策）**
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新 **（P29対策）**
- [ ] `task-specification-creator/SKILL.md` 変更履歴テーブルを更新 **（P29対策）**

#### Step 1-B: 実装状況テーブル更新

- [ ] `architecture-implementation-patterns.md` の `assertNever` / exhaustive check パターン記載状況を確認し、実装完了状態を反映する

#### Step 1-C: 関連タスクテーブル更新

```bash
# UT-RT-02-EXHAUSTIVE-CHECK-001 の参照を検索
grep -rn "UT-RT-02-EXHAUSTIVE-CHECK\|UT-RT-02" \
  .claude/skills/aiworkflow-requirements/references/
grep -n "UT-RT-02-EXHAUSTIVE-CHECK\|UT-RT-02" \
  .claude/skills/aiworkflow-requirements/references/task-workflow*.md
```

- [ ] `task-workflow.md` の残課題テーブルから UT-RT-02-EXHAUSTIVE-CHECK-001 を「完了」に更新
- [ ] `task-workflow-backlog.md` / `task-workflow-completed.md` の更新
- [ ] 参照切れがあれば `docs/30-workflows/unassigned-task/` の候補と整合させる

#### Step 1-D: topic-map.md 再生成 **（P2/P27対策）**

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 1-E: 未タスク登録【必須】

- [ ] `unassigned-task-detection.md` を 0件でも出力する
- [ ] 未タスクが 1件以上なら `docs/30-workflows/unassigned-task/` に正式登録する
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-ut-rt-02-type-expansion-test-001.md` を実行する
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD` を実行する
- [ ] `audit-unassigned-tasks.js --json` を実行する
- [ ] `verify-unassigned-links.js` で missing=0 を確認する

#### Step 1-F: 補助更新【必要時のみ】

- [ ] `lessons-learned.md` に再発防止ルールを追記する
- [ ] `task-workflow*.md` と `outputs/phase-12/*.md` の実績を同値転記する
- [ ] 更新不要なら no-op 理由を `documentation-changelog.md` に明記する

#### Step 1-G: 検証【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/ut-rt-02-exhaustive-check
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/ut-rt-02-exhaustive-check
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 12
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/unassigned-task-detection.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-ut-rt-02-type-expansion-test-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/*.md
```

#### Step 2: システム仕様更新の判断

本タスクはリファクタリング（内部実装変更のみ）のため、以下を確認する：

| 更新項目                                  | 判断     | 理由                                               |
| ----------------------------------------- | -------- | -------------------------------------------------- |
| `interfaces-*.md`                         | 更新不要 | IPC/インターフェース変更なし                       |
| `architecture-implementation-patterns.md` | 確認要   | module-local assertNever / exhaustive check の確認 |
| `error-handling.md`                       | 更新不要 | public error contract は変わらない                 |
| API仕様                                   | 更新不要 | API変更なし                                        |

更新不要の場合は `documentation-changelog.md` に「更新なし」と理由を明記する。

### Task 3: ドキュメント更新履歴作成【必須】

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-rt-02-exhaustive-check
```

全 Step（1-A/1-B/1-C/1-D/1-E/1-F/1-G/Step 2）の結果を個別に記録する（「該当なし」も記録）。

### Task 4: 未タスク検出【必須（0件でも出力必須）】

確認ソース：

| #   | ソース                | 確認項目             |
| --- | --------------------- | -------------------- |
| 1   | Phase 3 レビュー結果  | MINOR 判定の指摘事項 |
| 2   | Phase 10 レビュー結果 | MINOR 判定の指摘事項 |
| 3   | Phase 11 発見課題     | スコープ外の発見事項 |
| 4   | Phase 4 it.todo()     | TC-09 の未実装テスト |
| 5   | コードコメント        | TODO/FIXME/HACK/XXX  |

未タスク候補：

- `UT-RT-02-TYPE-EXPANSION-TEST-001`（Phase 4 の `it.todo()` で記録したもの）
- Phase 3/10 の MINOR 指摘事項（実行時に記録）

### Task 5: スキルフィードバックレポート作成【必須（改善点なしでも出力必須）】

| セクション         | 記載内容                                                |
| ------------------ | ------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案          |
| 技術的教訓         | assertNever / discriminated union の設計で得た知見      |
| スキル改善提案     | task-specification-creator / skill-creator への改善提案 |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall           |

### Task 6: phase12-task-spec-compliance-check【必須・最終確認】

- Task 1〜5 の全完了を確認してから作成する
- `phase-12-documentation.md` / `outputs/phase-12/*.md` / `artifacts.json` / `outputs/artifacts.json` の整合を確認する
- `Task 12-6` と Step 1-A〜1-G / Step 2 の実測値を 1 ファイルへ集約する
- 曖昧表現が残っていないことを確認する
- Phase 13 は user approval 未取得のため blocked のまま維持する

## 成果物

| 成果物                            | パス                                                     | 必須 | 説明                          |
| --------------------------------- | -------------------------------------------------------- | ---- | ----------------------------- |
| 実装ガイド（Part 1/2）            | `outputs/phase-12/implementation-guide.md`               | ✅   | 概念的 + 技術的ドキュメント   |
| システム仕様更新サマリー          | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | Step 1-A〜1-G + Step 2 の記録 |
| ドキュメント更新履歴              | `outputs/phase-12/documentation-changelog.md`            | ✅   | 全 Step の結果記録            |
| 未タスク検出レポート              | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 0件でも出力必須               |
| スキルフィードバックレポート      | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点なしでも出力必須        |
| Phase 12 コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 1〜6 の完了証跡          |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド Part 1（中学生レベル・日常の例え話含む）が作成されている
- [ ] 実装ガイド Part 2（assertNever 型定義・Before/After コード例含む）が作成されている
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.md を更新した** ⚠️ P1
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.md を更新した** ⚠️ P1/P25
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した** ⚠️ P29
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md 変更履歴テーブルを更新した** ⚠️ P29
- [ ] **【Task 2 Step 1-D】topic-map.md を再生成した** ⚠️ P2/P27
- [ ] **【Task 2 Step 1-E】未タスク検出レポートを 0件でも出力した**
- [ ] **【Task 2 Step 1-G】validate-phase12-implementation-guide.js / verify-all-specs.js / validate-phase-output.js / verify-unassigned-links.js / audit-unassigned-tasks.js（--json --diff-from HEAD --target-file docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/unassigned-task-detection.md、--json --diff-from HEAD、--json） / quick_validate.js / validate_all.js（task-specification-creator / aiworkflow-requirements） / diff -qr（task-specification-creator / aiworkflow-requirements） を実行した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.md に記録した**
- [ ] 未タスク検出レポートが出力されている（0件でも必須）
- [ ] 検出された未タスクがあれば `docs/30-workflows/unassigned-task/` に指示書が作成されている
- [ ] スキルフィードバックレポートが出力されている（改善点なしでも必須）
- [ ] Phase 12 コンプライアンスチェックが出力されている
- [ ] artifacts.json が更新されている（Phase 12 status = completed / Phase 13 status = blocked）
- [ ] Phase 13 は user approval 未取得のため blocked のまま維持されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 苦戦箇所の記録【推奨】

Phase 実行中に苦戦した箇所があれば記録する。

## 次のPhase

Phase 13: PR作成（blocked）

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 12
```
