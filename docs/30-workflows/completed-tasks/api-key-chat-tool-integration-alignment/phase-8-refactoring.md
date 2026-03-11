# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| カテゴリ   | TDD-Refactor                              |
| ステータス | completed                                 |
| 前提Phase  | Phase 7                                   |
| 後続Phase  | Phase 9                                   |

## 目的

重複実装と責務混在を解消し、連動ロジックの保守性を上げる。

## 実行タスク

- タスク1: Team-A保存サービスの重複を整理する
- タスク2: Team-B経路選択ロジックを整理する
- タスク3: Team-C表示状態ロジックを整理する

### タスク1: Team-A保存サービスの重複を整理する

**目的**: API キー保存関連の責務を一箇所へ寄せる。

**手順**:

1. 保存・取得・削除 API の共通化ポイントを抽出する。
2. 重複コードを統合ユーティリティへ集約する。
3. セキュリティマスク処理を統一する。

**期待される成果物**:

- Team-A リファクタ差分

### タスク2: Team-B経路選択ロジックを整理する

**目的**: provider/model 決定ロジックの分岐を単純化する。

**手順**:

1. `ai.chat` と `llm.*` の共通決定ロジックを抽出する。
2. 推論規則と失敗時処理を共通化する。
3. テストの可読性を上げる。

**期待される成果物**:

- Team-B リファクタ差分

### タスク3: Team-C表示状態ロジックを整理する

**目的**: AuthMode と AuthKey の UI 状態決定を一貫させる。

**手順**:

1. UI 状態判定を共通関数へ切り出す。
2. エラー表示メッセージ決定ロジックを整理する。
3. Settings テストコードの重複を整理する。

**期待される成果物**:

- Team-C リファクタ差分

## 参照資料

| 参照資料       | パス                                                                                                                 | 説明           |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 1成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/`                         | 要件定義       |
| Phase 2成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/`                         | 設計定義       |
| Phase 7成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-7/`                         | 補完対象       |
| Phase 6成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/`                         | テスト拡充結果 |
| Team-A実装結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/team-a-implementation.md` | 重複確認       |
| Team-B実装結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/team-b-implementation.md` | 分岐整理       |
| Team-C実装結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/team-c-implementation.md` | 表示整理       |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容           |
| ------------ | ------------------------------------------------------------------------------------------- | -------------- |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 再利用パターン |
| 状態管理     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store責務      |

## 統合テスト連携

- リファクタ後に Team-A/B/C 統合テストを再実行し、挙動差分ゼロを確認する。
- 差分発生時は Phase 5 の実装意図と突合する。

## 成果物

| 成果物         | パス                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| リファクタ計画 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-8/refactoring-plan.md`   |
| リファクタ結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-8/refactoring-result.md` |
| 再実行ログ     | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-8/regression-log.md`     |

## 完了条件

- [x] Team-A/B/C の重複実装が整理されている
- [x] 挙動差分が無いことをテストで確認している
- [x] セキュリティマスク処理が統一されている
- [x] Phase 9 品質検証へ渡す差分一覧が完成している
- [x] 本Phase内の全タスクを100%実行完了
