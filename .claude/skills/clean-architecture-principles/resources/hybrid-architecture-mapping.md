# ハイブリッドアーキテクチャへのマッピング

## プロジェクト固有のディレクトリ構造

このプロジェクトはClean Architectureの原則を、以下のハイブリッドアーキテクチャで実現しています。

## ディレクトリ対応表

| Clean Architecture | ハイブリッドアーキテクチャ | 責務                               |
| ------------------ | -------------------------- | ---------------------------------- |
| Entities           | `shared/core/entities/`    | 共通エンティティ（ドメインモデル） |
| Entities           | `shared/core/interfaces/`  | 共通インターフェース               |
| Entities           | `shared/core/errors/`      | エラークラス（ドメインエラー）     |
| Use Cases          | `features/*/executor.ts`   | 各機能のビジネスロジック           |
| Interface Adapters | `shared/infrastructure/`   | 共通サービス実装                   |
| Frameworks         | `app/`                     | Next.js App Router、API Routes     |

## 詳細マッピング

### shared/core/（Entities相当）

**Clean Architectureでの位置**: 最内層

**構成**:

```
shared/core/
├── entities/          # ドメインモデル
│   ├── workflow.ts
│   └── execution.ts
├── interfaces/        # 共通インターフェース
│   ├── IWorkflowExecutor.ts
│   └── IRepository.ts
└── errors/            # ドメインエラー
    ├── domain-error.ts
    └── validation-error.ts
```

**依存制約**:

- 外部ライブラリ（Drizzle、Zod、AI SDK等）に依存しない
- 純粋なTypeScript/JavaScriptのみ

### shared/infrastructure/（Interface Adapters相当）

**Clean Architectureでの位置**: 外側

**構成**:

```
shared/infrastructure/
├── database/          # DB関連
│   ├── schema.ts      # Drizzleスキーマ
│   └── repositories/  # リポジトリ実装
├── ai/                # AIクライアント
│   └── providers/
├── discord/           # Discord Bot
│   ├── commands/
│   └── events/
└── storage/           # ファイルストレージ
```

**依存制約**:

- `shared/core/`のインターフェースを実装
- 外部ライブラリを使用可能
- `features/`に依存しない

### features/（Use Cases + Vertical Slice）

**Clean Architectureでの位置**: Use Cases層

**構成**:

```
features/
├── registry.ts        # 機能レジストリ
└── [feature-name]/
    ├── schema.ts      # Zodスキーマ
    ├── executor.ts    # ビジネスロジック
    └── __tests__/     # テスト
```

**依存制約**:

- `shared/core/`に依存可能
- `shared/infrastructure/`に依存可能
- **他の`features/`に依存禁止**（垂直スライスの独立性）

### app/（Frameworks相当）

**Clean Architectureでの位置**: 最外層

**構成**:

```
app/
├── api/
│   ├── webhook/       # Webhook受信
│   ├── agent/         # Agent連携
│   └── health/        # ヘルスチェック
└── page.tsx           # ダッシュボード（任意）
```

**依存制約**:

- すべてのレイヤーに依存可能
- プレゼンテーションに特化

## 依存関係の検証

### 許可される依存

```
app/ → features/ → shared/infrastructure/ → shared/core/
app/ → shared/infrastructure/ → shared/core/
app/ → shared/core/
features/ → shared/core/
```

### 禁止される依存

```
❌ shared/core/ → shared/infrastructure/
❌ shared/core/ → features/
❌ shared/core/ → app/
❌ shared/infrastructure/ → features/
❌ shared/infrastructure/ → app/
❌ features/A/ → features/B/
```

## 検証スクリプト

```bash
# shared/core/の外部依存チェック
grep -r "import.*from.*drizzle\|import.*from.*zod\|import.*from.*@ai-sdk" src/shared/core/

# features間の相互依存チェック
grep -r "import.*from.*features/" src/features/ | grep -v "__tests__"

# 依存方向の確認
grep -r "import.*from.*'\.\.\/\.\.\/features" src/shared/
```

## チェックリスト

### shared/core/

- [ ] 外部ライブラリ（Drizzle、Zod、AI SDK等）への依存がないか
- [ ] インターフェースが明確に定義されているか
- [ ] ドメインエラーが適切に定義されているか

### shared/infrastructure/

- [ ] `shared/core/`のインターフェースを正しく実装しているか
- [ ] `features/`に依存していないか
- [ ] 技術的詳細が適切にカプセル化されているか

### features/

- [ ] 各機能が垂直スライスとして独立しているか
- [ ] 他の`features/`をインポートしていないか
- [ ] `schema.ts`、`executor.ts`、`__tests__/`の構成か

### app/

- [ ] プレゼンテーションロジックに特化しているか
- [ ] 適切なレイヤーを経由しているか
