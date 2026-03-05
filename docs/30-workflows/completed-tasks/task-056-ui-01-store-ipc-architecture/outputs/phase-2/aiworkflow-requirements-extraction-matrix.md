# Phase 2 成果物: aiworkflow-requirements 抽出マトリクス

## 1. 抽出方針

- `indexes/resource-map.md` の UI実装 / API設計 / セキュリティ実装 / テスト実装導線を起点に抽出。
- 変更ファイル群（Renderer/Main/Preload/Shared）に対して必要仕様のみを選択。

## 2. 仕様抽出結果

| 仕様書                          | 抽出した要件                        | 適用対象ファイル                                                        |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `architecture-patterns.md`      | Zustand Sliceの責務分離、Hook設計   | `store/index.ts`, `store/slices/*.ts`                                   |
| `arch-state-management.md`      | 個別セレクタ原則、状態正規化        | `store/index.ts`, `store/types.ts`                                      |
| `api-endpoints.md`              | IPCチャネル命名とカテゴリ整列       | `packages/shared/src/ipc/channels.ts`, `preload/channels.ts`            |
| `api-ipc-system.md`             | invoke/on契約、request/response整合 | `preload/types.ts`, `preload/api/notification-api.ts`, `main/ipc/*.ts`  |
| `security-api-electron.md`      | preload公開面最小化、allowlist運用  | `preload/index.ts`, `preload/channels.ts`                               |
| `security-electron-ipc.md`      | sender検証順序、エラー露出制御      | `main/ipc/notificationHandlers.ts`, `main/ipc/historySearchHandlers.ts` |
| `security-input-validation.md`  | P42三段バリデーション               | `main/ipc/notificationHandlers.ts`, `main/ipc/historySearchHandlers.ts` |
| `error-handling.md`             | エラーコード統一、sanitize方針      | `main/ipc/*.ts`, `preload/types.ts`                                     |
| `ui-ux-navigation.md`           | ViewType遷移整合、ナビ導線          | `App.tsx`, `AppDock/index.tsx`                                          |
| `ui-ux-design-principles.md`    | Apple HIG観点の手動検証項目         | `phase-11-manual-test.md`                                               |
| `ui-ux-components.md`           | UI部品の可用性/状態遷移確認         | `phase-11-manual-test.md`                                               |
| `quality-requirements.md`       | テスト/カバレッジの判定基準         | `phase-4..9` 仕様書, 各テストファイル                                   |
| `testing-component-patterns.md` | テスト粒度、モック戦略              | `AppDock.test.tsx`, `store/*.test.ts`, `ipc/*.test.ts`                  |

## 3. 抽出漏れ監査と改善

- 追加反映: `api-endpoints.md`, `security-input-validation.md`, `error-handling.md` を Phase 2/5 の参照資料へ追加。
- 追加反映: 実装変更ファイル全件を `outputs/phase-5/changed-files-list.md` に記録。
- 解消: `security-electron-ipc.md` が求める sender検証（`validateIpcSender`）を `notificationHandlers.ts` / `historySearchHandlers.ts` へ適用。
- 解消: `error-handling.md` 観点で `sanitizeErrorMessage` を導入し、内部情報露出を抑止。
