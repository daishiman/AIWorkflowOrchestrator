# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| Phase名    | 要件定義                                      |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | -                                             |
| 次Phase    | Phase 2: 設計                                 |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

ManifestLoader の default activation に必要な機能要件・非機能要件を定義し、dynamic resource pipeline がデフォルトで有効になるための受入条件を固定する。

## 実行タスク

### Task 1: 現状の問題固定

- `RuntimeSkillCreatorFacade.hasDynamicResourcePipeline()` (lines 186-192) が sourceResolver / resourcePlanner / resolvedResourceReader の3条件を要求している事実を記録する
- `plan()` メソッド (lines 274-391) で `!hasDynamicResourcePipeline()` の場合に static resourceLoader または stub にフォールバックしている現状を記録する
- `loadWorkflowManifest()` (lines 201-215) が explicitRoot 提供時のみ呼ばれる制限を記録する
- ipc/index.ts (line ~920) で PhaseResourcePlanner のみ注入され、他2つが欠落している状況を記録する

### Task 2: 機能要件の確定

- FR-01: Facade 初期化時に sourceResolver を自動インスタンス化する
- FR-02: Facade 初期化時に resourcePlanner を自動インスタンス化する
- FR-03: Facade 初期化時に resolvedResourceReader を自動インスタンス化する
- FR-04: `hasDynamicResourcePipeline()` が3コンポーネント利用可能時にデフォルト true を返す
- FR-05: `loadWorkflowManifest()` が source resolver candidates から manifest を自動発見する
- FR-06: manifest 未発見時に static loader fallback が動作する

### Task 3: 非機能要件の確定

- NFR-01: 既存テストが変更なしで通過する（後方互換性）
- NFR-02: 自動インスタンス化が Facade のコンストラクタ / init の範囲で完了する（初期化遅延なし）
- NFR-03: dynamic pipeline の有効化がログで確認可能である

### Task 4: 受入条件マッピング

- AC-1 → FR-01: sourceResolver 自動インスタンス化
- AC-2 → FR-02: resourcePlanner 自動インスタンス化
- AC-3 → FR-03: resolvedResourceReader 自動インスタンス化
- AC-4 → FR-04: hasDynamicResourcePipeline() デフォルト true
- AC-5 → FR-05: manifest 自動発見
- AC-6 → FR-06: static loader fallback
- AC-7 → NFR-01: 既存テスト通過

### Task 5: スコープ境界

- 含む: Facade 初期化、pipeline 有効化、manifest 発見、fallback chain、ipc wiring 調整
- 含まない: manifest ファイル作成（TASK-P0-03）、verify engine（TASK-P0-01）、3コンポーネントの内部ロジック変更

## 参照資料

| 資料名                      | パス                                                                   | 説明                            |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Facade 実装                 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | hasDynamicResourcePipeline 箇所 |
| SourceResolver 実装         | `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts` | 自動インスタンス化対象          |
| PhaseResourcePlanner 実装   | `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts`       | 自動インスタンス化対象          |
| ResolvedResourceReader 実装 | `apps/desktop/src/main/services/runtime/ResolvedResourceReader.ts`     | 自動インスタンス化対象          |
| IPC wiring                  | `apps/desktop/src/main/ipc/index.ts`                                   | 現在の注入状況                  |

## 統合テスト連携

- Phase 4 で pipeline activation / fallback / manifest discovery の3観点をテストケースに落とす
- Phase 10 で AC-1〜AC-7 との対応表を再確認する

## 成果物

| 成果物     | パス                                         | 説明                                     |
| ---------- | -------------------------------------------- | ---------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義、FR/NFR、受入条件、スコープ境界 |

## 完了条件

- [ ] 問題文が固定されている
- [ ] FR-01〜FR-06 が検証可能な形で定義されている
- [ ] NFR-01〜NFR-03 が定義されている
- [ ] AC-1〜AC-7 と FR/NFR のマッピングが完了している
- [ ] 含む / 含まないが明確である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
