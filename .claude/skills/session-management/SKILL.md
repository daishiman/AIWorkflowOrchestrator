---
name: session-management
description: |
  セッション管理とトークンライフサイクル戦略の実装パターン。
  セッション設計、トークン管理、セキュリティ対策を提供します。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas） / 適用: セッション管理 / 目的: 実践的改善と品質維持

  Trigger:
  セッション管理実装、認証状態維持、セッションセキュリティ設計、トークンリフレッシュ戦略検討時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# セッション管理

## 概要

セッション管理とトークンライフサイクル戦略の実装パターン。ユーザー認証後のセッション状態管理、トークン有効期限の制御、リフレッシュトークンの運用、セキュアなセッション永続化などの実装パターンを提供します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. セッション戦略の要件を整理（DB保存 vs JWT、有効期限、リフレッシュ戦略）
2. `references/session-strategy-comparison.md` で実装アプローチを検討
3. 必要なテンプレートとリソースを特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な実装を進める

**アクション**:

1. 選定したパターン（JWT or Database Session）に対応するテンプレートを参照
2. `references/Level2_intermediate.md` で実務手順を確認
3. Cookie属性やセキュリティ設定を `references/cookie-attributes-guide.md` で確認
4. テンプレートをプロジェクトに適応させて実装

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-session-config.mjs` でセッション設定を検証
2. 実装がセキュリティ要件を満たしているか確認
3. `scripts/log_usage.mjs` を実行して実装記録を残す

## Task仕様ナビ

| タスク               | リソース                       | スクリプト                  | テンプレート                 |
| -------------------- | ------------------------------ | --------------------------- | ---------------------------- |
| JWT実装基礎          | Level1_basics.md               | validate-skill.mjs          | jwt-session-template.ts      |
| DBセッション実装     | Level2_intermediate.md         | validate-session-config.mjs | database-session-template.ts |
| セキュリティ設定     | cookie-attributes-guide.md     | log_usage.mjs               | -                            |
| 実装パターン選定     | session-strategy-comparison.md | -                           | -                            |
| 高度なトークン戦略   | Level3_advanced.md             | -                           | -                            |
| エキスパートパターン | Level4_expert.md               | -                           | -                            |

## ベストプラクティス

### すべきこと

- セッション戦略を明確に定義してから実装を開始する（JWT vs DB Session の選定根拠）
- `references/Level2_intermediate.md` で実務的な注意点を確認する
- HttpOnly、Secure、SameSite などのCookie属性を `references/cookie-attributes-guide.md` で確認
- トークン有効期限とリフレッシュ戦略を事前に計画する
- 本番環境におけるセキュリティ設定を `scripts/validate-session-config.mjs` で検証する
- ユーザーのログアウト時にセッション状態を完全にクリアする

### 避けるべきこと

- セッションIDをURLパラメータに含める（キャッシュやログに記録されるリスク）
- 短すぎるトークン有効期限の設定（UXが低下）
- 長すぎるトークン有効期限の設定（セキュリティリスク）
- リフレッシュトークンをメモリのみに保存（ページリロードで消失）
- CSRF保護なしでステートフルセッションを使用する
- セッション情報を暗号化せずにクライアント側に保存する
- セッション有効期限のアイドルタイムアウト仕様がない実装

## リソース参照

### 学習リソース（references/）

```bash
cat .claude/skills/session-management/references/Level1_basics.md
cat .claude/skills/session-management/references/Level2_intermediate.md
cat .claude/skills/session-management/references/Level3_advanced.md
cat .claude/skills/session-management/references/Level4_expert.md
cat .claude/skills/session-management/references/cookie-attributes-guide.md
cat .claude/skills/session-management/references/legacy-skill.md
cat .claude/skills/session-management/references/session-strategy-comparison.md
```

### スクリプト・ツール（scripts/）

```bash
node .claude/skills/session-management/scripts/log_usage.mjs --help
node .claude/skills/session-management/scripts/validate-session-config.mjs --help
node .claude/skills/session-management/scripts/validate-skill.mjs --help
```

### 実装テンプレート（assets/）

```bash
cat .claude/skills/session-management/assets/database-session-template.ts
cat .claude/skills/session-management/assets/jwt-session-template.ts
```

## 変更履歴

| Version | Date       | Changes                                                                    |
| ------- | ---------- | -------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に準拠、Task仕様ナビテーブル追加、ベストプラクティス充実化 |
| 1.0.0   | 2025-12-24 | スキル構造の整形と必須アーティファクト追加                                 |
