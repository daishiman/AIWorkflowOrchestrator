# レイヤー構造詳細

## 4層構造

### 1. Entities（エンティティ層）

**位置**: 最内層
**安定度**: 最も安定
**抽象度**: 高い

**責務**:

- ビジネスルールのカプセル化
- ドメインモデルの定義
- ビジネス不変条件の保護

**含まれるもの**:

- エンティティ（識別子を持つオブジェクト）
- バリューオブジェクト（不変の値）
- ドメインサービス（複数エンティティにまたがるロジック）
- ドメインイベント

**依存制約**:

- 外部ライブラリに依存しない
- フレームワークに依存しない
- 他のレイヤーを知らない

**例**:

```
entities/
├── user.ts           # Userエンティティ
├── workflow.ts       # Workflowエンティティ
├── values/
│   ├── email.ts      # Emailバリューオブジェクト
│   └── money.ts      # Moneyバリューオブジェクト
└── services/
    └── pricing.ts    # 価格計算ドメインサービス
```

### 2. Use Cases（ユースケース層）

**位置**: Entitiesの外側
**安定度**: 安定
**抽象度**: 中程度

**責務**:

- アプリケーション固有のビジネスロジック
- ユースケースの実装（Interactor）
- 入出力境界の定義

**含まれるもの**:

- ユースケース/インタラクター
- 入力ポート（Input Boundary）
- 出力ポート（Output Boundary）
- リクエスト/レスポンスモデル

**依存制約**:

- Entitiesにのみ依存可能
- Interface Adaptersに依存しない
- Frameworksに依存しない

**例**:

```
use-cases/
├── create-user/
│   ├── create-user.ts        # ユースケース実装
│   ├── input-boundary.ts     # 入力インターフェース
│   └── output-boundary.ts    # 出力インターフェース
├── execute-workflow/
│   ├── execute-workflow.ts
│   └── ...
└── interfaces/
    ├── user-repository.ts    # リポジトリインターフェース
    └── workflow-executor.ts  # 実行器インターフェース
```

### 3. Interface Adapters（インターフェースアダプター層）

**位置**: Use Casesの外側
**安定度**: やや不安定
**抽象度**: 低め

**責務**:

- データ形式の変換
- 外部形式と内部形式の橋渡し
- プレゼンテーションロジック

**含まれるもの**:

- Controller（入力を受け取る）
- Presenter（出力を整形）
- Gateway（外部システムとの接続）
- Repository実装

**依存制約**:

- Use CasesとEntitiesに依存可能
- Frameworksの詳細に依存しない

**例**:

```
adapters/
├── controllers/
│   ├── user-controller.ts
│   └── workflow-controller.ts
├── presenters/
│   └── json-presenter.ts
├── gateways/
│   └── ai-gateway.ts
└── repositories/
    └── user-repository-impl.ts
```

### 4. Frameworks & Drivers（フレームワーク層）

**位置**: 最外層
**安定度**: 最も不安定
**抽象度**: 最も低い

**責務**:

- 外部技術との統合
- フレームワーク固有のコード
- 技術的詳細の実装

**含まれるもの**:

- Webフレームワーク（Express、Next.js等）
- データベースドライバ
- UIフレームワーク
- 外部サービスSDK

**依存制約**:

- すべてのレイヤーに依存可能
- ただし、直接Entitiesを変更しない

**例**:

```
frameworks/
├── web/
│   ├── express/
│   └── next/
├── database/
│   ├── drizzle/
│   └── prisma/
└── external/
    ├── openai/
    └── discord/
```

## レイヤー間のデータフロー

### 入力フロー（外→内）

```
[HTTP Request]
     ↓
[Controller] - リクエストを受け取り、DTOに変換
     ↓
[Use Case] - ビジネスロジックを実行
     ↓
[Entity] - ドメインルールを適用
```

### 出力フロー（内→外）

```
[Entity] - 結果を生成
     ↓
[Use Case] - レスポンスモデルに変換
     ↓
[Presenter] - 表示形式に変換
     ↓
[HTTP Response]
```

## チェックリスト

### Entities層

- [ ] 外部ライブラリへの依存がないか
- [ ] ビジネスルールのみを含むか
- [ ] 永続化の詳細を知らないか

### Use Cases層

- [ ] Entitiesのみに依存しているか
- [ ] フレームワーク固有のコードがないか
- [ ] 入出力境界が定義されているか

### Interface Adapters層

- [ ] データ変換の責務を果たしているか
- [ ] フレームワーク詳細を隠蔽しているか
- [ ] 適切な粒度で分割されているか

### Frameworks層

- [ ] 技術的詳細のみを含むか
- [ ] 内側のレイヤーに依存しているか（逆はダメ）
- [ ] 差し替え可能な設計か
