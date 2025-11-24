# トークン効率化戦略

## 概要

Claude Codeスキルシステムにおけるトークン使用量の最適化戦略。
段階的ロード、インデックス設計、圧縮により、60-80%のトークン削減を実現します。

## 3つの効率化戦略

### 戦略1: 遅延読み込み（Lazy Loading）

**原則**: 全リソースの事前ロード禁止、必要な時に必要なものだけ

**実装パターン**:

**パターンA: インデックス駆動**
```markdown
# SKILL.md（常にロードされる）

## リソースへの参照

トピック別の詳細情報:
- スキーマ設計: `resources/schema-design.md`
- インデックス戦略: `resources/indexing.md`
- クエリ最適化: `resources/query-optimization.md`

必要なトピックを選択して参照してください。
```

**エージェントの動作**:
```
タスク: "データベーススキーマを設計"
→ SKILL.mdのインデックスを確認
→ schema-design.md のみを参照
→ 他のリソースは読み込まない
```

**削減効果**:
- 全読み込み: 12,000トークン（4リソース）
- 遅延読み込み: 3,000トークン（1リソース）
- 削減率: 75%

---

**パターンB: Phase駆動**
```markdown
# SKILL.md

## ワークフロー

### Phase 1: 要件分析
[基本的なガイダンス]

詳細: `resources/requirements-analysis.md`

### Phase 2: 設計
[基本的なガイダンス]

詳細: `resources/design-patterns.md`

### Phase 3: 実装
[基本的なガイダンス]

詳細: `resources/implementation-guide.md`
```

**エージェントの動作**:
```
現在Phase 1
→ requirements-analysis.md のみ参照
→ Phase完了後、次のリソースを参照
```

**削減効果**:
- 全読み込み: 9,000トークン（3リソース）
- 段階的読み込み: 3,000トークン（Phase 1のみ）
- 削減率: 67%

---

### 戦略2: インデックス駆動設計

**原則**: SKILL.mdは「目次」として機能、詳細は分離

**SKILL.mdの役割**:
1. **概要提供**: 何ができるかの全体像
2. **ナビゲーション**: どこに何があるかの案内
3. **クイックリファレンス**: 最も頻繁に使用する情報のみ

**設計パターン**:

**パターンA: リソースマップ**
```markdown
## リソース構造

```
skill-name/
├── resources/
│   ├── basics.md          # 基本的な使用法
│   ├── advanced.md        # 高度な技法
│   └── troubleshooting.md # トラブルシューティング
```

### リソース選択ガイド

**初めて使用する場合**: basics.md から開始
**応用的な実装**: advanced.md を参照
**問題が発生した場合**: troubleshooting.md を参照
```

**パターンB: チェックリスト駆動**
```markdown
## クイックチェックリスト

スキーマ設計:
- [ ] 正規化は適切か？ → 詳細: resources/normalization.md
- [ ] インデックスは最適か？ → 詳細: resources/indexing.md
- [ ] 制約は定義されているか？ → 詳細: resources/constraints.md
```

---

### 戦略3: 圧縮と精錬（Distill）

**原則**: 冗長性を排除し、本質的情報のみを抽出

**圧縮テクニック**:

**テクニック1: 重複の排除**
```markdown
❌ 冗長な例:
## Phase 1: 設計
データベーススキーマを設計します。スキーマ設計では...（200行の詳細）

## リソース: schema-design.md
データベーススキーマを設計します。スキーマ設計では...（同じ内容）

✅ 圧縮された例:
## Phase 1: 設計
スキーマ設計の基本ステップ:
1. Entity特定
2. 関連性定義
3. 正規化判断

詳細: `resources/schema-design.md`
```

**削減効果**: 約60%

---

**テクニック2: 例の最小化**
```markdown
❌ 過剰な例（10個）:
## 例
例1: [詳細な説明]
例2: [詳細な説明]
...
例10: [詳細な説明]

✅ 最適化された例（2-3個）:
## 例
例1: 基本的なユースケース
例2: 応用的なユースケース
（例3: エッジケース - 必要に応じて）
```

**削減効果**: 約70%

---

**テクニック3: 概念要素中心の記述**
```markdown
❌ 具体的すぎる:
```typescript
// 200行のサンプルコード
export const UserRepository = {
  async findById(id: string) {
    // 実装の詳細...
  }
}
```

✅ 概念的:
## Repository Pattern

原則:
- コレクション風インターフェース
- ドメイン型を返却
- DB詳細を隠蔽

判断基準:
- [ ] メソッド名がドメイン用語か？
- [ ] 戻り値がエンティティか？
```

**削減効果**: 約80%

---

## トークン見積もりツール

### 手動見積もり

**計算式**:
```
トークン数 ≈ 行数 × 6トークン/行

例:
SKILL.md 400行 × 6 = 2,400トークン
resources/ 5ファイル × 400行 × 6 = 12,000トークン
総計 = 14,400トークン
```

### 自動見積もりスクリプト

**スクリプト**: `scripts/calculate-token-usage.sh`

**機能**:
- ファイルの行数をカウント
- トークン数を見積もり
- レポート生成

**使用方法**:
```bash
./scripts/calculate-token-usage.sh .claude/skills/database-design
```

**出力例**:
```
=== Token Usage Estimate ===

SKILL.md: 408 lines ≈ 2,448 tokens

Resources:
- schema-design.md: 450 lines ≈ 2,700 tokens
- indexing.md: 380 lines ≈ 2,280 tokens
- Total resources: 5,280 tokens

Scripts/Templates: 200 lines ≈ 1,200 tokens

Total: 8,928 tokens
Status: ✅ Within target (<20K)
```

---

## 最適化チェックリスト

### 設計時
- [ ] SKILL.mdは500行以内か？
- [ ] 各リソースは500行以内か？
- [ ] 総トークン見積もりは20K以内か？
- [ ] 遅延読み込みが可能な設計か？

### 実装時
- [ ] SKILL.mdがインデックスとして機能するか？
- [ ] 各Phaseでリソース参照が明示されているか？
- [ ] 重複した内容がないか？
- [ ] 冗長な記述を削除したか？

### 検証時
- [ ] 実際のトークン使用量を測定したか？
- [ ] 削減目標（60-80%）を達成したか？
- [ ] 情報の発見性は維持されているか？

---

## ベストプラクティス

1. **メタデータに投資**: descriptionの設計に時間をかける
2. **SKILL.mdは目次**: 詳細はリソースに分離
3. **参照を明確に**: どこに何があるか常に明示
4. **測定を怠らない**: 見積もりと実測を比較

---

## 参考文献

- **『Information Architecture』** Louis Rosenfeld他著
  - 情報組織化の原則
