# Phase 13: PR作成

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 13                  |
| 機能名 | workspace-chat-edit |
| 作成日 | 2026-01-23          |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- **ローカル動作確認依頼**: ユーザーにローカルでの動作確認を依頼
- **変更サマリー提示**: 変更内容のサマリーを提示しPR作成の許可を確認
- **PR作成**: ユーザーの許可後に`/ai:diff-to-pr`を実行
- **CI確認**: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 元Issue      | GitHub Issue #384                             | 元タスクIssue  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容     |
| -------- | --------------------------------------------------------------------------- | -------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**ローカル確認チェックリスト**:

| #   | 確認項目                       | コマンド例            |
| --- | ------------------------------ | --------------------- |
| 1   | ビルドが成功する               | `pnpm build`          |
| 2   | 全テストがパスする             | `pnpm test`           |
| 3   | 型チェックがパスする           | `pnpm typecheck`      |
| 4   | Lintエラーがない               | `pnpm lint`           |
| 5   | 実際の動作確認（該当する場合） | `pnpm dev` で手動確認 |

**確認依頼メッセージ例**:

```
PR作成の前に、ローカル環境で以下の動作確認をお願いいたします:

1. `pnpm build` - ビルドが成功すること
2. `pnpm test` - 全テストがパスすること
3. `pnpm typecheck` - 型チェックがパスすること
4. `pnpm lint` - Lintエラーがないこと
5. `pnpm dev` - 実際にアプリを起動して動作確認

確認が完了したらお知らせください。
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 主な変更点

- ファイルコンテキスト添付機能（D&D、右クリック、ショートカット）
- 編集コマンド機能（続きを書く、リファクタリング、テスト生成、コメント追加）
- 差分プレビュー機能（Monaco Diff Editor）
- 承認/却下フロー

### 技術的な変更

- **状態管理**: `chatEditSlice` を Zustand に追加
- **IPC通信**: `chat-edit:*` チャンネルを追加
- **UIコンポーネント**: FileContextBadge, DiffPreview, ApplyControls を追加

### 変更ファイル数

- 新規: {{N}}ファイル
- 変更: {{N}}ファイル
- 削除: {{N}}ファイル

PRを作成してよろしいでしょうか？
```

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること
- PR説明が十分であること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# 変更ファイル一覧
git diff --stat main

# 未コミットの変更確認
git status

# PR作成
gh pr create \
  --title "feat(chat-edit): ワークスペースファイルのチャット編集機能" \
  --body-file pr-body.md \
  --base main \
  --label "feature" \
  --label "desktop"
```

## PRテンプレート

````markdown
## Summary

ワークスペースファイルのチャット編集機能を実装しました。

### 主な変更点

- ファイルコンテキスト添付機能（D&D、右クリック、ショートカット）
- 編集コマンド機能（続きを書く、リファクタリング、テスト生成、コメント追加）
- 差分プレビュー機能（Monaco Diff Editor）
- 承認/却下フロー

### 技術的な変更

- **状態管理**: `chatEditSlice` を Zustand に追加
- **IPC通信**: `chat-edit:*` チャンネルを追加
- **UIコンポーネント**: FileContextBadge, DiffPreview, ApplyControls を追加

## Test Plan

### 自動テスト

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
pnpm --filter @repo/desktop test:e2e
```
````

### 手動テスト

1. ファイルをチャットにドラッグ&ドロップ → ファイルが添付される
2. 「続きを書いて」と入力して送信 → 続きが生成される
3. 差分プレビューで「適用」をクリック → ファイルに変更が反映される

## Checklist

- [ ] 全テストが成功
- [ ] TypeScript型チェック成功
- [ ] ESLintエラーなし
- [ ] ドキュメント更新済み
- [ ] アクセシビリティ確認済み

## Related Issues

Closes #384

````

## PRチェックリスト

| 項目                         | 確認 |
| ---------------------------- | ---- |
| ブランチ名が規約通り         | -    |
| コミットメッセージが規約通り | -    |
| テストが全て成功             | -    |
| 型チェックが成功             | -    |
| Lintが成功                   | -    |
| ドキュメントが更新済み       | -    |
| PR説明が十分                 | -    |
| レビュアーが割り当て済み     | -    |

## 成果物

| 成果物   | パス                          | 説明            |
| -------- | ----------------------------- | --------------- |
| PR情報   | `outputs/phase-13/pr-info.md` | PR URL等        |

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

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/workspace-chat-edit/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep workspace-chat-edit

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): workspace-chat-editをcompleted-tasksに移動"
git push
````

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ローカル動作確認依頼
3. 変更サマリー作成・提示
4. ユーザー許可の取得
5. /ai:diff-to-pr実行（またはフォールバック手順）
6. CI確認
7. タスクディレクトリ移動
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/workspace-chat-edit --phase 13
```

## 次のPhase

なし（ワークフロー完了）
