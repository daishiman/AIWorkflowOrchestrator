# 18-skills 仕様要点（参照用）

## 目的

skill-creatorで検証する際に確認すべき最小要件を整理する。

## 構造要件

- SKILL.mdは必須。
- agents/assets/references/scriptsを必要に応じて作成する。
- 相対パスで参照し、絶対パスや`../`はSKILL.mdに書かない。

## frontmatter要件

- nameはハイフンケースでディレクトリと一致する。
- descriptionにAnchorsとTriggerを含める。
- Triggerは英語で記述する。

## 運用要件

- 毎回skill-creatorで検証する。
- 完成後にskill_list.mdを更新する。
