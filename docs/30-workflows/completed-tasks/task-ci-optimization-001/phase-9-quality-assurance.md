# Phase 9: 品質保証

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 9                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

Phase 5 で実装した CI 設定変更の品質を最終確認する。
actionlint による YAML 構文チェック・タイムアウト設定の妥当性確認・セキュリティ確認・
仕様書との整合確認を行い、全ての品質ゲートを通過することを確認する。

---

## 実行タスク

- **タスク1**: actionlint による `ci.yml` の YAML 構文チェック（`actionlint .github/workflows/ci.yml`）
- **タスク2**: タイムアウト設定の確認（各ジョブの `timeout-minutes` が適切か）
- **タスク3**: セキュリティ確認（node_modules キャッシュにシークレットが含まれないことの確認）
- **タスク4**: `docs/30-workflows` との整合確認（仕様書の内容が実装と一致しているか）
- **タスク5**: `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` が desktop 系ジョブに設定されているか再確認

---

## 参照資料

| 資料名                     | パス                                                                         | 説明                   |
| -------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| Phase 8 リファクタ結果     | `outputs/phase-8/refactoring-result.md`                                      | リファクタ完了状態確認 |
| Phase 3 MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`                                          | MINOR 指摘の解決確認   |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`                                     | AC-1〜AC-6 との照合    |
| CI ワークフロー            | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | 品質チェック対象       |
| Vitest 設定                | `apps/desktop/vitest.config.ts`                                              | CI_MAX_FORKS 設定確認  |
| Phase 2 設計決定記録       | `outputs/phase-2/design-decisions.md`                                        | 設計意図との整合確認   |
| 実装結果                   | `outputs/phase-5/implementation-result.md`                                   | Phase 5 成果物         |
| GREEN確認                  | `outputs/phase-5/green-confirmation.md`                                      | Phase 5 成果物         |

---

## 実行手順

### ステップ1: actionlint による YAML 構文チェック

```bash
# actionlint による ci.yml の構文チェック（インストール済みの場合）
actionlint .github/workflows/ci.yml

# actionlint が未インストールの場合は brew でインストール
brew install actionlint
actionlint .github/workflows/ci.yml

# actionlint が利用できない環境では yamllint で代替
yamllint .github/workflows/ci.yml 2>/dev/null || echo "yamllint も未インストール"

# 最低限: 手動での YAML 構文確認（Python yaml モジュール使用）
python3 -c "import yaml; yaml.safe_load(open('.github/actions/pnpm-install-retry/action.yml')); yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML syntax OK"
```

**期待結果**: エラー 0 件

### ステップ2: タイムアウト設定の確認

```bash
# 全ジョブの timeout-minutes 設定を一覧表示
grep -n "timeout-minutes\|^\s\{2\}[a-z][a-z-]*:" .github/workflows/ci.yml | head -60

# test-desktop ジョブの timeout 設定を確認
grep -A5 "test-desktop:" .github/workflows/ci.yml | grep "timeout"
```

**確認テーブル**:

| ジョブ名     | 現在の timeout-minutes | 妥当性                                        |
| ------------ | ---------------------- | --------------------------------------------- |
| test-desktop | TBD                    | シャード 17 × 並列 3 = 各シャード ~4〜5分想定 |
| typecheck    | TBD                    | 型チェックは ~2〜3 分想定                     |
| test-shared  | TBD                    | shared テストは ~2〜3 分想定                  |
| e2e          | TBD                    | E2E は ~5〜10 分想定                          |
| build-check  | TBD                    | ビルドチェックは ~3〜5 分想定                 |

**判断基準**: timeout が実際の実行時間の 2 倍未満の場合は MINOR 指摘

### ステップ3: セキュリティ確認

```bash
# node_modules キャッシュの対象パスにシークレットファイルが含まれないことを確認
# .env ファイルが node_modules 配下に存在しないことを確認
find node_modules apps/*/node_modules packages/*/node_modules \
  -name ".env" -o -name "*.key" -o -name "*.pem" 2>/dev/null | head -20

# ci.yml のキャッシュ path 設定を確認（node_modules 以外が含まれていないか）
grep -A15 "cache-node-modules" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml | grep "path" -A10

# GitHub Actions のシークレットが ci.yml で適切に参照されているか確認
grep -n "secrets\." .github/workflows/ci.yml
```

**確認ポイント**:

- [ ] キャッシュ対象パスが `node_modules` 配下のみであること
- [ ] `.env` や秘密鍵ファイルがキャッシュ対象に含まれていないこと
- [ ] GitHub Secrets（`ANTHROPIC_API_KEY` 等）が node_modules にハードコードされていないこと

### ステップ4: docs/30-workflows との整合確認

```bash
# Phase 2 設計で定義したキャッシュキーと実装が一致するか確認
grep -n "hashFiles.*pnpm-lock.yaml" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml
grep -n "pnpm-lock.yaml" outputs/phase-2/design-decisions.md 2>/dev/null || \
  cat outputs/phase-2/cache-design.md 2>/dev/null | grep "hashFiles"

# Phase 2 設計でのシャード数設定と実装が一致するか確認
grep -n "shard\|/17" .github/workflows/ci.yml | head -10

# Phase 2 設計での CI_MAX_FORKS 値と実装が一致するか確認
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts
grep -n "CI_MAX_FORKS" .github/workflows/ci.yml
```

**整合確認テーブル**:

| 設計書の仕様                                  | 実装の内容              | 整合状態 |
| --------------------------------------------- | ----------------------- | -------- |
| キャッシュキー: `hashFiles('pnpm-lock.yaml')` | ci.yml の key 設定      | TBD      |
| シャード数: 17                                | matrix shard 数         | TBD      |
| CI_MAX_FORKS: 3                               | vitest.config.ts の設定 | TBD      |
| restore-keys フォールバック設定               | ci.yml の restore-keys  | TBD      |
| 条件付き pnpm install                         | if: cache-hit != 'true' | TBD      |

### ステップ5: ELECTRON_SKIP_BINARY_DOWNLOAD 再確認

```bash
# desktop 系ジョブ全てに ELECTRON_SKIP_BINARY_DOWNLOAD: 1 が設定されているか確認
grep -n -B5 -A20 "test-desktop:" .github/workflows/ci.yml | grep "ELECTRON_SKIP"

# build-check や e2e ジョブにも設定されているか確認
grep -n "ELECTRON_SKIP_BINARY_DOWNLOAD" .github/workflows/ci.yml
```

**期待結果**: desktop 系全ジョブに `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` が設定されていること

---

## 検証コマンドまとめ

```bash
# 1. YAML 構文チェック（actionlint）
actionlint .github/workflows/ci.yml

# 2. タイムアウト一覧
grep -n "timeout-minutes" .github/workflows/ci.yml

# 3. セキュリティ: node_modules 配下の .env 確認
find node_modules -name ".env" 2>/dev/null | wc -l

# 4. キャッシュキーの確認
grep -n "hashFiles\|pnpm-lock" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml

# 5. ELECTRON_SKIP_BINARY_DOWNLOAD の確認
grep -n "ELECTRON_SKIP_BINARY_DOWNLOAD" .github/workflows/ci.yml

# 6. シャード数の確認
grep -n "shard\|/17\|/16" .github/workflows/ci.yml

# 7. CI_MAX_FORKS の確認
grep -n "CI_MAX_FORKS" apps/desktop/vitest.config.ts .github/workflows/ci.yml
```

---

## 統合テスト連携

- 品質保証の全チェックが PASS であることが Phase 10 への前提条件
- タイムアウト・セキュリティ・整合性の全確認が Phase 10 最終レビューの根拠となる

---

## サブタスク管理

| ID     | タスク名                               | ステータス |
| ------ | -------------------------------------- | ---------- |
| T-09-1 | actionlint による YAML 構文チェック    | 未実施     |
| T-09-2 | タイムアウト設定の確認                 | 未実施     |
| T-09-3 | セキュリティ確認                       | 未実施     |
| T-09-4 | docs/30-workflows との整合確認         | 未実施     |
| T-09-5 | ELECTRON_SKIP_BINARY_DOWNLOAD の再確認 | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 完了条件

- [ ] actionlint（または yamllint）による YAML 構文チェックが PASS であること（エラー 0）
- [ ] 全ジョブの `timeout-minutes` が実行時間に対して適切に設定されていること
- [ ] node_modules キャッシュにシークレットファイルが含まれないことが確認済みであること
- [ ] 仕様書（Phase 2 設計）と実装の整合が確認済みであること
- [ ] desktop 系全ジョブに `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` が設定されていること
- [ ] Phase 3 MINOR 指摘（CI-M-01）の解決状況が確認済みであること
- [ ] AC-1〜AC-6 の充足状況が `outputs/phase-9/quality-check-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-09-1: actionlint を実行し結果を記録済み（PASS）
- [ ] T-09-2: タイムアウト設定を確認し妥当性を記録済み
- [ ] T-09-3: セキュリティ確認を実施し問題なしを記録済み
- [ ] T-09-4: docs/30-workflows との整合を確認し結果を記録済み
- [ ] T-09-5: `ELECTRON_SKIP_BINARY_DOWNLOAD: 1` の設定を再確認し記録済み

---

## 次Phase

**Phase 10: 最終レビューゲート** — AC-1〜AC-6 との完全照合・PASS/MINOR/MAJOR 判定を行い、Phase 11 への進行可否を確定する。

**Phase 10 開始条件**: Phase 9 の全完了条件を満たすこと。
