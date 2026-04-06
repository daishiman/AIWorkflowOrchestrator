# Phase 12 完了条件チェックリスト

> 親ファイル: [phase-11-12-guide.md](phase-11-12-guide.md)
> 読み込み条件: Phase 12 の完了前確認をするとき。

---

## 【初手チェック】Phase 12 開始前に必ず確認する項目

> **⚠️ 以下を Phase 12 の最初に確認すること。台帳 drift を早い段階で検出するために昇格させた項目。**

- [ ] 【初手チェック】`outputs/artifacts.json` を生成し、root `artifacts.json` との parity を確認した（drift 0件）

---

## Phase 12 完了条件チェックリスト

- [ ] 実装ガイド（Part 1: **中学生レベル概念説明**）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] `validate-phase12-implementation-guide.js --workflow <workflow-path>` が PASS であることを確認した
- [ ] 【Step 1-A】システム仕様書に「完了タスク」セクションを追加した
- [ ] 【Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 【Step 1-A】LOGS.md **2ファイル両方**（aiworkflow-requirements + task-specification-creator）を更新した
- [ ] 【Step 1-A】`skill-creator` を改善した場合、`.claude/skills/skill-creator/LOGS.md` も更新した
- [ ] 【Step 1-A】SKILL.md **2ファイル両方**の変更履歴テーブルにバージョンを追記した ⚠️ **P23: 漏れやすい**
- [ ] 【Step 1-A】`skill-creator` を改善した場合、`.claude/skills/skill-creator/SKILL.md` の変更履歴も更新した
- [ ] 【Step 1-A】変更履歴へ追記した Version が既存行と重複していないことを確認した（同日追補時は最大値 + 0.0.1 で採番）
- [ ] 【Task 12-3】`documentation-changelog.md` に Step 1-A で更新した `.claude/skills/*/SKILL.md` / `.claude/skills/*/LOGS.md` が canonical path で列挙されている
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した（Warning の分類は `spec-update-step1-validation-commands.md` Step 1-G.3.1 を参照）
- [ ] `quick_validate.js` の Warning を Step 1-G.3.1 で分類し、`system-spec-update-summary.md` に「要監視 / 要対応」を記録した
- [ ] Task 5 で `skill-creator` を更新した場合、その変更内容を `skill-feedback-report.md` / `documentation-changelog.md` / `system-spec-update-summary.md` に同値で記録した
- [ ] 【Step 1-C】`grep -rn "TASK_ID" references/` で関連タスクテーブルを全件確認した
- [ ] 【Step 1-D】topic-map.md再生成を実行した（下記コマンド参照）
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] 【Step 2】システム仕様を更新した場合、`system-spec-update-summary.md` と `documentation-changelog.md` の両方が「更新あり」で一致していることを確認した（片方のみ更新禁止）
- [ ] 【Step 2】今回の実装で苦戦した箇所をシステム仕様書（`lessons-learned.md` または関連 `interfaces-*.md`）に記録した
- [ ] `outputs/phase-12/system-spec-update-summary.md` を作成し、Step 1-A〜3の実施結果を記録した
- [ ] `outputs/phase-12` の必須5成果物実体と `artifacts.json` の `phases.12.status=completed` が同期している
- [ ] `phase-12-documentation.md` の `ステータス=completed` と完了チェックリストが成果物実体・検証結果と同期している
- [ ] completed workflow の `phase-12-documentation.md` と `outputs/phase-12/*.md` に `仕様策定のみ` / `実行予定` / `保留として記録` などの planned wording が残っていない
- [ ] `artifacts.json` / `outputs/artifacts.json` に Phase 13 先送りを示す wording（`予定` / `Phase 13 で実施` / `マージ後` / `保留` 等）が残っていない（`grep -E "予定|Phase.?13|マージ後|保留" artifacts.json outputs/artifacts.json` が 0件）⚠️ **FB-UT-UIUX-001: Phase 13 先送り wording防止**
- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 初回判定が 0 件でも、親タスクの苦戦箇所を cross-cutting guard として formalize する必要が判明した場合は、`unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` を 0→1 へ再同期した
- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】
- [ ] 未タスク検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した ⚠️ **P24: 漏れやすい**
- [ ] 未タスク検出時、**3ステップ全完了**（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 未タスク検出時、**指示書の物理ファイル存在を確認**（`ls docs/30-workflows/unassigned-task/` で作成済みファイルを検証）
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`task-workflow.md` 内の未タスクリンク参照切れが0件であることを確認
- [ ] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、completed成果物の参照切れが0件であることを確認（→ parity確認は**初手チェックへ昇格済み**。本項目は参照切れ検証として引き続き実施）
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/{{FEATURE_NAME}} --regenerate` を実行し、`index.md` の Phase 状態が `artifacts.json` と一致していることを確認
- [ ] `phase-12-documentation.md` が completed でも `index.md` が未実施表示のまま残っていないことを確認
- [ ] `artifacts.json` / `index.md` が completed でも `phase-1..11` 本文仕様書に `ステータス=pending` が残っていないことを確認
- [ ] 完了済み未タスク指示書が `unassigned-task/` に残置されていない（完了時は `completed-tasks/unassigned-task/` へ移管）
- [ ] **未実施**タスク指示書（未着手/未実施/進行中）が `completed-tasks/unassigned-task/` に混在していない（存在する場合は `docs/30-workflows/unassigned-task/` へ是正）
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <今回対象ファイル>` を実行し、`currentViolations.total = 0` を確認した
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行し、baseline監視結果（全体違反件数）を記録した
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD` を実行し、合否判定を `currentViolations.total` で記録した（baselineは別記録）
- [ ] artifacts.jsonが更新されている
- [ ] .claude/rules/ の技術的負債テーブルが最新（負債解消時は「完了」に更新）
- [ ] 【品質】ESLintキャッシュをクリアしてlintを再実行した
- [ ] 【品質】コメントフォーマット（JSDoc形式）が統一されている
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されていること ⚠️ **P3派生: TASK-9B-Iで再発**
- [ ] テスト数が実際の `it()` ブロック数と一致すること ⚠️ **TASK-9B-I教訓**
- [ ] SDK 型定義変更時は、カスタム declare module ファイルの有無を確認し、不要なら削除を未タスク化すること
### ⛔ UI/UX変更タスク専用: スクリーンショット証跡ハードゲート

> **⚠️ FB-UT-UIUX-001: 以下5点をすべて満たさない限り Phase 12 PASS 禁止。close-out 文書だけが完了していても Phase 12 completed にしてはならない。**

- [ ] UI/UX変更タスクの場合: `outputs/phase-11/screenshots/screenshot-plan.json` が存在する（`ls` で実在を確認）
- [ ] UI/UX変更タスクの場合: `outputs/phase-11/screenshots/phase11-capture-metadata.json` が存在する（`ls` で実在を確認）
- [ ] UI/UX変更タスクの場合: `outputs/phase-11/screenshot-coverage.md` が存在する（`ls` で実在を確認）
- [ ] UI/UX変更タスクの場合: `outputs/phase-11/screenshots/` 配下に実スクリーンショット（*.png）が1件以上存在する（placeholder-only は不可）
- [ ] UI/UX変更タスクの場合: Phase 11のスクリーンショットがコミットに含まれる状態であること
- [ ] UI/UX変更タスクの場合: 再撮影前に preview preflight（build成功 + `127.0.0.1:4173` 疎通）を記録し、失敗時は未タスク化したこと
- [ ] UI/UX変更タスクの場合: 再撮影後に `stat` 実時刻と `manual-test-result.md` の更新時刻が一致していること
- [ ] UI/UX変更タスクの場合: `validate-phase11-screenshot-coverage.js --workflow <workflow-path>` が PASS であることを Phase 12成果物に記録した
- [ ] `phase-12-documentation.md` の Task 1-5 / Step 1-A〜3 / 完了条件チェックが、実績に合わせて `[x]` へ同期されている
- [ ] Step 2 で domain spec を更新した場合、少なくとも 1 つの正本仕様書に `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード`、またはそれと等価な lessons 参照が記録されている
- [ ] 既存未タスクを参照する場合、リンク先が **未実施なら** `docs/30-workflows/unassigned-task/`、**完了済みなら** `docs/30-workflows/completed-tasks/**/unassigned-task/` になっていることを確認した
- [ ] `unassigned-task-detection.md` に既存未タスクを流用した理由と、物理配置確認結果（`ls docs/30-workflows/unassigned-task/`）を記録した
- [ ] PRコメントに `## 実装ガイド（全文）` が存在し、Part 1/Part 2 の両方を含むことを確認した
- [ ] PR本文/PRコメントへ掲載する画像リンクが `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLであること（相対パスのまま投稿しない）
- [ ] スクリーンショットコメント更新時に、実装ガイド全文コメントを編集・上書きしていないこと
- [ ] Phase 13（`/ai:diff-to-pr`）で参照する `TARGET_WORKFLOW_DIR` が今回差分のworkflowを指すことを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --regenerate

# 実装ガイド内容要件確認（Task 1）
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --json

# 未実施タスク誤配置チェック（completed-only area に未着手/未実施が混在していないか）
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks -g "*.md"

# 対象監査（今回変更分合否: current）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/{{TASK_FILE}}.md

# 差分監査（git差分を current 判定）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# TODO/FIXMEスキャン（補助）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc \
  --output docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-12/.tmp-unassigned-candidates.json

# ESLintキャッシュクリア（Hooksでエラーが残る場合）
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# SKILL検証（全3スキル一括）— 判定基準は spec-update-workflow.md Step 1-G.3.1 参照
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID | 漏れやすいポイント | 対策 |
| -- | ------------------ | ---- |
| P23 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新 |
| P24 | 未タスク検出時の関連ファイル調査不足 | `grep -rn` で同様パターンをプロジェクト全体から検索 |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P3 | 未タスク管理の3ステップ不完全 | 指示書作成だけでなく、テーブル登録まで完了すること |
| P3派生 | 未タスク配置ディレクトリの間違い（TASK-9B-I） | 必ず `unassigned-task/` に配置。親タスクの `tasks/` ではない |
| P48 | 全体監査FAILを今回差分FAILと誤認 | baselineとcurrentを分離し、今回差分起因の有無を別レポートで記録 |
| FB-UT-UIUX-001-A | UI/UX task のスクリーンショット証跡なしで Phase 12 completed にしてしまう | ⛔ ハードゲート5点（screenshot-plan.json / metadata JSON / coverage.md / 実PNG / validate PASS）を全確認してから closed にする |
| FB-UT-UIUX-001-B | `artifacts.json` に Phase 13 先送り wording が残る | Phase 13 でのみ解消できる wording は validator で弾く。close-out ターンで全部 current facts に変える |
| P48派生 | `audit --target-file` の対象スコープ誤用 | `--target-file` は root `unassigned-task/`、`completed-tasks/<workflow>/unassigned-task/`、standalone `completed-tasks/*.md` のいずれかに合わせる |
| - | テスト数の設計時固定値使用（TASK-9B-I） | Phase 12では `grep -c "it\\(" *.test.ts` で実測値を使用 |
