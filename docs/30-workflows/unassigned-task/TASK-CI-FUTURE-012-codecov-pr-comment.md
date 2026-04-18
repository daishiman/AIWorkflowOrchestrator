# Codecov PR コメント自動投稿 - タスク指示書

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-CI-FUTURE-012                                         |
| タスク名     | Codecov PR コメント自動投稿                                |
| 分類         | CI改善 / 機能追加                                          |
| 対象機能     | GitHub Actions CI / Codecov                                |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-CI-FUTURE-007 Phase 12 未タスク検出（将来の改善候補） |
| 発見日       | 2026-04-16                                                 |
| 依存タスク   | TASK-CI-FUTURE-007（backend codecov upload 完了が前提）    |
| Issue        | #2238                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-FUTURE-007 にて `@repo/backend` の Codecov カバレッジアップロードを main push 時のみ実施するよう実装した。この設計は CI 実行時間を最小化する目的で選択されたが、PR のレビュー時にカバレッジ変化が Codecov PR コメントとして表示されない状態になっている。

現在の `.github/workflows/ci.yml` では `test-web` ジョブ（実体は `@repo/backend` テスト）のカバレッジ収集条件が以下のように実装されており、PR 時には `VITEST_SHARDED_COVERAGE` が有効化されない。

```yaml
# 現在の実装（ci.yml 抜粋）
if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
else
pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
fi
```

さらに `coverage` ジョブの実行条件も `github.event_name == 'push' && github.ref == 'refs/heads/main'` となっているため、PR 時には Codecov へのアップロード自体が実行されない。

Codecov の PR コメント機能は、PR のカバレッジ差分（ベースブランチ比）を自動的に PR コメントとして投稿するもので、コードレビュー時にカバレッジへの影響を即座に確認できる。

### 1.2 問題点・課題

- 現在は main push 時のみカバレッジ収集のため、PR では Codecov コメントが投稿されない
- `@repo/backend` のカバレッジ劣化を PR マージ前に検知できない
- `apps/backend/vitest.config.ts` の `enabled: !!process.env.VITEST_SHARDED_COVERAGE` が PR 時には off のまま
- PR 単位でカバレッジ変化の原因を特定する手段がない（main push 後に初めて気づく）

### 1.3 放置した場合の影響

- PR マージ後に初めてカバレッジ劣化が発覚し、修正コストが高くなる
- Codecov ダッシュボードの main push 時のみの記録では、どの PR が劣化を引き起こしたかを特定しにくい
- コードレビュー時にカバレッジへの影響を確認する手段がなく、レビュー品質が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`@repo/backend` のカバレッジを PR 時にも収集・Codecov へアップロードし、PR コメントとしてカバレッジ差分が自動投稿されるようにする。

### 2.2 最終ゴール

PR の push 時にも `@repo/backend` のカバレッジを 2 シャード並列で収集し、Codecov へアップロードする。Codecov は PR コメントとしてベースブランチ比のカバレッジ差分を自動投稿する。main push 時の既存動作を維持したまま、PR 時の挙動を追加する形で実装する。

### 2.3 スコープ

#### 含むもの

- `.github/workflows/ci.yml` の PR 時 backend coverage 収集条件の追加（`test-web` ジョブの分岐ロジック調整）
- `.github/workflows/ci.yml` の `coverage` ジョブの実行条件拡張（PR 時も実行する）
- アーティファクト名の PR 固有化（`${{ github.run_id }}` を含める）による衝突回避
- `codecov.yml` の `comment` セクション設定の確認・調整
- `ci.yml` の `permissions` ブロックへの `pull-requests: write` 追加確認
- 動作検証（実際の PR での Codecov コメント投稿確認）

#### 含まないもの

- `@repo/desktop` や `@repo/web` のカバレッジ変更
- Codecov 有料プランの機能（SLA、フラグ集計等）への依存
- CI 実行時間の大幅増加（現在の +20〜30% 以内に収める）
- E2E テストのカバレッジ収集
- `apps/backend/vitest.config.ts` の vitest 設定自体の変更

### 2.4 成果物

- `.github/workflows/ci.yml`（PR 時 backend coverage 収集・アップロード対応版）
- `codecov.yml`（PR コメント設定の確認・必要に応じた調整版）
- 動作検証結果レポート（PR コメント投稿確認を含む）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-CI-FUTURE-007 が完了し、`@repo/backend` の main push 時 Codecov アップロードが CI 上で安定稼働していること
- `.github/workflows/ci.yml` に `test-web` ジョブ（2 シャード構成）が実装済みであること
- `codecov.yml` に `flags.backend` 設定が存在していること（現在は存在確認済み）
- Codecov の `comment` セクションが `codecov.yml` に設定されていること（現在は `require_changes: true` で設定済み）
- `CODECOV_TOKEN` シークレットが GitHub リポジトリに設定済みであること

### 3.2 依存タスク

- TASK-CI-FUTURE-007（backend codecov upload）の完了が前提

### 3.3 必要な知識

- GitHub Actions の `github.event_name` と `github.ref` の条件分岐
- GitHub Actions の `if:` 条件の OR 式（`||` 演算子）
- GitHub Actions のアーティファクト名の衝突回避（`github.run_id` の使用）
- Codecov の PR コメント機能と `codecov.yml` の `comment` セクション設定
- Codecov の `after_n_builds` 設定（シャード数に合わせた完全なレポート待機）
- GitHub Actions の `permissions` ブロックの `pull-requests: write` 権限
- `VITEST_SHARDED_COVERAGE` 環境変数の動作（`apps/backend/vitest.config.ts` で使用）

### 3.4 推奨アプローチ

#### Step 1: 現在の ci.yml の該当箇所を確認する

```bash
# test-web ジョブの coverage 収集条件を確認
grep -n "VITEST_SHARDED_COVERAGE\|event_name\|coverage\|backend-coverage" \
  .github/workflows/ci.yml
```

#### Step 2: test-web ジョブのカバレッジ収集条件を拡張する

PR 時と main push 時の両方でカバレッジを収集するよう分岐ロジックを変更する。

```yaml
# 変更前（main push 時のみ）
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    else
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    fi

# 変更後（PR 時・main push 時の両方）
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "push" ] && [ "${{ github.ref }}" = "refs/heads/main" ]; then
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    elif [ "${{ github.event_name }}" = "pull_request" ]; then
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    else
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    fi
```

#### Step 3: アーティファクト名を PR 固有化する

PR 時と main push 時で同じアーティファクト名を使うと `if-no-files-found: error` が誤発火するリスクがある。`github.run_id` を含めることで衝突を回避する。

```yaml
# 変更前
- name: Upload backend coverage artifact
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/

# 変更後（PR 時も対応、アーティファクト名を run_id で固有化）
- name: Upload backend coverage artifact
  if: (github.event_name == 'push' && github.ref == 'refs/heads/main') || github.event_name == 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ github.run_id }}-${{ matrix.shard }}
    path: apps/backend/coverage/
    if-no-files-found: error
```

#### Step 4: coverage ジョブの実行条件と download パターンを更新する

```yaml
# 変更前
coverage:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  steps:
    - name: Download backend coverage artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: backend-coverage-*
        path: coverage/backend

# 変更後（PR 時も実行、download パターンを run_id で固有化）
coverage:
  if: (github.event_name == 'push' && github.ref == 'refs/heads/main') || github.event_name == 'pull_request'
  steps:
    - name: Download backend coverage artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: backend-coverage-${{ github.run_id }}-*
        path: coverage/backend
```

#### Step 5: codecov.yml の after_n_builds を確認・設定する

2 シャード中 1 つだけ届いた段階で PR コメントが投稿されることを防ぐため、`after_n_builds` を設定する。

```yaml
# codecov.yml の flags.backend セクションに追加
flags:
  backend:
    paths:
      - apps/backend/
    carryforward: true
    after_n_builds: 2 # シャード数と一致させる
```

#### Step 6: permissions ブロックを確認する

Codecov PR コメントには `pull-requests: write` 権限が必要。現在の `ci.yml` の `permissions` ブロックを確認し、不足していれば追加する。

```bash
# 現在の permissions 設定を確認
grep -A 10 "^permissions:" .github/workflows/ci.yml
```

---

## 4. 実行手順

### Phase 1: 現状調査と変更箇所の特定

#### 目的

現在の `ci.yml` と `codecov.yml` の実装を詳細に確認し、必要な変更箇所を特定する。

#### 手順

1. `ci.yml` の `test-web` ジョブ全体を読み込み、カバレッジ収集ロジックと `Upload backend coverage artifact` ステップを確認する
2. `ci.yml` の `coverage` ジョブ全体を読み込み、実行条件・`needs` 設定・download パターンを確認する
3. `ci.yml` の `permissions` ブロックを確認し、`pull-requests: write` が含まれているか確認する
4. `codecov.yml` の `flags.backend` セクションを確認し、`after_n_builds` が設定されているか確認する
5. `codecov.yml` の `comment` セクションを確認し、PR コメント投稿に必要な設定が揃っているか確認する

```bash
# ci.yml の test-web ジョブと coverage ジョブを確認
grep -n "test-web\|VITEST_SHARDED_COVERAGE\|backend-coverage\|coverage:\|after_n_builds\|pull-requests\|permissions" \
  .github/workflows/ci.yml

# codecov.yml の全内容を確認
cat codecov.yml
```

#### 成果物

- 変更が必要な箇所のリスト（ファイル名・行番号・変更内容）

#### 完了条件

- `ci.yml` の変更が必要な箇所（`test-web` ジョブのカバレッジ収集条件、アーティファクト名、`coverage` ジョブ条件）が特定されている
- `codecov.yml` の `after_n_builds` 設定の有無が確認されている
- `permissions` ブロックの `pull-requests: write` の有無が確認されている

---

### Phase 2: ci.yml の変更実装

#### 目的

`ci.yml` を変更し、PR 時にも `@repo/backend` のカバレッジを収集・Codecov へアップロードできるようにする。

#### 手順

1. `test-web` ジョブのカバレッジ収集ロジックを修正する（PR 時も `VITEST_SHARDED_COVERAGE=true` を有効化）
2. `Upload backend coverage artifact` ステップの `if:` 条件を拡張する（PR 時も実行）
3. アーティファクト名を `backend-coverage-${{ github.run_id }}-${{ matrix.shard }}` に変更する
4. `coverage` ジョブの `if:` 条件を拡張する（PR 時も実行）
5. `coverage` ジョブの `Download backend coverage artifacts` の `pattern` を `backend-coverage-${{ github.run_id }}-*` に変更する
6. `permissions` ブロックに `pull-requests: write` が不足していれば追加する

#### 成果物

- `.github/workflows/ci.yml`（変更済み）

#### 完了条件

- YAML 構文が正しい（`actionlint` でエラーなし、または手動での YAML 構文確認でエラーなし）
- `test-web` ジョブが PR 時にもカバレッジ収集フラグを有効にして実行する
- アーティファクト名に `github.run_id` が含まれている
- `coverage` ジョブの `if:` 条件が PR 時も含むよう更新されている
- `Download backend coverage artifacts` の `pattern` が `run_id` を含む形式になっている

---

### Phase 3: codecov.yml の確認と調整

#### 目的

`codecov.yml` の PR コメント設定と `after_n_builds` を確認し、必要に応じて調整する。

#### 手順

1. `codecov.yml` の `comment` セクションの設定を確認する（現在: `layout: "reach,diff,flags,files"`, `require_changes: true`）
2. `flags.backend` セクションに `after_n_builds: 2` が設定されていない場合は追加する
3. `comment` セクションの `require_changes` の設定を検討する（`true` の場合、カバレッジ変化がない PR ではコメントが投稿されない）

#### 成果物

- `codecov.yml`（`after_n_builds: 2` 追加版、必要に応じて `comment` 設定調整）

#### 完了条件

- `flags.backend` セクションに `after_n_builds: 2` が設定されている
- `comment` セクションの設定が PR コメント投稿に適した内容になっている
- YAML 構文が正しい

---

### Phase 4: ローカル動作検証

#### 目的

変更内容がローカル環境で意図どおり動作することを確認する。

#### 手順

1. `ci.yml` の YAML 構文を確認する

   ```bash
   # actionlint がインストール済みの場合
   actionlint .github/workflows/ci.yml

   # または yq での構文確認
   yq '.' .github/workflows/ci.yml > /dev/null && echo "YAML OK" || echo "YAML ERROR"
   ```

2. `@repo/backend` テストをカバレッジ収集モードで実行し、正常に完了することを確認する

   ```bash
   # シャード 1 のカバレッジ収集実行
   VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage

   # シャード 2 のカバレッジ収集実行
   VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage
   ```

3. `apps/backend/coverage/` ディレクトリにカバレッジレポートが生成されていることを確認する

   ```bash
   ls apps/backend/coverage/
   ```

4. 変更内容が意図したスコープのみに限定されていることを確認する

   ```bash
   git diff --name-only
   ```

#### 成果物

- ローカル実行ログ（テスト実行結果・カバレッジレポート生成確認）

#### 完了条件

- `@repo/backend` テストが 2 シャードともカバレッジ収集モードで正常に完了する
- `apps/backend/coverage/` にカバレッジレポートが生成されている
- YAML 構文確認でエラーがない
- 変更ファイルが `.github/workflows/ci.yml` と `codecov.yml` のみである

---

### Phase 5: CI 動作検証（PR コメント確認）

#### 目的

GitHub Actions 上でカバレッジ収集・Codecov アップロード・PR コメント投稿が正常に動作することを確認する。

#### 手順

1. 変更をブランチにプッシュし、PR を作成する
2. CI が実行されることを確認し、`test-web` ジョブの各シャードがカバレッジ収集モードで実行されることを確認する
   - GitHub Actions のジョブログで `VITEST_SHARDED_COVERAGE=true` が有効になっていることを確認

3. `coverage` ジョブが PR 時にも実行されることを確認する
4. Codecov へのアップロードが成功していることを確認する（ジョブログで `Uploading reports` を確認）
5. PR コメントとして Codecov のカバレッジ差分コメントが投稿されることを確認する
6. 意図的にテストカバレッジを落とした変更を加え、Codecov PR コメントにカバレッジ低下が表示されることを確認する（任意）

#### 成果物

- CI 実行結果スクリーンショットまたは実行 URL
- Codecov PR コメントのスクリーンショットまたは URL

#### 完了条件

- `test-web` ジョブが PR push 時にカバレッジ収集モードで実行される
- `coverage` ジョブが PR push 時に実行される
- Codecov へのアップロードが成功する（ジョブログでエラーなし）
- PR コメントとして Codecov のカバレッジ差分が投稿される
- main push 時の既存動作が壊れていない（main push 時も正常にアップロードされる）

---

### Phase 6: ドキュメント整備と完了処理

#### 目的

変更内容をドキュメント化し、タスクを完了する。

#### 手順

1. 本タスク仕様書（`TASK-CI-FUTURE-012-codecov-pr-comment.md`）のステータスを「完了」に更新する
2. 完了レポートを作成し、`docs/30-workflows/` の適切な場所に保存する
3. TASK-CI-FUTURE-007 の参照情報に本タスクの完了を記録する（任意）

#### 成果物

- 更新済みタスク仕様書（ステータス: 完了）
- 完了レポート（変更内容・動作確認結果を含む）

#### 完了条件

- タスク仕様書のステータスが「完了」に更新されている
- 完了レポートに変更内容（ファイル・行番号・変更前後）が記録されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `@repo/backend` テストが PR push 時にもカバレッジ収集モード（`VITEST_SHARDED_COVERAGE=true`）で実行される
- [ ] PR 時の backend coverage アーティファクトが `backend-coverage-<run_id>-<shard>` 形式でアップロードされる
- [ ] `coverage` ジョブが PR push 時にも実行され、Codecov へアップロードが成功する
- [ ] PR コメントとして Codecov のカバレッジ差分が自動投稿される
- [ ] main push 時の既存動作（main push のみ coverage 収集・アップロード）が維持されている

### パフォーマンス要件

- [ ] PR 時の CI 実行時間増加が現在比 +20〜30% 以内に収まっている（backend テストのカバレッジ収集追加分のみ）
- [ ] アーティファクト名の `run_id` 固有化により、並行実行時のアーティファクト衝突が発生しない

### 品質要件

- [ ] YAML 構文が正しく、GitHub Actions の lint でエラーがない
- [ ] 変更がスコープ（`.github/workflows/ci.yml` / `codecov.yml`）のみに限定されている
- [ ] `codecov.yml` の `flags.backend` に `after_n_builds: 2` が設定されている
- [ ] `ci.yml` の `permissions` ブロックに `pull-requests: write` が設定されている（Codecov PR コメント投稿に必要）

### ドキュメント要件

- [ ] 動作確認結果が完了レポートに記録されている
- [ ] アーティファクト名変更の影響範囲（既存の monitoring ワークフロー等との整合性）が確認されている

---

## 6. 検証方法

### テストケース

- Case 1: PR を作成し、`test-web` ジョブが 2 シャードともカバレッジ収集モードで完了する
- Case 2: PR の `coverage` ジョブが実行され、Codecov へのアップロードがエラーなく完了する
- Case 3: PR コメントとして Codecov のカバレッジ差分コメントが投稿される
- Case 4: main push 時にも既存どおり `coverage` ジョブが実行され、Codecov へのアップロードが成功する
- Case 5: 同じリポジトリで複数の PR が並行して CI を実行した場合、アーティファクト名が衝突しない
- Case 6: `codecov.yml` の `after_n_builds: 2` により、2 シャードのアップロードが揃うまで PR コメントが投稿されない

### 検証コマンド

```bash
# YAML 構文確認（actionlint がインストール済みの場合）
actionlint .github/workflows/ci.yml

# @repo/backend テストのカバレッジ収集ローカル実行（シャード 1）
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage

# @repo/backend テストのカバレッジ収集ローカル実行（シャード 2）
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage

# カバレッジレポートの生成確認
ls -la apps/backend/coverage/

# codecov.yml の構文確認
yq '.' codecov.yml > /dev/null && echo "YAML OK"

# codecov.yml の after_n_builds 設定確認
yq '.flags.backend.after_n_builds' codecov.yml

# ci.yml の permissions 設定確認
grep -A 10 "^permissions:" .github/workflows/ci.yml

# ci.yml のアーティファクト名確認
grep -n "backend-coverage" .github/workflows/ci.yml

# 変更ファイルの確認（スコープ外変更がないことを確認）
git diff --name-only
```

---

## 7. リスクと対策

| リスク                                                                                                                | 影響度 | 発生確率 | 対策                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アーティファクト名が PR 時と main push 時で衝突し、`if-no-files-found: error` が誤発火する                            | 高     | 高       | アーティファクト名に `${{ github.run_id }}` を含めることで、実行ごとに一意な名前を保証する。`Download` の `pattern` も同様に `run_id` を含む形式に変更する                                  |
| `coverage` ジョブの `needs` 条件が PR 時に正しく解決されず、ジョブがスキップされる                                    | 高     | 中       | `coverage` ジョブの `if:` 条件を `(github.event_name == 'push' && github.ref == 'refs/heads/main') \|\| github.event_name == 'pull_request'` に変更し、両ケースをカバーする                 |
| Codecov PR コメントの `pull-requests: write` 権限が不足し、コメント投稿が 403 エラーになる                            | 高     | 中       | `ci.yml` の `permissions` ブロックに `pull-requests: write` を追加する。既存設定で既に含まれている場合は不要                                                                                |
| `after_n_builds: 2` を設定しない場合、シャード 1 のアップロード時点で不完全な PR コメントが投稿される                 | 中     | 高       | `codecov.yml` の `flags.backend` に `after_n_builds: 2` を追加し、2 シャードのアップロードが揃うまで PR コメント投稿を待機させる                                                            |
| PR 時のカバレッジ収集により CI 実行時間が想定以上に増加し、開発体験が悪化する                                         | 中     | 低       | backend テストは 2 シャードで既に並列実行されており、カバレッジ収集による追加時間は各シャードで 10〜20% 程度（vitest の coverage instrumentation overhead）と見込む。Phase 5 で実測値を確認 |
| `require_changes: true` の設定により、カバレッジ変化のない PR ではコメントが投稿されず、機能が有効か判断しにくい      | 低     | 中       | 初回動作確認時は `require_changes: false` に一時変更してコメント投稿を確認する。動作確認後に `true` に戻す（または運用方針に応じて設定を維持する）                                          |
| main push 時の既存アーティファクト名（`backend-coverage-<shard>`）を変更することで、monitoring ワークフロー等が壊れる | 中     | 低       | アーティファクト名の変更影響範囲を Phase 1 で確認する。`ci.yml` および関連ワークフロー（`ci-timing-monitor.yml` 等）で `backend-coverage-*` パターンを参照している箇所を洗い出す            |

---

## 8. 参照情報

### 関連ドキュメント

- `.github/workflows/ci.yml`（現在の CI 設定・`test-web` ジョブ・`coverage` ジョブ）
- `codecov.yml`（Codecov 設定・`flags.backend`・`comment` セクション）
- `apps/backend/vitest.config.ts`（backend の Vitest 設定・`VITEST_SHARDED_COVERAGE` 環境変数）
- `docs/30-workflows/task-ci-future-007-backend-codecov-upload/`（前提タスク仕様書）

### 関連タスク

- TASK-CI-FUTURE-007: backend codecov upload（本タスクの直接の前提タスク・main push 時 Codecov アップロード実装）
- TASK-CI-FUTURE-008: test-web 実行時間モニタリング設定（CI 品質改善の関連タスク）

### 参考リンク

- [Codecov PR コメント設定ドキュメント](https://docs.codecov.com/docs/pull-request-comments)
- [Codecov YAML リファレンス（after_n_builds）](https://docs.codecov.com/docs/codecovyml-reference)
- [Codecov GitHub Actions（codecov/codecov-action）](https://github.com/codecov/codecov-action)
- [GitHub Actions の permissions ブロック](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)
- [GitHub Actions のアーティファクト（actions/upload-artifact v4）](https://github.com/actions/upload-artifact)
- [GitHub Actions の条件式（if: 構文）](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CI-FUTURE-007 から引き継いだ知見（実作業時に参照すること）:

| 症状                                                                                                                                                             | 原因                                                                                                                                                       | 対応                                                                                                                                                          | 再発防止                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR 時と main push 時で同じアーティファクト名 `backend-coverage-<shard>` を使うと `if-no-files-found: error` が誤発火した                                         | `coverage` ジョブの `if:` 条件を変更して PR 時も実行するようにした際、main push でも PR でも同じ名前でアップロードが競合した                               | アーティファクト名に `${{ github.run_id }}` を含め `backend-coverage-<run_id>-<shard>` 形式にすることで、実行ごとに一意な名前を保証した                       | アーティファクト名は常に `github.run_id` または `github.sha` を含む形式にし、複数トリガーで同じジョブが実行される場合の衝突リスクを設計段階で排除する                |
| シャード 1 のアップロード完了直後に Codecov が不完全なカバレッジで PR コメントを投稿した                                                                         | `codecov.yml` の `flags.backend` に `after_n_builds` を設定していなかったため、最初のアップロード（シャード 1）だけで Codecov が通知を送出した             | `codecov.yml` の `flags.backend` セクションに `after_n_builds: 2` を追加し、2 シャードのアップロードが完了するまで通知を待機させた                            | シャード並列実行でカバレッジを分割アップロードする場合は、必ずシャード数と一致した `after_n_builds` を `codecov.yml` に設定する                                      |
| `coverage` ジョブの `if:` 条件を変更した後、`needs` に指定したジョブ（`test-web`）が PR 時にも正常に完了しているにもかかわらず `coverage` ジョブがスキップされた | `needs` に指定したジョブの `if:` 条件も PR 時を考慮していなかったため、依存ジョブのステータスが `skipped` となり `coverage` ジョブも連動してスキップされた | `coverage` ジョブの `if:` 条件だけでなく、`needs` に指定したジョブ（`test-web`）のアーティファクトアップロードステップの `if:` 条件も PR 時を含むよう変更した | `coverage` ジョブのような集約ジョブを追加トリガーに対応させる際は、`needs` チェーン全体の `if:` 条件を上流から順に確認し、一貫性を保つ                               |
| Codecov PR コメントが投稿されず、Codecov の Web UI でも PR のカバレッジが表示されなかった                                                                        | `ci.yml` の `permissions` ブロックに `pull-requests: write` が含まれておらず、Codecov Action が PR にコメントを書き込めなかった                            | `ci.yml` のトップレベル `permissions` ブロックに `pull-requests: write` を追加した                                                                            | Codecov PR コメントやその他 PR への書き込みを行う Action を追加する際は、事前に `permissions` ブロックに `pull-requests: write` が含まれているか確認する習慣をつける |

### 補足事項

- 本タスクは TASK-CI-FUTURE-007 Phase 12 の未タスク検出で発見され、正式なタスクとして切り出したものである
- 現在の `codecov.yml` には `comment` セクションが既に設定されている（`layout: "reach,diff,flags,files"`, `require_changes: true`）ため、PR コメント自体の設定変更は最小限で済む可能性が高い
- `require_changes: true` の設定はカバレッジ変化がない PR ではコメントが投稿されないため、初回の動作確認時は一時的に `false` に変更することを推奨する
- `after_n_builds` はフラグ（`flags.backend`）レベルの設定であるため、`desktop` フラグとは独立して設定できる。`desktop` フラグは既存のシャード数（15）に合わせた設定を別途確認すること
- CI 実行時間への影響は `@repo/backend` テストのカバレッジ収集追加分のみであり、テスト自体はすでに並列実行されているため大幅な増加は見込まれない。Phase 5 で実測値を計測し、+30% 超の場合は優先度を再検討すること
