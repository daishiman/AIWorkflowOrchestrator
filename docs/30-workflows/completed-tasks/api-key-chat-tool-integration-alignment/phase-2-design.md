# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| カテゴリ   | バグ修正                                  |
| ステータス | completed                                 |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |

## 目的

Team-A / Team-B / Team-C の修正設計を分離し、IPC・Preload・Renderer・Main の責務境界を明確化する。  
同時に「二重ストア運用や暗黙フォールバック」を破棄し、単一正本ベースの設計へ収束させる。

## 実行タスク

- タスク1: Team-A保存経路統合設計を作成する
- タスク2: Team-Bチャット実行経路統合設計を作成する
- タスク3: Team-C AuthKey導線統合設計を作成する

### タスク1: Team-A保存経路統合設計を作成する

**目的**: `api-keys` と `llm-api-keys` の分離を解消し、採用案/棄却案を明示した設計決定を行う。

**手順**:

1. 「単一正本化案」と「双方向同期案」を 2軸（整合性リスク×運用コスト）で比較する。
2. 保存・取得・削除・一覧の4操作で副作用を分析する。
3. 採用案と棄却案の理由を ADR として固定する。
4. 鍵更新時のアダプタキャッシュ無効化と移行順序を定義する。

**期待される成果物**:

- 保存経路統合設計
- 操作別副作用分析
- アーキテクチャ決定記録（ADR）

### タスク2: Team-Bチャット実行経路統合設計を作成する

**目的**: `ai.chat` と `llm.*` のプロバイダー/モデル選択反映を一致させる。

**手順**:

1. `selectedProviderId` / `selectedModelId` の扱い（再起動復元する/しない）を契約として明文化する。
2. `ai.chat` の暗黙デフォルト依存を排除し、選択値伝搬の単一路を定義する。
3. `llm.send-chat` と `llm.stream-chat` の契約差分を吸収する設計を作成する。
4. `request/response/validation` の3点を IPC 契約に落とし込む。

**期待される成果物**:

- チャット実行経路統合設計
- 選択状態反映シーケンス図

### タスク3: Team-C AuthKey導線統合設計を作成する

**目的**: AuthMode と AuthKey UI と `auth-key:*` IPC の導線を一致させる。

**手順**:

1. Settings 画面の AuthKey 表示方針（`ApiKeysSection` との差分含む）を定義する。
2. `api-key` 認証モード時の不足導線を設計する。
3. 環境変数フォールバック時の表示ルールを設計する。

**期待される成果物**:

- AuthKey導線設計
- UI状態遷移表

## 参照資料

| 参照資料        | パス                                                                                         | 説明                  |
| --------------- | -------------------------------------------------------------------------------------------- | --------------------- |
| Phase 1成果物   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/` | 要件と断絶点          |
| IPC登録順序     | `apps/desktop/src/main/ipc/index.ts`                                                         | ハンドラ初期化順序    |
| LLMアダプタ     | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                    | キャッシュ戦略        |
| AuthKeyサービス | `apps/desktop/src/main/services/auth/AuthKeyService.ts`                                      | `auth-key-store` 契約 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                                 |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| APIエンドポイント俯瞰 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | 影響チャネルの全体確認               |
| IPC全体仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | チャンネル設計                       |
| Agent IPC契約         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | preflight 契約確認                   |
| LLM IPC型             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`          | LLM 型契約                           |
| LLM選択UI仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`     | 選択値反映期待の確認                 |
| Settings仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | 設定導線                             |
| Auth I/F              | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`        | AuthMode/AuthKey 契約                |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | APIキー取り扱い要件                  |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | 安全性要件                           |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 契約更新の監査手順                   |
| 例外処理              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラー分類と利用者向けメッセージ方針 |

## 並列実行計画（関心分離）

- Team-A / Team-B / Team-C の設計作成は並列実行する。
- 採用案の最終決定（ADR承認）は直列で実施し、3チーム案を統合してから Phase 3 へ進む。

## 統合テスト連携

- Phase 4 の統合テストケース設計で Team-A/B/C を独立トラック化する。
- トラック間の結合点は契約テストを追加し、回帰範囲を固定する。

## 成果物

| 成果物      | パス                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| 設計書      | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/architecture-design.md`          |
| 設計判断ADR | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/architecture-decision-record.md` |
| Team-A設計  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/team-a-storage-design.md`        |
| Team-B設計  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/team-b-chat-routing-design.md`   |
| Team-C設計  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/team-c-authkey-design.md`        |

## 完了条件

- [x] Team-A/B/C 設計が責務分離で定義されている
- [x] 採用案/棄却案と移行順序が ADR で固定されている
- [x] IPC/Preload/Renderer/Main の変更範囲が明示されている
- [x] キャッシュ無効化とエラー処理方針が定義されている
- [x] Phase 3 レビュー観点へ引き渡す設計チェックリストが完成している
- [x] 本Phase内の全タスクを100%実行完了
