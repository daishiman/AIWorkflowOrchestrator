---
name: query-optimization
description: |
  Vlad MihaltseaとMarkus Winandの教えに基づくクエリ最適化を専門とするスキル。
  N+1問題の回避、フェッチ戦略の選択、実行計画分析、インデックス活用などの
  データベースパフォーマンス最適化手法を提供します。

  専門分野:
  - N+1問題回避: JOIN戦略、バッチフェッチ、データローダーパターン
  - フェッチ戦略: Eager/Lazy Loading、明示的フェッチの使い分け
  - 実行計画分析: EXPLAIN ANALYZE、ボトルネック特定、最適化判断
  - インデックス戦略: 適切なインデックス設計、カーディナリティ考慮

  使用タイミング:
  - クエリパフォーマンスが低下している時
  - N+1問題を検出・解消する時
  - 複雑なJOINクエリを最適化する時
  - インデックス設計を検討する時

  Use proactively when dealing with slow queries, N+1 detection,
  join optimization, or index design decisions.
version: 1.0.0
---

# Query Optimization

## 概要

このスキルは、Vlad Mihaltseaの『High-Performance Java Persistence』と
Markus Winandの『SQL Performance Explained』に基づき、
データベースクエリの最適化手法を提供します。

**主要な価値**:
- N+1問題の体系的な検出と解消
- フェッチ戦略の適切な選択によるパフォーマンス向上
- 実行計画に基づく根拠のある最適化判断
- インデックスの効果的な活用

**対象ユーザー**:
- `@repo-dev`エージェント
- データアクセス層を最適化する開発者
- パフォーマンス問題を調査する開発者

## リソース構造

```
query-optimization/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── n-plus-one-patterns.md                 # N+1問題のパターンと解決策
│   ├── fetch-strategies.md                    # フェッチ戦略ガイド
│   ├── execution-plan-analysis.md             # 実行計画分析手法
│   └── index-strategies.md                    # インデックス設計戦略
├── scripts/
│   └── detect-n-plus-one.mjs                  # N+1問題検出スクリプト
└── templates/
    └── optimization-checklist.md               # 最適化チェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# N+1問題パターンと解決策
cat .claude/skills/query-optimization/resources/n-plus-one-patterns.md

# フェッチ戦略ガイド
cat .claude/skills/query-optimization/resources/fetch-strategies.md

# 実行計画分析手法
cat .claude/skills/query-optimization/resources/execution-plan-analysis.md

# インデックス設計戦略
cat .claude/skills/query-optimization/resources/index-strategies.md
```

### スクリプト実行

```bash
# N+1問題検出
node .claude/skills/query-optimization/scripts/detect-n-plus-one.mjs <log-file>
```

### テンプレート参照

```bash
# 最適化チェックリスト
cat .claude/skills/query-optimization/templates/optimization-checklist.md
```

## いつ使うか

### シナリオ1: クエリパフォーマンス低下
**状況**: 特定の操作が遅く、DB負荷が高い

**適用条件**:
- [ ] レスポンスタイムが許容範囲を超えている
- [ ] DB負荷が高い
- [ ] クエリログに大量のクエリが記録されている

**期待される成果**: パフォーマンス改善の具体的な施策

### シナリオ2: N+1問題の疑い
**状況**: ループ内でDBアクセスが発生している可能性

**適用条件**:
- [ ] 関連エンティティをループで取得している
- [ ] クエリ数がデータ件数に比例している
- [ ] 単純な一覧表示でも大量のクエリが発生

**期待される成果**: N+1問題の特定と解消策

### シナリオ3: JOINクエリの最適化
**状況**: 複数テーブルを結合するクエリが遅い

**適用条件**:
- [ ] JOINを含むクエリがある
- [ ] 結合するテーブルが3つ以上
- [ ] 実行時間が長い

**期待される成果**: 最適化されたJOIN戦略

## ワークフロー

### Phase 1: 問題の特定

**目的**: パフォーマンス問題の根本原因を特定する

**ステップ**:
1. **症状の確認**:
   - レスポンスタイムの測定
   - クエリログの確認
   - クエリ数のカウント

2. **N+1問題の検出**:
   - ループ内のDB呼び出しを探す
   - クエリ数とデータ件数の相関を確認
   - クエリパターンの分析

3. **ボトルネックの特定**:
   - 実行計画の取得
   - 遅いクエリの特定
   - リソース使用量の確認

**判断基準**:
- [ ] 問題のあるクエリが特定されたか？
- [ ] N+1問題の有無が確認されたか？
- [ ] ボトルネックの原因が明確か？

**リソース**: `resources/n-plus-one-patterns.md`

### Phase 2: 原因分析

**目的**: 実行計画に基づいて問題の原因を分析する

**ステップ**:
1. **実行計画の取得**:
   - EXPLAIN ANALYZEの実行
   - 実行計画の読み方を理解

2. **問題パターンの識別**:
   - Seq Scan（フルスキャン）の検出
   - 不適切なJOIN方法の検出
   - インデックス未使用の検出

3. **影響度の評価**:
   - 改善可能性の見積もり
   - 優先順位の決定

**判断基準**:
- [ ] 実行計画を正しく解釈できたか？
- [ ] 問題パターンが識別されたか？
- [ ] 改善の優先順位が決まったか？

**リソース**: `resources/execution-plan-analysis.md`

### Phase 3: 最適化の実施

**目的**: 特定された問題に対する最適化を実施する

**ステップ**:
1. **N+1問題の解消**:
   - JOIN戦略の適用
   - バッチフェッチの実装
   - データローダーパターンの導入

2. **フェッチ戦略の最適化**:
   - Eager/Lazy Loadingの選択
   - 必要なカラムのみSELECT

3. **インデックスの追加**:
   - WHERE句の条件に対応
   - JOIN条件に対応
   - 複合インデックスの検討

**判断基準**:
- [ ] N+1問題が解消されたか？
- [ ] フェッチ戦略が適切か？
- [ ] インデックスが有効活用されているか？

**リソース**: `resources/fetch-strategies.md`, `resources/index-strategies.md`

### Phase 4: 効果検証

**目的**: 最適化の効果を測定する

**ステップ**:
1. **パフォーマンス測定**:
   - レスポンスタイムの再測定
   - クエリ数の確認
   - 実行計画の再確認

2. **回帰テスト**:
   - 既存機能への影響確認
   - データ整合性の検証

**判断基準**:
- [ ] パフォーマンスが改善されたか？
- [ ] 既存機能に影響がないか？
- [ ] 期待値を満たしているか？

## 核心概念

### N+1問題

**定義**: 1回のクエリでN件のデータを取得後、各データに対して追加クエリが発生する問題

**検出パターン**:
```typescript
// N+1問題あり
const workflows = await repository.findAll()  // 1回目
for (const workflow of workflows) {
  const steps = await stepRepository.findByWorkflowId(workflow.id)  // N回
}
// 合計: 1 + N 回のクエリ
```

**解決策**:
1. **JOIN**: 1回のクエリで関連データを取得
2. **バッチフェッチ**: IN句で複数IDを一括取得
3. **データローダー**: 同一リクエスト内のクエリを統合

### フェッチ戦略

| 戦略 | 説明 | 使用場面 |
|------|------|---------|
| Eager Loading | 常に関連データを取得 | 常に必要なデータ |
| Lazy Loading | アクセス時に取得 | 条件により必要 |
| 明示的フェッチ | メソッドで明示的に取得 | ユースケースごとに異なる |

### 実行計画の読み方

**重要な指標**:
- **Seq Scan**: フルテーブルスキャン（小規模テーブル以外は避ける）
- **Index Scan**: インデックス使用（推奨）
- **Nested Loop**: 小規模データセット向け
- **Hash Join**: 大規模データセット向け
- **actual time**: 実際の実行時間

## ベストプラクティス

### すべきこと

1. **測定してから最適化**:
   - 推測ではなく測定に基づく
   - 実行計画を確認する
   - before/afterで効果を確認

2. **必要なデータのみ取得**:
   - SELECT * を避ける
   - 必要なカラムを明示
   - 必要な行数をLIMIT

3. **インデックスを活用**:
   - WHERE句の条件にインデックス
   - JOIN条件にインデックス
   - カーディナリティを考慮

### 避けるべきこと

1. **ループ内のクエリ**:
   - ❌ for文内でDB呼び出し
   - ✅ 事前に一括取得

2. **過度なインデックス**:
   - ❌ すべてのカラムにインデックス
   - ✅ 実際のクエリパターンに基づく

3. **推測による最適化**:
   - ❌ 「遅そう」で最適化
   - ✅ 測定結果に基づく

## トラブルシューティング

### 問題1: N+1問題が解消されない

**症状**: JOINを追加してもクエリ数が減らない

**原因**: ORMのLazy Loadingが残っている

**解決策**:
1. JOINの結果が正しくマッピングされているか確認
2. 関連プロパティへのアクセス箇所を確認
3. Eager Loadingを明示的に指定

### 問題2: インデックスが使用されない

**症状**: インデックスがあるのにSeq Scan

**原因**:
- カーディナリティが低い
- 関数を使用している
- 型の不一致

**解決策**:
1. EXPLAIN ANALYZEで確認
2. クエリの書き方を見直し
3. インデックスの再設計

### 問題3: JOINが遅い

**症状**: JOINを追加したら逆に遅くなった

**原因**:
- 結果セットが大きすぎる
- JOINの順序が不適切
- インデックスが不足

**解決策**:
1. 結果セットのサイズを確認
2. JOIN条件を見直し
3. 必要なインデックスを追加

## 関連スキル

- **repository-pattern** (`.claude/skills/repository-pattern/SKILL.md`): Repositoryパターン設計
- **transaction-management** (`.claude/skills/transaction-management/SKILL.md`): トランザクション管理
- **orm-best-practices** (`.claude/skills/orm-best-practices/SKILL.md`): ORM活用
- **database-migrations** (`.claude/skills/database-migrations/SKILL.md`): マイグレーション管理

## メトリクス

### クエリパフォーマンス目標

| 指標 | 目標値 | 警告値 |
|------|--------|--------|
| 単純クエリ実行時間 | < 100ms | > 500ms |
| 複雑クエリ実行時間 | < 500ms | > 2s |
| N+1クエリ発生 | 0件 | 1件以上 |
| フルスキャン | 0件（小規模除く） | 1件以上 |

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - クエリ最適化フレームワーク |

## 参考文献

- **『High-Performance Java Persistence』** Vlad Mihalcea著
  - Chapter 5: Fetching - フェッチ戦略とN+1問題
  - Chapter 8: Batch Processing - バッチ処理最適化

- **『SQL Performance Explained』** Markus Winand著
  - Chapter 2: The WHERE Clause - WHERE句最適化
  - Chapter 3: Performance and Scalability - JOIN最適化
