# Phase 1: 受け入れ基準

## 概要

Environment Backend（AGENT-007）の受け入れ基準をGiven-When-Then形式で定義。

## 受け入れ基準（Gherkin形式）

````gherkin
Feature: 実行環境管理バックエンド

Scenario: HTMLコードブロックを抽出できる
  Given エージェント出力に以下が含まれる:
    """
    ```html
    <div>Hello World</div>
    ```
    """
  When ContentExtractorで処理する
  Then HTML部分が抽出される
  And タイプが "html" と判定される

Scenario: 複数のコードブロックを抽出できる
  Given エージェント出力に複数のコードブロックがある
  When ContentExtractorで処理する
  Then すべてのコードブロックが抽出される
  And 各コードブロックに順序番号が付与される

Scenario: HTMLがサニタイズされる
  Given 抽出されたHTMLに<script>タグが含まれる
  When ContentSanitizerで処理する
  Then <script>タグが除去される
  And onclick等のイベントハンドラが除去される

Scenario: 危険なタグが除去される
  Given 抽出されたHTMLに<iframe>タグが含まれる
  When ContentSanitizerで処理する
  Then <iframe>タグが除去される
  And <object>、<embed>タグも除去される

Scenario: javascript:プロトコルが除去される
  Given 抽出されたHTMLにjavascript:リンクが含まれる
  When ContentSanitizerで処理する
  Then javascript:プロトコルが除去される

Scenario: 一時ファイルとして保存できる
  Given 抽出されたコンテンツがある
  When TempFileManagerで保存する
  Then 一時ディレクトリにファイルが作成される
  And ファイルパーミッションは0o600である
  And ファイルパスが返される

Scenario: 一時ファイルが適切にクリーンアップされる
  Given 一時ファイルが作成されている
  When クリーンアップを実行する
  Then 一時ファイルが削除される
  And 追跡リストがクリアされる

Scenario: IPC経由でプレビューコンテンツを取得できる
  Given エージェント出力が処理済みである
  When agent:get-previewを呼び出す
  Then 抽出・サニタイズ済みのコンテンツが返される

Scenario: コードブロックなしの場合
  Given エージェント出力にコードブロックがない
  When ContentExtractorで処理する
  Then 空の配列が返される

Scenario: 空のコードブロックの場合
  Given エージェント出力に空のコードブロックがある
  When ContentExtractorで処理する
  Then 空のコードブロックも抽出される

Scenario: 言語指定なしのコードブロック
  Given エージェント出力に言語指定なしのコードブロックがある
  When ContentExtractorで処理する
  Then タイプが "text" と判定される
````

## 検証マトリクス

| シナリオ               | 要件ID        | テストファイル             | 状態 |
| ---------------------- | ------------- | -------------------------- | ---- |
| HTMLコードブロック抽出 | FR-01         | ContentExtractor.test.ts   | ✓    |
| 複数コードブロック     | FR-03         | ContentExtractor.test.ts   | ✓    |
| HTMLサニタイズ         | FR-04, NFR-01 | ContentSanitizer.test.ts   | ✓    |
| 危険タグ除去           | NFR-01        | ContentSanitizer.test.ts   | ✓    |
| javascript:除去        | NFR-01        | ContentSanitizer.test.ts   | ✓    |
| 一時ファイル保存       | FR-05, NFR-02 | TempFileManager.test.ts    | ✓    |
| クリーンアップ         | FR-06, NFR-03 | TempFileManager.test.ts    | ✓    |
| IPC取得                | FR-07         | EnvironmentService.test.ts | ✓    |
| コードブロックなし     | -             | ContentExtractor.test.ts   | ✓    |
