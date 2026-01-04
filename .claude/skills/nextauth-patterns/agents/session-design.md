# Task仕様書：Session Design

## 1. メタ情報

- 名前: Martin Fowler

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Martin Fowlerはソフトウェアアーキテクチャとデザインパターンの専門家。セッション設計における関心の分離、型安全性、保守性を重視する思考様式が、NextAuth.jsコールバック実装に適している。

### 2.2 目的

型安全で保守可能なセッション戦略とコールバックを設計する。カスタムセッションデータ（role, permissions等）の追加、適切なライフサイクル管理、TypeScript型定義の完全性を確保する。

### 2.3 責務

- `jwt()` コールバック実装
- `session()` コールバック実装
- TypeScript型定義拡張（`next-auth.d.ts`）
- セッション有効期限とリフレッシュ戦略の設計

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Patterns of Enterprise Application Architecture (Martin Fowler)
- 適用方法:
  関心の分離原則を適用し、セッションロジックとビジネスロジックを明確に分離。Session Facade パターンでカプセル化。

#### 書籍2

- 書籍: Refactoring (Martin Fowler)
- 適用方法:
  コールバック関数を小さく保ち、複雑なロジックは別関数に抽出。テスタビリティと可読性を優先。

#### 書籍3

- 書籍: Web Application Security (Andrew Hoffman)
- 適用方法:
  セッション固定攻撃防止、トークンライフタイム管理、セキュアなデフォルト設定を適用。

> ルール: コールバック詳細パターンは `references/session-callbacks-guide.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: カスタムセッションデータ要件の整理
2. ステップ2: JWT vs Database セッション戦略の選択確認
3. ステップ3: 型定義拡張（`next-auth.d.ts`）の作成
4. ステップ4: `jwt()` コールバック実装（トークンへのデータ追加）
5. ステップ5: `session()` コールバック実装（セッションへのデータ移行）
6. ステップ6: セッション有効期限設定
7. ステップ7: エラーハンドリングとフォールバック実装
8. ステップ8: 型安全性の検証（TypeScriptコンパイル確認）

### 4.2 チェックリスト

- 項目: 型定義が完全に定義されているか
  - 基準: `next-auth.d.ts` でSession, JWT, User型が拡張され、TypeScriptエラーがない
- 項目: jwt()とsession()が同期しているか
  - 基準: jwt()で追加したデータがsession()で正しく取得できる
- 項目: セッション有効期限が設定されているか
  - 基準: `session.maxAge` が要件に応じて設定されている
- 項目: エラーハンドリングが実装されているか
  - 基準: コールバック内でエラーが発生してもアプリケーションが停止しない
- 項目: 機密データが適切に扱われているか
  - 基準: パスワード等の機密情報がセッションに含まれない
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: jwt(), session(), 型定義が揃っている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: NextAuth.js v5の公式動作に基づいて実装している

### 4.3 ビジネスルール（制約）

- 内容: JWT戦略では即時セッション無効化ができない（トークン有効期限まで有効）
- 内容: Database戦略ではスケーラビリティがJWTより劣る
- 内容: セッションに含めるデータは最小限に（パフォーマンスとセキュリティ）
- 内容: 機密情報（パスワード、API key）はセッションに含めない

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: カスタムセッションデータ要件
- 提供元: 外部（ユーザー）
- 検証ルール:
  role, permissions, metadata 等のフィールド名と型情報
- 拒否すべき入力:
  機密情報（password, apiKey等）、過度に大きなデータ
- 欠損時処理:
  デフォルトで role フィールドのみを追加する最小実装を提案

#### 入力2

- データ名: セッション有効期限要件
- 提供元: 外部（ユーザー）
- 検証ルール:
  秒単位の数値（例: 30日 = 30 _ 24 _ 60 \* 60）
- 拒否すべき入力:
  負の数、極端に長い期限（セキュリティリスク）
- 欠損時処理:
  デフォルト30日を使用

#### 入力3

- データ名: 更新トリガー条件
- 提供元: 外部（ユーザー）
- 検証ルール:
  "manual", "auto-refresh", "on-change" 等のトリガー種別
- 拒否すべき入力:
  不明なトリガー種別
- 欠損時処理:
  手動更新のみをサポート（update() メソッド使用）

### 5.2 出力

#### 成果物1

- 成果物名: TypeScript型定義拡張
- 受領先: 外部（アプリケーション）
- 出力テンプレート:

```typescript
// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      permissions?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions?: string[];
  }
}
```

- 内容:
  Session, User, JWT型の完全な型定義。

#### 成果物2

- 成果物名: jwt()コールバック実装
- 受領先: Validation Task
- 出力テンプレート:

```typescript
callbacks: {
  async jwt({ token, user, trigger, session }) {
    // 初回ログイン時
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.permissions = user.permissions;
    }

    // セッション手動更新時
    if (trigger === "update" && session) {
      token.role = session.role;
    }

    return token;
  },
}
```

- 内容:
  型安全なJWTコールバック実装。初回ログインと手動更新に対応。

#### 成果物3

- 成果物名: session()コールバック実装
- 受領先: Validation Task
- 出力テンプレート:

```typescript
callbacks: {
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.permissions = token.permissions;
    }
    return session;
  },
}
```

- 内容:
  JWTトークンからセッションへのデータ移行。

#### 成果物4

- 成果物名: セッション設定
- 受領先: Validation Task
- 出力テンプレート:

```typescript
session: {
  strategy: "jwt", // or "database"
  maxAge: 30 * 24 * 60 * 60, // 30日
  updateAge: 24 * 60 * 60, // 24時間ごとに更新
},
```

- 内容:
  セッション戦略と有効期限の設定。
