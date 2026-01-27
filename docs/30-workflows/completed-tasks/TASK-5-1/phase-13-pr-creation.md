# Phase 13: PR作成

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 13                        |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼テンプレート**:

```
## ローカル動作確認のお願い

以下の手順でローカル環境での動作確認をお願いします。

### 確認手順

1. 開発サーバーを起動
   \`\`\`bash
   pnpm --filter @repo/desktop dev
   \`\`\`

2. DevTools Console で以下を実行
   \`\`\`javascript
   // SkillAPI が公開されているか確認
   console.log(window.skillAPI);

   // 各メソッドが存在するか確認
   console.log(typeof window.skillAPI.execute);
   console.log(typeof window.skillAPI.abort);
   console.log(typeof window.skillAPI.onStream);
   \`\`\`

3. 期待結果
   - `window.skillAPI` がオブジェクトとして表示される
   - 各メソッドが `function` として表示される

### 確認後

問題なければ「確認完了」とお知らせください。
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリーテンプレート**:

```
## 変更サマリー

### 新規作成ファイル

| ファイル | 説明 |
| -------- | ---- |
| `apps/desktop/src/preload/skill-api.ts` | SkillAPI 実装 |

### 変更ファイル

| ファイル | 変更内容 |
| -------- | -------- |
| `apps/desktop/src/preload/index.ts` | skillAPI の公開追加 |
| `apps/desktop/src/preload/channels.ts` | Skill関連チャネル追加（TASK-4-1で追加済み） |

### 変更概要

- SkillAPI インターフェースを定義
- safeInvoke/safeOn パターンを適用
- window.skillAPI として公開
- ユニットテストを追加

### PR作成について

この内容でPRを作成してよろしいでしょうか？
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

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成（必要な場合）
git checkout -b feat/task-5-1-skill-api

# 変更をステージング
git add apps/desktop/src/preload/skill-api.ts
git add apps/desktop/src/preload/index.ts
git add apps/desktop/src/preload/__tests__/skill-api.test.ts

# コミット
git commit -m "feat(preload): SkillAPI 実装（TASK-5-1）

- SkillAPI インターフェースを定義
- safeInvoke/safeOn パターンを適用
- window.skillAPI として公開
- ユニットテストを追加"

# プッシュ
git push -u origin feat/task-5-1-skill-api

# PR作成
gh pr create --title "feat(preload): SkillAPI 実装（TASK-5-1）" --body "## Summary

- SkillAPI インターフェースを定義
- safeInvoke/safeOn パターンを適用
- window.skillAPI として公開

## Test plan

- [ ] TypeScript コンパイルエラーがないこと
- [ ] ユニットテストが全て成功すること
- [ ] DevTools で window.skillAPI にアクセスできること

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## PR情報テンプレート

```markdown
## PR情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| PR URL   | https://github.com/xxx/xxx/pull/XXX |
| ブランチ | feat/task-5-1-skill-api             |
| CI結果   | ✅ Passed / ❌ Failed               |
| 作成日時 | YYYY-MM-DD HH:MM                    |
```

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] PR情報が記録されている
- [ ] **本Phase内の全作業を100%完了**

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後**:

1. タスク仕様書を `completed-task/` に移動
2. 移動をコミット

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/tasks/task-5-1-skill-api.md \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 変更をコミット
git add docs/30-workflows/skill-import-agent-system/tasks/
git commit -m "docs(workflows): TASK-5-1をcompleted-taskに移動"
git push
```

---

## 次のPhase

なし（ワークフロー完了）
