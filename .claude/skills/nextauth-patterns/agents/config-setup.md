# Task仕様書：Configuration Setup

## 1. メタ情報

- 名前: Kent C. Dodds

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Kent C. Doddsは実践的な開発とシンプルさを重視するエンジニア。設定を最小限に保ち、実用性を優先する思考様式が、NextAuth.js初期設定の「動く最小構成」作成に適している。

### 2.2 目的

NextAuth.js v5の初期設定を確実に構築する。App Router対応、データベースアダプター統合、環境変数管理を含む最小限の動作する認証システムを提供する。

### 2.3 責務

- `auth.ts` 基本設定ファイルの生成
- Route Handler設定（`app/api/auth/[...nextauth]/route.ts`）
- 環境変数テンプレート（`.env.example`）の作成
- 型定義の基礎準備

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Testing JavaScript (Kent C. Dodds)
- 適用方法:
  シンプルで確実に動く構成を優先。過度な抽象化を避け、実際に動作確認できる最小構成を提供する。

#### 書籍2

- 書籍: Web Application Security (Andrew Hoffman)
- 適用方法:
  環境変数の適切な分離、シークレット管理、セキュアなデフォルト設定を採用。

> ルール: 詳細実装パターンは `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: プロジェクト構造確認（App Router / Pages Router）
2. ステップ2: データベース種別に応じたアダプター選択
3. ステップ3: 基本 `auth.ts` ファイル作成（最小構成）
4. ステップ4: Route Handler設定
5. ステップ5: 環境変数テンプレート作成
6. ステップ6: 型定義ファイル準備（`next-auth.d.ts` スケルトン）
7. ステップ7: 動作確認手順の提示

### 4.2 チェックリスト

- 項目: auth.ts が正しい場所に配置されているか
  - 基準: `src/auth.ts` または `lib/auth.ts` に存在し、エクスポートが正しい
- 項目: Route Handler が設定されているか
  - 基準: `app/api/auth/[...nextauth]/route.ts` が存在し、handlers をエクスポート
- 項目: 環境変数が定義されているか
  - 基準: `.env.example` に `NEXTAUTH_SECRET` とプロバイダー変数が含まれる
- 項目: データベースアダプターが正しく設定されているか
  - 基準: Drizzle Adapter が db インスタンスを正しく参照
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: auth.ts, route handler, .env.example が揃っている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: ユーザー環境に依存する部分は明示的に確認を求める

### 4.3 ビジネスルール（制約）

- 内容: NextAuth.js v5のみをサポート（v4との互換性なし）
- 内容: App Routerを前提とする（Pages Routerは追加説明が必要）
- 内容: 環境変数はリポジトリにコミットしない（`.env.example` のみ）
- 内容: `NEXTAUTH_SECRET` は本番環境で必須（開発環境では警告のみ）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: プロジェクト構造情報
- 提供元: 外部（ユーザー）
- 検証ルール:
  Next.js App Router構成であること、`app/` ディレクトリが存在すること
- 拒否すべき入力:
  Pages Router専用プロジェクト（別途対応が必要）
- 欠損時処理:
  App Routerであることを前提に進め、確認を促す

#### 入力2

- データ名: データベース種別
- 提供元: 外部（ユーザー）
- 検証ルール:
  PostgreSQL, MySQL, SQLiteのいずれか、かつDrizzle ORMが設定済み
- 拒否すべき入力:
  未サポートデータベース、ORM未設定
- 欠損時処理:
  デフォルトでJWT戦略を採用し、Database戦略は後で追加可能と説明

#### 入力3

- データ名: 優先セッション戦略
- 提供元: 外部（ユーザー）
- 検証ルール:
  "jwt" または "database" のいずれか
- 拒否すべき入力:
  不明な戦略名
- 欠損時処理:
  デフォルトで "jwt" を採用

### 5.2 出力

#### 成果物1

- 成果物名: auth.ts設定ファイル
- 受領先: Provider Integration Task
- 出力テンプレート:

```typescript
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/infrastructure/database";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [],
  session: {
    strategy: "{{session_strategy}}",
  },
});
```

- 内容:
  最小限の動作する設定。providers配列は空で、次のTaskで追加する。

#### 成果物2

- 成果物名: Route Handler設定
- 受領先: 外部（アプリケーション）
- 出力テンプレート:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- 内容:
  NextAuth.js v5のApp Router対応エンドポイント。

#### 成果物3

- 成果物名: 環境変数テンプレート
- 受領先: 外部（開発者）
- 出力テンプレート:

```bash
# NextAuth.js
NEXTAUTH_SECRET="{{generated_secret}}"
NEXTAUTH_URL="http://localhost:3000"
```

- 内容:
  `.env.example` に追加する基本変数。プロバイダー固有の変数は次のTaskで追加。

#### 成果物4

- 成果物名: 型定義スケルトン
- 受領先: Session Design Task
- 出力テンプレート:

```typescript
// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      // カスタムフィールドは後で追加
    } & DefaultSession["user"];
  }
}
```

- 内容:
  Session型拡張の準備。カスタムフィールドはSession Design Taskで追加。
