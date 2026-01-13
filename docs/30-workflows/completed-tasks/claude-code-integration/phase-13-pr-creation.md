# Phase 13: PR作成

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 13                      |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

実装内容をPull Requestとして作成し、マージ準備を完了する。

## 実行タスク

- ローカル確認: ビルド・テスト・型チェック・Lintの事前確認
- コミット整理: 論理的な単位でのコミット整理
- PR作成: `/ai:diff-to-pr` でPR作成（ユーザー許可後）
- CI確認: 自動テスト・Lint通過確認
- タスク完了処理: completed-tasksへの移動

## 参照資料

### 全Phase成果物

全Phaseの成果物を参照し、変更内容を把握する。

---

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## ローカル確認チェックリスト【PR作成前に必須】

PR作成前に以下を**必ず**確認すること:

| #   | 確認項目                       | コマンド例                          | 確認 |
| --- | ------------------------------ | ----------------------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm --filter @repo/desktop build` | [ ]  |
| 2   | 全テストがパスする             | `pnpm --filter @repo/desktop test`  | [ ]  |
| 3   | 型チェックがパスする           | `pnpm typecheck`                    | [ ]  |
| 4   | Lintエラーがない               | `pnpm lint`                         | [ ]  |
| 5   | 実際の動作確認（該当する場合） | `pnpm --filter @repo/desktop dev`   | [ ]  |

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

## PR作成手順（手動で行う場合）

### 1. ブランチ確認

```bash
# 現在のブランチ確認
git branch

# mainとの差分確認
git log main..HEAD --oneline
```

### 2. コミット整理（必要に応じて）

論理的な単位でコミットを整理:

- 型定義の追加
- HooksFactory実装
- PermissionRules実装
- AgentExecutor実装
- ExecutionManager実装
- IPCハンドラー拡張
- テスト追加
- ドキュメント追加

### 3. PR作成

```bash
gh pr create --title "feat(agent): Claude Agent SDK統合 (AGENT-005)" --body "$(cat <<'EOF'
## 概要

Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) をElectronアプリに統合し、
スキル実行エンジンとしてSDKの`query()` APIを利用できるようにしました。

## 変更内容

### 新規追加
- `HooksFactory`: PreToolUse/PostToolUse/PermissionRequest Hooks生成
- `PermissionRules`: 宣言的権限ルールの評価
- `AgentExecutor`: SDK query() API呼び出し・ストリーミング処理
- `ExecutionManager`: 複数実行管理・キャンセル・Permission解決

### IPC通信
- `agent:start` / `agent:stop` / `agent:stop-all`: 実行制御
- `agent:stream` / `agent:status`: ストリーミング・ステータス通知
- `agent:permission` / `agent:permission:res`: Permission連携

### セキュリティ
- 危険コマンド検出（rm -rf, sudo, chmod 777, dd if=）
- システムディレクトリ保護（/etc/**, /usr/**, /var/**）
- パストラバーサル防止

## テスト

- [ ] ユニットテスト: `pnpm --filter @repo/desktop test`
- [ ] 統合テスト: `pnpm --filter @repo/desktop test:integration`
- [ ] カバレッジ: Line 80%+, Branch 60%+, Function 80%+

## チェックリスト

- [ ] コードが既存のスタイルガイドに従っている
- [ ] セルフレビューを実施した
- [ ] 変更に対するテストを追加した
- [ ] ドキュメントを更新した
- [ ] 破壊的変更がない（または明記している）

## 関連Issue

closes #XXX

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 4. CI確認

PRを作成後、以下のCIジョブが通過することを確認:

| ジョブ        | 確認内容            |
| ------------- | ------------------- |
| lint          | ESLintエラー0件     |
| typecheck     | TypeScriptエラー0件 |
| test          | 全テストパス        |
| test:coverage | カバレッジ基準達成  |
| build         | ビルド成功          |

```bash
# CI状況確認
gh pr checks
```

### 5. レビュー依頼

```bash
# レビュアー追加
gh pr edit --add-reviewer @reviewer-username
```

---

## タスクディレクトリ移動

CI通過後、タスクディレクトリを `completed-tasks/` に移動する:

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/claude-code-integration/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep claude-code-integration

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): claude-code-integrationをcompleted-tasksに移動"
git push
```

---

## 統合テスト連携【必須】

PR作成時の統合テスト確認:

| 確認項目           | 検証内容                                  | 確認 |
| ------------------ | ----------------------------------------- | ---- |
| CI統合テスト       | CIで統合テストが実行・パスしているか      | [ ]  |
| IPC通信テスト結果  | agent:\* チャネルのテストがパスしているか | [ ]  |
| Permission連携     | ダイアログ連携テストがパスしているか      | [ ]  |
| エラーハンドリング | 異常系テストがパスしているか              | [ ]  |

---

## 成果物

| 成果物     | パス                             | 説明       |
| ---------- | -------------------------------- | ---------- |
| PR URL     | GitHub PR URL                    | 作成したPR |
| PRサマリー | `outputs/phase-13/pr-summary.md` | PR概要     |

---

## 完了条件チェックリスト

| #   | 項目                                                     | 必須 | 確認 |
| --- | -------------------------------------------------------- | ---- | ---- |
| 1   | **ローカルでビルド・テスト・型チェック・Lintが全てパス** | ✅   | [ ]  |
| 2   | **ユーザーにPR作成の許可を確認済み**                     | ✅   | [ ]  |
| 3   | PRが作成されている                                       | ✅   | [ ]  |
| 4   | PR説明文が適切に記載されている                           | ✅   | [ ]  |
| 5   | 全CIジョブがパスしている                                 | ✅   | [ ]  |
| 6   | 統合テストがCIでパスしている                             | ✅   | [ ]  |
| 7   | レビュー依頼が完了している                               | ✅   | [ ]  |
| 8   | タスクディレクトリが `completed-tasks/` に移動済み       | ✅   | [ ]  |
| 9   | `artifacts.json` の `status` が `"completed"`            | ✅   | [ ]  |
| 10  | （該当時）未タスク指示書が削除済み                       | 条件 | [ ]  |
| 11  | **本Phase内の全タスクを100%完了**                        | ✅   | [ ]  |

---

## タスク完了

Phase 13の完了をもって、AGENT-005: Claude Agent SDK統合タスクの実装が完了となる。

### 完了報告

```bash
# artifacts.json更新
node .claude/skills/task-specification-creator/scripts/update-artifacts.mjs docs/30-workflows/claude-code-integration --status completed
```
