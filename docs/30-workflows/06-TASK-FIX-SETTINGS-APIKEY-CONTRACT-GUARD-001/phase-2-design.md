# Phase 2: 設計

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 2                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| 更新日     | 2026-03-07                                       |
| ステータス | 未実施                                           |

## 目的

Phase 1 で定義した残存カバレッジ gap（GAP-01〜06）に対し、Renderer / Main / Shared の3層で責務を分離した設計を行い、Phase 4-5 で実装可能な粒度に落とす。

## 背景

PR #1036/#1038 で Renderer 層の基本防御は実装済み。本 Phase では残存 gap を3層アーキテクチャに沿って設計し、既実装の防御パターンとの一貫性を保つ。

## Agent Team 編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 2 の責務                                            |
| ----------------------- | -------------------------------- | ---------- | --------------------------------------------------------- |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | GAP-01〜04 の Renderer 正規化設計                         |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | GAP-05 の Main 側バリデーション設計                       |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | fallback UX パターンと profileHandlers 統一設計（GAP-06） |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | 3層設計の整合性統合                                       |

## 実行タスク

### Task 1: アーキテクチャ層別設計

#### Renderer 層（`ApiKeysSection/index.tsx`）

| Gap ID | 設計方針                                                                                                                 | 変更箇所                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| GAP-01 | `result.data?.providers` — optional chaining で `data` の nullish を吸収。`data` が falsy の場合は空配列にフォールバック | `ApiKeysSection/index.tsx` — `fetchProviders` 関数内 |
| GAP-02 | `providers.length === 0` 判定を追加し、空配列時に「プロバイダーが登録されていません」メッセージを表示                    | `ApiKeysSection/index.tsx` — render 部               |
| GAP-03 | `.filter()` で `ProviderStatus` の必須フィールド（`provider`, `status`）が存在する要素のみ保持                           | `ApiKeysSection/index.tsx` — 正規化関数              |
| GAP-04 | `apiKey.list()` 呼び出しを try-catch でラップし、rejection 時はエラー state に遷移                                       | `ApiKeysSection/index.tsx` — `fetchProviders` 関数内 |

```typescript
// GAP-01 + GAP-03: 正規化関数の設計
function normalizeProviders(data: unknown): ProviderStatus[] {
  const raw = (data as ProviderListResult | undefined)?.providers;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is ProviderStatus =>
      item != null &&
      typeof item.provider === "string" &&
      typeof item.status === "string",
  );
}
```

#### Main Process 層（`apiKeyHandlers.ts`）

| Gap ID | 設計方針                                                                                                                                 | 変更箇所                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| GAP-05 | `apiKey:list` ハンドラのレスポンス生成時に `providers` が配列であることを検証。非配列の場合は空配列に正規化してから `IPCResponse` に包む | `apiKeyHandlers.ts` — `handleApiKeyList` 関数 |

```typescript
// GAP-05: Main 側バリデーション追加
const providers = Array.isArray(result.providers) ? result.providers : [];
return {
  success: true,
  data: { providers, registeredCount: providers.length, totalCount },
};
```

#### profileHandlers パターン統一（`profileHandlers.ts`）

| Gap ID | 設計方針                                                                                                                | 変更箇所                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| GAP-06 | `identities ?? []` を `Array.isArray(identities) ? identities : []` に変更し、`ApiKeysSection` と同じ防御パターンに統一 | `profileHandlers.ts` — identities 取得箇所 |

### Task 2: 責務分担表

| 層       | ファイル                            | 責務                          | 既実装                                                                         | 追加変更                                                                                              |
| -------- | ----------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Renderer | `ApiKeysSection/index.tsx`          | providers 正規化・UI fallback | `Array.isArray(result.data.providers)` + `window.electronAPI?.apiKey` チェック | GAP-01: `data?.` optional chaining, GAP-02: 空配列メッセージ, GAP-03: 要素フィルタ, GAP-04: try-catch |
| Renderer | `ApiKeysSection.test.tsx`           | 異常系テスト                  | RED-01〜RED-03b（6ケース）                                                     | GAP-01〜04 対応テスト追加                                                                             |
| Main     | `apiKeyHandlers.ts`                 | providers 配列バリデーション  | なし                                                                           | GAP-05: `Array.isArray` チェック追加                                                                  |
| Main     | `profileHandlers.ts`                | identities 防御パターン統一   | `identities ?? []`                                                             | GAP-06: `Array.isArray` パターンへ変更                                                                |
| Shared   | `packages/shared/types/api-keys.ts` | 型定義                        | `ProviderStatus`, `ProviderListResult`                                         | 変更なし（既存型で充足）                                                                              |

### Task 3: 設計判断の記録

| 判断 ID | 判断内容                                                                    | 根拠                                                                     |
| ------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| DD-01   | 正規化関数を `ApiKeysSection` コンポーネント内に配置（共通 util 化しない）  | 現時点で `ApiKeysSection` のみが使用。過度な抽象化回避                   |
| DD-02   | `ProviderStatus` の必須フィールドチェックは `provider` と `status` のみ     | `displayName` / `lastValidatedAt` は表示用であり欠損でもクラッシュしない |
| DD-03   | Main 側バリデーション失敗時は空配列で正常レスポンスを返す（エラーにしない） | P48 準拠: Renderer 側で安全に処理可能な shape を保証                     |
| DD-04   | `profileHandlers` のパターン変更は最小限（`?? []` → `Array.isArray` のみ）  | スコープ境界を守り、profileHandlers の他の機能に影響しない               |

### Task 4: リスク整理

| リスク                              | 影響度 | 緩和策                                                                        |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------- |
| 既存テスト RED-01〜RED-03b との競合 | Low    | 新規テストは GAP-01〜04 として既存テストと ID を分離                          |
| `normalizeProviders` の型ガード漏れ | Medium | `ProviderStatus` の必須フィールドを type predicate で厳密にチェック           |
| profileHandlers 変更の副作用        | Low    | `?? []` → `Array.isArray` は互換性のある変更（null/undefined は同じく空配列） |

## 参照資料

### 実装・証跡

| 資料名             | パス                                                                                              | 用途                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Renderer Component | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | GAP-01〜04 の変更対象                         |
| Renderer Tests     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 既存テストとの共存確認                        |
| Main IPC           | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | GAP-05 の変更対象                             |
| Main IPC           | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | GAP-06 の変更対象                             |
| Shared Types       | `packages/shared/types/api-keys.ts`                                                               | `ProviderStatus`, `ProviderListResult` 型確認 |

### システム仕様

| 資料名                     | パス                                                                              | 用途                            |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| ipc-contract-checklist     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 6段チェックリスト準拠確認       |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Renderer境界4層防御パターン確認 |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | 空配列・エラー時の表示仕様      |
| interfaces-auth            | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | `IPCResponse<T>` envelope 設計  |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | VALIDATION_ERROR カテゴリ確認   |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストデータファクトリパターン  |
| known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                              | P42/P44/P45/P48 準拠確認        |

### 前提Phase成果物

| 資料名         | パス               | 用途                                   |
| -------------- | ------------------ | -------------------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | GAP-01〜06、AC-01〜07 を入力として参照 |

## 実行手順

1. Phase 1 の AC-01〜07 と GAP-01〜06 を入力にして、3層（Renderer / Main / Shared）の変更責務を分解する。
2. 各 gap に対する設計方針（正規化関数・バリデーション追加・パターン統一）を具体的なコード例と共に記述する。
3. 責務分担表で既実装部分と追加変更を明確に分離する。
4. 設計判断（DD-01〜04）とリスク整理を review 可能な粒度に揃える。

## 統合テスト連携

- `normalizeProviders` 関数のユニットテストと `ApiKeysSection` のコンポーネントテストで同じ fixture を使用する
- `apiKeyHandlers` の Main 側バリデーションテストは独立した unit test として追加する
- `profileHandlers` のパターン統一テストは既存テストへの追加として実装する

## 多角的チェック観点

| 観点                   | 確認内容                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| 防御境界               | `normalizeProviders` が唯一の正規化ポイントとなり、render 側は配列前提を直接持たないか        |
| 契約監査               | `ProviderListResult` 型と `normalizeProviders` の入出力が一致しているか                       |
| UX                     | GAP-02（空配列）・GAP-04（rejection）の fallback が silent failure ではなくユーザーに伝わるか |
| 回帰耐性               | 既存 RED-01〜RED-03b テストが新設計で破壊されないか                                           |
| P48 準拠               | non-null assertion を使わず optional chaining + `Array.isArray` で実行時検証しているか        |
| ipc-contract-checklist | 6段チェックリストの Phase 1-3（型定義・ハンドラ・Preload）が設計に反映されているか            |

## 成果物

| 成果物     | パス                                  | 説明                                             |
| ---------- | ------------------------------------- | ------------------------------------------------ |
| 設計方針   | `outputs/phase-2/design-decisions.md` | DD-01〜04 と3層設計の詳細                        |
| 責務分担表 | `outputs/phase-2/ownership-matrix.md` | 既実装/追加変更を分離した Renderer / Main 分担表 |
| 実行計画   | `outputs/phase-2/execution-plan.md`   | GAP-ID ベースの実装順序と分割方針                |

## 完了条件

- [ ] Renderer / Main の責務境界が GAP-ID と紐づけて表形式で整理されている
- [ ] 各 gap に対する設計方針がコード例付きで記述されている
- [ ] 既実装部分（PR #1036/#1038）と追加変更が明確に分離されている
- [ ] 設計判断（DD-01〜04）が根拠付きで記録されている
- [ ] profileHandlers パターン統一の方針が互換性の観点で検証されている
- [ ] Phase 3 がレビュー可能な入力を持っている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1 成果物（GAP-01〜06、AC-01〜07）の確認
2. 3層設計（Renderer / Main / Shared）の策定
3. 責務分担表の作成（既実装/追加変更の分離）
4. 設計判断（DD-01〜04）の記録
5. リスク整理
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 3: 設計レビューゲート
