# Phase 2: 設計

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| 機能名     | TASK-CI-FUTURE-003                   |
| タスク名   | キャッシュヒット率のモニタリング設定 |
| 前提Phase  | Phase 1                              |
| 後続Phase  | Phase 3                              |
| 作成日     | 2026-04-15                           |
| ステータス | pending                              |

## 目的

Phase 1 の要件を元に、`.github/workflows/ci.yml` へ追加するキャッシュヒット率判定ステップの設計を確定する。

## 背景

`actions/cache@v4` の `cache-hit` は完全一致のみ `true` になり、`restore-keys` フォールバック時は `false` になる。
フォールバックで node_modules 群が復元された場合は、cache restore 直後に各 `node_modules` ディレクトリが存在する。
この `cache-hit` + `node_modules` 存在確認を組み合わせることで 3 状態を正確に判定できる。

## 実行タスク

### Task 2-A: キャッシュステップ `id` 追加設計

Phase 1 で `id` が未設定と判明したキャッシュステップに対して、命名規則を設計する。

| ステップ                | 推奨 `id`            |
| ----------------------- | -------------------- |
| node_modules キャッシュ | `cache-node-modules` |
| pnpm store キャッシュ   | `cache-pnpm-store`   |

### Task 2-B: 3状態判定ロジック設計

`cache-hit` と cache restore 直後の `node_modules` 存在を組み合わせた判定テーブル：

| `cache-hit` | `node_modules` 存在 | 判定状態                | 出力シンボル                            |
| ----------- | ------------------- | ----------------------- | --------------------------------------- |
| `true`      | 任意                | 完全ヒット（Exact Hit） | `✅ 完全ヒット (Exact Hit)`             |
| `false`     | あり                | フォールバックヒット    | `⚠️ フォールバックヒット (Partial Hit)` |
| `false`     | なし                | キャッシュミス（Miss）  | `❌ キャッシュミス (Miss)`              |

### Task 2-C: GitHub Actions Summary 出力形式設計

`$GITHUB_STEP_SUMMARY` に追記する Markdown テーブル形式を設計する。

```markdown
## キャッシュヒット率レポート

| 項目           | 内容                                        |
| -------------- | ------------------------------------------- |
| ジョブ名       | ${GITHUB_JOB}                               |
| 判定種別       | exact                                       |
| 判定結果       | ✅ 完全ヒット (Exact Hit)                   |
| 判定根拠       | cache-hit=true かつ node_modules が復元済み |
| アノテーション | なし                                        |
```

### Task 2-D: アノテーション出力設計

```bash
# キャッシュミス時
echo "::warning::[$GITHUB_JOB] node_modules キャッシュミス。CI実行時間が増加する可能性があります。"

# フォールバックヒット時
echo "::notice::[$GITHUB_JOB] node_modules キャッシュはフォールバックキーでヒットしました。完全ヒットより効率が低下しています。"
```

### Task 2-E: YAML ステップ構造設計

追加するステップのYAML構造：

```yaml
- name: キャッシュヒット率確認
  id: check-cache-hit-rate
  if: always()
  continue-on-error: true
  shell: bash
  env:
    CACHE_HIT: ${{ steps.cache-node-modules.outputs.cache-hit }}
  run: |
    set -euo pipefail

    cache_status="❌ キャッシュミス (Miss)"
    cache_kind="miss"
    cache_reason="cache-hit=false / node_modules が復元されなかった"
    annotation_level="warning"
    cache_restored="false"

    for path in \
      node_modules \
      apps/backend/node_modules \
      apps/desktop/node_modules \
      apps/web/node_modules \
      packages/shared/node_modules \
      packages/ui/node_modules; do
      if [ -d "$path" ]; then
        cache_restored="true"
        break
      fi
    done

    if [ "${CACHE_HIT:-}" = "true" ]; then
      cache_status="✅ 完全ヒット (Exact Hit)"
      cache_kind="exact"
      cache_reason="cache-hit=true かつ node_modules が復元済み"
      annotation_level=""
    elif [ "$cache_restored" = "true" ]; then
      cache_status="⚠️ フォールバックヒット (Partial Hit)"
      cache_kind="fallback"
      cache_reason="cache-hit=false / node_modules がフォールバック復元済み"
      annotation_level="notice"
    fi

    {
      echo "cache-status=$cache_status"
      echo "cache-kind=$cache_kind"
      echo "cache-reason=$cache_reason"
      echo "annotation-level=$annotation_level"
    } >> "$GITHUB_OUTPUT"

    # GitHub Actions Summary への出力
    echo "## キャッシュヒット率レポート" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    echo "| 項目 | 内容 |" >> $GITHUB_STEP_SUMMARY
    echo "|------|------|" >> $GITHUB_STEP_SUMMARY
    echo "| ジョブ名 | ${GITHUB_JOB:-unknown} |" >> $GITHUB_STEP_SUMMARY
    echo "| 判定種別 | $cache_kind |" >> $GITHUB_STEP_SUMMARY
    echo "| 判定結果 | $cache_status |" >> $GITHUB_STEP_SUMMARY
    echo "| 判定根拠 | $cache_reason |" >> $GITHUB_STEP_SUMMARY
    echo "| アノテーション | $annotation_level |" >> $GITHUB_STEP_SUMMARY

    # アノテーション出力
    if [ "$annotation_level" = "warning" ]; then
      echo "::warning::[$GITHUB_JOB] node_modules キャッシュミス。CI実行時間が増加する可能性があります。"
    elif [ "$annotation_level" = "notice" ]; then
      echo "::notice::[$GITHUB_JOB] node_modules キャッシュはフォールバックキーでヒットしました。"
    fi
```

### Task 2-F: 配置ジョブ設計

Phase 1 で確認した全対象ジョブに同一ステップを配置する。

| ジョブ    | キャッシュステップ `id` | 判定ステップ配置位置   |
| --------- | ----------------------- | ---------------------- |
| lint      | `cache-node-modules`    | キャッシュステップ直後 |
| typecheck | `cache-node-modules`    | キャッシュステップ直後 |
| test      | `cache-node-modules`    | キャッシュステップ直後 |

## 参照資料

### 実装・コード

| 資料名                      | パス                                            | 用途             |
| --------------------------- | ----------------------------------------------- | ---------------- |
| CI ワークフロー             | `.github/workflows/ci.yml`                      | 設計対象ファイル |
| pnpm インストールアクション | `.github/actions/pnpm-install-retry/action.yml` | outputs 参照確認 |
| Phase 1 成果物              | `outputs/phase-1/requirements.md`               | 要件確認         |
| Phase 1 現状確認            | `outputs/phase-1/cache-step-inventory.md`       | ステップ一覧確認 |
| 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`        | Phase 1 成果物   |

### 外部ドキュメント

| 資料名                              | 説明                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| actions/cache@v4 公式ドキュメント   | `cache-hit` と restore-keys / node_modules 存在確認の仕様  |
| GitHub Actions ワークフローコマンド | `::warning::`、`::notice::`、`$GITHUB_STEP_SUMMARY` の仕様 |

## 実行手順

1. Phase 1 成果物（`outputs/phase-1/`）を確認する
2. キャッシュステップに `id` が必要な場合の命名規則を設計書に記載する
3. 3 状態判定ロジックを設計書に記載する（Task 2-B テーブルを完成させる）
4. YAML ステップ構造（Task 2-E のサンプルコード）を設計書に記載する
5. 配置対象ジョブ一覧（Task 2-F テーブル）を Phase 1 の現状確認を元に確定する
6. 成果物を `outputs/phase-2/` に保存する

## 成果物

| 成果物名      | 保存先                            | 説明                       |
| ------------- | --------------------------------- | -------------------------- |
| 設計書        | `outputs/phase-2/design.md`       | 判定ロジック・YAML構造設計 |
| YAML サンプル | `outputs/phase-2/yaml-sample.yml` | 追加ステップの完全なYAML   |

## 完了条件

- [ ] 3状態判定テーブル（Task 2-B）が完成している
- [ ] GitHub Actions Summary の出力形式（Markdown テーブル）が設計されている
- [ ] `::warning::` と `::notice::` のアノテーション構文が設計されている
- [ ] 追加する YAML ステップの完全な構造が設計書に記載されている
- [ ] 配置対象ジョブ一覧が確定している
- [ ] 成果物 2 件が `outputs/phase-2/` に保存されている
