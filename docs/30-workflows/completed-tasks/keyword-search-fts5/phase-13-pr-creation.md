# Phase 13: PR作成 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（完了）                 |
| ステータス | 未実施                       |
| 作成日     | 2026-01-11                   |
| 機能名     | keyword-search-fts5          |
| タスクID   | CONV-07-02                   |

---

## 目的

実装完了後のコミット、プルリクエスト作成、CI確認を行い、変更をmainブランチにマージ可能な状態にする。

---

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

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

## ローカル確認チェックリスト【PR作成前に必須】

PR作成前に以下を**必ず**確認すること:

| #   | 確認項目                       | コマンド例            | 状態 |
| --- | ------------------------------ | --------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm build`          | [ ]  |
| 2   | 全テストがパスする             | `pnpm test`           | [ ]  |
| 3   | 型チェックがパスする           | `pnpm typecheck`      | [ ]  |
| 4   | Lintエラーがない               | `pnpm lint`           | [ ]  |
| 5   | 実際の動作確認（該当する場合） | `pnpm dev` で手動確認 | [ ]  |

**実行コマンド**:

```bash
# 1. すべてのテストがパス
pnpm --filter @repo/shared test

# 2. 型チェックがパス
pnpm --filter @repo/shared typecheck

# 3. Lintエラーなし
pnpm --filter @repo/shared lint

# 4. ビルド成功
pnpm --filter @repo/shared build

# 5. カバレッジ基準達成
pnpm --filter @repo/shared test:coverage
```

---

## `/ai:diff-to-pr` スキルの使用

**ユーザーの許可を得た後にのみ**、`/ai:diff-to-pr` スキルを使用してPR作成を行う:

```bash
# ユーザー許可後にのみ実行
/ai:diff-to-pr
```

このスキルが実行する内容:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

---

## Git操作

### 1. 変更ファイルの確認

```bash
git status
git diff --stat
```

### 2. 変更ファイル一覧（想定）

```
packages/shared/src/services/search/
├── keyword-search-strategy.ts          # 新規
├── keyword-search-strategy.test.ts     # 新規
├── keyword-search-strategy.types.ts    # 新規（オプション）
└── index.ts                            # 更新（エクスポート追加）

references/specifications/
├── api-internal-search.md              # 更新
└── interfaces-rag-search.md            # 更新

docs/30-workflows/
├── keyword-search-fts5/                # 新規ディレクトリ
│   ├── index.md
│   ├── artifacts.json
│   └── phase-*.md
└── unassigned-task/
    └── task-00-master-task-list.md     # 更新
```

### 3. コミット作成（ユーザー許可後）

```bash
# ステージング
git add packages/shared/src/services/search/keyword-search-strategy*.ts
git add packages/shared/src/services/search/index.ts
git add references/specifications/
git add docs/30-workflows/keyword-search-fts5/
git add docs/30-workflows/unassigned-task/task-00-master-task-list.md

# コミット（Conventional Commits形式）
git commit -m "feat(search): implement FTS5/BM25 keyword search strategy

- Add KeywordSearchStrategy implementing ISearchStrategy interface
- Support keyword (OR), phrase (exact), and NEAR search modes
- Implement BM25 score normalization (0.0-1.0 range)
- Add comprehensive test suite with 80%+ coverage
- Update API and interface specifications

Closes: CONV-07-02
Depends-on: CONV-04-03"
```

---

## PR作成（/ai:diff-to-pr使用）

### PRテンプレート

```markdown
## Summary

- FTS5/BM25によるキーワード検索戦略（KeywordSearchStrategy）を実装
- 3つの検索モード（keyword/phrase/near）をサポート
- BM25スコアを0.0-1.0範囲に正規化
- ISearchStrategyインターフェースに準拠

## Changes

### New Files

- `packages/shared/src/services/search/keyword-search-strategy.ts`
- `packages/shared/src/services/search/keyword-search-strategy.test.ts`

### Modified Files

- `packages/shared/src/services/search/index.ts` - エクスポート追加
- `references/specifications/api-internal-search.md` - API仕様追記
- `references/specifications/interfaces-rag-search.md` - 型定義追記

### Documentation

- `docs/30-workflows/keyword-search-fts5/` - タスク仕様書

## Test Plan

- [x] 単体テスト: キーワード検索（OR）
- [x] 単体テスト: フレーズ検索（完全一致）
- [x] 単体テスト: NEAR検索（近接）
- [x] 単体テスト: スコア正規化
- [x] 単体テスト: エラーハンドリング
- [x] 統合テスト: DB連携
- [x] パフォーマンステスト: < 100ms（keyword/phrase）
- [x] パフォーマンステスト: < 150ms（near）

## Coverage

| Metric   | Target | Actual |
| -------- | ------ | ------ |
| Line     | 80%+   | XX%    |
| Branch   | 60%+   | XX%    |
| Function | 80%+   | XX%    |

## Dependencies

- Depends on: CONV-04-03 (chunks + FTS5 table)

## Breaking Changes

None

## Migration Guide

N/A (新機能追加のみ)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## CI/CD確認

### GitHub Actions確認項目

| ワークフロー | 期待結果 | 状態 |
| ------------ | -------- | ---- |
| Build        | ✓ Pass   | [ ]  |
| Test         | ✓ Pass   | [ ]  |
| Lint         | ✓ Pass   | [ ]  |
| Type Check   | ✓ Pass   | [ ]  |
| Coverage     | 基準達成 | [ ]  |

### CI失敗時の対応

```bash
# 1. 失敗ログの確認
gh run view <run-id> --log-failed

# 2. ローカルで再現
pnpm --filter @repo/shared test
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared typecheck

# 3. 修正・再コミット
git add -A
git commit --amend  # または新規コミット
git push --force-with-lease  # amendの場合
```

---

## タスクディレクトリの移動【PR作成・CI通過後】

### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/keyword-search-fts5/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep keyword-search-fts5

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): keyword-search-fts5をcompleted-tasksに移動"
git push
```

### artifacts.json更新

```json
{
  "status": "completed",
  "completedAt": "{{ISO_TIMESTAMP}}",
  "prNumber": "{{PR_NUMBER}}",
  "phases": {
    "13": {
      "status": "completed",
      "completedAt": "{{ISO_TIMESTAMP}}",
      "artifacts": [
        {
          "type": "pr",
          "path": "https://github.com/{{OWNER}}/{{REPO}}/pull/{{PR_NUMBER}}",
          "description": "PR #{{PR_NUMBER}}"
        }
      ]
    }
  }
}
```

---

## 完了条件チェックリスト

| #   | 項目                                                     | 必須 | 状態 |
| --- | -------------------------------------------------------- | ---- | ---- |
| 1   | **ローカルでビルド・テスト・型チェック・Lintが全てパス** | ✅   | [ ]  |
| 2   | **ユーザーにPR作成の許可を確認済み**                     | ✅   | [ ]  |
| 3   | PRが作成されている                                       | ✅   | [ ]  |
| 4   | CIが全て通過している                                     | ✅   | [ ]  |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み       | ✅   | [ ]  |
| 6   | `artifacts.json` の `status` が `"completed"`            | ✅   | [ ]  |
| 7   | （該当時）未タスク指示書が削除済み                       | 条件 | [ ]  |
| 8   | **本Phase内の全タスクを100%完了**                        | ✅   | [ ]  |

---

## マージ準備

### マージ前最終チェック

- [ ] すべてのCIがパス
- [ ] レビュー承認済み
- [ ] コンフリクトなし
- [ ] ブランチが最新のmainと同期済み

### マージ方法

```bash
# Squash and merge推奨
gh pr merge <pr-number> --squash --delete-branch
```

---

## 事後作業

### マスタータスクリスト最終更新

```markdown
| CONV-07-02 | キーワード検索戦略（FTS5/BM25） | ✅ 完了 | CONV-04-03 | PR #XXX |
```

### 後続タスクの確認

CONV-07-02完了により着手可能になるタスク:

- ハイブリッド検索の統合（HybridRAGSearchへの組み込み）
- 検索結果キャッシュ戦略
- 検索クエリ最適化

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonのPhase 13を更新
- [ ] タスク全体の `status` を `"completed"` に更新

---

## ワークフロー完了

タスク `CONV-07-02: キーワード検索戦略（FTS5/BM25）` の全Phaseが完了。
