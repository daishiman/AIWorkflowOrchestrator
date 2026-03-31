# Phase 5: 実装

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| Phase名    | 実装                                          |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 4: テスト作成                           |
| 次Phase    | Phase 6: テスト拡充                           |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

Facade 初期化時に3コンポーネントを自動インスタンス化し、manifest 自動発見ロジックを実装して dynamic resource pipeline をデフォルトで有効化する。

## 実行タスク

### Task 1: Facade コンストラクタ / init 修正

- コンストラクタまたは init メソッドで SkillCreatorSourceResolver を自動インスタンス化する
- コンストラクタまたは init メソッドで PhaseResourcePlanner を自動インスタンス化する
- コンストラクタまたは init メソッドで ResolvedResourceReader を自動インスタンス化する
- 外部注入がある場合はそちらを優先する（DI override パターン）

### Task 2: manifest 自動発見実装

- `loadWorkflowManifest()` を拡張し、explicitRoot がない場合に source resolver candidates を列挙する
- candidates から manifest ファイルを探索する
- 発見成功時は manifest をロードし dynamic pipeline を活性化する
- 未発見時は static loader fallback にフォールする

### Task 3: dynamic resource pipeline 自動試行への修正

- `plan()` / `improve()` が dynamic resource pipeline を常に試行するよう修正する
- リソース未解決時は static fallback または `resource_loader_unavailable` を返すよう整理する

### Task 4: ipc/index.ts wiring 調整

- 既存の PhaseResourcePlanner 注入を維持する
- Facade 内部の自動インスタンス化との共存を確認する
- 不要な明示的注入を整理する（必要に応じて）

### Task 5: logging 追加

- pipeline 有効化状態をログに出力する
- manifest 発見 / 未発見をログに出力する
- fallback 発生をログに出力する

## 参照資料

| 資料名          | パス                                                                   | 説明                   |
| --------------- | ---------------------------------------------------------------------- | ---------------------- |
| テスト仕様書    | `outputs/phase-4/test-specifications.md`                               | fail-first 確認        |
| 設計書          | `outputs/phase-2/design-document.md`                                   | 実装方針               |
| Facade 実装     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 修正本体               |
| SourceResolver  | `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts` | 自動インスタンス化対象 |
| ResourcePlanner | `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts`       | 自動インスタンス化対象 |
| ResourceReader  | `apps/desktop/src/main/services/runtime/ResolvedResourceReader.ts`     | 自動インスタンス化対象 |
| IPC wiring      | `apps/desktop/src/main/ipc/index.ts`                                   | wiring 調整対象        |

## 統合テスト連携

- Phase 4 で定義した fail-first テストを pass に反転する
- pipeline 有効化の観測点をテストで確認する

## 成果物

| 成果物   | パス                                       | 説明                               |
| -------- | ------------------------------------------ | ---------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更点、自動インスタンス化、wiring |

## 完了条件

- [ ] 3コンポーネントが自動インスタンス化される
- [ ] `plan()` / `improve()` が dynamic resource pipeline をデフォルト試行する
- [ ] manifest 自動発見が動作する
- [ ] static loader fallback が維持されている
- [ ] 既存テストが通過する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
