# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 7                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 5 と Phase 6 の検証観点が stale evidence cleanup の全論点を覆っているかを確認する。

## 実行タスク

- path drift coverage を確認する
- judgement drift coverage を確認する
- follow-up link coverage を確認する
- validator coverage を確認する

## 参照資料

| 資料名       | パス                             | 説明             |
| ------------ | -------------------------------- | ---------------- |
| Phase 5 実装 | `phase-5-implementation.md`      | 更新対象         |
| Phase 6 拡充 | `phase-6-test-expansion.md`      | 拡張観点         |
| test matrix  | `outputs/phase-4/test-matrix.md` | baseline command |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                                  |
| ---------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | stale evidence cleanup の coverage 軸 |

## 実行手順

1. old path 0 hit、validator current path、`spec_created` judgement、follow-up link を coverage 軸として固定する
2. 各 coverage 軸が Phase 4 と Phase 6 のどこで確認されるかを整理する
3. 未カバー項目があれば Phase 6 観点へ戻して追加する

## 成果物

| 成果物        | パス                        | 説明              |
| ------------- | --------------------------- | ----------------- |
| coverage 結果 | `phase-7-coverage-check.md` | coverage 軸の定義 |

## 統合テスト連携

- Phase 9 は Phase 7 の coverage 軸に従って QA 観点を整理する。
- Phase 10 は Phase 7 の coverage 漏れが 0 件かを最終 gate で確認する。

## 完了条件

- [ ] path drift coverage が確認されている
- [ ] judgement drift coverage が確認されている
- [ ] follow-up link coverage が確認されている
- [ ] validator coverage が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
