---
name: skill-librarian-commands
description: |
  Skill Librarianエージェント専用のコマンド、スクリプト、リソース参照ガイド。
  スキル作成・管理に必要なTypeScriptスクリプトの実行方法、
  詳細リソースへのアクセスパス、テンプレート参照方法を提供します。

  使用タイミング:
  - スキル品質を検証したい時（validate-knowledge.mjs）
  - トークン使用量を計算したい時（calculate-token-usage.mjs）
  - ドキュメント構造を分析したい時（analyze-structure.mjs）
  - 詳細知識が必要な時（SECIモデル、3層開示モデル、分割パターン等）
  - テンプレートを使用してファイルを作成したい時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/skill-librarian-commands/resources/command-reference.md`: 利用可能なスクリプト・コマンドの完全リファレンス（実行方法、オプション、使用例）
  - `.claude/skills/skill-librarian-commands/templates/resource-template.md`: リソースファイル作成用の標準テンプレート（セクション構造、ベストプラクティス）
  - `.claude/skills/skill-librarian-commands/scripts/list-skills.mjs`: 全スキル一覧表示ツール（パス情報付き、Node.js実行可能）

  Use proactively when Skill Librarian needs to validate skill quality,
  calculate token usage, analyze document structure, access detailed resources,
  or use templates for file creation.
tools: [Bash, Read]
tags: [skill-librarian, commands, scripts, resources, templates]
version: 1.0.0
---

# Skill Librarian Commands

## 概要

このスキルは、Skill Librarianエージェントが使用する専用コマンド、スクリプト、リソース、テンプレートへのアクセス方法を定義します。

**対象ユーザー**: Skill Librarianエージェント専用
**スコープ**: コマンド参照、スクリプト実行、リソースアクセス

---

## TypeScriptスクリプト実行

### 1. 知識ドキュメント品質検証

**スクリプト**: `validate-knowledge.mjs`
**パス**: `.claude/skills/knowledge-management/scripts/validate-knowledge.mjs`

**目的**: 知識ドキュメントの品質を検証（構造、完全性、一貫性）

**使用方法**:
```bash
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs <file.md>
```

**検証項目**:
- [ ] YAML Frontmatterの完全性
- [ ] 必須セクションの存在
- [ ] リンクの有効性
- [ ] 用語の一貫性
- [ ] 500行制約遵守

**出力例**:
```
✅ YAML Frontmatter: 完全
✅ 必須セクション: すべて存在
⚠️ 警告: リンク切れ 2箇所
✅ 用語一貫性: 問題なし
✅ 行数: 487/500
```

**使用タイミング**: Phase 4（品質保証と最適化）

---

### 2. トークン使用量計算

**スクリプト**: `calculate-token-usage.mjs`
**パス**: `.claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs`

**目的**: スキルディレクトリ全体のトークン使用量を見積もる

**使用方法**:
```bash
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs <skill-directory>
```

**計算対象**:
- SKILL.md本文
- resources/配下のすべてのファイル
- templates/配下のテンプレート

**出力例**:
```
📊 トークン使用量分析:
SKILL.md: 4,200 tokens
resources/: 8,500 tokens
templates/: 1,800 tokens
---
合計: 14,500 tokens
推奨範囲: <20,000 tokens
ステータス: ✅ 最適
```

**使用タイミング**: Phase 4（品質保証と最適化）

---

### 3. ドキュメント構造分析

**スクリプト**: `analyze-structure.mjs`
**パス**: `.claude/skills/documentation-architecture/scripts/analyze-structure.mjs`

**目的**: スキルディレクトリの構造を分析し、改善提案を提供

**使用方法**:
```bash
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs <skill-directory>
```

**分析項目**:
- ファイル階層構造
- セクション数と深さ
- リソース分割状況
- 命名規約遵守

**出力例**:
```
📁 構造分析:
階層: 3レベル（推奨範囲内）
セクション数: 8（適切）
リソース分割: 4ファイル（良好）
---
💡 改善提案:
- resources/advanced-patterns.md を2つに分割（現在580行）
```

**使用タイミング**: Phase 2（スキル構造の設計）、Phase 4（品質保証）

---

### 4. 単一ファイルのトークン見積もり

**スクリプト**: `estimate-tokens.mjs`
**パス**: `.claude/skills/context-optimization/scripts/estimate-tokens.mjs`

**目的**: 単一ファイルのトークン数を見積もる

**使用方法**:
```bash
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs <file.md>
```

**出力例**:
```
📄 ファイル: SKILL.md
トークン数: 4,200
文字数: 16,800
行数: 450
---
ステータス: ✅ 推奨範囲内（<20,000）
```

**使用タイミング**: Phase 3（ファイル生成）、Phase 4（最適化）

---

## リソース参照

### 1. SECIモデル詳細

**リソース**: `seci-model-details.md`
**パス**: `.claude/skills/knowledge-management/resources/seci-model-details.md`

**内容**:
- Socialization（共同化）: 暗黙知→暗黙知
- Externalization（表出化）: 暗黙知→形式知
- Combination（連結化）: 形式知→形式知
- Internalization（内面化）: 形式知→暗黙知

**参照コマンド**:
```bash
cat .claude/skills/knowledge-management/resources/seci-model-details.md
```

**使用タイミング**: Phase 1（知識の収集と分析）

---

### 2. 3層開示モデル

**リソース**: `three-layer-model.md`
**パス**: `.claude/skills/progressive-disclosure/resources/three-layer-model.md`

**内容**:
- Layer 1: メタデータ（YAML Frontmatter）
- Layer 2: 本文（SKILL.md概要）
- Layer 3: リソース（詳細知識）

**参照コマンド**:
```bash
cat .claude/skills/progressive-disclosure/resources/three-layer-model.md
```

**使用タイミング**: Phase 2（スキル構造の設計）

---

### 3. ファイル分割パターン

**リソース**: `splitting-patterns.md`
**パス**: `.claude/skills/documentation-architecture/resources/splitting-patterns.md`

**内容**:
- トピック別分割（推奨）
- レベル別分割（初級・中級・上級）
- 機能別分割（設計・実装・検証）
- ハイブリッド分割

**参照コマンド**:
```bash
cat .claude/skills/documentation-architecture/resources/splitting-patterns.md
```

**使用タイミング**: Phase 2（スキル構造の設計）、Phase 3（ファイル生成）

---

### 4. 遅延読み込みパターン

**リソース**: `lazy-loading-patterns.md`
**パス**: `.claude/skills/context-optimization/resources/lazy-loading-patterns.md`

**内容**:
- インデックス駆動設計
- リソース参照の段階的読み込み
- トークン効率的なアクセスパターン

**参照コマンド**:
```bash
cat .claude/skills/context-optimization/resources/lazy-loading-patterns.md
```

**使用タイミング**: Phase 2（構造設計）、Phase 3（ファイル生成）

---

### 5. 情報源評価ガイド

**リソース**: `information-source-evaluation.md`
**パス**: `.claude/skills/best-practices-curation/resources/information-source-evaluation.md`

**内容**:
- 信頼性評価基準（権威性、検証可能性、更新頻度）
- 情報源ランキング（公式ドキュメント > 専門家著作 > コミュニティ）
- 陳腐化リスク評価

**参照コマンド**:
```bash
cat .claude/skills/best-practices-curation/resources/information-source-evaluation.md
```

**使用タイミング**: Phase 1（知識収集）、Phase 4（品質保証）

---

## テンプレート参照

### 1. 知識文書化テンプレート

**テンプレート**: `knowledge-document-template.md`
**パス**: `.claude/skills/knowledge-management/templates/knowledge-document-template.md`

**内容**:
- YAML Frontmatter構造
- 必須セクション（概要、使用タイミング、主要概念、実践例）
- 推奨セクション（関連スキル、参照資料）

**参照コマンド**:
```bash
cat .claude/skills/knowledge-management/templates/knowledge-document-template.md
```

**使用タイミング**: Phase 3（ファイル生成）

---

### 2. スキルメタデータテンプレート

**テンプレート**: `skill-metadata-template.yaml`
**パス**: `.claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml`

**内容**:
```yaml
---
name: skill-name
description: |
  簡潔な説明（1-2行）

  使用タイミング:
  - シチュエーション1
  - シチュエーション2
  - シチュエーション3

  Use proactively when [英語の発動条件].
tools: [Read, Write, Grep, Bash]
tags: [tag1, tag2, tag3]
version: 1.0.0
---
```

**参照コマンド**:
```bash
cat .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml
```

**使用タイミング**: Phase 2（メタデータ設計）

---

### 3. リソース構造テンプレート

**テンプレート**: `resource-structure.md`
**パス**: `.claude/skills/documentation-architecture/templates/resource-structure.md`

**内容**:
```
skill-name/
├── SKILL.md
├── resources/
│   ├── topic-1.md
│   ├── topic-2.md
│   └── advanced-patterns.md
├── scripts/
│   └── validate-skill.mjs
├── templates/
│   └── skill-template.md
└── assets/
    └── diagram.png
```

**参照コマンド**:
```bash
cat .claude/skills/documentation-architecture/templates/resource-structure.md
```

**使用タイミング**: Phase 2（構造設計）、Phase 3（ディレクトリ作成）

---

### 4. 評価チェックリスト

**テンプレート**: `evaluation-checklist.md`
**パス**: `.claude/skills/best-practices-curation/templates/evaluation-checklist.md`

**内容**:
- [ ] 情報源の信頼性確認
- [ ] 内容の正確性検証
- [ ] 更新日の確認
- [ ] 関連ドキュメントとの整合性
- [ ] 実践可能性の評価

**参照コマンド**:
```bash
cat .claude/skills/best-practices-curation/templates/evaluation-checklist.md
```

**使用タイミング**: Phase 1（知識収集）、Phase 4（品質保証）

---

## コマンド使用フロー

### Phase 1: 知識収集
```bash
# 情報源評価
cat .claude/skills/best-practices-curation/resources/information-source-evaluation.md

# 評価チェックリスト
cat .claude/skills/best-practices-curation/templates/evaluation-checklist.md

# SECIモデル適用
cat .claude/skills/knowledge-management/resources/seci-model-details.md
```

### Phase 2: 構造設計
```bash
# 3層開示モデル参照
cat .claude/skills/progressive-disclosure/resources/three-layer-model.md

# 分割パターン確認
cat .claude/skills/documentation-architecture/resources/splitting-patterns.md

# メタデータテンプレート取得
cat .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml

# 構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs <skill-dir>
```

### Phase 3: ファイル生成
```bash
# 知識文書化テンプレート
cat .claude/skills/knowledge-management/templates/knowledge-document-template.md

# リソース構造テンプレート
cat .claude/skills/documentation-architecture/templates/resource-structure.md

# トークン見積もり（単一ファイル）
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs <file.md>
```

### Phase 4: 品質保証
```bash
# 品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs <skill-file.md>

# トークン使用量計算
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs <skill-directory>

# 構造分析（改善提案）
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs <skill-directory>
```

---

## 関連スキル

- **knowledge-management** (`.claude/skills/knowledge-management/SKILL.md`): SECIモデル適用、知識キュレーション
- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): 3層開示設計、メタデータ最適化
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ファイル分割、構造設計
- **context-optimization** (`.claude/skills/context-optimization/SKILL.md`): トークン効率化、遅延読み込み
- **best-practices-curation** (`.claude/skills/best-practices-curation/SKILL.md`): 情報源評価、品質スコアリング

---

## ベストプラクティス

### スクリプト実行
1. **事前条件確認**: Node.js 18+ がインストールされていることを確認
2. **パス検証**: スクリプトパスの存在を確認してから実行
3. **エラーハンドリング**: スクリプトエラー時は詳細ログを確認

### リソース参照
1. **必要最小限**: 必要なリソースのみを読み込む（段階的ロード）
2. **キャッシュ活用**: 一度読み込んだリソースは再利用
3. **トークン意識**: 大きなリソースは必要時のみ参照

### テンプレート使用
1. **プレースホルダー置換**: `{{placeholder}}` を実際の値に置換
2. **カスタマイズ**: プロジェクト固有の要件に合わせて調整
3. **バージョン管理**: テンプレートのバージョンを記録

---

## トラブルシューティング

### スクリプトが実行できない
**症状**: `node: command not found`
**原因**: Node.jsがインストールされていない
**解決策**:
```bash
# Node.js 18以上をインストール
# macOS
brew install node

# Ubuntu
sudo apt install nodejs npm
```

### リソースが見つからない
**症状**: `cat: no such file or directory`
**原因**: リソースパスが間違っている
**解決策**:
```bash
# プロジェクトルートから相対パスで指定
cd /path/to/AIWorkflowOrchestrator
cat .claude/skills/knowledge-management/resources/seci-model-details.md
```

### トークン計算が不正確
**症状**: 実際のトークン数と見積もりが大きく異なる
**原因**: 特殊文字やコードブロックの処理
**解決策**: 実際にClaude Codeで読み込んで確認

---

## バージョン履歴

### 1.0.0 (2025-01-27)
- 初版リリース
- TypeScriptスクリプト実行ガイド（4種）
- リソース参照（5種）
- テンプレート参照（4種）
- Phase別コマンドフロー定義
