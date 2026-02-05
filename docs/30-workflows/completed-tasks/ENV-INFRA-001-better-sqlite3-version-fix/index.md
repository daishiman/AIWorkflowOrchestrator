# ENV-INFRA-001: better-sqlite3 Node.jsバージョン不一致問題の解決

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | ENV-INFRA-001                                    |
| タスク名     | better-sqlite3 Node.jsバージョン不一致問題の解決 |
| 分類         | インフラ・環境問題                               |
| 対象機能     | テスト実行環境、ネイティブモジュール             |
| 優先度       | 中                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 作成日       | 2026-02-04                                       |
| GitHub Issue | #288                                             |

---

## 目的

Pre-pushフックでworkflow-repository.test.tsのテストが失敗している問題を解決し、Node.jsバージョン管理の仕組みを確立して再発を防止する。

### 背景

better-sqlite3はネイティブモジュール（C++）であり、特定のNode.jsバージョンに対してコンパイルされる。異なるNode.jsバージョンで依存関係がインストールされた後、別のバージョンでテストを実行したため、NODE_MODULE_VERSION不一致が発生した。

### 最終ゴール

- workflow-repository.test.tsの10個のテストがすべて成功
- Pre-pushフックが正常に動作
- Node.jsバージョン管理の仕組みが確立
- 同様の問題が再発しない

---

## Phase構成

| Phase | 名称                 | カテゴリ     | 概要                                |
| ----- | -------------------- | ------------ | ----------------------------------- |
| 1     | 要件定義             | 要件         | 問題診断と要件整理                  |
| 2     | 設計                 | 設計         | バージョン管理方式の設計            |
| 3     | 設計レビューゲート   | ゲート       | 設計の妥当性検証                    |
| 4     | テスト作成           | TDD-Red      | 動作確認テストシナリオ作成          |
| 5     | 実装                 | TDD-Green    | better-sqlite3再ビルド、.nvmrc作成  |
| 6     | テスト拡充           | 品質         | バージョンチェックテスト追加        |
| 7     | テストカバレッジ確認 | 品質         | カバレッジ基準確認                  |
| 8     | リファクタリング     | TDD-Refactor | スクリプト整理                      |
| 9     | 品質保証             | 品質         | 全体品質確認                        |
| 10    | 最終レビューゲート   | ゲート       | 最終品質検証                        |
| 11    | 手動テスト検証       | 検証         | ローカル環境での動作確認            |
| 12    | ドキュメント更新     | 文書化       | CONTRIBUTING.md更新、実装ガイド作成 |
| 13    | PR作成               | 完了         | 変更のコミットとPR作成              |

---

## 成果物一覧

| Phase | 成果物                 | パス                                            |
| ----- | ---------------------- | ----------------------------------------------- |
| 1     | 要件定義書             | `outputs/phase-1/requirements-definition.md`    |
| 2     | 設計書                 | `outputs/phase-2/architecture-design.md`        |
| 3     | 設計レビュー結果       | `outputs/phase-3/design-review-result.md`       |
| 4     | テスト仕様書           | `outputs/phase-4/test-specification.md`         |
| 5     | 実装コード             | `.nvmrc`, `package.json`, `.husky/hooks/`       |
| 6     | カバレッジレポート     | `outputs/phase-6/coverage-report.md`            |
| 7     | カバレッジ確認レポート | `outputs/phase-7/coverage-report.md`            |
| 8     | リファクタリング結果   | `outputs/phase-8/refactoring-summary.md`        |
| 9     | 品質レポート           | `outputs/phase-9/quality-report.md`             |
| 10    | 最終レビュー結果       | `outputs/phase-10/final-review-result.md`       |
| 11    | 手動テスト結果         | `outputs/phase-11/manual-test-result.md`        |
| 12    | 実装ガイド             | `outputs/phase-12/implementation-guide.md`      |
| 12    | ドキュメント更新履歴   | `outputs/phase-12/documentation-changelog.md`   |
| 12    | 未タスク検出レポート   | `outputs/phase-12/unassigned-task-detection.md` |
| 13    | PR情報                 | `outputs/phase-13/pr-info.md`                   |

---

## 依存関係

### 前提条件

- プロジェクトがpnpmで管理されている
- huskyがインストールされている
- 現在のNode.jsバージョンが確認できる

### 依存タスク

なし（独立したタスク）

---

## システム仕様参照（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| 技術スタックDevOps | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     | CI/CD、依存関係管理、pnpm |
| GitHub Actions     | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`        | CI/CDパイプライン設定     |
| デプロイ           | `.claude/skills/aiworkflow-requirements/references/deployment.md`            | デプロイ戦略              |
| 環境変数           | `.claude/skills/aiworkflow-requirements/references/environment-variables.md` | 環境変数管理              |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー処理パターン        |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | TDD、テストカバレッジ基準 |

---

## アーキテクチャ層別観点（適用判断）

本タスクは**インフラ・環境問題**であり、Electronアプリのコード実装ではないため、以下の層別観点は**適用外**とする。

| 層                         | 適用 | 理由                                       |
| -------------------------- | ---- | ------------------------------------------ |
| フロントエンド（Renderer） | ✗    | UI実装なし                                 |
| バックエンド（Main）       | ✗    | ビジネスロジック実装なし                   |
| IPC通信                    | ✗    | Main-Renderer連携なし                      |
| Preload                    | ✗    | API公開なし                                |
| ローカルストレージ         | △    | better-sqlite3動作確認のみ（新規実装なし） |

**本タスクの主な成果物**:

- 設定ファイル: `.nvmrc`, `package.json` (engines)
- シェルスクリプト: `check-node-version.sh`
- ドキュメント: `CONTRIBUTING.md`

---

## リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                |
| -------------------------------------- | ------ | -------- | --------------------------------------------------- |
| 再ビルド失敗                           | 高     | 低       | node-gypの依存ツール（Python、C++コンパイラ）を確認 |
| 他のネイティブモジュールでも同様の問題 | 中     | 中       | `pnpm rebuild`ですべて再ビルド                      |
| CI環境でバージョン不一致               | 中     | 低       | .github/workflows/\*.ymlで.nvmrc参照を設定          |
| 開発者間でNode.jsバージョンが異なる    | 低     | 中       | CONTRIBUTING.mdに明記、Pre-installフックで検出      |

---

## 参考資料

### プロジェクト内

- `docs/30-workflows/unassigned-task/task-better-sqlite3-version-fix.md` - 元タスク指示書
- `.github/workflows/` - CI/CD設定

### 外部

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Node.js Addon API](https://nodejs.org/api/addons.html)
- [nvm Usage](https://github.com/nvm-sh/nvm)
- [package.json engines](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines)

---

## 変更履歴

| 日付       | バージョン | 変更者 | 変更内容                                              |
| ---------- | ---------- | ------ | ----------------------------------------------------- |
| 2026-02-04 | 1.1.0      | AI     | テンプレート完全準拠、aiworkflow-requirements参照強化 |
| 2026-02-04 | 1.0.0      | AI     | 初版作成                                              |
