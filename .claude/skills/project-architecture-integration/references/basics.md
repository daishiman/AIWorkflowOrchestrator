# 基礎知識：プロジェクトアーキテクチャ統合

## 概要

プロジェクト固有のアーキテクチャ設計原則を理解し、エージェント設計に適用するための基礎知識を提供する。

## コア概念

### 1. Clean Architecture（クリーンアーキテクチャ）

**目的**: ビジネスロジックを外部依存（UI、DB、フレームワーク）から独立させる

**依存関係ルール**:

```
外側 → 内側のみ許可

[UI層] → [Application層] → [Domain層]
```

**適用**:

- ドメインロジックはフレームワークに依存しない
- データベーススキーマはビジネスルールに依存しない
- UIはビジネスロジックから独立して変更可能

**境界**:

- **Domain層**: エンティティ、値オブジェクト、ビジネスルール
- **Application層**: ユースケース、アプリケーションロジック
- **Infrastructure層**: DB、API、外部サービス
- **Presentation層**: UI、コントローラー

### 2. Hybrid Architecture（ハイブリッドアーキテクチャ）

**目的**: ドメイン機能を分離しつつ、共通コンポーネントを再利用

**構造**:

```
project/
├── shared/       # ドメイン非依存の共通コード
│   ├── ui/       # 汎用UIコンポーネント
│   ├── utils/    # ユーティリティ関数
│   ├── types/    # 共通型定義
│   └── hooks/    # 汎用カスタムフック
│
└── features/     # ドメイン機能（ビジネスロジック）
    ├── auth/     # 認証機能
    ├── user/     # ユーザー管理
    └── products/ # 商品管理
```

**配置判断**:

| 質問                                 | Yes → shared/ | No → features/ |
| ------------------------------------ | ------------- | -------------- |
| ドメイン非依存か？                   | ✓             | ✗              |
| 複数のフィーチャーで再利用されるか？ | ✓             | ✗              |
| ビジネスロジックを含むか？           | ✗             | ✓              |

**依存関係ルール**:

```
✅ 許可: features → shared
✅ 許可: features → features (同一フィーチャー内)
✅ 許可: pages → features
✅ 許可: pages → shared

❌ 禁止: shared → features (循環依存)
❌ 禁止: features → features (異なるフィーチャー間)
```

### 3. Bounded Context（境界づけられたコンテキスト）

**目的**: ドメインを独立したコンテキストに分割し、責務を明確にする

**適用**:

- 各 `features/` ディレクトリは1つのBounded Contextを表す
- コンテキスト内でユビキタス言語（共通用語）を使用
- コンテキスト間の依存はshared/を経由

**例**:

```typescript
// features/auth/types/auth.types.ts
export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

// features/products/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  ownerId: string; // features/userへの直接依存を避ける
}
```

## スキル適用タイミング

### いつ使うか

- エージェントがプロジェクト構造に準拠したファイルを生成する時
- ファイル配置先（shared/ vs features/）を判断する時
- 依存関係ルールを検証する時
- アーキテクチャ設計レビュー時

### 適用すべき状況

1. **ファイル生成エージェント設計時**
   - React コンポーネント生成エージェント
   - API エンドポイント生成エージェント
   - データベーススキーマ生成エージェント

2. **アーキテクチャ判断が必要な時**
   - 新しいフィーチャーの追加
   - 既存コードのリファクタリング
   - 共通ロジックの抽出

3. **依存関係の検証時**
   - コードレビュー前
   - CI/CD パイプラインでの自動チェック
   - マージリクエスト前

## 必須知識

### アーキテクチャパターン

1. **Clean Architecture**
   - 依存関係ルール（外側→内側）
   - 境界の設計と責務分離
   - 依存性逆転の原則（DIP）

2. **Hybrid Architecture**
   - shared/ と features/ の役割
   - ドメイン依存性の判定
   - Bounded Context の識別

3. **SOLID 原則**
   - Single Responsibility（単一責任）
   - Open/Closed（開放閉鎖）
   - Liskov Substitution（リスコフの置換）
   - Interface Segregation（インターフェース分離）
   - Dependency Inversion（依存性逆転）

### プロジェクト固有の技術スタック

参照: `docs/00-requirements/`（プロジェクト要求仕様）

- フレームワーク: Next.js 15 (App Router)
- 言語: TypeScript 5.x
- データベース: PostgreSQL with Prisma ORM
- テスト: Vitest, Playwright
- スタイリング: Tailwind CSS

## 判断基準

### shared/ に配置すべきもの

- 汎用UIコンポーネント（Button、Input、Card）
- ユーティリティ関数（formatDate、validateEmail）
- 共通型定義（ApiResponse、PaginationParams）
- 汎用カスタムフック（useLocalStorage、useFetch）
- 設定ファイル（config、constants）

**判断基準**: ドメインに依存せず、複数のフィーチャーで再利用される

### features/ に配置すべきもの

- ビジネスロジック（認証、商品管理、注文処理）
- ドメイン固有のコンポーネント（LoginForm、ProductCard）
- ドメイン固有の型（AuthUser、Product、Order）
- ドメイン固有のAPI呼び出し（login、getProducts）

**判断基準**: 特定のビジネスドメインに依存し、独立したコンテキストを持つ

## 避けるべきこと

### アンチパターン

1. **循環依存**

   ```typescript
   // ❌ 禁止
   // shared/utils/auth.ts
   import { useAuth } from "@/features/auth";
   ```

2. **フィーチャー間の直接依存**

   ```typescript
   // ❌ 禁止
   // features/products/api/getProducts.ts
   import { useAuth } from "@/features/auth";

   // ✅ 正しい解決策: shared/を経由
   // shared/hooks/useAuth.ts
   export const useAuth = () => {
     /* ... */
   };

   // features/products/api/getProducts.ts
   import { useAuth } from "@/shared/hooks/useAuth";
   ```

3. **ドメインロジックをshared/に配置**

   ```typescript
   // ❌ 禁止
   // shared/utils/validatePassword.ts
   export const validatePassword = (password: string) => {
     // 認証ドメインのロジック
   };

   // ✅ 正しい配置
   // features/auth/utils/validatePassword.ts
   export const validatePassword = (password: string) => {
     // 認証ドメインのロジック
   };
   ```

4. **巨大なフィーチャー**
   - 1つのフィーチャーが10ファイル超える場合は分割を検討
   - サブディレクトリで整理するか、別フィーチャーに分離

5. **曖昧な命名**
   - `utils/`、`helpers/` などの汎用的な名前を避ける
   - `validateAuthInput`、`formatProductPrice` など具体的に命名

## 成果物の最小要件

### アーキテクチャ準拠チェックリスト

以下の項目を満たすこと:

- [ ] ファイル配置が適切（shared/ or features/）
- [ ] 依存方向が正しい（外側→内側）
- [ ] 循環依存が存在しない
- [ ] Bounded Context が明確に分離されている
- [ ] ドメインロジックが適切な場所に配置されている
- [ ] 共通コードが shared/ に集約されている

**テンプレート**: `assets/architecture-compliance-checklist.md`

## 実践手順

### ステップ1: ドメイン依存性の判定

```bash
# 質問: このコードはどのビジネスドメインに依存しているか？
# 依存なし → shared/
# 特定ドメイン依存 → features/
```

### ステップ2: ファイル配置の決定

```bash
# shared/ の場合
shared/[ui|utils|types|hooks|config]/ファイル名

# features/ の場合
features/[ドメイン名]/[api|components|hooks|types|utils]/ファイル名
```

### ステップ3: 依存関係の検証

```bash
# 自動検証スクリプトを実行
node scripts/check-architecture-compliance.mjs --path <対象ディレクトリ>
```

### ステップ4: ドキュメント更新

```bash
# アーキテクチャドキュメントを更新
# 新しいフィーチャーやコンポーネントを記録
```

## チェックリスト

- [ ] Clean Architecture の依存関係ルールを理解した
- [ ] Hybrid Architecture の構造を理解した
- [ ] shared/ と features/ の違いを説明できる
- [ ] 依存関係ルールの許可/禁止パターンを把握した
- [ ] アンチパターンを理解し、回避方法を知っている

## 次のステップ

- **実装パターンを学ぶ**: [patterns.md](patterns.md) を参照
- **Hybrid Architecture 詳細**: [hybrid-architecture-guide.md](hybrid-architecture-guide.md) を参照
- **Level 2（実務）**: [Level2_intermediate.md](Level2_intermediate.md) を参照

## 参考文献

- 『Clean Architecture』Robert C. Martin
- 『Domain-Driven Design』Eric Evans
- 『Building Microservices』Sam Newman
