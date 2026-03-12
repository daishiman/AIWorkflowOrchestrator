# Phase 4: テスト作成

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 4                          |
| Phase名    | テスト作成                 |
| カテゴリ   | TDD-Red                    |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 3                    |
| 後続Phase  | Phase 5                    |

## 目的

04B の UI / hook / integration / accessibility を先にテストで固定し、Phase 5 の実装方針を拘束する。

## 実行タスク

- component test 設計: zero state、input、chip、message list、mention dropdown を固定する
- hook test 設計: controller と mention query の状態遷移を固定する
- integration test 設計: file context + conversation + stream の接続を固定する
- a11y test 設計: role、keyboard、focus order を固定する

## 参照資料

| 参照資料                | パス                                          | 説明           |
| ----------------------- | --------------------------------------------- | -------------- |
| 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`      | Phase 1 成果物 |
| コンポーネント設計      | `outputs/phase-2/component-design.md`         | Phase 2 成果物 |
| 状態 / データフロー設計 | `outputs/phase-2/state-dataflow-design.md`    | Phase 2 成果物 |
| UI 状態マトリクス       | `outputs/phase-2/interaction-state-matrix.md` | Phase 2 成果物 |
| レビュー結果            | `outputs/phase-3/design-review-result.md`     | Phase 3 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                                     |
| --------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| component testing     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component / hook / integration test 正本 |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | a11y test 正本                           |
| llm streaming         | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`              | stream event 契約                        |

## 実行手順

### ステップ1: component test を列挙する

| 対象                        | 主要ケース                                                  |
| --------------------------- | ----------------------------------------------------------- |
| `WorkspaceChatPanel`        | 初期 zero state、selected file 連携、error surface          |
| `WorkspaceChatInput`        | empty disable、sending disable、focus ring、suggestion 反映 |
| `WorkspaceFileContextChips` | 3 件表示、`+N件` 集約、remove                               |
| `WorkspaceMentionDropdown`  | query 表示、active option、keyboard select                  |

### ステップ2: hook / integration test を列挙する

| 対象                         | 主要ケース                                                        |
| ---------------------------- | ----------------------------------------------------------------- |
| `useWorkspaceChatController` | create conversation、send、stream chunk、end、error、cancel       |
| `useWorkspaceMentionQuery`   | `@` 検出、候補絞り込み、Enter / Tab 確定                          |
| integration                  | selected file -> chip -> send -> stream -> save assistant message |

### ステップ3: accessibility test を列挙する

| 対象         | 主要ケース                       |
| ------------ | -------------------------------- |
| zero state   | bubble button の accessible name |
| message area | `role="log"` / `aria-live`       |
| mention      | listbox / option、矢印キー移動   |
| chip remove  | button label、Tab 移動順         |

## 統合テスト連携

| 観点         | 内容                                             |
| ------------ | ------------------------------------------------ |
| file context | selected file -> chip -> send payload を固定する |
| conversation | create / addMessage / reload を固定する          |
| stream       | chunk / end / error / cancel を固定する          |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                            | 仕様参照先                                                                        |
| ------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| テスタビリティ     | store / preload / hook のモック境界を定義する    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| アクセシビリティ   | role / keyboard / focus の必須ケースを定義する   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| エラーハンドリング | file / stream / conversation 異常系を Red にする | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             |

## 成果物

| 成果物           | パス                                         | 説明                                      |
| ---------------- | -------------------------------------------- | ----------------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`      | テスト戦略                                |
| テストケース一覧 | `outputs/phase-4/test-cases.md`              | component / hook / integration / a11y     |
| 統合テスト設計   | `outputs/phase-4/integration-test-design.md` | conversation / stream / file context 連携 |

## 完了条件

- [x] component / hook / integration / a11y のテスト対象を列挙している
- [x] Red になるべき失敗条件を定義している
- [x] stream / conversation / file context の接続をテストで固定している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. component test 設計
2. hook test 設計
3. integration test 設計
4. a11y test 設計
5. 成果物と完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-4/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
