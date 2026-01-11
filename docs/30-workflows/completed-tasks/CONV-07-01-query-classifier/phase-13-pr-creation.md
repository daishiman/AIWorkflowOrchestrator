# Phase 13: PR作成 - クエリ分類器

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| Phase        | 13                          |
| タスクID     | CONV-07-01                  |
| Phase名      | PR作成                      |
| 前提Phase    | Phase 12 (ドキュメント更新) |
| 次Phase      | なし（タスク完了）          |
| 推定作業時間 | 1時間                       |
| ステータス   | 未着手                      |

---

## 目的

変更をコミット・PRを作成し、CIを通過させる。タスク完了後、ワークフローディレクトリを `completed-tasks/` に移動する。

---

## ⚠️ 重要な注意事項

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                   | 理由                                     |
| -------------------------- | ---------------------------------------- |
| 勝手にPRを作成する         | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしで実行する | 意図しないブランチやコミットが作成される |
| ローカル確認をスキップする | 動作確認されていないコードがPRに含まれる |

---

## ローカル確認チェックリスト【PR作成前に必須】

| #   | 確認項目             | コマンド                          | 結果 |
| --- | -------------------- | --------------------------------- | ---- |
| 1   | ビルドが成功する     | `pnpm build`                      | -    |
| 2   | 全テストがパスする   | `pnpm test`                       | -    |
| 3   | 型チェックがパスする | `pnpm typecheck`                  | -    |
| 4   | Lintエラーがない     | `pnpm lint`                       | -    |
| 5   | 実際の動作確認       | `pnpm --filter @repo/shared test` | -    |

```bash
# 一括確認コマンド
pnpm build && pnpm test && pnpm typecheck && pnpm lint
```

---

## タスク完了フロー

```
Phase 1〜12 完了
    ↓
【必須】ローカルでの動作確認
    ↓
【必須】ユーザーにPR作成の許可を確認
    ↓
ユーザー許可後: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## PR作成手順

### 1. ユーザーへの確認

PR作成前に以下を確認し、ユーザーに報告する：

- [ ] ローカル確認チェックリストが全て合格
- [ ] 変更ファイル一覧
- [ ] コミットメッセージ案

### 2. ユーザー許可後のPR作成

```bash
# /ai:diff-to-pr スキルを使用
/ai:diff-to-pr
```

このスキルが実行する内容：

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### 3. PRテンプレート

```markdown
## Summary

- クエリ分類器を実装（IQueryClassifierインターフェース）
- LLMベース分類器とルールベース分類器を実装
- クエリタイプ（local/global/relationship/hybrid）に応じた検索重み付けを実装
- LLMエラー時のフォールバック機能を実装

## Test plan

- [ ] ローカルクエリが正しくlocalに分類される
- [ ] グローバルクエリが正しくglobalに分類される
- [ ] 関係性クエリが正しくrelationshipに分類される
- [ ] LLMエラー時にルールベースにフォールバックする
- [ ] 各クエリタイプに正しい検索重みが返される

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## CI確認

| チェック項目 | 結果 | 備考 |
| ------------ | ---- | ---- |
| ビルド       | -    |      |
| テスト       | -    |      |
| 型チェック   | -    |      |
| Lint         | -    |      |

---

## タスク完了処理

### PR作成・CI通過後の手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/CONV-07-01-query-classifier/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep CONV-07-01

# 3. 未タスク指示書を削除（オプション）
rm docs/30-workflows/unassigned-task/task-07-01-query-classifier.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): CONV-07-01 query-classifierをcompleted-tasksに移動"
git push
```

---

## artifacts.json 最終更新

```json
{
  "status": "completed",
  "completedAt": "{{ISO_TIMESTAMP}}",
  "phases": {
    "13": {
      "status": "completed",
      "completedAt": "{{ISO_TIMESTAMP}}",
      "artifacts": [
        {
          "type": "pr",
          "url": "{{PR_URL}}",
          "description": "クエリ分類器実装のPR"
        }
      ]
    }
  }
}
```

---

## 成果物

| 成果物             | 配置先/URL       |
| ------------------ | ---------------- |
| PR                 | {{PR_URL}}       |
| コミット           | {{COMMIT_HASH}}  |
| 最終artifacts.json | `artifacts.json` |

---

## 完了条件チェックリスト

| #   | 項目                                                 | 必須 | 結果 |
| --- | ---------------------------------------------------- | ---- | ---- |
| 1   | ローカルでビルド・テスト・型チェック・Lintが全てパス | ✅   | -    |
| 2   | ユーザーにPR作成の許可を確認済み                     | ✅   | -    |
| 3   | PRが作成されている                                   | ✅   | -    |
| 4   | CIが全て通過している                                 | ✅   | -    |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み   | ✅   | -    |
| 6   | `artifacts.json` の `status` が `"completed"`        | ✅   | -    |
| 7   | 未タスク指示書が削除済み                             | 条件 | -    |
| 8   | **本Phase内の全タスクを100%完了**                    | ✅   | -    |

---

## タスク完了

このPhaseが完了すると、CONV-07-01（クエリ分類器実装）タスクは完了となる。

次のタスク候補：

- CONV-07-02: キーワード検索戦略 (FTS5/BM25)
