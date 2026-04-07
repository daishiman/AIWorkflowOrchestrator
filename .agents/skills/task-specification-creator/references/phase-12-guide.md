# Phase 12 ドキュメント更新ガイド

> 元ファイル: `phase-11-12-guide.md` から分割
> 読み込み条件: Phase 12 を開始する時。

## Phase 12: ドキュメント更新

### 必須タスク（5タスク - 全て完了必須）

#### Task 1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者 | 内容 |
| ------ | -------- | ---- |
| **Part 1** | **初学者・中学生レベル** | **概念的説明（日常の例え話、専門用語なし）** |
| Part 2 | 開発者・技術者 | 技術的詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）記述ルール**:
- 日常生活での例え話を**必ず**含め、`たとえば` を最低1回明示する
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 作成後に `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

**Part 1 テンプレート**:
```markdown
### X.X [機能名]とは何か

#### 日常生活での例え

[日常の具体的なシーン]に似ています。

例えば、[身近な例]のようなものです。

#### この機能でできること

| 機能 | 説明 | 例 |
|------|------|-----|
| 機能A | 簡単な説明 | 具体例 |
```

📖 **詳細**: `references/technical-documentation-guide.md`
📖 **実体確認**: `references/phase12-checklist-definition.md`

---

#### Task 2: システム仕様書更新【必須・2ステップ】

> **重要**: 詳細は `references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録【必須・全タスク】**

```
□ 該当する仕様書に「## 完了タスク」セクションを追加
□ 「## 関連ドキュメント」に実装ガイドリンクを追加
```

**Step 2: システム仕様更新【条件付き】**

更新判断基準:

| 更新必要 | 更新不要 |
| -------- | -------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
| 既存インターフェース変更 | リファクタリング（IF不変） |
| 新規定数/設定値追加 | バグ修正（仕様変更なし） |
| 外部連携インターフェース追加 | テスト追加のみ |

---

#### Task 3: ドキュメント更新履歴作成

```bash
# 自動生成スクリプト（推奨）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

生成後、手動で補完:
- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

#### Task 3.5: 実行証跡整合ガード【必須】

Phase 12 は「成果物ファイルが存在する」だけでは完了扱いにしない。以下3点を同時に満たすこと:

1. `outputs/phase-12/` の必須5成果物が実在する
2. `artifacts.json` の `phases.12.status` が `completed` である
3. `phase-12-documentation.md` の `ステータス=completed` と完了チェックリストが実体証跡と同期している

差分監査の合否判定は `audit-unassigned-tasks --diff-from HEAD` の `currentViolations.total` を使用し、`baselineViolations.total` は監視値として別記録する。

---

#### Task 4: 未タスク検出レポート作成【0件でも出力必須】

| ソース | 確認項目 |
| ------ | -------- |
| Phase 11テスト結果 | FAILテスト |
| 発見課題 | 重要度「高」課題 |
| アクセシビリティ | WCAG違反 |

**0件の場合の出力形式**:

```markdown
## 検出結果サマリー

| ソース | 検出数 |
| ------ | ------ |
| テスト結果 | 0件 |
| 発見課題 | 0件 |
| アクセシビリティ | 0件 |
| **合計** | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

#### Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

| 観点 | 確認内容 |
| --- | --- |
| テンプレート改善 | Phaseテンプレートの不足・曖昧な判定条件 |
| ワークフロー改善 | 自動検証化できるチェックポイント |
| ドキュメント改善 | 横断ガイドライン化すべき知見 |

**出力**: `outputs/phase-12/skill-feedback-report.md`

Task 5 の基本対象は `aiworkflow-requirements` と `task-specification-creator` だが、ユーザーがスキル改善を明示した場合、または Task 5 で再利用パターンを抽出して `skill-creator` 自体を更新した場合は、`skill-creator` も同じレポートへ含める。

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
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した（Warning の分類は `spec-update-workflow.md` Step 1-G.3.1 を参照）
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
- [ ] completed workflow の `phase-12-documentation.md` に `仕様策定のみ` / `実行予定` / `保留として記録` などの planned wording が残っていない
- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 初回判定が 0 件でも、親タスクの苦戦箇所を cross-cutting guard として formalize する必要が判明した場合は、`unassigned-task-detection.md` / `system-spec-update-summary.md` / `documentation-changelog.md` を 0→1 へ再同期した
- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】
- [ ] 未タスク検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した ⚠️ **P24: 漏れやすい**
- [ ] 未タスク検出時、**3ステップ全完了**（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 未タスク検出時、**指示書の物理ファイル存在を確認**（`ls docs/30-workflows/unassigned-task/` で作成済みファイルを検証）
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`task-workflow.md` 内の未タスクリンク参照切れが0件であることを確認
- [ ] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、completed成果物の参照切れが0件であることを確認
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
- [ ] 【品質】ESLintキャッシュをクリアしてlintを再実行した（下記コマンド参照）
- [ ] 【品質】コメントフォーマット（JSDoc形式）が統一されている
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されていること（親タスクのtasks/ではない） ⚠️ **P3派生: TASK-9B-Iで再発**
- [ ] テスト数が実際の `it()` ブロック数と一致すること（Phase 4 の想定値ではなく実測値を使用） ⚠️ **TASK-9B-I教訓**
- [ ] SDK 型定義変更時は、カスタム declare module ファイルの有無を確認し、不要なら削除を未タスク化すること
- [ ] UI/UX変更タスクの場合: Phase 11のスクリーンショットがコミットに含まれる状態であること
- [ ] UI/UX変更タスクの場合: 再撮影前に preview preflight（build成功 + `127.0.0.1:4173` 疎通）を記録し、失敗時は未タスク化したこと
- [ ] UI/UX変更タスクの場合: 再撮影後に `stat` 実時刻と `manual-test-result.md`（必要に応じて `screenshot-coverage.md`）の更新時刻が一致していること
- [ ] UI/UX変更タスクの場合: `validate-phase11-screenshot-coverage.js --workflow <workflow-path>` が PASS であることを Phase 12成果物に記録した
- [ ] `phase-12-documentation.md` の Task 1-5 / Step 1-A〜3 / 完了条件チェックが、実績に合わせて `[x]` へ同期されている
- [ ] Step 2 で domain spec を更新した場合、少なくとも 1 つの正本仕様書に `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード`、またはそれと等価な lessons 参照が記録されている
- [ ] 既存未タスクを参照する場合、リンク先が **未実施なら** `docs/30-workflows/unassigned-task/`、**完了済みなら** `docs/30-workflows/completed-tasks/**/unassigned-task/` になっていることを確認した
- [ ] `unassigned-task-detection.md` に既存未タスクを流用した理由と、物理配置確認結果（`ls docs/30-workflows/unassigned-task/`）を記録した
- [ ] PRコメントに `## 📖 実装ガイド（全文）` が存在し、Part 1/Part 2 の両方を含むことを `gh api .../issues/<PR_NUMBER>/comments` で確認した
- [ ] PR本文/PRコメントへ掲載する画像リンクが `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLであること（相対パスのまま投稿しない）
- [ ] スクリーンショットコメント更新時に、実装ガイド全文コメントを編集・上書きしていないこと
- [ ] Phase 13（`/ai:diff-to-pr`）で参照する `TARGET_WORKFLOW_DIR` が今回差分のworkflowを指すことを確認した
- [ ] PR本文（`.github/pull_request_template.md` 準拠）の `## その他` に Phase 12 実装ガイド反映元パスと要点を記載する準備ができている
- [ ] **本Phase内の全タスクを100%実行完了**

### Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --regenerate

# 実装ガイド内容要件（Task 1）
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

# standalone 完了指示書の current 監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/{{TASK_FILE}}.md

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

# 未使用importの自動修正
pnpm lint --fix

# SKILL検証（正規経路: quick_validate.js）— 判定基準は spec-update-workflow.md Step 1-G.3.1 参照
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements

# 検証結果の読み方:
#   ✓ = Pass（検証項目をパス）
#   ⚠ = Warning（合否に影響しない。分類は spec-update-workflow.md Step 1-G.3.1 参照）
#   ✗ = Error（修正必須）
# SKILL frontmatter検証（全3スキル一括）
# 判定基準・Warning分類の詳細は spec-update-workflow.md Step 1-G.3 / 3.1 を参照
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

### ⚠️ Phase 12 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID | 漏れやすいポイント | 対策 |
| -- | ------------------ | ---- |
| P23 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新 |
| P24 | 未タスク検出時の関連ファイル調査不足 | `grep -rn` で同様パターンをプロジェクト全体から検索 |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P3 | 未タスク管理の3ステップ不完全 | 指示書作成だけでなく、テーブル登録まで完了すること |
| P3派生 | 未タスク配置ディレクトリの間違い（TASK-9B-I） | 必ず `unassigned-task/` に配置。親タスクの `tasks/` ではない |
| P48 | 全体監査FAILを今回差分FAILと誤認 | baselineとcurrentを分離し、今回差分起因の有無を別レポートで記録 |
| P48派生 | `audit --target-file` の対象スコープ誤用 | `--target-file` は root `unassigned-task/`、actual parent `completed-tasks/<workflow>/unassigned-task/`、standalone `completed-tasks/*.md` のいずれかに合わせる。移動直後の untracked completed file は `--diff-from HEAD` で拾えないため `--target-file` を正本にする |
| - | テスト数の設計時固定値使用（TASK-9B-I） | Phase 12では `grep -c "it\\(" *.test.ts` で実測値を使用 |

---

## 完了タスク

### タスク: UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 Phase 11 Worktree環境テストプロトコル標準化（2026-03-01完了）

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                                                  |
| 完了日     | 2026-03-01                                                                                             |
| ステータス | **完了**                                                                                               |
| 概要       | Phase 11の3層テスト分類（Layer 1-3）をWorktree制約に合わせて標準化し、CIにElectron E2Eジョブを追加 |

#### 関連ドキュメント

- `../../../../docs/30-workflows/completed-tasks/ut-imp-phase11-worktree-protocol/phase-11-manual-test.md`
- `../../../../docs/30-workflows/completed-tasks/ut-imp-phase11-worktree-protocol/phase-12-documentation.md`
- `../../../../docs/30-workflows/completed-tasks/ut-imp-phase11-worktree-protocol/outputs/phase-12/system-spec-update-summary.md`

---

### タスク: UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 skill-creator検証ゲート整合化（2026-02-26完了）

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                                    |
| 完了日     | 2026-02-26                                                                                     |
| ステータス | **完了**                                                                                       |
| 概要       | `quick_validate.js` 統一経路、Warning判定基準、Phase 11/12成果物の整合、未タスク監査運用を同期 |

#### 関連ドキュメント

- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-11-manual-test.md`
- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-12-documentation.md`
- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/system-spec-update-summary.md`

---

1. UI task で screenshot を省略しない。
2. docs-only task では screenshot を要求せず、manual walkthrough と mirror parity を証跡化する。
3. user が root を明示した場合はその root を canonical として扱う。
4. completed workflow では planned wording を残さない。

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-12 | Phase 11 と Phase 12 の detail を別ファイルへ分離 |
| 2026-04-07 | phase-11-12-guide.md から phase-12-guide.md として分割 |
