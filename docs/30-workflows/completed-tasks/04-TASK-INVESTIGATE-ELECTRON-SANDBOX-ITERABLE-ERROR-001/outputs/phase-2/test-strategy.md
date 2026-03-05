# Phase 2 テスト戦略

## 1. 方針

- Redで契約崩れ再現ケースを追加し、Greenで最小修正。
- Main/Rendererを別スイートで検証し、最後にUI回帰を確認。

## 2. テストレイヤー

| レイヤー      | ファイル                         | 観点                         |
| ------------- | -------------------------------- | ---------------------------- |
| Renderer Unit | `authSlice.test.ts`              | 非配列正規化、壊れ状態回復   |
| Main Unit     | `profileHandlers.test.ts`        | unlink通知時のAuthUser正規化 |
| UI Regression | `AccountSection.portal.test.tsx` | 既存UI操作退行なし           |

## 3. 成功条件

- 追加ケースがPASS
- 既存ケース含め全169テストPASS
- typecheck PASS
