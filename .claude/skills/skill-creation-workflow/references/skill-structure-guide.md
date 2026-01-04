# Skill Structure Guide

## 必須構成（本スキルの運用ルール）

```
{skill_name}/
├─ SKILL.md
├─ agents/
├─ assets/
├─ references/
└─ scripts/
```

## 各ディレクトリの役割

- SKILL.md: スキルの目的、ワークフロー、品質基準を記述する。
- agents/: Step 1-5のTask仕様を配置する。
- assets/: チェックリストやテンプレートを配置する。
- references/: 詳細手順や品質基準を配置する。
- scripts/: 検証や記録のスクリプトを配置する。

## 参照ルール

- SKILL.mdからは相対パスで参照する。
- 絶対パスや`../`はSKILL.mdに書かない。
