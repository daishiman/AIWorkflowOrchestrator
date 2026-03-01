# Phase 13: PR作成

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 13                                |
| 機能名    | TASK-UI-05-SKILL-CENTER-VIEW      |
| 作成日    | 2026-03-01                        |
| 前提Phase | Phase 12（ドキュメント更新 完了） |
| 後続Phase | なし（ワークフロー完了）          |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認
- タスク完了処理: タスクディレクトリをcompleted-tasksに移動

## 参照資料

| 資料名                       | パス                                            | 説明            |
| ---------------------------- | ----------------------------------------------- | --------------- |
| Phase 2 設計成果物           | `outputs/phase-2/architecture-design.md`        | 設計仕様        |
| Phase 5 実装成果物           | `outputs/phase-5/implementation-summary.md`     | 実装サマリー    |
| Phase 6 テスト拡充成果物     | `outputs/phase-6/test-expansion-report.md`      | テスト拡充結果  |
| Phase 7 カバレッジ成果物     | `outputs/phase-7/coverage-report.md`            | カバレッジ結果  |
| Phase 8 リファクタ成果物     | `outputs/phase-8/refactoring-report.md`         | 品質改善結果    |
| Phase 9 品質成果物           | `outputs/phase-9/quality-verification.md`       | 品質検証結果    |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`       | Phase 10成果物  |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`        | Phase 11成果物  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | Phase 12成果物  |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Phase 12成果物  |
| 手動テストチェックリスト     | `outputs/phase-11/manual-test-checklist.md`     | Phase 11 成果物 |
| 発見課題リスト               | `outputs/phase-11/discovered-issues.md`         | Phase 11 成果物 |
| コンポーネントドキュメント   | `outputs/phase-12/component-documentation.md`   | Phase 12 成果物 |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | Phase 12 成果物 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | Phase 12 成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

```
以下の動作確認をお願いします:

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. ナビゲーションから「ツールを探す」画面に遷移
3. 以下を確認:
   - おすすめセクションが表示される（最大3枚）
   - ツールカードがグリッド表示される
   - 「追加する」ボタンのモーフィングアニメーションが動作する
   - カテゴリタブの切替が正常に動作する
   - カードクリックで詳細パネルが表示される
   - レスポンシブ（ウィンドウリサイズ）が正常に動作する
   - AgentView に影響がないこと
4. サブダイアログの動作確認:
   - フォークダイアログ
   - インポートダイアログ（4ソースタブ）
   - エクスポートダイアログ
   - ドキュメント生成ダイアログ
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 新規作成ファイル

- `apps/desktop/src/renderer/views/SkillCenterView/` — SkillCenterView 全体（15+ ファイル）
  - index.tsx, FeaturedSection/, SkillCard.tsx, AddButton.tsx, CategoryTabs.tsx
  - SkillDetailPanel/, SkillEmptyState.tsx, SkillImportSection.tsx
  - hooks/useSkillCenter.ts, hooks/useFeaturedSkills.ts
  - サブダイアログ: ForkSkillDialog, ExportSkillDialog, GenerateDocsDialog
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` — テストファイル（8+ ファイル）

### 変更ファイル

- ルーティング/ナビゲーション設定（SkillCenterView の追加）
- 仕様書更新（ui-ux-components.md 等）

### 変更なし（リグレッション安全）

- `apps/desktop/src/renderer/views/AgentView/` — 変更なし
- `apps/desktop/src/main/` — 変更なし（既存IPCチャネル利用）
- `packages/shared/` — 変更なし
```

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

**PR情報**:

| 項目           | 値                                                |
| -------------- | ------------------------------------------------- |
| ブランチ名     | `feature/TASK-UI-05-SKILL-CENTER-VIEW`            |
| PRタイトル     | `feat(ui): SkillCenterView（ツールを探す）を実装` |
| ベースブランチ | `main`                                            |

**PR本文テンプレート**:

```markdown
## Summary

- SkillCenterView（ツールを探す）画面を新規実装。アプリストア型のツール探索体験を提供
- おすすめセクション（staggerアニメーション）、カテゴリタブ（下線スライド）、追加ボタン（モーフィングアニメーション）を実装
- レスポンシブ対応（4ブレークポイント）、デスクトップ/モバイル別DetailPanel表示
- サブダイアログ4種（Fork/Import/Export/GenerateDocs）を実装

## Test plan

- [ ] 自動テスト: `cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/` 全PASS
- [ ] 手動テスト: Phase 11チェックリスト（11シナリオ、XX項目）全PASS
- [ ] レスポンシブ: 4ブレークポイント（1440px+, 1024-1439, 768-1023, <768）で検証済み
- [ ] アクセシビリティ: キーボード操作、ARIA属性、フォーカス管理を検証済み
- [ ] リグレッション: AgentView に変更なし、agentSlice データ整合性確認済み
- [ ] UX言語: 「ツール」「追加する」「AIにできること」に統一済み

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

```bash
# CI確認コマンド
gh pr checks <PR_NUMBER> --watch
```

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# ブランチ作成・コミット
git checkout -b feature/TASK-UI-05-SKILL-CENTER-VIEW
git add apps/desktop/src/renderer/views/SkillCenterView/
git add docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/
# その他変更ファイル
git commit -m "feat(ui): SkillCenterView（ツールを探す）を実装

- おすすめセクション + カテゴリタブ + カードグリッド + 詳細パネル
- 追加ボタンモーフィングアニメーション（スピナー→チェック→bounce）
- レスポンシブ4ブレークポイント対応
- サブダイアログ4種（Fork/Import/Export/GenerateDocs）

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# PR作成
gh pr create \
  --title "feat(ui): SkillCenterView（ツールを探す）を実装" \
  --body "$(cat <<'EOF'
## Summary

- SkillCenterView（ツールを探す）画面を新規実装
- アプリストア型のツール探索体験を提供
- レスポンシブ対応、アクセシビリティ対応

## Test plan

- [ ] 自動テスト全PASS
- [ ] 手動テスト全PASS
- [ ] AgentView リグレッションなし

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# CI確認
gh pr checks --watch
```

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-UI-05-SKILL-CENTER-VIEW

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-UI-05-SKILL-CENTER-VIEWをcompleted-tasksに移動

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

### pr-info.md テンプレート

```markdown
# PR情報

| 項目         | 値                                   |
| ------------ | ------------------------------------ |
| PR URL       | {{PR_URL}}                           |
| PR番号       | #{{PR_NUMBER}}                       |
| ブランチ     | feature/TASK-UI-05-SKILL-CENTER-VIEW |
| ベース       | main                                 |
| CIステータス | {{PASS/FAIL}}                        |
| 作成日       | {{DATE}}                             |
| レビュー状態 | {{PENDING/APPROVED}}                 |
```

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認を依頼
2. 変更サマリー提示・許可確認
3. PR作成（`/ai:diff-to-pr` または手動）
4. CI通過確認
5. タスクディレクトリ移動
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --phase 13
```

## 次のPhase

なし（ワークフロー完了）
