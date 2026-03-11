# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| カテゴリ   | バグ修正                                  |
| 優先度     | 高                                        |
| ステータス | completed                                 |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2                                   |

## 目的

API キー保存経路とチャット実行経路の現行実装を事実ベースで確定し、修正要件を要件 ID と受入基準へ落とし込む。

## 実行タスク

- タスク1: 現行配線の事実確認マトリクスを作成する
- タスク2: 不整合を要件ID化する
- タスク3: 受入基準と除外範囲を確定する

### タスク1: 現行配線の事実確認マトリクスを作成する

**目的**: 保存先、取得元、呼び出し経路の断絶点を可視化する。

**手順**:

1. Settings 側 API キー保存経路を追跡し、保存ストア名を記録する。
2. LLM 実行側 API キー取得経路を追跡し、参照ストア名を記録する。
3. `ai.chat` 経路と `llm.send-chat` 経路の選択プロバイダー反映点を記録する。
4. AuthKey 設定 UI と `auth-key:*` IPC の接続状態を記録する。

**期待される成果物**:

- 配線事実確認マトリクス
- 断絶点一覧

### タスク2: 不整合を要件ID化する

**目的**: 修正対象を曖昧語なしで要求仕様へ変換する。

**手順**:

1. Team-A 対象要件を RQ-A1 から採番する。
2. Team-B 対象要件を RQ-B1 から採番する。
3. Team-C 対象要件を RQ-C1 から採番する。
4. 各要件に失敗時挙動と検証方法を紐付ける。

**期待される成果物**:

- 要件一覧（RQ-A/B/C）
- 要件トレーサビリティ表

### タスク3: 受入基準と除外範囲を確定する

**目的**: Phase 10 で機械判定できる合否基準を確定する。

**手順**:

1. AC-1 から AC-8 を検証コマンド単位で定義する。
2. スコープ外項目を明示し、未タスク化の判定基準を定義する。
3. Phase 1-3 完了前に Phase 4 へ進行しないゲートを文書化する。

**期待される成果物**:

- 受入基準定義
- スコープ境界定義

## 参照資料

| 参照資料        | パス                                                                                 | 説明                      |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| メイン仕様書    | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/index.md` | タスク全体定義            |
| APIキー保存UI   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`            | Settings 保存経路         |
| APIキー保存Main | `apps/desktop/src/main/infrastructure/apiKeyStorage.ts`                              | `api-keys` ストア実装     |
| LLMキー保存Main | `apps/desktop/src/main/services/secureStorage.ts`                                    | `llm-api-keys` ストア実装 |
| チャット実行1   | `apps/desktop/src/main/ipc/aiHandlers.ts`                                            | `ai.chat` 経路            |
| チャット実行2   | `apps/desktop/src/main/handlers/llm.ts`                                              | `llm.*` 経路              |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                          |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| APIエンドポイント俯瞰 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | チャンネル横断関係            |
| IPC全体仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | API/IPC 契約                  |
| Agent IPC契約         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | preflight 導線契約            |
| LLM IPC型             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`          | LLM リクエスト/レスポンス型   |
| LLM選択UI仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`     | 選択値反映の期待挙動          |
| Settings仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | 設定画面導線                  |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | APIキー保護の基本要件         |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | preload 境界と防御            |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | preflight/validation 同期手順 |
| 例外処理              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 失敗時分類とメッセージ方針    |
| 認証I/F               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`        | auth-mode / auth-key 契約     |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Store責務と選択状態管理       |
| 台帳                  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | Phase 12 同期対象確認         |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 再発防止観点                  |

### aiworkflow-requirements 抽出結果（実装突合済み）

| 抽出ID | 抽出した事実                                                                                                | 要件化方針                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| EX-A1  | Settings APIキーは `api-keys` ストアへ保存されるが、`llm.*` 実行経路は `llm-api-keys` のみを参照する        | RQ-A1: 保存経路と参照経路を単一契約へ統合する                  |
| EX-A2  | `api-endpoints.md` では `apiKey:*`・`auth-key:*`・`AI_CHAT`・`llm:*` が別契約として定義され、横断整合が必要 | RQ-A1/RQ-B1/RQ-C1 の跨ぎ整合を必須にする                       |
| EX-B1  | `ai.chat` は `AIChatRequest` に provider/model を持たず、Main側で `openai/gpt-4o` へフォールバック可能      | RQ-B1: `ai.chat` と `llm.*` の選択プロバイダー反映を一致させる |
| EX-B2  | `setSelectedLLMConfig()` の実呼び出しがなく、Rendererの選択状態が Main 実行設定へ伝搬しない                 | RQ-B2: Renderer→Main の設定同期導線を追加する                  |
| EX-B4  | `ui-ux-llm-selector.md` では選択値を `AI_CHAT` に含める期待が記録されており、現行実装と乖離がある           | RQ-B1/RQ-B2: UI期待と実装契約を一致させる                      |
| EX-B3  | `ipc-contract-checklist.md` は request/response/validation と仕様同期を1セットで要求している                | RQ-B1/RQ-B2: 実装と同時に契約更新を必須化する                  |
| EX-C1  | AuthKey は `auth-key-store` に保存され、`SkillExecutor` が参照する導線は存在する                            | RQ-C1: AuthKey UI表示と auth-mode 状態表示の乖離のみ解消する   |
| EX-C2  | APIキー保存は DB ではなく `electron-store`（ローカル）で管理される                                          | RQ-C2: 保存先仕様を明文化し、UI説明文と一致させる              |
| EX-C3  | `api-ipc-agent.md` は `auth-key:exists` の preflight 契約を要求している                                     | RQ-C1: Settings 表示だけでなく実行前判定との整合を確認する     |

### 要件ID（確定版）

| 要件ID | 内容                                                                                      | 対応Team |
| ------ | ----------------------------------------------------------------------------------------- | -------- |
| RQ-A1  | `apiKey:save/delete/list` と `llm.*` 実行が同じキーソースを参照すること                   | Team-A   |
| RQ-A2  | キー更新時に `LLMAdapterFactory` キャッシュ無効化が保証されること                         | Team-A   |
| RQ-B1  | `ai.chat` と `llm.send-chat` / `llm.stream-chat` が同一 provider/model 選択を使用すること | Team-B   |
| RQ-B2  | provider/model の Renderer 選択値が Main 実行設定へ伝搬すること                           | Team-B   |
| RQ-C1  | AuthKey の保存状態（saved/env-fallback/not-set）表示が実状態と一致すること                | Team-C   |
| RQ-C2  | APIキー保存先がローカル保管であることを仕様・UI文言で一貫化すること                       | Team-C   |

## 統合テスト連携

- Phase 4 で RQ-A/B/C に対応する統合テストケースを作成する。
- Phase 5 で変更した経路に対して契約テストを追加する。
- Phase 6 で異常系と復旧系の統合テストを拡張する。

## 成果物

| 成果物                 | パス                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 要件定義書             | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/requirements-definition.md` |
| 配線事実確認マトリクス | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/current-routing-matrix.md`  |
| 受入基準表             | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/acceptance-criteria.md`     |

## 完了条件

- [x] 保存経路と参照経路の事実確認マトリクスが完成している
- [x] RQ-A/B/C 要件が ID 付きで定義されている
- [x] AC-1 から AC-8 の検証方法が定義されている
- [x] スコープ外項目と未タスク化基準が定義されている
- [x] 本Phase内の全タスクを100%実行完了
