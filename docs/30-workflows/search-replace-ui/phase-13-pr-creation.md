# Phase 13: PR作成

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 13                     |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

実装内容をPull Requestとして作成し、レビュー準備を整える。

## PR作成チェックリスト

### 事前確認

| 確認項目                 | 結果 |
| ------------------------ | ---- |
| 全テストが成功           | TBD  |
| ESLint警告0件            | TBD  |
| TypeScript型エラー0件    | TBD  |
| コミットメッセージが適切 | TBD  |
| ブランチが最新           | TBD  |

### PR内容

| 項目           | 内容                                      |
| -------------- | ----------------------------------------- |
| タイトル       | feat(search): 検索・置換UI実装 (#366)     |
| ベースブランチ | main                                      |
| 対象ブランチ   | task/search-replace-ui-implementation-366 |

## 実行タスク

### Task 13-1: 変更内容の最終確認

```bash
git status
git diff main...HEAD --stat
```

### Task 13-2: コミット整理

必要に応じてコミットを整理する（squash, rebase等）。

### Task 13-3: PR作成

```bash
gh pr create \
  --title "feat(search): 検索・置換UI統合 (#366)" \
  --body "$(cat <<'EOF'
## Summary

- グローバルキーボードショートカットの統合（Cmd+F, Cmd+Shift+F）
- ワークスペース検索IPCプロバイダの実装
- E2Eテストの追加
- テストカバレッジの拡充

## Changes

### 新規追加
- E2Eテスト: `apps/desktop/tests/e2e/search.spec.ts`
- IPCプロバイダ: ワークスペース検索用

### 変更
- EditorView: グローバルショートカット統合
- WorkspaceSearchPanel: IPCプロバイダ注入

## Test Plan

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功
- [ ] 手動テスト完了

## Related Issues

Closes #366

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --base main
```

### Task 13-4: PRレビュー依頼

PRが作成されたらレビュー依頼を行う。

## PR説明文テンプレート

```markdown
## Summary

[1-3行で変更概要を説明]

## Changes

### 新規追加

- [新規ファイル/機能]

### 変更

- [変更したファイル/機能]

### 削除

- [削除したファイル/機能（該当する場合）]

## Test Plan

- [ ] ユニットテスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] 手動テスト

## Screenshots/Videos

[UIに変更がある場合はスクリーンショット]

## Related Issues

Closes #366
```

## 成果物

| 成果物       | パス            | 説明           |
| ------------ | --------------- | -------------- |
| Pull Request | GitHub PR URL   | 作成されたPR   |
| PR説明文     | PRのdescription | 変更内容の説明 |

## 完了条件

- [ ] 全テストが成功している
- [ ] PRが作成されている
- [ ] PR説明文が適切に記載されている
- [ ] レビュー依頼が送信されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 注意事項

- PRの自動作成は行わない（ユーザーの指示に従う）
- レビュー指摘事項があれば対応し、再度レビュー依頼を行う
- マージはレビュー承認後に行う
