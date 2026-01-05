# Phase 11: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 11                         |
| Phase名    | PR作成                     |
| 前提Phase  | Phase 10                   |
| 後続Phase  | -                          |
| ステータス | 未実施                     |
| 作成日     | 2026-01-04                 |
| 機能名     | Knowledge Graph テーブル群 |

---

## 目的

実装内容をPull Requestとして提出し、CIを通過させる。

## 背景

全フェーズが完了し、マージ準備が整った状態でPRを作成。

---

## PR作成手順

### 1. 変更確認

```bash
# 変更ファイル確認
git status

# 差分確認
git diff main
```

### 2. コミット

```bash
# ステージング
git add packages/shared/src/db/schema/graph/

# コミット
git commit -m "feat(shared): Knowledge Graph テーブル群を実装

- entities テーブル（エンティティ/ノード）
- relations テーブル（関係/エッジ）
- relationEvidence テーブル（関係の証拠）
- communities テーブル（Leidenコミュニティ）
- entityCommunities 中間テーブル
- chunkEntities 中間テーブル
- Drizzleリレーション定義

GraphRAGの基盤となるスキーマを追加。
CONV-04-01（Drizzle ORM セットアップ）に依存。

🤖 Generated with Claude Code"
```

### 3. プッシュ

```bash
git push -u origin <branch-name>
```

### 4. PR作成

```bash
gh pr create --title "feat(shared): Knowledge Graph テーブル群を実装" --body "## Summary

- Knowledge Graph（エンティティ、関係、コミュニティ）を永続化するテーブル群を実装
- GraphRAGの基盤となるスキーマ

## 変更内容

- entities テーブル（エンティティ/ノード）
- relations テーブル（関係/エッジ）
- relationEvidence テーブル（関係の証拠）
- communities テーブル（Leidenコミュニティ）
- entityCommunities 中間テーブル
- chunkEntities 中間テーブル
- Drizzleリレーション定義

## テスト

- [ ] 全ユニットテスト通過
- [ ] マイグレーション動作確認

## 依存関係

- CONV-04-01: Drizzle ORM セットアップ

## Test plan

- ローカルでのテスト実行確認
- マイグレーション生成・適用確認
- CIパス確認

🤖 Generated with Claude Code"
```

### 5. CI確認

- [ ] GitHub Actionsが正常に実行される
- [ ] 全CIジョブがパスする
- [ ] レビュー依頼を送信

---

## 参照資料

| 参照資料   | パス          | 内容     |
| ---------- | ------------- | -------- |
| Phase 1-10 | 各Phase成果物 | 全成果物 |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-11/pr-info.md` | PRリンクと情報 |

---

## 完了条件

- [ ] コミットが完了している
- [ ] プッシュが完了している
- [ ] PRが作成されている
- [ ] CIがパスしている
- [ ] PR情報が記録されている

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: マージ待ち

---

## スキルフィードバック記録（Phase完了後に記入）

```markdown
## Phase 11 実行記録

### PR情報

- PR URL: (URL)
- CI結果: PASS/FAIL
- レビュー状態: (状態)

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

-
```

---

## タスク完了

これでタスク CONV-04-05 の全フェーズが完了しました。

PRがマージされたら、`docs/30-workflows/conv-04-05-knowledge-graph-tables/index.md` のステータスを「完了」に更新してください。
