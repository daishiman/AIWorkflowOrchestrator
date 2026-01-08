# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 13                       |
| Phase名    | PR作成                   |
| 前提Phase  | Phase 12                 |
| 後続Phase  | -                        |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

変更をコミットし、PRを作成してCI確認を行う。タスク完了後、タスクディレクトリをcompleted-tasksに移動する。

## 背景

全ての開発作業が完了したため、変更をメインブランチにマージするためのPRを作成する。

---

## 使用スキル

> `/ai:diff-to-pr` スキルを使用してPR作成を行います。

### スキル1: diff-to-pr

**パス**: `/ai:diff-to-pr`（スキル呼び出し）

**Trigger条件**:
タスク完了後のPR作成

**実行方法**:

```bash
# diff-to-pr スキルを呼び出し
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

---

## 参照資料

| 参照資料       | パス                                       | 内容       |
| -------------- | ------------------------------------------ | ---------- |
| 全Phase成果物  | `outputs/phase-*/`                         | 全成果物   |
| Phase 12成果物 | `outputs/phase-12/implementation-guide.md` | 実装ガイド |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                | 内容        |
| -------- | ------------------------------------------------------------------- | ----------- |
| Git運用  | `.claude/skills/aiworkflow-requirements/references/git-workflow.md` | Git運用方針 |
| CI/CD    | `.claude/skills/aiworkflow-requirements/references/ci-cd.md`        | CI/CD方針   |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "PR"`

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## タスク完了フロー

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書は残す
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## PR作成手順

### 1. 変更確認

```bash
# 変更差分確認
git status
git diff --stat
```

### 2. コミット

```bash
# 変更をステージング
git add .

# コミット（/ai:diff-to-prが自動生成）
git commit -m "feat(chat): チャット内LLMモデル切り替え機能を追加

- LLM選択UIコンポーネントを追加
- マルチLLMアダプターを実装
- 会話履歴の統合管理を実装
- 各メッセージにLLM表示を追加

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 3. プッシュ

```bash
git push origin feature/task-chat-multi-llm-switching
```

### 4. PR作成

```bash
gh pr create \
  --title "feat(chat): チャット内LLMモデル切り替え機能" \
  --body "## Summary
- チャット内でLLMを動的に切り替え可能に
- 会話履歴とシステムプロンプトの維持
- 各メッセージにLLMラベル表示

## Test plan
- [ ] LLM選択UIの動作確認
- [ ] LLM切り替え後の会話履歴維持確認
- [ ] システムプロンプト維持確認
- [ ] エラーハンドリング確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## タスク完了処理

### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/chat-multi-llm-switching/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep chat-multi-llm-switching

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): chat-multi-llm-switchingをcompleted-tasksに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 | 結果 |
| --- | -------------------------------------------------- | ---- | ---- |
| 1   | PRが作成されている                                 | ✅   | [ ]  |
| 2   | CIが全て通過している                               | ✅   | [ ]  |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   | [ ]  |
| 4   | `artifacts.json` の `status` が `"completed"`      | ✅   | [ ]  |
| 5   | （該当時）未タスク指示書が作成済み                 | 条件 | [ ]  |
| 6   | **本Phase内の全作業を100%完了**                    | ✅   | [ ]  |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動済み
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. /ai:diff-to-prスキルの実行（またはgit/ghCLI手動実行）
3. PR作成
4. CI通過確認
5. タスクディレクトリのcompleted-tasks移動
6. artifacts.jsonのstatus更新
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動済み
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 13
```

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 使用スキル

- diff-to-pr: {{result}}

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}

### タスク完了処理

- タスクディレクトリ移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}

### タスク全体の振り返り

- 総実行時間:
- 発生した問題:
- 学んだこと:
- 改善提案:
```

---

## タスク完了

🎉 **全Phase完了後、PRがマージされたらこのタスクは完了です！**

お疲れ様でした。
