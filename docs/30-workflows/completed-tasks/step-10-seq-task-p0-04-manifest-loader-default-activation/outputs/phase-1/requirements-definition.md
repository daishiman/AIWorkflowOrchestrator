# Phase 1 成果物: 要件定義書

## 問題定義

### 現状の問題

| 問題ID | 問題                                                                                                               | 証拠（ファイル:行）                   |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| P-01   | dynamic resource pipeline の活性化が3コンポーネント全外部注入に依存していた                                        | RuntimeSkillCreatorFacade.ts:264-270  |
| P-02   | `loadWorkflowManifest()` は `explicitRoot` が提供された場合のみ呼ばれる（自動発見なし）                            | RuntimeSkillCreatorFacade.ts:279-293  |
| P-03   | Facade コンストラクタが3コンポーネントを外部注入に完全依存し、自動インスタンス化を行わない                         | RuntimeSkillCreatorFacade.ts:114-134  |
| P-04   | `plan()` / `improve()` が resource 解決失敗時に static loader または degraded error へフォールバックする必要がある | RuntimeSkillCreatorFacade.ts:408, 674 |

---

## 機能要件

| ID    | 要件                                                                                                | 検証方法       |
| ----- | --------------------------------------------------------------------------------------------------- | -------------- |
| FR-01 | Facade 初期化時に `SkillCreatorSourceResolver` を自動インスタンス化する                             | ユニットテスト |
| FR-02 | Facade 初期化時に `PhaseResourcePlanner` を自動インスタンス化する                                   | ユニットテスト |
| FR-03 | Facade 初期化時に `ResolvedResourceReader` を自動インスタンス化する                                 | ユニットテスト |
| FR-04 | `plan()` / `improve()` が3コンポーネント利用可能時に dynamic resource pipeline をデフォルト試行する | ユニットテスト |
| FR-05 | `loadWorkflowManifest()` が source resolver candidates から manifest を自動発見する                 | 統合テスト     |
| FR-06 | manifest 未発見時に static loader fallback が動作する                                               | ユニットテスト |

---

## 非機能要件

| ID     | 要件                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| NFR-01 | 既存テストが変更なしで通過する（後方互換性）                                 |
| NFR-02 | 自動インスタンス化が Facade のコンストラクタ範囲で完了する（初期化遅延なし） |
| NFR-03 | dynamic pipeline の有効化状態・manifest 発見・fallback 発生がログで確認可能  |

---

## 受入条件マッピング

| AC   | 機能要件 | 内容                                                        |
| ---- | -------- | ----------------------------------------------------------- |
| AC-1 | FR-01    | `sourceResolver` 自動インスタンス化                         |
| AC-2 | FR-02    | `resourcePlanner` 自動インスタンス化                        |
| AC-3 | FR-03    | `resolvedResourceReader` 自動インスタンス化                 |
| AC-4 | FR-04    | dynamic resource pipeline の自動試行                        |
| AC-5 | FR-05    | `loadWorkflowManifest()` が candidates から manifest を発見 |
| AC-6 | FR-06    | static loader fallback 正常動作                             |
| AC-7 | NFR-01   | 既存テスト通過                                              |

---

## スコープ境界

### 含む

- Facade 初期化ロジック変更（コンストラクタ）
- 3コンポーネントの自動インスタンス化
- `loadWorkflowManifest()` の候補自動探索拡張
- fallback chain の実装（dynamic → static loader → degraded error）
- `ipc/index.ts` の wiring 調整（必要に応じて）

### 含まない

- manifest ファイル自体の作成（TASK-P0-03 のスコープ）
- verify engine の実装（TASK-P0-01 のスコープ）
- `SkillCreatorSourceResolver` / `PhaseResourcePlanner` / `ResolvedResourceReader` の内部ロジック変更
