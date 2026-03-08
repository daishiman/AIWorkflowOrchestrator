# Phase 5: 変更ファイル計画

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスク ID  | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| Phase      | 5 - 実装                                    |
| 作成日     | 2026-03-07                                  |
| 更新日     | 2026-03-08                                  |
| ステータス | 実装完了                                    |

## 変更ファイル一覧

| #   | ファイル                                                                 | 変更種別             | Gap ID                         |
| --- | ------------------------------------------------------------------------ | -------------------- | ------------------------------ |
| 1   | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                            | バリデーション追加   | GAP-05                         |
| 2   | `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx` | 防御的プログラミング | GAP-01, GAP-03                 |
| 3   | `apps/desktop/src/main/ipc/profileHandlers.ts`                           | パターン統一         | GAP-06                         |
| 4   | `apps/desktop/src/renderer/components/settings/ApiKeysSection.test.tsx`  | テスト追加           | GAP-01, GAP-02, GAP-03, GAP-04 |
| 5   | `apps/desktop/src/main/ipc/apiKeyHandlers.list.test.ts`                  | テスト新規作成       | GAP-05                         |
| 6   | `apps/desktop/src/main/ipc/profileHandlers.identities.test.ts`           | テスト新規作成       | GAP-06                         |

## 変更詳細

### 1. apiKeyHandlers.ts（GAP-05）

**変更種別**: バリデーション追加

**変更前の問題**:

- `apiKey:list` ハンドラが外部サービスから取得した providers をそのまま Renderer に返却
- providers が配列でない場合（undefined, null, オブジェクト等）にクラッシュのリスク

**変更内容**:

- レスポンスの providers フィールドに `Array.isArray()` チェックを追加
- 非配列値の場合は空配列 `[]` にフォールバック
- `registeredCount` を providers 配列から再計算（`status === "active"` のカウント）

**変更関数**: `apiKey:list` ハンドラ内のレスポンス生成ロジック

**影響範囲**: `apiKey:list` IPC ハンドラのレスポンス生成部分のみ

---

### 2. ApiKeysSection/index.tsx（GAP-01, GAP-03）

**変更種別**: 防御的プログラミング追加

**変更前の問題**:

- `result.data.providers` に対する直接アクセスで data が undefined/null の場合クラッシュ
- malformed な要素（null, undefined, フィールド欠損）がフィルタされずに `.map()` に渡される

**変更内容**:

- `result?.data` の optional chaining による安全なアクセス
- `Array.isArray(result?.data?.providers)` による安全な配列取得
- type predicate 関数による要素レベルのバリデーション（P49 準拠: `in` 演算子使用）
  - `typeof element === "object"` かつ `element !== null`
  - `"provider" in element` かつ `typeof element.provider === "string"`
  - `"status" in element` かつ `typeof element.status === "string"`
- フィルタを通過した要素のみを後続の表示ロジックに渡す
- `window.electronAPI?.apiKey` の存在チェック
- try-catch で `apiKey.list()` の rejection をハンドリング

**変更関数**: providers データ取得・正規化ロジック（インラインフィルタ）

**影響範囲**: providers データの取得・正規化ロジック

---

### 3. profileHandlers.ts（GAP-06）

**変更種別**: パターン統一

**変更前の問題**:

- `identities ?? []` は null/undefined のみフォールバックし、非配列値（数値、文字列等）を通過させる
- apiKeyHandlers.ts の `Array.isArray` パターンと不統一

**変更内容**:

- 3箇所の `identities ?? []` を `Array.isArray(identities) ? identities : []` に置換

**変更箇所（3箇所）**:

1. `profile:list` ハンドラ内の identities フォールバック
2. `profile:get` ハンドラ内の identities フォールバック
3. `profile:update` ハンドラ内の identities フォールバック

**影響範囲**: 上記3ハンドラの identities 処理

---

### 4. ApiKeysSection.test.tsx（GAP-01 ~ GAP-04）

**変更種別**: テスト追加（既存ファイル）

**追加テスト数**: 7件（既存テストと合わせて計46件）

| テスト ID    | テスト名                                           | 検証内容                               |
| ------------ | -------------------------------------------------- | -------------------------------------- |
| GAP-TEST-01  | result.data が undefined の場合クラッシュしない    | 全4プロバイダーが「未登録」で表示      |
| GAP-TEST-01b | result.data が null の場合クラッシュしない         | 全4プロバイダーが「未登録」で表示      |
| GAP-TEST-02  | providers が空配列の場合全プロバイダーが未登録表示 | ALL_PROVIDERS.map() による表示確認     |
| GAP-TEST-03  | provider フィールド欠損要素がフィルタされる        | 正常要素のみ表示                       |
| GAP-TEST-03b | status フィールド欠損要素がフィルタされる          | 正常要素のみ表示                       |
| GAP-TEST-03c | null/undefined/数値/文字列混在でフィルタされる     | 正常要素のみ表示                       |
| GAP-TEST-04  | apiKey.list() reject 時にエラー表示                | エラーメッセージ表示、クラッシュしない |

---

### 5. apiKeyHandlers.list.test.ts（GAP-05）

**変更種別**: テスト新規作成

**テスト数**: 7件

| テスト ID    | テスト名                                       | 検証内容                         |
| ------------ | ---------------------------------------------- | -------------------------------- |
| GAP-TEST-05a | providers が null -> 空配列フォールバック      | 空配列 + registeredCount = 0     |
| GAP-TEST-05b | providers が undefined -> 空配列フォールバック | 空配列 + registeredCount = 0     |
| GAP-TEST-05c | providers が非配列 -> 空配列フォールバック     | 文字列入力時の安全処理           |
| GAP-TEST-05d | listProviders が null -> 空配列フォールバック  | null 全体のフォールバック        |
| GAP-TEST-05e | 正常配列 -> registeredCount 再計算             | active カウントの正確性          |
| GAP-TEST-05f | status 欠損 -> registered にカウントされない   | 不完全要素の除外確認             |
| GAP-TEST-05g | listProviders 例外 -> エラーレスポンス         | 例外時の安全なエラーハンドリング |

---

### 6. profileHandlers.identities.test.ts（GAP-06）

**変更種別**: テスト新規作成

**テスト数**: 6件

| テスト ID    | テスト名                                      | 検証内容                         |
| ------------ | --------------------------------------------- | -------------------------------- |
| GAP-TEST-06a | GET_PROVIDERS: identities null -> 空配列      | null フォールバック              |
| GAP-TEST-06b | GET_PROVIDERS: identities undefined -> 空配列 | undefined フォールバック         |
| GAP-TEST-06c | GET_PROVIDERS: identities 非配列 -> 空配列    | 非配列フォールバック             |
| GAP-TEST-06d | GET_PROVIDERS: 正常配列 -> プロバイダー一覧   | 正常系の動作確認                 |
| GAP-TEST-06e | UNLINK: identities null -> エラー             | null 時のエラーハンドリング      |
| GAP-TEST-06f | UNLINK: identities undefined -> エラー        | undefined 時のエラーハンドリング |

## 変更しないファイル（確認のみ）

| ファイル                                                                 | 確認内容                                                                 | Gap ID |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------ |
| `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx` | `ALL_PROVIDERS.map()` による空配列時の UI フォールバックが既存で対応済み | GAP-02 |
| `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx` | 既存の catch 節による reject ハンドリングが対応済み                      | GAP-04 |

## Gap ID と変更ファイルの対応マトリクス

| Gap ID | apiKeyHandlers.ts | ApiKeysSection/index.tsx | profileHandlers.ts | ApiKeysSection.test.tsx | apiKeyHandlers.list.test.ts | profileHandlers.identities.test.ts |
| ------ | ----------------- | ------------------------ | ------------------ | ----------------------- | --------------------------- | ---------------------------------- |
| GAP-01 |                   | x                        |                    | x                       |                             |                                    |
| GAP-02 |                   | (確認のみ)               |                    | x                       |                             |                                    |
| GAP-03 |                   | x                        |                    | x                       |                             |                                    |
| GAP-04 |                   | (確認のみ)               |                    | x                       |                             |                                    |
| GAP-05 | x                 |                          |                    |                         | x                           |                                    |
| GAP-06 |                   |                          | x                  |                         |                             | x                                  |

## 変更量の概算

| ファイル                           | 追加行 | 削除行 | 変更種別                     |
| ---------------------------------- | ------ | ------ | ---------------------------- |
| apiKeyHandlers.ts                  | ~10    | ~2     | バリデーション追加           |
| ApiKeysSection/index.tsx           | ~15    | ~5     | フィルタ + optional chaining |
| profileHandlers.ts                 | ~3     | ~3     | パターン置換（3箇所）        |
| ApiKeysSection.test.tsx            | ~80    | 0      | テスト7件追加                |
| apiKeyHandlers.list.test.ts        | ~120   | 0      | テストファイル新規作成       |
| profileHandlers.identities.test.ts | ~100   | 0      | テストファイル新規作成       |
