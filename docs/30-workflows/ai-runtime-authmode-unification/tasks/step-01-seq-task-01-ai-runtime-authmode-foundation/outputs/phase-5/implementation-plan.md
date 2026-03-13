# Phase 5 実装計画

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001   |
| Phase      | 5                                              |
| 成果物種別 | 実装計画                                       |
| 作成日     | 2026-03-13                                     |
| 前提       | Phase 2 設計サマリー、Phase 4 テストマトリクス |
| 後続       | Phase 6 回帰計画                               |

---

## 1. 実装順序（依存関係に基づく）

実装は下位レイヤ（型定義）から上位レイヤ（UI state）へ向かって積み上げる。各 Step の完了条件は後続 Step の前提となるため、順序を崩さない。

### Step 1: AIAccessCapabilityResolver 型定義（packages/shared）

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 目的     | 全レイヤで共有する capability 判定の型を定義する                 |
| 配置先   | `packages/shared/src/ai/types.ts`                                |
| 依存     | なし（末端パッケージ）                                           |
| 完了条件 | `AIAccessCapability` 型と `FailFastError` 型が export されている |

定義する型:

| 型名                 | 定義                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `AIAccessCapability` | `'integratedRuntime' \| 'terminalSurface' \| 'both' \| 'none'`            |
| `FailFastError`      | `{ error: string; reason: string; guidance: string; retryable: boolean }` |
| `ResolvedRuntime`    | `{ providerId: string; modelId: string; adapter: LLMAdapter }`            |
| `SurfaceCapability`  | `{ surfaceId: string; capability: AIAccessCapability }`                   |

### Step 2: CredentialProvider 統一インターフェース（packages/shared）

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 目的     | API key / token 取得の抽象インターフェースを定義する       |
| 配置先   | `packages/shared/src/ai/credential-provider.ts`            |
| 依存     | Step 1（FailFastError 型）                                 |
| 完了条件 | `ICredentialProvider` インターフェースが export されている |

インターフェース:

| メソッド                     | 戻り値                             | 用途                              |
| ---------------------------- | ---------------------------------- | --------------------------------- |
| `get(providerId: string)`    | `Promise<string \| FailFastError>` | credential 文字列または fail-fast |
| `exists(providerId: string)` | `Promise<boolean>`                 | 存在確認のみ（値は返さない）      |

### Step 3: AuthModeService legacy migration 追加（Main）

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 目的     | legacy `authMode` 値を capability 値へ変換するメソッドを追加する |
| 配置先   | `apps/desktop/src/main/services/auth/AuthModeService.ts`         |
| 依存     | Step 1（AIAccessCapability 型）                                  |
| 完了条件 | `migrateToCapability()` メソッドが追加されている                 |

変換テーブル:

| legacy authMode | 変換先 capability   | 備考              |
| --------------- | ------------------- | ----------------- |
| `api-key`       | `integratedRuntime` | API key 存在時    |
| `api-key`       | `none`              | API key 不在時    |
| `subscription`  | `terminalSurface`   | terminal 可用時   |
| `subscription`  | `none`              | terminal 不可用時 |

### Step 4: AIRuntimeResolver 実装（Main）

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 目的     | provider/model/adapter を解決し、実行可能な runtime を返す                             |
| 配置先   | `apps/desktop/src/main/services/ai/AIRuntimeResolver.ts`                               |
| 依存     | Step 1（ResolvedRuntime 型）、Step 2（ICredentialProvider）、Step 3（AuthModeService） |
| 完了条件 | `resolve()` メソッドが fail-fast error 付きで動作する                                  |

解決順:

| 優先度 | ソース                                  | フォールバック             |
| ------ | --------------------------------------- | -------------------------- |
| 1      | 明示的な `providerId` / `modelId` 指定  | -                          |
| 2      | `selectedConfig`（electron-store 永続） | -                          |
| 3      | デフォルト provider / model             | -                          |
| 4      | 解決不能                                | fail-fast（stub 退避禁止） |

### Step 5: LLMAdapterFactory を resolver 経由に変更（Main）

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 目的     | adapter 生成を AIRuntimeResolver 経由に統一する                    |
| 配置先   | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`          |
| 依存     | Step 2（ICredentialProvider）、Step 4（AIRuntimeResolver）         |
| 完了条件 | adapter 生成が CredentialProvider 経由で credential を取得している |

変更内容:

| 変更箇所                | 変更前               | 変更後                                |
| ----------------------- | -------------------- | ------------------------------------- |
| credential 取得         | SecureStorage 直読み | `ICredentialProvider.get(providerId)` |
| キャッシュ invalidation | 手動呼び出し         | capability 変更イベントで自動 clear   |
| エラーハンドリング      | 汎用 throw           | `FailFastError` 形式で返却            |

### Step 6: aiHandlers / SkillExecutor / AgentExecutor を resolver 経由に統一（Main）

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| 目的     | 各 AI 実行エントリポイントを AIRuntimeResolver 経由に変更する |
| 配置先   | 下表参照                                                      |
| 依存     | Step 4（AIRuntimeResolver）、Step 5（LLMAdapterFactory）      |
| 完了条件 | 全エントリポイントが resolver 経由で runtime を取得している   |

対象ファイル:

| ファイル                                                    | 変更内容                                          | 影響範囲            |
| ----------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                   | AI_CHAT で resolver.resolve() を呼び出す          | ChatView, ChatPanel |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`     | API key 直読みを resolver 経由に変更              | Skill 実行全般      |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`     | runtime 取得を resolver 経由に変更                | Agent 実行全般      |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`        | Workspace Chat Edit の runtime 入口を統一         | Workspace Chat Edit |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | queryFn DI の provider 接続を resolver 経由に変更 | Skill Docs          |

### Step 7: skillExecutionAuthPreflight を capability 判定に変更（Renderer）

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | Renderer preflight を Main authority の capability 値に基づく判定に変更する |
| 配置先   | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`            |
| 依存     | Step 6（Main 側統一完了）                                                   |
| 完了条件 | preflight が独自 mode 判定を行わず、Main から受信した capability を参照する |

変更内容:

| 変更箇所      | 変更前                    | 変更後                                     |
| ------------- | ------------------------- | ------------------------------------------ |
| mode 判定     | authMode 直接参照         | `accessCapability` store 値を参照          |
| API key 確認  | 独自ロジック              | `window.electronAPI.authKey.exists()` 経由 |
| guidance 表示 | 独自エラー文生成          | Main が返した reason をそのまま表示        |
| CTA 活性制御  | authMode ベースの条件分岐 | capability 値ベースの disabled/enabled     |

### Step 8: access card / terminal card の state 追加（Store）

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 目的     | Renderer Zustand Store に新規 aiAccessSlice を追加する    |
| 配置先   | `apps/desktop/src/renderer/store/slices/aiAccessSlice.ts` |
| 依存     | Step 1（AIAccessCapability 型）、Step 6（IPC 通知）       |
| 完了条件 | `ai:capability-changed` IPC 受信で store が更新される     |

State 定義:

| Store Key             | 型                   | 初期値  | 更新トリガー                        |
| --------------------- | -------------------- | ------- | ----------------------------------- |
| `accessCapability`    | `AIAccessCapability` | `none`  | `ai:capability-changed` IPC         |
| `terminalAvailable`   | `boolean`            | `false` | `terminal:availability-changed` IPC |
| `isCapabilityLoading` | `boolean`            | `true`  | 初期化完了で `false`                |

---

## 2. 変更対象ファイル一覧

### packages/shared（新規 + 変更）

| ファイル                                        | 変更種別 | 変更内容                             | Step |
| ----------------------------------------------- | -------- | ------------------------------------ | ---- |
| `packages/shared/src/ai/types.ts`               | 新規     | AIAccessCapability, FailFastError 等 | 1    |
| `packages/shared/src/ai/credential-provider.ts` | 新規     | ICredentialProvider インターフェース | 2    |
| `packages/shared/src/ai/index.ts`               | 新規     | barrel export                        | 1-2  |
| `packages/shared/src/index.ts`                  | 変更     | ai module の re-export 追加          | 1-2  |

### apps/desktop Main Process（変更 + 新規）

| ファイル                                                          | 変更種別 | 変更内容                                       | Step |
| ----------------------------------------------------------------- | -------- | ---------------------------------------------- | ---- |
| `apps/desktop/src/main/services/auth/AuthModeService.ts`          | 変更     | `migrateToCapability()` メソッド追加           | 3    |
| `apps/desktop/src/main/services/ai/AIRuntimeResolver.ts`          | 新規     | provider/model/adapter 解決ロジック            | 4    |
| `apps/desktop/src/main/services/ai/AIAccessCapabilityResolver.ts` | 新規     | surface 別 capability 判定ロジック             | 4    |
| `apps/desktop/src/main/services/ai/CredentialProvider.ts`         | 新規     | ICredentialProvider 実装（SecureStorage wrap） | 4    |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`         | 変更     | credential 取得を ICredentialProvider 経由に   | 5    |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                         | 変更     | resolver.resolve() 呼び出しに統一              | 6    |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`           | 変更     | API key 直読みを resolver 経由に変更           | 6    |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`           | 変更     | runtime 取得を resolver 経由に変更             | 6    |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`              | 変更     | runtime 入口を resolver 経由に統一             | 6    |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`       | 変更     | queryFn DI の provider 接続を統一              | 6    |
| `apps/desktop/src/main/ipc/channels.ts`                           | 変更     | 新規 IPC チャンネル定数追加                    | 6    |

### apps/desktop Renderer（変更 + 新規）

| ファイル                                                         | 変更種別 | 変更内容                                 | Step |
| ---------------------------------------------------------------- | -------- | ---------------------------------------- | ---- |
| `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | 変更     | capability ベースの判定に変更            | 7    |
| `apps/desktop/src/renderer/store/slices/aiAccessSlice.ts`        | 新規     | accessCapability, terminalAvailable 管理 | 8    |
| `apps/desktop/src/renderer/store/index.ts`                       | 変更     | aiAccessSlice の合成                     | 8    |

---

## 3. DI 順序

初期化時の DI 注入は以下の順序で行う。各コンポーネントは前段の完了を前提とする。

```
1. SecureStorage（既存）
   ↓
2. AuthModeService（既存 + migration 拡張）
   ↓
3. CredentialProvider（新規: SecureStorage をラップ）
   ↓
4. AIAccessCapabilityResolver（新規: AuthModeService + CredentialProvider を注入）
   ↓
5. AIRuntimeResolver（新規: CredentialProvider + LLMAdapterFactory + selectedConfig を注入）
   ↓
6. LLMAdapterFactory（既存: credential 取得を CredentialProvider 経由に変更）
   ↓
7. aiHandlers / SkillExecutor / AgentExecutor（既存: AIRuntimeResolver を DI）
```

DI パターン選択:

| コンポーネント             | DI パターン           | 理由                                                          |
| -------------------------- | --------------------- | ------------------------------------------------------------- |
| CredentialProvider         | Constructor Injection | 依存（SecureStorage）が起動時に利用可能                       |
| AIAccessCapabilityResolver | Constructor Injection | 依存（AuthModeService, CredentialProvider）が起動時に利用可能 |
| AIRuntimeResolver          | Constructor Injection | 依存が起動時に利用可能                                        |
| SkillExecutor              | Setter Injection      | BrowserWindow 依存のため遅延注入（P34 準拠）                  |
| AgentExecutor              | Setter Injection      | BrowserWindow 依存のため遅延注入（P34 準拠）                  |

---

## 4. 依存タスクとの接続点

### 後続タスクへの提供契約

| 後続タスク          | 接続点                       | 提供する契約                                      |
| ------------------- | ---------------------------- | ------------------------------------------------- |
| Task02 Terminal     | `AIAccessCapabilityResolver` | `terminalSurface` 可用性の判定結果を提供          |
| Task02 Terminal     | `ai:capability-changed` IPC  | capability 変更を通知する                         |
| Task03-08 各Surface | `AIRuntimeResolver`          | provider/model/adapter の解決結果を提供           |
| Task03-08 各Surface | `FailFastError` 型           | fail-fast 時の guidance 情報を提供                |
| Task09 RAG          | `AIRuntimeResolver`          | `integratedRuntime` のみ（terminal handoff 不可） |
| Task10 Slide        | `AIRuntimeResolver`          | direct SDK 呼び出しの置換先を提供                 |

### IPC チャンネル新規追加

| チャンネル                | 定数名                                 | 用途                           |
| ------------------------- | -------------------------------------- | ------------------------------ |
| `ai:get-capability`       | `IPC_CHANNELS.AI_GET_CAPABILITY`       | surface 別 capability 取得     |
| `ai:capability-changed`   | `IPC_CHANNELS.AI_CAPABILITY_CHANGED`   | capability 変更 broadcast      |
| `ai:get-all-capabilities` | `IPC_CHANNELS.AI_GET_ALL_CAPABILITIES` | 全 surface capability 一括取得 |
| `ai:resolve-runtime`      | `IPC_CHANNELS.AI_RESOLVE_RUNTIME`      | runtime 解決                   |

### Cache Clear 条件（contract-matrix.md 準拠）

| トリガー                | クリア対象                       | Step |
| ----------------------- | -------------------------------- | ---- |
| API key 追加/削除/変更  | adapter cache（全 provider）     | 5    |
| capability 変更         | adapter cache + capability cache | 4-5  |
| selectedConfig 変更     | 該当 provider の adapter cache   | 5    |
| authMode 変更（legacy） | 全 cache                         | 3    |
