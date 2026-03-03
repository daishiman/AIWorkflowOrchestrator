# Phase 13: 完了・PR準備

## メタ情報

| 項目      | 値                                       |
| --------- | ---------------------------------------- |
| タスク ID | TASK-10A-A                               |
| Phase     | 13                                       |
| 機能名    | SkillManagementPanel（スキル管理パネル） |
| 作成日    | 2026-03-02                               |
| 前提Phase | Phase 12（ドキュメント更新 完了）        |
| 後続Phase | なし（ワークフロー完了）                 |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- 成果物確認: Phase 1-12の全成果物が存在することを確認
- artifacts.json更新: 全Phaseのステータスを完了に更新
- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後にPRを作成
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名                       | パス                                                                                  | 説明                               |
| ---------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11/12ガイド            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`           | 手動テスト・ドキュメント作成ガイド |
| 仕様更新フロー               | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`        | 仕様更新ワークフロー               |
| 成果物命名規則               | `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md` | ファイル命名                       |
| 設計書                       | `phase-2-design.md`                                                                   | 設計仕様                           |
| 実装サマリー                 | `phase-5-implementation.md`                                                           | 実装サマリー                       |
| テスト拡充結果               | `outputs/phase-6/test-expansion-result.md`                                            | テスト拡充結果                     |
| カバレッジ結果               | `outputs/phase-7/coverage-report.md`                                                  | カバレッジ結果                     |
| リファクタ結果               | `outputs/phase-8/refactoring-report.md`                                               | 品質改善結果                       |
| 品質検証結果                 | `outputs/phase-9/quality-report.md`                                                   | 品質検証結果                       |
| 最終レビュー結果             | `outputs/phase-10/final-review-report.md`                                             | Phase 10成果物                     |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                              | Phase 11成果物                     |
| 発見課題リスト               | `outputs/phase-11/discovered-issues.md`                                               | Phase 11成果物                     |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                            | Phase 12成果物                     |
| コンポーネントドキュメント   | `outputs/phase-12/component-documentation.md`                                         | Phase 12成果物                     |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`                                             | Phase 12成果物                     |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                         | Phase 12成果物                     |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                       | Phase 12成果物                     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                           | Phase 12成果物                     |

## 実行手順

### 1. 成果物確認【必須】

Phase 1-12の全成果物が存在することを確認する。

```bash
# 成果物存在確認
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL
```

**スクリプト未存在時の代替手順**:

手動で以下のファイルの存在を確認する:

| Phase | 成果物パス                                      | 必須 |
| ----- | ----------------------------------------------- | ---- |
| 1     | `phase-1-requirements.md`                       | ✅   |
| 2     | `phase-2-design.md`                             | ✅   |
| 3     | `phase-3-design-review.md`                      | ✅   |
| 4     | `outputs/phase-4/test-red-result.md`            | ✅   |
| 5     | `outputs/phase-5/test-green-result.md`          | ✅   |
| 6     | `outputs/phase-6/test-expansion-result.md`      | ✅   |
| 7     | `outputs/phase-7/coverage-report.md`            | ✅   |
| 8     | `outputs/phase-8/refactoring-report.md`         | ✅   |
| 9     | `outputs/phase-9/quality-report.md`             | ✅   |
| 10    | `outputs/phase-10/final-review-report.md`       | ✅   |
| 11    | `outputs/phase-11/manual-test-result.md`        | ✅   |
| 11    | `outputs/phase-11/discovered-issues.md`         | ✅   |
| 12    | `outputs/phase-12/implementation-guide.md`      | ✅   |
| 12    | `outputs/phase-12/component-documentation.md`   | ✅   |
| 12    | `outputs/phase-12/documentation-changelog.md`   | ✅   |
| 12    | `outputs/phase-12/spec-update-summary.md`       | ✅   |
| 12    | `outputs/phase-12/unassigned-task-detection.md` | ✅   |
| 12    | `outputs/phase-12/skill-feedback-report.md`     | ✅   |

```bash
# 手動確認コマンド
for f in \
  phase-1-requirements.md \
  phase-2-design.md \
  phase-3-design-review.md \
  outputs/phase-4/test-red-result.md \
  outputs/phase-5/test-green-result.md \
  outputs/phase-6/test-expansion-result.md \
  outputs/phase-7/coverage-report.md \
  outputs/phase-8/refactoring-report.md \
  outputs/phase-9/quality-report.md \
  outputs/phase-10/final-review-report.md \
  outputs/phase-11/manual-test-result.md \
  outputs/phase-11/discovered-issues.md \
  outputs/phase-12/implementation-guide.md \
  outputs/phase-12/component-documentation.md \
  outputs/phase-12/documentation-changelog.md \
  outputs/phase-12/spec-update-summary.md \
  outputs/phase-12/unassigned-task-detection.md \
  outputs/phase-12/skill-feedback-report.md; do
  if [ -f "docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/$f" ]; then
    echo "✅ $f"
  else
    echo "❌ $f (MISSING)"
  fi
done
```

### 2. artifacts.json 更新【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL \
  --phase 13
```

**スクリプト未存在時の代替手順**: 手動で `artifacts.json` の Phase 13 ステータスを `completed` に更新する。

### 3. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

```
以下の動作確認をお願いします:

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. スキル管理パネルに遷移
3. 以下を確認:
   - スキル一覧が正しく表示される
   - 検索バーでスキルをフィルタリングできる
   - 「編集」ボタンでSkillEditorが開く
   - 「分析」ボタンでSkillAnalysisViewが開く
   - 「削除」ボタンでスキルが削除される
   - 「新規スキル作成」でSkillCreateWizardが開く
   - ローディング状態が正しく表示される
   - ダークモードで正しく表示される
   - キーボード操作が正常に動作する
```

### 4. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 新規作成ファイル

- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` — SkillManagementPanel 本体
- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` — テストファイル
- 関連サブコンポーネント（SkillListItem, SkillSearchBar 等）

### 変更ファイル

- 仕様書更新（ui-ux-components.md, arch-ui-components.md 等）

### 変更なし（リグレッション安全）

- 既存コンポーネント（AgentView, SettingsView 等）に変更なし
```

### 5. PR作成【ユーザー許可後のみ】

**⚠️ ユーザーの明示的な許可を得てから実行する。許可前に実行しない。**

```bash
# PRブランチ
git checkout -b feature/task-10a-a-skill-management-panel

# PR作成
gh pr create \
  --title "feat(skill): TASK-10A-A SkillManagementPanel実装" \
  --body "$(cat <<'EOF'
## Summary
- SkillManagementPanel コンポーネント実装
- スキル一覧表示・検索・編集/分析/削除操作
- テスト（実行時に記録）件、カバレッジ基準達成

## Test Plan
- [ ] 自動テスト全PASS
- [ ] 手動テスト全10シナリオPASS
- [ ] TypeScript型エラー0件
- [ ] ESLintエラー0件

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 6. CI確認【PR作成後】

```bash
# CIステータス確認
gh pr checks <PR番号>
```

- 全CIジョブがPASSしていることを確認
- FAILしたジョブがある場合、原因を調査し修正

### 7. 完了記録【必須】

`outputs/phase-13/completion-report.md` に以下を記録:

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-10A-A                                |
| 完了日       | YYYY-MM-DD（実行日）                      |
| PRブランチ   | feature/task-10a-a-skill-management-panel |
| PR番号       | #XXX                                      |
| CIステータス | PASS / FAIL                               |
| 全Phase完了  | ✅ Phase 1-13                             |
| 成果物件数   | （実行時に記録）件                        |

---

## 成果物

| 成果物       | パス                                    | 必須 | 説明             |
| ------------ | --------------------------------------- | ---- | ---------------- |
| 完了レポート | `outputs/phase-13/completion-report.md` | ✅   | 最終完了レポート |

## 完了条件

- [ ] Phase 1-12の全成果物の存在確認が完了している
- [ ] artifacts.json の全Phase（1-13）のステータスが `completed` である
- [ ] ユーザーにローカル動作確認を依頼した
- [ ] ユーザーから明示的な許可を得てからPRを作成した（許可前にPR作成を実行していない）
- [ ] PRのCIが全てPASSしている
- [ ] 完了レポート（completion-report.md）が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL --phase 13
```

---

> **ワークフロー完了。ユーザー許可前はコミットとPR作成を実行しない。**
