---
name: agent-validation-testing
description: |
  エージェントの検証とテストケース設計を専門とするスキル。
  構文検証、テストケース作成、最終検証により、
  エージェントの正確性と信頼性を保証します。

  専門分野:
  - 構文検証: YAML/Markdown構文チェック、パス検証
  - テストケース設計: 正常系・異常系・エッジケースの作成
  - 最終検証: 設計原則準拠、完全性確認、統合テスト
  - デバッグ: エラー特定、修正、再検証

  使用タイミング:
  - エージェントファイル生成後の検証時
  - テストケースを作成する時
  - デプロイ前の最終検証時
  - エラーをデバッグする時

  Use proactively when validating agent files, creating test cases,
  or performing final verification before deployment.
version: 1.0.0
---

# Agent Validation Testing

## 概要

このスキルは、Claude Codeエージェントの検証とテストに関する包括的なガイドラインを提供します。

**主要な価値**:
- 構文エラーの早期検出により、実行時エラーを防止
- テストケースにより、エージェントの動作が保証
- 最終検証により、品質基準への準拠を確認

## リソース構造

```
agent-validation-testing/
├── SKILL.md
├── resources/
│   ├── syntax-validation-guide.md
│   ├── test-case-patterns.md
│   └── final-verification-checklist.md
├── scripts/
│   ├── validate-yaml.sh
│   └── validate-markdown.sh
└── templates/
    └── test-case-template.json
```

## ワークフロー

### Phase 1: 構文検証

**目的**: YAML/Markdown構文の正確性を確認

**検証項目**:

#### YAML構文検証
```bash
./scripts/validate-yaml.sh .claude/agents/[agent-name].md
```

**チェック内容**:
- YAMLパースエラーがないか
- 必須フィールド（name, description）が存在するか
- インデントが正しいか
- 特殊文字のエスケープが適切か

#### Markdown構文検証
```bash
./scripts/validate-markdown.sh .claude/agents/[agent-name].md
```

**チェック内容**:
- 見出しレベルが適切か（#, ##, ###）
- コードブロックが正しく閉じられているか
- リストの形式が正しいか
- リンクが有効か

#### パス検証
**チェック内容**:
- スキル参照パスが存在するか
- 相対パスが正しいか
- コマンド参照が有効か

**リソース**: `resources/syntax-validation-guide.md`

### Phase 2: テストケース設計

**目的**: エージェントの動作を検証するテストケース作成

**テストケース構成**（最低3つ）:

#### テストケース1（基本動作）
```json
{
  "test_id": "TC001",
  "type": "normal",
  "name": "基本的な動作テスト",
  "input": {
    "task": "典型的な使用例",
    "context": {}
  },
  "expected_behavior": "標準ワークフロー実行",
  "expected_output": {
    "status": "completed",
    "artifacts": ["file1.md"]
  },
  "success_criteria": [
    "全Phaseが完了",
    "成果物が生成される",
    "エラーがない"
  ]
}
```

#### テストケース2（高度な使用例）
**目的**: 複雑なシナリオでの動作確認

#### テストケース3（エラーケース）
**目的**: エラーハンドリングの確認
- エラー検出
- 適切なエラーメッセージ
- リカバリー動作

**リソース**: `resources/test-case-patterns.md`

### Phase 3: 最終検証

**目的**: 全検証項目のクリア確認

**検証チェックリスト**:

#### 設計原則の遵守
- [ ] 単一責任の原則に従っているか？
- [ ] コンテキスト分離の原則に従っているか？
- [ ] Progressive Disclosure原則を適用しているか？
- [ ] 最小権限の原則に従っているか？

#### 構造的完全性
- [ ] YAML Frontmatterが完全か？
- [ ] 全必須セクションが含まれているか？
- [ ] ワークフローが5段階以上あるか？
- [ ] 依存関係が明確に定義されているか？

#### 品質メトリクス
- [ ] トークン使用量が推奨範囲内（<10K）か？
- [ ] descriptionの具体性（4-8行）？
- [ ] チェックリスト項目数（Phase毎に3つ以上）？
- [ ] テストケース数（3つ以上）？

#### セキュリティ
- [ ] ツール権限が適切に制限されているか？
- [ ] 危険な操作に承認要求が設定されているか？
- [ ] センシティブファイルへのアクセスが制限されているか？

**リソース**: `resources/final-verification-checklist.md`

### Phase 4: デバッグと修正

**目的**: 検出されたエラーの修正

**デバッグプロセス**:
1. エラーの特定
2. 原因の分析
3. 修正の実施
4. 再検証

**リソース**: すべてのリソースファイル

## ベストプラクティス

### すべきこと

1. **段階的検証**:
   - 構文 → テスト → 最終検証の順

2. **自動化**:
   - スクリプトによる自動検証
   - CI/CDパイプラインへの統合

3. **テストの充実**:
   - 正常系・異常系・エッジケース

### 避けるべきこと

1. **検証のスキップ**:
   - ❌ 検証なしでデプロイ
   - ✅ 必ず全検証を実施

2. **不十分なテスト**:
   - ❌ 正常系のみ
   - ✅ 異常系も含める

## トラブルシューティング

### 問題1: YAML構文エラー

**症状**: YAMLパースエラー

**原因**: インデント、特殊文字

**解決策**:
1. インデントを確認（スペース2個）
2. 特殊文字をエスケープ
3. YAMLバリデーターで検証

### 問題2: テストが失敗

**症状**: テストケースが期待通りに動作しない

**原因**: エージェントの実装または期待値の誤り

**解決策**:
1. エラーメッセージを分析
2. 期待値が適切か確認
3. エージェントをデバッグ

## 関連スキル

- **agent-quality-standards** (`.claude/skills/agent-quality-standards/SKILL.md`): 品質基準
- **agent-structure-design** (`.claude/skills/agent-structure-design/SKILL.md`): 構造設計

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- テストケースパターン (`resources/test-case-patterns.md`)

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# テストケースパターン
cat .claude/skills/agent-validation-testing/resources/test-case-patterns.md
```

### 他のスキルのスクリプトを活用

```bash
# エージェント構造検証（agent-structure-designスキルのスクリプトを使用）
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs <agent_file.md>

# 循環依存チェック（agent-dependency-designスキルのスクリプトを使用）
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs <agent_file.md>

# アーキテクチャ検証（agent-architecture-patternsスキルのスクリプトを使用）
node .claude/skills/agent-architecture-patterns/scripts/validate-architecture.mjs <agent_file.md>
```

## メトリクス

### 検証合格率

**目標**: 初回検証で>80%、再検証で100%

### テストカバレッジ

**目標**: 正常系2+ 異常系1+

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 - 検証とテストフレームワーク |
