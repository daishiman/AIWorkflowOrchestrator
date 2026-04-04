# タスク: TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 優先度     | high                                     |
| 分類       | バグ修正                                 |
| 由来       | 調査で発見 (2026-03-31)                  |
| ステータス | todo                                     |
| 作成日     | 2026-03-31                               |

## 概要

`better-sqlite3` の native addon（`better_sqlite3.node`）が **実行ランタイムの ABI と不一致**の状態で `node_modules` に存在すると、Electron 起動時に `dlopen` / `NODE_MODULE_VERSION mismatch` が発生し、DB 初期化が失敗する。

本タスクは「宣言値」「lock 解決値」「障害バイナリ」の3つを混同せずに事実を確定し、再発防止として **インストール後にネイティブモジュールを再構築できる恒久手段**（scripts / postinstall / ドキュメント）を整える。

### 現状の事実（2026-03-31 時点）

| 区分         | 何を指すか                             | 参照                 | 現状                                                                       |
| ------------ | -------------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| 宣言値       | `apps/desktop/package.json` の依存宣言 | `better-sqlite3`     | `^12.5.0`                                                                  |
| lock解決値   | `pnpm-lock.yaml` の実解決バージョン    | `better-sqlite3@...` | `12.8.0`                                                                   |
| 障害バイナリ | 実行時に読み込まれた `.node` の実体    | エラーログのパス     | `.../node_modules/.pnpm/better-sqlite3@<resolved>/.../better_sqlite3.node` |

## 真の論点

`better-sqlite3` の native addon（`.node` ファイル）が Electron の Node.js ABI バージョンと不一致のまま `node_modules` に存在することで、Electron 起動時に `dlopen` エラーが発生し SQLite が使用できない。

## 影響範囲

- Electron 起動時の DB 初期化処理 — `better-sqlite3` のロードに失敗しクラッシュ
- 会話履歴機能（Conversation CRUD） — SQLite を使用する全 DB 操作が動作不能
- スキル実行履歴・分析機能（TASK-9I）— 履歴データの読み書きが不能
- 開発者環境での `pnpm install` 後の再現 — `postinstall` がない場合、毎回手動で `rebuild:native` が必要

## Phase一覧

| Phase | 名称             | 説明                                                          |
| ----- | ---------------- | ------------------------------------------------------------- |
| 1     | 要件定義         | ABI 不一致バグの根本原因・修正方法・再発防止要件の確定        |
| 2     | 設計             | postinstall スクリプト追加設計、rebuild:native の動作確認     |
| 3     | 設計レビュー     | 修正内容の妥当性検証、実装フェーズへのゲート判定              |
| 4     | テスト作成       | ABI バージョン一致確認テストの作成                            |
| 5     | 実装             | package.json への postinstall 追加（恒久対策）                |
| 6     | テスト拡充       | rebuild 後の ABI 一致を検証するテスト拡充                     |
| 7     | カバレッジ確認   | テストカバレッジが基準を満たすことを確認                      |
| 8     | リファクタリング | rebuild スクリプトの整備・CI への組み込み検討                 |
| 9     | 品質保証         | lint・typecheck・ビルド・テスト全通過確認                     |
| 10    | 最終レビュー     | コードレビューチェックリスト適用                              |
| 11    | 手動テスト       | Electron 起動 → DB 初期化成功 → 会話履歴の読み書き確認        |
| 12    | ドキュメント     | close-out 5成果物の作成（実装ガイド・仕様同期・未タスク整理） |
| 13    | PR作成           | GitHub PR 作成（blocked / ユーザー承認後に実施）              |
