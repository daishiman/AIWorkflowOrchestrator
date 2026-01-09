# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 前提Phase  | Phase 12 (ドキュメント更新) |
| 後続Phase  | -（完了）                   |
| ステータス | 未実施                      |
| 作成日     | 2026-01-08                  |
| 機能名     | CONV-05-02-history-service  |

---

## 目的

変更をコミット・プッシュし、PRを作成してCI確認を行う。

## 背景

全Phaseが完了した状態で、変更を本番ブランチにマージするためのPRを作成する。

---

## 使用スキル

> このPhaseでは `/ai:diff-to-pr` スキルを使用してPR作成を行います。

### diff-to-pr スキルの使用

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

| 参照資料      | パス                                       | 内容                   |
| ------------- | ------------------------------------------ | ---------------------- |
| 実装コード    | `packages/shared/src/services/history/`    | PR対象コード           |
| 実装ガイド    | `outputs/phase-12/implementation-guide.md` | 変更内容のドキュメント |
| 全Phase成果物 | `outputs/phase-*/`                         | 全成果物               |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## PR作成フロー

```
Phase 13: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）元タスク指示書を削除
    ↓
（該当する場合）Phase 12で作成した新規未タスク指示書が存在確認
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## タスク完了時の移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/CONV-05-02-history-service/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep CONV-05-02

# 3. 元タスク指示書を削除（該当する場合）
rm docs/30-workflows/unassigned-task/task-05-02-history-service.md

# 4. 削除を確認
ls docs/30-workflows/unassigned-task/ | grep task-05-02 || echo "削除完了"

# 5. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): CONV-05-02-history-serviceをcompleted-tasksに移動、元タスク指示書を削除"
git push
```

> **注意**: 元タスク指示書（`task-05-02-history-service.md`）はタスク完了時に削除します。
> Phase 12で検出・作成した**新規**未タスク指示書は削除しないでください。

---

## 完了条件チェックリスト

| #   | 項目                                                 | 必須 |
| --- | ---------------------------------------------------- | ---- |
| 1   | PRが作成されている                                   | ✅   |
| 2   | CIが全て通過している                                 | ✅   |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み   | ✅   |
| 4   | `artifacts.json` の `status` が `"completed"`        | ✅   |
| 5   | （該当時）元タスク指示書が削除済み                   | 条件 |
| 6   | （該当時）Phase 12で作成した新規未タスク指示書が存在 | 条件 |
| 7   | **本Phase内の全作業を100%完了**                      | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### タスク完了

- completed-tasks移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

-
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/CONV-05-02-history-service/` に移動されます。
