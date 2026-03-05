# Phase 8 責務境界マップ

| 責務                        | Owner              | 実装                                        |
| --------------------------- | ------------------ | ------------------------------------------- |
| 外部データ正規化（User）    | Main               | `profileHandlers.ts` + `toAuthUser`         |
| 受信データ防御（Providers） | Renderer Store     | `authSlice.ts` + `normalizeLinkedProviders` |
| UI表示と操作                | Renderer Component | `AccountSection`（変更なし）                |
| API公開境界                 | Preload            | 既存契約維持                                |
