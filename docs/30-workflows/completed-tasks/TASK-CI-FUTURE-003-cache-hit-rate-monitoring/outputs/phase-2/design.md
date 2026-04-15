# 設計書

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 2                                    |
| 機能名   | TASK-CI-FUTURE-003                   |
| タスク名 | キャッシュヒット率のモニタリング設定 |
| 作成日   | 2026-04-15                           |

---

## Task 2-A: キャッシュステップ `id` 確認

Phase 1 の現状確認の結果、`.github/actions/pnpm-install-retry/action.yml` のキャッシュステップには既に `id: cache-node-modules` が設定されている。

| ステップ                | `id`                 | 状態        |
| ----------------------- | -------------------- | ----------- |
| node_modules キャッシュ | `cache-node-modules` | ✅ 設定済み |

**Phase 5 での追加作業は不要**。

---

## Task 2-B: 3状態判定ロジック設計

`cache-hit` と cache restore 直後の `node_modules` 存在を組み合わせた判定テーブル：

| `cache-hit` | `node_modules` 存在 | 判定状態                | 出力シンボル                            |
| ----------- | ------------------- | ----------------------- | --------------------------------------- |
| `true`      | 任意                | 完全ヒット（Exact Hit） | `✅ 完全ヒット (Exact Hit)`             |
| `false`     | あり                | フォールバックヒット    | `⚠️ フォールバックヒット (Partial Hit)` |
| `false`     | なし                | キャッシュミス（Miss）  | `❌ キャッシュミス (Miss)`              |

**判定ロジックの根拠**:

- `actions/cache@v4` は完全一致キーでヒットした場合のみ `cache-hit=true` を返す
- `restore-keys` フォールバック時は `cache-hit=false` だが cache restore 直後の `node_modules` 群が存在する
- キャッシュ未ヒット時は `cache-hit=false` かつ cache restore 後の `node_modules` 群が存在しない

---

## Task 2-C: GitHub Actions Summary 出力形式設計

`$GITHUB_STEP_SUMMARY` に追記する Markdown テーブル形式：

```markdown
## キャッシュヒット率レポート

| 項目           | 内容                                        |
| -------------- | ------------------------------------------- |
| ジョブ名       | lint                                        |
| 判定種別       | exact                                       |
| 判定結果       | ✅ 完全ヒット (Exact Hit)                   |
| 判定根拠       | cache-hit=true かつ node_modules が復元済み |
| アノテーション | なし                                        |
```

---

## Task 2-D: アノテーション出力設計

```bash
# キャッシュミス時
echo "::warning::[$GITHUB_JOB] node_modules キャッシュミス。CI実行時間が増加する可能性があります。"

# フォールバックヒット時
echo "::notice::[$GITHUB_JOB] node_modules キャッシュはフォールバックキーでヒットしました。完全ヒットより効率が低下しています。"
```

---

## Task 2-E: YAML ステップ構造設計

### アーキテクチャ決定: 判定ステップをカスタムアクション内に配置

Phase 1 の現状確認で、`id: cache-node-modules` ステップはカスタム複合アクション（`pnpm-install-retry/action.yml`）内にあることが判明した。

**設計方針**: 判定ステップを `pnpm-install-retry/action.yml` 内に追加する。

| 方法                                 | メリット                                   | デメリット                         | 採用 |
| ------------------------------------ | ------------------------------------------ | ---------------------------------- | ---- |
| **アクション内に判定ステップを追加** | DRY・全ジョブ自動適用・steps参照が直接可能 | アクション内への変更が必要         | ✅   |
| `ci.yml` 各ジョブに判定ステップ追加  | 各ジョブで可視化される                     | 9ジョブへの重複追加・steps参照不可 | ❌   |

追加するステップの YAML 構造（`pnpm-install-retry/action.yml` 内）：

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
    echo "## キャッシュヒット率レポート" >> "$GITHUB_STEP_SUMMARY"
    echo "" >> "$GITHUB_STEP_SUMMARY"
    echo "| 項目 | 内容 |" >> "$GITHUB_STEP_SUMMARY"
    echo "|------|------|" >> "$GITHUB_STEP_SUMMARY"
    echo "| ジョブ名 | ${GITHUB_JOB:-unknown} |" >> "$GITHUB_STEP_SUMMARY"
    echo "| 判定種別 | $cache_kind |" >> "$GITHUB_STEP_SUMMARY"
    echo "| 判定結果 | $cache_status |" >> "$GITHUB_STEP_SUMMARY"
    echo "| 判定根拠 | $cache_reason |" >> "$GITHUB_STEP_SUMMARY"
    echo "| アノテーション | $annotation_level |" >> "$GITHUB_STEP_SUMMARY"

    # アノテーション出力
    if [ "$annotation_level" = "warning" ]; then
      echo "::warning::[$GITHUB_JOB] node_modules キャッシュミス。CI実行時間が増加する可能性があります。"
    elif [ "$annotation_level" = "notice" ]; then
      echo "::notice::[$GITHUB_JOB] node_modules キャッシュはフォールバックキーでヒットしました。完全ヒットより効率が低下しています。"
    fi
```

---

## Task 2-F: 配置ジョブ設計

カスタムアクション内への追加により、アクションを利用する **全 9 ジョブ** に自動で判定ステップが適用される。

| ジョブ              | アクション使用 | 自動適用 |
| ------------------- | -------------- | -------- |
| `lint`              | ✅             | ✅       |
| `typecheck`         | ✅             | ✅       |
| `build-shared`      | ✅             | ✅       |
| `test-shared`       | ✅             | ✅       |
| `test-desktop`      | ✅             | ✅       |
| `e2e-desktop`       | ✅             | ✅       |
| `check-module-sync` | ✅             | ✅       |
| `security`          | ✅             | ✅       |
| `build`             | ✅             | ✅       |
