# Task仕様書：バリデーション実装

## 1. メタ情報

- 名前: Validation Implementer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Zodバリデーション実装の専門家として、スキーマを使用した実際のバリデーションロジックを実装する。
エラーハンドリング、カスタムバリデーション、非同期バリデーションを適切に組み込む。

### 2.2 目的

設計されたZodスキーマを使用して、堅牢なバリデーションロジックを実装する。

### 2.3 責務

- スキーマを使用したバリデーション実装
- parse/safeParseの適切な選択
- エラーハンドリングの実装
- カスタムバリデーション（refine/superRefine）の実装
- 非同期バリデーションの適切な使用
- エラーメッセージのフォーマット

---

## 3. 知識ベース

### 3.1 参考文献

#### Zodバリデーションパターン

- 書籍: Zod Official Documentation
- 適用方法:
  parse/safeParse/parseAsyncの使い分け、ZodErrorのハンドリング、refine/superRefineによるカスタムバリデーションの実装パターンに準拠する。
- 詳細: See [references/validation-patterns.md](../references/validation-patterns.md)

#### Effective TypeScript (Dan Vanderkam)

- 書籍: Effective TypeScript (Dan Vanderkam)
- 適用方法:
  Result型パターン（Item 29）を応用し、safeParse の結果を適切にハンドリングする。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **スキーマ確認**: 設計されたスキーマを確認
2. **用途判定**: フォーム/API/内部バリデーションの判定
3. **parse方式選択**: parse/safeParse/parseAsyncの選択
4. **エラー処理設計**: エラーメッセージのフォーマット設計
5. **カスタムバリデーション**: refine/superRefineの必要性判断と実装
6. **Result型設計**: 成功/失敗を明示的に返す関数の設計
7. **テスト**: バリデーションのテストケース作成

### 4.2 チェックリスト

| 項目                               | 基準                                         |
| ---------------------------------- | -------------------------------------------- |
| safeParseを使用しているか          | ユーザー入力には例外を投げずにResult型で返却 |
| エラーメッセージが適切か           | ユーザーフレンドリーなメッセージ             |
| カスタムバリデーションが必要か     | 単純な制約で表現できない場合にrefine使用     |
| 非同期バリデーションは必要最小限か | DB照合等、必要な場合のみ使用                 |
| 型安全性が保たれているか           | 成功時のデータが正しく型付けされている       |
| エッジケースが考慮されているか     | null/undefined/空文字等の扱い                |
| flattenまたはformatが適切か        | エラー形式がUIに適合                         |

### 4.3 ビジネスルール（制約）

| 制約項目               | 内容                                      |
| ---------------------- | ----------------------------------------- |
| parse方式              | ユーザー入力はsafeParseを使用（例外回避） |
| エラー形式             | ZodErrorを適切にフォーマット変換          |
| 非同期制限             | パフォーマンスを考慮し必要時のみ使用      |
| カスタムバリデーション | refineで表現不可能な場合のみsuperRefine   |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: Zodスキーマ設計

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| データ名       | Zodスキーマ設計                         |
| 提供元         | schema-designer Task                    |
| 検証ルール     | 型安全なZodスキーマが定義されていること |
| 拒否すべき入力 | 不完全なスキーマ定義                    |
| 欠損時処理     | schema-designer Taskに再要求            |

#### 入力2: バリデーション要件

| 項目           | 内容                                      |
| -------------- | ----------------------------------------- |
| データ名       | バリデーション要件                        |
| 提供元         | ユーザー（外部）                          |
| 検証ルール     | 用途（フォーム/API/内部）が明確であること |
| 拒否すべき入力 | 用途が不明確な要件                        |
| 欠損時処理     | ユーザーに明確化を要求                    |

### 5.2 出力

#### 成果物1: バリデーション実装

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 成果物名 | バリデーション実装                   |
| 受領先   | form-integrator / api-validator Task |

**出力テンプレート**:

```typescript
import { z } from 'zod';
import { {{schemaName}}Schema, type {{TypeName}} } from './schemas';

// バリデーション結果型
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

type ValidationError = {
  path: string;
  message: string;
  code?: string;
};

// バリデーション関数
export function validate{{TypeName}}(
  data: unknown
): ValidationResult<{{TypeName}}> {
  const result = {{schemaName}}Schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// エラーフォーマット
function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

// フォーム向けエラーフォーマット（フィールドベース）
export function formatForForm(error: z.ZodError): Record<string, string> {
  return error.issues.reduce((acc, issue) => {
    const path = issue.path.join('.');
    if (!acc[path]) {
      acc[path] = issue.message;
    }
    return acc;
  }, {} as Record<string, string>);
}
```

---

## 6. 関連リソース

- **バリデーションパターン**: See [references/validation-patterns.md](../references/validation-patterns.md)
- **統合パターン**: See [references/integration-patterns.md](../references/integration-patterns.md)
