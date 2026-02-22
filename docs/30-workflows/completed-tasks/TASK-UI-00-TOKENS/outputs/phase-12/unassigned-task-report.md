# 未タスクレポート: TASK-UI-00-TOKENS

## メタ情報

| 項目     | 値                |
| -------- | ----------------- |
| タスクID | TASK-UI-00-TOKENS |
| Phase    | 12                |
| 検出日   | 2026-02-22        |
| 検出件数 | 2件               |

---

## 検出された未タスク

### 1. UT-UI-THEME-DYNAMIC-SWITCH-001

| 項目     | 内容                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| タスク名 | settingsSlice テーマ動的切替対応                                                                                                           |
| 優先度   | 中                                                                                                                                         |
| 理由     | tokens.css に3テーマが定義済みだが、ユーザーがテーマを選択する機能が未実装。kanagawa-dragon 固定のままでは light/dark テーマが利用できない |
| 影響範囲 | settingsSlice, ThemeProvider, Main Process (nativeTheme), electron-store                                                                   |
| 指示書   | `docs/30-workflows/unassigned-task/ut-ui-theme-dynamic-switch-001.md`                                                                      |

### 2. UT-UI-TAILWIND-TOKENS-INTEGRATION-001

| 項目     | 内容                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスク名 | Tailwind CSS カスタムプロパティ統合                                                                                                                                            |
| 優先度   | 低                                                                                                                                                                             |
| 理由     | tokens.css のCSS変数がTailwind設定に未統合。コンポーネント開発時にインラインスタイルで `var(--bg-primary)` を使う必要があり、Tailwind のユーティリティクラスとして利用できない |
| 影響範囲 | tailwind.config.ts, 全UIコンポーネント                                                                                                                                         |
| 指示書   | `docs/30-workflows/unassigned-task/ut-ui-tailwind-tokens-integration-001.md`                                                                                                   |

---

## 3ステップ完了確認

| ステップ | 内容                                      | 結果 |
| -------- | ----------------------------------------- | ---- |
| 1        | `unassigned-task/` に指示書作成           | 完了 |
| 2        | `task-workflow.md` 残課題テーブルに登録   | 完了 |
| 3        | `ui-ux-design-system.md` に参照リンク追加 | 完了 |
