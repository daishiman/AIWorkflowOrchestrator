# SKILL.md フォーマット確認

## 構造

```
---
name: <スキル名>
description: |
  <説明>
allowed-tools:
  - Read
  ...
---

# <スキル名>

## 概要
...

## Prompt / Task一覧
...
```

## 改善対象

- frontmatter (**変更禁止**): `---` で囲まれた YAML ブロック
- 本文セクション（**改善対象**）: frontmatter以降の Markdown 本文

## LLM 改善戦略

- `llmClient` 利用可能時: agentDef を system に、SKILL.md 全文を user に渡し、改善済み全文を受け取る
- `llmClient` 不在時: `improveSkill(name, true)` で improve_skill.js スクリプトを実行

## 書き戻し制約

- frontmatter の YAML 境界を壊さないこと（LLM への指示または後処理で保証）
- ファイルは UTF-8 で書き戻す
