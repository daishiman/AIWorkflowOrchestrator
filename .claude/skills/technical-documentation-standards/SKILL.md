---
name: technical-documentation-standards
description: |
  技術ドキュメント標準の専門スキル。IEEE 830規格、Documentation as Code、DRY原則に基づいてエンタープライズグレードの技術文書を標準化・品質管理します。

  Anchors:
  • 『Software Requirements』（Karl Wiegers）/ 適用: 技術文書 / 目的: 要件仕様化
  • IEEE 830規格 / 適用: 仕様書 / 目的: 標準化
  • Documentation as Code / 適用: 文書管理 / 目的: VCS統合
  • DRY原則 / 適用: ドキュメント / 目的: 保守性向上

  Trigger:
  技術文書標準策定時、ドキュメント品質基準設定時、文書テンプレート設計時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
---

# 技術文書化標準スキル

## 概要

IEEE 830規格、Documentation as Code（ドキュメント・アズ・コード）、DRY原則に基づいて、エンタープライズグレードの技術文書を標準化・品質管理するスキルです。

このスキルは以下を実現します：

- **要件仕様の構造化**: IEEE 830に準拠した形式での要件定義
- **保守性の向上**: DRY原則により重複を排除し保守コスト削減
- **品質保証**: Clarity Checklistと検証パターンによる一貫性検証
- **テンプレート駆動**: 再利用可能なテンプレートで生産性向上

詳細な実装手順は `references/` ディレクトリのレベル別ガイドを参照してください。

## ワークフロー

### Phase 1: 文書要件と標準の整理

**目的**: ドキュメント作成タスクの要件と、適用すべき標準を明確化

**アクション**:

1. `references/Level1_basics.md` で基本概念を確認
2. 文書タイプ（仕様書、API文書、ユーザーマニュアル等）に応じて `references/Level2_intermediate.md` で手順を確認
3. 必要なテンプレート、スクリプト、チェックリストを特定
4. IEEE 830要件（該当する場合）を `references/ieee-830-overview.md` で確認

### Phase 2: 標準適用と文書作成

**目的**: 確認した標準とテンプレートに基づいて文書を作成・構造化

**アクション**:

1. `assets/srs-template.md` などの適切なテンプレートを使用開始
2. `references/doc-as-code.md` に従いMarkdown + Version Control で管理
3. DRY原則違反がないか `references/dry-for-documentation.md` で確認
4. `references/clarity-checklist.md` で明確性をレビュー
5. レベル3以上の複雑なドキュメントは `references/Level3_advanced.md` を参照

### Phase 3: 検証、品質確認、記録

**目的**: 成果物が標準を満たし、記録を残す

**アクション**:

1. `scripts/validate-skill.mjs` でドキュメント構造を検証
2. `scripts/check-dry-violations.mjs` でDRY違反をチェック
3. `references/verification-patterns.md` の検証パターンで品質確認
4. `scripts/log_usage.mjs` を実行して使用記録を保存
5. 必要に応じて `references/Level4_expert.md` で標準化実践を確認

## Task仕様ナビ

| タスク                    | 適用すべきリソース                       | スクリプト               | テンプレート    |
| ------------------------- | ---------------------------------------- | ------------------------ | --------------- |
| 仕様書作成                | Level1, ieee-830-overview                | validate-skill.mjs       | srs-template.md |
| DRY原則の検証             | dry-for-documentation                    | check-dry-violations.mjs | -               |
| 文書の明確性向上          | clarity-checklist                        | validate-skill.mjs       | -               |
| Documentation as Code導入 | doc-as-code                              | -                        | -               |
| 要件抽出と分析            | Level2_intermediate                      | log_usage.mjs            | srs-template.md |
| 標準化ガイドライン策定    | Level3_advanced, Level4_expert           | validate-skill.mjs       | -               |
| 文書品質監査              | verification-patterns, clarity-checklist | validate-skill.mjs       | -               |

## ベストプラクティス

### すべきこと

- **最初にレベルを確認**: Level1_basics.md で基礎を押さえてからLevel2以上を参照
- **テンプレートから始める**: `assets/srs-template.md` など既存テンプレートをベースに作成
- **DRY原則を徹底**: `references/dry-for-documentation.md` に従い、重複記述を最小化
- **Version Controlで管理**: Documentation as Code原則により、文書をGitで管理
- **検証スクリプトを活用**: `scripts/validate-skill.mjs` と `scripts/check-dry-violations.mjs` を定期実行
- **Clarity Checklistで確認**: 完成前に `references/clarity-checklist.md` で明確性をチェック
- **複雑なタスクは上位レベルを参照**: Level3_advanced.md、Level4_expert.md で深掘り
- **使用記録を残す**: `scripts/log_usage.mjs` で実績を追跡し、継続改善に活用

### 避けるべきこと

- テンプレートなしに一から文書を起草する（生産性低下、品質ばらつき）
- IEEE 830要件を確認せずに仕様書を作成する（規格違反）
- DRY原則を無視し、同じ情報を複数箇所に記述する（保守負荷増加）
- Markdown以外の形式で文書を管理する（VCS管理困難）
- 検証スクリプトを実行せず、品質確認を手動のみに頼る（チェック漏れ）
- 明確性チェックを省略する（曖昧な要件定義）
- アンチパターンを確認せずに進める（Level2以上のアンチパターンセクション参照必須）

## リソース参照

### レベル別ガイド

- **`references/Level1_basics.md`**: 基本概念、技術文書の構成要素、IEEE 830基礎
- **`references/Level2_intermediate.md`**: 実務的な手順、アンチパターン、業界標準
- **`references/Level3_advanced.md`**: 複雑な仕様書、拡張性、ドメイン固有の標準化
- **`references/Level4_expert.md`**: 業界最高実践、標準化戦略、組織規模での導入

### 専門リソース

- **`references/clarity-checklist.md`**: 文書の明確性を確保するためのチェックリスト
- **`references/doc-as-code.md`**: ドキュメント・アズ・コード実装ガイド
- **`references/dry-for-documentation.md`**: DRY原則のドキュメント適用方法
- **`references/ieee-830-overview.md`**: IEEE 830規格概要と適用ガイド
- **`references/verification-patterns.md`**: 文書品質の検証パターン集
- **`references/legacy-skill.md`**: 旧SKILL.mdの全文（参考）

### スクリプト・ツール

```bash
# DRY原則違反を自動検出
node .claude/skills/technical-documentation-standards/scripts/check-dry-violations.mjs <target-path>

# スキル構造と文書品質を検証
node .claude/skills/technical-documentation-standards/scripts/validate-skill.mjs

# 使用実績をログして自動評価
node .claude/skills/technical-documentation-standards/scripts/log_usage.mjs
```

### テンプレート

- **`assets/srs-template.md`**: IEEE 830準拠のソフトウェア要件仕様書（SRS）テンプレート。構造化・検証可能な形式で、すぐに実案件に適用可能

## 変更履歴

| Version | Date       | Changes                                                                                        |
| ------- | ---------- | ---------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠。Trigger/Anchors追加、Task仕様ナビ実装、日本語化完成、allowed-tools追加 |
