# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| 前提Phase  | Phase 12                   |
| 後続Phase  | なし（最終Phase）          |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

実装内容をPull Requestとして作成し、コードレビューを依頼する。
PR作成・CI通過後、タスクディレクトリを完了タスクフォルダに移動する。

## 背景

すべての開発フェーズが完了したため、mainブランチへのマージに向けてPRを作成する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: /ai:diff-to-pr

**パス**: `/ai:diff-to-pr` スラッシュコマンド

**選定理由**: PR作成を自動化するため

**Trigger条件**:
変更差分からPRを作成する場合に使用

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

**期待される成果物**:

- GitHub Pull Request
- PR URL

---

## 参照資料

| 参照資料             | パス                                         | 内容           |
| -------------------- | -------------------------------------------- | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1成果物  |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物  |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update.md`   | Phase 12成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`     | Phase 11成果物 |

---

## タスク完了フロー【必須】

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
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

## PR作成手順

### 1. 最終確認

```bash
# ブランチの確認
git branch

# 変更ファイルの確認
git status

# コミット履歴の確認
git log --oneline -10

# テスト実行
pnpm --filter @repo/desktop test

# ビルド確認
pnpm --filter @repo/desktop build
```

### 2. /ai:diff-to-pr でPR作成

```bash
# diff-to-pr スキルを呼び出し
/ai:diff-to-pr
```

### 3. CI通過確認

```bash
# CIステータス確認
gh pr checks
```

### 4. タスク完了処理【必須】

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/agent-dashboard-foundation/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep agent-dashboard-foundation

# 3. （該当する場合）未タスク指示書の元ファイルを削除
# rm docs/30-workflows/unassigned-task/task-agent-01-dashboard-foundation.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): agent-dashboard-foundationをcompleted-tasksに移動"
git push
```

---

## PRテンプレート

```markdown
## Summary

- AppDockにAgentメニューを追加
- AgentView基盤コンポーネントを実装
- agentSlice（Zustand）を実装
- IPCチャネル定義を追加

## Related Issues

- Closes #XXX（該当するIssueがあれば）

## Changes

### 新規追加

- `apps/desktop/src/renderer/views/AgentView/` - Agentビューコンポーネント
- `apps/desktop/src/renderer/store/slices/agentSlice.ts` - Agent状態管理
- `apps/desktop/src/shared/constants/channels.ts` - IPCチャネル追加

### 変更

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts` - ViewType拡張
- `apps/desktop/src/renderer/components/AppDock/index.tsx` - Agentメニュー追加

## Test Plan

- [x] ユニットテスト実行（agentSlice.test.ts）
- [x] コンポーネントテスト実行（AgentView.test.tsx）
- [x] 統合テスト実行
- [x] 手動テスト実行（画面遷移、状態管理）
- [x] カバレッジ確認（Line 80%+, Branch 60%+）

## Screenshots

（手動テスト時のスクリーンショットを添付）

## Checklist

- [x] テストがすべてパスしている
- [x] 型エラーがない
- [x] リントエラーがない
- [x] ドキュメントが更新されている
- [x] 手動テストが完了している

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 成果物

| 成果物 | パス                             | 内容           |
| ------ | -------------------------------- | -------------- |
| PR URL | `outputs/phase-13/pr-url.md`     | 作成したPR URL |
| PR情報 | `outputs/phase-13/pr-summary.md` | PRサマリー     |

---

## 完了条件チェックリスト【必須】

| #   | 項目                                               | 必須 |
| --- | -------------------------------------------------- | ---- |
| 1   | PRが作成されている                                 | ✅   |
| 2   | CIが全て通過している                               | ✅   |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   |
| 4   | `artifacts.json` の `status` が `"completed"`      | ✅   |
| 5   | （該当時）未タスク指示書が削除済み                 | 条件 |
| 6   | **本Phase内の全作業を100%完了**                    | ✅   |

---

## Phase末端アクション【必須】

- [ ] /ai:diff-to-pr でPRを作成
- [ ] CI通過を確認
- [ ] タスクディレクトリを completed-tasks/ に移動
- [ ] PR URLを記録
- [ ] artifacts.jsonを更新（タスク完了ステータス）

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{url}}
- PR番号: #{{number}}
- ベースブランチ: main
- 対象ブランチ: feature/agent-dashboard-foundation

### タスク完了処理

- [ ] PR作成完了
- [ ] CI通過確認
- [ ] completed-tasks/への移動完了
- [ ] artifacts.json更新完了

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### タスク完了記録

- タスクID: AGENT-001
- 完了日時: {{datetime}}
- 総所要時間: {{duration}}
```

---

## タスク完了

このPhaseが完了すると、AGENT-001（agent-dashboard-foundation）タスクは完了となります。

### 完了後のアクション

1. `artifacts.json` のステータスを `completed` に更新
2. タスクディレクトリを `docs/30-workflows/completed-tasks/` に移動
3. 後続タスク（AGENT-002, AGENT-003）の開始条件が満たされる
4. PRがマージされたら、mainブランチに反映される

---

## artifacts.json 更新例

```json
{
  "taskId": "AGENT-001",
  "taskName": "agent-dashboard-foundation",
  "status": "completed",
  "completedAt": "{{datetime}}",
  "prUrl": "{{pr-url}}"
}
```
