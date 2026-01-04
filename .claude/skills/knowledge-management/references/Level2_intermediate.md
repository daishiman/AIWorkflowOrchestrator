# レベル2: 中級

## 概要

SECIモデル（野中郁次郎）に基づく組織知識の形式知化と共有を専門とするスキル。 暗黙知を形式知に変換し、体系化することで再利用可能な知識として組織全体で活用可能にします。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 知識キュレーションフレームワーク / 4つのキュレーションフェーズ / [情報タイトル] / 知識の鮮度維持戦略 / 陳腐化の兆候 / 技術的陳腐化
- 実務指針: ベストプラクティスやノウハウを文書化する時 / コードレビューコメントや議論を形式知化する時 / 経験や勘に基づく暗黙知を明示的な知識に変換する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/curation-framework.md`: 知識の収集・評価・統合・更新プロセスと情報源の信頼性評価基準（把握する知識: 知識キュレーションフレームワーク / 4つのキュレーションフェーズ / [情報タイトル]）
- `resources/freshness-strategy.md`: 陳腐化検出メカニズム、更新優先順位、定期レビュースケジュール、自動監視（把握する知識: 知識の鮮度維持戦略 / 陳腐化の兆候 / 技術的陳腐化）
- `resources/quality-assurance.md`: 完全性・明確性・再現性の3軸評価、品質スコア算出、検証プロセス（把握する知識: 知識品質保証ガイド / 品質評価の3軸 / 軸1: 完全性 (Completeness)）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 用語集 (Glossary)）
- `resources/seci-combination.md`: 形式知の統合・体系化プロセス、知識の階層構造設計、参照関係の整理（把握する知識: Combinationの本質 / 形式知同士の相互作用 / 単純な集約との違い）
- `resources/seci-externalization.md`: 暗黙知の言語化・概念化手法、パターン抽象化、検証可能性の確保（把握する知識: 暗黙知の特性 / 暗黙知とは / 形式知への変換が必要な理由）
- `resources/seci-model-details.md`: SECIサイクルの理論的背景、4フェーズの詳細手順、適用事例とパターン（把握する知識: SECIサイクルの4つのモード / 1. Socialization（共同化）: 暗黙知→暗黙知 / 2. Externalization（表出化）: 暗黙知→形式知）
- `resources/seci-socialization.md`: 暗黙知の源泉特定、情報収集手法、一次情報源の評価基準（把握する知識: Socializationの特性 / 暗黙知の伝達 / Claude Codeエコシステムでの適用）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Knowledge Management / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-knowledge.mjs`: ドキュメント品質の自動検証（必須セクション、ファイルサイズ、陳腐化チェック）
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/knowledge-document-template.md`: 標準的な知識文書化テンプレート（SECIモデル準拠）

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた

## 18-skills.md仕様の要点

このスキルは18-skills.md仕様に基づいて設計されています。

### コア原則（§2）

1. **簡潔さが鍵（§2.1）**: Claude既知の情報は省略、冗長な説明より簡潔な例を優先
2. **書籍参照によるコンテキスト圧縮（§2.2）**: 1-3冊の著名書籍で知識体系を圧縮参照
3. **適切な自由度設定（§2.3）**: タスクの脆弱性に応じて具体性を調整
4. **Progressive Disclosure（§2.4）**: Level 1（メタデータ）→ Level 2（SKILL.md）→ Level 3（リソース）の3層開示

### スキル構造（§3）

- SKILL.md: 500行以内、YAML frontmatter with references
- scripts/: 繰り返し書くコードをスクリプト化、冪等性・エラー出力・引数検証必須
- references/: SKILL.mdから相対パスでリンク、Progressive Disclosure適用
- assets/: 出力で使用するファイル（テンプレート等）

### 品質基準（§8）

- name: ハイフンケース、最大64文字、ディレクトリ名と一致
- description: 最大1024文字、📖参照書籍と「Use when」発動条件を含む
- 行数: SKILL.md 500行以内、超過時は references/ に分離
- 補助ドキュメント: README.md等は作成しない

詳細は `docs/00-requirements/18-skills.md` を参照してください。
