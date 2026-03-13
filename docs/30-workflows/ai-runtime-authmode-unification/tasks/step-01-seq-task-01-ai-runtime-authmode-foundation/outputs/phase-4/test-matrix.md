# Phase 4 テストマトリクス

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 4                                            |
| 成果物種別 | テストマトリクス                             |
| 作成日     | 2026-03-13                                   |
| 前提       | Phase 2 設計サマリー / 契約一覧              |
| 後続       | Phase 5 実装                                 |

---

## テストカテゴリ概要

| カテゴリ | 目的                                                  | テスト数 |
| -------- | ----------------------------------------------------- | -------- |
| C1       | 契約テスト（成功系） - Resolver / Mapping / Migration | 14       |
| C2       | 失敗系テスト - fail-fast / guidance / silent 禁止     | 10       |
| C3       | 回帰系テスト - イベント駆動 / cache / UI 更新         | 8        |
| C4       | 統合テスト - 複数 Resolver 連携 / State 更新フロー    | 6        |
| **合計** |                                                       | **38**   |

---

## C1: 契約テスト（成功系）

### C1-1: AIAccessCapabilityResolver

| TC-ID   | テスト名                                                           | 入力                                                                       | 期待結果                             | 優先度 |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------ | ------ |
| TC-C101 | API key 存在 + integrated 対応 surface で integratedRuntime を返す | `surfaceId: 'chatView'`, `apiKeyExists: true`, `terminalAvailable: true`   | `capability === 'integratedRuntime'` | P0     |
| TC-C102 | API key 存在 + terminal 可用で both を返す                         | `surfaceId: 'chatPanel'`, `apiKeyExists: true`, `terminalAvailable: true`  | `capability === 'both'`              | P0     |
| TC-C103 | API key 不在 + terminal 可用で terminalSurface を返す              | `surfaceId: 'chatView'`, `apiKeyExists: false`, `terminalAvailable: true`  | `capability === 'terminalSurface'`   | P0     |
| TC-C104 | API key 不在 + terminal 不可用で none を返す                       | `surfaceId: 'chatView'`, `apiKeyExists: false`, `terminalAvailable: false` | `capability === 'none'`              | P0     |
| TC-C105 | backend 専用 surface (RAG) は terminal 不可                        | `surfaceId: 'rag'`, `apiKeyExists: true`, `terminalAvailable: true`        | `capability === 'integratedRuntime'` | P1     |

### C1-2: AIRuntimeResolver

| TC-ID   | テスト名                                        | 入力                                                                                             | 期待結果                                                                                | 優先度 |
| ------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------ |
| TC-C106 | 明示的 providerId/modelId で runtime を解決する | `providerId: 'openai'`, `modelId: 'gpt-4o'`                                                      | `resolved.providerId === 'openai'`, `resolved.modelId === 'gpt-4o'`, `adapter !== null` | P0     |
| TC-C107 | selectedConfig から runtime を解決する          | `providerId: undefined`, `selectedConfig: { providerId: 'anthropic', modelId: 'claude-sonnet' }` | `resolved.providerId === 'anthropic'`                                                   | P0     |
| TC-C108 | デフォルト provider/model で runtime を解決する | `providerId: undefined`, `selectedConfig: null`                                                  | デフォルト provider/model で `ResolvedRuntime` を返す                                   | P1     |

### C1-3: Surface Mapping

| TC-ID   | テスト名                                                   | 入力                    | 期待結果                                                         | 優先度 |
| ------- | ---------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------- | ------ |
| TC-C109 | ChatView が integratedRuntime + terminalSurface を消費する | `surfaceId: 'chatView'` | `integratedRuntime: true`, `terminalSurface: true` (handoff CTA) | P0     |
| TC-C110 | RAG が integratedRuntime のみ消費する                      | `surfaceId: 'rag'`      | `integratedRuntime: true`, `terminalSurface: false`              | P0     |
| TC-C111 | Settings/AccessCard が設定管理のみ                         | `surfaceId: 'settings'` | `integratedRuntime: false`, `terminalSurface: false` (設定管理)  | P1     |

### C1-4: Legacy AuthMode Migration

| TC-ID   | テスト名                                                    | 入力                       | 期待結果                                                   | 優先度 |
| ------- | ----------------------------------------------------------- | -------------------------- | ---------------------------------------------------------- | ------ |
| TC-C112 | authMode=subscription を terminalSurface enabled に変換する | `authMode: 'subscription'` | `capability` に `terminalSurface` が有効化される           | P0     |
| TC-C113 | authMode=api-key を integratedRuntime enabled に変換する    | `authMode: 'api-key'`      | `capability` に `integratedRuntime` が有効化される         | P0     |
| TC-C114 | legacy authMode 値が破壊されず読み取り専用で保持される      | `authMode: 'subscription'` | migration 後も `authMode` 値は `'subscription'` のまま保持 | P1     |

### C1-5: Selected Config 解決

| TC-ID   | テスト名                                  | 入力                                                                              | 期待結果                           | 優先度 |
| ------- | ----------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- | ------ |
| TC-C115 | 明示指定が selectedConfig より優先される  | `explicit: { providerId: 'openai' }`, `persisted: { providerId: 'anthropic' }`    | `resolved.providerId === 'openai'` | P0     |
| TC-C116 | selectedConfig がデフォルトより優先される | `explicit: undefined`, `persisted: { providerId: 'google' }`, `default: 'openai'` | `resolved.providerId === 'google'` | P0     |

---

## C2: 失敗系テスト

### C2-1: Fail-Fast テスト

| TC-ID   | テスト名                                                  | 入力                                                            | 期待結果                                                                 | 優先度 |
| ------- | --------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| TC-C201 | API key 未設定で CREDENTIAL_MISSING + guidance を返す     | `providerId: 'openai'`, API key なし                            | `error === 'CREDENTIAL_MISSING'`, `guidance` が非空文字列                | P0     |
| TC-C202 | 全ソース解決不能で fail-fast する                         | `providerId: undefined`, `selectedConfig: null`, デフォルトなし | `error === 'PROVIDER_UNKNOWN'`, `guidance` が非空文字列                  | P0     |
| TC-C203 | 未対応 provider で PROVIDER_UNKNOWN を返す                | `providerId: 'unsupported-provider'`                            | `error === 'PROVIDER_UNKNOWN'`, `guidance` に対応 provider 一覧を含む    | P0     |
| TC-C204 | adapter 生成失敗で ADAPTER_CREATION_FAILED を返す         | `providerId: 'openai'`, credential 不正                         | `error === 'ADAPTER_CREATION_FAILED'`, `guidance` が非空文字列           | P1     |
| TC-C205 | fail-fast error に reason, guidance, retryable が含まれる | 任意の fail-fast 条件                                           | `error`, `reason`, `guidance`, `retryable` の 4 フィールドが全て存在する | P0     |

### C2-2: Unsupported Surface テスト

| TC-ID   | テスト名                                                            | 入力                                                                          | 期待結果                                                    | 優先度 |
| ------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| TC-C206 | RAG surface で terminal handoff を要求するとエラーになる            | `surfaceId: 'rag'`, `requestedCapability: 'terminalSurface'`                  | `error === 'CAPABILITY_UNAVAILABLE'`, guidance に理由を含む | P0     |
| TC-C207 | Claude Code Terminal Surface で integrated を要求するとエラーになる | `surfaceId: 'claudeCodeTerminal'`, `requestedCapability: 'integratedRuntime'` | `error === 'CAPABILITY_UNAVAILABLE'`, guidance に理由を含む | P1     |

### C2-3: Terminal 不可用テスト

| TC-ID   | テスト名                                                | 入力                                                        | 期待結果                                                   | 優先度 |
| ------- | ------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| TC-C208 | terminal 不可用時に guidance を返す                     | `terminalAvailable: false`, `capability: 'terminalSurface'` | guidance に「terminal が利用できない」旨のメッセージを含む | P0     |
| TC-C209 | terminal 不可用 + API key 不在で capability=none になる | `terminalAvailable: false`, `apiKeyExists: false`           | `capability === 'none'`, guidance に両方の解決策を含む     | P0     |

### C2-4: Silent Fallback 禁止確認

| TC-ID   | テスト名                                           | 入力                                 | 期待結果                                                   | 優先度 |
| ------- | -------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------- | ------ |
| TC-C210 | credential 不足時に stub provider で成功を返さない | `providerId: 'openai'`, API key なし | stub/mock adapter が返されない。fail-fast error が返される | P0     |

---

## C3: 回帰系テスト

### C3-1: Mode 変更イベント

| TC-ID   | テスト名                                  | 入力                                                | 期待結果                                                                   | 優先度 |
| ------- | ----------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| TC-C301 | authMode 変更で capability が再評価される | `authMode: 'api-key'` -> `authMode: 'subscription'` | `ai:capability-changed` が発火し、capability が `terminalSurface` に変更   | P0     |
| TC-C302 | API key 追加で capability が再評価される  | `apiKeyExists: false` -> `apiKeyExists: true`       | `ai:capability-changed` が発火し、capability に `integratedRuntime` が追加 | P0     |
| TC-C303 | API key 削除で capability が再評価される  | `apiKeyExists: true` -> `apiKeyExists: false`       | `ai:capability-changed` が発火し、`integratedRuntime` が無効化             | P0     |

### C3-2: Adapter Cache Invalidation

| TC-ID   | テスト名                                                           | 入力                                           | 期待結果                                                       | 優先度 |
| ------- | ------------------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------- | ------ |
| TC-C304 | API key 変更で全 adapter cache がクリアされる                      | `auth-key:changed` イベント発火                | `adapterCache` が空になり、次回取得時に新 adapter が生成される | P0     |
| TC-C305 | capability 変更で adapter cache がクリアされる                     | `ai:capability-changed` イベント発火           | `adapterCache` が空になる                                      | P0     |
| TC-C306 | selectedConfig 変更で該当 provider の adapter cache がクリアされる | `llm:selected-config-changed` イベント発火     | 該当 provider の cache のみクリアされ、他 provider は保持      | P1     |
| TC-C307 | cache クリア後に同一 provider を取得すると新 adapter が生成される  | cache クリア後に `AIRuntimeResolver.resolve()` | 新しい adapter インスタンスが返される（参照不一致）            | P1     |

### C3-3: Terminal Availability 変更

| TC-ID   | テスト名                                                            | 入力                                                    | 期待結果                                                         | 優先度 |
| ------- | ------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| TC-C308 | terminal 可用性変更で capability が再評価され Renderer に通知される | `terminalAvailable: false` -> `terminalAvailable: true` | `terminal:availability-changed` + `ai:capability-changed` が発火 | P0     |

---

## C4: 統合テスト観点

### C4-1: 複数 Resolver 連携

| TC-ID   | テスト名                                                          | シナリオ                                                                                                                  | 期待結果                                                                                        | 優先度 |
| ------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| TC-C401 | capability 判定 -> runtime 解決 -> adapter 取得のフルパイプライン | 1. `AIAccessCapabilityResolver` で `integratedRuntime` 判定 2. `AIRuntimeResolver` で provider/model 解決 3. adapter 取得 | 3 ステップが正常に完了し、adapter が AI 実行可能な状態で返される                                | P0     |
| TC-C402 | capability=none で runtime 解決をスキップする                     | 1. `AIAccessCapabilityResolver` で `none` 判定 2. `AIRuntimeResolver` 呼び出し                                            | runtime 解決は呼び出されず、fail-fast error (CAPABILITY_UNAVAILABLE) が返される                 | P0     |
| TC-C403 | legacy migration -> capability 再評価 -> IPC 通知のフルフロー     | 1. `authMode: 'subscription'` で起動 2. migration 実行 3. capability 再評価                                               | `terminalSurface` が有効化され、`auth-mode:changed` と `ai:capability-changed` の両方が発火する | P0     |

### C4-2: State 更新フロー

| TC-ID   | テスト名                                                              | シナリオ                                                                                                 | 期待結果                                                                                                       | 優先度 |
| ------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| TC-C404 | API key 設定で Main State -> IPC -> Renderer State が一連で更新される | 1. `auth-key:set` IPC 受信 2. Main: apiKeys 保存 + capabilityMap 再評価 + adapterCache clear 3. IPC 通知 | `auth-key:changed` + `ai:capability-changed` が発火し、Renderer の `apiKeyExists` と `accessCapability` が更新 | P0     |
| TC-C405 | selectedConfig 変更で該当 adapter のみ再生成される                    | 1. `llm:set-selected-config` IPC 受信 2. Main: selectedConfig 保存 + 該当 cache clear 3. IPC 通知        | `llm:selected-config-changed` が発火、他 provider の adapter は保持される                                      | P1     |
| TC-C406 | Atomic Update: 途中エラーでも IPC 通知前に全 state が一貫している     | capabilityMap 再評価中に adapter cache clear が失敗するケース                                            | IPC 通知は送信されず、state はエラー前の一貫した状態を保持する                                                 | P1     |

---

## IPC セキュリティテスト観点

本タスクで追加する IPC チャンネルに対して以下のセキュリティ検証を実施する。個別テストケースは各チャンネルのハンドラ実装時に Phase 6 で拡充する。

| 観点                  | 検証内容                                                            | 対象チャンネル                                                       |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| sender 検証           | `validateIpcSender` が全ハンドラで呼び出されること                  | `ai:get-capability`, `ai:resolve-runtime`, `ai:get-all-capabilities` |
| P42 3段バリデーション | `typeof === 'string'` + `=== ''` + `.trim() === ''` の 3 段チェック | `ai:get-capability` (surfaceId), `ai:resolve-runtime` (providerId)   |
| credential 非送信     | `auth-key:exists` が boolean のみ返し、key 値を含まないこと         | `auth-key:exists`                                                    |
| error envelope        | fail-fast error が内部スタックトレースを含まないこと                | 全チャンネル                                                         |
| チャンネル定数        | ハードコード文字列ではなく `IPC_CHANNELS` 定数を使用していること    | 全チャンネル                                                         |

---

## テスト実行環境

| 項目           | 内容                                                      |
| -------------- | --------------------------------------------------------- |
| テストランナー | Vitest                                                    |
| テスト環境     | happy-dom (Renderer 層) / node (Main Process 層)          |
| モック         | `vi.mock` / `vi.fn` でサービス依存を DI                   |
| 注意事項 (P39) | happy-dom 環境では `fireEvent` を使用（`userEvent` 禁止） |
| 注意事項 (P40) | `cd apps/desktop && pnpm vitest run` で実行する           |
| 注意事項 (P13) | タイマーテストは `advanceTimersByTime` で 1 ステップずつ  |
| カバレッジ基準 | Line 80% / Branch 60% / Function 80% (最低基準)           |

---

## テストファイル配置計画

| ファイルパス (apps/desktop/src/ 配下)                           | 対象カテゴリ     |
| --------------------------------------------------------------- | ---------------- |
| `main/services/ai/__tests__/AIAccessCapabilityResolver.test.ts` | C1-1, C2-2, C3-1 |
| `main/services/ai/__tests__/AIRuntimeResolver.test.ts`          | C1-2, C1-5, C2-1 |
| `main/services/ai/__tests__/CredentialProvider.test.ts`         | C2-1, C2-4       |
| `main/services/ai/__tests__/LegacyAuthModeMigration.test.ts`    | C1-4             |
| `main/services/ai/__tests__/AdapterCacheManager.test.ts`        | C3-2             |
| `main/services/ai/__tests__/AIRuntimeIntegration.test.ts`       | C4-1, C4-2       |
| `main/ipc/__tests__/ai-capability-handlers.test.ts`             | IPC セキュリティ |
| `renderer/store/slices/__tests__/aiAccessSlice.test.ts`         | C3-3             |
