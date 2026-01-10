# Phase 6: カバレッジレポート

## メタ情報

| 項目   | 内容                       |
| ------ | -------------------------- |
| Phase  | 6                          |
| 作成日 | 2026-01-10                 |
| 機能名 | community-detection-leiden |

---

## カバレッジサマリー

### services/graph ディレクトリ

| ファイル              | % Stmts   | % Branch  | % Funcs | % Lines   | 未カバー行      |
| --------------------- | --------- | --------- | ------- | --------- | --------------- |
| community-detector.ts | 96.52     | 97.95     | 100     | 96.52     | 79-86           |
| leiden-algorithm.ts   | 98.55     | 80.70     | 100     | 98.55     | 566-572         |
| knowledge-graph-store | 86.98     | 76.16     | 100     | 86.98     | 1238-1239, 1297 |
| errors.ts             | 100       | 100       | 100     | 100       | -               |
| **合計**              | **92.06** | **81.30** | **100** | **92.06** | -               |

---

## 基準達成状況

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 | 達成値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | 92.06% | PASS |
| Branch Coverage   | 60%      | 70%      | 81.30% | PASS |
| Function Coverage | 80%      | 90%      | 100%   | PASS |

---

## テスト件数

| テストファイル                | テスト数 | 状態 |
| ----------------------------- | -------- | ---- |
| leiden-algorithm.test.ts      | 21       | PASS |
| community-detector.test.ts    | 31       | PASS |
| knowledge-graph-store.test.ts | 119      | PASS |
| errors.test.ts                | 60       | PASS |
| **合計**                      | **231**  | PASS |

---

## 追加されたテストケース（Phase 6）

### community-detector.test.ts

1. **saveResults() - 追加エラーケース**
   - `deleteAll失敗時にResult.errを返す`
   - `addEntityCommunityMappings失敗時にResult.errを返す`
   - `空のマッピングではaddEntityCommunityMappingsが呼ばれない`
   - `例外発生時にResult.errを返す`

2. **getCommunitiesForEntity() - 追加エラーケース**
   - `Repository障害時にResult.errを返す`
   - `例外発生時にResult.errを返す`

3. **getCommunitiesByLevel() - 追加エラーケース**
   - `Repository障害時にResult.errを返す`
   - `例外発生時にResult.errを返す`

4. **getCommunityMembers() - 追加エラーケース**
   - `Repository障害時にResult.errを返す`
   - `例外発生時にResult.errを返す`
   - `一部のエンティティ取得に失敗しても他は返す`

5. **detect() - グラフデータ読み込み**
   - `getRelations失敗を無視して続行する`
   - `エンティティとリレーションからエッジを正しく構築する`
   - `detect()で例外発生時にResult.errを返す`

6. **統合テスト - データフロー**
   - `detect → saveResults フローが正しく動作する`
   - `同一seedで再現可能な結果を得られる`

---

## 未カバー行の分析

### community-detector.ts (79-86)

```typescript
// 79-86: detect()内の例外キャッチブロック
// ほとんどの例外パスはテストでカバーされているが、
// 一部の内部例外は到達困難
```

- 影響度: 低
- 理由: 防御的コードで実際には発生しにくい

### leiden-algorithm.ts (566-572)

```typescript
// 566-572: buildHierarchy()の空チェック
// 空のhierarchyLevelsは実際には発生しない
```

- 影響度: 低
- 理由: アルゴリズムの構造上、空のレベルは生成されない

---

## 統合テストカバレッジ

| テストカテゴリ     | 検証項目                               | 達成 |
| ------------------ | -------------------------------------- | ---- |
| GraphStore連携     | findEntities経由のデータ取得           | 100% |
| データフロー       | GraphStore → Leiden → Community → 保存 | 100% |
| エラーハンドリング | GraphStore障害時のResult.err伝播       | 100% |
| 再現性             | 同一seed指定時の結果一致               | 100% |
| 境界値             | 空グラフ、1ノード、エッジケース        | 100% |

---

## 結論

Phase 6のテスト拡充により、すべてのカバレッジ基準を達成しました:

- Line Coverage: 92.06% (基準80%)
- Branch Coverage: 81.30% (基準60%)
- Function Coverage: 100% (基準80%)

次のPhase 7では、この結果を確認し、必要に応じてさらなる改善を検討します。
