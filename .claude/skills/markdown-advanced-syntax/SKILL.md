---
name: markdown-advanced-syntax
description: |
  Markdown高度構文を活用した技術文書作成の専門スキル。
  Mermaid図、高度なテーブル、コードブロック、数式表現等を適切に使用し、
  読み手にとって分かりやすく、メンテナンス性の高いドキュメントを作成します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/markdown-advanced-syntax/resources/advanced-tables.md`: カラム整列、マージセル表現、複雑なデータ構造、読みやすさ最適化
  - `.claude/skills/markdown-advanced-syntax/resources/code-blocks.md`: 言語固有ハイライト、差分表示、行番号、ファイル名表示、実行可能コード
  - `.claude/skills/markdown-advanced-syntax/resources/front-matter.md`: YAMLメタデータ定義、title/version/author、ステータス管理、検索最適化
  - `.claude/skills/markdown-advanced-syntax/resources/math-expressions.md`: LaTeX/KaTeX記法、インライン数式、ディスプレイ数式、数学記号
  - `.claude/skills/markdown-advanced-syntax/resources/mermaid-diagrams.md`: フローチャート・シーケンス図・ER図・状態遷移図の作成ガイド、スタイリング
  - `.claude/skills/markdown-advanced-syntax/scripts/validate-mermaid.mjs`: Mermaid構文の自動検証（構文エラー、レンダリング可能性チェック）
  - `.claude/skills/markdown-advanced-syntax/templates/specification-template.md`: 仕様書テンプレート（Mermaid図・高度テーブル・コードブロック統合）

  専門分野:
  - Mermaid図: フローチャート、シーケンス図、ER図、状態遷移図
  - 高度テーブル: 複雑なデータ構造、整列、マージセル表現
  - コードブロック: 言語固有ハイライト、差分表示、行番号
  - 数式表現: LaTeX/KaTeX記法、インライン数式
  - Front Matter: YAML Front Matter、メタデータ定義

  使用タイミング:
  - 複雑なフローやシステム構造を視覚化する時
  - APIやデータモデルの構造を表形式で整理する時
  - コードサンプルを明確に提示する時
  - 数学的な概念や式を含むドキュメントを作成する時

  Use proactively when users need diagrams in documentation, complex tables,
version: 1.0.0
---

# Markdown Advanced Syntax

## 概要

このスキルは、Markdown の高度な構文を活用して、視覚的で分かりやすい技術文書を作成するための専門知識を提供します。

GitHub Flavored Markdown（GFM）を基盤とし、Mermaid 図、高度なテーブル構造、シンタックスハイライト付きコードブロックなど、モダンな Markdown 機能を最大限に活用します。

**主要な価値**:

- 複雑なシステム構造を Mermaid 図で視覚化
- データモデルや API パラメータをテーブルで整理
- コードサンプルを言語固有のハイライトで明確化
- メタデータを Front Matter で構造化

**対象ユーザー**:

- 仕様書を作成するエージェント（@spec-writer）
- API ドキュメントを作成する開発者
- システム設計書を作成するアーキテクト

## リソース構造

```
markdown-advanced-syntax/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── mermaid-diagrams.md                    # Mermaid図の詳細ガイド
│   ├── advanced-tables.md                     # 高度なテーブル構造
│   ├── code-blocks.md                         # コードブロックとシンタックスハイライト
│   ├── math-expressions.md                    # 数式表現（LaTeX/KaTeX）
│   └── front-matter.md                        # YAML Front Matterの活用
├── scripts/
│   └── validate-mermaid.mjs                   # Mermaid構文検証スクリプト
└── templates/
    └── specification-template.md              # 仕様書テンプレート（Mermaid/Table付き）
```

## コマンドリファレンス

### リソース読み取り

```bash
# Mermaid図詳細ガイド
cat .claude/skills/markdown-advanced-syntax/resources/mermaid-diagrams.md

# 高度なテーブル構造
cat .claude/skills/markdown-advanced-syntax/resources/advanced-tables.md

# コードブロックとシンタックスハイライト
cat .claude/skills/markdown-advanced-syntax/resources/code-blocks.md

# 数式表現ガイド
cat .claude/skills/markdown-advanced-syntax/resources/math-expressions.md

# Front Matterガイド
cat .claude/skills/markdown-advanced-syntax/resources/front-matter.md
```

### スクリプト実行

```bash
# Mermaid構文検証（TypeScript）
node .claude/skills/markdown-advanced-syntax/scripts/validate-mermaid.mjs <file.md>
```

### テンプレート参照

```bash
# 仕様書テンプレート
cat .claude/skills/markdown-advanced-syntax/templates/specification-template.md
```

## いつ使うか

### シナリオ 1: システムフローの視覚化

**状況**: 処理フローやシステム間の相互作用を説明する必要がある

**適用条件**:

- [ ] テキストだけでは複雑すぎて伝わりにくい
- [ ] 順序や条件分岐が存在する
- [ ] 複数のコンポーネント間の関係がある

**推奨 Mermaid 図**: フローチャート、シーケンス図

### シナリオ 2: データ構造の文書化

**状況**: API パラメータやデータモデルを整理して提示する

**適用条件**:

- [ ] 複数のフィールドとその型・制約がある
- [ ] ネストした構造を説明する必要がある
- [ ] 比較や対応関係を示したい

**推奨手法**: テーブル、ER 図

### シナリオ 3: コードサンプルの提示

**状況**: 実装例や API 使用例を明確に示す

**適用条件**:

- [ ] 特定のプログラミング言語のコード
- [ ] JSON/YAML 等の構造化データ
- [ ] 差分や変更点を強調したい

**推奨手法**: 言語指定付きコードブロック、差分表示

## 前提条件

### 必要な知識

- [ ] 基本的な Markdown 構文（見出し、リスト、リンク）
- [ ] 対象言語のシンタックス（コードブロック用）

### 必要なツール

- Write: Markdown ファイルの作成
- Read: 既存ドキュメントの参照

### 環境要件

- Mermaid レンダリング対応環境（GitHub, VSCode 等）

## ワークフロー

### Phase 1: ドキュメント構造の設計

**目的**: ドキュメントの目的と対象読者を明確化し、使用する構文を選定する

**ステップ**:

1. **目的と読者の明確化**:
   - 何を伝えるドキュメントか
   - 読み手の技術レベル
   - どのような理解を促したいか

2. **視覚化要素の選定**:
   - フロー説明 → Mermaid フローチャート/シーケンス図
   - データ構造 → テーブル/ER 図
   - コード例 → シンタックスハイライト付きコードブロック

**判断基準**:

- [ ] 視覚化する要素が特定されているか？
- [ ] 適切な構文が選定されているか？

**リソース**: 各リソースファイルを参照

### Phase 2: Mermaid 図の作成

**目的**: 複雑な構造やフローを視覚的に表現する

**ステップ**:

1. **図タイプの選択**:
   - フローチャート: 処理の流れ、条件分岐
   - シーケンス図: 時系列の相互作用
   - ER 図: データモデルの関係性
   - 状態遷移図: 状態の変化

2. **図の構築**:
   - ノードとエッジの定義
   - スタイリングの適用
   - 注釈やコメントの追加

3. **検証**:
   - 構文エラーのチェック
   - レンダリング結果の確認

**判断基準**:

- [ ] 図が意図を正確に表現しているか？
- [ ] 複雑すぎず、読みやすいか？
- [ ] 構文エラーがないか？

**リソース**: `resources/mermaid-diagrams.md`

### Phase 3: テーブルとコードブロックの整形

**目的**: データとコードを構造化して提示する

**ステップ**:

1. **テーブル設計**:
   - カラム構成の決定
   - 整列方向の指定
   - ヘッダーの明確化

2. **コードブロック構成**:
   - 言語識別子の指定
   - インデントの統一
   - 適切な行数での分割

**判断基準**:

- [ ] テーブルが整列されているか？
- [ ] コードブロックの言語が指定されているか？
- [ ] 可読性が確保されているか？

**リソース**: `resources/advanced-tables.md`, `resources/code-blocks.md`

### Phase 4: メタデータと最終調整

**目的**: Front Matter を設定し、ドキュメント全体を整える

**ステップ**:

1. **Front Matter の設定**:
   - title, version, author の定義
   - 作成日・更新日の記録
   - ステータスの明記

2. **全体レビュー**:
   - 構文エラーのチェック
   - リンク切れの確認
   - 一貫性の検証

**判断基準**:

- [ ] Front Matter が完全か？
- [ ] 構文エラーがないか？
- [ ] 全体の一貫性があるか？

**リソース**: `resources/front-matter.md`

## ベストプラクティス

### すべきこと

1. **Mermaid 図は簡潔に**:
   - 1 つの図に詰め込みすぎない
   - 複雑な場合は分割する
   - 適切な凡例を追加

2. **コードブロックには言語を明記**:
   - ` ```typescript `、` ```json ` 等
   - シンタックスハイライトを有効化
   - 必要に応じて行番号を追加

3. **テーブルは整列を活用**:
   - 数値は右揃え（`:---:`→`---:`）
   - テキストは左揃え
   - ヘッダーは明確に

### 避けるべきこと

1. **巨大な Mermaid 図**:
   - ノード数 50 以上は避ける
   - レンダリング時間が長くなる
   - 可読性が低下する

2. **言語未指定のコードブロック**:
   - ハイライトが効かない
   - コピー時に問題が発生する可能性

3. **不整列のテーブル**:
   - ソースの可読性低下
   - メンテナンス性の悪化

## トラブルシューティング

### 問題 1: Mermaid 図がレンダリングされない

**症状**: コードがそのまま表示される

**原因**:

- 構文エラーがある
- 環境が Mermaid 未対応
- エスケープ文字の問題

**解決策**:

1. 構文を検証（`validate-mermaid.mjs`使用）
2. 対応環境で確認（GitHub, VSCode）
3. 特殊文字をエスケープ

### 問題 2: テーブルが崩れる

**症状**: 列の整列がおかしい

**原因**:

- パイプ（|）の数が不一致
- エスケープが必要な文字が含まれている
- 空セルの扱いが不適切

**解決策**:

1. 各行のパイプ数を確認
2. 特殊文字をエスケープ
3. 空セルには半角スペースを入れる

### 問題 3: コードブロックのハイライトが効かない

**症状**: 単色で表示される

**原因**:

- 言語識別子が未指定
- 言語名のスペルミス
- 環境が未対応

**解決策**:

1. 言語識別子を追加
2. 正しい言語名を確認（`typescript` not `ts`）
3. 対応環境で確認

## 関連スキル

- **structured-writing** (`.claude/skills/structured-writing/SKILL.md`): 構造化ライティングの原則
- **technical-documentation-standards** (`.claude/skills/technical-documentation-standards/SKILL.md`): 技術文書化標準
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計

## メトリクス

### Mermaid 図の適切性

**評価基準**: ノード数、エッジ数、複雑度
**目標**: ノード数<30、複雑度<10

### テーブル可読性

**評価基準**: 列数、行数、整列の一貫性
**目標**: 列数<10、行数<50

### コードブロック品質

**評価基準**: 言語指定率、適切な行数
**目標**: 言語指定 100%、行数<50/ブロック

## 変更履歴

| バージョン | 日付       | 変更内容                                                 |
| ---------- | ---------- | -------------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - Mermaid、テーブル、コードブロックの活用ガイド |

## 使用上の注意

### このスキルが得意なこと

- Mermaid 図による視覚化
- 高度なテーブル構造の設計
- コードブロックの最適化
- Front Matter の設計

### このスキルが行わないこと

- 文書の内容そのものの作成
- プロジェクト固有のビジネスロジック
- 実際のコード実装

### 参考文献

- **GitHub Flavored Markdown Spec**: https://github.github.com/gfm/
- **Mermaid Official Documentation**: https://mermaid.js.org/
- **CommonMark Spec**: https://spec.commonmark.org/
