# コンテキストマップテンプレート

> このテンプレートを使用して、プロジェクトのコンテキストマップを作成してください。
> `{{placeholder}}` を実際の値に置き換えてください。

---

# {{ProjectName}} コンテキストマップ

## 概要

**プロジェクト名**: {{ProjectName}}
**バージョン**: {{Version}}
**最終更新**: {{LastUpdatedDate}}
**作成者**: {{Author}}

## ドメイン全体像

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           {{ProjectName}}                               │
│                                                                         │
│   ┌───────────────┐        {{Pattern1}}       ┌───────────────┐        │
│   │  {{Context1}} │ ─────────────────────────→│  {{Context2}} │        │
│   │               │                           │               │        │
│   └───────┬───────┘                           └───────┬───────┘        │
│           │                                           │                 │
│           │ {{Pattern2}}                              │ {{Pattern3}}    │
│           │                                           │                 │
│           ↓                                           ↓                 │
│   ┌───────────────┐                           ┌───────────────┐        │
│   │  {{Context3}} │                           │  {{Context4}} │        │
│   │               │                           │               │        │
│   └───────────────┘                           └───────────────┘        │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    {{SharedKernel}}                          │      │
│   │              （共有カーネル / 共通コンポーネント）              │      │
│   └─────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

## コンテキスト一覧

### {{Context1Name}}

| 項目 | 内容 |
|-----|------|
| **説明** | {{Context1Description}} |
| **責任チーム** | {{Context1Team}} |
| **主要な集約** | {{Context1Aggregates}} |
| **技術スタック** | {{Context1Tech}} |

**ユビキタス言語（主要用語）**:
| 用語 | 定義 |
|-----|------|
| {{Term1a}} | {{Definition1a}} |
| {{Term1b}} | {{Definition1b}} |

---

### {{Context2Name}}

| 項目 | 内容 |
|-----|------|
| **説明** | {{Context2Description}} |
| **責任チーム** | {{Context2Team}} |
| **主要な集約** | {{Context2Aggregates}} |
| **技術スタック** | {{Context2Tech}} |

**ユビキタス言語（主要用語）**:
| 用語 | 定義 |
|-----|------|
| {{Term2a}} | {{Definition2a}} |
| {{Term2b}} | {{Definition2b}} |

---

### {{Context3Name}}

| 項目 | 内容 |
|-----|------|
| **説明** | {{Context3Description}} |
| **責任チーム** | {{Context3Team}} |
| **主要な集約** | {{Context3Aggregates}} |
| **技術スタック** | {{Context3Tech}} |

**ユビキタス言語（主要用語）**:
| 用語 | 定義 |
|-----|------|
| {{Term3a}} | {{Definition3a}} |
| {{Term3b}} | {{Definition3b}} |

---

## コンテキスト間の関係

### {{Context1}} ↔ {{Context2}}

| 項目 | 内容 |
|-----|------|
| **統合パターン** | {{IntegrationPattern1}} |
| **上流/下流** | {{Context1}} → {{Context2}}（{{Upstream1}}が上流） |
| **データフロー** | {{DataFlow1}} |
| **統合方式** | {{IntegrationType1}}（REST API / イベント / 共有DB等） |

**変換マッピング**:
| {{Context1}}の用語 | {{Context2}}の用語 | 備考 |
|-------------------|-------------------|------|
| {{Mapping1a_from}} | {{Mapping1a_to}} | {{Mapping1a_note}} |
| {{Mapping1b_from}} | {{Mapping1b_to}} | {{Mapping1b_note}} |

**API/イベント契約**:
```
{{APIContract1}}
```

---

### {{Context1}} ↔ {{Context3}}

| 項目 | 内容 |
|-----|------|
| **統合パターン** | {{IntegrationPattern2}} |
| **上流/下流** | {{Context1}} → {{Context3}} |
| **データフロー** | {{DataFlow2}} |
| **統合方式** | {{IntegrationType2}} |

---

## 共有カーネル

### {{SharedKernelName}}

**含まれる要素**:
- {{SharedElement1}}
- {{SharedElement2}}
- {{SharedElement3}}

**変更ポリシー**:
- {{ChangePolicy1}}
- {{ChangePolicy2}}

**使用コンテキスト**:
- {{Context1}}
- {{Context2}}
- {{Context3}}

---

## 外部システム連携

### {{ExternalSystem1}}

| 項目 | 内容 |
|-----|------|
| **システム名** | {{ExternalSystem1Name}} |
| **提供元** | {{ExternalSystem1Provider}} |
| **統合パターン** | 適合者 / 腐敗防止層 |
| **連携コンテキスト** | {{ExternalSystem1Context}} |

**腐敗防止層（ACL）**:
```typescript
{{ACLCode1}}
```

---

## 統合シーケンス

### ユースケース: {{UseCase1}}

```
{{Sequence1}}
```

**参加コンテキスト**:
1. {{Context1}}: {{Context1Role}}
2. {{Context2}}: {{Context2Role}}
3. {{Context3}}: {{Context3Role}}

---

## 技術的な実装方針

### ディレクトリ構造

```
src/
├── contexts/
│   ├── {{context1-directory}}/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   ├── {{context2-directory}}/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   └── {{context3-directory}}/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── interfaces/
└── shared-kernel/
    ├── {{shared-module1}}/
    └── {{shared-module2}}/
```

### 通信方式

| コンテキスト間 | 方式 | プロトコル | 備考 |
|--------------|------|----------|------|
| {{Context1}} → {{Context2}} | {{CommType1}} | {{Protocol1}} | {{CommNote1}} |
| {{Context2}} → {{Context3}} | {{CommType2}} | {{Protocol2}} | {{CommNote2}} |

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|-----|-----------|---------|--------|
| {{ChangeDate1}} | {{ChangeVersion1}} | {{ChangeDescription1}} | {{ChangeAuthor1}} |
| {{ChangeDate2}} | {{ChangeVersion2}} | {{ChangeDescription2}} | {{ChangeAuthor2}} |

---

## 記入例

### 実際のプロジェクトでの例

```markdown
# ECサイト コンテキストマップ

## ドメイン全体像

┌─────────────────────────────────────────────────────────────────────────┐
│                              ECサイト                                   │
│                                                                         │
│   ┌───────────────┐      Customer/Supplier     ┌───────────────┐       │
│   │     販売      │ ─────────────────────────→│     配送      │       │
│   │  コンテキスト  │                           │  コンテキスト  │       │
│   └───────┬───────┘                           └───────┬───────┘       │
│           │                                           │                │
│           │ Shared Kernel                             │ ACL            │
│           │                                           │                │
│           ↓                                           ↓                │
│   ┌───────────────┐                           ┌───────────────┐       │
│   │     在庫      │                           │   外部配送    │       │
│   │  コンテキスト  │                           │   サービス    │       │
│   └───────────────┘                           └───────────────┘       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐     │
│   │                       共有カーネル                           │     │
│   │           （Money, Address, EmailAddress）                  │     │
│   └─────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘

## コンテキスト一覧

### 販売コンテキスト

| 項目 | 内容 |
|-----|------|
| **説明** | 顧客の注文処理と支払いを管理 |
| **責任チーム** | 販売チーム |
| **主要な集約** | Order, Customer, Cart |
| **技術スタック** | TypeScript, PostgreSQL, Redis |

**ユビキタス言語（主要用語）**:
| 用語 | 定義 |
|-----|------|
| 注文 | 顧客が商品を購入する意思表示 |
| カート | 購入予定の商品を一時的に保持する入れ物 |
| 顧客 | 商品を購入する個人または法人 |
```

---

**テンプレート終了**

このテンプレートを基に、プロジェクト固有のコンテキストマップを作成してください。
