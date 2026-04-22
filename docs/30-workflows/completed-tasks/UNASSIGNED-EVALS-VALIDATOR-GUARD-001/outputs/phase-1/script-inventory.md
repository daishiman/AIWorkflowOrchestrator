# スクリプト在庫調査 — Phase 1 Step 1 実測値

## 既存スクリプト一覧

| スクリプト名                | 主責務                                                                                   | EVALS.json を読むか | 備考                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------- |
| validate-skill-structure.js | スキルディレクトリ構造の検証（SKILL.md存在確認・禁止ファイル検出・ファイル命名チェック） | ❌ 読まない         | --targetオプションが必須。EVALS.jsonの存在チェックもない |
| validate-skill-md.js        | SKILL.mdのフォーマット検証（frontmatter + ボディ構造）                                   | ❌ 読まない         | --targetオプションが必須                                 |
| validate-agents.js          | agents/ディレクトリ配下のエージェント定義検証                                            | ❌ 読まない         | agents/が存在する場合のみ                                |
| validate-schemas.js         | schemas/ディレクトリ配下のJSONスキーマ検証（$schema, typeプロパティ確認）                | ❌ 読まない         | schemas/が存在する場合のみ                               |
| run-all-validations.js      | 上記4スクリプトを順次呼び出す統合実行スクリプト                                          | ❌ 読まない         | validate-evals.jsの呼び出しなし                          |

## 結論

5件全てEVALS.jsonを一切読まない。validator=0件状態が確認された。
