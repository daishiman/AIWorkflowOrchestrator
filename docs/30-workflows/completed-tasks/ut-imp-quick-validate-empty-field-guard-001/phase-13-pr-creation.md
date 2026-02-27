# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                          |
| ---------- | ----------------------------------------------------------- |
| Phase      | 13                                                          |
| 前提Phase  | Phase 12（ドキュメント更新）完了                            |
| 後続Phase  | なし（ワークフロー完了）                                    |
| ステータス | 未実施                                                      |
| 機能名     | ut-imp-quick-validate-empty-field-guard-001                 |
| タスクID   | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001                 |
| Issue番号  | #913                                                        |
| 作成日     | 2026-02-27                                                  |
| ブランチ名 | `feature/ut-imp-quick-validate-empty-field-guard-001-specs` |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認
- タスクディレクトリ移動: completed-tasks へ移動

## 参照資料

| 資料名                    | パス                                                                       | 説明           |
| ------------------------- | -------------------------------------------------------------------------- | -------------- |
| Phase 10 最終レビュー     | `outputs/phase-10/final-review-result.md`                                  | Phase 10成果物 |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                   | Phase 11成果物 |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`                              | Phase 12成果物 |
| Phase 12 実装ガイド       | `outputs/phase-12/implementation-guide.md`                                 | Phase 12成果物 |
| Phase 12 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`                            | Phase 12成果物 |
| Phase 2 設計              | `phase-2-design.md`                                                        | 設計仕様       |
| Phase 5 実装              | `phase-5-implementation.md`                                                | 実装仕様       |
| Phase 6 テスト拡充        | `phase-6-test-expansion.md`                                                | テスト拡充仕様 |
| Phase 7 カバレッジ        | `phase-7-coverage-check.md`                                                | カバレッジ確認 |
| Phase 8 リファクタ        | `phase-8-refactoring.md`                                                   | リファクタ仕様 |
| Phase 9 品質保証          | `phase-9-quality-assurance.md`                                             | 品質保証仕様   |
| task-workflow-rules       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | PR前品質ゲート |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

```
以下のコマンドを実行して、修正が正しく動作することを確認してください:

1. 正常系テスト:
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator

2. 自動テスト:
   cd .claude/skills/skill-creator && pnpm test -- quick_validate

上記2つが成功したら、PR作成に進みます。
```

**重要**: ユーザーが確認完了を報告するまで、次のステップに進まない。

### ステップ2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**提示するサマリー**:

```markdown
## 変更サマリー

### タスク

UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001: quick_validate.js name/description 空フィールドガード追加

### 修正内容

- `quick_validate.js` の name/description フィールド検証に P42準拠3段バリデーションを追加
  - 型チェック（typeof !== "string"）
  - 空文字列チェック（=== ""）
  - トリム後空文字列チェック（.trim() === ""）
- 非文字列型（数値、boolean）入力時のランタイムエラー（TypeError）を防止

### 変更ファイル

- `.claude/skills/skill-creator/scripts/quick_validate.js` — バリデーションロジック強化
- `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js` — テストケース追加

### テスト結果

- 自動テスト: 全件PASS
- 手動テスト: 全件PASS（Phase 11完了）

PRを作成してよろしいですか？
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しない。

### ステップ3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr feature/ut-imp-quick-validate-empty-field-guard-001-specs
```

**PR情報**:

| 項目       | 値                                                               |
| ---------- | ---------------------------------------------------------------- |
| ブランチ名 | `feature/ut-imp-quick-validate-empty-field-guard-001-specs`      |
| PRタイトル | `fix(skill-creator): add empty field guard to quick_validate.js` |
| ベース     | `main`                                                           |

**PR本文テンプレート**:

```markdown
## Summary

- quick_validate.js の name/description フィールドにP42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）を追加
- 非文字列型入力時の TypeError を防止し、明示的なバリデーションエラーメッセージを出力
- 発見元: UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 10 MINOR #2

## Test plan

- [ ] 正常系テスト: 既存スキル（task-specification-creator, aiworkflow-requirements, skill-creator）の検証が成功すること
- [ ] 異常系テスト: 空文字列・スペースのみ・数値・boolean入力でランタイムエラーが発生しないこと
- [ ] 回帰テスト: `pnpm -C .claude/skills/skill-creator test -- quick_validate` で全件PASS
- [ ] 手動テスト: Phase 11の全テストケースがPASS

Closes #913

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### ステップ4: 実行結果の確認

- [ ] PRが作成されていること
- [ ] PR URLが `outputs/phase-13/pr-info.md` に記録されていること
- [ ] CIが通過していること（GitHub Actions の結果を確認）

**CI確認コマンド**:

```bash
# PR番号を確認
gh pr list --head feature/ut-imp-quick-validate-empty-field-guard-001-specs

# CIステータス確認
gh pr checks <PR_NUMBER>
```

**CI失敗時の対応**:

1. `gh pr checks <PR_NUMBER>` でどのチェックが失敗したか特定
2. 失敗原因を調査・修正
3. 修正をコミット・プッシュ
4. CIの再実行を待つ

### ステップ5: タスクディレクトリ移動

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep ut-imp-quick-validate-empty-field-guard-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): ut-imp-quick-validate-empty-field-guard-001をcompleted-tasksに移動"
git push
```

### ステップ6: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# 1. ブランチ作成（既存でない場合）
git checkout -b feature/ut-imp-quick-validate-empty-field-guard-001-specs

# 2. 変更をステージング
git add .claude/skills/skill-creator/scripts/quick_validate.js
git add .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js
git add docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/

# 3. コミット
git commit -m "fix(skill-creator): add empty field guard to quick_validate.js

P42準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）を
name/descriptionフィールドに追加し、非文字列型入力時のTypeErrorを防止。

Closes #913

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# 4. プッシュ
git push -u origin feature/ut-imp-quick-validate-empty-field-guard-001-specs

# 5. PR作成
gh pr create \
  --title "fix(skill-creator): add empty field guard to quick_validate.js" \
  --body "$(cat <<'EOF'
## Summary
- quick_validate.js の name/description フィールドにP42準拠の3段バリデーションを追加
- 非文字列型入力時の TypeError を防止し、明示的なバリデーションエラーメッセージを出力
- 発見元: UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 10 MINOR #2

## Test plan
- [ ] 正常系テスト: 既存スキルの検証が成功すること
- [ ] 異常系テスト: 空文字列・スペースのみ・数値・boolean入力でランタイムエラーが発生しないこと
- [ ] 回帰テスト: pnpm test で全件PASS
- [ ] 手動テスト: Phase 11の全テストケースがPASS

Closes #913

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# 6. CI確認
gh pr checks <PR_NUMBER>
```

## 統合テスト連携

本タスクはNode.jsスクリプトの修正であり、CI以外の統合テスト連携は**非該当**:

| テスト項目        | 適用判断 | 理由                         |
| ----------------- | -------- | ---------------------------- |
| CI/CDパイプライン | **適用** | PR作成後のGitHub Actions確認 |
| API接続テスト     | 非該当   | API通信なし                  |
| 認証連携テスト    | 非該当   | 認証処理なし                 |
| E2Eテスト         | 非該当   | UIなし（CLIスクリプト）      |

## 多角的チェック観点

| 観点           | 適用判断 | 確認内容                                           |
| -------------- | -------- | -------------------------------------------------- |
| CI/CD          | **適用** | GitHub Actions の全チェックがPASSすること          |
| PRフォーマット | **適用** | タイトル70文字以内、Summary + Test Plan を含むこと |
| セキュリティ   | 非該当   | 機密情報のコミット混入がないこと（自動チェック）   |
| ブランチ規約   | **適用** | `feature/` プレフィックスであること                |

## 成果物

| 成果物 | パス                          | 説明                       |
| ------ | ----------------------------- | -------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、ブランチ名、CI結果 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] ユーザーからPR作成の明示的許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] PRタイトルが70文字以内: `fix(skill-creator): add empty field guard to quick_validate.js`
- [ ] PR本文にSummary + Test Plan + `Closes #913` が含まれている
- [ ] CIが通過している
- [ ] PR URLが `outputs/phase-13/pr-info.md` に記録されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. ユーザーへのローカル動作確認依頼
2. 変更サマリー提示・PR許可確認
3. `/ai:diff-to-pr` 実行（またはフォールバック手順）
4. CI通過確認
5. `outputs/phase-13/pr-info.md` 作成
6. タスクディレクトリの `completed-tasks/` への移動
7. 完了条件の全項目検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001
```

## 次のPhase

なし（ワークフロー完了）
