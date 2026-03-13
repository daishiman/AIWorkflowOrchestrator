# Phase 2 契約一覧

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 2                                            |
| 成果物種別 | 契約一覧                                     |
| 作成日     | 2026-03-13                                   |

---

## 1. IPC 契約一覧

### 1.1 Capability 系

| チャンネル                | 方向             | Payload                                                 | Authority | 用途                                          |
| ------------------------- | ---------------- | ------------------------------------------------------- | --------- | --------------------------------------------- |
| `ai:get-capability`       | Renderer -> Main | `{ surfaceId: string }`                                 | Main      | surface 別の access capability を取得する     |
| `ai:capability-changed`   | Main -> Renderer | `{ surfaceId: string, capability: AIAccessCapability }` | Main      | capability 変更を全 surface に broadcast する |
| `ai:get-all-capabilities` | Renderer -> Main | `void`                                                  | Main      | 全 surface の capability を一括取得する       |

### 1.2 Runtime 系

| チャンネル            | 方向             | Payload                                        | Authority | 用途                                     |
| --------------------- | ---------------- | ---------------------------------------------- | --------- | ---------------------------------------- |
| `ai:resolve-runtime`  | Renderer -> Main | `{ providerId?: string, modelId?: string }`    | Main      | provider/model/adapter を解決する        |
| `ai:chat`             | Renderer -> Main | `{ messages, providerId?, modelId?, options }` | Main      | AI chat を実行する (既存 AI_CHAT の拡張) |
| `ai:check-connection` | Renderer -> Main | `{ providerId: string }`                       | Main      | provider への接続確認                    |

### 1.3 Credential 系

| チャンネル         | 方向             | Payload                               | Authority | 用途                              |
| ------------------ | ---------------- | ------------------------------------- | --------- | --------------------------------- |
| `auth-key:exists`  | Renderer -> Main | `{ providerId: string }`              | Main      | API key の存在確認 (値は返さない) |
| `auth-key:set`     | Renderer -> Main | `{ providerId: string, key: string }` | Main      | API key の保存                    |
| `auth-key:remove`  | Renderer -> Main | `{ providerId: string }`              | Main      | API key の削除                    |
| `auth-key:changed` | Main -> Renderer | `{ providerId: string }`              | Main      | API key 変更を通知する            |

### 1.4 Legacy AuthMode 系

| チャンネル          | 方向             | Payload                                            | Authority | 用途                                      |
| ------------------- | ---------------- | -------------------------------------------------- | --------- | ----------------------------------------- |
| `auth-mode:get`     | Renderer -> Main | `void`                                             | Main      | 現在の authMode を取得する (互換用)       |
| `auth-mode:set`     | Renderer -> Main | `{ mode: 'api-key' \| 'subscription' }`            | Main      | authMode を変更する (migration トリガー)  |
| `auth-mode:changed` | Main -> Renderer | `{ mode: string, capability: AIAccessCapability }` | Main      | authMode 変更を通知する (capability 付き) |

### 1.5 Terminal 系

| チャンネル                      | 方向             | Payload                  | Authority | 用途                                 |
| ------------------------------- | ---------------- | ------------------------ | --------- | ------------------------------------ |
| `terminal:get-availability`     | Renderer -> Main | `void`                   | Main      | terminal の可用性を取得する          |
| `terminal:availability-changed` | Main -> Renderer | `{ available: boolean }` | Main      | terminal 可用性変更を通知する        |
| `terminal:launch`               | Renderer -> Main | `{ cwd?: string }`       | Main      | terminal を起動する                  |
| `terminal:copy-command`         | Renderer -> Main | `{ command: string }`    | Main      | コマンドをクリップボードにコピーする |

### 1.6 Selected Config 系

| チャンネル                    | 方向             | Payload                                   | Authority | 用途                              |
| ----------------------------- | ---------------- | ----------------------------------------- | --------- | --------------------------------- |
| `llm:get-selected-config`     | Renderer -> Main | `void`                                    | Main      | 現在の selected config を取得する |
| `llm:set-selected-config`     | Renderer -> Main | `{ providerId: string, modelId: string }` | Main      | selected config を変更する        |
| `llm:selected-config-changed` | Main -> Renderer | `{ providerId: string, modelId: string }` | Main      | selected config 変更を通知する    |

### IPC セキュリティ共通ルール

| ルール             | 内容                                                          |
| ------------------ | ------------------------------------------------------------- |
| sender 検証        | 全ハンドラで `validateIpcSender` を実行する                   |
| 引数バリデーション | P42 準拠 3 段バリデーション (型 -> 空文字列 -> trim 空文字列) |
| error envelope     | 内部情報を漏洩させないサニタイズ済み error を返す             |
| credential 非送信  | API key / token の値を Renderer に返さない (`exists` のみ)    |
| チャンネル管理     | IPC_CHANNELS 定数でホワイトリスト管理する                     |

---

## 2. State 契約一覧

### 2.1 Main Process State

| Store Key           | Owner                      | Update Trigger                                   | Consumer                   | 永続化           |
| ------------------- | -------------------------- | ------------------------------------------------ | -------------------------- | ---------------- |
| `capabilityMap`     | AIAccessCapabilityResolver | authMode 変更, API key 変更, terminal 可用性変更 | 全 IPC ハンドラ            | electron-store   |
| `resolvedRuntime`   | AIRuntimeResolver          | selectedConfig 変更, capability 変更             | AI 実行ハンドラ            | なし (on-demand) |
| `adapterCache`      | LLMAdapterFactory          | provider/credential 変更                         | AIRuntimeResolver          | なし (in-memory) |
| `authMode`          | AuthModeService            | UI 操作 (legacy)                                 | AIAccessCapabilityResolver | electron-store   |
| `apiKeys`           | SecureStorage              | UI 操作                                          | CredentialProvider         | safeStorage      |
| `selectedConfig`    | LLM 設定                   | UI 操作                                          | AIRuntimeResolver          | electron-store   |
| `terminalAvailable` | Terminal Manager           | terminal 状態変更                                | AIAccessCapabilityResolver | なし (runtime)   |

### 2.2 Renderer State (Zustand Store)

| Store Key           | Owner Slice          | Update Trigger                      | Consumer                  | 初期値      |
| ------------------- | -------------------- | ----------------------------------- | ------------------------- | ----------- |
| `accessCapability`  | aiAccessSlice (新規) | `ai:capability-changed` IPC         | 全 surface コンポーネント | `none`      |
| `terminalAvailable` | aiAccessSlice (新規) | `terminal:availability-changed` IPC | terminal launcher 系      | `false`     |
| `authMode`          | authModeSlice (既存) | `auth-mode:changed` IPC             | Settings (legacy 互換)    | `'api-key'` |
| `selectedConfig`    | llmSlice (既存)      | `llm:selected-config-changed` IPC   | LLM selector 系           | `null`      |
| `apiKeyExists`      | authModeSlice (既存) | `auth-key:changed` IPC              | preflight 系              | `false`     |

### 2.3 State 更新フロー

| トリガー            | Main 更新                                              | IPC 通知                                                 | Renderer 更新                            |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------- |
| API key 設定        | apiKeys 保存, capabilityMap 再評価, adapterCache clear | `auth-key:changed`, `ai:capability-changed`              | apiKeyExists, accessCapability 更新      |
| authMode 変更       | authMode 保存, capabilityMap 再評価 (migration)        | `auth-mode:changed`, `ai:capability-changed`             | authMode, accessCapability 更新          |
| selectedConfig 変更 | selectedConfig 保存, 該当 adapter cache clear          | `llm:selected-config-changed`                            | selectedConfig 更新                      |
| terminal 状態変更   | terminalAvailable 更新, capabilityMap 再評価           | `terminal:availability-changed`, `ai:capability-changed` | terminalAvailable, accessCapability 更新 |

### 反映単位 (Atomic Update)

access card 変更時は以下を一連の反映単位として実行する。途中で中断しない。

| 順序 | 処理                         | 対象              |
| ---- | ---------------------------- | ----------------- |
| 1    | status/validate 再評価       | capabilityMap     |
| 2    | selected config 再解決       | resolvedRuntime   |
| 3    | adapter cache clear          | adapterCache      |
| 4    | terminal availability 再読込 | terminalAvailable |
| 5    | IPC 通知 broadcast           | 全 Renderer       |

---

## 3. Runtime 契約一覧

### 3.1 Resolver 契約

| Resolver                   | 入力                                                 | 出力                 | キャッシュポリシー                   | 失敗時                          |
| -------------------------- | ---------------------------------------------------- | -------------------- | ------------------------------------ | ------------------------------- |
| AIAccessCapabilityResolver | surfaceId, authMode, apiKeyExists, terminalAvailable | `AIAccessCapability` | capability 変更イベントで invalidate | `none` を返す                   |
| AIRuntimeResolver          | providerId?, modelId?, selectedConfig                | `ResolvedRuntime`    | adapter はシングルトンキャッシュ     | fail-fast error (guidance 付き) |
| CredentialProvider         | providerId                                           | credential string    | なし (毎回 SecureStorage から取得)   | fail-fast error (guidance 付き) |

### 3.2 AIAccessCapability 型定義

| 値                  | 意味                          | integratedRuntime | terminalSurface |
| ------------------- | ----------------------------- | ----------------- | --------------- |
| `integratedRuntime` | API runtime のみ利用可能      | 有効              | 無効            |
| `terminalSurface`   | terminal handoff のみ利用可能 | 無効              | 有効            |
| `both`              | 両方利用可能                  | 有効              | 有効            |
| `none`              | いずれも利用不可              | 無効              | 無効            |

### 3.3 ResolvedRuntime 型定義

| フィールド | 型           | 内容                          |
| ---------- | ------------ | ----------------------------- |
| providerId | `string`     | 解決された provider ID        |
| modelId    | `string`     | 解決された model ID           |
| adapter    | `LLMAdapter` | 生成済み adapter インスタンス |

### 3.4 Fail-Fast Error 型定義

| フィールド | 型        | 内容                   |
| ---------- | --------- | ---------------------- |
| error      | `string`  | エラーコード           |
| reason     | `string`  | 人間可読な理由         |
| guidance   | `string`  | 次にやるべき操作の説明 |
| retryable  | `boolean` | リトライ可能かどうか   |

### 3.5 Surface 別 Runtime 対応表

| Surface                      | integratedRuntime | terminalSurface | fail-fast 時     |
| ---------------------------- | ----------------- | --------------- | ---------------- |
| ChatView / AI_CHAT           | 対応              | handoff CTA     | guidance 表示    |
| ChatPanel                    | 対応              | handoff CTA     | guidance 表示    |
| Workspace Chat Edit          | 対応              | handoff CTA     | guidance 表示    |
| Workspace Chat Panel         | 対応              | handoff CTA     | guidance 表示    |
| Skill / Agent / Creator      | 対応              | handoff CTA     | guidance 表示    |
| Skill Docs                   | 対応              | handoff CTA     | guidance 表示    |
| RAG / Embedding / Extraction | 対応              | 不可            | guidance 表示    |
| Slide / Modifier             | 対応              | guidance のみ   | guidance 表示    |
| Settings / Access Card       | 設定管理          | 設定管理        | -                |
| Claude Code Terminal Surface | 不可              | 専用            | unavailable 表示 |

### 3.6 Adapter Cache ポリシー

| 操作                 | キャッシュ動作      | 理由                      |
| -------------------- | ------------------- | ------------------------- |
| adapter 初回取得     | 生成してキャッシュ  | 生成コスト軽減            |
| 同一 provider 再取得 | キャッシュから返却  | パフォーマンス            |
| API key 変更         | 全 provider clear   | credential 不一致防止     |
| capability 変更      | 全 provider clear   | stale runtime 防止        |
| selectedConfig 変更  | 該当 provider clear | provider/model 不一致防止 |
| アプリ終了           | 自動破棄            | in-memory のため          |

---

## 4. Terminal 契約

### 4.1 許可操作

| 操作         | チャンネル              | 内容                                           | ユーザー操作      |
| ------------ | ----------------------- | ---------------------------------------------- | ----------------- |
| Copy Command | `terminal:copy-command` | suggested command をクリップボードにコピーする | 必須 (ボタン押下) |
| Open CWD     | `terminal:launch`       | 指定ディレクトリで terminal を開く             | 必須 (ボタン押下) |
| Launch Shell | `terminal:launch`       | デフォルトで terminal を起動する               | 必須 (ボタン押下) |

### 4.2 禁止操作

| 禁止操作                | 理由                           | 検証方法                                                      |
| ----------------------- | ------------------------------ | ------------------------------------------------------------- |
| Auto Send               | user-operated 境界侵害         | terminal launch 後に stdin へ書き込まないことを確認する       |
| Auto Retry              | user-operated 境界侵害         | エラー時に自動再送しないことを確認する                        |
| Hidden Prompt Injection | ユーザー操作意図の歪曲         | launch 時に暗黙のコマンド引数を付与しないことを確認する       |
| Token/Session 取得      | consumer subscription 境界侵害 | terminal プロセスから credential を読み取らないことを確認する |
| Auto Transcript Share   | ユーザー操作意図の歪曲         | transcript を自動で chat message 化しないことを確認する       |

### 4.3 Handoff Card 契約

| フィールド       | 型           | 内容                                  |
| ---------------- | ------------ | ------------------------------------- |
| contextSummary   | `string`     | handoff 時の文脈要約                  |
| suggestedCommand | `string`     | 推奨コマンド (クリップボードコピー用) |
| copyAction       | `() => void` | コマンドコピーの CTA                  |
| openTerminal     | `() => void` | terminal 起動の CTA                   |
| reason           | `string`     | handoff が必要な理由                  |

### 4.4 Transcript -> Chat 連携契約

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| 起点         | terminal transcript からのユーザー手動選択                                         |
| 宛先         | ChatPanel / Workspace Chat Panel の composer / attachment                          |
| 操作形態     | `選択範囲をチャットへ送る` / `直近出力を添付` / `セッションを貼り付ける` の 3 系統 |
| 禁止         | transcript の自動 message 化、chat 入力の自動 terminal 返送                        |
| 表示         | `terminal transcript から添付` の provenance を chip / label で明示する            |
| セキュリティ | hidden parsing / silent summarization 禁止、共有前に内容表示必須                   |
