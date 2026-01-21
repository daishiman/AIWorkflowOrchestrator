# Agent: update-system-specs

> **Progressive Disclosure**
>
> - 読み込みタイミング: Phase 12 Task 2（システム仕様書更新）実行時
> - 読み込み条件: 実装内容をシステム仕様に反映する必要があるとき
> - 関連リソース: spec-update-workflow.md, aiworkflow-requirements スキル

---

## 責務

実装完了後、システム仕様書（aiworkflow-requirements）を適切に更新する。

---

## 入力

| 入力           | 説明                         | 例                                 |
| -------------- | ---------------------------- | ---------------------------------- |
| 実装サマリー   | Phase 5 で実装した内容       | 認可チェック機能の追加             |
| 変更ファイル   | 修正・追加したソースファイル | chat-history-service.ts, errors.ts |
| 新規型/定数    | 追加した型・定数・クラス     | UnauthorizedError, RESOURCE_TYPE   |
| シグネチャ変更 | 変更したメソッドシグネチャ   | getSession(id, requestUserId)      |

---

## 出力

| 出力                 | 説明                                | 例                            |
| -------------------- | ----------------------------------- | ----------------------------- |
| 更新対象ファイル一覧 | 更新が必要なシステム仕様ファイル    | interfaces-chat-history.md    |
| 更新内容             | 各ファイルへの具体的な追加/変更内容 | メソッド表にrequestUserId追加 |
| 更新完了チェック     | 全更新が完了したことの確認          | チェックリスト全項目完了      |

---

## 実行手順

### Step 1: 実装内容の分析

実装サマリーから以下を抽出:

```
□ 新規追加した型/インターフェース
□ 変更したメソッドシグネチャ
□ 新規追加したエラークラス/定数
□ 新規追加したビジネスルール
□ 認可/認証ロジックの追加
□ データベーススキーマ変更
```

### Step 2: 更新対象ファイルの特定

| 実装内容                       | 更新対象                                                       |
| ------------------------------ | -------------------------------------------------------------- |
| サービスメソッドシグネチャ変更 | `references/interfaces-*.md`                                   |
| 新規カスタムエラークラス追加   | `references/error-handling.md`                                 |
| 新規ビジネスルール追加         | `references/interfaces-*.md`                                   |
| 認可/認証ロジック追加          | `references/interfaces-*.md` または `references/security-*.md` |
| 新規定数/設定値追加            | 該当する `references/interfaces-*.md`                          |
| データベーススキーマ変更       | `references/database-*.md`                                     |
| 新規リポジトリメソッド追加     | `references/interfaces-*.md`                                   |

### Step 3: システム仕様ファイルの読み込み

```bash
# 対象ファイルを特定後、読み込み
Read: .claude/skills/aiworkflow-requirements/references/{対象ファイル}.md
```

### Step 4: 具体的な更新内容の決定

各ファイルに対し、以下の形式で更新内容を決定:

#### インターフェース変更の場合

```markdown
## メソッドシグネチャ更新

| メソッド   | 変更前         | 変更後                                |
| ---------- | -------------- | ------------------------------------- |
| getSession | `(id: string)` | `(id: string, requestUserId: string)` |

## 追加セクション

- 認可（Authorization）セクションを新規追加
- 認可チェック対象メソッド表を追加
```

#### エラークラス追加の場合

```markdown
## エラーコード追加

| コード   | 名称         | 説明                     |
| -------- | ------------ | ------------------------ |
| ERR_2006 | UNAUTHORIZED | リソースアクセス権限なし |

## 詳細セクション追加

- UnauthorizedError クラス定義
- isUnauthorizedError 型ガード
- 定数定義（UNAUTHORIZED_ERROR_MESSAGE, RESOURCE_TYPE）
```

### Step 5: 更新の実行

1. 該当ファイルを Edit ツールで更新
2. 変更履歴セクションにバージョンを追記

```markdown
| X.X.X | YYYY-MM-DD | {タスク名}完了: {変更内容の要約} |
```

### Step 6: 更新完了チェック

```markdown
## システム仕様更新チェックリスト

- [x] メソッドシグネチャに変更がある場合、interfaces-\*.mdを更新した
- [x] 新規エラークラスを追加した場合、error-handling.mdを更新した
- [x] 新規ビジネスルールがある場合、該当interfacesファイルに追加した
- [x] 認可/認証ロジックを追加した場合、認可セクションを追加/更新した
- [x] 新規定数/設定値がある場合、該当ファイルに記載した
- [x] 更新したファイルの変更履歴セクションにバージョンを追記した
```

---

## 注意事項

| 原則           | 説明                                             |
| -------------- | ------------------------------------------------ |
| 更新漏れ防止   | チェックリストを必ず完遂してからTask完了とする   |
| 仕様との整合性 | 実装コードと仕様書の記述が一致していることを確認 |
| 変更履歴の追記 | 必ずバージョン番号と変更内容を追記               |
| 具体的な記述   | 曖昧な表現を避け、具体的なコード例を含める       |

---

## 関連リソース

| リソース                | パス                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| 更新フロー詳細          | `references/spec-update-workflow.md`                                   |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/`                              |
| 仕様記述ガイドライン    | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` |
