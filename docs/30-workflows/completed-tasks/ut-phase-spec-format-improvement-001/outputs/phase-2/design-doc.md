# Phase 2 Design Doc

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 2                      |
| タイプ | docs-only / NON_VISUAL |

## 設計要約

- `phase-spec-template.md` に Task/Step 分離ガイドラインを追加する。
- Phase 11 は `IS_NON_VISUAL` 分岐で screenshot 不要にする。
- Phase 12 は `実行タスク（計画）` と `検証ログ` を分離する。
- `unassigned-task-template.md` に苦戦箇所の記録欄を追加する。

## Handlebars 方針

```handlebars
{{#if IS_NON_VISUAL}}
  screenshot-plan.json を生成しない
{{else}}
  screenshot-plan.json と PNG 証跡を必須にする
{{/if}}
```

## 変更対象

| ファイル                                                                       | 変更内容                        |
| ------------------------------------------------------------------------------ | ------------------------------- |
| `.claude/skills/task-specification-creator/assets/phase-spec-template.md`      | Task/Step 分離、NON_VISUAL 分岐 |
| `.claude/skills/task-specification-creator/assets/unassigned-task-template.md` | 苦戦箇所の明確化                |
