# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| カテゴリ   | 品質                                      |
| ステータス | completed                                 |
| 前提Phase  | Phase 5                                   |
| 後続Phase  | Phase 7                                   |

## 目的

境界条件と異常系を拡充し、API キー連動バグの再発を抑止する。

## 実行タスク

- タスク1: Team-A境界テストを拡充する
- タスク2: Team-B経路整合テストを拡充する
- タスク3: Team-C導線テストを拡充する

### タスク1: Team-A境界テストを拡充する

**目的**: 保存経路統合の異常系を網羅する。

**手順**:

1. 暗号化不可環境でのフォールバック挙動を検証する。
2. キー更新時のキャッシュ置換を検証する。
3. 削除後の実行拒否と一覧状態一致を検証する。

**期待される成果物**:

- Team-A 追加テスト

### タスク2: Team-B経路整合テストを拡充する

**目的**: 非ストリームとストリームで同一選択値が使われることを検証する。

**手順**:

1. `ai.chat` の provider/model 反映テストを追加する。
2. `llm.send-chat` と `llm.stream-chat` の一致テストを追加する。
3. 再起動後挙動を Phase 2 の設計決定（復元する/しない）どおりに検証する。

**期待される成果物**:

- Team-B 追加テスト

### タスク3: Team-C導線テストを拡充する

**目的**: AuthMode 切替時の UI 表示と実行前検証を検証する。

**手順**:

1. `subscription` と `api-key` 切替時の表示差分テストを追加する。
2. `auth-key:exists` 失敗時の表示テストを追加する。
3. 設定画面と実行前チェックの整合テストを追加する。

**期待される成果物**:

- Team-C 追加テスト

## 参照資料

| 参照資料         | パス                                                                                         | 説明                  |
| ---------------- | -------------------------------------------------------------------------------------------- | --------------------- |
| Phase 5成果物    | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/` | 実装結果              |
| LLMテスト群      | `apps/desktop/src/main/handlers/__tests__/`                                                  | Team-A/B テスト拡充先 |
| Settingsテスト群 | `apps/desktop/src/renderer/views/SettingsView/__tests__/`                                    | Team-C テスト拡充先   |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                   |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト基準             |
| APIエンドポイント俯瞰 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | 回帰対象チャンネル確認 |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 契約回帰観点           |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | 秘密情報保護           |

## 統合テスト連携

- Team-A/B/C の拡充テストを 3 系統で分離実行する。
- 3 系統がすべて PASS した時点で Phase 7 へ進行する。

## 成果物

| 成果物           | パス                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| テスト拡充計画   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/test-expansion-plan.md` |
| Team-Aテスト結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/team-a-test-result.md`  |
| Team-Bテスト結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/team-b-test-result.md`  |
| Team-Cテスト結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/team-c-test-result.md`  |

## 完了条件

- [x] Team-A/B/C の追加テストが作成されている
- [x] 異常系と復旧系の検証が完了している
- [x] 実装との差分が無いことを確認している
- [x] 次Phaseで使うカバレッジ測定コマンドが固定されている
- [x] 本Phase内の全タスクを100%実行完了
