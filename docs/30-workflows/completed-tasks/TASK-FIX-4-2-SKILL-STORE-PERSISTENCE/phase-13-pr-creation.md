# Phase 13: PR作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 13                                   |
| 機能名 | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日 | 2026-02-07                           |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

### Task 1: ローカル動作確認依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

- アプリケーション起動確認
- スキルインポート→再起動→データ維持の確認
- DevToolsでのエラー有無確認

**依頼メッセージ例**:

```
PR作成前に、以下の動作確認をお願いします:

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. スキルをインポート
3. アプリを完全に終了（Cmd+Q）
4. アプリを再起動
5. インポートしたスキルが残っているか確認

問題なければPR作成に進みます。
```

### Task 2: 変更サマリー提示【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリー（予定）**:

| カテゴリ           | 変更内容                              |
| ------------------ | ------------------------------------- |
| 永続化ロジック     | electron-store の初期化タイミング修正 |
| SkillImportManager | 保存・ロードフローの修正              |
| skillHandlers.ts   | getImported ハンドラーの修正          |
| DEBUGログ          | 不要なログの削除/electron-logへの移行 |
| テスト             | 永続化サイクルのテスト追加            |
| ドキュメント       | 実装ガイド、更新履歴                  |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 3: PR作成

ユーザーの許可を得た後、PR作成を実行する。

**PR作成方法（優先順）**:

1. `/ai:diff-to-pr` スキルを使用（推奨）
2. 手動で `gh pr create` を実行

**PRタイトル例**:

```
fix(desktop): インポートスキルの永続化消失バグ修正
```

**PR本文テンプレート**:

```markdown
## Summary

- electron-store の初期化タイミングを修正し、スキルデータが再起動後も維持されるようにした
- DEBUGログを整理し、electron-logへ移行
- 永続化サイクルのテストを追加

## Test plan

- [ ] `pnpm --filter @repo/desktop test` が全てPASS
- [ ] 手動テスト: スキルインポート→再起動→データ維持を確認
- [ ] 手動テスト: 空のstoreからの起動を確認

## Related Issue

Closes #418
```

### Task 4: 実行結果の確認

- PRが作成されていること
- CIが通過していること

**CI確認項目**:

| チェック項目 | 確認内容                   |
| ------------ | -------------------------- |
| lint         | ESLint/Prettierが通過      |
| typecheck    | TypeScript型チェックが通過 |
| test         | 全テストがPASS             |
| build        | ビルドが成功               |

### Task 5: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成・プッシュ
git checkout -b fix/skill-store-persistence
git add .
git commit -m "fix(desktop): インポートスキルの永続化消失バグ修正"
git push -u origin fix/skill-store-persistence

# PR作成
gh pr create --title "fix(desktop): インポートスキルの永続化消失バグ修正" --body "..."
```

## 参照資料

| 資料名       | パス                                          | 説明            |
| ------------ | --------------------------------------------- | --------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物  |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物  |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物  |
| Issue        | GitHub Issue #418                             | SKILL-STORE-001 |

## 成果物

| 成果物 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CI結果 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-taskに移動
mv docs/30-workflows/skill-import-agent-system/tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/ \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 移動を確認
ls docs/30-workflows/skill-import-agent-system/tasks/completed-task/ | grep TASK-FIX-4-2

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-4-2-SKILL-STORE-PERSISTENCEをcompleted-taskに移動"
git push
```

## 次のPhase

なし（ワークフロー完了）
