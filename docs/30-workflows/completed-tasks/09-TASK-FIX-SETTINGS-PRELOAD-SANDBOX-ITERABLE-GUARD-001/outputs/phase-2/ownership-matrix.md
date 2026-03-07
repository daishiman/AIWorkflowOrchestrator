# Phase 2 責務分担表

## メタ情報

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| Phase  | 2                                                       |
| 機能名 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 |
| 作成日 | 2026-03-07                                              |
| 作成者 | SubAgent-Renderer-Guard                                 |

## 層別責務分担表

| 層       | ファイル                                                                   | 現在の責務                                 | 変更内容                                          | 変更理由                                                                          |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Renderer | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`  | `apiKey.list()` 呼び出しと結果のUI表示     | `loadProviders` 内に `Array.isArray()` ガード追加 | `result.data.providers` が非配列の場合のクラッシュ防止                            |
| Renderer | `apps/desktop/src/renderer/components/AuthGuard/index.tsx`                 | 認証状態に基づくアクセス制御               | 変更なし                                          | 既に堅牢（switch文でchecking/authenticated/unauthenticatedを正しく処理）          |
| Renderer | `apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx`     | React Error Boundaryによるエラーキャッチ   | 変更なし                                          | 既存実装で十分（getDerivedStateFromError + componentDidCatch + フォールバックUI） |
| Renderer | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | 設定画面全体のレイアウトとセクション構成   | 変更なし                                          | ApiKeysSectionを直接レンダリングしており、防御はApiKeysSection内で完結            |
| Preload  | `apps/desktop/src/preload/index.ts`                                        | `safeInvoke` によるIPC通信ラッパー         | 変更なし                                          | task-04 で防御済み                                                                |
| Preload  | `apps/desktop/src/preload/types.ts`                                        | ElectronAPI型定義                          | 変更なし                                          | 型定義自体は正しく、実行時の shape 不一致が問題                                   |
| Main     | `apps/desktop/src/main/` 配下                                              | IPCハンドラとサービス層                    | 変更なし                                          | Main側のレスポンス生成は正常に動作している                                        |
| Test     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/` | ApiKeysSectionのユニットテスト（新規作成） | `apiKey.list()` が非配列を返すケースのテスト追加  | 正規化ロジックの回帰テスト                                                        |
| Test     | `apps/desktop/src/renderer/components/AuthGuard/AuthGuard.test.tsx`        | AuthGuardのユニットテスト                  | `window.electronAPI` shape 異常系テスト追加       | preload shape 欠損時の挙動を固定                                                  |

## SubAgent 分担表

| SubAgent                | Phase 2 での成果物                    | Phase 4-5 での責務                             |
| ----------------------- | ------------------------------------- | ---------------------------------------------- |
| SubAgent-Renderer-Guard | 設計方針書、責務分担表、実行計画      | ApiKeysSection の `Array.isArray()` ガード実装 |
| SubAgent-Contract-IPC   | （本Phase不要: Preload/Main変更なし） | 変更なし（task-04 完了済み契約の確認のみ）     |
| SubAgent-Test-Fallback  | （テストケース設計は Phase 4 で実施） | 非配列戻り値テスト、shape 異常系テスト実装     |
| SubAgent-Lead-Sync      | （統合は Phase 3 レビュー後に実施）   | Phase 12 での仕様書更新・未タスク検出          |

## Codex 委譲境界

| 委譲先    | 委譲する作業                         | 委譲しない作業（手動確認必須）         |
| --------- | ------------------------------------ | -------------------------------------- |
| Phase 4-5 | `Array.isArray()` ガードのコード実装 | 実装後の手動テスト（Phase 11）         |
| Phase 4-5 | テストコードの作成                   | テスト結果の妥当性レビュー（Phase 10） |
| Phase 12  | 仕様書更新の自動化部分（LOGS.md 等） | 未タスク検出の判断（人間レビュー必要） |

## 変更影響範囲

### 直接変更ファイル（1ファイル）

- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`
  - `loadProviders` 関数内の `result.data.providers` 取得箇所

### テスト追加ファイル（2ファイル）

- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.guard.test.tsx`（新規）
- `apps/desktop/src/renderer/components/AuthGuard/AuthGuard.test.tsx`（既存に追加）

### 変更なしファイル（確認済み）

- `apps/desktop/src/renderer/components/AuthGuard/index.tsx` - 変更不要
- `apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx` - 変更不要
- `apps/desktop/src/renderer/views/SettingsView/index.tsx` - 変更不要
- `apps/desktop/src/preload/index.ts` - 変更不要（task-04 完了済み）
- `apps/desktop/src/preload/types.ts` - 変更不要
- `apps/desktop/src/preload/channels.ts` - 変更不要
