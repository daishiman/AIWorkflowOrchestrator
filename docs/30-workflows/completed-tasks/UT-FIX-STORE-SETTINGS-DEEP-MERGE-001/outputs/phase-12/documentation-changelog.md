# ドキュメント変更履歴

## 変更ファイル一覧

| ファイル                                                                    | 変更種別 | 変更内容                                                                     |
| --------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/storeHandlers.ts`                                | 修正     | `deepMerge<T>` / plain-object validation / 危険キー除外追加                  |
| `apps/desktop/src/main/ipc/storeHandlers.test.ts`                           | 修正     | `registerUserSettingsHandlers` テストブロック拡張（TC-01〜TC-12）            |
| `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md` | 更新     | `settings:get` / `settings:update` の deepMerge パターンと安全性ルールを追加 |

## システム仕様書更新履歴

| 資料                                | 更新内容                                                        |
| ----------------------------------- | --------------------------------------------------------------- |
| Phase 12 実装ガイド                 | deepMerge 関数・マージルール・入力安全性・型安全性を記録        |
| Phase 12 スキルFBレポート           | マージ戦略設計と入力安全性に関する知見を記録                    |
| 正本仕様（arch-ipc-persistence.md） | `settings:update` の deepMerge 実装パターンと安全化ルールを反映 |
