# Phase 1: 要件定義サマリー

## 担当

- SubAgent-A（要件定義）

## 実施内容

- `apps/desktop/src/main/ipc/skillHandlers.ts` と `apps/desktop/src/preload/skill-api.ts` を棚卸しし、`skill:` チャネルの戻り値を分類した。
- 契約プロファイルを `直接返却` / `ラッパー返却` / `例外返却` の3種類で定義した。
- FR/NFR/受け入れ基準を検証可能な形で確定した。

## 要件（機能要件）

| ID   | 要件                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| FR-1 | `skill:execute` の Renderer 取得値を `SkillExecutionResponse` 1形態に統一する |
| FR-2 | `skill:remove` の Main戻り値 `RemoveResult` と Preload型宣言を同期する        |
| FR-3 | `list/getImported/rescan` の unwrap方針を契約表として固定する                 |
| FR-4 | Main/Preload/Renderer/テスト/仕様書の5層同時更新手順を明文化する              |

## 要件（非機能要件）

| ID    | 要件                                                       |
| ----- | ---------------------------------------------------------- |
| NFR-1 | IPC境界で P42（型・空文字・trim空文字）検証を維持する      |
| NFR-2 | `validateIpcSender` を全 invoke ハンドラで維持する         |
| NFR-3 | 契約差分を自動テストで検出可能にする                       |
| NFR-4 | 仕様書更新時に `ipc-contract-checklist` Phase 1-6 を満たす |

## 受け入れ基準

- [x] `skill:` 主要チャネル（`execute/remove/import/list/getImported/rescan`）の AS-IS 契約差分が明文化されている
- [x] `safeInvoke` / `safeInvokeUnwrap` 採用基準がチャネル単位で判定可能
- [x] 受け入れ基準がテスト観点へ落とし込み可能
- [x] Phase 2 に渡す制約（セキュリティ/型同期/命名同期）が確定

## 引き継ぎ

- `skill:execute` は Main 側が `{ success, data }` を返す一方、Preload は `safeInvoke` のため unwrap漏れが発生する。
- `skill:remove` は Main が `RemoveResult` を返す一方、Preload 型は `Promise<void>` で契約差分がある。
