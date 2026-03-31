# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| Phase名    | テスト作成                                    |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 3: 設計レビュー                         |
| 次Phase    | Phase 5: 実装                                 |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

pipeline activation、fallback、manifest discovery の3観点で fail-first テストを定義し、実装前に期待動作を固定する。

## 実行タスク

### Task 1: pipeline activation テスト

- Facade 初期化後に `hasDynamicResourcePipeline()` が true を返すことを検証する
- sourceResolver が自動インスタンス化されていることを検証する
- resourcePlanner が自動インスタンス化されていることを検証する
- resolvedResourceReader が自動インスタンス化されていることを検証する

### Task 2: fallback テスト

- manifest が見つからない場合に static loader にフォールバックすることを検証する
- 3コンポーネント全てが利用不可の場合に stub が返ることを検証する
- 外部注入コンポーネントが自動インスタンスより優先されることを検証する

### Task 3: manifest discovery テスト

- `loadWorkflowManifest()` が source resolver candidates から manifest を発見することを検証する
- explicitRoot が提供された場合は従来通りの動作をすることを検証する
- candidates が空の場合のエラーハンドリングを検証する

### Task 4: 回帰テスト確認

- 既存の static loader パスのテストが変更なしで通過することを確認する
- ipc/index.ts 経由の既存 wiring テストが影響を受けないことを確認する

## 参照資料

| 資料名           | パス                                                                  | 説明               |
| ---------------- | --------------------------------------------------------------------- | ------------------ |
| 設計レビュー結果 | `phase-3-design-review.md`                                            | gate 結果          |
| 設計書           | `outputs/phase-2/design-document.md`                                  | テスト観測点の根拠 |
| Facade 実装      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | テスト対象         |

## 統合テスト連携

- Phase 10 の最終レビューで AC-1〜AC-7 との対応表を再利用する
- 初期化 → manifest 発見 → pipeline 活性化の一連フローを1ケースにまとめる

## 成果物

| 成果物       | パス                                     | 説明             |
| ------------ | ---------------------------------------- | ---------------- |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | テストケース一覧 |

## 完了条件

- [ ] pipeline activation テストが定義されている
- [ ] fallback テストが定義されている
- [ ] manifest discovery テストが定義されている
- [ ] AC-1〜AC-7 とテストが対応している
- [ ] 実装前に fail-first 観点が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
