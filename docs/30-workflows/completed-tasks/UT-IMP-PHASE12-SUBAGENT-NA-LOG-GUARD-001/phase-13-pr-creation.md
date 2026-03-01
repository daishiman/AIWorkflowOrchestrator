# Phase 13: PR作成

## メタ情報

| 項目      | 値                                                         |
| --------- | ---------------------------------------------------------- |
| タスクID  | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                   |
| Phase     | 13                                                         |
| 機能名    | Phase 12 仕様書別SubAgent N/A判定ログガード                |
| 作成日    | 2026-03-01                                                 |
| 前提Phase | Phase 12（ドキュメント更新）完了                           |
| 目的      | ユーザー許可を得てPRを作成し、CIを確認してタスクを完了する |
| 成果物    | `outputs/phase-13/pr-info.md`                              |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- Task 1: 成果物最終確認 — 全Phase（1-12）の成果物が揃っていることを確認
- Task 2: ローカル動作確認依頼 — ユーザーにローカルでの動作確認を依頼
- Task 3: 変更サマリー提示 — 変更内容のサマリーを提示しPR作成の許可を確認
- Task 4: PR作成 — ユーザーの許可後に PR を作成
- Task 5: 最終検証・タスク完了処理 — CI確認とタスクディレクトリ移動

## 参照資料

| 資料名               | パス                                          | 説明              |
| -------------------- | --------------------------------------------- | ----------------- |
| Phase 2 設計成果物   | `outputs/phase-2/`                            | 設計仕様          |
| Phase 5 実装成果物   | `outputs/phase-5/`                            | 実装内容          |
| Phase 6 テスト成果物 | `outputs/phase-6/`                            | テスト拡充結果    |
| Phase 7 成果物       | `outputs/phase-7/`                            | カバレッジ結果    |
| Phase 8 成果物       | `outputs/phase-8/`                            | リファクタ記録    |
| Phase 9 品質成果物   | `outputs/phase-9/`                            | 品質保証結果      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | Phase 10成果物    |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物    |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物    |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`     | Phase 12成果物    |
| artifacts.json       | `outputs/artifacts.json`                      | 全Phase成果物管理 |

## 実行手順

### ステップ1: 成果物最終確認【必須】

PR作成前に、全Phase の成果物が揃っていることを確認する。

**確認項目**:

- [ ] artifacts.json の全Phase（1-12）が `completed` ステータスであること
- [ ] 各Phase の必須成果物ファイルが物理的に存在すること
- [ ] **三点突合**: Phase 12の成果物実体5ファイル + artifacts.json completed + チェックリスト全チェック

```bash
# 成果物検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

# Phase 12 成果物存在確認
ls outputs/phase-12/implementation-guide.md
ls outputs/phase-12/spec-update-summary.md
ls outputs/phase-12/documentation-changelog.md
ls outputs/phase-12/unassigned-task-detection.md
ls outputs/phase-12/skill-feedback-report.md

# 品質検証（本タスクはドキュメントのみのため、lint/typecheckは仕様書整合検証で代替）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --json
```

### ステップ2: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

1. 仕様書の内容を確認し、運用改善の意図が正しく反映されていることを確認
2. 以下の主要ドキュメントを確認:
   - `phase-12-documentation.md` のN/A判定ログテンプレートと三点突合手順
   - `outputs/phase-12/implementation-guide.md` の概念的説明と技術的詳細
   - `outputs/phase-12/spec-update-summary.md` のStep実施結果
3. 既存の監査スクリプトが正常動作することを確認:
   ```bash
   node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
     --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --json
   ```

**重要**: ユーザーから動作確認完了の報告を受けるまで次のステップに進まないこと。

### ステップ3: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示内容**:

- 変更ファイル数と変更行数（`git diff --stat` の結果）
- 主要な変更内容:
  - Phase 11仕様書: 手動テスト検証（15テストケース）
  - Phase 12仕様書: ドキュメント更新（N/A判定ログ・三点突合・current/baseline分離）
  - Phase 13仕様書: PR作成手順
  - Phase 12成果物5ファイル
  - システム仕様書の更新（task-workflow.md, lessons-learned.md）
- 手動テスト結果サマリー（15項目）
- Phase 10最終レビュー結果

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ4: PR作成（ユーザー許可後）

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**フォールバック（`/ai:diff-to-pr` が使えない場合）**:

```bash
# 1. ブランチ確認
git branch --show-current

# 2. 全変更をステージング
git add -A

# 3. コミット
git commit -m "docs(workflow): Phase12監査反映 N/A判定ログガード仕様書追加

- Phase 11仕様書: 手動テスト検証（N/A判定ログ・三点突合・分離記録の15テストケース）
- Phase 12仕様書: ドキュメント更新（5Task構成・SubAgent分担表・N/A判定ログ例）
- Phase 13仕様書: PR作成手順
- 三点突合による機械的完了判定の導入
- current/baseline分離記録によるFAIL誤判定防止

Issue: #933"

# 4. プッシュ
git push -u origin $(git branch --show-current)

# 5. PR作成
gh pr create \
  --title "docs(workflow): Phase12 N/A判定ログガード仕様書追加" \
  --body "$(cat <<'EOF'
## Summary
- Phase 12 実行監査で発見された運用依存問題（N/A判定・artifacts同期・完了判定）の改善仕様書を追加
- 仕様書ごとに「更新」または「N/A」を必ず記録し、理由と代替証跡が残る運用テンプレートを定義
- 三点突合（成果物実体・artifacts.json・チェックリスト）による機械的完了判定を導入

## Test plan
- [ ] Phase 11手動テスト: 15テストケースがPASS
- [ ] verify-all-specs.js: 仕様書整合検証PASS
- [ ] validate-phase-output.js: Phase成果物検証PASS
- [ ] audit-unassigned-tasks.js: currentViolations.total = 0

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ5: CI確認・タスク完了処理【必須】

- PRが作成されていること
- CIが通過していること
- CIが失敗した場合は原因を調査し、修正後に再プッシュ

**タスク完了処理**:

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001をcompleted-tasksに移動"
git push
```

## 多角的チェック観点

| 観点             | 適用判断                             | 仕様参照先                |
| ---------------- | ------------------------------------ | ------------------------- |
| セキュリティ     | 非該当（運用改善タスク、コードなし） | -                         |
| UI/UX            | 非該当（仕様書・テンプレートのみ）   | -                         |
| アーキテクチャ   | 非該当（構造変更なし）               | -                         |
| 仕様書整合       | 適用（全Phase成果物の整合確認）      | `spec-update-workflow.md` |
| ドキュメント品質 | 適用（仕様書の完全性確認）           | `06-known-pitfalls.md`    |

## 成果物

| 成果物 | パス                          | 必須 | 説明                 |
| ------ | ----------------------------- | ---- | -------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | ✅   | PR URL・番号・CI結果 |

### pr-info.md テンプレート

```markdown
## PR情報

| 項目     | 値              |
| -------- | --------------- |
| PR番号   | #{{PR_NUMBER}}  |
| PR URL   | {{PR_URL}}      |
| ブランチ | {{BRANCH_NAME}} |
| CI結果   | PASS / FAIL     |
| 作成日   | {{YYYY-MM-DD}}  |

## 変更サマリー

- 変更ファイル数: {{N}}
- 追加行数: {{N}}
- 削除行数: {{N}}

## 主要変更内容

- Phase 11仕様書（手動テスト検証 15テストケース）
- Phase 12仕様書（ドキュメント更新 5Task構成 N/A判定ログ・三点突合導入）
- Phase 13仕様書（PR作成手順）
- Phase 12成果物5ファイル
- システム仕様書更新（task-workflow.md, lessons-learned.md）

## CIチェック結果

| チェック項目   | 結果 |
| -------------- | ---- |
| 仕様書整合検証 | PASS |
| 成果物検証     | PASS |
| 未タスク監査   | PASS |
```

## 完了条件

- [ ] 全Phase（1-12）の成果物が揃っていることを確認した
- [ ] artifacts.json の全Phase が `completed` ステータスであることを確認した
- [ ] **三点突合がPASS**（成果物実体 + artifacts.json + チェックリスト）
- [ ] 仕様書整合検証（`verify-all-specs.js`）がPASSしている
- [ ] ユーザーにローカル動作確認を依頼し、確認完了の報告を受けている
- [ ] 変更サマリーを提示し、PR作成の明示的な許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/` に移動されている
- [ ] 移動後のコミット・プッシュが完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・ディレクトリ移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 成果物最終確認（全Phase成果物・三点突合）
2. ユーザーにローカル動作確認を依頼
3. 変更サマリーの提示と許可確認
4. PR作成（`/ai:diff-to-pr` 実行）
5. CI確認
6. タスクディレクトリ移動
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

なし（ワークフロー完了）

**実行ガード**: ユーザーの明示的な許可なしにコミットおよびPR作成を実行しないこと。
