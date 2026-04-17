# Phase 2: 設計

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 2                                            |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | settings-deep-merge                          |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 1                                      |
| 後続Phase  | Phase 3                                      |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

`settings:update` IPC ハンドラに `deepMerge` 対応を導入するためのアーキテクチャを設計し、
実装方針・IPC 契約・テスト戦略を確定する。

## 背景

`registerUserSettingsHandlers` 内の `settings:update` ハンドラは現在シャローマージ
（`{ ...current, ...updates }`）のみ対応している。
ネストされた設定オブジェクト（例: `theme`、`notification`）を部分更新すると、
同じ親キー配下の他フィールドが消失するバグが将来顕在化するリスクがある。
`deepMerge` 関数を `storeHandlers.ts` 内に実装することで、
配列は上書き・`null` は上書き・`undefined` は省略という一貫したマージ戦略を確立する。

## SubAgentチーム編成

| SubAgent | 担当         | 責務                                               |
| -------- | ------------ | -------------------------------------------------- |
| A        | ロジック設計 | deepMerge 関数の設計・配置・再帰適用ルール策定     |
| B        | IPC 契約設計 | settings:update ハンドラの入出力型・契約確認       |
| C        | テスト戦略   | TDD アプローチで Red→Green のテスト追加計画策定    |
| D        | 統合監査     | 依存整合マトリクス・型安全性・後方互換性の最終確認 |

## 実行タスク

- **アーキテクチャ設計**: deepMerge 関数の配置（`storeHandlers.ts` 内）と `settings:update` ハンドラの修正方針を決定する
- **IPC 契約設計**: `settings:update` ハンドラの入力型（`Record<string, unknown>`）と出力型（`{ success: boolean; error?: string }`）を確定する
- **テスト戦略策定**: TDD アプローチでネスト更新パターン3ケース（ネスト保持・トップレベル上書き・配列上書き）のテスト追加計画を策定する
- **依存整合マトリクス**: `UserSettings` 型と `deepMerge` 戦略の型安全性を検証する

## 参照資料

### 前Phase成果物

| 資料名       | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     |

### 対象ファイル

| 資料名                | パス                                                                  | 用途                 |
| --------------------- | --------------------------------------------------------------------- | -------------------- |
| storeHandlers.ts      | `apps/desktop/src/main/ipc/storeHandlers.ts`                          | 変更対象ファイル確認 |
| storeHandlers.test.ts | `apps/desktop/src/main/ipc/storeHandlers.test.ts`                     | 既存テスト構造確認   |
| タスク指示書          | `docs/30-workflows/unassigned-task/task-store-settings-deep-merge.md` | 要件・アプローチ確認 |
| IPC チャネル定義      | `apps/desktop/src/preload/channels.ts`                                | チャネル名確認       |

## 設計詳細

### 関心ごとの設計分離テーブル（concern 別）

| concern                  | 対象                                              | 設計内容                                                                         |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| deepMerge 関数           | `storeHandlers.ts` 内のプライベート関数として配置 | 再帰マージロジック（オプションA: 最小依存）                                      |
| settings:update ハンドラ | `registerUserSettingsHandlers` 内                 | `{ ...current, ...updates }` を `deepMerge(current, updates)` に置き換え         |
| テスト追加               | `storeHandlers.test.ts`                           | `registerUserSettingsHandlers` を使用するネスト更新パターン 3 ケースを追加する   |
| 型安全性                 | `Record<string, unknown>` 制約内                  | `deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T` |

### deepMerge 戦略の詳細設計

#### オプションA（採用）: 再帰マージ関数を `storeHandlers.ts` 内に実装

**採用理由**:

1. **最小依存**: lodash 等の外部ライブラリを追加せず、既存ファイル内で完結する
2. **型安全性**: ジェネリック型制約 `T extends Record<string, unknown>` で型を保持する
3. **テスト容易性**: 純粋関数のため単体テストが容易
4. **スコープ適合**: 本タスクのスコープは `storeHandlers.ts` の修正のみ

#### マージルール

| 値の型                                | 基底値の型               | マージ動作             |
| ------------------------------------- | ------------------------ | ---------------------- |
| プレーンオブジェクト                  | プレーンオブジェクト     | 再帰的にマージ         |
| 配列                                  | 任意                     | 上書き（マージしない） |
| `null`                                | 任意                     | 上書き（null を設定）  |
| `undefined`                           | 任意                     | 省略（基底値を維持）   |
| プリミティブ（string/number/boolean） | 任意                     | 上書き                 |
| プレーンオブジェクト                  | 配列・プリミティブ・null | 上書き                 |

#### 実装設計

```typescript
/**
 * ディープマージ関数
 * - 配列は上書き（マージしない）
 * - null は上書き扱い
 * - undefined は省略（基底値を維持）
 * - プレーンオブジェクト同士は再帰的にマージ
 */
function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const overrideVal = override[key];
    // undefined は省略（基底値を維持）
    if (overrideVal === undefined) continue;
    const baseVal = base[key];
    if (
      overrideVal !== null &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal) &&
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      // プレーンオブジェクト同士：再帰マージ
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      // それ以外（配列・null・プリミティブ）：上書き
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}
```

#### `settings:update` ハンドラの変更（before/after）

```typescript
// 変更前（シャローマージのみ）
const current = getStore().get(USER_SETTINGS_STORE_KEY, {}) as Record<
  string,
  unknown
>;
getStore().set(USER_SETTINGS_STORE_KEY, { ...current, ...updates });

// 変更後（ディープマージ対応）
const current = getStore().get(USER_SETTINGS_STORE_KEY, {}) as Record<
  string,
  unknown
>;
getStore().set(USER_SETTINGS_STORE_KEY, deepMerge(current, updates));
```

### IPC 契約確認（4層整合性チェック）

| 層            | 対象ファイル                                 | チャネル                  | 確認内容                                                           |
| ------------- | -------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| Shared 定数   | `packages/shared/src/ipc/channels.ts`        | `USER_SETTINGS_UPDATE`    | チャネル文字列 `settings:update` が定義されていること              |
| Preload       | `apps/desktop/src/preload/channels.ts`       | `ALLOWED_INVOKE_CHANNELS` | `settings:update` がホワイトリストに含まれていること               |
| Main ハンドラ | `apps/desktop/src/main/ipc/storeHandlers.ts` | `ipcMain.handle`          | `IPC_CHANNELS.USER_SETTINGS_UPDATE` でハンドラが登録されていること |
| Preload API   | `apps/desktop/src/preload/index.ts` 等       | `settings.update()`       | Renderer からの invoke が正しく定義されていること                  |

#### ハンドラ入出力型

| 項目         | 型                                  | 説明                                   |
| ------------ | ----------------------------------- | -------------------------------------- |
| 入力         | `Record<string, unknown>`           | 部分更新ペイロード（undefined は省略） |
| 出力（成功） | `{ success: true }`                 | マージ成功                             |
| 出力（失敗） | `{ success: false; error: string }` | エラー発生時のメッセージ               |

## 実行手順

### 1. 対象ファイルの現状確認

```bash
# storeHandlers.ts の settings:update ハンドラ現状確認
grep -n "USER_SETTINGS_UPDATE\|deepMerge\|userSettings\|user-settings" \
  apps/desktop/src/main/ipc/storeHandlers.ts

# storeHandlers.test.ts の既存テスト確認
grep -n "USER_SETTINGS\|settings" \
  apps/desktop/src/main/ipc/storeHandlers.test.ts
```

### 2. deepMerge 戦略の確定

- 配列上書き・null 上書き・undefined 省略のルールをレビューして確定する
- 設計書（本ドキュメント）に記載の `deepMerge` 実装設計をベースとする

### 3. IPC 契約の確認

```bash
# チャネル定義確認
grep -n "USER_SETTINGS_UPDATE\|settings:update" \
  packages/shared/src/ipc/channels.ts apps/desktop/src/preload/channels.ts
```

### 4. テスト戦略の策定

追加するテストケース（TDD: Red→Green の順で作成）:

| テストケース | 検証内容                                   | 期待動作                                   |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| ネスト保持   | 親キー `theme` に `color` のみ送信         | `size` フィールドが保持されること          |
| トップレベル | トップレベルフィールド `lang` を上書き     | 他のトップレベルフィールドが保持されること |
| 配列上書き   | `tags: ["a", "b"]` を `tags: ["c"]` で更新 | `["c"]` で完全上書きされること             |

### 5. 依存整合マトリクスの検証

```bash
# UserSettings 型定義の確認
grep -rn "UserSettings" \
  packages/shared/src/ apps/desktop/src/

# 型チェック（変更前の確認）
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携

| 判定項目             | 基準    | 結果    |
| -------------------- | ------- | ------- |
| ユニットテストLine   | 80%+    | pending |
| ユニットテストBranch | 60%+    | pending |
| 型チェック           | PASS    | pending |
| lint                 | 0 error | pending |

## 多角的チェック観点

| 観点             | チェック内容                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| 後方互換性       | 既存の `registerUserSettingsHandlers` 呼び出し元に影響がないこと                                               |
| 型安全性         | `deepMerge<T extends Record<string, unknown>>` ジェネリック制約が `Record<string, unknown>` 引数と整合すること |
| マージ戦略一貫性 | 配列上書き・null 上書き・undefined 省略のルールがコードとテストで一致していること                              |
| パフォーマンス   | 再帰マージは設定オブジェクト（小規模）のみ対象のため、パフォーマンス問題は発生しないこと                       |
| セキュリティ     | `deepMerge` は `USER_SETTINGS_STORE_KEY` 配下のみに適用され、ストアキー名の改ざんは別の検証層で防ぐこと        |

## 成果物

| 成果物               | パス                                               | 説明                                            |
| -------------------- | -------------------------------------------------- | ----------------------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`           | deepMerge 関数配置・storeHandlers.ts 修正方針   |
| IPC 契約設計書       | `outputs/phase-2/ipc-contract-design.md`           | settings:update ハンドラ入出力型・4層整合性確認 |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`                 | TDD アプローチ・追加テストケース 3 ケースの詳細 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | UserSettings 型・deepMerge 型安全性検証結果     |

## 完了条件

- [ ] deepMerge 関数の配置方針（storeHandlers.ts 内プライベート関数）が確定している
- [ ] マージルール（配列上書き・null 上書き・undefined 省略・再帰適用条件）が設計書に明記されている
- [ ] `settings:update` ハンドラの変更前後（before/after）のコードが設計書に明記されている
- [ ] IPC 契約（入力型・出力型）が確定している
- [ ] 4層整合性チェック（Shared/Preload/Main/API）の確認方針が定義されている
- [ ] 追加テストケース 3 ケースの内容が設計書に明記されている
- [ ] 依存整合マトリクス（型安全性検証）が定義されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 対象ファイル（storeHandlers.ts / storeHandlers.test.ts）の現状確認
2. deepMerge アーキテクチャ設計（オプションA 採用確定・実装設計）
3. IPC 契約設計（入出力型・4層整合性チェック）
4. テスト戦略策定（3ケース詳細計画）
5. 依存整合マトリクス作成（UserSettings 型・型安全性）
6. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビューゲート
