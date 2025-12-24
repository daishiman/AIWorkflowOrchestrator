---
name: .claude/skills/event-driven-file-watching/SKILL.md
description: |
  Ryan Dahlのイベント駆動・非同期I/O思想に基づくファイルシステム監視の専門知識。
  Chokidarライブラリを中心に、Observer Patternによる効率的なファイル変更検知、
  クロスプラットフォーム対応、EventEmitterによる疎結合な通知システムを提供。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/chokidar-config-reference.md`: chokidar-config-reference のリファレンス
  - `resources/event-emitter-patterns.md`: event-emitter-patterns のパターン集
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/watcher-template.ts`: watcher-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling event driven file watching tasks.
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

# Event-Driven File Watching

## 概要

Ryan Dahlのイベント駆動・非同期I/O思想に基づくファイルシステム監視の専門知識。
Chokidarライブラリを中心に、Observer Patternによる効率的なファイル変更検知、
クロスプラットフォーム対応、EventEmitterによる疎結合な通知システムを提供。

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
- Chokidarによるファイル監視システムを設計・実装する時
- Observer Patternでイベント通知を設計する時
- ファイルシステムイベントのハンドリングを実装する時
- クロスプラットフォーム対応の監視設定を決定する時
- 監視方式（native fsevents vs polling）を選択する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/event-driven-file-watching/resources/Level1_basics.md
cat .claude/skills/event-driven-file-watching/resources/Level2_intermediate.md
cat .claude/skills/event-driven-file-watching/resources/Level3_advanced.md
cat .claude/skills/event-driven-file-watching/resources/Level4_expert.md
cat .claude/skills/event-driven-file-watching/resources/chokidar-config-reference.md
cat .claude/skills/event-driven-file-watching/resources/event-emitter-patterns.md
cat .claude/skills/event-driven-file-watching/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/event-driven-file-watching/scripts/log_usage.mjs --help
node .claude/skills/event-driven-file-watching/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/event-driven-file-watching/templates/watcher-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
