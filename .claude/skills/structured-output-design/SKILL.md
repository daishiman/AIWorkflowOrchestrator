---
name: structured-output-design
description: |
  AIからの構造化出力設計を専門とするスキル。JSON Schema、Zod、
  Function Calling、Response Formatを活用し、プログラムで
  確実に処理可能な出力を実現します。

  専門分野:
  - JSON Schema設計: 型定義、制約、バリデーションルール
  - Function Calling: 関数シグネチャ定義、パラメータ設計
  - Zod統合: TypeScript型推論、ランタイム検証
  - Response Format: JSON Mode、構造化応答制御

  使用タイミング:
  - AIからの出力をプログラムで処理する時
  - 出力形式を厳密に制御したい時
  - 型安全な出力が必要な時
  - バリデーション付き出力を設計する時

  Use proactively when designing structured AI outputs,
  JSON schemas, or function calling interfaces.
version: 1.0.0
---

# Structured Output Design

## 概要

構造化出力設計は、AIからの出力をプログラムで確実に処理可能な形式で
取得するための設計技術です。

**主要な価値**:
- 型安全な出力によるバグの削減
- パース失敗の防止
- バリデーションによる品質保証
- 開発者体験の向上

## リソース構造

```
structured-output-design/
├── SKILL.md
├── resources/
│   ├── json-schema-patterns.md      # JSON Schema設計パターン
│   ├── function-calling-guide.md    # Function Calling設計ガイド
│   └── zod-integration.md           # Zod統合ガイド
├── scripts/
│   └── validate-schema.mjs          # スキーマ検証スクリプト
└── templates/
    ├── json-schema-template.json    # JSON Schemaテンプレート
    └── zod-schema-template.ts       # Zodスキーマテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# JSON Schema設計パターン
cat .claude/skills/structured-output-design/resources/json-schema-patterns.md

# Function Calling設計ガイド
cat .claude/skills/structured-output-design/resources/function-calling-guide.md

# Zod統合ガイド
cat .claude/skills/structured-output-design/resources/zod-integration.md
```

### スクリプト実行

```bash
# スキーマ検証
node .claude/skills/structured-output-design/scripts/validate-schema.mjs <schema.json>
```

### テンプレート参照

```bash
# JSON Schemaテンプレート
cat .claude/skills/structured-output-design/templates/json-schema-template.json

# Zodスキーマテンプレート
cat .claude/skills/structured-output-design/templates/zod-schema-template.ts
```

## ワークフロー

### Phase 1: 出力構造の設計

**目的**: 必要な出力データの構造を定義

**設計要素**:
- 必須フィールドの特定
- データ型の決定（string, number, boolean, object, array）
- ネスト構造の設計
- 配列要素の型定義

**判断基準**:
- [ ] すべての必要フィールドが定義されているか？
- [ ] 各フィールドの型が適切か？
- [ ] ネストの深さは適切か（3階層以内推奨）？

### Phase 2: 制約の定義

**目的**: データの有効性を保証する制約を設定

**制約タイプ**:
- **文字列制約**: minLength, maxLength, pattern, format
- **数値制約**: minimum, maximum, multipleOf
- **配列制約**: minItems, maxItems, uniqueItems
- **オブジェクト制約**: additionalProperties, dependencies

**判断基準**:
- [ ] バリデーションルールが明確か？
- [ ] エラーメッセージが適切か？
- [ ] 制約が厳しすぎないか？

### Phase 3: スキーマの実装

**目的**: JSON SchemaまたはZodで実装

**JSON Schema形式**:
```json
{
  "type": "object",
  "properties": {
    "field": { "type": "string" }
  },
  "required": ["field"]
}
```

**Zod形式**:
```typescript
const schema = z.object({
  field: z.string()
});
```

**判断基準**:
- [ ] スキーマが正しく定義されているか？
- [ ] TypeScript型推論が機能するか？

### Phase 4: プロンプトへの統合

**目的**: スキーマをプロンプトに組み込み

**統合方法**:

1. **JSON Mode指定**:
```
出力は以下のJSON形式で返してください：
{...schema...}
```

2. **Function Calling**:
```typescript
{
  name: "process_data",
  parameters: schema
}
```

3. **Response Format**:
```typescript
{
  response_format: { type: "json_object" }
}
```

## ベストプラクティス

### すべきこと

1. **厳密な型定義**:
   - すべてのフィールドに型を指定
   - nullable の明示
   - enum による値制限

2. **適切な制約**:
   - 文字列長の制限
   - 数値範囲の指定
   - 必須フィールドの明示

3. **説明の追加**:
   - description フィールドの活用
   - examples の提供

### 避けるべきこと

1. **過度な柔軟性**:
   - ❌ additionalProperties: true
   - ✅ additionalProperties: false

2. **曖昧な型**:
   - ❌ type: "any"
   - ✅ 具体的な型指定

3. **深いネスト**:
   - ❌ 5階層以上のネスト
   - ✅ 3階層以内に平坦化

## トラブルシューティング

### 問題1: パースエラー

**症状**: AIの出力がJSONとしてパースできない

**原因**: スキーマが複雑すぎる、制約が不明確

**解決策**:
1. スキーマを簡略化
2. 具体例をプロンプトに追加
3. JSON Modeを有効化

### 問題2: 型不一致

**症状**: 期待した型と異なる値が返される

**原因**: 制約が不十分、説明が不明確

**解決策**:
1. enum で有効値を制限
2. format で形式を指定
3. description を詳細化

## 関連スキル

- **zod-validation** (`.claude/skills/zod-validation/SKILL.md`): Zodバリデーション
- **json-schema** (`.claude/skills/json-schema/SKILL.md`): JSON Schema仕様
- **type-safety-patterns** (`.claude/skills/type-safety-patterns/SKILL.md`): 型安全パターン

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 |
