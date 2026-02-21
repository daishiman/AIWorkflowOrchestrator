# @repo/shared ソース構造統合 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001                         |
| タスク名     | `@repo/shared` ソース構造二重性の統一（`types/` と `src/types/`） |
| 分類         | リファクタリング                                                  |
| 対象機能     | shared パッケージ構造                                             |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 5                  |
| 発見日       | 2026-02-21                                                        |

---

## 1. 背景

`@repo/shared` で型定義の配置経路が複数化しており、import先と公開面の対応関係が把握しづらい。モジュール解決問題の再発要因になっている。

## 2. 目的

型定義配置の正本を一本化し、公開パスと実ファイル構造の対応を明確化する。

## 3. スコープ

- 含むもの: `packages/shared` 内の型定義配置とエクスポート整理、移行ガイド整備
- 含まないもの: アプリ側の機能仕様変更

## 4. 実行手順（概要）

1. 現在の公開パスと実体ファイルの対応表を作成
2. 正本ディレクトリを決定し移行計画を作成
3. 段階的に import/export を移行し、後方互換を検証
4. 参照ドキュメントを更新し再発防止ルールを追加

## 5. 完了条件

- [ ] 型定義配置の重複経路が解消されている
- [ ] 既存 import の互換性が確認されている
- [ ] 構造変更が仕様書に反映されている

## 6. 参照

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `docs/30-workflows/unassigned-task/task-fix-ts-shared-module-resolution-001.md`
