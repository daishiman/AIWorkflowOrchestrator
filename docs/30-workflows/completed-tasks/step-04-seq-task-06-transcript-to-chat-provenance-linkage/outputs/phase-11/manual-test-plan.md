# Phase 11: 手動テスト計画

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 目的

V-M1~V-M9のwalkthrough手順を定義する。設計タスクのため実際のUI操作は実装フェーズ後に行い、本書では手順・期待結果・前提条件を定義する。

---

## テスト環境前提条件

- Electronアプリがビルド・起動済みであること
- テスト用ワークスペースが作成済みであること
- テスト用Transcriptセッション（20メッセージ以上）が存在すること
- ChatPanelが表示可能な状態であること

---

## V-M1: TranscriptPanel の基本表示確認

### Precondition

- ワークスペースが開かれている
- Transcriptが1件以上存在する

### Action

1. サイドバーまたはツールバーから「Transcript」ボタンをクリックする
2. TranscriptPanelが表示されることを確認する
3. セッションリストからトランスクリプトを選択する

### Expected Result

- TranscriptPanelがスライドインまたはパネル表示される
- セッションのメッセージが時系列順にレンダリングされる
- 各メッセージにAI/ユーザーの区別が視覚的についている

### Pass Criteria

- パネルの表示に500ms以上かからない
- スクロールが正常に動作する

---

## V-M2: OP-1 テキスト選択からチャット送信

### Precondition

- TranscriptPanelが表示されている
- ChatPanelが開かれている

### Action

1. TranscriptPanel内のAIメッセージテキストをドラッグで選択する
2. 選択後300ms以内に `TranscriptSelectionToolbar` が表示されることを確認する
3. 「選択範囲をチャットへ送る」ボタンをクリックする
4. ChatPanelの入力エリアに選択テキストが引用形式で追記されることを確認する
5. ユーザーがメッセージを編集して「送信」ボタンをクリックする

### Expected Result

- ChatPanelに送信されたメッセージが `transcriptProvenance.sourceType === 'range'` を持つ
- メッセージに `TranscriptProvenanceChip` が表示される
- チップにセッション名と日時が表示される

### Pass Criteria

- 送信後、TranscriptPanelの選択状態がリセットされる
- チャット送信まで一切のauto-sendが発生しない（必ずユーザーの明示的な「送信」操作が必要）

---

## V-M3: OP-2 直近出力を添付

### Precondition

- TranscriptPanelが表示されている
- セッションに直近のAI出力が存在する

### Action

1. `TranscriptSelectionToolbar` の「直近出力を添付」ボタンをクリックする（テキスト選択不要）
2. ChatPanelの入力エリアに直近AI出力が追記されることを確認する
3. ユーザーが追記せず「送信」ボタンをクリックする

### Expected Result

- 添付されるのは「最後のAIメッセージ」の内容のみ（それ以外は含まれない）
- `transcriptProvenance.sourceType === 'last-output'` が設定される
- `messageRange` は省略されている（nullまたはundefined）

### Pass Criteria

- 隠れたパース（hidden parsing）が行われていない（表示されているテキストと添付内容が一致する）
- 10,000文字を超える直近出力は切り捨てられ、「...[省略]」が表示される

---

## V-M4: OP-3 セッションを貼り付ける

### Precondition

- TranscriptPanelが表示されている
- ChatPanelが開かれている

### Action

1. TranscriptPanel上部の「セッションを貼り付ける」ボタンをクリックする
2. 確認ダイアログが表示された場合は「OK」をクリックする
3. ChatPanelの入力エリアにセッション全体が貼り付けられることを確認する

### Expected Result

- `transcriptProvenance.sourceType === 'session'` が設定される
- `sessionTitle` がセッション名と一致する
- セッション内容が自動要約されていない（原文のまま）
- 10,000文字超の場合は末尾が切り捨てられ「...[省略]」が表示される

### Pass Criteria

- 貼り付け処理の完了に1秒以上かからない
- 自動要約が一切行われていない

---

## V-M5: TranscriptProvenanceChip の表示確認

### Precondition

- V-M2またはV-M3を実行し、`transcriptProvenance` 付きメッセージが存在する

### Action

1. ChatPanelで `transcriptProvenance` 付きメッセージを確認する
2. メッセージ下部または上部に `TranscriptProvenanceChip` が表示されていることを確認する
3. チップをホバーして詳細情報が表示されることを確認する

### Expected Result

- チップにsourceType（「選択範囲」「直近出力」「セッション」）が表示される
- チップにセッションタイトルが表示される
- チップにsharedAtの日時が表示される
- チップのスタイルがチャットメッセージの可読性を損なわない

### Pass Criteria

- Apple HIG準拠のカラーが使用されている
- チップのコントラスト比が4.5:1以上

---

## V-M6: provenance付きメッセージの永続性確認

### Precondition

- V-M2を実行し、`transcriptProvenance` 付きメッセージが存在する

### Action

1. TranscriptPanelを閉じる
2. アプリを再起動する
3. 同じチャットセッションを開く

### Expected Result

- 再起動後もメッセージの `TranscriptProvenanceChip` が表示されている
- チップの内容（sessionTitle・sharedAt・sourceType）が再起動前と一致する

### Pass Criteria

- データが正しく永続化されている（SQLiteへの保存が確認できる）

---

## V-M7: 連続OP実行の非干渉性確認

### Precondition

- TranscriptPanelが表示されている
- ChatPanelが開かれている

### Action

1. OP-1を実行してメッセージをチャットに送信する
2. 続けてOP-2を実行して別のメッセージをチャットに送信する
3. 2つのメッセージそれぞれの `transcriptProvenance` を確認する

### Expected Result

- 1つ目のメッセージ: `sourceType === 'range'`、選択テキストを含む
- 2つ目のメッセージ: `sourceType === 'last-output'`、直近AI出力を含む
- 両者の `transcriptProvenance` が互いに干渉していない

### Pass Criteria

- 各メッセージが独立した `transcriptProvenance` オブジェクトを持つ
- 一方のprovenanceが他方に影響していない

---

## V-M8: ワークスペース切り替え時の状態リセット確認

### Precondition

- ワークスペースAでTranscriptPanelを開き、テキストを選択した状態

### Action

1. 選択状態を維持したままワークスペースBに切り替える
2. ワークスペースBのTranscriptPanelを確認する

### Expected Result

- ワークスペースBのTranscriptPanelは選択状態がリセットされている
- ワークスペースAの選択内容がワークスペースBに引き継がれていない

### Pass Criteria

- 選択状態がワークスペース間で漏洩しない

---

## V-M9: エラー時のフォールバック動作確認

### Precondition

- ネットワーク接続を切断またはセッションデータを意図的に破損させる

### Action

1. OP-3（セッションを貼り付ける）を実行する
2. エラーが発生することを確認する

### Expected Result

- エラーメッセージがユーザーに分かりやすく表示される（「セッションを読み込めませんでした」等）
- アプリがクラッシュしない
- ChatPanelの状態が保持されている（入力済みテキストが消えない）
- エラー情報に内部パス・スタックトレースが含まれていない（P55対策）

### Pass Criteria

- エラー回復後に再試行できる
- コンソールにセキュリティ上問題のある情報が出力されていない

---

## テスト実行チェックリスト

| テストID | 実行日 | 担当 | 結果 | 備考                     |
| -------- | ------ | ---- | ---- | ------------------------ |
| V-M1     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M2     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M3     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M4     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M5     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M6     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M7     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M8     | -      | -    | -    | 設計タスク：実装後に実行 |
| V-M9     | -      | -    | -    | 設計タスク：実装後に実行 |
