# 要求仕様インデックス

## 目的

`docs/00-requirements/` にある要求仕様を参照するための索引。
要件抽出の前提整理や整合性確認の際に利用する。

## インデックス

| カテゴリ       | パス                                                     | 用途                             |
| -------------- | -------------------------------------------------------- | -------------------------------- |
| 全体像         | `docs/00-requirements/01-overview.md`                    | ビジネス目的と全体スコープの確認 |
| 非機能要件     | `docs/00-requirements/02-non-functional-requirements.md` | 品質特性の網羅性チェック         |
| 技術スタック   | `docs/00-requirements/03-technology-stack.md`            | 技術制約と前提の確認             |
| アーキテクチャ | `docs/00-requirements/05-architecture.md`                | 構成図と依存関係の確認           |
| エラー処理     | `docs/00-requirements/07-error-handling.md`              | 例外要件の確認                   |
| API設計        | `docs/00-requirements/08-api-design.md`                  | インターフェース要件の確認       |
| セキュリティ   | `docs/00-requirements/17-security-guidelines.md`         | セキュリティ要件の確認           |
| 用語集         | `docs/00-requirements/99-glossary.md`                    | 用語統一と定義参照               |

## 使い方

1. Phase 1 の前提整理で該当ドキュメントを確認する
2. Phase 3 の仕様化時に参照元を明記する
3. Phase 4 の品質検証で不整合がないか確認する
