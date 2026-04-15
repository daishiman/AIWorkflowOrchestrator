# Phase 13: PR 作成

## **【重要】ユーザーの明示的承認なしに PR を作成しないこと**

本 Phase は **blocked** 状態で開始する。commit / push / PR 作成 / CI 実行は、ユーザーから明示的な承認（"PR を作成してください" 等の指示）を受けるまで実行してはならない。

---

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 13                            |
| タスクID | TASK-CI-FUTURE-002            |
| タスク名 | test-web シャード化           |
| 作成日   | 2026-04-15                    |
| 状態     | blocked（user approval 待ち） |

## 目的

Phase 12 までの成果物を PR 化するための準備を行う。ただし、commit / push / PR 作成 / CI 実行はユーザーの明示的承認後にのみ実行する。blocked 状態の間は、PR 下書き・ローカル確認結果・変更要約の準備だけを行う。

---

## blocked 状態の理由

- ユーザーの明示指示がない限り commit / PR 作成はスコープ外である
- `task-specification-creator` の Phase 13 ルールでも、承認がない限り blocked を維持する
- CI 設定変更は本番 CI パイプラインに直接影響するため、特にユーザー確認が重要である

---

## 実行タスク

- **タスク1**: blocked 条件と approval 状態の確認
- **タスク2**: ローカル確認結果の下書き作成
- **タスク3**: 変更要約の下書き作成
- **タスク4**: PR 情報の下書き作成
- **タスク5**: approval 後の実行手順を明記

---

## 参照資料

| 資料名                    | パス                                                            | 説明               |
| ------------------------- | --------------------------------------------------------------- | ------------------ |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`                   | 変更要約の根拠     |
| Phase 12 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md`        | Phase 12 完了確認  |
| Phase 10 AC 検証記録      | `outputs/phase-10/final-review-result.md`                       | 受入基準の最終根拠 |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                        | CI PASS 確認の根拠 |
| GitHub Issue #2168        | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2168 | 関連 Issue         |

---

## PRブランチ命名規則

```
ci/TASK-CI-FUTURE-002-test-web-sharding
```

命名規則:

- プレフィックス: `ci/`（CI・ビルド設定の変更を示す）
- タスクID: `TASK-CI-FUTURE-002`
- タスク名（ケバブケース）: `test-web-sharding`

---

## PR タイトル・本文テンプレート

### PR タイトル

```
ci(TASK-CI-FUTURE-002): test-web シャード化によるCIスケーラビリティ向上
```

### PR 本文テンプレート

```markdown
## 概要

`test-web` ジョブを GitHub Actions の matrix 戦略でシャード化し、Web アプリケーションのテスト実行時間を短縮する。

## 変更内容

- `.github/workflows/ci.yml`: `test-web` ジョブに `strategy.matrix.shard` を追加
- `apps/backend/vitest.config.ts`: シャード設定（必要な場合のみ修正）

## 並列数内訳（GitHub Free Tier 上限: 20）

| ジョブ       | 並列数             |
| ------------ | ------------------ |
| test-desktop | N シャード         |
| test-web     | M シャード（新規） |
| typecheck    | 1                  |
| test-shared  | 1                  |
| e2e-desktop  | 1                  |
| **合計**     | **≤ 20**           |

## 受入基準の充足確認

- [x] AC-1: test-web ジョブが設定したシャード数に分割されて実行される
- [x] AC-2: 全シャードが CI で PASS する
- [x] AC-3: 並列数合計が GitHub Free Tier 上限 20 以内に収まる
- [x] AC-4: シャード化後の実行時間がベースラインを上回らない
- [x] AC-5: シャード数の計算根拠が文書化されている
- [x] AC-6: 変更が CI 設定ファイルのみに限定される

## 関連

- タスクID: TASK-CI-FUTURE-002
- GitHub Issue: #2168
- 親タスク: TASK-CI-OPT-001（#2174）
- 仕様書: `docs/30-workflows/task-ci-future-002-test-web-sharding/`
```

---

## 実行手順

### ステップ1: blocked 条件を確認する

- user approval が未取得であれば、Phase 13 は blocked を維持する
- `commit / push / PR` は実行しない
- blocked 理由を `outputs/phase-13/pr-info.md` に記録する

### ステップ2: ローカル確認結果を下書きする

user approval 後に実行するコマンドを下書きとして整理する。

```bash
# CI 設定ファイルの構文確認
pnpm lint

# 型チェック（CI yml は対象外だが念のため）
pnpm typecheck

# ローカルシャード実行の最終確認
pnpm --filter @repo/backend test -- --shard=1/2
pnpm --filter @repo/backend test -- --shard=2/2

# 並列数の最終確認
grep -n "shard:" .github/workflows/ci.yml
```

実行結果は `outputs/phase-13/local-check-result.md` に下書きとして残す。

### ステップ3: 変更要約を下書きする

- 変更ファイル一覧を整理する
- AC-1〜AC-6 の充足根拠を整理する
- `outputs/phase-13/change-summary.md` に要約を記録する

**変更ファイル一覧**:

| ファイル                        | 変更種別           | 変更内容                                    |
| ------------------------------- | ------------------ | ------------------------------------------- |
| `.github/workflows/ci.yml`      | 修正               | `test-web` ジョブに matrix shard 設定を追加 |
| `apps/backend/vitest.config.ts` | 修正（必要時のみ） | シャード設定の追加                          |

### ステップ4: PR 情報を下書きする

- 上記の PR タイトル・本文テンプレートを元に、実際の値を埋める
- `outputs/phase-13/pr-info.md` に下書きとして記録する
- `PR URL` と `CI 結果` は、user approval 後の実操作でのみ作成する

### ステップ5: approval 後の実行条件を明記する

user approval が得られた場合の実行手順:

```bash
# ブランチ作成
git checkout -b ci/TASK-CI-FUTURE-002-test-web-sharding

# 変更をステージング
git add .github/workflows/ci.yml
# 必要な場合のみ
git add apps/backend/vitest.config.ts

# コミット
git commit -m "ci(TASK-CI-FUTURE-002): test-web シャード化によるCIスケーラビリティ向上"

# プッシュ
git push -u origin ci/TASK-CI-FUTURE-002-test-web-sharding

# PR 作成
gh pr create \
  --title "ci(TASK-CI-FUTURE-002): test-web シャード化によるCIスケーラビリティ向上" \
  --body "$(cat outputs/phase-13/pr-info.md)"
```

- approval がない限り、この Phase は blocked のまま維持する
- blocked の間は、準備状況の集約先として `outputs/phase-13/pr-ready-report.md` を更新する

---

## CI 確認手順

PR 作成後（user approval 後のみ）に実行する CI 確認手順:

1. GitHub の Actions タブを開き、PR に対するワークフローが起動していることを確認する
2. `test-web` ジョブが matrix として N 個のシャードに分割されていることを確認する
3. 全シャードが PASS していることを確認する
4. 同時実行ジョブ数が 20 以内であることを確認する
5. 実行時間がベースラインと比較して改善されていることを確認する
6. CI 結果のスクリーンショットまたは URL を `outputs/phase-13/ci-result.md` に記録する

---

## タスク完了処理

PR マージ後（user approval 後のみ）:

1. GitHub Issue #2168 をクローズする:

```bash
gh issue close 2168 --comment "TASK-CI-FUTURE-002 が完了しました。PR #XXXX でシャード化を実装しました。"
```

2. `task-workflow-completed.md` の完了記録にマージ日・PR URL を追記する
3. `LOGS.md` を最終更新する

---

## 統合テスト連携

- Phase 12 までの結果をもって、PR 化の準備だけを行う
- CI 実行は user approval 後に限定する
- PR マージ後に main ブランチの CI が全て PASS していることを最終確認する

---

## サブタスク管理

| ID     | タスク名              | ステータス |
| ------ | --------------------- | ---------- |
| T-13-1 | blocked 条件の確認    | 未実施     |
| T-13-2 | ローカル確認の下書き  | 未実施     |
| T-13-3 | 変更要約の下書き      | 未実施     |
| T-13-4 | PR 情報の下書き       | 未実施     |
| T-13-5 | approval 後条件の明記 | 未実施     |

---

## 成果物

| 成果物                 | 配置先                                   | 形式     |
| ---------------------- | ---------------------------------------- | -------- |
| ローカル確認結果       | `outputs/phase-13/local-check-result.md` | Markdown |
| 変更要約               | `outputs/phase-13/change-summary.md`     | Markdown |
| PR 情報                | `outputs/phase-13/pr-info.md`            | Markdown |
| PR 準備レポート        | `outputs/phase-13/pr-ready-report.md`    | Markdown |
| CI 結果（approval 後） | `outputs/phase-13/ci-result.md`          | Markdown |

---

## 完了条件

- [ ] blocked 理由が明文化されていること
- [ ] user approval がない限り commit / push / PR を実行しないこと
- [ ] Phase 12 の成果物をもとに PR 下書きが作成されていること
- [ ] `outputs/phase-13/local-check-result.md` / `change-summary.md` / `pr-info.md` / `pr-ready-report.md` が作成されていること
- [ ] （approval 後）PR が作成され CI が PASS していること
- [ ] （approval 後）GitHub Issue #2168 がクローズされていること

---

## タスク 100% 実行確認【必須】

- [ ] T-13-1: blocked 条件を確認済み
- [ ] T-13-2: ローカル確認の下書きを作成済み
- [ ] T-13-3: 変更要約の下書きを作成済み
- [ ] T-13-4: PR 情報の下書きを作成済み
- [ ] T-13-5: approval 後条件を明記済み

---

## 次の Phase

なし。user approval が得られた場合のみ Phase 13 の blocked を解除し、PR 作成・CI 確認・Issue クローズを実行する。
