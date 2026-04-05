# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| Phase名    | 手動テスト                            |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 10: 最終レビュー                |
| 次Phase    | Phase 12: ドキュメント更新            |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

会話フロー動作確認の手動テストを定義し、自動テストでは検出できない UI 操作上の問題を観測する。

## 実行タスク

### Task 1: ナビゲーション到達性の手動確認

- 手順 1: Electron アプリを起動する
- 手順 2: サイドバーまたはナビゲーション UI から ConversationPanel（または統合先）に遷移する
- 手順 3: ConversationPanel が正しくレンダリングされることを目視確認する
- 手順 4: ブラウザバック/フォワードでの遷移を確認する
- 手順 5: 直接 URL アクセスでの到達を確認する（Electron の場合はディープリンク相当）

**確認項目**:

- [ ] ナビゲーション UI から ConversationPanel に到達できる
- [ ] ConversationPanel が正しくレンダリングされる
- [ ] ブラウザバック/フォワードが正常動作する

### Task 2: 会話フロー動作確認

- 手順 1: ConversationPanel（または統合先）でスキル作成を開始する
- 手順 2: 質問が表示されることを確認する（QuestionCard のレンダリング）
- 手順 3: テキスト入力で回答を送信する
- 手順 4: 次の質問が表示されることを確認する
- 手順 5: 各 UserInputKind（text, select, multiSelect, confirm, freeform）の UI が正しく表示されることを確認する
- 手順 6: 会話の進捗表示が正しく更新されることを確認する

**確認項目**:

- [ ] 質問が正しく表示される
- [ ] 回答の送信が正常動作する
- [ ] 各 UserInputKind の UI が正しい
- [ ] 会話の進捗が正しく表示される

### Task 3: IPC 経路の動作確認

- 手順 1: DevTools を開いた状態で会話を実行する
- 手順 2: Network / Console タブで IPC 呼び出しが正しい経路を使用していることを確認する
- 手順 3: IPC エラー時の UI 表示を確認する（ネットワーク切断のシミュレーション等）

**確認項目**:

- [ ] IPC 呼び出しが正しい経路を使用している
- [ ] IPC エラー時に適切なエラー表示がある

### Task 4: 孤立参照の不在確認

- 手順 1: デモ HTML ファイルが削除されていることをファイルシステムで確認する
- 手順 2: ConversationPanel への不正な参照が残存していないことを grep で確認する:
  ```bash
  grep -rn "SkillCreatorConversationPanel" apps/desktop/ --include="*.html"
  ```

**確認項目**:

- [ ] デモ HTML が削除されている
- [ ] 孤立参照が存在しない

### Task 5: ConversationalInterview との共存確認

- 手順 1: SkillLifecyclePanel 内の ConversationalInterview が引き続き正常動作することを確認する
- 手順 2: ConversationPanel と ConversationalInterview を切り替えて操作する
- 手順 3: 両方のパネルで QuestionCard が正しくレンダリングされることを確認する

**確認項目**:

- [ ] ConversationalInterview が正常動作する
- [ ] 両パネル間の切り替えが正常
- [ ] QuestionCard が両方のコンテキストで正しく描画される

## 参照資料

| 資料名           | パス                                       | 説明           |
| ---------------- | ------------------------------------------ | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`  | gate 通過条件  |
| 実装記録         | `outputs/phase-5/implementation-record.md` | 変更内容の参照 |
| 設計書           | `outputs/phase-2/design-document.md`       | 設計意図       |

## 成果物

| 成果物         | パス                                     | 説明                                 |
| -------------- | ---------------------------------------- | ------------------------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 各手順の確認結果、スクリーンショット |

## 完了条件

- [ ] ナビゲーション到達性が手動確認されている
- [ ] 会話フローが正常動作することが確認されている
- [ ] IPC 経路の動作が確認されている
- [ ] 孤立参照の不在が確認されている
- [ ] ConversationalInterview との共存が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
