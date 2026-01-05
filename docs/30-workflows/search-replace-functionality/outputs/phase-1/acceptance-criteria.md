# 検索・置換機能 - 受け入れ基準

## ファイル内検索

### AC-001: 検索パネルの表示

```gherkin
Feature: 検索パネルの表示

Scenario: Ctrl+Fで検索パネルを開く
  Given エディターでファイルが開かれている
  When ユーザーがCtrl+Fを押下する
  Then 検索パネルが表示される
  And 検索入力フィールドにフォーカスが当たる

Scenario: Escapeで検索パネルを閉じる
  Given 検索パネルが開いている
  When ユーザーがEscapeを押下する
  Then 検索パネルが閉じる
  And エディターにフォーカスが戻る
```

### AC-002: インクリメンタル検索

```gherkin
Feature: インクリメンタル検索

Scenario: 文字入力で即座に検索
  Given 検索パネルが開いている
  And エディターに "hello world" が含まれている
  When ユーザーが "hello" と入力する
  Then "hello" がハイライト表示される
  And 検索結果数が "1/1" と表示される

Scenario: 複数マッチの場合
  Given エディターに "test" が3箇所ある
  When ユーザーが "test" と入力する
  Then 3箇所がハイライト表示される
  And 検索結果数が "1/3" と表示される

Scenario: マッチなしの場合
  Given エディターに "hello" が含まれていない
  When ユーザーが "hello" と入力する
  Then 検索結果数が "0件" と表示される
  And 入力フィールドが警告色で表示される
```

### AC-003: 検索結果ナビゲーション

```gherkin
Feature: 検索結果ナビゲーション

Scenario: F3で次の結果に移動
  Given 検索結果が3件ある
  And 現在位置が "1/3" である
  When ユーザーがF3を押下する
  Then カーソルが次のマッチ位置に移動する
  And 現在位置が "2/3" に更新される

Scenario: Shift+F3で前の結果に移動
  Given 検索結果が3件ある
  And 現在位置が "2/3" である
  When ユーザーがShift+F3を押下する
  Then カーソルが前のマッチ位置に移動する
  And 現在位置が "1/3" に更新される

Scenario: 最後の結果から最初に戻る
  Given 検索結果が3件ある
  And 現在位置が "3/3" である
  When ユーザーがF3を押下する
  Then カーソルが最初のマッチ位置に移動する
  And 現在位置が "1/3" に更新される
```

### AC-004: 検索オプション

```gherkin
Feature: 検索オプション

Scenario: 大文字/小文字を区別して検索
  Given エディターに "Hello" と "hello" がある
  When 大文字/小文字区別オプションをONにする
  And "Hello" と入力する
  Then "Hello" のみがマッチする
  And "hello" はマッチしない

Scenario: 単語単位で検索
  Given エディターに "test" と "testing" がある
  When 単語単位オプションをONにする
  And "test" と入力する
  Then "test" のみがマッチする
  And "testing" はマッチしない

Scenario: 正規表現で検索
  Given エディターに "test1", "test2", "test3" がある
  When 正規表現オプションをONにする
  And "test\d" と入力する
  Then 全てがマッチする
```

---

## ファイル内置換

### AC-005: 単一置換

```gherkin
Feature: 単一置換

Scenario: 現在のマッチを置換
  Given 検索結果が3件ある
  And 現在位置が "1/3" である
  And 置換テキストに "replaced" が入力されている
  When 単一置換ボタンをクリックする
  Then 現在のマッチが "replaced" に置換される
  And 次のマッチに移動する
  And 検索結果数が "1/2" に更新される
```

### AC-006: 全置換

```gherkin
Feature: 全置換

Scenario: 全てのマッチを置換
  Given 検索結果が5件ある
  And 置換テキストに "new" が入力されている
  When 全置換ボタンをクリックする
  Then 全てのマッチが "new" に置換される
  And "5件を置換しました" と表示される
  And 検索結果数が "0件" になる

Scenario: 正規表現キャプチャグループを使った置換
  Given 正規表現オプションがONである
  And 検索テキストが "(\w+)@(\w+)" である
  And 置換テキストが "$2.$1" である
  And "user@domain" がエディターにある
  When 置換を実行する
  Then "domain.user" に置換される
```

---

## ワークスペース検索

### AC-007: ワークスペース検索パネル

```gherkin
Feature: ワークスペース検索パネル

Scenario: Ctrl+Shift+Fでパネルを開く
  Given ワークスペースが開かれている
  When ユーザーがCtrl+Shift+Fを押下する
  Then ワークスペース検索パネルが表示される
  And 検索入力フィールドにフォーカスが当たる
```

### AC-008: ワークスペース全体の検索

```gherkin
Feature: ワークスペース全体の検索

Scenario: 複数ファイルにまたがる検索
  Given ワークスペースに以下のファイルがある:
    | ファイル | 内容 |
    | src/a.ts | const foo = "test" |
    | src/b.ts | function test() {} |
  When "test" で検索する
  Then 2ファイルの結果が表示される
  And 各ファイルのマッチ行が表示される

Scenario: 検索結果のコンテキスト表示
  Given ファイルの10行目にマッチがある
  When 検索結果を表示する
  Then マッチ行の前後1行が表示される

Scenario: node_modulesを除外
  Given ワークスペースにnode_modulesがある
  When デフォルト設定で検索する
  Then node_modules内のファイルは検索されない
```

### AC-009: 検索結果からファイルを開く

```gherkin
Feature: 検索結果からファイルを開く

Scenario: 検索結果クリックでファイルを開く
  Given ワークスペース検索結果が表示されている
  And "src/utils.ts:25" という結果がある
  When その結果をクリックする
  Then "src/utils.ts" がエディターで開かれる
  And カーソルが25行目に移動する
  And マッチ箇所がハイライトされる
```

---

## ワークスペース置換

### AC-010: ワークスペース全体の置換

```gherkin
Feature: ワークスペース全体の置換

Scenario: 複数ファイルの置換（確認あり）
  Given ワークスペース検索結果が10ファイルにある
  And 置換テキストが入力されている
  When 置換ボタンをクリックする
  Then 確認ダイアログが表示される
  And "10ファイルで置換を実行しますか？" と表示される

Scenario: 置換を実行
  Given 確認ダイアログが表示されている
  When 確認ボタンをクリックする
  Then 全ファイルで置換が実行される
  And "10ファイルで25件を置換しました" と表示される

Scenario: 置換をキャンセル
  Given 確認ダイアログが表示されている
  When キャンセルボタンをクリックする
  Then 置換は実行されない
  And 検索結果画面に戻る
```

### AC-011: 置換プレビュー

```gherkin
Feature: 置換プレビュー

Scenario: 変更内容のプレビュー
  Given ワークスペース検索結果がある
  When プレビューボタンをクリックする
  Then 各ファイルの変更がdiff形式で表示される
  And 削除行は赤、追加行は緑で表示される
```

---

## アクセシビリティ

### AC-012: キーボード操作

```gherkin
Feature: キーボード操作

Scenario: 検索パネル内のTab移動
  Given 検索パネルが開いている
  When Tabキーを押下する
  Then フォーカスが次の要素に移動する
  And フォーカス状態が視覚的に明確である

Scenario: 検索オプションのキーボード操作
  Given 検索オプションにフォーカスがある
  When Enterキーを押下する
  Then オプションが切り替わる
```

### AC-013: スクリーンリーダー対応

```gherkin
Feature: スクリーンリーダー対応

Scenario: 検索入力フィールドのラベル
  Given スクリーンリーダーを使用している
  When 検索入力フィールドにフォーカスする
  Then "検索" というラベルが読み上げられる

Scenario: 検索結果の読み上げ
  Given スクリーンリーダーを使用している
  When 検索結果が更新される
  Then "3件の結果" という状態が読み上げられる
```

---

## パフォーマンス

### AC-014: 検索パフォーマンス

```gherkin
Feature: 検索パフォーマンス

Scenario: 大きなファイルでの検索
  Given 1MBのファイルが開かれている
  When 検索を実行する
  Then 100ms以内に結果が表示される

Scenario: 大規模ワークスペースでの検索
  Given 1000ファイルのワークスペースがある
  When ワークスペース検索を実行する
  Then 3秒以内に検索が完了する
  And 検索中はプログレスインジケーターが表示される
```
