# Phase 3: 破壊的変更一覧

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 3                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## 削除された state

| state 名              | 旧型                          | 削除方針   | 対処状況 |
| --------------------- | ----------------------------- | ---------- | -------- |
| `description`         | `string`                      | 削除       | ✅ 完了  |
| `options`             | `GenerationOptions`           | 定数に移行 | ✅ 完了  |
| `旧生成モード`        | `"template" \| "llm" \| null` | 削除       | ✅ 完了  |
| `旧生成モード setter` | function                      | 削除       | ✅ 完了  |

## 削除されたハンドラ

| ハンドラ名                                     | 削除方針                   | 対処状況 |
| ---------------------------------------------- | -------------------------- | -------- |
| `handleDescribeNext()`                         | `handleStep0Next()` に置換 | ✅ 完了  |
| `createSkill(description, options)` 旧パターン | 新ハンドラに統合           | ✅ 完了  |

## 削除・更新された Props 渡し

| Props           | 渡し先                  | 削除/更新方針                             | 対処状況 |
| --------------- | ----------------------- | ----------------------------------------- | -------- |
| `旧生成モード`  | 旧生成フロー            | 3ステップ化により不要                     | ✅ 完了  |
| `description`   | 旧 `DescribeStep`       | コンポーネント自体を置換                  | ✅ 完了  |
| `smartDefaults` | `ConversationRoundStep` | Step 0 推論結果を Step 1 Props で受け渡し | ✅ 完了  |

## 削除された UI

| UI 要素                     | data-testid                 | 対処状況                    |
| --------------------------- | --------------------------- | --------------------------- |
| テンプレート生成切り替え UI | `generation-mode-selector`  | ✅ 削除済み（テストで確認） |
| 旧スキル説明テキストエリア  | （`スキルの説明` テキスト） | ✅ 削除済み                 |

## 新規追加

| 追加内容                | 種別     | 対処状況                  |
| ----------------------- | -------- | ------------------------- |
| `formData` state        | state    | ✅ 追加済み               |
| `smartDefaults` state   | state    | ✅ 追加済み               |
| `skillPath` state       | state    | ✅ 追加済み               |
| `handleStep0Next()`     | handler  | ✅ 実装済み               |
| `handleRetry()`         | handler  | ✅ 実装済み               |
| `handleExecuteNow()`    | handler  | ✅ 実装済み               |
| `handleOpenInEditor()`  | handler  | ✅ 実装済み               |
| `handleCreateAnother()` | handler  | ✅ 実装済み               |
| `inferSmartDefaults()`  | function | ✅ shared から利用に統一  |
| `trackEvent()` スタブ   | function | ✅ 実装済み（TODO Wave3） |
