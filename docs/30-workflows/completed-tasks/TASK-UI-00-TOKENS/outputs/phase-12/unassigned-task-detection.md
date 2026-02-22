# 未タスク検出レポート: TASK-UI-00-TOKENS

## メタ情報

| 項目     | 値                |
| -------- | ----------------- |
| タスクID | TASK-UI-00-TOKENS |
| Phase    | 12                |
| 検出日   | 2026-02-22        |

---

## 検出方法

### 1. 実装コード調査

tokens.css の実装内容を精査し、以下の観点で未実装箇所を検出した:

- テーマ切替の動的機能: `[data-theme]` セレクタでCSS変数が定義されているが、`data-theme` 属性をユーザー操作で動的に変更する機能が未実装
- Tailwind CSS 統合: CSS変数がTailwindの `theme.extend` に未統合のため、ユーティリティクラスとして利用不可

### 2. 仕様書との差分分析

`ui-ux-design-system.md` のテーマ切替機能仕様に以下の項目が定義済み:

- テーマモード: light, dark, system の3種類
- 永続化: electron-store
- システム連動: nativeTheme API

これらの仕様に対し、tokens.css でCSS変数の定義は完了したが、動的切替の実装は未着手。

---

## 検出結果サマリ

| タスクID                              | タスク名                            | 優先度 | ステータス             |
| ------------------------------------- | ----------------------------------- | ------ | ---------------------- |
| UT-UI-THEME-DYNAMIC-SWITCH-001        | settingsSlice テーマ動的切替対応    | 中     | 指示書作成済み・未着手 |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001 | Tailwind CSS カスタムプロパティ統合 | 低     | 指示書作成済み・未着手 |

---

## 件数

- 検出件数: **2件**
- 指示書作成: 2件
- task-workflow.md 登録: 2件
- 関連仕様書リンク追加: 2件（ui-ux-design-system.md）
