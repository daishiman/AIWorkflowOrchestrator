# Phase 8: リファクタリングログ

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 8                                        |
| タスクID | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| 作成日   | 2026-04-03                               |

## 結論

**変更なし**

## 確認したリファクタリング候補

| 候補                                                   | 判定 | 理由                                                                                |
| ------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------- |
| `BeforeQuitGuardDeps` の export                        | 不要 | テストは `registerBeforeQuitGuard` の振る舞いのみを扱い、型を外部公開する必要がない |
| テスト用 `createMockApp` / `createMockDialog` の共通化 | 不要 | `beforeQuitGuard.test.ts` 内で閉じており、分割すると逆に追跡しにくい                |
| `console.warn` メッセージの定数化                      | 不要 | 1 箇所のみで、可読性低下の方がコスト高                                              |

## 補足

- `RuntimeSkillCreatorFacade.ts` は `activeExecutionCount` と `try/finally` が既に明確で、追加の構造変更は不要だった
- 最小変更のままテストが Green で維持されているため、リファクタリングは見送った
