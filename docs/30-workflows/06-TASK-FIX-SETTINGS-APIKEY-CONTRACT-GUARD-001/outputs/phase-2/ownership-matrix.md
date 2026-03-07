# Phase 2 成果物: 責務分担表

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-07                                     |

## 1. 既実装 / 追加変更 分離マトリクス

### Renderer 層

| ファイル                   | 責務                                      | 既実装（PR #1036/#1038）                       | 追加変更（本タスク）                                                        | GAP 対応   |
| -------------------------- | ----------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| `ApiKeysSection/index.tsx` | `window.electronAPI?.apiKey` 存在チェック | DEF-02: optional chaining で存在確認           | 変更なし                                                                    | --         |
| `ApiKeysSection/index.tsx` | `providers` 配列チェック                  | DEF-01: `Array.isArray(result.data.providers)` | `normalizeProviders` 関数に統合し、`data` nullish 吸収 + 要素フィルタを追加 | GAP-01, 03 |
| `ApiKeysSection/index.tsx` | 空配列フィードバック                      | なし                                           | 空配列時のメッセージ表示ロジック追加                                        | GAP-02     |
| `ApiKeysSection/index.tsx` | Promise rejection ハンドリング            | なし                                           | `fetchProviders` の try-catch ラップ + エラー state                         | GAP-04     |
| `ApiKeysSection.test.tsx`  | 異常系テスト                              | RED-01〜RED-03b（6ケース）                     | GAP-01〜04 テストケース追加                                                 | AC-07      |

### Main Process 層

| ファイル             | 責務                         | 既実装                                   | 追加変更（本タスク）                                                           | GAP 対応 |
| -------------------- | ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| `apiKeyHandlers.ts`  | `apiKey:list` レスポンス生成 | providers をそのまま返却                 | `Array.isArray(result.providers)` チェック追加、非配列時は空配列フォールバック | GAP-05   |
| `profileHandlers.ts` | `identities` 配列防御        | `identities ?? []`（nullish coalescing） | `Array.isArray(identities) ? identities : []` に変更                           | GAP-06   |

### Shared / Preload 層

| ファイル                    | 責務                             | 既実装   | 追加変更（本タスク） | GAP 対応 |
| --------------------------- | -------------------------------- | -------- | -------------------- | -------- |
| `ProviderStatus` 型定義     | providers 要素の型               | 定義済み | 変更なし             | --       |
| `ProviderListResult` 型定義 | list レスポンスの data 型        | 定義済み | 変更なし             | --       |
| Preload `apiKey.ts`         | `safeInvoke` 経由の IPC 呼び出し | 実装済み | 変更なし             | --       |

## 2. 変更オーナーシップ

| 変更 ID | ファイル                                                | オーナー                | レビューア              | 優先度 |
| ------- | ------------------------------------------------------- | ----------------------- | ----------------------- | ------ |
| CHG-01  | `ApiKeysSection/index.tsx` -- `normalizeProviders` 追加 | SubAgent-Renderer-Guard | SubAgent-Lead-Sync      | High   |
| CHG-02  | `ApiKeysSection/index.tsx` -- 空配列フィードバック      | SubAgent-Renderer-Guard | SubAgent-Test-Fallback  | Medium |
| CHG-03  | `ApiKeysSection/index.tsx` -- try-catch ラップ          | SubAgent-Renderer-Guard | SubAgent-Lead-Sync      | High   |
| CHG-04  | `ApiKeysSection.test.tsx` -- GAP-01〜04 テスト          | SubAgent-Test-Fallback  | SubAgent-Renderer-Guard | High   |
| CHG-05  | `apiKeyHandlers.ts` -- providers バリデーション         | SubAgent-Contract-IPC   | SubAgent-Lead-Sync      | Medium |
| CHG-06  | `profileHandlers.ts` -- パターン統一                    | SubAgent-Contract-IPC   | SubAgent-Lead-Sync      | Low    |

## 3. 依存関係

```
CHG-01 (normalizeProviders) ← CHG-04 (テスト) : テスト対象
CHG-02 (空配列表示)         ← CHG-04 (テスト) : テスト対象
CHG-03 (try-catch)          ← CHG-04 (テスト) : テスト対象
CHG-05 (Main バリデーション) : 独立（Renderer 変更に依存しない）
CHG-06 (profileHandlers)    : 独立（他の変更に依存しない）
```

## 4. 既実装テストとの互換性

| 既存テスト ID | テスト内容                           | 本タスクの変更による影響                                                    |
| ------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| RED-01        | providers が非配列の場合             | `normalizeProviders` に統合されるが、同じ動作（空配列フォールバック）を維持 |
| RED-02        | `window.electronAPI` が未定義        | 影響なし（DEF-02 の既存チェックで処理）                                     |
| RED-03a       | `window.electronAPI.apiKey` が未定義 | 影響なし（DEF-02 の既存チェックで処理）                                     |
| RED-03b       | `window.electronAPI` が部分的に定義  | 影響なし（DEF-02 の既存チェックで処理）                                     |
