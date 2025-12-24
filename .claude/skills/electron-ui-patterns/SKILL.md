---
name: .claude/skills/electron-ui-patterns/SKILL.md
description: |
  ElectronデスクトップアプリケーションのUI実装パターンと設計知識
  
  📖 参照書籍:
  - 『Don't Make Me Think』（Steve Krug）: ユーザビリティ
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/native-ui.md`: ネイティブUI要素（メニュー、ダイアログ、通知）
  - `resources/window-management.md`: BrowserWindow管理詳細
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/frameless-window.ts`: フレームレスウィンドウテンプレート
  
  Use proactively when handling electron ui patterns tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Don't Make Me Think"
    author: "Steve Krug"
    concepts:
      - "ユーザビリティ"
      - "情報設計"
---

# .claude/skills/electron-ui-patterns/SKILL.md

## 概要

ElectronデスクトップアプリケーションのUI実装パターンと設計知識

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
- BrowserWindowを作成・設定する時
- ネイティブメニューを実装する時
- カスタムタイトルバーを設計する時
- システムトレイアプリを作成する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/electron-ui-patterns/resources/Level1_basics.md
cat .claude/skills/electron-ui-patterns/resources/Level2_intermediate.md
cat .claude/skills/electron-ui-patterns/resources/Level3_advanced.md
cat .claude/skills/electron-ui-patterns/resources/Level4_expert.md
cat .claude/skills/electron-ui-patterns/resources/legacy-skill.md
cat .claude/skills/electron-ui-patterns/resources/native-ui.md
cat .claude/skills/electron-ui-patterns/resources/window-management.md
```

### スクリプト実行
```bash
node .claude/skills/electron-ui-patterns/scripts/log_usage.mjs --help
node .claude/skills/electron-ui-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/electron-ui-patterns/templates/frameless-window.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
