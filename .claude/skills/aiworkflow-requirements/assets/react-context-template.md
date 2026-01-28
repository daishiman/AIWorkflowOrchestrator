# React Context 仕様テンプレート

> 用途: グローバル状態管理、コンポーネント間データ共有
> 参考: ui-ux-feature-components.md（CopyHistoryContext）

---

## 概要

[機能名]のReact Context仕様を定義する。

---

## Context 概要

### XxxContext

| 項目     | 内容                  |
| -------- | --------------------- |
| 目的     | [Contextの目的]       |
| スコープ | [Provider配置位置]    |
| 状態     | [管理する状態]        |
| アクション | [提供するメソッド]  |

---

## 型定義

### Entry型（データモデル）

| フィールド | 型     | 説明             |
| ---------- | ------ | ---------------- |
| id         | string | 一意識別子       |
| content    | string | データ内容       |
| timestamp  | number | 作成日時（Unix） |

### ContextValue型

| プロパティ      | 型                          | 説明           |
| --------------- | --------------------------- | -------------- |
| items           | XxxEntry[]                  | データ配列     |
| selectedIds     | Set\<string\>               | 選択中ID       |
| itemCount       | number                      | 件数           |
| addItem         | (item) => void              | 追加           |
| removeItem      | (id) => void                | 削除           |
| clearAll        | () => void                  | 全削除         |
| toggleSelection | (id) => void                | 選択トグル     |
| clearSelection  | () => void                  | 選択クリア     |

---

## 定数

| 定数名          | 値  | 説明         |
| --------------- | --- | ------------ |
| MAX_ITEMS       | 50  | 最大保持件数 |
| PREVIEW_LENGTH  | 100 | プレビュー長 |
| FEEDBACK_MS     | 2000| フィードバック表示時間 |

---

## Provider 仕様

### 構造

| 要素             | 責務                   |
| ---------------- | ---------------------- |
| XxxProvider      | 状態管理とContext提供  |
| useXxx Hook      | Contextアクセス        |
| XxxPanel         | UI表示                 |

### 状態管理

| 状態        | 初期値        | 更新タイミング     |
| ----------- | ------------- | ------------------ |
| items       | []            | add/remove/clear時 |
| selectedIds | new Set()     | toggle/clear時     |

### FIFO削除ロジック

| 条件                      | 処理                   |
| ------------------------- | ---------------------- |
| items.length >= MAX_ITEMS | 最古の項目を削除       |
| 新規追加                  | 先頭に挿入（unshift）  |

---

## Hook 仕様

### useXxx

| 項目       | 仕様                                      |
| ---------- | ----------------------------------------- |
| 目的       | XxxContext へのアクセスを提供             |
| 使用条件   | XxxProvider 内で使用必須                  |
| エラー処理 | Provider外で使用時に Error throw          |

### エラーメッセージ

| 状況           | メッセージ                              |
| -------------- | --------------------------------------- |
| Provider外使用 | "useXxx must be used within XxxProvider" |

---

## キーボード操作

| キー   | 機能                   |
| ------ | ---------------------- |
| Tab    | フォーカス移動         |
| Enter  | 項目アクション実行     |
| Escape | パネル/ダイアログ閉じる |
| Space  | チェックボックストグル |

---

## ARIA属性

| 要素   | 属性                 | 値                   |
| ------ | -------------------- | -------------------- |
| パネル | role                 | dialog               |
| パネル | aria-label           | [機能名]             |
| パネル | aria-modal           | true                 |
| リスト | role                 | listbox              |
| リスト | aria-multiselectable | true（複数選択時）   |
| 項目   | role                 | option               |
| 項目   | aria-selected        | 選択状態に応じて     |

---

## テスト仕様

### テストユーティリティ

| ユーティリティ       | 用途                     |
| -------------------- | ------------------------ |
| renderWithProvider   | Provider付きレンダリング |
| TestProvider         | テスト用モックProvider   |

### テストケース

| カテゴリ   | テストID | 検証内容                  |
| ---------- | -------- | ------------------------- |
| 初期状態   | CTX-001  | 空の状態で開始            |
| 追加       | CTX-002  | 項目追加で件数増加        |
| FIFO       | CTX-003  | MAX超過時に最古削除       |
| 選択       | CTX-004  | toggleSelectionで選択切替 |
| クリア     | CTX-005  | clearAllで全削除          |
| Provider外 | CTX-006  | Error throw確認           |

---

## パネルコンポーネント仕様

### Props

| Prop      | 型        | 必須 | 説明             |
| --------- | --------- | ---- | ---------------- |
| isOpen    | boolean   | ✅   | 表示状態         |
| onClose   | () => void| ✅   | 閉じるコールバック |
| className | string    | -    | 追加CSSクラス    |

### 機能

| 機能             | 説明                         |
| ---------------- | ---------------------------- |
| 一覧表示         | 最大MAX_ITEMS件              |
| プレビュー       | PREVIEW_LENGTH文字で省略     |
| 個別アクション   | 項目ごとの操作ボタン         |
| 複数選択         | チェックボックス選択         |
| 一括アクション   | 選択項目への一括処理         |
| 全クリア         | 確認なしで全削除             |
| パネル外クリック | パネルを閉じる               |

---

## フィードバック仕様

| アクション | フィードバック          | 表示時間       |
| ---------- | ----------------------- | -------------- |
| 成功       | 成功メッセージ表示      | FEEDBACK_MS    |
| 失敗       | エラーメッセージ表示    | 手動クローズ   |

---

## 関連ドキュメント

| ドキュメント                | 説明                   |
| --------------------------- | ---------------------- |
| ui-ux-feature-components.md | 実装例（CopyHistory）  |
| react-hook-template.md      | Hook仕様テンプレート   |
| ui-component-template.md    | UIコンポーネント       |
| architecture-patterns.md    | 状態管理パターン       |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                |
| ---------- | ---------- | --------------------------------------- |
| 2026-01-28 | 1.0.0      | 初版作成（CopyHistoryContext実装に基づく） |
