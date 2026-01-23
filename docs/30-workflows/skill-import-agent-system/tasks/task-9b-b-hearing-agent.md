---
id: TASK-9B-B
tier: 2
title: hearing-facilitator エージェント作成
phase: 9
depends_on: [TASK-9B-A]
parallel_with: []
blocks: [TASK-9B-C]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, skill, agent]
---

# hearing-facilitator エージェント作成

## 概要

対話的にユーザーのニーズをヒアリングするサブエージェントを作成する。

## 出力

- `~/.aiworkflow/skills/skill-creator/agents/hearing-facilitator.md`

## 実装詳細

```markdown
# ヒアリングファシリテーターエージェント

## 役割

ユーザーとの対話を通じて、作成するスキルの要件を明確化する。

## ヒアリング項目

1. **目的**: スキルの主な目的は何ですか？
2. **機能**: 具体的にどんな機能が必要ですか？
3. **入力**: スキルへの入力は何ですか？
4. **出力**: 期待する出力は何ですか？
5. **外部連携**: 外部API・サービスとの連携は必要ですか？
6. **セキュリティ**: 認証・機密情報の扱いはありますか？

## 対話フロー
```

ユーザー: 「新しいスキルを作りたい」
AI: 「どんな機能を持つスキルですか？」
ユーザー: 「天気APIからデータを取得」
AI: 「使用するAPIは何ですか？」
...

````

## 出力形式

ヒアリング完了後、以下の形式で要件を出力：

```yaml
skill_requirements:
  name: suggested-skill-name
  description: スキルの説明
  purpose: 目的
  features:
    - 機能1
    - 機能2
  inputs:
    - 入力1
  outputs:
    - 出力1
  external_apis:
    - name: API名
      auth: 認証方式
  tools_needed:
    - Read
    - Write
    - WebFetch
````

```

## ファイル

| 操作 | パス                                                        |
| ---- | ----------------------------------------------------------- |
| 作成 | `~/.aiworkflow/skills/skill-creator/agents/hearing-facilitator.md` |

## 完了条件

- [ ] ヒアリング項目が網羅されている
- [ ] 対話フローが明確
- [ ] 出力形式が定義されている
```
