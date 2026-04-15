# Phase 5: 実装

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 5                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

3 つの CI 改善（`pnpm-install-retry` への node_modules キャッシュ集約・シャード数 16→17・CI_MAX_FORKS 2→3）を実装し、
GitHub CI の実行時間を直近 5 回 main 平均 15m21s から 7分40秒以内に削減する。

---

## 実行タスク

- **タスク1**: `.github/actions/pnpm-install-retry/action.yml` への node_modules キャッシュ追加
- **タスク2**: `.github/workflows/ci.yml` の test-desktop ジョブのシャード数 16→17 変更
- **タスク3**: `apps/desktop/vitest.config.ts` の CI_MAX_FORKS 2→3 変更

---

## 参照資料

| 資料名               | パス                                                                         | 説明                     |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Phase 4 検証計画     | `outputs/phase-4/verification-plan.md`                                       | 確認手順の参照           |
| Phase 4 ベースライン | `outputs/phase-4/baseline-timing.md`                                         | 改善前の計測値           |
| CI ワークフロー      | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | 修正対象ファイル         |
| vitest 設定          | `apps/desktop/vitest.config.ts`                                              | CI_MAX_FORKS 修正対象    |
| actions/cache 公式   | https://github.com/actions/cache                                             | キャッシュアクション仕様 |
| ロールバック基準     | `outputs/phase-4/rollback-criteria.md`                                       | Phase 4 成果物           |

---

## 実装対象ファイル一覧

| ファイル                                        | 変更種別 | 変更内容                       |
| ----------------------------------------------- | -------- | ------------------------------ |
| `.github/actions/pnpm-install-retry/action.yml` | 修正     | node_modules cache step の追加 |
| `.github/workflows/ci.yml`                      | 修正     | シャード数 16→17 変更          |
| `apps/desktop/vitest.config.ts`                 | 修正     | CI_MAX_FORKS 2→3 変更          |

---

## 実行手順

### ステップ0: 実装前の既存テスト baseline 確認【必須】

```bash
# 現行の action / workflow / vitest 設定を確認
grep -n "cache-node-modules\|actions/cache\|pnpm-lock.yaml" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml
grep -n "shard\|matrix" .github/workflows/ci.yml | head -20
grep -n "CI_MAX_FORKS\|pool\|fileParallelism\|forks" apps/desktop/vitest.config.ts
```

### ステップ1: `pnpm-install-retry` に node_modules キャッシュを追加

`.github/actions/pnpm-install-retry/action.yml` に以下を追加する:

```yaml
- name: Cache node_modules
  id: cache-node-modules
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      apps/desktop/node_modules
      apps/web/node_modules
      packages/shared/node_modules
      packages/ui/node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-node-modules-

- name: Install dependencies with retry
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
  shell: bash
  run: |
    set -euo pipefail
    ...
```

**実装後の確認**:

```bash
# action 内に cache step が入っていることを確認
grep -n "cache-node-modules\|actions/cache\|cache-hit" .github/actions/pnpm-install-retry/action.yml
```

### ステップ2: test-desktop のシャード数 16→17 変更

`.github/workflows/ci.yml` の `test-desktop` ジョブの matrix 定義を変更する:

```yaml
# 変更前
    strategy:
      matrix:
        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

# 変更後
    strategy:
      matrix:
        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
```

vitest の実行コマンドのシャード指定も変更する:

```yaml
# 変更前
        run: pnpm vitest run --shard=${{ matrix.shard }}/16

# 変更後
        run: pnpm vitest run --shard=${{ matrix.shard }}/17
```

**実装後の確認**:

```bash
# シャード数が 17 になっていることを確認
grep -n "shard\|/16\|/17" .github/workflows/ci.yml
```

### ステップ3: vitest.config.ts の CI_MAX_FORKS 変更

`apps/desktop/vitest.config.ts` の CI_MAX_FORKS 定数を変更する:

```typescript
// 変更前
const CI_MAX_FORKS = 2;

// 変更後
const CI_MAX_FORKS = 3; // 2 から変更（CI 並列度向上）
```

**実装後の確認**:

```bash
# 変更が反映されていることを確認
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts
```

### ステップ4: 全変更の最終確認

```bash
# 変更ファイルの diff 確認
git diff .github/actions/pnpm-install-retry/action.yml
git diff .github/workflows/ci.yml
git diff apps/desktop/vitest.config.ts

# yaml 構文チェック（再確認）
python3 -c "import yaml; yaml.safe_load(open('.github/actions/pnpm-install-retry/action.yml')); yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"
```

---

## 注意事項

### キャッシュミスが起きた場合のフォールバック設計

`restore-keys` の設定により、`pnpm-lock.yaml` のハッシュが変わった場合でも、
`${{ runner.os }}-node-modules-` プレフィックスで古いキャッシュを部分的に復元できる。

- **完全ヒット時**: `cache-hit: true` → pnpm install スキップ（最速）
- **パーシャルヒット時**: `cache-hit: false` → pnpm install 実行（古いキャッシュを起点に差分のみ）
- **完全ミス時**: キャッシュなしから pnpm install 実行（従来と同等）

### CI_MAX_FORKS=3 でのメモリ考慮

`vitest.config.ts` の `NODE_OPTIONS=--max-old-space-size=8192` 設定との組み合わせを確認すること。
フォーク数増加に伴いメモリ消費が増える可能性があるため、Phase 6 でエッジケース確認を行う。

### restore-keys の順序

`restore-keys` は複数行指定可能。より具体的なキーを上に書くことで優先度が決まる:

```yaml
restore-keys: |
  ${{ runner.os }}-node-modules-
```

---

## 統合テスト連携

- 実装後に CI を実行し、Phase 4 の回帰テスト計画に従って全 17 シャードの PASS を確認する
- キャッシュヒット状況は `gh run view <run-id> --log | grep "Cache node_modules"` で確認する

---

## サブタスク管理

| ID     | タスク名                                                 | ステータス |
| ------ | -------------------------------------------------------- | ---------- |
| T-05-1 | 実装前の既存設定確認                                     | 未実施     |
| T-05-2 | `pnpm-install-retry` への node_modules キャッシュ追加    | 未実施     |
| T-05-3 | `test-desktop` ジョブのシャード数 16→17 変更             | 未実施     |
| T-05-4 | `apps/desktop/vitest.config.ts` の CI_MAX_FORKS 2→3 変更 | 未実施     |
| T-05-5 | 全変更の最終確認（diff・yaml 構文チェック）              | 未実施     |

---

## 成果物

| 成果物                   | 配置先                                     | 形式       |
| ------------------------ | ------------------------------------------ | ---------- |
| 修正済み CI ワークフロー | `.github/workflows/ci.yml`                 | YAML       |
| 修正済み vitest 設定     | `apps/desktop/vitest.config.ts`            | TypeScript |
| 実装結果サマリ           | `outputs/phase-5/implementation-result.md` | Markdown   |
| GREEN 確認結果           | `outputs/phase-5/green-confirmation.md`    | Markdown   |

---

## 完了条件

- [ ] AC-1: `.github/actions/pnpm-install-retry/action.yml` に node_modules キャッシュが追加されていること
- [ ] AC-1: キャッシュキーが `${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}` 形式であること
- [ ] AC-1: `Install dependencies with retry` ステップに `if: steps.cache-node-modules.outputs.cache-hit != 'true'` が付与されていること
- [ ] AC-3: 全 17 シャードのテストが PASS していること（CI ログで確認）
- [ ] AC-4: `test-desktop` の matrix が `shard: [1, ..., 17]` になっていること
- [ ] AC-4: vitest 実行コマンドが `--shard=${{ matrix.shard }}/17` になっていること
- [ ] AC-5: `apps/desktop/vitest.config.ts` の CI_MAX_FORKS が `3` に変更されていること
- [ ] yaml 構文チェックが PASS していること
- [ ] `outputs/phase-5/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-05-1: 実装前確認（現行設定の grep）を実行済み
- [ ] T-05-2: `pnpm-install-retry` への node_modules キャッシュ追加完了
- [ ] T-05-3: `test-desktop` ジョブのシャード数 16→17 変更完了
- [ ] T-05-4: `apps/desktop/vitest.config.ts` の CI_MAX_FORKS 2→3 変更完了
- [ ] T-05-5: 全変更の diff 確認・yaml 構文チェック PASS を `outputs/phase-5/implementation-result.md` に記録済み

---

## 次Phase

**Phase 6: テスト拡充** — 異常系（lockfile 変更時のキャッシュ無効化・OOM 可能性・カバレッジ収集）のエッジケース確認を行う。

**Phase 6 開始条件**: Phase 5 の全完了条件を満たし、CI が GREEN で完了していること（`outputs/phase-5/green-confirmation.md` に記録済み）。
