# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 13                   |
| Phase名    | PR作成               |
| 前提Phase  | Phase 12             |
| 後続Phase  | なし（完了）         |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

全フェーズの成果物をまとめてPull Requestを作成し、レビュー・マージに進む。

## 背景

全フェーズが完了した後、変更をmainブランチにマージするためのPRを作成する。

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

| #   | 確認項目                       | コマンド例            |
| --- | ------------------------------ | --------------------- |
| 1   | ビルドが成功する               | `pnpm build`          |
| 2   | 全テストがパスする             | `pnpm test`           |
| 3   | 型チェックがパスする           | `pnpm typecheck`      |
| 4   | Lintエラーがない               | `pnpm lint`           |
| 5   | 実際の動作確認（該当する場合） | `pnpm dev` で手動確認 |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 変更内容の最終確認

**目的**: PRに含める変更内容を最終確認する

**実行手順**:

1. 変更ファイル一覧を確認:

   ```bash
   git status
   git diff --stat main
   ```

2. 以下のカテゴリで変更を整理:

| カテゴリ     | ファイル数 | 主な変更内容        |
| ------------ | ---------- | ------------------- |
| 新規実装     |            | Fusion/Reranker実装 |
| 型定義       |            | FusedSearchResult等 |
| テスト       |            | ユニット/統合テスト |
| ドキュメント |            | 実装ガイド/使用例   |
| タスク仕様書 |            | Phase 1-13成果物    |

**期待される成果物**:

- `outputs/phase-13/changes-summary.md` - 変更内容サマリー

---

### タスク2: コミット整理

**目的**: コミット履歴を整理し、レビューしやすくする

**実行手順**:

1. コミット履歴を確認:

   ```bash
   git log --oneline main..HEAD
   ```

2. 必要に応じてコミットを整理（squash/reword）

3. コミットメッセージの規約確認:
   - `feat:` 新機能
   - `fix:` バグ修正
   - `docs:` ドキュメント
   - `test:` テスト
   - `refactor:` リファクタリング

**期待される成果物**:

- `outputs/phase-13/commit-history.md` - 整理後のコミット履歴

---

### タスク3: PR本文作成

**目的**: レビュアーが理解しやすいPR本文を作成する

**実行手順**:

1. 以下のテンプレートでPR本文を作成:

```markdown
## 概要

RRF Fusion + Reranking機能を実装しました。

### 実装内容

- **RRF Fusion**: 複数検索戦略の結果をReciprocal Rank Fusionで統合
- **WeightedScoreFusion**: 加重平均によるスコア統合
- **Rerankers**: LLM/Cohere/Voyage/NoOp の4種類のReranker実装

### 主な変更点

1. `packages/shared/src/services/search/fusion/` - Fusion実装
2. `packages/shared/src/services/search/reranking/` - Reranker実装
3. `packages/shared/src/services/search/types.ts` - 型定義追加
4. テストコード一式
5. ドキュメント更新

### テスト結果

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）

### 関連タスク

- タスクID: CONV-07-05
- 依存タスク: CONV-07-02, CONV-07-03, CONV-07-04

### レビュー観点

1. RRFアルゴリズムの実装が正しいか
2. Rerankerのエラーハンドリングが適切か
3. 型定義が適切か
4. テストが十分か
```

**期待される成果物**:

- `outputs/phase-13/pr-body.md` - PR本文

---

### タスク4: CI/CDパイプライン確認

**目的**: CIが全て成功することを確認する

**実行手順**:

1. プッシュ前のローカルチェック:

   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/shared test
   ```

2. リモートにプッシュ:

   ```bash
   git push origin HEAD
   ```

3. CI結果を確認:

| チェック項目      | 状態 | 備考 |
| ----------------- | ---- | ---- |
| Lint              |      |      |
| TypeCheck         |      |      |
| Unit Tests        |      |      |
| Integration Tests |      |      |
| Build             |      |      |

**期待される成果物**:

- `outputs/phase-13/ci-results.md` - CI実行結果

---

### タスク5: PR作成・提出

**目的**: Pull Requestを作成し、レビューを依頼する

**⚠️ 重要**: このタスクは**ユーザーの明示的な許可を得てから**実行すること。

**実行手順**:

1. **ユーザーにPR作成の許可を確認**

2. `/ai:diff-to-pr` スキルを使用してPR作成:

   ```bash
   # ユーザー許可後にのみ実行
   /ai:diff-to-pr
   ```

   このスキルが実行する内容:
   - 変更差分の確認
   - コミットメッセージ生成
   - PR作成
   - CI結果確認

3. 代替手段（手動でPR作成する場合）:

   ```bash
   gh pr create \
     --title "feat(search): RRF Fusion + Reranking機能実装 (CONV-07-05)" \
     --body-file outputs/phase-13/pr-body.md \
     --base main
   ```

4. PR URLを記録

5. レビュアーをアサイン（必要に応じて）

**期待される成果物**:

- `outputs/phase-13/pr-created.md` - PR作成記録（PR URL含む）

---

### タスク6: 最終チェックリスト確認

**目的**: 全フェーズの完了を最終確認する

**実行手順**:

1. 以下のチェックリストを確認:

| #   | チェック項目         | 状態 |
| --- | -------------------- | ---- |
| 1   | Phase 1-13 全て完了  |      |
| 2   | 全テストがパス       |      |
| 3   | カバレッジ基準達成   |      |
| 4   | ドキュメント更新完了 |      |
| 5   | PR作成完了           |      |
| 6   | CI全て成功           |      |

**期待される成果物**:

- `outputs/phase-13/final-checklist.md` - 最終チェックリスト

---

### タスク7: タスク完了処理

**目的**: タスクディレクトリをcompleted-tasksに移動し、クリーンアップする

**実行手順**:

1. PRがマージされたことを確認

2. タスクディレクトリをcompleted-tasksに移動:

   ```bash
   # 1. タスクディレクトリをcompleted-tasksに移動
   mv docs/30-workflows/rrf-fusion-reranking/ docs/30-workflows/completed-tasks/

   # 2. 移動を確認
   ls docs/30-workflows/completed-tasks/ | grep rrf-fusion-reranking
   ```

3. 該当する場合、未タスク指示書を削除:

   ```bash
   # 元のタスク指示書を削除（すでに完了したため）
   rm docs/30-workflows/unassigned-task/task-07-05-rrf-fusion-reranking.md
   ```

4. `artifacts.json`のステータスを更新:

   ```json
   {
     "taskId": "CONV-07-05",
     "status": "completed",
     "completedAt": "YYYY-MM-DD"
   }
   ```

5. 変更をコミット・プッシュ:

   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): rrf-fusion-rerankingをcompleted-tasksに移動"
   git push
   ```

**期待される成果物**:

- タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動済み

---

## 参照資料

| 参照資料       | パス                    | 内容             |
| -------------- | ----------------------- | ---------------- |
| Phase 12成果物 | `outputs/phase-12/`     | ドキュメント更新 |
| 全Phase成果物  | `outputs/phase-{1-12}/` | 各Phase成果物    |

---

## 成果物

| 成果物             | パス                                  | 内容       |
| ------------------ | ------------------------------------- | ---------- |
| 変更内容サマリー   | `outputs/phase-13/changes-summary.md` | 変更一覧   |
| コミット履歴       | `outputs/phase-13/commit-history.md`  | 整理後履歴 |
| PR本文             | `outputs/phase-13/pr-body.md`         | PR説明文   |
| CI実行結果         | `outputs/phase-13/ci-results.md`      | CI確認結果 |
| PR作成記録         | `outputs/phase-13/pr-created.md`      | PR URL等   |
| 最終チェックリスト | `outputs/phase-13/final-checklist.md` | 完了確認   |

---

## 完了条件

- [ ] 変更内容が整理されている
- [ ] コミット履歴が整理されている
- [ ] PR本文が作成されている
- [ ] CIが全て成功している
- [ ] PRが作成されている
- [ ] 最終チェックリストが全て完了している
- [ ] タスクディレクトリが `completed-tasks/` に移動済み（PRマージ後）
- [ ] （該当時）未タスク指示書が削除済み
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] **タスク全体の完了を宣言**

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

全Phaseが完了した場合、以下を実行:

1. PRがマージされるのを待つ
2. マージ後、関連するタスク仕様書のステータスを「完了」に更新
3. `artifacts.json`の全Phaseステータスを「completed」に更新

```json
{
  "taskId": "CONV-07-05",
  "status": "completed",
  "completedAt": "YYYY-MM-DD"
}
```
