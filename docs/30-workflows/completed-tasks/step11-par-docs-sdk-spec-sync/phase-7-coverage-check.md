# Phase 7: カバレッジチェック

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 7                                   |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

Phase 5 の更新対象が SDK-02 / SDK-04 の受入基準（AC-1〜AC-10）をすべて満たすか、カバレッジの観点で確認する。更新漏れや達成されていない AC がないことを保証する。

## 実行タスク

- Phase 1 の受入基準（AC-1〜AC-10）に対してカバレッジマッピングを行う
- SDK-02 の AC-1〜AC-3 が満たされているか確認する
- SDK-04 の AC-4〜AC-7 が満たされているか確認する
- 共通の AC-8〜AC-10 が満たされているか確認する
- カバレッジサマリーを作成する

## カバレッジマッピング

| AC ID | 基準                                                            | 対応する更新ファイル                                |
| ----- | --------------------------------------------------------------- | --------------------------------------------------- |
| AC-1  | `architecture-overview-core.md` が current owner として記述     | `architecture-overview-core.md`（SDK-02）           |
| AC-2  | `arch-electron-services-details-part2.md` が現状コードと整合    | `arch-electron-services-details-part2.md`（SDK-02） |
| AC-3  | `api-ipc-system-core.md` の API/IPC 仕様記述が現状コードと整合  | `api-ipc-system-core.md`（SDK-02）                  |
| AC-4  | `task-workflow-completed.md` の TASK-SDK-04 パスが current path | `task-workflow-completed.md`（SDK-04）              |
| AC-5  | `resource-map.md` に stale path なし                            | `resource-map.md`（SDK-04）                         |
| AC-6  | `quick-reference.md` に stale path なし                         | `quick-reference.md`（SDK-04）                      |
| AC-7  | `topic-map.md` に stale path なし                               | `topic-map.md`（SDK-04）                            |
| AC-8  | 未完了表現が 0 件                                               | 全更新ファイル（grep で確認）                       |
| AC-9  | 旧 path が 0 件                                                 | 全更新ファイル（grep で確認）                       |
| AC-10 | コード変更が含まれていない                                      | `git diff --name-only`（`.ts` 等が含まれないこと）  |

## 参照資料

| 資料名                 | パス                                        | 説明               |
| ---------------------- | ------------------------------------------- | ------------------ |
| Phase 1 受入基準       | `phase-1-requirements.md`                   | AC-1〜AC-10 の定義 |
| Phase 5 実装書         | `phase-5-implementation.md`                 | 更新対象と観点     |
| Phase 6 拡張テスト結果 | `outputs/phase-6/test-expansion-summary.md` | テスト実行結果     |

## 統合テスト連携

- docs-only タスクのため実装コード向け統合テストは追加せず、`outputs/phase-4/test-matrix.md` に定義した grep / validator / index 再生成を統合ゲートとして扱う。
- Phase 7 では AC-1〜AC-10 全てへのカバレッジマッピングを行い、未達成 AC が 0 件であることを coverage-summary に記録する。

## 成果物

| 成果物             | パス                                  | 説明                       |
| ------------------ | ------------------------------------- | -------------------------- |
| カバレッジチェック | `phase-7-coverage-check.md`           | カバレッジマッピングの定義 |
| coverage summary   | `outputs/phase-7/coverage-summary.md` | AC 達成状況と残課題の記録  |

## 完了条件

- [ ] AC-1〜AC-10 すべてに対してカバレッジマッピングが完了している
- [ ] 未達成の AC が 0 件であることが確認されている
- [ ] 更新漏れのファイルがないことが確認されている
- [ ] Phase 8（リファクタリング）へ渡せるカバレッジサマリーが揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. AC-1〜AC-10 のカバレッジマッピング
3. 未達成 AC の確認と対処
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 8 で再利用するカバレッジ結果が固定されている
