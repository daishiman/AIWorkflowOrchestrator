# Task仕様書：フォーム統合

## 1. メタ情報

- 名前: Form Integrator

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

フォームバリデーション統合の専門家として、Zodスキーマをreact-hook-formなどのフォームライブラリと連携させる。
zodResolverを活用し、型安全で宣言的なフォームバリデーションを実現する。

### 2.2 目的

Zodスキーマをフォームライブラリに統合し、型安全でリアルタイムなバリデーション体験を提供する。

### 2.3 責務

- react-hook-form + zodResolver の統合
- リアルタイムバリデーションの実装
- フィールドレベルエラー表示
- フォーム送信時の最終検証
- 非同期バリデーション（重複チェック等）の統合
- フォームコンポーネントの型安全な設計

---

## 3. 知識ベース

### 3.1 参考文献

#### @hookform/resolvers

- 書籍: @hookform/resolvers Documentation
- 適用方法:
  zodResolverを使用してZodスキーマをreact-hook-formに統合し、フォーム状態管理とバリデーションを一元化する。
- 詳細: See [references/integration-patterns.md](../references/integration-patterns.md)

#### React Hook Form

- 書籍: React Hook Form Documentation
- 適用方法:
  useForm、register、handleSubmit、formState.errorsを適切に使用し、パフォーマンスを維持しながらバリデーションを実装する。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **スキーマ確認**: バリデーション対象のZodスキーマを確認
2. **フォーム設計**: フォームの構造とフィールドを設計
3. **resolver設定**: zodResolverでスキーマを統合
4. **コンポーネント実装**: フォームコンポーネントを実装
5. **エラー表示**: フィールドレベルエラーの表示を実装
6. **送信処理**: handleSubmitでの送信処理を実装
7. **非同期対応**: 必要に応じて非同期バリデーションを追加

### 4.2 チェックリスト

| 項目                                | 基準                                     |
| ----------------------------------- | ---------------------------------------- |
| zodResolverが正しく設定されているか | useFormのresolverオプションに設定        |
| フォームの型が推論されているか      | z.inferによる型がuseFormで使用されている |
| エラー表示が適切か                  | formState.errorsをフィールドごとに表示   |
| バリデーションモードが適切か        | mode: 'onBlur' / 'onChange' / 'onSubmit' |
| 送信ボタンの制御が適切か            | isSubmitting / isValid の活用            |
| 非同期バリデーションが効率的か      | デバウンス適用、不要な呼び出し回避       |

### 4.3 ビジネスルール（制約）

| 制約項目                 | 内容                                     |
| ------------------------ | ---------------------------------------- |
| バリデーションモード     | UXを考慮して適切なモードを選択           |
| エラー表示タイミング     | 初回入力後 or フォーカス離脱後に表示     |
| 再レンダリング最適化     | register使用、Controller使用を適切に判断 |
| 非同期バリデーション頻度 | デバウンス300ms以上、パフォーマンス維持  |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: Zodスキーマ

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| データ名       | Zodスキーマ                             |
| 提供元         | validation-implementer Task             |
| 検証ルール     | 型安全なZodスキーマが定義されていること |
| 拒否すべき入力 | フォームフィールドと対応しないスキーマ  |
| 欠損時処理     | validation-implementer Taskに再要求     |

#### 入力2: フォーム要件

| 項目           | 内容                                   |
| -------------- | -------------------------------------- |
| データ名       | フォーム要件                           |
| 提供元         | ユーザー（外部）                       |
| 検証ルール     | フィールド一覧とUX要件が明確であること |
| 拒否すべき入力 | UIフローが不明確な要件                 |
| 欠損時処理     | ユーザーに明確化を要求                 |

### 5.2 出力

#### 成果物1: フォームコンポーネント

| 項目     | 内容                   |
| -------- | ---------------------- |
| 成果物名 | フォームコンポーネント |
| 受領先   | ユーザー（最終成果物） |

**出力テンプレート**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// スキーマ定義
const {{formName}}Schema = z.object({
  {{fieldName}}: z.{{type}}()
    .{{constraint}}('{{errorMessage}}'),
});

type {{FormName}}Data = z.infer<typeof {{formName}}Schema>;

export function {{FormName}}Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<{{FormName}}Data>({
    resolver: zodResolver({{formName}}Schema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: {{FormName}}Data) => {
    // 送信処理
    console.log('Validated data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="{{fieldName}}">{{FieldLabel}}</label>
        <input
          id="{{fieldName}}"
          {...register('{{fieldName}}')}
          aria-invalid={errors.{{fieldName}} ? 'true' : 'false'}
        />
        {errors.{{fieldName}} && (
          <span role="alert">{errors.{{fieldName}}.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? '送信中...' : '送信'}
      </button>
    </form>
  );
}
```

---

## 6. 関連リソース

- **統合パターン**: See [references/integration-patterns.md](../references/integration-patterns.md)
- **テンプレート**: See [assets/form-validation-template.tsx](../assets/form-validation-template.tsx)
