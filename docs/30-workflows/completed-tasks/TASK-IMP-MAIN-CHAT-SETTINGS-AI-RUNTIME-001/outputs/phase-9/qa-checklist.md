# Phase 9: QA チェックリスト

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 9                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | qa-checklist.md                            |
| 作成日   | 2026-03-17                                 |

---

## 1. 品質検証方針

Phase 5-8 の実装・リファクタリング完了後、以下の品質基準を満たすことを検証する。

- **自動検証**: Lint / TypeCheck / テスト / カバレッジの全パスを確認
- **コードレビュー**: セキュリティ・パフォーマンス・IPC 契約遵守を確認
- **落とし穴チェック**: P42/P48/P31/P5/P54/P61 の既知パターンに対する確認
- **Settings 3領域契約確認**: 認証方式カード同期、SDK APIキー guidance、APIキー一覧矛盾許容なし

---

## 2. 自動検証チェックリスト

### 2.1 Lint チェック

| チェック項目                 | コマンド                                       | 合格基準    | 結果 |
| ---------------------------- | ---------------------------------------------- | ----------- | ---- |
| ESLint（shared パッケージ）  | `pnpm --filter @repo/shared lint`              | エラー 0 件 | -    |
| ESLint（desktop パッケージ） | `pnpm --filter @repo/desktop lint`             | エラー 0 件 | -    |
| Prettier フォーマット確認    | `pnpm --filter @repo/desktop prettier --check` | 差分 0 件   | -    |
| 未使用 import 検出           | ESLint `no-unused-vars` ルール                 | 警告 0 件   | -    |

### 2.2 TypeScript 型チェック

| チェック項目                    | コマンド                                | 合格基準          | 結果 |
| ------------------------------- | --------------------------------------- | ----------------- | ---- |
| shared 型チェック               | `pnpm --filter @repo/shared typecheck`  | エラー 0 件       | -    |
| desktop 型チェック              | `pnpm --filter @repo/desktop typecheck` | エラー 0 件       | -    |
| `as` キャスト残存チェック       | `grep -rn " as " apps/desktop/src/`     | 新規追加分が 0 件 | -    |
| non-null assertion 残存チェック | `grep -rn "!\." apps/desktop/src/`      | 新規追加分が 0 件 | -    |

### 2.3 テスト実行

| テスト対象                  | コマンド                                                             | 合格基準      | 結果 |
| --------------------------- | -------------------------------------------------------------------- | ------------- | ---- |
| shared ユニットテスト       | `pnpm --filter @repo/shared test`                                    | 全テスト PASS | -    |
| desktop ユニットテスト      | `cd apps/desktop && pnpm vitest run`                                 | 全テスト PASS | -    |
| ChatView テスト             | `cd apps/desktop && pnpm vitest run src/renderer/views/ChatView`     | 全テスト PASS | -    |
| SettingsView テスト         | `cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView` | 全テスト PASS | -    |
| aiHandlers テスト           | `cd apps/desktop && pnpm vitest run src/main/handlers/aiHandlers`    | 全テスト PASS | -    |
| llm ハンドラテスト          | `cd apps/desktop && pnpm vitest run src/main/handlers/llm`           | 全テスト PASS | -    |
| authMode ハンドラテスト     | `cd apps/desktop && pnpm vitest run src/main/handlers/authMode`      | 全テスト PASS | -    |
| systemPrompt ハンドラテスト | `cd apps/desktop && pnpm vitest run src/main/handlers/systemPrompt`  | 全テスト PASS | -    |

### 2.4 カバレッジ確認

| 対象                     | コマンド                                        | 合格基準                   | 結果 |
| ------------------------ | ----------------------------------------------- | -------------------------- | ---- |
| desktop カバレッジ       | `cd apps/desktop && pnpm vitest run --coverage` | Line: 80%+, Function: 80%+ | -    |
| chatSlice カバレッジ     | カバレッジレポートで確認                        | Branch: 60%+               | -    |
| llmSlice カバレッジ      | カバレッジレポートで確認                        | Branch: 60%+               | -    |
| authModeSlice カバレッジ | カバレッジレポートで確認                        | Branch: 60%+               | -    |

---

## 3. コードレビューチェックリスト

### 3.1 セキュリティ

| チェック項目                                             | 確認方法                                    | 結果 |
| -------------------------------------------------------- | ------------------------------------------- | ---- |
| IPC ハンドラで送信元ウィンドウを検証しているか           | `validateIpcSender` 呼び出しの確認          | -    |
| IPC 引数のバリデーションが Main 側で実施されているか     | 各ハンドラの入力検証コードを確認            | -    |
| API キー / トークンがログに出力されていないか            | `console.log` / `logger.debug` の引数を確認 | -    |
| エラーメッセージに内部パスが含まれていないか（P55 対策） | `sanitizeErrorMessage()` の適用を確認       | -    |
| `contextIsolation: true` が維持されているか              | `BrowserWindow` 設定の確認                  | -    |
| `nodeIntegration: false` が維持されているか              | `BrowserWindow` 設定の確認                  | -    |
| `sandbox: true` が維持されているか                       | `BrowserWindow` 設定の確認                  | -    |
| IPC チャンネル名がホワイトリストで管理されているか       | `IPC_CHANNELS` 定数定義の確認               | -    |
| パストラバーサル攻撃対策が Main 側で実施されているか     | IPC 引数のパス検証コードを確認              | -    |

### 3.2 パフォーマンス

| チェック項目                                                | 確認方法                                        | 結果 |
| ----------------------------------------------------------- | ----------------------------------------------- | ---- |
| `apiKey.validate()` にデバウンス（300ms）が実装されているか | Renderer コンポーネントのデバウンスコードを確認 | -    |
| Zustand セレクタで不要な再レンダリングが発生していないか    | P31/P48 対策が適用されているか確認              | -    |
| `useShallow` が派生セレクタに適用されているか（P48 対策）   | フィルタ系セレクタへの `useShallow` 適用を確認  | -    |
| health check 呼び出しが重複していないか                     | `AI_CHECK_CONNECTION` 参照がないことを確認      | -    |

### 3.3 アクセシビリティ

| チェック項目                                  | 確認方法                                      | 結果 |
| --------------------------------------------- | --------------------------------------------- | ---- |
| Access Capability Card に ARIA ラベルがあるか | コンポーネントの `aria-label` / `role` を確認 | -    |
| エラー状態のカラーコントラストが 4.5:1 以上か | `systemRed` (#FF3B30) のコントラスト確認      | -    |
| キーボード操作でフォームが操作できるか        | `tabIndex` の設定を確認                       | -    |
| ダークモード対応が両モードで動作するか        | CSS 変数 (`--status-*`) の適用を確認          | -    |

### 3.4 IPC 契約遵守

| チェック項目                                                               | 確認方法                                                       | 結果 |
| -------------------------------------------------------------------------- | -------------------------------------------------------------- | ---- |
| `AI_CHAT` が `providerId/modelId` を常に明示送信しているか（GAP-01/03）    | ChatView の送信コードを確認                                    | -    |
| `llm:check-health` のみが health check に使用されているか（DRIFT-4）       | `AI_CHECK_CONNECTION` の参照がないことを確認                   | -    |
| `authMode` 系チャンネルが `ready/blocked/unavailable` 語彙を使用しているか | IPC 引数・レスポンスを確認                                     | -    |
| IPC チャンネル名が `IPC_CHANNELS` 定数を参照しているか（P27）              | `grep -rn "safeInvoke\|safeOn" \| grep -v IPC_CHANNELS` で確認 | -    |
| IPC ハンドラ引数に `.trim()` バリデーションが含まれているか（P42）         | 文字列引数の3段バリデーションを確認                            | -    |

---

## 4. 既知落とし穴チェック

### 4.1 P42: 文字列引数の `.trim()` バリデーション漏れ

| 対象ハンドラ              | 確認内容                                            | 結果 |
| ------------------------- | --------------------------------------------------- | ---- |
| `authMode:set`            | 引数に `.trim() === ""` チェックがあるか            | -    |
| `llm:set-selected-config` | `providerId`, `modelId` に3段バリデーションがあるか | -    |
| `auth-key:set`            | `key` 文字列に `.trim()` チェックがあるか           | -    |
| `api-key:set`             | `key` 文字列に `.trim()` チェックがあるか           | -    |
| `system-prompt:save`      | `title`, `content` に `.trim()` チェックがあるか    | -    |

### 4.2 P48: non-null assertion 残存チェック

```bash
# 実行コマンド（実装完了後に確認）
grep -rn "!\." apps/desktop/src/main/handlers/
grep -rn "!\." apps/desktop/src/renderer/views/
grep -rn "!\." apps/desktop/src/renderer/components/
```

| 確認内容                                          | 合格基準 | 結果 |
| ------------------------------------------------- | -------- | ---- |
| `systemPromptHandlers.ts` に `!` が残っていないか | 0 件     | -    |
| `aiHandlers.ts` に `!` が残っていないか           | 0 件     | -    |
| `ChatView` に `!` が残っていないか                | 0 件     | -    |

### 4.3 P31: Zustand Store Hooks 無限ループ

| 確認内容                                                             | 確認方法                                               | 結果 |
| -------------------------------------------------------------------- | ------------------------------------------------------ | ---- |
| `useAuthModeStore()` の戻り値を `useEffect` 依存配列に含めていないか | 個別セレクタ（`useAuthMode()` 等）の使用を確認         | -    |
| `useLLMStore()` の戻り値を `useEffect` 依存配列に含めていないか      | 個別セレクタ（`useSelectedProvider()` 等）の使用を確認 | -    |
| 合成 Hook に `@deprecated` タグが付いているか                        | 型定義ファイルの確認                                   | -    |

### 4.4 P5: IPC リスナー二重登録

| 確認内容                                                  | 確認方法                                  | 結果 |
| --------------------------------------------------------- | ----------------------------------------- | ---- |
| `ipcMain.handle()` の二重登録がないか                     | `registerAllIpcHandlers()` パターンの確認 | -    |
| macOS `activate` イベントでハンドラが再登録されていないか | `app.on('activate')` の処理を確認         | -    |
| `unregisterAllIpcHandlers()` が登録前に呼ばれているか     | ハンドラ登録フローの確認                  | -    |

### 4.5 P54: safeRegister パターン適合確認

| 確認内容                                                                            | 確認方法                                             | 結果 |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ---- |
| 戻り値が必要なハンドラ登録関数が `safeRegister` を使用していないか                  | 戻り値を持つハンドラ（unsubscribe など）の実装を確認 | -    |
| `setupThemeWatcher` 等の戻り値を利用するハンドラが個別 try-catch で実装されているか | ハンドラ登録フローのソースコードを確認               | -    |

### 4.6 P61: IPC ハンドラ DIP 違反確認

| 確認内容                                                                               | 確認方法                                         | 結果 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ | ---- |
| IPC ハンドラ登録関数の引数型が具象クラスではなくインターフェース（Port）になっているか | `registerXxxHandlers(...)` の引数型を確認        | -    |
| `registerSafetyGateHandlers` 等が `SafetyGatePort` を引数に取っているか                | ハンドラ登録関数のシグネチャを確認               | -    |
| 新規追加ハンドラ登録関数が DIP 準拠になっているか                                      | Phase 5 で追加したハンドラ登録関数の引数型を確認 | -    |

---

## 5. Settings 3領域改善契約チェックリスト

### 5.1 認証方式カード同期

| 確認内容                                                                                                | 確認方法                                                  | 結果 |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---- |
| authMode の変更が Main → Renderer に即座に同期されるか                                                  | `authMode:status` / `authMode:changed` IPC イベントの確認 | -    |
| Access Capability Card の表示が `ready/missing-key/blocked/unavailable` の 4 状態を正しく表現しているか | コンポーネントのレンダリング分岐を確認                    | -    |
| ChatView の RuntimeBanner が authMode 変更に連動して更新されるか                                        | RuntimeBanner のセレクタと IPC リスナーの確認             | -    |

### 5.2 SDK APIキー guidance

| 確認内容                                                      | 確認方法                                                     | 結果 |
| ------------------------------------------------------------- | ------------------------------------------------------------ | ---- |
| SDK APIキー未設定時に適切な guidance メッセージが表示されるか | `AuthKeySection` / Access Capability Card の UI テストを確認 | -    |
| `auth-key:exists` が false の場合に設定誘導 UI が表示されるか | SettingsView の条件分岐レンダリングを確認                    | -    |
| guidance が `contextIsolation` 違反なしで実装されているか     | Renderer から Node.js API を使用していないことを確認         | -    |

### 5.3 APIキー一覧の矛盾許容なし

| 確認内容                                                                  | 確認方法                                                          | 結果 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---- |
| `api-key:list` と `api-key:validate` の結果が一致しているか               | 同一 provider の list 結果と validate 結果を比較                  | -    |
| Provider 一覧と API キー設定状態が整合しているか（DRIFT-3）               | `ApiKeysSection` と capability card の表示整合性を確認            | -    |
| API キー変更後に `clearInstance()` が呼ばれ、古いキャッシュが使われないか | `apiKeyHandlers.ts` の `clearInstance()` 呼び出しを確認（GAP-05） | -    |

---

## 6. Permission Settings チェックリスト

| 確認内容                                                                   | 確認方法                                              | 結果 |
| -------------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| `permission:getAllowedTools` が正しいツール一覧を返すか                    | IPC ハンドラのレスポンスを確認                        | -    |
| `permission:setAllowedTools` で許可状態が永続化されるか                    | `electron-store` への書き込みと再起動後の復元を確認   | -    |
| Permission Settings の変更が SafetyGate に即座に反映されるか               | `SafetyGatePort` の実装と IPC 同期を確認              | -    |
| Permission 変更時に `ipcMain.handle()` の二重登録が発生しないか（P5 対策） | `unregisterAllIpcHandlers()` が呼ばれていることを確認 | -    |

---

## 7. 品質ゲート判定基準

| 判定     | 条件                                         | 次のアクション                 |
| -------- | -------------------------------------------- | ------------------------------ |
| **PASS** | 全チェック項目が合格、カバレッジ基準を満たす | Phase 10（最終レビュー）へ進む |
| **WARN** | 警告が 1-3 件あるが機能に影響なし            | 警告対応後に Phase 10 へ進む   |
| **FAIL** | エラーが 1 件以上、またはカバレッジ基準未達  | 問題修正後に Phase 9 を再実施  |

### 必須合格項目（FAIL 判定のトリガー）

1. TypeScript 型エラーが 1 件以上
2. テスト失敗が 1 件以上
3. P42 バリデーション漏れが 1 件以上
4. `AI_CHECK_CONNECTION` の参照が残存
5. IPC チャンネル名に文字列リテラルが残存（P27）
