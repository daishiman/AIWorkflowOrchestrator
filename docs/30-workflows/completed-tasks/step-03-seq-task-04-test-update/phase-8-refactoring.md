# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 8                          |
| 機能名 | task-llm-mod-04-audit-sync |
| 作成日 | 2026-03-29                 |

## 目的

仕様書構造を current skill ルールへ寄せ、命名・配置・リンクのドリフトを削る。

## 実行タスク

- `phase-11-manual-test.md` へ命名統一
- `phase-13-pr-creation.md` へ命名統一
- `outputs/phase-11` / `outputs/phase-12` の配置追加
- `artifacts.json` と `outputs/artifacts.json` の同期

## リファクタ結果

- stale な旧 Phase 11 ファイル名を廃止
- stale な旧 Phase 13 ファイル名を廃止
- index に全 Phase リンクを追加
- 旧 root 参照の unassigned path を除去

## 参照資料

| 資料            | パス                                                                      | 説明             |
| --------------- | ------------------------------------------------------------------------- | ---------------- |
| Phase 2         | `phase-2-design.md`                                                       | 監査設計         |
| Phase 5         | `phase-5-implementation.md`                                               | current 実装事実 |
| Phase 6         | `phase-6-test-expansion.md`                                               | ギャップ精査     |
| Phase 7         | `phase-7-coverage-check.md`                                               | coverage 記録    |
| phase templates | `.claude/skills/task-specification-creator/references/phase-templates.md` | 命名・配置       |

## 統合テスト連携

workflow artifact の refactor であり、アプリ実装変更は行わない。

## 成果物

| 成果物         | パス                     | 説明     |
| -------------- | ------------------------ | -------- |
| リファクタ記録 | `phase-8-refactoring.md` | 構造改善 |

## 完了条件

- [x] Phase 11/13 の命名を統一した
- [x] outputs 配置を追加した
- [x] stale root 参照を除去した
- [x] **本Phase内の全タスクを100%実行完了**
