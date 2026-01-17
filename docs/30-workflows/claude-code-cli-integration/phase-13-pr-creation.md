# Phase 13: PR作成

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 13                          |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

---

## 実行手順

### 手順1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

```
以下のコマンドでローカル環境での動作を確認してください:

1. ビルド確認
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build

2. テスト実行
   pnpm --filter @repo/desktop test -- --run

3. 開発サーバー起動（必要に応じて）
   pnpm --filter @repo/desktop dev

確認完了後、PR作成を進めます。
```

### 手順2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**サマリー提示形式**:

```markdown
## 変更サマリー

### 追加されたファイル

- packages/shared/src/claude-cli/... (X files)
- apps/desktop/src/main/claude-cli/... (X files)
- apps/desktop/src/preload/claudeCliApi.ts

### 変更内容

1. CLIプロセス管理機能の実装
2. IPC通信APIの実装
3. スキル実行・ストリーミング出力の実装
4. セッション管理機能の実装

### テスト結果

- ユニットテスト: X passed
- 統合テスト: X passed
- カバレッジ: Line XX%, Branch XX%, Function XX%

PRを作成してよろしいですか？
```

### 手順3: `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 手順4: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

---

## 詳細タスク

### タスク1: 最終確認

**目的**: PR作成前の最終確認を行う

**手順**:

1. 全品質ゲートの再確認
2. 全テストの再実行
3. ビルドの再確認
4. ドキュメントの確認

**確認コマンド**:

```bash
# 品質ゲート確認
pnpm typecheck && pnpm lint

# テスト実行
pnpm --filter @repo/desktop test -- --run

# ビルド確認
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

**期待される成果物**:

- 最終確認チェックリスト

### タスク2: コミット作成

**目的**: 適切な粒度でコミットを作成する

**手順**:

1. 変更内容を確認
2. 論理的な単位でステージング
3. Conventional Commitsに従ってコミット

**コミットメッセージ例**:

```
feat(claude-cli): add CLI process manager

- Add CliProcessManager class for CLI lifecycle management
- Implement spawn/kill/monitor functionality
- Add timeout handling and cleanup

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**コミット分割の目安**:

| コミット | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 1        | 共有型定義（packages/shared/src/claude-cli/）        |
| 2        | CLIプロセス管理（apps/desktop/src/main/claude-cli/） |
| 3        | IPC通信・Preload API                                 |
| 4        | テストファイル                                       |
| 5        | ドキュメント                                         |

**期待される成果物**:

- 適切に分割されたコミット

### タスク3: PR作成

**目的**: Pull Requestを作成する

**手順**:

1. リモートブランチにプッシュ
2. PRテンプレートに従ってPR作成
3. レビュアーをアサイン（必要に応じて）

**PRテンプレート**:

```markdown
## Summary

Claude Code CLI統合による.claude/skillsスキル実行機能を実装しました。

### 主な変更点

- CLIプロセス管理機能の実装
- IPC通信APIの実装
- スキル実行・ストリーミング出力の実装
- セッション管理機能の実装

### 技術的な詳細

- Main Processでchild_processを使用してCLI実行
- contextBridgeを使用した安全なIPC通信
- Zodスキーマによる入力バリデーション

## Test plan

- [ ] ユニットテスト全通過
- [ ] 統合テスト全通過
- [ ] カバレッジ目標達成（80%/60%/80%）
- [ ] 手動テスト完了
- [ ] 型チェック・Lint通過

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**期待される成果物**:

- Pull Request

### タスク4: CI確認

**目的**: CIパイプラインの成功を確認する

**手順**:

1. CI実行を確認
2. 失敗した場合は原因を特定
3. 修正してコミット
4. 再度CI確認

**CI確認項目**:

| 項目       | 基準       |
| ---------- | ---------- |
| Lint       | 成功       |
| Type Check | 成功       |
| Unit Test  | 全通過     |
| Build      | 成功       |
| Coverage   | 目標値達成 |

**期待される成果物**:

- CI成功の確認

### タスク5: マージ準備完了確認

**目的**: マージ可能な状態であることを確認する

**確認項目**:

| 項目         | 確認内容               |
| ------------ | ---------------------- |
| CI           | 全ステップ成功         |
| コンフリクト | なし                   |
| レビュー     | 承認済み（必要な場合） |
| ドキュメント | 最新                   |
| コミット     | squash不要な粒度       |

**期待される成果物**:

- マージ準備完了確認

## 参照資料

| 資料名         | パス                               | 説明           |
| -------------- | ---------------------------------- | -------------- |
| 全Phase成果物  | `outputs/phase-*/`                 | 全成果物       |
| PRテンプレート | `.github/PULL_REQUEST_TEMPLATE.md` | PRテンプレート |

## 成果物

| 成果物                 | パス                                  | 説明         |
| ---------------------- | ------------------------------------- | ------------ |
| 最終確認チェックリスト | `outputs/phase-13/final-checklist.md` | 最終確認結果 |
| PRリンク               | `outputs/phase-13/pr-link.md`         | PR URL       |
| CI結果                 | `outputs/phase-13/ci-results.md`      | CI実行結果   |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している【必須】
- [ ] 変更サマリーを提示しPR作成の許可を得ている【必須】
- [ ] 最終確認が完了している
- [ ] 全変更がコミットされている
- [ ] Pull Requestが作成されている
- [ ] CI（Lint/Type Check/Test/Build）が成功している
- [ ] カバレッジが目標値を達成している
- [ ] コンフリクトがない
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている【必須】
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/claude-code-cli-integration/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep claude-code-cli-integration

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): claude-code-cli-integrationをcompleted-tasksに移動"
git push
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認を依頼【必須】
2. 変更サマリーの提示と許可確認【必須】
3. 最終確認実行
4. 変更内容の確認
5. コミット作成
6. リモートへプッシュ
7. `/ai:diff-to-pr`によるPR作成
8. CI確認
9. CI失敗時の修正（必要に応じて）
10. マージ準備完了確認
11. タスクディレクトリをcompleted-tasksに移動【必須】
12. 成果物の配置
13. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] ユーザーにローカル動作確認を依頼している【必須】
- [ ] 変更サマリーを提示しPR作成の許可を得ている【必須】
- [ ] PRが作成されている
- [ ] CI全ステップ成功
- [ ] タスクディレクトリがcompleted-tasksに移動されている【必須】
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 13
```

## 次のPhase

なし（ワークフロー完了）

---

## 完了

このPhaseの完了をもって、claude-code-cli-integrationタスクのワークフローが完了します。

**注意事項**:

1. **PRはユーザーの明示的な許可を得てから作成すること**
2. **タスクディレクトリは必ずcompleted-tasksに移動すること**
3. **マージはレビュー承認後、担当者が実施してください**
