# エージェント実行UI 受け入れ基準

## 概要

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-004                  |
| 機能名   | agent-execution-ui         |
| 作成日   | 2026-01-12                 |
| 形式     | Gherkin（Given-When-Then） |

---

## 機能要件 受け入れ基準

```gherkin
Feature: エージェント実行UI

  Background:
    Given ユーザーがAIWorkflowOrchestratorデスクトップアプリを起動している
    And スキルがインポートされている

  # FR-01: スキル実行画面への遷移
  @FR-01 @priority-high
  Scenario: スキル選択後に実行画面に遷移する
    Given ユーザーがAgentViewを表示している
    And スキル一覧から任意のスキルを選択している
    And SkillDetailPanelが表示されている
    When 「実行」ボタンをクリックする
    Then AgentExecutionViewが表示される
    And 選択したスキル名が上部に表示される
    And スキルの説明が表示される
    And メッセージ入力欄が表示される

  # FR-02: メッセージ入力・送信
  @FR-02 @priority-high
  Scenario: メッセージをボタンで送信できる
    Given ユーザーがAgentExecutionViewを表示している
    And メッセージ入力欄に「こんにちは」と入力している
    When 「送信」ボタンをクリックする
    Then ユーザーのメッセージがチャット履歴に表示される
    And メッセージ入力欄がクリアされる
    And 入力欄と送信ボタンが無効化される
    And ローディングインジケーターが表示される

  @FR-02 @priority-high
  Scenario: メッセージをEnterキーで送信できる
    Given ユーザーがAgentExecutionViewを表示している
    And メッセージ入力欄に「こんにちは」と入力している
    When Enterキーを押す
    Then ユーザーのメッセージがチャット履歴に表示される
    And メッセージ入力欄がクリアされる

  @FR-02 @priority-high
  Scenario: 空のメッセージは送信できない
    Given ユーザーがAgentExecutionViewを表示している
    And メッセージ入力欄が空である
    Then 「送信」ボタンが無効化されている
    When Enterキーを押す
    Then 何も起こらない

  # FR-03: ストリーミング出力表示
  @FR-03 @priority-high
  Scenario: エージェントの出力がストリーミングで表示される
    Given ユーザーがメッセージを送信した
    When エージェントが応答を生成している
    Then 出力がリアルタイムで表示される
    And テキストが順次追加される形で表示される
    And ローディングインジケーターが表示される

  @FR-03 @priority-high
  Scenario: エージェントの応答が完了する
    Given エージェントが応答を生成している
    When エージェントの応答が完了する
    Then ローディングインジケーターが非表示になる
    And 入力欄と送信ボタンが有効化される
    And 完全な応答がチャット履歴に表示される

  # FR-04: 実行キャンセル
  @FR-04 @priority-high
  Scenario: 実行をキャンセルできる
    Given エージェントが実行中である
    And 「キャンセル」ボタンが表示されている
    When 「キャンセル」ボタンをクリックする
    Then 実行が中断される
    And 「実行がキャンセルされました」とチャット履歴に表示される
    And 入力欄と送信ボタンが有効化される

  @FR-04 @priority-high
  Scenario: 待機中はキャンセルボタンが非表示
    Given エージェントが待機中である（実行中でない）
    Then 「キャンセル」ボタンが表示されていない

  # FR-05: チャット履歴クリア
  @FR-05 @priority-medium
  Scenario: チャット履歴をクリアできる
    Given チャット履歴にメッセージがある
    When 「クリア」ボタンをクリックする
    Then 確認ダイアログが表示される
    And 「チャット履歴をクリアしますか？」と表示される

  @FR-05 @priority-medium
  Scenario: クリア確認ダイアログで「はい」を選択
    Given 確認ダイアログが表示されている
    When 「はい」ボタンをクリックする
    Then ダイアログが閉じる
    And チャット履歴がクリアされる
    And 初期状態に戻る

  @FR-05 @priority-medium
  Scenario: クリア確認ダイアログで「いいえ」を選択
    Given 確認ダイアログが表示されている
    When 「いいえ」ボタンをクリックする
    Then ダイアログが閉じる
    And チャット履歴はそのまま残る

  # FR-06: エラーメッセージ表示
  @FR-06 @priority-high
  Scenario: エラーが発生した場合にエラーメッセージが表示される
    Given ユーザーがメッセージを送信した
    When エージェント実行中にエラーが発生する
    Then エラーメッセージがチャット履歴に表示される
    And エラーメッセージは赤色のスタイルで表示される
    And エラーアイコンが表示される
    And 入力欄と送信ボタンが有効化される

  @FR-06 @priority-high
  Scenario: ネットワークエラーが発生した場合
    Given ユーザーがメッセージを送信した
    When ネットワーク接続が切断される
    Then 「ネットワークエラーが発生しました」と表示される
    And 「再試行」ボタンが表示される

  # FR-07: Permission Dialog表示
  @FR-07 @priority-high
  Scenario: 権限確認ダイアログが表示される
    Given エージェントが実行中である
    When askルールに該当するツールが呼び出される
    Then PermissionDialogが表示される
    And ツール名が表示される
    And ツールの引数が表示される
    And 「許可」ボタンが表示される
    And 「拒否」ボタンが表示される

  @FR-07 @priority-high
  Scenario: PermissionDialogはモーダルとして表示される
    Given PermissionDialogが表示されている
    Then 背景がオーバーレイで覆われる
    And ダイアログ外をクリックしてもダイアログは閉じない
    And フォーカスがダイアログ内にトラップされる

  # FR-08: Permission Dialog許可/拒否
  @FR-08 @priority-high
  Scenario: 権限確認ダイアログで許可できる
    Given PermissionDialogが表示されている
    When 「許可」ボタンをクリックする
    Then ダイアログが閉じる
    And エージェントの実行が続行される
    And ツールが実行される

  @FR-08 @priority-high
  Scenario: 権限確認ダイアログで拒否できる
    Given PermissionDialogが表示されている
    When 「拒否」ボタンをクリックする
    Then ダイアログが閉じる
    And エージェントにツール使用が拒否されたことが通知される
    And エージェントは拒否を考慮して応答を継続する

  # FR-09: Permission選択の記憶
  @FR-09 @priority-medium
  Scenario: 権限確認ダイアログで選択を記憶できる
    Given PermissionDialogが表示されている
    And 「このツールの選択を記憶する」チェックボックスが表示されている
    When チェックボックスをオンにする
    And 「許可」ボタンをクリックする
    Then 選択が保存される

  @FR-09 @priority-medium
  Scenario: 記憶した選択で次回確認がスキップされる
    Given 以前に「Bash」ツールを「許可」で記憶した
    When 「Bash」ツールがaskルールで呼び出される
    Then PermissionDialogは表示されない
    And ツールが自動的に実行される

  @FR-09 @priority-medium
  Scenario: 記憶した選択で次回拒否がスキップされる
    Given 以前に「Bash」ツールを「拒否」で記憶した
    When 「Bash」ツールがaskルールで呼び出される
    Then PermissionDialogは表示されない
    And ツールが自動的に拒否される
```

---

## 非機能要件 受け入れ基準

```gherkin
Feature: エージェント実行UI 非機能要件

  # NFR-01: ストリーミング遅延
  @NFR-01 @priority-high @performance
  Scenario: ストリーミング遅延が200ms以下
    Given エージェントが応答を生成している
    When Main Processがメッセージを送信する
    Then Renderer Processでの表示までの遅延が200ms以下である
    And 95パーセンタイルで200ms以下を達成する

  # NFR-02: キーボードナビゲーション
  @NFR-02 @priority-high @accessibility
  Scenario: Tabキーでフォーカス移動できる
    Given AgentExecutionViewが表示されている
    When Tabキーを押す
    Then 次のインタラクティブ要素にフォーカスが移動する

  @NFR-02 @priority-high @accessibility
  Scenario: Shift+Tabキーでフォーカス逆移動できる
    Given AgentExecutionViewが表示されている
    And 送信ボタンにフォーカスがある
    When Shift+Tabキーを押す
    Then 前のインタラクティブ要素にフォーカスが移動する

  @NFR-02 @priority-high @accessibility
  Scenario: EscapeキーでPermissionDialogを閉じられる
    Given PermissionDialogが表示されている
    When Escapeキーを押す
    Then ダイアログが閉じる
    And ツール使用が拒否される

  # NFR-03: スクリーンリーダー対応
  @NFR-03 @priority-medium @accessibility
  Scenario: aria-label属性が設定されている
    Given AgentExecutionViewが表示されている
    Then メッセージ入力欄にaria-labelが設定されている
    And 送信ボタンにaria-labelが設定されている
    And キャンセルボタンにaria-labelが設定されている

  @NFR-03 @priority-medium @accessibility
  Scenario: ライブリージョンで動的コンテンツが読み上げられる
    Given スクリーンリーダーが有効である
    When 新しいメッセージがチャット履歴に追加される
    Then スクリーンリーダーが新しいメッセージを読み上げる

  # NFR-04: メモリリーク防止
  @NFR-04 @priority-high @performance
  Scenario: 長時間実行でメモリリークがない
    Given AgentExecutionViewを使用している
    When 1時間以上の連続実行を行う
    Then ヒープメモリ使用量が継続的に増加しない
    And イベントリスナーが適切にクリーンアップされる

  # NFR-05: テストカバレッジ
  @NFR-05 @priority-high @quality
  Scenario: テストカバレッジ基準を満たす
    Given テストスイートが実行される
    Then Line Coverageが80%以上である
    And Branch Coverageが60%以上である
    And Function Coverageが80%以上である
```

---

## 統合テスト 受け入れ基準

```gherkin
Feature: エージェント実行UI 統合テスト

  # IPC通信
  @integration @ipc
  Scenario: agent:query IPCが正常に動作する
    Given Renderer ProcessからMain Processへの接続が確立されている
    When agent:queryチャンネルでクエリを送信する
    Then Main Processがクエリを受信する
    And 処理が開始される

  @integration @ipc
  Scenario: agent:stream IPCが正常に動作する
    Given エージェントが実行中である
    When Main Processがストリーミングメッセージを送信する
    Then Renderer Processがメッセージを受信する
    And UIに表示される

  @integration @ipc
  Scenario: agent:abort IPCが正常に動作する
    Given エージェントが実行中である
    When Renderer Processからagent:abortを送信する
    Then Main Processで実行が中断される
    And Renderer Processに中断完了が通知される

  # Permission連携
  @integration @permission
  Scenario: Permission要求・応答の往復
    Given エージェントが実行中である
    When askルール該当ツールが呼び出される
    Then agent:permissionがRenderer Processに送信される
    And PermissionDialogが表示される
    When ユーザーが「許可」を選択する
    Then agent:permission:resがMain Processに送信される
    And ツールが実行される
```

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
