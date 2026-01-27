# システムプロンプトインターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

システムプロンプト機能は、ユーザーがAIの振る舞いをカスタマイズするためのテンプレート管理機能を提供する。TursoデータベースによるクラウドバックアップとEmbedded Replicaによるオフライン対応を実現している。

**実装期間**: 2026-01-22
**タスクドキュメント**: `docs/30-workflows/system-prompt-db/`

---

## Repository インターフェース

### ISystemPromptRepository

システムプロンプトテンプレートの永続化操作を提供するリポジトリインターフェース。

#### メソッド一覧

| メソッド名 | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- |
| findAllByUserId | userId: string, options?: FindAllOptions | Promise<SystemPromptTemplate[]> | ユーザーのテンプレート一覧を取得 |
| findById | id: string | Promise<SystemPromptTemplate \| null> | IDでテンプレートを取得 |
| findAllPresets | なし | Promise<SystemPromptTemplate[]> | プリセットテンプレート一覧を取得 |
| create | userId: string, data: CreateSystemPromptData | Promise<SystemPromptTemplate> | テンプレートを作成 |
| update | id: string, data: UpdateSystemPromptData | Promise<SystemPromptTemplate> | テンプレートを更新 |
| delete | id: string | Promise<void> | テンプレートを削除 |
| isPreset | id: string | Promise<boolean> | プリセットかどうかを判定 |
| existsByUserIdAndName | userId: string, name: string | Promise<boolean> | ユーザー内で名前が重複しているか確認 |
| exists | id: string | Promise<boolean> | テンプレートが存在するか確認 |

#### メソッド詳細

**findAllByUserId**
- 説明: 指定ユーザーのテンプレート一覧を取得する
- 引数: userId（ユーザーID）、options（取得オプション：ページネーション、ソート）
- 戻り値: テンプレート配列

**findById**
- 説明: IDでテンプレートを取得する
- 引数: id（テンプレートID）
- 戻り値: テンプレートまたはnull

**findAllPresets**
- 説明: プリセットテンプレート一覧を取得する
- 戻り値: プリセットテンプレート配列

**create**
- 説明: テンプレートを作成する
- 引数: userId（ユーザーID）、data（作成データ）
- 戻り値: 作成されたテンプレート
- 例外: ValidationError（バリデーション失敗時）、DuplicateNameError（名前重複時）

**update**
- 説明: テンプレートを更新する
- 引数: id（テンプレートID）、data（更新データ）
- 戻り値: 更新されたテンプレート
- 例外: NotFoundError（テンプレート未発見時）、PresetProtectedError（プリセット更新時）

**delete**
- 説明: テンプレートを削除する
- 引数: id（テンプレートID）
- 例外: NotFoundError（テンプレート未発見時）、PresetProtectedError（プリセット削除時）

**isPreset**
- 説明: 指定IDがプリセットかどうかを判定する
- 引数: id（テンプレートID）
- 戻り値: プリセットならtrue

**existsByUserIdAndName**
- 説明: ユーザー内で名前が重複しているか確認する
- 引数: userId（ユーザーID）、name（テンプレート名）
- 戻り値: 重複していればtrue

**exists**
- 説明: テンプレートが存在するか確認する
- 引数: id（テンプレートID）
- 戻り値: 存在すればtrue

### FindAllOptions

一覧取得時のオプション設定。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| limit | number | いいえ | 100 | 取得件数上限 |
| offset | number | いいえ | 0 | オフセット |
| sortBy | 'name' \| 'createdAt' \| 'updatedAt' | いいえ | - | ソート対象カラム |
| sortOrder | 'asc' \| 'desc' | いいえ | - | ソート順序 |

---

## エンティティ型定義

### SystemPromptTemplate

システムプロンプトテンプレートのエンティティ。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | はい | UUID形式のテンプレートID |
| userId | string | はい | 所有者のユーザーID |
| name | string | はい | テンプレート名（1-50文字） |
| content | string | はい | プロンプト内容（1-4000文字） |
| isPreset | boolean | はい | プリセットフラグ |
| createdAt | Date | はい | 作成日時 |
| updatedAt | Date | はい | 更新日時 |

### CreateSystemPromptData

テンプレート作成時の入力データ。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| name | string | はい | テンプレート名（1-50文字） |
| content | string | はい | プロンプト内容（1-4000文字） |

### UpdateSystemPromptData

テンプレート更新時の入力データ。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| name | string | いいえ | テンプレート名（1-50文字） |
| content | string | いいえ | プロンプト内容（1-4000文字） |

---

## IPC チャネル仕様

### チャネル定義

| チャネル                  | 説明               | メソッド |
| ------------------------- | ------------------ | -------- |
| system-prompt:list        | 一覧取得           | GET      |
| system-prompt:get         | 単一取得           | GET      |
| system-prompt:create      | 作成               | POST     |
| system-prompt:update      | 更新               | PATCH    |
| system-prompt:delete      | 削除               | DELETE   |
| system-prompt:migrate     | マイグレーション   | POST     |
| system-prompt:get-presets | プリセット取得     | GET      |

### レスポンス形式

IPCハンドラーの戻り値は成功/失敗を表すResult型を使用する。

**成功時の構造**

| プロパティ | 型 | 値 |
| --- | --- | --- |
| success | boolean | true |
| data | T | 操作結果のデータ |

**失敗時の構造**

| プロパティ | 型 | 値 |
| --- | --- | --- |
| success | boolean | false |
| error.code | string | エラーコード |
| error.message | string | エラーメッセージ |

---

## エラーコード体系

| コード                                   | HTTP相当 | 説明                       |
| ---------------------------------------- | -------- | -------------------------- |
| system-prompt/not-found                  | 404      | テンプレートが見つからない |
| system-prompt/validation-failed          | 400      | バリデーションエラー       |
| system-prompt/duplicate-name             | 409      | 名前重複                   |
| system-prompt/preset-protected           | 403      | プリセット保護             |
| system-prompt/unauthorized               | 401      | 認可エラー                 |
| system-prompt/create-failed              | 500      | 作成失敗                   |
| system-prompt/update-failed              | 500      | 更新失敗                   |
| system-prompt/delete-failed              | 500      | 削除失敗                   |
| system-prompt/list-failed                | 500      | 一覧取得失敗               |
| system-prompt/repository-not-initialized | 500      | Repository未初期化         |

---

## バリデーションルール

### テンプレート名（name）

| ルール         | 条件             | エラーメッセージ                         |
| -------------- | ---------------- | ---------------------------------------- |
| 必須           | 空文字列不可     | テンプレート名は必須です                 |
| 最小文字数     | 1文字以上        | テンプレート名は必須です                 |
| 最大文字数     | 50文字以下       | テンプレート名は50文字以内にしてください |
| 空白トリム     | 前後空白を削除   | -                                        |
| ユニーク制約   | ユーザー内で一意 | 同じ名前のテンプレートが既に存在します   |

### コンテンツ（content）

| ルール     | 条件           | エラーメッセージ                       |
| ---------- | -------------- | -------------------------------------- |
| 必須       | 空文字列不可   | コンテンツは必須です                   |
| 最小文字数 | 1文字以上      | コンテンツは必須です                   |
| 最大文字数 | 4000文字以下   | コンテンツは4000文字以内にしてください |

---

## セキュリティ仕様

### 認可チェック

| 操作   | チェック内容                         |
| ------ | ------------------------------------ |
| 取得   | userId一致確認                       |
| 作成   | userIdが有効であること               |
| 更新   | userId一致確認 + プリセット保護      |
| 削除   | userId一致確認 + プリセット保護      |

### SQLインジェクション対策

- Drizzle ORMの`sql`テンプレートリテラルを使用
- パラメータ化クエリを一貫して使用
- ユーザー入力を直接SQLに挿入しない

---

## データ永続化

### ストレージ構成

| データ               | ストレージ       | 同期     |
| -------------------- | ---------------- | -------- |
| カスタムテンプレート | Turso + SQLite   | 自動同期 |
| プリセットテンプレート | コード内定数   | なし     |

### オフライン対応

- Turso Embedded Replicaによるローカルコピー
- オフライン時もCRUD操作可能
- オンライン復帰時に自動同期

---

## マイグレーション仕様

### electron-store → Turso マイグレーション

| 機能                 | 説明                                   |
| -------------------- | -------------------------------------- |
| needsMigration()     | マイグレーション必要性チェック         |
| migrate()            | データ移行実行（部分成功対応）         |
| createBackup()       | 移行前バックアップ作成（JSON形式）     |
| restoreBackup()      | 失敗時のバックアップからの復元         |

### マイグレーションステータス

| ステータス     | 説明                         |
| -------------- | ---------------------------- |
| not_started    | 未開始                       |
| in_progress    | 実行中                       |
| completed      | 完了                         |
| failed         | 失敗（リトライ対象）         |

---

## 完了タスク

### TASK-CHAT-SYSPROMPT-DB-001（2026-01-22）

- システムプロンプトのデータベース永続化
- Repository層実装
- IPC Handler実装
- electron-store → Tursoマイグレーション
- 213テスト作成（カバレッジ84%+）

---

## 関連ドキュメント

- [システムプロンプト設定UI](./ui-ux-system-prompt.md)
- [データベーススキーマ](./database-schema.md)
- [認証インターフェース](./interfaces-auth.md)
- [チャット履歴インターフェース](./interfaces-chat-history.md)
- [実装ガイド](../../docs/30-workflows/completed-tasks/system-prompt-db/outputs/phase-12/implementation-guide.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                               |
| ---------- | ---------- | -------------------------------------- |
| 1.1.0      | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 1.0.0      | 2026-01-22 | 初版作成（DB永続化実装完了）           |
