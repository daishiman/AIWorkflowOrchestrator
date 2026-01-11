# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| 前提Phase  | Phase 12                   |
| 後続Phase  | -（最終Phase）             |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。タスク完了後、タスクディレクトリを`completed-tasks/`に移動する。

## 背景

PR作成は開発プロセスの最終段階。ユーザーにローカルでの動作確認を依頼し、明示的な許可を得てからPRを作成する。CI/CDパイプラインの成功を確認し、タスクを完了させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ユーザーへのローカル動作確認依頼【必須】

**目的**: PR作成前に、ユーザーにローカル環境での動作確認を依頼する

**実行手順**:

1. ユーザーに以下のような形式で動作確認を依頼する

```markdown
## ローカル動作確認のお願い

PR作成前に、以下の点をローカル環境でご確認ください。

### 確認項目

1. **ビルド成功**: `pnpm build` が成功すること
2. **テスト成功**: `pnpm test` が成功すること
3. **型チェック成功**: `pnpm typecheck` が成功すること
4. **基本動作**: 追加された機能が期待通り動作すること

### 確認コマンド

\`\`\`bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
\`\`\`

ローカルでの動作確認が完了しましたらお知らせください。
```

2. ユーザーからの確認完了を待つ

**期待される成果物**:

- ユーザーからの動作確認完了報告

---

### タスク2: 変更サマリーの提示と許可確認【必須】

**目的**: 変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する

**実行手順**:

1. 変更内容を確認する

```bash
git status
git diff main --stat
```

2. 変更サマリーを作成し、ユーザーに提示する

```markdown
## 変更サマリー

### 追加されたファイル

| カテゴリ         | ファイル                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| 型定義           | `packages/shared/src/services/search/types/graphrag-query.ts`                              |
| スキーマ         | `packages/shared/src/services/search/schemas/graphrag-query.ts`                            |
| インターフェース | `packages/shared/src/services/search/interfaces/graphrag-query-service.ts`                 |
| サービス実装     | `packages/shared/src/services/search/graphrag-query-service.ts`                            |
| テスト           | `packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts`             |
| 統合テスト       | `packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts` |

### 変更されたファイル

- `packages/shared/src/services/search/index.ts`: エクスポート追加
- `packages/shared/README.md`: 使用方法追記
- `CHANGELOG.md`: 変更履歴追記

## PR作成の許可確認

上記の変更内容でPRを作成してよろしいでしょうか？
「はい」または「許可します」とお答えいただければ、PR作成を進めます。
```

3. **重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと

**期待される成果物**:

- ユーザーからのPR作成許可

---

### タスク3: PR作成（/ai:diff-to-prの使用）

**目的**: ユーザーの許可を得た後、PRを作成する

**実行手順**:

1. `/ai:diff-to-pr` スキルを実行する

```
/ai:diff-to-pr
```

2. フォールバック（`/ai:diff-to-pr` が使えない場合）

```bash
# ブランチをプッシュ
git push origin task-spec/graphrag-query-integration

# PRを作成
gh pr create \
  --title "feat(search): GraphRAGクエリサービスにコミュニティ要約検索を統合" \
  --body-file pr-description.md \
  --base main \
  --head task-spec/graphrag-query-integration
```

3. PRのURLを記録する

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| PR番号   | #?                                            |
| PR URL   | https://github.com/[org]/[repo]/pull/[number] |
| 作成日時 | ?                                             |

**期待される成果物**:

- 作成されたPR
- PR URLの記録

---

### タスク4: CI/CD確認

**目的**: CI/CDパイプラインが成功することを確認する

**実行手順**:

1. CIジョブの状況を確認する

```bash
gh pr checks [PR番号]
```

2. CIジョブの結果

| ジョブ名         | ステータス | 詳細                |
| ---------------- | ---------- | ------------------- |
| lint             | ?          | ESLint チェック     |
| typecheck        | ?          | TypeScript チェック |
| test             | ?          | ユニットテスト      |
| test-integration | ?          | 統合テスト          |
| build            | ?          | ビルド              |

3. 失敗している場合は修正する

```bash
# ローカルで再現
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

4. 全CIが成功したことを確認する

**期待される成果物**:

- CI/CD成功確認
- 修正履歴（該当時）

---

### タスク5: タスク完了処理（completed-tasks移動）【必須】

**目的**: PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する

**実行手順**:

1. タスクディレクトリをcompleted-tasksに移動する

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/graphrag-query-integration/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep graphrag-query-integration
```

2. 変更をコミットする

```bash
# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): graphrag-query-integrationをcompleted-tasksに移動"
git push
```

3. 移動完了を確認する

| 確認項目             | 状況 |
| -------------------- | ---- |
| ディレクトリ移動完了 | ?    |
| コミット完了         | ?    |
| プッシュ完了         | ?    |

**期待される成果物**:

- 移動されたタスクディレクトリ
- コミット・プッシュ完了

---

### タスク6: PR作成完了レポート

**目的**: PR作成結果を正式なドキュメントとして出力する

**実行手順**:

1. `outputs/phase-13/pr-creation-report.md` にPR作成レポートを作成
2. 以下の内容を含める:
   - PR情報（番号、URL、タイトル）
   - 変更ファイルリスト
   - CI/CD結果
   - タスク完了処理結果
   - 次のアクション

**期待される成果物**:

- `outputs/phase-13/pr-creation-report.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> PR作成時に以下のシステム仕様を参照してください。

| 参照資料             | パス                                                                                          | 内容           |
| -------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | 実装内容の参照 |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | 設計の参照     |

---

## 成果物

| 成果物              | パス                                     | 内容                         | 必須 |
| ------------------- | ---------------------------------------- | ---------------------------- | ---- |
| GitHub PR           | GitHub上                                 | マージ可能なPR               | ✅   |
| PR作成レポート      | `outputs/phase-13/pr-creation-report.md` | PR情報、CI結果、次アクション | ✅   |
| completed-tasks移動 | `docs/30-workflows/completed-tasks/`     | タスクディレクトリ移動完了   | ✅   |

---

## 完了条件

### 必須条件

- [ ] **ユーザーにローカル動作確認を依頼している**【必須】
- [ ] **変更サマリーを提示しPR作成の許可を得ている**【必須】
- [ ] **PRが作成されている**【必須】
- [ ] **CIが通過している**【必須】
- [ ] **タスクディレクトリがcompleted-tasksに移動されている**【必須】

### その他の条件

- [ ] 全変更がコミットされている
- [ ] コミット履歴が整理されている
- [ ] PR説明文が作成されている
- [ ] レビュー準備が完了している
- [ ] `outputs/phase-13/pr-creation-report.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] **タスクディレクトリがcompleted-tasksに移動されていることを確認**

---

## 全Phase完了アクション

本Phaseをもって、GraphRAGクエリ統合タスク（CONV-08-04）の全Phaseが完了となります。

### 完了チェックリスト

- [ ] Phase 1〜13 の全タスクが完了
- [ ] 全成果物が生成されている
- [ ] PRが作成され、CI/CDが成功している
- [ ] ドキュメントが更新されている
- [ ] レビュー依頼が完了している
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている

### 次のアクション

1. レビュアーからのフィードバックを待つ
2. フィードバックに対応する（該当時）
3. 承認後、PRをマージする
4. マージ後、タスクをクローズする

---

## 依存関係

- **前提**: Phase 12（ドキュメント）が完了していること
- **後続**: なし（最終Phase）

---

## タスク完了

全Phase（1〜13）が完了しました。PRのレビュー・マージをお待ちください。
