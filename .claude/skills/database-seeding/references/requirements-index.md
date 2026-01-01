# 要求仕様索引

## 概要

docs/00-requirements 配下の要求仕様を参照するための索引。
シーディングの設計が全体要件と整合しているか確認する。

## 対象ドキュメント

| パス | 目的/範囲 | 読み取り指示 |
| --- | --- | --- |
| `docs/00-requirements/15-database-design.md` | データ設計 | スキーマと制約の整合確認 |
| `docs/00-requirements/02-non-functional-requirements.md` | 非機能要件 | 品質/運用要件の確認 |
| `docs/00-requirements/07-error-handling.md` | エラー処理 | 失敗時の復旧方針を確認 |
| `docs/00-requirements/17-security-guidelines.md` | セキュリティ | 機密データ取り扱い確認 |
| `docs/00-requirements/18-skills.md` | スキル構造仕様 | 作成ルールを遵守する |
| `docs/00-requirements/14-task-workflow-specification.md` | ワークフロー仕様 | タスク分割の整合性を確認 |
| `docs/00-requirements/99-glossary.md` | 用語定義 | 用語の統一に利用 |

## 更新ルール

- `docs/00-requirements` が更新されたら本索引も更新する
- シード対象や運用条件が変わる場合は対象ドキュメントを追加する
- 変更点は SKILL.md と Level2/Level4 に反映する
