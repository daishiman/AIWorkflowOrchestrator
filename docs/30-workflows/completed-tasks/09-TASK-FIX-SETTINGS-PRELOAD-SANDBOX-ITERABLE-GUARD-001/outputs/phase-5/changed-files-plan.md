# Phase 5: 変更ファイル計画

## 更新対象ファイルと目的

| #   | ファイルパス                                                                                      | 変更種別 | 目的                                                |
| --- | ------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | 修正     | loadProviders に preload payload 正規化ガードを導入 |
| 2   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 追加     | 防御的レンダリングの 6 異常系テストを追加           |

## 変更しないファイル（非スコープ確認）

| ファイルパス                                                           | 非スコープ理由                                |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/preload/index.ts`                                    | preload 層の safeInvoke は task-04 で防御済み |
| `apps/desktop/src/main/index.ts`                                       | Main process IPC ハンドラは変更不要           |
| `apps/desktop/src/preload/types.ts`                                    | 型定義の変更なし                              |
| `apps/desktop/src/renderer/components/AuthGuard/index.tsx`             | AuthGuard は electronAPI に直接アクセスしない |
| `apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx` | ErrorBoundary は既存のまま利用                |

## 設計準拠確認

- AuthKeySection パターン（optional chaining + 早期リターン）に準拠
- task-04 の preload 層防御と責務が重複しない（Renderer 層の独立防御）
- `Array.isArray()` による iterable ガードで for...of/spread クラッシュを防止
