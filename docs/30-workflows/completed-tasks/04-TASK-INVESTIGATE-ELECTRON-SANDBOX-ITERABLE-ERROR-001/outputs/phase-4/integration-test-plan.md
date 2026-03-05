# Phase 4 統合テスト計画

## 層間連携観点

| ID    | 観点                        | 検証方法                         |
| ----- | --------------------------- | -------------------------------- |
| IT-01 | Main→Renderer通知 shape整合 | `profileHandlers.test.ts`        |
| IT-02 | Renderer受信時の防御        | `authSlice.test.ts`              |
| IT-03 | UI利用層への波及有無        | `AccountSection.portal.test.tsx` |

## 実行順序

1. Main単体（通知契約）
2. Renderer単体（正規化・復旧）
3. UI回帰（既存導線）
