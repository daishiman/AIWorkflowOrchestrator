# @repo/backend Codecov カバレッジアップロード対応 - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-CI-FUTURE-007                                  |
| タスク名     | @repo/backend Codecov カバレッジアップロード対応    |
| 分類         | 機能追加                                            |
| 対象機能     | GitHub Actions CI / Codecov                         |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | phase12_completed（Phase 13 blocked - PR 作成待ち） |
| 発見元       | TASK-CI-FUTURE-002 Phase 12 未タスク検出            |
| 発見日       | 2026-04-15                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-FUTURE-002 の実装中に `test-web` ジョブの実体が `@repo/backend`（`apps/backend/`）であることが判明した。現在の CI では `@repo/desktop` のカバレッジのみが Codecov にアップロードされており、`@repo/backend` のカバレッジは収集・可視化されていない。

現時点の `.github/workflows/ci.yml` の `coverage` ジョブは以下のように `test-desktop` の成果物のみを扱っている:

```yaml
issue_number: 2186
coverage:
  needs: [test-shared, test-desktop]
  steps:
    - name: Download desktop coverage artifacts
      # desktop-coverage-* のみ対象
    - name: Upload coverage to Codecov
      flags: desktop
```

`@repo/backend` のテストは `test-web` ジョブ（2 シャード）で実行されているが、カバレッジ収集ステップ（`--coverage`）が追加されておらず、Codecov へのアップロードも行われていない。

### 1.2 問題点・課題

- `@repo/backend` のテストカバレッジが Codecov で可視化されていないため、バックエンドのテスト品質をダッシュボードで継続的に把握できない
- PR ごとのカバレッジ差分コメントが `desktop` フラグのみに紐づいており、バックエンドのカバレッジ低下を検知できない
- `test-web` ジョブはカバレッジ収集オプション（`--coverage`）を渡していないため、カバレッジデータが生成されていない
- `desktop` と同様に「PR 時はスキップ、main push 時に収集」というパターンを `backend` にも適用する必要があるが、現在未実装である

### 1.3 放置した場合の影響

- バックエンドのテスト品質が可視化されないまま、コードベースが成長し続ける
- テストカバレッジが低いモジュールへの変更が PR レビューで気づかれにくくなる
- `desktop` は Codecov で管理されているが `backend` は管理外という非対称性が生じ、品質管理の一貫性が損なわれる
- 将来的にカバレッジ閾値を設定する際に、`backend` の初期カバレッジデータが存在しないため基準値の設定が困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`@repo/backend` のテストカバレッジを Codecov に収集・アップロードし、バックエンドのテスト品質を継続的に可視化できる状態を実現する。

### 2.2 最終ゴール

- `test-web` ジョブ（`@repo/backend` の 2 シャード）でカバレッジデータを生成する
- `coverage` ジョブで `backend` のカバレッジアーティファクトを収集し、Codecov に `backend` フラグでアップロードする
- `desktop` と同様に PR 時はカバレッジをスキップし、main push 時のみ収集することで CI の高速性を維持する

### 2.3 スコープ

#### 含むもの

- `.github/workflows/ci.yml` の `test-web` ジョブへのカバレッジ収集ステップ追加（main push 時のみ `--coverage` オプションを付与）
- `.github/workflows/ci.yml` の `coverage` ジョブへの `backend` カバレッジアーティファクトのダウンロード・アップロードステップ追加
- `apps/backend/vitest.config.ts` または相当する設定ファイルのカバレッジ設定確認・追加（必要な場合）
- `VITEST_SHARDED_COVERAGE` 環境変数パターンを `backend` にも適用（`desktop` と同様の分岐処理）
- 動作検証（ローカルでのカバレッジ生成確認・CI での Codecov アップロード確認）

#### 含まないもの

- `@repo/shared` のカバレッジ収集（別タスクで対応する場合は新規タスクを作成する）
- Codecov の設定ファイル（`codecov.yml`）の変更
- カバレッジ閾値（`threshold`）の設定
- E2E テスト（Playwright）のカバレッジ収集
- `@repo/desktop` のカバレッジ設定の変更

### 2.4 成果物

- 修正済み `.github/workflows/ci.yml`（`test-web` ジョブへの `--coverage` 追加・`coverage` ジョブへの `backend` 対応追加）
- 修正済み `apps/backend/vitest.config.ts`（カバレッジ設定が必要な場合のみ）
- 動作検証結果レポート（Codecov への `backend` フラグアップロードの確認を含む）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-CI-FUTURE-002 が完了し、`test-web` ジョブ（2 シャード、`@repo/backend`）が CI 上で安定稼働していること
- Codecov トークン（`CODECOV_TOKEN`）が GitHub リポジトリの Secrets に設定済みであること
- `apps/backend/` ディレクトリが存在し、Vitest でテストが実行できる状態であること
- `pnpm install` が完了していること

### 3.2 依存タスク

- TASK-CI-FUTURE-002（test-web シャード化）の完了が前提

### 3.3 必要な知識

- GitHub Actions の `if` 条件分岐（`github.event_name != 'pull_request'`）
- Vitest の `--coverage` オプションとシャード化カバレッジの統合方法（`VITEST_SHARDED_COVERAGE` 環境変数）
- Codecov の `flags` パラメータによる複数カバレッジレポートの分離管理
- `actions/upload-artifact@v4` / `actions/download-artifact@v4` による成果物の受け渡しパターン
- pnpm monorepo でのフィルタコマンド構文（`pnpm --filter @repo/backend exec vitest run`）

### 3.4 推奨アプローチ

#### Step 1: apps/backend の Vitest 設定を確認する

```bash
# vitest.config.ts の存在とカバレッジ設定を確認する
cat apps/backend/vitest.config.ts
# または
cat apps/backend/vite.config.ts
```

`@repo/desktop` の `apps/desktop/vitest.config.ts` に `coverage` 設定がある場合は、同様の設定を `backend` にも追加する。

#### Step 2: test-web ジョブにカバレッジ収集を追加する

`desktop` の実装パターン（PR 時はスキップ、main push 時に収集）を `backend` にも適用する:

```yaml
- name: Run web app tests (shard ${{ matrix.shard }}/2)
  run: |
    if [ "${{ github.event_name }}" = "pull_request" ]; then
      pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
    else
      VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
    fi

- name: Upload backend coverage artifact
  if: github.event_name != 'pull_request'
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-${{ matrix.shard }}
    path: apps/backend/coverage/
    retention-days: 1
```

#### Step 3: coverage ジョブに backend を追加する

```yaml
coverage:
  needs: [test-shared, test-desktop, test-web]
  steps:
    - name: Download desktop coverage artifacts
      # 既存のステップ

    - name: Download backend coverage artifacts
      uses: actions/download-artifact@v4
      with:
        pattern: backend-coverage-*
        path: coverage/backend
        merge-multiple: true

    - name: Upload desktop coverage to Codecov
      # 既存の desktop フラグアップロード

    - name: Upload backend coverage to Codecov
      uses: codecov/codecov-action@v5
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        directory: coverage/backend
        flags: backend
        fail_ci_if_error: false
        verbose: true
```

#### Step 4: 動作検証する

```bash
# ローカルでカバレッジ付きシャード実行を確認する
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage

# カバレッジレポートが生成されていることを確認する
ls apps/backend/coverage/
```

---

## 4. 実行手順

### Phase 1: 現状調査

#### 目的

`apps/backend/` の Vitest 設定とカバレッジ対応状況を把握し、実装方針を確定する。

#### 手順

1. `apps/backend/vitest.config.ts`（または `vite.config.ts`）を開き、カバレッジ設定の有無を確認する
2. `apps/desktop/vitest.config.ts` の `coverage` セクションを参照し、`backend` に適用すべき設定を洗い出す
3. `.github/workflows/ci.yml` の現在の `test-web` ジョブと `coverage` ジョブを確認し、修正箇所を特定する
4. ローカルで `pnpm --filter @repo/backend exec vitest run --coverage` を実行し、カバレッジが生成されるか確認する

#### 成果物

- `apps/backend/vitest.config.ts` の現在の設定内容（カバレッジ設定の有無）
- `desktop` と `backend` の設定差分リスト
- 修正が必要なファイルの一覧

#### 完了条件

- `apps/backend` の Vitest カバレッジ設定の要否が確認されている
- `.github/workflows/ci.yml` の修正箇所が特定されている

---

### Phase 2: apps/backend Vitest カバレッジ設定

#### 目的

`apps/backend/vitest.config.ts` にカバレッジ設定を追加し、`--coverage` オプションでカバレッジレポートが生成できる状態にする。

#### 手順

1. `apps/desktop/vitest.config.ts` のカバレッジ設定を参照する
2. `apps/backend/vitest.config.ts` に以下のカバレッジ設定を追加する（`desktop` と同等のパターン）:

   ```typescript
   import { defineConfig } from "vitest/config";

   export default defineConfig({
     test: {
       // 既存設定...
       coverage: {
         provider: "v8",
         reporter: ["json", "lcov"],
         reportsDirectory: "./coverage",
         // include/exclude は desktop の設定を参考に調整する
       },
     },
   });
   ```

3. ローカルで `pnpm --filter @repo/backend exec vitest run --coverage` を実行し、`apps/backend/coverage/` にレポートが生成されることを確認する

#### 成果物

- 修正済み `apps/backend/vitest.config.ts`（カバレッジ設定追加済み）

#### 完了条件

- `pnpm --filter @repo/backend exec vitest run --coverage` が正常終了し、`apps/backend/coverage/` にカバレッジレポートが生成される

---

### Phase 3: ci.yml の test-web ジョブ修正

#### 目的

`test-web` ジョブに PR/main push の条件分岐を追加し、main push 時のみカバレッジを収集してアーティファクトにアップロードする。

#### 手順

1. `.github/workflows/ci.yml` の `test-web` ジョブの `Run web app tests` ステップを以下のように修正する:

   ```yaml
   - name: Run web app tests (shard ${{ matrix.shard }}/2)
     run: |
       if [ "${{ github.event_name }}" = "pull_request" ]; then
         pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2
       else
         VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2 --coverage
       fi
   ```

2. カバレッジアーティファクトのアップロードステップを追加する:

   ```yaml
   - name: Upload backend coverage artifact
     if: github.event_name != 'pull_request'
     uses: actions/upload-artifact@v4
     with:
       name: backend-coverage-${{ matrix.shard }}
       path: apps/backend/coverage/
       retention-days: 1
   ```

3. `git diff` で変更内容を確認し、意図しない変更が含まれていないことを検証する

#### 成果物

- 修正済み `.github/workflows/ci.yml`（`test-web` ジョブへのカバレッジ収集追加）

#### 完了条件

- `test-web` ジョブに PR/main push の条件分岐が追加されている
- main push 時に `backend-coverage-{shard}` アーティファクトがアップロードされる設定になっている
- PR 時はカバレッジなし（高速実行）の動作が維持されている

---

### Phase 4: ci.yml の coverage ジョブ修正

#### 目的

`coverage` ジョブを修正し、`@repo/backend` のカバレッジを Codecov の `backend` フラグでアップロードする。

#### 手順

1. `.github/workflows/ci.yml` の `coverage` ジョブの `needs` に `test-web` を追加する:

   ```yaml
   coverage:
     needs: [test-shared, test-desktop, test-web]
   ```

2. `backend` カバレッジアーティファクトのダウンロードステップを追加する:

   ```yaml
   - name: Download backend coverage artifacts
     uses: actions/download-artifact@v4
     with:
       pattern: backend-coverage-*
       path: coverage/backend
       merge-multiple: true
   ```

3. `backend` カバレッジを Codecov にアップロードするステップを追加する:

   ```yaml
   - name: Upload backend coverage to Codecov
     uses: codecov/codecov-action@v5
     with:
       token: ${{ secrets.CODECOV_TOKEN }}
       directory: coverage/backend
       flags: backend
       fail_ci_if_error: false
       verbose: true
   ```

4. `git diff` で変更内容を確認し、意図しない変更が含まれていないことを検証する

#### 成果物

- 修正済み `.github/workflows/ci.yml`（`coverage` ジョブへの `backend` 対応追加）

#### 完了条件

- `coverage` ジョブが `test-web` に依存するよう `needs` に追加されている
- `backend-coverage-*` アーティファクトのダウンロードステップが追加されている
- Codecov への `backend` フラグアップロードステップが追加されている

---

### Phase 5: ローカル動作検証

#### 目的

ローカル環境でカバレッジ付きシャード実行が正常に動作し、カバレッジレポートが生成されることを確認する。

#### 手順

1. 各シャードでカバレッジ付き実行を行い、正常に完了することを確認する:

   ```bash
   VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage
   VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage
   ```

2. `apps/backend/coverage/` にカバレッジレポートが生成されていることを確認する:

   ```bash
   ls apps/backend/coverage/
   # coverage-final.json または lcov.info が存在することを確認する
   ```

3. カバレッジなし実行（PR 相当）も正常に動作することを確認する:

   ```bash
   pnpm --filter @repo/backend exec vitest run --shard=1/2
   pnpm --filter @repo/backend exec vitest run --shard=2/2
   ```

#### 成果物

- 各シャードの実行ログ（PASS/FAIL 件数・カバレッジファイル生成確認）

#### 完了条件

- 全シャードがカバレッジ付きでエラーなく完了する
- `apps/backend/coverage/` にカバレッジレポートが生成される
- カバレッジなし実行も正常に完了する

---

### Phase 6: CI 動作検証

#### 目的

GitHub Actions 上でカバレッジ収集と Codecov アップロードが正常に動作することを確認する。

#### 手順

1. 変更をブランチにプッシュし、PR を作成して CI を実行する（PR トリガー: カバレッジなし確認）
2. PR CI で `test-web` ジョブがカバレッジなしで完了することを確認する（`backend-coverage-*` アーティファクトが生成されないことを確認）
3. `main` ブランチにマージして CI を実行する（main push トリガー: カバレッジあり確認）
4. `test-web` ジョブで `backend-coverage-{1,2}` アーティファクトがアップロードされることを確認する
5. `coverage` ジョブで Codecov への `backend` フラグアップロードが成功することを確認する
6. Codecov ダッシュボードで `backend` フラグのカバレッジが表示されることを確認する

#### 成果物

- CI 実行結果レポート（PR/main push それぞれの動作確認・Codecov ダッシュボードのスクリーンショットまたは URL）

#### 完了条件

- PR CI でカバレッジなし実行が正常に完了している
- main push CI でカバレッジ付き実行が正常に完了している
- Codecov に `backend` フラグのカバレッジが表示されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `test-web` ジョブに PR/main push の条件分岐が追加されている
- [ ] main push 時に `VITEST_SHARDED_COVERAGE=true` で `--coverage` オプションが付与される
- [ ] main push 時に `backend-coverage-{shard}` アーティファクトがアップロードされる
- [ ] `coverage` ジョブの `needs` に `test-web` が追加されている
- [ ] `coverage` ジョブで `backend-coverage-*` アーティファクトがダウンロードされる
- [ ] `coverage` ジョブで Codecov に `backend` フラグでアップロードされる

### パフォーマンス要件

- [ ] PR 時の `test-web` 実行時間がカバレッジ追加前と比較して変化していない（PR はカバレッジなし）
- [ ] main push 時の `coverage` ジョブが 5 分以内に完了する

### 品質要件

- [ ] `desktop` フラグの Codecov アップロードが従来通り正常に動作している（既存機能の回帰なし）
- [ ] 変更がスコープ（`ci.yml`・`apps/backend/vitest.config.ts`）のみに限定されている

### ドキュメント要件

- [ ] `ci.yml` の `coverage` ジョブに `backend` 対応であることを示すコメントが追加されている
- [ ] 本タスクの実施結果が本仕様書の備考欄に記録されている

---

## 6. 検証方法

### テストケース

- Case 1: PR トリガー時に `test-web` ジョブがカバレッジなしで exit code 0 で終了する
- Case 2: main push トリガー時に `test-web` ジョブがカバレッジ付きで exit code 0 で終了する
- Case 3: main push 時に `backend-coverage-1`・`backend-coverage-2` アーティファクトが CI 上に生成される
- Case 4: main push 時に `coverage` ジョブが Codecov へ `backend` フラグでアップロードを完了する
- Case 5: Codecov ダッシュボードで `backend` フラグのカバレッジが表示される
- Case 6: 既存の `desktop` フラグのカバレッジが引き続き正常にアップロードされる

### 検証コマンド

```bash
# ローカルでカバレッジ付きシャード実行（main push 相当）
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=1/2 --coverage
VITEST_SHARDED_COVERAGE=true pnpm --filter @repo/backend exec vitest run --shard=2/2 --coverage

# カバレッジレポートの生成確認
ls -la apps/backend/coverage/

# カバレッジなし実行（PR 相当）
pnpm --filter @repo/backend exec vitest run --shard=1/2
pnpm --filter @repo/backend exec vitest run --shard=2/2

# ci.yml の coverage ジョブ設定確認
grep -A 30 "^  coverage:" .github/workflows/ci.yml
```

---

## 7. リスクと対策

| リスク                                                                            | 影響度 | 発生確率 | 対策                                                                                                                                                            |
| --------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/backend/vitest.config.ts` にカバレッジ設定がなくエラーが発生する            | 中     | 中       | Phase 1 で `desktop` の設定を参照して `backend` に同等の設定を追加する。`provider: "v8"` と `reporter: ["json", "lcov"]` の設定を最低限追加する                 |
| シャード化されたカバレッジがマージされずに不完全なレポートになる                  | 中     | 低       | `VITEST_SHARDED_COVERAGE=true` 環境変数を設定し、各シャードが部分カバレッジを出力するようにする。`coverage` ジョブで `merge-multiple: true` を指定して統合する  |
| `backend-coverage-*` アーティファクトが存在しない場合に coverage ジョブが失敗する | 中     | 低       | `coverage` ジョブの `needs` に `test-web` を追加することで、`test-web` 完了後に `coverage` が実行される順序を保証する                                           |
| `coverage` ジョブの `needs` 追加で CI 全体の実行フローが変わる                    | 低     | 低       | `coverage` ジョブは `if: github.event_name == 'push'` 条件付きのため、PR フローへの影響はない。main push 時のみ `test-web` 完了待ちが発生するが許容範囲内       |
| Codecov トークンが未設定の場合にアップロードが失敗する                            | 低     | 低       | `fail_ci_if_error: false` を設定しているため CI 自体はブロックしない。Secrets 設定は事前確認を推奨する                                                          |
| `@repo/backend` と `@repo/web` の名称混乱による設定ミス                           | 中     | 中       | 実装時は常に `pnpm --filter @repo/backend` を使用し、`apps/backend/` ディレクトリを対象とする。パッケージ名を `package.json` で事前確認する（詳細は備考欄参照） |

---

## 8. 参照情報

### 関連ドキュメント

- `.github/workflows/ci.yml`（現在の CI 設定・`coverage` ジョブと `test-web` ジョブの参考）
- `apps/backend/vitest.config.ts`（バックエンドの Vitest 設定）
- `apps/desktop/vitest.config.ts`（カバレッジ設定の参考実装）
- `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`（前提タスクの仕様書）
- `docs/30-workflows/task-ci-optimization-001/`（TASK-CI-OPT-001 仕様書群）

### 関連タスク

- TASK-CI-OPT-001: GitHub CI 最適化（test-desktop シャード化・node_modules キャッシュ化）（カバレッジ収集パターンの参考）
- TASK-CI-FUTURE-002: test-web シャード化（本タスクの前提タスク）

### 参考リンク

- [Vitest カバレッジドキュメント](https://vitest.dev/guide/coverage.html)
- [Vitest シャード + カバレッジの統合](https://vitest.dev/guide/coverage.html#combining-coverage-with-test-sharding)
- [Codecov GitHub Actions](https://docs.codecov.com/docs/github-actions)
- [codecov/codecov-action](https://github.com/codecov/codecov-action)
- [GitHub Actions artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CI-FUTURE-002 から引き継いだ知見（実作業時に参照すること）:

| 症状                                                                                                   | 原因                                                                                                                               | 対応                                                                                                                                | 再発防止                                                                                                              |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `test-web` ジョブの実体が `@repo/web` ではなく `@repo/backend`（`apps/backend/`）だった                | 仕様書では `apps/web/` と記載されていたが、実際のパッケージ名は `@repo/backend` であり、ディレクトリ名と仕様書記載名が乖離していた | `apps/backend/package.json` の `name` フィールドを確認し、正しいパッケージ名 `@repo/backend` を特定してコマンドに使用した           | 実装前に必ず `apps/*/package.json` の `name` フィールドで実際のパッケージ名を確認する（P50 チェック）                 |
| `ci.yml` の `test-web` コメントに「@repo/backend テストを 2 並列で実行」と記載されているが混乱しやすい | ジョブ名が `test-web` でありながら実体は `@repo/backend` を実行しているため、名称と実体が一致していない                            | CI ファイルのコメントを参照し、`pnpm --filter @repo/backend` を使用することを確認した                                               | `test-web` ジョブを修正する際は必ずコメントとフィルタコマンドを確認し、パッケージ名の乖離に注意する                   |
| シャード化カバレッジのマージでレポートが不完全になる可能性がある                                       | 各シャードが独立して `coverage/` を上書きするため、最後のシャードのカバレッジしか残らないリスクがある                              | `VITEST_SHARDED_COVERAGE=true` 環境変数を設定することで各シャードが独立したカバレッジファイルを出力し、後からマージできる形式にする | アーティファクト名に `${{ matrix.shard }}` を含めて（`backend-coverage-1`・`backend-coverage-2`）シャード別に保存する |

### 補足事項

- 本タスクは TASK-CI-FUTURE-002 Phase 12 の unassigned task detection で発見され、正式なタスクとして切り出したものである
- 現在の `.github/workflows/ci.yml` の `test-web` ジョブでは `pnpm --filter @repo/backend exec vitest run --shard=${{ matrix.shard }}/2` が実行されているが、カバレッジオプションは付与されていない。本タスクでこれを修正する
- `VITEST_SHARDED_COVERAGE=true` は `desktop` で使用されている環境変数パターンであり、`backend` にも同じパターンを適用することで実装の一貫性を保つ
- `coverage` ジョブのタイムアウトは現在 5 分に設定されている。`desktop` と `backend` の両カバレッジをアップロードするようになっても 5 分以内に完了することが期待されるが、実測値を確認すること
- 本タスクの優先度は「低」としているが、バックエンドのテストカバレッジが Codecov で可視化されることは品質管理上の継続的な価値があるため、他の低優先度タスクより先に着手することを推奨する
