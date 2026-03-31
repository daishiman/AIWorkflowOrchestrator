# Phase 8: Refactoring Log

| 対象                        | Before                                         | After                                                  | 理由                   |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| Renderer execution API 取得 | 各 hook で `window.electronAPI` へ直接アクセス | `renderer/utils/executionApi.ts` に共通化              | 重複削減と型安全性向上 |
| execution channel 定義      | `preload/channels.ts` に一部ハードコード文字列 | `packages/shared/src/ipc/channels.ts` の定数参照へ統一 | 4層契約の一貫性確保    |
| DI placeholder              | 暗黙の仮実装                                   | `TODO(DI)` を明示                                      | 残課題の見落とし防止   |

詳細は `../phase-8-9/refactoring-summary.md` を参照。
