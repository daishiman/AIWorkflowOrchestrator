# Phase 13: PR作成

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 13                |
| 機能名 | TASK-UI-00-TOKENS |
| 作成日 | 2026-02-22        |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 参照資料

| 資料名               | パス                                                                        | 説明                 |
| -------------------- | --------------------------------------------------------------------------- | -------------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`                                   | Phase 10成果物       |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                    | Phase 11成果物       |
| ドキュメント更新     | `outputs/phase-12/documentation-changelog.md`                               | Phase 12成果物       |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`                             | Phase 12成果物       |
| タスク運用仕様       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 完了処理・移管ルール |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | CI/品質ゲート基準    |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                                  | Phase 12 成果物      |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`                                | Phase 12 成果物      |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`                                 | Phase 12 成果物      |

- 依存Phase成果物参照: `phase-1-*`、`phase-2-*`、`phase-5-*`、`phase-6-*`、`phase-7-*`、`phase-8-*`、`phase-9-*`、`phase-10-*`、`phase-11-*`、`phase-12-*`

## 実行タスク

- PR作成前確認: ローカル確認依頼と変更サマリー提示を完了する

### タスク1: ローカル動作確認依頼

**目的**: PR作成前にユーザーにローカル環境での動作確認を依頼する。

### タスク2: 変更サマリー提示・PR作成許可取得

**目的**: 変更内容をユーザーに提示し、PRを作成してよいか明示的な許可を得る。

### タスク3: PR作成・CI確認

**目的**: ユーザー許可後にPRを作成し、CIが通過することを確認する。

### タスク4: タスク完了処理

**目的**: タスクディレクトリをcompleted-tasksに移動する。

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

#### 確認依頼項目

- lightテーマで背景が白（`#FFFFFF`）、テキストが黒（`#000000`）であること
- darkテーマで背景が黒（`#000000`）、テキストが白（`#FFFFFF`）であること
- kanagawa-dragonテーマの既存動作が変更されていないこと
- テーマ切替時にちらつきが発生しないこと
- マイクロインタラクション（ホバー微拡大/クリック微縮小）が動作すること
- renderWithThemeテストが全てPASSすること

### 2. 変更サマリーの提示と許可確認【必須】

以下の変更サマリーをユーザーに提示し、PRを作成してよいか確認する。

#### 変更サマリーテンプレート

```markdown
## 変更内容

### デザイントークン・テーマ定義（TASK-UI-00-TOKENS）

#### tokens.css 追加内容

1. **lightテーマ** (`[data-theme="light"]`):
   - Apple HIG System Colors準拠のカラーパレット（背景/テキスト/アクセント/成功/エラー/警告/ボーダー）
   - セカンダリ・ターシャリ背景色
   - セカンダリテキスト色

2. **darkテーマ** (`[data-theme="dark"]`):
   - Apple HIG System Colors準拠のダークモードカラーパレット
   - ダークモード向けアクセント/成功/エラー/警告カラー

3. **マイクロインタラクション変数**:
   - `--interaction-hover-scale`: ホバー時微拡大（1.02）
   - `--interaction-active-scale`: アクティブ時微縮小（0.97）
   - `--interaction-duration`: トランジション時間（200ms）
   - `--interaction-easing`: イージング関数
   - `@keyframes success-bounce` / `@keyframes error-shake`

#### テストヘルパー追加

- `renderWithTheme()`: 指定テーマでコンポーネントをレンダリング
- `renderWithAllThemes()`: 3テーマ一括テスト

### テスト結果

- ユニットテスト: {{N}}件 全PASS
- 手動テスト: 22件 全PASS
- カバレッジ: Line {{N}}%, Branch {{N}}%, Function {{N}}%
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること
- PRタイトルが70文字以内、descriptionにSummary（1-3箇条書き）とTest Planが含まれている

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ確認（既存ブランチを使用）
git branch --show-current
# → docs/task-ui-00-design-foundation

# 変更をコミット
git add apps/desktop/src/renderer/styles/tokens.css \
        apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx \
        apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx \
        docs/30-workflows/TASK-UI-00-TOKENS/
git commit -m "feat(ui): Apple HIG準拠light/darkテーマとマイクロインタラクション変数追加

- tokens.cssにlight/darkテーマのApple HIG System Colors定義を追加
- マイクロインタラクション用CSS変数（hover/active/bounce/shake）を追加
- renderWithThemeテストヘルパーを追加しテーマ横断テストを実現

TASK-UI-00-TOKENS

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# リモートにプッシュ
git push -u origin docs/task-ui-00-design-foundation

# PRを作成
gh pr create \
  --title "feat(ui): Apple HIG準拠デザイントークン・テーマ定義" \
  --body "$(cat <<'EOF'
## Summary
- tokens.cssにApple HIG System Colors準拠のlight/darkテーマ変数を追加
- マイクロインタラクション用CSS変数（hover/active/bounce/shake）を追加
- renderWithThemeテストヘルパーによるテーマ横断テスト基盤を整備

## Test plan
- [ ] lightテーマ: 背景#FFFFFF、テキスト#000000が適用される
- [ ] darkテーマ: 背景#000000、テキスト#FFFFFFが適用される
- [ ] kanagawa-dragonテーマ: 既存動作に変更なし
- [ ] テーマ切替時にちらつきなし
- [ ] マイクロインタラクション（hover/active）が全テーマで動作
- [ ] renderWithThemeテストが全PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 統合テスト連携【必須】

| 確認項目  | 判定基準                              |
| --------- | ------------------------------------- |
| CI通過    | GitHub Actions全ジョブ成功            |
| typecheck | `pnpm typecheck` エラーなし           |
| lint      | `pnpm lint` エラーなし                |
| test      | `pnpm test` 全PASS                    |
| coverage  | Line 80%+, Branch 60%+, Function 80%+ |

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

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-UI-00-TOKENS/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep -i "task-ui-00"

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-UI-00-TOKENSをcompleted-tasksに移動

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push
```

## PR情報テンプレート

PR作成後、以下の形式で `outputs/phase-13/pr-info.md` を作成する:

```markdown
# PR情報

| 項目         | 値           |
| ------------ | ------------ |
| PR番号       | #{{NUMBER}}  |
| PR URL       | {{URL}}      |
| 作成日時     | {{DATETIME}} |
| CIステータス | {{STATUS}}   |
| レビュアー   | {{REVIEWER}} |

## 変更ファイル数

- 追加: {{N}}
- 変更: {{N}}
- 削除: {{N}}

## 主な変更内容

- tokens.cssにApple HIG準拠light/darkテーマ変数追加
- マイクロインタラクション用CSS変数追加
- renderWithThemeテストヘルパー追加

## 関連Issue

- [Issue #{{ISSUE_NUMBER}}](https://github.com/daishiman/AIWorkflowOrchestrator/issues/{{ISSUE_NUMBER}})
```

## 次のPhase

なし（ワークフロー完了）
