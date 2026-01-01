---
name: open-closed-principle
description: |
  オープン・クローズド原則（OCP）の専門スキル。
  拡張に対して開き、修正に対して閉じた設計を提供します。

  Anchors:
  • 『Clean Architecture』（Robert C. Martin） / 適用: SOLID原則 / 目的: 保守性向上
  • 『アジャイルソフトウェア開発の奥義』（Robert C. Martin） / 適用: 設計パターン / 目的: 拡張性確保

  Trigger:
  OCP適用時、拡張可能設計時、SOLID原則実装時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Open-Closed Principle (OCP)

## 概要

SOLID原則の開放閉鎖原則（OCP: Open-Closed Principle）は、
ソフトウェアエンティティが拡張に対して開かれ、修正に対して閉じていることを述べています。

このスキルは以下を実現します：

- 既存コードを修正せずに新機能を追加できる拡張可能な設計
- アンチパターン（if-elseチェーン、switch文、型チェック）の識別と改善
- Strategy、Template Method、Plugin Registryなどの拡張パターンの適用
- レガシーコードのOCP準拠への段階的なリファクタリング

詳細な手順や背景は `references/Level1_basics.md` から `Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にし、適用すべきレベルを決定

**アクション**:

1. `references/Level1_basics.md` でOCPの基本概念を確認
2. `references/Level2_intermediate.md` で実装パターンを学習
3. 必要に応じて `references/Level3_advanced.md` と `Level4_expert.md` で応用技法を確認
4. タスクに適用する拡張メカニズムを特定（`references/extension-mechanisms.md` 参照）

### Phase 2: スキル適用

**目的**: OCPの指針に従って設計またはリファクタリングを実施

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. `scripts/analyze-extensibility.mjs` でコード内のOCP違反を検出
3. 拡張ポイントを設計：`assets/extension-point-template.md` を活用
4. 重要な判断点（責任の分離、拡張戦略など）をメモとして記録

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/analyze-extensibility.mjs` で改善後のコード品質を再度確認
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 成果物がOCP原則に準拠しているか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Task               | 説明                                 | リソース                      | スクリプト                  |
| ------------------ | ------------------------------------ | ----------------------------- | --------------------------- |
| OCP基礎学習        | OCPの基本概念と利点を理解            | `Level1_basics.md`            | -                           |
| アンチパターン検出 | コード内のOCP違反を特定              | `analyze-extensibility.mjs`   | `analyze-extensibility.mjs` |
| 拡張性設計         | 新機能を追加できる拡張ポイントを設計 | `extension-point-template.md` | -                           |
| リファクタリング   | 既存コードをOCP準拠に改善            | `refactoring-to-ocp.md`       | `analyze-extensibility.mjs` |
| パターン適用       | Strategy、Template Methodなどを実装  | `ocp-patterns.md`             | -                           |
| 実装検証           | 実装がOCP原則に準拠しているか確認    | `validate-skill.mjs`          | `validate-skill.mjs`        |

## ベストプラクティス

### すべきこと

- **拡張ポイントを明確にする**: 新しいタイプ・変数が追加される可能性がある場所を事前に設計
- **抽象化を活用する**: インターフェース、基底クラス、ジェネリクスで変動部を隠蔽
- **段階的に適用する**: すべてを一度にOCP準拠にするのではなく、段階的に改善
- **アンチパターンを避ける**: if-elseチェーン、switch文、型チェック、フラグパラメータを識別・リファクタリング
- **テストを追加する**: リファクタリング前後で拡張性とバグの有無を検証

### 避けるべきこと

- **過度な抽象化**: 実装されない拡張ポイントを設計しない（YAGNI原則に反する）
- **複雑性の増加**: 単純な機能を複雑にしないため、本当に拡張が必要な箇所のみに適用
- **アンチパターンの無視**: switch文やif-elseチェーンを放置しない
- **テストなしのリファクタリング**: 変更前に既存機能が正常に動作することを確認
- **一度に全体をリファクタリング**: 段階的に、失敗しやすい部分から改善

## リソース参照

### 学習リソース

- `references/Level1_basics.md`: OCPの基本概念、利点、簡単な例
- `references/Level2_intermediate.md`: 実装パターン、アンチパターンの改善方法
- `references/Level3_advanced.md`: 複雑なシナリオでの応用、パフォーマンス最適化
- `references/Level4_expert.md`: エンタープライズパターン、メタプログラミング

### テクニカルリソース

- `references/ocp-fundamentals.md`: OCPの原則、歴史的背景、基本概念
- `references/ocp-patterns.md`: Strategy、Template Method、Plugin Registry、Factory、Decorator、Abstract Factory
- `references/extension-mechanisms.md`: 拡張メカニズム（どのパターンをいつ使うか）
- `references/refactoring-to-ocp.md`: レガシーコードのリファクタリング手順
- `references/legacy-skill.md`: 旧SKILL.mdの全文（参考）

### スクリプトとツール

- `scripts/analyze-extensibility.mjs`: コードのOCP違反検出（switch文、if-elseチェーン、型チェック、フラグパラメータ）
- `scripts/validate-skill.mjs`: スキル構造と成果物の検証
- `scripts/log_usage.mjs`: 使用記録・自動評価

### テンプレート

- `assets/extension-point-template.md`: Strategy/Template Method/Plugin Registryによる拡張ポイント設計テンプレート

## 変更履歴

| Version | Date       | Changes                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に対応（Anchor/Trigger追加、Task仕様ナビ追加、ベストプラクティス充実） |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                            |
