# Phase 2 設計サマリー

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 2                                            |
| 成果物種別 | 設計サマリー                                 |
| 作成日     | 2026-03-13                                   |
| 前提       | Phase 1 要件定義                             |
| 後続       | Phase 3 設計レビュー                         |

## 設計概要

本設計は、全 AI surface が再利用する 3 つの契約を定義する。

1. **Access Capability 契約**: surface が `integratedRuntime` と `terminalSurface` のどちらの capability を持つかを判定する
2. **Integrated Runtime 契約**: API key を使って provider/model/adapter を解決し、AI 実行を行う
3. **Terminal Surface 契約**: ユーザー操作の terminal へ handoff するための境界と許可操作を定義する

access capability と provider/engine 選択は別責務として分離し、Main Process が最終 authority を持つ。

## Resolver 設計

### AIAccessCapabilityResolver

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 責務       | surface に対して利用可能な capability を判定する                                 |
| 入力       | surfaceId, legacy authMode, API key 存在状態, terminal 可用性                    |
| 出力       | `AIAccessCapability` (`integratedRuntime` / `terminalSurface` / `both` / `none`) |
| 配置       | Main Process (`apps/desktop/src/main/services/ai/`)                              |
| キャッシュ | capability 変更イベントで invalidate                                             |

判定ロジック:

| 条件                                      | 結果                                     |
| ----------------------------------------- | ---------------------------------------- |
| API key 存在 + surface が integrated 対応 | `integratedRuntime` (または `both`)      |
| API key 不在 + terminal 可用              | `terminalSurface`                        |
| API key 不在 + terminal 不可用            | `none`                                   |
| legacy authMode=subscription              | `terminalSurface` (migration 経路)       |
| backend 専用 surface (RAG/embedding 等)   | `integratedRuntime` のみ (terminal 不可) |

### AIRuntimeResolver

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| 責務       | provider/model/adapter を解決し、実行可能な runtime を返す          |
| 入力       | providerId?, modelId?, selectedConfig                               |
| 出力       | `ResolvedRuntime` (provider, model, adapter) または fail-fast error |
| 配置       | Main Process (`apps/desktop/src/main/services/ai/`)                 |
| キャッシュ | adapter はシングルトンキャッシュ、capability 変更時に clear         |

解決順:

| 優先度 | ソース                                 | フォールバック                             |
| ------ | -------------------------------------- | ------------------------------------------ |
| 1      | 明示的な providerId/modelId 指定       | -                                          |
| 2      | selectedConfig (electron-store 永続化) | -                                          |
| 3      | デフォルト provider/model              | -                                          |
| 4      | 解決不能                               | fail-fast (stub/terminal へ自動退避しない) |

### CredentialProvider

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| 責務         | API key / token 取得の統一インターフェースを提供する     |
| 入力         | providerId                                               |
| 出力         | credential 文字列または fail-fast error                  |
| 配置         | Main Process (`apps/desktop/src/main/services/ai/`)      |
| 実装         | SecureStorage.getApiKey(providerId) をラップする         |
| セキュリティ | credential は Main Process に留め、Renderer には渡さない |

## 3 層責務設計

### Renderer Preflight (UX 補助)

| 項目      | 内容                                                     |
| --------- | -------------------------------------------------------- |
| 責務      | API key 存在確認、capability guidance 表示、CTA 活性制御 |
| authority | なし (最終判定は Main に委譲)                            |
| 参照元    | Main から IPC で受信した capability 値                   |
| 禁止事項  | 独自の mode 判定、silent fallback、credential 直読み     |

具体的な責務:

| 処理             | 実行者                                 | 禁止事項             |
| ---------------- | -------------------------------------- | -------------------- |
| API key 存在確認 | `window.electronAPI.authKey.exists()`  | key 値の読み取り     |
| capability 表示  | Zustand store (Main からの IPC で更新) | 独自 capability 算出 |
| CTA 活性制御     | capability 値に基づく disabled/enabled | 独自 fallback 判定   |
| guidance 表示    | Main が返した reason を表示            | 独自エラー文生成     |

### Preload Transport (IPC Bridge)

| 項目           | 内容                                            |
| -------------- | ----------------------------------------------- |
| 責務           | Renderer-Main 間の IPC 橋渡し                   |
| 実装           | contextBridge + safeInvoke/safeOn               |
| チャンネル管理 | IPC_CHANNELS 定数でホワイトリスト管理           |
| セキュリティ   | sender 検証、引数バリデーション、error envelope |

### Main Authority (最終判定)

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| 責務         | capability 判定、credential 解決、adapter 生成、fail-fast 判定 |
| authority    | 全 AI 実行の最終判定者                                         |
| 出力         | 実行結果、fail-fast error (reason 付き)、capability 変更通知   |
| セキュリティ | credential を Main 内に閉じ込め、Renderer に漏洩させない       |

## 解決順設計

### Step 1: Legacy authMode Migration

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| トリガー | アプリ起動時 / authMode 変更時                              |
| 処理     | `authMode=subscription` を `terminalSurface enabled` へ変換 |
| 処理     | `authMode=api-key` を `integratedRuntime enabled` へ変換    |
| 永続化   | 変換後の capability を electron-store に保存                |
| 互換性   | legacy authMode 値は読み取り専用で保持 (破壊しない)         |

### Step 2: Access Capability 評価

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| トリガー | Step 1 完了後 / API key 変更後 / terminal 可用性変更後                          |
| 処理     | surface ごとに `integratedRuntime` / `terminalSurface` / `both` / `none` を判定 |
| 出力     | `AIAccessCapability` を IPC で Renderer に通知                                  |
| 通知     | `ai:capability-changed` イベントで全 surface に broadcast                       |

### Step 3: providerId/modelId 解決

| 項目           | 内容                                                           |
| -------------- | -------------------------------------------------------------- |
| トリガー       | AI 実行リクエスト受信時                                        |
| 解決順         | 明示指定 -> selectedConfig -> デフォルト -> fail-fast          |
| fail-fast 条件 | 全ソースで解決不能の場合                                       |
| 出力           | `{ providerId, modelId }` または `{ error, reason, guidance }` |

### Step 4: Credential 取得

| 項目           | 内容                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| トリガー       | Step 3 成功後                                                               |
| 処理           | CredentialProvider.get(providerId)                                          |
| fail-fast 条件 | API key 未設定 / 無効                                                       |
| 出力           | credential 文字列または `{ error: 'CREDENTIAL_MISSING', reason, guidance }` |
| 禁止事項       | stub credential への自動退避、terminal への自動切替                         |

### Step 5: Adapter 生成 + Cache 管理

| 項目          | 内容                                                |
| ------------- | --------------------------------------------------- |
| トリガー      | Step 4 成功後                                       |
| 処理          | LLMAdapterFactory.create(providerId, credential)    |
| キャッシュ    | provider 単位のシングルトン                         |
| invalidation  | capability 変更時、API key 変更時に clearInstance() |
| 対応 provider | OpenAI, Anthropic, Google, xAI (4 provider)         |

### Step 6: Terminal Availability 反映

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| トリガー | capability 変更時 / terminal 状態変更時               |
| 処理     | terminal launcher の活性/非活性を更新                 |
| 出力     | `terminalAvailable: boolean` を Renderer に通知       |
| 制約     | terminal 可用でも auto-send / hidden injection は禁止 |

## Fallback ルール

### 禁止事項

| 禁止ルール                    | 内容                                                      | 理由                             |
| ----------------------------- | --------------------------------------------------------- | -------------------------------- |
| Silent Stub Fallback 禁止     | credential 不足時に stub provider で成功を返さない        | 誤成功により問題発覚が遅れるため |
| Silent Terminal Fallback 禁止 | integrated runtime 失敗時に自動で terminal へ切り替えない | 実行責任と証跡が曖昧になるため   |
| Auto-Send 禁止                | terminal handoff 時にコマンドを自動送信しない             | user-operated 境界を侵害するため |
| Hidden Prompt Injection 禁止  | terminal へ暗黙のプロンプトを注入しない                   | ユーザーの操作意図を歪めるため   |

### Cache Clear 条件

| トリガー               | クリア対象                       | 理由                             |
| ---------------------- | -------------------------------- | -------------------------------- |
| API key 追加/削除/変更 | adapter cache (全 provider)      | stale credential での実行を防止  |
| capability 変更        | adapter cache + capability cache | stale runtime 状態での実行を防止 |
| selectedConfig 変更    | 該当 provider の adapter cache   | provider/model 不一致を防止      |
| authMode 変更 (legacy) | 全 cache                         | migration 後の整合性確保         |

### Fail-Fast ルール

| 段階            | fail-fast 条件                                | 返却                                             |
| --------------- | --------------------------------------------- | ------------------------------------------------ |
| Capability 評価 | surface が integrated のみ対応 + API key 不在 | `{ error: 'CAPABILITY_UNAVAILABLE', guidance }`  |
| Provider 解決   | providerId が未知 / 未対応                    | `{ error: 'PROVIDER_UNKNOWN', guidance }`        |
| Credential 取得 | API key 未設定                                | `{ error: 'CREDENTIAL_MISSING', guidance }`      |
| Adapter 生成    | adapter 生成失敗                              | `{ error: 'ADAPTER_CREATION_FAILED', guidance }` |
| 実行            | API 呼び出し失敗                              | `{ error: 'RUNTIME_ERROR', reason, retryable }`  |

## 後続タスクへの Handoff Contract

### Task02 (Claude Code Terminal Surface) への契約

| 契約項目            | 内容                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| capability 参照     | `AIAccessCapabilityResolver` から `terminalSurface` 可用性を取得する |
| terminal 可用性通知 | `ai:capability-changed` イベントを subscribe する                    |
| 操作許可            | copy command, open cwd, launch shell のみ                            |
| 操作禁止            | auto send, auto retry, hidden prompt injection                       |

### Task03-Task08 (各 Surface) への契約

| 契約項目        | 内容                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| capability 参照 | `AIAccessCapabilityResolver` から surface 別 capability を取得する        |
| runtime 実行    | `AIRuntimeResolver` で provider/model/adapter を解決してから実行する      |
| handoff         | capability に `terminalSurface` が含まれる場合のみ handoff CTA を表示する |
| fail-fast       | runtime 解決失敗時は guidance 付きエラーを返す (silent fallback 禁止)     |
| cache           | capability 変更通知で UI 状態を更新する                                   |

### Task09 (RAG/Embedding/Extraction) への契約

| 契約項目   | 内容                                             |
| ---------- | ------------------------------------------------ |
| capability | `integratedRuntime` のみ (terminal handoff 不可) |
| fail-fast  | API key 不在で即座に guidance 付き error         |
| terminal   | backend AI を terminal へ逃がさない              |

### Task10 (Slide/Modifier) への契約

| 契約項目   | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| capability | `integratedRuntime` + `terminalSurface` (guidance)               |
| direct SDK | direct SDK 呼び出しを `AIRuntimeResolver` 経由に置換する         |
| fallback   | manual fallback は guidance 表示に限定し、silent fallback は禁止 |
