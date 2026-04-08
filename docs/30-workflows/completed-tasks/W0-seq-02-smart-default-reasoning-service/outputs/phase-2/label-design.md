# Phase 2 ラベル形式設計書 - UT-VERIFY-DOC-CONSOLIDATION-001

## 役割ラベル追記仕様

### 追記形式

既存の `> 役割:` 記述スタイルに統一した blockquote 形式で追記する。

```
> 区分: {値}
```

- コロンの後に半角スペース1つ
- 括弧内の英語表記は `（）` 全角括弧を使用

### 4ファイル追記仕様

| ファイル                              | 追記位置                           | 追記内容                                               |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `task-workflow-completed.md`          | `> 役割: completed records` の直後 | `> 区分: 履歴記録（history record）`                   |
| `task-workflow-active.md`             | `> 役割: active guide` の直後      | `> 区分: 正本（current contract）`                     |
| `interfaces-skill-verify-contract.md` | H1 タイトルの直後（ファイル冒頭）  | `> 区分: 契約仕様（current contract / Check ID 体系）` |
| `task-workflow.md`                    | インデックステーブル               | 「区分」列を追加                                       |

---

## インデックステーブル「区分」列設計

### 区分値の定義

| 値       | 意味                                 | 対象ファイルパターン                  |
| -------- | ------------------------------------ | ------------------------------------- |
| 正本     | current contract（最新の実行ガイド） | `task-workflow-active.md`             |
| 履歴     | history record（完了タスクの記録）   | `task-workflow-completed*.md`         |
| 契約仕様 | verify 契約・Check ID 体系の定義     | `interfaces-skill-verify-contract.md` |
| —        | 上記以外の参考ドキュメント           | `workflow-*.md`, `task-workflow-*.md` |

### テーブル変更後の列構成

```
| ファイル | 役割 | 区分 | 主な見出し |
```

### 各エントリへの区分値割り当て

| ファイル                              | 区分値   |
| ------------------------------------- | -------- |
| `task-workflow-active.md`             | 正本     |
| `task-workflow-completed.md`          | 履歴     |
| `task-workflow-completed-*.md`        | 履歴     |
| `interfaces-skill-verify-contract.md` | 契約仕様 |
| `task-workflow-backlog.md`            | —        |
| `task-workflow-history.md`            | —        |
| `workflow-*.md`                       | —        |

---

## 完了確認

- [x] 追記形式が既存の `> 役割:` 記述スタイルと統一されている
- [x] 4ファイル全てへの追記が設計されている
- [x] `task-workflow.md` インデックスの「区分」列の値が全エントリを網羅している
