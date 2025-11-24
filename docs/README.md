# Documentation Structure

Universal AI Workflow Orchestrator & Claude Code Ecosystem のドキュメント構造ガイド。

## 📚 ディレクトリ構成

```
docs/
├── README.md                          # 本ファイル（ドキュメント構造ガイド）
├── 00-requirements/                   # 要件定義
│   ├── master_system_design.md       # システム全体設計仕様
│   └── claude_code_design.md         # Claude Code設計仕様
├── 10-guides/                         # ガイド・チュートリアル
│   ├── skill-creation/               # Skill作成ガイド
│   │   ├── complete-guide.md         # Skill作成完全ガイド
│   │   └── patterns/                 # 実例パターン集
│   │       └── knowledge-management-example.md
│   └── agent-usage/                  # エージェント使用ガイド（将来拡張用）
├── 20-specifications/                 # 技術仕様書（将来用）
├── 30-architecture/                   # アーキテクチャ設計書（将来用）
└── 90-archive/                        # アーカイブ（非推奨・削除予定）
```

## 📖 番号付け規則

ディレクトリの番号は IEEE 830 / Documentation as Code の原則に基づきます:

| 番号 | カテゴリ | 目的 | 読者 |
|------|----------|------|------|
| `00-` | 要件定義 (Requirements) | プロジェクトの目的と制約を定義 | PM、アーキテクト、開発者 |
| `10-` | ガイド (Guides) | 実践的な手順とチュートリアル | 開発者、ユーザー |
| `20-` | 仕様書 (Specifications) | 詳細な技術仕様と API 定義 | 開発者、テスター |
| `30-` | アーキテクチャ (Architecture) | システム設計と設計判断の記録 | アーキテクト、上級開発者 |
| `90-` | アーカイブ (Archive) | 非推奨・削除予定のドキュメント | 参照のみ |

## 🎯 ドキュメント配置ガイドライン

### 新しいドキュメントを作成する場合

1. **要件定義** → `00-requirements/`
   - プロジェクトのゴール、制約、非機能要件
   - PRD (Product Requirements Document)
   - システム要求仕様書

2. **ガイド・チュートリアル** → `10-guides/`
   - 操作手順書
   - クイックスタートガイド
   - ベストプラクティス集
   - 実例パターン

3. **技術仕様書** → `20-specifications/`
   - API 仕様
   - データスキーマ定義
   - インターフェース定義書

4. **アーキテクチャ設計** → `30-architecture/`
   - システムアーキテクチャ図
   - ADR (Architecture Decision Records)
   - 設計原則とパターン

## 🔄 ドキュメントのライフサイクル

### 作成フロー

```
要件定義 (00-) → 設計 (30-) → 仕様 (20-) → ガイド (10-)
```

### 更新フロー

1. Git でバージョン管理
2. 変更履歴は各ドキュメントの「変更履歴」セクションに記録
3. 大きな変更は ADR (Architecture Decision Record) として記録

### 廃止フロー

1. 非推奨マークを追加: `# [非推奨] ドキュメント名`
2. 代替ドキュメントへのリンクを追加
3. 3ヶ月後に `90-archive/` に移動
4. 6ヶ月後に削除検討

## 📝 ドキュメント作成原則

### DRY 原則 (Don't Repeat Yourself)

- 同じ情報を複数箇所に書かない
- 共通情報は参照リンクで管理
- 例: `詳細は [システム設計仕様](00-requirements/master_system_design.md) を参照`

### 構造化原則

- 見出しレベルを適切に使用 (`#`, `##`, `###`)
- 箇条書きとテーブルで可読性を向上
- Mermaid 図でフロー・構造を可視化

### AI 可読性

- 明確な見出し構造
- コードブロックに言語指定
- 入出力のデータ型を明記

## 🔗 関連リンク

- [システム設計仕様書](00-requirements/master_system_design.md)
- [Skill作成完全ガイド](10-guides/skill-creation/complete-guide.md)
- [エージェント一覧](../.claude/agents/agent_list.md)

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成（docs構造整理に伴い @spec-writer により作成） |
