# TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared モジュール解決3層整合CIガード

## メタ情報

```yaml
issue_number: 845
```

| 項目       | 値                                                          |
| ---------- | ----------------------------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001                     |
| 分類       | 改善                                                        |
| 対象機能   | CI/CD パイプライン、`@repo/shared` モジュール解決           |
| 優先度     | 高                                                          |
| 見積もり   | 中規模（Phase 1-13 合計）                                   |
| 発見元     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 10 MINOR判定 |
| 発見日     | 2026-02-20                                                  |
| ステータス | 未着手                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 において、`@repo/shared` パッケージの以下3層の設定不整合により 228件の TS2307 エラーが発生した:

1. **`packages/shared/package.json` の `exports` フィールド** — パッケージ外部からのモジュール解決エントリポイント
2. **`apps/desktop/tsconfig.json` の `compilerOptions.paths`** — TypeScript コンパイラのモジュール解決マッピング
3. **`apps/desktop/vitest.config.ts` の `resolve.alias`** — Vitest テスト実行時のモジュール解決マッピング

現在、この3層は手動で個別管理されている。修正タスク完了後に以下2つのテストファイルが追加された:

- `apps/desktop/src/__tests__/shared-module-resolution.test.ts` — exports ↔ paths の整合性検証（4テストグループ、T-SMR-01〜T-SMR-04）
- `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` — alias ↔ paths の整合性検証（4テストグループ、T-VAC-01〜T-VAC-04）

これらのテストはアプリケーションテストスイート（`pnpm --filter @repo/desktop test:run`）内に組み込まれており、CIでは `test-desktop` ジョブ（16シャード並列）の一部として実行される。独立した早期チェックとしては実行されていない。

### 1.2 問題点

| #   | 問題                                     | 具体的な影響                                                                                                                                              |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 3層不整合が専用チェックで検出されない    | `pnpm typecheck` や `pnpm test` の一般的な失敗メッセージに埋もれ、根本原因特定に時間がかかる                                                              |
| 2   | 新規サブパス追加時の不整合が見落とされる | `exports` に新サブパスを追加しても `paths` や `alias` の更新を忘れた場合、PRレビューでは検出困難                                                          |
| 3   | エラーの種別判別が困難                   | テスト失敗時に「モジュール解決エラー」なのか「実装バグ」なのか、CI出力からは判別しにくい                                                                  |
| 4   | CI実行時間の無駄遣い                     | 3層不整合がある場合、`build-shared` → `typecheck` → `test-desktop`（16シャード全て）が実行されてからエラーが判明する。早期検出なら1分以内で失敗通知が可能 |

### 1.3 放置した場合の影響

- **228エラー再発リスク**: 新規サブパス追加やパス変更のたびに不整合が紛れ込む
- **デバッグコスト増大**: 不整合原因の特定に毎回30分〜1時間のデバッグが発生
- **CIリソースの浪費**: 不整合状態のまま全ジョブが実行され、16シャード分のコンピュートリソースが無駄になる

---

## 2. 何を達成するか（What）

### 2.1 目的

CIパイプラインの早期ステージで `exports ↔ paths ↔ alias` の3層整合性を専用チェックとして検証し、不整合時にわかりやすい差分レポートを出力する。

### 2.2 ゴール

1. CIの早期ステージ（`lint` や `build-shared` と並列）で3層整合性を専用ジョブとして検証する
2. 不整合検出時に「どの層のどのエントリが不足・不一致か」を差分レポートとして出力する
3. PRステータスチェックとして3層整合を必須化し、不整合PRがマージされることを防止する

### 2.3 スコープ

**含むもの:**

- 3層整合チェック専用スクリプト（`scripts/check-shared-module-sync.ts`）
- GitHub Actions ワークフロー更新（`.github/workflows/ci.yml` に早期ステージジョブ追加）
- `exports` と `typesVersions` の一致検証
- 差分レポートフォーマット定義
- 開発ガイドライン更新（CLAUDE.md またはコントリビューションガイド）

**含まないもの:**

- 既存テストファイル（`shared-module-resolution.test.ts`、`vitest-alias-consistency.test.ts`）の内容変更
- `@repo/shared` 以外のパッケージ（`@repo/ui` 等）への拡張
- 3層の自動生成・自動同期ツール（別タスク: TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001）

### 2.4 成果物

| #   | 成果物                                | 説明                                          |
| --- | ------------------------------------- | --------------------------------------------- |
| 1   | `scripts/check-shared-module-sync.ts` | 3層整合チェック専用スクリプト                 |
| 2   | `.github/workflows/ci.yml` 更新       | 早期ステージジョブ `check-module-sync` の追加 |
| 3   | 開発ガイドライン更新                  | 新規サブパス追加時の3層同時更新手順を文書化   |
| 4   | テストコード                          | チェックスクリプト自体のユニットテスト        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 22.x
- pnpm（モノレポ管理）
- GitHub Actions ランナー（ubuntu-latest）
- TypeScript 5.x（スクリプト実行に tsx を使用）

### 3.2 依存関係

| 依存                                      | 種別     | 理由                                          |
| ----------------------------------------- | -------- | --------------------------------------------- |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001  | 完了済み | 3層整合性が修正済みであること（ベースライン） |
| TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001 | 並行可能 | 自動同期ツールは別タスク。本タスクは検証のみ  |

### 3.3 必要な知識

- **package.json `exports` フィールド**: Node.js のサブパスエクスポート仕様（[Node.js Docs: Subpath exports](https://nodejs.org/api/packages.html#subpath-exports)）
- **tsconfig.json `paths`**: TypeScript のモジュール解決マッピング
- **vitest.config.ts `resolve.alias`**: Vite/Vitest のモジュール解決エイリアス
- **`typesVersions`**: TypeScript バージョン別の型解決マッピング
- **GitHub Actions**: ワークフロー構文、ジョブ依存関係、ステータスチェック

### 3.4 アプローチ

#### 3.4.1 チェックスクリプトの設計

`scripts/check-shared-module-sync.ts` は以下の5段階チェックを実行する:

**チェック1: exports → paths 包含チェック**
`package.json exports` の全エントリキーに対し、対応する `tsconfig.json paths` エントリが存在するか検証する。

```
exports "." → paths "@repo/shared"
exports "./core" → paths "@repo/shared/core"
exports "./types/auth" → paths "@repo/shared/types/auth"
```

**チェック2: paths → exports 逆方向チェック**
`tsconfig.json paths` の `@repo/shared` で始まる全エントリに対し、対応する `package.json exports` エントリが存在するか検証する。

**チェック3: exports → alias 包含チェック**
`package.json exports` の全エントリキーに対し、対応する `vitest.config.ts alias` エントリが存在するか検証する。

**チェック4: alias → exports 逆方向チェック**
`vitest.config.ts alias` の `@repo/shared` で始まる全エントリに対し、対応する `package.json exports` エントリが存在するか検証する。

**チェック5: exports → typesVersions 包含チェック**
`package.json exports` の `.` 以外の全サブパスに対し、対応する `typesVersions["*"]` エントリが存在するか検証する。

#### 3.4.2 差分レポートフォーマット

不整合検出時に以下の形式でレポートを出力する:

```
❌ @repo/shared モジュール解決3層整合チェック FAILED

=== exports → paths 不整合 ===
  MISSING: exports "./new-module" に対応する paths "@repo/shared/new-module" が tsconfig.json に存在しません

=== exports → alias 不整合 ===
  MISSING: exports "./new-module" に対応する alias "@repo/shared/new-module" が vitest.config.ts に存在しません

=== exports → typesVersions 不整合 ===
  MISSING: exports "./new-module" に対応する typesVersions "new-module" が package.json に存在しません

=== パス不一致 ===
  MISMATCH: "@repo/shared/types" のソースパスが一致しません
    paths:  ../../packages/shared/src/types/index.ts
    alias:  ../../packages/shared/src/types/other.ts

─── サマリー ───
  exports エントリ数: 26
  paths エントリ数: 25  (不足: 1)
  alias エントリ数: 25  (不足: 1)
  typesVersions エントリ数: 25  (不足: 1)
  パス不一致: 1件

💡 修正方法:
  1. package.json exports を正本として確認
  2. tsconfig.json paths に不足エントリを追加
  3. vitest.config.ts alias に不足エントリを追加
  4. typesVersions に不足エントリを追加
  詳細: docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-12-documentation.md
```

#### 3.4.3 CIワークフロー統合

現在の `.github/workflows/ci.yml` ジョブ依存関係:

```
lint ──────────────────────────┐
build-shared ──┬── typecheck ──┤
               ├── test-shared ┼── build (最終)
               └── test-desktop┘
security ─────────────────────
```

変更後:

```
lint ──────────────────────────┐
check-module-sync ─────────────┤  ← 新規追加（build不要、ソースのみで検証）
build-shared ──┬── typecheck ──┤
               ├── test-shared ┼── build (最終)
               └── test-desktop┘
security ─────────────────────
```

`check-module-sync` ジョブは以下の特徴を持つ:

- **`build-shared` に依存しない**: ソースファイル（`package.json`、`tsconfig.json`、`vitest.config.ts`）のみを読み取るため、ビルド不要
- **`lint` と並列実行**: 最速フィードバック（1分以内）
- **`build` の前提条件に追加**: 不整合がある場合、最終ビルドを阻止する

#### 3.4.4 vitest.config.ts のパース戦略

`vitest.config.ts` は TypeScript ファイルのため、JSON のような単純パースはできない。以下の戦略を採用する:

- **正規表現ベースのパース**: 既存テスト（`vitest-alias-consistency.test.ts`）と同じ正規表現パターン（`/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g`）を使用する
- **理由**: AST パース（`ts-morph` 等）は依存追加が必要であり、CIの軽量性を損なう。現在の `vitest.config.ts` の alias 定義フォーマットは安定しており、正規表現で十分対応可能

### 3.5 実装課題と解決策

TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で以下の苦戦箇所が判明した。本タスクのCIガード設計にこれらの教訓を反映する。

#### 苦戦箇所1: 三層の正本（Source of Truth）が曖昧

- **問題**: `exports`、`paths`、`alias` のどれが正本かが明確でなかったため、修正順序が定まらなかった。`paths` を先に修正してから `exports` との不整合に気付く、といった手戻りが発生した
- **解決策**: `package.json exports` を正本と定め、`paths` と `alias` は exports から導出する方針を確立した。CIガードもこの正本ベースで検証する。チェックスクリプトのレポートに「exports を正本として確認せよ」と修正手順を明示する
- **CIガードへの反映**: チェック1〜3は「exports → 他層」の方向で検証し、exports を起点とする正本ベース検証を実施する

#### 苦戦箇所2: typesVersions と exports の二重管理

- **問題**: `exports` と `typesVersions` は TypeScript バージョンによって参照先が異なる。TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で `exports` を修正した際、`typesVersions` の更新漏れが発生した。`typesVersions` は TypeScript 4.x 以前の互換性のために存在するが、更新忘れにより古い TypeScript バージョンで型解決が失敗する
- **解決策**: CIガードのチェック5で `exports` と `typesVersions` の一致を検証対象に含める。`typesVersions` のキー（`"core"`, `"types"` 等）が `exports` のサブパスキー（`"./core"`, `"./types"` 等）と1:1対応しているか検証する
- **CIガードへの反映**: `exports` のサブパス（`.` を除く）からプレフィックス `./` を除去した文字列と、`typesVersions["*"]` のキーが一致するか検証する

#### 苦戦箇所3: vitest.config.ts alias の glob パターン差異

- **問題**: `tsconfig.json paths` は `@repo/shared/*` のようなワイルドカードで一括マッチするが、`vitest.config.ts alias` は個別エントリが必要。`paths` にワイルドカードエントリが存在する場合、`alias` は個別のエクスポートパスごとにエントリが必要になる
- **解決策**: CIガードでは `alias` のエントリが `exports` のキーを網羅しているかの包含チェックを実施する。ワイルドカード `*` を含む `paths` エントリはチェック対象から除外し、個別エントリの整合性のみ検証する
- **CIガードへの反映**: `paths` の `@repo/shared/*` のようなワイルドカードエントリはスキップし、具体的なサブパスエントリのみ検証対象とする

---

## 4. 実行手順（Phase構成）

### Phase 1: 要件定義

- [ ] 本仕様書の内容を確認し、受入基準を合意する
- [ ] 3層の正本（`package.json exports`）を正式に決定する
- [ ] CIジョブの実行タイミング（`lint` と並列）を確認する

### Phase 2: 設計

- [ ] `scripts/check-shared-module-sync.ts` のモジュール構成を設計する
  - エントリポイント: `main()` 関数
  - パーサー: `parseExports()`, `parsePaths()`, `parseAliases()`, `parseTypesVersions()`
  - チェッカー: `checkExportsVsPaths()`, `checkExportsVsAliases()`, `checkExportsVsTypesVersions()`
  - レポーター: `formatReport()`, `printSummary()`
- [ ] 差分レポートのフォーマットを確定する
- [ ] CIワークフローの変更箇所を設計する

### Phase 3: 設計レビュー

- [ ] 設計の妥当性を検証する（チェック項目の漏れ、正規表現の妥当性）

### Phase 4: テスト作成

- [ ] `scripts/__tests__/check-shared-module-sync.test.ts` を作成する
- [ ] テストケース:
  - 正常系: 3層が完全一致する場合、exit code 0
  - 異常系: exports にあるが paths にないエントリ検出
  - 異常系: exports にあるが alias にないエントリ検出
  - 異常系: exports にあるが typesVersions にないエントリ検出
  - 異常系: paths と alias でソースパスが不一致
  - 境界値: exports が空（`.` のみ）の場合
  - 境界値: ワイルドカード paths エントリのスキップ確認

### Phase 5: 実装

- [ ] `scripts/check-shared-module-sync.ts` を実装する
  - `package.json` の `exports` と `typesVersions` を JSON.parse で読み取る
  - `tsconfig.json` の `paths` を JSON.parse で読み取る
  - `vitest.config.ts` の alias を正規表現で抽出する
  - 5段階チェックを実行する
  - 差分レポートを標準出力に出力する
  - 不整合がある場合は exit code 1 で終了する
- [ ] `.github/workflows/ci.yml` に `check-module-sync` ジョブを追加する
  ```yaml
  check-module-sync:
    name: Module Sync Check
    runs-on: ubuntu-latest
    timeout-minutes: 2
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "22"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Check @repo/shared module sync
        run: pnpm tsx scripts/check-shared-module-sync.ts
  ```
- [ ] `build` ジョブの `needs` に `check-module-sync` を追加する

### Phase 6: テスト拡充

- [ ] エッジケースのテストを追加する
  - `vitest.config.ts` のフォーマット変更に対するロバスト性テスト
  - 複数の不整合が同時に存在する場合のレポート出力テスト

### Phase 7: カバレッジ確認

- [ ] チェックスクリプトのカバレッジが基準を満たすことを確認する

### Phase 8: リファクタリング

- [ ] コードの可読性とメンテナンス性を改善する

### Phase 9: 品質検証

- [ ] `pnpm lint` がPASSすることを確認する
- [ ] `pnpm typecheck` がPASSすることを確認する
- [ ] 全テストがPASSすることを確認する
- [ ] CIワークフローの構文が有効であることを確認する（`act` または手動検証）

### Phase 10: 最終レビュー

- [ ] チェックスクリプトが現在の3層設定で正常終了（exit code 0）することを確認する
- [ ] 意図的に不整合を作り、エラーレポートが正しく出力されることを確認する
- [ ] CIジョブが `lint` と並列で実行可能であることを確認する

### Phase 11: 手動テスト

- [ ] ローカルで `pnpm tsx scripts/check-shared-module-sync.ts` を実行し、正常終了を確認する
- [ ] `exports` に架空のサブパスを追加し、チェックスクリプトが不整合を検出することを確認する
- [ ] PRを作成し、CIで `check-module-sync` ジョブが正常に実行されることを確認する

### Phase 12: ドキュメント

- [ ] 実装ガイド（Part 1: 概念説明、Part 2: 実装詳細）を作成する
- [ ] システム仕様書を更新する
- [ ] 開発ガイドラインに「新規サブパス追加時の3層同時更新手順」を追加する
- [ ] 未タスク検出を実施する

### Phase 13: 完了

- [ ] 成果物の最終確認を行う
- [ ] PRを作成する

---

## 5. 完了条件チェックリスト

- [ ] `scripts/check-shared-module-sync.ts` が作成され、5段階チェックが実装されている
- [ ] 現在の3層設定でチェックスクリプトが exit code 0 で正常終了する
- [ ] 意図的な不整合に対してチェックスクリプトが exit code 1 で異常終了し、差分レポートが出力される
- [ ] `.github/workflows/ci.yml` に `check-module-sync` ジョブが追加されている
- [ ] `check-module-sync` ジョブが `lint` と並列で実行される（`build-shared` に依存しない）
- [ ] `build` ジョブの `needs` に `check-module-sync` が含まれている
- [ ] チェックスクリプトのユニットテストが全てPASSする
- [ ] `exports → typesVersions` の整合性もチェック対象に含まれている
- [ ] 差分レポートに修正方法のガイダンスが含まれている
- [ ] `pnpm lint` がPASSする
- [ ] `pnpm typecheck` がPASSする
- [ ] 全テストがPASSする

---

## 6. 検証方法

### 6.1 正常系検証

```bash
# 現在の3層設定でチェックが通ることを確認
pnpm tsx scripts/check-shared-module-sync.ts
echo $?  # → 0
```

### 6.2 異常系検証

```bash
# exports に架空エントリを追加して不整合を作る
# package.json の exports に "./fake-module": { ... } を追加
pnpm tsx scripts/check-shared-module-sync.ts
echo $?  # → 1
# 差分レポートに MISSING: exports "./fake-module" ... が出力される
```

### 6.3 CI検証

```bash
# PRを作成し、GitHub Actions の check-module-sync ジョブが実行されることを確認
gh pr create --draft --title "test: module sync CI check"
# Actions タブで check-module-sync ジョブの実行を確認
```

### 6.4 ユニットテスト検証

```bash
# チェックスクリプトのテストを実行
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
```

---

## 7. リスクと対策

| #   | リスク                                                        | 影響度 | 対策                                                                                                                                     |
| --- | ------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `vitest.config.ts` のフォーマット変更で正規表現パースが壊れる | 中     | パース失敗時にわかりやすいエラーメッセージを出力する。フォールバックとして既存テスト（`vitest-alias-consistency.test.ts`）でも検証される |
| 2   | CIジョブ追加による全体実行時間の増加                          | 低     | `check-module-sync` は `lint` と並列実行、依存なし、timeout 2分。全体のクリティカルパスに影響しない                                      |
| 3   | `tsx` がCI環境で利用不可                                      | 低     | `pnpm install` で `tsx` がインストールされる。`devDependencies` に含まれていることを確認する                                             |
| 4   | `typesVersions` の廃止（将来のTypeScript仕様変更）            | 低     | TypeScript 5.x では `exports` の `types` 条件を優先するが、`typesVersions` は後方互換性のために残される。廃止時はチェック5を無効化する   |

---

## 8. 参照情報

### 関連タスク

| タスクID                                   | 関係   | 説明                                        |
| ------------------------------------------ | ------ | ------------------------------------------- |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001   | 発見元 | 228件のTS2307エラー修正タスク               |
| TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001  | 関連   | vitest alias の自動同期ツール（別タスク）   |
| TASK-VITEST-TSCONFIG-PATHS-SYNC-AUTOMATION | 関連   | tsconfig paths の自動同期ツール（別タスク） |

### 関連ファイル

| ファイル                                                      | 役割                               |
| ------------------------------------------------------------- | ---------------------------------- |
| `packages/shared/package.json`                                | 正本: `exports` と `typesVersions` |
| `apps/desktop/tsconfig.json`                                  | TypeScript paths 設定              |
| `apps/desktop/vitest.config.ts`                               | Vitest alias 設定                  |
| `apps/desktop/src/__tests__/shared-module-resolution.test.ts` | 既存整合性テスト（exports↔paths）  |
| `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` | 既存整合性テスト（alias↔paths）    |
| `.github/workflows/ci.yml`                                    | CIワークフロー設定                 |

### 現在のCI実行フロー参考

```
jobs:
  lint:           独立実行、timeout 10分
  build-shared:   独立実行、timeout 5分
  typecheck:      build-shared 依存、timeout 10分
  test-shared:    build-shared 依存、timeout 10分
  test-desktop:   build-shared 依存、timeout 15分、16シャード並列
  security:       独立実行、timeout 5分
  coverage:       test-shared + test-desktop 依存（main push時のみ）
  build:          lint + typecheck + test-shared + test-desktop + build-shared 依存、timeout 15分
```

### 備考

- `package.json exports` を正本（Source of Truth）とする方針は TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で確立された
- チェックスクリプトはビルド不要（ソースファイルのみ読み取り）のため、CIの最初期段階で実行可能
- 既存テスト（`shared-module-resolution.test.ts`、`vitest-alias-consistency.test.ts`）は引き続きアプリケーションテストスイート内で実行される。本タスクのCIガードはこれらを補完する早期検出メカニズムである

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 10 MINOR:
"exports / paths / alias の3層整合をCIで継続監視するガードがない"
```

### 補足事項

- 本指示書は未実施タスクとして `docs/30-workflows/unassigned-task/` に配置する。
- 完了時は `completed-tasks/unassigned-task/` へ移管し、`task-workflow.md` の参照先を同時更新する。
