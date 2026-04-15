# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 6                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

Phase 5 の実装後に、異常系とエッジケースを確認する。
lockfile 変更時のキャッシュ無効化・並行 PR でのキャッシュ競合・CI_MAX_FORKS=3 でのメモリ安定性・
全 17 シャードでのカバレッジ収集の 4 観点でエッジケースを網羅する。

---

## 実行タスク

- **タスク1**: lockfile が変わった場合のキャッシュ無効化確認（依存関係更新時に古い node_modules が使われないことの確認）
- **タスク2**: 並行 PR 時のキャッシュ競合確認（restore-keys のフォールバック動作確認）
- **タスク3**: CI_MAX_FORKS=3 での OOM 発生可能性チェック（NODE_OPTIONS との組み合わせ検討）
- **タスク4**: カバレッジ収集が全 17 シャードで正常に行われることの確認

---

## 参照資料

| 資料名                   | パス                                                                         | 説明                               |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------- |
| Phase 5 GREEN 確認結果   | `outputs/phase-5/green-confirmation.md`                                      | Phase 5 完了状態確認               |
| CI ワークフロー          | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | キャッシュ設定・シャード設定の確認 |
| vitest 設定              | `apps/desktop/vitest.config.ts`                                              | CI_MAX_FORKS・NODE_OPTIONS の確認  |
| Phase 4 ロールバック基準 | `outputs/phase-4/rollback-criteria.md`                                       | 異常時の判断基準                   |
| 検証計画                 | `outputs/phase-4/verification-plan.md`                                       | Phase 4 成果物                     |
| ベースライン計測         | `outputs/phase-4/baseline-timing.md`                                         | Phase 4 成果物                     |
| 実装結果                 | `outputs/phase-5/implementation-result.md`                                   | Phase 5 成果物                     |

---

## 実行手順

### ステップ0: Phase 6 事前確認【必須】

```bash
# Phase 5 で追加したキャッシュ設定の確認
grep -n "cache-node-modules\|cache-hit\|actions/cache" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml | head -30

# CI_MAX_FORKS の値確認
grep -n "CI_MAX_FORKS\|MAX_FORKS\|maxForks" apps/desktop/vitest.config.ts

# NODE_OPTIONS の設定確認（メモリ上限との関係）
grep -n "NODE_OPTIONS\|max-old-space" apps/desktop/vitest.config.ts .github/workflows/ci.yml
```

### ステップ1: lockfile 変更時のキャッシュ無効化確認

依存関係更新時に古い node_modules がキャッシュから復元されてしまわないことを確認する。

**確認観点**:

| 観点                            | 検証方法                                                     | 期待動作                                           |
| ------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| pnpm-lock.yaml 変更時のキー     | lock ファイルを変更した PR の CI ログを確認                  | キャッシュキーが変わり `cache-hit: false` になる   |
| restore-keys のパーシャルマッチ | キャッシュミス後の CI ログで restore-keys によるヒットを確認 | 古いキャッシュから部分復元後に pnpm install が走る |
| 誤った古い node_modules の使用  | pnpm install が走った後のテスト結果を確認                    | テストが正常に PASS する                           |

**検証コマンド**:

```bash
# lockfile 変更を含む PR の CI 実行を確認
gh run list --workflow=ci.yml --limit 10 --json databaseId,headBranch,conclusion \
  --jq '.[] | select(.conclusion != null) | {id: .databaseId, branch: .headBranch, conclusion: .conclusion}'

# 特定の run でキャッシュヒット/ミスのログを確認
gh run view <run-id> --log | grep -E "Cache node_modules|cache-hit|Restoring cache"
```

**判断基準**:

- `pnpm-lock.yaml` 変更前後でキャッシュキーのハッシュが異なること
- キャッシュミス後に `pnpm install` が実行され、テストが PASS すること

### ステップ2: 並行 PR 時のキャッシュ競合確認

複数の PR が同時に CI を実行する場合、キャッシュの書き込み競合が発生しないことを確認する。

**確認観点**:

| 観点                          | 検証方法                                                                  | 期待動作                                                        |
| ----------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| キャッシュキーのスコープ      | GitHub Actions のキャッシュスコープ仕様を確認                             | ブランチごとに独立したキャッシュが使用される                    |
| restore-keys のフォールバック | main ブランチのキャッシュから PR ブランチがフォールバックできることを確認 | `${{ runner.os }}-node-modules-` で main キャッシュを参照できる |
| キャッシュ容量の枯渇防止      | `gh cache list` でキャッシュ容量を確認                                    | GitHub の 10GB 制限内に収まっていること                         |

**検証コマンド**:

```bash
# リポジトリのキャッシュ一覧と容量確認
gh cache list --limit 20

# キャッシュの合計サイズ確認（GB）
gh cache list --json id,key,sizeInBytes \
  --jq '[.[].sizeInBytes] | add / 1073741824 | "\(.) GB"'
```

**フォールバック動作の確認**:

restore-keys の設定 `${{ runner.os }}-node-modules-` により:

1. 同一ハッシュのキャッシュがない場合、最新の `Linux-node-modules-*` キャッシュが使用される
2. pnpm install が走り、差分のみ更新される
3. 新しいハッシュのキャッシュとして保存される

### ステップ3: CI_MAX_FORKS=3 での OOM 発生可能性チェック

フォーク数を 2 から 3 に増やした際のメモリ消費増加を確認する。

**確認観点**:

| 観点                        | 検証方法                                                                         | 判断基準                                    |
| --------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| シャードあたりのメモリ消費  | CI ログの vitest 出力でメモリ関連の警告を確認                                    | OOM Killed や Heap out of memory がないこと |
| NODE_OPTIONS との組み合わせ | `--max-old-space-size` の値とフォーク数 3 の積が Runner のメモリ内に収まるか確認 | Runner の総メモリ（通常 7GB）を超えないこと |
| 断続的なシャード失敗        | 17 シャードの CI 結果で失敗率を確認                                              | 失敗シャードが 0 であること                 |

**検証コマンド**:

```bash
# CI ログで OOM 関連エラーを確認
gh run view <run-id> --log | grep -iE "out of memory|heap|killed|OOM"

# 全シャードの結果確認
gh run view <run-id> --json jobs \
  --jq '.jobs[] | select(.name | startswith("test-desktop")) | {name: .name, conclusion: .conclusion}'

# 失敗シャード数の確認（0 であること）
gh run view <run-id> --json jobs \
  --jq '[.jobs[] | select(.name | startswith("test-desktop")) | select(.conclusion != "success")] | length'
```

**OOM が発生した場合の対処**:

CI_MAX_FORKS=3 で OOM が発生した場合、以下の対処を検討する:

1. CI_MAX_FORKS を 2 に戻す（Phase 4 のロールバック基準を参照）
2. `NODE_OPTIONS=--max-old-space-size` の値を下げる
3. シャード数をさらに増やして 1 シャードあたりのテスト数を減らす

### ステップ4: カバレッジ収集が全 17 シャードで正常に行われることの確認

シャード数変更後も、mainブランチのカバレッジ収集ジョブが正常に動作することを確認する（AC-6）。

**確認観点**:

| 観点                           | 検証方法                                                      | 期待動作                                               |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------ |
| カバレッジ収集ジョブの有無     | ci.yml のカバレッジ関連ジョブを確認                           | カバレッジ収集ジョブが存在し、17 シャードを参照する    |
| シャード分割後のカバレッジ集約 | CI ログでカバレッジレポートが生成されていることを確認         | 全シャードの結果がマージされた最終レポートが出力される |
| main ブランチでの継続動作      | main へのマージ後の CI でカバレッジが収集されていることを確認 | AC-6 が達成されていること                              |

**検証コマンド**:

```bash
# CI ワークフローのカバレッジ関連ジョブを確認
grep -n "coverage\|lcov\|codecov" .github/workflows/ci.yml

# main ブランチの最新 CI でカバレッジジョブの結果確認
gh run list --workflow=ci.yml --branch=main --limit 3 --json databaseId,conclusion \
  --jq '.[0].databaseId' | xargs gh run view --json jobs \
  --jq '.jobs[] | select(.name | test("coverage|Coverage")) | {name: .name, conclusion: .conclusion}'
```

---

## 統合テスト連携

- ステップ1〜4 の確認結果を `outputs/phase-6/edge-case-verification.md` にまとめる
- 異常が検出された場合は Phase 4 のロールバック基準（`outputs/phase-4/rollback-criteria.md`）に従って対処する
- Phase 7 での改善効果計測前に、エッジケースが全て PASS であることを確認する

---

## サブタスク管理

| ID     | タスク名                                               | ステータス |
| ------ | ------------------------------------------------------ | ---------- |
| T-06-1 | lockfile 変更時のキャッシュ無効化確認                  | 未実施     |
| T-06-2 | 並行 PR 時のキャッシュ競合確認                         | 未実施     |
| T-06-3 | CI_MAX_FORKS=3 での OOM 発生可能性チェック             | 未実施     |
| T-06-4 | カバレッジ収集が全 17 シャードで正常動作することの確認 | 未実施     |

---

## 成果物

| 成果物               | 配置先                                      | 形式     |
| -------------------- | ------------------------------------------- | -------- |
| エッジケース検証結果 | `outputs/phase-6/edge-case-verification.md` | Markdown |

---

## 完了条件

- [ ] lockfile 変更時にキャッシュが正しく無効化されることが確認済みであること
- [ ] 並行 PR 時のキャッシュ競合がなく、restore-keys のフォールバックが正常動作することが確認済みであること
- [ ] CI_MAX_FORKS=3 で OOM エラーが発生していないことが確認済みであること
- [ ] AC-6: main ブランチのカバレッジ収集が全 17 シャードで正常動作していることが確認済みであること
- [ ] 4 観点全ての確認結果が `outputs/phase-6/edge-case-verification.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-06-1: lockfile 変更時のキャッシュ無効化確認を実行し `outputs/phase-6/edge-case-verification.md` に記録済み
- [ ] T-06-2: 並行 PR 時のキャッシュ競合確認を実行し結果を記録済み
- [ ] T-06-3: CI_MAX_FORKS=3 での OOM チェックを実行し結果を記録済み（OOM なし / 対処済み のいずれかを記録）
- [ ] T-06-4: カバレッジ収集の全 17 シャード正常動作を確認し結果を記録済み

---

## 次Phase

**Phase 7: カバレッジ確認（改善効果計測）** — 実装後 5 回分の CI 実行時間を計測し、目標（7分40秒以内）の達成を確認する。

**Phase 7 開始条件**: Phase 6 の全完了条件を満たし、4 観点のエッジケースが全て PASS であること。
