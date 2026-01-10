# 要求仕様索引

## 概要

docs/00-requirements 配下の要求仕様を参照するための索引。
依存関係分析の設計が全体要件と整合しているか確認する。

## 対象ドキュメント

| パス | 目的/範囲 | 読み取り指示 |
| --- | --- | --- |
| `docs/00-requirements/05-architecture.md` | アーキテクチャ | 依存関係の前提を確認 |
| `docs/00-requirements/04-directory-structure.md` | ディレクトリ構成 | モジュール境界を確認 |
| `docs/00-requirements/02-non-functional-requirements.md` | 非機能要件 | 安定性要件を確認 |
| `docs/00-requirements/18-skills.md` | スキル構造仕様 | 作成ルールを遵守する |
| `docs/00-requirements/14-task-workflow-specification.md` | ワークフロー仕様 | タスク分割の整合性を確認 |
| `docs/00-requirements/99-glossary.md` | 用語定義 | 用語の統一に利用 |

## 更新ルール

- `docs/00-requirements` が更新されたら本索引も更新する
- 依存分析対象が変わる場合は対象ドキュメントを追加する
- 変更点は SKILL.md と Level2/Level4 に反映する
