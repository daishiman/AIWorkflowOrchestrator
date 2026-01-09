# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 13                       |
| Phase名    | PR作成                   |
| 前提Phase  | Phase 12                 |
| 後続Phase  | なし（ワークフロー完了） |
| ステータス | 未実施                   |
| 作成日     | 2026-01-08               |
| 機能名     | knowledge-graph-store    |

---

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。

## 背景

全Phase完了後、成果物をMainブランチにマージするためのPRを作成する。

---

## 使用スキル

> 以下のスキルを呼び出して実行してください。

### スキル1: /ai:diff-to-pr

**Trigger条件**:
PR作成が必要な場合

**実行方法**:

```
/ai:diff-to-pr
```

**期待される成果物**:

- 作成されたPR

---

## 参照資料

| 参照資料     | パス                                           | 内容           |
| ------------ | ---------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`      | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`       | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-update-log.md` | Phase 12成果物 |

---

## 実行手順

### 1. `/ai:diff-to-pr` を実行

```
/ai:diff-to-pr
```

### 2. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 3. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# 変更をステージング
git add .

# コミット
git commit -m "feat(graph): Knowledge Graphストア実装

- IKnowledgeGraphStoreインターフェース定義
- SQLiteKnowledgeGraphStore実装
- エンティティCRUD（マージ、類似検索）
- 関係CRUD（重み更新）
- グラフトラバーサル（BFS、最短パス）
- グラフ統計

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ
git push -u origin task/CONV-08-01-knowledge-graph-store

# PR作成
gh pr create --title "feat(graph): Knowledge Graphストア実装" --body "..."
```

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認）**

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/knowledge-graph-store/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep knowledge-graph-store

# 元の未タスク指示書を削除
rm docs/30-workflows/unassigned-task/task-08-01-knowledge-graph-store.md

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): knowledge-graph-storeをcompleted-tasksに移動"
git push
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%完了
- [ ] PR作成・CI確認・移動完了
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（ワークフロー完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### ワークフロー完了
```

---

## 次のPhase

なし（ワークフロー完了）
