# Phase 11: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 11                   |
| Phase名    | PR作成               |
| 前提Phase  | Phase 10             |
| 後続Phase  | -（最終Phase）       |
| ステータス | 未実施               |
| 作成日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

全ての実装・テスト・ドキュメントをコミットし、Pull Requestを作成してCIを確認する。

## 背景

全Phaseが完了した後、変更をmainブランチにマージするためのPull Requestを作成する。

---

## 使用スキル

> このPhaseでは `/ai:create-pr` スキルを使用します。

### スキル1: ai:create-pr

**実行方法**:

```bash
# PRを作成
/ai:create-pr
```

**期待される成果物**:

- GitHub Pull Request

---

## 参照資料

| 参照資料      | パス                                                                   | 内容            |
| ------------- | ---------------------------------------------------------------------- | --------------- |
| 全Phase成果物 | `outputs/`                                                             | 全Phaseの成果物 |
| 元タスク仕様  | `docs/30-workflows/unassigned-task/task-04-04-diskann-vector-index.md` | 完了条件        |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-11/pr-info.md` | PR URL・CI結果 |

---

## 完了条件

- [ ] 全変更がコミットされている
- [ ] ブランチがリモートにプッシュされている
- [ ] Pull Requestが作成されている
- [ ] CIが全てパスしている
- [ ] PR情報が記録されている

---

## 依存関係

- **前提**: 全Phase (1-10) が完了していること
- **後続**: なし（マージ待ち）

---

## 実行手順

### 1. コミット準備

```bash
# 変更状態を確認
git status

# 変更差分を確認
git diff
```

### 2. コミット

```bash
# 全変更をステージング
git add .

# コミット（メッセージ例）
git commit -m "feat(shared): DiskANN ベクトルインデックス設定を実装

- embeddingsテーブルをDrizzleスキーマで定義
- ベクトルインデックス作成/削除/再構築機能を追加
- コサイン類似度/ユークリッド距離/内積検索を実装
- Float32Array ⇔ Blob 変換を実装
- バッチ挿入（100件単位）を実装
- chunksテーブルとのリレーションを定義
- マイグレーション(0006)を追加
- 単体テストを追加

Refs: CONV-04-04

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 3. プッシュ

```bash
# リモートにプッシュ
git push -u origin task-20260104-165509-wt1
```

### 4. PR作成

```bash
# gh CLI でPR作成
gh pr create --title "feat(shared): DiskANN ベクトルインデックス設定を実装" --body "$(cat <<'EOF'
## Summary

- embeddingsテーブルをDrizzleスキーマで定義
- ベクトルインデックス作成/削除/再構築機能を追加
- コサイン類似度/ユークリッド距離/内積検索を実装
- Float32Array ⇔ Blob 変換を実装
- バッチ挿入（100件単位）を実装

## Related Issue

- CONV-04-04: DiskANN ベクトルインデックス設定
- 依存: CONV-04-03 (content_chunks テーブル + FTS5)

## Changes

### New Files
- `packages/shared/src/db/schema/embeddings.ts`
- `packages/shared/src/db/schema/vector-index.ts`
- `packages/shared/src/db/queries/vector-search.ts`
- `packages/shared/src/db/migrations/0006_create_embeddings_table.sql`
- `packages/shared/src/db/schema/__tests__/embeddings.test.ts`

### Modified Files
- `packages/shared/src/db/schema/relations.ts`

## Test Plan

- [ ] 全ユニットテストがパス
- [ ] 型チェックがパス
- [ ] Lintがパス
- [ ] マイグレーションが正常に実行できる
- [ ] ベクトル検索が期待通り動作する

## Performance

| データ規模 | 目標時間 |
| ---------- | -------- |
| < 10,000件 | < 50ms   |
| 10,000-100,000件 | < 100ms |
| > 100,000件 | < 200ms |

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 5. CI確認

- [ ] lint チェックがパス
- [ ] typecheck がパス
- [ ] test がパス
- [ ] build がパス

---

## CI失敗時の対応

| CI項目    | 失敗時の対応                           |
| --------- | -------------------------------------- |
| lint      | `pnpm lint --fix` で修正後、再コミット |
| typecheck | 型エラーを修正後、再コミット           |
| test      | テスト修正後、再コミット               |
| build     | ビルドエラーを修正後、再コミット       |

---

## 完了後

1. PRのURLを `outputs/phase-11/pr-info.md` に記録
2. レビュー依頼（必要に応じて）
3. マージ待ち

---

## 次のタスク

このタスク完了後、以下のタスクが実装可能になる:

- CONV-06-02: 埋め込みプロバイダー抽象化
- CONV-07-03: ベクトル検索戦略 (DiskANN)
