# DevOps技術スタック（パッケージ管理・CI/CD） / history bundle

> 親仕様書: [technology-devops.md](technology-devops.md)
> 役割: history bundle

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [非機能要件](./02-non-functional-requirements.md)
- [ディレクトリ構造](./04-directory-structure.md)

---

---

## 完了タスク

本セクションでは、DevOps関連の完了タスクを記録する。

| タスクID | タスク名 | 完了日 | 主な成果 |
| -------- | -------- | ------ | -------- |
| TASK-CI-FIX-001 | ESLint 9 Flat Config移行 | 2026-01-29 | apps/backend ESLint 9対応完了 |
| TASK-OPT-CI-TEST-PARALLEL-001 | GitHub Actions CI テスト並列実行最適化 | 2026-02-02 | シャード8→16、maxForks 2→4、fileParallelism有効化、キャッシュ導入 |
| ENV-INFRA-001 | better-sqlite3 Node.jsバージョン不一致修正 | 2026-02-04 | pnpm store prune + install --forceによる再ビルド、CONTRIBUTING.md作成 |
| TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 | @repo/shared モジュール解決3層整合CIガード | 2026-02-22 | `scripts/check-shared-module-sync.ts` 新規作成、`check-module-sync` CIジョブ追加、43テスト全PASS |
| UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 | Vitest alias と tsconfig paths の同期自動化 | 2026-02-24 | `vite-tsconfig-paths` 導入で手動alias 27件削除。CI/ローカル実行コマンドを `pnpm check:module-sync` に統一。60テスト全PASS |
| UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 | Worktree制約を前提とした Electron E2E CI統合 | 2026-03-01 | `ci.yml` に `e2e-desktop` ジョブ追加。Playwright browser cache、Chromium install、`xvfb-run` 実行、E2Eレポートartifact保存を標準化 |

---

## 変更履歴

| 日付       | 変更内容                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-03-01 | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001: `e2e-desktop` CIジョブ（Playwright + xvfb）を主要CI構成と完了タスクへ追加 |
| 2026-02-24 | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: 4設定整合運用を反映（`check-module-sync` の説明を4設定整合へ更新、完了タスクを追加） |
| 2026-02-22 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 3層整合CIガード完了タスク記録追加（check-module-syncジョブ） |
| 2026-02-04 | ENV-INFRA-001: better-sqlite3バージョン不一致修正完了記録追加                |
| 2026-02-02 | TASK-OPT-CI-TEST-PARALLEL-001: CI最適化パターン・完了タスクセクション追加    |
| 2026-01-29 | TASK-CI-FIX-001: ESLint 9 Flat Config移行（apps/backend）完了チェック        |
| 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換                           |

