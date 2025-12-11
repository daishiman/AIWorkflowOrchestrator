---
name: error-message-design
description: |
    ユーザーフレンドリーなエラーメッセージの設計を専門とするスキル。
    エラーコード体系、多言語対応（i18n）、アクション指向のメッセージ設計を
    通じて、ユーザー体験を向上させます。
    専門分野:
    - エラーコード体系: 階層的コード、カテゴリ分類
    - メッセージ設計: アクション指向、コンテキスト考慮
    - i18n対応: 多言語化、文化的配慮
    - 開発者向けエラー: デバッグ情報、スタックトレース
    使用タイミング:
    - バリデーションエラーメッセージの設計時
    - APIエラーレスポンスの設計時
    - 多言語対応のエラーシステム構築時
    - ユーザー向け/開発者向けエラーの分離時
    Use proactively when designing validation error messages,
    API error responses, or building i18n-ready error systems.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/error-message-design/resources/api-error-responses.md`: RFC 7807準拠のAPIエラーレスポンス設計
  - `.claude/skills/error-message-design/resources/error-code-system.md`: 階層的エラーコード体系とカテゴリ分類
  - `.claude/skills/error-message-design/resources/i18n-error-handling.md`: 多言語対応エラーメッセージの実装
  - `.claude/skills/error-message-design/resources/user-friendly-messages.md`: アクション指向のユーザーフレンドリーメッセージ
  - `.claude/skills/error-message-design/templates/error-system-template.ts`: エラーシステム実装テンプレート
  - `.claude/skills/error-message-design/scripts/validate-error-messages.mjs`: エラーメッセージの検証スクリプト

version: 1.0.0
---

# Error Message Design

## 概要

このスキルは、ユーザーフレンドリーなエラーメッセージの設計パターンを提供します。
エラーコード体系、多言語対応、アクション指向のメッセージ設計を通じて、
エラー発生時もユーザーが次のアクションを取れるようにします。

**主要な価値**:

- ユーザーが理解しやすいエラーメッセージ
- 開発者がデバッグしやすい情報提供
- 多言語・多文化対応
- 一貫したエラーハンドリング

**対象ユーザー**:

- スキーマ定義を行うエージェント（@schema-def）
- APIを設計する開発者
- フロントエンド開発者

## リソース構造

```
error-message-design/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── error-code-system.md                   # エラーコード体系
│   ├── user-friendly-messages.md              # ユーザーフレンドリーメッセージ
│   ├── i18n-error-handling.md                 # 多言語対応
│   └── api-error-responses.md                 # APIエラーレスポンス
├── scripts/
│   └── validate-error-messages.mjs            # エラーメッセージ検証
└── templates/
    └── error-system-template.ts               # エラーシステムテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# エラーコード体系
cat .claude/skills/error-message-design/resources/error-code-system.md

# ユーザーフレンドリーメッセージ
cat .claude/skills/error-message-design/resources/user-friendly-messages.md

# 多言語対応
cat .claude/skills/error-message-design/resources/i18n-error-handling.md

# APIエラーレスポンス
cat .claude/skills/error-message-design/resources/api-error-responses.md
```

### スクリプト実行

```bash
# エラーメッセージ検証
node .claude/skills/error-message-design/scripts/validate-error-messages.mjs <messages.json>
```

### テンプレート参照

```bash
# エラーシステムテンプレート
cat .claude/skills/error-message-design/templates/error-system-template.ts
```

## いつ使うか

### シナリオ1: フォームバリデーション

**状況**: ユーザー入力のバリデーションエラーを表示する

**適用条件**:

- [ ] 複数のフィールドでエラーが発生し得る
- [ ] ユーザーが修正方法を理解する必要がある
- [ ] 多言語対応が必要

**期待される成果**: 分かりやすいバリデーションエラー表示

### シナリオ2: APIエラーレスポンス

**状況**: APIクライアントにエラー情報を返す

**適用条件**:

- [ ] HTTPステータスコードの選択
- [ ] エラーコードの体系化
- [ ] 開発者向けデバッグ情報の提供

**期待される成果**: 一貫したAPIエラーレスポンス

### シナリオ3: エラーの国際化

**状況**: 多言語対応のアプリケーションでエラーを表示

**適用条件**:

- [ ] 複数の言語でエラーメッセージを表示
- [ ] 文化的な配慮が必要
- [ ] メッセージの動的な組み立て

**期待される成果**: 自然な多言語エラーメッセージ

## 基本概念

### エラーメッセージの3要素

```typescript
// 良いエラーメッセージの構成要素
interface UserFriendlyError {
  // 1. 何が起きたか
  title: string;
  // 例: "メールアドレスが正しくありません"

  // 2. なぜ起きたか
  reason: string;
  // 例: "入力された形式がメールアドレスとして認識できません"

  // 3. どうすればいいか
  action: string;
  // 例: "example@domain.com のような形式で入力してください"
}
```

### 悪いエラーメッセージ vs 良いエラーメッセージ

```typescript
// ❌ 悪い例
const badErrors = [
  "Error",
  "Invalid input",
  "Something went wrong",
  "エラーが発生しました",
  "入力が不正です",
];

// ✅ 良い例
const goodErrors = [
  {
    bad: "Invalid email",
    good: {
      title: "メールアドレスの形式が正しくありません",
      action: "例: taro@example.com",
    },
  },
  {
    bad: "Password too short",
    good: {
      title: "パスワードは8文字以上必要です",
      hint: "現在: 5文字",
      action: "あと3文字追加してください",
    },
  },
  {
    bad: "Network error",
    good: {
      title: "サーバーに接続できません",
      reason: "ネットワーク接続を確認してください",
      action: "接続を確認してから、もう一度お試しください",
    },
  },
];
```

### エラーコード体系

```typescript
// エラーコードの階層構造
const ERROR_CODES = {
  // カテゴリ: AUTH (認証)
  AUTH_001: "認証が必要です",
  AUTH_002: "セッションの有効期限が切れました",
  AUTH_003: "アクセス権限がありません",

  // カテゴリ: VALIDATION (バリデーション)
  VAL_001: "必須項目が入力されていません",
  VAL_002: "形式が正しくありません",
  VAL_003: "値が範囲外です",

  // カテゴリ: RESOURCE (リソース)
  RES_001: "リソースが見つかりません",
  RES_002: "リソースが既に存在します",
  RES_003: "リソースが使用中です",
} as const;

type ErrorCode = keyof typeof ERROR_CODES;
```

### APIエラーレスポンス

```typescript
// RFC 7807 Problem Details準拠
interface ApiError {
  type: string; // エラータイプのURI
  title: string; // 人間が読めるタイトル
  status: number; // HTTPステータスコード
  detail?: string; // 詳細な説明
  instance?: string; // このエラー発生のURI
  code?: string; // アプリケーション固有のエラーコード
  errors?: FieldError[]; // フィールド別エラー（バリデーション用）
}

interface FieldError {
  field: string; // フィールド名
  message: string; // エラーメッセージ
  code?: string; // エラーコード
}

// 使用例
const validationError: ApiError = {
  type: "https://api.example.com/errors/validation",
  title: "入力内容に問題があります",
  status: 400,
  detail: "以下のフィールドを確認してください",
  code: "VAL_001",
  errors: [
    {
      field: "email",
      message: "有効なメールアドレスを入力してください",
      code: "VAL_EMAIL",
    },
    {
      field: "password",
      message: "パスワードは8文字以上必要です",
      code: "VAL_PASSWORD_LENGTH",
    },
  ],
};
```

## 判断基準チェックリスト

### メッセージ設計時

- [ ] ユーザーが何をすべきか明確か？
- [ ] 技術用語を使っていないか？
- [ ] エラーの原因が分かるか？
- [ ] 解決方法が提示されているか？

### コード体系設計時

- [ ] エラーコードは一意か？
- [ ] カテゴリ分類は適切か？
- [ ] ドキュメント化されているか？
- [ ] ログで追跡可能か？

### 多言語対応時

- [ ] プレースホルダーは適切に配置されているか？
- [ ] 語順の違いに対応しているか？
- [ ] 文化的な配慮がされているか？

## 関連スキル

- `.claude/skills/zod-validation/SKILL.md` - Zodバリデーション
- `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン
- `.claude/skills/input-sanitization/SKILL.md` - 入力サニタイズ

## 変更履歴

| バージョン | 日付       | 変更内容                                        |
| ---------- | ---------- | ----------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - エラーメッセージ設計の基本を網羅 |
