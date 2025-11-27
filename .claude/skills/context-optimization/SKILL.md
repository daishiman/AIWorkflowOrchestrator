---
name: context-optimization
description: |
    トークン使用量の最小化と必要情報の効率的抽出を専門とするスキル。
    遅延読み込み、インデックス駆動設計、圧縮と精錬により、
    コンテキストウィンドウを最適活用します。
    専門分野:
    - 遅延読み込み: 必要な時に必要な情報のみロード
    - インデックス設計: 目次駆動、効率的なナビゲーション
    - 圧縮と精錬: 冗長性排除、本質的情報の抽出
    - トークン見積もり: 使用量の予測と最適化
    使用タイミング:
    - トークン使用量を削減する必要がある時
    - 大量の情報を効率的に提供したい時
    - コンテキスト汚染を防ぎたい時
    - 情報アクセスを最適化する時
    Use proactively when optimizing token usage, implementing lazy loading,
    or minimizing context pollution.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/context-optimization/resources/compression-techniques.md`: 冗長性排除と本質的情報抽出のテクニック
  - `.claude/skills/context-optimization/resources/index-driven-design.md`: 目次駆動の効率的なナビゲーション設計
  - `.claude/skills/context-optimization/resources/lazy-loading-patterns.md`: 必要時のみロードする遅延読み込みパターン
  - `.claude/skills/context-optimization/scripts/estimate-tokens.mjs`: トークン使用量の自動計算スクリプト
  - `.claude/skills/context-optimization/scripts/estimate-tokens.sh`: トークン使用量の自動計算スクリプト（シェル版）

version: 1.0.0
---


# Context Optimization

## 概要

コンテキスト最適化は、限られたコンテキストウィンドウを最大限に活用するための戦略です。
必要最小限の情報提供、段階的なロード、効率的な参照設計により、
トークン使用量を60-80%削減しながら、必要な知識を確実に提供します。

**主要な価値**:
- トークン使用量の大幅削減（60-80%）
- コンテキスト汚染の防止
- 必要な情報への高速アクセス
- スケーラブルな知識提供

## リソース構造

```
context-optimization/
├── SKILL.md
├── resources/
│   ├── lazy-loading-patterns.md
│   ├── index-driven-design.md
│   └── compression-techniques.md
└── scripts/
    └── estimate-tokens.sh
```

### リソース種別

- **遅延読み込み** (`resources/lazy-loading-patterns.md`): 必要な時に必要な情報のみロード
- **インデックス設計** (`resources/index-driven-design.md`): 目次駆動、効率的なナビゲーション
- **圧縮テクニック** (`resources/compression-techniques.md`): 冗長性排除、本質的情報の抽出
- **トークン見積もりスクリプト** (`scripts/estimate-tokens.mjs`): トークン使用量の自動計算（TypeScript）

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 遅延読み込みパターン
cat .claude/skills/context-optimization/resources/lazy-loading-patterns.md

# インデックス駆動設計
cat .claude/skills/context-optimization/resources/index-driven-design.md

# 圧縮テクニック
cat .claude/skills/context-optimization/resources/compression-techniques.md
```

### スクリプト実行

```bash
# 単一ファイルのトークン見積もり（TypeScript）
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs <file.md>

# ディレクトリ内の全ファイルを分析
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs <directory>

# 例: SKILL.mdのトークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/context-optimization/SKILL.md

# 例: リソースディレクトリの分析
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/context-optimization/resources/
```

## いつ使うか

### シナリオ1: トークン削減
**状況**: スキルのトークン使用量が20Kを超えている

**適用条件**:
- [ ] 総トークン数が20K以上
- [ ] コンテキストウィンドウを圧迫
- [ ] 削減の余地がある

**期待される成果**: 60-80%の削減

### シナリオ2: 遅延読み込みの実装
**状況**: すべての情報を事前ロードしている

**適用条件**:
- [ ] 多数のリソースファイルがある
- [ ] すべてを同時に使うことは稀
- [ ] 段階的な参照が可能

**期待される成果**: 必要時のみロードする設計

## ワークフロー

### Phase 1: 遅延読み込み設計

**原則**: 全リソースの事前ロード禁止

**方法**:
- SKILL.mdにインデックスを提供
- 必要なリソースのみ参照
- エージェントが判断して選択

**リソース**: `resources/lazy-loading-patterns.md`

### Phase 2: インデックス駆動設計

**原則**: SKILL.mdは「目次」として機能

**方法**:
- リソース構造セクションでディレクトリツリー提示
- 各Phaseで対応するリソースを明示
- リソース選択ガイドを提供

**リソース**: `resources/index-driven-design.md`

### Phase 3: 圧縮と精錬

**原則**: 冗長性を排除、本質のみ抽出

**方法**:
- 重複削除（DRY原則）
- 例の最小化（2-3個）
- 概念要素中心（具体例は最小限）

**リソース**: `resources/compression-techniques.md`

## ベストプラクティス

### すべきこと
1. **SKILL.mdは500行以内**: 厳守
2. **インデックスを充実**: リソース構造セクション必須
3. **参照を明確に**: どこに何があるか常に明示

### 避けるべきこと
1. **全ロード**: すべてのリソースを一度に参照しない
2. **冗長性**: 同じ情報を複数箇所に書かない
3. **過度な詳細**: 本質的でない情報は削除

## メトリクス

### トークン削減率
**目標**: 60-80%

### 情報アクセス時間
**目標**: <2分

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-23 | 初版作成 - コンテキスト最適化戦略 |

## 関連スキル

- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): 3層開示モデル
- **knowledge-management** (`.claude/skills/knowledge-management/SKILL.md`): 知識の体系化
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計
