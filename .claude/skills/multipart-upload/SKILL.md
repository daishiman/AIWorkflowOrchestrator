---
name: .claude/skills/multipart-upload/SKILL.md
description: |
  大容量ファイルのマルチパートアップロードを専門とするスキル。
  アンドリュー・タネンバウムの『コンピュータネットワーク』に基づき、
  ネットワークの不安定性を前提とした堅牢なファイル転送を設計します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/checksum-verification.md`: SHA-256/MD5によるデータ整合性検証とストリーム処理でのハッシュ計算
  - `resources/chunk-size-optimization.md`: チャンクサイズ最適化ガイド
  - `resources/chunk-strategies.md`: ファイルサイズとネットワーク品質に基づく動的チャンク分割アルゴリズム
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/progress-tracking.md`: リアルタイム進捗率・転送速度・推定残り時間の計算パターン
  - `scripts/analyze-upload-config.mjs`: アップロード設定の妥当性検証とチャンクサイズ推奨値算出スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-upload.mjs`: ファイルのチェックサム計算と最適チャンクサイズ判定スクリプト
  - `templates/chunk-uploader-template.ts`: チャンク分割・リトライ・進捗追跡機能を持つアップローダー実装テンプレート
  - `templates/upload-client-template.ts`: HTTPクライアントとFormData構築を統合したアップロードクライアントテンプレート
  - `templates/upload-manager-template.ts`: 複数ファイルの並列アップロードとキュー管理を提供するマネージャーテンプレート
  
  Use proactively when handling multipart upload tasks.
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

# Multipart Upload

## 概要

大容量ファイルのマルチパートアップロードを専門とするスキル。
アンドリュー・タネンバウムの『コンピュータネットワーク』に基づき、
ネットワークの不安定性を前提とした堅牢なファイル転送を設計します。

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
- 大容量ファイル（10MB超）のアップロード実装時
- 転送進捗のリアルタイム表示が必要な時
- 中断再開可能なアップロード機能を実装する時
- チェックサム検証によるデータ整合性が必要な時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/multipart-upload/resources/Level1_basics.md
cat .claude/skills/multipart-upload/resources/Level2_intermediate.md
cat .claude/skills/multipart-upload/resources/Level3_advanced.md
cat .claude/skills/multipart-upload/resources/Level4_expert.md
cat .claude/skills/multipart-upload/resources/checksum-verification.md
cat .claude/skills/multipart-upload/resources/chunk-size-optimization.md
cat .claude/skills/multipart-upload/resources/chunk-strategies.md
cat .claude/skills/multipart-upload/resources/legacy-skill.md
cat .claude/skills/multipart-upload/resources/progress-tracking.md
```

### スクリプト実行
```bash
node .claude/skills/multipart-upload/scripts/analyze-upload-config.mjs --help
node .claude/skills/multipart-upload/scripts/log_usage.mjs --help
node .claude/skills/multipart-upload/scripts/validate-skill.mjs --help
node .claude/skills/multipart-upload/scripts/validate-upload.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/multipart-upload/templates/chunk-uploader-template.ts
cat .claude/skills/multipart-upload/templates/upload-client-template.ts
cat .claude/skills/multipart-upload/templates/upload-manager-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
