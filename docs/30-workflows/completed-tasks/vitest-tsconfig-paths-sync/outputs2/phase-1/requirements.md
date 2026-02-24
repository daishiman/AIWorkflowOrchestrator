# Phase 1: 要件定義書 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 1                                   |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 実行日   | 2026-02-24                          |

## 目的

`@repo/shared` パッケージの4つの設定（exports / tsconfig paths / vitest alias / typesVersions）間の整合性を自動検証するCIガードスクリプトを実装し、`vite-tsconfig-paths` プラグインによるVitest alias自動解決を導入する。

## 機能要件

| #   | 要件                               | 受入基準                                                       |
| --- | ---------------------------------- | -------------------------------------------------------------- |
| R1  | 同期漏れ検知 CLI 実装              | `pnpm check:module-sync` コマンドで6チェックが実行される       |
| R2  | exports → paths 不整合検出         | exports にあり paths にないエントリを検出し Missing に出力する |
| R3  | paths → exports 不整合検出         | paths にあり exports にないエントリを検出し Missing に出力する |
| R4  | exports → aliases 不整合検出       | exports にあり aliases にないエントリを検出する                |
| R5  | aliases → exports 不整合検出       | aliases にあり exports にないエントリを検出する                |
| R6  | exports → typesVersions 不整合検出 | exports にあり typesVersions にないエントリを検出する          |
| R7  | typesVersions → exports 不整合検出 | typesVersions にあり exports にないエントリを検出する          |
| R8  | 不整合時 exit code 1               | 1件以上の不整合がある場合に process.exitCode = 1 を設定する    |
| R9  | CI に check-module-sync ジョブ     | `.github/workflows/ci.yml` にジョブが定義されている            |
| R10 | pnpm スクリプト登録                | root package.json に `check:module-sync` が登録されている      |

## 非機能要件

| #     | 要件           | 基準                                                         |
| ----- | -------------- | ------------------------------------------------------------ |
| NFR-1 | パフォーマンス | スクリプト実行5秒以内、CI 2分以内                            |
| NFR-2 | 保守性         | 既存テスト変更最小限、DRY原則に従った実装                    |
| NFR-3 | 後方互換性     | 既存テストスイートに回帰なし                                 |
| NFR-4 | セキュリティ   | ファイル書き込み・外部コマンド実行・ネットワークアクセスなし |

## 前提条件

- モノレポ構成: `packages/shared` + `apps/desktop`
- 既存の同期チェックスクリプト（5チェック）が存在し、typesVersions → exports チェックが未実装
- `vitest.config.ts` に27個の `@repo/shared` 手動aliasが定義されている

## 完了条件

- [x] R1-R10 の全要件が定義されている
- [x] 受入基準が具体的に記述されている
- [x] 非機能要件が定義されている
- [x] 本要件定義書が作成されている
