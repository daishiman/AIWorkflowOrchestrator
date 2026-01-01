---
name: semantic-versioning
description: |
  セマンティックバージョニング（semver）に基づく依存関係変更の影響予測と対応戦略を専門とするスキル。
  依存パッケージのバージョンアップ時の破壊的変更検出、影響分析、移行戦略立案を支援する。

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: 実践的な依存関係管理とリスク軽減 / 目的: 品質維持とコード進化の両立
  • Semantic Versioning 2.0.0 Specification / 適用: バージョン番号の解釈と影響範囲予測 / 目的: 変更の性質を正確に判断

  Trigger:
  Use when managing package dependency updates, analyzing version compatibility, detecting breaking changes, planning migration strategies, or assessing upgrade risks.
  Keywords: semver, dependency, version, breaking change, migration, upgrade, compatibility, package update
version: 1.1.0
last_updated: 2025-12-31
tags:
  - dependency-management
  - version-control
  - breaking-changes
  - migration
---

# Semantic Versioning

## 概要

セマンティックバージョニング（semver）に基づく依存関係変更の影響予測と対応戦略を専門とするスキル。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 影響分析 (Impact Analysis)

**目的**: バージョン変更の影響範囲を特定する

**Task**: `agents/analyze-impact.md` を参照

**入力**:

- 現在のバージョン
- 更新予定のバージョン
- 依存関係ツリー

**出力**:

- 破壊的変更のリスト
- 影響を受けるコードの特定
- 変更の性質（major/minor/patch）の判定

**実行**:

```bash
node scripts/analyze-version-impact.mjs --from <current-version> --to <target-version>
```

### Phase 2: 移行計画立案 (Migration Planning)

**目的**: 安全な移行戦略を策定する

**Task**: `agents/plan-migration.md` を参照

**入力**:

- Phase 1 の影響分析結果
- プロジェクトの制約条件
- リスク許容度

**出力**:

- 段階的移行計画
- 必要な変更リスト
- テスト戦略

**参照**:

- `references/migration-strategies.md` で戦略パターンを確認
- `assets/upgrade-assessment-template.md` でドキュメント化

### Phase 3: 検証と記録

**目的**: 移行の成功を検証し、知見を記録する

**アクション**:

1. テストスイートで互換性を確認
2. 破壊的変更が適切に対処されているか検証
3. `scripts/log_usage.mjs` で実行記録を保存

```bash
node scripts/log_usage.mjs --result success --phase "migration" --notes "Upgraded to v2.0.0"
```

## ベストプラクティス

### すべきこと

- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/semantic-versioning/references/Level1_basics.md
cat .claude/skills/semantic-versioning/references/Level2_intermediate.md
cat .claude/skills/semantic-versioning/references/Level3_advanced.md
cat .claude/skills/semantic-versioning/references/Level4_expert.md
cat .claude/skills/semantic-versioning/references/breaking-change-detection.md
cat .claude/skills/semantic-versioning/references/legacy-skill.md
cat .claude/skills/semantic-versioning/references/migration-strategies.md
cat .claude/skills/semantic-versioning/references/semver-specification.md
cat .claude/skills/semantic-versioning/references/version-range-patterns.md
```

### スクリプト実行

```bash
node .claude/skills/semantic-versioning/scripts/analyze-version-impact.mjs --help
node .claude/skills/semantic-versioning/scripts/log_usage.mjs --help
node .claude/skills/semantic-versioning/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/semantic-versioning/assets/upgrade-assessment-template.md
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
