# [#1485] UT-CONV-DB-004: ネイティブモジュール環境自動整備

## メタ情報

| 項目         | 内容                      |
| ------------ | ------------------------- |
| タスクID     | UT-CONV-DB-004            |
| 分類         | 開発環境改善              |
| 優先度       | MEDIUM                    |
| 見積もり規模 | Small (Phase 1-6簡易版)   |
| 発見元       | Phase 6（UT-CONV-DB-001） |
| 親タスク     | UT-CONV-DB-001            |

## 目的

worktree 作成時と CI 実行時にネイティブモジュールが正しいアーキテクチャで自動リビルドされる仕組みを構築する。

## 背景

UT-CONV-DB-001 で better-sqlite3 のネイティブバイナリが CPU アーキテクチャ不一致（arm64 vs x86_64）で 75 件テストが silent skip される問題を修正した（P66）。修正自体は `pnpm rebuild` で完了したが、以下の再発リスクが残っている:

- worktree 作成後に `pnpm rebuild` が自動実行されない
- CI キャッシュキーに `process.arch` が含まれていない
- esbuild 等の他のネイティブモジュールも同じ問題が発生する

## 成果物

- `scripts/setup-worktree.sh`
- GitHub Actions ワークフロー更新
- アーキテクチャ検証スクリプト

## 完了条件

- [ ] worktree セットアップスクリプトが作成されている
- [ ] CI キャッシュキーに `runner.arch` が含まれている
- [ ] ネイティブモジュールのアーキテクチャ検証が CI に組み込まれている

## 参照

- タスク仕様書: `docs/30-workflows/unassigned-task/task-conv-db-004-native-module-rebuild-automation.md`
- P66: `.claude/rules/06-known-pitfalls.md#P66`
