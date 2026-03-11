# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| カテゴリ   | 検証                                      |
| ステータス | completed                                 |
| 前提Phase  | Phase 10                                  |
| 後続Phase  | Phase 12                                  |

## 目的

UI からの操作で API キー連動とチャット実行連動が成立することを実画面で検証する。

## 実行タスク

- タスク1: Team-A保存連動の手動シナリオを実施する
- タスク2: Team-Bチャット実行連動の手動シナリオを実施する
- タスク3: Team-C AuthKey導線の手動シナリオを実施する

### タスク1: Team-A保存連動の手動シナリオを実施する

**目的**: Settings 保存内容が実行可否へ反映されることを確認する。

**手順**:

1. OpenAI/Anthropic/Google/xAI の各キーを設定する。
2. `llm:get-providers` 反映状態を確認する。
3. 削除後に実行拒否へ遷移することを確認する。

**期待される成果物**:

- Team-A 手動テスト結果

### タスク2: Team-Bチャット実行連動の手動シナリオを実施する

**目的**: 選択プロバイダー/モデルが実行経路で一致することを確認する。

**手順**:

1. provider/model を切り替え、`ai.chat` 実行結果を確認する。
2. 同じ選択値で `llm.send-chat` と `llm.stream-chat` を確認する。
3. 再起動後の選択状態と実行結果を確認する。

**期待される成果物**:

- Team-B 手動テスト結果

### タスク3: Team-C AuthKey導線の手動シナリオを実施する

**目的**: AuthMode と AuthKey 導線の表示と挙動を確認する。

**手順**:

1. `auth-mode=api-key` で AuthKey 入力導線を確認する。
2. `auth-key:exists` 結果と表示バッジ一致を確認する。
3. `subscription` 切替後の表示制御を確認する。

**期待される成果物**:

- Team-C 手動テスト結果

## 参照資料

| 参照資料       | パス                                                                                                          | 説明           |
| -------------- | ------------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 1成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/`                  | 要件定義       |
| Phase 2成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/`                  | 設計定義       |
| Phase 5成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/`                  | 実装結果       |
| Phase 6成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/`                  | テスト拡充結果 |
| Phase 7成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-7/`                  | カバレッジ結果 |
| Phase 8成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-8/`                  | リファクタ結果 |
| Phase 9成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-9/`                  | 品質保証結果   |
| Phase 10判定   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-10/gate-decision.md` | 実施条件       |
| テストシナリオ | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-4/test-design.md`    | シナリオ元     |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                  | 内容       |
| ------------ | --------------------------------------------------------------------- | ---------- |
| Settings仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` | 画面期待値 |
| IPC仕様      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` | 実行契約   |

## 統合テスト連携

- 手動シナリオの各ケースを自動テスト ID と対応付ける。
- 手動で発見した差分は Phase 12 未タスク検出に移送する。

## テストケース

| テストケース | 観点          | 期待結果                                                           |
| ------------ | ------------- | ------------------------------------------------------------------ |
| TC-11-01     | 初期表示      | api-key モードで ApiKeysSection と AuthKeySection が同時表示される |
| TC-11-02     | 保存操作      | APIキー保存後に成功フィードバックが表示される                      |
| TC-11-03     | fallback 表示 | `source=env-fallback` が視覚的に判別できる                         |

## 画面カバレッジマトリクス

| テストケース | 状態         | 証跡                                                                        | 備考                          |
| ------------ | ------------ | --------------------------------------------------------------------------- | ----------------------------- |
| TC-11-01     | 初期表示     | `outputs/phase-11/screenshots/TC-11-01-settings-apikey-authkey-initial.png` | Team-A/Team-C 導線初期状態    |
| TC-11-02     | 保存成功     | `outputs/phase-11/screenshots/TC-11-02-settings-apikey-save-success.png`    | Team-A 保存成功フィードバック |
| TC-11-03     | env fallback | `outputs/phase-11/screenshots/TC-11-03-settings-authkey-env-fallback.png`   | Team-C source表示確認         |

## 成果物

| 成果物         | パス                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| 手動テスト計画 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-11/manual-test-plan.md`   |
| 手動テスト結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-11/manual-test-result.md` |
| 画面証跡一覧   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-11/screenshot-matrix.md`  |

## 完了条件

- [x] Team-A/B/C シナリオが実行されている
- [x] 主要ケースの画面証跡が取得されている
- [x] 期待値と実測値の差分が記録されている
- [x] 未解消差分の分類が完了している
- [x] 本Phase内の全タスクを100%実行完了
