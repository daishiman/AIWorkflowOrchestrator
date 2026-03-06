# Phase 1 スコープ境界

## 実施対象

| 区分          | 対象                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| 契約整合      | `get`, `set`, `status`, `validate`, `changed` の request / response / event shape   |
| 型正本化      | `packages/shared/src/types/auth-mode.ts` への transport DTO 集約                    |
| Main 実装     | `authModeHandlers.ts` の sender 検証順序と adapter                                  |
| Preload 実装  | `preload/index.ts`, `preload/types.ts` の shared DTO 参照化                         |
| Renderer 実装 | `authModeSlice.ts`, `store/index.ts`, `SettingsView`, `AuthModeSelector` の契約整合 |
| テスト        | Main / Preload / Renderer / no-loop 回帰の追加と更新                                |
| 文書同期      | aiworkflow references、LOGS、topic-map の更新                                       |

## 非スコープ

| 項目                                         | 理由                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| auth provider 実装変更                       | 今回は contract alignment が目的であり、認証方式自体の仕様拡張ではない |
| 認証方式追加                                 | `subscription` / `api-key` 以外の mode は扱わない                      |
| UI 全面改修                                  | SettingsView の表示契約整合まで。レイアウト刷新は対象外                |
| `channels.ts` の channel 名 / whitelist 変更 | payload shape の整合が目的でありチャネル再設計ではない                 |
| SubscriptionAuthProvider の取得戦略変更      | Keychain / env fallback の振る舞いは既存仕様を維持する                 |

## 影響範囲と境界の整理

| 対象                          | 影響範囲             | 境界条件                                                     |
| ----------------------------- | -------------------- | ------------------------------------------------------------ |
| `SettingsView`                | 初期化と status 表示 | 個別 selector を維持し、合成 hook に戻さない                 |
| `store/index.ts`              | selector export      | public selector の追加・修正は可、合成 hook の再推奨化は不可 |
| `SubscriptionAuthProvider.ts` | guidance の根拠確認  | provider の内部取得ロジック変更は行わない                    |

## 実施しない変更の明文化

1. `AuthModeService` の provider 切替ポリシー自体は変えない。
2. 認証情報の保存方式や storage backend は変えない。
3. `/settings` 以外の画面へ auth-mode UI を拡張しない。
