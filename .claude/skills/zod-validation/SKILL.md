---
name: zod-validation
description: |
  Zodライブラリによるランタイムバリデーションと型推論を専門とするスキル。
  Douglas Crockfordの堅牢なデータ構造設計哲学に基づき、TypeScriptと統合された
  型安全なスキーマ定義とバリデーションロジックを提供します。

  専門分野:
  - Zodスキーマ定義: プリミティブ型、オブジェクト、配列、ユニオン型の定義
  - 型推論: z.infer<typeof schema>によるTypeScript型の自動生成
  - カスタムバリデーション: .refine()、.superRefine()による高度な検証
  - スキーマ合成: .extend()、.merge()、.pick()、.omit()によるスキーマ再利用
  - 変換処理: .transform()、.preprocess()によるデータ正規化

  使用タイミング:
  - 新機能の入出力スキーマを定義する時
  - APIリクエスト/レスポンスのバリデーションを実装する時
  - データベーススキーマとTypeScript型の整合性を確保する時
  - フォームバリデーションを実装する時

  Use proactively when users need to define Zod schemas, implement runtime validation,
  or ensure type safety between TypeScript and runtime data.
version: 1.0.0
---

# Zod Validation

## 概要

このスキルは、Zodライブラリを使用したランタイムバリデーションと型推論に関する包括的な知識を提供します。
Douglas Crockfordが提唱する「堅牢なデータ構造」の設計原則を適用し、TypeScriptの型システムと
ランタイムバリデーションをシームレスに統合します。

**主要な価値**:
- TypeScript型とランタイムバリデーションの完全な統合
- 再利用可能で保守性の高いスキーマ設計
- パフォーマンスを考慮した最適化されたバリデーション

**対象ユーザー**:
- スキーマ定義を行うエージェント（@schema-def）
- 入出力バリデーションを実装する開発者
- 型安全なAPIを設計するチーム

## リソース構造

```
zod-validation/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── schema-definition-patterns.md          # スキーマ定義パターン
│   ├── type-inference-guide.md                # 型推論の詳細ガイド
│   ├── custom-validation-techniques.md        # カスタムバリデーション技法
│   └── performance-optimization.md            # パフォーマンス最適化
├── scripts/
│   └── validate-schema.mjs                    # スキーマ検証スクリプト
└── templates/
    ├── schema-template.ts                     # 標準スキーマテンプレート
    └── api-schema-template.ts                 # APIスキーマテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# スキーマ定義パターン
cat .claude/skills/zod-validation/resources/schema-definition-patterns.md

# 型推論ガイド
cat .claude/skills/zod-validation/resources/type-inference-guide.md

# カスタムバリデーション技法
cat .claude/skills/zod-validation/resources/custom-validation-techniques.md

# パフォーマンス最適化
cat .claude/skills/zod-validation/resources/performance-optimization.md
```

### スクリプト実行

```bash
# スキーマファイルの検証
node .claude/skills/zod-validation/scripts/validate-schema.mjs <schema.ts>
```

### テンプレート参照

```bash
# 標準スキーマテンプレート
cat .claude/skills/zod-validation/templates/schema-template.ts

# APIスキーマテンプレート
cat .claude/skills/zod-validation/templates/api-schema-template.ts
```

## いつ使うか

### シナリオ1: 新機能のスキーマ定義
**状況**: 新機能の入出力データ構造を定義する必要がある

**適用条件**:
- [ ] 入力データの型と制約が明確に定義されている
- [ ] TypeScriptとランタイムの両方で型を保証したい
- [ ] 再利用可能なスキーマパーツが必要

**期待される成果**: 型安全で再利用可能なZodスキーマ

### シナリオ2: APIバリデーションの実装
**状況**: APIエンドポイントのリクエスト/レスポンスを検証する

**適用条件**:
- [ ] リクエストボディの構造検証が必要
- [ ] レスポンスの型保証が必要
- [ ] エラーメッセージのカスタマイズが必要

**期待される成果**: 堅牢なAPIバリデーションロジック

### シナリオ3: フォームバリデーション
**状況**: ユーザー入力のクライアントサイド検証を実装する

**適用条件**:
- [ ] フォームフィールドの検証ルールが定義されている
- [ ] リアルタイムバリデーションが必要
- [ ] サーバーサイドと共通のスキーマを使いたい

**期待される成果**: 一貫したクライアント/サーバーバリデーション

## 基本概念

### Zodスキーマの基本原則

**1. 型の明確性 (Type Clarity)**
```typescript
// ✅ 良い例: 明確な型定義
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().positive(),
  role: z.enum(['admin', 'user', 'guest']),
});

// ❌ 悪い例: 曖昧な型
const badSchema = z.object({
  id: z.any(),
  data: z.unknown(),
});
```

**2. 防御的バリデーション (Defensive Validation)**
```typescript
// すべての外部入力は「信頼できない」と仮定
const inputSchema = z.object({
  username: z.string()
    .min(3, '3文字以上必要です')
    .max(50, '50文字以下にしてください')
    .regex(/^[a-zA-Z0-9_]+$/, '英数字とアンダースコアのみ使用可能'),
  password: z.string()
    .min(8, '8文字以上必要です')
    .regex(/[A-Z]/, '大文字を含めてください')
    .regex(/[0-9]/, '数字を含めてください'),
});
```

**3. シンプルさの追求 (Simplicity First)**
```typescript
// ✅ 良い例: フラットで理解しやすい構造
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema,  // 再利用可能なパーツ
});

// ❌ 悪い例: 過度にネストした構造
const deeplyNestedSchema = z.object({
  user: z.object({
    profile: z.object({
      contact: z.object({
        address: z.object({
          // 深すぎるネスト
        }),
      }),
    }),
  }),
});
```

### 型推論の活用

```typescript
import { z } from 'zod';

// スキーマ定義
const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'books']),
  tags: z.array(z.string()).optional(),
  createdAt: z.coerce.date(),
});

// 型推論
type Product = z.infer<typeof productSchema>;
// → { id: string; name: string; price: number; category: 'electronics' | 'clothing' | 'books'; tags?: string[]; createdAt: Date }

// 入力型と出力型を分離
type ProductInput = z.input<typeof productSchema>;
type ProductOutput = z.output<typeof productSchema>;
```

### スキーマ合成パターン

```typescript
// 基本スキーマ
const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// 拡張
const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  name: z.string(),
});

// 部分的な選択
const userUpdateSchema = userSchema.pick({
  email: true,
  name: true,
}).partial();  // すべてオプショナルに

// 除外
const publicUserSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
});
```

## 判断基準チェックリスト

### スキーマ設計時
- [ ] スキーマは再利用可能なパーツに分割されているか？
- [ ] TypeScript型とZodスキーマの整合性が保たれているか？
- [ ] バリデーションエラーメッセージは具体的か？
- [ ] パフォーマンスへの影響を考慮しているか？

### カスタムバリデーション時
- [ ] カスタムバリデーションは必要最小限か？
- [ ] エラーメッセージは具体的か？
- [ ] 非同期バリデーションの使用は適切か？
- [ ] ビジネスロジックと混同していないか？

### 型推論時
- [ ] z.infer<typeof schema>で型が正しく推論されるか？
- [ ] ジェネリクスの使用が適切か？
- [ ] 循環参照がないか？

## 関連スキル

- `.claude/skills/type-safety-patterns/SKILL.md` - TypeScript型安全性パターン
- `.claude/skills/input-sanitization/SKILL.md` - 入力サニタイゼーション
- `.claude/skills/error-message-design/SKILL.md` - エラーメッセージ設計
- `.claude/skills/json-schema/SKILL.md` - JSON Schema仕様

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース - Zodバリデーションの基本パターン、型推論、スキーマ合成を網羅 |
