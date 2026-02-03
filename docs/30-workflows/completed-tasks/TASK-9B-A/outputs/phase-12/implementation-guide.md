# TASK-9B-A 実装ガイド

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-A                   |
| Phase    | 12                          |
| 作成日   | 2026-02-03                  |
| タイトル | skill-creator SKILL.md 作成 |

---

# Part 1: 概念的説明（中学生でもわかる版）

## skill-creator SKILL.md とは？

### 日常での例え話

skill-creatorのSKILL.mdは、「料理のレシピ本の目次」のようなものです。

料理を作るとき、レシピ本があると便利ですよね。レシピ本には：

- どんな料理が作れるか（機能一覧）
- どんな道具が必要か（allowed-tools）
- 詳しい作り方はどこを見ればいいか（サブエージェント・参照資料）

が書いてあります。SKILL.mdもまったく同じです。

### なぜ必要か

AIに「新しいスキルを作って」と頼むとき、AIは何をすればいいかわかりません。
SKILL.mdがあると、AIは：

1. 「こういう機能が使えるんだ」
2. 「こういうツールを使っていいんだ」
3. 「詳しいことはここを見ればいいんだ」

とわかるようになります。

### 何ができるようになるか

SKILL.mdを作ることで、「スキルを作るスキル」ができあがります。
つまり、新しいスキルをどんどん作れるようになるのです。

### 12の機能を簡単に説明

| 機能     | 一言説明                           |
| -------- | ---------------------------------- |
| chat     | 会話しながらスキルを作る           |
| api      | ウェブサービスと連携するスキル作成 |
| improve  | 既存のスキルをもっと良くする       |
| execute  | 作業手順書通りに自動実行           |
| use      | 作ったスキルをすぐ試す             |
| chain    | スキルをつなげて自動化             |
| fork     | 既存スキルをコピーして改造         |
| share    | 作ったスキルを公開・共有           |
| schedule | 決まった時間に自動実行             |
| debug    | スキルの問題を見つける             |
| docs     | 説明書を自動作成                   |
| stats    | どれくらい使われているか確認       |

---

# Part 2: 技術的詳細（開発者向け）

## YAML Frontmatter 仕様

| フィールド    | 型       | 必須 | 説明                           |
| ------------- | -------- | ---- | ------------------------------ |
| name          | string   | ✓    | スキル識別子（ハイフンケース） |
| description   | string   | ✓    | 説明 + Anchors + Trigger       |
| allowed-tools | string[] | -    | 許可ツールリスト               |

### name フィールド

```yaml
name: skill-creator
```

- **形式**: ハイフンケース（kebab-case）
- **制約**: `^[a-z0-9-]+$`

### description フィールド

```yaml
description: |
  概要説明...

  Anchors:
  • 書籍/理論 / 適用: 適用箇所 / 目的: 目的

  Trigger:
  トリガーワード（日英両方推奨）
```

- **形式**: `|` による複数行リテラル
- **必須セクション**: `Anchors:`, `Trigger:`

### allowed-tools フィールド

```yaml
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - WebFetch
  - AskUserQuestion
```

## allowed-tools 一覧（9ツール）

| ツール          | 用途                     |
| --------------- | ------------------------ |
| Read            | ファイル読み込み         |
| Write           | ファイル書き込み         |
| Edit            | ファイル編集             |
| Glob            | パターンマッチ検索       |
| Grep            | 内容検索                 |
| Bash            | コマンド実行             |
| Task            | サブエージェント呼び出し |
| WebFetch        | 外部API連携              |
| AskUserQuestion | ユーザー対話             |

## 12機能一覧

| コマンド                  | 機能              |
| ------------------------- | ----------------- |
| `/skill-creator`          | 対話的スキル作成  |
| `/skill-creator api`      | API連携スキル生成 |
| `/skill-creator improve`  | 既存スキル改善    |
| `/skill-creator execute`  | タスク実行        |
| `/skill-creator use`      | 即時使用          |
| `/skill-creator chain`    | スキルチェーン    |
| `/skill-creator fork`     | スキルフォーク    |
| `/skill-creator share`    | スキル共有        |
| `/skill-creator schedule` | スケジュール設定  |
| `/skill-creator debug`    | デバッグ実行      |
| `/skill-creator docs`     | ドキュメント生成  |
| `/skill-creator stats`    | 使用統計          |

## ディレクトリ構造

```
~/.aiworkflow/skills/skill-creator/
├── SKILL.md                          # 本体（本タスクで作成）
├── agents/                           # TASK-9B-B〜Eで作成
│   ├── hearing-facilitator.md
│   ├── task-generator.md
│   ├── code-generator.md
│   ├── api-integrator.md
│   └── validator.md
└── references/                       # TASK-9B-Fで作成
    ├── task-template.md
    ├── skill-structure.md
    ├── api-patterns.md
    └── security-guide.md
```

## 検証コマンド

```bash
# 基本検証
bash docs/30-workflows/TASK-9B-A/outputs/phase-4/validate-skill-md.sh

# 拡充検証
bash docs/30-workflows/TASK-9B-A/outputs/phase-6/validate-skill-md-extended.sh
```

## 作成日時

2026-02-03
