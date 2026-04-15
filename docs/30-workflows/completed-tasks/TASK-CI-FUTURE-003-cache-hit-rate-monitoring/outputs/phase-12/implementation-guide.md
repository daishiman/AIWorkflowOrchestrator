# 実装ガイド — TASK-CI-FUTURE-003

## Part 1: 中学生レベル概念説明

### なぜキャッシュのモニタリングが必要か？

CI（継続的インテグレーション）はコードをプッシュするたびに自動でテストやチェックを実行する仕組みです。この仕組みの中で「キャッシュ」は「前回の作業で使ったファイルを保存しておき、次回はダウンロードをスキップする」という節約機能です。

キャッシュがうまく使えると：

- CI が 15 分かかっていたのが 5 分になる（3 倍速！）

でも、キャッシュが使えない状態になっても、今まで気づく方法がありませんでした。このタスクでは「キャッシュが今どのくらい機能しているか」を自動でレポートする仕組みを作ります。

郵便ポストに例えると：「郵便が届いているかどうか（キャッシュが使えているか）を毎回確認せず、ポストが自動でスマホに通知してくれる仕組み」を作るようなものです。

キャッシュには 3 つの状態があります：

| 状態                      | 意味                                         | CI への影響                   |
| ------------------------- | -------------------------------------------- | ----------------------------- |
| ✅ 完全ヒット (Exact Hit) | 前回と全く同じキャッシュが使えた             | 最速（pnpm install スキップ） |
| ⚠️ フォールバックヒット   | 似たキャッシュが見つかったが完全一致ではない | やや遅い                      |
| ❌ キャッシュミス (Miss)  | キャッシュが全く使えなかった                 | 最も遅い（フルインストール）  |

---

## Part 2: 技術者レベル実装ガイド

### 変更ファイル

| ファイル                                        | 変更種別 | 内容                               |
| ----------------------------------------------- | -------- | ---------------------------------- |
| `.github/actions/pnpm-install-retry/action.yml` | 変更     | キャッシュヒット率確認ステップ追加 |

### アーキテクチャ判断

`actions/cache@v4` の `id: cache-node-modules` ステップはカスタム複合アクション内にあるため、判定ステップも同アクション内に配置した（DRY 原則）。これにより `ci.yml` の全 9 ジョブに自動適用される。

### 判定ロジック仕様

```bash
# 入力: CACHE_HIT (steps.cache-node-modules.outputs.cache-hit)
#       NODE_MODULES_PRESENT (cache restore 直後の node_modules 存在確認)
# 出力: CACHE_STATUS (文字列), CACHE_KIND (exact|fallback|miss), CACHE_REASON, ANNOTATION_LEVEL ("warning"|"notice"|"")

if [ "$CACHE_HIT" = "true" ] && [ "$NODE_MODULES_PRESENT" = "true" ]; then
  CACHE_STATUS="✅ 完全ヒット (Exact Hit)"
  CACHE_KIND="exact"
  CACHE_REASON="cache-hit=true かつ node_modules が復元済み"
  ANNOTATION_LEVEL=""
elif [ "$NODE_MODULES_PRESENT" = "true" ]; then
  CACHE_STATUS="⚠️ フォールバックヒット (Partial Hit)"
  CACHE_KIND="fallback"
  CACHE_REASON="cache-hit=false / node_modules がフォールバック復元済み"
  ANNOTATION_LEVEL="notice"
else
  CACHE_STATUS="❌ キャッシュミス (Miss)"
  CACHE_KIND="miss"
  CACHE_REASON="cache restore 後に node_modules が存在しない"
  ANNOTATION_LEVEL="warning"
fi
```

### `actions/cache@v4` outputs 仕様

| output 名           | 挙動                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `cache-hit`         | 完全一致キーでヒットした場合のみ `true`。フォールバック時は `false`       |
| `node_modules` 確認 | cache restore 直後に `node_modules` が存在するかで fallback / miss を判定 |

### `GITHUB_OUTPUT` へ書き出す値

| 出力名             | 内容                                              |
| ------------------ | ------------------------------------------------- |
| `cache-status`     | `✅ 完全ヒット` / `⚠️ フォールバック` / `❌ ミス` |
| `cache-kind`       | `exact` / `fallback` / `miss`                     |
| `cache-reason`     | 判定根拠の要約                                    |
| `annotation-level` | `warning` / `notice` / 空文字列                   |

### 設定パラメータ

| パラメータ                | 説明                                       | 値       |
| ------------------------- | ------------------------------------------ | -------- |
| `if: always()`            | 前ステップ失敗時も判定ステップを実行する   | 必須設定 |
| `continue-on-error: true` | 判定ステップ失敗時でも CI をブロックしない | 必須設定 |
| キャッシュミス閾値        | ミス時: `::warning::`                      | 変更可能 |
| フォールバック閾値        | フォールバックヒット時: `::notice::`       | 変更可能 |

### Summary 出力形式

```markdown
## キャッシュヒット率レポート

| 項目           | 内容                                        |
| -------------- | ------------------------------------------- |
| 判定種別       | exact                                       |
| 判定結果       | ✅ 完全ヒット (Exact Hit)                   |
| 判定根拠       | cache-hit=true かつ node_modules が復元済み |
| アノテーション | なし                                        |
```

### 注意事項

- `test-desktop` ジョブは 17 シャード並列のため、各シャードが独立した Summary テーブルを出力する（`>>` 追記形式のため競合しない）
- `GITHUB_STEP_SUMMARY` はローカル実行時は利用不可だが `continue-on-error: true` によりスキップされる
