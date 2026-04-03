# [#1855] [UT-SDK-SC-02-001] Conversation UI（質問受信・回答送信UI）

## メタ情報

```yaml
task_id: UT-SDK-SC-02-001
task_name: Conversation UI（質問受信・回答送信UI）
category: 要件
target_feature: skill-creator / conversation-ui
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-SDK-SC-01 Phase 12 後続分解
created_date: 2026-04-03
dependencies: [TASK-SDK-SC-01]
spec_path: docs/30-workflows/unassigned-task/task-sdk-sc-02-conversation-ui.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SDK-SC-01` で SDK Session Bridge と `skillCreatorSession` の IPC 契約は用意できたが、Renderer 側に質問を表示して回答を返す UI がまだない。  
このままでは `question-received` イベントを受けても、ユーザーが何に答えるべきか分からず、対話型のスキル作成フローが成立しない。

### 1.2 問題点・課題

- 質問を受信しても、Renderer 側で表示するコンポーネント群が未実装
- `single_select` / `multi_select` / `free_text` / `secret` / `confirm` をタイプ別に描画する責務がまだない
- `skillCreatorSession.onQuestion()` と `sendAnswer()` の橋渡しが UI で閉じていない
- リスナー解除やセッション切り替え時のクリーンアップが未整備

### 1.3 放置した場合の影響

- 対話型スキル作成が実際には操作できず、SDK Session Bridge が画面から使えない
- 質問イベントが溜まるだけで、セッションが停止したように見える
- イベント購読の重複や解除漏れが起きると、別セッションの質問が混線する

---

## 2. 何を達成するか（What）

### 2.1 目的

Renderer 側に質問受信・回答送信の専用 UI を実装し、`skillCreatorSession` のイベントと安全に接続する。

### 2.2 最終ゴール

- `question-received` を受けると質問フォームが表示される
- `single_select` / `multi_select` / `free_text` / `secret` / `confirm` を正しく描画できる
- `single_select` / `multi_select` では末尾に「その他（自由入力）」を常に表示できる
- 回答を `skillCreatorSession.sendAnswer()` に送信できる
- コンポーネントの unmount 時に IPC リスナーが必ず解除される

### 2.3 スコープ

#### 含むもの

- `SkillCreatorConversationPanel.tsx`
- `QuestionCard.tsx`
- `ChoiceButton.tsx`
- `FreeTextInput.tsx`
- `ConversationProgress.tsx`
- UI 状態管理と回答送信処理
- テスト追加とクリーンアップ検証

#### 含まないもの

- SDK Session Bridge の再実装
- 外部 API サポート
- スキル出力保存や `SkillRegistry` 登録

### 2.4 成果物

- `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`
- `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`
- `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`
- `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`
- `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`
- 関連テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SDK-SC-01` が完了していること
- `UserInputQuestion` / `UserInputAnswer` / `UserInputType` が shared で確定していること
- `skillCreatorSession` の preload 公開 API が利用できること

### 3.2 依存タスク

- `TASK-SDK-SC-01`

### 3.3 必要な知識

- Electron Renderer の状態管理とイベント購読
- IPC リスナーの登録・解除パターン
- `single_select` / `multi_select` / `free_text` / `secret` / `confirm` の入力差分

### 3.4 推奨アプローチ

1. 質問データを `QuestionCard` に集約する
2. 選択肢表示と自由入力表示を分離する
3. 回答型を `UserInputAnswer` に正規化してから送信する
4. unmount 時の解除漏れをテストで固定する

### 3.5 苦戦箇所

| ID    | 内容                                                          | 対策                                                              |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| U02-1 | 選択肢 UI と自由入力 UI が混ざると責務が崩れやすい            | `QuestionCard` を親にして、入力パターンごとの表示を子へ切り分ける |
| U02-2 | `single_select` / `multi_select` の「その他」処理が漏れやすい | 末尾固定ルールを共通関数化し、選択肢順をテストで固定する          |
| U02-3 | リスナー解除漏れで別セッションの質問が混線しやすい            | 1 セッション 1 購読の方針を徹底し、unmount テストを必須にする     |
| U02-4 | 回答の型が文字列・配列・真偽値で分かれやすい                  | 送信前に `UserInputAnswer` へ正規化する処理を 1 箇所に集約する    |

---

## 4. 実行手順

### Phase構成

- Phase 1: 要件固定
- Phase 2: UI 構成設計
- Phase 3: 実装・テスト
- Phase 4: ドキュメント更新と Issue 反映

### Phase 1: 要件固定

#### 目的

質問タイプ、回答型、イベント解除条件を固定する。

#### 手順

1. `skillCreatorSession` のイベント一覧を確認する
2. 質問タイプごとの表示差分を列挙する
3. 「その他（自由入力）」のルールを明示する

#### 成果物

- 要件メモ
- 表示ルール一覧

#### 完了条件

- 質問タイプと表示ルールが 1 対 1 で説明できる

### Phase 2: UI 構成設計

#### 目的

コンポーネント責務と props 契約を分離する。

#### 手順

1. `ConversationPanel` をオーガニズムとして定義する
2. `QuestionCard` と入力コンポーネントを分ける
3. エラー/完了状態の表示を決める

#### 成果物

- props 設計
- コンポーネントツリー

#### 完了条件

- どのコンポーネントが何を所有するか説明できる

### Phase 3: 実装・テスト

#### 目的

Renderer UI を実装し、イベント解除まで保証する。

#### 手順

1. 各コンポーネントを実装する
2. `skillCreatorSession` と接続する
3. `vitest` で描画/送信/解除を確認する

#### 成果物

- TSX 実装
- テスト

#### 完了条件

- typecheck / lint / test が通る

### Phase 4: ドキュメント更新と Issue 反映

#### 目的

後続タスクとして追跡可能な状態にする。

#### 手順

1. 仕様差分をドキュメントへ反映する
2. GitHub Issue を作成する
3. issue_number を仕様書に書き戻す

#### 成果物

- issue_number 付き指示書
- Issue

#### 完了条件

- 仕様書と Issue の対応が取れる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 質問イベントを受信してフォームを表示できる
- [ ] 5 種類の質問タイプを表示できる
- [ ] 回答送信が `skillCreatorSession` に接続されている
- [ ] unmount 時に購読解除される

### 品質要件

- [ ] TypeScript コンパイルエラーが 0 件
- [ ] Vitest が全件 PASS
- [ ] 画面状態の責務境界が崩れていない

### ドキュメント要件

- [ ] 参照ドキュメントが最新の Step-01 完了版に向いている
- [ ] Issue 作成後に `issue_number` が反映される

---

## 6. 検証方法

### テストケース

- `question-received` 受信時にフォームが描画される
- `single_select` / `multi_select` で「その他（自由入力）」が末尾に出る
- `confirm` が 2 択で送信できる
- unmount 時に IPC リスナーが解除される

### 検証手順

1. Renderer を起動する
2. サンプル質問を流して各タイプを確認する
3. 回答送信と再描画を確認する
4. テストを実行する

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                          |
| ---------------------------- | ------ | -------- | --------------------------------------------- |
| 質問タイプの分岐が肥大化する | 中     | 中       | `QuestionCard` に集約して分岐を一箇所に閉じる |
| リスナー解除漏れが起きる     | 高     | 中       | unmount テストを必須化する                    |
| 回答型の変換ミスが起きる     | 中     | 中       | 送信前に正規化関数を通す                      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-01-seq-task-01-sdk-session-bridge/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-02-conversation-ui/index.md`
- `packages/shared/src/types/skillCreatorSession.ts`
- `apps/desktop/src/preload/skill-creator-session-api.ts`

### 参考資料

- `task-specification-creator` の未完了タスクテンプレート
- `github-issue-manager` の `create_issue.js`

---

## 9. 備考

### 補足事項

- このタスクは `skillCreatorSession` のレンダラー実装面を閉じるための後続タスクである
- 実装時は Main 側の新規 I/F を増やさず、共有型をそのまま使う
