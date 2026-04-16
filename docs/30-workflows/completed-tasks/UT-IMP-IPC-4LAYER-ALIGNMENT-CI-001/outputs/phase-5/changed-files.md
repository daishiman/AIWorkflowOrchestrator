# Phase 5 変更ファイル一覧

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| Phase    | 5                                  |
| 作成日   | 2026-04-14                         |

---

## 新規作成ファイル

| #   | ファイルパス                                             | 行数  | 目的                                |
| --- | -------------------------------------------------------- | ----- | ----------------------------------- |
| 1   | `scripts/verify-ipc-4layer.cjs`                          | 811行 | IPC 4層整合性検証スクリプト本体     |
| 2   | `scripts/__tests__/verify-ipc-4layer/parsers.test.ts`    | 532行 | パーサー関数の単体テスト (34件)     |
| 3   | `scripts/__tests__/verify-ipc-4layer/validators.test.ts` | 251行 | バリデーター関数の単体テスト (20件) |
| 4   | `scripts/__tests__/verify-ipc-4layer/reporter.test.ts`   | 122行 | レポーター関数の単体テスト (8件)    |
| 5   | `scripts/__tests__/verify-ipc-4layer/e2e.test.ts`        | 314行 | E2E 結合テスト (7件)                |

---

## 変更ファイル

| #   | ファイルパス               | 変更内容                                                       |
| --- | -------------------------- | -------------------------------------------------------------- |
| 1   | `.github/workflows/ci.yml` | `verify-ipc-4layer` ジョブ追加 + `build-app` の `needs` に追加 |

---

## 変更詳細

### 新規: `scripts/verify-ipc-4layer.cjs`

- CommonJS 単一ファイル（`"type": "module"` 環境対応のため `.cjs` 拡張子を使用）
- 外部依存なし（`fs`, `path` のみ）
- `module.exports` でテスト用に全関数をエクスポート
- `require.main === module` ガードによりスクリプト直接実行時のみ `main()` を実行

### 新規: テストファイル4件

- Vitest フレームワークを使用
- フィクスチャベースのテスト（実プロジェクトファイルに依存しない）
- `require("../../verify-ipc-4layer.cjs")` で CommonJS モジュールをインポート
- ディレクトリ走査テストでは `os.tmpdir()` に一時ディレクトリを作成し、`try/finally` でクリーンアップ

### 変更: `.github/workflows/ci.yml`

- `verify-ipc-4layer` ジョブを新規追加
  - `ubuntu-latest` で実行
  - `timeout-minutes: 5`
  - `ELECTRON_SKIP_BINARY_DOWNLOAD: 1`（Electron バイナリ不要）
  - `pnpm install` 不要（外部依存なし）
- `build-app` ジョブの `needs` 配列に `verify-ipc-4layer` を追加

---

## 影響範囲

| 影響範囲        | 詳細                                                               |
| --------------- | ------------------------------------------------------------------ |
| CI パイプライン | `verify-ipc-4layer` ジョブが追加され、`build-app` の前提条件となる |
| 既存スクリプト  | 影響なし（`check-ipc-contracts.ts` とは独立して動作）              |
| 既存テスト      | 影響なし（テストファイルは独立したディレクトリに配置）             |
| ランタイム      | 影響なし（CI 専用スクリプト、アプリケーションコードへの変更なし）  |
