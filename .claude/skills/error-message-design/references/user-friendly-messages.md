# ユーザーフレンドリーメッセージ

## 概要

ユーザーが理解しやすく、行動を起こせるエラーメッセージの設計パターンを解説します。

## 良いエラーメッセージの原則

### 1. 具体的であること

```typescript
// ❌ 抽象的
"入力が無効です";
"エラーが発生しました";
"処理できません";

// ✅ 具体的
"メールアドレスの形式が正しくありません（例: user@example.com）";
"ファイルサイズが5MBを超えています（現在: 8.5MB）";
"パスワードは8文字以上で、英数字と記号を含める必要があります";
```

### 2. アクション指向であること

```typescript
// ❌ 問題の指摘のみ
"パスワードが短すぎます";

// ✅ 解決方法を提示
"パスワードは8文字以上必要です。あと3文字追加してください";

// ❌ 何をすればいいか不明
"認証に失敗しました";

// ✅ 次のステップを提示
"パスワードが間違っています。パスワードをお忘れの場合は、下のリンクから再設定できます";
```

### 3. 人間らしい言葉を使うこと

```typescript
// ❌ 技術用語
"Invalid UTF-8 sequence in input";
"HTTP 403 Forbidden";
"Null pointer exception";

// ✅ 平易な言葉
"入力に使用できない文字が含まれています";
"この操作を行う権限がありません";
"システムエラーが発生しました。しばらくお待ちください";
```

## メッセージテンプレート

### バリデーションエラー

```typescript
const VALIDATION_MESSAGES = {
  required: {
    template: "{field}を入力してください",
    examples: {
      email: "メールアドレスを入力してください",
      name: "お名前を入力してください",
    },
  },

  email: {
    template: "有効なメールアドレスを入力してください",
    hint: "例: taro@example.com",
  },

  minLength: {
    template: "{field}は{min}文字以上で入力してください",
    current: "現在: {current}文字",
    action: "あと{remaining}文字必要です",
  },

  maxLength: {
    template: "{field}は{max}文字以内で入力してください",
    current: "現在: {current}文字",
    action: "{excess}文字オーバーしています",
  },

  pattern: {
    template: "{field}の形式が正しくありません",
    formats: {
      phone: "電話番号は数字とハイフンのみ使用できます（例: 03-1234-5678）",
      postalCode: "郵便番号は7桁の数字で入力してください（例: 123-4567）",
    },
  },

  range: {
    template: "{field}は{min}から{max}の間で入力してください",
    current: "入力値: {current}",
  },

  unique: {
    template: "この{field}は既に使用されています",
    action: "別の{field}を入力してください",
  },

  match: {
    template: "{field}が一致しません",
    examples: {
      password: "パスワードと確認用パスワードが一致しません",
    },
  },
};
```

### システムエラー

```typescript
const SYSTEM_MESSAGES = {
  network: {
    offline: {
      title: "インターネットに接続できません",
      action: "ネットワーク接続を確認してから、もう一度お試しください",
    },
    timeout: {
      title: "接続がタイムアウトしました",
      action: "しばらく待ってからもう一度お試しください",
    },
    serverError: {
      title: "サーバーに接続できません",
      action:
        "時間をおいて再度お試しください。問題が続く場合はお問い合わせください",
    },
  },

  permission: {
    denied: {
      title: "アクセス権限がありません",
      action: "必要な権限については管理者にお問い合わせください",
    },
    expired: {
      title: "セッションの有効期限が切れました",
      action: "再度ログインしてください",
    },
  },

  resource: {
    notFound: {
      title: "ページが見つかりません",
      action: "URLを確認するか、トップページからお探しください",
    },
    conflict: {
      title: "変更が競合しました",
      action: "画面を更新して、もう一度お試しください",
    },
  },

  maintenance: {
    scheduled: {
      title: "メンテナンス中です",
      action: "{endTime}に再開予定です。しばらくお待ちください",
    },
    unscheduled: {
      title: "現在サービスを一時停止しています",
      action: "復旧までしばらくお待ちください",
    },
  },
};
```

### ファイルアップロードエラー

```typescript
const FILE_UPLOAD_MESSAGES = {
  tooLarge: {
    template: "ファイルサイズが大きすぎます",
    detail: "最大{maxSize}までアップロードできます（現在: {currentSize}）",
    action: "ファイルを圧縮するか、別のファイルを選択してください",
  },

  invalidType: {
    template: "このファイル形式はサポートされていません",
    detail: "対応形式: {allowedTypes}",
    action: "別の形式に変換してからアップロードしてください",
  },

  tooMany: {
    template: "ファイル数が多すぎます",
    detail: "一度にアップロードできるのは{maxFiles}ファイルまでです",
    action: "ファイルを減らしてもう一度お試しください",
  },

  uploadFailed: {
    template: "アップロードに失敗しました",
    action:
      "もう一度お試しください。問題が続く場合はファイルサイズや形式を確認してください",
  },
};
```

## コンテキスト別メッセージ

### フォームコンテキスト

```typescript
interface FormErrorContext {
  fieldName: string;
  fieldLabel: string;
  currentValue: unknown;
  constraints: Record<string, unknown>;
}

function formatFormError(code: string, context: FormErrorContext): string {
  const { fieldLabel, currentValue, constraints } = context;

  switch (code) {
    case "required":
      return `${fieldLabel}は必須です`;

    case "minLength":
      const currentLength = String(currentValue).length;
      const minLength = constraints.min as number;
      const remaining = minLength - currentLength;
      return `${fieldLabel}は${minLength}文字以上必要です（あと${remaining}文字）`;

    case "email":
      return `有効なメールアドレスを入力してください`;

    default:
      return `${fieldLabel}の入力内容を確認してください`;
  }
}
```

### APIコンテキスト

```typescript
interface ApiErrorContext {
  endpoint: string;
  method: string;
  statusCode: number;
  errorCode?: string;
}

function formatApiError(context: ApiErrorContext): string {
  const { statusCode, errorCode } = context;

  // 一般的なHTTPエラー
  const httpMessages: Record<number, string> = {
    400: "リクエストに問題があります。入力内容を確認してください",
    401: "ログインが必要です",
    403: "この操作を行う権限がありません",
    404: "お探しのデータが見つかりませんでした",
    409: "データの競合が発生しました。画面を更新してください",
    429: "リクエストが多すぎます。しばらくお待ちください",
    500: "サーバーエラーが発生しました。しばらくお待ちください",
    502: "サーバーに接続できません。しばらくお待ちください",
    503: "サービスは一時的に利用できません",
  };

  return httpMessages[statusCode] || "予期しないエラーが発生しました";
}
```

## トースト・通知メッセージ

```typescript
interface ToastMessage {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const TOAST_MESSAGES = {
  // 成功メッセージ
  saved: {
    type: "success" as const,
    title: "保存しました",
    duration: 3000,
  },
  deleted: {
    type: "success" as const,
    title: "削除しました",
    duration: 3000,
  },
  sent: {
    type: "success" as const,
    title: "送信しました",
    duration: 3000,
  },

  // エラーメッセージ
  saveFailed: {
    type: "error" as const,
    title: "保存できませんでした",
    description: "もう一度お試しください",
    action: { label: "再試行", onClick: () => {} },
    duration: 5000,
  },
  networkError: {
    type: "error" as const,
    title: "接続エラー",
    description: "ネットワーク接続を確認してください",
    duration: 5000,
  },

  // 警告メッセージ
  unsavedChanges: {
    type: "warning" as const,
    title: "未保存の変更があります",
    description: "このページを離れると変更が失われます",
    action: { label: "保存する", onClick: () => {} },
    duration: 0, // 自動で消えない
  },
};
```

## ベストプラクティス

### 1. ポジティブなフレーミング

```typescript
// ❌ ネガティブ
"パスワードが間違っています";
"アクセスが拒否されました";

// ✅ ポジティブ
"パスワードを確認してください";
"このページにアクセスするにはログインが必要です";
```

### 2. 責任の所在を適切に

```typescript
// ❌ ユーザーを責める
"あなたの入力が間違っています";

// ✅ 問題を客観的に述べる
"入力形式を確認してください";

// ✅ システム側の問題を認める
"システムの問題により処理できませんでした。ご不便をおかけして申し訳ありません";
```

### 3. 進捗状況を示す

```typescript
// 長時間処理の場合
"ファイルをアップロード中です... (3/5ファイル完了)";
"データを処理しています。完了まで約2分お待ちください";
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
