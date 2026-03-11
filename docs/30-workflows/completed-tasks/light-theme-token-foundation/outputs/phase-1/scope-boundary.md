# Phase 1 成果物: scope-boundary

## 1. In Scope

| 領域             | 具体対象                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| Token 定義       | `apps/desktop/src/renderer/styles/tokens.css`                                    |
| Token 契約テスト | `apps/desktop/src/renderer/styles/*.test.ts`                                     |
| トークン参照整合 | renderer 内 `var(--*)` 参照の未定義解消                                          |
| Workflow 成果物  | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-*` |

## 2. Out of Scope

| 領域                                      | 理由                                 |
| ----------------------------------------- | ------------------------------------ |
| 各画面の `text-white` / `bg-slate-*` 置換 | shared-color-migration タスク責務    |
| 視覚回帰の恒久運用ルール                  | contrast-regression-guard タスク責務 |
| commit / PR                               | ユーザー禁止ポリシー                 |

## 3. 依存関係

| 種別 | 関係                                                 |
| ---- | ---------------------------------------------------- |
| 先行 | なし                                                 |
| 後続 | `TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001`    |
| 後続 | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |

## 4. リスクと制御

| リスク                              | 制御策                       |
| ----------------------------------- | ---------------------------- |
| token 変更で dark/kanagawa が壊れる | 3テーマ契約テストを追加      |
| 未定義 token が残る                 | 参照監査テストを追加         |
| UI修正責務が混入する                | component 変更を最小限に制限 |

## 5. 判定

- [x] スコープ内外を明確化
- [x] 依存タスクとの責務分離を確定
