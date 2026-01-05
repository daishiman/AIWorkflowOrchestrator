# チャット履歴永続化機能 - 受け入れ基準

## AC-001: セッション作成

### AC-001-1: デフォルトタイトル生成

```gherkin
Given ユーザーがログインしている
When タイトルを指定せずに新規セッションを作成する
Then セッションが作成される
And タイトルは「新しいチャット YYYY-MM-DD HH:mm」形式である
```

### AC-001-2: カスタムタイトル

```gherkin
Given ユーザーがログインしている
When タイトル「React開発の質問」を指定してセッションを作成する
Then セッションのタイトルが「React開発の質問」である
```

## AC-002: メッセージ保存

### AC-002-1: ユーザーメッセージ

```gherkin
Given セッションが存在する
When ユーザーが「こんにちは」とメッセージを送信する
Then メッセージがrole="user"で保存される
And messageIndexが自動採番される
```

### AC-002-2: アシスタントメッセージ

```gherkin
Given セッションが存在する
When AIが応答を生成する
Then メッセージがrole="assistant"で保存される
And llmProvider, llmModel, llmMetadataが保存される
```

## AC-003: セッション一覧

### AC-003-1: 基本一覧取得

```gherkin
Given ユーザーが3つのセッションを持っている
When セッション一覧を取得する
Then 3件のセッションが返却される
And 作成日時の降順でソートされている
```

### AC-003-2: ピン留めセッションの優先表示

```gherkin
Given ユーザーが通常セッションとピン留めセッションを持っている
When セッション一覧を取得する
Then ピン留めセッションが先頭に表示される
```

## AC-004: 検索

### AC-004-1: キーワード検索

```gherkin
Given 「React」を含むセッションが2件存在する
When 「React」で検索する
Then 2件のセッションが返却される
```

### AC-004-2: お気に入りフィルター

```gherkin
Given お気に入りセッションが1件存在する
When isFavorite=trueでフィルターする
Then 1件のセッションが返却される
```

## AC-005: 削除

### AC-005-1: セッション削除

```gherkin
Given セッションが存在する
When セッションを削除する
Then セッションが論理削除される
And 関連メッセージも削除される
```

## AC-006: エクスポート

### AC-006-1: Markdownエクスポート

```gherkin
Given セッションに2件のメッセージが存在する
When Markdown形式でエクスポートする
Then Markdownファイルが生成される
And タイトルがヘッダーとして含まれる
And メッセージがセクションとして含まれる
```

### AC-006-2: JSONエクスポート

```gherkin
Given セッションに2件のメッセージが存在する
When JSON形式でエクスポートする
Then JSONファイルが生成される
And version, exportedAt, session, messagesを含む
```

## AC-007: お気に入り/ピン留め

### AC-007-1: お気に入り登録

```gherkin
Given セッションが存在する
When お気に入りに登録する
Then isFavoriteがtrueになる
```

### AC-007-2: ピン留め

```gherkin
Given セッションが存在する
And ピン留め数が10件未満
When ピン留めする
Then isPinnedがtrueになる
And pinOrderが設定される
```

### AC-007-3: ピン留め上限

```gherkin
Given ピン留めセッションが10件存在する
When 新たにピン留めを試みる
Then エラーが発生する
And 「ピン留めは最大10件までです」と表示される
```

## AC-008: テストカバレッジ

### AC-008-1: カバレッジ達成

```gherkin
Given 全てのテストが実行される
When カバレッジレポートを生成する
Then カバレッジが80%以上である
```
