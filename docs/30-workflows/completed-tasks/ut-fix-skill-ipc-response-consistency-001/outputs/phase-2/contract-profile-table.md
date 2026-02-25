# Phase 2: 契約プロファイル表

## 担当

- SubAgent-A（契約設計）

## プロファイル定義

| プロファイル  | Main返却形                                        | Preload関数                |
| ------------- | ------------------------------------------------- | -------------------------- |
| P1: Wrapper   | `{ success, data }` / `{ success: false, error }` | `safeInvokeUnwrap`         |
| P2: Direct    | `T`（直接返却）                                   | `safeInvoke`               |
| P3: Exception | `throw { code, message }`                         | `safeInvoke`（reject伝播） |

## チャネル別割当（TO-BE）

| チャネル            | プロファイル | Preload                                 |
| ------------------- | ------------ | --------------------------------------- |
| `skill:list`        | P1           | `safeInvokeUnwrap`                      |
| `skill:getImported` | P1           | `safeInvokeUnwrap`                      |
| `skill:scan`        | P1           | `safeInvokeUnwrap`                      |
| `skill:execute`     | P1           | `safeInvokeUnwrap`（変更対象）          |
| `skill:import`      | P2 + P3      | `safeInvoke`                            |
| `skill:remove`      | P2           | `safeInvoke` + 戻り値型同期（変更対象） |
| `skill:abort`       | P2           | `safeInvoke`                            |
| `skill:get-status`  | P2           | `safeInvoke`                            |

## 判定基準

- Main が `{ success, data }` を返すなら `safeInvokeUnwrap`。
- Main が直接値を返すなら `safeInvoke`。
- throw 契約は `safeInvoke` で reject を伝播。
