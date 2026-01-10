# Phase 13: PR作成 & タスク完了処理

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 13                    |
| 機能名 | history-ui-components |
| 作成日 | 2026-01-10            |

## 目的

実装をmainブランチにマージするためのPull Requestを作成し、CI通過後にタスクを完了状態にする。

---

## タスク完了フロー

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

## 事前確認

### 必須チェック

| チェック項目   | コマンド/確認方法                              | 結果 |
| -------------- | ---------------------------------------------- | ---- |
| ビルド成功     | `pnpm --filter @repo/desktop build`            | -    |
| テスト成功     | `pnpm --filter @repo/desktop test`             | -    |
| Lint成功       | `pnpm --filter @repo/desktop lint`             | -    |
| 型チェック成功 | `pnpm --filter @repo/desktop typecheck`        | -    |
| 統合テスト成功 | `pnpm --filter @repo/desktop test:integration` | -    |

### コミット整理

```bash
# コミット履歴の確認
git log --oneline main..HEAD

# 必要に応じてrebase
git rebase -i main
```

---

## `/ai:diff-to-pr` スキルの使用【必須】

Phase 13では `/ai:diff-to-pr` スキルを使用してPR作成を行う:

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

## PR内容

### タイトル

```
feat(history): 履歴/ログ表示UIコンポーネント実装 (#CONV-05-03)
```

### 説明テンプレート

```markdown
## 概要

履歴/ログ表示UIコンポーネント（CONV-05-03）を実装しました。

## 変更内容

### 新規コンポーネント

- `VersionHistory`: 履歴一覧表示コンポーネント
- `VersionDetail`: バージョン詳細表示コンポーネント
- `ConversionLogs`: 変換ログ表示コンポーネント
- `RestoreDialog`: 復元確認ダイアログ

### 新規フック

- `useVersionHistory`: 履歴一覧取得フック
- `useVersionDetail`: バージョン詳細取得フック
- `useConversionLogs`: 変換ログ取得フック
- `useRestore`: バージョン復元フック

## 関連タスク

- Closes #CONV-05-03
- Depends on: #CONV-05-01, #CONV-05-02

## テスト

- [x] ユニットテスト追加
- [x] 統合テスト追加
- [x] 手動テスト実施

## チェックリスト

- [x] テストが全て成功している
- [x] Lintエラーがない
- [x] 型エラーがない
- [x] ドキュメントを更新した
- [x] CHANGELOGを更新した

## スクリーンショット

（該当する場合）
```

---

## 実行手順

### ステップ1: 事前確認

```bash
# ビルド確認
pnpm --filter @repo/desktop build

# テスト確認
pnpm --filter @repo/desktop test

# Lint確認
pnpm --filter @repo/desktop lint

# 型チェック確認
pnpm --filter @repo/desktop typecheck
```

### ステップ2: PR作成（/ai:diff-to-prを使用）

```bash
# /ai:diff-to-pr スキルを実行
/ai:diff-to-pr
```

または手動でPR作成:

```bash
# 変更をステージング
git add .

# コミット（必要に応じて）
git commit -m "feat(history): 履歴/ログ表示UIコンポーネント実装"

# リモートにプッシュ
git push -u origin feature/task-05-03-history-ui-components

# GitHub CLIでPR作成
gh pr create \
  --title "feat(history): 履歴/ログ表示UIコンポーネント実装 (#CONV-05-03)" \
  --body-file outputs/phase-13/pr-description.md \
  --base main
```

### ステップ3: CI通過確認

```bash
# PRのステータス確認
gh pr status

# CIの結果確認
gh pr checks
```

### ステップ4: タスクディレクトリの移動【必須】

CI通過後、タスクディレクトリをcompleted-tasksに移動する。

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/history-ui-components/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep history-ui-components

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): history-ui-componentsをcompleted-tasksに移動"
git push
```

### ステップ5: artifacts.json最終更新【必須】

```json
{
  "status": "completed",
  "completedAt": "{{ISO_TIMESTAMP}}"
}
```

---

## 統合テスト連携【必須】

PR作成時の最終確認:

| 確認項目           | 検証内容                       | 結果 |
| ------------------ | ------------------------------ | ---- |
| CI/CD成功          | GitHub Actionsが全て成功       | -    |
| 統合テスト         | CIでの統合テストが成功         | -    |
| コードレビュー準備 | レビュアーがアサインされている | -    |

---

## 成果物

| 成果物       | パス                                   | 説明         |
| ------------ | -------------------------------------- | ------------ |
| PR説明文     | `outputs/phase-13/pr-description.md`   | PR本文       |
| チェック結果 | `outputs/phase-13/pre-merge-checks.md` | 事前確認結果 |
| PR URL       | （GitHub上）                           | 作成されたPR |

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 |
| --- | -------------------------------------------------- | ---- |
| 1   | PRが作成されている                                 | ✅   |
| 2   | CIが全て通過している                               | ✅   |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   |
| 4   | `artifacts.json` の `status` が `"completed"`      | ✅   |
| 5   | （該当時）未タスク指示書が削除済み                 | 条件 |
| 6   | **本Phase内の全作業を100%完了**                    | ✅   |

---

## 完了条件

- [ ] 全ての事前チェックが成功している
- [ ] `/ai:diff-to-pr`スキルを使用してPRが作成されている
- [ ] PR説明が適切に記載されている
- [ ] CIが成功している
- [ ] レビュアーがアサインされている
- [ ] タスクディレクトリが`completed-tasks/`に移動されている
- [ ] `artifacts.json`の`status`が`"completed"`に更新されている
- [ ] **本Phase内の全作業を100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ビルド確認
2. テスト確認
3. Lint確認
4. 型チェック確認
5. 統合テスト確認
6. コミット整理
7. PR説明文作成
8. /ai:diff-to-prでPR作成
9. CIステータス確認
10. タスクディレクトリをcompleted-tasksに移動
11. artifacts.jsonのstatus更新

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PR説明文ドキュメントが生成されている
- [ ] artifacts.jsonが`"status": "completed"`に更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-components --phase 13
```

---

## タスク完了

このPhaseが完了すると、CONV-05-03タスクは完了となります。
PRがマージされ次第、依存タスクの開発が可能になります。

**タスクディレクトリ最終配置先**: `docs/30-workflows/completed-tasks/history-ui-components/`
