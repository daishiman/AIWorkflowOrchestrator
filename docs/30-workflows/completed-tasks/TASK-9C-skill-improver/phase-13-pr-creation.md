# Phase 13: PR作成

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 13                               |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼テンプレート**:

```markdown
## ローカル動作確認のお願い

以下の機能をローカル環境でご確認ください：

1. **スキル分析機能**
   - skill:analyze チャネルでスキルを分析
   - 分析結果（スコア、提案、リスク）を確認

2. **スキル改善機能**
   - skill:improve チャネルで改善を実行
   - バックアップが作成されることを確認

3. **プロンプト最適化機能**
   - skill:optimize チャネルでプロンプトを最適化

確認が完了しましたらお知らせください。
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 新規ファイル

- `apps/desktop/src/main/services/skill/SkillAnalyzer.ts`
- `apps/desktop/src/main/services/skill/SkillImprover.ts`
- `apps/desktop/src/main/services/skill/PromptOptimizer.ts`
- `packages/shared/src/types/skill-improver.ts`

### 修正ファイル

- `apps/desktop/src/main/ipc/skillHandlers.ts`
  - skill:analyze, skill:improve, skill:optimize チャネル追加
- `apps/desktop/src/renderer/store/slices/skillSlice.ts`
  - analysisResult, optimizationResult 状態追加

### テスト追加

- SkillAnalyzer.test.ts (Xテスト)
- SkillImprover.test.ts (Xテスト)
- PromptOptimizer.test.ts (Xテスト)

### ドキュメント

- 実装ガイド（Part 1 + Part 2）
- システム仕様書更新

PRを作成してよろしいでしょうか？
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合:

```bash
# ブランチ作成（未作成の場合）
git checkout -b feature/TASK-9C-skill-improver

# 変更をステージング
git add apps/desktop/src/main/services/skill/SkillAnalyzer.ts
git add apps/desktop/src/main/services/skill/SkillImprover.ts
git add apps/desktop/src/main/services/skill/PromptOptimizer.ts
git add packages/shared/src/types/skill-improver.ts
git add apps/desktop/src/main/ipc/skillHandlers.ts
# ... 他の変更ファイル

# コミット
git commit -m "feat(skill): スキル改善・自動修正機能を実装 (TASK-9C)

- SkillAnalyzer: スキル分析サービス（静的分析 + AI分析）
- SkillImprover: スキル改善サービス（バックアップ付き）
- PromptOptimizer: プロンプト最適化サービス
- IPCチャネル: skill:analyze, skill:improve, skill:optimize 追加
- 型定義: @repo/shared に追加

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ
git push -u origin feature/TASK-9C-skill-improver

# PR作成
gh pr create --title "feat(skill): スキル改善・自動修正機能を実装 (TASK-9C)" --body "..."
```

## PR本文テンプレート

```markdown
## Summary

- SkillAnalyzer: スキル構造・品質を分析し、改善提案を生成
- SkillImprover: 分析結果に基づいてスキルを自動改善（バックアップ付き）
- PromptOptimizer: プロンプトを最適化し、複数バリアントを生成

## Test plan

- [ ] SkillAnalyzer テスト: 分析結果の確認
- [ ] SkillImprover テスト: 改善適用・バックアップ・復元の確認
- [ ] PromptOptimizer テスト: 最適化・バリアント生成・評価の確認
- [ ] IPC統合テスト: 5チャネルの疎通確認
- [ ] 手動テスト: 17ケース実行

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver/ docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 移動を確認
ls docs/30-workflows/skill-import-agent-system/tasks/completed-task/ | grep TASK-9C

# 変更をコミット
git add docs/30-workflows/skill-import-agent-system/tasks/
git commit -m "docs(workflows): TASK-9C-skill-improverをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認依頼
2. 変更サマリー提示
3. PR作成許可の取得
4. `/ai:diff-to-pr` 実行（または手動PR作成）
5. CI通過確認
6. タスクディレクトリ移動（completed-tasks）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 13
```

---

## 次のPhase

なし（ワークフロー完了）
