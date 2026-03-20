# Phase 5: 変更スコープ (File Change Scope)

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 5                                                         |
| 作成日   | 2026-03-20                                                |

---

## 変更ファイル一覧

### 1. packages/shared/src/types/auth-mode.ts

| 列             | 内容                                                                                                                                                                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル   | `packages/shared/src/types/auth-mode.ts`                                                                                                                                                                                                                                                                          |
| concern        | Concern B（state 語彙統一）: transport DTO の拡張                                                                                                                                                                                                                                                                 |
| 変更概要       | `RuntimeCapability`（integratedRuntime / terminalSurface / both / none）、`RuntimeUiState`（ready / blocked / unavailable）、`BlockedAction` の 3 型を新規 export する。`AuthModeStatus` インターフェースに `capability?`, `uiState?`, `blockedReason?`, `blockedAction?` の 4 フィールドを optional で追加する。 |
| 変更しないこと | 既存フィールド（mode / isValid / hasCredentials / message / errorCode / guidance / lastCheckedAt）の型・必須区分を変更しない。`AuthMode`（"subscription" \| "api-key"）、`IPCResponse<T>` envelope の構造、`AUTH_MODE_ERROR_CODES` の値、`IAuthModeService` インターフェースのメソッドシグネチャを変更しない。    |

---

### 2. apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

| 列             | 内容                                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル   | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                                                                                                                                                                                                                                                                                                                 |
| concern        | Concern A（capability 契約）: capability 判定 authority の Main への集約                                                                                                                                                                                                                                                                                                          |
| 変更概要       | `RuntimePolicyInputs`（apiKeyValid / subscriptionValid）インターフェースを新規定義する。`resolveCapability(inputs: RuntimePolicyInputs): RuntimeCapability` メソッドを `IRuntimePolicyResolver` インターフェースと `RuntimePolicyResolver` クラス両方に追加する。判定ロジックは Phase 2 contract-matrix の条件表に準拠する（both / integratedRuntime / terminalSurface / none）。 |
| 変更しないこと | 既存の `resolve(authMode, apiKey): Promise<RuntimeDecision>` メソッドのシグネチャと動作を変更しない（後方互換維持）。`RuntimeDecision`（integrated_api / terminal_handoff）型の構造を変更しない。`TerminalHandoffBundle` の構造を変更しない。`resolveWithService()` の動作を変更しない。                                                                                          |

---

### 3. apps/desktop/src/main/handlers/（IPC 関連ハンドラ）

| 列             | 内容                                                                                                                                                                                                                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル   | `apps/desktop/src/main/handlers/`（auth-mode:status / auth-mode:validate 等を処理するハンドラファイル）                                                                                                                                                                                                                       |
| concern        | Concern A（capability 契約）の配布: IPC envelope を既存 canonical 形式に整列し、Renderer へ capability を含む `AuthModeStatus` DTO を配布する                                                                                                                                                                                 |
| 変更概要       | auth-mode:status / auth-mode:validate 等の IPC ハンドラ内で `RuntimePolicyResolver.resolveCapability()` を呼び出し、返却する `AuthModeStatus` の `capability` フィールドに結果を設定する。DI により注入された `runtimePolicyResolver` インスタンスを使用する（P61 DIP 準拠: `IRuntimePolicyResolver` インターフェース経由）。 |
| 変更しないこと | IPC チャンネル名（`IPC_CHANNELS` 定数）を変更しない。`IPCResponse<T>` の `success / data / error` 3 フィールド構造を変更しない（P60 対策）。引数バリデーション（P42 準拠の 3 段チェック）ロジックを削除しない。送信元ウィンドウの検証ロジックを変更しない（P04 対策）。                                                       |

---

### 4. apps/desktop/src/renderer/store/（Zustand selector）

| 列             | 内容                                                                                                                                                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル   | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`（および必要に応じて関連 index / selector ファイル）                                                                                                                                                                                                              |
| concern        | Concern B（state 語彙統一）: capability → uiState 変換の Renderer 内唯一の実装場所を確立する                                                                                                                                                                                                                               |
| 変更概要       | `selectUiState(status: AuthModeStatus): RuntimeUiState` 関数を新規 export する。`useRuntimeCapabilityStatus()` hook を新規 export する。hook は `useShallow` を適用し、`{ capability, uiState, blockedReason, blockedAction }` を返す（P31 / P48 対策）。                                                                  |
| 変更しないこと | `ViewType` / `renderView()` は consumer に留め、selector に route 判定を持ち込まない。既存の個別セレクタ（`useAuthMode()` / `useSetAuthMode()` 等）のシグネチャを変更しない。合成 Hook（`useAuthModeStore()` 等）の `@deprecated` タグを外さない（P31 対策）。`sliceBaseline.ts` / `index.ts` の export 構造を破壊しない。 |

---

### 5. apps/desktop/src/renderer/components/（CTA consumer）

| 列             | 内容                                                                                                                                                                                                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル   | `apps/desktop/src/renderer/components/` 配下の CTA consumer（settings shell / main chat / chat/AgentView / workspace / terminal handoff 関連コンポーネント等）                                                                                                                                                                                                                   |
| concern        | Concern C（CTA 契約）: consumer を contract-matrix（capability × uiState → CTA 表示条件）に準拠させる                                                                                                                                                                                                                                                                            |
| 変更概要       | 各 CTA consumer コンポーネントで `authMode` / `isValid` / `hasCredentials` 等を直接参照して capability / uiState を判定しているコードを `useRuntimeCapabilityStatus()` hook に置き換える。`blocked` 状態で disabled ボタンを表示しているコード（no-op CTA）を guidance action ボタンに置き換える。`unavailable` 状態で primary CTA を DOM に含めているコードを非表示に変更する。 |
| 変更しないこと | `renderView()` の呼び出しインターフェースを変更しない（consumer 境界）。`settings` 公開シェル例外（AuthGuard bypass）のロジックを変更しない。CTA ラベルを IPC 契約（`AuthModeStatus`）に含める設計にしない（Concern B/C 分離維持）。コンポーネントの props インターフェース（外部から注入されるもの）を変更しない。                                                              |

---

## 変更しないファイル（影響範囲外）

| ファイル / ディレクトリ                                            | 変更しない理由                                                               |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` | handoff bundle の構築ロジックは Task05 で対応。本 Task01 の変更スコープ外    |
| `apps/desktop/src/preload/`                                        | IPC チャンネルの変更がないため Preload の変更は不要                          |
| `packages/shared/src/types/`（auth-mode.ts 以外）                  | capability 型は auth-mode.ts に集約し、他の型ファイルへの分散を防ぐ          |
| `apps/desktop/src/main/services/auth/`                             | 認証サービス本体は変更対象外。capability 判定は RuntimePolicyResolver に集約 |
| `apps/web/`                                                        | Web アプリは本タスクのスコープ外                                             |
| `apps/backend/`                                                    | バックエンドは本タスクのスコープ外                                           |
| `.claude/skills/`                                                  | 仕様書スキルファイルの更新は Phase 12（ドキュメント）で実施                  |

---

## 依存順序サマリー

```
ステップ 1（型確認）
    └─ ステップ 2（shared 型追加）
           └─ ステップ 3（RuntimePolicyResolver 拡張）
                  └─ ステップ 4（IPC ハンドラ整列）
                         └─ ステップ 5（Renderer selector / hook 追加）
                                └─ ステップ 6（CTA consumer 整列）
```

各ステップは前のステップが完了してから着手すること。ステップ間の型参照が破損するため、並列実行は禁止。

---

## Concern Ownership マッピング（Phase 2 contract-matrix との対応）

| Phase 2 Concern   | 実装ファイル                                            | 入力                            | 出力                                      | 禁止事項                              |
| ----------------- | ------------------------------------------------------- | ------------------------------- | ----------------------------------------- | ------------------------------------- |
| Concern A         | `RuntimePolicyResolver.ts`                              | apiKeyValid / subscriptionValid | RuntimeCapability（4 状態）               | 他ファイルでの capability 再計算      |
| Concern B（DTO）  | `packages/shared/src/types/auth-mode.ts`                | RuntimeCapability               | AuthModeStatus.capability（transport 用） | uiState の Main Process 側計算        |
| Concern B（変換） | `authModeSlice.ts` の selector / hook                   | AuthModeStatus.capability       | RuntimeUiState + blockedReason/Action     | Renderer 内での capability 独自再計算 |
| Concern C         | `apps/desktop/src/renderer/components/`（CTA consumer） | capability + uiState            | CTA 表示 / 非表示                         | コンポーネント内での追加条件判定      |
