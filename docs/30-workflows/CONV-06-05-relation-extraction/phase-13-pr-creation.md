# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 13                             |
| Phase名    | PR作成                         |
| 前提Phase  | Phase 12                       |
| 後続Phase  | -（完了）                      |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

変更をコミットし、Pull Requestを作成してCI通過を確認する。

## 背景

全ての開発作業が完了した後、変更をGitにコミットし、PRを作成してレビュー・マージの準備を行う。

---

## 使用スキル

このPhaseでは `/ai:diff-to-pr` スキルを使用する。

```
/ai:diff-to-pr
```

---

## 参照資料

| 参照資料      | パス                                                        | 内容     |
| ------------- | ----------------------------------------------------------- | -------- |
| 全Phase成果物 | `docs/30-workflows/CONV-06-05-relation-extraction/outputs/` | 全成果物 |
| 実装コード    | `packages/shared/src/services/extraction/`                  | 実装     |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI状態 |

---

## 実行手順

### 1. 変更の確認

```bash
# 変更ファイルの確認
git status

# 差分の確認
git diff

# 追加されたファイルの確認
git ls-files --others --exclude-standard
```

### 2. /ai:diff-to-pr の実行

Claude Code内で以下のスラッシュコマンドを実行:

```
/ai:diff-to-pr
```

このスキルが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### 3. CI通過確認

- [ ] GitHub ActionsのCIが全てパス
- [ ] Lintチェックが成功
- [ ] TypeScript型チェックが成功
- [ ] テストが全て成功

---

## タスク完了処理

CI通過後、以下の完了処理を行う:

### 1. タスクディレクトリの移動

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/CONV-06-05-relation-extraction/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep CONV-06-05
```

### 2. 元の未タスク指示書の削除（該当する場合）

```bash
# 元の未タスク指示書を削除
rm docs/30-workflows/unassigned-task/task-06-05-relation-extraction.md
```

### 3. 変更をコミット

```bash
git add docs/30-workflows/
git commit -m "docs(workflows): CONV-06-05-relation-extractionをcompleted-tasksに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 | 状態 |
| --- | -------------------------------------------------- | ---- | ---- |
| 1   | PRが作成されている                                 | ✅   | -    |
| 2   | CIが全て通過している                               | ✅   | -    |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   | -    |
| 4   | `artifacts.json` の `status` が `"completed"`      | ✅   | -    |
| 5   | 元の未タスク指示書が削除済み                       | 条件 | -    |
| 6   | 本Phase内の全作業を100%完了                        | ✅   | -    |

---

## artifacts.json の最終更新

```json
{
  "status": "completed",
  "completedAt": "{{ISO_TIMESTAMP}}",
  "prUrl": "{{PR_URL}}",
  "phases": {
    "13": {
      "status": "completed",
      "completedAt": "{{ISO_TIMESTAMP}}",
      "artifacts": [
        {
          "type": "document",
          "path": "outputs/phase-13/pr-info.md",
          "description": "PR情報"
        }
      ]
    }
  }
}
```

---

## Phase末端アクション【必須】

- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（ワークフロー完了）

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更の確認
2. /ai:diff-to-pr の実行
3. CI通過確認
4. タスク完了処理（ディレクトリ移動）
5. artifacts.json最終更新
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 13
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: [URL]
- CI状態: [成功/失敗]

### 完了処理

- タスクディレクトリ移動: [完了/未完了]
- artifacts.json更新: [完了/未完了]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:
```

---

## ワークフロー完了

このPhaseが完了すると、CONV-06-05（関係抽出サービス）のタスクは完了となります。

### 次のタスク

- CONV-08-01: Knowledge Graph ストア実装
