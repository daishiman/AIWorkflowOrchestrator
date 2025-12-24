---
name: .claude/skills/lock-file-management/SKILL.md
description: |
  ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と
  依存関係の再現性確保を専門とするスキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/ci-cd-optimization.md`: frozen-lockfile設定、キャッシュ戦略、ビルド時間短縮、並列インストール
  - `resources/conflict-resolution.md`: マージコンフリクト解決手順、再生成戦略、両立性確保の方法
  - `resources/integrity-verification.md`: package.json同期確認、整合性ハッシュ検証、依存ツリー検証、自動チェックスクリプト
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/lock-file-formats.md`: pnpm/pnpm/yarn各形式の構造、バージョン履歴、形式間比較、移行ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/verify-lock-integrity.mjs`: ロックファイル整合性の自動検証（PM検出、同期確認、詳細レポート）
  - `templates/lockfile-troubleshooting-template.md`: ロックファイル問題のトラブルシューティング手順テンプレート
  
  Use proactively when handling lock file management tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Lock File Management

## 概要

ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と
依存関係の再現性確保を専門とするスキル。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- ロックファイルのマージコンフリクトを解決する時
- 依存関係の再現性問題をデバッグする時
- CI/CD環境での依存関係インストールを最適化する時
- 新しい環境でのセットアップ手順を確立する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/lock-file-management/resources/Level1_basics.md
cat .claude/skills/lock-file-management/resources/Level2_intermediate.md
cat .claude/skills/lock-file-management/resources/Level3_advanced.md
cat .claude/skills/lock-file-management/resources/Level4_expert.md
cat .claude/skills/lock-file-management/resources/ci-cd-optimization.md
cat .claude/skills/lock-file-management/resources/conflict-resolution.md
cat .claude/skills/lock-file-management/resources/integrity-verification.md
cat .claude/skills/lock-file-management/resources/legacy-skill.md
cat .claude/skills/lock-file-management/resources/lock-file-formats.md
```

### スクリプト実行
```bash
node .claude/skills/lock-file-management/scripts/log_usage.mjs --help
node .claude/skills/lock-file-management/scripts/validate-skill.mjs --help
node .claude/skills/lock-file-management/scripts/verify-lock-integrity.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/lock-file-management/templates/lockfile-troubleshooting-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
