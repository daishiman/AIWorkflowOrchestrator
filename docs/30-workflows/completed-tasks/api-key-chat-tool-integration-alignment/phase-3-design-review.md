# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| カテゴリ   | ゲート                                    |
| ステータス | completed                                 |
| 前提Phase  | Phase 1, Phase 2                          |
| 後続Phase  | Phase 4                                   |

## 目的

Phase 1 と Phase 2 の要件・設計・セキュリティ整合性を判定し、Phase 4 進行可否を決定する。

## 実行タスク

- タスク1: 要件トレーサビリティを審査する
- タスク2: セキュリティと契約整合性を審査する
- タスク3: ゲート判定を記録する

### タスク1: 要件トレーサビリティを審査する

**目的**: RQ-A/B/C と AC-1..8 が設計へ落ちていることを確認する。

**手順**:

1. RQ と設計項目の対応表を全件照合する。
2. AC の検証方法が Phase 4 以降に接続していることを確認する。
3. 要件・設計・実装現状の矛盾を一覧化する。
4. 欠落または矛盾項目を `MAJOR` 指摘として分類する。

**期待される成果物**:

- 要件トレーサビリティ審査結果

### タスク2: セキュリティと契約整合性を審査する

**目的**: IPC 境界と秘密情報保護要件が満たされる設計か判定する。

**手順**:

1. `ipc-contract-checklist` Phase 1-6 を使って Preload API と IPC チャンネル差分を確認する。
2. エラーメッセージの秘密情報マスク方針を確認する。
3. 依存関係マップ（UI↔Store↔IPC↔Main）の循環参照有無を確認する。
4. キャッシュ無効化設計と並行実行安全性を確認する。

**期待される成果物**:

- セキュリティ審査結果

### タスク3: ゲート判定を記録する

**目的**: Phase 4 進行可否を一意に決定する。

**手順**:

1. 判定を `PASS` / `MINOR` / `MAJOR` から選択する。
2. `MAJOR` の場合は戻り先 Phase を明記する。
3. 判定ログを成果物に固定する。

**期待される成果物**:

- 設計レビュー判定書

## 多角思考レビュー観点

- 垂直思考: 要件→設計→テストのトレースが切れていないかを確認する。
- 水平/類推/逆説思考: 別経路（`ai.chat` と `llm.*`）間で同じ失敗が再発しないかを確認する。
- システム/因果ループ思考: 保存先分断が UI 誤認識と実行失敗を増幅しないかを確認する。
- 2軸思考: 再発リスクと実装コストで採用案を評価する。
- ダブル・ループ/改善思考: その場しのぎ修正ではなく、判断ルール自体の欠陥を特定する。

## 参照資料

| 参照資料           | パス                                                                                         | 説明               |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物      | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/` | 要件定義           |
| Phase 2成果物      | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/` | 設計書             |
| LLMハンドラ        | `apps/desktop/src/main/handlers/llm.ts`                                                      | 実行契約の照合対象 |
| AIチャットハンドラ | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                    | 実行契約の照合対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                 |
| --------------------- | ----------------------------------------------------------------------------- | -------------------- |
| APIエンドポイント俯瞰 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | 影響チャネル全体審査 |
| IPC全体仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | IPC 契約審査         |
| Agent IPC契約         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | preflight 契約審査   |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 契約検証手順         |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | 境界防御審査         |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | 秘密情報保護審査     |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Store連動審査        |
| 例外処理              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラー設計審査       |

## 統合テスト連携

- Phase 4 のテストケースに直結するレビューコメント ID を付与する。
- `MAJOR` 指摘はテスト作成開始前に解消する。

## 成果物

| 成果物                 | パス                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 矛盾・依存関係レビュー | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-3/consistency-review.md`   |
| 設計レビュー結果       | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-3/design-review-result.md` |
| 判定ログ               | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-3/gate-decision.md`        |

## 完了条件

- [x] RQ と設計の対応表審査が完了している
- [x] IPC とセキュリティ審査が完了している
- [x] 矛盾一覧と依存関係チェック結果が記録されている
- [x] 判定が PASS または MINOR で記録されている
- [x] MAJOR 指摘時は戻り先 Phase が明記されている
- [x] 本Phase内の全タスクを100%実行完了
