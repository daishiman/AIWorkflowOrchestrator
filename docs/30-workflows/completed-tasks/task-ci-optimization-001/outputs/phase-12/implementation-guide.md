# CI 最適化 実装ガイド（TASK-CI-OPT-001）

作成日: 2026-04-14

---

## Part 1: 中学生レベルの説明

### なぜ GitHub CI を速くする必要があったのか

コードを変更するたびに、「ちゃんと動くかな？」を自動で確認してくれる仕組みが GitHub CI です。
でも今まで、この確認が **15分以上** かかっていました。

コードを直すたびに15分待つのは大変ですよね。これを **7分40秒以内** に縮めることが今回の目標でした。

---

### なぜ遅かったのか

毎回 `pnpm install` というコマンドを実行して、プログラムが動くために必要なファイル（`node_modules`）をダウンロードしていました。

これは、**毎日スーパーに買い物に行く**ようなものです。冷蔵庫に同じ食材がまだあるのに、毎回買いに行くのは無駄ですよね。

しかも、GitHub CI には複数のチェック係（ジョブ）がいて、それぞれが別々にダウンロードしていました。全員が毎回スーパーに行っていたわけです。

---

### なぜ速くなったのか

**1. node_modules をキャッシュ（保存）するようにした**

一度ダウンロードしたファイルを「冷蔵庫」に入れておいて、次回はそこから取り出すようにしました。これが `actions/cache@v4` という仕組みです。

ただし、材料リスト（`pnpm-lock.yaml`）が変わった時は、新鮮なものを買い直します（キャッシュを自動で無効化）。

削減効果: **約3〜4分**

---

**2. テストを 16グループ → 17グループに分けた（シャード数の調整）**

399個のテストを、複数の担当者に分けて同時に実行しています。これを「シャード」と呼びます。

レジが16個あるスーパーを、17個に増やすイメージです。1人あたりの担当が少し減って、全体が少し速くなります。

削減効果: **約20〜30秒**

---

**3. 各担当者が同時に処理できる数を増やした（CI_MAX_FORKS）**

`CI_MAX_FORKS` は、各シャード（担当者）が同時に処理できるテストの並列数です。

これを 2 から 3 に増やして、担当者一人が同時に3つの仕事をこなせるようにしました。

削減効果: **約30秒前後**

---

### まとめ

| 改善                      | たとえ話                               | 削減効果        |
| ------------------------- | -------------------------------------- | --------------- |
| node_modules をキャッシュ | 冷蔵庫を使う（毎回スーパーに行かない） | ~3〜4分         |
| シャード数 16→17          | レジを1つ増やす                        | ~20〜30秒       |
| CI_MAX_FORKS 2→3          | 担当者を少し多く動かす                 | ~30秒           |
| **合計**                  |                                        | **~4〜5分削減** |

---

## Part 2: 技術者向け詳細

### 変更ファイル一覧

| ファイル                                        | 変更内容                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `.github/actions/pnpm-install-retry/action.yml` | `actions/cache@v4` による node_modules キャッシュを追加                   |
| `.github/actions/pnpm-install-retry/action.yml` | キャッシュキーに `ELECTRON_SKIP_BINARY_DOWNLOAD` フラグを組み込み（後述） |
| `.github/actions/pnpm-install-retry/action.yml` | `apps/backend/node_modules` をキャッシュパスに追加（TypeCheck 修正）      |
| `.github/workflows/ci.yml`                      | test-desktop シャード数を 16→17 に変更                                    |
| `apps/desktop/vitest.config.ts`                 | `CI_MAX_FORKS` を 2→3 に変更                                              |

---

### actions/cache@v4 の設計詳細

#### キャッシュキー設計

```yaml
key: ${{ runner.os }}-node-modules-${{ hashFiles('pnpm-lock.yaml') }}
restore-keys: |
  ${{ runner.os }}-node-modules-
```

- **key**: `pnpm-lock.yaml` のハッシュを使用。lockfile 変更時に自動でキャッシュが無効化される。
- **restore-keys**: OS プレフィックスのみのフォールバック。部分キャッシュ適用後に `pnpm install` が差分のみ実行。

#### pnpm の2段階キャッシュ戦略

| キャッシュ種別          | 設定                          | 効果                                            |
| ----------------------- | ----------------------------- | ----------------------------------------------- |
| pnpm ストアキャッシュ   | `cache: "pnpm"` (setup-node)  | パッケージのダウンロード省略                    |
| node_modules キャッシュ | `actions/cache@v4` (新規追加) | install・postinstall・native rebuild を完全省略 |

既存の `cache: "pnpm"` はストアキャッシュのみで、`pnpm install` 自体のコスト（リンク作成・postinstall）は毎回発生していた。新規追加の `node_modules` キャッシュにより、この固定コストを完全に省略できる。

#### fallback 動作

```yaml
- name: Install dependencies with retry
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
```

- **完全ヒット**: install スキップ（最速）
- **パーシャルヒット**: 差分 install（中速）
- **完全ミス**: フルインストール（従来と同等）

---

### シャード数の選択基準

計算式: `ファイル数 ÷ シャード数 × 実行時間` でバランスを取る

| シャード数 | ファイル/シャード | GitHub Free Tier (上限20) | 採用     |
| ---------- | ----------------- | ------------------------- | -------- |
| 16         | 24.9              | 16+4=20 ✅                | 旧設定   |
| **17**     | **23.5**          | **17+3=20 ✅**            | **採用** |
| 18         | 22.2              | 18+3=21 ❌                | 超過     |

シャード17で `test-desktop×17 + typecheck×1 + test-shared×1 + e2e×1 = 20`（上限ちょうど）。

---

### CI_MAX_FORKS と GitHub runner vCPU 数の関係

- **GitHub 無料ランナー**: 2 vCPU、7GB メモリ
- **CI_MAX_FORKS=3 の根拠**: I/O 待機中の CPU アイドルを活用。3プロセスで vCPU を有効利用。

メモリ試算:

| 項目                      | 値          |
| ------------------------- | ----------- |
| ランナーメモリ            | 7GB         |
| 1プロセスあたり推定メモリ | ~200〜400MB |
| CI_MAX_FORKS=3 の合計     | ~1.2〜1.6GB |
| 余裕                      | ~5.4GB      |

OOM リスクは低い。OOM が発生した場合は `CI_MAX_FORKS = 2` に戻す（独立ロールバック可能）。

---

### 変更前後の比較表

| 指標                    | 変更前        | 変更後                    |
| ----------------------- | ------------- | ------------------------- |
| CI 全体実行時間（平均） | 924s (15m24s) | 460s (7m40s) 以内（目標） |
| node_modules キャッシュ | なし          | `actions/cache@v4`        |
| テストシャード数        | 16            | 17                        |
| CI_MAX_FORKS            | 2             | 3                         |

---

---

### Electron バイナリ分離キャッシュ設計（CI修正追記）

#### 発生した問題

`ELECTRON_SKIP_BINARY_DOWNLOAD=1` を設定した Lint / TypeCheck / build-shared ジョブが先にキャッシュを作成した場合、Electron バイナリ（`node_modules/.pnpm/electron@*/node_modules/electron/dist/`）が含まれない node_modules がキャッシュされる。

その後 `test-desktop` ジョブが同一キーでキャッシュをヒットし、`pnpm install` をスキップすると Electron バイナリが存在しないまま vitest が起動し、以下のエラーで全シャードが失敗する。

```
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

#### 修正方針

キャッシュキーに `ELECTRON_SKIP_BINARY_DOWNLOAD` フラグの有無を埋め込み、2種類のキャッシュエントリに分離する。

```yaml
key: ${{ runner.os }}-node-modules-${{ env.ELECTRON_SKIP_BINARY_DOWNLOAD == '1' && 'no-electron-' || '' }}${{ hashFiles('pnpm-lock.yaml') }}
restore-keys: |
  ${{ runner.os }}-node-modules-${{ env.ELECTRON_SKIP_BINARY_DOWNLOAD == '1' && 'no-electron-' || '' }}
  ${{ runner.os }}-node-modules-
```

| ジョブ種別                         | 作成キー例                              | Electron バイナリ |
| ---------------------------------- | --------------------------------------- | ----------------- |
| Lint / TypeCheck / build-shared 等 | `Linux-node-modules-no-electron-<hash>` | 含まない          |
| test-desktop / build               | `Linux-node-modules-<hash>`             | 含む              |

#### フォールバック動作

| restore-keys 順位 | test-desktop ジョブでの動作                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| 1位（完全一致）   | `...-<hash>` にヒット → install スキップ（最速）                                   |
| 2位（部分一致）   | `...-node-modules-` プレフィックスにヒット → install 実行（Electron ダウンロード） |
| ミス              | フルインストール（従来と同等）                                                     |

2位のフォールバックで `no-electron-` キャッシュを受け取っても `cache-hit != 'true'` なので `pnpm install` が走り、Electron バイナリが補完される。完全ヒット（1位）の場合は分離済みキーのため必ずバイナリ入りキャッシュが返る。

---

### エッジケースと注意点

1. **`pnpm-lock.yaml` が変わるとキャッシュミスが発生する**
   - 新しいパッケージ追加時など。初回のみフルインストールが走り、次回からキャッシュが有効になる。

2. **初回実行はキャッシュ未作成のためフルインストールが走る**
   - PR 初回 push 時は従来と同等の時間がかかる。2回目以降から恩恵を受ける。

3. **GitHub Actions キャッシュの上限は 10GB/リポジトリ**
   - node_modules 合計 ~500MB〜1GB のため余裕あり。古いキャッシュは自動で LRU 削除される。

4. **CI_MAX_FORKS=3 でOOMが発生した場合**
   - `vitest.config.ts` の `CI_MAX_FORKS = 3` を `CI_MAX_FORKS = 2` に戻すことで即時対処可能。
