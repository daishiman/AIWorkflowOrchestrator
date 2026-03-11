# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| カテゴリ   | TDD-Green                                 |
| ステータス | completed                                 |
| 前提Phase  | Phase 4                                   |
| 後続Phase  | Phase 6                                   |

## 目的

Phase 4 の Red テストを Green 化し、保存経路・実行経路・AuthKey導線を同時に整合させる。

## 実行タスク

- タスク1: Team-A保存経路連動を実装する
- タスク2: Team-Bチャット実行経路連動を実装する
- タスク3: Team-C AuthKey導線連動を実装する

### タスク1: Team-A保存経路連動を実装する

**目的**: Settings API キー操作が LLM 実行参照先へ反映される状態を作る。

**手順**:

1. 採用した単一正本方針に従い、`apiKey:save` と `apiKey:delete` の反映先を一本化する。
2. キー更新時に `LLMAdapterFactory.clearInstance` を呼び出す。
3. 登録一覧 API と実行可否判定の整合を取る。
4. 二重書き込みや双方向同期の暫定ロジックを残さないことを確認する。

**期待される成果物**:

- Team-A 実装差分

### タスク2: Team-Bチャット実行経路連動を実装する

**目的**: 選択プロバイダー/モデルが `ai.chat` と `llm.*` で一致する状態を作る。

**手順**:

1. 選択状態の Main 連携経路を追加する。
2. `ai.chat` 側で固定デフォルトへ落ちる条件を除去する。
3. 非ストリームとストリームで同一選択値を使用する。
4. 再起動後挙動（復元する/しない）を設計決定どおりに実装する。

**期待される成果物**:

- Team-B 実装差分

### タスク3: Team-C AuthKey導線連動を実装する

**目的**: AuthMode と AuthKey 設定導線が UI 上で一致する状態を作る。

**手順**:

1. Settings へ `AuthKeySection` を配置し、`ApiKeysSection` と責務を分離する。
2. `auth-mode=api-key` で必要情報が表示される状態を実装する。
3. `auth-key:exists` と表示バッジを同期する。

**期待される成果物**:

- Team-C 実装差分

## 参照資料

| 参照資料      | パス                                                                                         | 説明              |
| ------------- | -------------------------------------------------------------------------------------------- | ----------------- |
| Phase 4成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-4/` | Red テスト仕様    |
| APIキーIPC    | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                | Team-A 実装対象   |
| LLM実行       | `apps/desktop/src/main/handlers/llm.ts`                                                      | Team-A/B 実装対象 |
| AIチャット    | `apps/desktop/src/main/ipc/aiHandlers.ts`                                                    | Team-B 実装対象   |
| Settings画面  | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                     | Team-C 実装対象   |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                      |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| APIエンドポイント俯瞰 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | 影響チャンネル確認        |
| IPC全体仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | 変更契約                  |
| LLM IPC型             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`          | 型整合                    |
| Settings仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | UI整合                    |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | マスク要件                |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | preflight/validation 監査 |
| 例外処理              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 失敗時レスポンス整合      |

## 統合テスト連携

- 実装完了直後に Team-A/B/C の統合テストを実行する。
- 失敗時は当該 Team の変更のみ戻し、他 Team を固定する。

## 成果物

| 成果物         | パス                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| 実装記録       | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/implementation-log.md`    |
| Team-A実装詳細 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/team-a-implementation.md` |
| Team-B実装詳細 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/team-b-implementation.md` |
| Team-C実装詳細 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/team-c-implementation.md` |

## 完了条件

- [x] Team-A/B/C の Red テストが Green 化されている
- [x] APIキー保存経路と実行参照経路が一致している
- [x] 二重ストア運用が排除され、採用方針へ収束している
- [x] 選択プロバイダー/モデルが実行経路で一致している
- [x] AuthKey導線の UI と IPC が一致している
- [x] 本Phase内の全タスクを100%実行完了
