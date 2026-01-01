---
name: memory-monitoring-strategies
description: |
  Node.jsアプリケーションのメモリ監視とリーク検出を専門とするスキル。PM2、V8ヒープ分析、メモリプロファイリングを活用した効率的なメモリ管理を設計します。

  **Anchors**:
  - メモリ使用量の監視と可視化
  - メモリリークの検出と原因診断
  - PM2メモリ制限の設定と管理
  - ヒープダンプ分析と最適化
  - RSS/heapUsed/heapTotal各メトリクスの監視

  **Trigger**:
  - メモリ監視戦略を設計する必要がある時
  - アプリケーションのメモリリークを調査する時
  - PM2でプロセスのメモリ制限を管理する時
  - ヒープ分析でメモリ使用パターンを理解したい時
  - 本番環境でメモリ使用量を継続的に監視する時

  📖 参照書籍:
  - 『Observability Engineering』（Charity Majors）: ログ設計とメトリクス戦略

  📚 リソース参照:
  - `references/Level1_basics.md`: メモリ監視の基礎
  - `references/Level2_intermediate.md`: PM2とメトリクス設定
  - `references/Level3_advanced.md`: ヒープ分析と最適化
  - `references/Level4_expert.md`: 本番環境監視戦略
  - `references/heap-analysis.md`: heapdump取得と分析手法
  - `references/leak-detection.md`: リーク検出と原因診断
  - `references/memory-metrics.md`: メトリクス定義と閾値設定
  - `scripts/memory-monitor.mjs`: リアルタイム監視ツール
  - `assets/memory-tracker.template.ts`: PM2実装テンプレート

allowed-tools:
  - bash
  - node
  - grep
  - read
  - edit

version: 1.0.0
level: 1
last_updated: 2025-12-31
---

# メモリ監視戦略

## 概要

Node.jsアプリケーションのメモリ監視とリーク検出に特化したスキルです。PM2、V8ヒープ分析、メモリプロファイリングを活用して、本番環境での効率的なメモリ管理を実現します。

**主な適用場面**:

- アプリケーションのメモリリークを検出・診断する
- PM2でプロセスのメモリ制限を管理する
- ヒープダンプを分析してメモリ使用パターンを理解する
- RSS、heapUsed、heapTotalなどのメトリクスを継続的に監視する
- 本番環境でアラート閾値を設定・運用する

詳細な実装手順は `references/Level1_basics.md` ～ `references/Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: 現状把握と戦略設計

**目的**: アプリケーションのメモリ監視ニーズを理解し、監視戦略を設計する

**アクション**:

1. `references/Level1_basics.md` でメモリ監視の基礎を確認
2. 対象アプリケーションの特性（フレームワーク、規模、負荷パターン）を整理
3. 監視対象メトリクス（RSS/heapUsed/heapTotal/external）を選定
4. PM2またはNode.js組み込みAPIのどちらを使用するか判断
5. `references/memory-metrics.md` でメトリクス定義と閾値を確認

### Phase 2: 実装と検証

**目的**: 監視機構を実装し、正常に動作することを確認する

**アクション**:

1. `references/Level2_intermediate.md` でPM2の設定方法を学習
2. `assets/memory-tracker.template.ts` を参考に実装コードを作成
3. `references/heap-analysis.md` でheapdump取得方法を学習
4. ローカル環境でメモリ監視ツール（`scripts/memory-monitor.mjs`）をテスト
5. アラート閾値を設定してアラート動作を確認

### Phase 3: 本番環境への展開と最適化

**目的**: 本番環境でメモリ監視を稼働させ、リークを検出・対応する

**アクション**:

1. `references/Level3_advanced.md` でヒープダンプ分析手法を学習
2. `references/leak-detection.md` でリーク検出パターンを確認
3. PM2メモリ制限設定を本番環境に適用
4. `references/Level4_expert.md` で本番運用のベストプラクティスを確認
5. `scripts/log_usage.mjs` を実行して使用記録を記録

## Task仕様ナビ

| Task                 | 説明                                                        | 関連リソース                                       | スキルレベル |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ------------ |
| メモリ監視の基礎設定 | Node.jsアプリケーションのメモリ監視を初期化                 | Level1_basics.md, memory-metrics.md                | Level 1      |
| PM2メモリ監視        | PM2でプロセスのメモリ使用量を監視・制限                     | Level2_intermediate.md, memory-tracker.template.ts | Level 2      |
| ヒープダンプ分析     | Chrome DevToolsでheapdumpを分析、メモリ使用パターンを可視化 | Level3_advanced.md, heap-analysis.md               | Level 3      |
| メモリリーク検出     | 継続的なメモリ増加を検出し、リーク原因を診断                | Level2_intermediate.md, leak-detection.md          | Level 2      |
| リアルタイム監視実装 | memory-monitor.mjsで本番環境のメモリを継続監視              | memory-monitor.mjs, memory-tracker.template.ts     | Level 3      |
| アラート閾値設定     | RSS、heapUsedなどのメトリクスに基づくアラート設定           | memory-metrics.md, Level2_intermediate.md          | Level 2      |
| GC効果測定           | ガベージコレクション前後のメモリ状態を比較                  | heap-analysis.md, Level3_advanced.md               | Level 3      |
| 本番環境最適化       | パフォーマンスと安定性を両立させた監視戦略を設計            | Level4_expert.md, leak-detection.md                | Level 4      |

## ベストプラクティス

### すべきこと

- **複数メトリクスを監視する**: RSS、heapUsed、heapTotalの3つを同時に監視し、パターンから問題を判定する
- **段階的な閾値設定**: ウォーニング閾値と致命的閾値の2段階を設定し、段階的に対応する
- **ヒープダンプを定期的に取得**: 本番環境での定期的なheapdump取得を計画し、リークの早期発見に活用する
- **PM2メモリ制限の併用**: 監視とメモリ制限を組み合わせて、リーク時のOOM対策を実装する
- **GC効果を測定する**: GC実行前後のメモリ状態を比較して、GCの有効性を確認する
- **継続的な記録を残す**: `scripts/log_usage.mjs` で使用実績を記録し、トレンド分析に活用する
- **レベル別の段階的学習**: Level1から順に学習し、各段階で理解を深めてから次段階へ進む

### 避けるべきこと

- **単一メトリクスのみの依存**: RSSだけに依存すると、内部メモリの詳細が把握できない
- **アラート閾値の過剰設定**: 頻繁なアラートはアラートノイズになり、問題検知効率が低下する
- **本番環境でのいきなり分析**: ローカル環境で十分なテストを行わずに本番に展開しない
- **リーク原因の推測**:リーク疑いは必ずヒープダンプで裏付けを取ること
- **メモリ制限の過度な厳格化**: パフォーマンスと安定性のバランスを失わないこと
- **リソース資料の確認スキップ**: `references/leak-detection.md` などの注意点を飛ばすと、後で同じ問題に遭遇する

## リソース参照

### レベル別リソース

| リソース                           | 内容                                                   | 対象レベル |
| ---------------------------------- | ------------------------------------------------------ | ---------- |
| `references/Level1_basics.md`       | メモリ監視の基礎、メトリクス説明、環境構築             | Level 1    |
| `references/Level2_intermediate.md` | PM2設定、アラート閾値、リーク初期診断                  | Level 2    |
| `references/Level3_advanced.md`     | ヒープダンプ分析、GCチューニング、パフォーマンス最適化 | Level 3    |
| `references/Level4_expert.md`       | 本番環境運用戦略、自動化、SRE観点での監視設計          | Level 4    |

### 専門テーマ別リソース

| リソース                      | 主要内容                                                                    |
| ----------------------------- | --------------------------------------------------------------------------- |
| `references/heap-analysis.md`  | heapdump取得方法、Chrome DevTools操作、スナップショット比較、リーク原因特定 |
| `references/leak-detection.md` | リーク兆候の検出パターン、継続的メモリ増加の分析、原因診断フロー            |
| `references/memory-metrics.md` | RSS/heapUsed/heapTotal/externalの定義、警告閾値設定、計算式                 |

### スクリプト・ツール

| スクリプト                   | 用途                                                      |
| ---------------------------- | --------------------------------------------------------- |
| `scripts/memory-monitor.mjs` | リアルタイムメモリ監視（PID/PM2アプリ指定、閾値アラート） |
| `scripts/validate-skill.mjs` | スキル構造の検証                                          |
| `scripts/log_usage.mjs`      | スキル使用記録・自動評価                                  |

### テンプレート

| テンプレート                           | 用途                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| `assets/memory-tracker.template.ts` | PM2カスタムメトリクス実装テンプレート（TypeScript、io.metric活用） |

## 変更履歴

| Version | Date       | Changes                                                                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠、YAML frontmatter更新、Anchors/Trigger追加、ワークフロー詳細化、Task仕様ナビ追加、リソース参照テーブル化 |
