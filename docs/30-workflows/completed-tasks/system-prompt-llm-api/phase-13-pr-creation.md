# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（ワークフロー完了）     |
| ステータス | 未実施                       |
| 作成日     | 2026-01-23                   |
| 機能名     | system-prompt-llm-api        |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

PR作成前に以下を確認:

- ローカル動作確認（ユーザーによる）
- 変更サマリーの提示
- ユーザーの明示的な許可

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル動作確認依頼【必須】

**目的**: ユーザーにローカル環境での動作確認を依頼する

**実行手順**:

1. ユーザーに以下の確認を依頼:
   - デスクトップアプリが起動すること
   - システムプロンプト機能が動作すること
   - 各プロバイダーで応答が返ること

**確認依頼テンプレート**:

```
PR作成前に、ローカル環境での動作確認をお願いします。

確認項目:
1. [ ] デスクトップアプリが起動する（pnpm --filter @repo/desktop dev）
2. [ ] システムプロンプトを設定してメッセージを送信できる
3. [ ] LLMからの応答が表示される
4. [ ] エラー時に適切なメッセージが表示される

問題がなければ「確認OK」とお知らせください。
```

**期待される成果物**:

- ユーザーからの確認OK

---

### タスク2: 変更サマリー提示と許可確認【必須】

**目的**: 変更内容を提示し、PR作成の許可を得る

**実行手順**:

1. 変更ファイル一覧を作成
2. 変更内容のサマリーを作成
3. ユーザーにPR作成の許可を確認

**変更サマリーテンプレート**:

```
## 変更サマリー

### 新規ファイル
- apps/desktop/src/main/utils/buildMessages.ts
- apps/desktop/src/main/utils/buildMessages.test.ts
- apps/desktop/src/main/services/llmClient.ts
- apps/desktop/src/main/services/llmClient.test.ts

### 更新ファイル
- apps/desktop/src/main/ipc/aiHandlers.ts
- apps/desktop/src/main/ipc/aiHandlers.test.ts

### ドキュメント
- docs/30-workflows/system-prompt-llm-api/（タスク仕様書）

### 変更内容
- システムプロンプトを含むメッセージをLLM APIに送信する機能を実装
- 4つのプロバイダー（OpenAI/Anthropic/Google/xAI）に対応
- エラーハンドリングを実装

PRを作成してもよろしいでしょうか？
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

**期待される成果物**:

- ユーザーからのPR作成許可

---

### タスク3: PR作成実行

**目的**: ユーザーの許可を得た後、PRを作成する

**実行手順**:

**方法1: /ai:diff-to-pr スキルを使用（推奨）**

```
/ai:diff-to-pr
```

**方法2: 手動でgit/gh CLIを使用（フォールバック）**

```bash
# 変更をステージング
git add apps/desktop/src/main/utils/buildMessages.ts
git add apps/desktop/src/main/utils/buildMessages.test.ts
git add apps/desktop/src/main/services/llmClient.ts
git add apps/desktop/src/main/services/llmClient.test.ts
git add apps/desktop/src/main/ipc/aiHandlers.ts
git add apps/desktop/src/main/ipc/aiHandlers.test.ts
git add docs/30-workflows/system-prompt-llm-api/

# コミット作成
git commit -m "feat(chat): システムプロンプトのLLM API統合を実装

- buildMessages関数を追加（システムプロンプトを含むメッセージ配列構築）
- callLLM関数を追加（Vercel AI SDKを使用したLLM API呼び出し）
- aiHandlersをLLM Client呼び出しに更新
- 4プロバイダー（OpenAI/Anthropic/Google/xAI）対応
- エラーハンドリング実装

Closes #376

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# リモートにプッシュ
git push -u origin task-system-prompt-llm-api-integration

# PR作成
gh pr create --title "feat(chat): システムプロンプトのLLM API統合を実装" --body "$(cat <<'EOF'
## Summary

- システムプロンプトを含むメッセージを実際のLLM APIに送信する機能を実装
- 4つのプロバイダー（OpenAI/Anthropic/Google/xAI）に対応
- エラーハンドリングを実装

## Changes

### 新規ファイル
- `apps/desktop/src/main/utils/buildMessages.ts` - メッセージ構築関数
- `apps/desktop/src/main/services/llmClient.ts` - LLM API呼び出し関数

### 更新ファイル
- `apps/desktop/src/main/ipc/aiHandlers.ts` - モックレスポンスからLLM Client呼び出しに変更

## Test plan

- [ ] 全自動テストが成功
- [ ] OpenAIでシステムプロンプト機能が動作
- [ ] Anthropicでシステムプロンプト機能が動作
- [ ] Googleでシステムプロンプト機能が動作
- [ ] xAIでシステムプロンプト機能が動作
- [ ] エラー時に適切なメッセージが表示

Closes #376

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**期待される成果物**:

- PR URL

---

### タスク4: CI確認

**目的**: CIが通過したことを確認する

**実行手順**:

1. PRページでCIステータスを確認
2. 全チェックがパスしていることを確認
3. 失敗した場合は修正して再プッシュ

**確認項目**:

- [ ] ビルドが成功
- [ ] テストが成功
- [ ] Lintが成功
- [ ] 型チェックが成功

**期待される成果物**:

- CI確認結果

---

### タスク5: タスク完了処理【必須】

**目的**: タスクディレクトリを完了フォルダに移動する

**実行手順**:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/system-prompt-llm-api/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep system-prompt-llm-api

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): system-prompt-llm-apiをcompleted-tasksに移動"
git push
```

**期待される成果物**:

- タスクディレクトリの移動完了

---

## 参照資料

### Phase成果物

| 資料名               | パス                                          | 内容           |
| -------------------- | --------------------------------------------- | -------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## 成果物

| 成果物 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI状態 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（ワークフロー完了）

---

## ワークフロー完了

このPhaseが完了すると、タスク全体が完了となります。

PRがマージされた後、Issue #376 をクローズしてください。
