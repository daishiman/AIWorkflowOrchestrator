# エラーメッセージ設計ガイド

## 概要

ユーザー向けエラーメッセージは、技術的詳細を隠しつつ、問題の理解と解決を助ける必要がある。

## 良いエラーメッセージの3原則

### 1. 何が起きたかを説明

**悪い例**: "Error occurred"
**良い例**: "Your session has expired"

### 2. なぜ起きたかを説明

**悪い例**: "Invalid input"
**良い例**: "The email address format is incorrect"

### 3. どうすれば解決できるかを説明

**悪い例**: "Please try again"
**良い例**: "Please enter a valid email address (example: user@domain.com)"

## カテゴリ別メッセージ例

### Validation Error

| コード | 技術的メッセージ | ユーザー向けメッセージ |
|--------|------------------|----------------------|
| 1000 | Schema validation failed | 入力内容に誤りがあります。確認してください。 |
| 1001 | Required field missing | 必須項目が入力されていません。 |
| 1002 | Invalid format | 形式が正しくありません。 |

### Business Error

| コード | 技術的メッセージ | ユーザー向けメッセージ |
|--------|------------------|----------------------|
| 2000 | Insufficient permissions | この操作を行う権限がありません。 |
| 2001 | Resource not found | お探しのページは見つかりませんでした。 |
| 2002 | Duplicate resource | この内容は既に登録されています。 |

### External/Infrastructure Error

| コード | 技術的メッセージ | ユーザー向けメッセージ |
|--------|------------------|----------------------|
| 3000 | External API timeout | サービスが一時的に利用できません。しばらくしてからお試しください。 |
| 4000 | Database connection failed | システムエラーが発生しました。しばらくしてからお試しください。 |

### Internal Error

| コード | 技術的メッセージ | ユーザー向けメッセージ |
|--------|------------------|----------------------|
| 5000 | Unexpected error | 予期しないエラーが発生しました。サポートにお問い合わせください。 |

## 避けるべきこと

1. **スタックトレースの表示**: セキュリティリスク
2. **技術用語の使用**: "SQLException", "NullPointer"等
3. **ユーザーを責める表現**: "あなたの入力が間違っています"
4. **曖昧な表現**: "問題が発生しました"
5. **機密情報の露出**: DBテーブル名、内部パス

## 多言語対応

エラーコードをキーとして、メッセージを外部化:

```typescript
const messages = {
  ja: { 1000: '入力内容に誤りがあります。' },
  en: { 1000: 'The input is invalid.' },
};
```
