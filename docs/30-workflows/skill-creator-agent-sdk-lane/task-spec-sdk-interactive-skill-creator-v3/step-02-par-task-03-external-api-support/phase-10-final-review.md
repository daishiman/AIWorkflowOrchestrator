# Phase 10: 最終レビュー -- External API Support（外部APIサポート）

## メタ情報

| 項目      | 値                   |
| --------- | -------------------- |
| Phase番号 | 10                   |
| 機能名    | external-api-support |
| タスクID  | TASK-SDK-SC-03       |
| 作成日    | 2026-04-02           |
| 依存Phase | Phase 9（品質保証）  |

## 目的

本タスク（TASK-SDK-SC-03）の実装を、依存タスク（TASK-SDK-SC-01: SDK Session Bridge）および
並列タスクとの結合ポイント・セキュリティ要件の観点から4条件でレビューする。

## Task 10-1: 矛盾なし — TASK-SDK-SC-01との整合確認

SDK Session Bridge（Task-01）が確立したIPCインフラとの整合を確認する。

| 接続ポイント                            | Task-01が提供                      | Task-03が期待                                                  | 整合 |
| --------------------------------------- | ---------------------------------- | -------------------------------------------------------------- | ---- |
| IPCチャネル基盤                         | `ipcMain.handle` 登録済み          | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API` を追加登録 | OK   |
| `external-api-config-required` イベント | SDKセッション中に発行              | `ExternalApiConfigForm` の表示トリガーとして受信               | OK   |
| `channels.ts` 定数管理                  | 既存チャネル定数がsharedで一元管理 | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` を同ファイルに追加       | OK   |

**結論**: Task-01のインフラを破壊せず、チャネル定数の追記のみで対応。矛盾なし。

## Task 10-2: 漏れなし — 全要件の実装確認

| 要件ID | 内容                             | 実装箇所                                                                | 漏れ |
| ------ | -------------------------------- | ----------------------------------------------------------------------- | ---- |
| FR-001 | 外部API設定入力（URL/方法/認証） | `ExternalApiConfigForm`                                                 | なし |
| FR-002 | GET/POSTリクエスト実行           | `HttpExternalApiAdapter.get/post`                                       | なし |
| FR-003 | タイムアウト30秒                 | `fetchWithTimeout` (TIMEOUT_MS)                                         | なし |
| FR-004 | エラーハンドリング（4種）        | `ExternalApiHttpError` / `ExternalApiTimeoutError` / ネットワークエラー | なし |
| FR-005 | APIキーのセキュア管理            | `setAuth` ログなし / `warnIfNotHttps`                                   | なし |

**結論**: FR-001〜FR-005の全要件が実装に含まれている。漏れなし。

## Task 10-3: 整合性 — 型・チャネル・コンポーネントの整合

### 型定義の整合性

| 型名                      | 送信側                  | 受信側                           | 整合 |
| ------------------------- | ----------------------- | -------------------------------- | ---- |
| `ExternalApiConfig`       | `ExternalApiConfigForm` | IPCハンドラー（channels.ts経由） | OK   |
| `SkillExternalApiContext` | IPCハンドラー           | `SkillCreatorWorkflowEngine`     | OK   |
| `ExternalApiAuthType`     | フォームのセレクト値    | `HttpExternalApiAdapter.setAuth` | OK   |

### ExternalApiConfigFormの送信フロー整合

```
ユーザー入力
  └── ExternalApiConfigForm.handleSubmit
        └── ExternalApiConfig オブジェクト構築
              └── window.electronAPI.invoke(SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API, config)
                    └── IPCハンドラー → WorkflowEngine → SDKセッション注入
```

**結論**: フォーム送信からSDKセッション注入までの型・チャネル・フローが整合している。

## Task 10-4: 依存関係整合 — 並列タスクとの非干渉確認

| 並列タスク             | 変更ファイル重複          | 競合リスク | 対処                       |
| ---------------------- | ------------------------- | ---------- | -------------------------- |
| TASK-SDK-SC-02（並列） | `channels.ts`（追記のみ） | 低         | 別セクションへの追記で回避 |
| その他並列タスク       | なし                      | なし       | -                          |

**注意**: `channels.ts` は複数タスクから追記される可能性があるため、マージ時に定数名の重複がないことを確認する。

### 並列タスク完了後の統合テスト計画

| テストID | 内容                                                                                                            | 前提条件        |
| -------- | --------------------------------------------------------------------------------------------------------------- | --------------- |
| INT-01   | SDKセッション中に `external-api-config-required` イベントが発行されるとき、`ExternalApiConfigForm` が表示される | Task-01・03完了 |
| INT-02   | フォームでAPI設定を送信するとIPCが発火し、WorkflowEngineに設定が渡される                                        | Task-03完了     |
| INT-03   | タイムアウトエラー時にUIにエラーメッセージが表示される                                                          | Task-03完了     |
| INT-04   | 生成されたスキルに外部API接続コードが含まれる                                                                   | Task-01・03完了 |

## Task 10-5: セキュリティ最終確認

| セキュリティ要件               | 実装箇所                                | 最終確認 |
| ------------------------------ | --------------------------------------- | -------- |
| APIキーをログ非出力（FR-005）  | `HttpExternalApiAdapter.setAuth`        | - [ ]    |
| HTTPSでないURLに警告（FR-005） | `HttpExternalApiAdapter.warnIfNotHttps` | - [ ]    |
| 認証情報フィールドがpassword型 | `ExternalApiConfigForm` のinput要素     | - [ ]    |
| ログで認証ヘッダーをマスク     | `buildAuthHeader` にログ出力なし        | - [ ]    |
| contextIsolation有効確認       | Electron BrowserWindowの設定            | - [ ]    |

## 参照資料

| 資料名           | パス                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 9 品質保証 | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/phase-9-quality-assurance.md` |
| TASK-SDK-SC-01   | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md`                                                                                               |

## 完了条件

- [ ] TASK-SDK-SC-01（SDK Session Bridge）とのIPC整合を確認した
- [ ] FR-001〜FR-005の全要件が実装に含まれることを確認した
- [ ] 型定義・チャネル・送信フローの整合性を確認した
- [ ] 並列タスクとの変更ファイル競合（channels.ts追記）を確認した
- [ ] セキュリティ最終確認（FR-005 / contextIsolation）を全件実施した
- [ ] 並列タスク完了後の統合テスト計画（INT-01〜INT-04）を記録した

## 次の Phase: Phase 11（phase-11-manual-testing.md）
