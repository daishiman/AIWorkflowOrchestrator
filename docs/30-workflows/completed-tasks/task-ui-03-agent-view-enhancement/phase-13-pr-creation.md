# Phase 13: PR作成

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 13                     |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。AIアシスタント画面リデザイン（Tap & Discover）の全成果物をmainブランチに統合する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名                         | パス                                                                 | 説明                       |
| ------------------------------ | -------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計成果物             | `outputs/phase-2/architecture-design.md`                             | 依存Phase 2成果物          |
| Phase 5 実装成果物             | `outputs/phase-5/implementation-summary.md`                          | 依存Phase 5成果物          |
| Phase 6 テスト成果物           | `outputs/phase-6/test-expansion-report.md`                           | 依存Phase 6成果物          |
| Phase 7 カバレッジ成果物       | `outputs/phase-7/coverage-report.md`                                 | 依存Phase 7成果物          |
| Phase 8 リファクタリング成果物 | `outputs/phase-8/refactoring-report.md`                              | 依存Phase 8成果物          |
| Phase 9 品質成果物             | `outputs/phase-9/quality-report.md`                                  | 依存Phase 9成果物          |
| 最終レビュー                   | `outputs/phase-10/final-review-result.md`                            | Phase 10成果物             |
| 手動テスト結果                 | `outputs/phase-11/manual-test-result.md`                             | Phase 11成果物             |
| スクリーンショット             | `outputs/phase-11/screenshots/`                                      | UI/UX証跡                  |
| ドキュメント更新履歴           | `outputs/phase-12/documentation-changelog.md`                        | Phase 12成果物             |
| 実装ガイド                     | `outputs/phase-12/implementation-guide.md`                           | Phase 12成果物（PR添付用） |
| PR運用仕様                     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | PR前提の完了条件確認       |
| 発見課題一覧                   | `outputs/phase-11/discovered-issues.md`                              | Phase 11 成果物            |
| 撮影計画                       | `outputs/phase-11/screenshot-plan.json`                              | Phase 11 成果物            |
| 画面カバレッジレポート         | `outputs/phase-11/screenshot-coverage.md`                            | Phase 11 成果物            |
| 未タスク検出レポート           | `outputs/phase-12/unassigned-task-detection.md`                      | Phase 12 成果物            |
| スキルフィードバックレポート   | `outputs/phase-12/skill-feedback-report.md`                          | Phase 12 成果物            |
| 仕様書更新サマリー             | `outputs/phase-12/spec-update-summary.md`                            | Phase 12 成果物            |

## 依存Phase成果物参照

依存の正本は `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/requirements-traceability-matrix.md` の「依存関係トレース」を参照する。

## 実行手順

### 1. ユーザーにローカル動作確認を依頼

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

```
以下の手順でローカル動作確認をお願いします:

1. pnpm install
2. pnpm --filter @repo/desktop dev
3. AIアシスタント画面を開き、以下を確認:
   - シングルカラムレイアウト（中央寄せ max-width 600px）
   - SkillChip のタップ → バウンスアニメーション → 選択状態
   - ExecuteButton の disabled/enabled 切り替え
   - 歯車アイコン → AdvancedSettingsPanel スライドイン
   - 実行 → FloatingExecutionBar 表示 → 完了/エラーフィードバック
   - ダークモード切り替え
```

### 2. 変更サマリーの提示と許可確認

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 新規ファイル（6ファイル）

- SkillChip.tsx: 80x80px 丸アイコン + スキル名チップ
- ExecuteButton.tsx: 全幅プライマリ実行ボタン
- FloatingExecutionBar.tsx: 実行中フローティングバー
- AdvancedSettingsPanel.tsx: 詳細設定スライドインパネル
- RecentExecutionList.tsx: 最近の実行履歴リスト（最大3件）
- 各コンポーネントのテストファイル（6ファイル）

### 変更ファイル（2ファイル）

- AgentView/index.tsx: シングルカラムレイアウトに再構成
- agentSlice.ts: recentExecutions, isAdvancedSettingsOpen 追加

### 影響範囲

- 既存ロジック（agentSlice基本構造, useSkillExecution, useSkillPermission）は維持
- IPC インターフェース変更なし
- AgentExecutionView・SkillStreamDisplay・CopyHistoryPanel 変更なし
```

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr feature/task-ui-03-agent-view-enhancement
```

**PR作成パラメータ**:

| 項目           | 値                                                            |
| -------------- | ------------------------------------------------------------- |
| ブランチ名     | `feature/task-ui-03-agent-view-enhancement`                   |
| PRタイトル     | `feat(desktop): AIアシスタント画面 Tap & Discover リデザイン` |
| ベースブランチ | `main`                                                        |

**PR本文構成**（`.github/pull_request_template.md` 準拠）:

| セクション         | 内容                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Summary            | (1) AgentViewをシングルカラムTap & Discover体験にリデザイン (2) Level 1に3要素のみ表示（SkillChip+ExecuteButton+RecentExecutionList） (3) 詳細設定をLevel 2（AdvancedSettingsPanel）に隠蔽               |
| Test Plan          | (1) `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/` (2) `cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/` (3) Phase 11 手動テスト TC-01〜TC-11 全PASS |
| スクリーンショット | Phase 11成果物（`outputs/phase-11/screenshots/`）から代表的な画面を添付                                                                                                                                  |
| その他             | Phase 12 実装ガイド反映元: `outputs/phase-12/implementation-guide.md`（Part 1: 概念説明 / Part 2: 技術詳細）                                                                                             |

**PR作成時の自動投稿内容（`/ai:diff-to-pr`）**:

1. **PR本文**: 概要・変更内容・テスト・スクリーンショット・チェックリスト
2. **PRコメント1**: 実装の詳細・レビュー注意点・テスト方法
3. **PRコメント2**: `implementation-guide.md` の全文（`## 📖 実装ガイド（全文）` 見出し + Part 1/Part 2 両方含む）
4. **PRコメント3**: スクリーンショットギャラリー

**画像リンクルール**:

- PR本文/PRコメントで画像を埋め込む場合は `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLを使う
- 相対パス直貼りは禁止

### 4. 実行結果の確認

- [ ] PRが作成されていること
- [ ] CIが通過していること（typecheck, lint, test）
- [ ] PRコメントに `## 📖 実装ガイド（全文）` が存在し、Part 1/Part 2 の両方を含むことを確認
- [ ] スクリーンショットコメントが投稿されていること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# ブランチ作成・プッシュ
git checkout -b feature/task-ui-03-agent-view-enhancement
git push -u origin feature/task-ui-03-agent-view-enhancement

# PR作成
gh pr create \
  --title "feat(desktop): AIアシスタント画面 Tap & Discover リデザイン" \
  --body "$(cat <<'EOF'
## Summary
- AgentViewをシングルカラムTap & Discover体験にリデザイン
- Level 1に3要素のみ表示（SkillChip+ExecuteButton+RecentExecutionList）
- 詳細設定をLevel 2（AdvancedSettingsPanel）に隠蔽

## Test Plan
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/`
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/`
- [ ] Phase 11 手動テスト TC-01〜TC-11 全PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 統合テスト連携

| 確認項目      | 内容                                               |
| ------------- | -------------------------------------------------- |
| CI typecheck  | `pnpm --filter @repo/desktop typecheck` がCIで通過 |
| CI lint       | `pnpm --filter @repo/desktop lint` がCIで通過      |
| CI test       | `cd apps/desktop && pnpm vitest run` がCIで通過    |
| PR auto-check | GitHub Actions の全チェックがグリーン              |

## 多角的チェック観点

| 観点                 | 確認内容                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| PRタイトル           | 70文字以内であること（`feat(desktop): AIアシスタント画面 Tap & Discover リデザイン` = 43文字） |
| ブランチ命名         | `feature/` プレフィックスが付いていること                                                      |
| 実装ガイド投稿       | PRコメントに Part 1（中学生レベル）+ Part 2（技術詳細）の両方が含まれること                    |
| スクリーンショット   | 代表的な画面（メイン画面・選択状態・パネル表示・ダークモード）が添付されていること             |
| `--no-verify` 不使用 | コミット・プッシュで `--no-verify` を使用していないこと                                        |

## 成果物

| 成果物 | パス                          | 説明                       |
| ------ | ----------------------------- | -------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・ブランチ名・CI結果 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼した
- [ ] 変更サマリーを提示し、ユーザーからPR作成の明示的な許可を得た
- [ ] PRが作成されている（URL記録済み）
- [ ] PRタイトルが70文字以内
- [ ] PR本文にSummary（1-3箇条書き）+ Test Planを含む
- [ ] PRコメントに実装ガイド全文（Part 1 + Part 2）が投稿されている
- [ ] PRコメントにスクリーンショットギャラリーが投稿されている
- [ ] PR本文/PRコメントの画像リンクが `raw.githubusercontent.com` の絶対URLである
- [ ] CIの全チェックが通過している（typecheck, lint, test）
- [ ] `--no-verify` を使用していないこと
- [ ] PR情報が `outputs/phase-13/pr-info.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

なし（タスク完了）
