# Claude Agent SDK統合 - 受け入れ基準

## 概要

本ドキュメントは、Claude Agent SDK統合機能の受け入れ基準をGiven-When-Then形式で定義する。

---

## 機能要件の受け入れ基準

### AC-FR01: SDK query() API実行

```gherkin
Feature: SDK query() APIでエージェントを実行

Scenario: スキルを使用してエージェントを実行できる
  Given スキルが選択されている
  And ユーザーがメッセージを入力している
  When agent:startを呼び出す
  Then SDK query() APIが呼び出される
  And スキルコンテキストがsettingSourcesで渡される
  And executionIdが返される

Scenario: toolsオプションでツールを制限できる
  Given スキルが選択されている
  And toolsオプションに["Read", "Grep"]が指定されている
  When agent:startを呼び出す
  Then 指定されたツールのみが使用可能になる

Scenario: スキルなしでエージェントを実行できる
  Given スキルが選択されていない
  And ユーザーがメッセージを入力している
  When agent:startを呼び出す
  Then SDK query() APIが呼び出される
  And settingSourcesは空配列で渡される
```

### AC-FR02: Hooksシステム

```gherkin
Feature: Hooksシステムでツール使用を制御

Scenario: PreToolUseで危険なコマンドをブロックできる
  Given エージェントが実行中である
  And PreToolUse Hookが設定されている
  When 危険なBashコマンド（rm -rf）が実行されようとする
  Then PreToolUse Hookがproceed: falseを返す
  And ツール使用がブロックされる
  And ブロック理由がagent:streamで通知される

Scenario: PostToolUseでツール使用をログできる
  Given エージェントが実行中である
  And PostToolUse Hookが設定されている
  When ツールが正常に実行される
  Then PostToolUse Hookが呼び出される
  And ツール名と結果がログに記録される

Scenario: PermissionRequestでユーザー確認を求められる
  Given エージェントが実行中である
  And PermissionRequest Hookが設定されている
  When 権限確認が必要なツールが呼び出される
  Then agent:permissionイベントがRendererに送信される
  And Rendererからagent:permission:resで応答を受信する
```

### AC-FR03: Permission Control

```gherkin
Feature: Permission Rulesで権限を制御

Scenario: denyルールでツール使用を拒否できる
  Given denyルールに "Bash: rm -rf" が設定されている
  When "rm -rf /"コマンドが実行されようとする
  Then ツール使用が拒否される
  And エラーメッセージがユーザーに通知される

Scenario: allowルールでツール使用を許可できる
  Given allowルールに "Read: /project/**" が設定されている
  When /project/src/index.tsの読み取りが要求される
  Then ツール使用が自動的に許可される
  And ユーザー確認なしで実行される

Scenario: askルールでユーザー確認を求められる
  Given askルールに "Write" が設定されている
  When ファイル書き込みが要求される
  Then ユーザー確認ダイアログが表示される
  And ユーザーの応答に基づいて処理が継続または中断される

Scenario: ルールの優先順位が正しく適用される
  Given denyルール、allowルール、askルールが設定されている
  When ツール使用が要求される
  Then deny → allow → ask の順で評価される
```

### AC-FR04: ストリーミングIPC転送

```gherkin
Feature: ストリーミング出力をRendererに転送

Scenario: アシスタントメッセージを受信できる
  Given エージェントが実行中である
  When SDKがアシスタントメッセージを生成する
  Then agent:streamイベントがRendererに送信される
  And type: 'assistant'のメッセージが含まれる
  And content: テキスト内容が含まれる

Scenario: ツール使用結果を受信できる
  Given エージェントが実行中である
  When SDKがツールを実行して結果を返す
  Then agent:streamイベントがRendererに送信される
  And type: 'result'のメッセージが含まれる
  And ツール名と結果が含まれる

Scenario: 部分メッセージをストリーミングで受信できる
  Given includePartialMessages: trueが設定されている
  When SDKがトークン単位でメッセージを生成する
  Then type: 'stream_event'のメッセージがストリーミングで送信される
```

### AC-FR05: AbortSignalキャンセル

```gherkin
Feature: 実行をキャンセル

Scenario: agent:stopで実行をキャンセルできる
  Given エージェントが実行中である
  And executionIdが既知である
  When agent:stopを呼び出す
  Then AbortControllerがabort()される
  And 実行がキャンセルされる
  And agent:statusでcancelledステータスが送信される

Scenario: キャンセル後のクリーンアップ
  Given エージェントがキャンセルされた
  When クリーンアップ処理が実行される
  Then リソースが解放される
  And ExecutionManagerから実行が削除される
```

### AC-FR06: 複数実行管理

```gherkin
Feature: 複数の実行を管理

Scenario: 複数の実行を同時に管理できる
  Given 実行Aが進行中である
  When 新しい実行Bを開始する
  Then 実行Aと実行Bが独立して管理される
  And 各実行のストリームがexecutionIdで区別される

Scenario: 特定の実行をキャンセルできる
  Given 実行Aと実行Bが進行中である
  When 実行Aをキャンセルする
  Then 実行Aのみがキャンセルされる
  And 実行Bは継続される

Scenario: 実行状態を取得できる
  Given 複数の実行が存在する
  When agent:list-executionsを呼び出す
  Then 全実行のステータス一覧が返される
```

### AC-FR07: Permission Dialog連携

```gherkin
Feature: Permission Dialogでユーザー承認

Scenario: 権限確認ダイアログを表示できる
  Given askルールに該当するツール使用が発生した
  When PermissionRequest Hookが呼び出される
  Then agent:permissionがRendererに送信される
  And ダイアログにツール名、引数、理由が表示される

Scenario: ユーザーが承認した場合
  Given 権限確認ダイアログが表示されている
  When ユーザーが「許可」をクリックする
  Then agent:permission:resでapproved: trueが送信される
  And ツール使用が続行される

Scenario: ユーザーが拒否した場合
  Given 権限確認ダイアログが表示されている
  When ユーザーが「拒否」をクリックする
  Then agent:permission:resでapproved: falseが送信される
  And ツール使用がブロックされる
  And エージェントに拒否理由が通知される

Scenario: タイムアウトで自動拒否される
  Given 権限確認ダイアログが表示されている
  And タイムアウト設定が30秒である
  When 30秒間応答がない
  Then 自動的に拒否として処理される
  And ツール使用がブロックされる
```

---

## 非機能要件の受け入れ基準

### AC-NFR01: 危険コマンドブロック

```gherkin
Feature: 危険なコマンドをブロック

Scenario: rm -rfコマンドをブロックする
  Given エージェントが実行中である
  When Bashツールで "rm -rf /" が実行されようとする
  Then コマンドがブロックされる
  And "危険なコマンドは許可されていません" メッセージが返される

Scenario: sudoコマンドをブロックする
  Given エージェントが実行中である
  When Bashツールで "sudo apt install" が実行されようとする
  Then コマンドがブロックされる

Scenario: 安全なコマンドは許可される
  Given エージェントが実行中である
  When Bashツールで "ls -la" が実行されようとする
  Then コマンドが許可される
```

### AC-NFR02: システムディレクトリ保護

```gherkin
Feature: システムディレクトリを保護

Scenario: /etc/への書き込みを拒否する
  Given denyルールに "/etc/**" が設定されている
  When Writeツールで "/etc/passwd" への書き込みが要求される
  Then 書き込みが拒否される

Scenario: ~/.bashrcへの書き込みを拒否する
  Given denyルールに "**/.bashrc" が設定されている
  When Writeツールで "~/.bashrc" への書き込みが要求される
  Then 書き込みが拒否される

Scenario: プロジェクト内への書き込みは許可される
  Given allowルールに "/project/**" が設定されている
  When Writeツールで "/project/src/file.ts" への書き込みが要求される
  Then 書き込みが許可される
```

### AC-NFR03: ストリーミング遅延最小化

```gherkin
Feature: ストリーミング遅延を最小化

Scenario: IPC転送遅延が目標値以内である
  Given エージェントが実行中である
  When SDKからメッセージを受信する
  Then IPC転送遅延が50ms未満である

Scenario: バッチ処理でスループットを維持する
  Given 大量のストリーミングメッセージが発生している
  When メッセージをRendererに転送する
  Then UIの応答性が維持される
```

### AC-NFR04: AbortSignal伝播保証

```gherkin
Feature: AbortSignalを確実に伝播

Scenario: Hook内でAbortSignalをチェックする
  Given エージェントが実行中である
  And PreToolUse Hookが実行中である
  When agent:stopが呼び出される
  Then Hook内でsignal.abortedがtrueになる
  And Hookが早期終了する

Scenario: 長時間処理中にキャンセルできる
  Given エージェントが長時間タスクを実行中である
  When agent:stopが呼び出される
  Then 処理が中断される
  And リソースがクリーンアップされる
```

---

## 統合テスト受け入れ基準

### AC-INT01: エンドツーエンドフロー

```gherkin
Feature: エンドツーエンド実行フロー

Scenario: スキル選択→実行→完了の一連のフロー
  Given ユーザーがスキルを選択している
  And プロンプトを入力している
  When 「実行」ボタンをクリックする
  Then エージェントが開始される
  And ストリーミング出力がUIに表示される
  And 完了時にステータスがcompletedになる

Scenario: エラー発生時のフロー
  Given エージェントを実行している
  When SDKでエラーが発生する
  Then agent:stream(type: 'error')が送信される
  And agent:status(status: 'error')が送信される
  And UIにエラーメッセージが表示される

Scenario: キャンセルフロー
  Given エージェントが実行中である
  When 「停止」ボタンをクリックする
  Then 実行がキャンセルされる
  And UIにキャンセル通知が表示される
```

---

作成日: 2026-01-12
Phase: 1
ステータス: 完了
