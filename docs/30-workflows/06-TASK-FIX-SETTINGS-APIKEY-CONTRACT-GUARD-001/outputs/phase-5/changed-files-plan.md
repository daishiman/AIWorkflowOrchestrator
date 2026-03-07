# Phase 5: 変更ファイル計画

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスク ID | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| Phase     | 5 - 実装                                    |
| 作成日    | 2026-03-07                                  |

## 変更ファイル一覧

| ファイル                                                                 | 変更内容                                                                                                      | Gap ID                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                            | providers に `Array.isArray` バリデーション追加                                                               | GAP-05                         |
| `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx` | `rawProviders.filter()` に type predicate 追加、`Array.isArray(result?.data?.providers)` による安全な配列取得 | GAP-01, GAP-03                 |
| `apps/desktop/src/main/ipc/profileHandlers.ts`                           | `identities ?? []` を `Array.isArray(identities) ? identities : []` に統一（3箇所）                           | GAP-06                         |
| `apps/desktop/src/renderer/components/settings/ApiKeysSection.test.tsx`  | GAP-TEST-01 から GAP-TEST-04 のテスト7件追加                                                                  | GAP-01, GAP-02, GAP-03, GAP-04 |

## 変更詳細

### 1. apiKeyHandlers.ts（GAP-05）

**変更種別**: バリデーション追加

**変更前の問題**:

- `apiKey:list` ハンドラが外部サービスから取得した providers をそのまま Renderer に返却
- providers が配列でない場合（undefined, null, オブジェクト等）にクラッシュのリスク

**変更内容**:

- レスポンスの providers フィールドに `Array.isArray()` チェックを追加
- 非配列値の場合は空配列 `[]` にフォールバック

**影響範囲**: `apiKey:list` IPC ハンドラのレスポンス生成部分のみ

---

### 2. ApiKeysSection/index.tsx（GAP-01, GAP-03）

**変更種別**: 防御的プログラミング追加

**変更前の問題**:

- `result.data.providers` に対する non-null assertion または直接アクセス
- malformed な要素（null, undefined, フィールド欠損）がフィルタされずに `.map()` に渡される

**変更内容**:

- `Array.isArray(result?.data?.providers)` による安全な配列取得
- type predicate 関数による要素レベルのバリデーション
  - `typeof element === "object"` かつ `element !== null`
  - `"provider" in element` かつ `typeof element.provider === "string"`
  - `"status" in element` かつ `typeof element.status === "string"`
- フィルタを通過した要素のみを後続の表示ロジックに渡す

**影響範囲**: providers データの取得・正規化ロジック

---

### 3. profileHandlers.ts（GAP-06）

**変更種別**: パターン統一

**変更前の問題**:

- `identities ?? []` は null/undefined のみフォールバックし、非配列値（数値、文字列等）を通過させる
- apiKeyHandlers.ts の `Array.isArray` パターンと不統一

**変更内容**:

- 3箇所の `identities ?? []` を `Array.isArray(identities) ? identities : []` に置換

**影響範囲**: `profile:list`, `profile:get`, `profile:update` ハンドラの identities 処理

---

### 4. ApiKeysSection.test.tsx（GAP-01 から GAP-04）

**変更種別**: テスト追加

**追加テスト数**: 7件

| テスト ID    | テスト名                                           | 検証内容                               |
| ------------ | -------------------------------------------------- | -------------------------------------- |
| GAP-TEST-01  | result.data が undefined の場合クラッシュしない    | 全4プロバイダーが「未登録」で表示      |
| GAP-TEST-01b | result.data が null の場合クラッシュしない         | 全4プロバイダーが「未登録」で表示      |
| GAP-TEST-02  | providers が空配列の場合全プロバイダーが未登録表示 | ALL_PROVIDERS.map() による表示確認     |
| GAP-TEST-03  | provider フィールド欠損要素がフィルタされる        | 正常要素のみ表示                       |
| GAP-TEST-03b | status フィールド欠損要素がフィルタされる          | 正常要素のみ表示                       |
| GAP-TEST-03c | null/undefined/数値/文字列混在でフィルタされる     | 正常要素のみ表示                       |
| GAP-TEST-04  | apiKey.list() reject 時にエラー表示                | エラーメッセージ表示、クラッシュしない |

**影響範囲**: テストファイルのみ（プロダクションコードへの影響なし）

## 変更しないファイル（確認のみ）

| ファイル                                                                 | 確認内容                                                                 | Gap ID |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------ |
| `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx` | `ALL_PROVIDERS.map()` による空配列時の UI フォールバックが既存で対応済み | GAP-02 |
| `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx` | 既存の catch 節による reject ハンドリングが対応済み                      | GAP-04 |

## Gap ID と変更ファイルの対応マトリクス

| Gap ID | apiKeyHandlers.ts | ApiKeysSection/index.tsx | profileHandlers.ts | ApiKeysSection.test.tsx |
| ------ | ----------------- | ------------------------ | ------------------ | ----------------------- |
| GAP-01 |                   | x                        |                    | x                       |
| GAP-02 |                   | (確認のみ)               |                    | x                       |
| GAP-03 |                   | x                        |                    | x                       |
| GAP-04 |                   | (確認のみ)               |                    | x                       |
| GAP-05 | x                 |                          |                    |                         |
| GAP-06 |                   |                          | x                  |                         |
