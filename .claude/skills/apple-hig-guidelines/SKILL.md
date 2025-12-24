---
name: .claude/skills/apple-hig-guidelines/SKILL.md
description: |
  Apple Human Interface Guidelines（HIG）に基づくUI設計原則を専門とするスキル。
  
  📖 参照書籍:
  - 『Don't Make Me Think』（Steve Krug）: ユーザビリティ
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/accessibility-specs.md`: HIG アクセシビリティ詳細仕様
  - `resources/app-icons-specifications.md`: HIG App Icons 仕様書
  - `resources/component-states.md`: HIG コンポーネント状態定義
  - `resources/design-themes.md`: HIGの3つのテーマと6つの設計原則
  - `resources/interaction-patterns.md`: HIG インタラクションパターン
  - `resources/launch-screens.md`: HIG Launch Screens 仕様書
  - `resources/layout-grid-system.md`: HIG レイアウト＆グリッドシステム
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/notifications.md`: HIG Notifications 仕様書
  - `resources/platform-specifics.md`: プラットフォーム別HIG対応
  - `resources/typography-colors.md`: HIGタイポグラフィとカラーシステム
  - `resources/ui-components.md`: HIG UIコンポーネント仕様
  - `resources/visual-design-specs.md`: HIG ビジュアルデザイン仕様
  - `resources/widgets-live-activities.md`: HIG Widgets & Live Activities 仕様書
  - `scripts/check-hig-compliance.mjs`: Apple HIG準拠チェックスクリプト v1.2.0
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/hig-design-checklist.md`: Apple HIG設計チェックリスト v1.2.0
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when designing iOS/Apple platform UI, implementing HIG-compliant.
version: 1.2.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Don't Make Me Think"
    author: "Steve Krug"
    concepts:
      - "ユーザビリティ"
      - "情報設計"
---

# Apple Human Interface Guidelines

## 概要

Apple Human Interface Guidelines（HIG）に基づくUI設計原則を専門とするスキル。

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
- iOSネイティブアプリのUI設計時
- Apple Design Systemに準拠したUIを作成する時
- モバイルファーストのUIを設計する時
- クロスプラットフォームApple対応が必要な時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/apple-hig-guidelines/resources/Level1_basics.md
cat .claude/skills/apple-hig-guidelines/resources/Level2_intermediate.md
cat .claude/skills/apple-hig-guidelines/resources/Level3_advanced.md
cat .claude/skills/apple-hig-guidelines/resources/Level4_expert.md
cat .claude/skills/apple-hig-guidelines/resources/accessibility-specs.md
cat .claude/skills/apple-hig-guidelines/resources/app-icons-specifications.md
cat .claude/skills/apple-hig-guidelines/resources/component-states.md
cat .claude/skills/apple-hig-guidelines/resources/design-themes.md
cat .claude/skills/apple-hig-guidelines/resources/interaction-patterns.md
cat .claude/skills/apple-hig-guidelines/resources/launch-screens.md
cat .claude/skills/apple-hig-guidelines/resources/layout-grid-system.md
cat .claude/skills/apple-hig-guidelines/resources/legacy-skill.md
cat .claude/skills/apple-hig-guidelines/resources/notifications.md
cat .claude/skills/apple-hig-guidelines/resources/platform-specifics.md
cat .claude/skills/apple-hig-guidelines/resources/typography-colors.md
cat .claude/skills/apple-hig-guidelines/resources/ui-components.md
cat .claude/skills/apple-hig-guidelines/resources/visual-design-specs.md
cat .claude/skills/apple-hig-guidelines/resources/widgets-live-activities.md
```

### スクリプト実行
```bash
node .claude/skills/apple-hig-guidelines/scripts/check-hig-compliance.mjs --help
node .claude/skills/apple-hig-guidelines/scripts/log_usage.mjs --help
node .claude/skills/apple-hig-guidelines/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/apple-hig-guidelines/templates/hig-design-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.2.0 | 2025-12-24 | Spec alignment and required artifacts added |
