# ファイル分割パターン詳細ガイド

## 4つの分割パターン

### パターン1: トピック別分割

**定義**: 独立したテーマごとにファイルを分割

**適用条件**:

- [ ] 明確に分離可能なトピックが存在
- [ ] 各トピックが独立して理解可能
- [ ] トピック間の依存関係が最小

**命名規則**: `[topic]-[subtopic].md`

**例**:

```
database-design/
└── resources/
    ├── schema-design.md          # トピック: スキーマ
    ├── indexing-strategies.md    # トピック: インデックス
    ├── query-optimization.md     # トピック: クエリ
    └── transaction-management.md # トピック: トランザクション
```

**メリット**:

- 各トピックが独立
- 並行して執筆可能
- 更新時の影響範囲が限定的

**デメリット**:

- トピック数が多いと管理が複雑
- トピック間の関連性が見えにくい

**推奨**: 一般的なスキル、トピックが3-7個の場合

---

### パターン2: レベル別分割

**定義**: 学習段階に応じてファイルを分割

**適用条件**:

- [ ] 初心者から上級者まで幅広いユーザー
- [ ] 段階的な学習パスが明確
- [ ] 前提知識のレベルが異なる

**命名規則**: `[number]-[level]-[topic].md` または `[number]-[topic].md`

**例**:

```
react-hooks/
└── resources/
    ├── 01-basics.md       # 基本: useState, useEffect
    ├── 02-intermediate.md # 中級: useCallback, useMemo, useRef
    └── 03-advanced.md     # 上級: useTransition, useDeferredValue
```

**メリット**:

- 学習パスが明確
- レベルに応じた参照が容易
- 初心者が上級内容で混乱しない

**デメリット**:

- レベル分けが主観的になりがち
- レベル間で内容が重複する可能性

**推奨**: 教育的なスキル、初心者向けガイド

---

### パターン3: 機能別分割

**定義**: CRUD等の操作タイプごとにファイルを分割

**適用条件**:

- [ ] 操作タイプが明確に区別可能
- [ ] 各操作が独立した手順を持つ
- [ ] ユースケースが操作ベース

**命名規則**: `[operation]-[object].md`

**例**:

```
api-design/
└── resources/
    ├── create-endpoints.md  # POST操作
    ├── read-endpoints.md    # GET操作
    ├── update-endpoints.md  # PUT/PATCH操作
    └── delete-endpoints.md  # DELETE操作
```

**メリット**:

- 操作ごとに明確
- ユースケース駆動で分かりやすい
- 標準的なパターン（CRUD）に適合

**デメリット**:

- 操作間で共通の情報が重複しがち
- 操作横断的な知識の配置が難しい

**推奨**: API設計、データ操作、ワークフロー

---

### パターン4: ハイブリッド分割

**定義**: 複数の基準を組み合わせた階層構造

**適用条件**:

- [ ] 知識の複雑性が高い
- [ ] 単一パターンでは整理しきれない
- [ ] カテゴリとレベルの両方が重要

**構造例**:

```
web-development/
└── resources/
    ├── frontend/
    │   ├── 01-basics.md
    │   └── 02-advanced.md
    ├── backend/
    │   ├── 01-basics.md
    │   └── 02-advanced.md
    └── deployment/
        └── production-guide.md
```

**メリット**:

- 複雑な知識を適切に組織化
- カテゴリとレベルの両方で整理
- スケーラビリティが高い

**デメリット**:

- 構造が複雑になりがち
- ナビゲーションが難しくなる可能性

**推奨**: 大規模な知識ベース、複数のサブドメイン

---

## 分割の判断フローチャート

```
行数は？
├─ <300行
│  └─ 単一ファイル継続
├─ 300-500行
│  └─ 拡張予定は？
│     ├─ あり → 分割推奨
│     └─ なし → 単一ファイルOK
└─ >500行
   └─ 分割必須
      ↓
   独立したトピックがある？
   ├─ YES → トピック別分割
   └─ NO → 学習段階がある？
          ├─ YES → レベル別分割
          └─ NO → 操作タイプで分けられる？
                 ├─ YES → 機能別分割
                 └─ NO → ハイブリッド分割
```

---

## 実装例

### トピック別分割の実装

**ステップ1**: トピックの特定

```
元のファイル (800行):
- Section 1: スキーマ設計 (300行)
- Section 2: インデックス戦略 (250行)
- Section 3: クエリ最適化 (250行)

→ 3つの独立したトピック
```

**ステップ2**: SKILL.mdの作成

```markdown
## ワークフロー

### Phase 1: スキーマ設計

[概要]

詳細: `resources/schema-design.md`

### Phase 2: インデックス設計

[概要]

詳細: `resources/indexing-strategies.md`

### Phase 3: クエリ最適化

[概要]

詳細: `resources/query-optimization.md`
```

**ステップ3**: リソースファイルの作成

- schema-design.md: 300行
- .claude/skills/indexing-strategies/SKILL.md.md: 250行
- .claude/skills/query-optimization/SKILL.md.md: 250行

**検証**:

- [x] すべて500行以内
- [x] トピックごとに独立
- [x] SKILL.mdから明確に参照

---

## ベストプラクティス

1. **分割は早めに**: 400行を超えたら検討開始
2. **適切なサイズ**: 各ファイル300-450行を目標
3. **明確な参照**: SKILL.mdにリソース構造セクションを必ず含める

---

## 参考文献

- **『Information Architecture』** Louis Rosenfeld他著
- **『Documenting Software Architectures』** Paul Clements他著
