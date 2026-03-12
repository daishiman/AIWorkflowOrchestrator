# Representative Screen Matrix

> P50パターン該当: 検証・補完モード。既存 surface の被害面を再現しやすい経路だけを選定する。

## Surface 選定

| Surface ID | Route / Entry    | 主 surface                     | 実コード hot spot                 | 採用理由                                                  |
| ---------- | ---------------- | ------------------------------ | --------------------------------- | --------------------------------------------------------- |
| S-01       | Settings         | Settings shell + ThemeSelector | `ThemeSelector/index.tsx` 4 hit   | theme 切替 UI と settings shell の両方を 1 経路で見られる |
| S-02       | Dashboard        | Dashboard panel                | `DashboardView/index.tsx` 0 hit   | token 階層の被害面と全体 readability を代表する           |
| S-03       | Auth             | Auth hero / form shell         | `AuthView/index.tsx` 4 hit        | helper text と CTA の contrast drift を代表する           |
| S-04       | Workspace Search | WorkspaceSearchPanel           | `WorkspaceSearchPanel.tsx` 33 hit | 最大の hardcoded color cluster を直接監視する             |

## Surface 選定ルール

1. hot spot 数だけでは決めず、被害面の広さも見る
2. 0 hit surface でも token drift の被害面なら残す
3. App shell が不安定なら dedicated harness を許可する
4. shell 全景より selector-based capture を優先する
