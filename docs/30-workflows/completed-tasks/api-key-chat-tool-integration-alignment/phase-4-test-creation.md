# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| カテゴリ   | TDD-Red                                   |
| ステータス | completed                                 |
| 前提Phase  | Phase 1, Phase 2, Phase 3                 |
| 後続Phase  | Phase 5                                   |

## 目的

Team-A/B/C の修正要件に対して、失敗から開始するテストセットを作成し、実装対象を固定する。

## 実行タスク

- タスク1: Team-A保存経路テストを作成する
- タスク2: Team-Bチャット実行経路テストを作成する
- タスク3: Team-C AuthKey導線テストを作成する

### タスク1: Team-A保存経路テストを作成する

**目的**: Settings 保存結果が LLM 実行参照先へ届かない現象を再現する。

**手順**:

1. `apiKey:save` 後に `llm:get-providers` が未登録表示になる失敗テストを作成する。
2. `apiKey:delete` 後に LLM 実行が拒否される挙動を固定する。
3. ストア同期とキャッシュ無効化の期待値を定義する。

**期待される成果物**:

- Team-A Red テスト

### タスク2: Team-Bチャット実行経路テストを作成する

**目的**: `ai.chat` と `llm.*` の選択プロバイダー不一致を再現する。

**手順**:

1. 選択モデル変更後も `ai.chat` が固定設定へ落ちる失敗テストを作成する。
2. `llm.send-chat` と `llm.stream-chat` のプロバイダー一致確認テストを作成する。
3. 選択状態の再起動後挙動（復元する/しない）を設計決定どおりに失敗テスト化する。

**期待される成果物**:

- Team-B Red テスト

### タスク3: Team-C AuthKey導線テストを作成する

**目的**: AuthMode UI と AuthKey UI の断絶を再現する。

**手順**:

1. Settings で `AuthKeySection` が未配置である現状を再現する失敗テストを作成する。
2. `auth-mode=api-key` のとき AuthKey 導線が表示される期待値を定義する。
3. `auth-key:exists` と表示状態の整合テストを作成する。

**期待される成果物**:

- Team-C Red テスト

## 参照資料

| 参照資料      | パス                                                                                                         | 説明                |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------- |
| Phase 1成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/`                 | 要件定義            |
| Phase 2成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/`                 | 設計定義            |
| Phase 3判定   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-3/gate-decision.md` | 進行条件            |
| APIキーUI     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                                    | Team-A テスト対象   |
| AuthMode UI   | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                                     | Team-C テスト対象   |
| LLMハンドラ   | `apps/desktop/src/main/handlers/llm.ts`                                                                      | Team-A/B テスト対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容                     |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| APIエンドポイント俯瞰 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`          | テスト対象チャンネル特定 |
| LLM IPC型             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`          | 入出力契約               |
| IPC全体仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | チャンネル契約           |
| Settings仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | 画面期待値               |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 契約テスト観点           |

## 統合テスト連携

- Team-A/B/C の統合テストを独立実行できる構成にする。
- 失敗原因が交差しないように fixture を分離する。

## 成果物

| 成果物           | パス                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| テスト設計書     | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-4/test-design.md`       |
| Team-Aテスト仕様 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-4/team-a-test-cases.md` |
| Team-Bテスト仕様 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-4/team-b-test-cases.md` |
| Team-Cテスト仕様 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-4/team-c-test-cases.md` |

## 完了条件

- [x] Team-A/B/C の Red テストが作成されている
- [x] 失敗原因が仕様要件へ紐付いている
- [x] 契約テストと回帰テストの境界が定義されている
- [x] Phase 5 で実装する最小差分が固定されている
- [x] 本Phase内の全タスクを100%実行完了
