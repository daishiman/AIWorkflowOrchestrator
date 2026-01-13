# Phase 13: PR作成

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 13                    |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

コードをレビュー用にプルリクエストとして提出する。

## 実行タスク

- 最終確認: すべてのPhaseが完了していることを確認
- ローカル動作確認依頼: ユーザーに最終動作確認を依頼
- 変更サマリー提示: 実装内容の要約と許可確認
- PR作成: `/ai:diff-to-pr`スキルでプルリクエストを作成
- タスク完了処理: completed-tasksへの移動

## 参照資料

| 資料名           | パス                                         | 説明       |
| ---------------- | -------------------------------------------- | ---------- |
| Phase 12成果物   | `outputs/phase-12/implementation-guide.md`   | 実装ガイド |
| 未タスク検出結果 | `outputs/phase-12/unassigned-task-report.md` | 残課題     |
| 手動テスト結果   | `outputs/phase-11/manual-test-results.md`    | テスト結果 |
| 最終レビュー結果 | `outputs/phase-10/final-checklist.md`        | 最終確認   |

---

## サブフェーズ

### Phase 13-1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

```markdown
## ローカル動作確認依頼

以下の手順でローカル環境での動作確認をお願いします:

1. 開発サーバーを起動: `pnpm --filter @repo/desktop dev`
2. 以下の動作を確認:
   - [ ] HTMLプレビューが正しく表示される
   - [ ] 分割レイアウトが操作できる
   - [ ] 環境切り替えが動作する
   - [ ] セキュリティ機能が有効（scriptタグが無効化される）

確認が完了しましたら、問題がないかお知らせください。
```

### Phase 13-2: 変更サマリーの提示と許可確認【必須】

PR作成前に、実装内容の要約をユーザーに提示し、許可を得る。

```markdown
## 変更サマリー

### 実装完了内容

| カテゴリ           | 内容                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| 新規コンポーネント | SplitLayout, ExecutionEnvironment, HTMLPreviewEnvironment, MarkdownPreviewEnvironment, EnvironmentSelector |
| 状態管理拡張       | agentSlice: previewContent, selectedEnvironment, splitRatio                                                |
| セキュリティ       | iframe sandbox, CSP, DOMPurifyサニタイズ                                                                   |
| テスト             | 単体テスト、統合テスト（カバレッジ目標達成）                                                               |
| ドキュメント       | 実装ガイド、APIドキュメント、セキュリティドキュメント                                                      |

### 影響範囲

- apps/desktop/src/renderer/components/
- apps/desktop/src/renderer/store/slices/agentSlice.ts
- packages/shared/src/types/

上記の内容でPRを作成してよろしいでしょうか？
```

### Phase 13-3: PR作成【必須】

ユーザーの許可を得た後、`/ai:diff-to-pr`スキルを使用してPRを作成する。

```bash
# /ai:diff-to-prスキルを実行
# ブランチ作成 → コミット → PR作成 → PRコメント追加 → CI確認まで自動化
```

### Phase 13-4: タスク完了処理【必須】

PR作成・マージ後、タスク仕様書をcompleted-tasksに移動する。

```bash
# タスク仕様書をcompleted-tasksに移動
mv docs/30-workflows/custom-environment-ui docs/30-workflows/completed-tasks/custom-environment-ui

# 移動後の確認
ls docs/30-workflows/completed-tasks/custom-environment-ui/
```

---

## PR作成前チェックリスト

### コード品質

- [ ] すべてのテストがパスする
- [ ] ESLintエラーがない
- [ ] TypeScriptエラーがない
- [ ] カバレッジ目標を達成している

### ドキュメント

- [ ] コンポーネントAPIドキュメントが作成されている
- [ ] 型定義リファレンスが作成されている
- [ ] セキュリティドキュメントが作成されている

### セキュリティ

- [ ] sandbox設定が適切
- [ ] CSP設定が適切
- [ ] HTMLサニタイズが実装されている

---

## コミット準備

```bash
# 変更ファイル確認
git status

# 差分確認
git diff

# コミット（すでにコミット済みの場合はスキップ）
git add -A
git commit -m "feat(agent): add custom execution environment UI

- Add SplitLayout for chat/preview split view
- Add HTMLPreviewEnvironment with sandbox and CSP
- Add MarkdownPreviewEnvironment
- Add EnvironmentSelector for manual environment switching
- Extend agentSlice with preview state management
- Add sanitizeHTML utility with DOMPurify
- Add comprehensive tests for all components

AGENT-006: Custom Execution Environment UI
Depends on: AGENT-004, AGENT-005

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# リモートにプッシュ
git push origin feature/AGENT-006-custom-environment-ui
```

---

## PRテンプレート

```markdown
## Summary

AGENT-006: カスタム実行環境UI機能の実装

### 変更内容

- **SplitLayout**: チャットとプレビューを左右に分割表示するレイアウトコンポーネント
- **ExecutionEnvironment**: 環境タイプに応じたプレビュー表示切り替え
- **HTMLPreviewEnvironment**: sandbox付きiframeでのHTMLプレビュー表示
- **MarkdownPreviewEnvironment**: Markdownレンダリングプレビュー
- **EnvironmentSelector**: 環境タイプの手動切り替えUI
- **agentSlice拡張**: previewContent, selectedEnvironment, splitRatio状態追加
- **sanitizeHTML**: DOMPurifyを使用したHTMLサニタイズ

### セキュリティ

- iframe sandbox属性による分離
- Content Security Policyによるスクリプト実行禁止
- DOMPurifyによるHTMLサニタイズ

## Test plan

- [ ] HTMLプレビューが正しく表示される
- [ ] 分割レイアウトのドラッグ操作が動作する
- [ ] 環境切り替えが正しく動作する
- [ ] セキュリティテストがパスする
  - [ ] `<script>`タグが無効化される
  - [ ] イベントハンドラが除去される
  - [ ] 外部リソースがブロックされる
- [ ] キーボード操作が可能
- [ ] 100KBのHTMLでも1秒以内に表示される

## Dependencies

- AGENT-004: Skill Registry (SkillにenvironmentConfigを追加)
- AGENT-005: Agent Execution (agentSliceの基盤)

## Screenshots

[スクリーンショットを追加]

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## PR作成コマンド

```bash
gh pr create --title "feat(agent): add custom execution environment UI (AGENT-006)" --body "$(cat <<'EOF'
## Summary

AGENT-006: カスタム実行環境UI機能の実装

### 変更内容

- **SplitLayout**: チャットとプレビューを左右に分割表示
- **ExecutionEnvironment**: 環境タイプに応じたプレビュー表示
- **HTMLPreviewEnvironment**: sandbox付きHTMLプレビュー
- **MarkdownPreviewEnvironment**: Markdownプレビュー
- **EnvironmentSelector**: 環境タイプの手動切り替え
- **agentSlice拡張**: プレビュー状態管理
- **sanitizeHTML**: HTMLサニタイズ

### セキュリティ

- iframe sandbox属性
- CSPによるスクリプト禁止
- DOMPurifyによるサニタイズ

## Test plan

- [ ] HTMLプレビュー表示確認
- [ ] 分割レイアウト操作確認
- [ ] 環境切り替え確認
- [ ] セキュリティテスト確認
- [ ] アクセシビリティ確認
- [ ] パフォーマンス確認

## Dependencies

- AGENT-004, AGENT-005

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 統合テスト連携【必須】

PR説明に統合ポイントを明記する:

| 統合ポイント           | PR説明への記載                     |
| ---------------------- | ---------------------------------- |
| agentSlice拡張         | 新しい状態フィールドの説明         |
| SplitLayout↔親         | 使用方法の説明                     |
| ExecutionEnvironment   | 環境タイプ一覧                     |
| HTMLPreviewEnvironment | セキュリティ対策の説明             |
| 依存関係               | AGENT-004, AGENT-005との関係を明記 |

---

## 成果物

| 成果物             | パス                                    | 説明         |
| ------------------ | --------------------------------------- | ------------ |
| PR URL             | `outputs/phase-13/pr-url.md`            | 作成したPR   |
| 最終コミットログ   | `outputs/phase-13/commit-log.md`        | コミット履歴 |
| タスク完了レポート | `outputs/phase-13/completion-report.md` | 完了報告     |

---

## 完了条件

- [ ] すべてのPhaseが完了している
- [ ] PR作成前チェックリストがすべて完了
- [ ] **ユーザーにローカル動作確認を依頼している**【必須】
- [ ] **変更サマリーをユーザーに提示し許可を得ている**【必須】
- [ ] PRが作成されている（`/ai:diff-to-pr`使用）
- [ ] PR説明が適切に記入されている
- [ ] 統合ポイントがPR説明に含まれている
- [ ] **タスク仕様書がcompleted-tasksに移動されている**【必須】
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 全Phaseの完了確認
2. PR作成前チェックリストの確認
3. 最終テスト実行
4. **ユーザーにローカル動作確認を依頼**【必須】
5. **変更サマリーの提示と許可確認**【必須】
6. **/ai:diff-to-prスキルでPR作成**【必須】
7. PR説明の確認・補足
8. CI/CD完了確認
9. 成果物の作成・配置
10. **タスク仕様書をcompleted-tasksに移動**【必須】
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# 最終テスト
pnpm --filter @repo/desktop test && pnpm lint && pnpm typecheck

# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 13
```

---

## タスク完了

Phase 13完了をもって、AGENT-006: Custom Execution Environment UIタスクは完了です。

### 完了サマリー

| 項目               | 内容                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| タスクID           | AGENT-006                                                                                                  |
| タスク名           | Custom Execution Environment UI                                                                            |
| 実装コンポーネント | SplitLayout, ExecutionEnvironment, HTMLPreviewEnvironment, MarkdownPreviewEnvironment, EnvironmentSelector |
| 依存タスク         | AGENT-004, AGENT-005                                                                                       |
| セキュリティ対策   | iframe sandbox, CSP, DOMPurify                                                                             |
