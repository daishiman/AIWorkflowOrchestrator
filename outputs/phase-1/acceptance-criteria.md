# 受け入れ基準 - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | task-feat-slide-dependency-management-003  |
| バージョン | 1.0.0                                      |
| 作成日     | 2026-01-09                                 |
| 作成者     | Claude (acceptance-criteria-writing skill) |

---

## 2. 受け入れ基準一覧

### 2.1 ファイル監視・自動同期

#### AC-01: structure.md変更時の自動再生成

**対応要件**: FR-01, NFR-01

```gherkin
Feature: structure.md変更時の自動HTML再生成

  Scenario: structure.mdの変更を検知してindex.htmlを再生成する
    Given スライドプロジェクトが監視中の状態である
    And ファイルウォッチャーが正常に動作している
    When structure.mdファイルがユーザーによって変更される
    Then 500ms以内にファイル変更イベントが発火する
    And html-generatorスキルが自動実行される
    And index.htmlが最新のstructure.mdの内容で再生成される
    And 同期状態が「synced」に更新される
    And UIに同期完了が表示される

  Scenario: 変更検知のレイテンシ要件
    Given structure.mdファイルが監視対象である
    When ファイルが保存される
    Then 500ms以内に変更イベントがトリガーされる
```

#### AC-02: ファイルウォッチャーの起動

**対応要件**: FR-02, FR-11

```gherkin
Feature: ファイルウォッチャーの起動と状態管理

  Scenario: プロジェクトを開いた時にファイル監視を開始する
    Given Electronアプリが起動している
    And ファイルウォッチャーが停止状態である
    When スライドプロジェクトを開く
    Then ファイルウォッチャーがstructure.mdの監視を開始する
    And ファイルウォッチャーがindex.htmlの監視を開始する
    And 監視状態がUIに「監視中」と表示される
    And isWatching状態がtrueになる

  Scenario: 監視開始時の初期状態チェック
    Given 新しいプロジェクトが選択された
    When ファイルウォッチャーが起動する
    Then structure.mdとindex.htmlの整合性がチェックされる
    And 初期同期状態がUIに表示される
```

#### AC-03: 無限ループ防止

**対応要件**: NFR-04

```gherkin
Feature: ファイル変更の無限ループ防止

  Scenario: スキル実行による変更が再トリガーされない
    Given html-generatorスキルが実行中である
    When html-generatorによってindex.htmlが変更される
    Then 変更元がスキル実行であることを識別する
    And 追加のhtml-generator実行をトリガーしない
    And 変更コンテキストが「skill」として記録される

  Scenario: デバウンス処理による連続変更の集約
    Given structure.mdが監視中である
    When 500ms以内に複数回ファイルが変更される
    Then デバウンス処理により1回のイベントに集約される
    And html-generatorは1回だけ実行される
```

---

### 2.2 スキルフェーズ実行

#### AC-04: ヒアリングスキルの呼び出し

**対応要件**: FR-03, FR-09

```gherkin
Feature: hearing-facilitatorスキルの実行

  Scenario: ヒアリングボタンからスキルを実行する
    Given スライドプロジェクトが開かれている
    And 他のスキルが実行中でない
    When 「ヒアリング」ボタンをクリックする
    Then hearing-facilitatorスキルが実行される
    And ボタンが選択状態（アクティブ）になる
    And 進捗バーが表示される
    And 他のスキルボタンが無効化される

  Scenario: スキル実行完了時の通知
    Given hearing-facilitatorスキルが実行中である
    When スキル実行が完了する
    Then 実行結果が通知される
    And ボタンが通常状態に戻る
    And 進捗バーが非表示になる
    And 他のスキルボタンが有効化される
```

#### AC-05: 構成設計スキルの呼び出し

**対応要件**: FR-04

```gherkin
Feature: structure-designerスキルの実行

  Scenario: 構成設計ボタンからスキルを実行する
    Given スライドプロジェクトが開かれている
    And hearing-facilitatorの結果が存在する
    When 「構成設計」ボタンをクリックする
    Then structure-designerスキルが実行される
    And structure.mdが生成または更新される
```

#### AC-06: HTML生成スキルの呼び出し

**対応要件**: FR-05

```gherkin
Feature: html-generatorスキルの実行

  Scenario: HTML生成ボタンからスキルを実行する
    Given スライドプロジェクトが開かれている
    And structure.mdが存在する
    When 「HTML生成」ボタンをクリックする
    Then html-generatorスキルが実行される
    And index.htmlが生成または更新される
    And 同期状態が「synced」に更新される
```

#### AC-07: スライド修正スキルの呼び出し

**対応要件**: FR-06

```gherkin
Feature: slide-modifierスキルの実行

  Scenario: スライド修正ボタンからスキルを実行する
    Given スライドプロジェクトが開かれている
    And structure.mdとindex.htmlが存在する
    When 「スライド修正」ボタンをクリックする
    Then slide-modifierスキルが実行される
    And 修正内容に応じてファイルが更新される
```

#### AC-08: スキル実行のキャンセル

**対応要件**: FR-10

```gherkin
Feature: スキル実行のキャンセル

  Scenario: 実行中のスキルをキャンセルする
    Given スキルが実行中である
    And キャンセルボタンが表示されている
    When キャンセルボタンをクリックする
    Then スキル実行がキャンセルされる
    And UIが通常状態に戻る
    And 「キャンセルしました」と通知される
```

---

### 2.3 同期状態管理

#### AC-09: 同期状態の表示

**対応要件**: FR-07, NFR-08

```gherkin
Feature: 依存関係の同期状態表示

  Scenario: 同期済み状態の表示
    Given structure.mdとindex.htmlの内容が一致している
    When 同期状態が評価される
    Then 同期状態インジケーターが「synced」（緑色）で表示される
    And 手動同期ボタンが無効化される

  Scenario: 非同期状態の表示
    Given structure.mdが変更されている
    And index.htmlが古い状態である
    When 同期状態が評価される
    Then 同期状態インジケーターが「out-of-sync」（黄色）で表示される
    And 手動同期ボタンが有効化される

  Scenario: 同期中状態の表示
    Given html-generatorスキルが実行中である
    When 同期処理が進行中である
    Then 同期状態インジケーターが「syncing」（青色）で表示される
    And 回転アニメーションが表示される

  Scenario: エラー状態の表示
    Given 同期処理でエラーが発生した
    When エラー状態が設定される
    Then 同期状態インジケーターが「error」（赤色）で表示される
    And エラーメッセージが表示される
```

#### AC-10: 手動同期の実行

**対応要件**: FR-08

```gherkin
Feature: 手動同期機能

  Scenario: 手動で同期を実行する
    Given 同期状態が「out-of-sync」である
    And 手動同期ボタンが有効である
    When 「手動同期」ボタンをクリックする
    Then 同期処理が開始される
    And 同期状態が「syncing」に変わる
    And html-generatorスキルが実行される

  Scenario: 同期完了後の状態更新
    Given 手動同期が実行中である
    When 同期処理が完了する
    Then 同期状態が「synced」に変わる
    And 最終同期日時が更新される
```

---

### 2.4 エラーハンドリング

#### AC-11: エラー発生時のリカバリー

**対応要件**: NFR-05, NFR-10

```gherkin
Feature: エラー時の自動リトライとリカバリー

  Scenario: スキル実行エラー時の自動リトライ
    Given スキルが実行中である
    When 一時的なエラーが発生する
    Then 自動的にリトライが実行される
    And 最大3回までリトライする

  Scenario: リトライ上限到達時のユーザー通知
    Given 3回のリトライが失敗した
    When リトライ上限に達する
    Then エラーメッセージがUIに表示される
    And 対処方法が提示される
    And 手動リトライボタンが有効化される

  Scenario: 存在しないプロジェクトを開く
    Given ユーザーがプロジェクトを開こうとしている
    When 存在しないパスが指定される
    Then エラーメッセージ「プロジェクトが見つかりません」が表示される
    And 別のプロジェクトを選択するオプションが提示される
```

---

### 2.5 パフォーマンス

#### AC-12: UI応答性の維持

**対応要件**: NFR-02

```gherkin
Feature: スキル実行中のUI応答性

  Scenario: 長時間スキル実行中でも操作可能
    Given html-generatorスキルが実行中である
    And 処理に時間がかかっている
    When ユーザーがUIを操作する
    Then UIは応答可能な状態を維持する
    And 他のタブへの切り替えが可能である
    And キャンセルボタンが操作可能である
```

#### AC-13: メモリ使用量の制限

**対応要件**: NFR-03

```gherkin
Feature: ファイルウォッチャーのリソース管理

  Scenario: メモリ使用量が制限内に収まる
    Given ファイルウォッチャーが起動している
    And プロジェクトが監視中である
    When メモリ使用量を測定する
    Then ファイルウォッチャー関連のメモリ使用量が100MB以下である
```

---

### 2.6 セキュリティ

#### AC-14: ファイルパスの検証

**対応要件**: NFR-14

```gherkin
Feature: パストラバーサル攻撃の防止

  Scenario: プロジェクト外のパスへのアクセスを防止
    Given スライドプロジェクトが開かれている
    When 「../」を含むパスでファイル操作が試行される
    Then 操作が拒否される
    And セキュリティ警告がログに記録される

  Scenario: 絶対パスの検証
    Given ファイル操作が要求される
    When パスがプロジェクトディレクトリ外を指す
    Then 操作が拒否される
```

#### AC-15: IPC通信のバリデーション

**対応要件**: NFR-15

```gherkin
Feature: IPC入力値の検証

  Scenario: 不正なパラメータの拒否
    Given IPC通信でスキル実行が要求される
    When 不正なSkillPhase値が送信される
    Then リクエストが拒否される
    And バリデーションエラーが返される

  Scenario: 必須パラメータの検証
    Given IPC通信でファイルウォッチャー起動が要求される
    When projectPathが空文字である
    Then リクエストが拒否される
    And 「projectPathは必須です」エラーが返される
```

---

## 3. エッジケース一覧

| ID    | シナリオ                               | 期待動作                       |
| ----- | -------------------------------------- | ------------------------------ |
| EC-01 | structure.mdが存在しない状態で監視開始 | エラー表示、ファイル作成を促す |
| EC-02 | index.htmlが存在しない状態で同期確認   | 「未生成」状態として表示       |
| EC-03 | ファイルが外部で削除された             | 監視停止、ユーザーに通知       |
| EC-04 | 同時に複数のスキル実行が要求された     | キューイングで順次実行         |
| EC-05 | プロジェクトパスに日本語が含まれる     | 正常に動作する                 |
| EC-06 | ファイルサイズが非常に大きい（10MB超） | 警告表示、処理続行             |
| EC-07 | ネットワーク切断中にスキル実行         | タイムアウト後エラー表示       |
| EC-08 | アプリ終了時に監視が残る               | クリーンアップで解放           |

---

## 4. 検証サマリー

### 4.1 統計

| 項目         | 件数 |
| ------------ | ---- |
| 受け入れ基準 | 15   |
| シナリオ総数 | 32   |
| エッジケース | 8    |

### 4.2 要件カバレッジ

| 要件ID | 受け入れ基準 | カバー状況 |
| ------ | ------------ | ---------- |
| FR-01  | AC-01        | ○          |
| FR-02  | AC-02        | ○          |
| FR-03  | AC-04        | ○          |
| FR-04  | AC-05        | ○          |
| FR-05  | AC-06        | ○          |
| FR-06  | AC-07        | ○          |
| FR-07  | AC-09        | ○          |
| FR-08  | AC-10        | ○          |
| FR-09  | AC-04        | ○          |
| FR-10  | AC-08        | ○          |
| NFR-01 | AC-01        | ○          |
| NFR-02 | AC-12        | ○          |
| NFR-03 | AC-13        | ○          |
| NFR-04 | AC-03        | ○          |
| NFR-05 | AC-11        | ○          |
| NFR-08 | AC-09        | ○          |
| NFR-10 | AC-11        | ○          |
| NFR-14 | AC-14        | ○          |
| NFR-15 | AC-15        | ○          |

---

## 5. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |
