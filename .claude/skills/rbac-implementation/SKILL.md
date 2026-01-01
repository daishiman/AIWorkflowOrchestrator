---
name: rbac-implementation
description: |
  ロールベースアクセス制御（RBAC）の実装パターン専門スキル。
  権限管理、ロール設計、ポリシーベース認可を提供します。

  Anchors:
  • 『Web Application Security』（Andrew Hoffman）/ 適用: アクセス制御設計 / 目的: セキュアな権限実装

  Trigger:
  RBAC実装時、権限管理設計時、ロール・パーミッション構築時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# ロールベースアクセス制御（RBAC）実装

## 概要

ロールベースアクセス制御（RBAC）の設計と実装パターンを提供します。
最小権限の原則に基づくロール体系設計、多層アクセス制御、権限チェックロジック、
ポリシーエンジン構築の実装方法を段階的にガイドします。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` で基礎を確認
2. 必要な resources、scripts、templates を特定
3. システムの権限モデルと要件を整理

### Phase 2: スキル適用と実装

**目的**: スキルの指針に従って具体的な実装を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら実装を実施
2. `references/role-permission-design.md` で体系設計を確認
3. `references/multi-layer-access-control.md` で多層実装パターンを適用
4. `assets/rbac-middleware-template.ts` を参考にコード実装
5. 重要な判断点をドキュメントとして記録

### Phase 3: 検証と最適化

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-rbac-config.mjs` で設定を検証
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 実装が要件に合致するか検証
4. `scripts/log_usage.mjs` を実行して実施記録を残す

## Task仕様ナビ

| Task             | 対応Level | リソース                      | テンプレート                | 説明                                |
| ---------------- | --------- | ----------------------------- | --------------------------- | ----------------------------------- |
| ロール体系設計   | Level1-2  | role-permission-design.md     | rbac-middleware-template.ts | ロールと権限の関係設計              |
| 多層アクセス制御 | Level2-3  | multi-layer-access-control.md | rbac-middleware-template.ts | ミドルウェア、API、データ層での実装 |
| 権限チェック実装 | Level1-2  | Level1_basics.md              | rbac-middleware-template.ts | 権限チェックロジックの実装          |
| ポリシーエンジン | Level3-4  | Level3_advanced.md            | -                           | 動的ポリシー管理の実装              |
| 動的権限管理     | Level3-4  | Level4_expert.md              | -                           | 実行時権限の動的更新                |
| RBAC設定検証     | Level2    | requirements-index.md         | validate-rbac-config.mjs    | 設定の正確性確認                    |

## ベストプラクティス

### すべきこと

- **体系設計**: ロールと権限の明確な体系を事前に設計する
- **多層実装**: ミドルウェア、APIルート、データ層で一貫した権限チェック
- **最小権限**: 必要最小限の権限をロールに付与
- **ポリシーベース**: 複雑な要件にはポリシーエンジンを活用
- **ドキュメント**: 権限体系と実装パターンを明確にドキュメント化
- **テスト**: 権限チェックの単体テストと統合テストを実施
- **監査**: アクセス制御の変更を監査ログとして記録

### 避けるべきこと

- ハードコード化した権限チェック（保守性が低下）
- 権限チェックの分散実装（一貫性を失う可能性）
- ドキュメントなしの複雑な権限体系
- 権限の過剰付与（最小権限の原則違反）
- 権限体系の設計なし実装（後から変更困難）
- テストなし本番運用（セキュリティリスク）

## リソース参照

### 基礎ガイド

`references/` ディレクトリには段階的な学習ガイドが用意されています:

- **Level1_basics.md**: RBAC の基本概念、ロール定義、権限の基礎
- **Level2_intermediate.md**: 実装パターン、多層制御、テスト方法
- **Level3_advanced.md**: ポリシーエンジン、動的権限管理、最適化
- **Level4_expert.md**: 複雑な要件、パフォーマンス調整、大規模システム

### 実装ガイド

- **role-permission-design.md**: ロール・権限設計の方法論と実践パターン
- **multi-layer-access-control.md**: ミドルウェア、API、データ層での実装方法

### スクリプト・テンプレート

- `scripts/validate-rbac-config.mjs`: RBAC設定の検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造の検証
- `scripts/log_usage.mjs`: 使用記録の自動ログ
- `assets/rbac-middleware-template.ts`: Express/Node.js用RBAC Middleware

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/rbac-implementation/references/Level1_basics.md
cat .claude/skills/rbac-implementation/references/Level2_intermediate.md
cat .claude/skills/rbac-implementation/references/Level3_advanced.md
cat .claude/skills/rbac-implementation/references/Level4_expert.md
cat .claude/skills/rbac-implementation/references/legacy-skill.md
cat .claude/skills/rbac-implementation/references/multi-layer-access-control.md
cat .claude/skills/rbac-implementation/references/role-permission-design.md
```

### スクリプト実行

```bash
node .claude/skills/rbac-implementation/scripts/log_usage.mjs --help
node .claude/skills/rbac-implementation/scripts/validate-rbac-config.mjs --help
node .claude/skills/rbac-implementation/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/rbac-implementation/assets/rbac-middleware-template.ts
```

## 変更履歴

| Version | Date       | Changes                                                                    |
| ------- | ---------- | -------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様への完全準拠（Anchors、Trigger日本語化、Task仕様ナビ追加） |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                |
