---
name: .claude/skills/nodejs-stream-processing/SKILL.md
description: |
  Node.jsにおけるストリーム処理とバックプレッシャー管理の専門知識。
  大容量ファイルの効率的処理、メモリ使用量の最適化、
  Readable/Writable/Transform/Duplexストリームの適切な活用方法を提供。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/backpressure-guide.md`: バックプレッシャーガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/stream-utils.ts`: Readable/Writable/Transform/Duplexストリームの実装パターンとpipeline()による安全なチェーン構築テンプレート
  
  Use proactively when handling nodejs stream processing tasks.
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

# Node.js Stream Processing

## 概要

Node.jsにおけるストリーム処理とバックプレッシャー管理の専門知識。
大容量ファイルの効率的処理、メモリ使用量の最適化、
Readable/Writable/Transform/Duplexストリームの適切な活用方法を提供。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- 大容量ファイル（>10MB）を処理する時
- メモリ使用量を一定に保ちたい時
- ファイルアップロード/ダウンロードを実装する時
- データ変換パイプラインを構築する時
- バックプレッシャー問題を解決したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/nodejs-stream-processing/references/Level1_basics.md
cat .claude/skills/nodejs-stream-processing/references/Level2_intermediate.md
cat .claude/skills/nodejs-stream-processing/references/Level3_advanced.md
cat .claude/skills/nodejs-stream-processing/references/Level4_expert.md
cat .claude/skills/nodejs-stream-processing/references/backpressure-guide.md
cat .claude/skills/nodejs-stream-processing/references/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/nodejs-stream-processing/scripts/log_usage.mjs --help
node .claude/skills/nodejs-stream-processing/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/nodejs-stream-processing/assets/stream-utils.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
