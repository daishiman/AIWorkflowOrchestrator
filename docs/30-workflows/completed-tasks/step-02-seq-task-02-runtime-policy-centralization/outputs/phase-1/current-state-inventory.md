# Phase 1: 要件定義 - 現行コード棚卸し

## メタ情報

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| タスクID         | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク種別       | design（設計タスク）                       |
| 作成日           | 2026-03-21                                 |
| 調査対象ブランチ | HEAD（task-20260321-073253-wt-1）          |

---

## 1. コード棚卸し: Runtime 判定関連サービス

### 1-1. RuntimePolicyResolver.ts

**ファイルパス**: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`

**責務**:

- `authMode`（AuthMode 型）と `apiKey`（string | null）を受け取り、`RuntimeDecision` を返す
- `IRuntimePolicyResolver` インターフェースを公開し、DI による差し替えを可能にする
- `TerminalHandoffBundle` 型を export（外部から参照されている）

**主要な型定義**:

| 型名                     | 内容                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `TerminalHandoffBundle`  | `launcher` / `promptBundle` / `cwd` / `suggestedCommand` / `manualRetryRule` / `runbook?`                                      |
| `RuntimeDecision`        | `{ type: "integrated_api"; apiKey: string; permissionMode? }` or `{ type: "terminal_handoff"; bundle: TerminalHandoffBundle }` |
| `IRuntimePolicyResolver` | `resolve(authMode, apiKey): Promise<RuntimeDecision>`                                                                          |

**判定ロジック**:

- `authMode === "api-key"` かつ `apiKey.trim() !== ""` → `integrated_api`
- `authMode === "subscription"` または `apiKey` が空 → `terminal_handoff`

**問題点**:

- `resolveWithService(authMode)` が `authKeyService` を DI 依存するが、`authModeService` は DI されていない（`authMode` は引数で受け取る）
- `buildDefaultBundle()` がプレースホルダーのプロンプトを返すため、実際の surface 固有情報が含まれない
- `RuntimeDecision.integrated_api.apiKey` フィールドが IPC レスポンスに含まれた場合、Renderer に apiKey が漏洩するリスクがある（セキュリティ上の課題）

---

### 1-2. RuntimeResolver.ts

**ファイルパス**: `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`

**責務**:

- `IAuthKeyService` と `IAuthModeService` を Constructor Injection で受け取る
- 引数なしの `resolve()` で `RuntimeResolution` を返す（サービス内部で authMode・apiKey を取得）

**主要な型定義**:

| 型名                | 内容                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `RuntimeResolution` | `{ type: "integrated" }` or `{ type: "handoff"; reason: string }` |

**判定ロジック**:

1. `authMode === "subscription"` → `handoff`
2. `authKeyService.hasKey()` が false → `handoff`
3. `authKeyService.getKey()` が null → `handoff`
4. それ以外 → `integrated`

**問題点（RuntimePolicyResolver との責務重複）**:

| 比較軸           | RuntimePolicyResolver                  | RuntimeResolver                         |
| ---------------- | -------------------------------------- | --------------------------------------- |
| 入力形式         | `authMode` + `apiKey` を引数で受け取る | DI サービスから内部取得                 |
| 出力型           | `RuntimeDecision`（詳細あり）          | `RuntimeResolution`（シンプル）         |
| apiKey 取得      | 呼び出し元が渡す                       | 内部で `authKeyService.getKey()` を呼ぶ |
| handoff 理由     | 型に含まない                           | `reason: string` で含む                 |
| インターフェース | `IRuntimePolicyResolver` あり          | インターフェースなし                    |

**結論**: 両者は同一の判定を二重実装している。`RuntimeResolver` の `RuntimeResolution` 型は `RuntimeDecision` に統合すべきである。

---

### 1-3. TerminalHandoffBuilder.ts

**ファイルパス**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

**責務**:

- `HandoffBuildOptions` / `AgentHandoffBuildRequest` / `SkillHandoffBuildRequest` を受け取り、`HandoffGuidance`（`@repo/shared/types`）または `TerminalHandoffBundle` を返す
- shell injection 対策のプロンプトエスケープを実施（P55 準拠）

**主要なメソッド**:

| メソッド                                  | 入力                       | 出力                    | surface          |
| ----------------------------------------- | -------------------------- | ----------------------- | ---------------- |
| `build(prompt, cwd, options?)`            | 文字列                     | `TerminalHandoffBundle` | 共通（低レベル） |
| `buildForAgentExecution(request, reason)` | `AgentHandoffBuildRequest` | `HandoffGuidance`       | Agent            |
| `buildForSkillExecution(request, reason)` | `SkillHandoffBuildRequest` | `HandoffGuidance`       | Skill            |

**問題点**:

- `buildForAgentExecution` と `buildForSkillExecution` が surface 固有の `contextSummary`（`surface=agent` / `surface=skill`）を内部にハードコードしている
- 新規 surface（Skill Creator / Chat）を追加する際に、メソッドを追加するか既存メソッドの分岐を増やす必要がある
- `HandoffGuidance` と `TerminalHandoffBundle` の2型が混在しており、呼び出し元に型の使い分けを強制している

---

### 1-4. aiHandlers.ts

**ファイルパス**: `apps/desktop/src/main/ipc/aiHandlers.ts`

**責務**:

- `AI_CHAT` / `AI_CHECK_CONNECTION` / `AI_INDEX` IPC ハンドラーを登録
- `LLMAdapterFactory` 経由でプロバイダーに接続し、チャット応答を返す
- `getSelectedLLMConfig()` で Main Process 側の LLM 設定を取得

**health check 関連**:

| ハンドラー            | チャンネル                         | 現状                                | 問題点                                                                                                                               |
| --------------------- | ---------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `AI_CHECK_CONNECTION` | `IPC_CHANNELS.AI_CHECK_CONNECTION` | `status: "disconnected"` を固定返却 | 実際の health check を実施しない。コメントに「legacy 互換残置、llm:check-health を使用してください」と記載済みだが、廃止条件が未定義 |

**runtime 判定の不在**:

- `AI_CHAT` ハンドラーは `providerId` / `modelId` の有無で分岐するが、`RuntimePolicyResolver` を呼び出していない
- authMode 判定（subscription / api-key）を行わず、LLM アダプター経由で直接実行する
- `RuntimePolicyResolver` が定義する `integrated_api` / `terminal_handoff` の判定が AI Chat には未適用

---

## 2. Health Route 棚卸し

### 2-1. 2系統の health route 比較

| 項目                | primary route                                                     | legacy route                                                 |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| IPC チャンネル      | `llm:check-health`                                                | `AI_CHECK_CONNECTION`                                        |
| 定数キー            | `IPC_CHANNELS.LLM_CHECK_HEALTH`（推定）                           | `IPC_CHANNELS.AI_CHECK_CONNECTION`                           |
| 実装ファイル        | `apps/desktop/src/main/ipc/llmHandlers.ts`（推定）                | `apps/desktop/src/main/ipc/aiHandlers.ts`                    |
| Renderer 呼び出し元 | `llmSlice.checkHealth()` → `window.electronAPI.llm.checkHealth()` | 現行コードで参照されていない（固定レスポンスのみ）           |
| レスポンス型        | `HealthCheckResult`（実際の接続テスト結果）                       | `AICheckConnectionResponse`（`status: "disconnected"` 固定） |
| 廃止条件            | N/A（primary）                                                    | 未定義                                                       |
| 新規実装での使用    | 必須                                                              | 禁止（コメントに記載済みだが強制力なし）                     |

### 2-2. 優先順位の根拠

- `llm:check-health` が primary である理由:
  1. `llmSlice.checkHealth()` が `llm:check-health` を呼んでいるため、実際の Renderer の動作に紐付いている
  2. `HealthCheckResult` 型が実際の接続状態（status / providerId / errorMessage / checkedAt）を含む
  3. `AI_CHECK_CONNECTION` は `status: "disconnected"` を固定返却するため health check として機能していない

### 2-3. legacy route の残置条件（定義予定）

Phase 2 設計書で以下を定義する:

- 残置期間: Step 03-09 の全 surface 移行が完了するまで
- 新規コードでの使用禁止: `AI_CHECK_CONNECTION` を直接呼ぶコードは lint ルールで検出する（未実装）
- 廃止トリガー: 全 surface が `llm:check-health` のみを参照していることが確認された時点

---

## 3. Renderer Surface-Local 判定の一覧

### 3-1. authModeSlice.ts での分散判定

**ファイルパス**: `apps/desktop/src/renderer/store/slices/authModeSlice.ts`

| 判定箇所                                                     | 判定内容                                           | 問題                                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fetchMode()` → `window.electronAPI.authMode.get()`          | Main から authMode を取得してローカル state に格納 | IPC 経由取得自体は適切だが、取得後の `mode` を他コンポーネントが直接参照する可能性がある |
| `fetchStatus()` → `window.electronAPI.authMode.status()`     | AuthModeStatus をローカルに格納                    | `isValid` / `hasCredentials` を Renderer が保持し、表示の条件分岐に使用する              |
| `validate(mode?)` → `window.electronAPI.authMode.validate()` | バリデーション結果をローカルで保持                 | runtime 実行可否の判定に流用されるリスクがある                                           |
| `createFallbackStatus(mode, overrides)`                      | authMode の fallback 状態をローカル生成            | Main Process の判定を経由せずに `isValid: false` を直接生成する                          |

**特記事項**:

- セキュリティ設計は適切（apiKey を Renderer に保持しない）
- `mode`（AuthMode 文字列）は表示目的で保持しており、これ自体は問題ない
- 問題は `mode` を参照して runtime 判定を Renderer 側で行うコンポーネントが存在するリスク

### 3-2. llmSlice.ts での分散判定

**ファイルパス**: `apps/desktop/src/renderer/store/slices/llmSlice.ts`

| 判定箇所                                                           | 判定内容                                              | 問題                                                                                        |
| ------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `checkHealth(providerId)` → `window.electronAPI.llm.checkHealth()` | `llm:check-health` 経由でヘルスチェック（正規ルート） | health check 自体は適切だが、結果を `healthStatus` に格納しコンポーネントが判定に利用する   |
| `healthStatus: Record<LLMProviderId, HealthCheckResult>`           | 各 providerId の health 状態をローカルに保持          | health 状態を Renderer が保持することで、表示の判断はRendererで可能になる（表示目的は許容） |
| `isProviderAvailable(providerId)`                                  | `provider.isAvailable` を参照して判定                 | プロバイダーの利用可否を Renderer が独自に判定している                                      |
| `syncSelectedConfigToMain(providerId, modelId)`                    | 選択状態を Main に同期                                | Renderer が「自分で選択して Main に通知する」パターン。ownership が逆転しているリスク       |
| `fetchProviders()` → 自動で最初の provider を選択                  | `selectedProviderId` / `selectedModelId` を自動設定   | Main の選択状態と独立して Renderer が選択状態を管理するため、不整合が生じうる               |

### 3-3. surface-local 判定の問題整理

| 判定カテゴリ                             | 現行の所有層                                     | あるべき所有層                                | 優先度 |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------- | ------ |
| runtime 実行可否（integrated / handoff） | Main（RuntimePolicyResolver）/ 一部未適用        | Main（統一）                                  | 高     |
| authMode 判定（subscription / api-key）  | Main（正規） + Renderer（表示目的で保持）        | Main（判定） / Renderer（表示のみ）           | 中     |
| health check 実行                        | Renderer（llmSlice.checkHealth 経由）            | Main（primary） / Renderer（UI 表示目的のみ） | 中     |
| health 判定結果の保持                    | Renderer（healthStatus Store）                   | 表示目的は許容、実行可否判定への流用は禁止    | 中     |
| provider 選択状態の管理                  | Renderer（selectedProviderId / selectedModelId） | 設計上の課題（Step 03 で再検討）              | 低     |

---

## 4. 棚卸し結果サマリー

### 問題点の集約

1. **二重リゾルバー**: `RuntimePolicyResolver`（引数型・詳細型）と `RuntimeResolver`（DI型・シンプル型）が並存し、どちらを使うべきかが不明確
2. **AI Chat の未適用**: `aiHandlers.ts` が `RuntimePolicyResolver` を呼ばず、authMode 判定なしに LLM を直接実行している
3. **health route の2系統**: `llm:check-health`（実動作）と `AI_CHECK_CONNECTION`（固定返却）が並存し、廃止条件が未定義
4. **TerminalHandoffBuilder の surface ハードコード**: `buildForAgentExecution` / `buildForSkillExecution` が surface 名を内部にハードコードしており、拡張性が低い
5. **authModeSlice の fallback 生成**: Renderer 側で `createFallbackStatus` を実行し、Main Process を経由せずに `isValid: false` の状態を生成している

### Phase 2 設計で対処すべき事項

- [ ] `RuntimePolicyResolver` を正規リゾルバーとして確定し、`RuntimeResolver` の移行計画を策定
- [ ] `AI_CHECK_CONNECTION` の廃止条件を ownership table に明記
- [ ] `aiHandlers.ts` に `RuntimePolicyResolver` を組み込む設計を追加
- [ ] `TerminalHandoffBuilder` の surface 拡張方式を定義
- [ ] Renderer の authMode 参照を「表示目的」と「判定目的」に分類し、判定目的での参照を禁止するルールを策定

---

## 完了条件

- [ ] RuntimePolicyResolver / RuntimeResolver / TerminalHandoffBuilder / aiHandlers の責務と問題点が記載されていること
- [ ] health route の2系統（primary / legacy）と優先順位が記載されていること
- [ ] Renderer の surface-local 判定箇所が authModeSlice / llmSlice のコード参照付きで列挙されていること
- [ ] 問題点が Phase 2 設計への入力として整理されていること

## 次フェーズ

Phase 2: 設計（`phase-2-design.md`）にて、本棚卸し結果を基に ownership table と責務境界図を作成する。
