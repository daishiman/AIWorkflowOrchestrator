# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成                            |
| 前提Phase  | Phase 12                          |
| 後続Phase  | なし（ワークフロー完了）          |
| ステータス | 未実施                            |
| 作成日     | 2026-01-08                        |
| 機能名     | llm-ui-ipc-adapter-implementation |

---

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。

## 背景

Phase 1-12で実装・テスト・ドキュメント化が完了したため、PRを作成してマージ準備を行う。

---

## 使用スキル

### スキル1: /ai:diff-to-pr

**パス**: 組み込みスキル

**選定理由**: 差分確認・コミット・PR作成・CI確認を一括実行するため

**Trigger条件**:

- PR作成が必要な場合
- コミット・プッシュ・PR作成

**期待される成果物**:

- PR情報

---

## 参照資料

### Phase 10-12成果物

| 参照資料     | パス                                           | 内容         |
| ------------ | ---------------------------------------------- | ------------ |
| 最終レビュー | `outputs/phase-10/final-review-result.md`      | レビュー結果 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`       | テスト結果   |
| ドキュメント | `outputs/phase-12/documentation-update-log.md` | 更新履歴     |

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 実行手順

### 1. `/ai:diff-to-pr` を実行

```
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### 2. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 3. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# 変更確認
git status
git diff

# コミット
git add .
git commit -m "feat(desktop): LLM UI/IPC/Adapter実装

## 概要
- UIコンポーネント（ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel）
- IPCハンドラー（llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat）
- LLMアダプター（OpenAI, Anthropic, Google, xAI）
- LLMAdapterFactory

## 関連
- Closes #XXX

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin docs/llm-ui-ipc-adapter-implementation

# PR作成
gh pr create --title "feat(desktop): LLM UI/IPC/Adapter実装" --body "$(cat <<'EOF'
## Summary
- UIコンポーネント（ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel）を実装
- IPCハンドラー（llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat）を実装
- LLMアダプター（OpenAI, Anthropic, Google, xAI）を実装

## Test plan
- [ ] ユニットテストがすべてPASS
- [ ] 統合テストがすべてPASS
- [ ] 手動テストがすべてPASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/llm-ui-ipc-adapter-implementation/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep llm-ui-ipc-adapter-implementation

# 未タスク指示書を削除（該当する場合）
rm docs/30-workflows/unassigned-task/task-llm-ui-ipc-adapter-implementation.md

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): llm-ui-ipc-adapter-implementationをcompleted-tasksに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                                    | 必須 |
| --- | ------------------------------------------------------- | ---- |
| 1   | PRが作成されている                                      | ✅   |
| 2   | CIが全て通過している                                    | ✅   |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み      | ✅   |
| 4   | `artifacts.json` の `status` が `"completed"`           | ✅   |
| 5   | 未タスク指示書が削除済み                                | ✅   |
| 6   | **本Phase内の全作業を100%完了（PR作成・CI確認・移動）** | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

```markdown
## Phase 13 実行記録

### 使用スキル

- /ai:diff-to-pr: {{result}}

### PR情報

- PR URL: {{PR_URL}}
- CI結果: {{PASS/FAIL}}

### タスク完了確認

- ディレクトリ移動: {{完了/未完了}}
- 未タスク指示書削除: {{完了/未完了/該当なし}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## ワークフロー完了

おめでとうございます！LLM UI/IPC/Adapter実装タスクが完了しました。

### 実装サマリ

| カテゴリ         | 成果物                                                              |
| ---------------- | ------------------------------------------------------------------- |
| UIコンポーネント | ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel  |
| IPCハンドラー    | llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat |
| LLMアダプター    | OpenAIAdapter, AnthropicAdapter, GoogleAdapter, xAIAdapter          |
| ファクトリー     | LLMAdapterFactory                                                   |

### 次のステップ

1. PRのレビューを依頼
2. レビューフィードバックに対応
3. マージ後、動作確認
