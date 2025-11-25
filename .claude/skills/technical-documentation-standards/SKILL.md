---
name: technical-documentation-standards
description: |
  IEEE 830、Documentation as Code、DRY原則に基づく技術文書化標準の専門スキル。
  実装者が迷わない「正本」としてのドキュメントを作成するための標準とプラクティスを提供します。

  専門分野:
  - IEEE 830準拠: ソフトウェア要件仕様書の国際標準
  - DRY原則の文書適用: 重複排除、単一の真実の情報源
  - Documentation as Code: バージョン管理、CI/CD統合、自動化
  - 実装者中心設計: 曖昧さの排除、検証可能な記述

  使用タイミング:
  - 正式な仕様書を作成する時
  - ドキュメントの品質基準を設定する時
  - 既存ドキュメントの標準化が必要な時
  - ドキュメントとコードの乖離を防ぎたい時

  Use proactively when creating formal specifications, establishing documentation
  standards, or implementing Documentation as Code practices.
version: 1.0.0
---

# Technical Documentation Standards

## 概要

このスキルは、技術文書を「正本」として確立するための標準とプラクティスを提供します。
アンドリュー・ハントの『達人プログラマー』が提唱するDRY原則を文書にも適用し、
IEEE 830等の国際標準に準拠した品質の高い技術文書を作成します。

**主要な価値**:
- 実装者が迷わない明確な仕様書
- コードとドキュメントの整合性維持
- 重複排除による保守性向上
- 検証可能で曖昧さのない記述

**対象ユーザー**:
- 仕様書を作成するエージェント（@spec-writer）
- テクニカルライター
- システムアーキテクト

## リソース構造

```
technical-documentation-standards/
├── SKILL.md                                    # 本ファイル（概要と原則）
├── resources/
│   ├── ieee-830-overview.md                   # IEEE 830準拠ガイド
│   ├── dry-for-documentation.md               # DRY原則の文書適用
│   ├── doc-as-code.md                         # Documentation as Codeプラクティス
│   ├── clarity-checklist.md                   # 明確性チェックリスト
│   └── verification-patterns.md               # 検証可能な記述パターン
├── scripts/
│   └── check-dry-violations.mjs               # DRY違反検出スクリプト
└── templates/
    └── srs-template.md                        # ソフトウェア要件仕様書テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# IEEE 830準拠ガイド
cat .claude/skills/technical-documentation-standards/resources/ieee-830-overview.md

# DRY原則の文書適用
cat .claude/skills/technical-documentation-standards/resources/dry-for-documentation.md

# Documentation as Codeプラクティス
cat .claude/skills/technical-documentation-standards/resources/doc-as-code.md

# 明確性チェックリスト
cat .claude/skills/technical-documentation-standards/resources/clarity-checklist.md

# 検証可能な記述パターン
cat .claude/skills/technical-documentation-standards/resources/verification-patterns.md
```

### スクリプト実行

```bash
# DRY違反検出（TypeScript）
node .claude/skills/technical-documentation-standards/scripts/check-dry-violations.mjs <directory>
```

### テンプレート参照

```bash
# ソフトウェア要件仕様書テンプレート
cat .claude/skills/technical-documentation-standards/templates/srs-template.md
```

## いつ使うか

### シナリオ1: 正式な仕様書の作成
**状況**: 実装の根拠となる公式仕様書を作成する

**適用条件**:
- [ ] 複数の実装者が参照する文書である
- [ ] 長期間メンテナンスされる予定
- [ ] 品質保証の根拠として使用される

**推奨アプローチ**: IEEE 830準拠、検証可能な記述

### シナリオ2: ドキュメント品質の改善
**状況**: 既存ドキュメントの品質が低く、使いにくい

**適用条件**:
- [ ] 曖昧な表現が多い
- [ ] 重複情報が散在している
- [ ] 最新状態が不明確

**推奨アプローチ**: DRY原則適用、明確性チェックリスト

### シナリオ3: Documentation as Code導入
**状況**: ドキュメントとコードの乖離を防ぎたい

**適用条件**:
- [ ] ドキュメントをGitで管理したい
- [ ] ドキュメントの変更をCIで検証したい
- [ ] ドキュメント生成を自動化したい

**推奨アプローチ**: Markdown、Lint、自動生成

## 前提条件

### 必要な知識
- [ ] 基本的なドキュメンテーションスキル
- [ ] バージョン管理（Git）の基礎
- [ ] Markdownの基本構文

### 必要なツール
- Write: ドキュメントの作成
- Read: 既存ドキュメントの参照
- Grep: 重複検出、パターン検索

### 環境要件
- Gitリポジトリ内でドキュメントを管理
- Markdownレンダリング環境

## ワークフロー

### Phase 1: 標準の理解と適用方針決定

**目的**: 適用する標準と品質基準を明確化する

**ステップ**:
1. **ドキュメントタイプの特定**:
   - 要件仕様書 → IEEE 830
   - API仕様書 → OpenAPI + DRY
   - 設計書 → アーキテクチャ標準

2. **品質基準の設定**:
   - 完全性: 必要な情報がすべて含まれるか
   - 明確性: 曖昧さがないか
   - 検証可能性: 検証できる基準があるか
   - 一貫性: 用語や形式が統一されているか

**判断基準**:
- [ ] 適用する標準が明確か？
- [ ] 品質基準が定義されているか？

**リソース**: `resources/ieee-830-overview.md`

### Phase 2: DRY原則の適用

**目的**: 重複を排除し、単一の真実の情報源を確立する

**ステップ**:
1. **重複の特定**:
   - 同じ情報が複数箇所に記述されていないか
   - 共通定義（データ型、定数、認証方式等）を抽出

2. **共通定義の作成**:
   - 共通定義ファイルに集約
   - 参照による再利用

3. **参照方式の確立**:
   - Markdownリンクで参照
   - 一貫した参照形式

**判断基準**:
- [ ] 同じ情報が2箇所以上に記述されていないか？
- [ ] 共通定義が適切に分離されているか？
- [ ] 参照が正確で有効か？

**リソース**: `resources/dry-for-documentation.md`

### Phase 3: 明確性の確保

**目的**: 曖昧さを排除し、実装者が迷わない記述にする

**ステップ**:
1. **曖昧表現の検出**:
   - 「適切に」「必要に応じて」「可能であれば」を排除
   - 具体的な条件や数値に置き換え

2. **検証可能な記述**:
   - すべての要件にテスト可能な基準
   - 成功/失敗が明確に判定可能

3. **完全性の確認**:
   - すべての入力に対して出力が定義
   - エラーケースが網羅

**判断基準**:
- [ ] 曖昧な表現が残っていないか？
- [ ] すべての要件が検証可能か？
- [ ] エッジケースが考慮されているか？

**リソース**: `resources/clarity-checklist.md`, `resources/verification-patterns.md`

### Phase 4: Documentation as Codeの実践

**目的**: ドキュメントをコードと同様に管理する

**ステップ**:
1. **バージョン管理**:
   - Gitでドキュメントを管理
   - 変更履歴の記録
   - ブランチ戦略の適用

2. **自動検証**:
   - Markdownリンター
   - スペルチェック
   - 構文検証

3. **CI/CD統合**:
   - プルリクエストでのレビュー
   - 自動ビルド・デプロイ

**判断基準**:
- [ ] ドキュメントがGit管理されているか？
- [ ] 自動検証が設定されているか？
- [ ] レビュープロセスがあるか？

**リソース**: `resources/doc-as-code.md`

## ベストプラクティス

### すべきこと

1. **単一の真実の情報源（SSOT）**:
   - 共通定義は1箇所に集約
   - 他からは参照のみ
   - 変更は1箇所で完結

2. **検証可能な記述**:
   - 「ログインは高速であるべき」→「ログインは200ms以内に完了する」
   - 測定可能、テスト可能な基準

3. **変更履歴の明記**:
   - バージョン番号
   - 変更日と変更内容
   - 変更理由

### 避けるべきこと

1. **曖昧な表現**:
   - 「適切に処理する」
   - 「必要に応じて」
   - 「可能な限り」

2. **重複記述**:
   - 同じ情報を複数箇所に記載
   - コピペによる記述

3. **未バージョン管理**:
   - ローカルファイルのみ
   - 変更履歴なし

## トラブルシューティング

### 問題1: DRY違反が見つかる

**症状**: 同じ情報が複数箇所に記述されている

**原因**:
- 急いで作成したため重複
- 参照方式が確立されていない

**解決策**:
1. `check-dry-violations.mjs`で検出
2. 共通定義ファイルに抽出
3. 参照に置き換え

### 問題2: 曖昧さが残っている

**症状**: 実装者から質問が来る

**原因**:
- 暗黙の前提がある
- 条件が明示されていない

**解決策**:
1. 明確性チェックリストで検証
2. 具体的な条件・数値に置き換え
3. 例を追加

### 問題3: ドキュメントとコードが乖離

**症状**: 仕様書と実装が一致しない

**原因**:
- 更新が同期されていない
- レビュープロセスがない

**解決策**:
1. Documentation as Code導入
2. PRでのドキュメント必須化
3. 自動検証の追加

## 関連スキル

- **structured-writing** (`.claude/skills/structured-writing/SKILL.md`): 構造化ライティング手法
- **version-control-for-docs** (`.claude/skills/version-control-for-docs/SKILL.md`): ドキュメントのバージョン管理
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計

## メトリクス

### DRY遵守率
**測定方法**: 1 - (重複情報数 / 総情報数)
**目標**: 100%

### 明確性スコア
**測定方法**: 曖昧表現検出数 / 総文数
**目標**: 0%（曖昧表現なし）

### 検証可能性率
**測定方法**: 検証可能な要件数 / 総要件数
**目標**: 100%

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - IEEE 830、DRY、Doc as Codeの統合ガイド |

## 使用上の注意

### このスキルが得意なこと
- 技術文書の品質基準設定
- DRY原則のドキュメントへの適用
- 明確性の確保と曖昧さの排除
- Documentation as Codeの導入

### このスキルが行わないこと
- 文書の具体的なコンテンツ作成
- プロジェクト固有のビジネスロジック
- 実際のコード実装

### 参考文献
- **『達人プログラマー』** Andrew Hunt & David Thomas著
  - Chapter 1: DRY原則
  - Chapter 7: Documentation
- **IEEE 830-1998**: Software Requirements Specification
- **Docs for Developers**: Technical Documentation Best Practices
