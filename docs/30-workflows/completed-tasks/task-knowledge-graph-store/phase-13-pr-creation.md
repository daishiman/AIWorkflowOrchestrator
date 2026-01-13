# Phase 13: PR作成

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 13                         |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## 実行タスク

- **ローカル動作確認依頼**: ユーザーにローカルでの動作確認を依頼
- **変更サマリー提示**: 変更内容のサマリーを提示しPR作成の許可を確認
- **PR作成**: ユーザーの許可後に`/ai:diff-to-pr`を実行
- **CI確認**: CIが通過したことを確認
- **タスク完了処理**: completed-tasksへの移動

---

## 参照資料

### 全Phase成果物

| Phase | 主要成果物                 | 用途                 |
| ----- | -------------------------- | -------------------- |
| 1     | 要件定義書                 | PR説明の背景         |
| 2-3   | 設計書・レビュー結果       | アーキテクチャ説明   |
| 4-7   | テスト・カバレッジ         | テスト結果セクション |
| 8-9   | リファクタリング・品質保証 | コード品質セクション |
| 10-11 | レビュー・マニュアルテスト | 検証結果セクション   |
| 12    | ドキュメント               | ドキュメント変更     |

---

## ローカル確認チェックリスト【PR作成前に必須】

PR作成前に以下を**必ず**確認すること:

| #   | 確認項目                       | コマンド例                                               | 結果 |
| --- | ------------------------------ | -------------------------------------------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm build`                                             | □    |
| 2   | 全テストがパスする             | `pnpm --filter @repo/shared test:run src/services/graph` | □    |
| 3   | 型チェックがパスする           | `pnpm --filter @repo/shared typecheck`                   | □    |
| 4   | Lintエラーがない               | `pnpm --filter @repo/shared lint`                        | □    |
| 5   | 実際の動作確認（該当する場合） | 手動での動作テスト                                       | □    |

---

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

```
以下のコマンドでローカル動作を確認してください:

pnpm build
pnpm --filter @repo/shared test:run src/services/graph
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared lint

問題がなければ、PR作成を進めてよいかご確認ください。
```

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

このスキルが実行する内容:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### 4. CI確認

```bash
# CI状況確認
gh pr checks

# 失敗時はログ確認・修正
gh pr checks --watch
```

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# 変更ファイル一覧
git diff --name-only main

# コミット
git add .
git commit -m "feat(graph): Knowledge Graph Store 実装

- EntityStore: エンティティのCRUD操作
- RelationStore: 関係の管理と証拠追跡
- CommunityStore: コミュニティの階層管理
- GraphQueryService: グラフ探索・最短経路検索

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push origin HEAD

# PR作成
gh pr create --title "feat: Knowledge Graph Store 実装" --body-file .github/PULL_REQUEST_TEMPLATE.md
```

---

## PRテンプレート

```markdown
## Summary

Knowledge Graph Store の実装を追加します。エンティティ・関係・コミュニティを管理するためのStore層と、グラフ探索機能を提供します。

### 主な変更点

- EntityStore: エンティティのCRUD操作
- RelationStore: 関係の管理と証拠追跡
- CommunityStore: コミュニティの階層管理
- GraphQueryService: グラフ探索・最短経路検索

### 関連Issue

- Closes #XXX

## Changes

### 新規ファイル

- `packages/shared/src/services/graph/types.ts` - 型定義
- `packages/shared/src/services/graph/errors.ts` - エラークラス
- `packages/shared/src/services/graph/entity-store.ts` - EntityStore実装
- `packages/shared/src/services/graph/relation-store.ts` - RelationStore実装
- `packages/shared/src/services/graph/community-store.ts` - CommunityStore実装
- `packages/shared/src/services/graph/graph-query-service.ts` - グラフ探索実装
- `packages/shared/src/services/graph/knowledge-graph-store.ts` - 統合ファクトリ

### テストファイル

- `packages/shared/src/services/graph/__tests__/*.test.ts` - ユニットテスト
- `packages/shared/src/services/graph/__tests__/integration/*.test.ts` - 統合テスト

## Test Plan

### 自動テスト結果

| カテゴリ       | テスト数 | 結果 |
| -------------- | -------- | ---- |
| ユニットテスト | XX       | PASS |
| 統合テスト     | XX       | PASS |
| パフォーマンス | XX       | PASS |

### カバレッジ

| 指標              | 値  |
| ----------------- | --- |
| Line Coverage     | XX% |
| Branch Coverage   | XX% |
| Function Coverage | XX% |

### マニュアルテスト

- [x] EntityStore操作確認
- [x] RelationStore操作確認
- [x] CommunityStore操作確認
- [x] GraphQueryService操作確認
- [x] エラーメッセージ品質確認

## Checklist

- [x] コードがプロジェクトのスタイルガイドに準拠している
- [x] 自己レビューを実施した
- [x] コードにコメント（特に複雑な箇所）を追加した
- [x] ドキュメントを更新した
- [x] 変更により新しい警告が発生していない
- [x] テストを追加し、すべて成功している
- [x] 依存パッケージの更新は必要ない

---

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

---

## 統合テスト連携【必須】

PR作成前の最終確認:

| 確認項目         | 基準                   | 結果       |
| ---------------- | ---------------------- | ---------- |
| 全テストPASS     | CI上で成功             | {{RESULT}} |
| Lint PASS        | 警告・エラー0件        | {{RESULT}} |
| 型チェック PASS  | TypeScriptエラー0件    | {{RESULT}} |
| コンフリクトなし | mainとの差分が解消済み | {{RESULT}} |
| レビュアー設定   | 適切な人がアサイン     | {{RESULT}} |

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/task-knowledge-graph-store/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep task-knowledge-graph-store

# 3. （該当時）未タスク指示書の削除
rm docs/30-workflows/unassigned-task/task-knowledge-graph-store.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): task-knowledge-graph-storeをcompleted-tasksに移動"
git push
```

### artifacts.json最終更新

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
          "path": "{{PR_URL}}",
          "description": "Pull Request"
        }
      ]
    }
  }
}
```

---

## 成果物

| 成果物     | パス                                 | 説明       |
| ---------- | ------------------------------------ | ---------- |
| PRリンク   | `outputs/phase-13/pr-link.md`        | 作成したPR |
| 変更サマリ | `outputs/phase-13/change-summary.md` | 変更概要   |

---

## 完了条件

| #   | 項目                                                     | 必須 |
| --- | -------------------------------------------------------- | ---- |
| 1   | **ローカルでビルド・テスト・型チェック・Lintが全てパス** | ✅   |
| 2   | **ユーザーにPR作成の許可を確認済み**                     | ✅   |
| 3   | PRが作成されている                                       | ✅   |
| 4   | CIが全て通過している                                     | ✅   |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み       | ✅   |
| 6   | `artifacts.json` の `status` が `"completed"`            | ✅   |
| 7   | （該当時）未タスク指示書が削除済み                       | 条件 |
| 8   | **本Phase内の全タスクを100%完了**                        | ✅   |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（全Phase成果物）
2. ローカル動作確認（ビルド/テスト/型/Lint）
3. ユーザーにPR作成許可を確認
4. 変更内容の確認・サマリー作成
5. mainとの同期（リベース/マージ）
6. コンフリクト解消（該当時）
7. `/ai:diff-to-pr` 実行またはPR手動作成
8. CIの確認
9. タスクディレクトリの移動（completed-tasks/へ）
10. artifacts.json最終更新
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成されている
- [ ] CIが全て成功している
- [ ] タスクディレクトリがcompleted-tasksに移動済み
- [ ] artifacts.jsonのstatusがcompletedに更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 13
```

---

## 次のPhase

なし（ワークフロー完了）

### 完了後のアクション

1. PRレビュー対応
2. マージ
3. 関連Issueのクローズ
