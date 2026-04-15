# キャッシュステップ現状確認

## メタ情報

| 項目   | 内容                       |
| ------ | -------------------------- |
| Phase  | 1                          |
| 機能名 | TASK-CI-FUTURE-003         |
| 作成日 | 2026-04-15                 |
| 担当   | 設計・要件定義エージェント |

---

## Task 1-A: 現状確認結果

### キャッシュステップの一覧

#### `.github/actions/pnpm-install-retry/action.yml`

| ステップ名         | `id`                 | アクション         | キャッシュキー構造                                                                      |
| ------------------ | -------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| Cache node_modules | `cache-node-modules` | `actions/cache@v4` | `${OS}-node-modules-v2-${ELECTRON_SKIP_BINARY_DOWNLOAD条件}-${pnpm-lock.yaml ハッシュ}` |

**重要**: キャッシュステップは `.github/actions/pnpm-install-retry/action.yml`（カスタム複合アクション）内に存在する。`ci.yml` の各ジョブは `uses: ./.github/actions/pnpm-install-retry` でこのアクションを呼び出している。

### `id` の設定状況

| ファイル                                        | ステップ           | `id` の状態                       |
| ----------------------------------------------- | ------------------ | --------------------------------- |
| `.github/actions/pnpm-install-retry/action.yml` | Cache node_modules | ✅ 設定済み: `cache-node-modules` |

### `outputs` の参照可能性

`actions/cache@v4` は以下の outputs を提供する：

| output 名           | 型      | 説明                                                                  |
| ------------------- | ------- | --------------------------------------------------------------------- |
| `cache-hit`         | boolean | 完全一致キーでヒットした場合 `true`。フォールバックヒット時は `false` |
| `node_modules` 存在 | boolean | cache restore 直後に node_modules 群が存在する場合 `true`             |

**アーキテクチャ上の制約**: `cache-node-modules` ステップはカスタムアクション内にあるため、`ci.yml` から直接 `steps.cache-node-modules.outputs.*` を参照することはできない。判定ステップをカスタムアクション内に配置することで解決する（Phase 2 設計に反映）。

### `restore-keys` の設定

```yaml
restore-keys: |
  ${{ runner.os }}-node-modules-v2-${{ env.ELECTRON_SKIP_BINARY_DOWNLOAD == '1' && 'no-electron-' || '' }}
  ${{ runner.os }}-node-modules-v2-
```

- フォールバック1: 同一 OS + 同一 Electron 条件のすべてのキャッシュ
- フォールバック2: OS 共通のすべての `v2` キャッシュ

---

## 対象ジョブ一覧

`pnpm-install-retry` アクションを利用しているジョブ（`ci.yml`）：

| ジョブ名            | タイムアウト | `ELECTRON_SKIP_BINARY_DOWNLOAD` | 備考                           |
| ------------------- | ------------ | ------------------------------- | ------------------------------ |
| `lint`              | 10 min       | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `typecheck`         | 10 min       | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `build-shared`      | 5 min        | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `test-shared`       | 10 min       | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `test-desktop`      | 15 min       | なし（Electron 含む）           | 17シャード並列                 |
| `e2e-desktop`       | 15 min       | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `check-module-sync` | 5 min        | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `security`          | 5 min        | `1` (あり)                      | ノードモジュールキャッシュ利用 |
| `build`             | 15 min       | なし（設定なし）                | 最終ビルド確認                 |

**合計**: 9 ジョブ（`test-desktop` は 17 並列シャード）

---

## 結論

| 確認事項                                     | 結果                                               |
| -------------------------------------------- | -------------------------------------------------- |
| キャッシュステップに `id` が設定されているか | ✅ 設定済み                                        |
| `cache-hit` outputs が参照可能か             | ✅ アクション内で参照可能                          |
| `node_modules` 存在の確認が可能か            | ✅ アクション内で確認可能                          |
| Phase 2 での追加設計が必要な事項             | 判定ステップをアクション内に配置する設計方針の決定 |
