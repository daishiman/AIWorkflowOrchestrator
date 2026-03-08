# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 1                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| 更新日     | 2026-03-07                                       |
| ステータス | 未実施                                           |

## 目的

PR #1036/#1038 で実装済みの ApiKeysSection 防御ガード（`Array.isArray(result.data.providers)` + `window.electronAPI?.apiKey` の2段防御）の残存カバレッジ gap を充填し、Main Process 側バリデーション強化と profileHandlers とのパターン統一を完了する。

## 背景

### 実装状況の整理

task-04 調査を起点に、PR #1036/#1038 で以下の防御が **既に実装済み**:

| 防御レイヤー                 | 実装内容                                                        | ステータス |
| ---------------------------- | --------------------------------------------------------------- | ---------- |
| Renderer 層 `ApiKeysSection` | `Array.isArray(result.data.providers)` ガード                   | 既実装     |
| Renderer 層 `ApiKeysSection` | `window.electronAPI?.apiKey` 存在チェック                       | 既実装     |
| テスト RED-01〜RED-03b       | providers 非配列 / electronAPI 未定義 / apiKey 未定義 の6ケース | 既実装     |

### 残存カバレッジ gap

以下のケースは **未カバー** であり、本タスクの焦点:

| Gap ID | 異常ケース                                                                                          | 影響箇所                                                          | リスク |
| ------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| GAP-01 | `result.data` 自体が `undefined` / `null`                                                           | `ApiKeysSection` — `result.data.providers` アクセス時に TypeError | High   |
| GAP-02 | `result.data.providers` が空配列 `[]`                                                               | UI表示が空になるが、ユーザーへのフィードバックなし                | Medium |
| GAP-03 | `providers` 配列要素の shape malformed（`provider` / `status` フィールド欠損）                      | `.find()` / `.map()` 内で undefined アクセス                      | High   |
| GAP-04 | `apiKey.list()` が reject（Promise rejection）                                                      | 未 catch のまま SettingsView 全体がクラッシュする可能性           | High   |
| GAP-05 | Main Process `apiKeyHandlers` 側の providers 配列バリデーション不在                                 | 不正データがそのまま Renderer に到達                              | Medium |
| GAP-06 | `profileHandlers` の `identities ?? []`（nullish coalescing のみ）と `Array.isArray` パターン不統一 | 防御パターンの一貫性欠如                                          | Low    |

## Agent Team 編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 1 の責務                                          |
| ----------------------- | -------------------------------- | ---------- | ------------------------------------------------------- |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | GAP-01〜04 の Renderer 側正規化ポイントを定義する       |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | GAP-05 の Main 側バリデーション要件を定義する           |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | GAP-01〜04 の malformed response ケースと文言を設計する |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | 既実装部分と残存 gap の境界を統合する                   |

## 実行タスク

- Task 1: 現象再定義（既実装反映）
- Task 2: 根拠整理
- Task 3: スコープ境界の明確化
- Task 4: 受入基準のYes/No化

### Task 1: 現象再定義（既実装反映）

ApiKeysSection の基本防御ガードは PR #1036/#1038 で実装済み。本タスクの焦点は以下に再定義:

1. `result.data` が `undefined`/`null` の場合の TypeError 防止（GAP-01）
2. 空配列時のユーザーフィードバック表示（GAP-02）
3. `ProviderStatus` 要素の shape 欠損時の安全な処理（GAP-03）
4. `apiKey.list()` Promise rejection のハンドリング（GAP-04）
5. Main Process `apiKeyHandlers` への入力バリデーション追加（GAP-05）
6. `profileHandlers` との防御パターン統一（GAP-06）

### Task 2: 根拠整理

調査済みコードと既存仕様書を照合し、各 gap の再現条件を固定する:

| 根拠                                 | 確認先                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `result.data.providers` の既存ガード | `ApiKeysSection/index.tsx` — `Array.isArray()` チェック                |
| テスト RED-01〜RED-03b の網羅範囲    | `ApiKeysSection.test.tsx` — 6ケース                                    |
| Main 側バリデーション不在            | `apiKeyHandlers.ts` — providers 配列の型検証なし                       |
| profileHandlers のパターン           | `profileHandlers.ts` — `identities ?? []` のみ（`Array.isArray` なし） |
| IPC レスポンス型                     | `IPCResponse<ProviderListResult>` — `interfaces-auth.md` 参照          |

### Task 3: スコープ境界

**スコープ内:**

- GAP-01〜06 の防御実装とテスト追加
- `ProviderStatus` / `ProviderListResult` / `IPCResponse<ProviderListResult>` の型に基づく正規化
- `profileHandlers` の `Array.isArray` パターン統一

**非スコープ（変更しない）:**

- provider 一覧の文言全面改修
- apiKey storage backend の刷新
- 新しい provider 追加
- `ApiKeysSection` 以外のコンポーネントの防御強化
- Preload 層 `contextBridge` の構造変更

### Task 4: 受入基準化

| ID    | 受入基準                                                                                                   | 判定   |
| ----- | ---------------------------------------------------------------------------------------------------------- | ------ |
| AC-01 | `result.data` が `undefined`/`null` の場合、`ApiKeysSection` が TypeError を送出せず fallback 表示する     | Yes/No |
| AC-02 | `result.data.providers` が空配列 `[]` の場合、ユーザーに「プロバイダー未登録」等のフィードバックを表示する | Yes/No |
| AC-03 | `ProviderStatus` 要素の `provider`/`status` フィールドが欠損した場合、該当行をスキップしクラッシュしない   | Yes/No |
| AC-04 | `apiKey.list()` が reject した場合、エラー表示して SettingsView は継続描画される                           | Yes/No |
| AC-05 | Main Process `apiKeyHandlers` で `providers` が配列であることを検証してから Renderer に返す                | Yes/No |
| AC-06 | `profileHandlers` の `identities` 防御が `Array.isArray` パターンに統一されている                          | Yes/No |
| AC-07 | GAP-01〜04 に対応するテストケースが追加され、全 PASS                                                       | Yes/No |

## 参照資料

### 実装・証跡

| 資料名              | パス                                                                                                                               | 用途                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Renderer Component  | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                                                          | providers 正規化の主対象（既実装ガードの確認）        |
| Renderer Tests      | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`                                  | RED-01〜RED-03b 既存テストの確認・gap テスト追加先    |
| Main IPC            | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                                                      | GAP-05: providers 配列バリデーション追加先            |
| Main IPC            | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                                                     | GAP-06: `Array.isArray` パターン統一先                |
| Shared Types        | `packages/shared/types/api-keys.ts`                                                                                                | `ProviderStatus`, `ProviderListResult` 型定義の確認先 |
| Validator           | `packages/shared/infrastructure/ai/apiKeyValidator.ts`                                                                             | validation の責務境界確認                             |
| investigation index | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/index.md`                               | settings 側の残存リスクを確認する                     |
| task-04 manual      | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md` | SettingsView 自体が未検証だった事実を確認する         |
| task-03 manual      | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-11/manual-test-result.md`            | 専用 harness と settings shell の差分を確認する       |

### システム仕様（aiworkflow-requirements / task-specification-creator）

| 資料名                     | パス                                                                              | 用途                                          |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- |
| ipc-contract-checklist     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 6段チェックリスト、P42/P44/P45統合            |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Renderer境界4層防御パターン（v1.13.0）        |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | ApiKeysSection異常系表示仕様（v1.5.0）        |
| interfaces-auth            | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | `IPCResponse<T>` + `IPCError` envelope        |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | VALIDATION_ERROR = 1000番台                   |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | malformed response の component test パターン |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | TDD と coverage 条件を揃える                  |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`         | Phase 文書の構造を揃える                      |
| resource-map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 読むべきシステム正本を固定する                |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 12 の完了記録先を確認する               |
| known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                              | P42/P44/P45/P48 再発防止を確認する            |

### 前提Phase成果物

| 資料名 | パス | 用途                            |
| ------ | ---- | ------------------------------- |
| なし   | -    | Phase 1 は前提 Phase を持たない |

## 実行手順

1. 既実装の防御ガード（PR #1036/#1038）の範囲を `ApiKeysSection/index.tsx` と `ApiKeysSection.test.tsx` で確認し、GAP-01〜06 の未カバー箇所を一覧化する。
2. 各 gap について、型情報（`ProviderStatus`, `ProviderListResult`, `IPCResponse<ProviderListResult>`）を照合し、再現条件を固定する。
3. Main Process 側（`apiKeyHandlers.ts`）の現状バリデーション状態を確認し、GAP-05 の要件を定義する。
4. `profileHandlers.ts` の `identities ?? []` パターンと `ApiKeysSection` の `Array.isArray` パターンを比較し、統一方針を決定する。
5. 成功条件、非スコープ、並列/直列ポリシーを `outputs/phase-1/` の成果物に落とす。

## 型情報サマリ

```typescript
// packages/shared/types/api-keys.ts
interface ProviderStatus {
  provider: AIProvider;
  displayName: string;
  status: RegistrationStatus;
  lastValidatedAt: string | null;
}

interface ProviderListResult {
  providers: ProviderStatus[];
  registeredCount: number;
  totalCount: number;
}

// IPC レスポンス envelope（interfaces-auth.md 準拠）
type ListResponse = IPCResponse<ProviderListResult>;
// = { success: boolean; data?: ProviderListResult; error?: IPCError }
```

## 統合テスト連携

- `window.electronAPI.apiKey.list()` の戻り値として `IPCResponse<ProviderListResult>` の各異常パターン（GAP-01〜04）を fixture 化し、UI fallback を同じ fixture で確認する
- `profileHandlers.ts` 側の `identities` 正規化と `ApiKeysSection` の `providers` 正規化を別責務として確認する（GAP-06）
- SettingsView mount 時に malformed response が来ても view 全体が継続表示されることを確認する

## 多角的チェック観点

| 観点     | 確認内容                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 防御境界 | 既実装の `Array.isArray(result.data.providers)` に加え、`result.data` 自体の nullish チェックが追加されているか |
| 契約監査 | `ProviderListResult` 型と actual runtime shape の差分が GAP-01〜06 で全て記録されているか                       |
| UX       | 空配列時・エラー時の fallback 表示が silent failure ではなくユーザーに原因を伝えるか                            |
| 回帰耐性 | task-04 で守った linkedProviders と責務が重複していないか（別コンポーネント・別防御箇所）                       |
| P42 準拠 | 文字列引数に `.trim() === ""` チェックが含まれているか（該当箇所がある場合）                                    |
| P48 準拠 | non-null assertion (`!`) を使わず `Array.isArray()` / optional chaining で実行時検証しているか                  |

## 成果物

| 成果物       | パス                                         | 説明                                                     |
| ------------ | -------------------------------------------- | -------------------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 既実装範囲と残存 gap（GAP-01〜06）の機能要件・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-01〜07 の Yes/No 判定条件                             |
| スコープ境界 | `outputs/phase-1/scope-boundary.md`          | 実施対象（GAP-01〜06）と非スコープの明文化               |

## 完了条件

- [ ] 既実装の防御範囲（PR #1036/#1038）が明文化されている
- [ ] 残存 gap（GAP-01〜06）が個別に定義され、各 gap の再現条件が固定されている
- [ ] 受入基準が 7 件以上 Yes/No 形式で記述されている
- [ ] 非スコープが 5 件以上記述されている
- [ ] 参照資料に調査根拠と aiworkflow 正本の両方が含まれている
- [ ] 並列/直列ポリシーが index と一致している
- [ ] 型情報（`ProviderStatus`, `ProviderListResult`, `IPCResponse`）が要件に反映されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既実装防御ガード（PR #1036/#1038）の範囲確認
2. GAP-01〜06 の未カバー箇所定義
3. 型情報（`ProviderStatus`, `ProviderListResult`）の照合
4. 受入基準（AC-01〜07）の作成
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 2: 設計
