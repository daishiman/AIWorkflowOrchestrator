# アーキテクチャパターン比較レポート

## 基本情報

- **作成日**: {{date}}
- **対象プロジェクト**: {{project}}
- **作成者**: .claude/agents/arch-police.md

---

## 1. 現状分析

### 1.1 現在のアーキテクチャ

| 項目               | 内容 |
| ------------------ | ---- |
| パターン名         |      |
| レイヤー構成       |      |
| 依存方向           |      |
| 主要コンポーネント |      |

### 1.2 課題・制約

1.
2.
3.

---

## 2. パターン比較

### 2.1 比較マトリクス

| 観点               | Clean Architecture | Hexagonal        | Onion          | Vertical Slice   |
| ------------------ | ------------------ | ---------------- | -------------- | ---------------- |
| **構造**           | 4層同心円          | Ports/Adapters   | 4層同心円      | 機能単位         |
| **凝集度**         | レイヤー内         | ポート単位       | レイヤー内     | 機能単位（高）   |
| **結合度**         | 低（抽象依存）     | 低（ポート依存） | 低（抽象依存） | 最低（機能独立） |
| **学習コスト**     | 高                 | 中               | 高             | 低               |
| **柔軟性**         | 高                 | 最高             | 高             | 中               |
| **テスタビリティ** | 高                 | 最高             | 高             | 高               |

### 2.2 適用条件

#### Clean Architecture

**適している場合**:

- [ ] ビジネスロジックが複雑
- [ ] 長期間のメンテナンスが必要
- [ ] フレームワーク移行の可能性
- [ ] 大規模チーム開発

**適さない場合**:

- [ ] 小規模・短期プロジェクト
- [ ] チームがパターンに不慣れ
- [ ] 単純なCRUD中心

#### Hexagonal Architecture

**適している場合**:

- [ ] 複数のインターフェース（Web、CLI、API）
- [ ] 外部サービス連携が多い
- [ ] テスト駆動開発を重視
- [ ] 技術スタックの変更可能性

**適さない場合**:

- [ ] 単一インターフェースのみ
- [ ] 外部依存が少ない
- [ ] シンプルなアプリケーション

#### Onion Architecture

**適している場合**:

- [ ] ドメイン駆動設計（DDD）を採用
- [ ] 複雑なドメインモデル
- [ ] ドメインエキスパートとの協働
- [ ] ドメインロジックの再利用

**適さない場合**:

- [ ] データ中心のアプリケーション
- [ ] シンプルなビジネスルール
- [ ] DDDの知識がないチーム

#### Vertical Slice Architecture

**適している場合**:

- [ ] 機能ごとの独立した開発
- [ ] チームの並行作業が多い
- [ ] 機能追加が頻繁
- [ ] マイクロサービス移行の前段階

**適さない場合**:

- [ ] 機能間で共通処理が多い
- [ ] 統一されたビジネスルールが必要
- [ ] 小規模アプリケーション

---

## 3. 推奨パターン

### 3.1 推奨

**パターン**: {{recommended_pattern}}

**選定理由**:

1.
2.
3.

### 3.2 ハイブリッドアプローチ

**組み合わせ案**:

```
[例: Clean Architecture + Vertical Slice]

src/
├── shared/
│   ├── core/              # Clean Architecture のEntities層
│   │   ├── entities/
│   │   └── interfaces/
│   └── infrastructure/    # Clean Architecture のInterface Adapters層
│       ├── database/
│       └── external/
├── features/              # Vertical Slice
│   ├── feature-a/
│   └── feature-b/
└── app/                   # Clean Architecture のFrameworks層
```

---

## 4. 移行計画

### 4.1 フェーズ

| フェーズ | 内容 | 期間 |
| -------- | ---- | ---- |
| Phase 1  |      |      |
| Phase 2  |      |      |
| Phase 3  |      |      |

### 4.2 リスク

| リスク | 影響度 | 対策 |
| ------ | ------ | ---- |
|        |        |      |

---

## 5. 参考資料

- [Hexagonal Architecture](../resources/hexagonal-architecture.md)
- [Vertical Slice Architecture](../resources/vertical-slice.md)
- [Onion Architecture](../resources/onion-architecture.md)
- [Clean Architecture Principles](../../clean-architecture-principles/)
