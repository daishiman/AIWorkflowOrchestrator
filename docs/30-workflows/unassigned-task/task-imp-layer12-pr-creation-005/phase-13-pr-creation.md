# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 値                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| Phase     | 13                                                                                                            |
| 機能名    | task-imp-layer12-pr-creation-005                                                                              |
| 作成日    | 2026-04-04                                                                                                    |
| 前提Phase | Phase 12（imp-layer12-spec-definition-004）完了（32/32 PASS）                                                 |
| 後続Phase | なし（最終Phase）                                                                                             |
| 成果物    | `outputs/phase-13/pr-info.md`, `outputs/phase-13/local-check-result.md`, `outputs/phase-13/change-summary.md` |

## 目的

ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認してタスクを完了する。

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと（Phase template phase13 ルール準拠）。

## blocked 状態の理由

本 Phase は以下が揃うまで BLOCKED 状態を維持する:

1. 未コミット変更がすべてコミット済みであること
2. ユーザーから明示的な PR 作成許可を得ていること

## 事前確認チェックリスト

PR 作成前に以下を必ず確認すること（苦戦箇所の再発防止）:

- [ ] `git status` で未コミット変更の一覧を確認した
- [ ] `docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json` の Phase 12 artifacts が 6 件であることを確認した
- [ ] `docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json` の Phase 12 artifacts が 6 件であることを確認した（root と outputs の両 `artifacts.json` が同期済み）
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js docs/30-workflows/imp-layer12-spec-definition-004` が PASS であることを確認した
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/imp-layer12-spec-definition-004` が 32/32 PASS のままであることを確認した

## 実行タスク

- Task 1: 事前確認（未コミット変更・validator 再確認）
- Task 2: ユーザーにローカル確認を依頼し、変更サマリーを提示
- Task 3: PR 作成許可確認（ユーザーの明示承認を得る）
- Task 4: コミット実行（未コミット変更がある場合）
- Task 5: PR 作成（`/ai:diff-to-pr` または手動フロー）
- Task 6: CI 通過確認
- Task 7: タスクディレクトリを completed-tasks に移動

## 参照資料

| 資料名                           | パス                                                                                                       | 説明           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| 元タスク Phase 11 テスト結果     | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-11/manual-test-result.md`                 | Phase 11成果物 |
| 元タスク Phase 12 実装ガイド     | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/implementation-guide.md`               | Phase 12成果物 |
| 元タスク Phase 12 仕様更新       | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/system-spec-update-summary.md`         | Phase 12成果物 |
| 元タスク Phase 12 未タスク       | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/unassigned-task-detection.md`          | Phase 12成果物 |
| 元タスク Phase 12 フィードバック | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/skill-feedback-report.md`              | Phase 12成果物 |
| 元タスク Phase 12 準拠確認       | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12成果物 |
| 苦戦箇所詳細                     | `docs/30-workflows/unassigned-task/task-imp-layer12-pr-creation-005/lessons-learned.md`                    | 本タスクの教訓 |
| review-gate-criteria.md          | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                             | PR前提条件     |

---

## 実行手順

### Task 1: 事前確認【必須】

PR 作成前に事前確認チェックリストをすべて消化し、結果を `outputs/phase-13/local-check-result.md` に記録する。

```bash
# 未コミット変更の確認
git status
git diff --stat

# validator 確認
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/imp-layer12-spec-definition-004

# artifacts.json の件数確認（6件であること）
cat docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['phases']['12']['artifacts']), '件')"
cat docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['phases']['12']['artifacts']), '件')"
```

### Task 2: ローカル確認依頼と変更サマリー提示【必須】

ユーザーにローカル環境での確認を依頼し、変更サマリーを提示する。

**提示内容**:

- 変更ファイル一覧（`git diff --stat` の結果）
- 追記内容の概要:
  - 19 check ID（Layer 1: 5個、Layer 2: 7個、Layer 3: 4個、Layer 4: 3個）
  - Layer 命名規則（`L{N}-{NNN}` 形式）
  - 拡張ガイドライン（新しい check ID の追加手順）
- Phase 11 手動テスト結果サマリー（NON_VISUAL / 32/32 PASS）
- Phase 12 ドキュメント更新結果サマリー

変更サマリーを `outputs/phase-13/change-summary.md` に記録する。

### Task 3: PR 作成許可確認【必須】

ユーザーから以下の形式で明示的な許可を得る:

```
「PR作成を許可します」または「/ai:diff-to-pr を実行してください」
```

**重要**: 許可を得るまで次のステップに進まないこと。

### Task 4: コミット実行（未コミット変更がある場合）【条件付き必須】

`git status` で未コミット変更が残っている場合は、PR 作成前にコミットする。

```bash
# 変更ファイルを確認
git diff --stat

# ステージング（docs/ と .claude/ のみ。コード変更がないことを確認）
git add docs/30-workflows/imp-layer12-spec-definition-004/
git add docs/30-workflows/unassigned-task/task-imp-layer12-pr-creation-005/
git add .claude/skills/aiworkflow-requirements/
git add .claude/skills/task-specification-creator/

# コミット（--no-verify は使用禁止）
git commit -m "docs(aiworkflow-requirements): check ID体系を追記（19 IDs, Layer 1-4命名規則）

- aiworkflow-requirementsにcheck ID体系セクションを追加
- Layer 1-4の全19 check IDとseverityを定義
- L{N}-{NNN}形式の命名規則と拡張ガイドラインを記載
- SkillCreatorVerificationEngine.tsとの対応関係を明文化
- Phase 1-12 全フェーズ完了（32/32 PASS）

Issue: #1738"
```

**注意**: `--no-verify` オプションは絶対に使用しないこと（CLAUDE.md 禁止事項）。

### Task 5: PR 作成（ユーザー許可後）【許可必須】

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

**フォールバック（`/ai:diff-to-pr` が使えない場合）**:

```bash
# 1. ブランチ確認
git branch --show-current

# 2. プッシュ
git push -u origin $(git branch --show-current)

# 3. PR作成
gh pr create \
  --title "docs(aiworkflow-requirements): check ID体系追記（19 IDs, Layer命名規則）" \
  --body "$(cat <<'EOF'
## Summary
- aiworkflow-requirements に SkillCreatorVerificationEngine の check ID 体系を追記
- 全 19 check ID（Layer 1: 5個, Layer 2: 7個, Layer 3: 4個, Layer 4: 3個）を定義
- L{N}-{NNN} 形式の命名規則と新規 check ID の拡張手順を記載

## 背景
- Phase 1-12 全フェーズ完了（32/32 PASS）
- docs-only タスク（コード変更なし）
- タスクID: task-imp-layer12-spec-definition-004

## Test plan
- [x] Phase 11: grep ベースの check ID 突き合わせ（実装 vs 仕様書、diff 0件）
- [x] Phase 11: 正規表現マッチ 19件（L{N}-{NNN} 形式準拠）
- [x] Phase 12: 実装ガイド 2パート構成（中学生レベル + 技術者レベル）
- [x] Phase 12: LOGS.md x2 / SKILL.md x2 / topic-map.md 更新済み
- [x] Phase 12: validate-phase12-implementation-guide.js PASS

Closes #1738

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 6: CI 通過確認【必須】

```bash
# PR 確認
gh pr view --json number,url,title

# CI チェック確認
gh pr checks

# CI 失敗時は原因を調査し、修正後に再プッシュ
```

### Task 7: タスクディレクトリを completed-tasks に移動【必須】

PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/imp-layer12-spec-definition-004/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep imp-layer12-spec-definition-004

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): imp-layer12-spec-definition-004をcompleted-tasksに移動"
git push
```

## 統合テスト連携

N/A -- docs-only タスクのため統合テストは不要。

## 成果物

| 成果物           | パス                                     | 必須 | 説明                         |
| ---------------- | ---------------------------------------- | ---- | ---------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ✅   | 事前確認チェックリストの結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | ✅   | git diff --stat + 変更概要   |
| PR情報           | `outputs/phase-13/pr-info.md`            | ✅   | PR URL・番号・CI結果         |

### pr-info.md テンプレート

```markdown
## PR情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| PR番号   | #{{PR_NUMBER}}                            |
| PR URL   | {{PR_URL}}                                |
| ブランチ | docs/task-imp-layer12-spec-definition-004 |
| CI結果   | PASS / FAIL                               |
| 作成日   | {{YYYY-MM-DD}}                            |

## 変更サマリー

- 変更ファイル数: {{N}}
- 追加行数: {{N}}
- 削除行数: {{N}}

## 主要変更内容

- aiworkflow-requirements に check ID 体系セクション追加（19 check ID）
- Layer 1-4 命名規則（L{N}-{NNN} 形式）の定義
- 拡張ガイドライン（新規 check ID 追加手順）
- Phase 11-12 補助証跡 3 点セット（NON_VISUAL）
- Phase 12 成果物 6 ファイル

## CIチェック結果

| チェック項目   | 結果 |
| -------------- | ---- |
| 仕様書整合検証 | PASS |
| 成果物検証     | PASS |
```

## 完了条件

- [ ] Task 1: 事前確認チェックリストを消化し、`outputs/phase-13/local-check-result.md` を作成した
- [ ] Task 2: 変更サマリーを提示し、`outputs/phase-13/change-summary.md` を作成した
- [ ] Task 3: ユーザーから明示的な PR 作成許可を得た
- [ ] Task 4: 未コミット変更がある場合はコミットした（`--no-verify` は使用禁止）
- [ ] Task 5: 全変更がコミットされ、PR が作成されている
- [ ] Task 6: CI が通過している
- [ ] Task 7: `outputs/phase-13/pr-info.md` が作成されている
- [ ] Task 7: タスクディレクトリが `docs/30-workflows/completed-tasks/imp-layer12-spec-definition-004/` に移動されている
- [ ] Task 7: 移動後のコミット・プッシュが完了している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

なし（本タスクの最終 Phase）
