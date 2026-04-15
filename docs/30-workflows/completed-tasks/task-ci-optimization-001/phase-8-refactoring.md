# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 8                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

Phase 5 で実装した CI 設定（`.github/actions/pnpm-install-retry/action.yml`、`.github/workflows/ci.yml` および `apps/desktop/vitest.config.ts`）を
リファクタリングし、重複の除去・可読性向上・コメント整備を行う。
機能変更は行わない（リファクタリングのみ）。

---

## 実行タスク

- **タスク1**: `ci.yml` 側に node_modules キャッシュが重複していないことを確認し、`pnpm-install-retry` に集約されたままかを確認
- **タスク2**: Before/After テーブルで変更内容を記録
- **タスク3**: `action.yml` / `ci.yml` / `vitest.config.ts` のコメント整備（何を最適化したかの説明追加）

---

## 参照資料

| 資料名                 | パス                                                                         | 説明           |
| ---------------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 5 実装結果       | `outputs/phase-5/implementation-result.md`                                   | 実装内容の確認 |
| Phase 7 計測レポート   | `outputs/phase-7/ci-timing-report.md`                                        | PASS 判定確認  |
| Phase 2 設計決定記録   | `outputs/phase-2/design-decisions.md`                                        | 設計意図の確認 |
| CI ワークフロー        | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | リファクタ対象 |
| Vitest 設定            | `apps/desktop/vitest.config.ts`                                              | リファクタ対象 |
| GREEN確認              | `outputs/phase-5/green-confirmation.md`                                      | Phase 5 成果物 |
| キャッシュ効果レポート | `outputs/phase-7/cache-effectiveness-report.md`                              | Phase 7 成果物 |

---

## 実行手順

### ステップ1: 重複キャッシュ設定の現状確認

```bash
# キャッシュ設定が action に集約され、ci.yml に重複が残っていないか確認
grep -n "actions/cache\|cache-node-modules\|pnpm-lock.yaml" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml

# キャッシュ step が action に何箇所あるか数える
grep -c "actions/cache" .github/actions/pnpm-install-retry/action.yml
```

**既存 composite action への cache 追加判断基準**:

| 条件                                      | 判断                                                |
| ----------------------------------------- | --------------------------------------------------- |
| キャッシュ step が 3 ジョブ以上に重複     | `pnpm-install-retry` へ集約を推奨（リファクタ実施） |
| キャッシュ step が 2 ジョブ以下           | 現状維持（変更コストが上回るため）                  |
| composite action により可読性が下がる場合 | 現状維持（コメント整備のみ実施）                    |

### ステップ2: 既存 composite action への cache 追加の検討と実施判断

既存の composite action である `pnpm-install-retry` の中に cache ロジックを保持する:

```yaml
# .github/actions/pnpm-install-retry/action.yml
name: "Install dependencies with retry"
description: "Run pnpm install with retries and node_modules cache"
outputs:
  cache-hit:
    description: "Whether cache was hit"
    value: ${{ steps.cache-node-modules.outputs.cache-hit }}
runs:
  using: "composite"
  steps:
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
```

**判断結果を `outputs/phase-8/refactoring-result.md` に記録する**:

```markdown
## 既存 composite action への cache 追加判断

- 判断: [実施 / 現状維持]
- 根拠: [重複ジョブ数・コスト試算]
```

### ステップ3: Before/After テーブルの記録

以下のテーブルを `outputs/phase-8/refactoring-result.md` に記録する:

| 対象ファイル                                    | Before（変更前）                | After（変更後）                        |
| ----------------------------------------------- | ------------------------------- | -------------------------------------- |
| `.github/actions/pnpm-install-retry/action.yml` | cache step なし                 | node_modules cache step を追加済み     |
| `.github/workflows/ci.yml`                      | 最適化目的コメントなし          | shard / free-tier の説明コメントを追加 |
| `apps/desktop/vitest.config.ts`                 | CI_MAX_FORKS 変更のコメントなし | 変更理由コメント追加                   |

### ステップ4: action.yml / ci.yml / vitest.config.ts のコメント整備

**追加するコメントの例**:

```yaml
# CI Optimization (TASK-CI-OPT-001):
# node_modules をキャッシュして pnpm install の固定費を削減する。
# キャッシュキーは pnpm-lock.yaml のハッシュで管理する。
- name: Cache node_modules
  id: cache-node-modules
  uses: actions/cache@v4
  ...

# CI Optimization (TASK-CI-OPT-001):
# キャッシュヒット時は pnpm install をスキップする（フォールバック用）
- name: Install dependencies with retry
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
  shell: bash
  run: |
    set -euo pipefail
    ...
```

```typescript
// CI Optimization (TASK-CI-OPT-001):
// CI_MAX_FORKS を 2→3 に引き上げ、シャード内の並列実行を強化。
// メモリ上限 (7GB ランナー) を考慮し 3 をバランスポイントとして選択。
const maxForks = Number(process.env.CI_MAX_FORKS ?? 2);
```

### ステップ5: リファクタ後のテスト確認

機能変更がないことの確認:

```bash
# actionlint が利用可能な場合
actionlint .github/workflows/ci.yml 2>/dev/null || echo "actionlint 未インストール（Phase 9 で実施）"

# action.yml と ci.yml の YAML 構文チェック
python3 -c "import yaml; yaml.safe_load(open('.github/actions/pnpm-install-retry/action.yml')); yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"

# TypeScript typecheck（vitest.config.ts の変更確認）
pnpm --filter @repo/desktop typecheck
```

---

## 統合テスト連携

- コメント追加のみであればテスト動作に影響なし
- `pnpm-install-retry` に集約した cache が CI 上で正常に動作することを Phase 11 で確認する

---

## サブタスク管理

| ID     | タスク名                                              | ステータス |
| ------ | ----------------------------------------------------- | ---------- |
| T-08-1 | 重複キャッシュ設定の現状確認                          | 未実施     |
| T-08-2 | cache 集約の検討・判断                                | 未実施     |
| T-08-3 | Before/After テーブルの記録                           | 未実施     |
| T-08-4 | action.yml / ci.yml / vitest.config.ts のコメント整備 | 未実施     |
| T-08-5 | リファクタ後のテスト確認                              | 未実施     |

---

## 成果物

| 成果物             | 配置先                                  | 形式     |
| ------------------ | --------------------------------------- | -------- |
| リファクタ結果記録 | `outputs/phase-8/refactoring-result.md` | Markdown |

---

## 完了条件

- [ ] 重複キャッシュ設定の現状（ジョブ数・重複度）が確認・記録されていること
- [ ] cache 集約の実施/現状維持の判断が根拠とともに記録されていること
- [ ] Before/After テーブルが `outputs/phase-8/refactoring-result.md` に記録されていること
- [ ] `.github/actions/pnpm-install-retry/action.yml`、`.github/workflows/ci.yml`、`apps/desktop/vitest.config.ts` に最適化意図のコメントが追加されていること
- [ ] リファクタ後も `pnpm --filter @repo/desktop typecheck` が PASS であること
- [ ] 機能変更がないこと（コメント・整理のみ）が確認済みであること

---

## タスク100%実行確認【必須】

- [ ] T-08-1: 重複キャッシュ設定の現状を確認し記録済み
- [ ] T-08-2: cache 集約の検討結果を `outputs/phase-8/refactoring-result.md` に記録済み
- [ ] T-08-3: Before/After テーブルを `outputs/phase-8/refactoring-result.md` に記録済み
- [ ] T-08-4: `.github/actions/pnpm-install-retry/action.yml`、`.github/workflows/ci.yml`、`apps/desktop/vitest.config.ts` のコメント整備を完了済み
- [ ] T-08-5: リファクタ後の typecheck が PASS であることを確認済み

---

## 次Phase

**Phase 9: 品質保証** — actionlint による構文チェック・タイムアウト設定確認・セキュリティ確認を行う。

**Phase 9 開始条件**: Phase 8 の全完了条件を満たすこと。
