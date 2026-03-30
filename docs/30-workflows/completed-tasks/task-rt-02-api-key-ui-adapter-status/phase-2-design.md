# Phase 2: 設計

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| Phase名    | 設計                                 |
| 前提Phase  | Phase 1                              |
| 後続Phase  | Phase 3                              |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

既存 `apiKey.list` / `llm.checkHealth` を再利用し、`ApiKeysSection` だけで接続状態表示と retry UX を完結させる topology を定義する。

## 実行タスク

- topology 設計: Main / Preload / Renderer の既存責務を維持したまま接続する
- state 設計: UI 局所 state と派生 view state を定義する
- view 設計: badge / failure reason / retry の表示規約を定義する

## 設計一次結論

| 観点         | 結論                                                                 |
| ------------ | -------------------------------------------------------------------- |
| Main         | 既存 `handleCheckHealth()` を再利用する                              |
| Preload      | 既存 `window.electronAPI.llm.checkHealth` と `apiKey.*` を再利用する |
| Renderer     | `ApiKeysSection` 局所 state で provider ごとの health 結果を保持する |
| Store        | 新規 global slice は作らない                                         |
| Shared types | `HealthCheckResult` と `ProviderStatus` をそのまま使う               |

## Concern 分割

| Concern              | 責務                                                          | 主対象ファイル                                                            |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| C1: Data source      | API key 一覧と health 結果を取得する                          | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` |
| C2: State derivation | `registered` + `HealthCheckResult` から view state を導出する | `ApiKeysSection/index.tsx` または helper                                  |
| C3: Presentation     | badge / retry button / failure text を描画する                | `ApiKeysSection/index.tsx`, `components/atoms/*`                          |

## C1: Data source 設計

### 使用する既存契約

| surface                                              | 方向            | 用途                    |
| ---------------------------------------------------- | --------------- | ----------------------- |
| `window.electronAPI.apiKey.list()`                   | Renderer → Main | provider 一覧取得       |
| `window.electronAPI.apiKey.save/delete/validate()`   | Renderer → Main | 既存 API key 導線       |
| `window.electronAPI.llm.checkHealth({ providerId })` | Renderer → Main | provider ごとの接続確認 |

### 取得フロー

1. mount 時に `apiKey.list()` を実行
2. `registered` provider のみ `llm.checkHealth(providerId)` を並列実行
3. provider 行ごとに結果を局所 map へ格納
4. save / delete / retry 後は必要な provider のみ再取得する

## C2: State 設計

### 追加する局所 state

```typescript
type AdapterUiStatus = "idle" | "initializing" | "ready" | "failed";

interface ProviderHealthUiEntry {
  status: AdapterUiStatus;
  reason: string | null;
  checkedAt: string | null;
}

type ProviderHealthUiMap = Partial<Record<AIProvider, ProviderHealthUiEntry>>;
type ProviderRetryMap = Partial<Record<AIProvider, boolean>>;
```

### 派生ルール

| 条件                                                         | 表示状態                      |
| ------------------------------------------------------------ | ----------------------------- |
| `ProviderStatus.status === "not_registered"`                 | health 表示なし、登録導線のみ |
| health check 実行中                                          | `initializing`                |
| `HealthCheckResult.status === "connected"`                   | `ready`                       |
| `HealthCheckResult.status === "disconnected"` または `error` | `failed`                      |

### state ownership

| 所有者               | 持つもの                                   |
| -------------------- | ------------------------------------------ |
| Main                 | 実際の health 判定                         |
| Preload              | 既存 public contract の橋渡し              |
| Renderer local state | provider 行ごとの表示状態と retry 中フラグ |
| Global store         | 変更しない                                 |

## C3: UI 設計

### コンポーネント構成

```text
ApiKeysSection
  └─ ApiKeyItem
      ├─ Badge（既存の登録状態）
      ├─ AdapterStatusBadge（新規または内包 UI）
      ├─ failure reason text / tooltip
      └─ RetryButton（failed 時のみ）
```

### 表示仕様

| UI状態         | ラベル     | 補足                         |
| -------------- | ---------- | ---------------------------- |
| `initializing` | 接続確認中 | spinner + `aria-busy="true"` |
| `ready`        | 利用可能   | 成功色                       |
| `failed`       | 要再試行   | retry CTA を表示             |

### アクセシビリティ

| 要素           | 要件                                               |
| -------------- | -------------------------------------------------- |
| status badge   | `role="status"` と意味のある `aria-label`          |
| retry button   | provider 名を含む `aria-label`                     |
| loading        | `aria-busy="true"`                                 |
| failure reason | text または tooltip を SR から読める形で関連付ける |

## データフロー図

```text
apiKey.list()
  -> providerList
  -> registered provider を抽出
  -> Promise.allSettled(llm.checkHealth(providerId))
  -> deriveAdapterUiStatus()
  -> ApiKeysSection local state
  -> Badge / RetryButton / failure reason
```

## 参照資料

| 参照資料        | パス                                                                              | 内容                    |
| --------------- | --------------------------------------------------------------------------------- | ----------------------- |
| public IPC 契約 | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | `llm` public surface    |
| preload 境界    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | `safeInvoke` / API 公開 |
| state 方針      | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | local / global 境界     |
| 現行 UI         | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`         | 局所 state 実装         |

## 統合テスト連携【必須】

| 統合ポイント                      | 基準               |
| --------------------------------- | ------------------ |
| `apiKey.list` → provider 行構築   | automated          |
| `llm.checkHealth` → UI state 導出 | automated          |
| retry → 該当行のみ更新            | automated          |
| failure reason / a11y             | automated + manual |

## 成果物

| 成果物 | パス                        | 説明                         |
| ------ | --------------------------- | ---------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 既存契約再利用前提の UI 設計 |

## 完了条件

- [ ] 既存契約再利用方針が明示されている
- [ ] local state と global state の境界が明示されている
- [ ] 表示状態導出ルールが定義されている
- [ ] retry UX と a11y 要件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
