# Phase 12: 未タスク検出レポート

## 検出件数: 3 件

| No  | 検出元         | 内容                                                                                  | 優先度 | 対応方針                                                |
| --- | -------------- | ------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------- |
| 1   | スコープ外明示 | `inferSmartDefaults` 本体の変更（semantic default の生成ロジック改善）                | LOW    | 別タスクで対応                                          |
| 2   | Phase 10 MINOR | `vitest.config.ts` の `resolve.alias` 手動追加が将来の subpath 追加時も必要           | LOW    | `vite-tsconfig-paths` の value import 対応を調査        |
| 3   | Phase 10 MINOR | `notion` の `freeText: "Notion"` 設定が `createQuestionAnswer` の特別ケースとして残存 | LOW    | `resolveSemanticLabel` 返り値だけで完結させる設計を検討 |
