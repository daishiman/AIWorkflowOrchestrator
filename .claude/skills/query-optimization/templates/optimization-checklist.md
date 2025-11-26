# クエリ最適化チェックリスト

## 使用方法

このチェックリストを使用して、クエリのパフォーマンス問題を体系的に調査・解決します。

## Phase 1: 問題の特定

### 症状の確認

- [ ] レスポンスタイムが遅い（目標: 単純クエリ < 100ms、複雑クエリ < 500ms）
- [ ] クエリログに大量のSELECT文がある
- [ ] データベース負荷が高い（CPU、I/O）
- [ ] コネクション数が増加している

### N+1問題の検出

- [ ] ループ内でawaitしているDB呼び出しはないか？
- [ ] Promise.all内で個別にクエリを発行していないか？
- [ ] 関連エンティティを個別に取得していないか？
- [ ] クエリ数がデータ件数に比例していないか？

**検出コマンド**:
```bash
node .claude/skills/query-optimization/scripts/detect-n-plus-one.mjs <query-log>
```

### ボトルネックの特定

- [ ] EXPLAIN ANALYZEで実行計画を確認したか？
- [ ] Seq Scan（フルスキャン）が発生していないか？
- [ ] 実行時間が長いクエリを特定したか？

## Phase 2: 原因分析

### 実行計画の確認

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...
```

**チェック項目**:
- [ ] Seq Scanが大規模テーブルで発生していないか？
- [ ] 推定行数（rows）と実際（actual rows）に大きな乖離がないか？
- [ ] 適切なJOIN方法が選択されているか？
- [ ] インデックスが使用されているか？

### インデックス確認

- [ ] WHERE句の条件にインデックスがあるか？
- [ ] JOIN条件のカラムにインデックスがあるか？
- [ ] ORDER BY のカラムにインデックスがあるか？
- [ ] 複合インデックスの順序は適切か？

## Phase 3: 最適化の実施

### N+1問題の解消

**解決策の選択**:

| 状況 | 推奨解決策 |
|------|----------|
| 関連データを常に使用 | JOIN |
| 関連データを時々使用 | バッチフェッチ |
| GraphQL/リゾルバー | DataLoader |

**実装チェック**:
- [ ] JOIN戦略を適用したか？
- [ ] バッチフェッチ（IN句）を実装したか？
- [ ] 変更後のクエリ数は減少したか？

### フェッチ戦略の最適化

- [ ] 必要なカラムのみSELECTしているか？
- [ ] SELECT * を使用していないか？
- [ ] 大きなカラム（JSONB、TEXT）を除外しているか？
- [ ] ページネーションを適用しているか？

### インデックスの追加

**追加前の確認**:
- [ ] 実際のクエリパターンに基づいているか？
- [ ] カーディナリティは十分高いか？
- [ ] 既存のインデックスと重複していないか？
- [ ] 書き込みパフォーマンスへの影響を考慮したか？

**インデックス作成例**:
```sql
-- 単一カラム
CREATE INDEX idx_{{table}}_{{column}} ON {{table}}({{column}});

-- 複合インデックス
CREATE INDEX idx_{{table}}_{{col1}}_{{col2}} ON {{table}}({{col1}}, {{col2}});

-- 部分インデックス
CREATE INDEX idx_{{table}}_{{column}}_active
ON {{table}}({{column}})
WHERE deleted_at IS NULL;

-- JSONB用GINインデックス
CREATE INDEX idx_{{table}}_{{jsonb_column}} ON {{table}} USING GIN({{jsonb_column}});
```

## Phase 4: 効果検証

### パフォーマンス測定

**測定項目**:
| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| レスポンスタイム | | | |
| クエリ数 | | | |
| DB CPU使用率 | | | |

- [ ] レスポンスタイムが改善したか？
- [ ] クエリ数が減少したか？
- [ ] DB負荷が軽減したか？

### 回帰テスト

- [ ] 既存機能に影響がないか？
- [ ] データの整合性は保たれているか？
- [ ] エラーが発生していないか？

## クイックリファレンス

### N+1解消の実装パターン

**JOINパターン**:
```typescript
// Before: N+1
const workflows = await repo.findAll()
for (const w of workflows) {
  w.steps = await stepRepo.findByWorkflowId(w.id)
}

// After: JOIN
const workflows = await repo.findAllWithSteps()
```

**バッチフェッチパターン**:
```typescript
// Before: N+1
const workflows = await repo.findAll()
for (const w of workflows) {
  w.steps = await stepRepo.findByWorkflowId(w.id)
}

// After: バッチフェッチ
const workflows = await repo.findAll()
const ids = workflows.map(w => w.id)
const allSteps = await stepRepo.findByWorkflowIds(ids)
const stepMap = groupBy(allSteps, 'workflowId')
workflows.forEach(w => w.steps = stepMap[w.id] || [])
```

### 推奨インデックス

| テーブル | カラム | 用途 |
|---------|--------|------|
| workflows | status | ステータス検索 |
| workflows | user_id | ユーザー検索 |
| workflows | (user_id, status) | ユーザー+ステータス検索 |
| workflows | created_at DESC | 日時ソート |
| workflows | input_payload (GIN) | JSONB検索 |

## 完了確認

- [ ] N+1問題が解消されたか？
- [ ] 実行計画でSeq Scanがないか？
- [ ] パフォーマンス目標を達成したか？
- [ ] 回帰テストをパスしたか？
- [ ] ドキュメントを更新したか？
