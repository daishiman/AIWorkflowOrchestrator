# 実装ガイド

## 作成日

2026-02-02

---

# Part 1: 概念的説明（中学生でもわかる版）

## CI/CDとは何か

### 日常の例え話

CI/CDは、**宿題を提出する前に自動で文法チェックしてくれる仕組み**のようなものです。

学校で作文を提出するとき、先生に出す前に：

1. 漢字の間違いがないか確認する
2. 文法がおかしくないか確認する
3. 内容が要件を満たしているか確認する

これを毎回手動でやるのは大変ですよね。

CI/CDは、コードを書いたら自動的にこれらのチェックをしてくれます。

- **CI（継続的インテグレーション）**: コードを書くたびに自動でテストする
- **CD（継続的デリバリー）**: テストが通ったら自動で本番環境に届ける

## なぜテストを並列化するのか

### 日常の例え話

**「1人で掃除するより、8人で分担した方が早い」**

教室の掃除を考えてみましょう：

- 1人で掃除：30分
- 8人で分担：4分くらい

テストも同じです：

- 1台のコンピュータで順番にテスト：20分
- 8台のコンピュータで同時にテスト：3分くらい
- **16台に増やせば**：もっと早くなる！

今回の改善では、8人から16人に掃除係を増やしたようなものです。

## キャッシュとは何か

### 日常の例え話

**「毎回買い物に行かず、冷蔵庫に保存しておく」**

カレーを作るとき：

- 毎回材料を買いに行く → 時間がかかる
- 冷蔵庫に材料を保存しておく → すぐ作れる

プログラムの世界でも同じです：

- 毎回必要なファイルをダウンロード → 時間がかかる
- 一度ダウンロードしたら保存しておく → 次からは速い

これが「キャッシュ」です。

## 今回の改善で何が変わったか

| 項目             | 改善前 | 改善後       | わかりやすく言うと |
| ---------------- | ------ | ------------ | ------------------ |
| テスト担当者の数 | 8人    | 16人         | 倍の人数で掃除     |
| 材料の保存       | なし   | あり         | 冷蔵庫を使う       |
| 全部チェック     | 毎回   | 必要な時だけ | 効率よくチェック   |

結果：**待ち時間が約半分**になります！

---

# Part 2: 技術的詳細（開発者向け）

## 1. シャード数変更の技術的詳細

### 変更内容

```yaml
# 変更前
matrix:
  shard: [1, 2, 3, 4, 5, 6, 7, 8]

# 変更後
matrix:
  shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

### 設計根拠

| 項目                        | 値   |
| --------------------------- | ---- |
| テストファイル数            | 399  |
| 変更前シャード数            | 8    |
| 変更後シャード数            | 16   |
| ファイル/シャード（変更前） | 約50 |
| ファイル/シャード（変更後） | 約25 |

## 1.5. ローカル環境の並列化最適化

### 変更内容

**vitest.config.ts**:

```typescript
import { cpus } from "os";

// CI環境: 4並列（2コア × 2）
const CI_MAX_FORKS = 4;

// ローカル環境: CPUコア数に基づいて動的設定
// コア数の半分（最低2、最大8）
const cpuCount = cpus().length;
const LOCAL_MAX_FORKS = process.env.VITEST_MAX_FORKS
  ? parseInt(process.env.VITEST_MAX_FORKS, 10)
  : Math.max(2, Math.min(8, Math.floor(cpuCount / 2)));

// ファイル並列化（CI・ローカル両方で有効）
const enableFileParallelism = process.env.VITEST_FILE_PARALLELISM !== "false";
```

**package.json**:

```json
{
  "scripts": {
    "validate": "run-p lint typecheck test",
    "check": "run-p lint typecheck",
    "test": "pnpm -r --parallel test:run",
    "typecheck": "pnpm -r --parallel typecheck"
  }
}
```

### 設計根拠

| 項目                    | 設定値                     | 理由                            |
| ----------------------- | -------------------------- | ------------------------------- |
| LOCAL_MAX_FORKS         | CPUコア数/2（2〜8）        | メモリとCPUのバランス           |
| VITEST_MAX_FORKS        | 環境変数で上書き可能       | マシンスペックに応じて調整可能  |
| VITEST_FILE_PARALLELISM | デフォルトtrue             | メモリ不足時にfalseで無効化可能 |
| run-p (npm-run-all2)    | クロスプラットフォーム対応 | Windows/macOS/Linux全対応       |

### 環境変数による制御

```bash
# 並列度を6に設定（高スペックマシン向け）
VITEST_MAX_FORKS=6 pnpm test

# ファイル並列化を無効化（メモリ16GB未満の場合）
VITEST_FILE_PARALLELISM=false pnpm test

# 両方を組み合わせ
VITEST_MAX_FORKS=2 VITEST_FILE_PARALLELISM=false pnpm test
```

### Vitestシャーディング

Vitestの`--shard=N/M`オプションを使用：

- テストファイルをハッシュで分散
- 各シャードが独立して実行可能
- 結果の集約はGitHub Actionsで実施

## 2. キャッシュ戦略の設計根拠

### shared packageビルドキャッシュ

```yaml
- name: Cache shared package build
  id: cache-shared-build
  uses: actions/cache@v4
  with:
    path: packages/shared/dist
    key: shared-build-${{ runner.os }}-${{ hashFiles('packages/shared/src/**', 'pnpm-lock.yaml') }}
    restore-keys: |
      shared-build-${{ runner.os }}-
```

**キー設計**:

- `runner.os`: OS依存のバイナリに対応
- `hashFiles('packages/shared/src/**')`: ソースコード変更で無効化
- `hashFiles('pnpm-lock.yaml')`: 依存関係変更で無効化

**restore-keys**: 部分マッチでフォールバック

### 条件付きビルド

```yaml
- name: Build shared package
  if: steps.cache-shared-build.outputs.cache-hit != 'true'
  run: pnpm --filter @repo/shared build
```

キャッシュヒット時はビルドをスキップ。

## 3. Vitest設定変更の根拠

### 変更内容

```typescript
// 定数定義
const CI_MAX_FORKS = 4;
const LOCAL_MAX_FORKS = 2;

poolOptions: {
  forks: {
    maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
    isolate: true,
  },
},
fileParallelism: !!process.env.CI,
```

### maxForks: 2 → 4 (CI時)

| 項目                   | 値                           |
| ---------------------- | ---------------------------- |
| GitHub Actionsランナー | 2コア、8GB RAM               |
| I/O待ち時間            | テストのimport/setup中に発生 |
| 最適値                 | コア数 × 2 = 4               |

CPUバウンドではなくI/Oバウンドのため、コア数以上の並列化が有効。

### fileParallelism: false → true (CI時)

メモリ8GBで複数ファイルの同時実行が安定動作。
`isolate: true`でプロセス間の干渉を防止。

## 4. カバレッジ条件分岐のロジック

### 実装

```yaml
- name: Run desktop app tests (shard ${{ matrix.shard }}/16)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16
    else
      pnpm --filter @repo/desktop test:run -- --shard=${{ matrix.shard }}/16 --coverage
    fi
```

### 条件分岐ロジック

| 条件                                  | カバレッジ | 理由               |
| ------------------------------------- | ---------- | ------------------ |
| `github.event_name == 'pull_request'` | なし       | 高速フィードバック |
| `github.event_name == 'push'`         | あり       | 品質メトリクス     |

### 品質担保の仕組み

1. **ローカルしきい値チェック**: `vitest.config.ts`で80%未満は失敗
2. **mainマージ時Codecov**: 80%を維持、1%の変動許容

## 5. トラブルシューティングガイド

### キャッシュがヒットしない

**原因**:

1. `packages/shared/src/**`内のファイル変更
2. `pnpm-lock.yaml`の変更

**対処**: 意図した変更であれば正常動作。restore-keysでフォールバック。

### メモリ不足エラー（CI）

**原因**: maxForks=4でメモリ不足

**対処**:

```typescript
// 一時的に並列度を下げる
const CI_MAX_FORKS = 2;
```

### ローカルでテストが遅い

**原因**: 並列化設定が無効になっている

**確認・対処**:

```bash
# 環境変数で並列度を調整
VITEST_MAX_FORKS=4 pnpm test

# ファイル並列化を無効化（メモリ不足時）
VITEST_FILE_PARALLELISM=false pnpm test
```

### シャード間でテスト失敗

**原因**: テスト間の依存関係

**対処**: `isolate: true`が設定されていることを確認
