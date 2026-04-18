# Phase 12 未割り当てタスク検出

## タスクID: TASK-CONFLICT-PREVENT-001

---

## フォローアップタスク一覧

本タスク（TASK-CONFLICT-PREVENT-001）のスコープ外として検出されたフォローアップ事項を記録します。
いずれも本タスクの完了判定には影響しません。

---

### FU-01: `.agents/skills/` mirror full sync

| 項目             | 内容                                                      |
| ---------------- | --------------------------------------------------------- |
| ID               | FU-01                                                     |
| タイトル         | `.agents/skills/` mirror の rsync --delete による完全同期 |
| 優先度           | 中                                                        |
| 本タスクスコープ | 外（必須ではない）                                        |

**背景:**

`.agents/skills/` は `.claude/skills/` の mirror ツリーです。現在は部分 sync 済みの状態（一部ファイルは反映済み）ですが、`rsync --delete` による完全同期は未実施です。

**未完了の理由:**

- full sync には全ファイルの洗い出しと rsync --delete の実行が必要
- 誤って必要なファイルを削除するリスクを避けるため、本タスクスコープから除外した
- `.gitattributes` で `merge=ours` を設定済みのため、コンフリクト防止の主目的は達成済み

**推奨対応:**

```bash
# canonical から mirror へ完全同期
rsync -av --delete \
  .claude/skills/aiworkflow-requirements/ \
  .agents/skills/aiworkflow-requirements/

# 差分確認後 PR 作成
git diff --stat
```

**推奨タイミング:** 次回の `aiworkflow-requirements` スキル更新時に併せて実施

---

### FU-02: EVALS.json schema 不変確認

| 項目             | 内容                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| ID               | FU-02                                                                |
| タイトル         | EVALS.json schema の不変性確認と将来的な schema 変更ガイドライン整備 |
| 優先度           | 低                                                                   |
| 本タスクスコープ | 外（本タスクスコープ外）                                             |

**背景:**

`.gitattributes` に `EVALS.json merge=ours` を追加しました。これは「EVALS.json の schema 変更は単一のタスク・ブランチが責任を持つ」という前提に基づきます。

**現状:**

- EVALS.json の schema は本タスク期間中に変更なし
- `merge=ours` 設定により、同時変更があっても手元ブランチが優先される

**将来の懸念:**

複数のブランチが同時に EVALS.json を変更する場合、`merge=ours` では一方の変更が失われる可能性があります。

**推奨対応:**

- EVALS.json の変更は必ず単独タスクで行うルールを文書化
- 変更ガイドラインを `docs/` に追加（別タスクとして起票推奨）

---

## 本タスク必須スコープの完了確認

| 必須事項                                       | 状態                 |
| ---------------------------------------------- | -------------------- |
| `.gitattributes` 4カテゴリ merge policy 追加   | 完了                 |
| `setup-merge-drivers.sh` 新規作成              | 完了                 |
| `session-init.sh` warning 追加                 | 完了                 |
| `post-merge-index-regenerate.sh` hook 追加     | 完了                 |
| `generate-index.js` deterministic 化（両パス） | 完了                 |
| Phase 12 ドキュメント作成                      | 完了（本セッション） |

FU-01・FU-02 はいずれも本タスクの必須スコープ外であり、完了判定をブロックしません。
