# Phase 12 スキルフィードバックレポート

## タスクID: TASK-CONFLICT-PREVENT-001

---

## うまくいった点

### 1. 4カテゴリ分類による明快な設計

コンフリクトが発生するファイルを「generated / mirror / log / metadata」の4カテゴリに分類し、それぞれに適切な merge 戦略を割り当てた設計は非常に明快でした。

- **generated（索引ファイル）**: `merge=ours` + deterministic generate の組み合わせにより、「手元を使う」が常に正解になる状況を作った
- **mirror（.agents/skills/）**: canonical が `.claude/skills/` と明確に決まっているため `merge=ours` で迷いがない
- **log（LOGS.md）**: append-only ログは `merge=union` による行結合が理想的にマッチした
- **metadata（EVALS.json）**: 単一責務の原則で `merge=ours` を適用

カテゴリ分類を先に決めることで、個々のファイルへの適用が機械的に判断できました。

### 2. custom merge driver の未設定を session-init で即通知する設計

`merge.ours.driver = true` は `.git/config` への登録が必要で、新しい worktree や開発環境では忘れられやすい設定です。`session-init.sh` でセッション開始時に自動チェックし、未設定の場合に警告を出す設計により、コンフリクト発生前に問題に気付ける仕組みが作れました。

「問題が起きてから対処」ではなく「問題が起きる前に通知」という予防的アプローチが功を奏しました。

### 3. deterministic generate により merge 後の自動再生成が可能になった

タイムスタンプを除去して generate-index.js を deterministic 化したことで、`post-merge-index-regenerate.sh` による「merge 後に必ず最新索引を再生成する」フローが安全に実現できました。

以前は「再生成すると差分が出てしまう」問題があったため、merge 後の自動再生成は実施していませんでした。deterministic 化によりこの制約が解消されました。

### 4. 3層防衛の構造的な設計

1. **`.gitattributes` merge policy**: コンフリクトを自動解決（第1層）
2. **session-init warning**: 設定漏れを早期検知（第2層）
3. **post-merge 再生成**: merge 後の索引を常に最新化（第3層）

各層が独立して機能しつつ、組み合わさることで堅牢なコンフリクト防止システムになりました。

---

## 改善余地

### 1. `LOGS.md` の `merge=union` は append-only 運用前提。rebase 時の挙動要確認

`merge=union` は git merge コマンドでは正常に動作しますが、`git rebase` 時の挙動は merge とは異なります。rebase では各コミットを順番に replay するため、union merge driver が期待通りに動作しない場合があります。

**推奨アクション:**

- LOGS.md の変更を含むブランチで `git rebase` を実行するテストを実施
- 問題が確認された場合は、rebase の代わりに merge を使うガイドラインを整備

### 2. full sync スクリプトの定期実行自動化は未実装

`.agents/skills/` と `.claude/skills/` の同期は現状手動です。`rsync --delete` による full sync を CI や hook で自動化すれば、mirror の乖離を防げます。

**推奨アクション:**

- `post-push` hook または CI workflow に full sync ステップを追加
- FU-01 として記録済み（unassigned-task-detection.md 参照）

### 3. `setup-merge-drivers.sh` の実行促進

`session-init.sh` での警告はありますが、警告を無視した場合に自動実行する仕組みはありません。初回セットアップの確実性を高めるため、`pnpm install` 後に自動実行される `postinstall` スクリプトへの組み込みも検討できます。

```json
// package.json
{
  "scripts": {
    "postinstall": "bash .claude/scripts/setup-merge-drivers.sh"
  }
}
```

ただし、CI 環境では不要な場合があるため、環境変数でスキップできる設計が必要です。

---

## 総括

TASK-CONFLICT-PREVENT-001 は NON_VISUAL / docs-only タスクとして、コード変更なしで `.gitattributes`・シェルスクリプト・generate スクリプトの変更のみでコンフリクト防止を実現しました。

設計の核心は「ファイルの性質に応じた merge 戦略の選択」と「予防的な設定チェック機構」であり、同種のコンフリクト問題に対する再利用可能なパターンとして記録します。
