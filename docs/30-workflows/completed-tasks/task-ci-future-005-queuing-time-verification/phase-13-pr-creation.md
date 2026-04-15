# Phase 13: PR作成（条件付き）

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| Phase名    | PR作成（条件付き）                 |
| 対象タスク | TASK-CI-FUTURE-005                 |
| 前提Phase  | Phase 12: ドキュメント更新         |
| ステータス | pending                            |
| 作成日     | 2026-04-15                         |
| 実施条件   | キューイング時間 > 60 秒の場合のみ |

## 実施条件の確認【必須】

**Phase 13 を実施する前に必ず確認すること**：

| 確認項目             | 状態                      |
| -------------------- | ------------------------- |
| 最大キューイング時間 | **\*\***\_\_\_**\*\*** 秒 |
| 60 秒閾値との比較    | 以内 / 超過               |
| Phase 13 実施要否    | **実施 / スキップ**       |

**キューイング時間 ≤ 60 秒の場合**: 本 Phase をスキップし、タスク完了とする。
**キューイング時間 > 60 秒の場合**: 以下の手順を実施する。

---

## 目的

キューイング時間が 60 秒超と計測された場合、シャード数を 17→16 に戻す PR を作成し、
ユーザーの明示承認後にマージする。

**重要**: ユーザーの明示承認なしにマージしてはならない。

## 実行タスク（キューイング > 60 秒の場合のみ）

- Task 1: ブランチ作成
- Task 2: `.github/workflows/ci.yml` の変更
- Task 3: 変更確認
- Task 4: コミット
- Task 5: PR 作成
- Task 6: CI 確認
- Task 7: 完了記録

### Task 1: ブランチ作成

```bash
git checkout -b fix/ci-shard-reduce-to-16
```

### Task 2: `.github/workflows/ci.yml` の変更

#### 変更箇所 1: `matrix.shard` の配列

変更前:

```yaml
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
```

変更後:

```yaml
shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

#### 変更箇所 2: `--shard` オプションの分母

変更前:

```yaml
--shard=${{ matrix.shard }}/17
```

変更後:

```yaml
--shard=${{ matrix.shard }}/16
```

**注意**: `grep "17" .github/workflows/ci.yml` で変更漏れがないことを確認すること。

### Task 3: 変更確認

```bash
# 変更内容を確認
git diff .github/workflows/ci.yml

# 17 の残存確認
grep "17" .github/workflows/ci.yml

# Lint チェック（必要な場合）
pnpm lint
```

### Task 4: コミット

```bash
git add .github/workflows/ci.yml
git commit -m "fix(ci): revert shard count from 17 to 16 due to queuing time > 60s

TASK-CI-FUTURE-005: 実測によりシャード数 17 でキューイング時間 [X] 秒超を記録。
シャード数を 16 に戻す。計測 Run ID: [run-id]"
```

### Task 5: PR 作成

```bash
gh pr create \
  --title "fix(ci): revert shard count 17→16（キューイング時間超過）" \
  --body "## 変更内容

TASK-CI-FUTURE-005 の実測結果に基づき、シャード数を 17→16 に戻す。

## 背景

- 計測 Run ID: [run-id]
- 計測日時: [日時]
- 最大キューイング時間: [X] 秒（閾値 60 秒超過）
- 判定根拠: TASK-CI-FUTURE-005 の設計書（Phase 2）に基づく

## 変更内容

- \`.github/workflows/ci.yml\`: matrix.shard を 17→16 要素に削減
- \`.github/workflows/ci.yml\`: \`--shard=N/17\` を \`--shard=N/16\` に変更

## 関連

- Closes TASK-CI-FUTURE-005（CI-M-01 解決）
- 元の変更: TASK-CI-OPT-001 PR"
```

### Task 6: CI 確認（ユーザー承認待ち）

```bash
# PR の CI 状況を確認
gh pr checks
```

**ユーザーへの報告事項**:

- PR URL: **\*\***\_\_\_**\*\***
- CI ステータス: **\*\***\_\_\_**\*\***
- マージのご承認をお願いします

### Task 7: 完了記録

`outputs/phase-13/pr-creation-result.md` に以下を記録する：

| 記録項目         | 内容                       |
| ---------------- | -------------------------- |
| PR URL           | \_\_\_                     |
| 変更ファイル     | `.github/workflows/ci.yml` |
| 変更内容サマリー | シャード数 17→16 への戻し  |
| CI ステータス    | \_\_\_                     |
| マージ承認待ち   | ユーザー承認待ち           |

## 参照資料

| 資料名                | パス                                                     |
| --------------------- | -------------------------------------------------------- |
| Phase 5 成果物        | `outputs/phase-5/measurement-result.md`                  |
| Phase 10 最終レビュー | `outputs/phase-10/final-review.md`                       |
| Phase 12 ドキュメント | `outputs/phase-12/documentation-changelog.md`            |
| Phase 12 準拠確認     | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## キューイング ≤ 60 秒の場合の完了記録

Phase 13 をスキップした場合も、以下を `outputs/phase-13/pr-creation-result.md` に記録する：

```markdown
# Phase 13: PR作成 - スキップ記録

## 実施判定

- 最大キューイング時間: [X] 秒
- 判定: シャード数 17 継続（60 秒以内）
- Phase 13: スキップ

## 理由

キューイング時間が 60 秒以内であったため、シャード数 17 を継続する。
ci.yml の変更は不要。

TASK-CI-FUTURE-005 は計測・判定完了をもって完了とする。
```

## 統合テスト連携

- 前Phase の成果物を受け取り、次Phase へ引き継ぐ
- この Phase の成果物は次Phase の検証入力になる

## 成果物

| 成果物          | パス                                     | 説明                          |
| --------------- | ---------------------------------------- | ----------------------------- |
| PR 作成結果記録 | `outputs/phase-13/pr-creation-result.md` | PR URL・CI 状況・スキップ記録 |

## 完了条件（実施の場合）

- [ ] `fix/ci-shard-reduce-to-16` ブランチが作成されている
- [ ] `.github/workflows/ci.yml` のシャード数が 16 に変更されている
- [ ] `--shard=N/17` の記述が全て `--shard=N/16` に変更されている
- [ ] Lint エラーがない
- [ ] PR が作成されている
- [ ] PR の CI が全て PASS している
- [ ] ユーザーへのマージ承認依頼が完了している
- [ ] `pr-creation-result.md` に PR URL と CI ステータスが記録されている

## 完了条件（スキップの場合）

- [ ] Phase 13 スキップの根拠（計測値 ≤ 60 秒）が記録されている
- [ ] `pr-creation-result.md` にスキップ記録が作成されている
- [ ] TASK-CI-FUTURE-005 が完了として記録されている

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了（実施 or スキップのいずれか）
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-04-15 | 初版作成 |
