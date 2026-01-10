# 要求仕様索引

## 概要

docs/00-requirements 配下の要求仕様を参照するための索引。
マイグレーション計画が全体要件と整合しているか確認する。

## 対象ドキュメント

| パス | 目的/範囲 | 読み取り指示 |
| --- | --- | --- |
| `docs/00-requirements/15-database-design.md` | データ設計 | 変更対象と制約を確認 |
| `docs/00-requirements/12-deployment.md` | デプロイ運用 | 適用タイミングを確認 |
| `docs/00-requirements/02-non-functional-requirements.md` | 非機能要件 | 可用性・性能要件を確認 |
| `docs/00-requirements/07-error-handling.md` | 障害対応 | ロールバック方針を確認 |
| `docs/00-requirements/17-security-guidelines.md` | セキュリティ | データ保護要件を確認 |
| `docs/00-requirements/18-skills.md` | スキル構造仕様 | 作成ルールを遵守 |
| `docs/00-requirements/14-task-workflow-specification.md` | ワークフロー仕様 | タスク分割の整合性を確認 |
| `docs/00-requirements/99-glossary.md` | 用語定義 | 用語の統一に利用 |

## 更新ルール

- `docs/00-requirements` が更新されたら本索引も更新する
- マイグレーション対象が拡張される場合は対象ドキュメントを追加する
- 変更点は SKILL.md と Level2/Level4 に反映する
