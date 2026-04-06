# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 13                               |
| 機能名    | imp-layer12-spec-definition-004  |
| 作成日    | 2026-04-03                       |
| 前提Phase | Phase 12（ドキュメント更新）完了 |
| 後続Phase | なし（最終Phase）                |
| 成果物    | `outputs/phase-13/pr-info.md`    |

## 目的

ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認してタスクを完了する。

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

## 実行タスク

- Task 1: ユーザーにローカル動作確認を依頼
- Task 2: 変更サマリー提示と PR 作成許可確認
- Task 3: ユーザー許可後に `/ai:diff-to-pr` を実行
- Task 4: CI 通過確認
- Task 5: タスクディレクトリを completed-tasks に移動

## 参照資料

| 資料名                  | パス                                             | 説明             |
| ----------------------- | ------------------------------------------------ | ---------------- |
| Phase 11 テスト結果     | `outputs/phase-11/manual-test-result.md`         | Phase 11成果物   |
| Phase 11 発見課題       | `outputs/phase-11/discovered-issues.md`          | Phase 11発見事項 |
| Phase 12 実装ガイド     | `outputs/phase-12/implementation-guide.md`       | Phase 12成果物   |
| Phase 12 仕様更新       | `outputs/phase-12/system-spec-update-summary.md` | Phase 12成果物   |
| Phase 12 更新履歴       | `outputs/phase-12/documentation-changelog.md`    | Phase 12成果物   |
| Phase 12 未タスク       | `outputs/phase-12/unassigned-task-detection.md`  | Phase 12成果物   |
| Phase 12 フィードバック | `outputs/phase-12/skill-feedback-report.md`      | Phase 12成果物   |

---

## 実行手順

### Task 1: ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

1. 仕様書の内容を確認し、check ID 体系の追記が正しく反映されていることを確認
2. 以下の主要ドキュメントを確認:
   - `outputs/phase-12/implementation-guide.md`（概念的説明と技術的詳細）
   - `outputs/phase-12/system-spec-update-summary.md`（仕様更新の実施結果）
   - aiworkflow-requirements に追記された check ID 体系セクション

**重要**: ユーザーから動作確認完了の報告を受けるまで次のステップに進まないこと。

### Task 2: 変更サマリー提示と PR 作成許可確認【必須】

変更内容のサマリーを提示し、PR を作成してよいかユーザーに確認する。

**提示内容**:

- 変更ファイル一覧（`git diff --stat` の結果）
- 追記内容の概要:
  - 19 check ID（Layer 1: 5個、Layer 2: 7個、Layer 3: 4個、Layer 4: 3個）
  - Layer 命名規則（`L{N}-{NNN}` 形式）
  - 拡張ガイドライン（新しい check ID の追加手順）
- Phase 11 手動テスト結果サマリー
- Phase 12 ドキュメント更新結果サマリー

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### Task 3: PR 作成（ユーザー許可後）【許可必須】

ユーザーの許可を得た後、PR 作成を実行する。

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
git commit -m "docs(aiworkflow-requirements): check ID体系を追記（19 IDs, Layer 1-4命名規則）

- aiworkflow-requirementsにcheck ID体系セクションを追加
- Layer 1-4の全19 check IDとseverityを定義
- L{N}-{NNN}形式の命名規則と拡張ガイドラインを記載
- SkillCreatorVerificationEngine.tsとの対応関係を明文化

Issue: #<ISSUE_NUMBER>"

# 4. プッシュ
git push -u origin $(git branch --show-current)

# 5. PR作成
gh pr create \
  --title "docs(aiworkflow-requirements): check ID体系追記（19 IDs, Layer命名規則）" \
  --body "$(cat <<'EOF'
## Summary
- aiworkflow-requirements に SkillCreatorVerificationEngine の check ID 体系を追記
- 全 19 check ID（Layer 1: 5個, Layer 2: 7個, Layer 3: 4個, Layer 4: 3個）を定義
- L{N}-{NNN} 形式の命名規則と新規 check ID の拡張手順を記載

## Test plan
- [ ] Phase 11: grep ベースの check ID 突き合わせ（実装 vs 仕様書、diff 0件）
- [ ] Phase 11: 正規表現マッチ 19件（L{N}-{NNN} 形式準拠）
- [ ] Phase 12: 実装ガイド 2パート構成（中学生レベル + 技術者レベル）
- [ ] Phase 12: LOGS.md x2 / SKILL.md x2 / topic-map.md 更新済み

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 4: CI 通過確認【必須】

- PR が作成されていること
- CI が通過していること
- CI が失敗した場合は原因を調査し、修正後に再プッシュ

### Task 5: タスクディレクトリを completed-tasks に移動【必須】

PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/imp-layer12-spec-definition-004/ docs/30-workflows/completed-tasks/

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

- aiworkflow-requirements に check ID 体系セクション追加（19 check ID）
- Layer 1-4 命名規則（L{N}-{NNN} 形式）の定義
- 拡張ガイドライン（新規 check ID 追加手順）
- Phase 11-13 仕様書
- Phase 12 成果物 5 ファイル

## CIチェック結果

| チェック項目   | 結果 |
| -------------- | ---- |
| 仕様書整合検証 | PASS |
| 成果物検証     | PASS |
```

## 完了条件

- [ ] Task 1: ユーザーにローカル動作確認を依頼し、確認完了の報告を受けた
- [ ] Task 2: 変更サマリーを提示し、PR 作成の明示的な許可を得た
- [ ] Task 3: 全変更がコミットされ、PR が作成されている
- [ ] Task 4: CI が通過している
- [ ] Task 5: `outputs/phase-13/pr-info.md` が作成されている
- [ ] Task 5: タスクディレクトリが `docs/30-workflows/completed-tasks/imp-layer12-spec-definition-004/` に移動されている
- [ ] Task 5: 移動後のコミット・プッシュが完了している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

なし（本タスクの最終 Phase）
