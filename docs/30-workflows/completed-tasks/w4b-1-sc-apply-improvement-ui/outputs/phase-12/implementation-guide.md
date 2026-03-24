# 実装ガイド: 改善提案 承認/適用 UI (UT-SC-05)

## Part 1: 中学生レベル概念説明

### 日常の例え

AIの先生が宿題の改善点を3つ提案してくれました。1つ目は漢字の間違い、2つ目は文章の順番、3つ目は段落の分け方。あなたは「漢字の間違いと段落の分け方だけ直してもらおう」と選んで、先生に頼みます。先生は選ばれた2つだけを直して、3つ目は何もしません。

このUIは、AIが提案した改善点を1つずつ確認して、どれを採用するか自分で選べる画面です。

### 技術概念

- **IPC（プロセス間通信）**: Electronの Main Process と Renderer Process の間でデータをやり取りする仕組み。手紙のやりとりのようなもので、安全な「窓口」を通じてのみ通信できます。
- **Preload API**: Renderer から Main Process の機能を安全に呼び出すための「窓口」。銀行の窓口のように、直接金庫には触れず、窓口係を通じて操作を依頼します。
- **diff 表示**: 変更前と変更後の違いを色分けして表示する方法。赤は「消す部分」、緑は「追加する部分」を表します。

## Part 2: 開発者向け実装詳細

### IPCチャンネル仕様

- チャンネル名: `skill-creator:apply-improvement`
- 定数: `IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT`
- ハンドラ: `creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` 内
- Preload: `skill-creator-api.ts` の `applyRuntimeImprovement()`

### バリデーション（P42準拠3段バリデーション）

1. `isBlank(skillName)`: `typeof !== "string"` → `=== ""` → `.trim() === ""`
2. `validateSuggestions(suggestions)`: 配列チェック → 空チェック → DoS上限(100件) → `isSuggestion()` 型ガード

### コンポーネント構成

| コンポーネント             | レイヤー            | 責務                                              |
| -------------------------- | ------------------- | ------------------------------------------------- |
| `ImprovementProposalItem`  | molecule            | 個別提案: checkbox + diff(before/after) + reason  |
| `ImprovementProposalList`  | organism            | 提案リスト: 全選択/全解除/適用ボタン + スクロール |
| `ImprovementApplyResult`   | organism            | 適用結果: applied/skipped/errors 表示             |
| `ImprovementProposalPanel` | organism(container) | 状態管理: 選択管理 + IPC呼び出し + 画面切替       |

### 状態管理方針

- `useState` ベース（Zustand不使用）
- 理由: パネルのローカル状態であり、アプリ全体で共有する必要がない。コンポーネントのライフサイクルに紐づく一時的な状態のため、ストア化の利点がない。

### 適用されたPitfall対策

| ID  | 対策内容                                    |
| --- | ------------------------------------------- |
| P42 | `isBlank()` による3段バリデーション         |
| P44 | Handler args とPreload呼び出し形式の一致    |
| P47 | `diffStyles` 定数exportによるテスト検証     |
| P48 | non-null assertion 不使用                   |
| P49 | `isSuggestion()` 型ガードで `in` 演算子使用 |
| P60 | `IpcResult<T>` wrapper形式                  |
| P65 | `skill-creator:*` namespace統一             |
