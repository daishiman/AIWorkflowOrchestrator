# Phase 13: PR作成・CI確認

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| Phase        | 13                                                    |
| タスクID     | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名     | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| タスク種別   | NON_VISUAL                                            |
| ステータス   | ブロック中（ユーザー承認待ち）                        |
| 作成日       | 2026-04-20                                            |
| 前Phase      | 12: ドキュメント更新                                  |
| GitHub Issue | #2315                                                 |

---

## 目的

Phase 1〜12 で実装・検証・ドキュメント化した Late Chunking EmbeddingPipeline 統合を、
PR として main ブランチへマージする。

---

## 実行条件（前提条件）

**ユーザーの明示的な承認を得た後に実施すること。**

- Phase 10 の最終レビューが PASS していること
- Phase 11 の手動テストが完了していること（全シナリオ実行済み・discovered-issues 記録済み）
- Phase 12 の全ドキュメントが揃っていること
- `outputs/phase-9/quality-check-result.md` で全品質チェックが PASS していること

---

## ブロック理由

ユーザーの明示承認待ち。PR はユーザー指示があるまで作成しない。

---

## 実行タスク

1. ユーザー承認の有無を確認し、未承認なら `blocked` を維持する。
2. 承認後にブランチ作成・コミット・プッシュ・PR 作成・CI 確認を順に実行する。
3. `outputs/phase-13/` にローカルチェック結果、変更概要、PR 情報、PR 作成結果を記録する。

### PR 作成手順（承認後）

### Step 1: ブランチ作成

```bash
git checkout -b feat/emb-late-chunking-pipeline-integration-001
```

### Step 2: 変更のステージングとコミット

```bash
git add \
  packages/shared/src/services/embedding/pipeline/types.ts \
  packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts \
  packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts

git commit -m "feat(embedding): TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 EmbeddingPipelineへのLate Chunking統合と設定導線追加"
```

### Step 3: リモートへプッシュ

```bash
git push -u origin feat/emb-late-chunking-pipeline-integration-001
```

### Step 4: PR 作成

```bash
gh pr create \
  --title "feat(embedding): TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 EmbeddingPipeline・設定導線への正式統合" \
  --body "$(cat <<'EOF'
## 概要

- `PipelineConfig` に `lateChunking` オプション（`enabled` / `poolingStrategy` / `maxTokenLength`）を追加
- `StageTimings` に `lateChunking?: number` を追加（Late Chunking 実行時間の記録）
- `EmbeddingPipeline` に `EmbeddingService.generateChunkEmbeddings()` を使う Stage 2.5 分岐を追加
- 後方互換性を保証（`lateChunking` 未設定 = 従来動作と同一）

## テスト

- PI-01〜PI-08 の全統合テストが PASS
- 既存テストへの回帰なし
- TypeScript 型チェック・ESLint エラーゼロ

## 参照資料

Closes #2315

🤖 Generated with Claude Code
EOF
)"
```

### Step 5: CI 確認

```bash
# CI ステータスの確認
gh run list --branch feat/emb-late-chunking-pipeline-integration-001
```

CI 確認チェックリスト:

- [ ] typecheck: PASS
- [ ] lint: PASS
- [ ] test（vitest）: PASS
- [ ] build: PASS

---

## PR チェックリスト

### 作成前確認

- [ ] ユーザーの明示的な承認を得た
- [ ] Phase 10 最終レビューが PASS
- [ ] Phase 11 手動テストが完了（全シナリオ実行済み）
- [ ] Phase 12 全ドキュメントが揃っている（`outputs/phase-12/` 配下）
- [ ] ローカルで `pnpm --filter @repo/shared typecheck` がエラーゼロ
- [ ] ローカルで `pnpm --filter @repo/shared lint` がエラーゼロ
- [ ] ローカルで `pnpm --filter @repo/shared test` が全 PASS

### PR 作成後確認

- [ ] PR が Issue #2315 にリンクされている（`Closes #2315` の記載）
- [ ] PR のタイトルがコミットメッセージ規約に準拠している
- [ ] CI 全ジョブが PASS している
- [ ] レビュアーが指定されている

---

## ブロック中の最低限の記録

ユーザーの明示承認がない限り、本 Phase はブロックのままとする。
ブロック中でも以下を `outputs/phase-13/` に記録する:

| 成果物               | パス                                     | 内容                                            |
| -------------------- | ---------------------------------------- | ----------------------------------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | PR 作成前に確認済みのローカルチェック要約       |
| 変更概要             | `outputs/phase-13/change-summary.md`     | 変更概要と対象ファイル群                        |
| PR 情報              | `outputs/phase-13/pr-info.md`            | 想定タイトル・想定本文・base/head・ブロック理由 |
| PR 作成結果          | `outputs/phase-13/pr-creation-result.md` | 未作成であること・承認待ちで止めたこと          |

---

## 成果物

| 成果物           | パス                                     | 内容                            |
| ---------------- | ---------------------------------------- | ------------------------------- |
| ローカルチェック | `outputs/phase-13/local-check-result.md` | ローカル品質確認の要約          |
| 変更概要         | `outputs/phase-13/change-summary.md`     | 変更内容と対象ファイルの一覧    |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR タイトル・本文・ブランチ情報 |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | PR URL または承認待ち記録       |

## 統合テスト連携

- Phase 9 と Phase 11 の証跡を PR 本文に要約する。
- user approval 未取得時は `blocked` のまま進めない。

---

## 完了条件

- [ ] ユーザーの明示的な承認を得た
- [ ] ブランチ `feat/emb-late-chunking-pipeline-integration-001` が作成されている
- [ ] コミットメッセージが規約に準拠している
- [ ] PR が作成されている
- [ ] PR に `Closes #2315` が記載されている
- [ ] CI 全ジョブ（typecheck / lint / test / build）が PASS している
- [ ] レビュアーが指定されている
- [ ] `outputs/phase-13/` 配下の4ファイルが生成されている

---

## タスク100%実行確認【必須】

- [ ] ユーザー承認の確認（未承認の場合はブロック状態を記録して停止）
- [ ] ブランチ作成・コミット・プッシュを実行した
- [ ] PR を作成し、URL を記録した
- [ ] CI ステータスを確認し、全 PASS を記録した
- [ ] `outputs/phase-13/` 配下の全成果物が生成されている
