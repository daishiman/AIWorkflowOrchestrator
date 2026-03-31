# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| Phase名    | カバレッジ確認                                |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 6: テスト拡充                           |
| 次Phase    | Phase 8: リファクタリング                     |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

AC-1〜AC-7 と init path / fallback path の concern coverage を照合し、pipeline 活性化ポイントの抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ

- AC ごとのテスト対応表を作成する
- init path（自動インスタンス化）の全分岐をカバーする
- fallback path（static loader / stub）の全分岐をカバーする

### Task 2: init path カバレッジ

- コンストラクタ / init メソッドの分岐を確認する
- 外部注入あり / なしの両パターンをカバーする
- 各コンポーネントの生成成功 / 失敗をカバーする

### Task 3: fallback path カバレッジ

- manifest 発見 → dynamic pipeline の経路をカバーする
- manifest 未発見 → static loader の経路をカバーする
- static loader 不在 → stub 返却の経路をカバーする

## 参照資料

| 資料名         | パス                                                                  | 説明            |
| -------------- | --------------------------------------------------------------------- | --------------- |
| テスト拡充記録 | `phase-6-test-expansion.md`                                           | coverage 対象   |
| 実装記録       | `outputs/phase-5/implementation-record.md`                            | coverage の根拠 |
| Facade         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 分岐の実体      |

## 統合テスト連携

- init → manifest 発見 → pipeline 活性化の一連フローを coverage の中核ケースに置く
- 行数よりも concern coverage を優先して判定する

## 成果物

| 成果物             | パス                                 | 説明                              |
| ------------------ | ------------------------------------ | --------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC と init/fallback path の対応表 |

## 完了条件

- [ ] AC-1〜AC-7 の対応表がある
- [ ] init path の全分岐がカバーされている
- [ ] fallback path の全分岐がカバーされている
- [ ] Phase 8 に渡す重複削減候補が整理されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
